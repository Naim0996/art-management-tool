package models

type PaymentMethod string

const (
	PaymentMethodCreditCard PaymentMethod = "credit_card"
	PaymentMethodPayPal     PaymentMethod = "paypal"
	PaymentMethodStripe     PaymentMethod = "stripe"
)

type CheckoutRequest struct {
	CartID        string        `json:"cart_id"`
	PaymentMethod PaymentMethod `json:"payment_method"`
	Email         string        `json:"email"`
	ShippingAddress Address     `json:"shipping_address"`
}

type Address struct {
	Street  string `json:"street"`
	City    string `json:"city"`
	State   string `json:"state"`
	ZipCode string `json:"zip_code"`
	Country string `json:"country"`
}

type CheckoutResponse struct {
	OrderID string  `json:"order_id"`
	Total   float64 `json:"total"`
	Status  string  `json:"status"`
}
