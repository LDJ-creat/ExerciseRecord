package model

import "time"

type User struct {
	ID           uint64    `gorm:"primaryKey"`
	Username     string    `gorm:"size:50;uniqueIndex;not null"`
	Email        *string   `gorm:"size:100;uniqueIndex"`
	PasswordHash string    `gorm:"size:255;not null"`
	Nickname     string    `gorm:"size:50;not null"`
	AvatarURL    *string   `gorm:"size:500"`
	Gender       uint8     `gorm:"not null;default:0"`
	Height       *float64  `gorm:"type:decimal(5,1)"`
	Weight       *float64  `gorm:"type:decimal(5,1)"`
	Status       uint8     `gorm:"not null;default:1"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func (User) TableName() string {
	return "users"
}
