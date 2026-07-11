package service

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPersonalStats_SummaryCorrect(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "stats_user")
	checkInSvc := NewCheckInService(db)
	ctx := context.Background()

	today := todayDate().Format("2006-01-02")
	d1, d2 := 5.0, 3.5
	c1, c2 := uint(300), uint(200)

	_, err := checkInSvc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1, CheckDate: today, Duration: 30, Distance: &d1, Calories: &c1,
	})
	require.NoError(t, err)
	_, err = checkInSvc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 2, CheckDate: today, Duration: 45, Distance: &d2, Calories: &c2,
	})
	require.NoError(t, err)

	svc := NewStatsService(db)
	result, err := svc.GetPersonalStats(ctx, userID, "day")
	require.NoError(t, err)

	assert.Equal(t, int64(2), result.Summary.TotalCount)
	assert.Equal(t, uint64(75), result.Summary.TotalDuration)
	assert.InDelta(t, 8.5, result.Summary.TotalDistance, 0.01)
	assert.Equal(t, uint64(500), result.Summary.TotalCalories)
}

func TestPersonalStats_PeriodDayFiltersTodayOnly(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "period_user")
	checkInSvc := NewCheckInService(db)
	ctx := context.Background()

	today := todayDate()
	yesterday := today.AddDate(0, 0, -1)

	_, err := checkInSvc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1, CheckDate: today.Format("2006-01-02"), Duration: 30,
	})
	require.NoError(t, err)
	_, err = checkInSvc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1, CheckDate: yesterday.Format("2006-01-02"), Duration: 60,
	})
	require.NoError(t, err)

	svc := NewStatsService(db)
	result, err := svc.GetPersonalStats(ctx, userID, "day")
	require.NoError(t, err)

	assert.Equal(t, int64(1), result.Summary.TotalCount)
	assert.Equal(t, uint64(30), result.Summary.TotalDuration)
}

func TestPersonalStats_PeriodWeek(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "week_user")
	checkInSvc := NewCheckInService(db)
	ctx := context.Background()

	today := todayDate()
	weekStart := beginningOfWeek(today)
	lastWeek := weekStart.AddDate(0, 0, -1)

	_, err := checkInSvc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1, CheckDate: today.Format("2006-01-02"), Duration: 20,
	})
	require.NoError(t, err)
	_, err = checkInSvc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1, CheckDate: lastWeek.Format("2006-01-02"), Duration: 99,
	})
	require.NoError(t, err)

	svc := NewStatsService(db)
	result, err := svc.GetPersonalStats(ctx, userID, "week")
	require.NoError(t, err)

	assert.Equal(t, int64(1), result.Summary.TotalCount)
	assert.Equal(t, uint64(20), result.Summary.TotalDuration)
}

func TestPersonalStats_OnlyOwnData(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userA := createTestUser(t, db, "user_a")
	userB := createTestUser(t, db, "user_b")
	checkInSvc := NewCheckInService(db)
	ctx := context.Background()

	today := todayDate().Format("2006-01-02")
	_, err := checkInSvc.Create(ctx, userA, CreateCheckInInput{
		SportTypeID: 1, CheckDate: today, Duration: 30,
	})
	require.NoError(t, err)
	_, err = checkInSvc.Create(ctx, userB, CreateCheckInInput{
		SportTypeID: 1, CheckDate: today, Duration: 100,
	})
	require.NoError(t, err)

	svc := NewStatsService(db)
	result, err := svc.GetPersonalStats(ctx, userA, "day")
	require.NoError(t, err)

	assert.Equal(t, int64(1), result.Summary.TotalCount)
	assert.Equal(t, uint64(30), result.Summary.TotalDuration)
}

func TestPersonalStats_InvalidPeriod(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "invalid_period")
	svc := NewStatsService(db)

	_, err := svc.GetPersonalStats(context.Background(), userID, "year")
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrInvalidPeriod)
}

func TestPersonalStats_BySportTypePercent(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "sport_pct")
	checkInSvc := NewCheckInService(db)
	ctx := context.Background()

	for i := 1; i <= 3; i++ {
		past := todayDate().AddDate(0, 0, -i).Format("2006-01-02")
		_, err := checkInSvc.Create(ctx, userID, CreateCheckInInput{
			SportTypeID: 1, CheckDate: past, Duration: 10,
		})
		require.NoError(t, err)
	}
	past := todayDate().AddDate(0, 0, -4).Format("2006-01-02")
	_, err := checkInSvc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 2, CheckDate: past, Duration: 10,
	})
	require.NoError(t, err)

	svc := NewStatsService(db)
	result, err := svc.GetPersonalStats(ctx, userID, "all")
	require.NoError(t, err)
	require.Len(t, result.BySportType, 2)

	var runningPct float64
	for _, st := range result.BySportType {
		if st.SportTypeID == 1 {
			runningPct = st.Percent
			assert.Equal(t, "跑步", st.Name)
			assert.Equal(t, int64(3), st.Count)
		}
	}
	assert.InDelta(t, 75.0, runningPct, 0.1)
}

