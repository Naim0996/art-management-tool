"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";
import { Button } from "primereact/button";
import { FumettiAPIService, type FumettoDTO } from "@/services/FumettiAPIService";

export default function FumettoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const slug = params.slug as string;
  
  const [fumetto, setFumetto] = useState<FumettoDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFumetto = async () => {
      try {
        const allFumetti = await FumettiAPIService.getAllFumetti();
        const found = allFumetti.find((f) => f.slug === slug || f.id?.toString() === slug);
        if (found && found.pages && found.pages.length > 0) {
          setFumetto(found);
        } else {
          router.push(`/${locale}/fumetti`);
        }
      } catch (error) {
        console.error("Error loading fumetto:", error);
        router.push(`/${locale}/fumetti`);
      } finally {
        setLoading(false);
      }
    };

    fetchFumetto();
  }, [slug, locale, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Caricamento fumetto...</p>
        </div>
      </div>
    );
  }

  if (!fumetto) {
    return null;
  }

    return (
        <div className="min-h-screen bg-white">
            {/* Breadcrumb minimale */}
            <div className="container mx-auto px-4 py-4">
                <Button
                    icon="pi pi-arrow-left"
                    label="Torna ai fumetti"
                    className="p-button-text"
                    onClick={() => router.push(`/${locale}/fumetti`)}
                />
            </div>

            {/* Header fumetto */}
            <div className="container mx-auto px-4 pb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{fumetto.title}</h1>
                {fumetto.description && (
                    <p className="text-base text-gray-600">{fumetto.description}</p>
                )}
                {fumetto.createdAt && (
                    <p className="text-sm text-gray-500 mt-2">
                        {new Date(fumetto.createdAt).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                    </p>
                )}
            </div>

            {/* Scroll verticale con separatori tra pagine */}
            <div className="container mx-auto px-2 md:px-4 pb-8 max-w-3xl">
                <div className="space-y-6 md:space-y-8">
                    {fumetto.pages.map((page, index) => (
                        <div key={index} className="relative">
                            {/* Numero pagina sopra */}
                            <div className="text-center mb-2">
                                <span className="text-xs md:text-sm font-medium text-gray-500">
                                    Pagina {index + 1} di {fumetto.pages.length}
                                </span>
                            </div>
                            
                            {/* Immagine pagina */}
                            <div className="relative w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                                <Image
                                    src={page}
                                    alt={`${fumetto.title} - Pagina ${index + 1}`}
                                    width={800}
                                    height={1066}
                                    className="w-full h-auto"
                                    sizes="(max-width: 768px) 100vw, 768px"
                                    priority={index === 0}
                                />
                            </div>

                            {/* Separatore tra pagine (eccetto ultima) */}
                            {index < fumetto.pages.length - 1 && (
                                <div className="flex items-center justify-center mt-6 md:mt-8">
                                    <div className="h-px bg-gray-300 flex-1 max-w-[150px] md:max-w-[200px]"></div>
                                    <span className="px-3 md:px-4 text-xs text-gray-400">•</span>
                                    <div className="h-px bg-gray-300 flex-1 max-w-[150px] md:max-w-[200px]"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

        {/* Info aggiuntive */}
        {fumetto.about && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Informazioni</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{fumetto.about}</p>
          </div>
        )}
        
        {/* Data pubblicazione */}
        {fumetto.createdAt && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              {new Date(fumetto.createdAt).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

