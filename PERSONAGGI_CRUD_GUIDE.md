# Sistema di Gestione Personaggi - Guida Implementazione

## 📋 Panoramica
Sistema completo CRUD per la gestione dei personaggi con soft delete, upload immagini e background personalizzabili.

## ✅ Completato

### Backend
- ✅ **Model Personaggio** (`backend/models/personaggio.go`)
  - Campi: ID, Name, Description, Icon, Images (JSON array), BackgroundColor, BackgroundType, GradientFrom, GradientTo, Order
  - Soft delete con campo `DeletedAt`
  - Timestamp automatici: CreatedAt, UpdatedAt

- ✅ **Handler Personaggi** (template creato, necessita configurazione)
  - Tutti i metodi CRUD implementati
  - Soft delete e restore
  - Gestione personaggi cancellati

### Frontend
- ✅ **API Service** (`frontend/services/PersonaggiAPIService.ts`)
  - Tutti i metodi CRUD
  - Upload immagini
  - Type-safe con TypeScript
  
- ✅ **Interface PersonaggioData aggiornata**
  - Aggiunto supporto per backgroundColor, backgroundType, gradientFrom, gradientTo, order

- ✅ **PersonaggioModal**
  - `draggable={false}` - non trascinabile
  - `resizable={false}` - non ridimensionabile

- ✅ **Card Personaggio**
  - Supporto background personalizzato (solid color o gradient)
  - Funzione `getBackgroundStyle()` implementata

## 🚧 Da Completare

### 1. Backend Setup Database

**Installare GORM:**
```bash
cd backend
go get -u gorm.io/gorm
go get -u gorm.io/driver/postgres  # o driver/sqlite per sviluppo
```

**Configurare database in `main.go`:**
```go
import (
    "gorm.io/gorm"
    "gorm.io/driver/postgres" // o sqlite
    "github.com/Naim0996/art-management-tool/backend/models"
    "github.com/Naim0996/art-management-tool/backend/handlers"
)

// Connessione database
dsn := "host=localhost user=youruser password=yourpass dbname=artmanagement port=5432"
db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

// Auto-migrate
db.AutoMigrate(&models.Personaggio{})

// Inizializza handler
personaggiHandler := handlers.NewPersonaggiHandler(db)
```

**Aggiungere routes in `main.go`:**
```go
// Personaggi routes
r.HandleFunc("/api/personaggi", personaggiHandler.GetPersonaggi).Methods("GET")
r.HandleFunc("/api/personaggi", personaggiHandler.CreatePersonaggio).Methods("POST")
r.HandleFunc("/api/personaggi/{id}", personaggiHandler.GetPersonaggio).Methods("GET")
r.HandleFunc("/api/personaggi/{id}", personaggiHandler.UpdatePersonaggio).Methods("PUT")
r.HandleFunc("/api/personaggi/{id}", personaggiHandler.DeletePersonaggio).Methods("DELETE")
r.HandleFunc("/api/personaggi/{id}/restore", personaggiHandler.RestorePersonaggio).Methods("POST")
r.HandleFunc("/api/personaggi/deleted", personaggiHandler.GetDeletedPersonaggi).Methods("GET")
```

### 2. Backend Upload Immagini

**Creare handler upload (`backend/handlers/upload.go`):**
```go
func (h *PersonaggiHandler) UploadImage(w http.ResponseWriter, r *http.Request) {
    // Parse multipart form
    r.ParseMultipartForm(10 << 20) // 10MB max
    
    file, handler, err := r.FormFile("file")
    if err != nil {
        http.Error(w, "Error retrieving file", http.StatusBadRequest)
        return
    }
    defer file.Close()
    
    // Create upload directory
    uploadDir := "./public/personaggi"
    os.MkdirAll(uploadDir, os.ModePerm)
    
    // Generate unique filename
    filename := fmt.Sprintf("%d_%s", time.Now().Unix(), handler.Filename)
    filepath := path.Join(uploadDir, filename)
    
    // Save file
    dst, err := os.Create(filepath)
    if err != nil {
        http.Error(w, "Error saving file", http.StatusInternalServerError)
        return
    }
    defer dst.Close()
    
    io.Copy(dst, file)
    
    // Return path
    json.NewEncoder(w).Encode(map[string]string{
        "path": "/personaggi/" + filename,
    })
}
```

