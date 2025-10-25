# Etsy Access Token Management

## Overview

Il sistema gestisce automaticamente gli access token di Etsy utilizzando OAuth 2.0 con token refresh automatico.

## Come Funziona

### 🔑 Token Flow

```
1. Inizializzazione
   ├─ OAuth Manager creato con API Key/Secret
   ├─ Client Etsy collegato all'OAuth Manager
   └─ Tentativo di caricare token esistente dal database

2. Prima Richiesta API (senza token in DB)
   ├─ ensureValidToken() chiamato
   ├─ OAuth Manager cerca token in database
   ├─ ❌ Nessun token trovato
   └─ ⚠️  Errore: "no token found, please authenticate first"
   
3. Autenticazione OAuth
   ├─ Admin visita /api/admin/etsy/oauth/auth-url?shop_id=mrAnarchyStudioArt
   ├─ Redirect a Etsy per autorizzazione
   ├─ Etsy redirect a /callback con authorization code
   ├─ Backend scambia code per access_token + refresh_token
   ├─ Token salvati in database (tabella etsy_oauth_tokens)
   └─ ✅ Sistema autenticato

4. Richieste API Successive
   ├─ ensureValidToken() chiamato prima di ogni richiesta
   ├─ OAuth Manager verifica token in database
   ├─ Token valido? (expires_at > now + 5 minuti)
   │   ├─ ✅ Sì → Usa token esistente
   │   └─ ❌ No → Refresh automatico
   │       ├─ POST a Etsy con refresh_token
   │       ├─ Nuovo access_token ottenuto
   │       ├─ Token aggiornato in database
   │       └─ Client aggiornato con nuovo token
   └─ Richiesta API eseguita con token valido
```

### 📊 Database Storage

**Tabella: `etsy_oauth_tokens`**
```sql
CREATE TABLE etsy_oauth_tokens (
    id SERIAL PRIMARY KEY,
    shop_id VARCHAR(255) UNIQUE NOT NULL,  -- "mrAnarchyStudioArt"
    access_token TEXT NOT NULL,             -- Token corrente
    refresh_token TEXT NOT NULL,            -- Per refresh automatico
    token_type VARCHAR(50) DEFAULT 'Bearer',
    expires_at TIMESTAMP NOT NULL,          -- Scadenza token
    scope TEXT,                             -- Permessi OAuth
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### ⚙️ Automatic Token Refresh

Il sistema refresha automaticamente il token quando:
- Il token è scaduto (expires_at < now)
- Il token scadrà entro 5 minuti (buffer di sicurezza)

**Logica di Refresh:**
```go
// backend/services/etsy/oauth.go
func (m *OAuthManager) GetValidToken(shopID string) (*OAuthToken, error) {
    // 1. Carica token dal database
    token := loadFromDatabase(shopID)
    
    // 2. Verifica scadenza con buffer di 5 minuti
    if token.IsExpired() {  // expires_at < now + 5min
        // 3. Refresh automatico
        newToken := refreshToken(token.RefreshToken, shopID)
        
        // 4. Salva nuovo token in database
        saveToDatabase(newToken)
        
        return newToken
    }
    
    return token
}
```

### 🔄 Client Integration

Il Client Etsy chiama `ensureValidToken()` prima di ogni richiesta API:

```go
// backend/services/etsy/client.go
func (c *Client) executeRequest(method, path string, body, result interface{}) error {
    // 1. Verifica e refresh token automatico
    if err := c.ensureValidToken(); err != nil {
        return err
    }
    
    // 2. Costruisci richiesta HTTP
    req := buildRequest(method, path, body)
    
    // 3. Aggiungi Authorization header con token fresco
    req.Header.Set("Authorization", "Bearer " + c.accessToken)
    
    // 4. Esegui richiesta
    return executeHTTPRequest(req, result)
}
```

## Configurazione

### Environment Variables

**Necessarie per OAuth:**
```bash
# Credenziali app Etsy
ETSY_API_KEY=kftb0shwfjdguunnjuaeugfb
ETSY_API_SECRET=p3dxkfk2yg
ETSY_SHOP_ID=mrAnarchyStudioArt

