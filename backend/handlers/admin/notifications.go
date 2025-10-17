package admin

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/Naim0996/art-management-tool/backend/services/notification"
	"github.com/gorilla/mux"
)

// NotificationHandler handles admin notification operations
type NotificationHandler struct {
	notifService *notification.Service
}

// NewNotificationHandler creates a new notification handler
func NewNotificationHandler(notifService *notification.Service) *NotificationHandler {
	return &NotificationHandler{
		notifService: notifService,
	}
}

// ListNotifications handles GET /api/admin/notifications
func (h *NotificationHandler) ListNotifications(w http.ResponseWriter, r *http.Request) {
	filters := notification.DefaultFilters()
	
	query := r.URL.Query()
	
	if notifType := query.Get("type"); notifType != "" {
		filters.Type = models.NotificationType(notifType)
	}
	
	if severity := query.Get("severity"); severity != "" {
		filters.Severity = models.NotificationSeverity(severity)
	}
	
	if query.Get("unread") == "true" {
		filters.Unread = true
	}
	
	if page := query.Get("page"); page != "" {
		if p, err := strconv.Atoi(page); err == nil && p > 0 {
			filters.Page = p
		}
	}
	
	if perPage := query.Get("per_page"); perPage != "" {
		if pp, err := strconv.Atoi(perPage); err == nil && pp > 0 && pp <= 100 {
			filters.PerPage = pp
		}
	}
	
	notifications, total, err := h.notifService.List(filters)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	// Get unread count
	unreadCount, _ := h.notifService.GetUnreadCount()
	
	response := map[string]interface{}{
		"notifications": notifications,
		"total":         total,
		"unread_count":  unreadCount,
		"page":          filters.Page,
		"per_page":      filters.PerPage,
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetNotification handles GET /api/admin/notifications/{id}
func (h *NotificationHandler) GetNotification(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid notification ID", http.StatusBadRequest)
		return
	}
	
	notif, err := h.notifService.Get(uint(id))
	if err != nil {
		http.Error(w, "Notification not found", http.StatusNotFound)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notif)
}

// MarkAsRead handles PATCH /api/admin/notifications/{id}/read
func (h *NotificationHandler) MarkAsRead(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid notification ID", http.StatusBadRequest)
		return
	}
	
	if err := h.notifService.MarkAsRead(uint(id)); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

// MarkAllAsRead handles POST /api/admin/notifications/read-all
func (h *NotificationHandler) MarkAllAsRead(w http.ResponseWriter, r *http.Request) {
	if err := h.notifService.MarkAllAsRead(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

// Delete handles DELETE /api/admin/notifications/{id}
func (h *NotificationHandler) Delete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid notification ID", http.StatusBadRequest)
		return
	}
	
	if err := h.notifService.Delete(uint(id)); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}
