"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { Carousel } from "primereact/carousel";
import { PersonaggiAPIService, PersonaggioDTO } from "@/services/PersonaggiAPIService";
import { FumettiAPIService, FumettoDTO } from "@/services/FumettiAPIService";

interface BannerItem {
  type: 'personaggio' | 'fumetto';
  data: PersonaggioDTO | FumettoDTO;
}

export default function Home() {
  const locale = useLocale();
  const [personaggi, setPersonaggi] = useState<PersonaggioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerItems, setBannerItems] = useState<BannerItem[]>([]);
  const carouselRef = useRef<Carousel>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [personaggiData, fumettiData] = await Promise.all([
          PersonaggiAPIService.getAllPersonaggi(),
          FumettiAPIService.getAllFumetti()
        ]);
        
        setPersonaggi(personaggiData);
        
        const items: BannerItem[] = [];
        
        if (personaggiData.length > 0) {
          items.push({
            type: 'personaggio',
            data: personaggiData[0]
          });
        }
        
        const fumettiWithPages = fumettiData.filter((f: FumettoDTO) => f.pages && f.pages.length > 0);
        const sortedFumetti = fumettiWithPages.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        
        if (sortedFumetti.length > 0) {
          items.push({
            type: 'fumetto',
            data: sortedFumetti[0]
          });
        }
        
        setBannerItems(items);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const getBackgroundStyle = (personaggio: PersonaggioDTO | null) => {
    if (!personaggio) return { backgroundColor: '#E0E7FF' };
    
    if (personaggio.backgroundType === 'gradient' && personaggio.gradientFrom && personaggio.gradientTo) {
      return {
        background: `linear-gradient(to bottom right, ${personaggio.gradientFrom}, ${personaggio.gradientTo})`
      };
    }
    return {
      backgroundColor: personaggio.backgroundColor || '#E0E7FF'
    };
  };

  const bannerTemplate = (item: BannerItem) => {
    if (item.type === 'personaggio') {
      const personaggio = item.data as PersonaggioDTO;
      const bgStyle = getBackgroundStyle(personaggio);
      
      return (
        <Link 
          href={`/${locale}/personaggi`}
          className="relative w-full h-full cursor-pointer group block"
        >
          <div 
            className="w-full h-full transition-all duration-500 group-hover:scale-105"
            style={bgStyle}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60 group-hover:from-black/20 group-hover:to-black/50 transition-all duration-500"></div>
            
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="relative w-full max-w-md">
                {personaggio.icon && (
                  <Image
                    src={personaggio.icon}
                    alt={personaggio.name}
                    width={600}
                    height={600}
                    className="object-contain"
                    priority
                  />
                )}
              </div>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center px-4">
                <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white drop-shadow-2xl group-hover:scale-105 transition-transform duration-300">
                  {personaggio.name}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md group-hover:text-white transition-colors duration-300">
                  {personaggio.description}
                </p>
                <div className="inline-block px-8 py-3 bg-blue-600 rounded-lg text-white font-semibold text-lg hover:bg-blue-700 transition-all duration-150" style={{ backgroundColor: '#0066CC' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0052A3'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066CC'}>
                  Scopri tutti i personaggi →
                </div>
              </div>
            </div>
          </div>
        </Link>
      );
    } else {
      const fumetto = item.data as FumettoDTO;
      
      return (
        <Link 
          href={`/${locale}/fumetti/${fumetto.slug || fumetto.id}`}
          className="relative w-full h-full cursor-pointer group block"
        >
          <div className="w-full h-full transition-all duration-500 group-hover:scale-105 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40"></div>
            
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="relative w-full max-w-md">
                {(fumetto.coverImage || (fumetto.pages && fumetto.pages[0])) && (
                  <Image
                    src={fumetto.coverImage || fumetto.pages![0]}
                    alt={fumetto.title}
                    width={400}
                    height={600}
                    className="object-contain"
                    priority
                  />
                )}
              </div>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center px-4">
                <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white drop-shadow-2xl group-hover:scale-105 transition-transform duration-300">
                  {fumetto.title}
                </h1>
                {fumetto.description && (
                  <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md group-hover:text-white transition-colors duration-300">
                    {fumetto.description}
                  </p>
                )}
                <div className="inline-block px-8 py-3 bg-blue-600 rounded-lg text-white font-semibold text-lg hover:bg-blue-700 transition-all duration-150" style={{ backgroundColor: '#0066CC' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0052A3'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066CC'}>
                  Leggi il fumetto →
                </div>
              </div>
            </div>
          </div>
        </Link>
      );
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
        {/* Hero Section with Scrollable Banner */}
        <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden w-full">
          {bannerItems.length > 0 && (
            <div className="absolute inset-0 z-0 w-full h-full">
                            <Carousel
                                ref={carouselRef}
                                value={bannerItems}
                                itemTemplate={bannerTemplate}
                                numVisible={1}
                                numScroll={1}
                                circular
                                autoplayInterval={5000}
                                showNavigators={bannerItems.length > 1}
                                showIndicators={bannerItems.length > 1}
                                className="custom-carousel h-full"
                                pt={{
                                    root: { className: 'h-full' },
                                    content: { className: 'h-full' },
                                    container: { className: 'h-full' },
                                    itemsContent: { className: 'h-full' },
                                    itemsContainer: { className: 'h-full' },
                                    item: { className: 'h-full' },
                                    previousButton: { 
                                        className: 'md:w-12 md:h-12 w-10 h-10',
                                        style: { background: 'rgba(255,255,255,0.9)' }
                                    },
                                    nextButton: { 
                                        className: 'md:w-12 md:h-12 w-10 h-10',
                                        style: { background: 'rgba(255,255,255,0.9)' }
                                    }
                                }}
                            />
            </div>
          )}
          
          {/* Fallback if no items */}
          {bannerItems.length === 0 && !loading && (
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40"></div>
              <div className="relative z-10 text-center py-12 px-4">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
                  Benvenuti nel Mondo dei Personaggi
                </h1>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
                  Esplora i personaggi unici creati dall&apos;immaginazione di un artista fumettista
                </p>
                <div className="flex gap-4 justify-center">
                  <Link 
                    href={`/${locale}/shop`}
                    className="px-8 py-3 text-white rounded-lg transition-all duration-150 text-lg font-semibold"
                    style={{ backgroundColor: '#0066CC' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0052A3'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066CC'}
                  >
                    Inizia Shopping
                  </Link>
                  <Link 
                    href={`/${locale}/personaggi`}
                    className="px-8 py-3 text-white rounded-lg transition-all duration-150 text-lg font-semibold"
                    style={{ backgroundColor: '#0066CC' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0052A3'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066CC'}
                  >
                    Scopri Personaggi
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

    </div>
  );
}