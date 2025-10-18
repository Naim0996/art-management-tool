package shop

import (
	"encoding/json"
	"log"
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
	_, cookieErr := r.Cookie("cart_session")
	log.Printf("📦 GetCart - Session Token: %s, Cookie exists: %v", sessionToken, cookieErr == nil)

	// Set session cookie to ensure it's always available
	h.setSessionCookie(w, sessionToken)

	cart, err := h.cartService.GetOrCreateCart(sessionToken, nil)
	if err != nil {
		log.Printf("❌ GetCart - Error getting cart: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	log.Printf("✅ GetCart - Cart ID: %d, Items: %d", cart.ID, len(cart.Items))

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
	_, cookieErr := r.Cookie("cart_session")
	log.Printf("🛒 AddItem - Session Token: %s, Cookie exists: %v, ProductID: %d, Quantity: %d",
		sessionToken, cookieErr == nil, req.ProductID, req.Quantity)

	// Set session cookie if not exists
	h.setSessionCookie(w, sessionToken)
	log.Printf("🍪 AddItem - Setting cookie with token: %s", sessionToken)

	cart, err := h.cartService.AddItem(sessionToken, req.ProductID, req.VariantID, req.Quantity)
	if err != nil {
		log.Printf("❌ AddItem - Error adding item: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	log.Printf("✅ AddItem - Cart ID: %d, Total items: %d", cart.ID, len(cart.Items))

	// Calculate totals like GetCart does
	subtotal, tax, discount, total := h.cartService.CalculateTotal(cart)

	response := map[string]interface{}{
		"cart":     cart,
		"subtotal": subtotal,
		"tax":      tax,
		"discount": discount,
		"total":    total,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
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

	// Calculate totals like GetCart does
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

// setSessionCookie sets the cart session cookie
func (h *CartHandler) setSessionCookie(w http.ResponseWriter, sessionToken string) {
	cookie := &http.Cookie{
		Name:     "cart_session",
		Value:    sessionToken,
		Path:     "/",
		MaxAge:   86400 * 7, // 7 days
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, cookie)
}
