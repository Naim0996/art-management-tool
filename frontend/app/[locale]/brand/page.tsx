"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';

export default function BrandPage() {
  const t = useTranslations('personaggi');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(false);
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-left text-black mb-8">Brand</h1>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Caricamento brand...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-left text-black mb-6 md:mb-8">Brand</h1>

      {/* Grid responsive: 4 colonne web, 1 colonna mobile */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Placeholder for future brand content */}
        <div className="col-span-full text-center py-12">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
            <div className="text-5xl mb-4">🎨</div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">Sezione Brand</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Questa sezione mostrerà i brand e marchi associati ai personaggi.
            </p>
            <p className="text-xs text-gray-500">
              In fase di sviluppo - Struttura pronta per l&apos;integrazione con il backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

