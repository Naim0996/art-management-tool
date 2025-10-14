package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/Naim0996/art-management-tool/backend/models"
)

// Checkout processes the checkout with payment
func Checkout(w http.ResponseWriter, r *http.Request) {
	var req models.CheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate payment method
	validPaymentMethods := map[models.PaymentMethod]bool{
		models.PaymentMethodCreditCard: true,
		models.PaymentMethodPayPal:     true,
		models.PaymentMethodStripe:     true,
	}

	if !validPaymentMethods[req.PaymentMethod] {
		http.Error(w, "Invalid payment method", http.StatusBadRequest)
		return
	}

	// Get cart
	cartsMu.RLock()
	cart, exists := carts[req.CartID]
	cartsMu.RUnlock()

	if !exists || len(cart.Items) == 0 {
		http.Error(w, "Cart is empty", http.StatusBadRequest)
		return
	}

	// Calculate total
	var total float64
	productsMu.RLock()
	for _, item := range cart.Items {
		if product, exists := products[item.ProductID]; exists {
			total += product.Price * float64(item.Quantity)
		}
	}
	productsMu.RUnlock()

	// Process payment (simulate)
	// In a real application, integrate with payment gateway

	// Generate order ID
	orderID := fmt.Sprintf("ORDER-%d", time.Now().Unix())

	// Clear cart after successful checkout
	cartsMu.Lock()
	delete(carts, req.CartID)
	cartsMu.Unlock()

	response := models.CheckoutResponse{
		OrderID: orderID,
		Total:   total,
		Status:  "completed",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
