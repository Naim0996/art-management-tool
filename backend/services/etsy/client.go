package etsy

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"
)

// Client represents an Etsy API client
type Client struct {
	apiKey      string
	apiSecret   string
	shopID      string
	accessToken string
	baseURL     string
	httpTimeout time.Duration
	httpClient  *http.Client
	
	// Rate limiting
	rateLimitRemaining int
	rateLimitResetAt   time.Time
	
	// Retry configuration
	maxRetries     int
	retryDelay     time.Duration
	retryBackoff   float64
}

// ClientConfig holds configuration for the Etsy API client
type ClientConfig struct {
	APIKey      string
	APISecret   string
	ShopID      string
	AccessToken string
	BaseURL     string
	Timeout     time.Duration
	MaxRetries  int
}

// NewClient creates a new Etsy API client
func NewClient(config ClientConfig) (*Client, error) {
	if config.APIKey == "" {
		return nil, errors.New("etsy API key is required")
	}
	
	if config.BaseURL == "" {
		config.BaseURL = "https://openapi.etsy.com/v3"
	}
	
	if config.Timeout == 0 {
		config.Timeout = 30 * time.Second
	}
	
	if config.MaxRetries == 0 {
		config.MaxRetries = 3
	}
	
	return &Client{
		apiKey:             config.APIKey,
		apiSecret:          config.APISecret,
		shopID:             config.ShopID,
		accessToken:        config.AccessToken,
		baseURL:            config.BaseURL,
		httpTimeout:        config.Timeout,
		httpClient:         &http.Client{Timeout: config.Timeout},
		rateLimitRemaining: 10000, // Default Etsy rate limit
		maxRetries:         config.MaxRetries,
		retryDelay:         1 * time.Second,
		retryBackoff:       2.0,
	}, nil
}

// IsConfigured checks if the client has the minimum required configuration
func (c *Client) IsConfigured() bool {
	return c.apiKey != "" && c.shopID != "" && c.accessToken != ""
}

// IsRateLimited checks if the client has exceeded the rate limit
func (c *Client) IsRateLimited() bool {
	if c.rateLimitResetAt.IsZero() {
		return false
	}
	return c.rateLimitRemaining <= 0 && time.Now().Before(c.rateLimitResetAt)
}

// GetRateLimitInfo returns current rate limit information
func (c *Client) GetRateLimitInfo() (remaining int, resetAt time.Time) {
	return c.rateLimitRemaining, c.rateLimitResetAt
}

// UpdateRateLimit updates the rate limit information from API response headers
func (c *Client) UpdateRateLimit(remaining int, resetAt time.Time) {
	c.rateLimitRemaining = remaining
	c.rateLimitResetAt = resetAt
}

// ========================================
// Core HTTP Methods with Retry Logic
// ========================================

// doRequest performs an HTTP request with retry logic and error handling
func (c *Client) doRequest(method, path string, body interface{}, result interface{}) error {
	var lastErr error
	
	for attempt := 0; attempt <= c.maxRetries; attempt++ {
		if attempt > 0 {
			// Calculate exponential backoff delay
			delay := time.Duration(float64(c.retryDelay) * float64(attempt) * c.retryBackoff)
			log.Printf("Retrying Etsy API request (attempt %d/%d) after %v", attempt, c.maxRetries, delay)
			time.Sleep(delay)
		}
		
		err := c.executeRequest(method, path, body, result)
		if err == nil {
			return nil
		}
		
		lastErr = err
		
		// Check if error is retryable
		if !c.isRetryableError(err) {
			return err
		}
	}
	
	return fmt.Errorf("max retries exceeded: %w", lastErr)
}

