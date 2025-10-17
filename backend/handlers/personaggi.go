package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/gorilla/mux"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// Helper function per convertire []string in datatypes.JSON
func toJSON(data interface{}) datatypes.JSON {
	bytes, err := json.Marshal(data)
	if err != nil {
		return datatypes.JSON{}
	}
	return datatypes.JSON(bytes)
}

// PersonaggioResponse è la struttura usata per la risposta JSON
type PersonaggioResponse struct {
	ID              uint     `json:"id"`
	Name            string   `json:"name"`
	Description     string   `json:"description"`
	Icon            string   `json:"icon"`
	Images          []string `json:"images"`
	BackgroundColor string   `json:"backgroundColor"`
	BackgroundType  string   `json:"backgroundType"`
	GradientFrom    string   `json:"gradientFrom"`
	GradientTo      string   `json:"gradientTo"`
	Order           int      `json:"order"`
	CreatedAt       string   `json:"createdAt"`
	UpdatedAt       string   `json:"updatedAt"`
	DeletedAt       *string  `json:"deletedAt,omitempty"`
}

// toResponse converte un Personaggio del database in PersonaggioResponse
func toResponse(p models.Personaggio) PersonaggioResponse {
	var images []string
	if len(p.Images) > 0 {
		json.Unmarshal(p.Images, &images)
	}
	if images == nil {
		images = []string{}
	}

	var deletedAt *string
	if p.DeletedAt != nil {
		deletedAtStr := p.DeletedAt.Format(time.RFC3339)
		deletedAt = &deletedAtStr
	}

	return PersonaggioResponse{
		ID:              p.ID,
		Name:            p.Name,
		Description:     p.Description,
		Icon:            p.Icon,
		Images:          images,
		BackgroundColor: p.BackgroundColor,
		BackgroundType:  p.BackgroundType,
		GradientFrom:    p.GradientFrom,
		GradientTo:      p.GradientTo,
		Order:           p.Order,
		CreatedAt:       p.CreatedAt.Format(time.RFC3339),
		UpdatedAt:       p.UpdatedAt.Format(time.RFC3339),
		DeletedAt:       deletedAt,
	}
}

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

	// Converti in response format
	responses := make([]PersonaggioResponse, len(personaggi))
	for i, p := range personaggi {
		responses[i] = toResponse(p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"personaggi": responses,
		"count":      len(responses),
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
	json.NewEncoder(w).Encode(toResponse(personaggio))
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
		Images:          toJSON(input.Images),
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
	if len(input.Images) == 0 {
		personaggio.Images = toJSON([]string{})
	}

	result := h.db.Create(&personaggio)

	if result.Error != nil {
		http.Error(w, "Failed to create personaggio: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(toResponse(personaggio))
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
	personaggio.Images = toJSON(input.Images)
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
	json.NewEncoder(w).Encode(toResponse(personaggio))
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
	json.NewEncoder(w).Encode(toResponse(personaggio))
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

	// Converti in response format
	responses := make([]PersonaggioResponse, len(personaggi))
	for i, p := range personaggi {
		responses[i] = toResponse(p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"personaggi": responses,
		"count":      len(responses),
	})
}
