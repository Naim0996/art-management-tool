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
    },
    {
      label: t('shopButton'),
      href: `/${locale}/shop`,
      imageSrc: "/assets/pulsante_shop.svg",
    },
  ];
  
  return (
    <div className="w-full overflow-x-hidden bg-white min-h-screen py-8 sm:py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 lg:px-16">
        <ContentCard
          title={t('title')}
          description={`${t('description1')} ${t('description2')}`}
          buttons={buttons}
          imageSrc="/images/hero-character.png"
          imageAlt="AnimantrA"
        />
      </div>
    </div>
  );
}

