# API Reference

Complete API documentation for the Art Management Tool backend.

## Base URLs

- **Development**: `http://localhost:8080`
- **Production**: `https://your-domain.com`

## Authentication

Most admin endpoints require JWT authentication.

### Headers
```http
Authorization: Bearer <jwt_token>
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your_password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user_id": 1,
  "username": "admin"
}
```

---

## Public Shop API

### Products

#### List Products
```http
GET /api/shop/products
```

**Query Parameters:**
- `category` (optional): Filter by category slug
- `status` (optional): Filter by status (published, draft, archived)
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "slug": "product-name",
      "title": "Product Name",
      "short_description": "Short desc",
      "base_price": 29.99,
      "currency": "EUR",
      "status": "published",
      "images": [
        {
          "id": 1,
          "url": "/uploads/product-1.jpg",
          "alt_text": "Product image",
          "position": 0
        }
      ],
      "variants": [
        {
          "id": 1,
          "sku": "PROD-001-M",
          "name": "Medium",
          "price_adjustment": 0,
          "stock": 10
        }
      ],
      "categories": [
        {
          "id": 1,
          "name": "Category Name",
          "slug": "category-name"
        }
      ]
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

#### Get Product by Slug
```http
GET /api/shop/products/{slug}
```

**Response:** Single product object with all details.

---

### Categories

#### List Categories
```http
GET /api/shop/categories
```

**Response:**
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Paintings",
      "slug": "paintings",
      "description": "Beautiful paintings",
      "children": [
        {
          "id": 2,
          "name": "Oil Paintings",
          "slug": "oil-paintings"
        }
      ]
    }
  ],
  "total": 10
}
```

#### Get Category
```http
GET /api/shop/categories/{id}
```

---

### Shopping Cart

#### Get Cart
```http
GET /api/shop/cart
```

**Headers:**
- `X-Session-Token`: Session token for cart identification

**Response:**
```json
{
  "id": 1,
  "session_token": "abc123...",
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "variant_id": 2,
      "quantity": 2,
      "product": {
        "id": 1,
        "title": "Product Name",
        "base_price": 29.99
      },
      "variant": {
        "id": 2,
        "name": "Medium",
        "price_adjustment": 5.00
      }
    }
  ],
  "total": 69.98
}
```

#### Add Item to Cart
```http
POST /api/shop/cart/items
Content-Type: application/json

{
  "product_id": 1,
  "variant_id": 2,
  "quantity": 1
}
```

**Headers:**
- `X-Session-Token`: Session token (created if not exists)

**Response:**
```json
{
  "cart": { /* cart object */ },
  "item": { /* added item */ }
}
```

#### Update Cart Item
```http
PATCH /api/shop/cart/items/{id}
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove Cart Item
```http
DELETE /api/shop/cart/items/{id}
```

#### Clear Cart
```http
DELETE /api/shop/cart
```

---

### Checkout

#### Apply Discount Code
```http
POST /api/shop/cart/discount
Content-Type: application/json

{
  "code": "SUMMER2025",
  "session_token": "abc123..."
}
```

**Response:**
```json
{
  "discount": {
    "code": "SUMMER2025",
    "type": "percentage",
    "value": 10,
    "discount_amount": 5.99
  },
  "new_total": 53.99
}
```

#### Process Checkout
```http
POST /api/shop/checkout
Content-Type: application/json

{
  "session_token": "abc123...",
  "payment_method": "stripe",
  "email": "customer@example.com",
  "name": "John Doe",
  "shipping_address": {
    "street": "123 Main St",
    "city": "Rome",
    "state": "RM",
    "zip_code": "00100",
    "country": "IT"
  },
  "billing_address": {
    "street": "123 Main St",
    "city": "Rome",
    "state": "RM",
    "zip_code": "00100",
    "country": "IT"
  },
  "discount_code": "SUMMER2025"
}
```

**Response:**
```json
{
  "order_id": "123",
  "order_number": "ORD-2025-001",
  "payment_intent_id": "pi_abc123...",
  "client_secret": "pi_abc123_secret_xyz",
  "total": 53.99,
  "status": "pending"
}
```

---

## Admin API

All admin endpoints require authentication: `Authorization: Bearer <token>`

### Dashboard Stats

#### Get Dashboard Statistics
```http
GET /api/admin/stats
```

**Response:**
```json
{
  "total_revenue": 5000.00,
  "total_orders": 120,
  "pending_orders": 5,
  "low_stock_products": 3,
  "recent_orders": [ /* order objects */ ]
}
```

---

### Product Management

#### List Products (Admin)
```http
GET /api/admin/shop/products
```

