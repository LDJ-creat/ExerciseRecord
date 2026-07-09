package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/exercise-record/backend/internal/model"
	"gorm.io/gorm"
)

var ErrInvalidCalendarMonth = errors.New("invalid calendar month")

type CalendarService struct {
	db *gorm.DB
}

func NewCalendarService(db *gorm.DB) *CalendarService {
	return &CalendarService{db: db}
}

type CalendarDay struct {
	Date          string  `json:"date"`
	Checked       bool    `json:"checked"`
	Count         int     `json:"count"`
	TotalDuration uint    `json:"total_duration"`
	TotalDistance float64 `json:"total_distance"`
	HeatLevel     uint8   `json:"heat_level"`
}

type CalendarResult struct {
	Year        int           `json:"year"`
	Month       int           `json:"month"`
	Days        []CalendarDay `json:"days"`
	Streak      int           `json:"streak"`
	MaxDuration uint          `json:"max_duration"`
}

type dayAggregate struct {
	CheckDate     time.Time
	Count         int
	TotalDuration uint
	TotalDistance float64
}

func (s *CalendarService) GetCalendar(ctx context.Context, userID uint64, year, month int) (*CalendarResult, error) {
	if month < 1 || month > 12 {
		return nil, ErrInvalidCalendarMonth
	}

	start := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.Local)
	end := start.AddDate(0, 1, -1)

	aggregates, err := s.aggregateMonth(ctx, userID, start, end)
	if err != nil {
		return nil, err
	}

	aggByDate := make(map[string]dayAggregate, len(aggregates))
	checkedDurations := make([]uint, 0, len(aggregates))
	var maxDuration uint
	for _, agg := range aggregates {
		key := agg.CheckDate.Format("2006-01-02")
		aggByDate[key] = agg
		checkedDurations = append(checkedDurations, agg.TotalDuration)
		if agg.TotalDuration > maxDuration {
			maxDuration = agg.TotalDuration
		}
	}

	daysInMonth := end.Day()
	days := make([]CalendarDay, 0, daysInMonth)
	for day := 1; day <= daysInMonth; day++ {
		date := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.Local)
		dateKey := date.Format("2006-01-02")
		dayResult := CalendarDay{
			Date:          dateKey,
			Checked:       false,
			Count:         0,
			TotalDuration: 0,
			TotalDistance: 0,
			HeatLevel:     0,
		}
		if agg, ok := aggByDate[dateKey]; ok {
			dayResult.Checked = true
			dayResult.Count = agg.Count
			dayResult.TotalDuration = agg.TotalDuration
			dayResult.TotalDistance = agg.TotalDistance
			dayResult.HeatLevel = computeHeatLevel(agg.TotalDuration, checkedDurations)
		}
		days = append(days, dayResult)
	}

	streak, err := s.computeStreak(ctx, userID)
	if err != nil {
		return nil, err
	}

	return &CalendarResult{
		Year:        year,
		Month:       month,
		Days:        days,
		Streak:      streak,
		MaxDuration: maxDuration,
	}, nil
}

func (s *CalendarService) aggregateMonth(ctx context.Context, userID uint64, start, end time.Time) ([]dayAggregate, error) {
	var rows []dayAggregate
	err := s.db.WithContext(ctx).
		Model(&model.CheckIn{}).
		Select("check_date, COUNT(*) as count, SUM(duration) as total_duration, COALESCE(SUM(distance), 0) as total_distance").
		Where("user_id = ? AND check_date >= ? AND check_date <= ?", userID, start, end).
		Group("check_date").
		Order("check_date").
		Scan(&rows).Error
	if err != nil {
		return nil, fmt.Errorf("aggregate calendar month: %w", err)
	}
	return rows, nil
}

func (s *CalendarService) computeStreak(ctx context.Context, userID uint64) (int, error) {
	today := todayDate()
	yesterday := today.AddDate(0, 0, -1)

	var start time.Time
	switch {
	case hasCheckInOnDate(ctx, s.db, userID, today):
		start = today
	case hasCheckInOnDate(ctx, s.db, userID, yesterday):
		start = yesterday
	default:
		return 0, nil
	}

	streak := 0
	for d := start; hasCheckInOnDate(ctx, s.db, userID, d); d = d.AddDate(0, 0, -1) {
		streak++
	}
	return streak, nil
}

func hasCheckInOnDate(ctx context.Context, db *gorm.DB, userID uint64, date time.Time) bool {
	var count int64
	db.WithContext(ctx).
		Model(&model.CheckIn{}).
		Where("user_id = ? AND check_date = ?", userID, date).
		Limit(1).
		Count(&count)
	return count > 0
}

func computeHeatLevel(duration uint, monthDurations []uint) uint8 {
	if duration == 0 || len(monthDurations) == 0 {
		return 0
	}
	if len(monthDurations) == 1 {
		return 4
	}

	countLE := 0
	for _, d := range monthDurations {
		if d <= duration {
			countLE++
		}
	}
	pct := float64(countLE) / float64(len(monthDurations))
	switch {
	case pct <= 0.25:
		return 1
	case pct <= 0.50:
		return 2
	case pct <= 0.75:
		return 3
	default:
		return 4
	}
}
