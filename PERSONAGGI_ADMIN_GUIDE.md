# Guida Migliorata: Gestione Personaggi Admin Panel

## 🎨 Nuove Funzionalità

### 1. **Upload Immagini**
- **Upload da dispositivo locale**: Carica immagini direttamente dal tuo computer (max 10MB)
- **Inserimento URL**: Aggiungi immagini tramite link esterni
- **Preview in tempo reale**: Vedi le immagini mentre le aggiungi

### 2. **Form Migliorato con Tab**
Il form è ora organizzato in 3 tab per una migliore esperienza:

#### Tab 1: Basic Info
- Nome del personaggio (obbligatorio)
- Descrizione dettagliata (obbligatoria)
- Ordine di visualizzazione

#### Tab 2: Appearance
- **Tipo di sfondo**: Scegli tra colore solido o gradiente
- **Color Picker**: Selettore visuale per i colori
- **Preview in tempo reale**: Vedi l'anteprima dello sfondo

#### Tab 3: Images
- **Icon**: Carica il logo/icona del personaggio
- **Gallery**: Aggiungi fino a 20 immagini per la galleria
- **Riordinamento**: Sposta le immagini su/giù per cambiar l'ordine
- **Eliminazione**: Rimuovi immagini non più necessarie

### 3. **Preview del Personaggio**
- Pulsante "Preview" nel form per vedere come apparirà il personaggio
- Preview mostra:
  - Sfondo con colori/gradiente applicati
  - Icon e nome
  - Descrizione
  - Galleria immagini
  - Dettagli tecnici

### 4. **Tabella Migliorata**
- **Colonna Icon**: Vedi l'icona direttamente nella lista
- **Conteggio immagini**: Numero di immagini per ogni personaggio
- **Preview rapida**: Click sull'icona occhio per vedere l'anteprima
- **Background preview**: Vedi un'anteprima dello sfondo

## 📝 Come Usare

### Creare un Nuovo Personaggio

1. **Click su "New Personaggio"**
2. **Tab Basic Info**:
   - Inserisci il nome
   - Scrivi la descrizione
   - Imposta l'ordine (opzionale)

3. **Tab Appearance**:
   - Scegli il tipo di sfondo
   - Seleziona i colori con il color picker
   - Vedi l'anteprima in tempo reale

4. **Tab Images**:
   - **Per l'icona**:
     - Click su "Choose File" e seleziona un'immagine
     - Oppure inserisci un URL e click su +
   - **Per la galleria**:
     - Aggiungi più immagini
     - Riordina trascinando o usando le frecce
     - Elimina quelle non volute

5. **Click "Preview"** per vedere il risultato finale

6. **Click "Create"** per salvare

### Modificare un Personaggio Esistente

1. **Click sull'icona matita** nella riga del personaggio
2. Modifica i campi necessari
3. Aggiungi/rimuovi immagini come preferisci
4. Click "Preview" per controllare
5. Click "Update" per salvare

### Gestire le Immagini

#### Aggiungere Immagini
- **Da file locale**: Click "Choose File" → Seleziona → Upload automatico
- **Da URL**: Inserisci l'URL → Click pulsante "+"

#### Riordinare Immagini
- Usa le frecce ↑↓ per spostare le immagini
- L'ordine sarà quello mostrato nella galleria pubblica

#### Eliminare Immagini
- Click sull'icona cestino (🗑️)
- Conferma l'eliminazione
- L'immagine verrà rimossa anche dal server se uploadata

## 🔧 Dettagli Tecnici

### Formati Supportati
- **Immagini**: JPG, PNG, GIF, WebP
- **Dimensione max**: 10MB per file

### Storage
- **Upload locali**: Salvati in `/uploads/personaggi/{id}/`
- **URL esterni**: Memorizzati come riferimenti

### Sicurezza
- Tutte le operazioni richiedono autenticazione admin
- Le immagini vengono validate lato server
- Solo formati immagine sono accettati

## 💡 Suggerimenti

1. **Usa preview frequentemente**: Controlla sempre come appare prima di salvare
2. **Ottimizza le immagini**: Immagini più piccole caricano più velocemente
3. **Usa URL per immagini esterne**: Se hai già le immagini hostate, usa gli URL
4. **Ordina con cura**: L'ordine delle immagini conta per l'esperienza utente
5. **Icone quadrate**: Per risultati migliori, usa icone con formato 1:1

## 🚀 Workflow Consigliato

### Per un Nuovo Personaggio

1. ✅ Prepara i contenuti (testi, immagini)
2. ✅ Crea il personaggio con info base
3. ✅ Configura i colori/sfondo
4. ✅ Salva per generare l'ID
5. ✅ Modifica per aggiungere le immagini via upload
6. ✅ Riordina le immagini come preferisci
7. ✅ Preview finale
8. ✅ Pubblica

### Per Modifiche Rapide

1. ✅ Click edit
2. ✅ Modifica solo ciò che serve
3. ✅ Preview
4. ✅ Update

## 📊 Stati del Personaggio

- **Active**: Visibile nel pannello principale e sul sito pubblico
- **Deleted**: Spostato nel tab "Deleted", può essere ripristinato

## ⚙️ API Backend

Le seguenti API sono disponibili:

- `POST /api/admin/personaggi` - Crea personaggio
- `PUT /api/admin/personaggi/{id}` - Aggiorna personaggio
- `DELETE /api/admin/personaggi/{id}` - Soft delete
- `POST /api/admin/personaggi/{id}/restore` - Ripristina
- `POST /api/admin/personaggi/{id}/upload` - Upload immagine
- `DELETE /api/admin/personaggi/{id}/images` - Elimina immagine

Tutte le API richiedono il token JWT nell'header `Authorization: Bearer {token}`.
