package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/exercise-record/backend/internal/model"
	"gorm.io/gorm"
)

var (
	ErrDuplicateGoal     = errors.New("duplicate goal for period")
	ErrGoalNotFound      = errors.New("goal not found")
	ErrGoalForbidden     = errors.New("goal access forbidden")
	ErrGoalPeriodEnded   = errors.New("goal period has ended")
	ErrGoalNotEditable   = errors.New("goal is not editable")
	ErrInvalidGoalParams = errors.New("invalid goal parameters")
)

type GoalService struct {
	db *gorm.DB
}

func NewGoalService(db *gorm.DB) *GoalService {
	return &GoalService{db: db}
}

type CreateGoalInput struct {
	PeriodType  uint8
	TargetType  uint8
	TargetValue float64
	PeriodStart string
	PeriodEnd   string
}

type UpdateGoalInput struct {
	TargetValue *float64
}

type GoalResult struct {
	ID          uint64  `json:"id"`
	PeriodType  uint8   `json:"period_type"`
	TargetType  uint8   `json:"target_type"`
	TargetValue float64 `json:"target_value"`
	PeriodStart string  `json:"period_start"`
	PeriodEnd   string  `json:"period_end"`
	Status      uint8   `json:"status"`
}

type ListGoalsResult struct {
	Goals []GoalResult `json:"goals"`
}

func (s *GoalService) Create(ctx context.Context, userID uint64, input CreateGoalInput) (*GoalResult, error) {
	if err := validateGoalParams(input.PeriodType, input.TargetType, input.TargetValue); err != nil {
		return nil, err
	}

	periodStart, periodEnd, err := parseGoalPeriod(input.PeriodStart, input.PeriodEnd)
	if err != nil {
		return nil, ErrInvalidGoalParams
	}

	record := model.Goal{
		UserID:      userID,
		PeriodType:  input.PeriodType,
		TargetType:  input.TargetType,
		TargetValue: input.TargetValue,
		PeriodStart: periodStart,
		PeriodEnd:   periodEnd,
		Status:      0,
	}

	if err := s.db.WithContext(ctx).Create(&record).Error; err != nil {
		if isDuplicateError(err) {
			return nil, ErrDuplicateGoal
		}
		return nil, fmt.Errorf("create goal: %w", err)
	}

	return toGoalResult(&record), nil
}

func (s *GoalService) List(ctx context.Context, userID uint64, history bool) (*ListGoalsResult, error) {
	today := todayDate()
	if err := s.finalizeExpiredGoals(ctx, userID, today); err != nil {
		return nil, err
	}

	query := s.db.WithContext(ctx).Model(&model.Goal{}).Where("user_id = ?", userID)

	if history {
		query = query.Where("period_end < ?", today)
	} else {
		query = query.Where("status = ? AND period_end >= ?", 0, today)
	}

	var records []model.Goal
	if err := query.Order("period_start DESC, id DESC").Find(&records).Error; err != nil {
		return nil, fmt.Errorf("list goals: %w", err)
	}

	goals := make([]GoalResult, len(records))
	for i := range records {
		goals[i] = *toGoalResult(&records[i])
	}

	return &ListGoalsResult{Goals: goals}, nil
}

func (s *GoalService) Update(ctx context.Context, userID, goalID uint64, input UpdateGoalInput) (*GoalResult, error) {
	record, err := s.findGoal(ctx, goalID)
	if err != nil {
		return nil, err
	}
	if record.UserID != userID {
		return nil, ErrGoalForbidden
	}

	if record.Status != 0 {
		return nil, ErrGoalNotEditable
	}

	today := todayDate()
	if record.PeriodEnd.Before(today) {
		return nil, ErrGoalPeriodEnded
	}

	if input.TargetValue == nil {
		return nil, ErrInvalidGoalParams
	}
	if *input.TargetValue <= 0 {
		return nil, ErrInvalidGoalParams
	}

	record.TargetValue = *input.TargetValue
	if err := s.db.WithContext(ctx).Save(record).Error; err != nil {
		return nil, fmt.Errorf("update goal: %w", err)
	}

	return toGoalResult(record), nil
}

func (s *GoalService) findGoal(ctx context.Context, goalID uint64) (*model.Goal, error) {
	var record model.Goal
	if err := s.db.WithContext(ctx).First(&record, goalID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrGoalNotFound
		}
		return nil, fmt.Errorf("find goal: %w", err)
	}
	return &record, nil
}

func toGoalResult(record *model.Goal) *GoalResult {
	return &GoalResult{
		ID:          record.ID,
		PeriodType:  record.PeriodType,
		TargetType:  record.TargetType,
		TargetValue: record.TargetValue,
		PeriodStart: record.PeriodStart.Format("2006-01-02"),
		PeriodEnd:   record.PeriodEnd.Format("2006-01-02"),
		Status:      record.Status,
	}
}

func validateGoalParams(periodType, targetType uint8, targetValue float64) error {
	if periodType != 1 && periodType != 2 {
		return ErrInvalidGoalParams
	}
	if targetType < 1 || targetType > 3 {
		return ErrInvalidGoalParams
	}
	if targetValue <= 0 {
		return ErrInvalidGoalParams
	}
	return nil
}

func parseGoalPeriod(start, end string) (time.Time, time.Time, error) {
	periodStart, err := parseDate(start)
	if err != nil {
		return time.Time{}, time.Time{}, err
	}
	periodEnd, err := parseDate(end)
	if err != nil {
		return time.Time{}, time.Time{}, err
	}
	if periodEnd.Before(periodStart) {
		return time.Time{}, time.Time{}, ErrInvalidGoalParams
	}
	return periodStart, periodEnd, nil
}
