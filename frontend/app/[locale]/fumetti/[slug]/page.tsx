"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";
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

  const formattedDate = fumetto.createdAt 
    ? new Date(fumetto.createdAt).toLocaleDateString('it-IT', { 
        month: 'long', 
        year: 'numeric' 
      })
    : '';

  return (
    <div className="min-h-screen bg-white">
      {/* Header fumetto - centered, Zerocalcare style */}
      <div className="max-w-3xl mx-auto px-8 md:px-16 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">{fumetto.title}</h1>
      </div>

      {/* Comic pages - vertical scroll, centered, molto padding laterale come Zerocalcare */}
      <div className="max-w-xl mx-auto px-8 md:px-16 lg:px-24 pb-8">
        <div className="space-y-0">
          {fumetto.pages?.map((page, index) => (
            <div key={index} className="relative">
              <Image
                src={page}
                alt={`${fumetto.title} - Pagina ${index + 1}`}
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-auto"
                style={{ width: '100%', height: 'auto' }}
                priority={index === 0}
                quality={100}
              />
            </div>
          ))}
        </div>

        {/* Date at bottom */}
        {formattedDate && (
          <div className="mt-8 text-center">
            <p className="text-base text-gray-700">{formattedDate}</p>
          </div>
        )}
      </div>
    </div>
  );
}

