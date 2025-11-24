"use client";

import Image from "next/image";
import Link from "next/link";
import ContentCard from "./ContentCard";

export interface CardAnimantraProps {
  leftSvgs: string[]; // Array of 3 SVG paths
  imageSrc: string;
  imageAlt?: string;
  buttonLabel: string;
  buttonHref: string;
  buttonImageSrc: string;
  frameSrc?: string;
}

export default function CardAnimantra({
  leftSvgs,
  imageSrc,
  imageAlt = "Animantra image",
  buttonLabel,
  buttonHref,
  buttonImageSrc,
  frameSrc,
}: CardAnimantraProps) {
  // Ensure we have exactly 3 SVGs
  const svgs = leftSvgs.slice(0, 3);
  while (svgs.length < 3) {
    svgs.push("/assets/placeholder.svg"); // Placeholder if missing
  }

  return (
    <ContentCard frameSrc={frameSrc}>
      <div className="grid md:grid-cols-[1fr_1fr] grid-cols-1 gap-4 md:gap-6 lg:gap-8 h-full min-h-[60vh]">
        {/* Left side - Three SVGs stacked vertically, aligned */}
        <div className="flex flex-col justify-center items-center gap-4 md:gap-5 lg:gap-6 h-full">
          {svgs.map((svg, index) => (
            <div
              key={index}
              className="relative w-full flex-1 min-h-[100px] sm:min-h-[120px] md:min-h-[140px] lg:min-h-[160px]"
            >
              <Image
                src={svg}
                alt={`Animantra SVG ${index + 1}`}
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

        {/* Right side - Image + Button positioned at bottom right */}
        <div className="relative w-full h-full min-h-[250px] sm:min-h-[300px] md:min-h-[400px] lg:min-h-[500px] flex flex-col">
          {/* Image container */}
          <div className="relative w-full h-full flex-1 mb-4 md:mb-6">
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

          {/* Button positioned at bottom right */}
          <div className="relative w-full flex justify-end items-end">
            <Link href={buttonHref} className="block">
              <div className="relative w-32 h-10 sm:w-36 sm:h-11 md:w-40 md:h-12 lg:w-48 lg:h-14">
                <Image
                  src={buttonImageSrc}
                  alt={buttonLabel}
                  fill
                  className="object-contain hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </ContentCard>
  );
}

