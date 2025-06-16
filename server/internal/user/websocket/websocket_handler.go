// Package websocket sadrži HTTP handler funkcije koje:
// - kreiraju nove sobe,
// - iniciraju WebSocket konekciju (JoinRoom),
// - vraćaju listu soba i aktivnih klijenata u sobi.
//
// Handler koristi centralni Hub za registraciju/odjavu klijenata i pristup sobama.

package websocket

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// Handler struktura povezuje HTTP rute sa websocket hub-om.
type Handler struct {
	hub *Hub
}

// CreateRoomReq predstavlja podatke potrebne za kreiranje sobe.
type CreateRoomReq struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// NewHandler inicijalizira novi websocket HTTP handler.
func NewHandler(h *Hub) *Handler {
	return &Handler{hub: h}
}

// CreateRoom prima JSON zahtjev i registrira novu sobu u Hubu.
func (h *Handler) CreateRoom(c *gin.Context) {
	log.Println("Pozvan CreateRoom")
	var request CreateRoomReq
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.hub.Rooms[request.ID] = &Room{
		ID:      request.ID,
		Name:    request.Name,
		Clients: make(map[string]*Client),
	}
	c.JSON(http.StatusOK, request)
}

// upgrader konvertira HTTP konekciju u WebSocket.
// CheckOrigin vraća true kako bi se omogućili zahtjevi iz svih izvora (za dev/test okruženja).
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// JoinRoom uspostavlja WebSocket konekciju za klijenta i registrira ga u hub.
func (h *Handler) JoinRoom(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("Greška pri WebSocket upgrade:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	roomID := c.Param("roomID")
	clientID := c.Query("userID")
	username := c.Query("username")

	client := &Client{
		Connection: conn,
		Message:    make(chan *Message, 10),
		ID:         clientID,
		RoomID:     roomID,
		Username:   username,
	}

	// Registracija klijenta u hub
	h.hub.Register <- client

	// Paralelne go-rutine za slanje i primanje poruka
	go client.WriteMessage()
	go client.ReadMessage(h.hub)
}

// RoomRes predstavlja strukturu za ispis soba (GET /rooms).
type RoomRes struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// GetRooms vraća sve registrirane sobe u hubu.
func (h *Handler) GetRooms(c *gin.Context) {
	rooms := make([]RoomRes, 0)
	for _, room := range h.hub.Rooms {
		rooms = append(rooms, RoomRes{
			ID:   room.ID,
			Name: room.Name,
		})
	}
	c.JSON(http.StatusOK, rooms)
}

// ClientRes predstavlja prikaz klijenata u sobi.
type ClientRes struct {
	ID       string `json:"id"`
	Username string `json:"username"`
}

// GetClients vraća sve klijente registrirane u odabranoj sobi.
func (h *Handler) GetClients(c *gin.Context) {
	roomID := c.Param("roomID")

	h.hub.mu.RLock()
	room, ok := h.hub.Rooms[roomID]
	h.hub.mu.RUnlock()

	if !ok {
		c.JSON(http.StatusOK, []ClientRes{})
		return
	}

	clients := make([]ClientRes, 0, len(room.Clients))
	for _, cl := range room.Clients {
		clients = append(clients, ClientRes{
			ID:       cl.ID,
			Username: cl.Username,
		})
	}
	c.JSON(http.StatusOK, clients)
}
