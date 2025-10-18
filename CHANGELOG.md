# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
