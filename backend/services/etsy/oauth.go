package etsy

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"gorm.io/gorm"
)

// OAuth Token Storage Model
type OAuthToken struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	ShopID       string    `gorm:"uniqueIndex;not null" json:"shop_id"`
	AccessToken  string    `gorm:"not null" json:"access_token"`
	RefreshToken string    `gorm:"not null" json:"refresh_token"`
	TokenType    string    `gorm:"default:'Bearer'" json:"token_type"`
	ExpiresAt    time.Time `json:"expires_at"`
	Scope        string    `json:"scope"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (OAuthToken) TableName() string {
	return "etsy_oauth_tokens"
}

// IsExpired checks if the token has expired or will expire soon (within 5 minutes)
func (t *OAuthToken) IsExpired() bool {
	return time.Now().Add(5 * time.Minute).After(t.ExpiresAt)
}

// OAuthManager manages OAuth authentication and token refresh
type OAuthManager struct {
	client      *Client
	db          *gorm.DB
	apiKey      string
	apiSecret   string
	RedirectURI string // Public field for redirect URI
}

// NewOAuthManager creates a new OAuth manager
func NewOAuthManager(db *gorm.DB, apiKey, apiSecret, redirectURI string) *OAuthManager {
	return &OAuthManager{
		db:          db,
		apiKey:      apiKey,
		apiSecret:   apiSecret,
		RedirectURI: redirectURI,
	}
}

// GetAuthorizationURL generates the OAuth authorization URL
func (m *OAuthManager) GetAuthorizationURL(redirectURI, state string, scopes []string) string {
	params := url.Values{}
	params.Set("response_type", "code")
	params.Set("client_id", m.apiKey)
	params.Set("redirect_uri", redirectURI)
	params.Set("state", state)
	params.Set("scope", strings.Join(scopes, " "))

	return fmt.Sprintf("https://www.etsy.com/oauth/connect?%s", params.Encode())
}

// ExchangeCodeForToken exchanges an authorization code for access and refresh tokens
func (m *OAuthManager) ExchangeCodeForToken(code, redirectURI, shopID string) (*OAuthToken, error) {
	tokenURL := "https://api.etsy.com/v3/public/oauth/token"

	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("client_id", m.apiKey)
	data.Set("redirect_uri", redirectURI)
	data.Set("code", code)

	// Create authorization header
	auth := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s:%s", m.apiKey, m.apiSecret)))

	req, err := http.NewRequest("POST", tokenURL, bytes.NewBufferString(data.Encode()))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Authorization", fmt.Sprintf("Basic %s", auth))

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange code: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("token exchange failed with status %d: %s", resp.StatusCode, string(body))
	}

	var tokenResp struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		TokenType    string `json:"token_type"`
		ExpiresIn    int    `json:"expires_in"`
		Scope        string `json:"scope"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, fmt.Errorf("failed to decode token response: %w", err)
	}

	token := &OAuthToken{
		ShopID:       shopID,
		AccessToken:  tokenResp.AccessToken,
		RefreshToken: tokenResp.RefreshToken,
		TokenType:    tokenResp.TokenType,
		ExpiresAt:    time.Now().Add(time.Duration(tokenResp.ExpiresIn) * time.Second),
		Scope:        tokenResp.Scope,
	}

	// Save token to database
	if err := m.SaveToken(token); err != nil {
		return nil, fmt.Errorf("failed to save token: %w", err)
	}

	return token, nil
}

// RefreshToken refreshes an expired access token using the refresh token
func (m *OAuthManager) RefreshToken(refreshToken, shopID string) (*OAuthToken, error) {
	tokenURL := "https://api.etsy.com/v3/public/oauth/token"

	data := url.Values{}
	data.Set("grant_type", "refresh_token")
	data.Set("client_id", m.apiKey)
	data.Set("refresh_token", refreshToken)

	// Create authorization header
	auth := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s:%s", m.apiKey, m.apiSecret)))

	req, err := http.NewRequest("POST", tokenURL, bytes.NewBufferString(data.Encode()))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Authorization", fmt.Sprintf("Basic %s", auth))

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to refresh token: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("token refresh failed with status %d: %s", resp.StatusCode, string(body))
	}

	var tokenResp struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		TokenType    string `json:"token_type"`
		ExpiresIn    int    `json:"expires_in"`
		Scope        string `json:"scope"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, fmt.Errorf("failed to decode token response: %w", err)
	}

	token := &OAuthToken{
		ShopID:       shopID,
		AccessToken:  tokenResp.AccessToken,
		RefreshToken: tokenResp.RefreshToken,
		TokenType:    tokenResp.TokenType,
		ExpiresAt:    time.Now().Add(time.Duration(tokenResp.ExpiresIn) * time.Second),
		Scope:        tokenResp.Scope,
	}

	// Update token in database
	if err := m.SaveToken(token); err != nil {
		return nil, fmt.Errorf("failed to save refreshed token: %w", err)
	}

	return token, nil
}

// GetValidToken retrieves a valid token, refreshing if necessary
func (m *OAuthManager) GetValidToken(shopID string) (*OAuthToken, error) {
	var token OAuthToken
	err := m.db.Where("shop_id = ?", shopID).First(&token).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("no token found, please authenticate first")
		}
		return nil, fmt.Errorf("failed to retrieve token: %w", err)
	}

	// Check if token is expired or about to expire
	if token.IsExpired() {
		// Refresh the token
		refreshedToken, err := m.RefreshToken(token.RefreshToken, shopID)
		if err != nil {
			return nil, fmt.Errorf("failed to refresh expired token: %w", err)
		}
		return refreshedToken, nil
	}

	return &token, nil
}

// SaveToken saves or updates a token in the database
func (m *OAuthManager) SaveToken(token *OAuthToken) error {
	var existing OAuthToken
	err := m.db.Where("shop_id = ?", token.ShopID).First(&existing).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Create new token
			return m.db.Create(token).Error
		}
		return fmt.Errorf("failed to check existing token: %w", err)
	}

	// Update existing token
	token.ID = existing.ID
	return m.db.Save(token).Error
}

// DeleteToken removes a token from the database
func (m *OAuthManager) DeleteToken(shopID string) error {
	return m.db.Where("shop_id = ?", shopID).Delete(&OAuthToken{}).Error
}

// UpdateClientToken updates the client's access token
func (m *OAuthManager) UpdateClientToken(client *Client, shopID string) error {
	token, err := m.GetValidToken(shopID)
	if err != nil {
		return err
	}

	client.accessToken = token.AccessToken
	return nil
}
