package models

import "time"

// PaymentMethod represents a payment method
type PaymentMethod string

const (
	PaymentMethodCreditCard PaymentMethod = "credit_card"
	PaymentMethodPayPal     PaymentMethod = "paypal"
	PaymentMethodStripe     PaymentMethod = "stripe"
)

// CheckoutRequest represents a checkout request
type CheckoutRequest struct {
	CartID          string        `json:"cart_id"`
	SessionToken    string        `json:"session_token,omitempty"`
	PaymentMethod   PaymentMethod `json:"payment_method"`
	Email           string        `json:"email"`
	Name            string        `json:"name"`
	ShippingAddress Address       `json:"shipping_address"`
	BillingAddress  Address       `json:"billing_address,omitempty"`
	DiscountCode    string        `json:"discount_code,omitempty"`
}

// Address represents a physical address
type Address struct {
	Street  string `json:"street"`
	City    string `json:"city"`
	State   string `json:"state"`
	ZipCode string `json:"zip_code"`
	Country string `json:"country"`
}

// CheckoutResponse represents the response from checkout
type CheckoutResponse struct {
	OrderID         string  `json:"order_id"`
	OrderNumber     string  `json:"order_number"`
	PaymentIntentID string  `json:"payment_intent_id,omitempty"`
	ClientSecret    string  `json:"client_secret,omitempty"`
	Total           float64 `json:"total"`
	Status          string  `json:"status"`
}

// PaymentIntent represents a payment intent for processing
type PaymentIntent struct {
	ID           string
	Amount       float64
	Currency     string
	CustomerRef  string
	Items        []PaymentItem
	Metadata     map[string]string
	ClientSecret string
}

// PaymentItem represents an item in a payment
type PaymentItem struct {
	Name     string
	Amount   float64
	Quantity int
}

// PaymentWebhookEvent represents a webhook event from payment provider
type PaymentWebhookEvent struct {
	Type            string
	PaymentIntentID string
	Status          string
	Amount          float64
	Currency        string
	Metadata        map[string]string
	ReceivedAt      time.Time
}
