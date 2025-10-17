package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

// UploadImage gestisce l'upload di immagini per un personaggio
// POST /api/admin/personaggi/{id}/upload
func (h *PersonaggiHandler) UploadImage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	// Verifica che il personaggio esista
	var personaggio models.Personaggio
	if err := h.db.First(&personaggio, id).Error; err != nil {
		http.Error(w, "Personaggio not found", http.StatusNotFound)
		return
	}

	// Parse multipart form (max 10MB)
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

	// Valida il tipo di file
	contentType := header.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		http.Error(w, "File must be an image", http.StatusBadRequest)
		return
	}

	// Ottieni il tipo di upload (icon o image)
	uploadType := r.FormValue("type") // "icon" o "image"
	if uploadType != "icon" && uploadType != "image" {
		uploadType = "image"
	}

	// Genera nome file univoco
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s_%s_%s%s", personaggio.Name, uploadType, uuid.New().String()[:8], ext)
	filename = strings.ReplaceAll(filename, " ", "_")

	// Crea directory se non esiste
	uploadDir := filepath.Join("uploads", "personaggi", fmt.Sprintf("%d", personaggio.ID))
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		http.Error(w, "Failed to create upload directory: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Salva il file
	filePath := filepath.Join(uploadDir, filename)
	dst, err := os.Create(filePath)
	if err != nil {
		http.Error(w, "Failed to create file: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Failed to save file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Genera URL pubblico
	publicURL := fmt.Sprintf("/uploads/personaggi/%d/%s", personaggio.ID, filename)

	// Aggiorna il personaggio
	if uploadType == "icon" {
		personaggio.Icon = publicURL
	} else {
		var images []string
		if len(personaggio.Images) > 0 {
			json.Unmarshal(personaggio.Images, &images)
		}
		images = append(images, publicURL)
		personaggio.Images = toJSON(images)
	}

	if err := h.db.Save(&personaggio).Error; err != nil {
		http.Error(w, "Failed to update personaggio: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Image uploaded successfully",
		"url":     publicURL,
		"type":    uploadType,
	})
}

// DeleteImage elimina un'immagine da un personaggio
// DELETE /api/admin/personaggi/{id}/images
func (h *PersonaggiHandler) DeleteImage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var personaggio models.Personaggio
	if err := h.db.First(&personaggio, id).Error; err != nil {
		http.Error(w, "Personaggio not found", http.StatusNotFound)
		return
	}

	var req struct {
		ImageURL string `json:"imageUrl"`
		Type     string `json:"type"` // "icon" o "image"
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Type == "icon" {
		// Elimina file fisico se esiste
		if personaggio.Icon != "" && strings.HasPrefix(personaggio.Icon, "/uploads/") {
			filePath := "." + personaggio.Icon
			os.Remove(filePath)
		}
		personaggio.Icon = ""
	} else {
		var images []string
		if len(personaggio.Images) > 0 {
			json.Unmarshal(personaggio.Images, &images)
		}

		// Rimuovi l'immagine dall'array
		newImages := []string{}
		for _, img := range images {
			if img != req.ImageURL {
				newImages = append(newImages, img)
			} else if strings.HasPrefix(img, "/uploads/") {
				// Elimina file fisico
				filePath := "." + img
				os.Remove(filePath)
			}
		}
		personaggio.Images = toJSON(newImages)
	}

	if err := h.db.Save(&personaggio).Error; err != nil {
		http.Error(w, "Failed to update personaggio: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Image deleted successfully",
	})
}
