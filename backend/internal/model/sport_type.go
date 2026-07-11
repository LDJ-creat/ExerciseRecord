package model

import "time"

type SportType struct {
	ID           uint64  `gorm:"primaryKey"`
	Code         string  `gorm:"size:50;uniqueIndex;not null"`
	Name         string  `gorm:"size:50;not null"`
	NeedDistance uint8   `gorm:"not null;default:0"`
	NeedCalories uint8   `gorm:"not null;default:0"`
	IsActive     uint8   `gorm:"not null;default:1"`
	SortOrder    int     `gorm:"not null;default:0"`
	UserID       *uint64 `gorm:"index"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func (SportType) TableName() string {
	return "sport_types"
}
