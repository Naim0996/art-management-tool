# Application Page Flows

Visual representation of all pages, their routes, and navigation flows.

## Page Structure

```
/
├── /[locale]/                          # Localized routes
│   ├── /                               # Home page
│   ├── /shop                           # Public shop
│   │   └── /[slug]                     # Product detail
│   ├── /cart                           # Shopping cart
│   ├── /checkout                       # Checkout process
│   │   ├── /success                    # Order success
│   │   └── /cancel                     # Order cancelled
│   ├── /personaggi                     # Gallery (public)
│   │
│   └── /admin/                         # Admin panel (auth required)
│       ├── /                           # Dashboard
│       ├── /login                      # Login page
│       ├── /shop-products              # Product management
│       │   ├── /new                    # Create product
│       │   └── /[id]                   # Edit product
│       ├── /shop-orders                # Order management
│       │   └── /[id]                   # Order detail
│       ├── /categories                 # Category management
│       ├── /discounts                  # Discount codes
│       ├── /notifications              # Admin notifications
│       ├── /personaggi                 # Personaggi management
│       ├── /etsy-sync                  # Etsy integration
│       └── /settings                   # Settings
```

---

## Public Pages Flow

### Customer Journey

```
┌─────────────┐
│   Home (/)  │
└──────┬──────┘
       │
       ├──────> Shop (/shop)
       │           │
       │           ├──> Product Detail (/shop/[slug])
       │           │         │
       │           │         └──> Add to Cart ──┐
       │           │                            │
       │           └──> Browse by Category      │
       │                                        │
       ├──────> Personaggi (/personaggi)       │
       │                                        │
       └──────────────────────────────────────┐
                                              │
                                              ▼
                                     ┌───────────────┐
                                     │  Cart (/cart) │
                                     └───────┬───────┘
                                             │
                                             │ Update quantities
                                             │ Apply discount
                                             │
                                             ▼
                                   ┌──────────────────┐
                                   │ Checkout         │
                                   │ (/checkout)      │
                                   └────┬────────┬────┘
                                        │        │
                                   Success   Cancel
                                        │        │
                              /checkout/success  │
                                        │        │
                                   Thank you  Return to cart
```

---

## Admin Panel Flow

### Admin Navigation

```
┌──────────────────┐
│ Login (/login)   │
└────────┬─────────┘
         │ Authenticate
         ▼
┌─────────────────────────────────────────────────────────┐
│              Admin Dashboard (/admin)                    │
│  - Total Revenue, Orders, Products                       │
│  - Recent Orders                                         │
│  - Low Stock Alerts                                      │
│  - Quick Actions                                         │
└──────┬──────────────────────────────────────────────────┘
       │
       ├──> Products (/admin/shop-products)
       │        │
       │        ├──> Create Product (/admin/shop-products/new)
       │        │        │
       │        │        ├──> Upload Images
       │        │        ├──> Add Variants
       │        │        └──> Assign Categories
       │        │
       │        └──> Edit Product (/admin/shop-products/[id])
       │                 │
       │                 ├──> Manage Images
       │                 ├──> Update Variants
       │                 ├──> Update Inventory
       │                 └──> Change Status (draft/published/archived)
       │
       ├──> Orders (/admin/shop-orders)
       │        │
       │        └──> Order Detail (/admin/shop-orders/[id])
       │                 │
       │                 ├──> Update Fulfillment Status
       │                 ├──> Process Refund
       │                 └──> View Customer Info
       │
       ├──> Categories (/admin/categories)
       │        │
       │        ├──> Create Category
       │        ├──> Edit Category
       │        └──> Delete Category
       │
       ├──> Discounts (/admin/discounts)
       │        │
       │        ├──> Create Discount Code
       │        ├──> Edit Discount
       │        ├──> View Stats
       │        └──> Activate/Deactivate
       │
       ├──> Notifications (/admin/notifications)
       │        │
       │        ├──> View All
       │        ├──> Mark as Read
       │        └──> Delete
       │
       ├──> Personaggi (/admin/personaggi)
       │        │
       │        ├──> Create Character
       │        ├──> Edit Character
       │        ├──> Upload Images
       │        └──> Soft Delete/Restore
       │
       ├──> Etsy Sync (/admin/etsy-sync)
       │        │
       │        ├──> Sync Products
       │        ├──> Sync Inventory
       │        ├──> Link Products
       │        └──> View Sync Logs
       │
       └──> Settings (/admin/settings)
                │
                ├──> Store Settings
                ├──> Payment Configuration
                └──> Integration Settings
```

