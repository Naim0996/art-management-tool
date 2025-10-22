# 🎨 Art Management Tool

A modern, full-stack e-commerce platform for art galleries and artists. Built with Go backend, Next.js frontend, and Docker containerization for seamless deployment.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://go.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [API Documentation](#api-endpoints)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🏗️ Project Structure

```
art-management-tool/
├── backend/              # Go backend API (Port 8080)
│   ├── cmd/             # Command-line tools (seeders, utilities)
│   ├── handlers/        # HTTP request handlers
│   ├── middleware/      # Authentication & CORS middleware
│   ├── migrations/      # Database migrations
│   ├── models/          # Data models & schemas
│   ├── services/        # Business logic layer
│   └── main.go          # Application entry point
│
├── frontend/            # Next.js 15 application (Port 3000)
│   ├── app/            # App router pages & layouts
│   ├── components/     # Reusable React components
│   ├── services/       # API client services
│   ├── messages/       # i18n translations
│   └── public/         # Static assets
│
├── infrastructure/      # Terraform IaC (optional)
├── docker-compose.yml   # Docker orchestration
└── docs/               # Documentation
    ├── guides/         # Deployment and usage guides
    ├── api/            # API documentation
    └── troubleshooting/ # Debugging and troubleshooting
```

## ✨ Features

### 🛍️ E-Commerce Platform

#### Customer Experience
- **Product Catalog**: Browse art with advanced filtering (category, price, availability)
- **Smart Shopping Cart**: Session-based cart supporting both guests and authenticated users
- **Secure Checkout**: Integrated payment processing with real-time stock reservation
- **Order Tracking**: Complete order lifecycle visibility from creation to delivery
- **Multi-language Support**: Internationalization (i18n) ready
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

#### Payment & Pricing
- **Multiple Payment Gateways**: Stripe integration (production-ready), Etsy payment integration
- **Etsy Payment**: Complete purchases through Etsy platform with automatic receipt synchronization
- **Discount System**: Promotional codes with validation and expiration
- **Dynamic Pricing**: Support for product variants with different prices
- **Currency Support**: Multi-currency ready (EUR by default)

#### Product Management
- **Variant System**: Manage products with multiple sizes, colors, and attributes
- **Image Gallery**: Multiple images per product with primary image selection
- **Inventory Tracking**: Real-time stock management with low-stock alerts
- **SEO-Friendly**: Slugs, meta descriptions, and optimized URLs

### 🔐 Admin Dashboard

- **Secure Authentication**: JWT-based admin login system
- **Product Management**: Full CRUD operations for products and variants
- **Order Management**: View, update, and fulfill customer orders
- **Inventory Control**: Bulk operations and stock adjustments
- **Notification Center**: Real-time alerts for low stock, payments, and orders
- **Analytics Dashboard**: Sales metrics and performance insights
- **Personaggi Management**: Custom character/artist profile system

### 🔧 Technical Features

- **RESTful API**: Clean, well-documented API endpoints
- **Database Migrations**: Version-controlled schema management
- **Docker Support**: Containerized deployment with Docker Compose
- **Health Checks**: Application monitoring and status endpoints
- **CORS Support**: Configured for secure cross-origin requests
- **Error Handling**: Comprehensive error responses with proper HTTP status codes
- **Logging**: Structured logging for debugging and monitoring
- **Shopify Integration Ready**: Prepared for Shopify API integration

## 🚀 Technology Stack

### Backend
- **Language**: Go 1.21+
- **Web Framework**: Gorilla Mux
- **ORM**: GORM (PostgreSQL support)
- **Authentication**: JWT tokens
- **Payment**: Stripe SDK, Abstracted payment providers
- **Database**: PostgreSQL (production), SQLite (development)

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS
- **UI Components**: PrimeReact
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom service layer
- **Internationalization**: next-intl

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **IaC**: Terraform (AWS)
- **CI/CD**: GitHub Actions ready
- **Monitoring**: Health check endpoints
- **Migrations**: SQL-based with GORM

