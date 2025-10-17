package shop

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/Naim0996/art-management-tool/backend/services/order"
	"github.com/Naim0996/art-management-tool/backend/services/payment"
)

// WebhookHandler handles payment webhooks
type WebhookHandler struct {
	orderService    *order.Service
	paymentProvider payment.Provider
}

// NewWebhookHandler creates a new webhook handler
func NewWebhookHandler(orderService *order.Service, paymentProvider payment.Provider) *WebhookHandler {
	return &WebhookHandler{
		orderService:    orderService,
		paymentProvider: paymentProvider,
	}
}

// HandleStripeWebhook handles POST /api/webhooks/payment/stripe
func (h *WebhookHandler) HandleStripeWebhook(w http.ResponseWriter, r *http.Request) {
	// Read body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	
	// Get signature from headers
	signature := r.Header.Get("Stripe-Signature")
	
	// Verify signature (if using real Stripe provider)
	if stripeProvider, ok := h.paymentProvider.(*payment.StripeProvider); ok {
		if err := stripeProvider.VerifyWebhookSignature(body, signature); err != nil {
			http.Error(w, "Invalid signature", http.StatusUnauthorized)
			return
		}
	}
	
	// Parse webhook event
	var event struct {
		Type string `json:"type"`
		Data struct {
			Object struct {
				ID       string                 `json:"id"`
				Amount   int64                  `json:"amount"`
				Currency string                 `json:"currency"`
				Status   string                 `json:"status"`
				Metadata map[string]string      `json:"metadata"`
			} `json:"object"`
		} `json:"data"`
	}
	
	if err := json.Unmarshal(body, &event); err != nil {
		http.Error(w, "Invalid webhook payload", http.StatusBadRequest)
		return
	}
	
	// Handle event based on type
	switch event.Type {
	case "payment_intent.succeeded":
		err = h.orderService.HandlePaymentSuccess(event.Data.Object.ID)
		
	case "payment_intent.payment_failed":
		reason := "Payment failed"
		if event.Data.Object.Status != "" {
			reason = event.Data.Object.Status
		}
		err = h.orderService.HandlePaymentFailed(event.Data.Object.ID, reason)
		
	default:
		// Unhandled event type - still return 200
		w.WriteHeader(http.StatusOK)
		return
	}
	
	if err != nil {
		// Log error but still return 200 to acknowledge receipt
		// In production, you might want to retry failed webhook processing
		w.WriteHeader(http.StatusOK)
		return
	}
	
	w.WriteHeader(http.StatusOK)
}
