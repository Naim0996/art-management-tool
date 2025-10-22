# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-10-22

### Added - Etsy API Integration Infrastructure

#### Database Layer
- **Added** 3 new migration files for Etsy synchronization tracking
  - `010_create_etsy_sync_config` - Sync state and rate limit tracking
  - `011_create_etsy_products` - Etsy listings to local products mapping
  - `012_create_etsy_inventory_sync` - Inventory synchronization log
- **Added** Etsy domain models in `backend/models/etsy.go`

#### Backend Services
- **Added** `services/etsy/` - Etsy API client and business logic service
  - Client with rate limit tracking
  - Service for product and inventory synchronization
  - Stub implementation ready for API integration
- **Added** `services/ratelimit/` - Token bucket rate limiter
  - Complies with Etsy API limits (10,000 requests/24 hours)
  - Manager for multiple rate limiters by key
- **Added** `services/scheduler/` - Background job scheduler
  - Configurable intervals for automatic synchronization
  - Job enable/disable functionality
  - Status monitoring
- **Added** `backend/config/` - Configuration loader for environment variables
  - Type-safe configuration structures
  - Environment-aware defaults

#### Configuration Files
- **Added** `.env.example` - Template with all Etsy configuration options
- **Added** `.env.staging` - Staging environment configuration template
- **Added** `.env.production` - Production environment configuration template
- **Added** `docker-compose.staging.yml` - Dedicated staging environment setup
- **Updated** `docker-compose.yml` with Etsy environment variables

#### Documentation
- **Added** `docs/ETSY_INTEGRATION.md` (12KB) - Comprehensive integration guide
  - Security requirements and best practices
  - Environment configuration for dev/staging/prod
  - Database schema documentation
  - Rate limiting implementation guide
  - Scheduled job configuration
  - Testing and troubleshooting guides
- **Added** `docs/SECURITY_INFRASTRUCTURE.md` (11KB) - Security guide
  - Credential management strategies
  - Environment isolation best practices
  - API security (HTTPS, OAuth, request signing)
  - Rate limiting best practices
  - Data protection (encryption at rest/in transit)
  - Monitoring and auditing
  - Incident response procedures
- **Updated** `README.md` with Etsy integration references
- **Updated** `infrastructure/README.md` with Etsy configuration step

#### Developer Tools
- **Added** `scripts/setup-etsy.sh` - Interactive setup script
  - Credential configuration wizard
  - Migration verification
  - Docker service management
  - Next steps guidance

### Security
- ✅ Environment variables for credential storage (never in code)
- ✅ Separate configurations for development/staging/production
- ✅ Rate limiting to comply with Etsy API limits
- ✅ HTTPS-only communication
- ✅ Secure token management with expiration tracking
- ✅ Comprehensive security documentation

## [Unreleased] - 2025-10-18

### Changed - Project Restructuring

#### Documentation Organization
- **Moved** all technical documentation to `docs/` folder with organized structure:
  - `docs/` - Main documentation (ARCHITECTURE.md, CONTRIBUTING.md)
  - `docs/guides/` - User and deployment guides (DEPLOYMENT.md, DOCKER.md, TESTING_GUIDE.md, INTEGRATION_SUMMARY.md)
  - `docs/api/` - API documentation (SHOP_API.md)
  - `docs/troubleshooting/` - Troubleshooting guides (CART_TROUBLESHOOTING.md, PROXY_SOLUTION.md)

- **Consolidated** multiple cart debug files into single comprehensive guide:
  - Removed: `CART_DEBUGGING_GUIDE.md`, `CART_FIX.md`, `CART_FIXES.md`, `CART_FRONTEND_FIXES.md`, `CART_REALTIME_DEBUG.md`
  - Created: `docs/troubleshooting/CART_TROUBLESHOOTING.md` (consolidated all cart-related debugging info)

- **Removed** temporary documentation files:
  - `API_DEBUG_GUIDE.md` (integrated into troubleshooting)
  - `README_UPDATES.md` (obsolete)

#### Code Cleanup
- **Removed** test and debug pages from frontend (not suitable for production):
  - `frontend/app/[locale]/cart-test/` - Test page for cart functionality
  - `frontend/app/[locale]/cart-debug/` - Debug page for cart issues
  - `frontend/app/[locale]/api-test/` - API testing page
  - `frontend/app/[locale]/primereact-demo/` - PrimeReact demo page
  - `frontend/app/[locale]/cart-simple-test/` - Simple cart test page

