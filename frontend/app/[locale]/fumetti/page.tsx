"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import FumettiModal from "@/components/FumettiModal";
import { FumettiAPIService, type FumettoDTO } from "@/services/FumettiAPIService";

export default function FumettiPage() {
  const t = useTranslations('fumetti');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFumetto, setSelectedFumetto] = useState<FumettoDTO | null>(null);
  const [fumetti, setFumetti] = useState<FumettoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchFumetti = async () => {
      setLoading(true);
      const data = await FumettiAPIService.getAllFumetti();
      // Filtra solo i fumetti che hanno pagine
      const fumettiWithPages = data.filter((f: FumettoDTO) => f.pages && f.pages.length > 0);
      // Ordina dalla più recente alla più vecchia (da sinistra a destra)
      const sortedFumetti = fumettiWithPages.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // più recente prima
      });
      setFumetti(sortedFumetti);
      setLoading(false);
    };
    
    fetchFumetti();
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-left text-black mb-8">{t('title')}</h1>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Caricamento fumetti...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-left text-black mb-8">{t('title')}</h1>

      {/* Grid responsive: 3 colonne su web, 1-2 su mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {fumetti.map((fumetto) => {
          return (
          <div 
            key={fumetto.id}
            className="rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white"
            onClick={() => {
              setSelectedFumetto(fumetto);
              setModalVisible(true);
            }}
          >
            {/* Copertina del fumetto */}
            <div className="relative w-full aspect-[3/4]">
              {fumetto.coverImage ? (
                <Image
                  src={fumetto.coverImage}
                  alt={`${fumetto.title} Cover`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : fumetto.pages && fumetto.pages[0] ? (
                <Image
                  src={fumetto.pages[0]}
                  alt={fumetto.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Cover</span>
                </div>
              )}
            </div>
            
            {/* Titolo del fumetto */}
            <div className="p-4 bg-white">
              <h3 className="text-lg font-semibold text-center text-gray-800">
                {fumetto.title}
              </h3>
              {fumetto.description && (
                <p className="text-sm text-gray-600 text-center mt-2 line-clamp-2">
                  {fumetto.description}
                </p>
              )}
              <div className="flex justify-center mt-3">
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {fumetto.pages?.length || 0} {(fumetto.pages?.length || 0) === 1 ? 'pagina' : 'pagine'}
                </span>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Messaggio se non ci sono fumetti */}
      {fumetti.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nessun fumetto disponibile al momento.</p>
        </div>
      )}

      {/* Modal con la galleria orizzontale */}
      <FumettiModal 
        visible={modalVisible} 
        onHide={() => {
          setModalVisible(false);
          setSelectedFumetto(null);
        }}
        fumetto={selectedFumetto}
      />
    </div>
  );
}

