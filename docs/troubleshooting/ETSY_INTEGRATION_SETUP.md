# 🛠️ Guida Completa - Integrazione Etsy

## 🔴 PROBLEMA RISOLTO

**Errore precedente:** `relation "etsy_products" does not exist`

**Causa:** Le tabelle Etsy non erano incluse nelle migrations automatiche.

**Soluzione:** Aggiornato `backend/database/connection.go` per includere tutti i modelli Etsy:
- ✅ `EtsySyncConfig`
- ✅ `EtsyProduct`
- ✅ `EtsyInventorySyncLog`
- ✅ `EtsyReceipt`
- ✅ `OAuthToken` (già presente)

---

## 📊 STATO ATTUALE

### ✅ Completato
- [x] Database: Tutte le tabelle Etsy create
- [x] Backend: OAuth manager funzionante
- [x] Backend: Automatic token refresh attivo
- [x] Frontend: Pagina admin `/admin/etsy-sync`
- [x] Frontend: Pagina callback OAuth `/admin/etsy-sync/callback`
- [x] Credenziali: API key, secret e shop ID configurati
- [x] Docker: Tutti i container running

### ⏳ Da Completare
- [ ] **OAuth Flow**: Ottenere il token di accesso Etsy
- [ ] **Sync Prodotti**: Importare i 3 prodotti dal tuo negozio
- [ ] **Test**: Verificare la sincronizzazione giacenze

---

## 🚀 COME COMPLETARE L'INTEGRAZIONE

### Passo 1: Avvia l'OAuth Flow

**Opzione A - Via Script (Raccomandato):**
```bash
bash scripts/get-oauth-url.sh
```

**Opzione B - Via Browser:**
1. Vai su http://localhost:3000/admin/etsy-sync
2. Effettua login (admin/admin)
3. Clicca su un pulsante di sync per visualizzare l'errore di autenticazione
4. Il sistema ti fornirà l'URL OAuth

### Passo 2: Autorizza l'App su Etsy

1. **Copia l'URL OAuth** generato dallo script
2. **Incolla nel browser** e premi Invio
3. **Effettua login** con il tuo account Etsy
4. **Clicca "Allow Access"** per autorizzare:
   - ✓ Lettura prodotti (listings_r)
   - ✓ Scrittura prodotti (listings_w)
   - ✓ Lettura negozio (shops_r)
   - ✓ Lettura transazioni (transactions_r)
   - ✓ Lettura feedback (feedback_r)

5. **Verrai reindirizzato** a: `http://localhost:3000/admin/etsy-sync/callback`
6. Il token verrà **salvato automaticamente** nel database

### Passo 3: Importa i Prodotti da Etsy

Dopo aver completato l'OAuth:

**Via Script:**
```bash
bash scripts/etsy-complete-setup.sh
```

**Via Browser:**
1. Vai su http://localhost:3000/admin/etsy-sync
2. Clicca su **"Sincronizza Prodotti"**
3. Attendi il completamento (5-10 secondi)
4. Visualizza i tuoi 3 prodotti nella tabella

