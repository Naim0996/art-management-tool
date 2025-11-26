"use client";

import { useState, ReactNode } from "react";
import Image from "next/image";

export interface CarouselProps {
  items: ReactNode[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function Carousel({
  items,
  autoPlay = false,
  autoPlayInterval = 5000,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHoveringPrev, setIsHoveringPrev] = useState(false);
  const [isHoveringNext, setIsHoveringNext] = useState(false);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Auto play functionality
  if (autoPlay) {
    setTimeout(() => {
      goToNext();
    }, autoPlayInterval);
  }

  return (
    <div className="relative w-full">
      {/* Layout desktop/tablet: frecce ai lati */}
      <div className="hidden md:flex items-center gap-2 md:gap-4">
        {/* Previous button */}
        <button
          onClick={goToPrevious}
          onMouseEnter={() => setIsHoveringPrev(true)}
          onMouseLeave={() => setIsHoveringPrev(false)}
          disabled={currentIndex === 0}
          className="flex-shrink-0 transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-20"
          aria-label="Previous slide"
        >
          <Image
            src={
              currentIndex === 0
                ? "/assets/arrow_disabled.svg"
                : isHoveringPrev
                ? "/assets/arrow_hover.svg"
                : "/assets/arrow_default.svg"
            }
            alt="Previous"
            width={40}
            height={40}
            className="transform rotate-360 w-6 h-6 sm:w-8 sm:h-8 md:w-[60px] md:h-[60px]"
          />
        </button>

        {/* Carousel container */}
        <div className="relative w-full min-h-[500px] sm:min-h-[550px] md:min-h-[600px] lg:min-h-[650px]">
          <div className="relative w-full p-4 overflow-hidden">
            <div
              className="flex transition-transform duration-1000 ease-in-out"
              style={{
                transform: `translateX(calc(-${currentIndex * 100}% - ${currentIndex * 32}px))`,
              }}
            >
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex-shrink-0"
                  style={{
                    width: "calc(100% - 32px)",
                    marginLeft: "16px",
                    marginRight: "16px",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={goToNext}
          onMouseEnter={() => setIsHoveringNext(true)}
          onMouseLeave={() => setIsHoveringNext(false)}
          disabled={currentIndex === items.length - 1}
          className="flex-shrink-0 transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-20"
          aria-label="Next slide"
        >
          <Image
            src={
              currentIndex === items.length - 1
                ? "/assets/arrow_disabled.svg"
                : isHoveringNext
                ? "/assets/arrow_hover.svg"
                : "/assets/arrow_default.svg"
            }
            alt="Next"
            width={40}
            height={40}
            className="transform rotate-180 w-6 h-6 sm:w-8 sm:h-8 md:w-[60px] md:h-[60px]"
          />
        </button>
      </div>

      {/* Layout mobile: card grande, frecce sotto l'immagine */}
      <div className="flex flex-col items-center gap-3 md:hidden">
        {/* Carousel container */}
        <div className="relative w-full min-h-[500px] sm:min-h-[550px]">
          <div className="relative w-full overflow-hidden">
            <div
              className="flex transition-transform duration-1000 ease-in-out"
              style={{
                // Su mobile ogni slide occupa il 100% della larghezza del container
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full"
                  style={{
                    width: "100%",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation buttons below the card */}
        <div className="flex items-center justify-center gap-8 mt-2">
          <button
            onClick={goToPrevious}
            onMouseEnter={() => setIsHoveringPrev(true)}
            onMouseLeave={() => setIsHoveringPrev(false)}
            disabled={currentIndex === 0}
            className="transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous slide"
          >
            <Image
              src={
                currentIndex === 0
                  ? "/assets/arrow_disabled.svg"
                  : isHoveringPrev
                  ? "/assets/arrow_hover.svg"
                  : "/assets/arrow_default.svg"
              }
              alt="Previous"
              width={40}
              height={40}
              className="transform rotate-360 w-8 h-8"
            />
          </button>

          <button
            onClick={goToNext}
            onMouseEnter={() => setIsHoveringNext(true)}
            onMouseLeave={() => setIsHoveringNext(false)}
            disabled={currentIndex === items.length - 1}
            className="transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next slide"
          >
            <Image
              src={
                currentIndex === items.length - 1
                  ? "/assets/arrow_disabled.svg"
                  : isHoveringNext
                  ? "/assets/arrow_hover.svg"
                  : "/assets/arrow_default.svg"
              }
              alt="Next"
              width={40}
              height={40}
              className="transform rotate-180 w-8 h-8"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

