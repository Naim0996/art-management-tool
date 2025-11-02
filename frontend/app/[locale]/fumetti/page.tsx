"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FumettiAPIService, type FumettoDTO } from "@/services/FumettiAPIService";

export default function FumettiPage() {
  const t = useTranslations('fumetti');
  const locale = useLocale();
  const router = useRouter();
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
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-left text-black mb-6 md:mb-8">{t('title')}</h1>

      {/* Grid di card: 3 colonne desktop, 2 tablet, 1 mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {fumetti.map((fumetto) => {
          const year = fumetto.createdAt ? new Date(fumetto.createdAt).getFullYear() : '';

          return (
            <div
              key={fumetto.id}
              className="cursor-pointer group"
              onClick={() => {
                router.push(`/${locale}/fumetti/${fumetto.slug || fumetto.id}`);
              }}
            >
              {/* Card */}
              <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-all duration-150">
                {/* Immagine sopra */}
                <div className="relative w-full aspect-[3/4] bg-gray-100">
                  {fumetto.coverImage ? (
                    <Image
                      src={fumetto.coverImage}
                      alt={`${fumetto.title} Cover`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : fumetto.pages && fumetto.pages[0] ? (
                    <Image
                      src={fumetto.pages[0]}
                      alt={fumetto.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm text-gray-500">No Cover</span>
                    </div>
                  )}
                </div>

                {/* Info sotto */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                    {fumetto.title}
                  </h3>
                  {year && (
                    <span className="text-sm text-gray-500">{year}</span>
                  )}
                  {fumetto.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{fumetto.description}</p>
                  )}
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
    </div>
  );
}
