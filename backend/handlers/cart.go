package handlers

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/gorilla/mux"
)

var (
	carts   = make(map[string]models.Cart)
	cartsMu sync.RWMutex
)

// AddToCart adds a product to the cart
func AddToCart(w http.ResponseWriter, r *http.Request) {
	var item models.CartItem
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get or create cart (using session ID or user ID in real app)
	cartID := "default-cart"
	
	cartsMu.Lock()
	cart, exists := carts[cartID]
	if !exists {
		cart = models.Cart{
			ID:    cartID,
			Items: []models.CartItem{},
		}
	}
	
	// Add or update item in cart
	found := false
	for i, existingItem := range cart.Items {
		if existingItem.ProductID == item.ProductID {
			cart.Items[i].Quantity += item.Quantity
			found = true
			break
		}
	}
	if !found {
		cart.Items = append(cart.Items, item)
	}
	
	carts[cartID] = cart
	cartsMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cart)
}

// GetCart returns the current cart
func GetCart(w http.ResponseWriter, r *http.Request) {
	cartID := "default-cart"
	
	cartsMu.RLock()
	cart, exists := carts[cartID]
	cartsMu.RUnlock()

	if !exists {
		cart = models.Cart{
			ID:    cartID,
			Items: []models.CartItem{},
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cart)
}

// RemoveFromCart removes an item from the cart
func RemoveFromCart(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	productID := vars["id"]
	cartID := "default-cart"

	cartsMu.Lock()
	defer cartsMu.Unlock()

	cart, exists := carts[cartID]
	if !exists {
		http.Error(w, "Cart not found", http.StatusNotFound)
		return
	}

	// Remove item from cart
	newItems := []models.CartItem{}
	for _, item := range cart.Items {
		if item.ProductID != productID {
			newItems = append(newItems, item)
		}
	}
	cart.Items = newItems
	carts[cartID] = cart

	w.WriteHeader(http.StatusNoContent)
}
