package handler

import (
	"errors"

	"github.com/exercise-record/backend/internal/middleware"
	"github.com/exercise-record/backend/internal/service"
	"github.com/exercise-record/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService *service.UserService
}

func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	profile, err := h.userService.GetProfile(c.Request.Context(), userID)
	if err != nil {
		if errors.Is(err, service.ErrUserNotFound) {
			response.Error(c, 404, response.CodeNotFound, "user not found")
			return
		}
		response.ServerError(c, "failed to get profile")
		return
	}

	response.OK(c, profile)
}

type updateProfileRequest struct {
	Nickname  *string  `json:"nickname"`
	AvatarURL *string  `json:"avatar_url"`
	Gender    *uint8   `json:"gender"`
	Height    *float64 `json:"height"`
	Weight    *float64 `json:"weight"`
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	var req updateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request parameters")
		return
	}

	profile, err := h.userService.UpdateProfile(c.Request.Context(), userID, service.UpdateProfileInput{
		Nickname:  req.Nickname,
		AvatarURL: req.AvatarURL,
		Gender:    req.Gender,
		Height:    req.Height,
		Weight:    req.Weight,
	})
	if err != nil {
		if errors.Is(err, service.ErrUserNotFound) {
			response.Error(c, 404, response.CodeNotFound, "user not found")
			return
		}
		response.ServerError(c, "failed to update profile")
		return
	}

	response.OK(c, profile)
}

type changePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

func (h *UserHandler) ChangePassword(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	var req changePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request parameters")
		return
	}

	err := h.userService.ChangePassword(c.Request.Context(), userID, req.OldPassword, req.NewPassword)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrOldPasswordWrong):
			response.BadRequest(c, "old password is incorrect")
		case errors.Is(err, service.ErrNewPasswordTooShort):
			response.BadRequest(c, "new password must be at least 6 characters")
		case errors.Is(err, service.ErrUserNotFound):
			response.Error(c, 404, response.CodeNotFound, "user not found")
		default:
			response.ServerError(c, "failed to change password")
		}
		return
	}

	response.OK(c, gin.H{"message": "password updated"})
}
