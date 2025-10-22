# Validation Quick Start Guide

Quick reference for using the validation system in the Art Management Tool.

## For Backend Developers (Go)

### Import Validation
```go
import "github.com/Naim0996/art-management-tool/backend/models"
```

### Validate Model on Create
```go
func CreateHandler(w http.ResponseWriter, r *http.Request) {
    var input models.PersonaggioInput
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        http.Error(w, "Invalid input", http.StatusBadRequest)
        return
    }

    // Validate input
    if err := input.Validate(); err != nil {
        http.Error(w, "Validation failed: "+err.Error(), http.StatusBadRequest)
        return
    }
    
    // Proceed with creation...
}
```

### Validate Product on Create
```go
var product models.EnhancedProduct
if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
    http.Error(w, "Invalid request body", http.StatusBadRequest)
    return
}

if err := models.ValidateProductCreate(&product); err != nil {
    http.Error(w, "Validation failed: "+err.Error(), http.StatusBadRequest)
    return
}
```

### Validate Product on Update
```go
var updates models.EnhancedProduct
if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
    http.Error(w, "Invalid request body", http.StatusBadRequest)
    return
}

if err := models.ValidateProductUpdate(&updates); err != nil {
    http.Error(w, "Validation failed: "+err.Error(), http.StatusBadRequest)
    return
}
```

### Custom Validation
```go
v := models.NewValidator()
v.Required("email", email).
  Email("email", email).
  MinLength("password", password, 8).
  MaxLength("password", password, 128)

if v.HasErrors() {
    http.Error(w, v.Errors().Error(), http.StatusBadRequest)
    return
}
```

### Run Tests
```bash
cd backend
go test ./models -v
```

## For Frontend Developers (TypeScript)

### Import Validation
```typescript
import { 
  validatePersonaggio, 
  validateProductCreate,
  validateImageFile 
} from '@/services/validation';
```

### Validate Before API Call
```typescript
async function createPersonaggio(data: PersonaggioDTO) {
  // Validate before sending
  const validation = validatePersonaggio(data);
  if (validation.hasErrors()) {
    // Show error to user
    toast.error(validation.getErrorMessage());
    return;
  }
  
  // Send to API
  const result = await PersonaggiAPIService.createPersonaggio(data);
  return result;
}
```

### Validate Form Input
```typescript
const handleSubmit = async () => {
  const validation = validateProductCreate({
    title: form.title,
    slug: form.slug,
    base_price: form.price,
  });
  
  if (validation.hasErrors()) {
    // Show field-specific errors
    setErrors({
      title: validation.getFieldError('title'),
      slug: validation.getFieldError('slug'),
      price: validation.getFieldError('base_price'),
    });
    return;
  }
  
  // Submit form...
};
```

### Validate File Upload
```typescript
const handleFileUpload = (file: File) => {
  const validation = validateImageFile(file, 10); // 10MB max
  
  if (validation.hasErrors()) {
    toast.error(validation.getErrorMessage());
    return;
  }
  
  // Upload file...
};
```

### Custom Validation
```typescript
import { Validator } from '@/services/validation';

const validator = new Validator();
validator
  .required('name', form.name)
  .minLength('name', form.name, 3)
  .email('email', form.email)
  .colorHex('color', form.color);

const result = validator.getResult();
if (result.hasErrors()) {
  console.error(result.getErrorMessage());
}
```

### Run Tests
```bash
cd frontend
npm test -- validation.test.ts
```

## Common Validation Rules

### String Validation
- `required`: Field must not be empty
- `minLength`: Minimum character length
- `maxLength`: Maximum character length
- `pattern`: Must match regex pattern

### Numeric Validation
- `minValue`: Minimum numeric value
- `maxValue`: Maximum numeric value

### Format Validation
- `url`: Must be valid URL (http://, https://, or /)
- `email`: Must be valid email format
- `colorHex`: Must be hex color (#RRGGBB)

### Constraint Validation
- `oneOf`: Value must be in allowed list

## Field-Specific Rules

### Personaggio
- **name**: Required, 1-100 chars
- **description**: Optional, max 2000 chars
- **images**: Max 20 URLs
- **backgroundColor**: Hex color
- **backgroundType**: 'solid' or 'gradient'

### Product
- **title**: Required, 1-500 chars
- **slug**: Required, 1-255 chars, lowercase + hyphens only
- **base_price**: Required, >= 0
- **status**: 'draft', 'published', or 'archived'

### Image File
- **type**: image/* only
- **size**: Max 10MB
- **extension**: .jpg, .jpeg, .png, .gif, .webp

## Testing Your Validation

### Backend Test Template
```go
func TestYourValidation(t *testing.T) {
    tests := []struct {
        name    string
        input   YourInput
        wantErr bool
    }{
        {
            name: "valid input",
            input: YourInput{
                Field: "valid",
            },
            wantErr: false,
        },
        {
            name: "invalid input",
            input: YourInput{
                Field: "",
            },
            wantErr: true,
        },
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

### Frontend Test Template
```typescript
describe('Your Validation', () => {
  it('should validate valid input', () => {
    const data = { field: 'valid' };
    const result = validateYourData(data);
    expect(result.hasErrors()).toBe(false);
  });

  it('should reject invalid input', () => {
    const data = { field: '' };
    const result = validateYourData(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('field')).toBeDefined();
  });
});
```

## Error Handling Best Practices

### Backend
```go
// Return specific validation errors
if err := input.Validate(); err != nil {
    http.Error(w, fmt.Sprintf("Validation failed: %v", err), http.StatusBadRequest)
    return
}
```

### Frontend
```typescript
// Show user-friendly errors
const validation = validateData(data);
if (validation.hasErrors()) {
    toast.current?.show({
        severity: 'error',
        summary: 'Validation Error',
        detail: validation.getErrorMessage(),
        life: 3000,
    });
    return;
}
```

## When to Validate

### Always Validate
✅ On form submission
✅ Before API calls
✅ On file upload
✅ On create operations
✅ On update operations

### Don't Skip
❌ Don't skip backend validation (even if frontend validates)
❌ Don't skip frontend validation (even if backend validates)
❌ Don't assume data is valid

## Need Help?

- 📖 Full documentation: [MODEL_SYNCHRONIZATION.md](./MODEL_SYNCHRONIZATION.md)
- 📝 Implementation details: [summaries/MODEL_VALIDATION_SUMMARY.md](./summaries/MODEL_VALIDATION_SUMMARY.md)
- 🧪 Test examples: `backend/models/validation_test.go`, `frontend/services/validation.test.ts`

## Quick Commands

```bash
# Test backend validation
cd backend && go test ./models -v -run Validation

# Test frontend validation
cd frontend && npm test -- validation.test.ts

# Build backend
cd backend && go build

# Check frontend types
cd frontend && npx tsc --noEmit

# Lint frontend
cd frontend && npm run lint
```
