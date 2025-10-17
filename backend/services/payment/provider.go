package payment

import (
	"errors"
	"github.com/Naim0996/art-management-tool/backend/models"
)

var (
	ErrInvalidAmount      = errors.New("invalid payment amount")
	ErrPaymentFailed      = errors.New("payment failed")
	ErrRefundFailed       = errors.New("refund failed")
	ErrInvalidIntentID    = errors.New("invalid payment intent ID")
	ErrProviderError      = errors.New("payment provider error")
	ErrZeroAmountNotSupported = errors.New("zero amount payments not supported by this provider")
)

// Provider defines the interface for payment providers
type Provider interface {
	// CreatePaymentIntent creates a new payment intent
	CreatePaymentIntent(request *CreatePaymentIntentRequest) (*models.PaymentIntent, error)
	
	// ConfirmPayment confirms a payment intent
	ConfirmPayment(paymentIntentID string) error
	
	// CancelPayment cancels a payment intent
	CancelPayment(paymentIntentID string) error
	
	// Refund refunds a payment
	Refund(transactionID string, amount *float64) (*RefundResponse, error)
	
	// GetPaymentIntent retrieves a payment intent
	GetPaymentIntent(paymentIntentID string) (*models.PaymentIntent, error)
	
	// SupportsZeroAmount returns true if the provider supports zero amount authorizations
	SupportsZeroAmount() bool
	
	// GetMinimumAmount returns the minimum amount supported (in cents)
	GetMinimumAmount() int64
	
	// Name returns the provider name
	Name() string
}

// CreatePaymentIntentRequest represents a payment intent creation request
type CreatePaymentIntentRequest struct {
	Amount      float64
	Currency    string
	CustomerRef string
	Items       []models.PaymentItem
	Metadata    map[string]string
	Description string
}

// RefundResponse represents a refund response
type RefundResponse struct {
	RefundID     string
	Amount       float64
	Currency     string
	Status       string
	TransactionID string
}

// ValidateAmount validates if the amount is acceptable for the provider
func ValidateAmount(provider Provider, amount float64) error {
	if amount < 0 {
		return ErrInvalidAmount
	}
	
	// Convert to cents for comparison
	amountCents := int64(amount * 100)
	
	if amountCents == 0 && !provider.SupportsZeroAmount() {
		return ErrZeroAmountNotSupported
	}
	
	if amountCents < provider.GetMinimumAmount() {
		return ErrInvalidAmount
	}
	
	return nil
}
