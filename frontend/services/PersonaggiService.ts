// Configurazione dei personaggi con le loro immagini
export interface PersonaggioData {
  id: string;
  name: string;
  description: string;
  folder: string;
  images: PersonaggioImage[];
  icon?: string;
}

export interface PersonaggioImage {
  src: string;
  alt: string;
  title: string;
  thumbnail?: string;
}

// Dati statici dei personaggi (da aggiornare quando aggiungi nuove immagini)
export const personaggiData: PersonaggioData[] = [
  {
    id: 'ribelle',
    name: 'Ribelle il Pigro',
    description: 'Il protagonista della nostra galleria d\'arte. Un personaggio unico che rappresenta la creatività e l\'originalità dell\'arte contemporanea.',
    folder: 'ribelle',
    icon: '/personaggi/ribelle/Ribelle_icon.png',
    images: [
      {
        src: '/personaggi/ribelle/Ribelle_pigro_ink.jpeg',
        alt: 'Ribelle Pigro Ink',
        title: 'Ribelle Pigro - Versione Ink',
        thumbnail: '/personaggi/ribelle/Ribelle_icon.png'
      },
      {
        src: '/personaggi/ribelle/Ribellepigro_nome.jpeg',
        alt: 'Ribelle Pigro Nome',
        title: 'Ribelle Pigro - Con Nome',
        thumbnail: '/personaggi/ribelle/Ribelle_icon.png'
      },
      {
        src: '/personaggi/ribelle/Ribelle_pigro_pinsata.jpeg',
        alt: 'Ribelle Pigro Pinsata',
        title: 'Ribelle Pigro - Versione Pinsata',
        thumbnail: '/personaggi/ribelle/Ribelle_icon.png'
      }
    ]
  },
  {
    id: 'giullare',
    name: 'Il Giullare',
    description: 'Un personaggio divertente e colorato che porta allegria in ogni opera.',
    folder: 'giullare',
    images: [
      // Aggiungi qui le immagini del giullare quando le carichi
    ]
  },
  {
    id: 'leon',
    name: 'Leon',
    description: 'Un personaggio forte e determinato con uno stile unico.',
    folder: 'leon',
    images: [
      // Aggiungi qui le immagini di Leon quando le carichi
    ]
  },
  {
    id: 'polemico',
    name: 'Il Polemico',
    description: 'Un personaggio che esprime opinioni forti attraverso l\'arte.',
    folder: 'polemico',
    images: [
      // Aggiungi qui le immagini del Polemico quando le carichi
    ]
  }
];

// Servizio per ottenere i dati dei personaggi
export class PersonaggiService {
  static getAllPersonaggi(): PersonaggioData[] {
    return personaggiData;
  }

  static getPersonaggioById(id: string): PersonaggioData | undefined {
    return personaggiData.find(p => p.id === id);
  }

  static getPersonaggioImages(id: string): PersonaggioImage[] {
    const personaggio = this.getPersonaggioById(id);
    return personaggio?.images || [];
  }

  // Ottieni solo i personaggi che hanno immagini
  static getPersonaggiWithImages(): PersonaggioData[] {
    return personaggiData.filter(p => p.images.length > 0);
  }
}