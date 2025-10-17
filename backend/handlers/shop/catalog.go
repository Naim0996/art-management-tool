package shop

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/Naim0996/art-management-tool/backend/services/product"
	"github.com/gorilla/mux"
)

// CatalogHandler handles public catalog operations
type CatalogHandler struct {
	productService *product.Service
}

// NewCatalogHandler creates a new catalog handler
func NewCatalogHandler(productService *product.Service) *CatalogHandler {
	return &CatalogHandler{
		productService: productService,
	}
}

// ListProducts handles GET /api/shop/products
func (h *CatalogHandler) ListProducts(w http.ResponseWriter, r *http.Request) {
	filters := product.DefaultFilters()
	
	// Parse query parameters
	query := r.URL.Query()
	
	if status := query.Get("status"); status != "" {
		filters.Status = models.ProductStatus(status)
	} else {
		filters.Status = models.ProductStatusPublished // Only show published by default
	}
	
	if categoryID := query.Get("category"); categoryID != "" {
		if id, err := strconv.ParseUint(categoryID, 10, 32); err == nil {
			filters.CategoryID = uint(id)
		}
	}
	
	if minPrice := query.Get("min_price"); minPrice != "" {
		if price, err := strconv.ParseFloat(minPrice, 64); err == nil {
			filters.MinPrice = price
		}
	}
	
	if maxPrice := query.Get("max_price"); maxPrice != "" {
		if price, err := strconv.ParseFloat(maxPrice, 64); err == nil {
			filters.MaxPrice = price
		}
	}
	
	if search := query.Get("search"); search != "" {
		filters.Search = search
	}
	
	if query.Get("in_stock") == "true" {
		filters.InStock = true
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
	
	if sortBy := query.Get("sort_by"); sortBy != "" {
		filters.SortBy = sortBy
	}
	
	if sortOrder := query.Get("sort_order"); sortOrder != "" {
		filters.SortOrder = sortOrder
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

// GetProduct handles GET /api/shop/products/{slug}
func (h *CatalogHandler) GetProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	slug := vars["slug"]
	
	product, err := h.productService.GetProductBySlug(slug)
	if err != nil {
		if err == product.ErrProductNotFound {
			http.Error(w, "Product not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	// Only show published products to public
	if product.Status != models.ProductStatusPublished {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}
