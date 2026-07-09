package handler

import (
	"errors"
	"strconv"

	"github.com/exercise-record/backend/internal/middleware"
	"github.com/exercise-record/backend/internal/service"
	"github.com/exercise-record/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type CalendarHandler struct {
	calendarService *service.CalendarService
}

func NewCalendarHandler(calendarService *service.CalendarService) *CalendarHandler {
	return &CalendarHandler{calendarService: calendarService}
}

func (h *CalendarHandler) Get(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	year, err := strconv.Atoi(c.Query("year"))
	if err != nil {
		response.BadRequest(c, "invalid year")
		return
	}
	month, err := strconv.Atoi(c.Query("month"))
	if err != nil {
		response.BadRequest(c, "invalid month")
		return
	}

	result, err := h.calendarService.GetCalendar(c.Request.Context(), userID, year, month)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCalendarMonth) {
			response.BadRequest(c, "invalid month")
			return
		}
		response.ServerError(c, "failed to get calendar")
		return
	}

	response.OK(c, result)
}
