# Documentation

Complete documentation for the Art Management Tool.

## 📚 Documentation Overview

This directory contains comprehensive documentation for developers, administrators, and integrators.

---

## 🎯 Quick Navigation

### For Developers

**API & Integration** (Start here!)
- **[API Documentation](./api/README.md)** - Complete API and integration guide
  - [API Reference](./api/API_REFERENCE.md) - All endpoints with examples
  - [Models & Validation](./api/MODELS_AND_VALIDATION.md) - Data structures and rules
  - [Frontend-Backend Flows](./api/FRONTEND_BACKEND_FLOWS.md) - Request flows and patterns
  - [Page Flows](./api/PAGE_FLOWS.md) - Page structure and navigation

**Architecture & Setup**
- [Architecture](./generals/ARCHITECTURE.md) - System design and components
- [Environment Variables](./ENVIRONMENT_VARIABLES.md) - Configuration guide
- [File Upload System](./generals/FILE_UPLOAD_SYSTEM.md) - Image upload implementation

**Validation & Security**
- [Validation Quick Start](./generals/VALIDATION_QUICK_START.md) - Input validation
- [Security Infrastructure](./generals/SECURITY_INFRASTRUCTURE.md) - Security practices
- [Model Synchronization](./generals/MODEL_SYNCHRONIZATION.md) - Data consistency

### For Etsy Integration

- [Etsy Integration Overview](./generals/ETSY_INTEGRATION.md) - Setup guide
- [Etsy Frontend Integration](./generals/ETSY_FRONTEND_INTEGRATION.md) - UI implementation
- [Etsy Payment Integration](./generals/ETSY_PAYMENT_INTEGRATION.md) - Payment flow
- [Etsy UI Mockup](./generals/ETSY_UI_MOCKUP.md) - Design specifications

### Troubleshooting

- [Environment Variable Issues](./ENV_VARIABLE_ISSUE_ANALYSIS.md) - Docker Compose config
- [Proxy Solution](./troubleshooting/PROXY_SOLUTION.md) - CORS and proxy setup
- [Cart Troubleshooting](./troubleshooting/CART_TROUBLESHOOTING.md) - Cart issues

### Summaries & Changes

- [Repository Restructure](./summaries/REPOSITORY_RESTRUCTURE_SUMMARY.md)
- [Refactoring Summary](./summaries/REFACTORING_SUMMARY.md)
- [Model Validation Summary](./summaries/MODEL_VALIDATION_SUMMARY.md)
- [Admin Entity Management](./summaries/ADMIN_ENTITY_MANAGEMENT_SUMMARY.md)
- [File Upload Implementation](./summaries/FILE_UPLOAD_IMPLEMENTATION_SUMMARY.md)
- [Etsy Infrastructure](./summaries/ETSY_INFRASTRUCTURE_SUMMARY.md)
- [Etsy Payment Summary](./summaries/ETSY_PAYMENT_SUMMARY.md)
- [Frontend Etsy Integration](./summaries/FRONTEND_ETSY_INTEGRATION_SUMMARY.md)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         ▼
┌─────────────────────────────────────────────────────────┐
│           Next.js Frontend (Port 3000)                   │
│  - Server-Side Rendering (SSR)                          │
│  - Client Components                                     │
│  - API Route Proxies                                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ API Calls
                         ▼
┌─────────────────────────────────────────────────────────┐
│           Go Backend API (Port 8080)                     │
│  - RESTful API                                          │
│  - JWT Authentication                                    │
│  - Business Logic                                        │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ SQL Queries
                         ▼
┌─────────────────────────────────────────────────────────┐
│           PostgreSQL Database (Port 5432)                │
│  - Products, Orders, Users                              │
│  - Categories, Carts, Notifications                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env.development

# Configure your variables
# See docs/ENVIRONMENT_VARIABLES.md for details
```

### 2. Start Development Environment

```bash
# Using helper script
./scripts/start-dev.ps1

