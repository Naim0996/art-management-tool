# E-Shop Integration - Testing Guide

## Quick Start for Testing

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (if running locally)
- Go 1.21+ (if running locally)

### Option 1: Docker (Recommended)

```bash
# Start all services (backend, frontend, database)
docker compose up -d

# View logs
docker compose logs -f

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
```

### Option 2: Local Development

#### Start Backend
```bash
cd backend

# Install dependencies
go mod download

# Start the server (uses SQLite by default)
go run main.go
```

#### Start Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Or build and start
npm run build
npm start
```

## Testing the Integration

### 1. Customer Shop Experience

#### Browse Products
1. Navigate to `http://localhost:3000/en/shop`
2. You should see the product catalog
3. Try the search bar to find products
4. Use the sort dropdown to change ordering
5. Test pagination if there are many products

#### Shopping Cart
1. Click "Add to Cart" on any product
2. Navigate to cart: `http://localhost:3000/en/cart`
3. Test quantity adjustments (+ and - buttons)
4. Try removing items
5. Click "Clear Cart" to empty the cart

#### Checkout
1. Add some items to cart
2. Click "Proceed to Checkout"
3. Fill in customer information:
   - Name: Test User
   - Email: test@example.com
4. Fill in shipping address
5. Select payment method (Mock for testing)
6. Click "Place Order"
7. You should see a success message

### 2. Admin Management

#### Login
1. Navigate to `http://localhost:3000/en/admin/login`
2. Default credentials:
   - Username: `admin`
   - Password: `admin`
3. Click Login

#### Admin Dashboard
1. After login, you'll see the dashboard at `http://localhost:3000/en/admin`
2. Quick action buttons are available for:
   - Manage Personaggi
   - Shop Products
   - Shop Orders
   - Notifications
   - Settings

#### Shop Products Management
1. Click "Shop Products" from dashboard
2. **View Products**: See all products in a data table
3. **Search**: Use the search bar to find products
4. **Create Product**:
   - Click "Create New Product"
   - Fill in required fields:
     - Title: "Test Artwork"
     - Slug: "test-artwork"
     - SKU: "TEST-001"
     - Base Price: 29.99
     - Status: Published
   - Click Save
5. **Edit Product**: Click pencil icon on any product
6. **Manage Variants**:
   - Click box icon on any product
   - Go to "Add New Variant" tab
   - Add variant details:
     - Name: "Medium"
     - SKU: "TEST-001-M"
     - Stock: 10
   - Click "Add Variant"
7. **Update Inventory**: Use "Add 10" or "Remove 10" buttons in variant list
8. **Delete Product**: Click trash icon and confirm

#### Shop Orders Management
1. Click "Shop Orders" from dashboard
2. **View Orders**: See all orders in a data table
3. **Filter Orders**:
   - Search by customer email
   - Filter by payment status
   - Filter by fulfillment status
4. **View Order Details**: Click eye icon on any order
5. **Update Fulfillment**:
   - In order details, click "Mark as Fulfilled"
   - Or click "Mark as Partially Fulfilled"
6. **Refund Order**: Click "Refund Order" button and confirm

#### Notifications Center
1. Click "Notifications" from dashboard
2. **View Notifications**: See all system notifications
3. **Filter**:
   - Filter by type (low stock, payment failed, etc.)
   - Filter by severity
   - Toggle "Show Unread Only"
4. **Mark as Read**: Click check icon on unread notifications
5. **Mark All as Read**: Click button in header
6. **Delete**: Click trash icon and confirm

### 3. API Testing with curl

#### Public Shop API

```bash
# List products
curl http://localhost:8080/api/shop/products

# Get specific product
curl http://localhost:8080/api/shop/products/artwork-print-001

# Get cart (returns empty cart or existing session)
curl http://localhost:8080/api/shop/cart

# Add to cart
curl -X POST http://localhost:8080/api/shop/cart/items \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":1}'

# Checkout
curl -X POST http://localhost:8080/api/shop/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "name":"Test User",
    "payment_method":"mock",
    "shipping_address":{
      "street":"123 Main St",
      "city":"New York",
      "state":"NY",
      "zip_code":"10001",
      "country":"US"
    }
  }'
```