// executeRequest performs a single HTTP request
func (c *Client) executeRequest(method, path string, body interface{}, result interface{}) error {
	url := c.baseURL + path
	
	var bodyReader io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return fmt.Errorf("failed to marshal request body: %w", err)
		}
		bodyReader = bytes.NewReader(jsonBody)
	}
	
	req, err := http.NewRequest(method, url, bodyReader)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	
	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", c.apiKey)
	if c.accessToken != "" {
		req.Header.Set("Authorization", "Bearer "+c.accessToken)
	}
	
	// Execute request
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()
	
	// Update rate limit info from headers
	c.updateRateLimitFromHeaders(resp.Header)
	
	// Read response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %w", err)
	}
	
	// Check for errors
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return c.handleErrorResponse(resp.StatusCode, respBody)
	}
	
	// Parse success response
	if result != nil {
		if err := json.Unmarshal(respBody, result); err != nil {
			return fmt.Errorf("failed to parse response: %w", err)
		}
	}
	
	log.Printf("Etsy API request successful: %s %s (status: %d)", method, path, resp.StatusCode)
	return nil
}

// handleErrorResponse parses and returns an appropriate error from API response
func (c *Client) handleErrorResponse(statusCode int, body []byte) error {
	var etsyErr EtsyErrorResponse
	if err := json.Unmarshal(body, &etsyErr); err == nil && etsyErr.Error != "" {
		return &EtsyAPIError{
			StatusCode:  statusCode,
			ErrorCode:   etsyErr.Error,
			Description: etsyErr.ErrorMsg,
		}
	}
	
	return &EtsyAPIError{
		StatusCode:  statusCode,
		ErrorCode:   "unknown_error",
		Description: string(body),
	}
}

// updateRateLimitFromHeaders updates rate limit info from response headers
func (c *Client) updateRateLimitFromHeaders(headers http.Header) {
	if remaining := headers.Get("X-RateLimit-Remaining"); remaining != "" {
		if val, err := strconv.Atoi(remaining); err == nil {
			c.rateLimitRemaining = val
		}
	}
	
	if reset := headers.Get("X-RateLimit-Reset"); reset != "" {
		if val, err := strconv.ParseInt(reset, 10, 64); err == nil {
			c.rateLimitResetAt = time.Unix(val, 0)
		}
	}
}

// isRetryableError determines if an error should trigger a retry
func (c *Client) isRetryableError(err error) bool {
	if err == nil {
		return false
	}
	
	// Check for EtsyAPIError
	var apiErr *EtsyAPIError
	if errors.As(err, &apiErr) {
		// Retry on server errors (5xx) and rate limit errors (429)
		return apiErr.StatusCode >= 500 || apiErr.StatusCode == 429
	}
	
	// Retry on network errors
	return true
}

// ========================================
// API Methods - Listings
// ========================================

// GetShopListings retrieves all listings for the configured shop
func (c *Client) GetShopListings(limit, offset int) ([]ListingDTO, error) {
	if !c.IsConfigured() {
		return nil, errors.New("etsy client not properly configured")
	}
	
	if c.IsRateLimited() {
		return nil, fmt.Errorf("rate limit exceeded, resets at %s", c.rateLimitResetAt.Format(time.RFC3339))
	}
	
	path := fmt.Sprintf("/application/shops/%s/listings/active", c.shopID)
	if limit > 0 {
		path += fmt.Sprintf("?limit=%d&offset=%d", limit, offset)
	}
	
	var response ListingsResponse
	if err := c.doRequest("GET", path, nil, &response); err != nil {
		return nil, fmt.Errorf("failed to get shop listings: %w", err)
	}
	
	return response.Results, nil
}

// GetListing retrieves a specific listing by ID with inventory details
func (c *Client) GetListing(listingID int64) (*ListingDTO, error) {
	if !c.IsConfigured() {
		return nil, errors.New("etsy client not properly configured")
	}
	
	if c.IsRateLimited() {
		return nil, fmt.Errorf("rate limit exceeded, resets at %s", c.rateLimitResetAt.Format(time.RFC3339))
	}
	
	path := fmt.Sprintf("/application/listings/%d?includes=Images,Inventory", listingID)
	
	var listing ListingDTO
	if err := c.doRequest("GET", path, nil, &listing); err != nil {
		return nil, fmt.Errorf("failed to get listing %d: %w", listingID, err)
	}
	
	return &listing, nil
}

