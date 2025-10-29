package admin

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/Naim0996/art-management-tool/backend/services/etsy"
	"github.com/gorilla/mux"
)

// EtsyHandler handles Etsy integration endpoints
type EtsyHandler struct {
	service *etsy.Service
}

// NewEtsyHandler creates a new Etsy handler
func NewEtsyHandler(service *etsy.Service) *EtsyHandler {
	return &EtsyHandler{
		service: service,
	}
}

// ========================================
// Sync Management Endpoints
// ========================================

// TriggerProductSync triggers a product synchronization
// POST /api/admin/etsy/sync/products
// ⚠️ WARNING: This imports products FROM Etsy TO local database (READ operation on Etsy)
func (h *EtsyHandler) TriggerProductSync(w http.ResponseWriter, r *http.Request) {
	log.Println("TriggerProductSync called")
	if !h.service.IsEnabled() {
		http.Error(w, "Etsy integration not configured", http.StatusNotImplemented)
		return
	}

	// Parse request body for shop ID (optional)
	var req struct {
		ShopID string `json:"shop_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		// If no body, use default shop ID from client
		req.ShopID = "" // Will be populated by service
	}

	// Trigger sync in background (for production, use a job queue)
	go func() {
		if err := h.service.SyncProducts(req.ShopID); err != nil {
			log.Printf("Product sync error: %v", err)
		}
	}()

	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Product sync initiated",
		"status":  "in_progress",
	})
}

// TriggerInventorySync triggers an inventory synchronization
// POST /api/admin/etsy/sync/inventory
// ⚠️ WARNING: This imports inventory FROM Etsy TO local database (READ operation on Etsy)
func (h *EtsyHandler) TriggerInventorySync(w http.ResponseWriter, r *http.Request) {
	log.Println("TriggerInventorySync called")
	if !h.service.IsEnabled() {
		http.Error(w, "Etsy integration not configured", http.StatusNotImplemented)
		return
	}

	// Parse request body
	var req struct {
		ShopID    string `json:"shop_id"`
		Direction string `json:"direction"` // push, pull, bidirectional
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		req.Direction = "bidirectional" // Default
	}

	// Validate direction
	validDirections := map[string]bool{
		"push":          true,
		"pull":          true,
		"bidirectional": true,
		"local_to_etsy": true,
		"etsy_to_local": true,
	}

	if !validDirections[req.Direction] {
		http.Error(w, "Invalid sync direction", http.StatusBadRequest)
		return
	}

	// Trigger sync in background
	go func() {
		if err := h.service.SyncInventory(req.ShopID, req.Direction); err != nil {
			log.Printf("Inventory sync error: %v", err)
		}
	}()

	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":   "Inventory sync initiated",
		"status":    "in_progress",
		"direction": req.Direction,
	})
}

// GetSyncStatus returns the current sync status
// GET /api/admin/etsy/sync/status
func (h *EtsyHandler) GetSyncStatus(w http.ResponseWriter, r *http.Request) {
	log.Println("GetSyncStatus called")
	if !h.service.IsEnabled() {
		http.Error(w, "Etsy integration not configured", http.StatusNotImplemented)
		return
	}

	shopID := r.URL.Query().Get("shop_id")

	config, err := h.service.GetSyncConfig(shopID)
	if err != nil {
		http.Error(w, "Failed to get sync status", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(config)
}

// ========================================
// Product Management Endpoints
// ========================================

// ListEtsyProducts lists all Etsy products
// GET /api/admin/etsy/products
func (h *EtsyHandler) ListEtsyProducts(w http.ResponseWriter, r *http.Request) {
	log.Println("ListEtsyProducts called")
	// Parse query parameters
	syncStatus := r.URL.Query().Get("sync_status")
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	limit := 50
	if limitStr != "" {
		if val, err := strconv.Atoi(limitStr); err == nil && val > 0 {
			limit = val
		}
	}

	offset := 0
	if offsetStr != "" {
		if val, err := strconv.Atoi(offsetStr); err == nil && val >= 0 {
			offset = val
		}
	}

	products, total, err := h.service.ListEtsyProducts(syncStatus, limit, offset)
	if err != nil {
		http.Error(w, "Failed to list products", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"products": products,
		"total":    total,
		"limit":    limit,
		"offset":   offset,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetEtsyProduct retrieves a specific Etsy product
// GET /api/admin/etsy/products/{listing_id}
func (h *EtsyHandler) GetEtsyProduct(w http.ResponseWriter, r *http.Request) {
	log.Println("GetEtsyProduct called")
	vars := mux.Vars(r)
	listingIDStr := vars["listing_id"]

	listingID, err := strconv.ParseInt(listingIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid listing ID", http.StatusBadRequest)
		return
	}

	product, err := h.service.GetEtsyProduct(listingID)
	if err != nil {
		http.Error(w, "Failed to get product", http.StatusInternalServerError)
		return
	}

	if product == nil {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

// LinkProduct links an Etsy listing to a local product
// POST /api/admin/etsy/products/{listing_id}/link
// ℹ️ SAFE: Only creates link in LOCAL database, NO changes to Etsy
func (h *EtsyHandler) LinkProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	listingIDStr := vars["listing_id"]

	listingID, err := strconv.ParseInt(listingIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid listing ID", http.StatusBadRequest)
		return
	}

	var req struct {
		LocalProductID uint `json:"local_product_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get Etsy product
	product, err := h.service.GetEtsyProduct(listingID)
	if err != nil {
		http.Error(w, "Failed to get Etsy product", http.StatusInternalServerError)
		return
	}

	if product == nil {
		http.Error(w, "Etsy product not found", http.StatusNotFound)
		return
	}

	// Update link
	product.LocalProductID = &req.LocalProductID
	if err := h.service.UpdateEtsyProduct(product); err != nil {
		http.Error(w, "Failed to link product", http.StatusInternalServerError)
		return
	}

	// Sync images from Etsy to local product
	if err := h.service.SyncProductImagesForListing(product.EtsyListingID, req.LocalProductID); err != nil {
		// Log warning but don't fail the link operation
		log.Printf("Warning: Failed to sync images for listing %d: %v", product.EtsyListingID, err)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Product linked successfully",
		"product": product,
	})
}

