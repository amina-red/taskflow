package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"taskflow/database"

	"github.com/gin-gonic/gin"
)

type EmailPayload struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Html    string   `json:"html"`
}

func SendEmail(to, subject, html string) error {
	payload := EmailPayload{
		From:    "TaskFlow <onboarding@resend.dev>",
		To:      []string{to},
		Subject: subject,
		Html:    html,
	}
	body, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer "+os.Getenv("RESEND_API_KEY"))
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return nil
}

func StartReminderJob() {
	go func() {
		for {
			sendDueReminders()
			time.Sleep(24 * time.Hour)
		}
	}()
}

func sendDueReminders() {
	tomorrow := time.Now().Add(24 * time.Hour)
	rows, err := database.DB.Query(`
		SELECT t.title, u.email, u.name
		FROM tasks t
		JOIN users u ON t.assignee_id = u.id
		WHERE t.due_date::date = $1::date
		AND t.status != 'done'
	`, tomorrow.Format("2006-01-02"))
	if err != nil {
		return
	}
	defer rows.Close()
	for rows.Next() {
		var title, email, name string
		rows.Scan(&title, &email, &name)
		html := fmt.Sprintf(`
			<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
				<h2 style="color:#6366f1;">TaskFlow Reminder</h2>
				<p>Hi <strong>%s</strong>,</p>
				<p>This task is due <strong>tomorrow</strong>:</p>
				<div style="background:#f8fafc;border-left:4px solid #6366f1;padding:12px 16px;border-radius:4px;margin:16px 0;">
					<strong>%s</strong>
				</div>
				<p>Log in to TaskFlow to update it.</p>
				<a href="https://taskflow-amina.vercel.app" style="background:#6366f1;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:8px;">
					Open TaskFlow
				</a>
			</div>
		`, name, title)
		SendEmail(email, "Task due tomorrow: "+title, html)
	}
}

func SendTestReminder(c *gin.Context) {
	userID := c.GetInt("user_id")
	var email, name string
	database.DB.QueryRow("SELECT email, name FROM users WHERE id = $1", userID).Scan(&email, &name)
	html := fmt.Sprintf(`
		<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
			<h2 style="color:#6366f1;">TaskFlow</h2>
			<p>Hi <strong>%s</strong>, your reminders are set up correctly!</p>
			<p>You will receive email reminders for tasks due the next day.</p>
			<a href="https://taskflow-amina.vercel.app" style="background:#6366f1;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:8px;">
				Open TaskFlow
			</a>
		</div>
	`, name)
	SendEmail(email, "TaskFlow reminders activated!", html)
	c.JSON(http.StatusOK, gin.H{"message": "Test reminder sent to " + email})
}
