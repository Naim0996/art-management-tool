# 🔧 Guida Setup App Etsy - PASSO PER PASSO

## ❌ PROBLEMA ATTUALE

**Errore ricevuto:**
```
An error occurred
The application that is requesting authorization to use your Etsy account is not recognized.
```

**Causa:** L'app non è stata configurata correttamente sul Etsy Developer Portal.

---

## ✅ SOLUZIONE: Setup App su Etsy

### STEP 1: Accedi al Developer Portal

1. Vai su **https://www.etsy.com/developers/your-apps**
2. Effettua login con il tuo account Etsy (lo stesso del negozio mrAnarchyStudioArt)

### STEP 2: Verifica se l'App Esiste

Cerca un'app chiamata **"art-management-tool"** o con:
- **Keystring (API Key):** `kftb0shwfjdguunnjuaeugfb`

**Se l'app ESISTE:**
- ✅ Vai allo **STEP 3** per configurare il Redirect URI

**Se l'app NON ESISTE:**
- ❌ Le credenziali sono invalide o l'app è stata eliminata
- 🔄 Vai allo **STEP 4** per creare una nuova app

---

## STEP 3: Configura Redirect URI (App Esistente)

1. **Clicca sull'app** nella lista "Your Apps"
2. Vai alla sezione **"OAuth Redirect URIs"** o **"Settings"**
3. **Aggiungi questo Redirect URI esattamente:**
   ```
   http://localhost:3000/admin/etsy-sync/callback
   ```
   
4. **IMPORTANTE:** Non aggiungere spazi, slash finali o caratteri extra
5. **Salva** le modifiche
6. **Attendi 1-2 minuti** per la propagazione delle modifiche

### Verifiche Post-Configurazione:

✅ **Redirect URI presente:** `http://localhost:3000/admin/etsy-sync/callback`  
✅ **Scopes richiesti:**
   - `listings_r` - Read shop listings
   - `listings_w` - Write/update listings  
   - `shops_r` - Read shop information
   - `transactions_r` - Read transactions/orders
   - `feedback_r` - Read feedback

7. **Testa OAuth:** Esegui di nuovo `bash scripts/get-oauth-url.sh`

---

## STEP 4: Crea Nuova App (Se Non Esiste)

### 4.1 - Crea App

1. Vai su **https://www.etsy.com/developers/your-apps**
2. Clicca su **"Create a New App"** o **"Register Your App"**
3. Compila il form:

   **Application Name:**
   ```
   art-management-tool
   ```
   
   **Application Description:**
   ```
   Art Management Tool - Product and inventory synchronization system for mrAnarchyStudioArt shop
   ```
   
   **Application URL (Optional):**
   ```
   http://localhost:3000
   ```
   
   **OAuth Redirect URI:**
   ```
   http://localhost:3000/admin/etsy-sync/callback
   ```
   
   **Application Type:**
   - ✅ Select: **"Web Application"**
   
   **API Access:**
   - ✅ Select all scopes needed:
     - `listings_r` (Read listings)
     - `listings_w` (Write listings)
     - `shops_r` (Read shop info)
     - `transactions_r` (Read orders)
     - `feedback_r` (Read reviews)

4. **Accetta Terms of Service**
5. Clicca **"Create Application"** o **"Register"**

### 4.2 - Ottieni Nuove Credenziali

Dopo la creazione, Etsy mostrerà:

```
Keystring (API Key): xxxxxxxxxxxxxxxxxxxx
Shared Secret: yyyyyyyy
```

**IMPORTANTE:** Salva queste credenziali immediatamente!

### 4.3 - Aggiorna Configurazione

Aggiorna il file `.env` con le **NUOVE** credenziali:

```env
# Etsy Integration Configuration
ETSY_API_KEY=<NUOVO_KEYSTRING>
ETSY_API_SECRET=<NUOVO_SHARED_SECRET>
ETSY_SHOP_ID=mrAnarchyStudioArt
ETSY_REDIRECT_URI=http://localhost:3000/admin/etsy-sync/callback
```

