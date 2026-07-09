package handler

import (
	"errors"
	"strconv"

	"github.com/exercise-record/backend/internal/middleware"
	"github.com/exercise-record/backend/internal/service"
	"github.com/exercise-record/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type ReminderHandler struct {
	reminderService *service.ReminderService
}

func NewReminderHandler(reminderService *service.ReminderService) *ReminderHandler {
	return &ReminderHandler{reminderService: reminderService}
}

func (h *ReminderHandler) GetSettings(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	result, err := h.reminderService.GetSettings(c.Request.Context(), userID)
	if err != nil {
		if errors.Is(err, service.ErrSettingNotFound) {
			response.Error(c, 404, response.CodeNotFound, "reminder setting not found")
			return
		}
		response.ServerError(c, "failed to get reminder settings")
		return
	}

	response.OK(c, result)
}

type updateReminderRequest struct {
	IsEnabled  uint8  `json:"is_enabled"`
	RemindTime string `json:"remind_time" binding:"required"`
}

func (h *ReminderHandler) UpdateSettings(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	var req updateReminderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request parameters")
		return
	}

	result, err := h.reminderService.UpdateSettings(c.Request.Context(), userID, service.UpdateReminderInput{
		IsEnabled:  req.IsEnabled,
		RemindTime: req.RemindTime,
	})
	if err != nil {
		switch {
		case errors.Is(err, service.ErrSettingNotFound):
			response.Error(c, 404, response.CodeNotFound, "reminder setting not found")
		case errors.Is(err, service.ErrInvalidRemindTime):
			response.BadRequest(c, "invalid remind time format")
		case errors.Is(err, service.ErrInvalidIsEnabled):
			response.BadRequest(c, "invalid is_enabled value")
		default:
			response.ServerError(c, "failed to update reminder settings")
		}
		return
	}

	response.OK(c, result)
}

func (h *ReminderHandler) ListLogs(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	result, err := h.reminderService.ListLogs(c.Request.Context(), userID, page, pageSize)
	if err != nil {
		response.ServerError(c, "failed to list reminder logs")
		return
	}

	response.OK(c, result)
}

type createReminderLogRequest struct {
	RemindDate string `json:"remind_date"`
	Status     *uint8 `json:"status" binding:"required"`
}

func (h *ReminderHandler) CreateLog(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	var req createReminderLogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request parameters")
		return
	}

	result, err := h.reminderService.CreateLog(c.Request.Context(), userID, service.CreateReminderLogInput{
		RemindDate: req.RemindDate,
		Status:     req.Status,
	})
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidReminderStatus):
			response.BadRequest(c, "invalid reminder status")
		case errors.Is(err, service.ErrInvalidDate):
			response.BadRequest(c, "invalid date format")
		default:
			response.ServerError(c, "failed to create reminder log")
		}
		return
	}

	response.OK(c, result)
}
