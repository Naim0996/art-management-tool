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
        <h1 className="text-3xl font-bold text-left text-black mb-8">{t('title')}</h1>
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
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-left text-black mb-8">{t('title')}</h1>

      {/* Grid responsive per tutti i personaggi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            className="rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
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
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              ) : personaggio.images && personaggio.images[0] ? (
                <Image
                  src={personaggio.images[0]}
                  alt={personaggio.name}
                  fill
                  className="object-contain rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-center text-gray-800 mb-12">
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
