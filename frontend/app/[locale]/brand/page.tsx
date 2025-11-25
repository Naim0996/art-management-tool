"use client";

import Image from "next/image";
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
      height: 40,
      width: 100,
    },
  ];

  return (
    <div className="w-full overflow-x-hidden min-h-screen py-8 sm:py-12 md:py-20">
      {/* Carousel container with frame background */}
      <div className="absolute w-full h-screen">
        {/* Background frame */}
        <div className="absolute inset-0 z-10 pointer-events-none ">
          <Image
            src="/assets/cornice_dettaglio_pg-prodotto_.svg"
            alt="Carousel frame"
            fill
          />

        </div>
        {/* ContentCard - behind the frame 
        <div className="relative inset-0 h-screen flex items-center justify-center bg-red-500">
          <div className="grid">
            <div className="col-6">
              <div className="grid">

              <div className="col-12">
                <div className="absolute inset-0 z-10 pointer-events-none ">
                  <Image
                    src="/assets/balloon_brand_animantra_descrizione_1.svg"
                    alt="Carousel frame"
                    fill
                    className=""
                  />

                </div>
              </div>
              <div className="col-12">
                <div className="absolute inset-0 z-10 pointer-events-none ">
                  <Image
                    src="/assets/balloon_brand_animantra_descrizione_2.svg"
                    alt="Carousel frame"
                    fill
                    className=""
                  />

                </div>
              </div>
              <div className="col-12">
                <div className="absolute inset-0 z-10 pointer-events-none max-w-[428px] max-h-[157px]">
                  <Image
                    src="/assets/balloon_brand_animantra_title222.svg"
                    alt="Carousel frame"
fill
                    className=""
                  />

                </div>
              </div>
              <div className="col-12">
                Bottoni
                {/* Buttons
              </div>


              </div>



            </div>
            <div className="col-6">
              {/* GIF
              Gif
            </div>
          </div>

        </div> */}
      </div>
    </div>
  );
}

