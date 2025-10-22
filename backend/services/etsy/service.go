package etsy

import (
	"errors"
	"fmt"
	"time"

	"github.com/Naim0996/art-management-tool/backend/models"
	"gorm.io/gorm"
)

// Service handles Etsy integration business logic
type Service struct {
	db     *gorm.DB
	client *Client
}

// NewService creates a new Etsy service
func NewService(db *gorm.DB, client *Client) *Service {
	return &Service{
		db:     db,
		client: client,
	}
}

// IsEnabled checks if Etsy integration is properly configured
func (s *Service) IsEnabled() bool {
	return s.client != nil && s.client.IsConfigured()
}

// GetSyncConfig retrieves or creates the sync configuration for a shop
func (s *Service) GetSyncConfig(shopID string) (*models.EtsySyncConfig, error) {
	var config models.EtsySyncConfig
	
	err := s.db.Where("shop_id = ?", shopID).First(&config).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Create new config
			config = models.EtsySyncConfig{
				ShopID:             shopID,
				SyncStatus:         "idle",
				RateLimitRemaining: 10000,
			}
			if err := s.db.Create(&config).Error; err != nil {
				return nil, fmt.Errorf("failed to create sync config: %w", err)
			}
			return &config, nil
		}
		return nil, fmt.Errorf("failed to get sync config: %w", err)
	}
	
	return &config, nil
}

// UpdateSyncConfig updates the sync configuration
func (s *Service) UpdateSyncConfig(config *models.EtsySyncConfig) error {
	return s.db.Save(config).Error
}

// SyncProducts synchronizes products from Etsy to local database
func (s *Service) SyncProducts(shopID string) error {
	if !s.IsEnabled() {
		return errors.New("etsy integration not configured")
	}
	
	// Get sync config
	config, err := s.GetSyncConfig(shopID)
	if err != nil {
		return err
	}
	
	// Check rate limit
	if config.IsRateLimited() {
		return fmt.Errorf("rate limit exceeded, resets at %s", config.RateLimitResetAt.Format(time.RFC3339))
	}
	
	// Mark sync as started
	config.MarkSyncStarted("product")
	if err := s.UpdateSyncConfig(config); err != nil {
		return err
	}
	
	// TODO: Implement actual product synchronization
	// 1. Fetch listings from Etsy
	// 2. Create/update etsy_products records
	// 3. Map to local products if needed
	// 4. Update sync config with results
	
	// For now, mark as completed
	config.MarkSyncCompleted()
	return s.UpdateSyncConfig(config)
}

// SyncInventory synchronizes inventory between Etsy and local database
func (s *Service) SyncInventory(shopID string, direction string) error {
	if !s.IsEnabled() {
		return errors.New("etsy integration not configured")
	}
	
	// Get sync config
	config, err := s.GetSyncConfig(shopID)
	if err != nil {
		return err
	}
	
	// Check rate limit
	if config.IsRateLimited() {
		return fmt.Errorf("rate limit exceeded, resets at %s", config.RateLimitResetAt.Format(time.RFC3339))
	}
	
	// Mark sync as started
	config.MarkSyncStarted("inventory")
	if err := s.UpdateSyncConfig(config); err != nil {
		return err
	}
	
	// TODO: Implement actual inventory synchronization
	// 1. Get local products with Etsy mappings
	// 2. For each product:
	//    - Compare quantities
	//    - Sync based on direction (push/pull)
	//    - Log the sync operation
	// 3. Update sync config with results
	
	// For now, mark as completed
	config.MarkSyncCompleted()
	return s.UpdateSyncConfig(config)
}

// GetEtsyProduct retrieves an Etsy product by listing ID
func (s *Service) GetEtsyProduct(listingID int64) (*models.EtsyProduct, error) {
	var product models.EtsyProduct
	err := s.db.Where("etsy_listing_id = ?", listingID).
		Preload("LocalProduct").
		First(&product).Error
	
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	
	return &product, nil
}

// CreateEtsyProduct creates a new Etsy product mapping
func (s *Service) CreateEtsyProduct(product *models.EtsyProduct) error {
	return s.db.Create(product).Error
}

// UpdateEtsyProduct updates an Etsy product mapping
func (s *Service) UpdateEtsyProduct(product *models.EtsyProduct) error {
	return s.db.Save(product).Error
}

// ListEtsyProducts lists all Etsy products with optional filters
func (s *Service) ListEtsyProducts(syncStatus string, limit, offset int) ([]models.EtsyProduct, int64, error) {
	var products []models.EtsyProduct
	var total int64
	
	query := s.db.Model(&models.EtsyProduct{}).Preload("LocalProduct")
	
	if syncStatus != "" {
		query = query.Where("sync_status = ?", syncStatus)
	}
	
	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	
	// Get paginated results
	if err := query.Limit(limit).Offset(offset).Find(&products).Error; err != nil {
		return nil, 0, err
	}
	
	return products, total, nil
}

// LogInventorySync logs an inventory synchronization operation
func (s *Service) LogInventorySync(log *models.EtsyInventorySyncLog) error {
	return s.db.Create(log).Error
}

// GetInventorySyncLogs retrieves inventory sync logs with optional filters
func (s *Service) GetInventorySyncLogs(listingID int64, limit, offset int) ([]models.EtsyInventorySyncLog, int64, error) {
	var logs []models.EtsyInventorySyncLog
	var total int64
	
	query := s.db.Model(&models.EtsyInventorySyncLog{}).Preload("LocalVariant")
	
	if listingID > 0 {
		query = query.Where("etsy_listing_id = ?", listingID)
	}
	
	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	
	// Get paginated results, ordered by most recent first
	if err := query.Order("synced_at DESC").Limit(limit).Offset(offset).Find(&logs).Error; err != nil {
		return nil, 0, err
	}
	
	return logs, total, nil
}
