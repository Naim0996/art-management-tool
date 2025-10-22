package admin

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

// CategoryHandler handles admin category operations
type CategoryHandler struct {
	db *gorm.DB
}

// NewCategoryHandler creates a new category handler
func NewCategoryHandler(db *gorm.DB) *CategoryHandler {
	return &CategoryHandler{db: db}
}

// CategoryInput represents the input for creating/updating a category
type CategoryInput struct {
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
	ParentID    *uint  `json:"parent_id"`
}

// ListCategories handles GET /api/admin/categories
func (h *CategoryHandler) ListCategories(w http.ResponseWriter, r *http.Request) {
	var categories []models.Category
	
	query := h.db.Model(&models.Category{})
	
	// Optional filter by parent
	if parentID := r.URL.Query().Get("parent_id"); parentID != "" {
		if parentID == "null" || parentID == "0" {
			query = query.Where("parent_id IS NULL")
		} else if id, err := strconv.ParseUint(parentID, 10, 32); err == nil {
			query = query.Where("parent_id = ?", id)
		}
	}
	
	// Preload relationships
	if r.URL.Query().Get("include_children") == "true" {
		query = query.Preload("Children")
	}
	if r.URL.Query().Get("include_parent") == "true" {
		query = query.Preload("Parent")
	}
	
	// Order by name
	query = query.Order("name ASC")
	
	if err := query.Find(&categories).Error; err != nil {
		http.Error(w, "Failed to fetch categories: "+err.Error(), http.StatusInternalServerError)
		return
	}
	
	response := map[string]interface{}{
		"categories": categories,
		"total":      len(categories),
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetCategory handles GET /api/admin/categories/{id}
func (h *CategoryHandler) GetCategory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid category ID", http.StatusBadRequest)
		return
	}
	
	var category models.Category
	query := h.db.Preload("Parent").Preload("Children")
	
	if err := query.First(&category, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Category not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch category: "+err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(category)
}

// CreateCategory handles POST /api/admin/categories
func (h *CategoryHandler) CreateCategory(w http.ResponseWriter, r *http.Request) {
	var input CategoryInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}
	
	// Validate required fields
	if input.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}
	if input.Slug == "" {
		http.Error(w, "Slug is required", http.StatusBadRequest)
		return
	}
	
	// Validate parent exists if provided
	if input.ParentID != nil && *input.ParentID > 0 {
		var parent models.Category
		if err := h.db.First(&parent, *input.ParentID).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				http.Error(w, "Parent category not found", http.StatusBadRequest)
				return
			}
			http.Error(w, "Failed to validate parent category: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}
	
	// Check slug uniqueness
	var existingCount int64
	if err := h.db.Model(&models.Category{}).Where("slug = ?", input.Slug).Count(&existingCount).Error; err != nil {
		http.Error(w, "Failed to check slug uniqueness: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if existingCount > 0 {
		http.Error(w, "Category with this slug already exists", http.StatusConflict)
		return
	}
	
	category := models.Category{
		Name:        input.Name,
		Slug:        input.Slug,
		Description: input.Description,
		ParentID:    input.ParentID,
	}
	
	if err := h.db.Create(&category).Error; err != nil {
		http.Error(w, "Failed to create category: "+err.Error(), http.StatusInternalServerError)
		return
	}
	
	// Reload with relationships
	h.db.Preload("Parent").First(&category, category.ID)
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(category)
}

// UpdateCategory handles PATCH /api/admin/categories/{id}
func (h *CategoryHandler) UpdateCategory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid category ID", http.StatusBadRequest)
		return
	}
	
	var input CategoryInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}
	
	var category models.Category
	if err := h.db.First(&category, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Category not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch category: "+err.Error(), http.StatusInternalServerError)
		return
	}
	
	// Validate parent exists if provided and prevent circular reference
	if input.ParentID != nil {
		if *input.ParentID == uint(id) {
			http.Error(w, "Category cannot be its own parent", http.StatusBadRequest)
			return
		}
		if *input.ParentID > 0 {
			var parent models.Category
			if err := h.db.First(&parent, *input.ParentID).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					http.Error(w, "Parent category not found", http.StatusBadRequest)
					return
				}
				http.Error(w, "Failed to validate parent category: "+err.Error(), http.StatusInternalServerError)
				return
			}
			// Check if parent would create a circular reference
			if parent.ParentID != nil && *parent.ParentID == uint(id) {
				http.Error(w, "Circular parent reference not allowed", http.StatusBadRequest)
				return
			}
		}
	}
	
	// Check slug uniqueness if changed
	if input.Slug != "" && input.Slug != category.Slug {
		var existingCount int64
		if err := h.db.Model(&models.Category{}).Where("slug = ? AND id != ?", input.Slug, id).Count(&existingCount).Error; err != nil {
			http.Error(w, "Failed to check slug uniqueness: "+err.Error(), http.StatusInternalServerError)
			return
		}
		if existingCount > 0 {
			http.Error(w, "Category with this slug already exists", http.StatusConflict)
			return
		}
		category.Slug = input.Slug
	}
	
	// Update fields
	if input.Name != "" {
		category.Name = input.Name
	}
	if input.Description != "" || r.URL.Query().Get("clear_description") == "true" {
		category.Description = input.Description
	}
	category.ParentID = input.ParentID
	
	if err := h.db.Save(&category).Error; err != nil {
		http.Error(w, "Failed to update category: "+err.Error(), http.StatusInternalServerError)
		return
	}
	
	// Reload with relationships
	h.db.Preload("Parent").Preload("Children").First(&category, category.ID)
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(category)
}

// DeleteCategory handles DELETE /api/admin/categories/{id}
func (h *CategoryHandler) DeleteCategory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid category ID", http.StatusBadRequest)
		return
	}
	
	var category models.Category
	if err := h.db.First(&category, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Category not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch category: "+err.Error(), http.StatusInternalServerError)
		return
	}
	
	// Check if category has children
	var childCount int64
	if err := h.db.Model(&models.Category{}).Where("parent_id = ?", id).Count(&childCount).Error; err != nil {
		http.Error(w, "Failed to check for child categories: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if childCount > 0 {
		http.Error(w, "Cannot delete category with child categories. Delete or reassign children first.", http.StatusConflict)
		return
	}
	
	// Check if category is used by products
	var productCount int64
	if err := h.db.Table("product_categories").Where("category_id = ?", id).Count(&productCount).Error; err != nil {
		http.Error(w, "Failed to check for associated products: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if productCount > 0 {
		http.Error(w, "Cannot delete category with associated products. Remove category from products first.", http.StatusConflict)
		return
	}
	
	// Soft delete
	if err := h.db.Delete(&category).Error; err != nil {
		http.Error(w, "Failed to delete category: "+err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Category deleted successfully",
		"id":      id,
	})
}
