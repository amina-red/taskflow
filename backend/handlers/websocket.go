package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"taskflow/models"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

var clients = make(map[*websocket.Conn]bool)
var mu sync.Mutex

func WebSocketHandler(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket upgrade failed:", err)
		return
	}
	defer conn.Close()

	mu.Lock()
	clients[conn] = true
	mu.Unlock()

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			mu.Lock()
			delete(clients, conn)
			mu.Unlock()
			break
		}
	}
}

func BroadcastTaskUpdate(task models.Task) {
	msg, _ := json.Marshal(map[string]interface{}{
		"type": "task_update",
		"task": task,
	})
	mu.Lock()
	defer mu.Unlock()
	for conn := range clients {
		conn.WriteMessage(websocket.TextMessage, msg)
	}
}
