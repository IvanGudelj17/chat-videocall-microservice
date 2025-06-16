// Package websocket definira jednog WebSocket klijenta unutar chata.
// Svaki klijent može čitati i slati poruke prema centralnom hub-u.
//
// Ovaj fajl sadrži:
// - strukturu Client i Message
// - metode za čitanje i pisanje poruka putem WebSocketa

package websocket

import (
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
)

// Client predstavlja jednog korisnika povezanog putem WebSocketa.
type Client struct {
	Connection *websocket.Conn // TCP WebSocket konekcija
	Message    chan *Message   // Kanal za slanje poruka ovom klijentu
	ID         string          `json:"id"`
	RoomID     string          `json:"roomID"`
	Username   string          `json:"username"`
}

// Message predstavlja format poruke koji se koristi u komunikaciji.
type Message struct {
	Type     string          `json:"type"`           // npr. "chat", "join"
	Data     json.RawMessage `json:"data,omitempty"` // opcionalni dodatni podaci
	Content  string          `json:"content"`        // glavni tekst poruke
	RoomID   string          `json:"roomId"`         // soba kojoj poruka pripada
	Username string          `json:"username"`       // korisnik koji šalje poruku
}

// WriteMessage šalje poruke iz Message kanala prema klijentu preko WebSocketa.
func (client *Client) WriteMessage() {
	defer client.Connection.Close()

	for {
		message, ok := <-client.Message
		if !ok {
			// Kanal zatvoren — prekidamo slanje
			return
		}

		log.Printf("Slanje [%s] poruke \"%s\" korisniku %s", message.Type, message.Content, client.Username)
		client.Connection.WriteJSON(message)
	}
}

// ReadMessage čita poruke s WebSocketa, dešifrira ih i prosljeđuje hubu za broadcast.
func (client *Client) ReadMessage(hub *Hub) {
	defer func() {
		hub.UnRegister <- client
		client.Connection.Close()
	}()

	for {
		_, messageReceived, err := client.Connection.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Println("WebSocket zatvoren normalno")
			} else if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Neočekivana WebSocket greška: %v", err)
			}
			break
		}

		log.Printf("Primljena poruka od %s: %s", client.Username, string(messageReceived))

		var msg Message
		if err := json.Unmarshal(messageReceived, &msg); err != nil {
			log.Println("Greška pri parsiranju poruke:", err)
			continue
		}

		// Ako nije specificiran tip, pretpostavi "chat"
		if msg.Type == "" {
			msg.Type = "chat"
		}
		if msg.RoomID == "" {
			msg.RoomID = client.RoomID
		}
		if msg.Username == "" {
			msg.Username = client.Username
		}

		hub.Broadcast <- &msg
	}
}
