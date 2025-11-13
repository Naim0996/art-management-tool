"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

export default function Home() {
  const locale = useLocale();
  const t = useTranslations('hero');

  return (
    <div className="w-full overflow-x-hidden bg-white min-h-screen py-20">
      {/* Purple Card Container */}
      <div className="max-w-7xl mx-auto px-16">
        <div 
          className="relative rounded-3xl shadow-2xl py-20 px-12"
          style={{
            background: 'linear-gradient(135deg, #6B46C1 0%, #7C3AED 50%, #8B5CF6 100%)'
          }}
        >
          {/* Subtle overlay for depth */}
          <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
          
          {/* Main content container */}
          <div className="relative z-10">
            <div className="grid md:grid-cols-2 gap-20 items-center">
            
            {/* Left side - Text content */}
            <div className="text-left space-y-6">
              {/* Title with JungleFever font */}
              <h1 className="junglefever-title text-black">
                {t('title')}
              </h1>
              
              {/* Subtitle with JungleFever font */}
              <h2 className="junglefever-subtitle text-black">
                {t('subtitle')}
              </h2>
              
              {/* Description text */}
              <p className="text-black text-base md:text-lg leading-relaxed max-w-xl">
                {t('description')}
              </p>
              
              {/* CTA Buttons with wooden style */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link 
                  href={`/${locale}/shop`}
                  className="inline-block"
                >
                  <Image
                    src="/assets/pulsante_shopping.svg"
                    alt={t('startShopping')}
                    width={280}
                    height={80}
                    className="hover:scale-105 transition-transform duration-200"
                  />
                </Link>
                
                <Link 
                  href={`/${locale}/personaggi`}
                  className="inline-block"
                >
                  <Image
                    src="/assets/pulsante_personaggi.svg"
                    alt={t('discoverCharacters')}
                    width={280}
                    height={80}
                    className="hover:scale-105 transition-transform duration-200"
                  />
                </Link>
              </div>
            </div>
            
            {/* Right side - Character image */}
            <div className="flex justify-center items-center p-8">
              <div className="relative w-full max-w-md">
                {/* Placeholder for skull/character image */}
                <div className="relative aspect-square bg-black/20 rounded-2xl border-4 border-black/30 flex items-center justify-center p-8">
                  <Image
                    src="/images/hero-character.png"
                    alt="Character"
                    width={300}
                    height={300}
                    className="object-contain"
                    priority
                    onError={(e) => {
                      // Fallback to placeholder if image doesn't exist
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-white/50 text-center p-12">
                    <div>
                      <p className="text-xl font-bold mb-2">Character Image</p>
                      <p className="text-sm">Place your skull/character image at:</p>
                      <p className="text-xs font-mono mt-2">/frontend/public/images/hero-character.png</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}