**Via API (per test):**
```bash
# Get token
TOKEN=$(curl -s -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Trigger product sync
curl -X POST "http://localhost:8080/api/admin/etsy/sync/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shop_id":"mrAnarchyStudioArt"}'

# Check products
curl "http://localhost:8080/api/admin/etsy/products?limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Passo 4: Sincronizza le Giacenze

**⚠️ IMPORTANTE:** Questa operazione **LEGGE** le giacenze da Etsy e le **SALVA** nel database locale. **NON** modifica nulla su Etsy.

**Via Browser:**
1. Nella pagina `/admin/etsy-sync`
2. Seleziona **"Preleva da Etsy (Etsy → Locale)"** dal dropdown
3. Clicca su **"Sincronizza Giacenze"**
4. Visualizza i log nella tabella "Log di Sincronizzazione"

**Via API:**
```bash
curl -X POST "http://localhost:8080/api/admin/etsy/sync/inventory" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shop_id":"mrAnarchyStudioArt","direction":"pull"}'
```

---

## 🔒 SICUREZZA

### ⚠️ Operazioni Write (Richiedono Conferma)

Tutte le operazioni che **MODIFICANO** Etsy sono protette:

```go
// Backend: handlers/admin/etsy.go
func (h *EtsyHandler) TriggerProductSync(w http.ResponseWriter, r *http.Request) {
    log.Printf("⚠️ WARNING: This imports products FROM Etsy TO local database (READ operation on Etsy)")
    // ... codice ...
}
```

### ✅ Operazioni Read-Only (Sicure)

- `GET /api/admin/etsy/products` - Visualizza prodotti locali
- `GET /api/admin/etsy/products/{listing_id}` - Dettagli prodotto
- `GET /api/admin/etsy/sync/status` - Stato sincronizzazione
- `GET /api/admin/etsy/sync/logs` - Log operazioni
- `GET /api/admin/etsy/config` - Configurazione
- `GET /api/admin/etsy/oauth/status` - Stato OAuth
- `POST /api/admin/etsy/sync/products` - **Importa DA Etsy (READ su Etsy)**
- `POST /api/admin/etsy/sync/inventory` con `direction: "pull"` - **Importa DA Etsy**

### ⛔ Operazioni Non Implementate (Sicure per Ora)

- `direction: "push"` - Invio giacenze a Etsy **NON FUNZIONA**
- `direction: "bidirectional"` - Sincronizzazione bidirezionale **NON FUNZIONA**
- Update inventory su Etsy - **NON IMPLEMENTATO**
- Create/Update products su Etsy - **NON IMPLEMENTATO**

---

## 📋 VERIFICHE POST-SETUP

### Test Database
```bash
docker exec art-postgres-dev psql -U artuser -d artmanagement -c "
SELECT 
    (SELECT COUNT(*) FROM etsy_products) as products,
    (SELECT COUNT(*) FROM etsy_sync_config) as configs,
    (SELECT COUNT(*) FROM etsy_oauth_tokens) as tokens,
    (SELECT COUNT(*) FROM etsy_inventory_sync_log) as logs;
"
```

**Output Atteso:**
```
 products | configs | tokens | logs 
----------+---------+--------+------
        3 |       1 |      1 |    X
