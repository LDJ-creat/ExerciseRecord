package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/exercise-record/backend/internal/model"
	"gorm.io/gorm"
)

var (
	ErrDuplicateCheckIn  = errors.New("duplicate check-in")
	ErrFutureDate        = errors.New("check date cannot be in the future")
	ErrNegativeValue     = errors.New("duration, distance and calories must be non-negative")
	ErrInvalidSportType  = errors.New("invalid sport type")
	ErrCheckInNotFound   = errors.New("check-in not found")
	ErrCheckInForbidden  = errors.New("check-in access forbidden")
	ErrInvalidDate       = errors.New("invalid date format")
)

type CheckInService struct {
	db *gorm.DB
}

func NewCheckInService(db *gorm.DB) *CheckInService {
	return &CheckInService{db: db}
}

type CreateCheckInInput struct {
	SportTypeID uint64
	CheckDate   string
	Duration    uint
	Distance    *float64
	Calories    *uint
	Remark      *string
}

type CheckInResult struct {
	ID          uint64   `json:"id"`
	SportTypeID uint64   `json:"sport_type_id"`
	CheckDate   string   `json:"check_date"`
	Duration    uint     `json:"duration"`
	Distance    *float64 `json:"distance"`
	Calories    *uint    `json:"calories"`
	Remark      *string  `json:"remark"`
	IsMakeup    uint8    `json:"is_makeup"`
}

type ListCheckInsInput struct {
	UserID      uint64
	StartDate   string
	EndDate     string
	SportTypeID *uint64
	Page        int
	PageSize    int
}

type ListCheckInsResult struct {
	Items    []CheckInResult `json:"items"`
	Total    int64           `json:"total"`
	Page     int             `json:"page"`
	PageSize int             `json:"page_size"`
}

type UpdateCheckInInput struct {
	SportTypeID *uint64
	CheckDate   *string
	Duration    *uint
	Distance    *float64
	Calories    *uint
	Remark      *string
}

func (s *CheckInService) Create(ctx context.Context, userID uint64, input CreateCheckInInput) (*CheckInResult, error) {
	if err := validateNonNegative(input.Duration, input.Distance, input.Calories); err != nil {
		return nil, err
	}

	checkDate, err := parseDate(input.CheckDate)
	if err != nil {
		return nil, ErrInvalidDate
	}

	today := todayDate()
	if checkDate.After(today) {
		return nil, ErrFutureDate
	}

	if err := s.ensureSportTypeActive(ctx, userID, input.SportTypeID); err != nil {
		return nil, err
	}

	isMakeup := uint8(0)
	if checkDate.Before(today) {
		isMakeup = 1
	}

	record := model.CheckIn{
		UserID:      userID,
		SportTypeID: input.SportTypeID,
		CheckDate:   checkDate,
		Duration:    input.Duration,
		Distance:    input.Distance,
		Calories:    input.Calories,
		Remark:      input.Remark,
		IsMakeup:    isMakeup,
	}

	if err := s.db.WithContext(ctx).Create(&record).Error; err != nil {
		if isDuplicateError(err) {
			return nil, ErrDuplicateCheckIn
		}
		return nil, fmt.Errorf("create check-in: %w", err)
	}

	return toCheckInResult(&record), nil
}

