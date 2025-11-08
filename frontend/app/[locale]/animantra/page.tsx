"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { Button } from "primereact/button";

export default function AnimantraPage() {
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 md:mb-6">
            Animantra
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto mb-6 md:mb-8">
            Esplora il mondo creativo di Animantra: personaggi unici e brand originali nati dall&apos;immaginazione di un artista fumettista
          </p>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Personaggi Card */}
          <Link 
            href={`/${locale}/personaggi`}
            className="group"
          >
            <div className="bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-all duration-150 p-8 h-full flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <i className="pi pi-users text-3xl text-white"></i>
              </div>
              <h2 className="text-3xl font-bold text-black mb-4">Personaggi</h2>
              <p className="text-gray-600 mb-6 flex-grow text-sm">
                Scopri la galleria dei personaggi unici, ognuno con la propria personalità e storia. Esplora le illustrazioni e le loro caratteristiche distintive.
              </p>
              <button
                className="px-6 py-2.5 text-white rounded-lg font-semibold transition-all duration-150"
                style={{ backgroundColor: '#0066CC' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0052A3'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066CC'}
              >
                Esplora Personaggi →
              </button>
            </div>
          </Link>

          {/* Brand Card */}
          <Link 
            href={`/${locale}/brand`}
            className="group"
          >
            <div className="bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-all duration-150 p-8 h-full flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-orange-600 rounded-full flex items-center justify-center mb-6">
                <i className="pi pi-tag text-3xl text-white"></i>
              </div>
              <h2 className="text-3xl font-bold text-black mb-4">Brand</h2>
              <p className="text-gray-600 mb-6 flex-grow text-sm">
                Scopri i brand e marchi associati al mondo Animantra. Ogni brand racconta una storia e rappresenta un&apos;identità unica.
              </p>
              <button
                className="px-6 py-2.5 text-white rounded-lg font-semibold transition-all duration-150"
                style={{ backgroundColor: '#0066CC' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0052A3'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066CC'}
              >
                Esplora Brand →
              </button>
            </div>
          </Link>
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 text-center max-w-4xl mx-auto">
          <div className="bg-gray-100 rounded-lg p-8 border border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Il Mondo Animantra
            </h3>
            <p className="text-gray-700 leading-relaxed text-sm">
              Animantra è un universo creativo dove personaggi e brand si fondono in un&apos;esperienza artistica unica. 
              Ogni elemento è stato creato con passione e dedizione, rappresentando l&apos;evoluzione stilistica di un artista fumettista. 
              Esplora le diverse sezioni per immergerti completamente in questo mondo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

