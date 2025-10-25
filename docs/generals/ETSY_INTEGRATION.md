# 🛍️ Etsy Integration Infrastructure

Comprehensive guide for setting up and configuring Etsy API integration with the Art Management Tool.

[![Etsy API](https://img.shields.io/badge/Etsy-API_v3-F56400?logo=etsy)](https://www.etsy.com/developers/)

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Security Requirements](#security-requirements)
- [Environment Configuration](#environment-configuration)
- [Database Schema](#database-schema)
- [Rate Limiting](#rate-limiting)
- [Scheduled Jobs](#scheduled-jobs)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Etsy integration enables automatic synchronization of products and inventory between the Art Management Tool and Etsy marketplace. This infrastructure provides:

- ✅ Secure credential management
- ✅ Database persistence for synced data
- ✅ Rate limiting to comply with Etsy API limits
- ✅ Scheduled automatic synchronization
- ✅ Comprehensive logging and monitoring
- ✅ Staging/production environment separation

## 📦 Prerequisites

### Etsy Developer Account

1. **Register as Etsy Developer**
   - Visit [Etsy Developers Portal](https://www.etsy.com/developers/)
   - Create a developer account
   - Accept the API Terms of Use

2. **Create an App**
   - Navigate to "Your Apps" in the developer dashboard
   - Click "Create a New App"
   - Fill in app details (name, description, URLs)
   - Note down your **API Key** (Keystring)

3. **Generate Access Token**
   - Configure OAuth 2.0 settings
   - Complete the OAuth flow to get an access token
   - Store the access token securely

### Required Permissions

Your Etsy app needs the following scopes:
- `listings_r` - Read listing data
- `listings_w` - Write listing data (for inventory updates)
- `shops_r` - Read shop information
- `transactions_r` - Read transaction data (optional)

## 🔐 Security Requirements

### Credential Storage

**❌ DO NOT:**
- Commit API keys to version control
- Store credentials in code
- Share credentials via email or chat
- Use production credentials in development

**✅ DO:**
- Use environment variables
- Store in secure secret management systems (AWS Secrets Manager, HashiCorp Vault)
- Rotate credentials regularly
- Use separate credentials for staging/production

### Environment Variables

Create a `.env` file (gitignored by default):

```bash
# Etsy API Credentials
ETSY_API_KEY=your_api_key_here
ETSY_API_SECRET=your_api_secret_here
ETSY_SHOP_ID=your_shop_id
ETSY_ACCESS_TOKEN=your_access_token_here
```

### SSL/TLS Configuration

All communication with Etsy API must use HTTPS:
- API Base URL: `https://openapi.etsy.com/v3`
- Webhook endpoints must be HTTPS in production
- Valid SSL certificate required for production

## ⚙️ Environment Configuration

### Development Environment

```bash
# .env.example
ETSY_API_KEY=
ETSY_API_SECRET=
ETSY_SHOP_ID=
ETSY_ACCESS_TOKEN=
ETSY_API_BASE_URL=https://openapi.etsy.com/v3

# Disable sync in development
ETSY_SYNC_ENABLED=false
```

### Staging Environment

```bash
# .env.staging
ETSY_API_KEY=staging_key
ETSY_API_SECRET=staging_secret
ETSY_SHOP_ID=staging_shop_123
ETSY_ACCESS_TOKEN=staging_token
ETSY_API_BASE_URL=https://openapi.etsy.com/v3

# Enable sync with conservative intervals
ETSY_SYNC_ENABLED=true
ETSY_SYNC_INTERVAL_PRODUCTS=3600    # 1 hour
ETSY_SYNC_INTERVAL_INVENTORY=1800   # 30 minutes
```

### Production Environment

```bash
# .env.production
ETSY_API_KEY=prod_key
ETSY_API_SECRET=prod_secret
ETSY_SHOP_ID=prod_shop_456
ETSY_ACCESS_TOKEN=prod_token
ETSY_API_BASE_URL=https://openapi.etsy.com/v3

# Enable sync with optimized intervals
ETSY_SYNC_ENABLED=true
ETSY_SYNC_INTERVAL_PRODUCTS=7200    # 2 hours
ETSY_SYNC_INTERVAL_INVENTORY=3600   # 1 hour
```

### Docker Configuration

The infrastructure includes Docker support:

```bash
# Start with staging environment
docker compose -f docker-compose.staging.yml up -d

# View logs
docker compose -f docker-compose.staging.yml logs -f backend

# Stop services
docker compose -f docker-compose.staging.yml down
```

## 🗄️ Database Schema

### Tables Created

#### 1. `etsy_sync_config`
Tracks synchronization state and rate limits:
```sql
- shop_id (unique)
- last_product_sync
- last_inventory_sync
- sync_status (idle, in_progress, error, completed)
- rate_limit_remaining
- rate_limit_reset_at
```

#### 2. `etsy_products`
Maps Etsy listings to local products:
```sql
- etsy_listing_id (unique)
- local_product_id (FK to products)
- title, description, price, quantity, sku
- sync_status (pending, synced, error)
- last_synced_at
```

#### 3. `etsy_inventory_sync_log`
Logs all inventory synchronization operations:
```sql
- etsy_listing_id
- local_variant_id (FK to product_variants)
- etsy_quantity, local_quantity, quantity_diff
- sync_action (push_to_etsy, pull_from_etsy, no_change)
- sync_result (success, error, skipped)
- synced_at
```

### Database Migrations

Migrations are located in `/backend/migrations/`:
- `010_create_etsy_sync_config.up.sql`
- `011_create_etsy_products.up.sql`
- `012_create_etsy_inventory_sync.up.sql`

Run migrations:
```bash
# Automatically on backend start
go run main.go

# Or manually with golang-migrate
migrate -path ./migrations -database "postgresql://user:pass@host:5432/db" up
```

## ⏱️ Rate Limiting

### Etsy API Limits

Etsy enforces rate limits:
- **10,000 requests per day** (per API key)
- Rate limit window: 24 hours
- Exceeded limits result in 429 HTTP status

### Implementation

The infrastructure includes a rate limiter service:

```go
// Rate limiter configuration
rateLimiter := ratelimit.NewManager(
    10000,              // 10,000 requests
    24 * time.Hour,     // per 24 hours
)

// Check before API call
if !rateLimiter.Allow("etsy_api") {
    return errors.New("rate limit exceeded")
}
```

### Monitoring

Rate limit status is tracked in `etsy_sync_config`:
```sql
SELECT 
    shop_id,
    rate_limit_remaining,
    rate_limit_reset_at
FROM etsy_sync_config;
```

### Best Practices

- **Batch operations** when possible
- **Cache frequently accessed data**
- **Implement exponential backoff** for retries
- **Monitor daily usage** to avoid hitting limits
- **Use webhooks** instead of polling when available

## 🕐 Scheduled Jobs

### Job Scheduler

The scheduler service manages background synchronization:

```go
scheduler := scheduler.NewScheduler()

// Add product sync job (every 2 hours)
scheduler.AddJob("etsy_product_sync", 2*time.Hour, func(ctx context.Context) error {
    return etsyService.SyncProducts(shopID)
})

// Add inventory sync job (every 1 hour)
scheduler.AddJob("etsy_inventory_sync", 1*time.Hour, func(ctx context.Context) error {
    return etsyService.SyncInventory(shopID, "pull")
})

scheduler.Start()
```

### Configuration

Adjust intervals via environment variables:
```bash
ETSY_SYNC_INTERVAL_PRODUCTS=7200    # seconds
ETSY_SYNC_INTERVAL_INVENTORY=3600   # seconds
```

### Monitoring Jobs

Check job status:
```bash
# Via API (admin endpoint)
GET /api/admin/scheduler/status

# Response
{
  "jobs": [
    {
      "name": "etsy_product_sync",
      "enabled": true,
      "last_run": "2025-10-22T15:30:00Z",
      "next_run": "2025-10-22T17:30:00Z"
    }
  ]
}
```

### Manual Trigger

Trigger sync manually via admin API:
```bash
# Trigger product sync
POST /api/admin/etsy/sync/products
{
  "shop_id": "your_shop_id"
}

# Trigger inventory sync
POST /api/admin/etsy/sync/inventory
{
  "shop_id": "your_shop_id",
  "direction": "push"  # or "pull", "bidirectional"
}

# Get sync status
GET /api/admin/etsy/sync/status?shop_id=your_shop_id

# Get sync logs
GET /api/admin/etsy/sync/logs?listing_id=123&limit=50&offset=0
```

## 🔌 API Integration

### Service Structure

```
backend/services/etsy/
├── client.go      # Complete HTTP client with retry logic
├── service.go     # Business logic and sync implementation
├── dto.go         # Complete Etsy API v3 DTOs
└── mapper.go      # Bidirectional DTO mapping functions
```

### Admin API Endpoints

All endpoints require authentication via `Authorization: Bearer <token>` header.

#### Sync Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/etsy/sync/products` | Trigger product synchronization |
| `POST` | `/api/admin/etsy/sync/inventory` | Trigger inventory synchronization |
| `GET` | `/api/admin/etsy/sync/status` | Get sync configuration and status |
| `GET` | `/api/admin/etsy/sync/logs` | Retrieve inventory sync logs |

#### Product Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/etsy/products` | List all Etsy products |
| `GET` | `/api/admin/etsy/products/{listing_id}` | Get specific Etsy product |
| `POST` | `/api/admin/etsy/products/{listing_id}/link` | Link Etsy listing to local product |
| `DELETE` | `/api/admin/etsy/products/{listing_id}/link` | Unlink Etsy listing from local product |

#### Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/etsy/config` | Get integration configuration status |
| `POST` | `/api/admin/etsy/validate` | Validate Etsy API credentials |

### Client Usage

```go
// Initialize client with configuration
client, err := etsy.NewClient(etsy.ClientConfig{
    APIKey:      os.Getenv("ETSY_API_KEY"),
    APISecret:   os.Getenv("ETSY_API_SECRET"),
    ShopID:      os.Getenv("ETSY_SHOP_ID"),
    AccessToken: os.Getenv("ETSY_ACCESS_TOKEN"),
    BaseURL:     "https://openapi.etsy.com/v3",
    Timeout:     30 * time.Second,
    MaxRetries:  3,
})

// Create service
etsyService := etsy.NewService(db, client)

// Check if configured
if etsyService.IsEnabled() {
    // Sync products
    err := etsyService.SyncProducts(shopID)
    
    // Sync inventory (bidirectional)
    err := etsyService.SyncInventory(shopID, "bidirectional")
}
```

### Synchronization Flow

**Product Sync (Etsy → Local):**
1. Fetch listings from Etsy API with pagination
2. Map Etsy listing DTOs to EtsyProduct models
3. Create or update `etsy_products` records in database
4. Track sync status and timestamps
5. Update rate limit information
6. Log sync operations

**Inventory Sync (Bidirectional):**
1. Retrieve all synced Etsy products from database
2. For each product:
   - Fetch current inventory from Etsy API
   - Compare with local inventory levels
   - Calculate inventory delta
   - Determine sync direction based on configuration:
     - **Push**: Update Etsy with local quantities
     - **Pull**: Update local with Etsy quantities
     - **Bidirectional**: Intelligent conflict resolution
3. For products with variants:
   - Match variants by SKU
   - Sync each variant individually
4. Log all sync operations to `etsy_inventory_sync_log`
5. Update rate limit and sync status

### Error Handling

The implementation includes comprehensive error handling:

```go
// Typed API errors
type EtsyAPIError struct {
    StatusCode  int
    ErrorCode   string
    Description string
}

// Retry logic with exponential backoff
// - Retries on 5xx errors and 429 (rate limit)
// - Configurable retry attempts (default: 3)
// - Exponential backoff delay (1s, 2s, 4s, ...)
// - Logs all retry attempts

// Rate limit handling
// - Tracks remaining requests from response headers
// - Prevents API calls when limit exceeded
// - Stores reset time in sync configuration
```

### Data Mapping

The mapper provides bidirectional conversion between Etsy and local models:

**Etsy → Local:**
- `ListingDTO` → `EtsyProduct` (tracking record)
- `ListingDTO` → `EnhancedProduct` (local product)
- `ListingInventoryProductDTO` → `ProductVariant`

**Local → Etsy:**
- `EnhancedProduct` + `EtsyProduct` → `UpdateListingInventoryRequest`
- `ProductVariant` → `UpdateInventoryOfferingDTO`

**Features:**
- Automatic slug generation from titles
- Status mapping (draft/published/archived ↔ active/inactive)
- Price conversion and currency handling
- Weight and dimension unit conversion
- Property value parsing for variants

## 🧪 Testing

### Test Environment Setup

1. **Create Test Shop**
   - Use Etsy sandbox environment (if available)
   - Or create a separate test shop

2. **Configure Test Credentials**
   ```bash
   cp .env.example .env.test
   # Edit .env.test with test credentials
   ```

3. **Run Tests**
   ```bash
   # Unit tests
   go test ./backend/services/etsy/...
   
   # Integration tests
   go test -tags=integration ./backend/tests/etsy/...
   ```

### Manual Testing

1. **Test API Connection**
   ```bash
   curl -X POST http://localhost:8080/api/admin/etsy/validate \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

2. **Test Product Sync**
   ```bash
   curl -X POST http://localhost:8080/api/admin/etsy/sync \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"type": "products"}'
   ```

3. **Check Sync Status**
   ```bash
   curl http://localhost:8080/api/admin/etsy/status \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## 🔧 Troubleshooting

### Common Issues

#### API Connection Failed

**Symptoms:** Cannot connect to Etsy API

**Solutions:**
1. Verify credentials are correct
2. Check network connectivity
3. Ensure firewall allows HTTPS outbound
4. Validate access token hasn't expired

```bash
# Test connectivity
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://openapi.etsy.com/v3/application/shops/{shop_id}
```

#### Rate Limit Exceeded

**Symptoms:** 429 error responses

**Solutions:**
1. Check rate limit status in database
2. Wait until reset time
3. Reduce sync frequency
4. Implement request batching

```sql
SELECT rate_limit_remaining, rate_limit_reset_at 
FROM etsy_sync_config 
WHERE shop_id = 'your_shop_id';
```

#### Sync Failed

**Symptoms:** Sync status shows 'error'

**Solutions:**
1. Check error message in `etsy_sync_config.sync_error`
2. Review application logs
3. Verify product data format
4. Check Etsy API status

```sql
SELECT sync_status, sync_error, last_product_sync
FROM etsy_sync_config
WHERE shop_id = 'your_shop_id';
```

#### Database Migration Failed

**Symptoms:** Tables not created

**Solutions:**
1. Check migration files exist
2. Verify database permissions
3. Run migrations manually
4. Check for conflicting table names

```bash
# Check migration status
psql -d artmanagement -c "\dt etsy_*"
```

### Logging

Enable debug logging:
```bash
LOG_LEVEL=debug go run main.go
```

View specific logs:
```bash
# Docker logs
docker compose logs -f backend | grep "etsy"

# Filter for errors
docker compose logs backend | grep "ERROR.*etsy"
```

### Health Checks

Monitor integration health:
```bash
# Health endpoint
curl http://localhost:8080/health

# Etsy-specific health
curl http://localhost:8080/api/admin/etsy/health
```

## 📚 Additional Resources

- 📖 [Etsy API Documentation](https://developers.etsy.com/documentation/)
- 🔐 [OAuth 2.0 Authentication](https://developers.etsy.com/documentation/essentials/authentication)
- ⚡ [Rate Limiting Guide](https://developers.etsy.com/documentation/essentials/rate-limiting)
- 🛍️ [Listings API Reference](https://developers.etsy.com/documentation/reference/#tag/ShopListing)
- 📊 [Webhooks Documentation](https://developers.etsy.com/documentation/webhooks)

## 🤝 Support

For infrastructure-related questions:
- Review [ARCHITECTURE.md](./ARCHITECTURE.md)
- Check [DEPLOYMENT.md](./guides/DEPLOYMENT.md)
- Open an issue on GitHub

---

**Security Notice:** Never commit credentials to version control. Always use environment variables or secure secret management systems.
