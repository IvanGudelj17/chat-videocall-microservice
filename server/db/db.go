// Package db sadrži logiku za inicijalizaciju i upravljanje konekcijom prema PostgreSQL bazi.
// Očekuje da konfiguracija baze dolazi iz .env varijabli (POSTGRES_USER, POSTGRES_PASSWORD, itd.)

package db

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq" // PostgreSQL driver
)

// Database je wrapper struktura koja drži konekciju na bazu.
type Database struct {
	db *sql.DB
}

// NewDatabase otvara konekciju prema PostgreSQL bazi koristeći podatke iz .env varijabli.
// Vraća instancu Database strukture ili grešku ako konekcija nije uspješna.
func NewDatabase() (*Database, error) {
	dsn := fmt.Sprintf(
		"postgresql://%s:%s@%s:%s/%s?sslmode=disable",
		os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_PASSWORD"),
		os.Getenv("POSTGRES_HOST"),
		os.Getenv("POSTGRES_PORT"),
		os.Getenv("POSTGRES_DB"),
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}

	return &Database{db: db}, nil
}

// Close zatvara konekciju prema bazi.
func (d *Database) Close() {
	d.db.Close()
}

// GetDB vraća referencu na originalni *sql.DB objekt.
func (d *Database) GetDB() *sql.DB {
	return d.db
}
