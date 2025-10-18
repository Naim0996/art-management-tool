# 🔧 Guida al Debug delle Chiamate API

## ✅ Modifiche Applicate

### 1. File `.env.local` Creato
**Percorso:** `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 2. CORS Backend Migliorato
**File:** `backend/main.go`
- ✅ Aggiunto logging delle richieste CORS
- ✅ Aggiunto header `Access-Control-Allow-Credentials`
- ✅ Aggiunto metodo `PATCH` ai metodi consentiti

### 3. Pagina di Test API Creata
**URL:** http://localhost:3000/it/api-test
- Testa connessione al backend
- Mostra errori dettagliati
- Verifica configurazione

### 4. Debug Banner nello Shop
**File:** `frontend/app/[locale]/shop/page.tsx`
- ✅ Aggiunto logging dettagliato nella console
- ✅ Banner rosso visibile se ci sono errori API
- ✅ Link diretto alla pagina di test

---

## 🧪 Come Testare

### Step 1: Verifica Backend
Apri il browser e vai direttamente a:
```
http://localhost:8080/health
```

**Risposta attesa:**
```json
{"status": "healthy"}
```

### Step 2: Verifica Prodotti API
```
http://localhost:8080/api/shop/products
```

**Risposta attesa:**
```json
{
  "products": [...],
  "total": 0,
  "page": 1,
  "per_page": 10
}
```

### Step 3: Apri la Pagina di Test
```
http://localhost:3000/it/api-test
```

Clicca su "▶️ Run All Tests" e verifica i risultati.

### Step 4: Apri lo Shop
```
http://localhost:3000/it/shop
```

---

## 🔍 Controlli nella Console Browser

### Apri DevTools (F12) e vai su "Console"

Dovresti vedere:
```
🔄 Fetching products from API... {baseUrl: "http://localhost:8080", endpoint: "/api/shop/products"}
✅ Products fetched successfully: {products: Array(0), total: 0, page: 1, per_page: 12}
```

### Vai su "Network" tab

Filtra per "shop" e controlla:
- ✅ **Status:** 200 OK (verde)
- ✅ **Type:** fetch
- ✅ **Response Headers:**
  - `Access-Control-Allow-Origin: *`
  - `Content-Type: application/json`

---

## ❌ Problemi Comuni e Soluzioni

### Problema 1: CORS Error
```
Access to fetch at 'http://localhost:8080/api/shop/products' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Soluzione:**
- ✅ Verifica che il backend sia in esecuzione: `docker compose ps`
- ✅ Riavvia il backend: `docker compose restart backend`
- ✅ Controlla i log: `docker compose logs backend --tail=20`

### Problema 2: Network Error / Failed to Fetch
```
TypeError: Failed to fetch
```

**Cause possibili:**
1. **Backend non raggiungibile**
   - Verifica: `curl http://localhost:8080/health`
   - Soluzione: `docker compose up -d backend`

2. **Firewall/Antivirus blocca la connessione**
   - Disabilita temporaneamente per testare

3. **URL errato**
   - Verifica `.env.local` esista e contenga `NEXT_PUBLIC_API_URL=http://localhost:8080`
   - Riavvia il frontend dopo aver modificato `.env.local`

### Problema 3: Empty Response / No Products
```
✅ Products fetched successfully: {products: [], total: 0, page: 1, per_page: 12}
```

**Soluzione:**
1. Aggiungi prodotti dal pannello admin
2. Assicurati che abbiano status `published`
3. Verifica che abbiano almeno una variante con stock

---

## 🔧 Comandi Utili

### Riavvia tutto
```powershell
# Backend
docker compose restart backend

# Frontend (in una nuova finestra terminale)
cd frontend
npm run dev
```

### Controlla log in tempo reale
```powershell
# Backend
docker compose logs backend --follow

# Frontend
# I log sono visibili nel terminale dove hai eseguito npm run dev
```

### Verifica che tutto sia online
```powershell
# Backend
curl http://localhost:8080/health

# Frontend
# Apri http://localhost:3000 nel browser
```

### Reset completo (se necessario)
```powershell
# Stop tutto
docker compose down

# Riavvia
docker compose up -d

# Aspetta 10 secondi
Start-Sleep -Seconds 10

# Verifica
docker compose ps
curl http://localhost:8080/health

# Avvia frontend
cd frontend
npm run dev
```

---

## 📊 Status Attuale

✅ **Backend:** In esecuzione su porta 8080 (Docker)
✅ **Frontend:** In esecuzione su porta 3000 (npm run dev)
✅ **Database:** PostgreSQL online (Docker)
✅ **CORS:** Configurato e con logging
✅ **Environment:** File `.env.local` creato

---

## 🎯 Prossimi Step

1. **Apri:** http://localhost:3000/it/api-test
2. **Clicca:** "Run All Tests"
3. **Condividi:** Screenshot dei risultati se ci sono errori
4. **Controlla:** Console del browser (F12) per messaggi di errore

Se vedi errori, guarda:
- Il banner rosso nello shop
- I log della console (F12)
- La pagina di test API

---

## 🆘 Se Serve Aiuto

Inviami:
1. Screenshot della pagina /it/api-test dopo aver cliccato "Run All Tests"
2. Screenshot della Console del browser (F12) nella pagina /it/shop
3. Screenshot del Network tab nel browser (F12) filtrando per "shop"
4. Output di: `docker compose logs backend --tail=50`
