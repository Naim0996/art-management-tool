# Testing Guide - Personaggi CRUD System

Questa guida spiega come testare il sistema CRUD completo per i personaggi.

## 🚀 Avvio del Sistema

### 1. Avvia Docker Compose

```bash
docker-compose up --build
```

Questo comando avvierà:
- **PostgreSQL** (porta 5432) - Database con init.sql automatico
- **Backend Go** (porta 8080) - API REST
- **Frontend Next.js** (porta 3000) - Interfaccia utente

### 2. Verifica Servizi Attivi

Controlla che tutti i servizi siano in running:

```bash
docker-compose ps
```

Dovresti vedere:
```
NAME                    STATUS              PORTS
postgres                Up (healthy)        5432->5432
art-backend             Up                  8080->8080
art-frontend            Up                  3000->3000
```

### 3. Verifica Database

Controlla che il database sia stato inizializzato correttamente:

```bash
docker-compose exec postgres psql -U art_user -d art_db -c "SELECT COUNT(*) FROM personaggi;"
```

Output atteso: `4` (i personaggi di seed da init.sql)

## 🧪 Test degli Endpoint API

### Test Endpoint Pubblici

#### 1. Lista Personaggi Attivi
```bash
curl http://localhost:8080/api/personaggi
```

Response attesa:
```json
{
  "personaggi": [
    {
      "id": 1,
      "name": "Il Ribelle",
      "description": "Un personaggio audace...",
      "icon": "/personaggi/ribelle/icon.png",
      "images": [...],
      "backgroundType": "gradient",
      "gradientFrom": "#FF6B6B",
      "gradientTo": "#4ECDC4",
      "order": 1
    },
    ...
  ],
  "count": 4
}
```

#### 2. Dettaglio Personaggio
```bash
curl http://localhost:8080/api/personaggi/1
```

### Test Endpoint Admin (Richiede Autenticazione)

Prima ottieni un token di autenticazione:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Salva il token ricevuto e usalo nelle richieste seguenti:

#### 3. Crea Nuovo Personaggio
```bash
curl -X POST http://localhost:8080/api/admin/personaggi \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Personaggio",
    "description": "Personaggio di test",
    "icon": "/test.png",
    "images": [],
    "backgroundType": "solid",
    "backgroundColor": "#FF5733",
    "order": 5
  }'
```

#### 4. Aggiorna Personaggio
```bash
curl -X PUT http://localhost:8080/api/admin/personaggi/5 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Personaggio Updated",
    "description": "Descrizione aggiornata",
    "icon": "/test-updated.png",
    "images": ["/img1.png", "/img2.png"],
    "backgroundType": "gradient",
    "gradientFrom": "#8E2DE2",
    "gradientTo": "#4A00E0",
    "order": 5
  }'
```

#### 5. Soft Delete Personaggio
```bash
curl -X DELETE http://localhost:8080/api/admin/personaggi/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response attesa:
```json
{
  "message": "Personaggio deleted successfully",
  "id": "5"
}
```

#### 6. Lista Personaggi Cancellati
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/admin/personaggi/deleted
```

#### 7. Ripristina Personaggio
```bash
curl -X POST http://localhost:8080/api/admin/personaggi/5/restore \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🖥️ Test Interfaccia Admin

### 1. Login Admin

1. Apri browser: `http://localhost:3000/admin/login`
2. Inserisci credenziali:
   - Username: `admin`
   - Password: `admin123`
3. Click su "Login"

### 2. Gestione Personaggi

1. Naviga a: `http://localhost:3000/it/admin/personaggi` (o `/en/admin/personaggi`)
2. Dovresti vedere una DataTable con i personaggi esistenti

#### Test Operazioni:

