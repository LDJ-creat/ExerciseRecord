package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/exercise-record/backend/internal/model"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var (
	ErrUserNotFound       = errors.New("user not found")
	ErrOldPasswordWrong   = errors.New("old password is incorrect")
	ErrNewPasswordTooShort = errors.New("new password must be at least 6 characters")
)

type UserService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{db: db}
}

type ProfileResult struct {
	ID        uint64   `json:"id"`
	Username  string   `json:"username"`
	Nickname  string   `json:"nickname"`
	AvatarURL *string  `json:"avatar_url"`
	Gender    uint8    `json:"gender"`
	Height    *float64 `json:"height"`
	Weight    *float64 `json:"weight"`
}

func (s *UserService) GetProfile(ctx context.Context, userID uint64) (*ProfileResult, error) {
	var user model.User
	if err := s.db.WithContext(ctx).First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("find user: %w", err)
	}

	return &ProfileResult{
		ID:        user.ID,
		Username:  user.Username,
		Nickname:  user.Nickname,
		AvatarURL: user.AvatarURL,
		Gender:    user.Gender,
		Height:    user.Height,
		Weight:    user.Weight,
	}, nil
}

type UpdateProfileInput struct {
	Nickname  *string
	AvatarURL *string
	Gender    *uint8
	Height    *float64
	Weight    *float64
}

func (s *UserService) UpdateProfile(ctx context.Context, userID uint64, input UpdateProfileInput) (*ProfileResult, error) {
	var user model.User
	if err := s.db.WithContext(ctx).First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("find user: %w", err)
	}

	if input.Nickname != nil {
		user.Nickname = *input.Nickname
	}
	if input.AvatarURL != nil {
		user.AvatarURL = input.AvatarURL
	}
	if input.Gender != nil {
		user.Gender = *input.Gender
	}
	if input.Height != nil {
		user.Height = input.Height
	}
	if input.Weight != nil {
		user.Weight = input.Weight
	}

	if err := s.db.WithContext(ctx).Save(&user).Error; err != nil {
		return nil, fmt.Errorf("update user: %w", err)
	}

	return s.GetProfile(ctx, userID)
}

func (s *UserService) ChangePassword(ctx context.Context, userID uint64, oldPassword, newPassword string) error {
	if len(newPassword) < 6 {
		return ErrNewPasswordTooShort
	}

	var user model.User
	if err := s.db.WithContext(ctx).First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrUserNotFound
		}
		return fmt.Errorf("find user: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(oldPassword)); err != nil {
		return ErrOldPasswordWrong
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}

	user.PasswordHash = string(hash)
	if err := s.db.WithContext(ctx).Save(&user).Error; err != nil {
		return fmt.Errorf("update password: %w", err)
	}
	return nil
}
