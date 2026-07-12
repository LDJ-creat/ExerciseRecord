package database

import (
	"log"
	"strings"

	"github.com/exercise-record/backend/internal/config"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect(cfg *config.Config) (*gorm.DB, error) {
	var (
		db  *gorm.DB
		err error
	)

	switch strings.ToLower(cfg.DBDriver) {
	case "mysql":
		db, err = gorm.Open(mysql.Open(cfg.MySQLDSN()), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Warn),
		})
	default:
		db, err = gorm.Open(postgres.Open(cfg.OpenGaussDSN()), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Warn),
		})
	}
	if err != nil {
		return nil, err
	}

	// 表结构由 database/schema*.sql 管理，避免 AutoMigrate 与手工 DDL 冲突
	DB = db
	log.Printf("database connection established (%s)", cfg.DBDriver)
	return db, nil
}
