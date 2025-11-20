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

      {/* Contenitore YouTube */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 lg:px-16 sm:py-8 md:py-12">
        <YouTubeContainer
          videoId="dQw4w9WgXcQ"
          title={tVideo("title")}
        />
      </div>
    </div>
  );
}