package model

import "time"

type Goal struct {
	ID          uint64    `gorm:"primaryKey"`
	UserID      uint64    `gorm:"not null;uniqueIndex:uk_goals_user_period,priority:1;index:idx_goals_user_status,priority:1"`
	PeriodType  uint8     `gorm:"not null;uniqueIndex:uk_goals_user_period,priority:2"`
	TargetType  uint8     `gorm:"not null"`
	TargetValue float64   `gorm:"type:decimal(10,2);not null"`
	PeriodStart time.Time `gorm:"type:date;not null;uniqueIndex:uk_goals_user_period,priority:3"`
	PeriodEnd   time.Time `gorm:"type:date;not null"`
	Status      uint8     `gorm:"not null;default:0;index:idx_goals_user_status,priority:2"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (Goal) TableName() string {
	return "goals"
}
