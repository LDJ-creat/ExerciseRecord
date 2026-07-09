package service

import (
	"context"
	"fmt"
	"math"
	"time"

	"github.com/exercise-record/backend/internal/model"
)

type GoalProgressResult struct {
	ID              uint64  `json:"id"`
	PeriodType      uint8   `json:"period_type"`
	TargetType      uint8   `json:"target_type"`
	TargetValue     float64 `json:"target_value"`
	PeriodStart     string  `json:"period_start"`
	PeriodEnd       string  `json:"period_end"`
	ActualValue     float64 `json:"actual_value"`
	ProgressPercent float64 `json:"progress_percent"`
	Status          uint8   `json:"status"`
}

type GoalProgressListResult struct {
	Goals []GoalProgressResult `json:"goals"`
}

func (s *GoalService) GetProgress(ctx context.Context, userID uint64) (*GoalProgressListResult, error) {
	today := todayDate()

	if err := s.finalizeExpiredGoals(ctx, userID, today); err != nil {
		return nil, err
	}

	var goals []model.Goal
	if err := s.db.WithContext(ctx).
		Where("user_id = ? AND period_start <= ? AND period_end >= ? AND status IN (0, 1)", userID, today, today).
		Order("period_type ASC, id ASC").
		Find(&goals).Error; err != nil {
		return nil, fmt.Errorf("list active goals: %w", err)
	}

	results := make([]GoalProgressResult, 0, len(goals))
	for i := range goals {
		progress, err := s.buildGoalProgress(ctx, userID, &goals[i])
		if err != nil {
			return nil, err
		}
		results = append(results, *progress)
	}

	return &GoalProgressListResult{Goals: results}, nil
}

func (s *GoalService) finalizeExpiredGoals(ctx context.Context, userID uint64, today time.Time) error {
	var expired []model.Goal
	if err := s.db.WithContext(ctx).
		Where("user_id = ? AND status = 0 AND period_end < ?", userID, today).
		Find(&expired).Error; err != nil {
		return fmt.Errorf("list expired goals: %w", err)
	}

	for i := range expired {
		if err := s.refreshGoalStatus(ctx, userID, &expired[i]); err != nil {
			return err
		}
	}
	return nil
}

func (s *GoalService) buildGoalProgress(ctx context.Context, userID uint64, goal *model.Goal) (*GoalProgressResult, error) {
	actual, err := s.calculateActual(ctx, userID, goal)
	if err != nil {
		return nil, err
	}

	status := goal.Status
	if status == 0 {
		if err := s.applyGoalStatus(ctx, goal, actual); err != nil {
			return nil, err
		}
		status = goal.Status
	}

	return &GoalProgressResult{
		ID:              goal.ID,
		PeriodType:      goal.PeriodType,
		TargetType:      goal.TargetType,
		TargetValue:     goal.TargetValue,
		PeriodStart:     goal.PeriodStart.Format("2006-01-02"),
		PeriodEnd:       goal.PeriodEnd.Format("2006-01-02"),
		ActualValue:     actual,
		ProgressPercent: calcProgressPercent(actual, goal.TargetValue),
		Status:          status,
	}, nil
}

func (s *GoalService) refreshGoalStatus(ctx context.Context, userID uint64, goal *model.Goal) error {
	actual, err := s.calculateActual(ctx, userID, goal)
	if err != nil {
		return err
	}
	return s.applyGoalStatus(ctx, goal, actual)
}

func (s *GoalService) applyGoalStatus(ctx context.Context, goal *model.Goal, actual float64) error {
	newStatus := goal.Status
	if actual >= goal.TargetValue {
		newStatus = 1
	} else if goal.PeriodEnd.Before(todayDate()) {
		newStatus = 2
	}

	if newStatus != goal.Status {
		if err := s.db.WithContext(ctx).Model(goal).Update("status", newStatus).Error; err != nil {
			return fmt.Errorf("update goal status: %w", err)
		}
		goal.Status = newStatus
	}
	return nil
}

func (s *GoalService) calculateActual(ctx context.Context, userID uint64, goal *model.Goal) (float64, error) {
	base := s.db.WithContext(ctx).Model(&model.CheckIn{}).
		Where("user_id = ? AND check_date >= ? AND check_date <= ?", userID, goal.PeriodStart, goal.PeriodEnd)

	switch goal.TargetType {
	case 1:
		var count int64
		if err := base.Count(&count).Error; err != nil {
			return 0, fmt.Errorf("count check-ins: %w", err)
		}
		return float64(count), nil
	case 2:
		var total float64
		if err := base.Select("COALESCE(SUM(duration), 0)").Scan(&total).Error; err != nil {
			return 0, fmt.Errorf("sum duration: %w", err)
		}
		return total, nil
	case 3:
		var total float64
		if err := base.Select("COALESCE(SUM(distance), 0)").Scan(&total).Error; err != nil {
			return 0, fmt.Errorf("sum distance: %w", err)
		}
		return total, nil
	default:
		return 0, ErrInvalidGoalParams
	}
}

func calcProgressPercent(actual, target float64) float64 {
	if target <= 0 {
		return 0
	}
	percent := actual / target * 100
	return math.Round(percent*10) / 10
}
