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
      imageSrc="/images/hero-character.png"
      imageAlt="Giorgio Privitera Lab"
    />,
    <ContentCard
      key="card2"
      title={tCarousel("card2.title")}
      description={tCarousel("card2.description")}
      buttons={card2Buttons}
      imageSrc="/images/hero-character.png"
      imageAlt="AnimantrA World"
    />,
  ];

  return (
    <div className="w-full overflow-x-hidden bg-white min-h-screen py-8 sm:py-12 md:py-20">
      {/* Carosello con ContentCards */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 lg:px-16 mb-8 sm:mb-12 md:mb-20">
        <Carousel items={carouselItems} autoPlay={false} />
      </div>

      {/* Sezione YouTube con testo */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 lg:px-16 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-[1fr_1fr] gap-4 sm:gap-6 md:gap-8 items-center">
          {/* Sezione sinistra - Testo */}
          <div className="flex flex-col justify-center text-right">
            <h2 
              className="junglefever-title text-black mb-4 md:mb-6"
              style={{
                fontSize: 'clamp(20px, 5vw, 48px)',
                lineHeight: '1.2',
                fontWeight: 'bold'
              }}
            >
              É USCITO IL
              <br />
              TRAILER SU
              <br />
              YOUTUBE!
            </h2>
            <p 
              className="skranji-paragraph text-black"
              style={{
                fontSize: 'clamp(12px, 3vw, 24px)',
                lineHeight: '1.4'
              }}
            >
              ANIMANTRA è
              <br />
              anche su Youtube,
              <br />
              ecco il nuovo
              <br />
              trailer!
            </p>
          </div>

          {/* Sezione destra - YouTube Container */}
          <div className="w-full">
            <YouTubeContainer
              videoId="dQw4w9WgXcQ"
              title={tVideo("title")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}