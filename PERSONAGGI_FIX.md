# Fix Errore Personaggi Admin Panel

## Problema
Il modulo personaggi nell'admin panel riceveva un errore dal backend:
```
ERROR: invalid input syntax for type bigint: "deleted" (SQLSTATE 22P02)
SELECT * FROM "personaggi" WHERE id = 'deleted' AND deleted_at IS NULL
```

## Causa
Il problema era causato da un conflitto di routing:

1. Nel backend, la route pubblica `/api/personaggi/{id}` matchava anche la chiamata `/api/personaggi/deleted`
2. Il router interpretava "deleted" come un parametro ID, causando l'errore SQL
3. La route `/api/admin/personaggi/deleted` esisteva, ma il frontend chiamava `/api/personaggi/deleted` senza autenticazione

## Soluzione Implementata

### Backend (`backend/main.go`)
Aggiunte le route GET mancanti nella sezione admin:
- `GET /api/admin/personaggi` - Lista tutti i personaggi (con autenticazione)
- `GET /api/admin/personaggi/{id}` - Ottieni singolo personaggio (con autenticazione)

Ordine corretto delle route:
```go
adminRouter.HandleFunc("/personaggi", personaggiHandler.GetPersonaggi).Methods("GET")
adminRouter.HandleFunc("/personaggi", personaggiHandler.CreatePersonaggio).Methods("POST")
adminRouter.HandleFunc("/personaggi/deleted", personaggiHandler.GetDeletedPersonaggi).Methods("GET")
adminRouter.HandleFunc("/personaggi/{id}", personaggiHandler.GetPersonaggio).Methods("GET")
adminRouter.HandleFunc("/personaggi/{id}", personaggiHandler.UpdatePersonaggio).Methods("PUT")
adminRouter.HandleFunc("/personaggi/{id}", personaggiHandler.DeletePersonaggio).Methods("DELETE")
adminRouter.HandleFunc("/personaggi/{id}/restore", personaggiHandler.RestorePersonaggio).Methods("POST")
```

### Frontend (`frontend/services/PersonaggiAPIService.ts`)
1. Aggiunto supporto per autenticazione con Bearer Token:
   - Nuovo metodo `getAuthHeaders()` che recupera il token da localStorage
   - Parametro `useAuth` nel metodo `fetchJSON()` per includere l'Authorization header

2. Creati metodi admin separati:
   - `getAllPersonaggiAdmin()` - Usa `/api/admin/personaggi` con autenticazione
   - `getPersonaggioAdmin()` - Usa `/api/admin/personaggi/{id}` con autenticazione
   - Tutti i metodi CRUD ora usano le route `/api/admin/personaggi/*` con autenticazione

3. Mantenuti i metodi pubblici:
   - `getAllPersonaggi()` - Route pubblica `/api/personaggi`
   - `getPersonaggio()` - Route pubblica `/api/personaggi/{id}`

### Admin Page (`frontend/app/[locale]/admin/personaggi/page.tsx`)
Aggiornato per usare il metodo admin autenticato:
```typescript
const [activeResponse, deletedResponse] = await Promise.all([
  PersonaggiAPIService.getAllPersonaggiAdmin(), // Cambiato da getAllPersonaggi()
  PersonaggiAPIService.getDeletedPersonaggi(),
]);
```

## Risultato
✅ Le chiamate API dall'admin panel ora usano le route autenticate corrette
✅ Non ci sono più conflitti di routing
✅ I personaggi configurati sono ora visibili nell'admin panel
✅ Tutte le operazioni CRUD funzionano con autenticazione

## Testing
1. Login nell'admin panel
2. Navigare alla sezione "Personaggi"
3. Verificare che la lista dei personaggi venga caricata correttamente
4. Testare le operazioni di creazione, modifica e cancellazione

## Note Tecniche
- Il token JWT viene memorizzato in `localStorage` con chiave `'adminToken'`
- Tutte le route admin richiedono il middleware di autenticazione
- Le route pubbliche rimangono disponibili per il frontend pubblico (shop/personaggi page)
