package model

import "time"

type ReminderSetting struct {
	ID         uint64    `gorm:"primaryKey"`
	UserID     uint64    `gorm:"not null;uniqueIndex"`
	IsEnabled  uint8     `gorm:"not null;default:1"`
	RemindTime string    `gorm:"type:time;not null;default:'20:00:00'"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func (ReminderSetting) TableName() string {
	return "reminder_settings"
}
