"use client";

import Image from "next/image";
import Link from "next/link";

export interface ContentCardButton {
  label: string;
  href: string;
  imageSrc: string;
  width?: number;
  height?: number;
  marginBottom?: number;
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
        className="flex flex-col md:grid md:items-stretch overflow-hidden min-h-[500px] sm:min-h-[550px] md:min-h-[600px] lg:min-h-[650px]"
        style={{ gap: "1px", borderRadius: "40px", gridTemplateColumns: "1fr 3fr" }}
      >
        {/* Image - First on mobile, second on desktop */}
        <div
          className="relative w-full h-full min-h-[350px] sm:min-h-[400px] md:min-h-[300px] bg-black order-1 md:order-2 overflow-hidden"
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover md:object-cover"
            style={{ objectPosition: 'center' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        </div>

        {/* Text content - Second on mobile, first on desktop */}
        <div
          className="relative py-4 px-4 sm:py-6 sm:px-6 md:py-10 md:px-10 lg:py-16 lg:px-16 h-full order-2 md:order-1"
          style={{
            background:
              "#EFE0C4",
          }}
        >
          {/* Subtle overlay for depth */}
          <div className="absolute inset-0 bg-black/5"></div>

          {/* Text content */}
          <div className="relative z-10 text-center md:text-right h-full flex flex-col justify-center md:justify-center">
            {/* Title */}
            <h2 
              className="junglefever-title text-black leading-tight text-center md:text-right mb-3 md:mb-0"
              style={{
                // Font più grande su mobile mantenendo invariato il max su desktop
                fontSize: 'clamp(20px, 5.5vw, 48px)'
              }}
            >
              {title}
            </h2>

            {/* Spacer between title and description - only on desktop */}
            <div className="hidden md:block flex-1"></div>

            {/* Description */}
            <p 
              className="skranji-paragraph text-black leading-relaxed text-center md:text-right mb-4 md:mb-0"
              style={{
                // Aumenta la leggibilità su mobile, senza ingrandire il desktop
                fontSize: 'clamp(16px, 4vw, 20px)'
              }}
            >
              {description}
            </p>

            {/* Spacer between description and buttons - only on desktop */}
            <div className="hidden md:block flex-1"></div>

            {/* Buttons */}
            {buttons.length > 0 && (
              <div className="flex flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-5 items-center justify-center mx-auto flex-wrap">
                {buttons.map((button, index) => {
                  const buttonStyle: React.CSSProperties = button.width && button.height
                    ? { 
                        width: `clamp(${Math.round(button.width * 0.5)}px, ${Math.round(button.width * 0.75)}px, ${button.width}px)`,
                        height: `clamp(${Math.round(button.height * 0.5)}px, ${Math.round(button.height * 0.75)}px, ${button.height}px)`,
                        marginBottom: button.marginBottom ? `${button.marginBottom}px` : '0px'
                      }
                    : { 
                        aspectRatio: '3.5/1',
                        width: 'clamp(120px, 25vw, 180px)',
                        height: 'clamp(34px, 7vw, 51px)',
                        marginBottom: button.marginBottom ? `${button.marginBottom}px` : '0px'
                      };
                  
                  return (
                    <Link
                      key={index}
                      href={button.href}
                      className="block flex-shrink-0"
                    >
                      <div className="relative" style={buttonStyle}>
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
          </div>
        </div>
      </div>
    </div>
  );
}
