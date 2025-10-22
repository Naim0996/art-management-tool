package etsy

import "time"

// ========================================
// Etsy API v3 DTOs - Complete Definitions
// ========================================

// ListingsResponse represents the Etsy API response for listing endpoints
type ListingsResponse struct {
	Count   int            `json:"count"`
	Results []ListingDTO   `json:"results"`
}

// ListingDTO represents a complete Etsy listing as returned by the API
type ListingDTO struct {
	ListingID           int64                    `json:"listing_id"`
	UserID              int64                    `json:"user_id"`
	ShopID              int64                    `json:"shop_id"`
	Title               string                   `json:"title"`
	Description         string                   `json:"description"`
	State               string                   `json:"state"` // active, inactive, draft, sold_out, expired, edit
	CreationTimestamp   int64                    `json:"creation_timestamp"`
	EndingTimestamp     int64                    `json:"ending_timestamp"`
	OriginalCreationTimestamp int64              `json:"original_creation_timestamp"`
	LastModifiedTimestamp int64                  `json:"last_modified_timestamp"`
	StateTimestamp      int64                    `json:"state_timestamp"`
	Quantity            int                      `json:"quantity"`
	ShopSectionID       *int64                   `json:"shop_section_id,omitempty"`
	FeaturedRank        int                      `json:"featured_rank"`
	URL                 string                   `json:"url"`
	NumFavorers         int                      `json:"num_favorers"`
	NonTaxable          bool                     `json:"non_taxable"`
	IsCustomizable      bool                     `json:"is_customizable"`
	IsPersonalizable    bool                     `json:"is_personalizable"`
	PersonalizationIsRequired bool               `json:"personalization_is_required"`
	PersonalizationCharCountMax *int             `json:"personalization_char_count_max,omitempty"`
	PersonalizationInstructions *string          `json:"personalization_instructions,omitempty"`
	ListingType         string                   `json:"listing_type"` // physical, download, both
	Tags                []string                 `json:"tags"`
	Materials           []string                 `json:"materials"`
	ShippingProfileID   *int64                   `json:"shipping_profile_id,omitempty"`
	ReturnPolicyID      *int64                   `json:"return_policy_id,omitempty"`
	ProcessingMin       *int                     `json:"processing_min,omitempty"`
	ProcessingMax       *int                     `json:"processing_max,omitempty"`
	WhoMade             string                   `json:"who_made"` // i_did, collective, someone_else
	WhenMade            string                   `json:"when_made"` // made_to_order, 2020_2023, 2010_2019, etc.
	IsSupply            bool                     `json:"is_supply"`
	ItemWeight          *float64                 `json:"item_weight,omitempty"`
	ItemWeightUnit      *string                  `json:"item_weight_unit,omitempty"` // oz, lb, g, kg
	ItemLength          *float64                 `json:"item_length,omitempty"`
	ItemWidth           *float64                 `json:"item_width,omitempty"`
	ItemHeight          *float64                 `json:"item_height,omitempty"`
	ItemDimensionsUnit  *string                  `json:"item_dimensions_unit,omitempty"` // in, ft, mm, cm, m
	IsPrivate           bool                     `json:"is_private"`
	Style               []string                 `json:"style,omitempty"`
	FileData            string                   `json:"file_data,omitempty"`
	HasVariations       bool                     `json:"has_variations"`
	ShouldAutoRenew     bool                     `json:"should_auto_renew"`
	Language            string                   `json:"language"`
	Price               PriceDTO                 `json:"price"`
	TaxonomyID          int64                    `json:"taxonomy_id"`
	ShippingProfile     *ShippingProfileDTO      `json:"shipping_profile,omitempty"`
	User                *UserDTO                 `json:"user,omitempty"`
	Shop                *ShopDTO                 `json:"shop,omitempty"`
	Images              []ListingImageDTO        `json:"images,omitempty"`
	Videos              []ListingVideoDTO        `json:"videos,omitempty"`
	Inventory           *ListingInventoryDTO     `json:"inventory,omitempty"`
	ProductionPartners  []ProductionPartnerDTO   `json:"production_partners,omitempty"`
	SKUs                []string                 `json:"skus,omitempty"`
}

// PriceDTO represents a price with currency information
type PriceDTO struct {
	Amount          float64 `json:"amount"`
	Divisor         int     `json:"divisor"`
	CurrencyCode    string  `json:"currency_code"`
}

// ShippingProfileDTO represents a shipping profile
type ShippingProfileDTO struct {
	ShippingProfileID         int64   `json:"shipping_profile_id"`
	Title                     string  `json:"title"`
	UserID                    int64   `json:"user_id"`
	MinProcessingDays         int     `json:"min_processing_days"`
	MaxProcessingDays         int     `json:"max_processing_days"`
	ProcessingDaysDisplayLabel string `json:"processing_days_display_label"`
	OriginCountryISO          string  `json:"origin_country_iso"`
	OriginPostalCode          *string `json:"origin_postal_code,omitempty"`
}

