package main

/*
Glavni ulaz za aplikaciju, odgovoran za sve
inicijalizacije, konekciju s bazom podataka, repozitorija, servisa..
*/

import (
	"log"
	"server/db"
	"server/internal/user"
	"server/internal/user/websocket"
	"server/router"

	"github.com/joho/godotenv"
)

func main() {
	log.Println("Main function started.")
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found")
	}
	dbConnection, err := db.NewDatabase() // Otvara bazu i vraća instancu na bazu
	if err != nil {
		log.Fatalf("could not initialize database connection: %s", err)
	}
	defer dbConnection.Close()                                 // Osiguravamo zatvaranje baze nakon završetka rada
	userRepository := user.NewRepository(dbConnection.GetDB()) // Omogućava rad s bazom
	userService := user.NewService(userRepository)             // Omogućava interakciju s bazom
	userHandler := user.NewHandler(userService)                // Omogućava HTTP zahtjeve koji koriste service

	hub := websocket.NewHub()
	webSocketHandler := websocket.NewHandler(hub)
	go hub.Run() // Pokreće hub u pozadini

	// Inicijalizacija ruta
	router.InitRouter(userHandler, webSocketHandler)
	log.Println("Router initialized, starting server...")
	if err := router.Start("0.0.0.0:8080"); err != nil {
		log.Fatalf("server failed to start: %v", err)
	}
}