# OAuth configuration
ETSY_REDIRECT_URI=http://localhost:3000/admin/etsy-sync/callback
ETSY_SYNC_ENABLED=true
```

**Non più necessaria (gestita da OAuth):**
```bash
# ❌ DEPRECATO - Non serve più con OAuth
ETSY_ACCESS_TOKEN=  # Lascia vuoto
```

### IsEtsyEnabled Check

```go
// backend/config/config.go
func (c *Config) IsEtsyEnabled() bool {
    return c.Etsy.APIKey != "" &&
           c.Etsy.APISecret != "" &&  // Necessario per OAuth
           c.Etsy.ShopID != "" &&
           c.Etsy.SyncEnabled
    // ❌ AccessToken NON più richiesto
}
```

## API Endpoints

### 1. Get Authorization URL
```http
GET /api/admin/etsy/oauth/auth-url?shop_id=mrAnarchyStudioArt
Authorization: Bearer <admin_jwt>

Response:
{
  "auth_url": "https://www.etsy.com/oauth/connect?...",
  "state": "csrf-protection-uuid",
  "shop_id": "mrAnarchyStudioArt"
}
```

### 2. OAuth Callback (automatico)
```http
GET /api/admin/etsy/oauth/callback?code=xxx&state=xxx&shop_id=xxx

Comportamento:
1. Scambia code per tokens
2. Salva tokens in database
3. Redirect a /admin/etsy-sync?auth=success
```

### 3. Check Token Status
```http
GET /api/admin/etsy/oauth/status?shop_id=mrAnarchyStudioArt
Authorization: Bearer <admin_jwt>

Response:
{
  "authenticated": true,
  "expires_at": "2025-10-26T15:30:00Z",
  "is_expired": false,
  "scope": "listings_r listings_w shops_r transactions_r feedback_r"
}
```

### 4. Manual Token Refresh
```http
POST /api/admin/etsy/oauth/refresh?shop_id=mrAnarchyStudioArt
Authorization: Bearer <admin_jwt>

Response:
{
  "message": "Token refreshed successfully",
  "expires_at": "2025-10-26T16:30:00Z"
}
```

### 5. Revoke Token
```http
DELETE /api/admin/etsy/oauth/revoke?shop_id=mrAnarchyStudioArt
Authorization: Bearer <admin_jwt>

Response:
{
  "message": "Token revoked successfully"
}
```

## Token Lifecycle

### Initial Setup (Prima volta)

```bash
# 1. Registra redirect URIs su Etsy Developer Portal
https://www.etsy.com/developers/your-apps
→ Add Redirect URI: http://localhost:3000/admin/etsy-sync/callback

# 2. Avvia backend
docker-compose up -d

# 3. Verifica logs
docker-compose logs backend | grep -i etsy
# Output: "Etsy integration enabled (including payment and OAuth)"
# Output: "Warning: Could not refresh OAuth token on startup"
# Output: "Please complete OAuth flow at /api/admin/etsy/oauth/auth-url"

# 4. Ottieni URL di autorizzazione
curl -H "Authorization: Bearer <admin_jwt>" \
  "http://localhost:8080/api/admin/etsy/oauth/auth-url?shop_id=mrAnarchyStudioArt"

# 5. Visita auth_url nel browser
# Etsy ti chiede di autorizzare l'app

# 6. Dopo autorizzazione, Etsy ti reindirizza a callback
# Backend automaticamente:
#   - Scambia authorization code per tokens
#   - Salva tokens in database
#   - Redirect a dashboard con successo

# 7. Verifica token salvato
curl -H "Authorization: Bearer <admin_jwt>" \
  "http://localhost:8080/api/admin/etsy/oauth/status?shop_id=mrAnarchyStudioArt"

# 8. Ora tutte le API calls funzionano automaticamente!
```

### Uso Normale (dopo setup)

```bash
# Backend all'avvio:
docker-compose up -d

# Output logs:
# "OAuth token loaded successfully from database"
# "Etsy integration enabled (including payment and OAuth)"

# Ogni chiamata API:
1. ensureValidToken() verifica scadenza
2. Se necessario, refresh automatico
3. Richiesta eseguita con token valido

# Nessun intervento manuale necessario! ✅
```

## Token Expiration

### Etsy Token Lifetimes

- **Access Token**: 3600 secondi (1 ora)
- **Refresh Token**: Non scade (a meno che non venga revocato)

### Refresh Buffer

Il sistema usa un buffer di **5 minuti** per prevenire race conditions:

```go
func (t *OAuthToken) IsExpired() bool {
    // Token considerato scaduto se:
    // current_time + 5_minutes > expires_at
    return time.Now().Add(5 * time.Minute).After(t.ExpiresAt)
}
```

**Esempio Timeline:**
```
10:00 - Token ottenuto (expires_at = 11:00)
10:54 - Token ancora valido
10:55 - IsExpired() = true (buffer di 5 min)
       - Refresh automatico iniziato
