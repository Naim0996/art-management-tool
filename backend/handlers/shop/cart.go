package shop

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Naim0996/art-management-tool/backend/services/cart"
	"github.com/gorilla/mux"
)

// CartHandler handles cart operations
type CartHandler struct {
	cartService *cart.Service
}

// NewCartHandler creates a new cart handler
func NewCartHandler(cartService *cart.Service) *CartHandler {
	return &CartHandler{
		cartService: cartService,
	}
}

// GetCart handles GET /api/shop/cart
func (h *CartHandler) GetCart(w http.ResponseWriter, r *http.Request) {
	sessionToken := h.getSessionToken(r)
	
	cart, err := h.cartService.GetOrCreateCart(sessionToken, nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	// Calculate totals
	subtotal, tax, discount, total := h.cartService.CalculateTotal(cart)
	
	response := map[string]interface{}{
		"cart":     cart,
		"subtotal": subtotal,
		"tax":      tax,
		"discount": discount,
		"total":    total,
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// AddItem handles POST /api/shop/cart/items
func (h *CartHandler) AddItem(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ProductID uint  `json:"product_id"`
		VariantID *uint `json:"variant_id"`
		Quantity  int   `json:"quantity"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	if req.Quantity <= 0 {
		http.Error(w, "Quantity must be positive", http.StatusBadRequest)
		return
	}
	
	sessionToken := h.getSessionToken(r)
	
	cart, err := h.cartService.AddItem(sessionToken, req.ProductID, req.VariantID, req.Quantity)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(cart)
}

// UpdateItem handles PATCH /api/shop/cart/items/{id}
func (h *CartHandler) UpdateItem(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	itemID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid item ID", http.StatusBadRequest)
		return
	}
	
	var req struct {
		Quantity int `json:"quantity"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	if req.Quantity < 0 {
		http.Error(w, "Quantity must be non-negative", http.StatusBadRequest)
		return
	}
	
	sessionToken := h.getSessionToken(r)
	
	cart, err := h.cartService.UpdateItemQuantity(sessionToken, uint(itemID), req.Quantity)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cart)
}

// RemoveItem handles DELETE /api/shop/cart/items/{id}
func (h *CartHandler) RemoveItem(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	itemID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid item ID", http.StatusBadRequest)
		return
	}
	
	sessionToken := h.getSessionToken(r)
	
	_, err = h.cartService.RemoveItem(sessionToken, uint(itemID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

// ClearCart handles DELETE /api/shop/cart
func (h *CartHandler) ClearCart(w http.ResponseWriter, r *http.Request) {
	sessionToken := h.getSessionToken(r)
	
	if err := h.cartService.ClearCart(sessionToken); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

// getSessionToken gets the session token from cookie or generates one
func (h *CartHandler) getSessionToken(r *http.Request) string {
	cookie, err := r.Cookie("cart_session")
	if err == nil {
		return cookie.Value
	}
	
	// Generate new token
	return cart.GenerateSessionToken()
}
