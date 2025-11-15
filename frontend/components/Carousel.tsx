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
          className="flex-shrink-0 transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="transform rotate-360 w-8 h-8 sm:w-10 sm:h-10 md:w-[60px] md:h-[60px]"
          />
        </button>

        {/* Carousel items */}
        <div className="relative overflow-hidden flex-1">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {items.map((item, index) => (
              <div key={index} className="min-w-full">
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={goToNext}
          onMouseEnter={() => setIsHoveringNext(true)}
          onMouseLeave={() => setIsHoveringNext(false)}
          disabled={currentIndex === items.length - 1}
          className="flex-shrink-0 transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="transform rotate-180 w-8 h-8 sm:w-10 sm:h-10 md:w-[60px] md:h-[60px]"
          />
        </button>
      </div>
    </div>
  );
}

