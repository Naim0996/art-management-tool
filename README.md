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

### Customer Features
- Browse art products
- Add items to shopping cart
- Multiple payment methods (Credit Card, PayPal, Stripe)
- Checkout with shipping information

### Admin Features
- Secure admin login
- Product management (Create, Read, Update, Delete)
- Inventory management
- Dashboard interface

## Technology Stack

- **Backend**: Go (Golang) with Gorilla Mux
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Infrastructure**: Terraform for AWS

## Quick Start

### Backend Setup

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

### Frontend Setup

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

### Infrastructure Setup

1. Navigate to the infrastructure directory:
   ```bash
   cd infrastructure
   ```

2. Initialize Terraform:
   ```bash
   terraform init
   ```

3. Review and apply:
   ```bash
   terraform plan
   terraform apply
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### Admin Endpoints (Requires Authentication)
- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create a new product
- `PUT /api/admin/products/{id}` - Update a product
- `DELETE /api/admin/products/{id}` - Delete a product

### Customer Endpoints
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get a single product
- `POST /api/cart` - Add item to cart
- `GET /api/cart` - Get cart contents
- `DELETE /api/cart/{id}` - Remove item from cart
- `POST /api/checkout` - Process checkout

## Demo Credentials

**Admin Login:**
- Username: `admin`
- Password: `admin`

## Payment Methods

The checkout process supports three payment methods:
- Credit Card
- PayPal
- Stripe

*Note: This is a demo application. Payment processing is simulated and does not charge real payments.*

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

### Infrastructure
The Terraform configuration sets up:
- VPC with public subnets
- Security groups for backend and frontend
- Internet Gateway and routing

For production deployment, consider adding:
- Load balancers
- Auto-scaling groups
- RDS database
- S3 for static assets
- CloudFront CDN
- Route53 for DNS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.