package models

import (
	"time"

	"gorm.io/datatypes"
)

// Fumetto rappresenta un fumetto della galleria
type Fumetto struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Title       string         `json:"title" gorm:"not null"`
	Description string         `json:"description" gorm:"type:text"`
	CoverImage  string         `json:"coverImage"`             // Path della copertina
	Pages       datatypes.JSON `json:"pages" gorm:"type:json"` // Array di path alle pagine
	Order       int            `json:"order" gorm:"default:0"` // Ordine di visualizzazione
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   *time.Time     `json:"deletedAt,omitempty" gorm:"index"` // Soft delete
}

// FumettoInput rappresenta i dati in input per creare/aggiornare un fumetto
type FumettoInput struct {
	Title       string   `json:"title" binding:"required,min=1,max=200"`
	Description string   `json:"description"`
	CoverImage  string   `json:"coverImage"`
	Pages       []string `json:"pages"`
	Order       int      `json:"order"`
}

// TableName specifica il nome della tabella nel database
func (Fumetto) TableName() string {
	return "fumetti"
}
