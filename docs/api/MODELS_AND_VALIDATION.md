# Models and Validation

Complete reference for all data models, their fields, validations, and constraints.

## Table of Contents
- [Product Models](#product-models)
- [Order Models](#order-models)
- [Cart Models](#cart-models)
- [Category Models](#category-models)
- [Payment Models](#payment-models)
- [System Models](#system-models)
- [Etsy Models](#etsy-models)
- [Personaggio Models](#personaggio-models)
- [Validation Rules](#validation-rules)

---

## Product Models

### EnhancedProduct

Main product entity with full features.

**Database Table:** `products`

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | uint | Primary Key | Product ID |
| `slug` | string(255) | Unique, Required | URL-friendly identifier |
| `title` | string(500) | Required | Product name |
| `short_description` | string(1000) | Optional | Brief description |
| `long_description` | text | Optional | Detailed description (Markdown) |
| `base_price` | decimal(10,2) | Required, ≥0 | Base price |
| `currency` | string(3) | Default: 'EUR' | Currency code (ISO 4217) |
| `sku` | string(100) | Unique | Stock Keeping Unit |
| `gtin` | string(50) | Optional | Global Trade Item Number |
| `status` | enum | Default: 'draft' | draft, published, archived |
| `categories` | []Category | Many-to-Many | Associated categories |
| `images` | []ProductImage | One-to-Many | Product images |
| `variants` | []ProductVariant | One-to-Many | Product variants |
| `created_at` | timestamp | Auto | Creation time |
| `updated_at` | timestamp | Auto | Last update time |
| `deleted_at` | timestamp | Nullable | Soft delete timestamp |

**Validations:**
- `slug`: Must be URL-safe, lowercase, alphanumeric with hyphens
- `title`: Min 1 char, max 500 chars
- `base_price`: Must be ≥ 0
- `status`: Must be one of: draft, published, archived
- `currency`: Valid ISO 4217 code

**Indexes:**
- Unique index on `slug`
- Unique index on `sku`
- Index on `deleted_at` (for soft deletes)

---

### ProductVariant

Product variations (size, color, etc.).

**Database Table:** `product_variants`

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | uint | Primary Key | Variant ID |
| `product_id` | uint | Required, Foreign Key | Parent product |
| `sku` | string(100) | Unique, Required | Variant SKU |
| `name` | string(255) | Required | Variant name (e.g., "Large Red") |
| `attributes` | jsonb | Optional | JSON attributes {"size": "L", "color": "red"} |
| `price_adjustment` | decimal(10,2) | Default: 0 | Price difference from base |
| `stock` | int | Default: 0, ≥0 | Available quantity |
| `created_at` | timestamp | Auto | Creation time |
| `updated_at` | timestamp | Auto | Last update time |
| `deleted_at` | timestamp | Nullable | Soft delete |

**Validations:**
- `sku`: Unique across all variants
- `name`: Min 1 char, max 255 chars
- `stock`: Must be ≥ 0
- `attributes`: Valid JSON object

**Indexes:**
- Unique index on `sku`
- Index on `product_id`
- Index on `deleted_at`

**Methods:**
```go
GetPrice(basePrice float64) float64
// Returns: basePrice + price_adjustment
```

---

### ProductImage

Product images with ordering.

**Database Table:** `product_images`

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | uint | Primary Key | Image ID |
| `product_id` | uint | Required, Foreign Key | Parent product |
| `url` | string(1000) | Required | Image URL/path |
| `alt_text` | string(500) | Optional | Accessibility text |
| `position` | int | Default: 0 | Display order (0-based) |
| `created_at` | timestamp | Auto | Upload time |

**Validations:**
- `url`: Valid URL or file path
- `position`: ≥ 0

**Indexes:**
- Index on `product_id`
- Composite index on `(product_id, position)` for ordering

---

## Category Models

### Category

Hierarchical product categories.

**Database Table:** `categories`

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | uint | Primary Key | Category ID |
| `name` | string(255) | Required | Category name |
| `slug` | string(255) | Unique, Required | URL-friendly identifier |
| `description` | text | Optional | Category description |
| `parent_id` | uint | Nullable, Foreign Key | Parent category (null = root) |
| `parent` | *Category | Self-reference | Parent category object |
| `children` | []Category | Self-reference | Child categories |
| `created_at` | timestamp | Auto | Creation time |
| `updated_at` | timestamp | Auto | Last update time |
| `deleted_at` | timestamp | Nullable | Soft delete |

**Validations:**
- `slug`: URL-safe, unique
- `name`: Min 1 char, max 255 chars
- `parent_id`: Must reference existing category (no circular refs)

**Indexes:**
- Unique index on `slug`
- Index on `parent_id`
- Index on `deleted_at`

**Hierarchical Structure:**
```
Category (id: 1, slug: "art")
  └── Category (id: 2, slug: "paintings", parent_id: 1)
      ├── Category (id: 3, slug: "oil-paintings", parent_id: 2)
      └── Category (id: 4, slug: "watercolor", parent_id: 2)
```

---

## Order Models

### Order

Customer orders with payment and fulfillment tracking.

**Database Table:** `orders`

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | uint | Primary Key | Order ID |
| `order_number` | string(50) | Unique, Required | Human-readable order # (ORD-2025-001) |
| `user_id` | uint | Nullable | Registered user ID |
| `customer_email` | string(255) | Required | Customer email |
| `customer_name` | string(255) | Required | Customer name |
| `subtotal` | decimal(10,2) | Required, ≥0 | Sum of items |
| `tax` | decimal(10,2) | Default: 0, ≥0 | Tax amount |
| `discount` | decimal(10,2) | Default: 0, ≥0 | Discount applied |
| `total` | decimal(10,2) | Required, ≥0 | Final total |
| `currency` | string(3) | Default: 'EUR' | Currency code |
| `payment_status` | enum | Default: 'pending' | pending, paid, failed, refunded |
| `payment_intent_id` | string(255) | Optional | Payment provider reference |
| `payment_method` | string(50) | Optional | Payment method used |
| `fulfillment_status` | enum | Default: 'unfulfilled' | unfulfilled, fulfilled, partially_fulfilled |
| `shipping_address` | jsonb | Optional | Shipping address JSON |
| `billing_address` | jsonb | Optional | Billing address JSON |
| `notes` | text | Optional | Order notes |
| `items` | []OrderItem | One-to-Many | Order line items |
| `created_at` | timestamp | Auto | Order placement time |
| `updated_at` | timestamp | Auto | Last update |
| `deleted_at` | timestamp | Nullable | Soft delete |

**Validations:**
- `order_number`: Unique, follows pattern ORD-YYYY-XXX
- `customer_email`: Valid email format
- `total` = `subtotal` + `tax` - `discount`
- `payment_status`: One of: pending, paid, failed, refunded
- `fulfillment_status`: One of: unfulfilled, fulfilled, partially_fulfilled

**Indexes:**
- Unique index on `order_number`
- Index on `user_id`
- Index on `customer_email`
- Index on `payment_status`
- Index on `created_at` (for date range queries)

**Address JSON Structure:**
```json
{
  "street": "123 Main St",
  "city": "Rome",
  "state": "RM",
  "zip_code": "00100",
  "country": "IT"
}
```

---

### OrderItem

Individual items within an order.

**Database Table:** `order_items`

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | uint | Primary Key | Item ID |
| `order_id` | uint | Required, Foreign Key | Parent order |
| `product_id` | uint | Nullable | Product reference |
| `variant_id` | uint | Nullable | Variant reference |
| `product_name` | string(500) | Required | Product name (snapshot) |
| `variant_name` | string(255) | Optional | Variant name (snapshot) |
| `sku` | string(100) | Optional | SKU (snapshot) |
| `quantity` | int | Required, ≥1 | Quantity ordered |
| `unit_price` | decimal(10,2) | Required, ≥0 | Price per unit |
| `total_price` | decimal(10,2) | Required, ≥0 | quantity × unit_price |
| `created_at` | timestamp | Auto | Creation time |

**Validations:**
- `quantity`: Must be ≥ 1
- `total_price` = `quantity` × `unit_price`

**Indexes:**
- Index on `order_id`
- Index on `product_id`
- Index on `variant_id`

**Note:** Product/variant names and prices are stored as snapshots to preserve order history even if products are modified or deleted.

---

## Cart Models

### Cart

Shopping cart for session-based or user-based shopping.

**Database Table:** `carts`

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | uint | Primary Key | Cart ID |
| `session_token` | string(255) | Unique, Required | Session identifier |
| `user_id` | uint | Nullable | Registered user ID |
| `expires_at` | timestamp | Nullable | Expiration time |
| `items` | []CartItem | One-to-Many | Cart items |
| `created_at` | timestamp | Auto | Creation time |
| `updated_at` | timestamp | Auto | Last update |

**Validations:**
- `session_token`: Unique, secure random token
- `expires_at`: If set, must be in future

**Indexes:**
- Unique index on `session_token`
- Index on `user_id`
- Index on `expires_at` (for cleanup queries)

---

### CartItem

Items in shopping cart.

**Database Table:** `cart_items`

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | uint | Primary Key | Item ID |
| `cart_id` | uint | Required, Foreign Key | Parent cart |
| `product_id` | uint | Required, Foreign Key | Product reference |
| `product` | *EnhancedProduct | Relation | Product object |
| `variant_id` | uint | Nullable, Foreign Key | Variant reference |
| `variant` | *ProductVariant | Relation | Variant object |
| `quantity` | int | Required, ≥1 | Quantity |
| `created_at` | timestamp | Auto | Added time |
| `updated_at` | timestamp | Auto | Last update |

**Validations:**
- `quantity`: Must be ≥ 1
- `product_id`: Must reference existing, published product
- `variant_id`: If set, must belong to the product

**Indexes:**
- Index on `cart_id`
- Index on `product_id`
- Index on `variant_id`

**Methods:**
```go
CalculateTotal() float64
// Returns: (base_price + price_adjustment) × quantity
```

---

## Payment Models

### CheckoutRequest

Request payload for checkout.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cart_id` | string | No | Cart ID (deprecated) |
| `session_token` | string | Yes | Session token |
| `payment_method` | enum | Yes | credit_card, paypal, stripe, etsy |
| `email` | string | Yes | Customer email |
| `name` | string | Yes | Customer name |
| `shipping_address` | Address | Yes | Shipping address |
| `billing_address` | Address | No | Billing address (uses shipping if omitted) |
| `discount_code` | string | No | Discount code to apply |

**Validations:**
- `email`: Valid email format
- `name`: Min 1 char
- `payment_method`: One of: credit_card, paypal, stripe, etsy
- `shipping_address`: All address fields required

---

### Address

Physical address structure.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `street` | string | Yes | Street address |
| `city` | string | Yes | City |
| `state` | string | Yes | State/Province |
| `zip_code` | string | Yes | Postal code |
| `country` | string | Yes | Country (ISO 3166-1 alpha-2) |

**Validations:**
- All fields required
- `country`: Valid ISO country code
- `zip_code`: Valid format for country

---

### CheckoutResponse

Response from checkout.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `order_id` | string | Internal order ID |
| `order_number` | string | Human-readable order number |
| `payment_intent_id` | string | Payment provider reference |
| `client_secret` | string | For client-side payment confirmation |
| `total` | float64 | Order total |
| `status` | string | Payment status |

---

## System Models

### Notification

System notifications for admins.

**Database Table:** `notifications`

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | uint | Primary Key | Notification ID |
| `type` | enum | Required | low_stock, payment_failed, order_created, order_paid, system |
| `severity` | enum | Default: 'info' | info, warning, error, critical |
| `title` | string(255) | Required | Notification title |
| `message` | text | Optional | Detailed message |
| `payload` | jsonb | Optional | Additional data |
| `read_at` | timestamp | Nullable | When marked as read |
| `created_at` | timestamp | Auto | Creation time |

**Validations:**
- `type`: Must be valid notification type
- `severity`: Must be valid severity level

**Indexes:**
- Index on `type`
- Index on `severity`
- Index on `read_at` (for filtering unread)
- Index on `created_at`

**Methods:**
```go
MarkAsRead()   // Sets read_at to now
IsRead() bool  // Returns true if read_at is not nil
```

---

### AuditLog

Audit trail for entity changes.

**Database Table:** `audit_logs`

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | uint | Primary Key | Log ID |
| `entity_type` | string(100) | Required | Entity type (Product, Order, etc.) |
| `entity_id` | uint | Required | Entity ID |
| `action` | string(50) | Required | create, update, delete |
| `actor` | string(255) | Optional | Who performed action |
| `diff` | jsonb | Optional | Changes made |
| `created_at` | timestamp | Auto | Action timestamp |

**Indexes:**
- Composite index on `(entity_type, entity_id)`
- Index on `action`
- Index on `actor`
- Index on `created_at`

---

### DiscountCode

Promotional discount codes.

**Database Table:** `discount_codes`

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | uint | Primary Key | Discount ID |
| `code` | string(50) | Unique, Required | Discount code |
| `type` | enum | Required | percentage, fixed_amount |
| `value` | decimal(10,2) | Required, >0 | Discount value |
| `min_purchase` | decimal(10,2) | Optional | Minimum purchase required |
| `max_uses` | int | Nullable | Maximum number of uses |
| `used_count` | int | Default: 0 | Times used |
| `starts_at` | timestamp | Nullable | Start date |
| `expires_at` | timestamp | Nullable | Expiration date |
| `active` | bool | Default: true | Is active |
| `created_at` | timestamp | Auto | Creation time |
| `updated_at` | timestamp | Auto | Last update |
| `deleted_at` | timestamp | Nullable | Soft delete |

**Validations:**
- `code`: Uppercase, alphanumeric, unique
- `type`: percentage or fixed_amount
- `value`: For percentage, 0-100; for fixed_amount, > 0
- `starts_at` < `expires_at` (if both set)

**Indexes:**
- Unique index on `code`
- Index on `active`
- Index on `expires_at`

**Methods:**
```go
IsValid() bool
// Checks: active, date range, max uses

CalculateDiscount(subtotal float64) float64
// Returns discount amount based on type and value
```

---

## Etsy Models

### EtsyProduct

Products synced from Etsy.

**Database Table:** `etsy_products`

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | uint | Primary Key | Internal ID |
| `listing_id` | string | Unique, Required | Etsy listing ID |
| `title` | string | Required | Product title |
| `description` | text | Optional | Product description |
| `price` | decimal(10,2) | Required | Etsy price |
| `currency` | string(3) | Default: 'USD' | Currency |
| `quantity` | int | Default: 0 | Available quantity |
| `state` | string | Required | active, inactive, draft |
| `url` | string | Optional | Etsy listing URL |
| `local_product_id` | uint | Nullable | Linked local product |
| `last_synced_at` | timestamp | Optional | Last sync time |
| `created_at` | timestamp | Auto | Creation time |
| `updated_at` | timestamp | Auto | Last update |

**Indexes:**
- Unique index on `listing_id`
- Index on `local_product_id`
- Index on `state`

---

### EtsyReceipt

Etsy payment receipts.

**Database Table:** `etsy_receipts`

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | uint | Primary Key | Internal ID |
| `receipt_id` | string | Unique, Required | Etsy receipt ID |
| `buyer_email` | string | Optional | Buyer email |
| `buyer_name` | string | Optional | Buyer name |
| `total_price` | decimal(10,2) | Required | Total amount |
| `currency` | string(3) | Required | Currency |
| `status` | string | Required | paid, unpaid, refunded |
| `local_order_id` | uint | Nullable | Linked local order |
| `created_at` | timestamp | Auto | Creation time |
| `updated_at` | timestamp | Auto | Last update |

---

## Personaggio Models

### Personaggio

Gallery character entities (legacy).

**Database Table:** `personaggi`

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | uint | Primary Key | Character ID |
| `name` | string | Required | Character name |
| `description` | text | Optional | Character description |
| `icon` | string | Optional | Icon image path |
| `images` | json | Optional | Array of image paths |
| `background_color` | string | Default: '#E0E7FF' | Card background color |
| `background_type` | enum | Default: 'solid' | solid, gradient |
| `gradient_from` | string | Optional | Gradient start color |
| `gradient_to` | string | Optional | Gradient end color |
| `order` | int | Default: 0 | Display order |
| `created_at` | timestamp | Auto | Creation time |
| `updated_at` | timestamp | Auto | Last update |
| `deleted_at` | timestamp | Nullable | Soft delete |

**Validations:**
- `name`: Min 1 char, max 100 chars
- `background_color`: Valid hex color
- `background_type`: solid or gradient
- If gradient: both gradient_from and gradient_to required

**Indexes:**
- Index on `order`
- Index on `deleted_at`

---

## Validation Rules

### Global Rules

#### String Validations
- **Email**: RFC 5322 compliant
- **URL**: Valid HTTP/HTTPS URL
- **Slug**: Lowercase, alphanumeric, hyphens only, no spaces
- **Color**: Hex format (#RRGGBB)

#### Numeric Validations
- **Price fields**: Always ≥ 0, max 2 decimal places
- **Quantity fields**: Always ≥ 0 (stock) or ≥ 1 (order quantities)
- **Percentages**: 0-100 range

#### Temporal Validations
- **Date ranges**: Start date < End date
- **Expiration**: If set, must be in future at creation

### Field-Specific Constraints

#### Product Title/Name
- Min: 1 character
- Max: 500 characters
- No HTML tags allowed

#### SKU Format
- Max: 100 characters
- Alphanumeric, hyphens, underscores
- Unique across all products and variants

#### Order Number Format
- Pattern: `ORD-YYYY-NNNNN`
- Example: `ORD-2025-00001`
- Auto-generated, unique

#### Discount Code Format
- Max: 50 characters
- Uppercase letters and numbers only
- No special characters
- Unique

### Database Constraints

#### Soft Deletes
Models with `deleted_at` field:
- Products, Categories, Variants
- Orders, Discount Codes
- Personaggi

Queries automatically exclude soft-deleted records unless explicitly included.

#### Foreign Key Constraints
- `ON DELETE CASCADE`: CartItems → Cart
- `ON DELETE SET NULL`: OrderItems → Product/Variant (preserve order history)
- `ON DELETE RESTRICT`: Categories with children, Products with orders

#### Unique Constraints
- Product slug
- Product SKU, Variant SKU
- Category slug
- Order number
- Discount code
- Etsy listing_id, receipt_id

---

## Validation Errors

Standard validation error response format:

```json
{
  "error": "Validation failed",
  "details": {
    "email": ["must be a valid email address"],
    "base_price": ["must be greater than or equal to 0"],
    "slug": ["has already been taken"]
  }
}
```

**Common Validation Messages:**
- `required`: Field is required
- `min`: Below minimum value/length
- `max`: Above maximum value/length
- `unique`: Value already exists
- `invalid_format`: Format doesn't match pattern
- `foreign_key`: Referenced entity doesn't exist
