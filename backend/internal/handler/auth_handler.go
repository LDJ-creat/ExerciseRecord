package handler

import (
	"errors"

	"github.com/exercise-record/backend/internal/service"
	"github.com/exercise-record/backend/pkg/jwt"
	"github.com/exercise-record/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *service.AuthService
	jwtSecret   string
}

func NewAuthHandler(authService *service.AuthService, jwtSecret string) *AuthHandler {
	return &AuthHandler{authService: authService, jwtSecret: jwtSecret}
}

type registerRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Nickname string `json:"nickname"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request parameters")
		return
	}

	result, err := h.authService.Register(c.Request.Context(), service.RegisterInput{
		Username: req.Username,
		Password: req.Password,
		Nickname: req.Nickname,
	})
	if err != nil {
		switch {
		case errors.Is(err, service.ErrPasswordTooShort):
			response.BadRequest(c, "password must be at least 6 characters")
		case errors.Is(err, service.ErrUsernameExists):
			response.Conflict(c, "username already exists")
		default:
			response.ServerError(c, "registration failed")
		}
		return
	}

	response.OK(c, gin.H{
		"user_id":  result.UserID,
		"username": result.Username,
	})
}

type loginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request parameters")
		return
	}

	result, err := h.authService.Login(c.Request.Context(), service.LoginInput{
		Username: req.Username,
		Password: req.Password,
	})
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) || errors.Is(err, service.ErrUserDisabled) {
			response.Unauthorized(c, "invalid username or password")
			return
		}
		response.ServerError(c, "login failed")
		return
	}

	token, err := jwt.Generate(h.jwtSecret, result.User.ID, result.User.Username)
	if err != nil {
		response.ServerError(c, "failed to generate token")
		return
	}

	response.OK(c, gin.H{
		"token": token,
		"user":  result.User,
	})
}
