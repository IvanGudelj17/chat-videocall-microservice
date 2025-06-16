// Package router inicijalizira i pokreće HTTP server koristeći Gin framework.
// Ovdje se definiraju rute za korisničke zahtjeve (signup, login, logout) i WebSocket funkcionalnosti (sobe, klijenti).
// Također postavlja CORS pravila za komunikaciju s frontendom (npr. localhost:3000).

package router

import (
	"log"
	"server/internal/user"
	"server/internal/user/websocket"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var route *gin.Engine

// InitRouter konfigurira sve rute aplikacije i postavlja CORS middleware.
func InitRouter(userHandler *user.Handler, webSocketHandler *websocket.Handler) {
	route = gin.Default()

	// CORS omogućava pristup frontend aplikaciji na drugom portu (npr. localhost:3000)
	route.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// REST rute za korisničke akcije
	route.POST("/signup", userHandler.CreateUser)
	route.POST("/login", userHandler.Login)
	route.GET("/logout", userHandler.Logout)

	// WebSocket rute za sobe i klijente
	route.POST("/websocket/createRoom", webSocketHandler.CreateRoom)
	route.GET("/websocket/joinRoom/:roomID", webSocketHandler.JoinRoom)
	route.GET("/websocket/getRooms", webSocketHandler.GetRooms)
	route.GET("/websocket/getClients/:roomID", webSocketHandler.GetClients)
}

// Start pokreće HTTP server na zadanoj adresi (npr. "0.0.0.0:8080").
func Start(addr string) error {
	log.Printf("Server starting on %s\n", addr)
	return route.Run(addr)
}
