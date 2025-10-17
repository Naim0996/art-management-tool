package models

import (
	"time"

	"gorm.io/datatypes"
)

// Personaggio rappresenta un personaggio della galleria
type Personaggio struct {
	ID              uint           `json:"id" gorm:"primaryKey"`
	Name            string         `json:"name" gorm:"not null"`
	Description     string         `json:"description" gorm:"type:text"`
	Icon            string         `json:"icon"`                                     // Path dell'icona principale
	Images          datatypes.JSON `json:"images" gorm:"type:json"`                  // Array di path alle immagini
	BackgroundColor string         `json:"backgroundColor" gorm:"default:'#E0E7FF'"` // Colore di sfondo card
	BackgroundType  string         `json:"backgroundType" gorm:"default:'solid'"`    // 'solid', 'gradient'
	GradientFrom    string         `json:"gradientFrom"`                             // Colore iniziale gradient
	GradientTo      string         `json:"gradientTo"`                               // Colore finale gradient
	Order           int            `json:"order" gorm:"default:0"`                   // Ordine di visualizzazione
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`
	DeletedAt       *time.Time     `json:"deletedAt,omitempty" gorm:"index"` // Soft delete
}

// PersonaggioInput rappresenta i dati in input per creare/aggiornare un personaggio
type PersonaggioInput struct {
	Name            string   `json:"name" binding:"required,min=1,max=100"`
	Description     string   `json:"description"`
	Icon            string   `json:"icon"`
	Images          []string `json:"images"`
	BackgroundColor string   `json:"backgroundColor"`
	BackgroundType  string   `json:"backgroundType"`
	GradientFrom    string   `json:"gradientFrom"`
	GradientTo      string   `json:"gradientTo"`
	Order           int      `json:"order"`
}

// TableName specifica il nome della tabella nel database
func (Personaggio) TableName() string {
	return "personaggi"
}
