package handlers

import (
	"net/http"
	"strconv"

	"taskflow/database"
	"taskflow/models"

	"github.com/gin-gonic/gin"
)

func GetProjects(c *gin.Context) {
	userID := c.GetInt("user_id")
	rows, err := database.DB.Query(
		"SELECT id, name, color, owner_id FROM projects WHERE owner_id = $1 ORDER BY created_at DESC",
		userID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
		return
	}
	defer rows.Close()

	var projects []models.Project
	for rows.Next() {
		var p models.Project
		rows.Scan(&p.ID, &p.Name, &p.Color, &p.OwnerID)
		projects = append(projects, p)
	}
	c.JSON(http.StatusOK, projects)
}

func CreateProject(c *gin.Context) {
	userID := c.GetInt("user_id")
	var body struct {
		Name  string `json:"name"`
		Color string `json:"color"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	if body.Color == "" {
		body.Color = "#6366f1"
	}

	var p models.Project
	database.DB.QueryRow(
		"INSERT INTO projects (name, color, owner_id) VALUES ($1, $2, $3) RETURNING id, name, color, owner_id",
		body.Name, body.Color, userID,
	).Scan(&p.ID, &p.Name, &p.Color, &p.OwnerID)

	c.JSON(http.StatusCreated, p)
}

func GetTasks(c *gin.Context) {
	projectID := c.Param("id")
	rows, err := database.DB.Query(
		"SELECT id, title, description, status, priority, project_id FROM tasks WHERE project_id = $1 ORDER BY created_at DESC",
		projectID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tasks"})
		return
	}
	defer rows.Close()

	var tasks []models.Task
	for rows.Next() {
		var t models.Task
		rows.Scan(&t.ID, &t.Title, &t.Description, &t.Status, &t.Priority, &t.ProjectID)
		tasks = append(tasks, t)
	}
	c.JSON(http.StatusOK, tasks)
}

func CreateTask(c *gin.Context) {
	projectID, _ := strconv.Atoi(c.Param("id"))
	var body struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Priority    string `json:"priority"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	if body.Priority == "" {
		body.Priority = "medium"
	}

	var t models.Task
	database.DB.QueryRow(
		"INSERT INTO tasks (title, description, status, priority, project_id) VALUES ($1, $2, 'backlog', $3, $4) RETURNING id, title, description, status, priority, project_id",
		body.Title, body.Description, body.Priority, projectID,
	).Scan(&t.ID, &t.Title, &t.Description, &t.Status, &t.Priority, &t.ProjectID)

	BroadcastTaskUpdate(t)
	c.JSON(http.StatusCreated, t)
}

func UpdateTask(c *gin.Context) {
	taskID := c.Param("id")
	var body struct {
		Title    string `json:"title"`
		Status   string `json:"status"`
		Priority string `json:"priority"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var t models.Task
	database.DB.QueryRow(
		"UPDATE tasks SET title = COALESCE(NULLIF($1,''), title), status = COALESCE(NULLIF($2,''), status), priority = COALESCE(NULLIF($3,''), priority) WHERE id = $4 RETURNING id, title, description, status, priority, project_id",
		body.Title, body.Status, body.Priority, taskID,
	).Scan(&t.ID, &t.Title, &t.Description, &t.Status, &t.Priority, &t.ProjectID)

	BroadcastTaskUpdate(t)
	c.JSON(http.StatusOK, t)
}

func DeleteTask(c *gin.Context) {
	taskID := c.Param("id")
	database.DB.Exec("DELETE FROM tasks WHERE id = $1", taskID)
	c.JSON(http.StatusOK, gin.H{"message": "Task deleted"})
}
