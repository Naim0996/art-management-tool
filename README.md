# Art Management Tool

A full-stack art gallery management system with backend API, frontend web application, and infrastructure as code.

## Project Structure

```
art-management-tool/
├── backend/           # Go backend API
├── frontend/          # Next.js frontend application
├── infrastructure/    # Terraform IaC configurations
└── README.md
```

## Features

### E-Commerce Shop (New!)
- **Product Catalog**: Comprehensive product management with variants, categories, images
- **Shopping Cart**: Session-based cart with guest and authenticated user support
- **Checkout**: Integrated payment processing with stock reservation
- **Order Management**: Complete order lifecycle from creation to fulfillment
- **Notifications**: Real-time event notifications (low stock, payment events, orders)
- **Discount Codes**: Promotional code system with validation
- **Admin Dashboard**: Full management interface for products, orders, and inventory
- **Payment Integration**: Abstracted payment provider (Stripe support ready)
- **Shopify Ready**: Prepared for Shopify API integration

### Customer Features
- Browse art products with advanced filtering
- Add items to shopping cart
- Multiple payment methods (Credit Card, PayPal, Stripe)
- Checkout with shipping information
- Order tracking

### Admin Features
- Secure admin login
- Product management (Create, Read, Update, Delete)
- Variant management (sizes, colors, attributes)
- Inventory management with bulk operations
- Order management and fulfillment tracking
- Notification center
- Dashboard interface

## Technology Stack

- **Backend**: Go (Golang) with Gorilla Mux
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Deployment**: Docker and Docker Compose
- **Infrastructure** (Optional): Terraform for AWS cloud deployment

## Quick Start

### Option 1: Using Docker (Recommended)

The fastest way to run the entire application:

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

For detailed Docker instructions, see [DOCKER.md](./DOCKER.md)

### Option 2: Local Development

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   go mod download
   ```

3. Run the server:
   ```bash
   go run main.go
   ```

The backend API will be available at `http://localhost:8080`

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Enhanced Shop API (New)

#### Public Shop Endpoints
- `GET /api/shop/products` - List products with advanced filters
- `GET /api/shop/products/{slug}` - Get product by slug
- `GET /api/shop/cart` - Get shopping cart
- `POST /api/shop/cart/items` - Add item to cart
- `PATCH /api/shop/cart/items/{id}` - Update cart item
- `DELETE /api/shop/cart/items/{id}` - Remove cart item
- `DELETE /api/shop/cart` - Clear cart
- `POST /api/shop/cart/discount` - Apply discount code
- `POST /api/shop/checkout` - Process checkout

#### Webhooks
- `POST /api/webhooks/payment/stripe` - Stripe payment webhooks

#### Admin Shop Endpoints (Requires Authentication)
- `GET /api/admin/shop/products` - List all products
- `POST /api/admin/shop/products` - Create product
- `GET /api/admin/shop/products/{id}` - Get product details
- `PATCH /api/admin/shop/products/{id}` - Update product
- `DELETE /api/admin/shop/products/{id}` - Delete product
- `POST /api/admin/shop/products/{id}/variants` - Add variant
- `PATCH /api/admin/shop/variants/{id}` - Update variant
- `POST /api/admin/shop/inventory/adjust` - Adjust inventory
- `GET /api/admin/shop/orders` - List orders
- `GET /api/admin/shop/orders/{id}` - Get order details
- `PATCH /api/admin/shop/orders/{id}/fulfillment` - Update fulfillment
- `POST /api/admin/shop/orders/{id}/refund` - Process refund
- `GET /api/admin/notifications` - List notifications
- `PATCH /api/admin/notifications/{id}/read` - Mark as read
- `POST /api/admin/shopify/sync` - Trigger Shopify sync

### Authentication
- `POST /api/auth/login` - Admin login

### Legacy Admin Endpoints (Backward Compatible)
- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create a new product
- `PUT /api/admin/products/{id}` - Update a product
- `DELETE /api/admin/products/{id}` - Delete a product

### Legacy Customer Endpoints (Backward Compatible)
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get a single product
- `POST /api/cart` - Add item to cart
- `GET /api/cart` - Get cart contents
- `DELETE /api/cart/{id}` - Remove item from cart
- `POST /api/checkout` - Process checkout

See [SHOP_API.md](./SHOP_API.md) for complete API documentation.

## Demo Credentials

**Admin Login:**
- Username: `admin`
- Password: `admin`

## Payment Methods

The enhanced shop supports multiple payment methods:
- **Stripe**: Production-ready integration (requires API keys)
- **Mock Provider**: For development and testing
- Credit Card, PayPal (legacy placeholders)

### Payment Configuration

For development (default):
```go
// Uses mock provider with €0.01 minimum
paymentProvider := payment.NewMockProvider("mock", 1, false)
```

For production with Stripe:
```env
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

```go
paymentProvider := payment.NewStripeProvider()
```

### Transaction Limits
- Minimum: €0.01
- Zero-amount transactions: Not supported by most providers
- Test mode: Use Stripe test cards or mock provider

*Note: Payment processing in development mode is simulated and does not charge real payments.*

## Development

### Backend Development
The backend is built with Go and uses in-memory storage for simplicity. For production:
- Integrate a database (PostgreSQL, MongoDB, etc.)
- Implement proper JWT authentication
- Add payment gateway integration
- Set up proper logging and monitoring

### Frontend Development
The frontend is built with Next.js 15 and uses:
- TypeScript for type safety
- Tailwind CSS for styling
- App Router for routing

### Docker Development
The project includes Docker configurations for easy deployment:
- Multi-stage builds for optimized image sizes
- Docker Compose for orchestrating services
- Health checks for service reliability
- Production-ready configurations

### Cloud Infrastructure (Optional)
For AWS cloud deployment, the Terraform configuration sets up:
- VPC with public subnets
- Security groups for backend and frontend
- Internet Gateway and routing

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.