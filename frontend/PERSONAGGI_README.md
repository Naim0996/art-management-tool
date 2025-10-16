# 🎨 Sistema di Gestione Personaggi

## 📁 Struttura delle Cartelle

Il sistema è progettato per gestire automaticamente tutti i contenuti nella cartella `public/personaggi/`. 

```
public/
└── personaggi/
    ├── ribelle/
    │   ├── Ribelle_icon.png          # Icona del personaggio (opzionale)
    │   ├── Ribelle_pigro_ink.jpeg    # Immagini del personaggio
    │   ├── Ribellepigro_nome.jpeg    
    │   └── Ribelle_pigro_pinsata.jpeg
    ├── giullare/
    │   └── [le tue immagini qui]
    ├── leon/
    │   └── [le tue immagini qui]
    └── polemico/
        └── [le tue immagini qui]
```

## 🔧 Come Aggiungere Nuovi Personaggi

### 1. Crea la cartella del personaggio
```bash
mkdir public/personaggi/nuovo-personaggio
```

### 2. Aggiungi le immagini
- Copia le immagini nella cartella
- Formati supportati: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- Per l'icona: includi "icon" nel nome del file (es: `personaggio_icon.png`)

### 3. Aggiorna la configurazione
Modifica il file `services/PersonaggiService.ts` e aggiungi il nuovo personaggio nell'array `personaggiData`:

```typescript
{
  id: 'nuovo-personaggio',
  name: 'Nome del Personaggio',
  description: 'Descrizione del personaggio...',
  folder: 'nuovo-personaggio',
  icon: '/personaggi/nuovo-personaggio/icon.png', // opzionale
  images: [
    {
      src: '/personaggi/nuovo-personaggio/immagine1.jpg',
      alt: 'Descrizione immagine',
      title: 'Titolo immagine'
    }
    // ... altre immagini
  ]
}
```

## 🤖 Generazione Automatica (Opzionale)

Per generare automaticamente la configurazione:

```bash
# Installa ts-node se non ce l'hai
npm install -g ts-node

# Genera la configurazione
ts-node scripts/generatePersonaggiConfig.ts
```

Questo stamperà la configurazione completa che puoi copiare in `PersonaggiService.ts`.

## 🎯 Funzionalità

### Pagina Personaggi
- **Grid responsive**: 1-4 colonne in base alla dimensione schermo
- **Cards animate**: Hover effects e transizioni
- **Informazioni personaggio**: Nome, descrizione, numero immagini
- **Click per aprire galleria**: Modal con tutte le immagini

### Modal Galleria
- **Galleria PrimeReact**: Navigazione con frecce, indicatori, thumbnail
- **Contenuto dinamico**: Nome e descrizione del personaggio selezionato
- **Responsive**: Layout adattivo mobile/desktop
- **Traduzioni**: Supporto multilingua

### Layout Responsive
- **Mobile**: 1 colonna
- **Tablet**: 2 colonne
- **Desktop**: 3-4 colonne
- **Auto-adattamento**: Basato sulla quantità di contenuto

## 📝 Convenzioni per i Nomi File

### Icone
- Includi "icon" nel nome: `ribelle_icon.png`, `icon.jpg`, etc.
- Preferibilmente formato quadrato (1:1)
- Dimensione consigliata: 256x256px o superiore

### Immagini
- Nomi descrittivi: `ribelle_pigro_ink.jpeg`
- Evita caratteri speciali, usa underscore o trattini
- Formati ottimizzati per web

## 🌐 Integrazione Multi-lingua

Il sistema è già integrato con next-intl. Per aggiungere traduzioni:

1. Aggiorna `messages/it.json` e `messages/en.json`
2. Usa le chiavi di traduzione nei componenti
3. Il nome e la descrizione del personaggio sono configurabili per lingua

## 🎨 Personalizzazione Stili

### Colori Cards
Modifica in `app/[locale]/personaggi/page.tsx`:
```tsx
className="bg-gradient-to-br from-blue-50 to-purple-50"
```

### Dimensioni Grid
Cambia breakpoints:
```tsx
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
```

### Transizioni
Personalizza animazioni:
```tsx
className="transition-all duration-300 hover:scale-105"
```

## ⚡ Performance

- **Next.js Image**: Ottimizzazione automatica immagini
- **Lazy loading**: Caricamento progressivo
- **Responsive images**: Dimensioni adaptive con `sizes`
- **Caching**: Next.js gestisce automaticamente la cache

## 🐛 Troubleshooting

### Immagini non visibili
1. Verifica che il file sia in `public/personaggi/`
2. Controlla il percorso in `PersonaggiService.ts`
3. Riavvia il server di sviluppo

### Personaggio non appare
1. Verifica che ci siano immagini nell'array `images`
2. Controlla che `PersonaggiService.getPersonaggiWithImages()` funzioni
3. Verifica la console per errori

### Modal non si apre
1. Controlla la console per errori TypeScript
2. Verifica che `selectedPersonaggio` sia passato correttamente
3. Assicurati che PrimeReact sia importato correttamente