# E-Commerce Shop API Documentation

## Overview

The Art Management Tool now includes a full-featured e-commerce shop module with:
- Product catalog with variants, categories, and images
- Shopping cart with session management
- Checkout with payment integration
- Order management
- Notification system
- Admin panel for managing products, orders, and inventory
- Shopify integration preparation

## Architecture

```
Backend (Go)
├── Models: Database entities (GORM)
├── Services: Business logic layer
│   ├── cart: Cart management
│   ├── product: Catalog management
│   ├── order: Order processing with payment
│   ├── notification: Event notifications
│   ├── payment: Payment provider abstraction
│   └── shopify: Shopify sync (stub)
├── Handlers: HTTP request handlers
│   ├── shop: Public shop endpoints
│   └── admin: Protected admin endpoints
└── Database: PostgreSQL with migrations
```

## Public Shop API

Base URL: `/api/shop`

### Products

#### List Products
```
GET /api/shop/products

Query Parameters:
- status (string): Filter by status (published/draft/archived)
- category (uint): Filter by category ID
- min_price (float): Minimum price filter
- max_price (float): Maximum price filter
- search (string): Text search in title/description
- in_stock (bool): Only show products with stock
- page (int): Page number (default: 1)
- per_page (int): Results per page (default: 20, max: 100)
- sort_by (string): Sort field (created_at, base_price, title)
- sort_order (string): Sort direction (ASC/DESC)

Response:
{
  "products": [
    {
      "id": 1,
      "slug": "artwork-print-001",
      "title": "Abstract Art Print",
      "short_description": "Beautiful abstract print",
      "long_description": "# Detailed description\nMarkdown supported",
      "base_price": 29.99,
      "currency": "EUR",
      "sku": "ART-001",
      "status": "published",
      "categories": [...],
      "images": [...],
      "variants": [...]
    }
  ],
  "total": 42,
  "page": 1,
  "per_page": 20
}
```

#### Get Product by Slug
```
GET /api/shop/products/{slug}

Response:
{
  "id": 1,
  "slug": "artwork-print-001",
  "title": "Abstract Art Print",
  ...
  "variants": [
    {
      "id": 1,
      "sku": "ART-001-M",
      "name": "Medium",
      "attributes": "{\"size\":\"M\"}",
      "price_adjustment": 0,
      "stock": 10
    }
  ]
}
```

### Cart

#### Get Cart
```
GET /api/shop/cart

Cookie: cart_session (auto-generated if not present)

Response:
{
  "cart": {
    "id": 1,
    "session_token": "uuid...",
    "items": [...]
  },
  "subtotal": 59.98,
  "tax": 0,
  "discount": 0,
  "total": 59.98
}
```

#### Add Item to Cart
```
POST /api/shop/cart/items

Request:
{
  "product_id": 1,
  "variant_id": 1,  // optional
  "quantity": 2
}

Response: Updated cart
```

#### Update Cart Item
```
PATCH /api/shop/cart/items/{id}

Request:
{
  "quantity": 3
}

Response: Updated cart
```

#### Remove Cart Item
```
DELETE /api/shop/cart/items/{id}

Response: 204 No Content
```

#### Clear Cart
```
DELETE /api/shop/cart

Response: 204 No Content
```

### Checkout

#### Apply Discount Code
```
POST /api/shop/cart/discount

Request:
{
  "code": "SUMMER20"
}

Response:
{
  "discount_code": "SUMMER20",
  "discount_type": "percentage",
  "discount_value": 20,
  "discount_amount": 11.99,
  "subtotal": 59.98,
  "tax": 0,
  "total_before": 59.98,
  "total_after": 48.00
}
```

#### Process Checkout
```
POST /api/shop/checkout

Request:
{
  "session_token": "uuid...",  // or from cookie
  "email": "customer@example.com",
  "name": "John Doe",
  "payment_method": "stripe",
  "shipping_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "country": "US"
  },
  "billing_address": {...},  // optional, defaults to shipping
  "discount_code": "SUMMER20"  // optional
}

Response:
{
  "order_id": "1",
  "order_number": "ORD-1234567890",
  "payment_intent_id": "pi_...",
  "client_secret": "pi_..._secret_...",
  "total": 48.00,
  "status": "pending"
}
```

