// Package websocket definira Hub koji koordinira sve sobe i klijente u aplikaciji.
// Hub:
// - drži mapirane sobe (RoomID → Room),
// - prima nove klijente (Register),
// - upravlja odlascima klijenata (UnRegister),
// - distribuira poruke putem Broadcast kanala.
//
// Poseban slučaj je "signal" poruka (npr. WebRTC), koja se šalje direktno svim klijentima osim pošiljatelja.

package websocket

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

// Room predstavlja jednu chat sobu i sve klijente unutar nje.
type Room struct {
	ID      string             `json:"id"`
	Name    string             `json:"name"`
	Clients map[string]*Client `json:"clients"` // Klijenti u sobi (po ID-u)
}

// Hub centralno upravlja svim sobama i porukama između njih.
type Hub struct {
	Rooms      map[string]*Room // Sobe: roomID → *Room
	Register   chan *Client     // Kanal za registraciju novih klijenata
	UnRegister chan *Client     // Kanal za odjavu klijenata
	Broadcast  chan *Message    // Poruke koje treba poslati svim klijentima u sobi
	mu         sync.RWMutex     // Zaštita pristupa mapama soba
}

// NewHub inicijalizira novi WebSocket hub.
func NewHub() *Hub {
	return &Hub{
		Rooms:      make(map[string]*Room),
		Register:   make(chan *Client),
		UnRegister: make(chan *Client),
		Broadcast:  make(chan *Message, 5),
	}
}

// Run pokreće glavni loop koji obrađuje sve WebSocket događaje.
func (h *Hub) Run() {
	for {
		select {

		// Novi klijent želi ući u sobu
		case newClient := <-h.Register:
			h.mu.Lock()
			room, ok := h.Rooms[newClient.RoomID]
			if ok {
				if _, exists := room.Clients[newClient.ID]; !exists {
					room.Clients[newClient.ID] = newClient
					log.Printf("Klijent %s (ID: %s) ušao u sobu %s",
						newClient.Username, newClient.ID, newClient.RoomID)

					h.Broadcast <- &Message{
						Type:     "notification",
						Content:  newClient.Username + " se pridružio sobi.",
						Username: "sustav",
						RoomID:   newClient.RoomID,
					}
				}
			} else {
				log.Printf("Soba %s ne postoji — klijent %s nije registriran.",
					newClient.RoomID, newClient.Username)
			}
			h.mu.Unlock()

		// Klijent napušta sobu
		case leavingClient := <-h.UnRegister:
			h.mu.Lock()
			if room, ok := h.Rooms[leavingClient.RoomID]; ok {
				if _, exists := room.Clients[leavingClient.ID]; exists {
					log.Printf("Klijent %s (ID: %s) napustio sobu %s",
						leavingClient.Username, leavingClient.ID, leavingClient.RoomID)

					h.Broadcast <- &Message{
						Type:     "notification",
						Content:  leavingClient.Username + " je napustio sobu.",
						Username: "sustav",
						RoomID:   leavingClient.RoomID,
					}

					delete(room.Clients, leavingClient.ID)
					close(leavingClient.Message)
				}
			}
			h.mu.Unlock()

		// Obrada poruka koje dolaze na Broadcast kanal
		case message := <-h.Broadcast:
			h.mu.RLock()
			room, exists := h.Rooms[message.RoomID]
			h.mu.RUnlock()

			if !exists {
				log.Printf("Broadcast poruka za nepostojeću sobu: %s", message.RoomID)
				continue
			}

			log.Printf("Broadcast u sobu %s: \"%s\" od %s",
				message.RoomID, message.Content, message.Username)

			if message.Type == "signal" {
				// Signal poruke se šalju direktno kao JSON
				payload := struct {
					Type   string          `json:"type"`
					RoomID string          `json:"roomId"`
					From   string          `json:"from"`
					Data   json.RawMessage `json:"data"`
				}{
					Type:   message.Type,
					RoomID: message.RoomID,
					From:   message.Username,
					Data:   message.Data,
				}

				bts, err := json.Marshal(payload)
				if err != nil {
					log.Printf("Greška kod signal poruke (marshal): %v", err)
					continue
				}

				for _, c := range room.Clients {
					if c.Username == message.Username {
						continue // ne šaljemo samom sebi
					}
					log.Printf("Slanje SIGNAL poruke korisniku %s (ID: %s)",
						c.Username, c.ID)
					c.Connection.WriteMessage(websocket.TextMessage, bts)
				}
			} else {
				// Chat i notifikacijske poruke — idu kroz kanal
				for _, c := range room.Clients {
					log.Printf("Slanje PORUKE korisniku %s (ID: %s)",
						c.Username, c.ID)
					c.Message <- message
				}
			}
		}
	}
}
