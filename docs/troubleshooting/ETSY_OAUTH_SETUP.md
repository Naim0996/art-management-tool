# Etsy OAuth Integration Setup Guide

This guide will help you complete the Etsy OAuth integration for your art management tool.

## Etsy API Documentation

- **Official API Reference**: https://developers.etsy.com/documentation/reference/
- **OAuth 2.0 Guide**: https://developers.etsy.com/documentation/essentials/authentication/
- **App Management**: https://www.etsy.com/developers/your-apps

## Prerequisites

1. An Etsy Developer Account
2. An Etsy App registered at https://www.etsy.com/developers/your-apps
3. Your Etsy Shop ID: `mrAnarchyStudioArt`

### Your Etsy App Credentials

```
App Name: art-management-tool
Keystring (API Key): kftb0shwfjdguunnjuaeugfb
Shared Secret: p3dxkfk2yg
```

## Step 1: Configure Etsy App Settings

1. Go to https://www.etsy.com/developers/your-apps
2. Select your app (or create a new one)
3. Add the following **Redirect URIs** in your app settings:
   - Development: `http://localhost:3000/admin/etsy-sync/callback`
   - Production: `https://yourdomain.com/admin/etsy-sync/callback`
4. Note down your **API Key (Keystring)** and **Shared Secret**

## Step 2: Configure Environment Variables

The environment variables are already configured in all stages with your credentials:

### Development (`.env` and `.env.development`)
```bash
# Etsy OAuth Credentials
ETSY_API_KEY=kftb0shwfjdguunnjuaeugfb
ETSY_API_SECRET=p3dxkfk2yg
ETSY_SHOP_ID=mrAnarchyStudioArt
ETSY_SHOP_NAME=mrAnarchyStudioArt
ETSY_SHOP_URL=https://www.etsy.com/shop/mrAnarchyStudioArt

# OAuth Redirect URI (must match the one registered in your Etsy app)
ETSY_REDIRECT_URI=http://localhost:3000/admin/etsy-sync/callback

# Enable Etsy sync
ETSY_SYNC_ENABLED=true
```

### Test (`.env.test`)
```bash
# Same credentials but sync disabled for testing
ETSY_SYNC_ENABLED=false
ETSY_REDIRECT_URI=http://localhost:3001/admin/etsy-sync/callback
```

### Production (`.env.production`)
```bash
# Same credentials with production redirect URI
ETSY_REDIRECT_URI=https://yourdomain.com/admin/etsy-sync/callback
ETSY_SYNC_ENABLED=true
```

**Note**: All `.env` files are already configured. You just need to:
1. Verify the redirect URIs are registered in your Etsy app
2. Update the production redirect URI when you have your domain

## Step 3: Database Migration

The OAuth token table will be automatically created when you restart the backend:

```bash
# Stop containers if running
docker-compose down

# Start services (backend will run migrations)
docker-compose up -d
```

## Step 4: OAuth Authentication Flow

### Backend Endpoints

The following OAuth endpoints are available:

1. **Get Authorization URL** (Start OAuth flow)
   ```
   GET /api/admin/etsy/oauth/auth-url?shop_id=mrAnarchyStudioArt
   ```
   Response:
   ```json
   {
     "auth_url": "https://www.etsy.com/oauth/connect?...",
     "state": "random-uuid",
     "shop_id": "mrAnarchyStudioArt",
     "message": "Redirect user to this URL to authorize"
   }
   ```

2. **OAuth Callback** (Etsy redirects here after user authorization)
   ```
   GET /api/admin/etsy/oauth/callback?code=xxx&state=xxx&shop_id=xxx
   ```
   This endpoint exchanges the authorization code for access and refresh tokens.

3. **Token Status** (Check if authenticated)
   ```
   GET /api/admin/etsy/oauth/status?shop_id=mrAnarchyStudioArt
   ```
   Response:
   ```json
   {
     "authenticated": true,
     "expires_at": "2024-01-20T15:30:00Z",
     "is_expired": false,
     "scope": "listings_r listings_w shops_r transactions_r feedback_r"
   }
   ```

