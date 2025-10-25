package admin

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Naim0996/art-management-tool/backend/services/etsy"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// EtsyOAuthHandler handles Etsy OAuth operations
type EtsyOAuthHandler struct {
	db           *gorm.DB
	oauthManager *etsy.OAuthManager
}

// NewEtsyOAuthHandler creates a new Etsy OAuth handler
func NewEtsyOAuthHandler(db *gorm.DB, oauthManager *etsy.OAuthManager) *EtsyOAuthHandler {
	return &EtsyOAuthHandler{
		db:           db,
		oauthManager: oauthManager,
	}
}

// GetAuthURL generates the OAuth authorization URL
// GET /api/admin/etsy/oauth/auth-url?shop_id=xxx
func (h *EtsyOAuthHandler) GetAuthURL(w http.ResponseWriter, r *http.Request) {
	shopID := r.URL.Query().Get("shop_id")
	if shopID == "" {
		http.Error(w, "shop_id parameter is required", http.StatusBadRequest)
		return
	}

	// Generate a random state for CSRF protection
	state := uuid.New().String()

	// Required Etsy OAuth scopes
	scopes := []string{
		"listings_r",     // Read shop listings
		"listings_w",     // Write/update listings
		"shops_r",        // Read shop information
		"transactions_r", // Read transactions/orders
		"feedback_r",     // Read feedback
	}

	// Get redirect URI from oauth manager
	redirectURI := h.oauthManager.RedirectURI
	authURL := h.oauthManager.GetAuthorizationURL(redirectURI, state, scopes)

	// In production, store the state in session/cache for validation
	// For now, we'll return it to the client

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"auth_url": authURL,
		"state":    state,
		"shop_id":  shopID,
		"message":  "Redirect user to this URL to authorize",
	})
}

// HandleCallback handles the OAuth callback from Etsy
// GET /api/admin/etsy/oauth/callback?code=xxx&state=xxx&shop_id=xxx
func (h *EtsyOAuthHandler) HandleCallback(w http.ResponseWriter, r *http.Request) {
	// Get authorization code, state, and shop_id from query parameters
	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")
	shopID := r.URL.Query().Get("shop_id")

	if code == "" {
		http.Error(w, "Missing authorization code", http.StatusBadRequest)
		return
	}

	if shopID == "" {
		http.Error(w, "Missing shop_id parameter", http.StatusBadRequest)
		return
	}

	// In production, validate the state parameter against stored value
	if state == "" {
		log.Printf("Warning: Missing state parameter in OAuth callback")
	}

	// Exchange code for tokens
	redirectURI := h.oauthManager.RedirectURI
	token, err := h.oauthManager.ExchangeCodeForToken(code, redirectURI, shopID)
	if err != nil {
		log.Printf("OAuth token exchange failed: %v", err)
		http.Error(w, "Failed to exchange authorization code for token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("OAuth token obtained successfully for shop: %s", token.ShopID)

	// Redirect to admin dashboard with success message
	http.Redirect(w, r, "/admin/etsy-sync?auth=success", http.StatusFound)
}

// RefreshToken manually refreshes the access token
// POST /api/admin/etsy/oauth/refresh?shop_id=xxx
func (h *EtsyOAuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	shopID := r.URL.Query().Get("shop_id")
	if shopID == "" {
		http.Error(w, "shop_id parameter is required", http.StatusBadRequest)
		return
	}

	token, err := h.oauthManager.GetValidToken(shopID)
	if err != nil {
		http.Error(w, "Failed to refresh token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":    "Token refreshed successfully",
		"expires_at": token.ExpiresAt,
	})
}

// GetTokenStatus returns the current token status
// GET /api/admin/etsy/oauth/status?shop_id=xxx
func (h *EtsyOAuthHandler) GetTokenStatus(w http.ResponseWriter, r *http.Request) {
	shopID := r.URL.Query().Get("shop_id")
	if shopID == "" {
		http.Error(w, "shop_id parameter is required", http.StatusBadRequest)
		return
	}

	token, err := h.oauthManager.GetValidToken(shopID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"authenticated": false,
			"message":       err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"authenticated": true,
		"expires_at":    token.ExpiresAt,
		"is_expired":    token.IsExpired(),
		"scope":         token.Scope,
	})
}

// RevokeToken revokes the current access token
// DELETE /api/admin/etsy/oauth/revoke?shop_id=xxx
func (h *EtsyOAuthHandler) RevokeToken(w http.ResponseWriter, r *http.Request) {
	shopID := r.URL.Query().Get("shop_id")
	if shopID == "" {
		http.Error(w, "shop_id parameter is required", http.StatusBadRequest)
		return
	}

	if err := h.oauthManager.DeleteToken(shopID); err != nil {
		http.Error(w, "Failed to revoke token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Token revoked successfully",
	})
}