---

## Detailed Page Specifications

### Public Pages

#### 1. Home Page (`/[locale]`)

**Purpose**: Landing page with featured content

**Components**:
- Hero section
- Featured products carousel
- Category showcase
- Call to action

**Data Loaded**: None or featured products (cached)

**Actions**:
- Navigate to shop
- Navigate to personaggi
- Quick cart access

---

#### 2. Shop Page (`/[locale]/shop`)

**Purpose**: Browse all products

**Components**:
- Product grid
- Category filter sidebar
- Search bar
- Pagination

**Data Loaded**:
- Products (paginated)
- Categories for filtering

**State Management**:
- Filters (category, price range, status)
- Pagination (page, limit)
- Sort order

**API Calls**:
```
GET /api/shop/products?category={slug}&page={n}&limit={m}
GET /api/shop/categories
```

**User Actions**:
- Filter by category
- Search products
- View product detail
- Add to cart (quick add)

---

#### 3. Product Detail Page (`/[locale]/shop/[slug]`)

**Purpose**: Detailed product information

**Components**:
- Image gallery
- Product info (title, description, price)
- Variant selector (if applicable)
- Quantity selector
- Add to cart button
- Related products

**Data Loaded**:
- Product with variants and images
- Related products (same category)

**API Calls**:
```
GET /api/shop/products/{slug}
```

**User Actions**:
- Select variant (size, color)
- Change quantity
- Add to cart
- View related products

---

#### 4. Cart Page (`/[locale]/cart`)

**Purpose**: Review and manage cart items

**Components**:
- Cart items list
- Quantity controls
- Remove item buttons
- Discount code input
- Order summary
- Checkout button

**Data Loaded**:
- Cart with items, products, variants

**State Management**:
- Cart items
- Totals (subtotal, discount, tax, total)
- Session token (localStorage)

**API Calls**:
```
GET /api/shop/cart
PATCH /api/shop/cart/items/{id}  (update quantity)
DELETE /api/shop/cart/items/{id}  (remove item)
POST /api/shop/cart/discount      (apply code)
```

**User Actions**:
- Update quantities
- Remove items
- Apply discount code
- Clear cart
- Proceed to checkout

---

#### 5. Checkout Page (`/[locale]/checkout`)

**Purpose**: Collect shipping info and payment

**Components**:
- Order summary
- Customer info form (email, name)
- Shipping address form
- Billing address form
- Payment method selector
- Submit order button

**Data Loaded**:
- Cart summary
- Available payment methods

**Form Validation**:
- Email format
- Required fields
- Address validation

**API Calls**:
```
GET /api/shop/cart
POST /api/shop/checkout
```

**Flow**:
1. User fills form
2. Frontend validates
3. Submit to backend
4. Backend creates order + payment intent
5. Frontend shows payment UI (Stripe, etc.)
6. User confirms payment
7. Webhook updates order status
8. Redirect to success page

**User Actions**:
- Fill shipping info
- Select payment method
- Apply discount (if not already)
- Submit order

---

#### 6. Personaggi Page (`/[locale]/personaggi`)

**Purpose**: Gallery of characters

**Components**:
- Character grid
- Character cards with images
- Modal for detail view

**Data Loaded**:
- All personaggi (not deleted)

