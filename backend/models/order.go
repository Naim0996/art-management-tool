package models

import (
	"time"

	"gorm.io/gorm"
)

// PaymentStatus represents the status of a payment
type PaymentStatus string

const (
	PaymentStatusPending  PaymentStatus = "pending"
	PaymentStatusPaid     PaymentStatus = "paid"
	PaymentStatusFailed   PaymentStatus = "failed"
	PaymentStatusRefunded PaymentStatus = "refunded"
)

// FulfillmentStatus represents the order fulfillment status
type FulfillmentStatus string

const (
	FulfillmentStatusUnfulfilled        FulfillmentStatus = "unfulfilled"
	FulfillmentStatusFulfilled          FulfillmentStatus = "fulfilled"
	FulfillmentStatusPartiallyFulfilled FulfillmentStatus = "partially_fulfilled"
)

// Order represents an enhanced order
type Order struct {
	ID                uint              `gorm:"primarykey" json:"id"`
	OrderNumber       string            `gorm:"size:50;uniqueIndex;not null" json:"order_number"`
	UserID            *uint             `json:"user_id,omitempty"`
	CustomerEmail     string            `gorm:"size:255;not null" json:"customer_email"`
	CustomerName      string            `gorm:"size:255;not null" json:"customer_name"`
	Subtotal          float64           `gorm:"type:decimal(10,2);not null;default:0" json:"subtotal"`
	Tax               float64           `gorm:"type:decimal(10,2);not null;default:0" json:"tax"`
	Discount          float64           `gorm:"type:decimal(10,2);not null;default:0" json:"discount"`
	Total             float64           `gorm:"type:decimal(10,2);not null;default:0" json:"total"`
	Currency          string            `gorm:"size:3;not null;default:'EUR'" json:"currency"`
	PaymentStatus     PaymentStatus     `gorm:"size:20;not null;default:'pending'" json:"payment_status"`
	PaymentIntentID   string            `gorm:"size:255" json:"payment_intent_id,omitempty"`
	PaymentMethod     string            `gorm:"size:50" json:"payment_method,omitempty"`
	FulfillmentStatus FulfillmentStatus `gorm:"size:20;not null;default:'unfulfilled'" json:"fulfillment_status"`
	ShippingAddress   string            `gorm:"type:jsonb" json:"shipping_address,omitempty"`
	BillingAddress    string            `gorm:"type:jsonb" json:"billing_address,omitempty"`
	Notes             string            `gorm:"type:text" json:"notes,omitempty"`
	Items             []OrderItem       `gorm:"foreignKey:OrderID" json:"items,omitempty"`
	CreatedAt         time.Time         `json:"created_at"`
	UpdatedAt         time.Time         `json:"updated_at"`
	DeletedAt         gorm.DeletedAt    `gorm:"index" json:"-"`
}

// OrderItem represents an item in an order
type OrderItem struct {
	ID          uint      `gorm:"primarykey" json:"id"`
	OrderID     uint      `gorm:"not null;index" json:"order_id"`
	ProductID   *uint     `gorm:"index" json:"product_id,omitempty"`
	VariantID   *uint     `gorm:"index" json:"variant_id,omitempty"`
	ProductName string    `gorm:"size:500;not null" json:"product_name"`
	VariantName string    `gorm:"size:255" json:"variant_name,omitempty"`
	SKU         string    `gorm:"size:100" json:"sku,omitempty"`
	Quantity    int       `gorm:"not null;default:1" json:"quantity"`
	UnitPrice   float64   `gorm:"type:decimal(10,2);not null" json:"unit_price"`
	TotalPrice  float64   `gorm:"type:decimal(10,2);not null" json:"total_price"`
	CreatedAt   time.Time `json:"created_at"`
}
