# Environment Variables Configuration# Environment Variables Configuration Guide



This document explains how environment variables are managed across different environments in the Art Management Tool.## Overview

This project now uses a clean, organized approach to environment management with dedicated Docker Compose files for different environments.

## Overview

## Available Environments

The application uses environment-specific `.env` files in the **root directory** to manage configuration across different deployment stages:

### 🔧 Development Environment

- **`.env`** - Default/base configuration (used by base docker-compose.yml)- **File**: `docker-compose.development.yml`

- **`.env.development`** - Development environment configuration- **Environment**: `.env.development`

- **`.env.production`** - Production environment configuration- **Ports**: Backend: 8080, Frontend: 3000, Database: 5432

- **Usage**: Hot-reload enabled, auto-migration, auto-seeding

## File Structure```bash

docker-compose -f docker-compose.development.yml up

``````

art-management-tool/

├── .env                       # Base configuration### 🧪 Test Environment

├── .env.development           # Development-specific config- **File**: `docker-compose.test.yml`

├── .env.production            # Production-specific config- **Environment**: `.env.test`

├── docker-compose.yml         # Base compose file (uses .env)- **Ports**: Backend: 8081, Frontend: 3002, Database: 5433

├── docker-compose.development.yml  # Development compose (uses .env.development)- **Usage**: Optimized for testing, fast startup, in-memory optimizations

├── docker-compose.production.yml   # Production compose (uses .env.production)```bash

├── backend/                   # NO .env file here!docker-compose -f docker-compose.test.yml up

└── frontend/                  # NO .env file here!```

```

### 🚀 Production Environment

## How It Works- **File**: `docker-compose.production.yml`

- **Environment**: `.env.production`

### 1. Environment Files Location- **Ports**: Backend: 8080, Frontend: 3000, Database: 5432

- **Usage**: Resource limits, logging, health checks, no auto-seeding

All environment files are in the **root directory** of the project. The backend and frontend directories do NOT contain their own `.env` files.```bash

docker-compose -f docker-compose.production.yml up

### 2. Docker Compose Integration```



Each Docker Compose file references the appropriate environment file:### 📄 Default Environment

- **File**: `docker-compose.yml`

```yaml- **Environment**: `.env`

# docker-compose.development.yml- **Ports**: Backend: 8080, Frontend: 3000, Database: 5432

services:- **Usage**: General development/local testing

  backend:```bash

    env_file:docker-compose up

      - .env.development```

    environment:

      - PORT=${PORT:-8080}## Fixed Issues

      - DB_HOST=postgres  # Override to use Docker service name

      # ... all other variables### ✅ Proper Environment Variable Loading

```- All services now properly load their respective `.env` files

- Environment variables are correctly interpolated with `${VAR:-default}` syntax

### 3. Variable Override Priority- Each environment is isolated and uses appropriate configurations



Environment variables follow this priority (highest to lowest):### ✅ Removed Staging Environment

- Deleted `docker-compose.staging.yml` and `.env.staging`

1. **Inline `environment:` in docker-compose** - Takes precedence- Simplified to three main environments: development, test, production

2. **`env_file:` reference** - Loaded from .env files

3. **Dockerfile ENV** - Default values in Dockerfile### ✅ Created Test Environment

4. **System environment** - Host machine variables- New dedicated test environment with optimized settings

- Uses separate ports to avoid conflicts

### 4. Frontend vs Backend Variables- Includes performance optimizations for testing



#### Backend Variables (Go Application)### ✅ Cleaned Up Unnecessary Files

- Removed redundant `.env.local.example`

All variables are available to the Go application through Docker Compose:- Kept `.env.example` as template for new developers

- Database configuration (DB_HOST, DB_PORT, etc.)

- JWT secrets## Environment File Structure

- API keys (Stripe, Etsy, Shopify)

- Application settings```

.env                    # Default environment (development-like)

#### Frontend Variables (Next.js).env.development       # Development with hot-reload

.env.test             # Testing optimized

Next.js has two types of environment variables:.env.production       # Production ready

.env.example          # Template for new developers

1. **`NEXT_PUBLIC_*`** - Exposed to the browser```

   - Example: `NEXT_PUBLIC_API_URL=`

   - Empty string means use relative paths through rewrites## Environment Variable Priority (High to Low)

