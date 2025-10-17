package order

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/Naim0996/art-management-tool/backend/services/notification"
	"github.com/Naim0996/art-management-tool/backend/services/payment"
	"gorm.io/gorm"
)

var (
	ErrOrderNotFound     = errors.New("order not found")
	ErrInvalidOrder      = errors.New("invalid order")
	ErrInsufficientStock = errors.New("insufficient stock")
	ErrRefundFailed      = errors.New("refund failed")
)

// Service handles order operations
type Service struct {
	db              *gorm.DB
	paymentProvider payment.Provider
	notifService    *notification.Service
}

// NewService creates a new order service
func NewService(db *gorm.DB, paymentProvider payment.Provider, notifService *notification.Service) *Service {
	return &Service{
		db:              db,
		paymentProvider: paymentProvider,
		notifService:    notifService,
	}
}

// CreateOrder creates an order from a cart with payment
func (s *Service) CreateOrder(cart *models.Cart, req *models.CheckoutRequest, discountCode *models.DiscountCode) (*models.Order, *models.PaymentIntent, error) {
	// Start transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	
	// Calculate totals
	var subtotal float64
	var items []models.OrderItem
	
	for _, cartItem := range cart.Items {
		if cartItem.Product == nil {
			tx.Rollback()
			return nil, nil, fmt.Errorf("product not loaded for cart item %d", cartItem.ID)
		}
		
		unitPrice := cartItem.Product.BasePrice
		if cartItem.Variant != nil {
			unitPrice += cartItem.Variant.PriceAdjustment
			
			// Check and reserve stock
			if cartItem.Variant.Stock < cartItem.Quantity {
				tx.Rollback()
				return nil, nil, fmt.Errorf("%w: %s", ErrInsufficientStock, cartItem.Variant.Name)
			}
			
			// Reserve stock
			if err := tx.Model(&models.ProductVariant{}).
				Where("id = ? AND stock >= ?", cartItem.Variant.ID, cartItem.Quantity).
				Update("stock", gorm.Expr("stock - ?", cartItem.Quantity)).Error; err != nil {
				tx.Rollback()
				return nil, nil, err
			}
		}
		
		totalPrice := unitPrice * float64(cartItem.Quantity)
		subtotal += totalPrice
		
		variantName := ""
		sku := cartItem.Product.SKU
		if cartItem.Variant != nil {
			variantName = cartItem.Variant.Name
			sku = cartItem.Variant.SKU
		}
		
		items = append(items, models.OrderItem{
			ProductID:   &cartItem.ProductID,
			VariantID:   cartItem.VariantID,
			ProductName: cartItem.Product.Title,
			VariantName: variantName,
			SKU:         sku,
			Quantity:    cartItem.Quantity,
			UnitPrice:   unitPrice,
			TotalPrice:  totalPrice,
		})
	}
	
	// Calculate discount
	discount := 0.0
	if discountCode != nil && discountCode.IsValid() {
		discount = discountCode.CalculateDiscount(subtotal)
	}
	
	// Calculate tax (placeholder)
	tax := 0.0
	
	total := subtotal + tax - discount
	
	// Serialize addresses
	shippingJSON, _ := json.Marshal(req.ShippingAddress)
	billingJSON := shippingJSON
	if req.BillingAddress.Street != "" {
		billingJSON, _ = json.Marshal(req.BillingAddress)
	}
	
	// Generate order number
	orderNumber := fmt.Sprintf("ORD-%d", time.Now().Unix())
	
	// Create order
	order := models.Order{
		OrderNumber:       orderNumber,
		UserID:            cart.UserID,
		CustomerEmail:     req.Email,
		CustomerName:      req.Name,
		Subtotal:          subtotal,
		Tax:               tax,
		Discount:          discount,
		Total:             total,
		Currency:          "EUR",
		PaymentStatus:     models.PaymentStatusPending,
		PaymentMethod:     string(req.PaymentMethod),
		FulfillmentStatus: models.FulfillmentStatusUnfulfilled,
		ShippingAddress:   string(shippingJSON),
		BillingAddress:    string(billingJSON),
		Items:             items,
	}
	
	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		return nil, nil, err
	}
	
	// Create payment intent
	paymentItems := make([]models.PaymentItem, len(items))
	for i, item := range items {
		paymentItems[i] = models.PaymentItem{
			Name:     item.ProductName,
			Amount:   item.UnitPrice,
			Quantity: item.Quantity,
		}
	}
	
	paymentReq := &payment.CreatePaymentIntentRequest{
		Amount:      total,
		Currency:    "EUR",
		CustomerRef: req.Email,
		Items:       paymentItems,
		Metadata: map[string]string{
			"order_id":     fmt.Sprintf("%d", order.ID),
			"order_number": orderNumber,
		},
		Description: fmt.Sprintf("Order %s", orderNumber),
	}
	
	paymentIntent, err := s.paymentProvider.CreatePaymentIntent(paymentReq)
	if err != nil {
		tx.Rollback()
		
		// Create notification for payment failure
		s.notifService.CreatePaymentFailedNotification(orderNumber, total, err.Error())
		
		return nil, nil, fmt.Errorf("payment creation failed: %w", err)
	}
	
	// Update order with payment intent ID
	order.PaymentIntentID = paymentIntent.ID
	if err := tx.Save(&order).Error; err != nil {
		tx.Rollback()
		return nil, nil, err
	}
	
	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		// Try to cancel payment
		s.paymentProvider.CancelPayment(paymentIntent.ID)
		return nil, nil, err
	}
	
	// Create notification
	s.notifService.CreateOrderCreatedNotification(orderNumber, req.Email, total)
	
	// Update discount code usage
	if discountCode != nil {
		s.db.Model(discountCode).Update("used_count", gorm.Expr("used_count + 1"))
	}
	
	return &order, paymentIntent, nil
}