### 3. Frontend Admin Page

**Creare `frontend/app/[locale]/admin/personaggi/page.tsx`:**

```typescript
"use client";

import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { personaggiAPI, PersonaggioDTO } from '@/services/PersonaggiAPIService';
import PersonaggioFormDialog from '@/components/PersonaggioFormDialog';

export default function AdminPersonaggiPage() {
  const [personaggi, setPersonaggi] = useState<PersonaggioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedPersonaggio, setSelectedPersonaggio] = useState<PersonaggioDTO | null>(null);

  useEffect(() => {
    loadPersonaggi();
  }, []);

  const loadPersonaggi = async () => {
    try {
      const data = await personaggiAPI.getAllPersonaggi();
      setPersonaggi(data.personaggi);
    } catch (error) {
      console.error('Error loading personaggi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPersonaggio(null);
    setDialogVisible(true);
  };

  const handleEdit = (personaggio: PersonaggioDTO) => {
    setSelectedPersonaggio(personaggio);
    setDialogVisible(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Sei sicuro di voler eliminare questo personaggio?')) {
      try {
        await personaggiAPI.deletePersonaggio(id);
        loadPersonaggi();
      } catch (error) {
        console.error('Error deleting personaggio:', error);
      }
    }
  };

  const actionBodyTemplate = (rowData: PersonaggioDTO) => {
    return (
      <div className="flex gap-2">
        <Button 
          icon="pi pi-pencil" 
          className="p-button-rounded p-button-text" 
          onClick={() => handleEdit(rowData)}
        />
        <Button 
          icon="pi pi-trash" 
          className="p-button-rounded p-button-text p-button-danger" 
          onClick={() => handleDelete(rowData.id!)}
        />
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Gestione Personaggi</h1>
        <Button label="Nuovo Personaggio" icon="pi pi-plus" onClick={handleCreate} />
      </div>

      <DataTable 
        value={personaggi} 
        loading={loading}
        paginator 
        rows={10}
        dataKey="id"
      >
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Nome" sortable />
        <Column field="description" header="Descrizione" />
        <Column field="order" header="Ordine" sortable />
        <Column body={actionBodyTemplate} header="Azioni" />
      </DataTable>

      <PersonaggioFormDialog 
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        personaggio={selectedPersonaggio}
        onSave={loadPersonaggi}
      />
    </div>
  );
}
```

### 4. Frontend Form Dialog

**Creare `frontend/components/PersonaggioFormDialog.tsx`:**

Necessari componenti:
- Campo testo per Nome (required)
- TextArea per Descrizione
- Upload Icon (FileUpload PrimeReact)
- Upload Multiple Images (FileUpload multiple)
- ColorPicker per backgroundColor
- Dropdown per backgroundType (solid/gradient)
- 2 ColorPicker per gradientFrom/gradientTo (visibili solo se gradient)
- InputNumber per Order

### 5. Environment Variables

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 📊 Flusso Dati

```
Frontend → PersonaggiAPIService → Backend API → Database
    ↓                                              ↓
  DataTable ←────────────────────────────── GORM Models
```

## 🎨 Features Implementate

1. **CRUD Completo**: Create, Read, Update, Delete
2. **Soft Delete**: I personaggi non vengono eliminati fisicamente
3. **Restore**: Ripristino personaggi cancellati
4. **Background Personalizzabile**: Solid color o gradient
5. **Upload Immagini**: Icon + multiple gallery images
6. **Ordinamento**: Campo Order per controllare sequenza visualizzazione
7. **Modal Non-Draggable**: Per UX consistente

## 🔒 TODO Sicurezza

- [ ] Aggiungere autenticazione per endpoints admin
- [ ] Validare dimensione/tipo file upload
- [ ] Sanitizzare input utente
- [ ] Rate limiting sulle API
- [ ] CORS configuration

## 📝 Note

- Il backend usa gorilla/mux per il routing
- Il frontend usa Next.js 15 con App Router
- Le immagini vengono salvate in `/public/personaggi/`
- GORM gestisce automaticamente i timestamp
- Il soft delete usa il campo `deleted_at`