1. `environment:` section in docker-compose.yml

2. **Server-side only** - Available only in Next.js server2. `env_file:` specified files  

   - Example: `BACKEND_URL=http://backend:8080`3. Shell environment variables

   - Used for server-side rewrites to backend4. Default values in `${VAR:-default}` syntax

   - NOT exposed to browser

## Key Features

## Environment-Specific Configurations

### 🔄 Development Environment

### Development Environment- Hot-reload for both frontend and backend

- Auto-migration and seeding enabled

File: `.env.development`- Debug logging

- Relaxed security settings

```bash

# Key differences from production:### 🧪 Test Environment

ENVIRONMENT=development- Fast database with tmpfs

AUTO_SEED=false              # Don't seed in development- Scheduler and rate limiting disabled

DB_PASSWORD=artpassword      # Simple password for dev- Mock payment provider

DB_SSLMODE=disable          # No SSL in dev- Separate ports to run alongside development

JWT_SECRET=dev-secret-key    # Simple secret for dev

LOG_LEVEL=debug             # Verbose logging### 🚀 Production Environment

PAYMENT_PROVIDER=mock       # Mock payments- Resource limits and reservations

ETSY_SYNC_ENABLED=false     # No sync in dev- Structured logging with rotation

- Health checks with appropriate timeouts

# Frontend config- Security-focused configuration

NEXT_PUBLIC_API_URL=        # Empty = use rewrites- No auto-seeding for data safety

BACKEND_URL=http://backend:8080

NODE_ENV=development## Usage Examples

```

### Start Development Environment

### Production Environment```bash

# Using helper script

File: `.env.production`.\scripts\start-dev.ps1



```bash# Or manually with proper env file

# Key differences from development:docker-compose --env-file .env.development -f docker-compose.development.yml up -d

ENVIRONMENT=production

AUTO_SEED=false             # Never seed in production# View logs

DB_PASSWORD=STRONG_PASSWORD # Secure passworddocker-compose --env-file .env.development -f docker-compose.development.yml logs -f backend

DB_SSLMODE=require         # Enforce SSL```

JWT_SECRET=SECURE_SECRET   # Strong secret

LOG_LEVEL=warn             # Less verbose### Run Tests

PAYMENT_PROVIDER=stripe    # Real payments```bash

ETSY_SYNC_ENABLED=true     # Enable sync# Using helper script

.\scripts\start-test.ps1

# Frontend config

NEXT_PUBLIC_API_URL=https://api.yourdomain.com  # Public API URL# Or manually

BACKEND_URL=http://backend:8080                  # Internal Docker networkdocker-compose --env-file .env.test -f docker-compose.test.yml up -d

NODE_ENV=production

```# Run tests against test environment

docker-compose --env-file .env.test -f docker-compose.test.yml exec backend-test go test ./...

## Running Different Environments

# Cleanup

### Developmentdocker-compose --env-file .env.test -f docker-compose.test.yml down -v

```

```bash

# Start development environment### Deploy to Production

docker-compose -f docker-compose.development.yml up```bash

# Ensure production env file is configured

# Uses .env.developmentcp .env.example .env.production

# - Hot reload enabled# Edit .env.production with real values

# - Debug logging

# - Mock payments# Using helper script

# - No SSL.\scripts\start-prod.ps1

```

# Or manually

### Productiondocker-compose --env-file .env.production -f docker-compose.production.yml up -d



```bash# Monitor

# Start production environmentdocker-compose --env-file .env.production -f docker-compose.production.yml logs -f

docker-compose -f docker-compose.production.yml up```



# Uses .env.production## Important: The --env-file Flag

# - Optimized builds

# - Warn-level logging**Critical:** Docker Compose variable substitution (`${VAR}`) does NOT read from `env_file:` directive!

# - Real payments

# - SSL enabledYou **MUST** use the `--env-file` flag to make variables available for substitution:

```

