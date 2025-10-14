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