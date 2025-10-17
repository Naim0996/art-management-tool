# 🔧 Backend API

Go-based RESTful API for the Art Management Tool e-commerce platform. Built with performance, scalability, and maintainability in mind.

[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://go.dev/)
[![Framework](https://img.shields.io/badge/Framework-Gorilla%20Mux-blue)](https://github.com/gorilla/mux)
[![ORM](https://img.shields.io/badge/ORM-GORM-red)](https://gorm.io/)

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Database](#database)
- [Payment Processing](#payment-processing)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

## ✨ Features

### Core Functionality
- **RESTful API**: Clean, well-structured endpoints following REST principles
- **Product Management**: Full CRUD with variants, images, and categories
- **Shopping Cart**: Session-based cart with persistence
- **Order Processing**: Complete order lifecycle management
- **Payment Integration**: Stripe and mock payment providers
- **Inventory Management**: Real-time stock tracking and updates
- **Notification System**: Event-driven notifications for orders, payments, stock

### Technical Features
- **JWT Authentication**: Secure admin access with token-based auth
- **CORS Support**: Configurable cross-origin resource sharing
- **Database Migrations**: Version-controlled schema management
- **Health Checks**: Application monitoring endpoints
- **Structured Logging**: Comprehensive request/response logging
- **Error Handling**: Consistent error responses with proper HTTP codes
- **Input Validation**: Request validation and sanitization
- **Service Layer**: Clean separation of concerns

### Advanced Features
- **Discount System**: Promotional codes with validation
- **Webhooks**: Payment gateway webhook handlers
- **Audit Logging**: Track all admin actions
- **Shopify Integration**: Ready for Shopify API sync
- **Bulk Operations**: Inventory bulk adjustments
- **Analytics**: Sales and performance metrics

## 🏗️ Project Structure

```
backend/
├── cmd/                          # Command-line applications
│   ├── seed/                     # Database seeder for demo data
│   │   └── main.go
│   └── seed-orders/             # Order data seeder
│       └── main.go
│
├── database/                     # Database configuration
│   └── connection.go            # PostgreSQL/SQLite connection setup
│
├── handlers/                     # HTTP request handlers
│   ├── admin/                   # Admin-specific handlers
│   │   ├── orders.go           # Order management
│   │   ├── products.go         # Product management
│   │   └── inventory.go        # Inventory operations
│   ├── shop/                    # Customer-facing handlers
│   │   ├── products.go         # Product listing
│   │   ├── cart.go             # Cart operations
│   │   └── checkout.go         # Checkout process
│   ├── auth.go                  # Authentication handlers
│   ├── cart.go                  # Legacy cart handlers
│   ├── checkout.go              # Legacy checkout
│   ├── health.go               # Health check endpoint
│   ├── orders.go               # Order handlers
│   ├── personaggi.go           # Character/artist profiles
│   ├── personaggi_upload.go    # File upload handling
│   ├── products.go             # Legacy product handlers
│   └── stats.go                # Analytics endpoints
│
├── middleware/                  # HTTP middleware
│   └── auth.go                 # JWT authentication middleware
│
├── migrations/                  # SQL database migrations
│   ├── 001_create_categories.up.sql
│   ├── 002_create_products.up.sql
│   ├── 003_create_product_images.up.sql
│   ├── 004_create_product_variants.up.sql
│   ├── 005_create_orders.up.sql
│   ├── 006_create_carts.up.sql
│   ├── 007_create_notifications.up.sql
│   ├── 008_create_audit_logs.up.sql
│   ├── 009_create_shopify_discounts.up.sql
│   └── *.down.sql              # Rollback migrations
│
├── models/                      # Data models (GORM)
│   ├── cart.go                 # Cart and CartItem models
│   ├── catalog.go              # Product, Category, Variant models
│   ├── order.go                # Order and OrderItem models
│   ├── payment.go              # Payment-related models
│   ├── personaggio.go          # Character/artist models
│   ├── product.go              # Legacy product model
│   └── system.go               # System models (notifications, audit)
│
├── services/                    # Business logic layer
│   ├── cart/                   # Cart service
│   │   └── service.go
│   ├── notification/           # Notification service
│   │   └── service.go
│   ├── order/                  # Order processing service
│   │   └── service.go
│   ├── payment/                # Payment providers
│   │   ├── interface.go        # Payment provider interface
│   │   ├── mock.go            # Mock provider for testing
│   │   └── stripe.go          # Stripe integration
│   ├── product/                # Product catalog service
│   │   └── service.go
│   └── shopify/                # Shopify integration
│       └── service.go
│
├── Dockerfile                   # Docker build configuration
├── go.mod                       # Go module dependencies
├── go.sum                       # Dependency checksums
├── init.sql                     # Initial database schema (if needed)
├── main.go                      # Application entry point
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites

- **Go**: Version 1.21 or higher
- **PostgreSQL**: Version 13+ (production) or SQLite (development)
- **Make** (optional): For using Makefile commands

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/Naim0996/art-management-tool.git
   cd art-management-tool/backend
   ```

2. **Install dependencies**:
   ```bash
   go mod download
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations** (if using PostgreSQL):
   ```bash
   # Migrations run automatically on startup
   # Or use a migration tool like golang-migrate
   ```

5. **Seed the database** (optional):
   ```bash
   # Seed products
   go run cmd/seed/main.go
   
   # Seed orders
   go run cmd/seed-orders/main.go
   ```

6. **Start the server**:
   ```bash
   go run main.go
   ```

The API will be available at `http://localhost:8080`

### Quick Start with Docker

```bash
# From project root
docker compose up -d backend

# View logs
docker compose logs -f backend
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=8080
ENVIRONMENT=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/artdb?sslmode=disable
# Or for SQLite (development)
DATABASE_URL=sqlite://art.db

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION_HOURS=24

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Payment (Stripe)
STRIPE_API_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
PAYMENT_PROVIDER=stripe  # or "mock" for development

# Optional: Shopify Integration
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_SHOP_URL=your-shop.myshopify.com

# Logging
LOG_LEVEL=info  # debug, info, warn, error
```

## 📚 API Endpoints

### 🔓 Public Endpoints

#### Health Check
```http
GET /health
```
Returns server health status.

#### Shop - Products
```http
GET /api/shop/products
```
List products with filters: `?category=art&price_min=10&price_max=100&search=painting`

```http
GET /api/shop/products/{slug}
```
Get product details by slug.

#### Shop - Shopping Cart
```http
GET /api/shop/cart
```
Get current cart (session-based).

```http
POST /api/shop/cart/items
Content-Type: application/json

{
  "product_id": 1,
  "variant_id": 5,
  "quantity": 2
}
```
Add item to cart.

```http
PATCH /api/shop/cart/items/{id}
Content-Type: application/json

{
  "quantity": 3
}
```
Update cart item quantity.

```http
DELETE /api/shop/cart/items/{id}
```
Remove item from cart.

```http
DELETE /api/shop/cart
```
Clear entire cart.

#### Shop - Discount Codes
```http
POST /api/shop/cart/discount
Content-Type: application/json

{
  "code": "SUMMER2025"
}
```
Apply discount code to cart.

#### Shop - Checkout
```http
POST /api/shop/checkout
Content-Type: application/json

{
  "customer": {
    "email": "customer@example.com",
    "name": "John Doe"
  },
  "shipping_address": {
    "line1": "123 Main St",
    "city": "Rome",
    "postal_code": "00100",
    "country": "IT"
  },
  "payment_method": "stripe",
  "payment_details": {
    "token": "tok_visa"
  }
}
```
Process checkout and create order.

### 🔐 Admin Endpoints (Authentication Required)

**Authentication Header:**
```http
Authorization: Bearer <jwt-token>
```

#### Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}
```
Returns JWT token.

#### Admin - Products
```http
GET /api/admin/shop/products?page=1&per_page=20
```
List all products with pagination.

```http
POST /api/admin/shop/products
Content-Type: application/json

{
  "name": "Abstract Painting",
  "slug": "abstract-painting",
  "description": "Beautiful abstract art",
  "price": 299.99,
  "category_ids": [1, 2],
  "stock": 10,
  "images": [
    {"url": "https://...", "alt": "Main view", "is_primary": true}
  ]
}
```
Create new product.

```http
GET /api/admin/shop/products/{id}
```
Get product details.

```http
PATCH /api/admin/shop/products/{id}
Content-Type: application/json

{
  "price": 249.99,
  "stock": 15
}
```
Update product.

```http
DELETE /api/admin/shop/products/{id}
```
Delete product (soft delete).

#### Admin - Product Variants
```http
POST /api/admin/shop/products/{id}/variants
Content-Type: application/json

{
  "sku": "ABS-001-L",
  "name": "Large (100x100cm)",
  "price": 349.99,
  "stock": 5,
  "attributes": {
    "size": "Large",
    "frame": "Wood"
  }
}
```
Add product variant.

```http
PATCH /api/admin/shop/variants/{id}
Content-Type: application/json

{
  "stock": 10,
  "price": 329.99
}
```
Update variant.

#### Admin - Inventory
```http
POST /api/admin/shop/inventory/adjust
Content-Type: application/json

{
  "adjustments": [
    {"variant_id": 1, "quantity": 10, "reason": "Restock"},
    {"variant_id": 2, "quantity": -5, "reason": "Damaged"}
  ]
}
```
Bulk inventory adjustment.

#### Admin - Orders
```http
GET /api/admin/shop/orders?status=pending&page=1
```
List orders with filters.

```http
GET /api/admin/shop/orders/{id}
```
Get order details.

```http
PATCH /api/admin/shop/orders/{id}/fulfillment
Content-Type: application/json

{
  "status": "shipped",
  "tracking_number": "1Z999AA10123456784",
  "carrier": "UPS"
}
```
Update order fulfillment.

```http
POST /api/admin/shop/orders/{id}/refund
Content-Type: application/json

{
  "amount": 299.99,
  "reason": "Customer request"
}
```
Process order refund.

#### Admin - Notifications
```http
GET /api/admin/notifications?unread=true
```
List notifications.

```http
PATCH /api/admin/notifications/{id}/read
```
Mark notification as read.

#### Admin - Shopify Integration
```http
POST /api/admin/shopify/sync
```
Trigger Shopify product sync.

### 🔔 Webhooks

#### Payment Webhooks (Stripe)
```http
POST /api/webhooks/payment/stripe
Stripe-Signature: t=timestamp,v1=signature

{
  "type": "payment_intent.succeeded",
  "data": {...}
}
```
Handle Stripe payment events.

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication.

### Login Flow

1. **Request Token**:
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin"}'
   ```

2. **Response**:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": 1,
       "username": "admin"
     }
   }
   ```

3. **Use Token**:
   ```bash
   curl -X GET http://localhost:8080/api/admin/shop/products \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

### Default Credentials (Development)

- **Username**: `admin`
- **Password**: `admin`

> ⚠️ **Production Warning**: Change default credentials before deploying to production!

### Token Expiration

- Default: 24 hours
- Configurable via `JWT_EXPIRATION_HOURS` environment variable
- Tokens are automatically validated on each protected endpoint

### Security Best Practices

- Store tokens securely (HTTP-only cookies recommended for web apps)
- Never commit JWT secrets to version control
- Use HTTPS in production
- Implement token refresh mechanism for long-lived sessions
- Add rate limiting to prevent brute force attacks

## 💾 Database

### Supported Databases

- **PostgreSQL** (recommended for production)
- **SQLite** (development and testing)
- **MySQL** (supported via GORM, requires driver)

### Database Schema

Key tables:
- `categories` - Product categories
- `products` - Main product catalog
- `product_images` - Product image gallery
- `product_variants` - Product size/color/attribute variants
- `carts` - Shopping carts
- `cart_items` - Cart line items
- `orders` - Customer orders
- `order_items` - Order line items
- `notifications` - System notifications
- `audit_logs` - Admin action tracking
- `discount_codes` - Promotional codes
- `shopify_links` - Shopify product mappings

### Migrations

Migrations are located in `/backend/migrations/` and follow the naming convention:
```
{version}_{description}.{up|down}.sql
```

**Running Migrations:**

Option 1: Automatic (Development)
```go
// Runs on application startup
db.AutoMigrate(&models.Product{}, &models.Category{}, ...)
```

Option 2: Manual (Production)
```bash
# Install golang-migrate
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Run migrations
migrate -path ./migrations -database "postgres://user:pass@localhost:5432/artdb?sslmode=disable" up

# Rollback
migrate -path ./migrations -database "..." down 1
```

### Database Seeding

```bash
# Seed products and categories
go run cmd/seed/main.go

# Seed orders
go run cmd/seed-orders/main.go

# Custom seed script
go run cmd/seed/main.go --count 100
```

### Connection Management

- Connection pooling enabled by default
- Max open connections: 25
- Max idle connections: 25
- Connection max lifetime: 5 minutes
- Automatic reconnection on failure

## 💳 Payment Processing

### Payment Provider Architecture

The backend uses an **abstracted payment provider interface**, allowing easy integration with multiple payment gateways:

```go
type PaymentProvider interface {
    ProcessPayment(amount float64, currency string, details map[string]interface{}) (*PaymentResult, error)
    RefundPayment(transactionID string, amount float64) error
    ValidateWebhook(payload []byte, signature string) (bool, error)
}
```

### Supported Providers

#### 1. Stripe (Production)

**Configuration:**
```env
PAYMENT_PROVIDER=stripe
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Features:**
- Credit card processing
- Webhook event handling
- Automatic refunds
- 3D Secure support
- PCI compliant

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

#### 2. Mock Provider (Development)

**Configuration:**
```env
PAYMENT_PROVIDER=mock
```

**Features:**
- Instant approval (no external calls)
- Configurable success/failure rates
- No API keys required
- Perfect for testing and development

**Usage:**
```go
provider := payment.NewMockProvider("mock", 1, false)
// minAmount: €0.01, allowZero: false
```

### Payment Flow

1. **Frontend**: Collect payment details
2. **Backend**: Validate cart and calculate total
3. **Payment Provider**: Process payment
4. **Backend**: Create order on success
5. **Notification**: Send confirmation email
6. **Webhook**: Handle async payment events

### Webhook Handling

Stripe webhooks are received at `/api/webhooks/payment/stripe`:

```go
// Supported events
payment_intent.succeeded
payment_intent.payment_failed
charge.refunded
charge.dispute.created
```

**Webhook Security:**
- Signature verification
- Idempotency keys
- Event deduplication
- Retry handling

### Transaction Limits

- **Minimum**: €0.01 (configurable)
- **Maximum**: Provider dependent
- **Currencies**: EUR (default), extensible

### Error Handling

```json
{
  "error": "payment_failed",
  "message": "Insufficient funds",
  "code": "card_declined",
  "transaction_id": "txn_123456"
}
```

### Adding New Payment Providers

1. Implement `PaymentProvider` interface
2. Add provider factory in `services/payment/`
3. Configure via environment variable
4. Add webhook handler if needed

## 🧪 Testing

### Running Tests

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test ./... -cover

# Run tests with verbose output
go test ./... -v

# Run specific package tests
go test ./handlers/... -v

# Generate coverage report
go test ./... -coverprofile=coverage.out
go tool cover -html=coverage.out
```

### Test Structure

```
backend/
├── handlers/
│   ├── products_test.go
│   └── cart_test.go
├── services/
│   ├── cart/
│   │   └── service_test.go
│   └── payment/
│       └── mock_test.go
└── models/
    └── product_test.go
```

### Integration Tests

```bash
# Run integration tests (requires database)
go test ./... -tags=integration

# With Docker
docker compose -f docker-compose.test.yml up --abort-on-container-exit
```

### API Testing with cURL

```bash
# Test health endpoint
curl http://localhost:8080/health

# Test login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Test product listing
curl http://localhost:8080/api/shop/products

# Test cart creation
curl -X POST http://localhost:8080/api/shop/cart/items \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":2}'
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:8080/api/shop/products

# Using hey
hey -n 1000 -c 10 http://localhost:8080/api/shop/products
```

## 🛠️ Development

### Development Server

```bash
# Run with auto-reload (using air)
air

# Or with go run
go run main.go

# With specific environment
ENV=development go run main.go
```

### Code Generation

```bash
# Generate mocks
go generate ./...

# Install mockgen
go install github.com/golang/mock/mockgen@latest
```

### Debugging

**VS Code launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Backend",
      "type": "go",
      "request": "launch",
      "mode": "debug",
      "program": "${workspaceFolder}/backend",
      "env": {
        "PORT": "8080",
        "DATABASE_URL": "sqlite://test.db"
      }
    }
  ]
}
```

**Using Delve:**
```bash
dlv debug main.go
```

### Code Quality

```bash
# Run linter
golangci-lint run

# Format code
go fmt ./...

# Vet code
go vet ./...

# Check for common mistakes
staticcheck ./...
```

### Performance Profiling

```bash
# CPU profiling
go run main.go -cpuprofile=cpu.prof

# Memory profiling
go run main.go -memprofile=mem.prof

# Analyze profiles
go tool pprof cpu.prof
go tool pprof mem.prof
```

## 🚀 Deployment

### Building for Production

```bash
# Build binary
go build -o server main.go

# Build with optimizations
go build -ldflags="-s -w" -o server main.go

# Cross-compile for Linux
GOOS=linux GOARCH=amd64 go build -o server-linux main.go
```

### Docker Deployment

```bash
# Build image
docker build -t art-backend:latest .

# Run container
docker run -p 8080:8080 --env-file .env art-backend:latest

# Using Docker Compose
docker compose up -d backend
```

### Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Use PostgreSQL instead of SQLite
- [ ] Configure production database URL
- [ ] Set up database backups
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for production domains
- [ ] Set up logging and monitoring
- [ ] Configure Stripe production keys
- [ ] Set up error tracking (Sentry)
- [ ] Enable rate limiting
- [ ] Configure health checks
- [ ] Set up CI/CD pipeline
- [ ] Review security headers
- [ ] Configure session timeout

### Environment-Specific Configuration

**Development:**
```env
ENVIRONMENT=development
DATABASE_URL=sqlite://dev.db
LOG_LEVEL=debug
PAYMENT_PROVIDER=mock
```

**Staging:**
```env
ENVIRONMENT=staging
DATABASE_URL=postgresql://...
LOG_LEVEL=info
PAYMENT_PROVIDER=stripe
STRIPE_API_KEY=sk_test_...
```

**Production:**
```env
ENVIRONMENT=production
DATABASE_URL=postgresql://...
LOG_LEVEL=warn
PAYMENT_PROVIDER=stripe
STRIPE_API_KEY=sk_live_...
```

## 📖 Additional Resources

- 📘 [Go Documentation](https://go.dev/doc/)
- 🔧 [GORM Documentation](https://gorm.io/docs/)
- 🌐 [Gorilla Mux](https://github.com/gorilla/mux)
- 💳 [Stripe API Docs](https://stripe.com/docs/api)
- 🐳 [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🤝 Contributing

See the main [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.