func (s *CheckInService) List(ctx context.Context, input ListCheckInsInput) (*ListCheckInsResult, error) {
	page := input.Page
	if page < 1 {
		page = 1
	}
	pageSize := input.PageSize
	if pageSize < 1 {
		pageSize = 20
	}

	query := s.db.WithContext(ctx).Model(&model.CheckIn{}).Where("user_id = ?", input.UserID)

	if input.StartDate != "" {
		start, err := parseDate(input.StartDate)
		if err != nil {
			return nil, ErrInvalidDate
		}
		query = query.Where("check_date >= ?", start)
	}
	if input.EndDate != "" {
		end, err := parseDate(input.EndDate)
		if err != nil {
			return nil, ErrInvalidDate
		}
		query = query.Where("check_date <= ?", end)
	}
	if input.SportTypeID != nil {
		query = query.Where("sport_type_id = ?", *input.SportTypeID)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("count check-ins: %w", err)
	}

	var records []model.CheckIn
	offset := (page - 1) * pageSize
	if err := query.Order("check_date DESC, id DESC").Offset(offset).Limit(pageSize).Find(&records).Error; err != nil {
		return nil, fmt.Errorf("list check-ins: %w", err)
	}

	items := make([]CheckInResult, len(records))
	for i := range records {
		items[i] = *toCheckInResult(&records[i])
	}

	return &ListCheckInsResult{
		Items:    items,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

func (s *CheckInService) Get(ctx context.Context, userID, checkInID uint64) (*CheckInResult, error) {
	record, err := s.findCheckIn(ctx, checkInID)
	if err != nil {
		return nil, err
	}
	if record.UserID != userID {
		return nil, ErrCheckInForbidden
	}
	return toCheckInResult(record), nil
}

func (s *CheckInService) Update(ctx context.Context, userID, checkInID uint64, input UpdateCheckInInput) (*CheckInResult, error) {
	record, err := s.findCheckIn(ctx, checkInID)
	if err != nil {
		return nil, err
	}
	if record.UserID != userID {
		return nil, ErrCheckInForbidden
	}

	if input.Duration != nil {
		record.Duration = *input.Duration
	}
	if input.Distance != nil {
		if *input.Distance < 0 {
			return nil, ErrNegativeValue
		}
		record.Distance = input.Distance
	}
	if input.Calories != nil {
		record.Calories = input.Calories
	}
	if input.Remark != nil {
		record.Remark = input.Remark
	}

	today := todayDate()

	if input.CheckDate != nil {
		checkDate, err := parseDate(*input.CheckDate)
		if err != nil {
			return nil, ErrInvalidDate
		}
		if checkDate.After(today) {
			return nil, ErrFutureDate
		}
		record.CheckDate = checkDate
		if checkDate.Before(today) {
			record.IsMakeup = 1
		} else {
			record.IsMakeup = 0
		}
	}

	if input.SportTypeID != nil {
		if err := s.ensureSportTypeActive(ctx, userID, *input.SportTypeID); err != nil {
			return nil, err
		}
		record.SportTypeID = *input.SportTypeID
	}

	if err := s.db.WithContext(ctx).Save(record).Error; err != nil {
		if isDuplicateError(err) {
			return nil, ErrDuplicateCheckIn
		}
		return nil, fmt.Errorf("update check-in: %w", err)
	}

	return toCheckInResult(record), nil
}

func (s *CheckInService) Delete(ctx context.Context, userID, checkInID uint64) error {
	record, err := s.findCheckIn(ctx, checkInID)
	if err != nil {
		return err
	}
	if record.UserID != userID {
		return ErrCheckInForbidden
	}

	if err := s.db.WithContext(ctx).Delete(record).Error; err != nil {
		return fmt.Errorf("delete check-in: %w", err)
	}
	return nil
}

func (s *CheckInService) findCheckIn(ctx context.Context, checkInID uint64) (*model.CheckIn, error) {
	var record model.CheckIn
	if err := s.db.WithContext(ctx).First(&record, checkInID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCheckInNotFound
		}
		return nil, fmt.Errorf("find check-in: %w", err)
	}
	return &record, nil
}

func (s *CheckInService) ensureSportTypeActive(ctx context.Context, userID, sportTypeID uint64) error {
	var count int64
	if err := s.db.WithContext(ctx).Model(&model.SportType{}).
		Where("id = ? AND is_active = 1 AND (user_id IS NULL OR user_id = ?)", sportTypeID, userID).
		Count(&count).Error; err != nil {
		return fmt.Errorf("check sport type: %w", err)
	}
	if count == 0 {
		return ErrInvalidSportType
	}
	return nil
}

func toCheckInResult(record *model.CheckIn) *CheckInResult {
	return &CheckInResult{
		ID:          record.ID,
		SportTypeID: record.SportTypeID,
		CheckDate:   record.CheckDate.Format("2006-01-02"),
		Duration:    record.Duration,
		Distance:    record.Distance,
		Calories:    record.Calories,
		Remark:      record.Remark,
		IsMakeup:    record.IsMakeup,
	}
}

func parseDate(value string) (time.Time, error) {
	return time.ParseInLocation("2006-01-02", value, time.Local)
}

func todayDate() time.Time {
	now := time.Now()
	return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
}

func validateNonNegative(duration uint, distance *float64, calories *uint) error {
	if distance != nil && *distance < 0 {
		return ErrNegativeValue
	}
	return nil
}

func isDuplicateError(err error) bool {
	if errors.Is(err, gorm.ErrDuplicatedKey) {
		return true
	}
	msg := err.Error()
	return strings.Contains(msg, "UNIQUE constraint failed") ||
		strings.Contains(msg, "Duplicate entry") ||
		strings.Contains(msg, "duplicate key value violates unique constraint")
}
