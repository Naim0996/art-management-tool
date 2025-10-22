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
POST /api/admin/etsy/sync
{
  "type": "products",  # or "inventory"
  "shop_id": "your_shop_id"
}
```

## 🔌 API Integration

### Service Structure

```
backend/services/etsy/
├── client.go      # Etsy API client
├── service.go     # Business logic
└── dto.go         # Data transfer objects (to be added)
```

### Client Usage

```go
// Initialize client
client, err := etsy.NewClient(etsy.ClientConfig{
    APIKey:      os.Getenv("ETSY_API_KEY"),
    APISecret:   os.Getenv("ETSY_API_SECRET"),
    ShopID:      os.Getenv("ETSY_SHOP_ID"),
    AccessToken: os.Getenv("ETSY_ACCESS_TOKEN"),
})

// Create service
etsyService := etsy.NewService(db, client)

// Check if configured
if etsyService.IsEnabled() {
    // Sync products
    err := etsyService.SyncProducts(shopID)
}
```

### Synchronization Flow

**Product Sync (Etsy → Local):**
1. Fetch listings from Etsy API
2. Create/update `etsy_products` records
3. Map to local products (if exists)
4. Update sync status and timestamp

**Inventory Sync:**
1. Get local products with Etsy mappings
2. Compare quantities (Etsy vs Local)
3. Determine sync direction (push/pull)
4. Update quantities accordingly
5. Log sync operation

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