**API Calls**:
```
GET /api/admin/personaggi  (if public endpoint exists)
```

---

### Admin Pages

#### 1. Admin Dashboard (`/[locale]/admin`)

**Purpose**: Overview of store metrics

**Components**:
- Stats cards (revenue, orders, products)
- Recent orders table
- Low stock alerts
- Quick actions menu
- Charts (revenue over time, top products)

**Data Loaded**:
- Dashboard statistics
- Recent orders (last 10)
- Notifications (unread count)

**API Calls**:
```
GET /api/admin/stats
GET /api/admin/notifications?unread=true
```

**User Actions**:
- View detailed stats
- Navigate to orders, products
- Quick create product
- View notification details

---

#### 2. Product Management (`/[locale]/admin/shop-products`)

**Purpose**: Manage all products

**Components**:
- Products table/grid
- Search and filter controls
- Status filter (draft, published, archived)
- Bulk actions
- Create button

**Data Loaded**:
- Products (all statuses, paginated)
- Categories for filter

**API Calls**:
```
GET /api/admin/shop/products?status={status}&page={n}
GET /api/admin/categories
```

**User Actions**:
- Search products
- Filter by status, category
- Edit product
- Delete product
- Bulk publish/archive
- Create new product

---

#### 3. Product Editor (`/[locale]/admin/shop-products/[id]` or `/new`)

**Purpose**: Create or edit product

**Components**:
- Product form (title, description, price, SKU)
- Status selector
- Category selector (multi-select)
- Image uploader with preview
- Variants manager
- Save/publish buttons

**Form Sections**:
1. **Basic Info**: Title, slug, short description
2. **Details**: Long description (markdown editor)
3. **Pricing**: Base price, currency
4. **Inventory**: SKU, GTIN
5. **Categories**: Multi-select
6. **Images**: Upload, reorder, delete
7. **Variants**: Add/edit/delete variants

**API Calls**:
```
GET /api/admin/shop/products/{id}        (edit mode)
POST /api/admin/shop/products            (create)
PATCH /api/admin/shop/products/{id}      (update)
POST /api/admin/shop/products/{id}/images
POST /api/admin/shop/products/{id}/variants
PATCH /api/admin/shop/variants/{id}
```

**Validation**:
- Title: required, max 500 chars
- Slug: unique, URL-safe
- Base price: ≥ 0
- SKU: unique (if provided)

**User Actions**:
- Fill product details
- Upload images (drag & drop)
- Reorder images
- Add variants with SKU, price adjustment, stock
- Assign categories
- Save as draft or publish

---

#### 4. Order Management (`/[locale]/admin/shop-orders`)

**Purpose**: View and manage orders

**Components**:
- Orders table
- Filters (payment status, fulfillment status, date range)
- Search by order number, email
- Export button

**Data Loaded**:
- Orders (paginated)
- Summary stats

**API Calls**:
```
GET /api/admin/shop/orders?status={status}&from_date={date}&to_date={date}
```

**User Actions**:
- Filter orders
- Search orders
- View order detail
- Export to CSV

---

#### 5. Order Detail (`/[locale]/admin/shop-orders/[id]`)

**Purpose**: Manage single order

**Components**:
- Order header (number, date, status)
- Customer info
- Order items table
- Shipping/billing addresses
- Payment info
- Fulfillment controls
- Refund button
- Notes section

**Data Loaded**:
- Complete order with items

**API Calls**:
```
GET /api/admin/shop/orders/{id}
PATCH /api/admin/shop/orders/{id}/fulfillment
POST /api/admin/shop/orders/{id}/refund
```

**User Actions**:
- Update fulfillment status (unfulfilled → fulfilled)
- Add tracking number
- Process full/partial refund
- Add internal notes
- Print invoice
- Send email to customer

---

#### 6. Category Management (`/[locale]/admin/categories`)

**Purpose**: Manage product categories

**Components**:
- Categories tree view
- Create button
- Edit/delete actions

