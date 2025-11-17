"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import PersonaggioModal from "@/components/PersonaggioModal";
import { PersonaggiAPIService, type PersonaggioDTO } from "@/services/PersonaggiAPIService";

export default function PersonaggiPage() {
  const t = useTranslations('personaggi');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPersonaggio, setSelectedPersonaggio] = useState<PersonaggioDTO | null>(null);
  const [personaggi, setPersonaggi] = useState<PersonaggioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPersonaggi = async () => {
      setLoading(true);
      const data = await PersonaggiAPIService.getAllPersonaggi();
      // Filtra solo i personaggi che hanno immagini
      const personaggiWithImages = data.filter((p: PersonaggioDTO) => p.images && p.images.length > 0);
      setPersonaggi(personaggiWithImages);
      setLoading(false);
    };
    
    fetchPersonaggi();
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Caricamento personaggi...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      {/* Sezione grigia con logo e titolo */}
      <div
        className="w-full py-2 md:py-3"
        style={{
          background: "linear-gradient(135deg, #D1D5DB 0%, #E5E7EB 50%, #F3F4F6 100%)",
          marginLeft: '30px',
          marginRight: '30px',
          marginTop: '30px',
          marginBottom: '30px',
          width: 'calc(100% - 60px)',
          paddingLeft: 'clamp(60px, 8vw, 120px)',
          paddingRight: 'clamp(60px, 8vw, 120px)',
        }}
      >
        <div className="flex flex-col md:flex-row items-center md:items-center gap-8 md:gap-12">
            {/* Logo Animantra */}
            <div className="flex-shrink-0">
              <div className="relative w-40 h-40 md:w-44 md:h-44 lg:w-48 lg:h-48">
                <Image
                  src="/assets/AnimantraLogo.svg"
                  alt="Animantra Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Titolo e descrizione */}
            <div className="flex-1 text-center md:text-left flex flex-col justify-center">
              <h1 
                className="text-black mb-3 md:mb-4 text-center md:text-left"
                style={{
                  fontFamily: 'var(--font-junglefever), sans-serif',
                  fontSize: 'clamp(35px, 2.5vw, 44px)',
                  lineHeight: '1.2',
                  fontWeight: 'normal'
                }}
              >
                I PERSONAGGI DELLA CIURMA
              </h1>
              <p 
                className="text-black text-center md:text-left"
                style={{
                  fontFamily: 'var(--font-kranji), sans-serif',
                  fontSize: 'clamp(16px, 2.5vw, 25px)',
                  lineHeight: '1.3',
                  fontWeight: 'normal'
                }}
              >
                Scopri i personaggi della ciurma di <strong>ANIMANTRA</strong>: <br />
                le caratteristiche, i gesti, i mantra e tanto altro, trova il tuo preferito e seguine le avventure.
              </p>
            </div>
          </div>
      </div>

      {/* Lista personaggi scrollabile */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Desktop: scroll orizzontale centrato */}
        <div className="hidden md:flex justify-center overflow-x-auto scrollbar-hide pb-4">
          <div className="flex gap-6">
            {personaggi.map((personaggio) => {
              // Genera lo stile del background in base al tipo
              const getBackgroundStyle = () => {
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
                <div 
                  key={personaggio.id}
                  className="flex-shrink-0 rounded-lg p-5 cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all duration-150 w-80"
                  style={getBackgroundStyle()}
                  onClick={() => {
                    setSelectedPersonaggio(personaggio);
                    setModalVisible(true);
                  }}
                >
                  <div className="relative w-full aspect-square mb-4">
                    {personaggio.icon ? (
                      <Image
                        src={personaggio.icon}
                        alt={`${personaggio.name} Icon`}
                        fill
                        className="object-contain rounded-lg"
                        sizes="320px"
                      />
                    ) : personaggio.images && personaggio.images[0] ? (
                      <Image
                        src={personaggio.images[0]}
                        alt={personaggio.name}
                        fill
                        className="object-contain rounded-lg"
                        sizes="320px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-center text-gray-800">
                    {personaggio.name}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: scroll verticale */}
        <div className="md:hidden grid grid-cols-1 gap-6">
          {personaggi.map((personaggio) => {
            // Genera lo stile del background in base al tipo
            const getBackgroundStyle = () => {
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
              <div 
                key={personaggio.id}
                className="rounded-lg p-4 cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all duration-150"
                style={getBackgroundStyle()}
                onClick={() => {
                  setSelectedPersonaggio(personaggio);
                  setModalVisible(true);
                }}
              >
                <div className="relative w-full aspect-square mb-4">
                  {personaggio.icon ? (
                    <Image
                      src={personaggio.icon}
                      alt={`${personaggio.name} Icon`}
                      fill
                      className="object-contain rounded-lg"
                      sizes="100vw"
                    />
                  ) : personaggio.images && personaggio.images[0] ? (
                    <Image
                      src={personaggio.images[0]}
                      alt={personaggio.name}
                      fill
                      className="object-contain rounded-lg"
                      sizes="100vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-center text-gray-800">
                  {personaggio.name}
                </h3>
              </div>
            );
          })}
        </div>

        {/* Messaggio se non ci sono personaggi */}
        {personaggi.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nessun personaggio disponibile al momento.</p>
          </div>
        )}
      </div>

      {/* Modal con la galleria */}
      <PersonaggioModal 
        visible={modalVisible} 
        onHide={() => {
          setModalVisible(false);
          setSelectedPersonaggio(null);
        }}
        personaggio={selectedPersonaggio}
      />
    </div>
  );
}