**Query Parameters:**
- `status`: Filter by status (draft, published, archived)
- `category`: Filter by category ID
- `page`, `limit`: Pagination

**Response:** Same structure as public API but includes draft/archived products.

#### Create Product
```http
POST /api/admin/shop/products
Content-Type: application/json

{
  "slug": "new-product",
  "title": "New Product",
  "short_description": "Short description",
  "long_description": "# Detailed description\n\nMarkdown supported",
  "base_price": 49.99,
  "currency": "EUR",
  "sku": "PROD-001",
  "status": "draft",
  "category_ids": [1, 2]
}
```

**Response:**
```json
{
  "product": { /* created product */ }
}
```

#### Update Product
```http
PATCH /api/admin/shop/products/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "base_price": 59.99,
  "status": "published"
}
```

#### Delete Product
```http
DELETE /api/admin/shop/products/{id}
```

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

---

### Product Variants

#### Add Variant
```http
POST /api/admin/shop/products/{id}/variants
Content-Type: application/json

{
  "sku": "PROD-001-L",
  "name": "Large",
  "attributes": {
    "size": "L",
    "color": "Blue"
  },
  "price_adjustment": 10.00,
  "stock": 20
}
```

#### Update Variant
```http
PATCH /api/admin/shop/variants/{id}
Content-Type: application/json

{
  "stock": 15,
  "price_adjustment": 12.00
}
```

#### Update Inventory
```http
POST /api/admin/shop/inventory/adjust
Content-Type: application/json

{
  "variant_id": 1,
  "quantity": 10,
  "operation": "add"  // or "subtract", "set"
}
```

---

### Product Images

#### Upload Product Image
```http
POST /api/admin/shop/products/{id}/images
Content-Type: multipart/form-data

file: <image_file>
alt_text: "Image description"
position: 0
```

**Response:**
```json
{
  "image": {
    "id": 1,
    "product_id": 1,
    "url": "/uploads/products/image-123.jpg",
    "alt_text": "Image description",
    "position": 0
  }
}
```

#### List Product Images
```http
GET /api/admin/shop/products/{id}/images
```

#### Update Image Position
```http
PATCH /api/admin/shop/products/{id}/images/{imageId}
Content-Type: application/json

{
  "position": 1
}
```

#### Delete Image
```http
DELETE /api/admin/shop/products/{id}/images/{imageId}
```

---

### Order Management

#### List Orders
```http
GET /api/admin/shop/orders
```

**Query Parameters:**
- `status`: Filter by payment status (pending, paid, failed, refunded)
- `fulfillment`: Filter by fulfillment status (unfulfilled, fulfilled, partially_fulfilled)
- `from_date`: Start date (ISO 8601)
- `to_date`: End date (ISO 8601)
- `page`, `limit`: Pagination

**Response:**
```json
{
  "orders": [
    {
      "id": 1,
      "order_number": "ORD-2025-001",
      "customer_email": "customer@example.com",
      "customer_name": "John Doe",
      "subtotal": 59.98,
      "tax": 12.00,
      "discount": 5.99,
      "total": 65.99,
      "currency": "EUR",
      "payment_status": "paid",
      "payment_method": "stripe",
      "fulfillment_status": "unfulfilled",
      "items": [
        {
          "id": 1,
          "product_name": "Product Name",
          "variant_name": "Medium",
          "quantity": 2,
          "unit_price": 29.99,
          "total_price": 59.98
        }
      ],
      "created_at": "2025-10-25T12:00:00Z"
    }
  ],
  "total": 120,
  "page": 1,
  "limit": 20
}
```

#### Get Order Details
```http
GET /api/admin/shop/orders/{id}
```

#### Update Fulfillment Status
```http
PATCH /api/admin/shop/orders/{id}/fulfillment
Content-Type: application/json

{
  "status": "fulfilled",
  "tracking_number": "TRACK123",
  "carrier": "DHL"
}
```

#### Refund Order
```http
POST /api/admin/shop/orders/{id}/refund
Content-Type: application/json

{
  "amount": 65.99,
  "reason": "Customer requested refund"
}
```

---

### Categories

#### List Categories (Admin)
```http
GET /api/admin/categories
```

#### Create Category
```http
POST /api/admin/categories
Content-Type: application/json

{
  "name": "New Category",
  "slug": "new-category",
  "description": "Category description",
  "parent_id": null
}
```

#### Update Category
```http
PATCH /api/admin/categories/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### Delete Category
```http
DELETE /api/admin/categories/{id}
```

---

### Discount Codes

#### List Discounts
```http
GET /api/admin/discounts
```

**Query Parameters:**
- `active`: Filter by active status (true/false)
- `page`, `limit`: Pagination

#### Create Discount
```http
POST /api/admin/discounts
Content-Type: application/json

