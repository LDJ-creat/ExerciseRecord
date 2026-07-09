package service

import (
	"context"
	"testing"

	"github.com/exercise-record/backend/internal/model"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetProgress_DurationAccurate(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "progress_user1")
	checkInSvc := NewCheckInService(db)
	goalSvc := NewGoalService(db)
	ctx := context.Background()

	start, end := weekPeriod()
	_, err := goalSvc.Create(ctx, userID, CreateGoalInput{
		PeriodType:  1,
		TargetType:  2,
		TargetValue: 300,
		PeriodStart: start,
		PeriodEnd:   end,
	})
	require.NoError(t, err)

	today := todayDate().Format("2006-01-02")
	_, err = checkInSvc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1,
		CheckDate:   today,
		Duration:    120,
	})
	require.NoError(t, err)

	result, err := goalSvc.GetProgress(ctx, userID)
	require.NoError(t, err)
	require.Len(t, result.Goals, 1)
	assert.Equal(t, 120.0, result.Goals[0].ActualValue)
	assert.Equal(t, 40.0, result.Goals[0].ProgressPercent)
	assert.Equal(t, uint8(0), result.Goals[0].Status)
}

func TestGetProgress_Achieved(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "progress_user2")
	checkInSvc := NewCheckInService(db)
	goalSvc := NewGoalService(db)
	ctx := context.Background()

	start, end := weekPeriod()
	_, err := goalSvc.Create(ctx, userID, CreateGoalInput{
		PeriodType:  1,
		TargetType:  2,
		TargetValue: 100,
		PeriodStart: start,
		PeriodEnd:   end,
	})
	require.NoError(t, err)

	today := todayDate().Format("2006-01-02")
	_, err = checkInSvc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1,
		CheckDate:   today,
		Duration:    100,
	})
	require.NoError(t, err)

	result, err := goalSvc.GetProgress(ctx, userID)
	require.NoError(t, err)
	require.Len(t, result.Goals, 1)
	assert.Equal(t, uint8(1), result.Goals[0].Status)
	assert.Equal(t, 100.0, result.Goals[0].ProgressPercent)

	var goal model.Goal
	require.NoError(t, db.First(&goal).Error)
	assert.Equal(t, uint8(1), goal.Status)
}

func TestGetProgress_ExpiredNotAchieved(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "progress_user3")
	goalSvc := NewGoalService(db)
	ctx := context.Background()

	pastStart := todayDate().AddDate(0, 0, -14).Format("2006-01-02")
	pastEnd := todayDate().AddDate(0, 0, -8).Format("2006-01-02")
	created, err := goalSvc.Create(ctx, userID, CreateGoalInput{
		PeriodType:  1,
		TargetType:  1,
		TargetValue: 5,
		PeriodStart: pastStart,
		PeriodEnd:   pastEnd,
	})
	require.NoError(t, err)

	result, err := goalSvc.GetProgress(ctx, userID)
	require.NoError(t, err)
	assert.Empty(t, result.Goals)

	var goal model.Goal
	require.NoError(t, db.First(&goal, created.ID).Error)
	assert.Equal(t, uint8(2), goal.Status)
}

func TestGetProgress_CountTarget(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "progress_user4")
	checkInSvc := NewCheckInService(db)
	goalSvc := NewGoalService(db)
	ctx := context.Background()

	start, end := weekPeriod()
	_, err := goalSvc.Create(ctx, userID, CreateGoalInput{
		PeriodType:  1,
		TargetType:  1,
		TargetValue: 4,
		PeriodStart: start,
		PeriodEnd:   end,
	})
	require.NoError(t, err)

	today := todayDate().Format("2006-01-02")
	yesterday := todayDate().AddDate(0, 0, -1).Format("2006-01-02")
	for _, date := range []string{today, yesterday} {
		_, err = checkInSvc.Create(ctx, userID, CreateCheckInInput{
			SportTypeID: 1,
			CheckDate:   date,
			Duration:    20,
		})
		require.NoError(t, err)
	}

	result, err := goalSvc.GetProgress(ctx, userID)
	require.NoError(t, err)
	require.Len(t, result.Goals, 1)
	assert.Equal(t, 2.0, result.Goals[0].ActualValue)
	assert.Equal(t, 50.0, result.Goals[0].ProgressPercent)
}

func TestGetProgress_DistanceTarget(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "progress_user5")
	checkInSvc := NewCheckInService(db)
	goalSvc := NewGoalService(db)
	ctx := context.Background()

	start, end := weekPeriod()
	_, err := goalSvc.Create(ctx, userID, CreateGoalInput{
		PeriodType:  1,
		TargetType:  3,
		TargetValue: 20,
		PeriodStart: start,
		PeriodEnd:   end,
	})
	require.NoError(t, err)

	today := todayDate().Format("2006-01-02")
	dist1 := 5.5
	_, err = checkInSvc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1,
		CheckDate:   today,
		Duration:    30,
		Distance:    &dist1,
	})
	require.NoError(t, err)

	yesterday := todayDate().AddDate(0, 0, -1).Format("2006-01-02")
	_, err = checkInSvc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 2,
		CheckDate:   yesterday,
		Duration:    20,
	})
	require.NoError(t, err)

	result, err := goalSvc.GetProgress(ctx, userID)
	require.NoError(t, err)
	require.Len(t, result.Goals, 1)
	assert.Equal(t, 5.5, result.Goals[0].ActualValue)
	assert.Equal(t, 27.5, result.Goals[0].ProgressPercent)
}

func TestCalcProgressPercent_OneDecimal(t *testing.T) {
	assert.Equal(t, 33.3, calcProgressPercent(1, 3))
	assert.Equal(t, 100.0, calcProgressPercent(300, 300))
}