- **Moved** `backup.sql` to `docs/troubleshooting/` (not in root directory)

#### Code Quality Improvements
- **Fixed** all ESLint errors (3 errors → 0 errors)
  - Replaced `any` types with proper type checking in `PersonaggiAPIService.ts`
  - Fixed Next.js 15 API route handlers to handle Promise-based params
  - Removed unused error variables in catch blocks
  
- **Fixed** React Hook dependencies (10 warnings → 2 warnings)
  - Used `useCallback` pattern for fetch functions
  - Properly included all dependencies in useEffect hooks
  - Files affected: notifications, shop-orders, shop-products, shop pages
  
- **Removed** unused variables and imports
  - Removed `ENABLE_OPTIMISTIC_UPDATES` unused constant
  - Cleaned up unused error catches

- **Build Status**: ✅ Both frontend and backend build successfully
  - Frontend: Type checking passed, linting passed (2 minor img warnings)
  - Backend: Compilation successful, no errors

#### Files Refactored (Planned)
The following files exceed 300 lines and are planned for refactoring:
- `frontend/app/[locale]/admin/shop-products/page.tsx` (650 lines)
- `frontend/app/[locale]/admin/personaggi/page-new.tsx` (625 lines)
- `frontend/app/[locale]/cart/page.tsx` (577 lines)
- `frontend/app/[locale]/admin/personaggi/page.tsx` (554 lines)
- `frontend/app/[locale]/admin/shop-orders/page.tsx` (457 lines)
- `frontend/services/AdminShopAPIService.ts` (432 lines)
- `frontend/services/ShopAPIService.ts` (417 lines)
- `frontend/app/[locale]/admin/page.tsx` (357 lines)
- `frontend/app/[locale]/admin/products/page.tsx` (336 lines)
- `frontend/app/[locale]/admin/notifications/page.tsx` (320 lines)

### Migration Guide

#### For Developers

**Documentation References:**
If you had bookmarks or references to old documentation files, update them:
- `ARCHITECTURE.md` → `docs/ARCHITECTURE.md`
- `DEPLOYMENT.md` → `docs/guides/DEPLOYMENT.md`
- `DOCKER.md` → `docs/guides/DOCKER.md`
- `SHOP_API.md` → `docs/api/SHOP_API.md`
- `CONTRIBUTING.md` → `docs/CONTRIBUTING.md`
- Cart debugging → `docs/troubleshooting/CART_TROUBLESHOOTING.md`

**Removed Pages:**
The following development/test pages have been removed. If you were using them:
- Use proper testing frameworks instead (Jest, Cypress, Playwright)
- Cart debugging: Use browser DevTools and refer to `docs/troubleshooting/CART_TROUBLESHOOTING.md`
- API testing: Use tools like Postman, Insomnia, or `curl`
- PrimeReact demos: Refer to official PrimeReact documentation

**No Breaking Changes:**
- All production code remains functional
- API endpoints unchanged
- Component APIs unchanged
- Only development/debug utilities removed

#### For Users

No changes affect end users. This is an internal refactoring for code quality and maintainability.

### Rationale

**Why Reorganize Documentation?**
- Improved discoverability (clear folder structure)
- Reduced root directory clutter (from 16 to 2 markdown files)
- Logical grouping by purpose (guides, API, troubleshooting)
- Easier maintenance and updates

**Why Remove Test Pages?**
- Not suitable for production builds
- Increased build times unnecessarily
- Potential security concerns (exposed debug info)
- Better alternatives exist (proper testing frameworks)

**Why Consolidate Cart Docs?**
- 5 separate files covered similar content
- Single source of truth easier to maintain
- Reduced documentation redundancy
- Better organization of solutions

### Next Steps

1. **Code Refactoring**: Break down large files (>300 lines) into smaller, maintainable modules
2. **Setup Scripts**: Add `setup.sh` for easy project initialization
3. **Linting**: Fix all ESLint warnings and errors
4. **Testing**: Ensure all builds pass after refactoring
5. **Best Practices**: Apply SOLID principles, improve error handling, add structured logging
