// Package user definira domenski model korisnika i interfejse za rad s bazom i aplikacijskom logikom.
// Ovaj fajl sadrži:
// - strukture za korisnike i zahtjeve/odgovore (modeli),
// - Repository interface za rad s bazom,
// - Service interface za aplikacijsku logiku.

package user

import "context"

// User predstavlja korisnički zapis u bazi.
type User struct {
	ID       int64  `json:"id" db:"id"`
	Username string `json:"username" db:"username"`
	Email    string `json:"email" db:"email"`
	Password string `json:"password" db:"password"`
}

// CreateUserReq koristi se prilikom registracije korisnika (unos podataka).
type CreateUserReq struct {
	Username string `json:"username" db:"username"`
	Email    string `json:"email" db:"email"`
	Password string `json:"password" db:"password"`
}

// CreateUserRes vraća se nakon uspješne registracije korisnika.
type CreateUserRes struct {
	ID       string `json:"id" db:"id"`
	Username string `json:"username" db:"username"`
	Email    string `json:"email" db:"email"`
}

// LoginUserReq koristi se prilikom prijave (login).
type LoginUserReq struct {
	Email    string `json:"email" db:"email"`
	Password string `json:"password" db:"password"`
}

// LoginUserRes vraća se nakon uspješne prijave korisnika.
type LoginUserRes struct {
	AccessToken string `json:"accessToken"` // JWT
	ID          string `json:"id"`
	Username    string `json:"username"`
	Email       string `json:"email"`
}

// Repository predstavlja apstrakciju nad bazom podataka.
type Repository interface {
	CreateUser(ctx context.Context, user *User) (*User, error)
	GetUserByEmail(ctx context.Context, email string) (*User, error)
}

// Service predstavlja aplikacijsku logiku za korisnike.
type Service interface {
	CreateUser(ctx context.Context, req *CreateUserReq) (*CreateUserRes, error)
	Login(ctx context.Context, req *LoginUserReq) (*LoginUserRes, error)
}
