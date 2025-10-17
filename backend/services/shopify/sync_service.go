package shopify

import (
	"errors"
	"fmt"
	"time"

	"github.com/Naim0996/art-management-tool/backend/models"
	"gorm.io/gorm"
)

var (
	ErrNotConfigured     = errors.New("shopify integration not configured")
	ErrSyncFailed        = errors.New("sync failed")
	ErrProductNotFound   = errors.New("product not found")
	ErrVariantNotFound   = errors.New("variant not found")
	ErrInvalidMapping    = errors.New("invalid shopify mapping")
)

// SyncService handles Shopify synchronization
type SyncService struct {
	db         *gorm.DB
	apiKey     string
	apiSecret  string
	shopDomain string
	enabled    bool
}

// NewSyncService creates a new Shopify sync service
func NewSyncService(db *gorm.DB, apiKey, apiSecret, shopDomain string) *SyncService {
	enabled := apiKey != "" && apiSecret != "" && shopDomain != ""
	return &SyncService{
		db:         db,
		apiKey:     apiKey,
		apiSecret:  apiSecret,
		shopDomain: shopDomain,
		enabled:    enabled,
	}
}

// IsEnabled returns whether Shopify integration is enabled
func (s *SyncService) IsEnabled() bool {
	return s.enabled
}

// PullProducts pulls products from Shopify
func (s *SyncService) PullProducts() error {
	if !s.enabled {
		return ErrNotConfigured
	}
	
	// In production, implement Shopify API integration:
	// 1. Call Shopify Products API
	// 2. Transform Shopify products to local format
	// 3. Create or update local products
	// 4. Update shopify_links mapping
	
	// Stub implementation
	return fmt.Errorf("%w: pull products not yet implemented", ErrSyncFailed)
}

// PushProduct pushes a single product to Shopify
func (s *SyncService) PushProduct(productID uint) error {
	if !s.enabled {
		return ErrNotConfigured
	}
	
	var product models.EnhancedProduct
	if err := s.db.Preload("Variants").Preload("Images").First(&product, productID).Error; err != nil {
		return fmt.Errorf("%w: %v", ErrProductNotFound, err)
	}
	
	// In production:
	// 1. Check if product already exists in Shopify (check shopify_links)
	// 2. Transform local product to Shopify format
	// 3. Create or update product in Shopify
	// 4. Sync variants and images
	// 5. Update shopify_links mapping
	
	// Stub: just update sync timestamp
	var link models.ShopifyLink
	err := s.db.Where("entity_type = ? AND local_id = ?", "product", productID).First(&link).Error
	
	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Create new link
		link = models.ShopifyLink{
			LocalID:    productID,
			ShopifyID:  fmt.Sprintf("shopify_prod_%d", productID), // Mock ID
			EntityType: "product",
		}
	}
	
	now := time.Now()
	link.SyncedAt = &now
	
	if err := s.db.Save(&link).Error; err != nil {
		return fmt.Errorf("%w: %v", ErrSyncFailed, err)
	}
	
	return nil
}

// SyncInventory syncs inventory levels with Shopify
func (s *SyncService) SyncInventory() error {
	if !s.enabled {
		return ErrNotConfigured
	}
	
	// In production:
	// 1. Get all variant mappings from shopify_links
	// 2. For each variant, update inventory in Shopify
	// 3. Use Shopify Inventory API
	
	return fmt.Errorf("%w: inventory sync not yet implemented", ErrSyncFailed)
}

// GetProductMapping retrieves the Shopify mapping for a product
func (s *SyncService) GetProductMapping(productID uint) (*models.ShopifyLink, error) {
	var link models.ShopifyLink
	err := s.db.Where("entity_type = ? AND local_id = ?", "product", productID).First(&link).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInvalidMapping
		}
		return nil, err
	}
	return &link, nil
}

// GetVariantMapping retrieves the Shopify mapping for a variant
func (s *SyncService) GetVariantMapping(variantID uint) (*models.ShopifyLink, error) {
	var link models.ShopifyLink
	err := s.db.Where("entity_type = ? AND local_id = ?", "variant", variantID).First(&link).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInvalidMapping
		}
		return nil, err
	}
	return &link, nil
}

// CreateMapping creates a new Shopify mapping
func (s *SyncService) CreateMapping(entityType string, localID uint, shopifyID string) error {
	link := models.ShopifyLink{
		LocalID:    localID,
		ShopifyID:  shopifyID,
		EntityType: entityType,
	}
	return s.db.Create(&link).Error
}

// DeleteMapping deletes a Shopify mapping
func (s *SyncService) DeleteMapping(entityType string, localID uint) error {
	return s.db.Where("entity_type = ? AND local_id = ?", entityType, localID).
		Delete(&models.ShopifyLink{}).Error
}