// ========================================
// API Methods - Inventory
// ========================================

// GetListingInventory retrieves the inventory for a specific listing
func (c *Client) GetListingInventory(listingID int64) (*ListingInventoryDTO, error) {
	if !c.IsConfigured() {
		return nil, errors.New("etsy client not properly configured")
	}
	
	if c.IsRateLimited() {
		return nil, fmt.Errorf("rate limit exceeded, resets at %s", c.rateLimitResetAt.Format(time.RFC3339))
	}
	
	path := fmt.Sprintf("/application/listings/%d/inventory", listingID)
	
	var inventory ListingInventoryDTO
	if err := c.doRequest("GET", path, nil, &inventory); err != nil {
		return nil, fmt.Errorf("failed to get inventory for listing %d: %w", listingID, err)
	}
	
	return &inventory, nil
}

// UpdateListingInventory updates the inventory for a specific listing
func (c *Client) UpdateListingInventory(listingID int64, request *UpdateListingInventoryRequest) error {
	if !c.IsConfigured() {
		return errors.New("etsy client not properly configured")
	}
	
	if c.IsRateLimited() {
		return fmt.Errorf("rate limit exceeded, resets at %s", c.rateLimitResetAt.Format(time.RFC3339))
	}
	
	path := fmt.Sprintf("/application/listings/%d/inventory", listingID)
	
	if err := c.doRequest("PUT", path, request, nil); err != nil {
		return fmt.Errorf("failed to update inventory for listing %d: %w", listingID, err)
	}
	
	return nil
}

// UpdateInventory updates the inventory quantity for a listing (simplified method)
func (c *Client) UpdateInventory(listingID int64, quantity int) error {
	// First, get current inventory structure
	inventory, err := c.GetListingInventory(listingID)
	if err != nil {
		return err
	}
	
	if len(inventory.Products) == 0 {
		return errors.New("no products found in listing inventory")
	}
	
	// Update quantity in first product's first offering
	product := inventory.Products[0]
	if len(product.Offerings) == 0 {
		return errors.New("no offerings found in product")
	}
	
	request := &UpdateListingInventoryRequest{
		Products: []UpdateInventoryProductDTO{
			{
				ProductID: product.ProductID,
				Offerings: []UpdateInventoryOfferingDTO{
					{
						OfferingID: product.Offerings[0].OfferingID,
						Quantity:   quantity,
						IsEnabled:  true,
					},
				},
			},
		},
	}
	
	return c.UpdateListingInventory(listingID, request)
}

// ========================================
// API Methods - Validation
// ========================================

// ValidateCredentials tests the API credentials by fetching shop info
func (c *Client) ValidateCredentials() error {
	if !c.IsConfigured() {
		return errors.New("etsy client not properly configured")
	}
	
	path := fmt.Sprintf("/application/shops/%s", c.shopID)
	
	var shop ShopDTO
	if err := c.doRequest("GET", path, nil, &shop); err != nil {
		return fmt.Errorf("failed to validate credentials: %w", err)
	}
	
	log.Printf("Etsy credentials validated successfully for shop: %s", shop.ShopName)
	return nil
}

// ========================================
// API Methods - Shop Receipts (Transactions)
// ========================================

