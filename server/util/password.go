// Package util sadrži pomoćne funkcije za sigurnosne operacije poput hashiranja lozinke.
// Ovdje se koristi bcrypt za:
// - hashiranje lozinki prilikom registracije,
// - usporedbu unesene i spremljene lozinke prilikom prijave.

package util

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

// HashPassword prima lozinku i vraća njen bcrypt hash.
func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	return string(hashedPassword), nil
}

// CheckPassword uspoređuje plaintext lozinku s hashiranom verzijom.
// Vraća nil ako su podudarne, grešku ako nisu.
func CheckPassword(password string, hashedPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
