package admin

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

// DiscountHandler handles admin discount code operations
type DiscountHandler struct {
	db *gorm.DB
}

// NewDiscountHandler creates a new discount handler
func NewDiscountHandler(db *gorm.DB) *DiscountHandler {
	return &DiscountHandler{db: db}
}

// DiscountInput represents the input for creating/updating a discount code
type DiscountInput struct {
	Code        string     `json:"code"`
	Type        string     `json:"type"` // percentage, fixed_amount
	Value       float64    `json:"value"`
	MinPurchase float64    `json:"min_purchase"`
	MaxUses     *int       `json:"max_uses"`
	StartsAt    *time.Time `json:"starts_at"`
	ExpiresAt   *time.Time `json:"expires_at"`
	Active      bool       `json:"active"`
}

// ListDiscounts handles GET /api/admin/discounts
func (h *DiscountHandler) ListDiscounts(w http.ResponseWriter, r *http.Request) {
	var discounts []models.DiscountCode
	
	query := h.db.Model(&models.DiscountCode{})
	
	// Filter by active status
	if active := r.URL.Query().Get("active"); active != "" {
		if active == "true" {
			query = query.Where("active = ?", true)
		} else if active == "false" {
			query = query.Where("active = ?", false)
		}
	}
	
	// Filter by validity (current time)
	if valid := r.URL.Query().Get("valid"); valid == "true" {
		now := time.Now()
		query = query.Where("active = ?", true).
			Where("(starts_at IS NULL OR starts_at <= ?)", now).
			Where("(expires_at IS NULL OR expires_at >= ?)", now).
			Where("(max_uses IS NULL OR used_count < max_uses)")
	}
	
	// Filter by type
	if discountType := r.URL.Query().Get("type"); discountType != "" {
		query = query.Where("type = ?", discountType)
	}
	
	// Pagination
	page := 1
	perPage := 20
	if p := r.URL.Query().Get("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}
	if pp := r.URL.Query().Get("per_page"); pp != "" {
		if parsed, err := strconv.Atoi(pp); err == nil && parsed > 0 && parsed <= 100 {
			perPage = parsed
		}
	}
	
	var total int64
	if err := query.Count(&total).Error; err != nil {
		http.Error(w, "Failed to count discounts: "+err.Error(), http.StatusInternalServerError)
		return
	}
	
	// Order by creation date
	query = query.Order("created_at DESC").Limit(perPage).Offset((page - 1) * perPage)
	
	if err := query.Find(&discounts).Error; err != nil {
		http.Error(w, "Failed to fetch discounts: "+err.Error(), http.StatusInternalServerError)
		return
	}
	
	response := map[string]interface{}{
		"discounts": discounts,
		"total":     total,
		"page":      page,
		"per_page":  perPage,
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetDiscount handles GET /api/admin/discounts/{id}
func (h *DiscountHandler) GetDiscount(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid discount ID", http.StatusBadRequest)
		return
	}
	
	var discount models.DiscountCode
	if err := h.db.First(&discount, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Discount not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch discount: "+err.Error(), http.StatusInternalServerError)
		return
	}
	
	// Include validity status in response
	response := map[string]interface{}{
		"discount": discount,
		"is_valid": discount.IsValid(),
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// CreateDiscount handles POST /api/admin/discounts
func (h *DiscountHandler) CreateDiscount(w http.ResponseWriter, r *http.Request) {
	var input DiscountInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}
	
	// Validate required fields
	if input.Code == "" {
		http.Error(w, "Code is required", http.StatusBadRequest)
		return
	}
	if input.Type == "" {
		http.Error(w, "Type is required", http.StatusBadRequest)
		return
	}
	if input.Type != "percentage" && input.Type != "fixed_amount" {
		http.Error(w, "Type must be 'percentage' or 'fixed_amount'", http.StatusBadRequest)
		return
	}
	if input.Value <= 0 {
		http.Error(w, "Value must be greater than 0", http.StatusBadRequest)
		return
	}
	if input.Type == "percentage" && input.Value > 100 {
		http.Error(w, "Percentage value cannot exceed 100", http.StatusBadRequest)
		return
	}
	if input.MinPurchase < 0 {
		http.Error(w, "Minimum purchase cannot be negative", http.StatusBadRequest)
		return
	}
	if input.MaxUses != nil && *input.MaxUses <= 0 {
		http.Error(w, "Max uses must be greater than 0", http.StatusBadRequest)
		return
	}
	
	// Validate date range
	if input.StartsAt != nil && input.ExpiresAt != nil && input.StartsAt.After(*input.ExpiresAt) {
		http.Error(w, "Start date must be before expiration date", http.StatusBadRequest)
		return
	}
	
	// Check code uniqueness
	var existingCount int64
	if err := h.db.Model(&models.DiscountCode{}).Where("code = ?", input.Code).Count(&existingCount).Error; err != nil {
		http.Error(w, "Failed to check code uniqueness: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if existingCount > 0 {
		http.Error(w, "Discount code already exists", http.StatusConflict)
		return
	}
	
	discount := models.DiscountCode{
		Code:        input.Code,
		Type:        input.Type,
		Value:       input.Value,
		MinPurchase: input.MinPurchase,
		MaxUses:     input.MaxUses,
		StartsAt:    input.StartsAt,
		ExpiresAt:   input.ExpiresAt,
		Active:      input.Active,
		UsedCount:   0,
	}
	
	if err := h.db.Create(&discount).Error; err != nil {
		http.Error(w, "Failed to create discount: "+err.Error(), http.StatusInternalServerError)
		return
	}
	
	response := map[string]interface{}{
		"discount": discount,
		"is_valid": discount.IsValid(),
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// UpdateDiscount handles PATCH /api/admin/discounts/{id}
func (h *DiscountHandler) UpdateDiscount(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid discount ID", http.StatusBadRequest)
		return
	}
	
	var input DiscountInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}
	
	var discount models.DiscountCode
	if err := h.db.First(&discount, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Discount not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch discount: "+err.Error(), http.StatusInternalServerError)
		return
	}
	
	// Validate type and value if provided
	if input.Type != "" {
		if input.Type != "percentage" && input.Type != "fixed_amount" {
			http.Error(w, "Type must be 'percentage' or 'fixed_amount'", http.StatusBadRequest)
			return
		}
		discount.Type = input.Type
	}
	if input.Value > 0 {
		if discount.Type == "percentage" && input.Value > 100 {
			http.Error(w, "Percentage value cannot exceed 100", http.StatusBadRequest)
			return
		}
		discount.Value = input.Value
	}
	if input.MinPurchase >= 0 {
		discount.MinPurchase = input.MinPurchase
	}
	if input.MaxUses != nil {
		if *input.MaxUses <= 0 {
			http.Error(w, "Max uses must be greater than 0", http.StatusBadRequest)
			return
		}
		discount.MaxUses = input.MaxUses
	}
	
	// Validate date range if both are set
	startsAt := discount.StartsAt
	expiresAt := discount.ExpiresAt
	if input.StartsAt != nil {
		startsAt = input.StartsAt
		discount.StartsAt = input.StartsAt
	}
	if input.ExpiresAt != nil {
		expiresAt = input.ExpiresAt
		discount.ExpiresAt = input.ExpiresAt
	}
	if startsAt != nil && expiresAt != nil && startsAt.After(*expiresAt) {
		http.Error(w, "Start date must be before expiration date", http.StatusBadRequest)
		return
	}
	
	// Update code if changed
	if input.Code != "" && input.Code != discount.Code {
		var existingCount int64
		if err := h.db.Model(&models.DiscountCode{}).Where("code = ? AND id != ?", input.Code, id).Count(&existingCount).Error; err != nil {
			http.Error(w, "Failed to check code uniqueness: "+err.Error(), http.StatusInternalServerError)
			return
		}
		if existingCount > 0 {
			http.Error(w, "Discount code already exists", http.StatusConflict)
			return
		}
		discount.Code = input.Code
	}
	
	// Update active status (can be explicitly set to false)
	discount.Active = input.Active
	
	if err := h.db.Save(&discount).Error; err != nil {
		http.Error(w, "Failed to update discount: "+err.Error(), http.StatusInternalServerError)
		return
	}
	
	response := map[string]interface{}{
		"discount": discount,
		"is_valid": discount.IsValid(),
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// DeleteDiscount handles DELETE /api/admin/discounts/{id}
func (h *DiscountHandler) DeleteDiscount(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid discount ID", http.StatusBadRequest)
		return
	}
	
	var discount models.DiscountCode
	if err := h.db.First(&discount, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Discount not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch discount: "+err.Error(), http.StatusInternalServerError)
		return
	}
	
	// Check if discount has been used
	if discount.UsedCount > 0 {
		// Instead of deleting, deactivate it to preserve historical data
		discount.Active = false
		if err := h.db.Save(&discount).Error; err != nil {
			http.Error(w, "Failed to deactivate discount: "+err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message":  "Discount has been used and was deactivated instead of deleted",
			"id":       id,
			"discount": discount,
		})
		return
	}
	
	// Soft delete if never used
	if err := h.db.Delete(&discount).Error; err != nil {
		http.Error(w, "Failed to delete discount: "+err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Discount deleted successfully",
		"id":      id,
	})
}

// GetDiscountStats handles GET /api/admin/discounts/{id}/stats
func (h *DiscountHandler) GetDiscountStats(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid discount ID", http.StatusBadRequest)
		return
	}
	
	var discount models.DiscountCode
	if err := h.db.First(&discount, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Discount not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch discount: "+err.Error(), http.StatusInternalServerError)
		return
	}
	
	// Calculate statistics
	remainingUses := -1 // unlimited
	if discount.MaxUses != nil {
		remainingUses = *discount.MaxUses - discount.UsedCount
		if remainingUses < 0 {
			remainingUses = 0
		}
	}
	
	var daysUntilExpiry *int
	if discount.ExpiresAt != nil {
		days := int(time.Until(*discount.ExpiresAt).Hours() / 24)
		daysUntilExpiry = &days
	}
	
	response := map[string]interface{}{
		"discount":          discount,
		"is_valid":          discount.IsValid(),
		"used_count":        discount.UsedCount,
		"remaining_uses":    remainingUses,
		"days_until_expiry": daysUntilExpiry,
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