### Webhooks

#### Stripe Payment Webhook
```
POST /api/webhooks/payment/stripe

Headers:
- Stripe-Signature: signature

Request: Stripe webhook event payload

Response: 200 OK
```

## Admin API

Base URL: `/api/admin` (requires authentication)

### Products

#### List Products
```
GET /api/admin/shop/products

Query Parameters: Same as public endpoint but shows all statuses

Response: Same as public endpoint
```

#### Get Product
```
GET /api/admin/shop/products/{id}

Response: Product details
```

#### Create Product
```
POST /api/admin/shop/products

Request:
{
  "slug": "new-artwork",
  "title": "New Artwork",
  "short_description": "Brief description",
  "long_description": "# Full description\nMarkdown content",
  "base_price": 29.99,
  "currency": "EUR",
  "sku": "ART-NEW-001",
  "gtin": "1234567890123",
  "status": "draft"
}

Response: Created product (201)
```

#### Update Product
```
PATCH /api/admin/shop/products/{id}

Request: Partial product updates

Response: 204 No Content
```

#### Delete Product
```
DELETE /api/admin/shop/products/{id}

Response: 204 No Content
```

### Variants

#### Add Variant
```
POST /api/admin/shop/products/{id}/variants

Request:
{
  "sku": "ART-001-L",
  "name": "Large",
  "attributes": "{\"size\":\"L\"}",
  "price_adjustment": 10.00,
  "stock": 5
}

Response: Created variant (201)
```

#### Update Variant
```
PATCH /api/admin/shop/variants/{id}

Request: Partial variant updates

Response: 204 No Content
```

### Inventory

#### Adjust Inventory
```
POST /api/admin/shop/inventory/adjust

Request:
{
  "variant_id": 1,
  "quantity": 10,
  "operation": "set"  // set, add, subtract
}

Response: 204 No Content
```

### Orders

#### List Orders
```
GET /api/admin/shop/orders

Query Parameters:
- payment_status (string): pending, paid, failed, refunded
- fulfillment_status (string): unfulfilled, fulfilled, partially_fulfilled
- customer_email (string): Filter by email
- start_date (ISO8601): Filter by created date
- end_date (ISO8601): Filter by created date
- page (int): Page number
- per_page (int): Results per page

Response:
{
  "orders": [
    {
      "id": 1,
      "order_number": "ORD-1234567890",
      "customer_email": "customer@example.com",
      "customer_name": "John Doe",
      "subtotal": 59.98,
      "tax": 0,
      "discount": 11.99,
      "total": 48.00,
      "payment_status": "paid",
      "fulfillment_status": "unfulfilled",
      "items": [...]
    }
  ],
  "total": 100,
  "page": 1,
  "per_page": 20
}
```

#### Get Order
```
GET /api/admin/shop/orders/{id}

Response: Order details with items
```

#### Update Fulfillment Status
```
PATCH /api/admin/shop/orders/{id}/fulfillment

Request:
{
  "status": "fulfilled"  // unfulfilled, fulfilled, partially_fulfilled
}

Response: 204 No Content
```

#### Refund Order
```
POST /api/admin/shop/orders/{id}/refund

Request:
{
  "amount": 25.00  // optional, full refund if omitted
}

Response: 204 No Content
```

### Notifications

#### List Notifications
```
GET /api/admin/notifications

Query Parameters:
- type (string): low_stock, payment_failed, order_created, order_paid
- severity (string): info, warning, error, critical
- unread (bool): Filter unread notifications
- page (int): Page number
- per_page (int): Results per page

Response:
{
  "notifications": [
    {
      "id": 1,
      "type": "order_created",
      "severity": "info",
      "title": "New Order: ORD-1234567890",
      "message": "New order from customer@example.com for €48.00",
      "payload": "{...}",
      "read_at": null,
      "created_at": "2025-10-17T19:45:00Z"
    }
  ],
  "total": 25,
  "unread_count": 5,
  "page": 1,
  "per_page": 20
}
```

