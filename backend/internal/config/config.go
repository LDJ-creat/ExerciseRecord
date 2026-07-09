package config

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/viper"
)

type Config struct {
	Port      string
	DBHost    string
	DBPort    string
	DBUser    string
	DBPassword string
	DBName    string
	JWTSecret string
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
	viper.SetDefault("DB_HOST", "127.0.0.1")
	viper.SetDefault("DB_PORT", "3306")
	viper.SetDefault("DB_USER", "root")
	viper.SetDefault("DB_PASSWORD", "")
	viper.SetDefault("DB_NAME", "sport_checkin")
	viper.SetDefault("JWT_SECRET", "dev-secret")

	return &Config{
		Port:       viper.GetString("PORT"),
		DBHost:     viper.GetString("DB_HOST"),
		DBPort:     viper.GetString("DB_PORT"),
		DBUser:     viper.GetString("DB_USER"),
		DBPassword: viper.GetString("DB_PASSWORD"),
		DBName:     viper.GetString("DB_NAME"),
		JWTSecret:  viper.GetString("JWT_SECRET"),
	}
}

func (c *Config) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName)
}
