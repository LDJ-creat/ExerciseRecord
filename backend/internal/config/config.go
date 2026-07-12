package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	Port       string
	DBDriver   string
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	JWTSecret  string
}

func findEnvFile() string {
	if p := os.Getenv("ENV_FILE"); p != "" {
		return p
	}
	cwd, err := os.Getwd()
	if err != nil {
		return ".env"
	}
	dir := cwd
	for {
		candidates := []string{
			filepath.Join(dir, ".env"),
			filepath.Join(dir, "backend", ".env"),
		}
		for _, candidate := range candidates {
			if _, err := os.Stat(candidate); err == nil {
				return candidate
			}
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return ".env"
}

func Load() *Config {
	viper.SetConfigFile(findEnvFile())
	viper.AutomaticEnv()

	_ = viper.ReadInConfig()

	if port := os.Getenv("PORT"); port != "" {
		viper.Set("PORT", port)
	}

	viper.SetDefault("PORT", "8080")
	viper.SetDefault("DB_DRIVER", "opengauss")
	viper.SetDefault("DB_HOST", "127.0.0.1")
	viper.SetDefault("DB_PORT", "15432")
	viper.SetDefault("DB_USER", "gaussdb")
	viper.SetDefault("DB_PASSWORD", "OpenGauss@123")
	viper.SetDefault("DB_NAME", "sport_checkin")
	viper.SetDefault("JWT_SECRET", "dev-secret")

	return &Config{
		Port:       viper.GetString("PORT"),
		DBDriver:   viper.GetString("DB_DRIVER"),
		DBHost:     viper.GetString("DB_HOST"),
		DBPort:     viper.GetString("DB_PORT"),
		DBUser:     viper.GetString("DB_USER"),
		DBPassword: viper.GetString("DB_PASSWORD"),
		DBName:     viper.GetString("DB_NAME"),
		JWTSecret:  viper.GetString("JWT_SECRET"),
	}
}

func (c *Config) DSN() string {
	switch strings.ToLower(c.DBDriver) {
	case "mysql":
		return c.MySQLDSN()
	default:
		return c.OpenGaussDSN()
	}
}

func (c *Config) MySQLDSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName)
}

func (c *Config) OpenGaussDSN() string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=Asia/Shanghai",
		c.DBHost, c.DBPort, c.DBUser, c.DBPassword, c.DBName)
}

func (c *Config) OpenGaussAdminDSN() string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=postgres sslmode=disable TimeZone=Asia/Shanghai",
		c.DBHost, c.DBPort, c.DBUser, c.DBPassword)
}

// MigrationSourceConfig returns MySQL connection settings for one-off data migration.
func MigrationSourceConfig() *Config {
	viper.SetDefault("SRC_DB_HOST", "127.0.0.1")
	viper.SetDefault("SRC_DB_PORT", "3306")
	viper.SetDefault("SRC_DB_USER", "root")
	viper.SetDefault("SRC_DB_PASSWORD", "")
	viper.SetDefault("SRC_DB_NAME", "sport_checkin")

	return &Config{
		DBHost:     viper.GetString("SRC_DB_HOST"),
		DBPort:     viper.GetString("SRC_DB_PORT"),
		DBUser:     viper.GetString("SRC_DB_USER"),
		DBPassword: viper.GetString("SRC_DB_PASSWORD"),
		DBName:     viper.GetString("SRC_DB_NAME"),
	}
}

// MigrationTargetConfig returns OpenGauss connection settings for one-off data migration.
func MigrationTargetConfig() *Config {
	viper.SetDefault("DST_DB_HOST", "127.0.0.1")
	viper.SetDefault("DST_DB_PORT", "15432")
	viper.SetDefault("DST_DB_USER", "gaussdb")
	viper.SetDefault("DST_DB_PASSWORD", "OpenGauss@123")
	viper.SetDefault("DST_DB_NAME", "sport_checkin")

	return &Config{
		DBHost:     viper.GetString("DST_DB_HOST"),
		DBPort:     viper.GetString("DST_DB_PORT"),
		DBUser:     viper.GetString("DST_DB_USER"),
		DBPassword: viper.GetString("DST_DB_PASSWORD"),
		DBName:     viper.GetString("DST_DB_NAME"),
	}
}
