"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from 'next-intl';
import PersonaggioModal from "@/components/PersonaggioModal";
import { PersonaggiService, PersonaggioData } from "@/services/PersonaggiService";

export default function PersonaggiPage() {
  const t = useTranslations('personaggi');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPersonaggio, setSelectedPersonaggio] = useState<PersonaggioData | null>(null);
  
  // Ottieni tutti i personaggi che hanno immagini
  const personaggi = PersonaggiService.getPersonaggiWithImages();
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-8">{t('title')}</h1>

      {/* Grid responsive per tutti i personaggi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {personaggi.map((personaggio) => (
          <div 
            key={personaggio.id}
            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
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
              ) : personaggio.images[0] ? (
                <Image
                  src={personaggio.images[0].src}
                  alt={personaggio.images[0].alt}
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
            
            <h3 className="text-lg font-semibold text-center text-gray-800 mb-2">
              {personaggio.name}
            </h3>
            
            <p className="text-sm text-gray-600 text-center line-clamp-3">
              {personaggio.description}
            </p>
            
            <div className="mt-3 text-center">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {personaggio.images.length} {personaggio.images.length === 1 ? 'immagine' : 'immagini'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Messaggio se non ci sono personaggi */}
      {personaggi.length === 0 && (
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