#### Admin Shop API (requires authentication)

```bash
# Login to get token
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  | jq -r '.token')

# List products (admin view)
curl http://localhost:8080/api/admin/shop/products \
  -H "Authorization: Bearer $TOKEN"

# Create product
curl -X POST http://localhost:8080/api/admin/shop/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slug":"new-artwork",
    "title":"New Artwork",
    "short_description":"A beautiful piece",
    "base_price":49.99,
    "currency":"EUR",
    "sku":"ART-002",
    "status":"published"
  }'

# List orders
curl http://localhost:8080/api/admin/shop/orders \
  -H "Authorization: Bearer $TOKEN"

# List notifications
curl http://localhost:8080/api/admin/notifications \
  -H "Authorization: Bearer $TOKEN"
```

## Testing Scenarios

### Scenario 1: Complete Purchase Flow
1. Browse products as a customer
2. Add 2-3 products to cart
3. Update quantities
4. Proceed to checkout
5. Complete order
6. As admin, view the new order
7. Mark order as fulfilled

### Scenario 2: Product Management
1. As admin, create a new product
2. Add 2 variants (e.g., Small and Large)
3. Set stock for each variant
4. Publish the product
5. As customer, view the product in shop
6. Add to cart and complete purchase
7. As admin, adjust inventory after sale

### Scenario 3: Order Management
1. Complete several test orders
2. Filter orders by status
3. View order details
4. Update fulfillment status
5. Test refund functionality

### Scenario 4: Notification System
1. Create low-stock products (stock < 5)
2. Place orders to trigger notifications
3. View notifications in admin panel
4. Filter by severity
5. Mark notifications as read

## Troubleshooting

### Backend Issues

**Database Connection Error**
```
Solution: Ensure PostgreSQL is running or use SQLite (default)
```

**Port Already in Use**
```
Solution: Change port in backend configuration or stop conflicting service
```

### Frontend Issues

**API Connection Error**
```
Solution: Check NEXT_PUBLIC_API_URL environment variable
Default: http://localhost:8080
```

**Build Errors**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Common Issues

**CORS Errors**
```
Solution: Backend CORS is configured for all origins in development
For production, update CORS settings in backend/main.go
```

**Session/Cart Issues**
```
Solution: Clear browser cookies and try again
Cart session is stored in cookies with 30-day expiration
```

**Authentication Issues**
```
Solution: 
1. Check if JWT secret is configured
2. Try logging in again
3. Token is stored in localStorage as 'adminToken'
```

## Performance Testing

### Load Testing
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test product listing
ab -n 1000 -c 10 http://localhost:8080/api/shop/products

# Test cart operations
ab -n 100 -c 5 -p cart.json -T application/json \
  http://localhost:8080/api/shop/cart/items
```

### Database Seeding

```bash
# Use backend seeder (if available)
cd backend
go run cmd/seed/main.go
```

## Security Testing

### Authentication
- [x] Admin endpoints require valid JWT token
- [x] Public endpoints accessible without auth
- [x] Session tokens properly managed in cookies
- [x] No sensitive data in error messages

### Input Validation
- [x] Form validation on frontend
- [x] Backend validates all inputs
- [x] SQL injection protection (using GORM)
- [x] XSS prevention (React escapes by default)

### CodeQL Analysis
```bash
# Already run - 0 vulnerabilities found
```

## Next Steps

After testing, consider:
1. Setting up automated tests (Jest, Cypress)
2. Configuring CI/CD pipeline
3. Setting up staging environment
4. Preparing for production deployment
5. Implementing monitoring and logging

## Support

For issues or questions:
- Check `INTEGRATION_SUMMARY.md` for detailed documentation
- Review `SHOP_API.md` for API specifications
- Check backend logs for error details
- Review browser console for frontend errors

---

**Happy Testing! 🎨🛍️**
