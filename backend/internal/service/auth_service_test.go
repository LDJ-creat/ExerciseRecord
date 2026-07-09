package service

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRegister_PasswordTooShort(t *testing.T) {
	svc := NewAuthService(nil)
	_, err := svc.Register(context.Background(), RegisterInput{
		Username: "alice",
		Password: "12345",
		Nickname: "Alice",
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrPasswordTooShort)
}

func TestRegister_UsernameExists(t *testing.T) {
	db := setupTestDB(t)
	svc := NewAuthService(db)
	ctx := context.Background()

	_, err := svc.Register(ctx, RegisterInput{
		Username: "bob",
		Password: "123456",
		Nickname: "Bob",
	})
	require.NoError(t, err)

	_, err = svc.Register(ctx, RegisterInput{
		Username: "bob",
		Password: "654321",
		Nickname: "Bob2",
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrUsernameExists)
}

func TestRegister_CreatesReminderSettings(t *testing.T) {
	db := setupTestDB(t)
	svc := NewAuthService(db)
	ctx := context.Background()

	result, err := svc.Register(ctx, RegisterInput{
		Username: "carol",
		Password: "123456",
		Nickname: "Carol",
	})
	require.NoError(t, err)

	var count int64
	err = db.Table("reminder_settings").Where("user_id = ?", result.UserID).Count(&count).Error
	require.NoError(t, err)
	assert.Equal(t, int64(1), count)

	var isEnabled uint8
	err = db.Table("reminder_settings").
		Select("is_enabled").
		Where("user_id = ?", result.UserID).
		Scan(&isEnabled).Error
	require.NoError(t, err)
	assert.Equal(t, uint8(1), isEnabled)
}

func TestLogin_Success(t *testing.T) {
	db := setupTestDB(t)
	svc := NewAuthService(db)
	ctx := context.Background()

	_, err := svc.Register(ctx, RegisterInput{
		Username: "dave",
		Password: "123456",
		Nickname: "Dave",
	})
	require.NoError(t, err)

	result, err := svc.Login(ctx, LoginInput{
		Username: "dave",
		Password: "123456",
	})
	require.NoError(t, err)
	assert.Equal(t, "dave", result.User.Username)
	assert.Equal(t, "Dave", result.User.Nickname)
	assert.NotZero(t, result.User.ID)
}

func TestLogin_WrongPassword(t *testing.T) {
	db := setupTestDB(t)
	svc := NewAuthService(db)
	ctx := context.Background()

	_, err := svc.Register(ctx, RegisterInput{
		Username: "eve",
		Password: "123456",
		Nickname: "Eve",
	})
	require.NoError(t, err)

	_, err = svc.Login(ctx, LoginInput{
		Username: "eve",
		Password: "wrong-password",
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrInvalidCredentials)
}