10:55 - Nuovo token ottenuto (expires_at = 11:55)
11:00 - Vecchio token scaduto, ma già sostituito!
```

## Error Handling

### Possibili Errori

1. **No Token Found**
   ```
   Error: "no token found, please authenticate first"
   Soluzione: Completa OAuth flow
   ```

2. **Token Refresh Failed**
   ```
   Error: "failed to refresh expired token"
   Cause possibili:
   - Refresh token revocato su Etsy
   - Credenziali API errate
   - Network error
   Soluzione: Re-authenticate via OAuth flow
   ```

3. **Invalid Credentials**
   ```
   Error: "unauthorized_client"
   Soluzione: Verifica ETSY_API_KEY e ETSY_API_SECRET
   ```

4. **Rate Limit Exceeded**
   ```
   Error: "429 Too Many Requests"
   Gestione: Client ha retry logic automatico
   ```

## Testing

### Test Token Lifecycle

```bash
# 1. Check iniziale (dovrebbe fallire)
curl "http://localhost:8080/api/admin/etsy/oauth/status?shop_id=mrAnarchyStudioArt"

# 2. Complete OAuth flow
# (visita auth_url, autorizza, callback automatico)

# 3. Verifica token salvato
curl "http://localhost:8080/api/admin/etsy/oauth/status?shop_id=mrAnarchyStudioArt"
# Response: authenticated=true

# 4. Simula scadenza token (modifica database)
docker exec -it art-postgres psql -U artuser -d artmanagement
UPDATE etsy_oauth_tokens 
SET expires_at = NOW() 
WHERE shop_id = 'mrAnarchyStudioArt';
\q

# 5. Prossima API call trigghera refresh automatico
# (guarda i logs per vedere il refresh in azione)
docker-compose logs -f backend

# 6. Verifica nuovo token
curl "http://localhost:8080/api/admin/etsy/oauth/status?shop_id=mrAnarchyStudioArt"
# expires_at dovrebbe essere aggiornato (+1 ora)
```

## Migration from Static Token

Se hai un `ETSY_ACCESS_TOKEN` statico nel `.env`:

### Before (Static Token)
```bash
ETSY_ACCESS_TOKEN=abc123...xyz  # Scade ogni ora, va aggiornato manualmente
```

### After (OAuth)
```bash
ETSY_ACCESS_TOKEN=  # Vuoto! Non più necessario
# Token gestito automaticamente da database + OAuth manager
```

**Migration Steps:**
1. Rimuovi `ETSY_ACCESS_TOKEN` dal `.env` (o lascialo vuoto)
2. Restart backend
3. Completa OAuth flow (una volta)
4. ✅ Sistema completamente automatico!

## Security Considerations

### Token Storage
- ✅ Tokens salvati in database PostgreSQL
- ✅ Access token e refresh token separati
- ✅ Automatic expiration checking
- ✅ HTTPS required in production

### Token Rotation
- ✅ Access token refreshed ogni ora
- ✅ Refresh token conservato per future refresh
- ✅ Vecchi token invalidati dopo refresh

### Access Control
- ✅ OAuth endpoints protetti da middleware admin
- ✅ Shop ID validation
- ✅ State parameter per CSRF protection (basic)

## Troubleshooting

### "Warning: Could not refresh OAuth token on startup"
**Causa**: Nessun token in database (prima volta)  
**Soluzione**: Normale! Completa OAuth flow

### "failed to get valid token: no token found"
**Causa**: OAuth flow non ancora completato  
**Soluzione**: Visita `/api/admin/etsy/oauth/auth-url`

### "token refresh failed with status 400"
**Causa**: Refresh token invalido o revocato  
**Soluzione**: Re-authenticate (OAuth flow completo)

### API calls failing with 401
**Causa**: Token non valido o scaduto  
**Soluzione**: Verifica token status, potrebbe servire re-auth

## References

- [Etsy OAuth Documentation](https://developers.etsy.com/documentation/essentials/authentication/)
- [Etsy API Reference](https://developers.etsy.com/documentation/reference/)
- [OAuth 2.0 RFC](https://oauth.net/2/)
