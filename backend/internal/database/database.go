package database

import (
	"log"

	"github.com/exercise-record/backend/internal/config"
	"github.com/exercise-record/backend/internal/model"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect(cfg *config.Config) (*gorm.DB, error) {
	db, err := gorm.Open(mysql.Open(cfg.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, err
	}

	if err := db.AutoMigrate(
		&model.User{},
		&model.SportType{},
		&model.CheckIn{},
		&model.Goal{},
		&model.ReminderSetting{},
		&model.ReminderLog{},
	); err != nil {
		return nil, err
	}

	DB = db
	log.Println("database connection established")
	return db, nil
}
