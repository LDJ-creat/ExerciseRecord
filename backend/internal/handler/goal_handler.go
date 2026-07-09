package handler

import (
	"errors"
	"strconv"

	"github.com/exercise-record/backend/internal/middleware"
	"github.com/exercise-record/backend/internal/service"
	"github.com/exercise-record/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type GoalHandler struct {
	goalService *service.GoalService
}

func NewGoalHandler(goalService *service.GoalService) *GoalHandler {
	return &GoalHandler{goalService: goalService}
}

type createGoalRequest struct {
	PeriodType  uint8   `json:"period_type" binding:"required"`
	TargetType  uint8   `json:"target_type" binding:"required"`
	TargetValue float64 `json:"target_value" binding:"required"`
	PeriodStart string  `json:"period_start" binding:"required"`
	PeriodEnd   string  `json:"period_end" binding:"required"`
}

func (h *GoalHandler) Create(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	var req createGoalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request parameters")
		return
	}

	result, err := h.goalService.Create(c.Request.Context(), userID, service.CreateGoalInput{
		PeriodType:  req.PeriodType,
		TargetType:  req.TargetType,
		TargetValue: req.TargetValue,
		PeriodStart: req.PeriodStart,
		PeriodEnd:   req.PeriodEnd,
	})
	if err != nil {
		switch {
		case errors.Is(err, service.ErrDuplicateGoal):
			response.Conflict(c, "goal already exists for this period")
		case errors.Is(err, service.ErrInvalidGoalParams):
			response.BadRequest(c, err.Error())
		default:
			response.ServerError(c, "failed to create goal")
		}
		return
	}

	response.OK(c, result)
}

func (h *GoalHandler) List(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	history := c.Query("history") == "1"
	result, err := h.goalService.List(c.Request.Context(), userID, history)
	if err != nil {
		response.ServerError(c, "failed to list goals")
		return
	}

	response.OK(c, result)
}

func (h *GoalHandler) Progress(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	result, err := h.goalService.GetProgress(c.Request.Context(), userID)
	if err != nil {
		response.ServerError(c, "failed to get goal progress")
		return
	}

	response.OK(c, result)
}

type updateGoalRequest struct {
	TargetValue *float64 `json:"target_value" binding:"required"`
}

func (h *GoalHandler) Update(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	goalID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "invalid goal id")
		return
	}

	var req updateGoalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request parameters")
		return
	}

	result, err := h.goalService.Update(c.Request.Context(), userID, goalID, service.UpdateGoalInput{
		TargetValue: req.TargetValue,
	})
	if err != nil {
		switch {
		case errors.Is(err, service.ErrGoalNotFound):
			response.Error(c, 404, response.CodeNotFound, "goal not found")
		case errors.Is(err, service.ErrGoalForbidden):
			response.Forbidden(c, "access denied")
		case errors.Is(err, service.ErrGoalPeriodEnded), errors.Is(err, service.ErrGoalNotEditable), errors.Is(err, service.ErrInvalidGoalParams):
			response.BadRequest(c, err.Error())
		default:
			response.ServerError(c, "failed to update goal")
		}
		return
	}

	response.OK(c, result)
}