// GetShopReceipts retrieves receipts (orders/transactions) for the shop
// Parameters:
//   - minCreated: Optional minimum creation timestamp (Unix timestamp)
//   - maxCreated: Optional maximum creation timestamp (Unix timestamp)
//   - wasPaid: Optional filter for paid receipts
//   - wasShipped: Optional filter for shipped receipts
//   - limit: Number of results to return (max 100)
//   - offset: Offset for pagination
func (c *Client) GetShopReceipts(minCreated, maxCreated int64, wasPaid, wasShipped *bool, limit, offset int) ([]ReceiptDTO, error) {
	if !c.IsConfigured() {
		return nil, errors.New("etsy client not properly configured")
	}
	
	if c.IsRateLimited() {
		return nil, fmt.Errorf("rate limit exceeded, resets at %s", c.rateLimitResetAt.Format(time.RFC3339))
	}
	
	// Build query parameters
	path := fmt.Sprintf("/application/shops/%s/receipts", c.shopID)
	params := []string{}
	
	if minCreated > 0 {
		params = append(params, fmt.Sprintf("min_created=%d", minCreated))
	}
	if maxCreated > 0 {
		params = append(params, fmt.Sprintf("max_created=%d", maxCreated))
	}
	if wasPaid != nil {
		params = append(params, fmt.Sprintf("was_paid=%t", *wasPaid))
	}
	if wasShipped != nil {
		params = append(params, fmt.Sprintf("was_shipped=%t", *wasShipped))
	}
	if limit > 0 {
		params = append(params, fmt.Sprintf("limit=%d", limit))
	}
	if offset > 0 {
		params = append(params, fmt.Sprintf("offset=%d", offset))
	}
	
	if len(params) > 0 {
		path += "?" + params[0]
		for i := 1; i < len(params); i++ {
			path += "&" + params[i]
		}
	}
	
	var response ShopReceiptsResponse
	if err := c.doRequest("GET", path, nil, &response); err != nil {
		return nil, fmt.Errorf("failed to get shop receipts: %w", err)
	}
	
	return response.Results, nil
}

// GetReceipt retrieves a specific receipt by ID with transaction details
func (c *Client) GetReceipt(receiptID int64) (*ReceiptDTO, error) {
	if !c.IsConfigured() {
		return nil, errors.New("etsy client not properly configured")
	}
	
	if c.IsRateLimited() {
		return nil, fmt.Errorf("rate limit exceeded, resets at %s", c.rateLimitResetAt.Format(time.RFC3339))
	}
	
	path := fmt.Sprintf("/application/shops/%s/receipts/%d", c.shopID, receiptID)
	
	var receipt ReceiptDTO
	if err := c.doRequest("GET", path, nil, &receipt); err != nil {
		return nil, fmt.Errorf("failed to get receipt %d: %w", receiptID, err)
	}
	
	return &receipt, nil
}

// GetReceiptTransactions retrieves all transactions (line items) for a specific receipt
func (c *Client) GetReceiptTransactions(receiptID int64) ([]TransactionDTO, error) {
	if !c.IsConfigured() {
		return nil, errors.New("etsy client not properly configured")
	}
	
	if c.IsRateLimited() {
		return nil, fmt.Errorf("rate limit exceeded, resets at %s", c.rateLimitResetAt.Format(time.RFC3339))
	}
	
	path := fmt.Sprintf("/application/shops/%s/receipts/%d/transactions", c.shopID, receiptID)
	
	var response struct {
		Count   int              `json:"count"`
		Results []TransactionDTO `json:"results"`
	}
	
	if err := c.doRequest("GET", path, nil, &response); err != nil {
		return nil, fmt.Errorf("failed to get receipt transactions: %w", err)
	}
	
	return response.Results, nil
}

// ========================================
// Error Types
// ========================================

// EtsyAPIError represents an error from the Etsy API
type EtsyAPIError struct {
	StatusCode  int
	ErrorCode   string
	Description string
}

func (e *EtsyAPIError) Error() string {
	if e.Description != "" {
		return fmt.Sprintf("etsy api error (status %d): %s - %s", e.StatusCode, e.ErrorCode, e.Description)
	}
	return fmt.Sprintf("etsy api error (status %d): %s", e.StatusCode, e.ErrorCode)
}
