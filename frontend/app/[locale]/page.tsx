"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { PersonaggiAPIService, PersonaggioDTO } from "@/services/PersonaggiAPIService";

export default function Home() {
  const locale = useLocale();
  const [personaggi, setPersonaggi] = useState<PersonaggioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredPersonaggio, setFeaturedPersonaggio] = useState<PersonaggioDTO | null>(null);

  useEffect(() => {
    const loadPersonaggi = async () => {
      try {
        const data = await PersonaggiAPIService.getAllPersonaggi();
        setPersonaggi(data);
        // Seleziona il primo personaggio come featured
        if (data.length > 0) {
          setFeaturedPersonaggio(data[0]);
        }
      } catch (error) {
        console.error('Error loading personaggi:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPersonaggi();
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

  return (
    <div className="w-full overflow-x-hidden">
        {/* Hero Section with Featured Character Banner */}
        <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden w-full">
          {/* Featured Character Banner - Clickable */}
          {featuredPersonaggio && (
            <Link 
              href={`/${locale}/personaggi`}
              className="absolute inset-0 z-0 w-full h-full cursor-pointer group"
            >
              <div 
                className="w-full h-full transition-all duration-500 group-hover:scale-105"
                style={getBackgroundStyle(featuredPersonaggio)}
              >
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60 group-hover:from-black/20 group-hover:to-black/50 transition-all duration-500"></div>
                
                {/* Character Image */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="relative w-full max-w-md">
                    {featuredPersonaggio.icon && (
                      <Image
                        src={featuredPersonaggio.icon}
                        alt={featuredPersonaggio.name}
                        width={600}
                        height={600}
                        className="object-contain"
                        priority
                      />
                    )}
                  </div>
                </div>
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white drop-shadow-2xl group-hover:scale-105 transition-transform duration-300">
                      {featuredPersonaggio.name}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md group-hover:text-white transition-colors duration-300">
                      {featuredPersonaggio.description}
                    </p>
                    <div className="inline-block px-8 py-4 bg-white/20 backdrop-blur-sm rounded-lg border-2 border-white/30 text-white font-semibold text-lg group-hover:bg-white/30 transition-all duration-300">
                      Scopri tutti i personaggi →
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}
          
          {/* Fallback if no personaggi */}
          {!featuredPersonaggio && !loading && (
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
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow-lg hover:shadow-xl"
                  >
                    Inizia Shopping
                  </Link>
                  <Link 
                    href={`/${locale}/personaggi`}
                    className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-semibold shadow-lg hover:shadow-xl"
                  >
                    Scopri Personaggi
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Services Section - What a Comic Artist Can Offer */}
        <div className="py-16 px-4 bg-white">
          <h3 className="text-4xl font-bold mb-12 text-center text-gray-900">Servizi Offerti</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <span className="text-4xl">✏️</span>
              <div>
                <h4 className="font-bold text-xl mb-2 text-gray-900">Character Design</h4>
                <p className="text-gray-700">Creazione di personaggi originali con personalità uniche, dal concept iniziale al design finale</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <span className="text-4xl">📖</span>
              <div>
                <h4 className="font-bold text-xl mb-2 text-gray-900">Tavole Fumettistiche</h4>
                <p className="text-gray-700">Realizzazione di tavole complete con layout dinamici, sequenze narrative e storytelling visivo</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <span className="text-4xl">🎨</span>
              <div>
                <h4 className="font-bold text-xl mb-2 text-gray-900">Illustrazioni Custom</h4>
                <p className="text-gray-700">Illustrazioni personalizzate per copertine, poster, merchandising e progetti editoriali</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <span className="text-4xl">�️</span>
              <div>
                <h4 className="font-bold text-xl mb-2 text-gray-900">Storyboard & Concept Art</h4>
                <p className="text-gray-700">Sviluppo di storyboard per animazioni, film e video, con attenzione ai dettagli narrativi</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <span className="text-4xl">�</span>
              <div>
                <h4 className="font-bold text-xl mb-2 text-gray-900">Character Sheets</h4>
                <p className="text-gray-700">Fogli di riferimento completi con espressioni facciali, pose e turnaround per animatori</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <span className="text-4xl">�</span>
              <div>
                <h4 className="font-bold text-xl mb-2 text-gray-900">Graphic Novel & Copertine</h4>
                <p className="text-gray-700">Design di copertine impattanti e layout per graphic novel, manga e webcomics</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}