// HandlePaymentSuccess handles successful payment webhook
func (s *Service) HandlePaymentSuccess(paymentIntentID string) error {
	var order models.Order
	err := s.db.Where("payment_intent_id = ?", paymentIntentID).First(&order).Error
	if err != nil {
		return fmt.Errorf("order not found for payment intent %s: %w", paymentIntentID, err)
	}
	
	order.PaymentStatus = models.PaymentStatusPaid
	
	if err := s.db.Save(&order).Error; err != nil {
		return err
	}
	
	// Create notification
	s.notifService.CreateOrderPaidNotification(order.OrderNumber, order.Total)
	
	return nil
}

// HandlePaymentFailed handles failed payment webhook
func (s *Service) HandlePaymentFailed(paymentIntentID string, reason string) error {
	var order models.Order
	err := s.db.Where("payment_intent_id = ?", paymentIntentID).First(&order).Error
	if err != nil {
		return fmt.Errorf("order not found for payment intent %s: %w", paymentIntentID, err)
	}
	
	// Start transaction to release stock
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	
	// Release reserved stock
	for _, item := range order.Items {
		if item.VariantID != nil {
			tx.Model(&models.ProductVariant{}).
				Where("id = ?", *item.VariantID).
				Update("stock", gorm.Expr("stock + ?", item.Quantity))
		}
	}
	
	order.PaymentStatus = models.PaymentStatusFailed
	
	if err := tx.Save(&order).Error; err != nil {
		tx.Rollback()
		return err
	}
	
	if err := tx.Commit().Error; err != nil {
		return err
	}
	
	// Create notification
	s.notifService.CreatePaymentFailedNotification(order.OrderNumber, order.Total, reason)
	
	return nil
}

// GetOrder gets an order by ID
func (s *Service) GetOrder(id uint) (*models.Order, error) {
	var order models.Order
	err := s.db.Preload("Items").First(&order, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}
	return &order, nil
}

// ListOrders lists orders with filters
func (s *Service) ListOrders(filters *OrderFilters) ([]models.Order, int64, error) {
	var orders []models.Order
	var total int64
	
	query := s.db.Model(&models.Order{})
	
	// Apply filters
	if filters.PaymentStatus != "" {
		query = query.Where("payment_status = ?", filters.PaymentStatus)
	}
	
	if filters.FulfillmentStatus != "" {
		query = query.Where("fulfillment_status = ?", filters.FulfillmentStatus)
	}
	
	if filters.CustomerEmail != "" {
		query = query.Where("customer_email = ?", filters.CustomerEmail)
	}
	
	if !filters.StartDate.IsZero() {
		query = query.Where("created_at >= ?", filters.StartDate)
	}
	
	if !filters.EndDate.IsZero() {
		query = query.Where("created_at <= ?", filters.EndDate)
	}
	
	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	
	// Apply pagination
	offset := (filters.Page - 1) * filters.PerPage
	query = query.Offset(offset).Limit(filters.PerPage)
	
	// Order
	query = query.Order("created_at DESC")
	
	// Load items
	query = query.Preload("Items")
	
	if err := query.Find(&orders).Error; err != nil {
		return nil, 0, err
	}
	
	return orders, total, nil
}

// UpdateFulfillmentStatus updates the fulfillment status
func (s *Service) UpdateFulfillmentStatus(id uint, status models.FulfillmentStatus) error {
	var order models.Order
	if err := s.db.First(&order, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrOrderNotFound
		}
		return err
	}
	
	order.FulfillmentStatus = status
	return s.db.Save(&order).Error
}

// RefundOrder refunds an order
func (s *Service) RefundOrder(id uint, amount *float64) error {
	var order models.Order
	if err := s.db.Preload("Items").First(&order, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrOrderNotFound
		}
		return err
	}
	
	if order.PaymentStatus != models.PaymentStatusPaid {
		return fmt.Errorf("cannot refund order that is not paid")
	}
	
	// Process refund through payment provider
	_, err := s.paymentProvider.Refund(order.PaymentIntentID, amount)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrRefundFailed, err)
	}
	
	// Start transaction to restore stock
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	
	// Restore stock
	for _, item := range order.Items {
		if item.VariantID != nil {
			tx.Model(&models.ProductVariant{}).
				Where("id = ?", *item.VariantID).
				Update("stock", gorm.Expr("stock + ?", item.Quantity))
		}
	}
	
	order.PaymentStatus = models.PaymentStatusRefunded
	
	if err := tx.Save(&order).Error; err != nil {
		tx.Rollback()
		return err
	}
	
	if err := tx.Commit().Error; err != nil {
		return err
	}
	
	return nil
}

// OrderFilters represents filters for order listing
type OrderFilters struct {
	PaymentStatus     models.PaymentStatus
	FulfillmentStatus models.FulfillmentStatus
	CustomerEmail     string
	StartDate         time.Time
	EndDate           time.Time
	Page              int
	PerPage           int
}

// DefaultFilters returns default order filters
func DefaultFilters() *OrderFilters {
	return &OrderFilters{
		Page:    1,
		PerPage: 20,
	}
}
