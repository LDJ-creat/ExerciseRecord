package handler

import (
	"errors"
	"strconv"

	"github.com/exercise-record/backend/internal/middleware"
	"github.com/exercise-record/backend/internal/service"
	"github.com/exercise-record/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type CheckInHandler struct {
	checkInService *service.CheckInService
}

func NewCheckInHandler(checkInService *service.CheckInService) *CheckInHandler {
	return &CheckInHandler{checkInService: checkInService}
}

type createCheckInRequest struct {
	SportTypeID uint64   `json:"sport_type_id" binding:"required"`
	CheckDate   string   `json:"check_date" binding:"required"`
	Duration    uint     `json:"duration"`
	Distance    *float64 `json:"distance"`
	Calories    *uint    `json:"calories"`
	Remark      *string  `json:"remark"`
}

func (h *CheckInHandler) Create(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	var req createCheckInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request parameters")
		return
	}

	result, err := h.checkInService.Create(c.Request.Context(), userID, service.CreateCheckInInput{
		SportTypeID: req.SportTypeID,
		CheckDate:   req.CheckDate,
		Duration:    req.Duration,
		Distance:    req.Distance,
		Calories:    req.Calories,
		Remark:      req.Remark,
	})
	if err != nil {
		switch {
		case errors.Is(err, service.ErrDuplicateCheckIn):
			response.Conflict(c, "check-in already exists for this date and sport type")
		case errors.Is(err, service.ErrFutureDate), errors.Is(err, service.ErrNegativeValue), errors.Is(err, service.ErrInvalidDate), errors.Is(err, service.ErrInvalidSportType):
			response.BadRequest(c, err.Error())
		default:
			response.ServerError(c, "failed to create check-in")
		}
		return
	}

	response.OK(c, result)
}

func (h *CheckInHandler) List(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	var sportTypeID *uint64
	if raw := c.Query("sport_type_id"); raw != "" {
		id, err := strconv.ParseUint(raw, 10, 64)
		if err != nil {
			response.BadRequest(c, "invalid sport_type_id")
			return
		}
		sportTypeID = &id
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	result, err := h.checkInService.List(c.Request.Context(), service.ListCheckInsInput{
		UserID:      userID,
		StartDate:   c.Query("start_date"),
		EndDate:     c.Query("end_date"),
		SportTypeID: sportTypeID,
		Page:        page,
		PageSize:    pageSize,
	})
	if err != nil {
		if errors.Is(err, service.ErrInvalidDate) {
			response.BadRequest(c, "invalid date format")
			return
		}
		response.ServerError(c, "failed to list check-ins")
		return
	}

	response.OK(c, result)
}

func (h *CheckInHandler) Get(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	checkInID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "invalid check-in id")
		return
	}

	result, err := h.checkInService.Get(c.Request.Context(), userID, checkInID)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrCheckInNotFound):
			response.Error(c, 404, response.CodeNotFound, "check-in not found")
		case errors.Is(err, service.ErrCheckInForbidden):
			response.Forbidden(c, "access denied")
		default:
			response.ServerError(c, "failed to get check-in")
		}
		return
	}

	response.OK(c, result)
}

type updateCheckInRequest struct {
	SportTypeID *uint64  `json:"sport_type_id"`
	CheckDate   *string  `json:"check_date"`
	Duration    *uint    `json:"duration"`
	Distance    *float64 `json:"distance"`
	Calories    *uint    `json:"calories"`
	Remark      *string  `json:"remark"`
}

func (h *CheckInHandler) Update(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	checkInID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "invalid check-in id")
		return
	}

	var req updateCheckInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request parameters")
		return
	}

	result, err := h.checkInService.Update(c.Request.Context(), userID, checkInID, service.UpdateCheckInInput{
		SportTypeID: req.SportTypeID,
		CheckDate:   req.CheckDate,
		Duration:    req.Duration,
		Distance:    req.Distance,
		Calories:    req.Calories,
		Remark:      req.Remark,
	})
	if err != nil {
		switch {
		case errors.Is(err, service.ErrCheckInNotFound):
			response.Error(c, 404, response.CodeNotFound, "check-in not found")
		case errors.Is(err, service.ErrCheckInForbidden):
			response.Forbidden(c, "access denied")
		case errors.Is(err, service.ErrDuplicateCheckIn):
			response.Conflict(c, "check-in already exists for this date and sport type")
		case errors.Is(err, service.ErrFutureDate), errors.Is(err, service.ErrNegativeValue), errors.Is(err, service.ErrInvalidDate), errors.Is(err, service.ErrInvalidSportType):
			response.BadRequest(c, err.Error())
		default:
			response.ServerError(c, "failed to update check-in")
		}
		return
	}

	response.OK(c, result)
}

func (h *CheckInHandler) Delete(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	checkInID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "invalid check-in id")
		return
	}

	err = h.checkInService.Delete(c.Request.Context(), userID, checkInID)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrCheckInNotFound):
			response.Error(c, 404, response.CodeNotFound, "check-in not found")
		case errors.Is(err, service.ErrCheckInForbidden):
			response.Forbidden(c, "access denied")
		default:
			response.ServerError(c, "failed to delete check-in")
		}
		return
	}

	response.OK(c, gin.H{"message": "check-in deleted"})
}
