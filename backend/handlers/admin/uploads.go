package admin

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/Naim0996/art-management-tool/backend/services/upload"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

// UploadHandler handles file upload operations
type UploadHandler struct {
	db            *gorm.DB
	uploadService *upload.Service
}

// NewUploadHandler creates a new upload handler
func NewUploadHandler(db *gorm.DB) *UploadHandler {
	return &UploadHandler{
		db:            db,
		uploadService: upload.NewService(nil), // Use default config
	}
}

// UploadProductImage handles POST /api/admin/shop/products/{id}/images
func (h *UploadHandler) UploadProductImage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	productID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid product ID", http.StatusBadRequest)
		return
	}

	// Verify product exists
	var product models.EnhancedProduct
	if err := h.db.First(&product, productID).Error; err != nil {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	// Parse multipart form
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "Failed to parse form: "+err.Error(), http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to get file: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Get optional alt text and position
	altText := r.FormValue("alt_text")
	position := 0
	if posStr := r.FormValue("position"); posStr != "" {
		if p, err := strconv.Atoi(posStr); err == nil {
			position = p
		}
	}

	// Save file
	subDir := fmt.Sprintf("products/%d", productID)
	publicURL, err := h.uploadService.SaveFile(file, header, subDir, "product")
	if err != nil {
		http.Error(w, "Failed to save file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create database record
	productImage := models.ProductImage{
		ProductID: uint(productID),
		URL:       publicURL,
		AltText:   altText,
		Position:  position,
	}

	// Validate image record
	if err := models.ValidateProductImage(&productImage); err != nil {
		h.uploadService.DeleteFile(publicURL)
		http.Error(w, "Validation failed: "+err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.db.Create(&productImage).Error; err != nil {
		// Cleanup uploaded file on database error
		h.uploadService.DeleteFile(publicURL)
		http.Error(w, "Failed to save image record: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Image uploaded successfully",
		"image":   productImage,
	})
}

// DeleteProductImage handles DELETE /api/admin/shop/products/{id}/images/{imageId}
func (h *UploadHandler) DeleteProductImage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	productID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid product ID", http.StatusBadRequest)
		return
	}

	imageID, err := strconv.ParseUint(vars["imageId"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid image ID", http.StatusBadRequest)
		return
	}

	// Get image record
	var image models.ProductImage
	if err := h.db.Where("id = ? AND product_id = ?", imageID, productID).First(&image).Error; err != nil {
		http.Error(w, "Image not found", http.StatusNotFound)
		return
	}

	// Delete file from disk
	if err := h.uploadService.DeleteFile(image.URL); err != nil {
		// Log error but continue - database record should still be deleted
		fmt.Printf("Warning: Failed to delete file %s: %v\n", image.URL, err)
	}

	// Delete database record
	if err := h.db.Delete(&image).Error; err != nil {
		http.Error(w, "Failed to delete image record: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Image deleted successfully",
	})
}

// UpdateProductImagePosition handles PATCH /api/admin/shop/products/{id}/images/{imageId}
func (h *UploadHandler) UpdateProductImagePosition(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	productID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid product ID", http.StatusBadRequest)
		return
	}

	imageID, err := strconv.ParseUint(vars["imageId"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid image ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Position int    `json:"position"`
		AltText  string `json:"alt_text"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Update image record
	result := h.db.Model(&models.ProductImage{}).
		Where("id = ? AND product_id = ?", imageID, productID).
		Updates(map[string]interface{}{
			"position": req.Position,
			"alt_text": req.AltText,
		})

	if result.Error != nil {
		http.Error(w, "Failed to update image: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	if result.RowsAffected == 0 {
		http.Error(w, "Image not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Image updated successfully",
	})
}

// ListProductImages handles GET /api/admin/shop/products/{id}/images
func (h *UploadHandler) ListProductImages(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	productID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid product ID", http.StatusBadRequest)
		return
	}

	var images []models.ProductImage
	if err := h.db.Where("product_id = ?", productID).Order("position ASC").Find(&images).Error; err != nil {
		http.Error(w, "Failed to fetch images: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"images": images,
	})
}
