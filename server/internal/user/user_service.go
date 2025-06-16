// Package user implementira poslovnu logiku za korisničke operacije kao što su:
// - registracija novog korisnika,
// - prijava i validacija lozinke,
// - generiranje JWT tokena.
//
// Koristi Repository za pristup bazi, te koristi util funkcije za hashiranje i validaciju lozinke.

package user

import (
	"context"
	"fmt"
	"log"
	"server/util"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

const (
	secretKey = "secret" // tajni ključ za JWT token (u produkciji mora biti iz .env)
)

// service je privatna implementacija Service interfejsa.
type service struct {
	Repository
	timeout time.Duration
}

// NewService kreira novi Service s definiranim timeoutom.
func NewService(repository Repository) Service {
	return &service{
		Repository: repository,
		timeout:    time.Duration(2) * time.Second,
	}
}

// CreateUser registrira novog korisnika:
// - validira ulazne podatke,
// - provjerava postoji li korisnik s istim emailom,
// - hashira lozinku,
// - sprema korisnika u bazu.
func (s *service) CreateUser(c context.Context, req *CreateUserReq) (*CreateUserRes, error) {
	log.Println("CreateUser called.")
	log.Println("Podaci:", req.Username, req.Email, req.Password)

	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	if req.Email == "" {
		log.Println("Email prazan")
		return nil, fmt.Errorf("email je obavezan")
	}
	if req.Password == "" {
		log.Println("Lozinka prazna")
		return nil, fmt.Errorf("lozinka je obavezna")
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	log.Println("Provjera korisnika u bazi...")
	existing, err := s.Repository.GetUserByEmail(ctx, req.Email)
	if err == nil && existing != nil {
		log.Println("Korisnik već postoji")
		return nil, fmt.Errorf("korisnik s tim emailom već postoji")
	}

	log.Println("Hashiram lozinku...")
	hashedPassword, err := util.HashPassword(req.Password)
	if err != nil {
		log.Println("Greška pri hashiranju:", err)
		return nil, err
	}

	newUser := &User{
		Username: req.Username,
		Email:    req.Email,
		Password: hashedPassword,
	}

	log.Println("Spremam korisnika u bazu...")
	r, err := s.Repository.CreateUser(ctx, newUser)
	if err != nil {
		log.Println("Greška pri spremanju korisnika:", err)
		return nil, err
	}

	log.Println("Korisnik spremljen:", r.ID)

	return &CreateUserRes{
		ID:       strconv.Itoa(int(r.ID)),
		Username: r.Username,
		Email:    r.Email,
	}, nil
}

// MYJWTClaims definira dodatne podatke unutar JWT tokena.
type MYJWTClaims struct {
	Username string `json:"username"`
	ID       string `json:"id"`
	jwt.RegisteredClaims
}

// Login provjerava korisničke podatke i vraća JWT token ako su točni.
func (s *service) Login(c context.Context, req *LoginUserReq) (*LoginUserRes, error) {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	log.Println("Login pokušaj s emailom:", req.Email)

	user, err := s.Repository.GetUserByEmail(ctx, req.Email)
	if err != nil || user == nil {
		log.Println("Greška pri dohvaćanju korisnika:", err)
		return nil, fmt.Errorf("pogrešan email ili lozinka")
	}

	log.Println("Korisnik pronađen:", user.Username)

	if err := util.CheckPassword(req.Password, user.Password); err != nil {
		log.Println("Neispravna lozinka za korisnika:", user.Email)
		return nil, fmt.Errorf("pogrešan email ili lozinka")
	}

	log.Println("Lozinka ispravna. Generiram JWT token...")

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, MYJWTClaims{
		Username: user.Username,
		ID:       strconv.Itoa(int(user.ID)),
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    strconv.Itoa(int(user.ID)),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	})

	signedToken, err := token.SignedString([]byte(secretKey))
	if err != nil {
		log.Println("Greška pri potpisivanju tokena:", err)
		return nil, fmt.Errorf("nešto je pošlo po zlu s prijavom")
	}

	log.Println("JWT token generiran")

	return &LoginUserRes{
		AccessToken: signedToken,
		Username:    user.Username,
		ID:          strconv.Itoa(int(user.ID)),
		Email:       user.Email,
	}, nil
}
