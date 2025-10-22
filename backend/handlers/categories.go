package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

// ListPublicCategories returns a handler for listing public categories
func ListPublicCategories(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var categories []models.Category
		
		query := db.Model(&models.Category{})
		
		// Optional filter by parent
		if parentID := r.URL.Query().Get("parent_id"); parentID != "" {
			if parentID == "null" || parentID == "0" {
				query = query.Where("parent_id IS NULL")
			} else if id, err := strconv.ParseUint(parentID, 10, 32); err == nil {
				query = query.Where("parent_id = ?", id)
			}
		}
		
		// Preload children if requested
		if r.URL.Query().Get("include_children") == "true" {
			query = query.Preload("Children")
		}
		
		// Order by name
		query = query.Order("name ASC")
		
		if err := query.Find(&categories).Error; err != nil {
			http.Error(w, "Failed to fetch categories", http.StatusInternalServerError)
			return
		}
		
		response := map[string]interface{}{
			"categories": categories,
			"total":      len(categories),
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}

// GetPublicCategory returns a handler for getting a single public category
func GetPublicCategory(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id, err := strconv.ParseUint(vars["id"], 10, 32)
		if err != nil {
			http.Error(w, "Invalid category ID", http.StatusBadRequest)
			return
		}
		
		var category models.Category
		query := db.Preload("Parent").Preload("Children")
		
		if err := query.First(&category, id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				http.Error(w, "Category not found", http.StatusNotFound)
				return
			}
			http.Error(w, "Failed to fetch category", http.StatusInternalServerError)
			return
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(category)
	}
}
