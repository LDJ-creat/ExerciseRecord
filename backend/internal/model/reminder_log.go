package model

import "time"

type ReminderLog struct {
	ID         uint64     `gorm:"primaryKey"`
	UserID     uint64     `gorm:"not null;index:idx_reminder_logs_user_date,priority:1"`
	RemindDate time.Time  `gorm:"type:date;not null;index:idx_reminder_logs_user_date,priority:2"`
	SentAt     *time.Time `gorm:"type:datetime"`
	Status     uint8      `gorm:"not null;default:0"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func (ReminderLog) TableName() string {
	return "reminder_logs"
}
