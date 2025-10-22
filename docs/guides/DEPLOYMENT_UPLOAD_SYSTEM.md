# Deployment Guide for File Upload System

## Overview

This guide provides step-by-step instructions for deploying the file upload system in production environments.

## Prerequisites

- Docker and Docker Compose installed
- Access to the server or cloud platform
- SSL certificates configured (for production)
- Sufficient disk space for image storage

## Quick Start

### 1. Update Environment Variables

Add the following to your `.env.production` file:

```bash
# File Upload Configuration
UPLOAD_MAX_FILE_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/jpg,image/png,image/gif,image/webp
UPLOAD_BASE_DIR=./uploads
```

### 2. Deploy with Docker Compose

```bash
# Pull latest changes
git pull origin main

# Deploy production stack
docker-compose -f docker-compose.production.yml up -d

# Verify uploads volume is created
docker volume ls | grep uploads
```

## Volume Management

### Production Volume Configuration

The upload system uses a dedicated Docker volume for persistent storage:

```yaml
volumes:
  uploads_prod_data:
    driver: local
```

### Volume Location

By default, Docker stores volumes in:
- **Linux**: `/var/lib/docker/volumes/`
- **Mac**: `~/Library/Containers/com.docker.docker/Data/vms/0/`
- **Windows**: `C:\ProgramData\Docker\volumes\`

### Backup Uploads

#### Create Backup

```bash
# Stop backend to ensure data consistency (optional)
docker-compose -f docker-compose.production.yml stop backend

# Create backup
docker run --rm \
  -v art-management-tool_uploads_prod_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/uploads-backup-$(date +%Y%m%d-%H%M%S).tar.gz /data

# Restart backend
docker-compose -f docker-compose.production.yml start backend
```

#### Restore Backup

```bash
# Stop backend
docker-compose -f docker-compose.production.yml stop backend

# Restore from backup
docker run --rm \
  -v art-management-tool_uploads_prod_data:/data \
  -v $(pwd)/backups:/backup \
  alpine sh -c "cd / && tar xzf /backup/uploads-backup-20251022-120000.tar.gz"

# Restart backend
docker-compose -f docker-compose.production.yml start backend
```

### Automated Backups

#### Daily Backup Script

Create `/scripts/backup-uploads.sh`:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/backups/uploads"
COMPOSE_FILE="docker-compose.production.yml"
VOLUME_NAME="art-management-tool_uploads_prod_data"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename
BACKUP_FILE="$BACKUP_DIR/uploads-$(date +%Y%m%d-%H%M%S).tar.gz"

# Create backup
echo "Creating backup: $BACKUP_FILE"
docker run --rm \
  -v ${VOLUME_NAME}:/data \
  -v ${BACKUP_DIR}:/backup \
  alpine tar czf /backup/$(basename $BACKUP_FILE) /data

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup created successfully"
  
  # Remove old backups
  find "$BACKUP_DIR" -name "uploads-*.tar.gz" -mtime +${RETENTION_DAYS} -delete
  echo "Old backups removed (kept last ${RETENTION_DAYS} days)"
else
  echo "Backup failed!"
  exit 1
fi
```

Make executable and add to cron:

```bash
chmod +x /scripts/backup-uploads.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /scripts/backup-uploads.sh >> /var/log/uploads-backup.log 2>&1" | crontab -
```

## CDN Integration (Optional)

For better performance and scalability, consider using a CDN:

### Option 1: AWS S3 + CloudFront

1. **Create S3 Bucket**:
```bash
aws s3 mb s3://your-art-uploads --region us-east-1
```

