# 🧪 Test Manuale OAuth Etsy - Senza Redirect URI

Se non riesci a configurare il Redirect URI nell'app Etsy, puoi testare OAuth manualmente.

## ⚠️ LIMITAZIONI

Questo metodo:
- ✅ Funziona per ottenere un token OAuth
- ❌ Richiede copia manuale del codice di autorizzazione
- ❌ Non è automatico come il callback

---

## 📝 PROCEDURA MANUALE

### Step 1: Modifica Temporaneamente il Redirect URI

Nell'URL OAuth, cambia il redirect_uri in uno valido su Etsy.

**Invece di:**
```
redirect_uri=http://localhost:3000/admin/etsy-sync/callback
```

**Usa uno di questi (Etsy li accetta di default):**
```
redirect_uri=https://httpbin.org/anything
```

**Oppure:**
```
redirect_uri=urn:ietf:wg:oauth:2.0:oob
```

### Step 2: Genera URL Modificato

URL completo modificato:
```
https://www.etsy.com/oauth/connect?client_id=kftb0shwfjdguunnjuaeugfb&redirect_uri=https%3A%2F%2Fhttpbin.org%2Fanything&response_type=code&scope=listings_r+listings_w+shops_r+transactions_r+feedback_r&state=test123
```

### Step 3: Autorizza su Etsy

1. Apri l'URL nel browser
2. Se funziona, vedrai la pagina di autorizzazione Etsy
3. Clicca "Allow Access"
4. Verrai reindirizzato a `httpbin.org` con il codice

### Step 4: Copia il Codice

Dall'URL di redirect, copia il parametro `code`:
```
https://httpbin.org/anything?code=XXXXXXXXXXXXXXX&state=test123
```

Salva il valore di `code`.

### Step 5: Exchange Code per Token (Manualmente)

```bash
# Get admin token
TOKEN=$(curl -s -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Exchange code (sostituisci XXXXXXX con il tuo code)
curl -X GET "http://localhost:8080/api/admin/etsy/oauth/callback?code=XXXXXXXXXXXXXXX&state=test123&shop_id=mrAnarchyStudioArt" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 6: Verifica Token

```bash
curl "http://localhost:8080/api/admin/etsy/oauth/status?shop_id=mrAnarchyStudioArt" \
  -H "Authorization: Bearer $TOKEN"
```

---

## ⚠️ SE NEMMENO QUESTO FUNZIONA

Significa che l'app **NON ha Redirect URI configurati**.

**Unica soluzione:** Crea una NUOVA app con le impostazioni corrette.