// UserDTO represents an Etsy user (shop owner)
type UserDTO struct {
	UserID           int64  `json:"user_id"`
	PrimaryEmail     string `json:"primary_email,omitempty"`
	FirstName        string `json:"first_name,omitempty"`
	LastName         string `json:"last_name,omitempty"`
	LoginName        string `json:"login_name"`
}

// ShopDTO represents an Etsy shop
type ShopDTO struct {
	ShopID           int64  `json:"shop_id"`
	ShopName         string `json:"shop_name"`
	UserID           int64  `json:"user_id"`
	CreateDate       int64  `json:"create_date"`
	Title            string `json:"title"`
	Announcement     string `json:"announcement,omitempty"`
	CurrencyCode     string `json:"currency_code"`
	IsVacation       bool   `json:"is_vacation"`
	VacationMessage  string `json:"vacation_message,omitempty"`
	SaleMessage      string `json:"sale_message,omitempty"`
	DigitalSaleMessage string `json:"digital_sale_message,omitempty"`
	URL              string `json:"url"`
	ImageURL760x100  string `json:"image_url_760x100,omitempty"`
	NumFavorers      int    `json:"num_favorers"`
	Languages        []string `json:"languages"`
	IconURLFullxfull string `json:"icon_url_fullxfull,omitempty"`
	IsUsingStructuredPolicies bool `json:"is_using_structured_policies"`
	HasOnboardedStructuredPolicies bool `json:"has_onboarded_structured_policies"`
	HasUnstructuredPolicies bool `json:"has_unstructured_policies"`
	PolicyWelcome    string `json:"policy_welcome,omitempty"`
	PolicyPayment    string `json:"policy_payment,omitempty"`
	PolicyShipping   string `json:"policy_shipping,omitempty"`
	PolicyRefunds    string `json:"policy_refunds,omitempty"`
	PolicyAdditional string `json:"policy_additional,omitempty"`
	PolicyPrivacy    string `json:"policy_privacy,omitempty"`
	VacationAutoreply string `json:"vacation_autoreply,omitempty"`
	PolicySellerInfo string `json:"policy_seller_info,omitempty"`
	PolicyUpdateDate int64  `json:"policy_update_date"`
}

// ListingImageDTO represents a listing image
type ListingImageDTO struct {
	ListingImageID int64  `json:"listing_image_id"`
	HexCode        string `json:"hex_code,omitempty"`
	Red            int    `json:"red"`
	Green          int    `json:"green"`
	Blue           int    `json:"blue"`
	Hue            int    `json:"hue"`
	Saturation     int    `json:"saturation"`
	Brightness     int    `json:"brightness"`
	IsBlackAndWhite bool  `json:"is_black_and_white"`
	CreationTsz    int64  `json:"creation_tsz"`
	ListingID      int64  `json:"listing_id"`
	Rank           int    `json:"rank"`
	URL75x75       string `json:"url_75x75"`
	URL170x135     string `json:"url_170x135"`
	URL570xN       string `json:"url_570xN"`
	URLFullxfull   string `json:"url_fullxfull"`
	FullHeight     int    `json:"full_height"`
	FullWidth      int    `json:"full_width"`
	AltText        string `json:"alt_text,omitempty"`
}

// ListingVideoDTO represents a listing video
type ListingVideoDTO struct {
	VideoID    int64  `json:"video_id"`
	Height     int    `json:"height"`
	Width      int    `json:"width"`
	ThumbnailURL string `json:"thumbnail_url"`
	VideoURL   string `json:"video_url"`
	VideoState string `json:"video_state"` // active, inactive
}

// ListingInventoryDTO represents the complete inventory for a listing
type ListingInventoryDTO struct {
	Products     []ListingInventoryProductDTO `json:"products"`
	PriceOnProperty []int64                    `json:"price_on_property,omitempty"`
	QuantityOnProperty []int64                 `json:"quantity_on_property,omitempty"`
	SKUOnProperty []int64                      `json:"sku_on_property,omitempty"`
}

// ListingInventoryProductDTO represents a product within listing inventory
type ListingInventoryProductDTO struct {
	ProductID    int64                           `json:"product_id"`
	SKU          string                          `json:"sku,omitempty"`
	IsDeleted    bool                            `json:"is_deleted"`
	Offerings    []ListingInventoryOfferingDTO   `json:"offerings"`
	PropertyValues []ListingInventoryPropertyValueDTO `json:"property_values"`
}

// ListingInventoryOfferingDTO represents an offering (price/quantity for a specific product)
type ListingInventoryOfferingDTO struct {
	OfferingID int64    `json:"offering_id"`
	Quantity   int      `json:"quantity"`
	IsEnabled  bool     `json:"is_enabled"`
	IsDeleted  bool     `json:"is_deleted"`
	Price      PriceDTO `json:"price"`
}

