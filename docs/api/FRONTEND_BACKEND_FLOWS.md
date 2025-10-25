# Frontend-Backend Integration Flows

Complete documentation of how the frontend and backend interact across all application pages and features.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Authentication Flow](#authentication-flow)
- [Public Shop Flows](#public-shop-flows)
- [Admin Panel Flows](#admin-panel-flows)
- [File Upload Flows](#file-upload-flows)
- [Etsy Integration Flows](#etsy-integration-flows)
- [Error Handling](#error-handling)

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │           Next.js Frontend (Port 3000)             │     │
│  │  - React Components                                │     │
│  │  - Client-side API calls                           │     │
│  │  - Server-side rendering                           │     │
│  │  - API Route proxies                               │     │
│  └────────────────────────────────────────────────────┘     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/HTTPS
                       │
        ┌──────────────┴───────────────┐
        │                              │
        │  Next.js API Routes          │  Go Backend API
        │  (SSR Proxy)                 │  (Port 8080)
        │                              │
        │  /api/* → backend:8080       │  ┌─────────────────┐
        │                              │  │   Handlers      │
        └──────────────────────────────┘  │   Services      │
                                          │   Models        │
                                          │   Database      │
                                          └─────────────────┘
                                                  │
                                                  │
                                          ┌───────┴─────────┐
                                          │  PostgreSQL     │
                                          │  (Port 5432)    │
                                          └─────────────────┘
```

### Request Flow

1. **Client → Frontend**: Browser makes request to Next.js
2. **Frontend → Backend**: Next.js proxies API requests to Go backend
3. **Backend → Database**: Go processes request, queries PostgreSQL
4. **Database → Backend**: Returns data
5. **Backend → Frontend**: JSON response
6. **Frontend → Client**: Rendered page or JSON data

### API Proxy Configuration

**Location**: `frontend/next.config.ts`

```typescript
async rewrites() {
  const backendUrl = process.env.BACKEND_URL || 'http://backend:8080';
  
  return [
    {
      source: '/api/:path*',
      destination: `${backendUrl}/api/:path*`,
    }
  ];
}
```

**Environment Variables:**
- `NEXT_PUBLIC_API_URL=""` (empty = use rewrites)
- `BACKEND_URL=http://backend:8080` (Docker internal)

---

## Authentication Flow

### Admin Login

**Page**: `/[locale]/admin/login`  
**Component**: `app/[locale]/admin/login/page.tsx`

#### Flow Diagram

```
User                    Frontend                  Backend
  │                        │                         │
  │  1. Enter credentials  │                         │
  ├───────────────────────>│                         │
  │                        │  2. POST /api/auth/login│
  │                        ├────────────────────────>│
  │                        │                         │  3. Validate
  │                        │                         │  credentials
  │                        │  4. JWT token + user    │
  │                        │<────────────────────────┤
  │  5. Store in localStorage                       │
  │  6. Redirect to /admin │                         │
  │<───────────────────────┤                         │
```

#### Implementation

**Frontend** (`app/[locale]/admin/login/page.tsx`):
```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('token', data.token);
    router.push('/admin');
  }
};
```

**Backend** (`handlers/auth.go`):
```go
func Login(w http.ResponseWriter, r *http.Request) {
    var credentials struct {
        Username string `json:"username"`
        Password string `json:"password"`
    }
    
    // Validate credentials
    // Generate JWT token
    // Return token
}
```

#### Authenticated Requests

**Frontend**: Include token in subsequent requests
```typescript
const response = await fetch('/api/admin/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Backend**: Middleware validates token
```go
func AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        token := r.Header.Get("Authorization")
        // Validate JWT
        next.ServeHTTP(w, r)
    })
}
```

---

## Public Shop Flows

### 1. Shop Product Listing

**Page**: `/[locale]/shop`  
**Component**: `app/[locale]/shop/page.tsx`

#### Flow

```
User                    Frontend                  Backend               Database
  │                        │                         │                      │
  │  1. Visit /shop        │                         │                      │
  ├───────────────────────>│                         │                      │
  │                        │  2. SSR: Fetch products │                      │
  │                        ├────────────────────────>│                      │
  │                        │                         │  3. Query products   │
  │                        │                         ├─────────────────────>│
  │                        │                         │  4. Return products  │
  │                        │  5. Return products     │<─────────────────────┤
  │                        │<────────────────────────┤                      │
  │  6. Render page        │                         │                      │
  │<───────────────────────┤                         │                      │
```

#### Implementation

**Frontend** (`app/[locale]/shop/page.tsx`):
```typescript
export default async function ShopPage() {
  // Server-side fetch
  const products = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || ''}/api/shop/products`
  ).then(res => res.json());
  
  return <ProductGrid products={products} />;
}
```

**API Service** (`services/ShopAPIService.ts`):
```typescript
export const getProducts = async (params?: {
  category?: string;
  page?: number;
  limit?: number;
}) => {
  const query = new URLSearchParams(params as any);
  const response = await fetch(`/api/shop/products?${query}`);
  return response.json();
};
```

**Backend** (`handlers/shop/catalog.go`):
```go
func (h *CatalogHandler) ListProducts(w http.ResponseWriter, r *http.Request) {
    products, err := h.productService.ListPublished(filters)
    json.NewEncoder(w).Encode(products)
}
```

---

### 2. Shopping Cart

**Page**: `/[locale]/cart`  
**Component**: `app/[locale]/cart/page.tsx`

#### Add to Cart Flow

```
User                    Frontend                  Backend
  │                        │                         │
  │  1. Click "Add to Cart"│                         │
  ├───────────────────────>│                         │
  │                        │  2. POST /api/shop/cart/items
  │                        │     + session token     │
  │                        ├────────────────────────>│
  │                        │                         │  3. Create/update
  │                        │                         │     cart item
  │                        │  4. Updated cart        │
  │                        │<────────────────────────┤
  │  5. Update UI          │                         │
  │  6. Show notification  │                         │
  │<───────────────────────┤                         │
```

#### Session Management

**Frontend**: Generate and store session token
```typescript
// Get or create session token
const getSessionToken = () => {
  let token = localStorage.getItem('cart_session');
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem('cart_session', token);
  }
  return token;
};
```

**Add Item**:
```typescript
const addToCart = async (productId: number, variantId?: number, quantity = 1) => {
  const response = await fetch('/api/shop/cart/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': getSessionToken()
    },
    body: JSON.stringify({ product_id: productId, variant_id: variantId, quantity })
  });
  
  return response.json();
};
```

**Backend**: Session-based cart retrieval
```go
func (h *CartHandler) GetCart(w http.ResponseWriter, r *http.Request) {
    sessionToken := r.Header.Get("X-Session-Token")
    cart, err := h.cartService.GetOrCreateCart(sessionToken)
    json.NewEncoder(w).Encode(cart)
}
```

---

### 3. Checkout Process

**Page**: `/[locale]/checkout`  
**Component**: `app/[locale]/checkout/page.tsx`

#### Complete Checkout Flow

```
User                    Frontend                  Backend               Payment Provider
  │                        │                         │                         │
  │  1. Fill checkout form │                         │                         │
  ├───────────────────────>│                         │                         │
  │                        │  2. POST /api/shop/checkout                      │
  │                        ├────────────────────────>│                         │
  │                        │                         │  3. Create payment intent
  │                        │                         ├────────────────────────>│
  │                        │                         │  4. Return client_secret│
  │                        │  5. Order + client_secret<──────────────────────┤
  │                        │<────────────────────────┤                         │
  │  6. Load payment UI    │                         │                         │
  │<───────────────────────┤                         │                         │
  │                        │                         │                         │
  │  7. Confirm payment    │                         │                         │
  ├───────────────────────────────────────────────────────────────────────────>│
  │                        │                         │  8. Webhook: payment.succeeded
  │                        │                         │<────────────────────────┤
  │                        │                         │  9. Update order status │
  │  10. Redirect to success                        │                         │
  │<───────────────────────┤                         │                         │
```

#### Implementation

**Frontend** (`app/[locale]/checkout/page.tsx`):
```typescript
const handleCheckout = async (formData: CheckoutFormData) => {
  const response = await fetch('/api/shop/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': getSessionToken()
    },
    body: JSON.stringify({
      session_token: getSessionToken(),
      payment_method: 'stripe',
      email: formData.email,
      name: formData.name,
      shipping_address: formData.shippingAddress,
      billing_address: formData.billingAddress,
      discount_code: formData.discountCode
    })
  });
  
  const { client_secret, order_number } = await response.json();
  
  // Use client_secret with Stripe.js
  const { error } = await stripe.confirmPayment({
    clientSecret: client_secret,
    // ...
  });
};
```

**Backend** (`handlers/shop/checkout.go`):
```go
func (h *CheckoutHandler) ProcessCheckout(w http.ResponseWriter, r *http.Request) {
    // 1. Validate cart
    // 2. Calculate totals
    // 3. Apply discount if provided
    // 4. Create order
    // 5. Create payment intent
    // 6. Return order + payment details
}
```

---

## Admin Panel Flows

### 1. Dashboard

**Page**: `/[locale]/admin`  
**Component**: `app/[locale]/admin/page.tsx`

#### Flow

```
Admin                   Frontend                  Backend
  │                        │                         │
  │  1. Visit /admin       │                         │
  ├───────────────────────>│                         │
  │                        │  2. Check auth token    │
  │                        │  (redirect if invalid)  │
  │                        │                         │
  │                        │  3. GET /api/admin/stats│
  │                        │     + auth header       │
  │                        ├────────────────────────>│
  │                        │                         │  4. Aggregate stats
  │                        │  5. Stats data          │
  │                        │<────────────────────────┤
  │  6. Render dashboard   │                         │
  │<───────────────────────┤                         │
```

**Frontend**:
```typescript
const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStats(await response.json());
    };
    fetchStats();
  }, []);
  
  return <StatsCards stats={stats} />;
};
```

---

### 2. Product Management

**Page**: `/[locale]/admin/shop-products`  
**Component**: `app/[locale]/admin/shop-products/page.tsx`

#### Create Product Flow

```
Admin                   Frontend                  Backend
  │                        │                         │
  │  1. Fill product form  │                         │
  ├───────────────────────>│                         │
  │                        │  2. Validate form       │
  │                        │                         │
  │                        │  3. POST /api/admin/shop/products
  │                        │     + product data      │
  │                        ├────────────────────────>│
  │                        │                         │  4. Validate
  │                        │                         │  5. Create product
  │                        │                         │  6. Create categories link
  │                        │  7. Created product     │
  │                        │<────────────────────────┤
  │  8. Show success       │                         │
  │  9. Redirect to list   │                         │
  │<───────────────────────┤                         │
```

**Frontend** (`components/ProductForm.tsx`):
```typescript
const handleSubmit = async (formData: ProductFormData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/admin/shop/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      slug: formData.slug,
      title: formData.title,
      short_description: formData.shortDescription,
      long_description: formData.longDescription,
      base_price: parseFloat(formData.basePrice),
      sku: formData.sku,
      status: formData.status,
      category_ids: formData.categories.map(c => c.id)
    })
  });
  
  if (response.ok) {
    const { product } = await response.json();
    router.push(`/admin/shop-products/${product.id}`);
  }
};
```

**Backend**:
```go
func (h *ProductHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
    var input struct {
        Slug            string  `json:"slug"`
        Title           string  `json:"title"`
        BasePrice       float64 `json:"base_price"`
        CategoryIDs     []uint  `json:"category_ids"`
        // ...
    }
    
    product, err := h.productService.Create(input)
    json.NewEncoder(w).Encode(map[string]interface{}{"product": product})
}
```

---

### 3. Order Management

**Page**: `/[locale]/admin/shop-orders`  
**Component**: `app/[locale]/admin/shop-orders/page.tsx`

#### Update Fulfillment Flow

```
Admin                   Frontend                  Backend               Notification
  │                        │                         │                         │
  │  1. Click "Mark Fulfilled"                      │                         │
  ├───────────────────────>│                         │                         │
  │                        │  2. PATCH /api/admin/shop/orders/{id}/fulfillment
  │                        ├────────────────────────>│                         │
  │                        │                         │  3. Update order        │
  │                        │                         │  4. Create audit log    │
  │                        │                         │  5. Send notification   │
  │                        │                         ├────────────────────────>│
  │                        │  6. Updated order       │                         │
  │                        │<────────────────────────┤                         │
  │  7. Update UI          │                         │                         │
  │<───────────────────────┤                         │                         │
```

**Frontend**:
```typescript
const updateFulfillment = async (orderId: number, status: string) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`/api/admin/shop/orders/${orderId}/fulfillment`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  
  return response.json();
};
```

---

## File Upload Flows

### Product Image Upload

**Component**: `components/ProductImageUpload.tsx`

#### Flow

```
Admin                   Frontend                  Backend               Storage
  │                        │                         │                      │
  │  1. Select image file  │                         │                      │
  ├───────────────────────>│                         │                      │
  │                        │  2. Validate file       │                      │
  │                        │     (type, size)        │                      │
  │                        │                         │                      │
  │                        │  3. POST /api/admin/shop/products/{id}/images │
  │                        │     multipart/form-data │                      │
  │                        ├────────────────────────>│                      │
  │                        │                         │  4. Validate file    │
  │                        │                         │  5. Save to disk     │
  │                        │                         ├─────────────────────>│
  │                        │                         │  6. File saved       │
  │                        │                         │<─────────────────────┤
  │                        │                         │  7. Create DB record │
  │                        │  8. Image record        │                      │
  │                        │<────────────────────────┤                      │
  │  9. Show preview       │                         │                      │
  │<───────────────────────┤                         │                      │
```

#### Implementation

**Frontend**:
```typescript
const uploadImage = async (file: File, productId: number) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('alt_text', altText);
  formData.append('position', position.toString());
  
  const token = localStorage.getItem('token');
  
  const response = await fetch(`/api/admin/shop/products/${productId}/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};
```

**Backend** (`handlers/admin/uploads.go`):
```go
func (h *UploadHandler) UploadProductImage(w http.ResponseWriter, r *http.Request) {
    // 1. Parse multipart form
    // 2. Validate file type and size
    // 3. Generate unique filename
    // 4. Save to uploads directory
    // 5. Create ProductImage record
    // 6. Return image data
}
```

**File Validation**:
- Allowed types: image/jpeg, image/png, image/webp
- Max size: 5MB
- Filename sanitization

---

## Etsy Integration Flows

### Product Sync

**Page**: `/[locale]/admin/etsy-sync`  
**Component**: `app/[locale]/admin/etsy-sync/page.tsx`

#### Sync Flow

```
Admin                   Frontend                  Backend               Etsy API
  │                        │                         │                      │
  │  1. Click "Sync Products"                       │                      │
  ├───────────────────────>│                         │                      │
  │                        │  2. POST /api/admin/etsy/sync/products        │
  │                        ├────────────────────────>│                      │
  │                        │                         │  3. GET /listings    │
  │                        │                         ├─────────────────────>│
  │                        │                         │  4. Listings data    │
  │                        │                         │<─────────────────────┤
  │                        │                         │  5. Update DB        │
  │                        │  6. Sync started (202)  │                      │
  │                        │<────────────────────────┤                      │
  │  7. Poll status        │                         │                      │
  │<───────────────────────┤                         │                      │
  │                        │  8. GET /api/admin/etsy/sync/status           │
  │                        ├────────────────────────>│                      │
  │                        │  9. Status data         │                      │
  │                        │<────────────────────────┤                      │
```

**Frontend**:
```typescript
const syncProducts = async () => {
  const token = localStorage.getItem('token');
  
  // Trigger sync
  const response = await fetch('/api/admin/etsy/sync/products', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  // Poll for status
  const interval = setInterval(async () => {
    const status = await fetch('/api/admin/etsy/sync/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    if (status.completed) {
      clearInterval(interval);
      // Refresh products list
    }
  }, 2000);
};
```

**Backend** (`handlers/admin/etsy.go`):
```go
func (h *EtsyHandler) TriggerProductSync(w http.ResponseWriter, r *http.Request) {
    go h.etsyService.SyncProducts() // Background task
    w.WriteHeader(http.StatusAccepted)
    json.NewEncoder(w).Encode(map[string]string{
        "message": "Sync initiated",
    })
}
```

---

## Error Handling

### Frontend Error Handling

**Global Error Boundary**:
```typescript
// app/error.tsx
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

**API Error Handling**:
```typescript
const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

### Backend Error Responses

**Standard Error Format**:
```go
type ErrorResponse struct {
    Error   string                 `json:"error"`
    Message string                 `json:"message,omitempty"`
    Details map[string]interface{} `json:"details,omitempty"`
}
```

**HTTP Status Codes**:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid auth)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `422`: Unprocessable Entity (business logic error)
- `500`: Internal Server Error

---

## Data Flow Patterns

### Server-Side Rendering (SSR)

Used for: Public product pages, SEO-critical pages

```typescript
// app/[locale]/shop/[slug]/page.tsx
export default async function ProductPage({ params }: { params: { slug: string } }) {
  // Fetched on server
  const product = await fetch(
    `${process.env.BACKEND_URL}/api/shop/products/${params.slug}`
  ).then(r => r.json());
  
  return <ProductDetail product={product} />;
}
```

### Client-Side Rendering (CSR)

Used for: Admin panels, dynamic interactions

```typescript
// components/AdminDashboard.tsx
const AdminDashboard = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData().then(setData);
  }, []);
  
  return data ? <Dashboard data={data} /> : <Loading />;
};
```

### Hybrid Approach

Initial SSR + Client updates:

```typescript
export default async function ProductList() {
  // Initial SSR data
  const initialProducts = await fetchProducts();
  
  return <ProductListClient initialData={initialProducts} />;
}

// Client component
const ProductListClient = ({ initialData }: { initialData: Product[] }) => {
  const [products, setProducts] = useState(initialData);
  
  // Client-side filtering, sorting
  const handleFilter = async (filters) => {
    const filtered = await fetchProducts(filters);
    setProducts(filtered);
  };
  
  return <ProductGrid products={products} onFilter={handleFilter} />;
};
```

---

## State Management

### Local State (useState)
For component-specific state

### Context API
For theme, authentication, cart

```typescript
// contexts/CartContext.tsx
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  
  return (
    <CartContext.Provider value={{ cart, setCart }}>
      {children}
    </CartContext.Provider>
  );
};
```

### Server State
Using React Query or SWR for server data caching

---

## Performance Optimizations

### Frontend
- Image optimization with Next.js Image
- Code splitting with dynamic imports
- Memoization with useMemo/useCallback
- Debounced search inputs

### Backend
- Database query optimization with indexes
- Response caching for static data
- Connection pooling
- Batch operations for bulk updates

### Network
- Request deduplication
- Prefetching on hover
- Optimistic UI updates
- Pagination for large datasets