### 4.4 - Riavvia Backend

```bash
docker-compose restart backend
```

---

## STEP 5: Verifica Configurazione App

### Controlla Redirect URI

L'URI **DEVE** essere esattamente:
```
http://localhost:3000/admin/etsy-sync/callback
```

❌ **NON validi:**
- ~~`http://localhost:3000/admin/etsy-sync/callback/`~~ (slash finale)
- ~~`https://localhost:3000/admin/etsy-sync/callback`~~ (https invece di http)
- ~~`http://localhost:3000/callback`~~ (path sbagliato)

### Controlla Scopes

Verifica che questi scopes siano **TUTTI** abilitati nell'app Etsy:
- ✅ `listings_r` - Leggere prodotti
- ✅ `listings_w` - Scrivere prodotti (per future features)
- ✅ `shops_r` - Info negozio
- ✅ `transactions_r` - Ordini
- ✅ `feedback_r` - Recensioni

### Controlla Stato App

**Development Mode:**
- ✅ Perfetto per test locali
- ✅ Funziona con `http://localhost`
- ✅ Non richiede approvazione Etsy

**Production Mode:**
- ⚠️ Richiede approvazione Etsy
- ⚠️ Richiede HTTPS
- ⚠️ Richiede dominio pubblico

**Per ora usa Development Mode!**

---

## STEP 6: Test OAuth Flow

### 6.1 - Genera nuovo OAuth URL

```bash
bash scripts/get-oauth-url.sh
```

### 6.2 - Copia URL e apri nel browser

Esempio URL:
```
https://www.etsy.com/oauth/connect?client_id=kftb0shwfjdguunnjuaeugfb&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fadmin%2Fetsy-sync%2Fcallback&response_type=code&scope=listings_r+listings_w+shops_r+transactions_r+feedback_r&state=...
```

### 6.3 - Risultati Attesi

✅ **SUCCESS - Pagina Etsy di autorizzazione:**
```
art-management-tool would like to:
☑ Access your shop's listings
☑ Update your shop's listings
☑ Access your shop information
☑ Access your transaction history
☑ Access your feedback

[Allow Access] [Deny]
```

❌ **ERRORE - App non riconosciuta:**
```
An error occurred
The application that is requesting authorization to use your Etsy account is not recognized.
```
→ Torna allo **STEP 2** o **STEP 4**

### 6.4 - Clicca "Allow Access"

Dopo aver cliccato "Allow Access":
1. Verrai reindirizzato a: `http://localhost:3000/admin/etsy-sync/callback?code=...`
2. Il frontend processerà il callback automaticamente
3. Il token verrà salvato nel database
4. Verrai reindirizzato a: `http://localhost:3000/admin/etsy-sync?auth=success`

---

## 🔍 TROUBLESHOOTING

### Problema: "Application is not recognized"

**Causa:** App non configurata o credenziali sbagliate

**Soluzione:**
1. Vai su https://www.etsy.com/developers/your-apps
2. Verifica che l'app esista
3. Verifica che il Keystring corrisponda a `ETSY_API_KEY` nel `.env`
4. Se non esiste, crea nuova app (STEP 4)

### Problema: "Redirect URI mismatch"

**Causa:** Redirect URI nel codice ≠ Redirect URI su Etsy

**Soluzione:**
1. Verifica URI su Etsy Developer Portal: `http://localhost:3000/admin/etsy-sync/callback`
2. Verifica URI in `.env`: `ETSY_REDIRECT_URI=http://localhost:3000/admin/etsy-sync/callback`
3. Devono essere **identici** (case-sensitive)

### Problema: "Invalid scope"

**Causa:** Scope richiesto non abilitato nell'app

**Soluzione:**
1. Vai su Etsy Developer Portal → Your App → Scopes
2. Abilita tutti gli scopes richiesti (vedi STEP 5)
3. Salva modifiche
4. Riprova OAuth

