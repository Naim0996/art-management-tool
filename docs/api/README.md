# API Documentation Index

Complete technical documentation for the Art Management Tool application.

## 📚 Documentation Overview

This documentation suite provides comprehensive information about the application's architecture, API endpoints, data models, and integration flows.

### Quick Links

- **[API Reference](./API_REFERENCE.md)** - Complete API endpoint documentation
- **[Models & Validation](./MODELS_AND_VALIDATION.md)** - Data models, fields, and validation rules
- **[Frontend-Backend Flows](./FRONTEND_BACKEND_FLOWS.md)** - Integration patterns and request flows

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- Next.js 15.5.5 (React framework)
- TypeScript
- Tailwind CSS
- Server-side rendering (SSR)
- API route proxying

**Backend:**
- Go 1.24
- Gorilla Mux (routing)
- GORM (ORM)
- JWT authentication
- RESTful API design

**Database:**
- PostgreSQL 16
- JSONB for flexible data
- Full-text search capabilities
- Soft delete support

**Infrastructure:**
- Docker containerization
- Docker Compose orchestration
- Environment-based configuration
- File-based uploads

---

## 📖 Getting Started

### For Frontend Developers

1. **Start here**: [Frontend-Backend Flows](./FRONTEND_BACKEND_FLOWS.md)
   - Understanding request flows
   - Authentication patterns
   - State management
   - Error handling

2. **API integration**: [API Reference](./API_REFERENCE.md)
   - Endpoint URLs and methods
   - Request/response formats
   - Authentication headers

3. **Data structures**: [Models & Validation](./MODELS_AND_VALIDATION.md)
   - TypeScript type definitions
   - Validation requirements
   - Field constraints

### For Backend Developers

1. **Start here**: [Models & Validation](./MODELS_AND_VALIDATION.md)
   - Database schema
   - Model relationships
   - Validation rules
   - Business logic constraints

2. **API design**: [API Reference](./API_REFERENCE.md)
   - Endpoint implementation
   - Request handling
   - Response formatting
   - Error codes

3. **Integration**: [Frontend-Backend Flows](./FRONTEND_BACKEND_FLOWS.md)
   - How frontend consumes APIs
   - Expected behaviors
   - Performance considerations

### For Full-Stack Developers

Start with [Frontend-Backend Flows](./FRONTEND_BACKEND_FLOWS.md) to understand the complete picture, then refer to other docs as needed.

---

## 🔑 Key Concepts

### Authentication & Authorization

**Public Endpoints**: No authentication required
- Product catalog (`/api/shop/products`)
- Categories (`/api/shop/categories`)
- Cart operations (`/api/shop/cart`)

**Admin Endpoints**: JWT token required
- All `/api/admin/*` endpoints
- Header: `Authorization: Bearer <token>`

**Session-Based**: Cart uses session tokens
- Header: `X-Session-Token: <uuid>`
- Stored in localStorage
- Auto-generated on first cart interaction

### Data Flow Patterns

1. **Server-Side Rendering (SSR)**
   - Public product pages
   - SEO-critical content
   - Initial page loads

2. **Client-Side Rendering (CSR)**
   - Admin panels
   - Dynamic interactions
   - User-specific data

3. **Hybrid Approach**
   - SSR for initial load
   - CSR for subsequent updates
   - Optimistic UI updates

### API Request Flow

```
Browser → Next.js Frontend → API Proxy → Go Backend → PostgreSQL
        ←                  ←           ←            ←
```

**Development:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- Proxy: `/api/*` → `http://backend:8080/api/*`

**Docker:**
- Frontend container → Backend container (service name)
- Backend container → PostgreSQL container (service name)

---

## 📋 Common Patterns

### Fetching Data

**SSR (Server Component):**
```typescript
export default async function ProductPage() {
  const products = await fetch('/api/shop/products').then(r => r.json());
  return <ProductList products={products} />;
}
```

**CSR (Client Component):**
```typescript
const [products, setProducts] = useState([]);

useEffect(() => {
  fetch('/api/shop/products')
    .then(r => r.json())
    .then(setProducts);
}, []);
```

### Authenticated Requests

