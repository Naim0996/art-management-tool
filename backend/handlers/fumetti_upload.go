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

// UploadPage gestisce l'upload di pagine per un fumetto
// POST /api/admin/fumetti/{id}/upload
func (h *FumettiHandler) UploadPage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	// Verifica che il fumetto esista
	var fumetto models.Fumetto
	if err := h.db.First(&fumetto, id).Error; err != nil {
		http.Error(w, "Fumetto not found", http.StatusNotFound)
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

	// Ottieni il tipo di upload (cover o page)
	uploadType := r.FormValue("type") // "cover" o "page"
	if uploadType != "cover" && uploadType != "page" {
		uploadType = "page"
	}

	// Genera nome file univoco
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s_%s_%s%s", fumetto.Title, uploadType, uuid.New().String()[:8], ext)
	filename = strings.ReplaceAll(filename, " ", "_")

	// Crea directory se non esiste
	uploadDir := filepath.Join("uploads", "fumetti", fmt.Sprintf("%d", fumetto.ID))
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
	publicURL := fmt.Sprintf("/uploads/fumetti/%d/%s", fumetto.ID, filename)

	// Aggiorna il fumetto
	if uploadType == "cover" {
		fumetto.CoverImage = publicURL
	} else {
		var pages []string
		if len(fumetto.Pages) > 0 {
			json.Unmarshal(fumetto.Pages, &pages)
		}
		pages = append(pages, publicURL)
		fumetto.Pages = toJSON(pages)
	}

	if err := h.db.Save(&fumetto).Error; err != nil {
		http.Error(w, "Failed to update fumetto: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Page uploaded successfully",
		"url":     publicURL,
		"type":    uploadType,
	})
}

// DeletePage elimina una pagina da un fumetto
// DELETE /api/admin/fumetti/{id}/pages
func (h *FumettiHandler) DeletePage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var fumetto models.Fumetto
	if err := h.db.First(&fumetto, id).Error; err != nil {
		http.Error(w, "Fumetto not found", http.StatusNotFound)
		return
	}

	var req struct {
		PageURL string `json:"pageUrl"`
		Type    string `json:"type"` // "cover" o "page"
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Type == "cover" {
		// Elimina file fisico se esiste
		if fumetto.CoverImage != "" && strings.HasPrefix(fumetto.CoverImage, "/uploads/") {
			filePath := "." + fumetto.CoverImage
			os.Remove(filePath)
		}
		fumetto.CoverImage = ""
	} else {
		var pages []string
		if len(fumetto.Pages) > 0 {
			json.Unmarshal(fumetto.Pages, &pages)
		}

		// Rimuovi la pagina dall'array
		newPages := []string{}
		for _, page := range pages {
			if page != req.PageURL {
				newPages = append(newPages, page)
			} else if strings.HasPrefix(page, "/uploads/") {
				// Elimina file fisico
				filePath := "." + page
				os.Remove(filePath)
			}
		}
		fumetto.Pages = toJSON(newPages)
	}

	if err := h.db.Save(&fumetto).Error; err != nil {
		http.Error(w, "Failed to update fumetto: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Page deleted successfully",
	})
}
