package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"sync"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/gorilla/mux"
)

var (
	products   = make(map[string]models.Product)
	productsMu sync.RWMutex
	productID  = 0
)

func init() {
	// Initialize with some sample products
	products["1"] = models.Product{
		ID:          "1",
		Name:        "Abstract Art Piece",
		Description: "Beautiful abstract painting",
		Price:       299.99,
		ImageURL:    "/images/art1.jpg",
		Stock:       5,
	}
	products["2"] = models.Product{
		ID:          "2",
		Name:        "Landscape Painting",
		Description: "Scenic landscape artwork",
		Price:       399.99,
		ImageURL:    "/images/art2.jpg",
		Stock:       3,
	}
}

// GetProducts returns all products for customers
func GetProducts(w http.ResponseWriter, r *http.Request) {
	productsMu.RLock()
	defer productsMu.RUnlock()

	productList := make([]models.Product, 0, len(products))
	for _, product := range products {
		productList = append(productList, product)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(productList)
}

// GetProduct returns a single product by ID
func GetProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	productsMu.RLock()
	product, exists := products[id]
	productsMu.RUnlock()

	if !exists {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

// GetAdminProducts returns all products for admin management
func GetAdminProducts(w http.ResponseWriter, r *http.Request) {
	GetProducts(w, r)
}

// CreateProduct creates a new product (admin only)
func CreateProduct(w http.ResponseWriter, r *http.Request) {
	var product models.Product
	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	productsMu.Lock()
	productID++
	product.ID = strconv.Itoa(productID) // Proper ID generation
	products[product.ID] = product
	productsMu.Unlock()
	productsMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(product)
}

// UpdateProduct updates an existing product (admin only)
func UpdateProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var product models.Product
	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	productsMu.Lock()
	if _, exists := products[id]; !exists {
		productsMu.Unlock()
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}
	product.ID = id
	products[id] = product
	productsMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

// DeleteProduct deletes a product (admin only)
func DeleteProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	productsMu.Lock()
	if _, exists := products[id]; !exists {
		productsMu.Unlock()
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}
	delete(products, id)
	productsMu.Unlock()

	w.WriteHeader(http.StatusNoContent)
}
