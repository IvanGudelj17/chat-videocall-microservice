// Package user sadrži HTTP handler funkcije povezane s korisničkim radnjama.
// Ovdje se definiraju REST endpointi za:
// - registraciju korisnika (POST /signup),
// - prijavu korisnika (POST /login),
// - odjavu korisnika (POST /logout).
//
// Handler koristi Service interfejs za obradu logike.

package user

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Handler je HTTP sloj koji povezuje Service sa zahtjevima.
type Handler struct {
	Service
}

// NewHandler vraća novi handler sa vezanim service slojem.
func NewHandler(s Service) *Handler {
	return &Handler{Service: s}
}

// CreateUser obrađuje zahtjev za registraciju korisnika.
// Očekuje JSON s korisničkim podacima, delegira Service sloju.
func (h *Handler) CreateUser(c *gin.Context) {
	log.Println("Received a signup request")

	var u CreateUserReq
	if err := c.ShouldBindJSON(&u); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Received user data: %+v\n", u)

	response, err := h.Service.CreateUser(c.Request.Context(), &u)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// Login obrađuje login zahtjev i vraća JWT token u cookieju.
func (h *Handler) Login(context *gin.Context) {
	var user LoginUserReq
	if err := context.ShouldBindJSON(&user); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	u, err := h.Service.Login(context.Request.Context(), &user)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	context.SetCookie("jwt", u.AccessToken, 60*60*24, "/", "localhost", false, true)
	context.JSON(http.StatusOK, u)
}

// Logout briše JWT cookie i šalje potvrdu odjave.
func (h *Handler) Logout(context *gin.Context) {
	context.SetCookie("jwt", "", -1, "", "", false, true)
	context.JSON(http.StatusOK, gin.H{"message": "logout successful"})
}
