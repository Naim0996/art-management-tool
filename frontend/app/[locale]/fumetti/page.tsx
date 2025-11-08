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
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-black mb-12">{t('title')}</h1>
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
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Zerocalcare-style title */}
      <h1 className="text-4xl font-bold text-black mb-12">{t('title')}</h1>
      {/* Grid: 2 colonne come Zerocalcare */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
        {fumetti.map((fumetto) => {
          const year = fumetto.createdAt 
            ? new Date(fumetto.createdAt).getFullYear()
            : '';

          return (
            <div
              key={fumetto.id}
              className="cursor-pointer group"
              onClick={() => {
                router.push(`/${locale}/fumetti/${fumetto.slug || fumetto.id}`);
              }}
            >
              {/* Immagine */}
              <div className="relative w-full aspect-[4/3] bg-white mb-4 overflow-hidden">
                {fumetto.coverImage ? (
                  <Image
                    src={fumetto.coverImage}
                    alt={`${fumetto.title} Cover`}
                    fill
                    className="object-contain transition-opacity group-hover:opacity-90"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : fumetto.pages && fumetto.pages[0] ? (
                  <Image
                    src={fumetto.pages[0]}
                    alt={fumetto.title}
                    fill
                    className="object-contain transition-opacity group-hover:opacity-90"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-sm text-gray-400">No Cover</span>
                  </div>
                )}
              </div>

              {/* Title with year - Zerocalcare style */}
              <p className="zerocalcare-comic-title">
                {fumetto.title} {year && `(${year})`}
              </p>
            </div>
          );
        })}
      </div>

      {/* Messaggio se non ci sono fumetti */}
      {fumetti.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-base">Nessun fumetto disponibile al momento.</p>
        </div>
      )}
    </div>
  );
}