4. **Refresh Token** (Manually refresh access token)
   ```
   POST /api/admin/etsy/oauth/refresh?shop_id=mrAnarchyStudioArt
   ```

5. **Revoke Token** (Remove stored token)
   ```
   DELETE /api/admin/etsy/oauth/revoke?shop_id=mrAnarchyStudioArt
   ```

### OAuth Scopes

The integration requests the following permissions:
- `listings_r` - Read shop listings
- `listings_w` - Write/update listings
- `shops_r` - Read shop information
- `transactions_r` - Read transactions/orders
- `feedback_r` - Read feedback

## Step 5: Frontend Implementation (TODO)

You'll need to create a frontend interface for the OAuth flow:

1. **Authentication Button** in `/admin/etsy-sync` page:
   ```typescript
   const handleAuthenticate = async () => {
     const response = await fetch('/api/admin/etsy/oauth/auth-url?shop_id=mrAnarchyStudioArt');
     const data = await response.json();
     // Redirect user to Etsy authorization page
     window.location.href = data.auth_url;
   };
   ```

2. **Callback Page** at `/admin/etsy-sync/callback`:
   - Receives the authorization code from Etsy
   - Calls backend `/api/admin/etsy/oauth/callback` endpoint
   - Redirects back to `/admin/etsy-sync` with success message

3. **Token Status Display**:
   ```typescript
   const checkAuthStatus = async () => {
     const response = await fetch('/api/admin/etsy/oauth/status?shop_id=mrAnarchyStudioArt');
     const data = await response.json();
     setIsAuthenticated(data.authenticated);
   };
   ```

## Step 6: Automatic Token Refresh

The OAuth manager automatically handles token refresh:

```go
// In your service methods, use GetValidToken which auto-refreshes if needed
token, err := oauthManager.GetValidToken("mrAnarchyStudioArt")
if err != nil {
    return err
}
// Use token.AccessToken for API calls
```

Tokens are refreshed automatically when:
- They are expired
- They will expire in less than 5 minutes

## Token Storage

OAuth tokens are stored in the `etsy_oauth_tokens` table with the following schema:

```sql
CREATE TABLE etsy_oauth_tokens (
    id SERIAL PRIMARY KEY,
    shop_id VARCHAR(255) UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_type VARCHAR(50) DEFAULT 'Bearer',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Testing the Integration

1. Start the backend and frontend:
   ```bash
   docker-compose up -d
   ```

2. Check backend logs for OAuth manager initialization:
   ```bash
   docker-compose logs backend | grep -i etsy
   ```
   You should see: `Etsy integration enabled (including payment and OAuth)`

3. Test the auth URL endpoint:
   ```bash
   curl "http://localhost:8080/api/admin/etsy/oauth/auth-url?shop_id=mrAnarchyStudioArt"
   ```

4. Visit the returned `auth_url` in your browser
5. Authorize the app on Etsy
6. You'll be redirected back to your callback URL with tokens stored in the database

## Troubleshooting

### "Redirect URI mismatch" error
- Ensure the `ETSY_REDIRECT_URI` in `.env` matches exactly what's registered in your Etsy app settings
- Include the protocol (`http://` or `https://`)

### "Invalid client credentials" error
- Double-check your `ETSY_API_KEY` and `ETSY_API_SECRET`
- Make sure there are no extra spaces or quotes

### "Token not found" error
- Complete the OAuth flow first by visiting the authorization URL
- Check the `etsy_oauth_tokens` table to verify token storage

### Database connection issues
- Ensure PostgreSQL is running: `docker-compose ps`
- Check migrations ran successfully: `docker-compose logs backend | grep migration`

## Next Steps

After completing OAuth setup:

1. Create frontend UI for OAuth flow
2. Implement product fetching using authenticated API calls
3. Set up automatic sync scheduler
4. Add webhook handlers for real-time updates from Etsy

## API Rate Limits

Etsy API v3 rate limits:
- 10,000 requests per 24 hours per OAuth app
- Tracked automatically by the OAuth manager

## Security Notes

- Never commit `.env` file to version control
- Store tokens securely in the database
- Use HTTPS in production
- Implement CSRF protection for OAuth state parameter (currently basic)
- Consider adding session management for state validation
