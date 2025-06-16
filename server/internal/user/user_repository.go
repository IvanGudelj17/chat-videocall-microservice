// Package user sadrži implementaciju Repository sloja koji:
// - izvršava SQL upite nad bazom za korisnike,
// - omogućuje registraciju i dohvat korisnika po emailu.
//
// Ova implementacija koristi DBTX interface za apstrakciju nad bazom.

package user

import (
	"context"
	"database/sql"
)

// DBTX definira minimalni skup metoda koje baza mora implementirati
// (kompatibilan s *sql.DB i *sql.Tx).
type DBTX interface {
	ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
	PrepareContext(context.Context, string) (*sql.Stmt, error)
	QueryContext(context.Context, string, ...interface{}) (*sql.Rows, error)
	QueryRowContext(context.Context, string, ...interface{}) *sql.Row
}

// repository je konkretna implementacija Repository sučelja.
type repository struct {
	db DBTX
}

// NewRepository vraća novi repository instancu.
func NewRepository(db DBTX) Repository {
	return &repository{db: db}
}

// CreateUser ubacuje novog korisnika u bazu i vraća njegov ID.
func (r *repository) CreateUser(ctx context.Context, user *User) (*User, error) {
	var lastInsertId int
	query := "INSERT INTO users(username, password, email) VALUES ($1, $2, $3) returning id"
	err := r.db.QueryRowContext(ctx, query, user.Username, user.Password, user.Email).Scan(&lastInsertId)
	if err != nil {
		return &User{}, err
	}

	user.ID = int64(lastInsertId)
	return user, nil
}

// GetUserByEmail dohvaća korisnika po emailu.
// Ako korisnik ne postoji, vraća (nil, nil).
func (r *repository) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	user := User{}
	query := "SELECT id, email, username, password FROM users WHERE email = $1"
	err := r.db.QueryRowContext(ctx, query, email).Scan(&user.ID, &user.Email, &user.Username, &user.Password)

	if err != nil {
		if err == sql.ErrNoRows {
			// korisnik ne postoji — nije greška
			return nil, nil
		}
		// prava greška
		return nil, err
	}

	return &user, nil
}
