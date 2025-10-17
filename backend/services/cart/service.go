package cart

import (
	"errors"
	"time"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrCartNotFound    = errors.New("cart not found")
	ErrItemNotFound    = errors.New("item not found")
	ErrInvalidQuantity = errors.New("invalid quantity")
	ErrOutOfStock      = errors.New("product out of stock")
	ErrProductNotFound = errors.New("product not found")
)

// Service handles cart operations
type Service struct {
	db *gorm.DB
}

// NewService creates a new cart service
func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

// GetOrCreateCart gets an existing cart or creates a new one
func (s *Service) GetOrCreateCart(sessionToken string, userID *uint) (*models.Cart, error) {
	var cart models.Cart
	
	err := s.db.Where("session_token = ?", sessionToken).
		Preload("Items.Product").
		Preload("Items.Variant").
		First(&cart).Error
	
	if err == nil {
		return &cart, nil
	}
	
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	
	// Create new cart
	expiresAt := time.Now().Add(30 * 24 * time.Hour) // 30 days
	cart = models.Cart{
		SessionToken: sessionToken,
		UserID:       userID,
		ExpiresAt:    &expiresAt,
		Items:        []models.CartItem{},
	}
	
	if err := s.db.Create(&cart).Error; err != nil {
		return nil, err
	}
	
	return &cart, nil
}

// AddItem adds an item to the cart
func (s *Service) AddItem(sessionToken string, productID uint, variantID *uint, quantity int) (*models.Cart, error) {
	if quantity <= 0 {
		return nil, ErrInvalidQuantity
	}
	
	// Verify product exists and has stock
	var product models.EnhancedProduct
	if err := s.db.First(&product, productID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrProductNotFound
		}
		return nil, err
	}
	
	// If variant specified, verify it exists and has stock
	if variantID != nil {
		var variant models.ProductVariant
		if err := s.db.First(&variant, *variantID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrProductNotFound
			}
			return nil, err
		}
		
		if variant.Stock < quantity {
			return nil, ErrOutOfStock
		}
	}
	
	// Get or create cart
	cart, err := s.GetOrCreateCart(sessionToken, nil)
	if err != nil {
		return nil, err
	}
	
	// Check if item already exists in cart
	var existingItem models.CartItem
	query := s.db.Where("cart_id = ? AND product_id = ?", cart.ID, productID)
	if variantID != nil {
		query = query.Where("variant_id = ?", *variantID)
	} else {
		query = query.Where("variant_id IS NULL")
	}
	
	err = query.First(&existingItem).Error
	if err == nil {
		// Update quantity
		existingItem.Quantity += quantity
		if err := s.db.Save(&existingItem).Error; err != nil {
			return nil, err
		}
	} else if errors.Is(err, gorm.ErrRecordNotFound) {
		// Create new item
		item := models.CartItem{
			CartID:    cart.ID,
			ProductID: productID,
			VariantID: variantID,
			Quantity:  quantity,
		}
		if err := s.db.Create(&item).Error; err != nil {
			return nil, err
		}
	} else {
		return nil, err
	}
	
	// Reload cart with items
	return s.GetOrCreateCart(sessionToken, nil)
}

// UpdateItemQuantity updates the quantity of an item
func (s *Service) UpdateItemQuantity(sessionToken string, itemID uint, quantity int) (*models.Cart, error) {
	if quantity < 0 {
		return nil, ErrInvalidQuantity
	}
	
	cart, err := s.GetOrCreateCart(sessionToken, nil)
	if err != nil {
		return nil, err
	}
	
	var item models.CartItem
	if err := s.db.Where("id = ? AND cart_id = ?", itemID, cart.ID).First(&item).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrItemNotFound
		}
		return nil, err
	}
	
	if quantity == 0 {
		// Remove item
		if err := s.db.Delete(&item).Error; err != nil {
			return nil, err
		}
	} else {
		// Update quantity
		item.Quantity = quantity
		if err := s.db.Save(&item).Error; err != nil {
			return nil, err
		}
	}
	
	// Reload cart
	return s.GetOrCreateCart(sessionToken, nil)
}

// RemoveItem removes an item from the cart
func (s *Service) RemoveItem(sessionToken string, itemID uint) (*models.Cart, error) {
	cart, err := s.GetOrCreateCart(sessionToken, nil)
	if err != nil {
		return nil, err
	}
	
	result := s.db.Where("id = ? AND cart_id = ?", itemID, cart.ID).Delete(&models.CartItem{})
	if result.Error != nil {
		return nil, result.Error
	}
	
	if result.RowsAffected == 0 {
		return nil, ErrItemNotFound
	}
	
	// Reload cart
	return s.GetOrCreateCart(sessionToken, nil)
}

// ClearCart removes all items from the cart
func (s *Service) ClearCart(sessionToken string) error {
	cart, err := s.GetOrCreateCart(sessionToken, nil)
	if err != nil {
		return err
	}
	
	return s.db.Where("cart_id = ?", cart.ID).Delete(&models.CartItem{}).Error
}

// CalculateTotal calculates the total for a cart
func (s *Service) CalculateTotal(cart *models.Cart) (subtotal, tax, discount, total float64) {
	for _, item := range cart.Items {
		itemTotal := item.CalculateTotal()
		subtotal += itemTotal
	}
	
	// Placeholder tax calculation (can be enhanced with tax rules)
	tax = subtotal * 0.0 // No tax for now
	
	// Discount will be applied during checkout
	discount = 0.0
	
	total = subtotal + tax - discount
	return
}

// GenerateSessionToken generates a new session token
func GenerateSessionToken() string {
	return uuid.New().String()
}

// MergeGuestCart merges a guest cart into a user cart after login
func (s *Service) MergeGuestCart(guestToken string, userID uint, userToken string) (*models.Cart, error) {
	// Get guest cart
	var guestCart models.Cart
	err := s.db.Where("session_token = ?", guestToken).
		Preload("Items").
		First(&guestCart).Error
	
	if errors.Is(err, gorm.ErrRecordNotFound) {
		// No guest cart, just get or create user cart
		return s.GetOrCreateCart(userToken, &userID)
	}
	
	if err != nil {
		return nil, err
	}
	
	// Get or create user cart
	userCart, err := s.GetOrCreateCart(userToken, &userID)
	if err != nil {
		return nil, err
	}
	
	// Transfer items from guest cart to user cart
	for _, guestItem := range guestCart.Items {
		// Check if item already exists in user cart
		var existingItem models.CartItem
		query := s.db.Where("cart_id = ? AND product_id = ?", userCart.ID, guestItem.ProductID)
		if guestItem.VariantID != nil {
			query = query.Where("variant_id = ?", *guestItem.VariantID)
		} else {
			query = query.Where("variant_id IS NULL")
		}
		
		err := query.First(&existingItem).Error
		if err == nil {
			// Update quantity
			existingItem.Quantity += guestItem.Quantity
			s.db.Save(&existingItem)
		} else if errors.Is(err, gorm.ErrRecordNotFound) {
			// Transfer item
			guestItem.CartID = userCart.ID
			s.db.Save(&guestItem)
		}
	}
	
	// Delete guest cart
	s.db.Delete(&guestCart)
	
	// Reload user cart
	return s.GetOrCreateCart(userToken, &userID)
}

// CleanupExpiredCarts removes expired carts
func (s *Service) CleanupExpiredCarts() error {
	return s.db.Where("expires_at < ?", time.Now()).Delete(&models.Cart{}).Error
}
