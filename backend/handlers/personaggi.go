package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

// PersonaggiHandler gestisce le operazioni CRUD sui personaggi
type PersonaggiHandler struct {
	db *gorm.DB
}

// NewPersonaggiHandler crea un nuovo handler per i personaggi
func NewPersonaggiHandler(db *gorm.DB) *PersonaggiHandler {
	return &PersonaggiHandler{db: db}
}

// GetPersonaggi restituisce tutti i personaggi non cancellati
// GET /api/personaggi
func (h *PersonaggiHandler) GetPersonaggi(w http.ResponseWriter, r *http.Request) {
	var personaggi []models.Personaggio

	result := h.db.Where("deleted_at IS NULL").Order(`"order" ASC, created_at DESC`).Find(&personaggi)

	if result.Error != nil {
		http.Error(w, "Failed to fetch personaggi: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"personaggi": personaggi,
		"count":      len(personaggi),
	})
}

// GetPersonaggio restituisce un singolo personaggio per ID
// GET /api/personaggi/{id}
func (h *PersonaggiHandler) GetPersonaggio(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	var personaggio models.Personaggio

	result := h.db.Where("id = ? AND deleted_at IS NULL", id).First(&personaggio)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			http.Error(w, "Personaggio not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch personaggio: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(personaggio)
}

// CreatePersonaggio crea un nuovo personaggio
// POST /api/personaggi
func (h *PersonaggiHandler) CreatePersonaggio(w http.ResponseWriter, r *http.Request) {
	var input models.PersonaggioInput

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input: "+err.Error(), http.StatusBadRequest)
		return
	}

	if input.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}

	personaggio := models.Personaggio{
		Name:            input.Name,
		Description:     input.Description,
		Icon:            input.Icon,
		Images:          input.Images,
		BackgroundColor: input.BackgroundColor,
		BackgroundType:  input.BackgroundType,
		GradientFrom:    input.GradientFrom,
		GradientTo:      input.GradientTo,
		Order:           input.Order,
	}

	if personaggio.BackgroundColor == "" {
		personaggio.BackgroundColor = "#E0E7FF"
	}
	if personaggio.BackgroundType == "" {
		personaggio.BackgroundType = "solid"
	}
	if personaggio.Images == nil {
		personaggio.Images = []string{}
	}

	result := h.db.Create(&personaggio)

	if result.Error != nil {
		http.Error(w, "Failed to create personaggio: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(personaggio)
}

// UpdatePersonaggio aggiorna un personaggio esistente
// PUT /api/personaggi/{id}
func (h *PersonaggiHandler) UpdatePersonaggio(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	var input models.PersonaggioInput

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input: "+err.Error(), http.StatusBadRequest)
		return
	}

	var personaggio models.Personaggio
	result := h.db.Where("id = ? AND deleted_at IS NULL", id).First(&personaggio)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			http.Error(w, "Personaggio not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch personaggio: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	personaggio.Name = input.Name
	personaggio.Description = input.Description
	personaggio.Icon = input.Icon
	personaggio.Images = input.Images
	personaggio.BackgroundColor = input.BackgroundColor
	personaggio.BackgroundType = input.BackgroundType
	personaggio.GradientFrom = input.GradientFrom
	personaggio.GradientTo = input.GradientTo
	personaggio.Order = input.Order

	result = h.db.Save(&personaggio)

	if result.Error != nil {
		http.Error(w, "Failed to update personaggio: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(personaggio)
}

// DeletePersonaggio esegue soft delete di un personaggio
// DELETE /api/personaggi/{id}
func (h *PersonaggiHandler) DeletePersonaggio(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var personaggio models.Personaggio
	result := h.db.Where("id = ? AND deleted_at IS NULL", id).First(&personaggio)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			http.Error(w, "Personaggio not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch personaggio: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	now := time.Now()
	personaggio.DeletedAt = &now

	result = h.db.Save(&personaggio)

	if result.Error != nil {
		http.Error(w, "Failed to delete personaggio: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Personaggio deleted successfully",
		"id":      id,
	})
}

// RestorePersonaggio ripristina un personaggio soft deleted
// POST /api/personaggi/{id}/restore
func (h *PersonaggiHandler) RestorePersonaggio(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var personaggio models.Personaggio
	result := h.db.Unscoped().Where("id = ?", id).First(&personaggio)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			http.Error(w, "Personaggio not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch personaggio: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	if personaggio.DeletedAt == nil {
		http.Error(w, "Personaggio is not deleted", http.StatusBadRequest)
		return
	}

	personaggio.DeletedAt = nil

	result = h.db.Save(&personaggio)

	if result.Error != nil {
		http.Error(w, "Failed to restore personaggio: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(personaggio)
}

// GetDeletedPersonaggi restituisce tutti i personaggi soft deleted
// GET /api/personaggi/deleted
func (h *PersonaggiHandler) GetDeletedPersonaggi(w http.ResponseWriter, r *http.Request) {
	var personaggi []models.Personaggio

	result := h.db.Unscoped().Where("deleted_at IS NOT NULL").Order("deleted_at DESC").Find(&personaggi)

	if result.Error != nil {
		http.Error(w, "Failed to fetch deleted personaggi: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"personaggi": personaggi,
		"count":      len(personaggi),
	})
}