```bash

### Base (Default)# ❌ WRONG - Variables won't substitute correctly

docker-compose -f docker-compose.production.yml up

```bash

# Start base environment# ✅ CORRECT - Variables available for substitution  

docker-compose updocker-compose --env-file .env.production -f docker-compose.production.yml up

```

# Uses .env

# - Good for quick testing### Why This Matters

# - Similar to development

```- `env_file:` in compose file → Loads variables INTO the container

- `--env-file` flag → Makes variables available FOR substitution in the compose file itself

## Variable Reference

The postgres service needs `POSTGRES_DB`, `POSTGRES_USER`, etc. to be substituted in the compose file, so you MUST use `--env-file`.

### Application Configuration

## Configuration Validation

| Variable | Description | Default | Required |

|----------|-------------|---------|----------|### Check Configuration

| `PORT` | Backend server port | `8080` | Yes |```bash

| `ENVIRONMENT` | Environment name | `development` | Yes |# Validate compose file syntax

docker-compose -f docker-compose.development.yml config

### Database Configuration

# Test environment variable loading

| Variable | Description | Default | Required |docker-compose -f docker-compose.development.yml config | grep -A 10 environment

|----------|-------------|---------|----------|```

| `DB_HOST` | Database host (Docker: `postgres`) | `postgres` | Yes |

| `DB_PORT` | Database port | `5432` | Yes |### Debug Environment Variables

| `DB_USER` | Database username | `artuser` | Yes |```bash

| `DB_PASSWORD` | Database password | - | Yes |# Check what variables are loaded

| `DB_NAME` | Database name | `artmanagement` | Yes |docker-compose -f docker-compose.development.yml run --rm backend env | sort

| `DB_SSLMODE` | SSL mode (`disable`, `require`) | `disable` | Yes |```



### Security Configuration## Security Best Practices



| Variable | Description | Default | Required |### 🔒 Production Environment

|----------|-------------|---------|----------|- Change all default passwords in `.env.production`

| `JWT_SECRET` | JWT signing secret | - | Yes |- Use strong JWT secrets

| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins (comma-separated) | - | Yes |- Configure proper CORS origins

- Use SSL/TLS for database connections

### Payment Configuration- Set appropriate rate limits



| Variable | Description | Default | Required |### 🚫 Never Commit

|----------|-------------|---------|----------|Add to `.gitignore`:

| `PAYMENT_PROVIDER` | Payment provider (`mock`, `stripe`) | `mock` | Yes |```

| `STRIPE_API_KEY` | Stripe secret key | - | If using Stripe |.env.production

| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | - | If using Stripe |.env.local

*.local

### Etsy Integration```



| Variable | Description | Default | Required |### ✅ Always Commit

|----------|-------------|---------|----------|```

| `ETSY_API_KEY` | Etsy API key | - | If using Etsy |.env.example

| `ETSY_API_SECRET` | Etsy API secret | - | If using Etsy |.env.development

| `ETSY_SHOP_ID` | Etsy shop ID | - | If using Etsy |.env.test

| `ETSY_ACCESS_TOKEN` | Etsy OAuth token | - | If using Etsy |```

| `ETSY_SYNC_ENABLED` | Enable automatic sync | `false` | No |

| `ETSY_SYNC_INTERVAL_PRODUCTS` | Product sync interval (seconds) | `3600` | No |## Troubleshooting

| `ETSY_SYNC_INTERVAL_INVENTORY` | Inventory sync interval (seconds) | `1800` | No |

### Environment Variables Not Loading

### Frontend Configuration1. Check file exists: `ls -la .env*`

2. Verify syntax: `docker-compose -f docker-compose.development.yml config`

| Variable | Description | Default | Required |3. Check file permissions: `chmod 644 .env.development`

|----------|-------------|---------|----------|

| `NEXT_PUBLIC_API_URL` | Public API URL (browser) | - | Yes |### Port Conflicts

| `BACKEND_URL` | Internal backend URL (server) | `http://backend:8080` | Yes |- Development: 8080, 3000, 5432