func TestPersonalStats_PeriodMonth(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "month_user")
	checkInSvc := NewCheckInService(db)
	ctx := context.Background()

	today := todayDate()
	monthStart := time.Date(today.Year(), today.Month(), 1, 0, 0, 0, 0, today.Location())
	lastMonth := monthStart.AddDate(0, 0, -1)

	_, err := checkInSvc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1, CheckDate: today.Format("2006-01-02"), Duration: 25,
	})
	require.NoError(t, err)
	_, err = checkInSvc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1, CheckDate: lastMonth.Format("2006-01-02"), Duration: 99,
	})
	require.NoError(t, err)

	svc := NewStatsService(db)
	result, err := svc.GetPersonalStats(ctx, userID, "month")
	require.NoError(t, err)

	assert.Equal(t, int64(1), result.Summary.TotalCount)
	assert.Equal(t, uint64(25), result.Summary.TotalDuration)
}

func TestPersonalStats_EmptyData(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "empty_user")
	svc := NewStatsService(db)

	result, err := svc.GetPersonalStats(context.Background(), userID, "month")
	require.NoError(t, err)

	assert.Equal(t, int64(0), result.Summary.TotalCount)
	assert.Equal(t, uint64(0), result.Summary.TotalDuration)
	assert.Empty(t, result.ByPeriod)
	assert.Empty(t, result.BySportType)
	assert.Empty(t, result.Trend)
}

func TestPersonalStats_TrendCalories(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "trend_calories_user")
	checkInSvc := NewCheckInService(db)
	ctx := context.Background()

	today := todayDate().Format("2006-01-02")
	calories := uint(300)

	_, err := checkInSvc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 5,
		CheckDate:   today,
		Duration:    30,
		Calories:    &calories,
	})
	require.NoError(t, err)

	svc := NewStatsService(db)
	result, err := svc.GetPersonalStats(ctx, userID, "month")
	require.NoError(t, err)

	assert.Equal(t, uint64(300), result.Summary.TotalCalories)
	require.Len(t, result.Trend, 1)
	assert.Equal(t, today, result.Trend[0].Date)
	assert.Equal(t, uint64(300), result.Trend[0].Calories)
	assert.Equal(t, "健身", result.Trend[0].PrimarySport)
}

func TestPersonalStats_TrendAndByPeriod(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "trend_user")
	checkInSvc := NewCheckInService(db)
	ctx := context.Background()

	today := todayDate()
	yesterday := today.AddDate(0, 0, -1)
	d := 4.0

	_, err := checkInSvc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1, CheckDate: today.Format("2006-01-02"), Duration: 30, Distance: &d,
	})
	require.NoError(t, err)
	_, err = checkInSvc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 2, CheckDate: yesterday.Format("2006-01-02"), Duration: 20,
	})
	require.NoError(t, err)

	svc := NewStatsService(db)
	result, err := svc.GetPersonalStats(ctx, userID, "week")
	require.NoError(t, err)

	require.Len(t, result.Trend, 2)
	assert.Equal(t, yesterday.Format("2006-01-02"), result.Trend[0].Date)
	assert.Equal(t, uint64(20), result.Trend[0].Duration)
	assert.Equal(t, int64(1), result.Trend[0].Count)
	assert.Equal(t, today.Format("2006-01-02"), result.Trend[1].Date)
	assert.Equal(t, uint64(30), result.Trend[1].Duration)
	assert.Equal(t, int64(1), result.Trend[1].Count)
	assert.InDelta(t, 4.0, result.Trend[1].Distance, 0.01)
	assert.Equal(t, "跑步", result.Trend[1].PrimarySport)

	require.Len(t, result.ByPeriod, 2)
}

func TestRanking_Top50Limit(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	checkInSvc := NewCheckInService(db)
	ctx := context.Background()
	today := todayDate().Format("2006-01-02")

	var firstUserID uint64
	for i := 0; i < 55; i++ {
		userID := createTestUser(t, db, fmt.Sprintf("rank_user_%02d", i))
		if i == 0 {
			firstUserID = userID
		}
		_, err := checkInSvc.Create(ctx, userID, CreateCheckInInput{
			SportTypeID: 1,
			CheckDate:   today,
			Duration:    uint(i + 1),
		})
		require.NoError(t, err)
	}

	svc := NewStatsService(db)
	result, err := svc.GetRanking(ctx, firstUserID, "duration", "all")
	require.NoError(t, err)

	assert.Len(t, result.Rankings, 50)
	assert.Equal(t, 1, result.Rankings[0].Rank)
	assert.Equal(t, float64(55), result.Rankings[0].Value)
	assert.Equal(t, 50, result.Rankings[49].Rank)
	assert.Equal(t, 55, result.MyRank.Rank)
	assert.Equal(t, float64(1), result.MyRank.Value)
}

