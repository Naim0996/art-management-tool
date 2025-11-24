"use client";

import Image from "next/image";
import ContentCard from "./ContentCard";

export interface CardWelcomeProps {
  leftSvgs: string[]; // Array of 2 SVG paths
  imageSrc: string;
  imageAlt?: string;
  frameSrc?: string;
}

export default function CardWelcome({
  leftSvgs,
  imageSrc,
  imageAlt = "Welcome image",
  frameSrc,
}: CardWelcomeProps) {
  // Ensure we have exactly 2 SVGs
  const svgs = leftSvgs.slice(0, 2);
  while (svgs.length < 2) {
    svgs.push("/assets/placeholder.svg"); // Placeholder if missing
  }

  return (
    <ContentCard frameSrc={frameSrc}>
      <div className="grid md:grid-cols-[1fr_1fr] grid-cols-1 gap-4 md:gap-6 lg:gap-8 h-full min-h-[60vh]">
        {/* Left side - Two SVGs stacked vertically with equal spacing */}
        <div className="flex flex-col justify-center items-center gap-6 md:gap-8 lg:gap-10 h-full">
          {svgs.map((svg, index) => (
            <div
              key={index}
              className="relative w-full flex-1 min-h-[120px] sm:min-h-[150px] md:min-h-[180px] lg:min-h-[200px]"
            >
              <Image
                src={svg}
                alt={`Welcome SVG ${index + 1}`}
                fill
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
          ))}
        </div>

        {/* Right side - Image */}
        <div className="relative w-full h-full min-h-[250px] sm:min-h-[300px] md:min-h-[400px] lg:min-h-[500px] flex items-center justify-center">
          <div className="relative w-full h-full">
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
    </ContentCard>
  );
}

