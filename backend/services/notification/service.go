package notification

import (
	"encoding/json"
	"fmt"

	"github.com/Naim0996/art-management-tool/backend/models"
	"gorm.io/gorm"
)

// Service handles notification operations
type Service struct {
	db *gorm.DB
}

// NewService creates a new notification service
func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

// Create creates a new notification
func (s *Service) Create(notif *models.Notification) error {
	return s.db.Create(notif).Error
}

// CreateLowStockNotification creates a low stock notification
func (s *Service) CreateLowStockNotification(productID uint, productName string, variantName string, stock int) error {
	payload := map[string]interface{}{
		"product_id":   productID,
		"product_name": productName,
		"variant_name": variantName,
		"stock":        stock,
	}
	
	payloadJSON, _ := json.Marshal(payload)
	
	notif := &models.Notification{
		Type:     models.NotificationTypeLowStock,
		Severity: models.NotificationSeverityWarning,
		Title:    fmt.Sprintf("Low Stock Alert: %s", productName),
		Message:  fmt.Sprintf("%s %s is running low on stock (current: %d)", productName, variantName, stock),
		Payload:  string(payloadJSON),
	}
	
	return s.Create(notif)
}

// CreatePaymentFailedNotification creates a payment failed notification
func (s *Service) CreatePaymentFailedNotification(orderNumber string, amount float64, reason string) error {
	payload := map[string]interface{}{
		"order_number": orderNumber,
		"amount":       amount,
		"reason":       reason,
	}
	
	payloadJSON, _ := json.Marshal(payload)
	
	notif := &models.Notification{
		Type:     models.NotificationTypePaymentFailed,
		Severity: models.NotificationSeverityError,
		Title:    fmt.Sprintf("Payment Failed: Order %s", orderNumber),
		Message:  fmt.Sprintf("Payment of €%.2f failed for order %s. Reason: %s", amount, orderNumber, reason),
		Payload:  string(payloadJSON),
	}
	
	return s.Create(notif)
}

// CreateOrderCreatedNotification creates an order created notification
func (s *Service) CreateOrderCreatedNotification(orderNumber string, customerEmail string, total float64) error {
	payload := map[string]interface{}{
		"order_number":   orderNumber,
		"customer_email": customerEmail,
		"total":          total,
	}
	
	payloadJSON, _ := json.Marshal(payload)
	
	notif := &models.Notification{
		Type:     models.NotificationTypeOrderCreated,
		Severity: models.NotificationSeverityInfo,
		Title:    fmt.Sprintf("New Order: %s", orderNumber),
		Message:  fmt.Sprintf("New order from %s for €%.2f", customerEmail, total),
		Payload:  string(payloadJSON),
	}
	
	return s.Create(notif)
}

// CreateOrderPaidNotification creates an order paid notification
func (s *Service) CreateOrderPaidNotification(orderNumber string, total float64) error {
	payload := map[string]interface{}{
		"order_number": orderNumber,
		"total":        total,
	}
	
	payloadJSON, _ := json.Marshal(payload)
	
	notif := &models.Notification{
		Type:     models.NotificationTypeOrderPaid,
		Severity: models.NotificationSeverityInfo,
		Title:    fmt.Sprintf("Payment Received: Order %s", orderNumber),
		Message:  fmt.Sprintf("Payment of €%.2f received for order %s", total, orderNumber),
		Payload:  string(payloadJSON),
	}
	
	return s.Create(notif)
}

// List lists notifications with filters
func (s *Service) List(filters *NotificationFilters) ([]models.Notification, int64, error) {
	var notifications []models.Notification
	var total int64
	
	query := s.db.Model(&models.Notification{})
	
	// Apply filters
	if filters.Type != "" {
		query = query.Where("type = ?", filters.Type)
	}
	
	if filters.Severity != "" {
		query = query.Where("severity = ?", filters.Severity)
	}
	
	if filters.Unread {
		query = query.Where("read_at IS NULL")
	}
	
	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	
	// Apply pagination
	offset := (filters.Page - 1) * filters.PerPage
	query = query.Offset(offset).Limit(filters.PerPage)
	
	// Order by created_at DESC
	query = query.Order("created_at DESC")
	
	if err := query.Find(&notifications).Error; err != nil {
		return nil, 0, err
	}
	
	return notifications, total, nil
}

// Get gets a notification by ID
func (s *Service) Get(id uint) (*models.Notification, error) {
	var notif models.Notification
	if err := s.db.First(&notif, id).Error; err != nil {
		return nil, err
	}
	return &notif, nil
}

// MarkAsRead marks a notification as read
func (s *Service) MarkAsRead(id uint) error {
	var notif models.Notification
	if err := s.db.First(&notif, id).Error; err != nil {
		return err
	}
	
	notif.MarkAsRead()
	return s.db.Save(&notif).Error
}

// MarkAllAsRead marks all notifications as read
func (s *Service) MarkAllAsRead() error {
	return s.db.Model(&models.Notification{}).
		Where("read_at IS NULL").
		Update("read_at", gorm.Expr("NOW()")).Error
}

// Delete deletes a notification
func (s *Service) Delete(id uint) error {
	return s.db.Delete(&models.Notification{}, id).Error
}

// GetUnreadCount returns the count of unread notifications
func (s *Service) GetUnreadCount() (int64, error) {
	var count int64
	err := s.db.Model(&models.Notification{}).Where("read_at IS NULL").Count(&count).Error
	return count, err
}

// NotificationFilters represents filters for notification listing
type NotificationFilters struct {
	Type     models.NotificationType
	Severity models.NotificationSeverity
	Unread   bool
	Page     int
	PerPage  int
}

// DefaultFilters returns default notification filters
func DefaultFilters() *NotificationFilters {
	return &NotificationFilters{
		Page:    1,
		PerPage: 20,
	}
}
