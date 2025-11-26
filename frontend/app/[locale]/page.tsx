"use client";

import { useLocale, useTranslations } from "next-intl";
import Carousel from "@/components/Carousel";
import ContentCard, { ContentCardButton } from "@/components/ContentCard";
import YouTubeContainer from "@/components/YouTubeContainer";

export default function Home() {
  const locale = useLocale();
  const tHero = useTranslations("hero");
  const tCarousel = useTranslations("carousel");
  const tVideo = useTranslations("video");
  const tSocial = useTranslations("social");

  // Configurazione prima card del carosello
  const card1Buttons: ContentCardButton[] = [
    {
      label: tHero("startShopping"),
      href: `/${locale}/shop`,
      imageSrc: "/assets/pulsante_shopping.svg",
    },
    {
      label: tHero("discoverCharacters"),
      href: `/${locale}/personaggi`,
      imageSrc: "/assets/pulsante_personaggi.svg",
    },
  ];

  // Configurazione seconda card del carosello
  const card2Buttons: ContentCardButton[] = [
    {
      label: tHero("discoverCharacters"),
      href: `/${locale}/brand`,
      imageSrc: "/assets/pulsante_scopribrand.svg",
    }
  ];

  // Elementi del carosello
  const carouselItems = [
    <ContentCard
      key="card1"
      title={tCarousel("card1.title")}
      description={tCarousel("card1.description")}
      buttons={[]}
      imageSrc="/personaggi/ribelle/Ribelle_pigro_pinsata.jpeg"
      imageAlt="Giorgio Privitera Lab"
    />,
    <ContentCard
      key="card2"
      title={tCarousel("card2.title")}
      description={tCarousel("card2.description")}
      buttons={card2Buttons}
      imageSrc="/personaggi/leon/Leon_lingua.jpeg"
      imageAlt="AnimantrA World"
    />,
  ];

  return (
    <div className="w-full overflow-x-hidden bg-white min-h-screen">
      {/* Carosello con ContentCards */}
      <div className="max-w-7xl mx-auto px-2 mb-8 sm:mb-12 md:mb-20">
        <Carousel items={carouselItems} autoPlay={false} />
      </div>

      {/* Sezione YouTube - Testo a sinistra, video a destra */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 lg:px-16 sm:py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Testo a sinistra */}
          <div className="flex-1 text-center md:text-left">
            <h2 
              className="junglefever-title text-black mb-4"
              style={{
                fontSize: 'clamp(24px, 4vw, 48px)'
              }}
            >
              {tVideo("trailerTitle")}
            </h2>
            <p 
              className="skranji-paragraph text-black"
              style={{
                fontSize: 'clamp(14px, 2.5vw, 18px)'
              }}
            >
              {tVideo("trailerDescription")}
            </p>
          </div>
          
          {/* YouTube Container a destra */}
          <div className="flex-shrink-0">
            <YouTubeContainer
              videoId="dQw4w9WgXcQ"
              title={tVideo("title")}
            />
          </div>
        </div>
      </div>

      {/* Sezione Social - Div grigio con bordo nero a sinistra */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 lg:px-16 sm:py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Div grigio con bordo nero a sinistra */}
          <div className="w-full md:w-1/2 bg-gray-200 border-2 border-black rounded-lg p-6 md:p-8 flex flex-col justify-center items-center text-center">
            <h2 
              className="junglefever-title text-black mb-4"
              style={{
                fontSize: 'clamp(24px, 4vw, 48px)'
              }}
            >
              {tSocial("title")}
            </h2>
            <p 
              className="skranji-paragraph text-black mb-6"
              style={{
                fontSize: 'clamp(14px, 2.5vw, 18px)'
              }}
            >
              {tSocial("description")}
            </p>
            {/* Link ai social - da personalizzare con i link reali */}
            <div className="flex gap-4">
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-black hover:text-gray-600 transition-colors"
              >
                YouTube
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-black hover:text-gray-600 transition-colors"
              >
                Instagram
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-black hover:text-gray-600 transition-colors"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}