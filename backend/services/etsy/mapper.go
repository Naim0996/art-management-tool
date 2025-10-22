package etsy

import (
	"fmt"
	"strings"
	"time"

	"github.com/Naim0996/art-management-tool/backend/models"
)

// ========================================
// Etsy DTO to Local Model Mapping
// ========================================

// MapListingToEtsyProduct converts an Etsy listing DTO to an EtsyProduct model
func MapListingToEtsyProduct(listing *ListingDTO) *models.EtsyProduct {
	now := time.Now()
	
	return &models.EtsyProduct{
		EtsyListingID: listing.ListingID,
		Title:         listing.Title,
		Description:   listing.Description,
		Price:         listing.Price.GetPriceAmount(),
		Quantity:      listing.GetTotalQuantity(),
		SKU:           listing.GetSKU(),
		State:         listing.State,
		URL:           listing.URL,
		LastSyncedAt:  &now,
		SyncStatus:    "synced",
	}
}

// MapListingToProduct converts an Etsy listing DTO to a local Product model
// This is used when creating a new local product from an Etsy listing
func MapListingToProduct(listing *ListingDTO) *models.EnhancedProduct {
	now := time.Now()
	
	// Generate a slug from the title
	slug := generateSlug(listing.Title)
	
	// Determine status based on listing state
	status := models.ProductStatusDraft
	if listing.IsActive() {
		status = models.ProductStatusPublished
	}
	
	return &models.EnhancedProduct{
		Title:            listing.Title,
		ShortDescription: listing.Description,
		LongDescription:  listing.Description,
		BasePrice:        listing.Price.GetPriceAmount(),
		Currency:         listing.Price.CurrencyCode,
		SKU:              listing.GetSKU(),
		Slug:             slug,
		Status:           status,
		CreatedAt:        now,
		UpdatedAt:        now,
	}
}

// MapInventoryToProductVariant converts Etsy inventory product to a ProductVariant
func MapInventoryToProductVariant(product *ListingInventoryProductDTO, listing *ListingDTO, basePrice float64) *models.ProductVariant {
	if len(product.Offerings) == 0 {
		return nil
	}
	
	// Use first offering for simplicity (in complex scenarios, handle multiple offerings)
	offering := product.Offerings[0]
	
	// Build variant name from property values
	variantName := buildVariantName(product.PropertyValues)
	if variantName == "" {
		variantName = "Default"
	}
	
	// Calculate price adjustment relative to base price
	priceAdjustment := offering.Price.GetPriceAmount() - basePrice
	
	now := time.Now()
	
	return &models.ProductVariant{
		SKU:             product.SKU,
		Name:            variantName,
		PriceAdjustment: priceAdjustment,
		Stock:           offering.Quantity,
		CreatedAt:       now,
		UpdatedAt:       now,
	}
}

// ========================================
// Local Model to Etsy DTO Mapping
// ========================================

// MapProductToUpdateRequest converts a local product to an Etsy inventory update request
// This is used when pushing local changes to Etsy
func MapProductToUpdateRequest(product *models.EnhancedProduct, etsyProduct *models.EtsyProduct) *UpdateListingInventoryRequest {
	if product == nil || etsyProduct == nil {
		return nil
	}
	
	// For simple products without variants, create a single product entry
	products := []UpdateInventoryProductDTO{
		{
			SKU: etsyProduct.SKU,
			Offerings: []UpdateInventoryOfferingDTO{
				{
					Quantity:  etsyProduct.Quantity,
					IsEnabled: product.Status == models.ProductStatusPublished,
					Price: &UpdatePriceDTO{
						Amount:       product.BasePrice * 100, // Convert to cents
						Divisor:      100,
						CurrencyCode: product.Currency,
					},
				},
			},
		},
	}
	
	return &UpdateListingInventoryRequest{
		Products: products,
	}
}

// MapVariantToUpdateRequest converts a product variant to an Etsy offering update
func MapVariantToUpdateRequest(variant *models.ProductVariant, productID, offeringID int64, basePrice float64, currency string) *UpdateListingInventoryRequest {
	if variant == nil {
		return nil
	}
	
	// Calculate actual price from base price and adjustment
	actualPrice := basePrice + variant.PriceAdjustment
	
	products := []UpdateInventoryProductDTO{
		{
			ProductID: productID,
			SKU:       variant.SKU,
			Offerings: []UpdateInventoryOfferingDTO{
				{
					OfferingID: offeringID,
					Quantity:   variant.Stock,
					IsEnabled:  true, // Variants don't have an IsActive flag
					Price: &UpdatePriceDTO{
						Amount:       actualPrice * 100,
						Divisor:      100,
						CurrencyCode: currency,
					},
				},
			},
		},
	}
	
	return &UpdateListingInventoryRequest{
		Products: products,
	}
}

// ========================================
// Sync Delta Calculation
// ========================================

// InventoryDelta represents the difference between local and Etsy inventory
type InventoryDelta struct {
	ListingID      int64
	SKU            string
	LocalQuantity  int
	EtsyQuantity   int
	QuantityDiff   int
	ShouldSync     bool
	SyncDirection  string // "push", "pull", "none"
}