#### Mark as Read
```
PATCH /api/admin/notifications/{id}/read

Response: 204 No Content
```

#### Mark All as Read
```
POST /api/admin/notifications/read-all

Response: 204 No Content
```

#### Delete Notification
```
DELETE /api/admin/notifications/{id}

Response: 204 No Content
```

### Shopify Sync

#### Trigger Manual Sync
```
POST /api/admin/shopify/sync

Response:
{
  "message": "Sync initiated"
}
```

## Payment Integration

The system uses an abstraction layer for payment providers.

### Mock Provider (Development)
- Configured by default for development
- Minimum amount: €0.01
- Simulates successful payments
- No real charges

### Stripe Provider (Production)
Configure environment variables:
```
STRIPE_API_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Switch to Stripe in `main.go`:
```go
// paymentProvider := payment.NewMockProvider("mock", 1, false)
paymentProvider := payment.NewStripeProvider()
```

### Payment Amounts
- Minimum transaction: €0.01
- Zero-amount transactions: Not supported by most providers
- For testing: Use mock provider or Stripe test cards

## Database Schema

### Tables
- `categories`: Product categories
- `products`: Enhanced products with multiple fields
- `product_categories`: Many-to-many junction
- `product_images`: Product images
- `product_variants`: Size, color, etc. variants
- `carts`: Persistent shopping carts
- `cart_items`: Cart line items
- `orders`: Customer orders
- `order_items`: Order line items
- `notifications`: System notifications
- `audit_logs`: Change audit trail
- `discount_codes`: Promotional codes
- `shopify_links`: Shopify entity mappings

### Migrations
SQL migrations are in `/backend/migrations/`

Run migrations:
```go
database.AutoMigrate()
```

## Error Handling

### HTTP Status Codes
- `200 OK`: Success
- `201 Created`: Resource created
- `204 No Content`: Success with no response body
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Error Response Format
```json
{
  "error": "Error message"
}
```

## Security

### Authentication
- Admin endpoints require JWT token
- Token passed in `Authorization: Bearer {token}` header
- Get token via `/api/auth/login`

### Session Management
- Cart session via HTTP-only cookie
- Session token: UUID v4
- 30-day expiration

### CORS
- Enabled for all origins in development
- Configure for production domains

## Performance

### Pagination
- All list endpoints support pagination
- Default: 20 items per page
- Maximum: 100 items per page

### Indexes
- Database indexes on frequently queried fields
- Slug, SKU, status, created_at, etc.

### Transactions
- Critical operations use database transactions
- Stock reservation during checkout
- Automatic rollback on failure

## Testing

### Unit Tests
(To be implemented)

### Integration Tests
(To be implemented)

### Manual Testing

Test checkout flow:
```bash
# Get products
curl http://localhost:8080/api/shop/products

# Add to cart
curl -X POST http://localhost:8080/api/shop/cart/items \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":1}'

# Get cart
curl http://localhost:8080/api/shop/cart

# Checkout
curl -X POST http://localhost:8080/api/shop/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "name":"Test User",
    "payment_method":"stripe",
    "shipping_address":{
      "street":"123 Main St",
      "city":"New York",
      "state":"NY",
      "zip_code":"10001",
      "country":"US"
    }
  }'
```

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=artuser
DB_PASSWORD=artpassword
DB_NAME=artmanagement
DB_SSLMODE=disable

# Stripe (optional)
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Shopify (optional)
SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...
SHOPIFY_SHOP_DOMAIN=...
```

## Future Enhancements

- [ ] Redis caching for product catalog
- [ ] Rate limiting on public endpoints
- [ ] Idempotency keys for checkout
- [ ] Structured logging with correlation IDs
- [ ] Background job queue for Shopify sync
- [ ] Email notifications
- [ ] Multi-currency support
- [ ] Advanced discount rules
- [ ] Product reviews and ratings
- [ ] Inventory alerts
- [ ] Sales analytics