// ListingInventoryPropertyValueDTO represents a property value (e.g., size: Large, color: Blue)
type ListingInventoryPropertyValueDTO struct {
	PropertyID     int64    `json:"property_id"`
	PropertyName   string   `json:"property_name"`
	ScaleID        *int64   `json:"scale_id,omitempty"`
	ScaleName      *string  `json:"scale_name,omitempty"`
	ValueIDs       []int64  `json:"value_ids"`
	Values         []string `json:"values"`
}

// ProductionPartnerDTO represents a production partner
type ProductionPartnerDTO struct {
	ProductionPartnerID int64  `json:"production_partner_id"`
	PartnerName         string `json:"partner_name"`
	Location            string `json:"location"`
}

// ========================================
// Update/Create Request DTOs
// ========================================

// UpdateListingInventoryRequest represents a request to update listing inventory
type UpdateListingInventoryRequest struct {
	Products []UpdateInventoryProductDTO `json:"products"`
}

// UpdateInventoryProductDTO represents product data for inventory update
type UpdateInventoryProductDTO struct {
	ProductID int64                          `json:"product_id,omitempty"`
	SKU       string                         `json:"sku,omitempty"`
	Offerings []UpdateInventoryOfferingDTO   `json:"offerings"`
	PropertyValues []UpdateInventoryPropertyValueDTO `json:"property_values,omitempty"`
}

// UpdateInventoryOfferingDTO represents offering data for inventory update
type UpdateInventoryOfferingDTO struct {
	OfferingID int64   `json:"offering_id,omitempty"`
	Quantity   int     `json:"quantity"`
	Price      *UpdatePriceDTO `json:"price,omitempty"`
	IsEnabled  bool    `json:"is_enabled"`
}

// UpdatePriceDTO represents price data for updates
type UpdatePriceDTO struct {
	Amount       float64 `json:"amount"`
	Divisor      int     `json:"divisor"`
	CurrencyCode string  `json:"currency_code"`
}

// UpdateInventoryPropertyValueDTO represents property value data for inventory update
type UpdateInventoryPropertyValueDTO struct {
	PropertyID   int64    `json:"property_id,omitempty"`
	PropertyName string   `json:"property_name,omitempty"`
	ScaleID      *int64   `json:"scale_id,omitempty"`
	ValueIDs     []int64  `json:"value_ids,omitempty"`
	Values       []string `json:"values,omitempty"`
}

// ========================================
// Error Response DTOs
// ========================================

// EtsyErrorResponse represents an error response from the Etsy API
type EtsyErrorResponse struct {
	Error string `json:"error"`
	ErrorMsg string `json:"error_msg,omitempty"`
}

// ========================================
// Helper Methods
// ========================================

// GetCreatedAt converts Etsy timestamp to time.Time
func (l *ListingDTO) GetCreatedAt() time.Time {
	return time.Unix(l.CreationTimestamp, 0)
}

// GetUpdatedAt converts Etsy timestamp to time.Time
func (l *ListingDTO) GetUpdatedAt() time.Time {
	return time.Unix(l.LastModifiedTimestamp, 0)
}

// GetPriceAmount returns the actual price as a float
func (p *PriceDTO) GetPriceAmount() float64 {
	if p.Divisor == 0 {
		return p.Amount
	}
	return p.Amount / float64(p.Divisor)
}

// IsActive checks if the listing is in active state
func (l *ListingDTO) IsActive() bool {
	return l.State == "active"
}

// HasInventory checks if the listing has inventory data
func (l *ListingDTO) HasInventory() bool {
	return l.Inventory != nil && len(l.Inventory.Products) > 0
}

// GetTotalQuantity calculates total quantity across all offerings
func (l *ListingDTO) GetTotalQuantity() int {
	if !l.HasInventory() {
		return l.Quantity
	}
	
	total := 0
	for _, product := range l.Inventory.Products {
		for _, offering := range product.Offerings {
			if offering.IsEnabled && !offering.IsDeleted {
				total += offering.Quantity
			}
		}
	}
	return total
}

// GetPrimaryImage returns the primary image URL (highest rank)
func (l *ListingDTO) GetPrimaryImage() string {
	if len(l.Images) == 0 {
		return ""
	}
	
	// Find image with rank 1 or first image
	for _, img := range l.Images {
		if img.Rank == 1 {
			return img.URLFullxfull
		}
	}
	
	return l.Images[0].URLFullxfull
}

// GetSKU returns the primary SKU (first SKU or from first product)
func (l *ListingDTO) GetSKU() string {
	if len(l.SKUs) > 0 {
		return l.SKUs[0]
	}
	
	if l.HasInventory() {
		for _, product := range l.Inventory.Products {
			if product.SKU != "" && !product.IsDeleted {
				return product.SKU
			}
		}
	}
	
	return ""
}
