"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
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
    <div className="w-full overflow-x-hidden">
      {/* Carosello con ContentCards */}
      <div className="max-w-7xl mx-auto px-[10px] sm:px-4 md:px-8 lg:px-16 pt-8 sm:pt-10 md:pt-12 mb-8 sm:mb-12 md:mb-20">
        <Carousel items={carouselItems} autoPlay={false} />
      </div>

      {/* Sezione YouTube - scritta a sinistra, video a destra */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 lg:px-16 sm:py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="text-left">
            <h2
              className="junglefever-title mb-4"
              style={{ fontSize: "clamp(28px, 5vw, 54px)", color: "#EFE0C4" }}
            >
              {tVideo("trailerTitle")}
            </h2>
            <p
              className="skranji-paragraph"
              style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: "#EFE0C4" }}
            >
              {tVideo("trailerDescription")}
            </p>
          </div>

          <div className="flex justify-center">
            <YouTubeContainer videoId="dQw4w9WgXcQ" title={tVideo("title")} />
          </div>
        </div>
      </div>

      {/* Sezione Social - div grigio a sinistra, testo a destra */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 lg:px-16 sm:py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <a
            href="https://www.instagram.com/mr.anarchy_/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full aspect-square bg-gray-200 border-4 border-black rounded-[24px] flex items-center justify-center transition-transform hover:scale-[1.02] overflow-hidden"
          >
            <Image
              src="/personaggi/leon/Leon_icon.png"
              alt="Leon"
              width={400}
              height={400}
              className="w-full h-full object-contain"
            />
            <span className="sr-only">Visita i social</span>
          </a>

          <div className="text-left">
            <h2
              className="junglefever-title mb-4"
              style={{ fontSize: "clamp(28px, 5vw, 54px)", color: "#EFE0C4" }}
            >
              {tSocial("title")}
            </h2>
            <p
              className="skranji-paragraph"
              style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: "#EFE0C4" }}
            >
              {tSocial("description")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}