// CalculateInventoryDelta compares local and Etsy inventory to determine sync action
func CalculateInventoryDelta(localVariant *models.ProductVariant, etsyOffering *ListingInventoryOfferingDTO, syncDirection string) *InventoryDelta {
	if localVariant == nil || etsyOffering == nil {
		return nil
	}
	
	delta := &InventoryDelta{
		SKU:           localVariant.SKU,
		LocalQuantity: localVariant.Stock,
		EtsyQuantity:  etsyOffering.Quantity,
		QuantityDiff:  localVariant.Stock - etsyOffering.Quantity,
	}
	
	// Determine if sync is needed
	if delta.QuantityDiff == 0 {
		delta.ShouldSync = false
		delta.SyncDirection = "none"
		return delta
	}
	
	// Determine sync direction based on configuration
	switch syncDirection {
	case "push", "local_to_etsy":
		delta.ShouldSync = true
		delta.SyncDirection = "push"
	case "pull", "etsy_to_local":
		delta.ShouldSync = true
		delta.SyncDirection = "pull"
	case "bidirectional", "auto":
		// In bidirectional mode, we need a strategy to resolve conflicts
		// For now, we prioritize the most recent change (would need timestamps)
		// As a simple heuristic, we don't sync if difference is small
		if abs(delta.QuantityDiff) > 5 {
			delta.ShouldSync = true
			// Default to push for bidirectional
			delta.SyncDirection = "push"
		}
	default:
		delta.ShouldSync = false
		delta.SyncDirection = "none"
	}
	
	return delta
}

// ========================================
// Helper Functions
// ========================================

// generateSlug creates a URL-friendly slug from a title
func generateSlug(title string) string {
	// Convert to lowercase
	slug := strings.ToLower(title)
	
	// Replace spaces with hyphens
	slug = strings.ReplaceAll(slug, " ", "-")
	
	// Remove special characters (keep only alphanumeric and hyphens)
	var result strings.Builder
	for _, char := range slug {
		if (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char == '-' {
			result.WriteRune(char)
		}
	}
	
	slug = result.String()
	
	// Remove multiple consecutive hyphens
	for strings.Contains(slug, "--") {
		slug = strings.ReplaceAll(slug, "--", "-")
	}
	
	// Trim hyphens from start and end
	slug = strings.Trim(slug, "-")
	
	// Limit length to 100 characters
	if len(slug) > 100 {
		slug = slug[:100]
	}
	
	return slug
}

// buildVariantName constructs a variant name from property values
func buildVariantName(propertyValues []ListingInventoryPropertyValueDTO) string {
	if len(propertyValues) == 0 {
		return ""
	}
	
	var parts []string
	for _, prop := range propertyValues {
		if len(prop.Values) > 0 {
			// Join property name and value
			parts = append(parts, fmt.Sprintf("%s: %s", prop.PropertyName, strings.Join(prop.Values, ", ")))
		}
	}
	
	return strings.Join(parts, " | ")
}

// convertWeight extracts weight information from listing
func convertWeight(listing *ListingDTO) *float64 {
	if listing.ItemWeight != nil {
		weight := *listing.ItemWeight
		
		// Convert to kg (standard unit)
		if listing.ItemWeightUnit != nil {
			switch *listing.ItemWeightUnit {
			case "oz":
				weight = weight * 0.0283495 // oz to kg
			case "lb":
				weight = weight * 0.453592 // lb to kg
			case "g":
				weight = weight / 1000 // g to kg
			// "kg" remains as is
			}
		}
		
		return &weight
	}
	return nil
}

// convertDimensions extracts dimensions from listing as a string
func convertDimensions(listing *ListingDTO) *string {
	if listing.ItemLength == nil || listing.ItemWidth == nil || listing.ItemHeight == nil {
		return nil
	}
	
	unit := "cm"
	if listing.ItemDimensionsUnit != nil {
		unit = *listing.ItemDimensionsUnit
	}
	
	dimensions := fmt.Sprintf("%.2f x %.2f x %.2f %s", 
		*listing.ItemLength, 
		*listing.ItemWidth, 
		*listing.ItemHeight, 
		unit,
	)
	
	return &dimensions
}

// abs returns the absolute value of an integer
func abs(n int) int {
	if n < 0 {
		return -n
	}
	return n
}

// ========================================
// Batch Mapping Functions
// ========================================

// MapListingsToEtsyProducts converts multiple listings to EtsyProduct models
func MapListingsToEtsyProducts(listings []ListingDTO) []models.EtsyProduct {
	products := make([]models.EtsyProduct, 0, len(listings))
	
	for _, listing := range listings {
		product := MapListingToEtsyProduct(&listing)
		if product != nil {
			products = append(products, *product)
		}
	}
	
	return products
}

// MapListingsToProducts converts multiple listings to Product models
func MapListingsToProducts(listings []ListingDTO) []models.EnhancedProduct {
	products := make([]models.EnhancedProduct, 0, len(listings))
	
	for _, listing := range listings {
		product := MapListingToProduct(&listing)
		if product != nil {
			products = append(products, *product)
		}
	}
	
	return products
}