| `NODE_ENV` | Node environment | `development` | Yes |- Test: 8081, 3002, 5433  

- Production: 8080, 3000, 5432

### Logging & Monitoring

### Service Connection Issues

| Variable | Description | Default | Required |- Ensure service names match between compose and env files

|----------|-------------|---------|----------|- Check network configuration

| `LOG_LEVEL` | Log level (`debug`, `info`, `warn`, `error`) | `info` | Yes |- Verify health checks are passing
| `LOG_FORMAT` | Log format (`json`, `text`) | `json` | Yes |

### Feature Flags

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `AUTO_MIGRATE` | Run migrations on startup | `true` | No |
| `AUTO_SEED` | Seed data on startup | `false` | No |
| `SCHEDULER_ENABLED` | Enable background scheduler | `true` | No |
| `RATE_LIMIT_ENABLED` | Enable API rate limiting | `true` | No |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | Max requests per minute | `60` | No |

## Best Practices

### 1. Never Commit Secrets

The `.gitignore` file excludes:
```
.env.*
```

Always keep production secrets out of version control.

### 2. Use Strong Secrets in Production

Generate strong random secrets for production:

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate database password
openssl rand -base64 24
```

### 3. Environment Variable Validation

The Go application validates required environment variables on startup. Missing required variables will cause the application to fail fast with a clear error message.

### 4. Docker Service Names

Always use Docker service names (not localhost) for inter-container communication:

```yaml
# ✅ Correct - uses Docker service name
DB_HOST=postgres
BACKEND_URL=http://backend:8080

# ❌ Wrong - uses localhost
DB_HOST=localhost
BACKEND_URL=http://localhost:8080
```

### 5. Frontend Public vs Server Variables

```bash
# ✅ Correct - server-side variable (not exposed to browser)
BACKEND_URL=http://backend:8080

# ✅ Correct - public variable (exposed to browser)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# ❌ Wrong - sensitive data in public variable
NEXT_PUBLIC_JWT_SECRET=secret123
```

## Troubleshooting

### Variables Not Being Loaded

1. **Check file location**: Ensure `.env` files are in the root directory
2. **Check Docker Compose reference**: Verify `env_file:` points to correct file
3. **Rebuild containers**: Changes to env files require rebuild:
   ```bash
   docker-compose -f docker-compose.development.yml up --build
   ```

### Database Connection Fails

1. **Check DB_HOST**: Must be `postgres` (Docker service name)
2. **Check credentials**: Verify DB_USER and DB_PASSWORD match postgres service
3. **Check network**: Ensure services are on the same Docker network

### Frontend Can't Connect to Backend

1. **Check BACKEND_URL**: For server-side should be `http://backend:8080`
2. **Check NEXT_PUBLIC_API_URL**: For browser should be empty or public URL
3. **Check Next.js rewrites**: Verify `next.config.ts` uses BACKEND_URL correctly

### Environment Variables Not Updating

1. **Restart containers**:
   ```bash
   docker-compose -f docker-compose.development.yml down
   docker-compose -f docker-compose.development.yml up
   ```

2. **Clear Docker cache**:
   ```bash
   docker-compose -f docker-compose.development.yml build --no-cache
   ```

## Migration from Old Setup

If you have old backend/.env or frontend/.env.local files:

1. **Backup** existing files
2. **Copy** variables to appropriate root `.env` files
3. **Delete** backend/.env and frontend/.env.local
4. **Rebuild** Docker containers
5. **Test** each environment

## Security Notes

### Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Change `DB_PASSWORD` to strong random value
- [ ] Set `DB_SSLMODE=require`
- [ ] Use real Stripe API keys (not test keys)
- [ ] Set `CORS_ALLOWED_ORIGINS` to actual domains
- [ ] Set `LOG_LEVEL=warn` or `error`
- [ ] Enable `RATE_LIMIT_ENABLED=true`
- [ ] Verify `NEXT_PUBLIC_API_URL` points to production API
- [ ] Never commit `.env.production` to version control

## Additional Resources

- [Docker Compose Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Go Environment Variables](https://pkg.go.dev/os#Getenv)
