package model

import "time"

type CheckIn struct {
	ID          uint64   `gorm:"primaryKey"`
	UserID      uint64   `gorm:"not null;index:idx_check_ins_user_date,priority:1;uniqueIndex:uk_check_ins_user_type_date,priority:1"`
	SportTypeID uint64   `gorm:"not null;uniqueIndex:uk_check_ins_user_type_date,priority:2"`
	CheckDate   time.Time `gorm:"type:date;not null;index:idx_check_ins_user_date,priority:2;uniqueIndex:uk_check_ins_user_type_date,priority:3"`
	Duration    uint     `gorm:"not null;default:0"`
	Distance    *float64 `gorm:"type:decimal(8,2)"`
	Calories    *uint    `gorm:"type:int unsigned"`
	Remark      *string  `gorm:"size:500"`
	IsMakeup    uint8    `gorm:"not null;default:0"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (CheckIn) TableName() string {
	return "check_ins"
}
