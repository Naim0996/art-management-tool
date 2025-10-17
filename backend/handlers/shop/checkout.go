package shop

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/Naim0996/art-management-tool/backend/services/cart"
	"github.com/Naim0996/art-management-tool/backend/services/notification"
	"github.com/Naim0996/art-management-tool/backend/services/order"
	"github.com/Naim0996/art-management-tool/backend/services/payment"
	"gorm.io/gorm"
)

// CheckoutHandler handles checkout operations
type CheckoutHandler struct {
	db              *gorm.DB
	cartService     *cart.Service
	orderService    *order.Service
	paymentProvider payment.Provider
}

// NewCheckoutHandler creates a new checkout handler
func NewCheckoutHandler(db *gorm.DB, cartService *cart.Service, orderService *order.Service, paymentProvider payment.Provider) *CheckoutHandler {
	return &CheckoutHandler{
		db:              db,
		cartService:     cartService,
		orderService:    orderService,
		paymentProvider: paymentProvider,
	}
}

// ProcessCheckout handles POST /api/shop/checkout
func (h *CheckoutHandler) ProcessCheckout(w http.ResponseWriter, r *http.Request) {
	var req models.CheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	// Validate request
	if req.Email == "" || req.Name == "" {
		http.Error(w, "Email and name are required", http.StatusBadRequest)
		return
	}
	
	if req.ShippingAddress.Street == "" || req.ShippingAddress.City == "" {
		http.Error(w, "Complete shipping address is required", http.StatusBadRequest)
		return
	}
	
	// Get session token
	sessionToken := req.SessionToken
	if sessionToken == "" {
		cookie, err := r.Cookie("cart_session")
		if err != nil {
			http.Error(w, "Cart session not found", http.StatusBadRequest)
			return
		}
		sessionToken = cookie.Value
	}
	
	// Get cart
	cart, err := h.cartService.GetOrCreateCart(sessionToken, nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	if len(cart.Items) == 0 {
		http.Error(w, "Cart is empty", http.StatusBadRequest)
		return
	}
	
	// Load cart items with products and variants
	if err := h.db.Preload("Items.Product").Preload("Items.Variant").First(cart, cart.ID).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	// Validate discount code if provided
	var discountCode *models.DiscountCode
	if req.DiscountCode != "" {
		var discount models.DiscountCode
		if err := h.db.Where("code = ?", req.DiscountCode).First(&discount).Error; err == nil {
			if discount.IsValid() {
				discountCode = &discount
			} else {
				http.Error(w, "Invalid or expired discount code", http.StatusBadRequest)
				return
			}
		} else {
			http.Error(w, "Discount code not found", http.StatusBadRequest)
			return
		}
	}
	
	// Create order with payment
	order, paymentIntent, err := h.orderService.CreateOrder(cart, &req, discountCode)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	// Clear cart after successful order creation
	h.cartService.ClearCart(sessionToken)
	
	// Return response
	response := models.CheckoutResponse{
		OrderID:         fmt.Sprintf("%d", order.ID),
		OrderNumber:     order.OrderNumber,
		PaymentIntentID: paymentIntent.ID,
		ClientSecret:    paymentIntent.ClientSecret,
		Total:           order.Total,
		Status:          string(order.PaymentStatus),
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// ApplyDiscount handles POST /api/shop/cart/discount
func (h *CheckoutHandler) ApplyDiscount(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Code string `json:"code"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	if req.Code == "" {
		http.Error(w, "Code is required", http.StatusBadRequest)
		return
	}
	
	// Get discount code
	var discount models.DiscountCode
	if err := h.db.Where("code = ?", req.Code).First(&discount).Error; err != nil {
		http.Error(w, "Discount code not found", http.StatusNotFound)
		return
	}
	
	if !discount.IsValid() {
		http.Error(w, "Discount code is not valid", http.StatusBadRequest)
		return
	}
	
	// Get cart
	sessionToken := h.getSessionToken(r)
	cart, err := h.cartService.GetOrCreateCart(sessionToken, nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	// Calculate totals
	subtotal, tax, _, total := h.cartService.CalculateTotal(cart)
	discountAmount := discount.CalculateDiscount(subtotal)
	
	if discountAmount == 0 {
		http.Error(w, "Discount code cannot be applied to this order", http.StatusBadRequest)
		return
	}
	
	response := map[string]interface{}{
		"discount_code":   discount.Code,
		"discount_type":   discount.Type,
		"discount_value":  discount.Value,
		"discount_amount": discountAmount,
		"subtotal":        subtotal,
		"tax":             tax,
		"total_before":    total,
		"total_after":     total - discountAmount,
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// getSessionToken gets the session token from cookie or generates one
func (h *CheckoutHandler) getSessionToken(r *http.Request) string {
	cookie, err := r.Cookie("cart_session")
	if err == nil {
		return cookie.Value
	}
	
	return cart.GenerateSessionToken()
}
