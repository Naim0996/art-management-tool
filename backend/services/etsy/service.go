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
	
	// Fetch listings from Etsy with pagination
	const batchSize = 100
	offset := 0
	totalSynced := 0
	
	for {
		listings, err := s.client.GetShopListings(batchSize, offset)
		if err != nil {
			config.MarkSyncError(err)
			s.UpdateSyncConfig(config)
			return fmt.Errorf("failed to fetch listings: %w", err)
		}
		
		if len(listings) == 0 {
			break
		}
		
		// Process each listing
		for _, listing := range listings {
			if err := s.syncSingleListing(&listing); err != nil {
				// Log error but continue with other listings
				fmt.Printf("Error syncing listing %d: %v\n", listing.ListingID, err)
				continue
			}
			totalSynced++
		}
		
		// Check if we need to fetch more
		if len(listings) < batchSize {
			break
		}
		offset += batchSize
	}
	
	// Update rate limit info from client
	remaining, resetAt := s.client.GetRateLimitInfo()
	config.UpdateRateLimit(remaining, resetAt)
	
	// Mark as completed
	config.MarkSyncCompleted()
	if err := s.UpdateSyncConfig(config); err != nil {
		return err
	}
	
	fmt.Printf("Product sync completed: %d listings synced\n", totalSynced)
	return nil
}

// syncSingleListing syncs a single listing to the database
func (s *Service) syncSingleListing(listing *ListingDTO) error {
	// Check if EtsyProduct already exists
	existingProduct, err := s.GetEtsyProduct(listing.ListingID)
	if err != nil {
		return err
	}
	
	// Map listing to EtsyProduct
	etsyProduct := MapListingToEtsyProduct(listing)
	
	if existingProduct == nil {
		// Create new EtsyProduct
		return s.CreateEtsyProduct(etsyProduct)
	} else {
		// Update existing EtsyProduct
		etsyProduct.ID = existingProduct.ID
		etsyProduct.LocalProductID = existingProduct.LocalProductID
		return s.UpdateEtsyProduct(etsyProduct)
	}
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
	
	// Get all EtsyProducts that are synced
	etsyProducts, _, err := s.ListEtsyProducts("synced", 1000, 0)
	if err != nil {
		config.MarkSyncError(err)
		s.UpdateSyncConfig(config)
		return fmt.Errorf("failed to list etsy products: %w", err)
	}
	
	totalSynced := 0
	totalErrors := 0
	
	// Process each product
	for _, etsyProduct := range etsyProducts {
		if err := s.syncSingleInventory(&etsyProduct, direction); err != nil {
			fmt.Printf("Error syncing inventory for listing %d: %v\n", etsyProduct.EtsyListingID, err)
			totalErrors++
			continue
		}
		totalSynced++
	}
	
	// Update rate limit info from client
	remaining, resetAt := s.client.GetRateLimitInfo()
	config.UpdateRateLimit(remaining, resetAt)
	
	// Mark as completed (even with some errors)
	config.MarkSyncCompleted()
	if err := s.UpdateSyncConfig(config); err != nil {
		return err
	}
	
	fmt.Printf("Inventory sync completed: %d synced, %d errors\n", totalSynced, totalErrors)
	return nil
}

// syncSingleInventory syncs inventory for a single product
func (s *Service) syncSingleInventory(etsyProduct *models.EtsyProduct, direction string) error {
	// Fetch current inventory from Etsy
	inventory, err := s.client.GetListingInventory(etsyProduct.EtsyListingID)
	if err != nil {
		return fmt.Errorf("failed to get etsy inventory: %w", err)
	}
	
	// If no local product linked, skip inventory sync
	if etsyProduct.LocalProductID == nil {
		return s.LogInventorySync(&models.EtsyInventorySyncLog{
			EtsyListingID: etsyProduct.EtsyListingID,
			EtsyQuantity:  etsyProduct.Quantity,
			LocalQuantity: 0,
			QuantityDiff:  0,
			SyncAction:    "no_local_product",
			SyncResult:    "skipped",
		})
	}
	
	// Get local product with variants
	var localProduct models.EnhancedProduct
	if err := s.db.Preload("Variants").First(&localProduct, etsyProduct.LocalProductID).Error; err != nil {
		return fmt.Errorf("failed to get local product: %w", err)
	}
	
	// If product has no variants, sync simple inventory
	if len(localProduct.Variants) == 0 {
		return s.syncSimpleInventory(etsyProduct, inventory, direction)
	}
	
	// Otherwise, sync variant inventory
	return s.syncVariantInventory(etsyProduct, &localProduct, inventory, direction)
}