**Data Loaded**:
- All categories with hierarchy

**API Calls**:
```
GET /api/admin/categories
POST /api/admin/categories
PATCH /api/admin/categories/{id}
DELETE /api/admin/categories/{id}
```

**User Actions**:
- Create root category
- Create subcategory
- Edit category
- Delete category (if no products)
- Reorder categories

---

#### 7. Discount Codes (`/[locale]/admin/discounts`)

**Purpose**: Manage promotional codes

**Components**:
- Discounts table
- Create button
- Active/inactive toggle
- Stats preview

**Data Loaded**:
- All discount codes

**API Calls**:
```
GET /api/admin/discounts
POST /api/admin/discounts
PATCH /api/admin/discounts/{id}
GET /api/admin/discounts/{id}/stats
```

**User Actions**:
- Create discount code
- Set type (percentage/fixed)
- Set value and constraints
- Set validity period
- View usage stats
- Deactivate code

---

#### 8. Notifications (`/[locale]/admin/notifications`)

**Purpose**: View system notifications

**Components**:
- Notifications list
- Filter by type, severity, read status
- Mark as read buttons
- Delete button

**Data Loaded**:
- Notifications (paginated)

**API Calls**:
```
GET /api/admin/notifications?unread=true
PATCH /api/admin/notifications/{id}/read
POST /api/admin/notifications/read-all
DELETE /api/admin/notifications/{id}
```

**Notification Types**:
- Low stock alert
- Payment failed
- New order
- Order paid
- System messages

---

#### 9. Etsy Sync (`/[locale]/admin/etsy-sync`)

**Purpose**: Manage Etsy integration

**Components**:
- Sync status dashboard
- Trigger sync buttons
- Etsy products list
- Link/unlink controls
- Sync logs

**Data Loaded**:
- Etsy products
- Sync status
- Sync logs

**API Calls**:
```
POST /api/admin/etsy/sync/products
POST /api/admin/etsy/sync/inventory
GET /api/admin/etsy/sync/status
GET /api/admin/etsy/products
POST /api/admin/etsy/products/{listing_id}/link
```

**User Actions**:
- Trigger product sync
- Trigger inventory sync
- Link Etsy product to local product
- View sync history
- Validate credentials

---

## Navigation Patterns

### Public Navigation

**Main Menu**:
- Logo → Home
- Shop → /shop
- Personaggi → /personaggi
- Cart icon → /cart

**Footer**:
- About
- Contact
- Terms
- Privacy

### Admin Navigation

**Sidebar Menu**:
```
Dashboard
├── Products
│   ├── All Products
│   └── Categories
├── Orders
├── Customers (future)
├── Discounts
├── Notifications
├── Integrations
│   └── Etsy Sync
├── Settings
└── Logout
```

**Top Bar**:
- Notification bell (unread count)
- User menu
- Quick search

---

## State Persistence

### Client-Side Storage

**localStorage**:
- `token`: JWT authentication token
- `cart_session`: Session token for cart
- `locale`: User's language preference

**sessionStorage**:
- Filter states (temporary)
- Pagination position

**Cookies**:
- `NEXT_LOCALE`: Next.js locale (set by framework)

---

## Loading States

### Skeleton Screens
- Product grid: Show skeleton cards
- Product detail: Show skeleton layout
- Dashboard: Show skeleton stats

### Spinners
- Button actions (submit, save)
- Data refresh
- File uploads

### Progress Indicators
- Multi-step checkout
- File upload progress
- Sync operations

---

## Error States

### User-Friendly Messages
- "Product not found" → Suggest browsing shop
- "Cart is empty" → Show featured products
- "Order failed" → Retry button + support contact
- "Network error" → Retry button

### Admin Error Handling
- Form validation errors inline
- API errors as toast notifications
- Critical errors with error boundary

---

This document provides a complete map of all pages, their purposes, data requirements, and user flows throughout the application.
