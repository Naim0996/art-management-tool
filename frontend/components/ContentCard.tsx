"use client";

import Image from "next/image";
import Link from "next/link";

export interface ContentCardButton {
  label: string;
  href: string;
  imageSrc: string;
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
    <div className="w-full h-full">
      <div
        className="grid md:grid-cols-[2fr_3fr] items-stretch rounded-2xl md:rounded-3xl overflow-hidden"
        style={{ gap: "1px", minHeight: "400px" }}
      >
        {/* Left Card - Text content */}
        <div
          className="relative py-6 px-4 sm:py-10 sm:px-8 md:py-16 md:px-12"
          style={{
            background:
              "linear-gradient(135deg, #D1D5DB 0%, #E5E7EB 50%, #F3F4F6 100%)",
          }}
        >
          {/* Subtle overlay for depth */}
          <div className="absolute inset-0 bg-black/5"></div>

          {/* Text content */}
          <div className="relative z-10 text-left h-full flex flex-col justify-center gap-4 sm:gap-5 md:gap-6">
            {/* Title */}
            <h2 className="junglefever-title text-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight">
              {title}
            </h2>

            {/* Description */}
            <p className="skranji-paragraph text-black text-sm sm:text-base md:text-lg leading-relaxed">
              {description}
            </p>

            {/* Buttons or spacing */}
            {buttons.length > 0 ? (
              <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 pt-2 ${
                buttons.length === 1 
                  ? 'items-center justify-center' 
                  : 'items-start'
              }`}>
                {buttons.map((button, index) => (
                  <Link
                    key={index}
                    href={button.href}
                    className="block"
                  >
                    <div className={`relative ${buttonSizeClasses[buttonSize]}`} style={{ aspectRatio: '3.5/1', minWidth: '180px' }}>
                      <Image
                        src={button.imageSrc}
                        alt={button.label}
                        fill
                        className="object-contain hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="pt-2 pb-8"></div>
            )}
          </div>
        </div>

        {/* Right Card - Image */}
        <div
          className="relative p-4 sm:p-6 md:p-8 flex justify-center items-center min-h-[200px] md:min-h-[300px]"
          style={{
            background:
              "linear-gradient(135deg, #D1D5DB 0%, #E5E7EB 50%, #F3F4F6 100%)",
          }}
        >
          {/* Subtle overlay for depth */}
          <div className="absolute inset-0 bg-black/5"></div>

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
      </div>
    </div>
  );
}

