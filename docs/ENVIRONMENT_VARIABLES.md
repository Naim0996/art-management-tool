# Environment Variables Configuration Guide

## Overview
This project now uses a clean, organized approach to environment management with dedicated Docker Compose files for different environments.

## Available Environments

### 🔧 Development Environment
- **File**: `docker-compose.development.yml`
- **Environment**: `.env.development`
- **Ports**: Backend: 8080, Frontend: 3000, Database: 5432
- **Usage**: Hot-reload enabled, auto-migration, auto-seeding
```bash
docker-compose -f docker-compose.development.yml up
```

### 🧪 Test Environment
- **File**: `docker-compose.test.yml`
- **Environment**: `.env.test`
- **Ports**: Backend: 8081, Frontend: 3002, Database: 5433
- **Usage**: Optimized for testing, fast startup, in-memory optimizations
```bash
docker-compose -f docker-compose.test.yml up
```

### 🚀 Production Environment
- **File**: `docker-compose.production.yml`
- **Environment**: `.env.production`
- **Ports**: Backend: 8080, Frontend: 3000, Database: 5432
- **Usage**: Resource limits, logging, health checks, no auto-seeding
```bash
docker-compose -f docker-compose.production.yml up
```

### 📄 Default Environment
- **File**: `docker-compose.yml`
- **Environment**: `.env`
- **Ports**: Backend: 8080, Frontend: 3000, Database: 5432
- **Usage**: General development/local testing
```bash
docker-compose up
```

## Fixed Issues

### ✅ Proper Environment Variable Loading
- All services now properly load their respective `.env` files
- Environment variables are correctly interpolated with `${VAR:-default}` syntax
- Each environment is isolated and uses appropriate configurations

### ✅ Removed Staging Environment
- Deleted `docker-compose.staging.yml` and `.env.staging`
- Simplified to three main environments: development, test, production

### ✅ Created Test Environment
- New dedicated test environment with optimized settings
- Uses separate ports to avoid conflicts
- Includes performance optimizations for testing

### ✅ Cleaned Up Unnecessary Files
- Removed redundant `.env.local.example`
- Kept `.env.example` as template for new developers

## Environment File Structure

```
.env                    # Default environment (development-like)
.env.development       # Development with hot-reload
.env.test             # Testing optimized
.env.production       # Production ready
.env.example          # Template for new developers
```

## Environment Variable Priority (High to Low)
1. `environment:` section in docker-compose.yml
2. `env_file:` specified files  
3. Shell environment variables
4. Default values in `${VAR:-default}` syntax

## Key Features

### 🔄 Development Environment
- Hot-reload for both frontend and backend
- Auto-migration and seeding enabled
- Debug logging
- Relaxed security settings

### 🧪 Test Environment
- Fast database with tmpfs
- Scheduler and rate limiting disabled
- Mock payment provider
- Separate ports to run alongside development

### 🚀 Production Environment
- Resource limits and reservations
- Structured logging with rotation
- Health checks with appropriate timeouts
- Security-focused configuration
- No auto-seeding for data safety

## Usage Examples

### Start Development Environment
```bash
# Using helper script
.\scripts\start-dev.ps1

# Or manually with proper env file
docker-compose --env-file .env.development -f docker-compose.development.yml up -d

# View logs
docker-compose --env-file .env.development -f docker-compose.development.yml logs -f backend
```

### Run Tests
```bash
# Using helper script
.\scripts\start-test.ps1

# Or manually
docker-compose --env-file .env.test -f docker-compose.test.yml up -d

# Run tests against test environment
docker-compose --env-file .env.test -f docker-compose.test.yml exec backend-test go test ./...

# Cleanup
docker-compose --env-file .env.test -f docker-compose.test.yml down -v
```

### Deploy to Production
```bash
# Ensure production env file is configured
cp .env.example .env.production
# Edit .env.production with real values

# Using helper script
.\scripts\start-prod.ps1

# Or manually
docker-compose --env-file .env.production -f docker-compose.production.yml up -d

# Monitor
docker-compose --env-file .env.production -f docker-compose.production.yml logs -f
```

## Important: The --env-file Flag

**Critical:** Docker Compose variable substitution (`${VAR}`) does NOT read from `env_file:` directive!

You **MUST** use the `--env-file` flag to make variables available for substitution:

```bash
# ❌ WRONG - Variables won't substitute correctly
docker-compose -f docker-compose.production.yml up

# ✅ CORRECT - Variables available for substitution  
docker-compose --env-file .env.production -f docker-compose.production.yml up
```

### Why This Matters

- `env_file:` in compose file → Loads variables INTO the container
- `--env-file` flag → Makes variables available FOR substitution in the compose file itself

The postgres service needs `POSTGRES_DB`, `POSTGRES_USER`, etc. to be substituted in the compose file, so you MUST use `--env-file`.

## Configuration Validation

### Check Configuration
```bash
# Validate compose file syntax
docker-compose -f docker-compose.development.yml config

# Test environment variable loading
docker-compose -f docker-compose.development.yml config | grep -A 10 environment
```

### Debug Environment Variables
```bash
# Check what variables are loaded
docker-compose -f docker-compose.development.yml run --rm backend env | sort
```

## Security Best Practices

### 🔒 Production Environment
- Change all default passwords in `.env.production`
- Use strong JWT secrets
- Configure proper CORS origins
- Use SSL/TLS for database connections
- Set appropriate rate limits

### 🚫 Never Commit
Add to `.gitignore`:
```
.env.production
.env.local
*.local
```

### ✅ Always Commit
```
.env.example
.env.development
.env.test
```

## Troubleshooting

### Environment Variables Not Loading
1. Check file exists: `ls -la .env*`
2. Verify syntax: `docker-compose -f docker-compose.development.yml config`
3. Check file permissions: `chmod 644 .env.development`

### Port Conflicts
- Development: 8080, 3000, 5432
- Test: 8081, 3002, 5433  
- Production: 8080, 3000, 5432

### Service Connection Issues
- Ensure service names match between compose and env files
- Check network configuration
- Verify health checks are passing