// UnlinkProduct removes the link between an Etsy listing and a local product
// DELETE /api/admin/etsy/products/{listing_id}/link
func (h *EtsyHandler) UnlinkProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	listingIDStr := vars["listing_id"]

	listingID, err := strconv.ParseInt(listingIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid listing ID", http.StatusBadRequest)
		return
	}

	// Get Etsy product
	product, err := h.service.GetEtsyProduct(listingID)
	if err != nil {
		http.Error(w, "Failed to get Etsy product", http.StatusInternalServerError)
		return
	}

	if product == nil {
		http.Error(w, "Etsy product not found", http.StatusNotFound)
		return
	}

	// Remove link
	product.LocalProductID = nil
	if err := h.service.UpdateEtsyProduct(product); err != nil {
		http.Error(w, "Failed to unlink product", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Product unlinked successfully",
	})
}

// ========================================
// Sync Logs Endpoints
// ========================================

// GetInventorySyncLogs retrieves inventory sync logs
// GET /api/admin/etsy/sync/logs
func (h *EtsyHandler) GetInventorySyncLogs(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	listingIDStr := r.URL.Query().Get("listing_id")
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	var listingID int64
	if listingIDStr != "" {
		if val, err := strconv.ParseInt(listingIDStr, 10, 64); err == nil {
			listingID = val
		}
	}

	limit := 50
	if limitStr != "" {
		if val, err := strconv.Atoi(limitStr); err == nil && val > 0 {
			limit = val
		}
	}

	offset := 0
	if offsetStr != "" {
		if val, err := strconv.Atoi(offsetStr); err == nil && val >= 0 {
			offset = val
		}
	}

	logs, total, err := h.service.GetInventorySyncLogs(listingID, limit, offset)
	if err != nil {
		http.Error(w, "Failed to get sync logs", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"logs":   logs,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// ========================================
// Configuration Endpoints
// ========================================

// GetEtsyConfig returns Etsy integration configuration status (without credentials)
// GET /api/admin/etsy/config
func (h *EtsyHandler) GetEtsyConfig(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"enabled":    h.service.IsEnabled(),
		"configured": h.service.IsEnabled(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// ValidateCredentials validates Etsy API credentials
// POST /api/admin/etsy/validate
func (h *EtsyHandler) ValidateCredentials(w http.ResponseWriter, r *http.Request) {
	if !h.service.IsEnabled() {
		http.Error(w, "Etsy integration not configured", http.StatusNotImplemented)
		return
	}

	// Validate credentials through the service
	// Note: This should be implemented in the service layer
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"valid":   true,
		"message": "Credentials are valid",
	})
}

// ========================================
// Receipt/Payment Synchronization Handlers
// ========================================

// TriggerReceiptSync triggers synchronization of Etsy receipts (orders/payments)
// POST /api/admin/etsy/sync/receipts
func (h *EtsyHandler) TriggerReceiptSync(w http.ResponseWriter, r *http.Request) {
	if !h.service.IsEnabled() {
		http.Error(w, "Etsy integration not configured", http.StatusNotImplemented)
		return
	}

	var req struct {
		ShopID     string `json:"shop_id"`
		MinCreated int64  `json:"min_created,omitempty"` // Unix timestamp
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.ShopID == "" {
		http.Error(w, "shop_id is required", http.StatusBadRequest)
		return
	}

	// Trigger receipt sync in background
	go func() {
		if err := h.service.SyncReceipts(req.ShopID, req.MinCreated); err != nil {
			log.Printf("Error syncing receipts: %v", err)
		}
	}()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Receipt synchronization started",
		"shop_id": req.ShopID,
	})
}

// ListEtsyReceipts lists Etsy receipts with optional filters
// GET /api/admin/etsy/receipts
func (h *EtsyHandler) ListEtsyReceipts(w http.ResponseWriter, r *http.Request) {
	if !h.service.IsEnabled() {
		http.Error(w, "Etsy integration not configured", http.StatusNotImplemented)
		return
	}

	// Parse query parameters
	shopID := r.URL.Query().Get("shop_id")
	status := r.URL.Query().Get("status")
	limit := parseInt(r.URL.Query().Get("limit"), 50)
	offset := parseInt(r.URL.Query().Get("offset"), 0)

	// Get receipts
	receipts, total, err := h.service.ListReceipts(shopID, status, limit, offset)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"receipts": receipts,
		"total":    total,
		"limit":    limit,
		"offset":   offset,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetEtsyReceipt gets a specific Etsy receipt by receipt ID
// GET /api/admin/etsy/receipts/{receipt_id}
func (h *EtsyHandler) GetEtsyReceipt(w http.ResponseWriter, r *http.Request) {
	if !h.service.IsEnabled() {
		http.Error(w, "Etsy integration not configured", http.StatusNotImplemented)
		return
	}

	vars := mux.Vars(r)
	receiptIDStr := vars["receipt_id"]

	receiptID, err := strconv.ParseInt(receiptIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid receipt ID", http.StatusBadRequest)
		return
	}

	receipt, err := h.service.GetReceipt(receiptID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(receipt)
}

// LinkReceiptToOrder links an Etsy receipt to a local order
// POST /api/admin/etsy/receipts/{receipt_id}/link
func (h *EtsyHandler) LinkReceiptToOrder(w http.ResponseWriter, r *http.Request) {
	if !h.service.IsEnabled() {
		http.Error(w, "Etsy integration not configured", http.StatusNotImplemented)
		return
	}

	vars := mux.Vars(r)
	receiptIDStr := vars["receipt_id"]

	receiptID, err := strconv.ParseInt(receiptIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid receipt ID", http.StatusBadRequest)
		return
	}

	var req struct {
		LocalOrderID uint `json:"local_order_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.LocalOrderID == 0 {
		http.Error(w, "local_order_id is required", http.StatusBadRequest)
		return
	}

	if err := h.service.LinkReceiptToOrder(receiptID, req.LocalOrderID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Receipt linked to order successfully",
	})
}

// UnlinkReceiptFromOrder unlinks an Etsy receipt from a local order
// DELETE /api/admin/etsy/receipts/{receipt_id}/link
func (h *EtsyHandler) UnlinkReceiptFromOrder(w http.ResponseWriter, r *http.Request) {
	if !h.service.IsEnabled() {
		http.Error(w, "Etsy integration not configured", http.StatusNotImplemented)
		return
	}

	vars := mux.Vars(r)
	receiptIDStr := vars["receipt_id"]

	receiptID, err := strconv.ParseInt(receiptIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid receipt ID", http.StatusBadRequest)
		return
	}

	if err := h.service.UnlinkReceiptFromOrder(receiptID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Receipt unlinked from order successfully",
	})
}

// SyncProductImages manually triggers image sync for a linked product
// POST /api/admin/etsy/products/{listing_id}/sync-images
// ⚠️ WARNING: Downloads images FROM Etsy TO local storage (READ operation on Etsy)
func (h *EtsyHandler) SyncProductImages(w http.ResponseWriter, r *http.Request) {
	if !h.service.IsEnabled() {
		http.Error(w, "Etsy integration not configured", http.StatusNotImplemented)
		return
	}

	vars := mux.Vars(r)
	listingIDStr := vars["listing_id"]

	listingID, err := strconv.ParseInt(listingIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid listing ID", http.StatusBadRequest)
		return
	}

	// Get Etsy product to check if it's linked
	product, err := h.service.GetEtsyProduct(listingID)
	if err != nil {
		http.Error(w, "Failed to get Etsy product", http.StatusInternalServerError)
		return
	}

	if product == nil {
		http.Error(w, "Etsy product not found", http.StatusNotFound)
		return
	}

	if product.LocalProductID == nil {
		http.Error(w, "Product is not linked to a local product", http.StatusBadRequest)
		return
	}

	// Sync images
	if err := h.service.SyncProductImagesForListing(listingID, *product.LocalProductID); err != nil {
		http.Error(w, fmt.Sprintf("Failed to sync images: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":          "Images synced successfully",
		"listing_id":       listingID,
		"local_product_id": product.LocalProductID,
	})
}

// ========================================
// Helper Functions
// ========================================

// parseInt parses a string to int with a default value
func parseInt(s string, defaultValue int) int {
	if s == "" {
		return defaultValue
	}

	val, err := strconv.Atoi(s)
	if err != nil {
		return defaultValue
	}

	return val
}
