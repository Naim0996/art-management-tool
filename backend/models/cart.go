package models

import (
	"time"
)

// Cart represents a shopping cart
type Cart struct {
	ID           uint       `gorm:"primarykey" json:"id"`
	SessionToken string     `gorm:"size:255;uniqueIndex;not null" json:"session_token"`
	UserID       *uint      `json:"user_id,omitempty"`
	ExpiresAt    *time.Time `json:"expires_at,omitempty"`
	Items        []CartItem `gorm:"foreignKey:CartID" json:"items,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// CartItem represents an item in a cart
type CartItem struct {
	ID        uint             `gorm:"primarykey" json:"id"`
	CartID    uint             `gorm:"not null;index" json:"cart_id"`
	ProductID uint             `gorm:"not null;index" json:"product_id"`
	Product   *EnhancedProduct `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	VariantID *uint            `gorm:"index" json:"variant_id,omitempty"`
	Variant   *ProductVariant  `gorm:"foreignKey:VariantID" json:"variant,omitempty"`
	Quantity  int              `gorm:"not null;default:1" json:"quantity"`
	CreatedAt time.Time        `json:"created_at"`
	UpdatedAt time.Time        `json:"updated_at"`
}

// CalculateTotal calculates the total price for this cart item
func (ci *CartItem) CalculateTotal() float64 {
	if ci.Product == nil {
		return 0
	}

	price := ci.Product.BasePrice
	if ci.Variant != nil {
		price += ci.Variant.PriceAdjustment
	}

	return price * float64(ci.Quantity)
}

// Legacy types for backward compatibility
type LegacyCartItem struct {
	ProductID string `json:"product_id"`
	VariantID *uint  `json:"variant_id,omitempty"`
	Quantity  int    `json:"quantity"`
}

type LegacyCart struct {
	ID    string           `json:"id"`
	Items []LegacyCartItem `json:"items"`
}
