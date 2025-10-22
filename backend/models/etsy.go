package models

import (
	"time"

	"gorm.io/gorm"
)

// EtsySyncConfig represents the configuration and state for Etsy API synchronization
type EtsySyncConfig struct {
	ID                   uint           `gorm:"primaryKey" json:"id"`
	ShopID               string         `gorm:"uniqueIndex;not null" json:"shop_id"`
	LastProductSync      *time.Time     `json:"last_product_sync,omitempty"`
	LastInventorySync    *time.Time     `json:"last_inventory_sync,omitempty"`
	SyncStatus           string         `gorm:"default:'idle'" json:"sync_status"` // idle, in_progress, error, completed
	SyncError            string         `json:"sync_error,omitempty"`
	RateLimitRemaining   int            `gorm:"default:10000" json:"rate_limit_remaining"`
	RateLimitResetAt     *time.Time     `json:"rate_limit_reset_at,omitempty"`
	CreatedAt            time.Time      `json:"created_at"`
	UpdatedAt            time.Time      `json:"updated_at"`
}

// EtsyProduct represents the mapping between Etsy listings and local products
type EtsyProduct struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	EtsyListingID   int64          `gorm:"uniqueIndex;not null" json:"etsy_listing_id"`
	LocalProductID  *uint          `json:"local_product_id,omitempty"`
	LocalProduct    *EnhancedProduct `gorm:"foreignKey:LocalProductID" json:"local_product,omitempty"`
	Title           string         `gorm:"size:255;not null" json:"title"`
	Description     string         `gorm:"type:text" json:"description,omitempty"`
	Price           float64        `gorm:"type:decimal(10,2)" json:"price,omitempty"`
	Quantity        int            `gorm:"default:0" json:"quantity"`
	SKU             string         `gorm:"size:255" json:"sku,omitempty"`
	State           string         `gorm:"size:50" json:"state,omitempty"` // active, inactive, draft, etc.
	URL             string         `gorm:"type:text" json:"url,omitempty"`
	LastSyncedAt    *time.Time     `json:"last_synced_at,omitempty"`
	SyncStatus      string         `gorm:"default:'pending'" json:"sync_status"` // pending, synced, error
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

// EtsyInventorySyncLog represents a log entry for inventory synchronization operations
type EtsyInventorySyncLog struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	EtsyListingID  int64      `gorm:"not null" json:"etsy_listing_id"`
	LocalVariantID *uint      `json:"local_variant_id,omitempty"`
	LocalVariant   *ProductVariant `gorm:"foreignKey:LocalVariantID" json:"local_variant,omitempty"`
	EtsyQuantity   int        `gorm:"not null" json:"etsy_quantity"`
	LocalQuantity  int        `gorm:"not null" json:"local_quantity"`
	QuantityDiff   int        `json:"quantity_diff"`
	SyncAction     string     `gorm:"size:50" json:"sync_action"` // push_to_etsy, pull_from_etsy, no_change
	SyncResult     string     `gorm:"size:50" json:"sync_result"` // success, error, skipped
	ErrorMessage   string     `gorm:"type:text" json:"error_message,omitempty"`
	SyncedAt       time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"synced_at"`
}

// TableName specifies the table name for EtsySyncConfig
func (EtsySyncConfig) TableName() string {
	return "etsy_sync_config"
}

// TableName specifies the table name for EtsyProduct
func (EtsyProduct) TableName() string {
	return "etsy_products"
}

// TableName specifies the table name for EtsyInventorySyncLog
func (EtsyInventorySyncLog) TableName() string {
	return "etsy_inventory_sync_log"
}

// IsRateLimited checks if the API rate limit has been exceeded
func (c *EtsySyncConfig) IsRateLimited() bool {
	if c.RateLimitResetAt == nil {
		return false
	}
	return c.RateLimitRemaining <= 0 && time.Now().Before(*c.RateLimitResetAt)
}

// UpdateRateLimit updates the rate limit information
func (c *EtsySyncConfig) UpdateRateLimit(remaining int, resetAt time.Time) {
	c.RateLimitRemaining = remaining
	c.RateLimitResetAt = &resetAt
}

// MarkSyncStarted marks the sync as in progress
func (c *EtsySyncConfig) MarkSyncStarted(syncType string) {
	c.SyncStatus = "in_progress"
	c.SyncError = ""
	now := time.Now()
	if syncType == "product" {
		c.LastProductSync = &now
	} else if syncType == "inventory" {
		c.LastInventorySync = &now
	}
}

// MarkSyncCompleted marks the sync as completed successfully
func (c *EtsySyncConfig) MarkSyncCompleted() {
	c.SyncStatus = "completed"
	c.SyncError = ""
}

// MarkSyncError marks the sync as failed with an error message
func (c *EtsySyncConfig) MarkSyncError(err error) {
	c.SyncStatus = "error"
	if err != nil {
		c.SyncError = err.Error()
	}
}
