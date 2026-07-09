package database

import (
	"log"

	"github.com/exercise-record/backend/internal/config"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect(cfg *config.Config) (*gorm.DB, error) {
	db, err := gorm.Open(mysql.Open(cfg.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		return nil, err
	}

	// 表结构由 database/schema.sql 管理，避免 AutoMigrate 与手工 DDL 冲突
	DB = db
	log.Println("database connection established")
	return db, nil
}
