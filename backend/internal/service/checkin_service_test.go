package service

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCreateCheckIn_DuplicateRejected(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "alice")
	svc := NewCheckInService(db)
	ctx := context.Background()

	checkDate := todayDate().Format("2006-01-02")
	_, err := svc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1,
		CheckDate:   checkDate,
		Duration:    30,
	})
	require.NoError(t, err)

	_, err = svc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1,
		CheckDate:   checkDate,
		Duration:    45,
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrDuplicateCheckIn)
}

func TestCreateCheckIn_Success(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "bob")
	svc := NewCheckInService(db)
	ctx := context.Background()

	distance := 5.0
	calories := uint(300)
	remark := "晨跑"
	result, err := svc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1,
		CheckDate:   todayDate().Format("2006-01-02"),
		Duration:    30,
		Distance:    &distance,
		Calories:    &calories,
		Remark:      &remark,
	})
	require.NoError(t, err)
	assert.NotZero(t, result.ID)
	assert.Equal(t, uint(30), result.Duration)
	assert.Equal(t, uint8(0), result.IsMakeup)
}

func TestCreateCheckIn_FutureDate(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "carol")
	svc := NewCheckInService(db)
	ctx := context.Background()

	future := todayDate().AddDate(0, 0, 1).Format("2006-01-02")
	_, err := svc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1,
		CheckDate:   future,
		Duration:    30,
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrFutureDate)
}

func TestCreateCheckIn_Makeup(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "dave")
	svc := NewCheckInService(db)
	ctx := context.Background()

	past := todayDate().AddDate(0, 0, -1).Format("2006-01-02")
	result, err := svc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1,
		CheckDate:   past,
		Duration:    20,
	})
	require.NoError(t, err)
	assert.Equal(t, uint8(1), result.IsMakeup)
}

func TestListCheckIns_FilterByDateAndType(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "eve")
	svc := NewCheckInService(db)
	ctx := context.Background()

	today := todayDate()
	yesterday := today.AddDate(0, 0, -1)

	_, err := svc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1,
		CheckDate:   today.Format("2006-01-02"),
		Duration:    30,
	})
	require.NoError(t, err)
	_, err = svc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 2,
		CheckDate:   yesterday.Format("2006-01-02"),
		Duration:    40,
	})
	require.NoError(t, err)

	sportTypeID := uint64(1)
	result, err := svc.List(ctx, ListCheckInsInput{
		UserID:      userID,
		StartDate:   today.Format("2006-01-02"),
		EndDate:     today.Format("2006-01-02"),
		SportTypeID: &sportTypeID,
	})
	require.NoError(t, err)
	assert.Equal(t, int64(1), result.Total)
	assert.Len(t, result.Items, 1)
	assert.Equal(t, uint64(1), result.Items[0].SportTypeID)
}

func TestGetCheckIn_Forbidden(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	ownerID := createTestUser(t, db, "owner")
	otherID := createTestUser(t, db, "other")
	svc := NewCheckInService(db)
	ctx := context.Background()

	created, err := svc.Create(ctx, ownerID, CreateCheckInInput{
		SportTypeID: 1,
		CheckDate:   todayDate().Format("2006-01-02"),
		Duration:    30,
	})
	require.NoError(t, err)

	_, err = svc.Get(ctx, otherID, created.ID)
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrCheckInForbidden)
}

func TestUpdateCheckIn_DuplicateConflict(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "frank")
	svc := NewCheckInService(db)
	ctx := context.Background()

	checkDate := todayDate().Format("2006-01-02")
	first, err := svc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1,
		CheckDate:   checkDate,
		Duration:    30,
	})
	require.NoError(t, err)

	second, err := svc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 2,
		CheckDate:   checkDate,
		Duration:    40,
	})
	require.NoError(t, err)

	sportTypeID := uint64(1)
	_, err = svc.Update(ctx, userID, second.ID, UpdateCheckInInput{
		SportTypeID: &sportTypeID,
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrDuplicateCheckIn)
	assert.NotZero(t, first.ID)
}

func TestListCheckIns_DefaultPageSize(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "grace")
	svc := NewCheckInService(db)
	ctx := context.Background()

	result, err := svc.List(ctx, ListCheckInsInput{UserID: userID})
	require.NoError(t, err)
	assert.Equal(t, 20, result.PageSize)
	assert.Equal(t, 1, result.Page)
}

func TestDeleteCheckIn_Success(t *testing.T) {
	db := setupTestDB(t)
	seedSportTypes(t, db)
	userID := createTestUser(t, db, "henry")
	svc := NewCheckInService(db)
	ctx := context.Background()

	created, err := svc.Create(ctx, userID, CreateCheckInInput{
		SportTypeID: 1,
		CheckDate:   todayDate().Format("2006-01-02"),
		Duration:    30,
	})
	require.NoError(t, err)

	err = svc.Delete(ctx, userID, created.ID)
	require.NoError(t, err)

	_, err = svc.Get(ctx, userID, created.ID)
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrCheckInNotFound)
}