### Development Tools
- **Package Manager**: npm/pnpm (frontend), Go modules (backend)
- **Code Quality**: ESLint, TypeScript strict mode
- **Version Control**: Git

### External Integrations
- **Etsy API**: Product and inventory synchronization, payment processing integration
- **Shopify**: Integration ready (stub implementation)

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended) OR
- **Go 1.21+** and **Node.js 18+** (for local development)
- **PostgreSQL** (for production)

### Option 1: Docker (Recommended) 🐳

The fastest way to run the entire application stack:

```bash
# Clone the repository
git clone https://github.com/Naim0996/art-management-tool.git
cd art-management-tool

# Start all services (backend, frontend, database)
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

**Access the application:**
- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:8080
- 📊 **API Health**: http://localhost:8080/health

### Option 2: Local Development 💻

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
go mod download

# Run database migrations (if using PostgreSQL)
# Ensure PostgreSQL is running and configured

# Start the server
go run main.go

# Or build and run
go build -o server
./server
```

Backend API available at: `http://localhost:8080`

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
pnpm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Frontend available at: `http://localhost:3000`

### 🔑 Demo Credentials

**Admin Panel Login:**
- **Username**: `admin`
- **Password**: `admin`

Access admin panel at: http://localhost:3000/admin

> ⚠️ **Security Note**: Change default credentials in production!

## 📚 API Endpoints

### Public Shop Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/shop/products` | List products with filters (category, price, search) |
| `GET` | `/api/shop/products/{slug}` | Get product details by slug |
| `GET` | `/api/shop/cart` | Get shopping cart |
| `POST` | `/api/shop/cart/items` | Add item to cart |
| `PATCH` | `/api/shop/cart/items/{id}` | Update cart item quantity |
| `DELETE` | `/api/shop/cart/items/{id}` | Remove item from cart |
| `DELETE` | `/api/shop/cart` | Clear entire cart |
| `POST` | `/api/shop/cart/discount` | Apply discount code |
| `POST` | `/api/shop/checkout` | Process checkout and create order |

### Admin Endpoints (🔐 Authentication Required)

#### Products & Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/shop/products` | List all products (with pagination) |
| `POST` | `/api/admin/shop/products` | Create new product |
| `GET` | `/api/admin/shop/products/{id}` | Get product details |
| `PATCH` | `/api/admin/shop/products/{id}` | Update product |
| `DELETE` | `/api/admin/shop/products/{id}` | Delete product |
| `POST` | `/api/admin/shop/products/{id}/variants` | Add product variant |
| `PATCH` | `/api/admin/shop/variants/{id}` | Update variant |
| `POST` | `/api/admin/shop/inventory/adjust` | Adjust inventory levels |

