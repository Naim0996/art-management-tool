package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type OrdersHandler struct {
	db *gorm.DB
}

func NewOrdersHandler(db *gorm.DB) *OrdersHandler {
	return &OrdersHandler{db: db}
}

// GetOrders returns all orders with optional filters
func (h *OrdersHandler) GetOrders(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")

	var orders []models.Order
	query := h.db.Preload("Items")

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Order("created_at DESC").Find(&orders).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}

// GetOrder returns a single order by ID
func (h *OrdersHandler) GetOrder(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid order ID", http.StatusBadRequest)
		return
	}

	var order models.Order
	if err := h.db.Preload("Items").First(&order, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Order not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(order)
}

// UpdateOrderStatus updates the status of an order
func (h *OrdersHandler) UpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid order ID", http.StatusBadRequest)
		return
	}

	var input struct {
		Status string `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validate status
	validStatuses := map[string]bool{
		"pending":    true,
		"processing": true,
		"completed":  true,
		"cancelled":  true,
	}

	if !validStatuses[input.Status] {
		http.Error(w, "Invalid status", http.StatusBadRequest)
		return
	}

	var order models.Order
	if err := h.db.First(&order, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Order not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	order.PaymentStatus = models.PaymentStatus(input.Status)
	if err := h.db.Save(&order).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(order)
}

// GetOrderStats returns statistics about orders
func (h *OrdersHandler) GetOrderStats(w http.ResponseWriter, r *http.Request) {
	type Stats struct {
		TotalOrders     int64   `json:"total_orders"`
		PendingOrders   int64   `json:"pending_orders"`
		CompletedOrders int64   `json:"completed_orders"`
		TotalRevenue    float64 `json:"total_revenue"`
	}

	var stats Stats

	h.db.Model(&models.Order{}).Where("deleted_at IS NULL").Count(&stats.TotalOrders)
	h.db.Model(&models.Order{}).Where("status = ? AND deleted_at IS NULL", "pending").Count(&stats.PendingOrders)
	h.db.Model(&models.Order{}).Where("status = ? AND deleted_at IS NULL", "completed").Count(&stats.CompletedOrders)
	h.db.Model(&models.Order{}).Where("deleted_at IS NULL").Select("COALESCE(SUM(total), 0)").Scan(&stats.TotalRevenue)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
