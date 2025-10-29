package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

// FumettoResponse è la struttura usata per la risposta JSON
type FumettoResponse struct {
	ID          uint     `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	CoverImage  string   `json:"coverImage"`
	Pages       []string `json:"pages"`
	Order       int      `json:"order"`
	CreatedAt   string   `json:"createdAt"`
	UpdatedAt   string   `json:"updatedAt"`
	DeletedAt   *string  `json:"deletedAt,omitempty"`
}

// toFumettoResponse converte un Fumetto del database in FumettoResponse
func toFumettoResponse(f models.Fumetto) FumettoResponse {
	var pages []string
	if len(f.Pages) > 0 {
		json.Unmarshal(f.Pages, &pages)
	}
	if pages == nil {
		pages = []string{}
	}

	var deletedAt *string
	if f.DeletedAt != nil {
		deletedAtStr := f.DeletedAt.Format(time.RFC3339)
		deletedAt = &deletedAtStr
	}

	return FumettoResponse{
		ID:          f.ID,
		Title:       f.Title,
		Description: f.Description,
		CoverImage:  f.CoverImage,
		Pages:       pages,
		Order:       f.Order,
		CreatedAt:   f.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   f.UpdatedAt.Format(time.RFC3339),
		DeletedAt:   deletedAt,
	}
}

// FumettiHandler gestisce le operazioni CRUD sui fumetti
type FumettiHandler struct {
	db *gorm.DB
}

// NewFumettiHandler crea un nuovo handler per i fumetti
func NewFumettiHandler(db *gorm.DB) *FumettiHandler {
	return &FumettiHandler{db: db}
}

// GetFumetti restituisce tutti i fumetti non cancellati
// GET /api/fumetti
func (h *FumettiHandler) GetFumetti(w http.ResponseWriter, r *http.Request) {
	var fumetti []models.Fumetto

	result := h.db.Where("deleted_at IS NULL").Order(`"order" ASC, created_at DESC`).Find(&fumetti)

	if result.Error != nil {
		http.Error(w, "Failed to fetch fumetti: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Converti in response format
	responses := make([]FumettoResponse, len(fumetti))
	for i, f := range fumetti {
		responses[i] = toFumettoResponse(f)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"fumetti": responses,
		"count":   len(responses),
	})
}

// GetFumetto restituisce un singolo fumetto per ID
// GET /api/fumetti/{id}
func (h *FumettiHandler) GetFumetto(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	var fumetto models.Fumetto

	result := h.db.Where("id = ? AND deleted_at IS NULL", id).First(&fumetto)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			http.Error(w, "Fumetto not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch fumetto: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(toFumettoResponse(fumetto))
}

// CreateFumetto crea un nuovo fumetto
// POST /api/fumetti
func (h *FumettiHandler) CreateFumetto(w http.ResponseWriter, r *http.Request) {
	var input models.FumettoInput

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate input using model validation
	if err := input.Validate(); err != nil {
		http.Error(w, "Validation failed: "+err.Error(), http.StatusBadRequest)
		return
	}

	fumetto := models.Fumetto{
		Title:       input.Title,
		Description: input.Description,
		CoverImage:  input.CoverImage,
		Pages:       toJSON(input.Pages),
		Order:       input.Order,
	}

	if len(input.Pages) == 0 {
		fumetto.Pages = toJSON([]string{})
	}

	result := h.db.Create(&fumetto)

	if result.Error != nil {
		http.Error(w, "Failed to create fumetto: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(toFumettoResponse(fumetto))
}

// UpdateFumetto aggiorna un fumetto esistente
// PUT /api/fumetti/{id}
func (h *FumettiHandler) UpdateFumetto(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	var input models.FumettoInput

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate input using model validation
	if err := input.Validate(); err != nil {
		http.Error(w, "Validation failed: "+err.Error(), http.StatusBadRequest)
		return
	}

	var fumetto models.Fumetto
	result := h.db.Where("id = ? AND deleted_at IS NULL", id).First(&fumetto)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			http.Error(w, "Fumetto not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch fumetto: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	fumetto.Title = input.Title
	fumetto.Description = input.Description
	fumetto.CoverImage = input.CoverImage
	fumetto.Pages = toJSON(input.Pages)
	fumetto.Order = input.Order

	result = h.db.Save(&fumetto)

	if result.Error != nil {
		http.Error(w, "Failed to update fumetto: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(toFumettoResponse(fumetto))
}

// DeleteFumetto esegue soft delete di un fumetto
// DELETE /api/fumetti/{id}
func (h *FumettiHandler) DeleteFumetto(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var fumetto models.Fumetto
	result := h.db.Where("id = ? AND deleted_at IS NULL", id).First(&fumetto)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			http.Error(w, "Fumetto not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch fumetto: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	now := time.Now()
	fumetto.DeletedAt = &now

	result = h.db.Save(&fumetto)

	if result.Error != nil {
		http.Error(w, "Failed to delete fumetto: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Fumetto deleted successfully",
		"id":      id,
	})
}

// RestoreFumetto ripristina un fumetto soft deleted
// POST /api/fumetti/{id}/restore
func (h *FumettiHandler) RestoreFumetto(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var fumetto models.Fumetto
	result := h.db.Unscoped().Where("id = ?", id).First(&fumetto)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			http.Error(w, "Fumetto not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch fumetto: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	if fumetto.DeletedAt == nil {
		http.Error(w, "Fumetto is not deleted", http.StatusBadRequest)
		return
	}

	fumetto.DeletedAt = nil

	result = h.db.Save(&fumetto)

	if result.Error != nil {
		http.Error(w, "Failed to restore fumetto: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(toFumettoResponse(fumetto))
}

// GetDeletedFumetti restituisce tutti i fumetti soft deleted
// GET /api/fumetti/deleted
func (h *FumettiHandler) GetDeletedFumetti(w http.ResponseWriter, r *http.Request) {
	var fumetti []models.Fumetto

	result := h.db.Unscoped().Where("deleted_at IS NOT NULL").Order("deleted_at DESC").Find(&fumetti)

	if result.Error != nil {
		http.Error(w, "Failed to fetch deleted fumetti: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Converti in response format
	responses := make([]FumettoResponse, len(fumetti))
	for i, f := range fumetti {
		responses[i] = toFumettoResponse(f)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"fumetti": responses,
		"count":   len(responses),
	})
}
