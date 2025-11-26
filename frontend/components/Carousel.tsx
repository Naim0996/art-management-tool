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
      {/* Main content area with navigation */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
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

        {/* Carousel container with frame background */}
        <div className="relative w-full h-screen">
          {/* Carousel items - behind the frame */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full bottom-10 p-4 overflow-hidden">
              <div
                className="flex transition-transform duration-1 ease-in-out h-full"
                style={{ transform: `translateX(calc(-${currentIndex * 100}% - ${currentIndex * 32}px))` }}
              >
                {items.map((item, index) => (
                  <div key={index} className="h-1/2 flex items-center justify-center" style={{ flexShrink: 0, width: 'calc(100% - 32px)', marginLeft: '16px', marginRight: '16px' }}>
                    {item}
                  </div>
                ))}
              </div>
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
    </div>
  );
}

