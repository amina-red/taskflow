package main

import (
	"log"
	"os"

	"taskflow/database"
	"taskflow/handlers"
	"taskflow/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	database.Connect()
	database.Migrate()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "https://taskflow-amina.vercel.app"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		api.POST("/auth/register", handlers.Register)
		api.POST("/auth/login", handlers.Login)

		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/projects", handlers.GetProjects)
			protected.POST("/projects", handlers.CreateProject)
			protected.GET("/projects/:id/tasks", handlers.GetTasks)
			protected.POST("/projects/:id/tasks", handlers.CreateTask)
			protected.PUT("/tasks/:id", handlers.UpdateTask)
			protected.DELETE("/tasks/:id", handlers.DeleteTask)
		}
	}

	r.GET("/ws", middleware.AuthMiddleware(), handlers.WebSocketHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server running on port %s", port)
	r.Run(":" + port)
}
