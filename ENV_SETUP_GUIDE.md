# Environment Configuration Quick Reference

## ✅ Changes Summary

All environment variables are now centrally managed in the root directory with environment-specific files.

## File Structure

```
✅ Root directory .env files (centralized)
├── .env                    → Base configuration
├── .env.development        → Development environment
└── .env.production         → Production environment

❌ Removed files (no longer needed)
└── backend/.env            → Deleted (use root .env files)
```

## Quick Start Commands

### Development Environment
```bash
# Start development (uses .env.development)
docker-compose -f docker-compose.development.yml up

# Rebuild if env vars changed
docker-compose -f docker-compose.development.yml up --build
```

### Production Environment
```bash
# Start production (uses .env.production)
docker-compose -f docker-compose.production.yml up

# Rebuild if env vars changed
docker-compose -f docker-compose.production.yml up --build
```

### Base Environment
```bash
# Start base (uses .env)
docker-compose up
```

## Environment Variable Flow

```
┌─────────────────────────────────────────────────────┐
│ Root Directory (.env files)                         │
│                                                      │
│  .env.development  OR  .env.production  OR  .env    │
└──────────────┬──────────────────────────────────────┘
               │
               │ docker-compose reads env_file
               ↓
┌─────────────────────────────────────────────────────┐
│ Docker Compose (environment section)                │
│                                                      │
│  Passes variables to containers                     │
└──────────┬─────────────────────────────┬────────────┘
           │                             │
           ↓                             ↓
   ┌──────────────┐           ┌──────────────────┐
   │   Backend    │           │    Frontend      │
   │   (Go app)   │           │   (Next.js)      │
   │              │           │                  │
   │ - DB_HOST    │           │ - BACKEND_URL    │
   │ - DB_USER    │           │ - NEXT_PUBLIC_*  │
   │ - JWT_SECRET │           │ - NODE_ENV       │
   │ - etc...     │           │                  │
   └──────────────┘           └──────────────────┘
```

## Key Points

### ✅ DO

1. **Edit root .env files** for configuration changes
2. **Use Docker service names** (e.g., `DB_HOST=postgres`)
3. **Rebuild containers** after env changes
4. **Keep .env.production secure** (never commit secrets)

### ❌ DON'T

1. **Don't create backend/.env or frontend/.env.local**
2. **Don't use localhost** for Docker service connections
3. **Don't commit .env.* files** to git
4. **Don't expose secrets** in NEXT_PUBLIC_* variables

## Variable Inheritance

Each Docker Compose file overrides `DB_HOST` to use Docker service names:

```yaml
# All compose files do this:
environment:
  - DB_HOST=postgres        # Override to use Docker service
  - DB_PORT=${DB_PORT}      # Use value from .env file
```

## Frontend Variables Explained

### NEXT_PUBLIC_API_URL
- **Development**: Empty string (`""`)
  - Uses Next.js rewrites to proxy to backend
  - Browser calls `/api/*` → Next.js proxies to `http://backend:8080/api/*`
  
- **Production**: Public API URL (`https://api.yourdomain.com`)
  - Browser calls API directly
  - No proxying needed

### BACKEND_URL
- **All environments**: `http://backend:8080`
  - Used by Next.js server-side for rewrites
  - Internal Docker network communication
  - Never exposed to browser

## Testing Your Setup

```bash
# 1. Check environment files exist
ls -la .env*
# Should show: .env, .env.development, .env.production

# 2. Start development environment
docker-compose -f docker-compose.development.yml up

# 3. Verify backend can connect to database
# Look for: "Database initialized successfully"

# 4. Verify frontend can proxy to backend
# Visit: http://localhost:3000/api/health
# Should return: {"status":"healthy"}
```

## Common Issues & Solutions

### Issue: Variables not updating
**Solution**: Rebuild containers
```bash
docker-compose -f docker-compose.development.yml down
docker-compose -f docker-compose.development.yml up --build
```

### Issue: Database connection refused
**Solution**: Check DB_HOST is set to `postgres` (not localhost)
```bash
# In docker-compose files, verify:
environment:
  - DB_HOST=postgres
```

### Issue: Frontend 404 on API calls
**Solution**: Check Next.js rewrites configuration
```bash
# In next.config.ts, verify:
const backendUrl = process.env.BACKEND_URL || 'http://backend:8080';
```

## Documentation

For detailed information, see:
- **[docs/ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)** - Complete guide
- **[docs/README.md](./README.md)** - Main documentation hub
- **[docs/api/README.md](./api/README.md)** - API documentation

## Security Checklist (Production)

Before deploying to production:

- [ ] Update JWT_SECRET in .env.production
- [ ] Update DB_PASSWORD in .env.production
- [ ] Set DB_SSLMODE=require
- [ ] Configure real Stripe API keys
- [ ] Set correct CORS_ALLOWED_ORIGINS
- [ ] Set NEXT_PUBLIC_API_URL to production domain
- [ ] Verify .env.production is in .gitignore
- [ ] Test all API endpoints work
- [ ] Verify database migrations run
- [ ] Check logs for any errors

## Need Help?

1. **Check logs**: `docker-compose logs backend` or `docker-compose logs frontend`
2. **Review docs**: See `docs/ENVIRONMENT_VARIABLES.md`
3. **Verify setup**: Use commands in "Testing Your Setup" section above
