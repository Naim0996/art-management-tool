package payment

import (
	"fmt"
	"sync"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/google/uuid"
)

// MockProvider is a mock payment provider for testing
type MockProvider struct {
	name           string
	minAmount      int64
	supportsZero   bool
	intents        map[string]*models.PaymentIntent
	mu             sync.RWMutex
	shouldFail     bool
	failureMessage string
}

// NewMockProvider creates a new mock payment provider
func NewMockProvider(name string, minAmountCents int64, supportsZero bool) *MockProvider {
	return &MockProvider{
		name:         name,
		minAmount:    minAmountCents,
		supportsZero: supportsZero,
		intents:      make(map[string]*models.PaymentIntent),
	}
}

// CreatePaymentIntent creates a mock payment intent
func (m *MockProvider) CreatePaymentIntent(request *CreatePaymentIntentRequest) (*models.PaymentIntent, error) {
	if err := ValidateAmount(m, request.Amount); err != nil {
		return nil, err
	}
	
	if m.shouldFail {
		return nil, fmt.Errorf("%w: %s", ErrPaymentFailed, m.failureMessage)
	}
	
	intentID := fmt.Sprintf("mock_pi_%s", uuid.New().String())
	clientSecret := fmt.Sprintf("mock_secret_%s", uuid.New().String())
	
	intent := &models.PaymentIntent{
		ID:           intentID,
		Amount:       request.Amount,
		Currency:     request.Currency,
		CustomerRef:  request.CustomerRef,
		Items:        request.Items,
		Metadata:     request.Metadata,
		ClientSecret: clientSecret,
	}
	
	m.mu.Lock()
	m.intents[intentID] = intent
	m.mu.Unlock()
	
	return intent, nil
}

// ConfirmPayment confirms a mock payment
func (m *MockProvider) ConfirmPayment(paymentIntentID string) error {
	m.mu.RLock()
	_, exists := m.intents[paymentIntentID]
	m.mu.RUnlock()
	
	if !exists {
		return ErrInvalidIntentID
	}
	
	if m.shouldFail {
		return fmt.Errorf("%w: %s", ErrPaymentFailed, m.failureMessage)
	}
	
	return nil
}

// CancelPayment cancels a mock payment
func (m *MockProvider) CancelPayment(paymentIntentID string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	if _, exists := m.intents[paymentIntentID]; !exists {
		return ErrInvalidIntentID
	}
	
	delete(m.intents, paymentIntentID)
	return nil
}

// Refund processes a mock refund
func (m *MockProvider) Refund(transactionID string, amount *float64) (*RefundResponse, error) {
	if m.shouldFail {
		return nil, fmt.Errorf("%w: %s", ErrRefundFailed, m.failureMessage)
	}
	
	refundID := fmt.Sprintf("mock_refund_%s", uuid.New().String())
	
	refundAmount := 0.0
	if amount != nil {
		refundAmount = *amount
	}
	
	return &RefundResponse{
		RefundID:      refundID,
		Amount:        refundAmount,
		Currency:      "EUR",
		Status:        "succeeded",
		TransactionID: transactionID,
	}, nil
}

// GetPaymentIntent retrieves a mock payment intent
func (m *MockProvider) GetPaymentIntent(paymentIntentID string) (*models.PaymentIntent, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	
	intent, exists := m.intents[paymentIntentID]
	if !exists {
		return nil, ErrInvalidIntentID
	}
	
	return intent, nil
}

// SupportsZeroAmount returns whether zero amounts are supported
func (m *MockProvider) SupportsZeroAmount() bool {
	return m.supportsZero
}

// GetMinimumAmount returns the minimum amount in cents
func (m *MockProvider) GetMinimumAmount() int64 {
	return m.minAmount
}

// Name returns the provider name
func (m *MockProvider) Name() string {
	return m.name
}

// SetShouldFail sets whether the provider should fail
func (m *MockProvider) SetShouldFail(shouldFail bool, message string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.shouldFail = shouldFail
	m.failureMessage = message
}

// Reset resets the mock provider state
func (m *MockProvider) Reset() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.intents = make(map[string]*models.PaymentIntent)
	m.shouldFail = false
	m.failureMessage = ""
}
