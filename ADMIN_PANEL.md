# Admin Panel - Art Management Tool

## Panoramica

Il pannello amministrativo fornisce un'interfaccia completa per gestire tutti gli aspetti dell'applicazione Art Management Tool.

## Struttura

### Layout e Navigazione

Il pannello admin utilizza:
- **AdminLayout**: Layout principale con sidebar e contenuto
- **AdminSidebar**: Barra laterale con navigazione e menu collassabile

### Sezioni Disponibili

#### 1. Dashboard (`/[locale]/admin`)
- Statistiche in tempo reale
- Grafici delle vendite
- Attività recenti
- Quick actions per navigare alle altre sezioni

**Dati visualizzati:**
- Totale prodotti
- Totale ordini
- Numero di personaggi
- Revenue totale
- Grafico vendite mensili
- Attività recenti

#### 2. Personaggi (`/[locale]/admin/personaggi`)
- Gestione completa dei personaggi
- CRUD operations (Create, Read, Update, Delete)
- Soft delete con possibilità di ripristino
- Caricamento immagini

#### 3. Prodotti (`/[locale]/admin/products`)
- Gestione prodotti
- CRUD operations
- Gestione stock
- Immagini prodotto

#### 4. Ordini (`/[locale]/admin/orders`)
- Visualizzazione ordini
- Filtri per stato
- Dettagli ordine
- Aggiornamento stato ordine

#### 5. Impostazioni (`/[locale]/admin/settings`)
- Configurazione generale del sito
- Impostazioni email
- Valuta e tasse
- Funzionalità on/off
- Modalità manutenzione

## Backend Endpoints

### Dashboard Stats
```
GET /api/admin/stats
Authorization: Bearer {token}
```

Risposta:
```json
{
  "totalProducts": 10,
  "totalOrders": 25,
  "totalPersonaggi": 4,
  "totalRevenue": 1250.50,
  "salesData": [
    {"month": "January", "sales": 150.00},
    ...
  ],
  "recentActivity": [
    {
      "type": "personaggio",
      "description": "Personaggio created: Leon",
      "time": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Orders Management

#### Get All Orders
```
GET /api/admin/orders?status=pending
Authorization: Bearer {token}
```

#### Get Single Order
```
GET /api/admin/orders/{id}
Authorization: Bearer {token}
```

#### Update Order Status
```
PUT /api/admin/orders/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed"
}
```

Status validi: `pending`, `processing`, `completed`, `cancelled`

#### Get Order Stats
```
GET /api/admin/orders/stats
Authorization: Bearer {token}
```

### Personaggi Management

#### Get All Personaggi
```
GET /api/admin/personaggi
Authorization: Bearer {token}
```

#### Create Personaggio
```
POST /api/admin/personaggi
Authorization: Bearer {token}
Content-Type: application/json
```

#### Update Personaggio
```
PUT /api/admin/personaggi/{id}
Authorization: Bearer {token}
```

#### Delete Personaggio (Soft Delete)
```
DELETE /api/admin/personaggi/{id}
Authorization: Bearer {token}
```

#### Restore Personaggio
```
POST /api/admin/personaggi/{id}/restore
Authorization: Bearer {token}
```

#### Get Deleted Personaggi
```
GET /api/admin/personaggi/deleted
Authorization: Bearer {token}
```

### Products Management

#### Get All Products
```
GET /api/admin/products
Authorization: Bearer {token}
```

#### Create Product
```
POST /api/admin/products
Authorization: Bearer {token}
```

#### Update Product
```
PUT /api/admin/products/{id}
Authorization: Bearer {token}
```

#### Delete Product
```
DELETE /api/admin/products/{id}
Authorization: Bearer {token}
```

## Autenticazione

Tutte le rotte admin richiedono autenticazione tramite JWT token.

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

Risposta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Il token deve essere incluso nell'header Authorization di tutte le richieste admin:
```
Authorization: Bearer {token}
```

## Features della Sidebar

1. **Collassabile**: La sidebar può essere collassata per avere più spazio
2. **Icone**: Ogni voce ha un'icona distintiva
3. **Badge**: Supporto per badge di notifica
4. **Active State**: Evidenzia la pagina corrente
5. **Logout**: Pulsante di logout in fondo alla sidebar

## Componenti UI Utilizzati

- **PrimeReact**: Libreria di componenti UI
  - DataTable: Tabelle con sorting, filtering, pagination
  - Chart: Grafici per visualizzazione dati
  - Dialog: Modal per dettagli e form
  - Card: Contenitori per contenuto
  - Toast: Notifiche
  - Button: Pulsanti con varianti
  - InputText, InputNumber, InputSwitch: Form inputs

## Sicurezza

1. Tutte le rotte admin sono protette da middleware di autenticazione
2. Il token JWT viene verificato per ogni richiesta
3. CORS configurato per permettere richieste dal frontend
4. Soft delete per dati importanti (possibilità di recupero)

## Sviluppo Futuro

Possibili miglioramenti:
- [ ] Gestione permessi utenti (ruoli admin, editor, viewer)
- [ ] Export dati in CSV/Excel
- [ ] Notifiche in tempo reale
- [ ] Log attività utente
- [ ] Backup automatico database
- [ ] Dashboard personalizzabile
- [ ] Temi chiaro/scuro
- [ ] Multilingua completo per admin panel
