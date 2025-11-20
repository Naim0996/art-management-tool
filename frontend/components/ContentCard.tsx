"use client";

import Image from "next/image";
import Link from "next/link";

export interface ContentCardButton {
  label: string;
  href: string;
  imageSrc: string;
  width?: number;
  height?: number;
}

export type ButtonSize = 'small' | 'medium' | 'large';

export interface ContentCardProps {
  title: string;
  description: string;
  buttons: ContentCardButton[];
  imageSrc: string;
  imageAlt?: string;
  buttonSize?: ButtonSize;
}

export default function ContentCard({
  title,
  description,
  buttons,
  imageSrc,
  imageAlt = "Content image",
  buttonSize = 'medium',
}: ContentCardProps) {
  // Configurazione dimensioni bottoni
  const buttonSizeClasses = {
    small: 'h-12 sm:h-14 md:h-16',
    medium: 'h-14 sm:h-16 md:h-20',
    large: 'h-16 sm:h-20 md:h-24',
  };
  return (
    <div className="w-10/12 h-full">
      <div
        className="grid md:grid-cols-[4fr_5fr] grid-cols-1 items-stretch rounded-2xl overflow-hidden min-h-[70vh] "
        style={{ gap: "1px" }}
      >
        {/* Right Card - Image (shown first on mobile) */}
        <div
          className="relative p-4 sm:p-6 md:p-8 flex justify-center items-center h-full min-h-[200px] md:min-h-[300px] bg-black md:order-2"
        >

          {/* Image */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <div className="relative w-full h-full min-h-[180px] sm:min-h-[250px] md:min-h-[300px]">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
          </div>
        </div>

        {/* Left Card - Text content (shown second on mobile) */}
        <div
          className="relative py-6 px-6 sm:py-10 sm:px-10 md:py-16 md:px-16 h-min md:order-1"
        >
          {/* Subtle overlay for depth */}
          <div className="absolute inset-0 bg-black/5"></div>

          {/* Text content */}
          <div className="relative z-10 text-left h-full flex flex-col justify-center">
            {/* Spacer above */}
            <div className="flex-1"></div>
            
            {/* Title */}
            <h2 className="junglefever-title text-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight text-center">
              {title}
            </h2>

            {/* Spacer between title and description */}
            <div className="flex-1"></div>

            {/* Description */}
            <p className="skranji-paragraph text-black text-sm sm:text-base md:text-lg leading-relaxed text-left">
              {description}
            </p>

            {/* Spacer between description and buttons */}
            <div className="flex-1"></div>

            {/* Buttons */}
            {buttons.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 items-start justify-center mx-auto">
                {buttons.map((button, index) => {
                  const buttonStyle: React.CSSProperties = button.width && button.height
                    ? { width: `${button.width}px`, height: `${button.height}px` }
                    : { aspectRatio: '3.5/1', minWidth: '180px' };
                  
                  return (
                    <Link
                      key={index}
                      href={button.href}
                      className="block flex-shrink-0"
                    >
                      <div className={`relative ${!button.width || !button.height ? buttonSizeClasses[buttonSize] : ''}`} style={buttonStyle}>
                        <Image
                          src={button.imageSrc}
                          alt={button.label}
                          fill
                          className="object-contain hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            
            {/* Spacer below */}
            <div className="flex-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