# Or manually
docker-compose --env-file .env.development -f docker-compose.development.yml up
```

### 3. Access Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Database**: localhost:5432

### 4. Explore API

See **[API Reference](./api/API_REFERENCE.md)** for all available endpoints.

---

## 📋 Key Concepts

### Authentication

**Public Endpoints**: No auth required
- Shop catalog: `/api/shop/products`
- Categories: `/api/shop/categories`
- Cart operations: `/api/shop/cart`

**Admin Endpoints**: JWT token required
- All `/api/admin/*` endpoints
- Header: `Authorization: Bearer <token>`

**Session-Based**: Cart uses session tokens
- Header: `X-Session-Token: <uuid>`

### Data Flow

1. Browser → Next.js Frontend
2. Frontend → Go Backend (via API proxy)
3. Backend → PostgreSQL Database
4. Database → Backend → Frontend → Browser

See **[Frontend-Backend Flows](./api/FRONTEND_BACKEND_FLOWS.md)** for detailed flows.

### Models

Core entities:
- **Products**: Items for sale with variants and images
- **Orders**: Customer purchases with payment tracking
- **Cart**: Session-based shopping cart
- **Categories**: Hierarchical product organization
- **Discounts**: Promotional codes

See **[Models & Validation](./api/MODELS_AND_VALIDATION.md)** for complete schema.

---

## 🎨 Frontend Pages

### Public Pages
- `/` - Home page
- `/shop` - Product catalog
- `/shop/[slug]` - Product detail
- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/personaggi` - Gallery

### Admin Pages
- `/admin` - Dashboard
- `/admin/shop-products` - Product management
- `/admin/shop-orders` - Order management
- `/admin/categories` - Category management
- `/admin/discounts` - Discount codes
- `/admin/notifications` - System notifications
- `/admin/etsy-sync` - Etsy integration

See **[Page Flows](./api/PAGE_FLOWS.md)** for complete navigation map.

---

## 🔌 API Endpoints

### Shop API (Public)
```
GET    /api/shop/products         # List products
GET    /api/shop/products/{slug}  # Get product
GET    /api/shop/categories       # List categories
GET    /api/shop/cart             # Get cart
POST   /api/shop/cart/items       # Add to cart
POST   /api/shop/checkout         # Process order
```

### Admin API (Authenticated)
```
GET    /api/admin/stats                    # Dashboard stats
GET    /api/admin/shop/products            # List products (all)
POST   /api/admin/shop/products            # Create product
PATCH  /api/admin/shop/products/{id}       # Update product
POST   /api/admin/shop/products/{id}/images # Upload image
GET    /api/admin/shop/orders              # List orders
PATCH  /api/admin/shop/orders/{id}/fulfillment # Update fulfillment
```

See **[API Reference](./api/API_REFERENCE.md)** for complete list.

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
go test ./...
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
# Start services
docker-compose --env-file .env.development -f docker-compose.development.yml up

# Test endpoints
curl http://localhost:3000/api/shop/products
curl http://localhost:8080/health
```

---

## 📦 Deployment

### Environment-Specific Configs

- **Development**: `.env.development` + `docker-compose.development.yml`
- **Testing**: `.env.test` + `docker-compose.test.yml`
- **Production**: `.env.production` + `docker-compose.production.yml`

### Build & Deploy

```bash
# Production build
docker-compose --env-file .env.production -f docker-compose.production.yml up -d --build

# Check logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

---

## 🐛 Common Issues

### API Returns 404
- Check Next.js API proxy in `next.config.ts`
- Verify `BACKEND_URL` environment variable
- Ensure backend is running

### CORS Errors
- Use Next.js proxy (relative URLs: `/api/*`)
- Don't call backend directly from browser
- Check `CORS_ALLOWED_ORIGINS` in backend

### Authentication Fails
- Verify JWT token is valid
- Check `Authorization: Bearer <token>` header format
- Re-login if token expired

See **[Troubleshooting](./troubleshooting/)** for more solutions.

---

## 🤝 Contributing

### Adding New Features

1. **Backend Changes**:
   - Add handler in `backend/handlers/`
   - Update models in `backend/models/`
   - Update API docs in `docs/api/API_REFERENCE.md`

2. **Frontend Changes**:
   - Add page/component in `frontend/app/` or `frontend/components/`
   - Update API service in `frontend/services/`
   - Update flow docs in `docs/api/FRONTEND_BACKEND_FLOWS.md`

3. **Documentation**:
   - Update relevant docs in `docs/`
   - Add examples and diagrams
   - Update this README if needed

---

## 📞 Support

### Documentation
- [API Docs](./api/README.md) - Start here for API integration
- [Architecture](./generals/ARCHITECTURE.md) - System design
- [Troubleshooting](./troubleshooting/) - Common issues

### Code Locations
- Backend: `backend/`
- Frontend: `frontend/`
- Database migrations: `backend/migrations/`
- Docker configs: Root directory

---

## 📝 License

[Add your license information here]

---

**Last Updated**: October 2025  
**Version**: 1.0.0