#### Orders & Fulfillment
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/shop/orders` | List all orders |
| `GET` | `/api/admin/shop/orders/{id}` | Get order details |
| `PATCH` | `/api/admin/shop/orders/{id}/fulfillment` | Update fulfillment status |
| `POST` | `/api/admin/shop/orders/{id}/refund` | Process order refund |

#### Notifications & System
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/notifications` | List notifications |
| `PATCH` | `/api/admin/notifications/{id}/read` | Mark notification as read |
| `POST` | `/api/admin/shopify/sync` | Trigger Shopify sync |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Admin login (returns JWT token) |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/webhooks/payment/stripe` | Stripe payment events |

### Health & Monitoring
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Application health check |
| `GET` | `/api/stats` | System statistics (if enabled) |

📖 **Complete API documentation**: See [docs/api/SHOP_API.md](./docs/api/SHOP_API.md) for detailed request/response schemas.

## 💳 Payment Configuration

The platform supports multiple payment providers through an abstracted payment interface.

### Supported Payment Methods

- **Stripe** - Production-ready integration (recommended)
- **Etsy** - Redirect to Etsy platform for payment (requires Etsy shop)
- **Mock Provider** - Development and testing
- **PayPal** - Integration ready (requires implementation)
- **Credit Card** - Direct processing (requires PCI compliance)

### Development Mode (Default)

```go
// Uses mock provider with €0.01 minimum
paymentProvider := payment.NewMockProvider("mock", 1, false)
```

✅ No API keys required
✅ Instant testing
✅ No real charges

### Production Mode (Stripe)

**Environment Variables:**
```env
STRIPE_API_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
PAYMENT_PROVIDER=stripe
```

**Configuration:**
```go
paymentProvider := payment.NewStripeProvider()
```

### Transaction Limits

- **Minimum**: €0.01
- **Maximum**: Provider dependent
- **Zero-amount transactions**: Not supported
- **Currencies**: EUR (default), extensible to other currencies

### Testing Payment Flow

**Test Cards (Stripe Test Mode):**
- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **3D Secure**: 4000 0027 6000 3184

**Mock Provider:**
- Any card number works
- Instant approval
- No external dependencies

> 🔒 **Security**: Never commit API keys to version control. Use environment variables or secure secret management.

## 🛠️ Development

### Backend Development

**Project Structure:**
```
backend/
├── cmd/              # CLI tools and utilities
│   ├── seed/         # Database seeder
│   └── seed-orders/  # Order data seeder
├── handlers/         # HTTP request handlers
├── middleware/       # Auth, CORS, logging
├── models/          # Data models (GORM)
├── services/        # Business logic
│   ├── cart/        # Shopping cart service
│   ├── order/       # Order management
│   ├── payment/     # Payment processing
│   └── product/     # Product catalog
├── migrations/      # SQL migrations
└── main.go         # Application entry point
```

**Key Technologies:**
- GORM for database operations
- Gorilla Mux for routing
- JWT for authentication
- CORS middleware for cross-origin requests

**Running Tests:**
```bash
cd backend
go test ./... -v
```

**Database Migrations:**
```bash
# Auto-migrate (development)
go run main.go  # Runs migrations on startup

# Manual migrations (production)
# Use golang-migrate or similar tool
```

**Code Generation:**
```bash
# Generate mocks for testing
go generate ./...
```

### Frontend Development

**Project Structure:**
```
frontend/
├── app/              # Next.js 15 App Router
│   ├── [locale]/     # Internationalized routes
│   │   ├── admin/    # Admin dashboard
│   │   ├── shop/     # Shop pages
│   │   ├── cart/     # Shopping cart
│   │   └── checkout/ # Checkout flow
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Home page
├── components/       # React components
│   ├── AdminLayout.tsx
│   ├── headerComponent.tsx
│   └── ...
├── services/        # API client services
├── messages/        # i18n translations (en, it, etc.)
└── public/         # Static assets
```

**Key Technologies:**
- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- PrimeReact for UI components
- next-intl for internationalization

**Running Development Server:**
```bash
cd frontend
npm run dev

# With specific port
npm run dev -- -p 3001

# With turbopack (faster)
npm run dev -- --turbo
```

**Building for Production:**
```bash
npm run build
npm start
```

**Type Checking:**
```bash
npm run type-check
# or
npx tsc --noEmit
```

**Linting:**
```bash
npm run lint
npm run lint:fix
```

### Environment Variables

**Backend (.env):**
```env
PORT=8080
DATABASE_URL=postgresql://user:password@localhost:5432/artdb
JWT_SECRET=your-secret-key
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Docker Development

**Build Images:**
```bash
# Build all services
docker compose build

# Build specific service
docker compose build backend
docker compose build frontend
```

**Development with Hot Reload:**
```bash
# Mount source code for live reloading
docker compose -f docker-compose.dev.yml up
```

**View Logs:**
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

**Database Access:**
```bash
# Connect to PostgreSQL container
docker compose exec db psql -U artuser -d artdb
```

### Code Quality

**Pre-commit Hooks:**
```bash
# Install pre-commit
pip install pre-commit

# Set up hooks
pre-commit install
```

**Recommended Extensions (VS Code):**
- Go (golang.go)
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- Docker (ms-azuretools.vscode-docker)

## 🚀 Deployment

### Docker Deployment (Recommended)

**Production Deployment:**
```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d

# Scale services
docker compose -f docker-compose.prod.yml up -d --scale backend=3
```

