package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/exercise-record/backend/internal/model"
	"gorm.io/gorm"
)

var (
	ErrSportNameRequired  = errors.New("sport type name required")
	ErrSportNameTooLong   = errors.New("sport type name too long")
	ErrDuplicateSportName = errors.New("duplicate custom sport type name")
	ErrCustomSportLimit   = errors.New("custom sport type limit reached")
)

const maxCustomSportTypes = 20

type SportService struct {
	db *gorm.DB
}

func NewSportService(db *gorm.DB) *SportService {
	return &SportService{db: db}
}

type SportTypeResult struct {
	ID           uint64 `json:"id"`
	Code         string `json:"code"`
	Name         string `json:"name"`
	NeedDistance uint8  `json:"need_distance"`
	NeedCalories uint8  `json:"need_calories"`
	IsCustom     uint8  `json:"is_custom"`
}

type CreateCustomSportTypeInput struct {
	Name         string
	NeedDistance bool
	NeedCalories bool
}

func (s *SportService) ListForUser(ctx context.Context, userID uint64) ([]SportTypeResult, error) {
	var types []model.SportType
	if err := s.db.WithContext(ctx).
		Where("is_active = 1 AND (user_id IS NULL OR user_id = ?)", userID).
		Order("CASE WHEN user_id IS NULL THEN 0 ELSE 1 END ASC, sort_order ASC, id ASC").
		Find(&types).Error; err != nil {
		return nil, err
	}

	items := make([]SportTypeResult, len(types))
	for i, st := range types {
		items[i] = toSportTypeResult(st)
	}
	return items, nil
}

func (s *SportService) CreateCustom(ctx context.Context, userID uint64, input CreateCustomSportTypeInput) (*SportTypeResult, error) {
	name := strings.TrimSpace(input.Name)
	if name == "" {
		return nil, ErrSportNameRequired
	}
	if utf8.RuneCountInString(name) > 20 {
		return nil, ErrSportNameTooLong
	}

	var existing int64
	if err := s.db.WithContext(ctx).Model(&model.SportType{}).
		Where("user_id = ? AND is_active = 1 AND name = ?", userID, name).
		Count(&existing).Error; err != nil {
		return nil, err
	}
	if existing > 0 {
		return nil, ErrDuplicateSportName
	}

	var customCount int64
	if err := s.db.WithContext(ctx).Model(&model.SportType{}).
		Where("user_id = ? AND is_active = 1", userID).
		Count(&customCount).Error; err != nil {
		return nil, err
	}
	if customCount >= maxCustomSportTypes {
		return nil, ErrCustomSportLimit
	}

	needDistance := uint8(0)
	if input.NeedDistance {
		needDistance = 1
	}
	needCalories := uint8(0)
	if input.NeedCalories {
		needCalories = 1
	}

	record := model.SportType{
		Code:         fmt.Sprintf("custom_%d_%d", userID, time.Now().UnixNano()),
		Name:         name,
		NeedDistance: needDistance,
		NeedCalories: needCalories,
		IsActive:     1,
		SortOrder:    1000 + int(customCount),
		UserID:       &userID,
	}

	if err := s.db.WithContext(ctx).Create(&record).Error; err != nil {
		return nil, fmt.Errorf("create custom sport type: %w", err)
	}

	result := toSportTypeResult(record)
	return &result, nil
}

func toSportTypeResult(st model.SportType) SportTypeResult {
	isCustom := uint8(0)
	if st.UserID != nil {
		isCustom = 1
	}
	return SportTypeResult{
		ID:           st.ID,
		Code:         st.Code,
		Name:         st.Name,
		NeedDistance: st.NeedDistance,
		NeedCalories: st.NeedCalories,
		IsCustom:     isCustom,
	}
}

func (s *SportService) IsAllowedForUser(ctx context.Context, userID, sportTypeID uint64) (bool, error) {
	var count int64
	if err := s.db.WithContext(ctx).Model(&model.SportType{}).
		Where("id = ? AND is_active = 1 AND (user_id IS NULL OR user_id = ?)", sportTypeID, userID).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}
