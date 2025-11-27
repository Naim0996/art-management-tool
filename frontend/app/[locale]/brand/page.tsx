"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import ContentCard, { ContentCardButton } from "@/components/ContentCard";

export default function BrandPage() {
  const locale = useLocale();
  const t = useTranslations('brand');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(false);
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Caricamento...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Configurazione bottoni per la card
  const buttons: ContentCardButton[] = [
    {
      label: t('charactersButton'),
      href: `/${locale}/personaggi`,
      imageSrc: "/assets/pulsante_personaggi.svg",
      height: 'clamp(110px, 1vw, 140px)',
      width: 'clamp(220px, 25vw, 280px)',
    },
    {
      label: t('shopButton'),
      href: `/${locale}/shop`,
      imageSrc: "/assets/pulsante_shop.svg",
      height: 'clamp(55px, 5vw, 70px)',
      width: 'clamp(220px, 10vw, 280px)',
      marginBottom: 10,
    },
  ];
  
  return (
    <div className="w-full overflow-x-hidden min-h-screen py-8 sm:py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 md:px-16 lg:px-24 xl:px-32">
        <ContentCard
          title={t('title')}
          description={`${t('description1')} ${t('description2')}`}
          buttons={buttons}
          imageSrc="/assets/animantra_brand_landing.gif"
          imageAlt="AnimantrA"
        />
      </div>
    </div>
  );
}
