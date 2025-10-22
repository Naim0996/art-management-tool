# Admin Categories and Discount Codes API Documentation

This document describes the REST API endpoints for managing categories and discount codes in the admin panel.

## Table of Contents

- [Categories API](#categories-api)
- [Discount Codes API](#discount-codes-api)
- [Authentication](#authentication)
- [Error Handling](#error-handling)

## Authentication

All admin endpoints require authentication via JWT token:

```http
Authorization: Bearer <jwt_token>
```

## Categories API

### List All Categories

Get a list of all categories with optional filtering and relationship loading.

**Endpoint:** `GET /api/admin/categories`

**Query Parameters:**
- `parent_id` (optional): Filter by parent category ID. Use `"null"` or `"0"` for root categories
- `include_children` (optional): Set to `"true"` to include child categories
- `include_parent` (optional): Set to `"true"` to include parent category

**Response:**
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Paintings",
      "slug": "paintings",
      "description": "Original artwork and paintings",
      "parent_id": null,
      "parent": null,
      "children": [
        {
          "id": 2,
          "name": "Oil Paintings",
          "slug": "oil-paintings",
          "description": "Traditional oil paintings",
          "parent_id": 1
        }
      ],
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ],
  "total": 1
}
```

### Get Single Category

Retrieve details of a specific category including parent and children.

**Endpoint:** `GET /api/admin/categories/{id}`

**Response:**
```json
{
  "id": 1,
  "name": "Paintings",
  "slug": "paintings",
  "description": "Original artwork and paintings",
  "parent_id": null,
  "parent": null,
  "children": [...],
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

### Create Category

Create a new category.

**Endpoint:** `POST /api/admin/categories`

**Request Body:**
```json
{
  "name": "Abstract Art",
  "slug": "abstract-art",
  "description": "Contemporary abstract artwork",
  "parent_id": 1
}
```

**Validation Rules:**
- `name` is required
- `slug` is required and must be unique
- `parent_id` is optional (null for root categories)
- Parent category must exist if provided
- Cannot create circular parent references

**Response:** `201 Created`
```json
{
  "id": 3,
  "name": "Abstract Art",
  "slug": "abstract-art",
  "description": "Contemporary abstract artwork",
  "parent_id": 1,
  "parent": {
    "id": 1,
    "name": "Paintings",
    "slug": "paintings"
  },
  "created_at": "2025-01-15T11:00:00Z",
  "updated_at": "2025-01-15T11:00:00Z"
}
```

### Update Category

Update an existing category.

**Endpoint:** `PATCH /api/admin/categories/{id}`

**Request Body:**
```json
{
  "name": "Abstract Paintings",
  "slug": "abstract-paintings",
  "description": "Modern abstract artwork",
  "parent_id": 1
}
```

**Query Parameters:**
- `clear_description` (optional): Set to `"true"` to clear the description field

**Validation Rules:**
- Slug must be unique if changed
- Cannot set category as its own parent
- Cannot create circular parent references
- Parent category must exist if provided

**Response:**
```json
{
  "id": 3,
  "name": "Abstract Paintings",
  "slug": "abstract-paintings",
  "description": "Modern abstract artwork",
  "parent_id": 1,
  "parent": {...},
  "children": [...],
  "created_at": "2025-01-15T11:00:00Z",
  "updated_at": "2025-01-15T11:30:00Z"
}
```

### Delete Category

Soft delete a category. 

**Endpoint:** `DELETE /api/admin/categories/{id}`

**Validation Rules:**
- Cannot delete if category has child categories
- Cannot delete if category is associated with products

**Response:**
```json
{
  "message": "Category deleted successfully",
  "id": 3
}
```

**Error Response (Conflict):** `409 Conflict`
```json
{
  "error": "Cannot delete category with child categories. Delete or reassign children first."
}
```

## Discount Codes API

### List All Discounts

Get a paginated list of discount codes with optional filtering.

**Endpoint:** `GET /api/admin/discounts`

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `per_page` (optional, default: 20, max: 100): Results per page
- `active` (optional): Filter by active status (`"true"` or `"false"`)
- `valid` (optional): Set to `"true"` to show only currently valid discounts
- `type` (optional): Filter by type (`"percentage"` or `"fixed_amount"`)

**Response:**
```json
{
  "discounts": [
    {
      "id": 1,
      "code": "SUMMER2025",
      "type": "percentage",
      "value": 20.0,
      "min_purchase": 50.0,
      "max_uses": 100,
      "used_count": 25,
      "starts_at": "2025-06-01T00:00:00Z",
      "expires_at": "2025-08-31T23:59:59Z",
      "active": true,
      "created_at": "2025-05-15T10:00:00Z",
      "updated_at": "2025-05-15T10:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "per_page": 20
}
```

### Get Single Discount

Retrieve details of a specific discount code including validity status.

**Endpoint:** `GET /api/admin/discounts/{id}`

**Response:**
```json
{
  "discount": {
    "id": 1,
    "code": "SUMMER2025",
    "type": "percentage",
    "value": 20.0,
    "min_purchase": 50.0,
    "max_uses": 100,
    "used_count": 25,
    "starts_at": "2025-06-01T00:00:00Z",
    "expires_at": "2025-08-31T23:59:59Z",
    "active": true,
    "created_at": "2025-05-15T10:00:00Z",
    "updated_at": "2025-05-15T10:00:00Z"
  },
  "is_valid": true
}
```

### Get Discount Statistics

Get usage statistics for a discount code.

**Endpoint:** `GET /api/admin/discounts/{id}/stats`

**Response:**
```json
{
  "discount": {...},
  "is_valid": true,
  "used_count": 25,
  "remaining_uses": 75,
  "days_until_expiry": 45
}
```

Note: `remaining_uses` is `-1` for unlimited use codes, and `days_until_expiry` is `null` for codes with no expiry.

### Create Discount

Create a new discount code.

**Endpoint:** `POST /api/admin/discounts`

**Request Body:**
```json
{
  "code": "WELCOME10",
  "type": "percentage",
  "value": 10.0,
  "min_purchase": 0,
  "max_uses": null,
  "starts_at": null,
  "expires_at": null,
  "active": true
}
```

**Field Descriptions:**
- `code` (required): Unique discount code (uppercase recommended)
- `type` (required): Either `"percentage"` or `"fixed_amount"`
- `value` (required): Discount value (1-100 for percentage, any positive for fixed)
- `min_purchase` (optional, default: 0): Minimum purchase amount in EUR
- `max_uses` (optional): Maximum number of uses (null for unlimited)
- `starts_at` (optional): ISO 8601 datetime when discount becomes active
- `expires_at` (optional): ISO 8601 datetime when discount expires
- `active` (optional, default: true): Whether discount is active

**Validation Rules:**
- Code must be unique
- Type must be "percentage" or "fixed_amount"
- Value must be > 0
- Percentage value cannot exceed 100
- Minimum purchase cannot be negative
- Max uses must be > 0 if provided
- Start date must be before expiration date if both provided

**Response:** `201 Created`
```json
{
  "discount": {
    "id": 2,
    "code": "WELCOME10",
    "type": "percentage",
    "value": 10.0,
    "min_purchase": 0,
    "max_uses": null,
    "used_count": 0,
    "starts_at": null,
    "expires_at": null,
    "active": true,
    "created_at": "2025-01-15T12:00:00Z",
    "updated_at": "2025-01-15T12:00:00Z"
  },
  "is_valid": true
}
```

### Update Discount

Update an existing discount code.

**Endpoint:** `PATCH /api/admin/discounts/{id}`

**Request Body:**
```json
{
  "active": false
}
```

All fields from creation are optional. Only provided fields will be updated.

**Response:**
```json
{
  "discount": {...},
  "is_valid": false
}
```

### Delete Discount

Delete or deactivate a discount code.

**Endpoint:** `DELETE /api/admin/discounts/{id}`

**Behavior:**
- If discount has been used (`used_count > 0`), it will be deactivated instead of deleted to preserve historical data
- If discount has never been used, it will be soft deleted

**Response (Deactivated):**
```json
{
  "message": "Discount has been used and was deactivated instead of deleted",
  "id": 1,
  "discount": {...}
}
```

**Response (Deleted):**
```json
{
  "message": "Discount deleted successfully",
  "id": 2
}
```

## Public Category Endpoints

These endpoints are available to customers without authentication.

### List Public Categories

**Endpoint:** `GET /api/shop/categories`

**Query Parameters:**
- `parent_id` (optional): Filter by parent category
- `include_children` (optional): Include child categories

**Response:** Same format as admin list endpoint

### Get Public Category

**Endpoint:** `GET /api/shop/categories/{id}`

**Response:** Same format as admin get endpoint

## Error Handling

### Standard Error Response

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- `200 OK`: Successful GET request
- `201 Created`: Successful POST request
- `400 Bad Request`: Invalid input or validation error
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Resource not found
- `409 Conflict`: Operation conflicts with existing data (e.g., duplicate slug)
- `500 Internal Server Error`: Server-side error

### Common Error Messages

**Categories:**
- `"Name is required"`
- `"Slug is required"`
- `"Category with this slug already exists"`
- `"Parent category not found"`
- `"Category cannot be its own parent"`
- `"Circular parent reference not allowed"`
- `"Cannot delete category with child categories"`
- `"Cannot delete category with associated products"`

**Discounts:**
- `"Code is required"`
- `"Type is required"`
- `"Value must be greater than 0"`
- `"Percentage value cannot exceed 100"`
- `"Start date must be before expiration date"`
- `"Discount code already exists"`
- `"Max uses must be greater than 0"`

## Example Usage

### Creating a Category Hierarchy

```bash
# Create parent category
curl -X POST http://localhost:8080/api/admin/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Paintings",
    "slug": "paintings",
    "description": "All types of paintings"
  }'

# Create child category
curl -X POST http://localhost:8080/api/admin/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Oil Paintings",
    "slug": "oil-paintings",
    "description": "Traditional oil paintings",
    "parent_id": 1
  }'
```

### Creating a Seasonal Discount

```bash
curl -X POST http://localhost:8080/api/admin/discounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SPRING2025",
    "type": "percentage",
    "value": 15,
    "min_purchase": 30,
    "max_uses": 500,
    "starts_at": "2025-03-20T00:00:00Z",
    "expires_at": "2025-06-20T23:59:59Z",
    "active": true
  }'
```

### Listing Valid Discounts

```bash
curl -X GET "http://localhost:8080/api/admin/discounts?valid=true&active=true" \
  -H "Authorization: Bearer $TOKEN"
```

## Integration with Frontend

The frontend admin UI provides:

### Categories Management UI
- DataTable with hierarchical display
- Create/Edit/Delete dialogs
- Auto-slug generation from names
- Parent category dropdown selection
- Validation error display

### Discount Codes Management UI
- Paginated DataTable with status tags
- Create/Edit/Delete dialogs
- Calendar date pickers for start/expiry dates
- Active/Inactive toggle
- Visual status indicators (Active, Expired, Scheduled, Used Up)
- Usage statistics display

## See Also

- [Shop API Documentation](./SHOP_API.md) - Customer-facing shop endpoints
- [Admin Products API](./SHOP_API.md#admin-endpoints) - Product management
- [Architecture Documentation](../ARCHITECTURE.md) - System architecture overview
