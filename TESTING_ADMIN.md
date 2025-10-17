# Guida Test Admin Panel

## Setup Iniziale

### 1. Avviare Backend e Database

```powershell
# Nella cartella backend
docker-compose up -d

# Avviare il backend
go run main.go
```

### 2. Popolare il Database con Dati di Test

```powershell
# Nella cartella backend
go run cmd/seed/main.go        # Seed personaggi
go run cmd/seed-orders/main.go  # Seed ordini
```

### 3. Avviare il Frontend

```powershell
# Nella cartella frontend
npm run dev
```

## Test delle Funzionalità

### Login Admin

1. Navigare a: `http://localhost:3000/it/admin/login`
2. Credenziali predefinite (se configurate):
   - Username: `admin`
   - Password: `admin123`

### Dashboard

1. Dopo il login, verrai reindirizzato alla dashboard
2. Verifica che vengano visualizzate:
   - ✅ Statistiche (Prodotti, Ordini, Personaggi, Revenue)
   - ✅ Grafico vendite mensili
   - ✅ Attività recenti
   - ✅ Quick actions buttons

### Sidebar

1. Clicca sull'icona di collapse nella sidebar
2. Verifica che:
   - ✅ La sidebar si restringe mostrando solo le icone
   - ✅ Le icone hanno tooltip al passaggio del mouse
   - ✅ Il pulsante logout rimane visibile

### Personaggi Management

1. Clicca su "Personaggi" nella sidebar
2. Test operazioni:
   - ✅ Visualizza lista personaggi
   - ✅ Crea nuovo personaggio
   - ✅ Modifica personaggio esistente
   - ✅ Elimina personaggio (soft delete)
   - ✅ Visualizza personaggi eliminati
   - ✅ Ripristina personaggio eliminato

### Products Management

1. Clicca su "Products" nella sidebar
2. Test operazioni:
   - ✅ Visualizza lista prodotti
   - ✅ Crea nuovo prodotto
   - ✅ Modifica prodotto
   - ✅ Elimina prodotto
   - ✅ Gestisci stock

### Orders Management

1. Clicca su "Orders" nella sidebar
2. Test operazioni:
   - ✅ Visualizza lista ordini
   - ✅ Filtra per stato (pending, completed, etc.)
   - ✅ Cerca ordini
   - ✅ Visualizza dettagli ordine
   - ✅ Aggiorna stato ordine

### Settings

1. Clicca su "Settings" nella sidebar
2. Test configurazioni:
   - ✅ Modifica nome sito
   - ✅ Modifica email sito
   - ✅ Cambia valuta
   - ✅ Imposta tax rate
   - ✅ Toggle notifications
   - ✅ Toggle guest checkout
   - ✅ Toggle maintenance mode
   - ✅ Salva impostazioni

## Test API Backend

### Test con curl o Postman

#### 1. Login e ottenere token

```powershell
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"admin","password":"admin123"}'
```

#### 2. Get Dashboard Stats

```powershell
curl -X GET http://localhost:8080/api/admin/stats `
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3. Get Orders

```powershell
curl -X GET http://localhost:8080/api/admin/orders `
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. Get Order Stats

```powershell
curl -X GET http://localhost:8080/api/admin/orders/stats `
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5. Update Order Status

```powershell
curl -X PUT http://localhost:8080/api/admin/orders/1/status `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"status":"completed"}'
```

#### 6. Get Personaggi

```powershell
curl -X GET http://localhost:8080/api/admin/personaggi `
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 7. Get Products

```powershell
curl -X GET http://localhost:8080/api/admin/products `
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Verifica Funzionalità Cross-Browser

Test su:
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## Test Responsive

1. Dashboard mobile (< 768px)
2. Tablet view (768px - 1024px)
3. Desktop view (> 1024px)

Verifica che:
- ✅ Sidebar si adatta
- ✅ Tabelle scrollano orizzontalmente
- ✅ Form sono utilizzabili
- ✅ Charts si ridimensionano

## Test di Sicurezza

1. **Accesso senza token**:
   ```powershell
   curl -X GET http://localhost:8080/api/admin/stats
   ```
   Deve ritornare: `401 Unauthorized`

2. **Token invalido**:
   ```powershell
   curl -X GET http://localhost:8080/api/admin/stats `
     -H "Authorization: Bearer invalid_token"
   ```
   Deve ritornare: `401 Unauthorized`

3. **Accesso diretto senza login**:
   - Navigare a `http://localhost:3000/it/admin` senza essere loggati
   - Deve reindirizzare a `/it/admin/login`

## Problemi Comuni

### Backend non parte

```powershell
# Verifica che PostgreSQL sia in esecuzione
docker ps

# Verifica i log
docker logs art-management-db
```

### Frontend non si connette al backend

```powershell
# Verifica che il backend sia in ascolto su porta 8080
netstat -an | findstr 8080
```

### Errori di CORS

Verifica che il backend abbia:
```go
w.Header().Set("Access-Control-Allow-Origin", "*")
```

### Token non salvato

Verifica nella console del browser che il token venga salvato in localStorage:
```javascript
localStorage.getItem('adminToken')
```

## Checklist Completa

### Backend
- [ ] Database connesso
- [ ] Migrazioni eseguite
- [ ] Seed dati eseguito
- [ ] Server backend avviato (porta 8080)
- [ ] Tutti gli endpoint rispondono correttamente

### Frontend
- [ ] npm install eseguito
- [ ] Server dev avviato (porta 3000)
- [ ] Login funzionante
- [ ] Token salvato in localStorage
- [ ] Tutte le pagine admin caricate

### Funzionalità
- [ ] Dashboard mostra dati reali
- [ ] CRUD Personaggi funzionante
- [ ] CRUD Products funzionante
- [ ] Visualizzazione Ordini funzionante
- [ ] Settings caricano e salvano
- [ ] Sidebar navigazione funzionante
- [ ] Logout funzionante

## Next Steps

1. Implementare aggiornamento stato ordini nel frontend
2. Aggiungere gestione immagini per personaggi
3. Implementare effettivamente il salvataggio settings
4. Aggiungere filtri avanzati per ordini
5. Creare reports e analytics più dettagliati
6. Implementare notifiche in tempo reale
7. Aggiungere export dati (CSV, PDF)
