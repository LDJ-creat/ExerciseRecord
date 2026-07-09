package service

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func statusPtr(v uint8) *uint8 {
	return &v
}

func TestReminderService_GetSettings(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "alice")
	svc := NewReminderService(db)
	ctx := context.Background()

	result, err := svc.GetSettings(ctx, userID)
	require.NoError(t, err)
	assert.Equal(t, uint8(1), result.IsEnabled)
	assert.Equal(t, "20:00", result.RemindTime)
}

func TestReminderService_UpdateSettings(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "bob")
	svc := NewReminderService(db)
	ctx := context.Background()

	result, err := svc.UpdateSettings(ctx, userID, UpdateReminderInput{
		IsEnabled:  0,
		RemindTime: "09:30",
	})
	require.NoError(t, err)
	assert.Equal(t, uint8(0), result.IsEnabled)
	assert.Equal(t, "09:30", result.RemindTime)

	got, err := svc.GetSettings(ctx, userID)
	require.NoError(t, err)
	assert.Equal(t, uint8(0), got.IsEnabled)
	assert.Equal(t, "09:30", got.RemindTime)
}

func TestReminderService_UpdateSettings_InvalidTime(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "carol")
	svc := NewReminderService(db)
	ctx := context.Background()

	_, err := svc.UpdateSettings(ctx, userID, UpdateReminderInput{
		IsEnabled:  1,
		RemindTime: "invalid",
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrInvalidRemindTime)
}

func TestReminderService_UpdateSettings_InvalidIsEnabled(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "carol2")
	svc := NewReminderService(db)
	ctx := context.Background()

	_, err := svc.UpdateSettings(ctx, userID, UpdateReminderInput{
		IsEnabled:  2,
		RemindTime: "20:00",
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrInvalidIsEnabled)
}

func TestReminderService_CreateLog_StatusValues(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "dave")
	svc := NewReminderService(db)
	ctx := context.Background()

	base := todayDate()
	for i, status := range []uint8{0, 1, 2} {
		date := base.AddDate(0, 0, -i).Format("2006-01-02")
		result, err := svc.CreateLog(ctx, userID, CreateReminderLogInput{
			RemindDate: date,
			Status:     statusPtr(status),
		})
		require.NoError(t, err)
		assert.Equal(t, status, result.Status)
		assert.Equal(t, date, result.RemindDate)
		if status == 1 {
			require.NotNil(t, result.SentAt)
		}
	}
}

func TestReminderService_CreateLog_InvalidStatus(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "eve")
	svc := NewReminderService(db)
	ctx := context.Background()

	_, err := svc.CreateLog(ctx, userID, CreateReminderLogInput{
		RemindDate: todayDate().Format("2006-01-02"),
		Status:     statusPtr(3),
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrInvalidReminderStatus)
}

func TestReminderService_CreateLog_MissingStatus(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "eve2")
	svc := NewReminderService(db)
	ctx := context.Background()

	_, err := svc.CreateLog(ctx, userID, CreateReminderLogInput{
		RemindDate: todayDate().Format("2006-01-02"),
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrInvalidReminderStatus)
}

func TestReminderService_CreateLog_UpsertSameDate(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "upsert_user")
	svc := NewReminderService(db)
	ctx := context.Background()

	today := todayDate().Format("2006-01-02")

	first, err := svc.CreateLog(ctx, userID, CreateReminderLogInput{
		RemindDate: today,
		Status:     statusPtr(1),
	})
	require.NoError(t, err)

	second, err := svc.CreateLog(ctx, userID, CreateReminderLogInput{
		RemindDate: today,
		Status:     statusPtr(2),
	})
	require.NoError(t, err)

	assert.Equal(t, first.ID, second.ID)
	assert.Equal(t, uint8(2), second.Status)
	assert.Nil(t, second.SentAt)

	list, err := svc.ListLogs(ctx, userID, 1, 20)
	require.NoError(t, err)
	assert.Equal(t, int64(1), list.Total)
}

func TestReminderService_ListLogs_Pagination(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "frank")
	otherUserID := createTestUser(t, db, "grace")
	svc := NewReminderService(db)
	ctx := context.Background()

	base := todayDate()
	for i := 0; i < 5; i++ {
		date := base.AddDate(0, 0, -i).Format("2006-01-02")
		_, err := svc.CreateLog(ctx, userID, CreateReminderLogInput{
			RemindDate: date,
			Status:     statusPtr(1),
		})
		require.NoError(t, err)
		_, err = svc.CreateLog(ctx, otherUserID, CreateReminderLogInput{
			RemindDate: date,
			Status:     statusPtr(1),
		})
		require.NoError(t, err)
	}

	page1, err := svc.ListLogs(ctx, userID, 1, 2)
	require.NoError(t, err)
	assert.Equal(t, int64(5), page1.Total)
	assert.Len(t, page1.Items, 2)
	assert.Equal(t, 1, page1.Page)
	assert.Equal(t, 2, page1.PageSize)

	page2, err := svc.ListLogs(ctx, userID, 2, 2)
	require.NoError(t, err)
	assert.Len(t, page2.Items, 2)

	page3, err := svc.ListLogs(ctx, userID, 3, 2)
	require.NoError(t, err)
	assert.Len(t, page3.Items, 1)

	for _, item := range page1.Items {
		assert.NotEmpty(t, item.RemindDate)
	}
}

func TestReminderService_ListLogs_DefaultPageSize(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "henry")
	svc := NewReminderService(db)
	ctx := context.Background()

	result, err := svc.ListLogs(ctx, userID, 0, 0)
	require.NoError(t, err)
	assert.Equal(t, 1, result.Page)
	assert.Equal(t, 20, result.PageSize)
}

func TestReminderService_CreateLog_DefaultDate(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "iris")
	svc := NewReminderService(db)
	ctx := context.Background()

	result, err := svc.CreateLog(ctx, userID, CreateReminderLogInput{
		Status: statusPtr(2),
	})
	require.NoError(t, err)
	assert.Equal(t, todayDate().Format("2006-01-02"), result.RemindDate)
}

func TestReminderService_CreateLog_InvalidDate(t *testing.T) {
	db := setupTestDB(t)
	userID := createTestUser(t, db, "jack")
	svc := NewReminderService(db)
	ctx := context.Background()

	_, err := svc.CreateLog(ctx, userID, CreateReminderLogInput{
		RemindDate: "not-a-date",
		Status:     statusPtr(1),
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrInvalidDate)
}

func TestFormatRemindTime(t *testing.T) {
	assert.Equal(t, "20:00", formatRemindTime("20:00:00"))
	assert.Equal(t, "09:30", formatRemindTime("09:30"))
}