**Creazione:**
1. Click su "Create New Personaggio"
2. Compila il form:
   - Name: "Nuovo Personaggio"
   - Description: "Test di creazione"
   - Icon URL: "/test-icon.png"
   - Background Type: Seleziona "Gradient"
   - Gradient From: Scegli un colore (es. #FF0000)
   - Gradient To: Scegli un colore (es. #00FF00)
   - Order: 10
3. Click "Save"
4. Verifica che il personaggio appaia nella tabella

**Modifica:**
1. Click sull'icona "✏️" (Edit) su un personaggio
2. Modifica alcuni campi (es. cambia nome)
3. Click "Save"
4. Verifica che le modifiche siano visibili

**Soft Delete:**
1. Click sull'icona "🗑️" (Delete) su un personaggio
2. Conferma l'eliminazione nel dialog
3. Il personaggio dovrebbe scomparire dalla tab "Active"
4. Vai alla tab "Deleted Personaggi"
5. Verifica che il personaggio sia presente

**Restore:**
1. Nella tab "Deleted Personaggi"
2. Click sull'icona "🔄" (Restore)
3. Il personaggio dovrebbe tornare nella tab "Active"

## 🎨 Test Visualizzazione Frontend

### 1. Pagina Personaggi Pubblica

1. Apri: `http://localhost:3000/it/personaggi`
2. Verifica che le card dei personaggi siano visualizzate
3. Verifica che i background personalizzati (solid/gradient) siano corretti
4. Click su "Scopri di più" su una card
5. Verifica che il modal si apra con gallery e descrizione
6. Verifica che il modal NON sia draggable/resizable

### 2. Multi-lingua

1. Cambia lingua usando il dropdown in alto a destra
2. Verifica che i testi cambino (IT ↔ EN)
3. Verifica che il routing aggiorni (`/it/...` ↔ `/en/...`)

## 📊 Verifica Database Diretta

Connettiti al database per verificare i dati:

```bash
docker-compose exec postgres psql -U art_user -d art_db
```

Query utili:

```sql
-- Lista tutti i personaggi (inclusi soft deleted)
SELECT id, name, background_type, "order", deleted_at FROM personaggi;

-- Conta personaggi attivi
SELECT COUNT(*) FROM personaggi WHERE deleted_at IS NULL;

-- Conta personaggi cancellati
SELECT COUNT(*) FROM personaggi WHERE deleted_at IS NOT NULL;

-- Vedi dettagli completi di un personaggio
SELECT * FROM personaggi WHERE id = 1;
```

## 🐛 Debugging

### Log Backend
```bash
docker-compose logs -f backend
```

### Log Database
```bash
docker-compose logs -f postgres
```

### Log Frontend
```bash
docker-compose logs -f frontend
```

### Riavvio Servizi

Se qualcosa non funziona:

```bash
# Ferma tutti i servizi
docker-compose down

# Rimuovi volumi (resetta database)
docker-compose down -v

# Riavvia con rebuild
docker-compose up --build
```

## ✅ Checklist Test Completo

- [ ] Docker Compose avvia tutti i servizi
- [ ] Database inizializzato con 4 personaggi seed
- [ ] GET /api/personaggi ritorna lista
- [ ] GET /api/personaggi/:id ritorna dettaglio
- [ ] POST /api/admin/personaggi crea personaggio (con auth)
- [ ] PUT /api/admin/personaggi/:id aggiorna (con auth)
- [ ] DELETE /api/admin/personaggi/:id soft delete (con auth)
- [ ] POST /api/admin/personaggi/:id/restore ripristina (con auth)
- [ ] GET /api/admin/personaggi/deleted lista cancellati (con auth)
- [ ] Admin UI: Login funziona
- [ ] Admin UI: DataTable mostra personaggi
- [ ] Admin UI: Create form funziona
- [ ] Admin UI: Edit form funziona
- [ ] Admin UI: Delete conferma e rimuove
- [ ] Admin UI: Tab "Deleted" mostra personaggi eliminati
- [ ] Admin UI: Restore funziona
- [ ] Admin UI: Color picker per background funziona
- [ ] Admin UI: Preview background in tempo reale
- [ ] Frontend: Pagina personaggi mostra card con background custom
- [ ] Frontend: Modal personaggio non draggable/resizable
- [ ] Frontend: Language switcher funziona
- [ ] Database: Soft delete imposta deleted_at
- [ ] Database: Restore rimuove deleted_at

## 📝 Note

- Il sistema usa **soft delete**: i record non vengono mai cancellati fisicamente, solo marcati con `deleted_at`
- L'autenticazione è richiesta solo per gli endpoint admin (`/api/admin/*`)
- I background possono essere **solid** (colore singolo) o **gradient** (due colori)
- L'ordine di visualizzazione è controllato dal campo `order`
- Le immagini sono array di stringhe (path/URL)