```

### Test OAuth Token
```bash
TOKEN=$(curl -s -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

curl -s "http://localhost:8080/api/admin/etsy/oauth/status?shop_id=mrAnarchyStudioArt" \
  -H "Authorization: Bearer $TOKEN"
```

**Output Atteso:**
```json
{
  "authenticated": true,
  "expires_at": "2025-10-25T17:30:00Z",
  "is_expired": false,
  "scope": "listings_r listings_w shops_r transactions_r feedback_r"
}
```

### Test Sync Status
```bash
curl -s "http://localhost:8080/api/admin/etsy/sync/status" \
  -H "Authorization: Bearer $TOKEN"
```

**Output Atteso:**
```json
{
  "enabled": true,
  "total_products": 3,
  "synced_products": 3,
  "failed_products": 0,
  "pending_products": 0,
  "last_product_sync": "2025-10-25T16:45:00Z",
  "product_sync_in_progress": false,
  "inventory_sync_in_progress": false
}
```

---

## 🐛 TROUBLESHOOTING

### Problema: OAuth token not found

**Soluzione:**
1. Verifica che il frontend sia su http://localhost:3000
2. Completa il flow OAuth usando lo script `get-oauth-url.sh`
3. Assicurati di essere loggato come admin

### Problema: No products found

**Soluzione:**
1. Verifica OAuth: `curl .../oauth/status`
2. Trigger manual sync: `POST .../sync/products`
3. Check logs: `docker logs art-backend-dev --tail 50`

### Problema: relation does not exist

**Soluzione:**
1. Riavvia backend: `docker-compose restart backend`
2. Verifica tabelle: `\dt` in psql
3. Se mancano, forza migration: ricostruisci container

### Problema: Frontend non vede i prodotti

**Soluzione:**
1. Controlla console browser (F12)
2. Verifica token in localStorage: `localStorage.getItem('adminToken')`
3. Test API direttamente con curl
4. Riavvia frontend: `docker-compose restart frontend`

---

## 📚 DOCUMENTAZIONE

### File Chiave

**Backend:**
- `backend/models/etsy.go` - Modelli database Etsy
- `backend/services/etsy/client.go` - Client API Etsy
- `backend/services/etsy/oauth.go` - OAuth manager
- `backend/handlers/admin/etsy.go` - Handlers Etsy
- `backend/handlers/admin/etsy_oauth.go` - OAuth handlers
- `backend/database/connection.go` - Database setup

**Frontend:**
- `frontend/app/[locale]/admin/etsy-sync/page.tsx` - Admin dashboard
- `frontend/app/[locale]/admin/etsy-sync/callback/page.tsx` - OAuth callback
- `frontend/services/EtsyAPIService.ts` - API client
- `frontend/messages/it.json` - Traduzioni italiane
- `frontend/messages/en.json` - Traduzioni inglesi

**Scripts:**
- `scripts/etsy-complete-setup.sh` - Setup wizard completo
- `scripts/test-etsy-integration.sh` - Test integrazione
- `scripts/get-oauth-url.sh` - Quick OAuth URL

**Database:**
- `backend/migrations/010_create_etsy_sync_config.up.sql`
- `backend/migrations/011_create_etsy_products.up.sql`
- `backend/migrations/012_create_etsy_inventory_sync.up.sql`
- `backend/migrations/013_create_etsy_receipts.up.sql`
- `backend/migrations/015_create_etsy_oauth_tokens.up.sql`

### API Endpoints

```
GET    /api/admin/etsy/oauth/auth-url      - Get OAuth URL
GET    /api/admin/etsy/oauth/callback      - OAuth callback
GET    /api/admin/etsy/oauth/status        - Token status
POST   /api/admin/etsy/oauth/refresh       - Refresh token
DELETE /api/admin/etsy/oauth/revoke        - Revoke token

GET    /api/admin/etsy/products            - List products
GET    /api/admin/etsy/products/:id        - Get product
POST   /api/admin/etsy/products/:id/link   - Link product
DELETE /api/admin/etsy/products/:id/link   - Unlink product

POST   /api/admin/etsy/sync/products       - Sync products
POST   /api/admin/etsy/sync/inventory      - Sync inventory
GET    /api/admin/etsy/sync/status         - Sync status
GET    /api/admin/etsy/sync/logs           - Sync logs

GET    /api/admin/etsy/config              - Configuration
POST   /api/admin/etsy/validate            - Validate credentials
```

---

## 🎯 PROSSIMI STEP

1. **Completare OAuth** ✅ Priorità ALTA
2. **Importare 3 prodotti** dal negozio Etsy
3. **Testare sincronizzazione** giacenze (pull only)
4. **Collegare prodotti Etsy** ai prodotti locali
5. **Configurare sync automatico** (opzionale)
6. **Implementare push to Etsy** (SOLO se richiesto)

---

## ⚙️ CONFIGURAZIONE AVANZATA

### Auto-Sync (Opzionale)

Modifica `.env`:
```env
SCHEDULER_ENABLED=true
ETSY_SYNC_INTERVAL_PRODUCTS=3600    # 1 ora
ETSY_SYNC_INTERVAL_INVENTORY=1800   # 30 minuti
```

### Rate Limiting

Configurazione attuale:
```env
ETSY_RATE_LIMIT_REQUESTS=10000
ETSY_RATE_LIMIT_WINDOW=86400        # 24 ore
```

Etsy API v3 limits: 10,000 requests/day per app

---

## 📞 SUPPORTO

Per problemi o domande, verifica:
1. Logs backend: `docker logs art-backend-dev`
2. Logs frontend: Browser console (F12)
3. Logs database: `docker logs art-postgres-dev`
4. File: `docs/ETSY_TOKEN_MANAGEMENT.md` per dettagli OAuth

---

**Ultimo Aggiornamento:** 2025-10-25
**Versione:** 1.0.0
**Autore:** GitHub Copilot
