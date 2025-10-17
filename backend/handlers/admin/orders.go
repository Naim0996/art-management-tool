package admin

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/Naim0996/art-management-tool/backend/services/order"
	"github.com/gorilla/mux"
)

// OrderHandler handles admin order operations
type OrderHandler struct {
	orderService *order.Service
}

// NewOrderHandler creates a new order handler
func NewOrderHandler(orderService *order.Service) *OrderHandler {
	return &OrderHandler{
		orderService: orderService,
	}
}

// ListOrders handles GET /api/admin/orders
func (h *OrderHandler) ListOrders(w http.ResponseWriter, r *http.Request) {
	filters := order.DefaultFilters()
	
	query := r.URL.Query()
	
	if paymentStatus := query.Get("payment_status"); paymentStatus != "" {
		filters.PaymentStatus = models.PaymentStatus(paymentStatus)
	}
	
	if fulfillmentStatus := query.Get("fulfillment_status"); fulfillmentStatus != "" {
		filters.FulfillmentStatus = models.FulfillmentStatus(fulfillmentStatus)
	}
	
	if email := query.Get("customer_email"); email != "" {
		filters.CustomerEmail = email
	}
	
	if startDate := query.Get("start_date"); startDate != "" {
		if t, err := time.Parse(time.RFC3339, startDate); err == nil {
			filters.StartDate = t
		}
	}
	
	if endDate := query.Get("end_date"); endDate != "" {
		if t, err := time.Parse(time.RFC3339, endDate); err == nil {
			filters.EndDate = t
		}
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
	
	orders, total, err := h.orderService.ListOrders(filters)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	response := map[string]interface{}{
		"orders":   orders,
		"total":    total,
		"page":     filters.Page,
		"per_page": filters.PerPage,
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetOrder handles GET /api/admin/orders/{id}
func (h *OrderHandler) GetOrder(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid order ID", http.StatusBadRequest)
		return
	}
	
	order, err := h.orderService.GetOrder(uint(id))
	if err != nil {
		if err == order.ErrOrderNotFound {
			http.Error(w, "Order not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(order)
}

// UpdateFulfillmentStatus handles PATCH /api/admin/orders/{id}/fulfillment
func (h *OrderHandler) UpdateFulfillmentStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid order ID", http.StatusBadRequest)
		return
	}
	
	var req struct {
		Status models.FulfillmentStatus `json:"status"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	if err := h.orderService.UpdateFulfillmentStatus(uint(id), req.Status); err != nil {
		if err == order.ErrOrderNotFound {
			http.Error(w, "Order not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

// RefundOrder handles POST /api/admin/orders/{id}/refund
func (h *OrderHandler) RefundOrder(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid order ID", http.StatusBadRequest)
		return
	}
	
	var req struct {
		Amount *float64 `json:"amount"` // partial refund if specified
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	if err := h.orderService.RefundOrder(uint(id), req.Amount); err != nil {
		if err == order.ErrOrderNotFound {
			http.Error(w, "Order not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}
