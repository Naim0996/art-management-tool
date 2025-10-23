# Model Synchronization and Validation

This document describes the model synchronization and validation strategy between the backend (Go) and frontend (TypeScript) to ensure data integrity and prevent validation bypass.

## Table of Contents

1. [Overview](#overview)
2. [Model Mappings](#model-mappings)
3. [Validation Strategy](#validation-strategy)
4. [Backend Validation](#backend-validation)
5. [Frontend Validation](#frontend-validation)
6. [Image Upload Security](#image-upload-security)
7. [Admin Management Endpoints](#admin-management-endpoints)
8. [Testing](#testing)

## Overview

The Art Management Tool implements a strict validation and synchronization strategy between backend and frontend models to:

- **Prevent backend validation bypass**: All inputs are validated on both frontend and backend
- **Ensure type safety**: TypeScript interfaces match Go structs exactly
- **Maintain data integrity**: Consistent validation rules across the stack
- **Secure file uploads**: Validated file types, sizes, and paths
- **Admin control**: All customer-facing entities are fully manageable by admins

## Model Mappings

### Personaggio Model

**Backend (Go)**: `models.Personaggio`
```go
type Personaggio struct {
    ID              uint           `json:"id" gorm:"primaryKey"`
    Name            string         `json:"name" gorm:"not null"`
    Description     string         `json:"description" gorm:"type:text"`
    Icon            string         `json:"icon"`
    Images          datatypes.JSON `json:"images" gorm:"type:json"`
    BackgroundColor string         `json:"backgroundColor" gorm:"default:'#E0E7FF'"`
    BackgroundType  string         `json:"backgroundType" gorm:"default:'solid'"`
    GradientFrom    string         `json:"gradientFrom"`
    GradientTo      string         `json:"gradientTo"`
    Order           int            `json:"order" gorm:"default:0"`
    CreatedAt       time.Time      `json:"createdAt"`
    UpdatedAt       time.Time      `json:"updatedAt"`
    DeletedAt       *time.Time     `json:"deletedAt,omitempty" gorm:"index"`
}
```

**Frontend (TypeScript)**: `PersonaggioDTO`
```typescript
interface PersonaggioDTO {
  id?: number;
  name: string;
  description: string;
  icon?: string;
  images: string[];
  backgroundColor?: string;
  backgroundType?: 'solid' | 'gradient';
  gradientFrom?: string;
  gradientTo?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}
```

**Validation Rules**:
- `name`: Required, 1-100 characters
- `description`: Optional, max 2000 characters
- `icon`: Optional, valid URL format
- `images`: Array of valid URLs, max 20 images
- `backgroundColor`: Optional, valid hex color (#RRGGBB)
- `backgroundType`: Optional, one of: 'solid', 'gradient'
- `gradientFrom`/`gradientTo`: Required if backgroundType is 'gradient', valid hex colors
- `order`: Non-negative integer

### Product Model

**Backend (Go)**: `models.EnhancedProduct`
```go
type EnhancedProduct struct {
    ID               uint              `gorm:"primarykey" json:"id"`
    Slug             string            `gorm:"size:255;uniqueIndex;not null" json:"slug"`
    Title            string            `gorm:"size:500;not null" json:"title"`
    ShortDescription string            `gorm:"size:1000" json:"short_description,omitempty"`
    LongDescription  string            `gorm:"type:text" json:"long_description,omitempty"`
    BasePrice        float64           `gorm:"type:decimal(10,2);not null;default:0" json:"base_price"`
    Currency         string            `gorm:"size:3;not null;default:'EUR'" json:"currency"`
    SKU              string            `gorm:"size:100;uniqueIndex" json:"sku,omitempty"`
    GTIN             string            `gorm:"size:50" json:"gtin,omitempty"`
    Status           ProductStatus     `gorm:"size:20;not null;default:'draft'" json:"status"`
    Categories       []Category        `gorm:"many2many:product_categories;" json:"categories,omitempty"`
    Images           []ProductImage    `gorm:"foreignKey:ProductID" json:"images,omitempty"`
    Variants         []ProductVariant  `gorm:"foreignKey:ProductID" json:"variants,omitempty"`
    CreatedAt        time.Time         `json:"created_at"`
    UpdatedAt        time.Time         `json:"updated_at"`
    DeletedAt        gorm.DeletedAt    `gorm:"index" json:"-"`
}
```

**Frontend (TypeScript)**: `Product`
```typescript
interface Product {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  long_description?: string;
  base_price: number;
  currency: string;
  sku: string;
  gtin?: string;
  status: 'published' | 'draft' | 'archived';
  categories?: Category[];
  images?: ProductImage[];
  variants?: ProductVariant[];
  created_at?: string;
  updated_at?: string;
}
```

**Validation Rules**:
- `title`: Required, 1-500 characters
- `slug`: Required, 1-255 characters, lowercase letters, numbers, and hyphens only
- `short_description`: Optional, max 1000 characters
- `long_description`: Optional, max 50000 characters
- `base_price`: Required, >= 0
- `currency`: Optional (defaults to 'EUR'), max 3 characters
- `sku`: Optional, max 100 characters
- `gtin`: Optional, max 50 characters
- `status`: Optional (defaults to 'draft'), one of: 'draft', 'published', 'archived'

### Product Variant Model

**Backend (Go)**: `models.ProductVariant`
```go
type ProductVariant struct {
    ID              uint           `gorm:"primarykey" json:"id"`
    ProductID       uint           `gorm:"not null;index" json:"product_id"`
    SKU             string         `gorm:"size:100;uniqueIndex;not null" json:"sku"`
    Name            string         `gorm:"size:255;not null" json:"name"`
    Attributes      string         `gorm:"type:jsonb" json:"attributes,omitempty"`
    PriceAdjustment float64        `gorm:"type:decimal(10,2);default:0" json:"price_adjustment"`
    Stock           int            `gorm:"not null;default:0" json:"stock"`
    CreatedAt       time.Time      `json:"created_at"`
    UpdatedAt       time.Time      `json:"updated_at"`
    DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}
```

**Frontend (TypeScript)**: `ProductVariant`
```typescript
interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  name: string;
  attributes: string;
  price_adjustment: number;
  stock: number;
}
```

**Validation Rules**:
- `sku`: Required, max 100 characters
- `name`: Required, max 255 characters
- `stock`: Non-negative integer

### Product Image Model

**Backend (Go)**: `models.ProductImage`
```go
type ProductImage struct {
    ID        uint      `gorm:"primarykey" json:"id"`
    ProductID uint      `gorm:"not null;index" json:"product_id"`
    URL       string    `gorm:"size:1000;not null" json:"url"`
    AltText   string    `gorm:"size:500" json:"alt_text,omitempty"`
    Position  int       `gorm:"not null;default:0" json:"position"`
    CreatedAt time.Time `json:"created_at"`
}
```

**Frontend (TypeScript)**: `ProductImage`
```typescript
interface ProductImage {
  id: number;
  url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
}
```

**Validation Rules**:
- `url`: Required, valid URL format, max 1000 characters
- `alt_text`: Optional, max 500 characters
- `position`: Non-negative integer

## Validation Strategy

### Two-Layer Validation

1. **Frontend Validation (First Line of Defense)**
   - Immediate user feedback
   - Prevents unnecessary API calls
   - Client-side performance
   - Located in: `frontend/services/validation.ts`

2. **Backend Validation (Security Layer)**
   - Cannot be bypassed
   - Final authority on data validity
   - Protects database integrity
   - Located in: `backend/models/validation.go`

### Validation Flow

```
User Input
    ↓
[Frontend Validation] ← validation.ts
    ↓ (if valid)
HTTP Request
    ↓
[Backend Validation] ← validation.go
    ↓ (if valid)
Database
```

## Backend Validation

### Validation Utilities

Location: `backend/models/validation.go`

**Validator Methods**:
- `Required(field, value)`: Validates non-empty strings
- `MinLength(field, value, min)`: Minimum string length
- `MaxLength(field, value, max)`: Maximum string length
- `MinValue(field, value, min)`: Minimum numeric value
- `MaxValue(field, value, max)`: Maximum numeric value
- `Pattern(field, value, pattern)`: Regex pattern matching
- `OneOf(field, value, allowed)`: Value in allowed set
- `URL(field, value)`: Valid URL format
- `Email(field, value)`: Valid email format
- `ColorHex(field, value)`: Valid hex color format

**Model Validation Functions**:
- `PersonaggioInput.Validate()`: Validates personaggio input
- `ValidateProductCreate(product)`: Validates product creation
- `ValidateProductUpdate(product)`: Validates product updates
- `ValidateVariant(variant)`: Validates product variants
- `ValidateProductImage(image)`: Validates product images

### Usage in Handlers

```go
// Example: Personaggio creation
func (h *PersonaggiHandler) CreatePersonaggio(w http.ResponseWriter, r *http.Request) {
    var input models.PersonaggioInput
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        http.Error(w, "Invalid input: "+err.Error(), http.StatusBadRequest)
        return
    }

    // Validate using model validation
    if err := input.Validate(); err != nil {
        http.Error(w, "Validation failed: "+err.Error(), http.StatusBadRequest)
        return
    }
    
    // Proceed with creation...
}
```

## Frontend Validation

### Validation Utilities

Location: `frontend/services/validation.ts`

**Validator Class**:
```typescript
const validator = new Validator();
validator
  .required('name', data.name)
  .minLength('name', data.name, 1)
  .maxLength('name', data.name, 100);

const result = validator.getResult();
if (result.hasErrors()) {
  // Handle validation errors
  console.error(result.getErrorMessage());
}
```

**Validation Functions**:
- `validatePersonaggio(data)`: Validates personaggio input
- `validateProductCreate(data)`: Validates product creation
- `validateProductUpdate(data)`: Validates product updates
- `validateVariant(data)`: Validates product variants
- `validateProductImage(data)`: Validates product images
- `validateImageFile(file, maxSizeMB)`: Validates image file upload

### Usage in API Services

```typescript
// Example: PersonaggiAPIService
static async createPersonaggio(data: PersonaggioDTO): Promise<PersonaggioDTO> {
  // Validate before sending to backend
  const validation = validatePersonaggio(data);
  if (validation.hasErrors()) {
    throw new Error(`Validation failed: ${validation.getErrorMessage()}`);
  }
  
  return this.fetchJSON<PersonaggioDTO>('/api/admin/personaggi', {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);
}
```

### Usage in Components

```typescript
// Example: ImageUpload component
const handleUpload = async (event: FileUploadHandlerEvent) => {
  const file = event.files[0];
  
  // Validate file before uploading
  const validation = validateImageFile(file, 10);
  if (validation.hasErrors()) {
    toast.current?.show({
      severity: 'error',
      summary: 'Validation Error',
      detail: validation.getErrorMessage(),
      life: 3000,
    });
    return;
  }
  
  // Proceed with upload...
};
```

## Image Upload Security

### Secure Upload Components

1. **ImageUpload Component** (`frontend/components/ImageUpload.tsx`)
   - Used for Personaggio images
   - Validates file type, size, and URL format
   - Supports both file upload and URL input
   - Maximum 10MB per file
   - Allowed formats: JPG, PNG, GIF, WebP

2. **ProductImageUpload Component** (`frontend/components/ProductImageUpload.tsx`)
   - Used for Product images
   - Validates file type, size, and URL format
   - Supports alt text and position ordering
   - Maximum 10MB per file
   - Allowed formats: JPG, PNG, GIF, WebP

### Backend Upload Handlers

**Personaggio Upload** (`backend/handlers/personaggi_upload.go`):
- Validates file type (must start with "image/")
- Generates unique filenames with UUID
- Stores in organized directory structure: `/uploads/personaggi/{id}/`
- Updates database with validated paths
- Supports both icon and gallery images

**Product Upload** (`backend/handlers/admin/uploads.go`):
- Uses upload service for file management
- Validates file type and size
- Stores in organized directory structure: `/uploads/products/{id}/`
- Creates database records with validation
- Supports image ordering and alt text

### File Validation Rules

**Allowed File Types**:
- image/jpeg
- image/png
- image/gif
- image/webp

**File Size Limits**:
- Maximum: 10MB per file
- Enforced on both frontend and backend

**Path Security**:
- All uploaded files stored in `/uploads/` directory
- Paths validated to prevent directory traversal
- Files served through backend with proper headers

## Admin Management Endpoints

All customer-facing entities are fully manageable through admin endpoints with authentication required.

### Personaggi Management

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/admin/personaggi` | GET | List all personaggi (including deleted) | Yes |
| `/api/admin/personaggi` | POST | Create new personaggio | Yes |
| `/api/admin/personaggi/{id}` | GET | Get personaggio details | Yes |
| `/api/admin/personaggi/{id}` | PUT | Update personaggio | Yes |
| `/api/admin/personaggi/{id}` | DELETE | Soft delete personaggio | Yes |
| `/api/admin/personaggi/{id}/restore` | POST | Restore deleted personaggio | Yes |
| `/api/admin/personaggi/deleted` | GET | List deleted personaggi | Yes |
| `/api/admin/personaggi/{id}/upload` | POST | Upload image | Yes |
| `/api/admin/personaggi/{id}/images` | DELETE | Delete image | Yes |

### Product Management

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/admin/shop/products` | GET | List all products | Yes |
| `/api/admin/shop/products` | POST | Create new product | Yes |
| `/api/admin/shop/products/{id}` | GET | Get product details | Yes |
| `/api/admin/shop/products/{id}` | PATCH | Update product | Yes |
| `/api/admin/shop/products/{id}` | DELETE | Delete product | Yes |
| `/api/admin/shop/products/{id}/variants` | POST | Add product variant | Yes |
| `/api/admin/shop/variants/{id}` | PATCH | Update variant | Yes |
| `/api/admin/shop/products/{id}/images` | POST | Upload product image | Yes |
| `/api/admin/shop/products/{id}/images` | GET | List product images | Yes |
| `/api/admin/shop/products/{id}/images/{imageId}` | PATCH | Update image metadata | Yes |
| `/api/admin/shop/products/{id}/images/{imageId}` | DELETE | Delete product image | Yes |
| `/api/admin/shop/inventory/adjust` | POST | Adjust inventory levels | Yes |

### Public Endpoints (Customer-Facing)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/personaggi` | GET | List active personaggi | No |
| `/api/personaggi/{id}` | GET | Get personaggio details | No |
| `/api/shop/products` | GET | List published products | No |
| `/api/shop/products/{slug}` | GET | Get product by slug | No |

**Note**: All public endpoints only return published/active entities. Admins can manage all entities through admin endpoints.

## Testing

### Backend Testing

Create tests in `backend/models/validation_test.go`:

```go
func TestPersonaggioValidation(t *testing.T) {
    tests := []struct {
        name    string
        input   PersonaggioInput
        wantErr bool
    }{
        {
            name: "valid personaggio",
            input: PersonaggioInput{
                Name:            "Test Character",
                Description:     "A test character",
                Images:          []string{},
                BackgroundColor: "#FF0000",
                BackgroundType:  "solid",
                Order:           0,
            },
            wantErr: false,
        },
        {
            name: "invalid name - empty",
            input: PersonaggioInput{
                Name:   "",
                Images: []string{},
            },
            wantErr: true,
        },
        // Add more test cases...
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := tt.input.Validate()
            if (err != nil) != tt.wantErr {
                t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
            }
        })
    }
}
```

### Frontend Testing

Create tests in `frontend/services/validation.test.ts`:

```typescript
describe('Personaggio Validation', () => {
  it('should validate valid personaggio', () => {
    const data = {
      name: 'Test Character',
      description: 'A test character',
      images: [],
      backgroundColor: '#FF0000',
      backgroundType: 'solid' as const,
      order: 0,
    };

    const result = validatePersonaggio(data);
    expect(result.hasErrors()).toBe(false);
  });

  it('should reject empty name', () => {
    const data = {
      name: '',
      description: 'A test character',
      images: [],
    };

    const result = validatePersonaggio(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('name')).toBeDefined();
  });

  // Add more test cases...
});
```

## Best Practices

1. **Always validate on both frontend and backend**
   - Frontend for UX
   - Backend for security

2. **Keep validation rules synchronized**
   - Update both `validation.go` and `validation.ts` together
   - Document changes in this file

3. **Use type-safe conversions**
   - TypeScript interfaces should match Go structs exactly
   - Use proper JSON tags in Go
   - Use proper TypeScript types

4. **Validate file uploads**
   - Check file type and size on both frontend and backend
   - Use secure file paths
   - Generate unique filenames

5. **Test validation logic**
   - Write unit tests for all validation functions
   - Test edge cases and invalid inputs
   - Test both success and failure scenarios

6. **Document validation rules**
   - Keep this document updated
   - Document any special validation logic
   - Include examples

## Troubleshooting

### Common Issues

**Issue**: Frontend validation passes but backend rejects
- **Cause**: Validation rules not synchronized
- **Solution**: Check both `validation.go` and `validation.ts` for differences

**Issue**: File upload fails with "Invalid file type"
- **Cause**: File type not in allowed list
- **Solution**: Ensure file is JPG, PNG, GIF, or WebP

**Issue**: Large images fail to upload
- **Cause**: File exceeds 10MB limit
- **Solution**: Compress image before uploading or increase limit (not recommended)

**Issue**: URL validation fails for valid URLs
- **Cause**: URL doesn't start with http://, https://, or /
- **Solution**: Ensure URL has proper protocol prefix

## Changelog

- **2025-01-XX**: Initial documentation created
- Added validation utilities for backend and frontend
- Implemented model validation for Personaggio and Product
- Added file upload validation
- Documented all admin management endpoints
