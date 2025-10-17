package models

import (
	"time"

	"gorm.io/gorm"
)

type Order struct {
	ID            uint           `gorm:"primarykey" json:"id"`
	CustomerEmail string         `json:"customer_email"`
	CustomerName  string         `json:"customer_name"`
	Total         float64        `json:"total"`
	Status        string         `json:"status"` // pending, processing, completed, cancelled
	Items         []OrderItem    `gorm:"foreignKey:OrderID" json:"items,omitempty"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

type OrderItem struct {
	ID          uint    `gorm:"primarykey" json:"id"`
	OrderID     uint    `json:"order_id"`
	ProductID   uint    `json:"product_id"`
	ProductName string  `json:"product_name"`
	Quantity    int     `json:"quantity"`
	Price       float64 `json:"price"`
}
