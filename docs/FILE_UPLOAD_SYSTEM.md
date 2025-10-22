# File Upload System Documentation

## Overview

The Art Management Tool includes a robust file upload system for managing images for products and personaggi (characters). This system provides secure upload, storage, and retrieval of images with proper validation and Docker-based persistent storage.

## Architecture

### Components

1. **Upload Service** (`backend/services/upload/upload.go`)
   - Centralized file upload logic
   - File validation (size, type, extension)
   - Unique filename generation
   - File storage management

2. **Upload Handlers** (`backend/handlers/admin/uploads.go`)
   - Product image upload endpoints
   - Image CRUD operations
   - Position and metadata management

3. **Personaggi Upload Handler** (`backend/handlers/personaggi_upload.go`)
   - Character-specific image uploads
   - Icon and image gallery management

4. **Docker Volumes**
   - Persistent storage for uploaded files
   - Environment-specific volumes (dev, staging, production)

## Features

### Security & Validation

- **File Size Limits**: Maximum 10MB per file (configurable)
- **File Type Validation**: Only image files allowed (JPEG, PNG, GIF, WebP)
- **Extension Checking**: Double validation with MIME type and extension
- **Unique Filenames**: UUID-based naming to prevent collisions
- **Path Sanitization**: Prevents directory traversal attacks

### Storage Strategy

#### Development
```yaml
volumes:
  - uploads_dev_data:/app/uploads
```
- Persistent across container restarts
- Accessible for local development

#### Production
```yaml
volumes:
  - uploads_prod_data:/app/uploads
```
- Persistent production storage
- Optimized for performance
- Backup-friendly volume structure

## API Endpoints

### Product Image Management

#### Upload Product Image
```http
POST /api/admin/shop/products/{id}/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- file: <image file>
- alt_text: <optional alt text>
- position: <optional display order>
```

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "image": {
    "id": 1,
    "product_id": 123,
    "url": "/uploads/products/123/product_abc123.jpg",
    "alt_text": "Product image",
    "position": 0,
    "created_at": "2025-10-22T21:00:00Z"
  }
}
```

#### List Product Images
```http
GET /api/admin/shop/products/{id}/images
Authorization: Bearer <token>
```

**Response:**
```json
{
  "images": [
    {
      "id": 1,
      "product_id": 123,
      "url": "/uploads/products/123/product_abc123.jpg",
      "alt_text": "Product image",
      "position": 0,
      "created_at": "2025-10-22T21:00:00Z"
    }
  ]
}
```

#### Update Product Image
```http
PATCH /api/admin/shop/products/{id}/images/{imageId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "position": 1,
  "alt_text": "Updated alt text"
}
```

#### Delete Product Image
```http
DELETE /api/admin/shop/products/{id}/images/{imageId}
Authorization: Bearer <token>
```

### Personaggi Image Management

#### Upload Personaggio Image
```http
POST /api/admin/personaggi/{id}/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- file: <image file>
- type: icon|image
```

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "url": "/uploads/personaggi/1/character_icon_abc123.jpg",
  "type": "icon"
}
```

#### Delete Personaggio Image
```http
DELETE /api/admin/personaggi/{id}/images
Authorization: Bearer <token>
Content-Type: application/json

{
  "imageUrl": "/uploads/personaggi/1/character_image_abc123.jpg",
  "type": "image"
}
```

## Frontend Integration

### AdminShopAPIService

```typescript
import { adminShopAPI } from '@/services/AdminShopAPIService';

// Upload product image
const result = await adminShopAPI.uploadProductImage(
  productId,
  file,
  'Product showcase',
  0
);

// List images
const { images } = await adminShopAPI.listProductImages(productId);

// Update image
await adminShopAPI.updateProductImage(productId, imageId, {
  position: 1,
  alt_text: 'New alt text'
});

// Delete image
await adminShopAPI.deleteProductImage(productId, imageId);
```

### PersonaggiAPIService

```typescript
import { PersonaggiAPIService } from '@/services/PersonaggiAPIService';

// Upload icon
const result = await PersonaggiAPIService.uploadImage(
  personaggioId,
  file,
  'icon'
);

// Upload gallery image
const result = await PersonaggiAPIService.uploadImage(
  personaggioId,
  file,
  'image'
);

// Delete image
await PersonaggiAPIService.deleteImage(
  personaggioId,
  imageUrl,
  'image'
);
```

## Database Schema

### ProductImage Model
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

### Personaggio Model
```go
type Personaggio struct {
    ID          uint           `json:"id" gorm:"primaryKey"`
    Name        string         `json:"name" gorm:"not null"`
    Icon        string         `json:"icon"` // Single icon URL
    Images      datatypes.JSON `json:"images"` // Array of image URLs
    // ... other fields
}
```

## Configuration

### Environment Variables

```bash
# Maximum file size in bytes (default: 10MB)
UPLOAD_MAX_FILE_SIZE=10485760

# Allowed MIME types (comma-separated)
UPLOAD_ALLOWED_TYPES=image/jpeg,image/jpg,image/png,image/gif,image/webp

# Base directory for uploads
UPLOAD_BASE_DIR=./uploads
```

### Upload Service Configuration

The upload service can be customized in code:

```go
import "github.com/Naim0996/art-management-tool/backend/services/upload"

// Custom configuration
config := &upload.Config{
    BaseDir:     "./uploads",
    MaxFileSize: 10 << 20, // 10 MB
    AllowedTypes: []string{
        "image/jpeg",
        "image/png",
        "image/webp",
    },
    AllowedExts: []string{".jpg", ".jpeg", ".png", ".webp"},
}

uploadService := upload.NewService(config)
```

## Docker Deployment

### Volume Configuration

The system uses named Docker volumes for persistent storage across all environments:

```yaml
volumes:
  # Development
  uploads_dev_data:
    driver: local
  
  # Staging
  uploads_staging_data:
    driver: local
  
  # Production
  uploads_prod_data:
    driver: local
```

### Backend Service Configuration

```yaml
backend:
  volumes:
    - uploads_data:/app/uploads
  # ... other configuration
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect art-management-tool_uploads_data

# Backup volume
docker run --rm -v art-management-tool_uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz /data

# Restore volume
docker run --rm -v art-management-tool_uploads_data:/data -v $(pwd):/backup alpine tar xzf /backup/uploads-backup.tar.gz -C /
```

## File Organization

```
uploads/
├── products/
│   ├── 1/
│   │   ├── product_abc123.jpg
│   │   └── product_def456.png
│   ├── 2/
│   │   └── product_ghi789.jpg
│   └── ...
└── personaggi/
    ├── 1/
    │   ├── character_icon_abc123.jpg
    │   └── character_image_def456.jpg
    ├── 2/
    │   └── character_icon_ghi789.png
    └── ...
```

## Security Best Practices

### Implemented

1. **File Type Validation**: Both MIME type and extension checked
2. **Size Limits**: Configurable maximum file size
3. **Unique Filenames**: UUID-based naming prevents collisions
4. **Path Sanitization**: Using `filepath.Join()` prevents traversal
5. **Authentication Required**: All upload endpoints require admin JWT
6. **Content-Type Verification**: Validates actual file content

### Recommendations

1. **Image Processing**: Consider adding image optimization/resizing
2. **Virus Scanning**: Integrate antivirus scanning for production
3. **CDN Integration**: Use CDN for serving images in production
4. **Rate Limiting**: Implement upload rate limits per user
5. **Watermarking**: Add watermarks to protect intellectual property

## Error Handling

### Common Errors

| Error | Status | Description |
|-------|--------|-------------|
| File too large | 400 | Exceeds `MaxFileSize` limit |
| Invalid file type | 400 | Not in `AllowedTypes` list |
| Invalid extension | 400 | Not in `AllowedExts` list |
| Product not found | 404 | Product ID doesn't exist |
| Upload failed | 500 | Disk write error |
| Database error | 500 | Failed to save metadata |

### Error Response Format

```json
{
  "error": "file size exceeds maximum allowed size of 10485760 bytes"
}
```

## Testing

### Manual Testing

1. **Upload Valid Image**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@test-image.jpg" \
  -F "alt_text=Test image" \
  -F "position=0" \
  http://localhost:8080/api/admin/shop/products/1/images
```

2. **Test File Size Limit**
```bash
# Create 11MB file (should fail)
dd if=/dev/zero of=large.jpg bs=1M count=11
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@large.jpg" \
  http://localhost:8080/api/admin/shop/products/1/images
```

3. **Test Invalid File Type**
```bash
# Upload PDF (should fail)
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@document.pdf" \
  http://localhost:8080/api/admin/shop/products/1/images
```

### Automated Tests

Consider adding these test cases:
- Upload valid image file
- Reject oversized files
- Reject invalid file types
- Reject invalid extensions
- Handle concurrent uploads
- Verify file cleanup on error
- Test image metadata updates
- Test image deletion

## Performance Considerations

1. **Concurrent Uploads**: System handles multiple simultaneous uploads
2. **File Streaming**: Large files are streamed, not loaded into memory
3. **Database Indexing**: Product images indexed by `product_id`
4. **Volume Performance**: Docker volumes optimized for I/O

## Troubleshooting

### Upload Fails

1. **Check disk space**
```bash
df -h
docker system df
```

2. **Verify volume mount**
```bash
docker inspect art-backend | grep -A 10 Mounts
```

3. **Check permissions**
```bash
docker exec art-backend ls -la /app/uploads
```

### Images Not Serving

1. **Verify file exists**
```bash
docker exec art-backend ls -la /app/uploads/products/1/
```

2. **Check file server route**
```bash
curl http://localhost:8080/uploads/products/1/product_abc123.jpg
```

3. **Verify CORS headers**
```bash
curl -I -H "Origin: http://localhost:3000" http://localhost:8080/uploads/products/1/product_abc123.jpg
```

## Future Enhancements

1. **Image Optimization**
   - Automatic resizing/compression
   - Multiple size variants (thumbnail, medium, large)
   - WebP conversion for better compression

2. **CDN Integration**
   - Amazon S3/CloudFront
   - Cloudinary
   - Custom CDN setup

3. **Advanced Features**
   - Image cropping UI
   - Bulk upload
   - Drag-and-drop reordering
   - Image gallery templates

4. **Analytics**
   - Upload statistics
   - Storage usage tracking
   - Popular image formats

## Support

For issues or questions:
- GitHub Issues: [Art Management Tool Issues](https://github.com/Naim0996/art-management-tool/issues)
- Documentation: [Project Documentation](../docs/)

## License

MIT License - See LICENSE file for details
