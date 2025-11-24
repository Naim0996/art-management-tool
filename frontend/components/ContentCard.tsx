"use client";

import { ReactNode } from "react";

export interface ContentCardProps {
  children: ReactNode;
  frameSrc?: string;
  className?: string;
}

export default function ContentCard({
  children,
  frameSrc = "/assets/card_cornice.svg",
  className = "",
}: ContentCardProps) {
  return (
    <div className={`relative w-full ${className}`}>
      {/* Frame border - outer container */}
      <div className="relative w-full min-h-[70vh]">
        {/* Frame SVG - covers entire area as border */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <img
            src={frameSrc}
            alt="Card frame"
            className="w-full h-full"
            style={{
              objectFit: 'fill',
            }}
          />
        </div>

        {/* Black background - visible only inside frame */}
        <div 
          className="absolute inset-0 z-0 bg-black"
          style={{
            clipPath: `url(${frameSrc}#clip)`,
            WebkitClipPath: `url(${frameSrc}#clip)`,
          }}
        >
          {/* Content area */}
          <div className="w-full h-full p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

