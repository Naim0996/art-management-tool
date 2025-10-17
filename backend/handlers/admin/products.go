package admin

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/Naim0996/art-management-tool/backend/services/product"
	"github.com/gorilla/mux"
)

// ProductHandler handles admin product operations
type ProductHandler struct {
	productService *product.Service
}

// NewProductHandler creates a new product handler
func NewProductHandler(productService *product.Service) *ProductHandler {
	return &ProductHandler{
		productService: productService,
	}
}

// ListProducts handles GET /api/admin/products
func (h *ProductHandler) ListProducts(w http.ResponseWriter, r *http.Request) {
	filters := product.DefaultFilters()
	
	// Parse query parameters (allow listing all statuses for admin)
	query := r.URL.Query()
	
	if status := query.Get("status"); status != "" {
		filters.Status = models.ProductStatus(status)
	}
	
	if categoryID := query.Get("category"); categoryID != "" {
		if id, err := strconv.ParseUint(categoryID, 10, 32); err == nil {
			filters.CategoryID = uint(id)
		}
	}
	
	if search := query.Get("search"); search != "" {
		filters.Search = search
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
	
	products, total, err := h.productService.ListProducts(filters)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	response := map[string]interface{}{
		"products": products,
		"total":    total,
		"page":     filters.Page,
		"per_page": filters.PerPage,
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetProduct handles GET /api/admin/products/{id}
func (h *ProductHandler) GetProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid product ID", http.StatusBadRequest)
		return
	}
	
	product, err := h.productService.GetProduct(uint(id))
	if err != nil {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

// CreateProduct handles POST /api/admin/products
func (h *ProductHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	var product models.EnhancedProduct
	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	// Validate required fields
	if product.Title == "" || product.Slug == "" {
		http.Error(w, "Title and slug are required", http.StatusBadRequest)
		return
	}
	
	if err := h.productService.CreateProduct(&product); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(product)
}

// UpdateProduct handles PATCH /api/admin/products/{id}
func (h *ProductHandler) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid product ID", http.StatusBadRequest)
		return
	}
	
	var updates models.EnhancedProduct
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	if err := h.productService.UpdateProduct(uint(id), &updates); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

// DeleteProduct handles DELETE /api/admin/products/{id}
func (h *ProductHandler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid product ID", http.StatusBadRequest)
		return
	}
	
	if err := h.productService.DeleteProduct(uint(id)); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

// AddVariant handles POST /api/admin/products/{id}/variants
func (h *ProductHandler) AddVariant(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	productID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid product ID", http.StatusBadRequest)
		return
	}
	
	var variant models.ProductVariant
	if err := json.NewDecoder(r.Body).Decode(&variant); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	if variant.SKU == "" || variant.Name == "" {
		http.Error(w, "SKU and name are required", http.StatusBadRequest)
		return
	}
	
	if err := h.productService.AddVariant(uint(productID), &variant); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(variant)
}

// UpdateVariant handles PATCH /api/admin/variants/{id}
func (h *ProductHandler) UpdateVariant(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid variant ID", http.StatusBadRequest)
		return
	}
	
	var updates models.ProductVariant
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	if err := h.productService.UpdateVariant(uint(id), &updates); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

// UpdateInventory handles POST /api/admin/inventory/adjust
func (h *ProductHandler) UpdateInventory(w http.ResponseWriter, r *http.Request) {
	var req struct {
		VariantID uint   `json:"variant_id"`
		Quantity  int    `json:"quantity"`
		Operation string `json:"operation"` // set, add, subtract
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	validOperations := map[string]bool{"set": true, "add": true, "subtract": true}
	if !validOperations[req.Operation] {
		http.Error(w, "Invalid operation. Must be set, add, or subtract", http.StatusBadRequest)
		return
	}
	
	if err := h.productService.UpdateInventory(req.VariantID, req.Quantity, req.Operation); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}
