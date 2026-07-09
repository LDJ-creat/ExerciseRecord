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
	ErrPasswordTooShort    = errors.New("password must be at least 6 characters")
	ErrUsernameExists      = errors.New("username already exists")
	ErrInvalidCredentials  = errors.New("invalid username or password")
	ErrUserDisabled        = errors.New("user is disabled")
)

type AuthService struct {
	db *gorm.DB
}

func NewAuthService(db *gorm.DB) *AuthService {
	return &AuthService{db: db}
}

type RegisterInput struct {
	Username string
	Password string
	Nickname string
}

type RegisterResult struct {
	UserID   uint64
	Username string
}

func (s *AuthService) Register(ctx context.Context, input RegisterInput) (*RegisterResult, error) {
	if len(input.Password) < 6 {
		return nil, ErrPasswordTooShort
	}

	if input.Nickname == "" {
		input.Nickname = input.Username
	}

	var count int64
	if err := s.db.WithContext(ctx).Model(&model.User{}).
		Where("username = ?", input.Username).Count(&count).Error; err != nil {
		return nil, fmt.Errorf("check username: %w", err)
	}
	if count > 0 {
		return nil, ErrUsernameExists
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	var user model.User
	err = s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		user = model.User{
			Username:     input.Username,
			PasswordHash: string(hash),
			Nickname:     input.Nickname,
			Status:       1,
		}
		if err := tx.Create(&user).Error; err != nil {
			return err
		}

		setting := model.ReminderSetting{
			UserID:    user.ID,
			IsEnabled: 1,
		}
		// remind_time 使用数据库默认值 20:00:00
		return tx.Omit("RemindTime").Create(&setting).Error
	})
	if err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}

	return &RegisterResult{
		UserID:   user.ID,
		Username: user.Username,
	}, nil
}

type LoginInput struct {
	Username string
	Password string
}

type LoginUser struct {
	ID       uint64 `json:"id"`
	Username string `json:"username"`
	Nickname string `json:"nickname"`
}

type LoginResult struct {
	User LoginUser
}

func (s *AuthService) Login(ctx context.Context, input LoginInput) (*LoginResult, error) {
	var user model.User
	err := s.db.WithContext(ctx).Where("username = ?", input.Username).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, fmt.Errorf("find user: %w", err)
	}

	if user.Status == 0 {
		return nil, ErrUserDisabled
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	return &LoginResult{
		User: LoginUser{
			ID:       user.ID,
			Username: user.Username,
			Nickname: user.Nickname,
		},
	}, nil
}
