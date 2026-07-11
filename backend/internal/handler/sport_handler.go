package handler

import (
	"errors"

	"github.com/exercise-record/backend/internal/middleware"
	"github.com/exercise-record/backend/internal/service"
	"github.com/exercise-record/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type SportHandler struct {
	sportService *service.SportService
}

func NewSportHandler(sportService *service.SportService) *SportHandler {
	return &SportHandler{sportService: sportService}
}

type createSportTypeRequest struct {
	Name         string `json:"name" binding:"required"`
	NeedDistance bool   `json:"need_distance"`
	NeedCalories bool   `json:"need_calories"`
}

func (h *SportHandler) List(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	items, err := h.sportService.ListForUser(c.Request.Context(), userID)
	if err != nil {
		response.ServerError(c, "failed to load sport types")
		return
	}

	response.OK(c, items)
}

func (h *SportHandler) Create(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	var req createSportTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request body")
		return
	}

	item, err := h.sportService.CreateCustom(c.Request.Context(), userID, service.CreateCustomSportTypeInput{
		Name:         req.Name,
		NeedDistance: req.NeedDistance,
		NeedCalories: req.NeedCalories,
	})
	if err != nil {
		switch {
		case errors.Is(err, service.ErrSportNameRequired),
			errors.Is(err, service.ErrSportNameTooLong):
			response.BadRequest(c, err.Error())
		case errors.Is(err, service.ErrDuplicateSportName):
			response.Conflict(c, "已存在同名自定义类型")
		case errors.Is(err, service.ErrCustomSportLimit):
			response.BadRequest(c, "自定义类型数量已达上限")
		default:
			response.ServerError(c, "failed to create sport type")
		}
		return
	}

	response.OK(c, item)
}
