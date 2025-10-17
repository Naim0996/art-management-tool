package models

import (
	"time"

	"gorm.io/gorm"
)

// Category represents a product category
type Category struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	Name        string         `gorm:"size:255;not null" json:"name"`
	Slug        string         `gorm:"size:255;uniqueIndex;not null" json:"slug"`
	Description string         `gorm:"type:text" json:"description,omitempty"`
	ParentID    *uint          `json:"parent_id,omitempty"`
	Parent      *Category      `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children    []Category     `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// ProductStatus represents the publication status of a product
type ProductStatus string

const (
	ProductStatusDraft     ProductStatus = "draft"
	ProductStatusPublished ProductStatus = "published"
	ProductStatusArchived  ProductStatus = "archived"
)

// EnhancedProduct represents the full product with all features
type EnhancedProduct struct {
	ID               uint              `gorm:"primarykey" json:"id"`
	Slug             string            `gorm:"size:255;uniqueIndex;not null" json:"slug"`
	Title            string            `gorm:"size:500;not null" json:"title"`
	ShortDescription string            `gorm:"size:1000" json:"short_description,omitempty"`
	LongDescription  string            `gorm:"type:text" json:"long_description,omitempty"` // Markdown supported
	BasePrice        float64           `gorm:"type:decimal(10,2);not null;default:0" json:"base_price"`
	Currency         string            `gorm:"size:3;not null;default:'EUR'" json:"currency"`
	SKU              string            `gorm:"size:100;uniqueIndex" json:"sku,omitempty"`
	GTIN             string            `gorm:"size:50" json:"gtin,omitempty"`
	Status           ProductStatus     `gorm:"size:20;not null;default:'draft'" json:"status"`
	Categories       []Category        `gorm:"many2many:product_categories;" json:"categories,omitempty"`
	Images           []ProductImage    `gorm:"foreignKey:ProductID" json:"images,omitempty"`
	Variants         []ProductVariant  `gorm:"foreignKey:ProductID" json:"variants,omitempty"`
	CreatedAt        time.Time         `json:"created_at"`
	UpdatedAt        time.Time         `json:"updated_at"`
	DeletedAt        gorm.DeletedAt    `gorm:"index" json:"-"`
}

// TableName overrides the table name
func (EnhancedProduct) TableName() string {
	return "products"
}

// ProductImage represents a product image
type ProductImage struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	ProductID uint      `gorm:"not null;index" json:"product_id"`
	URL       string    `gorm:"size:1000;not null" json:"url"`
	AltText   string    `gorm:"size:500" json:"alt_text,omitempty"`
	Position  int       `gorm:"not null;default:0" json:"position"`
	CreatedAt time.Time `json:"created_at"`
}

// ProductVariant represents a product variant (size, color, etc.)
type ProductVariant struct {
	ID              uint           `gorm:"primarykey" json:"id"`
	ProductID       uint           `gorm:"not null;index" json:"product_id"`
	SKU             string         `gorm:"size:100;uniqueIndex;not null" json:"sku"`
	Name            string         `gorm:"size:255;not null" json:"name"`
	Attributes      string         `gorm:"type:jsonb" json:"attributes,omitempty"` // JSON: {"size": "M", "color": "red"}
	PriceAdjustment float64        `gorm:"type:decimal(10,2);default:0" json:"price_adjustment"`
	Stock           int            `gorm:"not null;default:0" json:"stock"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

// GetPrice returns the actual price of the variant
func (v *ProductVariant) GetPrice(basePrice float64) float64 {
	return basePrice + v.PriceAdjustment
}
