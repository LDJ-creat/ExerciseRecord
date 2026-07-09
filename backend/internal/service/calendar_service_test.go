package service

import (
	"context"
	"testing"
	"time"

	"github.com/exercise-record/backend/internal/model"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

func seedCheckIn(t *testing.T, db *gorm.DB, userID uint64, date string, duration uint, distance *float64) {
	seedCheckInOnSport(t, db, userID, date, 1, duration, distance)
}

func seedCheckInOnSport(t *testing.T, db *gorm.DB, userID uint64, date string, sportTypeID uint64, duration uint, distance *float64) {
	t.Helper()
	parsed, err := parseDate(date)
	require.NoError(t, err)
	require.NoError(t, db.Create(&model.CheckIn{
		UserID:      userID,
		SportTypeID: sportTypeID,
		CheckDate:   parsed,
		Duration:    duration,
		Distance:    distance,
	}).Error)
}

func TestCalendarService_MonthAggregation(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "cal_user")
	svc := NewCalendarService(db)
	ctx := context.Background()

	today := todayDate()
	year, month := today.Year(), today.Month()
	day1 := time.Date(year, month, 5, 0, 0, 0, 0, time.Local).Format("2006-01-02")
	day2 := time.Date(year, month, 10, 0, 0, 0, 0, time.Local).Format("2006-01-02")
	dist := 5.5
	seedCheckInOnSport(t, db, userID, day1, 1, 30, &dist)
	seedCheckInOnSport(t, db, userID, day1, 2, 20, nil)
	seedCheckInOnSport(t, db, userID, day2, 1, 60, nil)

	result, err := svc.GetCalendar(ctx, userID, year, int(month))
	require.NoError(t, err)
	assert.Equal(t, year, result.Year)
	assert.Equal(t, int(month), result.Month)

	daysInMonth := time.Date(year, month+1, 0, 0, 0, 0, 0, time.Local).Day()
	assert.Len(t, result.Days, daysInMonth)

	byDate := map[string]CalendarDay{}
	for _, d := range result.Days {
		byDate[d.Date] = d
	}

	assert.True(t, byDate[day1].Checked)
	assert.Equal(t, 2, byDate[day1].Count)
	assert.Equal(t, uint(50), byDate[day1].TotalDuration)
	assert.InDelta(t, 5.5, byDate[day1].TotalDistance, 0.001)

	assert.True(t, byDate[day2].Checked)
	assert.Equal(t, 1, byDate[day2].Count)
	assert.Equal(t, uint(60), byDate[day2].TotalDuration)

	emptyDay := time.Date(year, month, 1, 0, 0, 0, 0, time.Local).Format("2006-01-02")
	if emptyDay != day1 && emptyDay != day2 {
		assert.False(t, byDate[emptyDay].Checked)
		assert.Equal(t, uint8(0), byDate[emptyDay].HeatLevel)
	}
}

func TestCalendarService_HeatLevels(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "heat_user")
	svc := NewCalendarService(db)
	ctx := context.Background()

	today := todayDate()
	year, month := today.Year(), today.Month()
	durations := []uint{10, 20, 40, 80}
	for i, dur := range durations {
		date := time.Date(year, month, i+1, 0, 0, 0, 0, time.Local).Format("2006-01-02")
		seedCheckIn(t, db, userID, date, dur, nil)
	}

	result, err := svc.GetCalendar(ctx, userID, year, int(month))
	require.NoError(t, err)
	assert.Equal(t, uint(80), result.MaxDuration)

	levels := map[string]uint8{}
	for _, d := range result.Days {
		if d.Checked {
			levels[d.Date] = d.HeatLevel
		}
	}

	assert.Equal(t, uint8(1), levels[time.Date(year, month, 1, 0, 0, 0, 0, time.Local).Format("2006-01-02")])
	assert.Equal(t, uint8(2), levels[time.Date(year, month, 2, 0, 0, 0, 0, time.Local).Format("2006-01-02")])
	assert.Equal(t, uint8(3), levels[time.Date(year, month, 3, 0, 0, 0, 0, time.Local).Format("2006-01-02")])
	assert.Equal(t, uint8(4), levels[time.Date(year, month, 4, 0, 0, 0, 0, time.Local).Format("2006-01-02")])
}

func TestCalendarService_StreakFromToday(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "streak_today")
	svc := NewCalendarService(db)
	ctx := context.Background()

	today := todayDate()
	for i := 0; i < 5; i++ {
		date := today.AddDate(0, 0, -i).Format("2006-01-02")
		seedCheckIn(t, db, userID, date, 30, nil)
	}

	result, err := svc.GetCalendar(ctx, userID, today.Year(), int(today.Month()))
	require.NoError(t, err)
	assert.Equal(t, 5, result.Streak)
}

func TestCalendarService_StreakFromYesterday(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "streak_yesterday")
	svc := NewCalendarService(db)
	ctx := context.Background()

	today := todayDate()
	yesterday := today.AddDate(0, 0, -1)
	for i := 0; i < 3; i++ {
		date := yesterday.AddDate(0, 0, -i).Format("2006-01-02")
		seedCheckIn(t, db, userID, date, 30, nil)
	}

	result, err := svc.GetCalendar(ctx, userID, today.Year(), int(today.Month()))
	require.NoError(t, err)
	assert.Equal(t, 3, result.Streak)
}

func TestCalendarService_StreakBroken(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "streak_broken")
	svc := NewCalendarService(db)
	ctx := context.Background()

	today := todayDate()
	seedCheckIn(t, db, userID, today.AddDate(0, 0, -3).Format("2006-01-02"), 30, nil)

	result, err := svc.GetCalendar(ctx, userID, today.Year(), int(today.Month()))
	require.NoError(t, err)
	assert.Equal(t, 0, result.Streak)
}

func TestComputeHeatLevel(t *testing.T) {
	durations := []uint{10, 20, 40, 80}
	assert.Equal(t, uint8(0), computeHeatLevel(0, durations))
	assert.Equal(t, uint8(4), computeHeatLevel(80, durations))
	assert.Equal(t, uint8(1), computeHeatLevel(10, durations))
	assert.Equal(t, uint8(2), computeHeatLevel(20, durations))
	assert.Equal(t, uint8(3), computeHeatLevel(40, durations))
	assert.Equal(t, uint8(4), computeHeatLevel(15, []uint{15}))
}