2. **Configure Bucket Policy**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-art-uploads/*"
    }
  ]
}
```

3. **Update Backend Code** (future enhancement):
```go
// services/upload/s3.go
type S3Config struct {
    Bucket    string
    Region    string
    AccessKey string
    SecretKey string
}
```

### Option 2: Cloudinary

1. **Sign up for Cloudinary**
2. **Get API credentials**
3. **Update environment variables**:
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Performance Optimization

### Enable Compression

Add nginx reverse proxy with gzip compression:

**nginx.conf**:
```nginx
server {
    listen 80;
    server_name api.yoursite.com;

    # Enable gzip for images
    gzip on;
    gzip_types image/jpeg image/png image/gif image/webp;
    gzip_min_length 1000;

    location /uploads/ {
        proxy_pass http://backend:8080;
        
        # Caching
        proxy_cache_valid 200 1d;
        proxy_cache_key "$request_uri";
        
        # Headers
        add_header Cache-Control "public, max-age=86400";
        add_header X-Content-Type-Options "nosniff";
    }
}
```

### Image Optimization

Consider adding image optimization middleware (future enhancement):

```go
// services/upload/optimizer.go
func OptimizeImage(src, dst string, quality int) error {
    // Resize, compress, convert to WebP
    // Implementation using imaging library
}
```

## Monitoring

### Check Upload Statistics

```bash
# List all uploads
docker exec art-backend ls -lhR /app/uploads/

# Check volume size
docker system df -v | grep uploads

# Monitor disk usage
docker exec art-backend df -h /app/uploads
```

### Set Up Alerts

Create monitoring script `/scripts/monitor-uploads.sh`:

```bash
#!/bin/bash

THRESHOLD_PERCENT=80
VOLUME_NAME="art-management-tool_uploads_prod_data"

# Get volume size info
USAGE=$(docker exec art-backend df -h /app/uploads | awk 'NR==2 {print $5}' | sed 's/%//')

if [ "$USAGE" -gt "$THRESHOLD_PERCENT" ]; then
  echo "WARNING: Upload volume usage is at ${USAGE}%"
  
  # Send alert (customize as needed)
  # curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  #   -d "{\"text\": \"Upload volume usage is at ${USAGE}%\"}"
fi
```

## Security Considerations

### File Permissions

Ensure proper permissions in the container:

```dockerfile
# In Dockerfile
RUN mkdir -p /app/uploads && \
    chown -R appuser:appuser /app/uploads && \
    chmod -R 755 /app/uploads
```

### Virus Scanning (Optional)

Install ClamAV for virus scanning:

```bash
# Install ClamAV in container
RUN apt-get update && apt-get install -y clamav clamav-daemon

# Scan uploads
clamscan -r /app/uploads/
```

### Rate Limiting

Configure rate limiting for upload endpoints:

```go
// middleware/ratelimit.go
uploadLimiter := rate.NewLimiter(rate.Limit(10), 100) // 10 uploads per second
```

## Troubleshooting

### Issue: Upload fails with "disk full"

**Solution**: Check and clean up old uploads
```bash
docker exec art-backend df -h
docker system prune -a --volumes
```

### Issue: Permission denied errors

**Solution**: Fix volume permissions
```bash
docker exec -u root art-backend chown -R appuser:appuser /app/uploads
docker exec -u root art-backend chmod -R 755 /app/uploads
```

### Issue: Images not accessible

**Solution**: Verify file server route
```bash
curl -I http://localhost:8080/uploads/products/1/test.jpg
```

### Issue: Slow upload performance

**Solution**: Check network and disk I/O
```bash
docker stats art-backend
iostat -x 1
```

## Scaling Considerations

### Horizontal Scaling

When running multiple backend instances:

1. **Use shared storage**: AWS EFS, NFS, or object storage
2. **Configure backend instances**:
```yaml
backend:
  deploy:
    replicas: 3
  volumes:
    - nfs-uploads:/app/uploads
```

### Load Balancing

Configure load balancer for upload endpoints:

```nginx
upstream backend_upload {
    least_conn;
    server backend1:8080;
    server backend2:8080;
    server backend3:8080;
}

location /api/admin/shop/products/ {
    proxy_pass http://backend_upload;
    client_max_body_size 10M;
}
```

## Maintenance

### Regular Tasks

1. **Weekly**: Check disk usage and clean up temp files
2. **Monthly**: Review and archive old uploads
3. **Quarterly**: Test backup and restore procedures
4. **Yearly**: Review security and update dependencies

### Cleanup Old Test Uploads

```bash
# Remove uploads older than 90 days in dev/staging
find /var/lib/docker/volumes/art-management-tool_uploads_staging_data/_data \
  -type f -mtime +90 -delete
```

## Migration

### Migrate from Local to S3

```bash
# 1. Export current uploads
docker run --rm \
  -v art-management-tool_uploads_prod_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/uploads.tar.gz /data

# 2. Extract and upload to S3
tar xzf uploads.tar.gz
aws s3 sync data/ s3://your-art-uploads/ --acl public-read

# 3. Update backend configuration
# Configure S3 in backend code
```

## Support

For deployment issues:
- Check logs: `docker logs art-backend`
- Review documentation: `/docs/FILE_UPLOAD_SYSTEM.md`
- Open issue: [GitHub Issues](https://github.com/Naim0996/art-management-tool/issues)

## Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Docker volumes created
- [ ] Backup script set up and tested
- [ ] Monitoring alerts configured
- [ ] File permissions verified
- [ ] Load testing completed
- [ ] Security scan passed
- [ ] Documentation updated
- [ ] Rollback plan prepared

## Next Steps

After deployment:
1. Test file upload functionality
2. Monitor disk usage
3. Set up regular backups
4. Review security settings
5. Consider CDN integration for better performance