{
  "code": "WINTER2025",
  "type": "percentage",
  "value": 15,
  "min_purchase": 50.00,
  "max_uses": 100,
  "starts_at": "2025-12-01T00:00:00Z",
  "expires_at": "2025-12-31T23:59:59Z",
  "active": true
}
```

**Discount Types:**
- `percentage`: Value is percentage off (0-100)
- `fixed_amount`: Value is fixed amount in currency

#### Update Discount
```http
PATCH /api/admin/discounts/{id}
Content-Type: application/json

{
  "active": false
}
```

#### Get Discount Statistics
```http
GET /api/admin/discounts/{id}/stats
```

**Response:**
```json
{
  "code": "WINTER2025",
  "used_count": 45,
  "max_uses": 100,
  "total_revenue": 2500.00,
  "total_discount_given": 375.00
}
```

---

### Notifications

#### List Notifications
```http
GET /api/admin/notifications
```

**Query Parameters:**
- `type`: Filter by type (low_stock, payment_failed, order_created, etc.)
- `severity`: Filter by severity (info, warning, error, critical)
- `unread`: Show only unread (true/false)
- `page`, `limit`: Pagination

**Response:**
```json
{
  "notifications": [
    {
      "id": 1,
      "type": "low_stock",
      "severity": "warning",
      "title": "Low Stock Alert",
      "message": "Product 'Blue Shirt' is low on stock",
      "payload": {
        "product_id": 1,
        "current_stock": 3
      },
      "read_at": null,
      "created_at": "2025-10-25T10:00:00Z"
    }
  ],
  "total": 15,
  "unread_count": 5
}
```

#### Mark as Read
```http
PATCH /api/admin/notifications/{id}/read
```

#### Mark All as Read
```http
POST /api/admin/notifications/read-all
```

#### Delete Notification
```http
DELETE /api/admin/notifications/{id}
```

---

### Personaggi (Legacy)

#### List Personaggi
```http
GET /api/admin/personaggi
```

#### Create Personaggio
```http
POST /api/admin/personaggi
Content-Type: application/json

{
  "name": "Character Name",
  "description": "Character description",
  "backgroundColor": "#E0E7FF",
  "backgroundType": "gradient",
  "gradientFrom": "#667EEA",
  "gradientTo": "#764BA2",
  "order": 1
}
```

#### Upload Personaggio Image
```http
POST /api/admin/personaggi/{id}/upload
Content-Type: multipart/form-data

file: <image_file>
```

#### Update Personaggio
```http
PUT /api/admin/personaggi/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### Delete Personaggio (Soft Delete)
```http
DELETE /api/admin/personaggi/{id}
```

#### Restore Personaggio
```http
POST /api/admin/personaggi/{id}/restore
```

---

### Etsy Integration

#### Trigger Product Sync
```http
POST /api/admin/etsy/sync/products
```

#### Trigger Inventory Sync
```http
POST /api/admin/etsy/sync/inventory
```

#### Get Sync Status
```http
GET /api/admin/etsy/sync/status
```

**Response:**
```json
{
  "products_last_sync": "2025-10-25T10:00:00Z",
  "inventory_last_sync": "2025-10-25T11:30:00Z",
  "products_synced": 150,
  "errors": []
}
```

#### List Etsy Products
```http
GET /api/admin/etsy/products
```

#### Link Product
```http
POST /api/admin/etsy/products/{listing_id}/link
Content-Type: application/json

{
  "local_product_id": 1
}
```

#### Validate Credentials
```http
POST /api/admin/etsy/validate
```

---

## Webhooks

### Stripe Payment Webhook
```http
POST /api/webhooks/payment/stripe
```

**Headers:**
- `Stripe-Signature`: Webhook signature for verification

This endpoint processes Stripe webhook events for payment status updates.

---

## Error Responses

All endpoints return standard error responses:

**400 Bad Request:**
```json
{
  "error": "Invalid request",
  "details": "Missing required field: email"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**404 Not Found:**
```json
{
  "error": "Not found",
  "message": "Product not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- **Rate limit**: 60 requests per minute (configurable)
- **Headers returned**:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

---

## CORS

CORS is enabled for specified origins in environment configuration:
- Development: `http://localhost:3000`
- Production: Configure in `CORS_ALLOWED_ORIGINS`

**Allowed Methods:** GET, POST, PUT, PATCH, DELETE, OPTIONS  
**Allowed Headers:** Content-Type, Authorization
