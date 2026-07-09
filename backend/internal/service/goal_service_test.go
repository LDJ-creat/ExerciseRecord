package service

import (
	"context"
	"testing"

	"github.com/exercise-record/backend/internal/model"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func weekPeriod() (string, string) {
	today := todayDate()
	// Monday of current week
	weekday := int(today.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	start := today.AddDate(0, 0, -(weekday - 1))
	end := start.AddDate(0, 0, 6)
	return start.Format("2006-01-02"), end.Format("2006-01-02")
}

func TestCreateGoal_Success(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "goal_user1")
	svc := NewGoalService(db)
	ctx := context.Background()

	start, end := weekPeriod()
	result, err := svc.Create(ctx, userID, CreateGoalInput{
		PeriodType:  1,
		TargetType:  2,
		TargetValue: 300,
		PeriodStart: start,
		PeriodEnd:   end,
	})
	require.NoError(t, err)
	assert.NotZero(t, result.ID)
	assert.Equal(t, uint8(1), result.PeriodType)
	assert.Equal(t, uint8(2), result.TargetType)
	assert.Equal(t, 300.0, result.TargetValue)
	assert.Equal(t, start, result.PeriodStart)
	assert.Equal(t, end, result.PeriodEnd)
	assert.Equal(t, uint8(0), result.Status)
}

func TestCreateGoal_DuplicatePeriodRejected(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "goal_user2")
	svc := NewGoalService(db)
	ctx := context.Background()

	start, end := weekPeriod()
	_, err := svc.Create(ctx, userID, CreateGoalInput{
		PeriodType:  1,
		TargetType:  2,
		TargetValue: 300,
		PeriodStart: start,
		PeriodEnd:   end,
	})
	require.NoError(t, err)

	_, err = svc.Create(ctx, userID, CreateGoalInput{
		PeriodType:  1,
		TargetType:  2,
		TargetValue: 400,
		PeriodStart: start,
		PeriodEnd:   end,
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrDuplicateGoal)
}

func TestUpdateGoal_EndedPeriodRejected(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "goal_user3")
	svc := NewGoalService(db)
	ctx := context.Background()

	pastStart := todayDate().AddDate(0, 0, -14).Format("2006-01-02")
	pastEnd := todayDate().AddDate(0, 0, -8).Format("2006-01-02")
	created, err := svc.Create(ctx, userID, CreateGoalInput{
		PeriodType:  1,
		TargetType:  2,
		TargetValue: 300,
		PeriodStart: pastStart,
		PeriodEnd:   pastEnd,
	})
	require.NoError(t, err)

	newValue := 500.0
	_, err = svc.Update(ctx, userID, created.ID, UpdateGoalInput{
		TargetValue: &newValue,
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrGoalPeriodEnded)
}

func TestListGoals_CurrentAndHistory(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "goal_user4")
	svc := NewGoalService(db)
	ctx := context.Background()

	start, end := weekPeriod()
	active, err := svc.Create(ctx, userID, CreateGoalInput{
		PeriodType:  1,
		TargetType:  2,
		TargetValue: 300,
		PeriodStart: start,
		PeriodEnd:   end,
	})
	require.NoError(t, err)

	pastStart := todayDate().AddDate(0, 0, -14).Format("2006-01-02")
	pastEnd := todayDate().AddDate(0, 0, -8).Format("2006-01-02")
	past, err := svc.Create(ctx, userID, CreateGoalInput{
		PeriodType:  1,
		TargetType:  1,
		TargetValue: 5,
		PeriodStart: pastStart,
		PeriodEnd:   pastEnd,
	})
	require.NoError(t, err)

	current, err := svc.List(ctx, userID, false)
	require.NoError(t, err)
	require.Len(t, current.Goals, 1)
	assert.Equal(t, active.ID, current.Goals[0].ID)

	history, err := svc.List(ctx, userID, true)
	require.NoError(t, err)
	require.Len(t, history.Goals, 1)
	assert.Equal(t, past.ID, history.Goals[0].ID)
}

func TestUpdateGoal_Success(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "goal_user5")
	svc := NewGoalService(db)
	ctx := context.Background()

	start, end := weekPeriod()
	created, err := svc.Create(ctx, userID, CreateGoalInput{
		PeriodType:  2,
		TargetType:  3,
		TargetValue: 50,
		PeriodStart: start,
		PeriodEnd:   end,
	})
	require.NoError(t, err)

	newValue := 80.0
	updated, err := svc.Update(ctx, userID, created.ID, UpdateGoalInput{
		TargetValue: &newValue,
	})
	require.NoError(t, err)
	assert.Equal(t, 80.0, updated.TargetValue)
}

func TestUpdateGoal_Forbidden(t *testing.T) {
	db := setupTestDB(t)
	userA := createTestUser(t, db, "goal_userA")
	userB := createTestUser(t, db, "goal_userB")
	svc := NewGoalService(db)
	ctx := context.Background()

	start, end := weekPeriod()
	created, err := svc.Create(ctx, userA, CreateGoalInput{
		PeriodType:  1,
		TargetType:  2,
		TargetValue: 300,
		PeriodStart: start,
		PeriodEnd:   end,
	})
	require.NoError(t, err)

	newValue := 500.0
	_, err = svc.Update(ctx, userB, created.ID, UpdateGoalInput{
		TargetValue: &newValue,
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrGoalForbidden)
}

func TestUpdateGoal_NotEditable(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "goal_user6")
	svc := NewGoalService(db)
	ctx := context.Background()

	start, end := weekPeriod()
	created, err := svc.Create(ctx, userID, CreateGoalInput{
		PeriodType:  1,
		TargetType:  2,
		TargetValue: 300,
		PeriodStart: start,
		PeriodEnd:   end,
	})
	require.NoError(t, err)

	require.NoError(t, db.Model(&model.Goal{}).Where("id = ?", created.ID).Update("status", 1).Error)

	newValue := 500.0
	_, err = svc.Update(ctx, userID, created.ID, UpdateGoalInput{
		TargetValue: &newValue,
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrGoalNotEditable)
}
