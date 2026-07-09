package service

import (
	"context"
	"testing"

	"github.com/exercise-record/backend/internal/model"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func setupTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := "file:" + t.Name() + "?mode=memory&cache=private"
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	require.NoError(t, err)
	require.NoError(t, db.AutoMigrate(
		&model.User{},
		&model.ReminderSetting{},
		&model.ReminderLog{},
		&model.SportType{},
		&model.CheckIn{},
		&model.Goal{},
	))
	return db
}

func seedSportTypes(t *testing.T, db *gorm.DB) {
	t.Helper()
	types := []model.SportType{
		{Code: "running", Name: "跑步", NeedDistance: 1, NeedCalories: 1, IsActive: 1, SortOrder: 1},
		{Code: "walking", Name: "步行", NeedDistance: 1, NeedCalories: 0, IsActive: 1, SortOrder: 2},
		{Code: "cycling", Name: "骑行", NeedDistance: 1, NeedCalories: 1, IsActive: 1, SortOrder: 3},
		{Code: "swimming", Name: "游泳", NeedDistance: 0, NeedCalories: 1, IsActive: 1, SortOrder: 4},
		{Code: "fitness", Name: "健身", NeedDistance: 0, NeedCalories: 1, IsActive: 1, SortOrder: 5},
		{Code: "other", Name: "其他", NeedDistance: 0, NeedCalories: 0, IsActive: 1, SortOrder: 6},
	}
	require.NoError(t, db.Create(&types).Error)
}

func createTestUser(t *testing.T, db *gorm.DB, username string) uint64 {
	t.Helper()
	svc := NewAuthService(db)
	result, err := svc.Register(context.Background(), RegisterInput{
		Username: username,
		Password: "123456",
		Nickname: username,
	})
	require.NoError(t, err)
	return result.UserID
}
