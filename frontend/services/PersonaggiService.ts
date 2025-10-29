// Configurazione dei personaggi con le loro immagini
export interface PersonaggioData {
  id: string;
  name: string;
  description: string;
  folder: string;
  images: PersonaggioImage[];
  icon?: string;
  backgroundColor?: string;
  backgroundType?: 'solid' | 'gradient';
  gradientFrom?: string;
  gradientTo?: string;
  order?: number;
}

export interface PersonaggioImage {
  src: string;
  alt: string;
  title: string;
  thumbnail?: string;
}

// Dati statici dei personaggi (sincronizzati con il database)
export const personaggiData: PersonaggioData[] = [
  {
    id: 'giullare',
    name: 'Il Giullare',
    description: 'Un personaggio divertente e colorato che porta allegria in ogni opera.',
    folder: 'giullare',
    icon: '/personaggi/giullare/Giullare_icon.png',
    images: [
      {
        src: '/personaggi/giullare/Giullare_icon.png',
        alt: 'Il Giullare - Giullare_icon',
        title: 'Il Giullare - Giullare_icon',
        thumbnail: '/personaggi/giullare/Giullare_icon.png'
      },
      {
        src: '/personaggi/giullare/Giullare_muddica.jpeg',
        alt: 'Il Giullare - Giullare_muddica',
        title: 'Il Giullare - Giullare_muddica',
        thumbnail: '/personaggi/giullare/Giullare_icon.png'
      }
    ]
  },
  {
    id: 'leon',
    name: 'Leon',
    description: 'Un personaggio forte e determinato con uno stile unico.',
    folder: 'leon',
    icon: '/personaggi/leon/Leon_icon.png',
    images: [
      {
        src: '/personaggi/leon/Leon_icon.png',
        alt: 'Leon - Leon_icon',
        title: 'Leon - Leon_icon',
        thumbnail: '/personaggi/leon/Leon_icon.png'
      },
      {
        src: '/personaggi/leon/Leon_lingua.jpeg',
        alt: 'Leon - Leon_lingua',
        title: 'Leon - Leon_lingua',
        thumbnail: '/personaggi/leon/Leon_icon.png'
      }
    ]
  },
  {
    id: 'polemico',
    name: 'Il Polemico',
    description: 'Un personaggio che esprime opinioni forti attraverso l\'arte.',
    folder: 'polemico',
    icon: '/personaggi/polemico/Polemico_icon.png',
    images: [
      {
        src: '/personaggi/polemico/Polemico_icon.png',
        alt: 'Il Polemico - Polemico_icon',
        title: 'Il Polemico - Polemico_icon',
        thumbnail: '/personaggi/polemico/Polemico_icon.png'
      },
      {
        src: '/personaggi/polemico/Polemico_lupo.jpeg',
        alt: 'Il Polemico - Polemico_lupo',
        title: 'Il Polemico - Polemico_lupo',
        thumbnail: '/personaggi/polemico/Polemico_icon.png'
      }
    ]
  },
  {
    id: 'ribelle',
    name: 'Ribelle il Pigro',
    description: 'Il protagonista della nostra galleria d\'arte. Un personaggio unico che rappresenta la creatività e l\'originalità dell\'arte contemporanea.',
    folder: 'ribelle',
    icon: '/personaggi/ribelle/Ribelle_icon.png',
    images: [
      {
        src: '/personaggi/ribelle/Ribelle_icon.png',
        alt: 'Ribelle il Pigro - Ribelle_icon',
        title: 'Ribelle il Pigro - Ribelle_icon',
        thumbnail: '/personaggi/ribelle/Ribelle_icon.png'
      },
      {
        src: '/personaggi/ribelle/Ribelle_pigro_ink.jpeg',
        alt: 'Ribelle il Pigro - Ribelle_pigro_ink',
        title: 'Ribelle il Pigro - Ribelle_pigro_ink',
        thumbnail: '/personaggi/ribelle/Ribelle_icon.png'
      },
      {
        src: '/personaggi/ribelle/Ribellepigro_nome.jpeg',
        alt: 'Ribelle il Pigro - Ribellepigro_nome',
        title: 'Ribelle il Pigro - Ribellepigro_nome',
        thumbnail: '/personaggi/ribelle/Ribelle_icon.png'
      },
      {
        src: '/personaggi/ribelle/Ribelle_pigro_pinsata.jpeg',
        alt: 'Ribelle il Pigro - Ribelle_pigro_pinsata',
        title: 'Ribelle il Pigro - Ribelle_pigro_pinsata',
        thumbnail: '/personaggi/ribelle/Ribelle_icon.png'
      }
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