"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function BrandPage() {
  const locale = useLocale();
  const t = useTranslations('brand');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(false);
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Caricamento...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Banner Section */}
      <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden w-full">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60"></div>
          
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center px-4 py-12">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl">
                {t('title')}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto drop-shadow-md">
                {t('subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href={`/${locale}/personaggi`}
                  className="px-8 py-4 text-white rounded-lg transition-all duration-150 text-lg font-semibold inline-block"
                  style={{ backgroundColor: '#0066CC' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0052A3'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066CC'}
                >
                  {t('discoverCharacters')}
                </Link>
                <Link 
                  href={`/${locale}/shop`}
                  className="px-8 py-4 text-white rounded-lg transition-all duration-150 text-lg font-semibold inline-block"
                  style={{ backgroundColor: '#0066CC' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0052A3'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066CC'}
                >
                  {t('visitShop')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

