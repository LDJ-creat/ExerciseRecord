package main

import (
	"log"

	"github.com/exercise-record/backend/internal/config"
	"github.com/exercise-record/backend/internal/database"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	if _, err := database.Connect(cfg); err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
	log.Println("DB connected")

	r := gin.Default()
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
