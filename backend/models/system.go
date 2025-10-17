package models

import (
	"time"

	"gorm.io/gorm"
)

// NotificationType represents the type of notification
type NotificationType string

const (
	NotificationTypeLowStock      NotificationType = "low_stock"
	NotificationTypePaymentFailed NotificationType = "payment_failed"
	NotificationTypeOrderCreated  NotificationType = "order_created"
	NotificationTypeOrderPaid     NotificationType = "order_paid"
	NotificationTypeSystem        NotificationType = "system"
)

// NotificationSeverity represents the severity level
type NotificationSeverity string

const (
	NotificationSeverityInfo     NotificationSeverity = "info"
	NotificationSeverityWarning  NotificationSeverity = "warning"
	NotificationSeverityError    NotificationSeverity = "error"
	NotificationSeverityCritical NotificationSeverity = "critical"
)

// Notification represents a system notification
type Notification struct {
	ID        uint                 `gorm:"primarykey" json:"id"`
	Type      NotificationType     `gorm:"size:50;not null;index" json:"type"`
	Severity  NotificationSeverity `gorm:"size:20;not null;default:'info';index" json:"severity"`
	Title     string               `gorm:"size:255;not null" json:"title"`
	Message   string               `gorm:"type:text" json:"message,omitempty"`
	Payload   string               `gorm:"type:jsonb" json:"payload,omitempty"`
	ReadAt    *time.Time           `json:"read_at,omitempty"`
	CreatedAt time.Time            `json:"created_at"`
}

// MarkAsRead marks the notification as read
func (n *Notification) MarkAsRead() {
	now := time.Now()
	n.ReadAt = &now
}

// IsRead checks if the notification has been read
func (n *Notification) IsRead() bool {
	return n.ReadAt != nil
}

// AuditLog represents an audit trail entry
type AuditLog struct {
	ID         uint      `gorm:"primarykey" json:"id"`
	EntityType string    `gorm:"size:100;not null;index:idx_audit_entity" json:"entity_type"`
	EntityID   uint      `gorm:"not null;index:idx_audit_entity" json:"entity_id"`
	Action     string    `gorm:"size:50;not null;index" json:"action"`
	Actor      string    `gorm:"size:255;index" json:"actor,omitempty"`
	Diff       string    `gorm:"type:jsonb" json:"diff,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}

// DiscountCode represents a discount code
type DiscountCode struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	Code        string         `gorm:"size:50;uniqueIndex;not null" json:"code"`
	Type        string         `gorm:"size:20;not null" json:"type"` // percentage, fixed_amount
	Value       float64        `gorm:"type:decimal(10,2);not null" json:"value"`
	MinPurchase float64        `gorm:"type:decimal(10,2)" json:"min_purchase,omitempty"`
	MaxUses     *int           `json:"max_uses,omitempty"`
	UsedCount   int            `gorm:"not null;default:0" json:"used_count"`
	StartsAt    *time.Time     `json:"starts_at,omitempty"`
	ExpiresAt   *time.Time     `json:"expires_at,omitempty"`
	Active      bool           `gorm:"not null;default:true" json:"active"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// IsValid checks if the discount code is valid
func (d *DiscountCode) IsValid() bool {
	now := time.Now()
	
	if !d.Active {
		return false
	}
	
	if d.StartsAt != nil && now.Before(*d.StartsAt) {
		return false
	}
	
	if d.ExpiresAt != nil && now.After(*d.ExpiresAt) {
		return false
	}
	
	if d.MaxUses != nil && d.UsedCount >= *d.MaxUses {
		return false
	}
	
	return true
}

// CalculateDiscount calculates the discount amount
func (d *DiscountCode) CalculateDiscount(subtotal float64) float64 {
	if !d.IsValid() {
		return 0
	}
	
	if d.MinPurchase > 0 && subtotal < d.MinPurchase {
		return 0
	}
	
	if d.Type == "percentage" {
		return subtotal * (d.Value / 100)
	}
	
	return d.Value
}

// ShopifyLink represents a mapping between local and Shopify entities
type ShopifyLink struct {
	ID         uint       `gorm:"primarykey" json:"id"`
	LocalID    uint       `gorm:"not null;index:idx_shopify_local" json:"local_id"`
	ShopifyID  string     `gorm:"size:255;not null;index:idx_shopify_remote" json:"shopify_id"`
	EntityType string     `gorm:"size:50;not null;index:idx_shopify_local,idx_shopify_remote" json:"entity_type"`
	SyncedAt   *time.Time `json:"synced_at,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}
