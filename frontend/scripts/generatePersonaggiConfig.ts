/**
 * Script di utilità per generare la configurazione dei personaggi
 * Esegui questo script quando aggiungi nuove immagini nelle cartelle
 */

import { readdir } from 'fs/promises';
import { join } from 'path';

interface ImageInfo {
  src: string;
  alt: string;
  title: string;
  thumbnail?: string;
}

interface PersonaggioConfig {
  id: string;
  name: string;
  description: string;
  folder: string;
  icon?: string;
  images: ImageInfo[];
}

// Configurazione dei nomi e descrizioni per ogni personaggio
const personaggiConfig = {
  ribelle: {
    name: 'Ribelle il Pigro',
    description: 'Il protagonista della nostra galleria d\'arte. Un personaggio unico che rappresenta la creatività e l\'originalità dell\'arte contemporanea.'
  },
  giullare: {
    name: 'Il Giullare',
    description: 'Un personaggio divertente e colorato che porta allegria in ogni opera.'
  },
  leon: {
    name: 'Leon',
    description: 'Un personaggio forte e determinato con uno stile unico.'
  },
  polemico: {
    name: 'Il Polemico',
    description: 'Un personaggio che esprime opinioni forti attraverso l\'arte.'
  }
};

export async function generatePersonaggiConfig(): Promise<PersonaggioConfig[]> {
  const publicPath = join(process.cwd(), 'public', 'personaggi');
  const personaggiList: PersonaggioConfig[] = [];

  try {
    const folders = await readdir(publicPath, { withFileTypes: true });
    
    for (const folder of folders) {
      if (folder.isDirectory()) {
        const folderId = folder.name;
        const folderPath = join(publicPath, folderId);
        
        try {
          const files = await readdir(folderPath);
          const imageFiles = files.filter(file => 
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
          );

          if (imageFiles.length > 0) {
            const config = personaggiConfig[folderId as keyof typeof personaggiConfig];
            
            const images: ImageInfo[] = imageFiles.map(file => ({
              src: `/personaggi/${folderId}/${file}`,
              alt: `${config?.name || folderId} - ${file.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')}`,
              title: `${config?.name || folderId} - ${file.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')}`
            }));

            // Cerca un'icona (file che contiene "icon" nel nome)
            const iconFile = imageFiles.find(file => 
              file.toLowerCase().includes('icon')
            );

            personaggiList.push({
              id: folderId,
              name: config?.name || folderId.charAt(0).toUpperCase() + folderId.slice(1),
              description: config?.description || `Descrizione per ${folderId}`,
              folder: folderId,
              icon: iconFile ? `/personaggi/${folderId}/${iconFile}` : undefined,
              images
            });
          }
        } catch (error) {
          console.warn(`Errore durante la lettura della cartella ${folderId}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Errore durante la lettura della directory personaggi:', error);
  }

  return personaggiList;
}

// Funzione per stampare la configurazione da copiare in PersonaggiService.ts
export async function printPersonaggiConfig() {
  const config = await generatePersonaggiConfig();
  console.log('// Copia questo array in PersonaggiService.ts');
  console.log('export const personaggiData: PersonaggioData[] = ');
  console.log(JSON.stringify(config, null, 2) + ';');
}

// Esegui se chiamato direttamente
if (require.main === module) {
  printPersonaggiConfig();
}