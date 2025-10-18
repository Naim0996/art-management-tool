# 🛒 Fix Carrello - Cookie Session Management

## Problema
I prodotti aggiunti al carrello non venivano visualizzati perché:
1. Ogni richiesta generava un nuovo `session_token` invece di riutilizzare quello esistente
2. Il cookie `cart_session` non veniva passato correttamente tra frontend e backend
3. CORS configurato male: `Access-Control-Allow-Origin: *` incompatibile con `credentials: true`

## Soluzione Implementata

### ✅ Backend - CORS Fix
**File: `backend/main.go`**
- ❌ Rimosso: `Access-Control-Allow-Origin: *` (non funziona con credentials)
- ✅ Aggiunto: Origin specifico `http://localhost:3001` e `http://localhost:3000`
- ✅ Manteniamo: `Access-Control-Allow-Credentials: true` (necessario per cookies)

```go
// Ora il backend accetta solo origin specifici quando usa credentials
if origin == "http://localhost:3001" || origin == "http://localhost:3000" {
    w.Header().Set("Access-Control-Allow-Origin", origin)
    w.Header().Set("Access-Control-Allow-Credentials", "true")
}
```

### ✅ Frontend - Direct Backend Calls
**File: `frontend/services/ShopAPIService.ts`**
- ❌ Rimosso: Proxy tramite Next.js rewrites (non passa cookies Set-Cookie)
- ✅ Aggiunto: Chiamate dirette al backend `http://localhost:8080`

**File: `frontend/.env.local`**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**File: `frontend/next.config.ts`**
- ❌ Rimosso: rewrites per proxy API (non servono più)
- Configurazione pulita e minimale

### ✅ Cookie Configuration
**File: `backend/handlers/shop/cart.go`**

Il cookie `cart_session` è configurato correttamente:
```go
cookie := &http.Cookie{
    Name:     "cart_session",
    Value:    sessionToken,
    Path:     "/",
    MaxAge:   86400 * 7,  // 7 giorni
    HttpOnly: true,       // Sicurezza
    SameSite: http.SameSiteLaxMode,  // CORS-friendly
    // NO Domain - automatico per localhost
}
```

## Come Testare

### 1. Riavvia il frontend
```bash
# Se usi npm dev:
# Ctrl+C per fermare
npm run dev
```

### 2. Testa il carrello
1. Apri: http://localhost:3001/it/shop
2. Clicca "Add to Cart" su un prodotto
3. Apri DevTools → Application → Cookies
4. Verifica presenza di `cart_session` cookie
5. Vai a: http://localhost:3001/it/cart
6. Verifica che il prodotto sia visibile

### 3. Pagina di test debug
Abbiamo creato: http://localhost:3001/it/cart-test
- Testa add to cart
- Verifica cookie
- Vedi log in tempo reale

## Log Backend
Ora vedrai nel backend:
```
🛒 AddItem - Session Token: xxx-xxx-xxx, Cookie exists: true
🍪 AddItem - Setting cookie with token: xxx-xxx-xxx
✅ AddItem - Cart ID: 1, Total items: 1

📦 GetCart - Session Token: xxx-xxx-xxx, Cookie exists: true
✅ GetCart - Cart ID: 1, Items: 1
```

## Perché Funziona Ora

### Prima (❌ Non funzionava):
```
Frontend (3001) → Next.js Proxy → Backend (8080)
                    ↓
                Cookie perso qui!
```

### Ora (✅ Funziona):
```
Frontend (3001) → CORS → Backend (8080)
                    ↓
            Cookie passato correttamente!
```

## Note Importanti

1. **Cookies e CORS**: Quando usi `credentials: 'include'` per inviare cookies:
   - Backend DEVE specificare origin esatto (no `*`)
   - Backend DEVE avere `Access-Control-Allow-Credentials: true`
   - Frontend DEVE chiamare direttamente il backend (no proxy)

2. **Next.js Rewrites**: Non passano `Set-Cookie` headers, quindi non vanno bene per session management

3. **SameSite=Lax**: Permette cookies cross-origin per richieste GET, perfetto per il nostro caso

## Prossimi Step in Produzione

Per deploy in produzione, aggiorna:

```go
// backend/main.go
allowedOrigins := []string{
    "https://tuodominio.com",
    "https://www.tuodominio.com",
}
```

E aggiungi `Secure: true` al cookie per HTTPS.