### Problema: "Frontend non carica"

**Causa:** Frontend container non in ascolto su porta 3000

**Verifica:**
```bash
docker ps | grep frontend
curl http://localhost:3000
```

**Soluzione:**
```bash
docker-compose restart frontend
docker logs art-frontend-dev --tail 20
```

### Problema: "Token not saved"

**Causa:** Backend non riceve il callback

**Verifica logs:**
```bash
docker logs art-backend-dev --tail 50 | grep oauth
```

**Soluzione:**
1. Verifica che backend sia running: `docker ps`
2. Test endpoint callback manualmente:
```bash
TOKEN=$(curl -s -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

curl "http://localhost:8080/api/admin/etsy/oauth/callback?code=TEST&state=TEST&shop_id=mrAnarchyStudioArt" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📋 CHECKLIST COMPLETA

Prima di testare OAuth, verifica:

- [ ] Account Etsy attivo e loggato
- [ ] Negozio "mrAnarchyStudioArt" esistente
- [ ] App creata su Etsy Developer Portal
- [ ] Redirect URI configurato: `http://localhost:3000/admin/etsy-sync/callback`
- [ ] Tutti gli scopes abilitati (listings_r, listings_w, shops_r, transactions_r, feedback_r)
- [ ] Credenziali corrette in `.env` (ETSY_API_KEY, ETSY_API_SECRET)
- [ ] Docker containers running (frontend, backend, postgres)
- [ ] Frontend accessibile: http://localhost:3000
- [ ] Backend accessibile: http://localhost:8080
- [ ] Admin login funzionante (admin/admin)

---

## 🎯 ALTERNATIVE: Test con Postman/Insomnia

Se OAuth nel browser fallisce, puoi testare l'API direttamente:

### 1. Ottieni Authorization Code manualmente

Apri questo URL nel browser (dopo aver configurato l'app):
```
https://www.etsy.com/oauth/connect?client_id=<TUO_KEYSTRING>&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fadmin%2Fetsy-sync%2Fcallback&response_type=code&scope=listings_r+listings_w+shops_r+transactions_r+feedback_r&state=test123
```

Dopo "Allow Access", copia il `code` dall'URL di redirect:
```
http://localhost:3000/admin/etsy-sync/callback?code=XXXXXXXXX&state=test123
```

### 2. Exchange code per token (via curl)

```bash
curl -X POST "https://api.etsy.com/v3/public/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "client_id=<TUO_KEYSTRING>" \
  -d "redirect_uri=http://localhost:3000/admin/etsy-sync/callback" \
  -d "code=XXXXXXXXX" \
  -d "code_verifier=" \
  -u "<TUO_KEYSTRING>:<TUO_SECRET>"
```

### 3. Salva token nel database

```bash
TOKEN=$(curl -s -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Usa il callback endpoint con il code
curl "http://localhost:8080/api/admin/etsy/oauth/callback?code=XXXXXXXXX&state=test123&shop_id=mrAnarchyStudioArt" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📞 SUPPORTO ETSY

**Etsy Developer Forum:**
https://community.etsy.com/t5/Developer-Discussion/bd-p/developer

**Etsy API Documentation:**
https://developers.etsy.com/documentation/

**OAuth 2.0 Guide:**
https://developers.etsy.com/documentation/essentials/authentication

**Contact Support:**
https://www.etsy.com/help/contact

---

## 🔄 PROSSIMI PASSI

Una volta completato OAuth:

1. ✅ Verifica token: `bash scripts/test-etsy-integration.sh`
2. ✅ Importa prodotti: `bash scripts/etsy-complete-setup.sh`
3. ✅ Visualizza su dashboard: http://localhost:3000/admin/etsy-sync
4. ✅ Sincronizza giacenze (pull only)

---

**Ultimo Aggiornamento:** 2025-10-25  
**Versione:** 1.0.0