func TestRanking_DimensionSwitch(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	checkInSvc := NewCheckInService(db)
	ctx := context.Background()
	today := todayDate().Format("2006-01-02")

	userA := createTestUser(t, db, "dim_a")
	userB := createTestUser(t, db, "dim_b")
	d := 10.0

	_, err := checkInSvc.Create(ctx, userA, CreateCheckInInput{
		SportTypeID: 1, CheckDate: today, Duration: 30, Distance: &d,
	})
	require.NoError(t, err)
	_, err = checkInSvc.Create(ctx, userA, CreateCheckInInput{
		SportTypeID: 2, CheckDate: today, Duration: 20,
	})
	require.NoError(t, err)
	d2 := 5.0
	_, err = checkInSvc.Create(ctx, userB, CreateCheckInInput{
		SportTypeID: 1, CheckDate: today, Duration: 100, Distance: &d2,
	})
	require.NoError(t, err)

	svc := NewStatsService(db)

	countResult, err := svc.GetRanking(ctx, userA, "count", "all")
	require.NoError(t, err)
	assert.Equal(t, float64(2), countResult.Rankings[0].Value)
	assert.Equal(t, userA, countResult.Rankings[0].UserID)

	durationResult, err := svc.GetRanking(ctx, userA, "duration", "all")
	require.NoError(t, err)
	assert.Equal(t, float64(100), durationResult.Rankings[0].Value)
	assert.Equal(t, userB, durationResult.Rankings[0].UserID)

	distanceResult, err := svc.GetRanking(ctx, userA, "distance", "all")
	require.NoError(t, err)
	assert.Equal(t, float64(10), distanceResult.Rankings[0].Value)
	assert.Equal(t, userA, distanceResult.Rankings[0].UserID)
}

func TestRanking_NoCheckInDetailsExposed(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	checkInSvc := NewCheckInService(db)
	ctx := context.Background()
	userID := createTestUser(t, db, "privacy_user")

	_, err := checkInSvc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1,
		CheckDate:   todayDate().Format("2006-01-02"),
		Duration:    30,
	})
	require.NoError(t, err)

	svc := NewStatsService(db)
	result, err := svc.GetRanking(ctx, userID, "count", "all")
	require.NoError(t, err)
	require.Len(t, result.Rankings, 1)

	entry := result.Rankings[0]
	assert.Equal(t, 1, entry.Rank)
	assert.Equal(t, userID, entry.UserID)
	assert.NotEmpty(t, entry.Nickname)
	assert.Equal(t, float64(1), entry.Value)
}

func TestRanking_MyRankOutsideTop50(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	checkInSvc := NewCheckInService(db)
	ctx := context.Background()
	today := todayDate().Format("2006-01-02")

	lowUser := createTestUser(t, db, "low_rank")
	for i := 0; i < 52; i++ {
		userID := createTestUser(t, db, fmt.Sprintf("high_rank_%02d", i))
		_, err := checkInSvc.Create(ctx, userID, CreateCheckInInput{
			SportTypeID: 1, CheckDate: today, Duration: uint(100 - i),
		})
		require.NoError(t, err)
	}
	_, err := checkInSvc.Create(ctx, lowUser, CreateCheckInInput{
		SportTypeID: 1, CheckDate: today, Duration: 1,
	})
	require.NoError(t, err)

	svc := NewStatsService(db)
	result, err := svc.GetRanking(ctx, lowUser, "duration", "all")
	require.NoError(t, err)

	assert.Len(t, result.Rankings, 50)
	assert.Equal(t, 53, result.MyRank.Rank)
	assert.Equal(t, float64(1), result.MyRank.Value)
}

func TestRanking_PeriodWeekFilters(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	checkInSvc := NewCheckInService(db)
	ctx := context.Background()

	userID := createTestUser(t, db, "period_rank")
	today := todayDate()
	lastWeek := beginningOfWeek(today).AddDate(0, 0, -1)

	_, err := checkInSvc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1, CheckDate: today.Format("2006-01-02"), Duration: 30,
	})
	require.NoError(t, err)
	_, err = checkInSvc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 2, CheckDate: lastWeek.Format("2006-01-02"), Duration: 99,
	})
	require.NoError(t, err)

	svc := NewStatsService(db)
	result, err := svc.GetRanking(ctx, userID, "duration", "week")
	require.NoError(t, err)

	require.Len(t, result.Rankings, 1)
	assert.Equal(t, float64(30), result.Rankings[0].Value)
	assert.Equal(t, 1, result.MyRank.Rank)
}

func TestRanking_InvalidParams(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "invalid_rank")
	svc := NewStatsService(db)
	ctx := context.Background()

	_, err := svc.GetRanking(ctx, userID, "calories", "all")
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrInvalidDimension)

	_, err = svc.GetRanking(ctx, userID, "count", "day")
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrInvalidPeriod)
}
