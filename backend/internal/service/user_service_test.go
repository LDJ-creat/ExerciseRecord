package service

import (
	"context"
	"testing"

	"github.com/exercise-record/backend/pkg/optional"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

func TestChangePassword_OldPasswordWrong(t *testing.T) {
	db := setupTestDB(t)
	ctx := context.Background()

	authSvc := NewAuthService(db)
	reg, err := authSvc.Register(ctx, RegisterInput{
		Username: "frank",
		Password: "123456",
		Nickname: "Frank",
	})
	require.NoError(t, err)

	userSvc := NewUserService(db)
	err = userSvc.ChangePassword(ctx, reg.UserID, "wrong-old", "654321")
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrOldPasswordWrong)
}

func TestChangePassword_Success(t *testing.T) {
	db := setupTestDB(t)
	ctx := context.Background()

	authSvc := NewAuthService(db)
	reg, err := authSvc.Register(ctx, RegisterInput{
		Username: "grace",
		Password: "123456",
		Nickname: "Grace",
	})
	require.NoError(t, err)

	userSvc := NewUserService(db)
	err = userSvc.ChangePassword(ctx, reg.UserID, "123456", "654321")
	require.NoError(t, err)

	var user struct {
		PasswordHash string
	}
	require.NoError(t, db.Table("users").Select("password_hash").Where("id = ?", reg.UserID).Scan(&user).Error)
	assert.NoError(t, bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte("654321")))
}

func TestUpdateProfile_ClearHeightWeight(t *testing.T) {
	db := setupTestDB(t)
	ctx := context.Background()

	authSvc := NewAuthService(db)
	reg, err := authSvc.Register(ctx, RegisterInput{
		Username: "helen",
		Password: "123456",
		Nickname: "Helen",
	})
	require.NoError(t, err)

	height := 175.0
	weight := 65.0
	userSvc := NewUserService(db)
	_, err = userSvc.UpdateProfile(ctx, reg.UserID, UpdateProfileInput{
		Height: optional.Float64{Defined: true, Value: &height},
		Weight: optional.Float64{Defined: true, Value: &weight},
	})
	require.NoError(t, err)

	profile, err := userSvc.GetProfile(ctx, reg.UserID)
	require.NoError(t, err)
	require.NotNil(t, profile.Height)
	require.NotNil(t, profile.Weight)
	assert.Equal(t, 175.0, *profile.Height)
	assert.Equal(t, 65.0, *profile.Weight)

	profile, err = userSvc.UpdateProfile(ctx, reg.UserID, UpdateProfileInput{
		Height: optional.Float64{Defined: true, Value: nil},
		Weight: optional.Float64{Defined: true, Value: nil},
	})
	require.NoError(t, err)
	assert.Nil(t, profile.Height)
	assert.Nil(t, profile.Weight)
}
