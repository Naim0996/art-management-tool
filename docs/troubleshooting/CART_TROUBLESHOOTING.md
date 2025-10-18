# 🛒 Shopping Cart Troubleshooting Guide

This guide consolidates all cart-related debugging information and solutions.

## Common Issues and Solutions

### Issue 1: Products Not Showing in Cart

**Problem:** Products added to cart weren't displayed because:
1. Each request generated a new `session_token` instead of reusing the existing one
2. The `cart_session` cookie wasn't passed correctly between frontend and backend
3. CORS misconfigured: `Access-Control-Allow-Origin: *` incompatible with `credentials: true`

**Solution:**
- Backend CORS configured for specific origins (`http://localhost:3000`, `http://localhost:3001`)
- Frontend makes direct backend calls instead of proxy
- Cookie configuration: `SameSite=Lax`, `HttpOnly=true`, 7-day expiration

**Files Changed:**
- `backend/main.go` - CORS configuration
- `frontend/services/ShopAPIService.ts` - Direct API calls
- `backend/handlers/shop/cart.go` - Cookie settings

### Issue 2: Session Token Management

**Problem:** New session tokens created on every request

**Solution:** Backend checks for existing `cart_session` cookie before creating new session:
```go
sessionToken := r.Cookie("cart_session")
if sessionToken == nil {
    sessionToken = generateNewSession()
}
```

### Issue 3: Real-time Cart Updates

**Debugging Steps:**
1. Check browser DevTools → Network → Response Headers for `Set-Cookie`
2. Verify `cart_session` cookie in Application → Cookies
3. Check API requests include `Cookie` header with session token
4. Verify CORS headers: `Access-Control-Allow-Origin` should match request origin
5. Confirm `Access-Control-Allow-Credentials: true` is present

**Common Pitfalls:**
- Using `*` for Allow-Origin with credentials
- Missing `credentials: 'include'` in fetch requests
- Incorrect cookie path or domain
- SameSite=Strict blocking cross-origin requests

### Issue 4: Frontend-Backend Integration

**Proxy Solution (Not Recommended):**
Next.js rewrites don't forward `Set-Cookie` headers properly.

**Direct Connection (Recommended):**
- Set `NEXT_PUBLIC_API_URL=http://localhost:8080` in `.env.local`
- Use direct API calls with `credentials: 'include'`
- Configure CORS on backend for specific origins

### Debugging Commands

**Check Cart Session:**
```bash
# Using curl
curl -v http://localhost:8080/api/shop/cart \
  -H "Cookie: cart_session=YOUR_SESSION_TOKEN"

# Check headers
curl -I http://localhost:8080/api/shop/cart
```

**View Browser Cookies:**
```javascript
// In browser console
document.cookie
```

**Monitor API Calls:**
```javascript
// In browser console - log all fetch requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch:', args);
  return originalFetch.apply(this, args);
};
```

## Best Practices

1. **Always use HTTPS in production** - `Secure` cookie flag
2. **Set appropriate cookie expiration** - Balance UX and security
3. **Use `HttpOnly` cookies** - Prevent XSS attacks
4. **Configure CORS properly** - Specific origins, not wildcards
5. **Handle session expiration** - Graceful degradation
6. **Log cart operations** - Aid debugging in production

## Related Documentation

- [API Documentation](../api/SHOP_API.md)
- [Architecture Overview](../ARCHITECTURE.md)
- [Deployment Guide](../guides/DEPLOYMENT.md)

## Migration Notes

If upgrading from proxy-based to direct API approach:
1. Update `NEXT_PUBLIC_API_URL` in environment variables
2. Remove Next.js rewrites configuration
3. Update CORS allowed origins on backend
4. Clear browser cookies and test fresh session
5. Verify all API service methods include `credentials: 'include'`