**Cloud Platforms:**
- **AWS**: ECS, Fargate, or EC2
- **Google Cloud**: Cloud Run, GKE
- **Azure**: Container Instances, AKS
- **DigitalOcean**: App Platform, Droplets
- **Fly.io, Railway, Render**: One-click deployments

### Traditional VPS Deployment

```bash
# SSH into your server
ssh user@your-server.com

# Clone repository
git clone https://github.com/Naim0996/art-management-tool.git
cd art-management-tool

# Run with Docker Compose
docker compose up -d

# Set up Nginx reverse proxy (optional)
sudo nginx -t
sudo systemctl reload nginx
```

### Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods
kubectl get services
```

### CI/CD Integration

The project is ready for:
- **GitHub Actions**: Automated builds and deployments
- **GitLab CI**: Pipeline configurations
- **Jenkins**: Integration scripts
- **CircleCI**: Build automation

### Infrastructure as Code (Terraform)

```bash
cd infrastructure

# Initialize Terraform
terraform init

# Plan infrastructure changes
terraform plan

# Apply infrastructure
terraform apply

# Destroy infrastructure
terraform destroy
```

For detailed deployment instructions, see:
- 📘 [DEPLOYMENT.md](./docs/guides/DEPLOYMENT.md) - Comprehensive deployment guide
- 🐳 [DOCKER.md](./docs/guides/DOCKER.md) - Docker-specific instructions
- 🏗️ [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System architecture overview

### Production Checklist

- [ ] Change default admin credentials
- [ ] Set strong JWT secret
- [ ] Configure SSL/TLS certificates
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Set production environment variables
- [ ] Enable rate limiting
- [ ] Configure CORS for production domains
- [ ] Set up CDN for static assets
- [ ] Review security headers
- [ ] Configure Stripe production keys
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure Etsy API credentials (if using integration)
- [ ] Test Etsy sync in staging environment
- [ ] Set up scheduled jobs for Etsy synchronization

## 📖 Documentation

- 📋 [API Documentation](./docs/api/SHOP_API.md) - Complete API reference
- 🏗️ [Architecture](./docs/ARCHITECTURE.md) - System design and architecture
- 🐳 [Docker Guide](./docs/guides/DOCKER.md) - Container deployment
- 🚀 [Deployment Guide](./docs/guides/DEPLOYMENT.md) - Production deployment
- 🧪 [Testing Guide](./docs/guides/TESTING_GUIDE.md) - Testing strategies
- 🔧 [Integration Summary](./docs/guides/INTEGRATION_SUMMARY.md) - Integration details
- 🛍️ [Etsy Integration](./docs/ETSY_INTEGRATION.md) - Etsy API integration guide
- 💳 [Etsy Payment Integration](./docs/ETSY_PAYMENT_INTEGRATION.md) - Etsy payment processing guide
- 🤝 [Contributing](./docs/CONTRIBUTING.md) - How to contribute
- 🛒 [Cart Troubleshooting](./docs/troubleshooting/CART_TROUBLESHOOTING.md) - Shopping cart debugging
- 🔌 [Proxy Solution](./docs/troubleshooting/PROXY_SOLUTION.md) - API proxy configuration

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/art-management-tool.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe your changes
   - Reference any related issues
   - Wait for review

### Development Guidelines

- Write clear, descriptive commit messages
- Follow Go and TypeScript best practices
- Add unit tests for new functionality
- Update documentation for API changes
- Keep dependencies up to date
- Use meaningful variable and function names

See [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Art Management Tool Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Go community for excellent libraries
- PrimeReact for beautiful UI components
- Stripe for payment processing
- All contributors and supporters

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/Naim0996/art-management-tool/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Naim0996/art-management-tool/discussions)
- 📧 **Email**: support@artmanagement.tool

## 🗺️ Roadmap

- [ ] GraphQL API support
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-vendor support
- [ ] Auction functionality
- [ ] Social media integration
- [ ] AI-powered recommendations
- [ ] Blockchain provenance tracking

---

**Made with ❤️ by the Art Management Tool team**

⭐ **Star us on GitHub** if you find this project useful!