```typescript
const token = localStorage.getItem('token');

const response = await fetch('/api/admin/products', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Form Submissions

```typescript
const handleSubmit = async (data: FormData) => {
  const response = await fetch('/api/admin/shop/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    // Handle error
  }
  
  return response.json();
};
```

### File Uploads

```typescript
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/admin/shop/products/1/images', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};
```

---

## 🎯 API Categories

### Public Shop API
- **Products**: Browse and search products
- **Categories**: Hierarchical product categories
- **Cart**: Shopping cart management
- **Checkout**: Order placement and payment

### Admin API
- **Products**: Full product CRUD with variants and images
- **Orders**: Order management and fulfillment
- **Categories**: Category management
- **Discounts**: Promotional codes
- **Notifications**: System notifications
- **Etsy**: Third-party integration

### System API
- **Authentication**: User login and token management
- **Webhooks**: Payment provider callbacks
- **Health**: System health checks

---

## 📊 Data Models Summary

### Core Entities

| Model | Purpose | Key Features |
|-------|---------|--------------|
| **EnhancedProduct** | Products for sale | Variants, images, categories, pricing |
| **Category** | Product organization | Hierarchical, slug-based |
| **Order** | Customer purchases | Payment tracking, fulfillment |
| **Cart** | Shopping session | Session-based, temporary |
| **DiscountCode** | Promotions | Time-based, usage limits |
| **Notification** | Admin alerts | Severity levels, read status |

### Relationships

```
Category (1) ──< (N) Product ──> (N) Category
Product (1) ──< (N) ProductVariant
Product (1) ──< (N) ProductImage
Cart (1) ──< (N) CartItem ──> (1) Product
Order (1) ──< (N) OrderItem
```

---

## 🔍 Finding Information

### "How do I...?"

**Add a new product?**
→ [API Reference - Create Product](./API_REFERENCE.md#create-product)
→ [Frontend Flow - Product Management](./FRONTEND_BACKEND_FLOWS.md#2-product-management)

**Implement checkout?**
→ [Frontend Flow - Checkout Process](./FRONTEND_BACKEND_FLOWS.md#3-checkout-process)
→ [API Reference - Process Checkout](./API_REFERENCE.md#process-checkout)

**Validate form data?**
→ [Models & Validation](./MODELS_AND_VALIDATION.md#validation-rules)

**Handle authentication?**
→ [Frontend Flow - Authentication](./FRONTEND_BACKEND_FLOWS.md#authentication-flow)
→ [API Reference - Login](./API_REFERENCE.md#login)

**Upload product images?**
→ [Frontend Flow - File Upload](./FRONTEND_BACKEND_FLOWS.md#file-upload-flows)
→ [API Reference - Upload Image](./API_REFERENCE.md#upload-product-image)

**Sync with Etsy?**
→ [Frontend Flow - Etsy Integration](./FRONTEND_BACKEND_FLOWS.md#etsy-integration-flows)
→ [API Reference - Etsy](./API_REFERENCE.md#etsy-integration)

---

## 🐛 Troubleshooting

### Common Issues

**"API calls return 404"**
- Check API proxy configuration in `next.config.ts`
- Verify `BACKEND_URL` environment variable
- Ensure backend service is running

**"Unauthorized (401)"**
- Verify JWT token is valid and not expired
- Check Authorization header format: `Bearer <token>`
- Re-authenticate if needed

**"CORS errors"**
- Ensure requests go through Next.js proxy, not directly to backend
- Check `CORS_ALLOWED_ORIGINS` in backend config
- Use relative URLs (`/api/*`) not absolute URLs

**"Validation errors"**
- Review field requirements in [Models & Validation](./MODELS_AND_VALIDATION.md)
- Check data types match (numbers, strings, etc.)
- Ensure required fields are present

**"File upload fails"**
- Check file size (max 5MB)
- Verify file type (JPEG, PNG, WebP only)
- Ensure `multipart/form-data` content type
- Check upload directory permissions

---

## 📝 Development Workflow

### Making Changes

1. **API Changes:**
   - Update Go handlers in `backend/handlers/`
   - Update models in `backend/models/`
   - Update [API Reference](./API_REFERENCE.md)
   - Update [Models & Validation](./MODELS_AND_VALIDATION.md) if schema changes

2. **Frontend Changes:**
   - Update components in `frontend/components/`
   - Update pages in `frontend/app/`
   - Update API services in `frontend/services/`
   - Update [Frontend Flow](./FRONTEND_BACKEND_FLOWS.md) if patterns change

3. **Integration Changes:**
   - Update both frontend and backend
   - Document flow in [Frontend-Backend Flows](./FRONTEND_BACKEND_FLOWS.md)
   - Test end-to-end

### Testing

**Backend:**
```bash
cd backend
go test ./...
```

**Frontend:**
```bash
cd frontend
npm test
```

**Integration:**
```bash
# Start all services
docker-compose --env-file .env.development -f docker-compose.development.yml up

# Test in browser or with curl
curl http://localhost:3000/api/shop/products
```

---

## 🔐 Security Considerations

### Authentication
- JWT tokens expire after configured time
- Tokens stored in localStorage (consider httpOnly cookies for production)
- Admin endpoints require valid token

### Data Validation
- All inputs validated on backend
- SQL injection prevented by ORM (GORM)
- File uploads restricted by type and size

### CORS
- Configured for specific origins only
- Development: `localhost:3000`
- Production: Configure in environment

### Environment Variables
- Never commit `.env` files
- Use `.env.example` as template
- Different configs per environment

---

## 📞 Support & Resources

### Documentation Files
- `docs/api/API_REFERENCE.md` - API endpoints
- `docs/api/MODELS_AND_VALIDATION.md` - Data models
- `docs/api/FRONTEND_BACKEND_FLOWS.md` - Integration flows
- `docs/ENVIRONMENT_VARIABLES.md` - Environment setup
- `docs/ARCHITECTURE.md` - System architecture

### Code Locations
- Backend API: `backend/handlers/`
- Data Models: `backend/models/`
- Frontend Pages: `frontend/app/`
- API Services: `frontend/services/`
- Components: `frontend/components/`

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Go Documentation](https://go.dev/doc/)
- [GORM Documentation](https://gorm.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 🚀 Quick Reference

### Environment URLs

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| Development | :3000 | :8080 | :5432 |
| Test | :3002 | :8081 | :5433 |
| Production | :3000 | :8080 | :5432 |

### Important Headers

```
Authorization: Bearer <jwt_token>        # Admin authentication
X-Session-Token: <uuid>                  # Cart session
Content-Type: application/json           # JSON requests
Content-Type: multipart/form-data        # File uploads
```

### HTTP Status Codes

```
200 OK                    # Success
201 Created              # Resource created
202 Accepted             # Async operation started
400 Bad Request          # Invalid input
401 Unauthorized         # Missing/invalid auth
404 Not Found           # Resource doesn't exist
409 Conflict            # Duplicate resource
422 Unprocessable       # Business logic error
500 Internal Error      # Server error
```

---

## 📅 Version History

### Current Version
- Next.js: 15.5.5
- Go: 1.24
- PostgreSQL: 16
- Last Updated: October 2025

### Breaking Changes
Track breaking changes in CHANGELOG.md

---

**Need more help?** Check the specific documentation files linked above or search for keywords in the relevant sections.
