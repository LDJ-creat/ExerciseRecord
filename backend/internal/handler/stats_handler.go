package handler

import (
	"errors"
	"strings"

	"github.com/exercise-record/backend/internal/middleware"
	"github.com/exercise-record/backend/internal/service"
	"github.com/exercise-record/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type StatsHandler struct {
	statsService *service.StatsService
}

func NewStatsHandler(statsService *service.StatsService) *StatsHandler {
	return &StatsHandler{statsService: statsService}
}

func (h *StatsHandler) Personal(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	period := strings.ToLower(c.DefaultQuery("period", "month"))
	result, err := h.statsService.GetPersonalStats(c.Request.Context(), userID, period)
	if err != nil {
		if errors.Is(err, service.ErrInvalidPeriod) {
			response.BadRequest(c, "invalid period parameter")
			return
		}
		response.ServerError(c, "failed to get personal stats")
		return
	}

	response.OK(c, result)
}

func (h *StatsHandler) Ranking(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	dimension := strings.ToLower(c.DefaultQuery("dimension", "count"))
	period := strings.ToLower(c.DefaultQuery("period", "month"))
	result, err := h.statsService.GetRanking(c.Request.Context(), userID, dimension, period)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidPeriod):
			response.BadRequest(c, "invalid period parameter")
		case errors.Is(err, service.ErrInvalidDimension):
			response.BadRequest(c, "invalid dimension parameter")
		default:
			response.ServerError(c, "failed to get ranking")
		}
		return
	}

	response.OK(c, result)
}
