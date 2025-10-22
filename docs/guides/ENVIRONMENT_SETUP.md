# 🔧 Environment Setup Guide

This guide explains how to configure and use environment files in the Art Management Tool project.

## 📋 Table of Contents

- [Overview](#overview)
- [Environment Files](#environment-files)
- [Docker Compose Environments](#docker-compose-environments)
- [Configuration Variables](#configuration-variables)
- [Quick Start](#quick-start)
- [Advanced Configuration](#advanced-configuration)
- [Troubleshooting](#troubleshooting)

## Overview

The project uses environment-specific configuration files to manage settings across different stages of development and deployment. This approach ensures:

- ✅ Clear separation between development, testing, staging, and production
- ✅ Secure credential management
- ✅ Easy configuration without code changes
- ✅ Out-of-the-box setup for developers and CI

## Environment Files

### Available Environment Files

| File | Purpose | Usage |
|------|---------|-------|
| `.env.example` | Template with all available options | Copy to create new environment files |
| `.env.development` | Development defaults | Used by `docker-compose.development.yml` |
| `.env.test` | Testing with mock providers | Used by CI and test runners |
| `.env.staging` | Staging environment | Used by `docker-compose.staging.yml` |
| `.env.production` | Production configuration | Used by `docker-compose.production.yml` |
| `.env.local` | Local overrides (gitignored) | Personal settings, overrides other files |

### File Priority

Environment files are loaded in this order (later files override earlier ones):

1. `.env.example` (baseline)
2. `.env.[environment]` (development/test/staging/production)
3. `.env.local` (local overrides, never committed)

### Creating Your Environment File

#### For Development

```bash
# Option 1: Use the provided development file
cp .env.development .env.local

# Option 2: Create from example
cp .env.example .env.local
# Edit .env.local with your settings
```

#### For Testing

The `.env.test` file is pre-configured with test-ready defaults:
- Uses mock payment providers
- Disables external integrations
- Can use in-memory SQLite
- Relaxed rate limiting

No configuration needed! Just run tests:

```bash
cd backend
ENV=test go test ./...
```

#### For Production

```bash
# Copy and secure the production template
cp .env.production .env.local
chmod 600 .env.local

# Edit with secure values
nano .env.local
```

⚠️ **Security Warning**: Never commit `.env.local`, `.env.production`, or files with real credentials to git!

## Docker Compose Environments

### Development Environment

**File**: `docker-compose.development.yml`

Features:
- Hot-reload for backend and frontend
- Auto-migration on startup
- Auto-seeding (optional)
- Debug logging enabled
- SQLite or PostgreSQL

```bash
# Start development environment
docker compose -f docker-compose.development.yml up -d

# View logs
docker compose -f docker-compose.development.yml logs -f

# Stop
docker compose -f docker-compose.development.yml down
```

Environment variables:
```bash
# Enable auto-seeding
AUTO_MIGRATE=true
AUTO_SEED=true
```

### Default Environment

**File**: `docker-compose.yml`

The default compose file for quick starts. Suitable for demos and development.

```bash
# Start with defaults
docker compose up -d

# Enable seeding
AUTO_SEED=true docker compose up -d
```

### Staging Environment

**File**: `docker-compose.staging.yml`

Features:
- Mirrors production setup
- Uses `.env.staging`
- Runs on different ports (8081, 3001, 5433)
- Separate database and network

```bash
# Start staging environment
docker compose -f docker-compose.staging.yml up -d
```

Access:
- Frontend: http://localhost:3001
- Backend: http://localhost:8081
- Database: localhost:5433

### Production Environment

**File**: `docker-compose.production.yml`

Features:
- Production-optimized builds
- Resource limits
- Log rotation
- Health checks
- Automatic restarts
- No auto-seeding

```bash
# Start production environment
docker compose -f docker-compose.production.yml up -d

# Check status
docker compose -f docker-compose.production.yml ps

# View logs
docker compose -f docker-compose.production.yml logs -f
```

⚠️ **Important**: Always use `.env.production` with secure credentials!

## Configuration Variables

### Application Settings

```bash
PORT=8080                  # Backend server port
ENVIRONMENT=development    # Environment name (development/test/staging/production)
```

### Database Configuration

```bash
DB_HOST=postgres          # Database host (use 'postgres' for Docker)
DB_PORT=5432              # PostgreSQL port
DB_USER=artuser           # Database username
DB_PASSWORD=artpassword   # Database password (change in production!)
DB_NAME=artmanagement     # Database name
DB_SSLMODE=disable        # SSL mode (require/disable/verify-full)
```

### Auto-Migration & Seeding

```bash
AUTO_MIGRATE=true         # Run migrations on startup
AUTO_SEED=false           # Seed database with sample data
```

### Security

```bash
JWT_SECRET=your-secret-key    # JWT signing key (MUST be changed in production!)
```

### CORS

```bash
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Payment Providers

```bash
PAYMENT_PROVIDER=mock         # Options: mock, stripe, etsy
STRIPE_API_KEY=sk_test_...    # Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Stripe webhook secret
```

### Etsy Integration

```bash
ETSY_API_KEY=              # Etsy API key
ETSY_API_SECRET=           # Etsy API secret
ETSY_SHOP_ID=              # Your Etsy shop ID
ETSY_ACCESS_TOKEN=         # OAuth access token
ETSY_SYNC_ENABLED=false    # Enable automatic sync
```

### Logging

```bash
LOG_LEVEL=info            # Levels: debug, info, warn, error
LOG_FORMAT=json           # Formats: json, text
```

## Quick Start

### Local Development (No Docker)

1. **Backend Setup**

```bash
cd backend

# Copy environment file
cp ../.env.development .env

# Install dependencies
go mod download

# Run migrations
go run main.go migrate

# (Optional) Seed data
go run cmd/seed/main.go

# Start server
go run main.go
```

2. **Frontend Setup**

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local

# Start development server
npm run dev
```

### Docker Development

```bash
# Start everything with one command
docker compose up -d

# OR use development compose with hot-reload
docker compose -f docker-compose.development.yml up -d

# Seed the database (if needed)
docker compose exec backend /app/cmd/seed/seed

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
```

### Testing

```bash
cd backend

# Run tests with test environment
ENV=test go test ./...

# Run specific test
ENV=test go test ./services/cart -v

# Run with coverage
ENV=test go test ./... -cover
```

## Advanced Configuration

### Using Multiple Environments Simultaneously

Run development and staging side-by-side:

```bash
# Start development
docker compose -f docker-compose.development.yml up -d

# Start staging (uses different ports)
docker compose -f docker-compose.staging.yml up -d
```

### Custom Database Connection

```bash
# .env.local
DB_HOST=my-remote-db.example.com
DB_PORT=5432
DB_USER=myuser
DB_PASSWORD=secure_password
DB_NAME=artmanagement
DB_SSLMODE=require
```

### Enabling Etsy Sync

```bash
# .env.local
ETSY_API_KEY=your_api_key
ETSY_API_SECRET=your_api_secret
ETSY_SHOP_ID=12345678
ETSY_ACCESS_TOKEN=your_access_token
ETSY_SYNC_ENABLED=true
ETSY_SYNC_INTERVAL_PRODUCTS=3600  # Sync products every hour
ETSY_SYNC_INTERVAL_INVENTORY=1800 # Sync inventory every 30 minutes
```

### Production Secrets Management

For production, use a secrets manager instead of environment files:

#### AWS Secrets Manager

```bash
# Install AWS CLI
apt-get install awscli

# Fetch secrets
aws secretsmanager get-secret-value --secret-id art-management-tool/prod
```

#### Docker Secrets

```yaml
# docker-compose.production.yml
secrets:
  db_password:
    external: true
  jwt_secret:
    external: true

services:
  backend:
    secrets:
      - db_password
      - jwt_secret
```

#### HashiCorp Vault

```bash
# Fetch from Vault
vault kv get secret/art-management-tool/production
```

## Troubleshooting

### Database Connection Failed

**Problem**: Backend can't connect to database

**Solutions**:

1. Check database is running:
   ```bash
   docker compose ps postgres
   ```

2. Verify credentials match:
   ```bash
   # .env file should match docker-compose.yml
   DB_USER=artuser
   DB_PASSWORD=artpassword
   ```

3. For Docker, use service name as host:
   ```bash
   DB_HOST=postgres  # NOT 'localhost'
   ```

### Migrations Not Running

**Problem**: Tables don't exist in database

**Solutions**:

1. Enable auto-migration:
   ```bash
   AUTO_MIGRATE=true docker compose up -d
   ```

2. Run migrations manually:
   ```bash
   docker compose exec backend /app/main migrate
   ```

3. Check migration files exist:
   ```bash
   ls -la backend/migrations/
   ```

### Environment Variables Not Loading

**Problem**: Application uses wrong configuration

**Solutions**:

1. Verify file exists:
   ```bash
   ls -la .env.*
   ```

2. Check docker-compose loads the file:
   ```yaml
   services:
     backend:
       env_file:
         - .env.development
   ```

3. Restart containers after changes:
   ```bash
   docker compose down
   docker compose up -d
   ```

### Port Already in Use

**Problem**: Can't start service, port is busy

**Solutions**:

1. Find what's using the port:
   ```bash
   lsof -i :8080
   lsof -i :3000
   ```

2. Change port in docker-compose:
   ```yaml
   ports:
     - "8081:8080"  # Use 8081 externally
   ```

3. Or stop conflicting service:
   ```bash
   # Stop other compose environments
   docker compose -f docker-compose.development.yml down
   ```

## Best Practices

### Development

- ✅ Use `.env.development` as baseline
- ✅ Create `.env.local` for personal overrides
- ✅ Enable AUTO_SEED for quick setup
- ✅ Use debug logging (LOG_LEVEL=debug)

### Testing

- ✅ Use `.env.test` (pre-configured)
- ✅ Always use mock providers
- ✅ Disable external integrations
- ✅ Use in-memory databases when possible

### Staging

- ✅ Mirror production setup
- ✅ Use real services but separate instances
- ✅ Test with production-like data
- ✅ Validate Etsy sync before production

### Production

- ✅ Never use `.env.example` values
- ✅ Use secrets manager for credentials
- ✅ Enable SSL/TLS (DB_SSLMODE=require)
- ✅ Set strong JWT_SECRET
- ✅ Disable AUTO_SEED
- ✅ Use LOG_FORMAT=json for parsing
- ✅ Rotate credentials regularly

## Related Documentation

- [Docker Guide](./DOCKER.md) - Docker deployment details
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [Testing Guide](./TESTING_GUIDE.md) - Testing strategies
- [Architecture](../ARCHITECTURE.md) - System architecture

## Need Help?

- 🐛 [Report Issues](https://github.com/Naim0996/art-management-tool/issues)
- 💬 [GitHub Discussions](https://github.com/Naim0996/art-management-tool/discussions)
- 📧 Email: support@artmanagement.tool