// syncSimpleInventory syncs inventory for products without variants
func (s *Service) syncSimpleInventory(etsyProduct *models.EtsyProduct, inventory *ListingInventoryDTO, direction string) error {
	if len(inventory.Products) == 0 || len(inventory.Products[0].Offerings) == 0 {
		return errors.New("no inventory offerings found")
	}
	
	offering := inventory.Products[0].Offerings[0]
	
	// Determine sync action based on direction
	var syncAction string
	var newQuantity int
	
	switch direction {
	case "push", "local_to_etsy":
		// Push local quantity to Etsy
		newQuantity = etsyProduct.Quantity
		syncAction = "push_to_etsy"
		
		if offering.Quantity != newQuantity {
			if err := s.client.UpdateInventory(etsyProduct.EtsyListingID, newQuantity); err != nil {
				return s.logInventorySyncError(etsyProduct.EtsyListingID, offering.Quantity, etsyProduct.Quantity, syncAction, err)
			}
		}
		
	case "pull", "etsy_to_local":
		// Pull Etsy quantity to local
		newQuantity = offering.Quantity
		syncAction = "pull_from_etsy"
		
		if etsyProduct.Quantity != newQuantity {
			etsyProduct.Quantity = newQuantity
			if err := s.UpdateEtsyProduct(etsyProduct); err != nil {
				return err
			}
		}
		
	default:
		syncAction = "no_change"
	}
	
	// Log the sync operation
	return s.LogInventorySync(&models.EtsyInventorySyncLog{
		EtsyListingID: etsyProduct.EtsyListingID,
		EtsyQuantity:  offering.Quantity,
		LocalQuantity: etsyProduct.Quantity,
		QuantityDiff:  etsyProduct.Quantity - offering.Quantity,
		SyncAction:    syncAction,
		SyncResult:    "success",
	})
}

// syncVariantInventory syncs inventory for products with variants
func (s *Service) syncVariantInventory(etsyProduct *models.EtsyProduct, localProduct *models.EnhancedProduct, inventory *ListingInventoryDTO, direction string) error {
	// For variant-based products, we need to match variants by SKU
	// This is a simplified implementation
	
	successCount := 0
	errorCount := 0
	
	for _, variant := range localProduct.Variants {
		// Find matching Etsy product by SKU
		var matchedOffering *ListingInventoryOfferingDTO
		var matchedProduct *ListingInventoryProductDTO
		
		for i := range inventory.Products {
			if inventory.Products[i].SKU == variant.SKU {
				matchedProduct = &inventory.Products[i]
				if len(matchedProduct.Offerings) > 0 {
					matchedOffering = &matchedProduct.Offerings[0]
				}
				break
			}
		}
		
		if matchedOffering == nil {
			errorCount++
			continue
		}
		
		// Calculate delta and sync
		delta := CalculateInventoryDelta(&variant, matchedOffering, direction)
		if delta == nil || !delta.ShouldSync {
			continue
		}
		
		// Perform sync based on direction
		if delta.SyncDirection == "push" {
			// Update Etsy inventory
			request := MapVariantToUpdateRequest(&variant, matchedProduct.ProductID, matchedOffering.OfferingID, localProduct.BasePrice, localProduct.Currency)
			if err := s.client.UpdateListingInventory(etsyProduct.EtsyListingID, request); err != nil {
				s.logInventorySyncError(etsyProduct.EtsyListingID, matchedOffering.Quantity, variant.Stock, "push_to_etsy", err)
				errorCount++
				continue
			}
		} else if delta.SyncDirection == "pull" {
			// Update local variant
			variant.Stock = matchedOffering.Quantity
			if err := s.db.Save(&variant).Error; err != nil {
				errorCount++
				continue
			}
		}
		
		// Log successful sync
		s.LogInventorySync(&models.EtsyInventorySyncLog{
			EtsyListingID:  etsyProduct.EtsyListingID,
			LocalVariantID: &variant.ID,
			EtsyQuantity:   matchedOffering.Quantity,
			LocalQuantity:  variant.Stock,
			QuantityDiff:   delta.QuantityDiff,
			SyncAction:     delta.SyncDirection,
			SyncResult:     "success",
		})
		successCount++
	}
	
	fmt.Printf("Variant sync for listing %d: %d success, %d errors\n", etsyProduct.EtsyListingID, successCount, errorCount)
	return nil
}

// logInventorySyncError logs a failed inventory sync operation
func (s *Service) logInventorySyncError(listingID int64, etsyQty, localQty int, action string, err error) error {
	return s.LogInventorySync(&models.EtsyInventorySyncLog{
		EtsyListingID: listingID,
		EtsyQuantity:  etsyQty,
		LocalQuantity: localQty,
		QuantityDiff:  localQty - etsyQty,
		SyncAction:    action,
		SyncResult:    "error",
		ErrorMessage:  err.Error(),
	})
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
