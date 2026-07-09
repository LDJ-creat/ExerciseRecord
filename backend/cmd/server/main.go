package main

import (
	"log"

	"github.com/exercise-record/backend/internal/config"
	"github.com/exercise-record/backend/internal/database"
	"github.com/exercise-record/backend/internal/handler"
	"github.com/exercise-record/backend/internal/middleware"
	"github.com/exercise-record/backend/internal/service"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
	log.Println("DB connected")

	authService := service.NewAuthService(db)
	userService := service.NewUserService(db)
	checkInService := service.NewCheckInService(db)
	authHandler := handler.NewAuthHandler(authService, cfg.JWTSecret)
	userHandler := handler.NewUserHandler(userService)
	sportHandler := handler.NewSportHandler(db)
	checkInHandler := handler.NewCheckInHandler(checkInService)

	r := gin.Default()
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		user := api.Group("/user")
		user.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			user.GET("/profile", userHandler.GetProfile)
			user.PUT("/profile", userHandler.UpdateProfile)
			user.PUT("/password", userHandler.ChangePassword)
		}

		api.GET("/sport-types", middleware.AuthMiddleware(cfg.JWTSecret), sportHandler.List)

		checkin := api.Group("/checkin")
		checkin.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			checkin.POST("", checkInHandler.Create)
			checkin.GET("/list", checkInHandler.List)
			checkin.GET("/:id", checkInHandler.Get)
			checkin.PUT("/:id", checkInHandler.Update)
			checkin.DELETE("/:id", checkInHandler.Delete)
		}
	}

	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
