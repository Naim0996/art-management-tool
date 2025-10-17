
import Link from "next/link";

export default function Home() {



  return (
    <div className="w-full overflow-x-hidden">
        {/* Hero Section with Background Image */}
        <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden w-full">
          {/* Artistic Gradient Background (replace with custom image later) */}
          <div 
            className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
            style={{
              backgroundAttachment: 'fixed'
            }}
          >
            {/* Artistic overlay pattern */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)'
            }}></div>
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 text-center py-12 px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
              Benvenuti nel Mondo dei Personaggi
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
              Esplora i personaggi unici creati dall&apos;immaginazione di un artista fumettista
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/shop"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow-lg hover:shadow-xl"
              >
                Inizia Shopping
              </Link>
              <Link 
                href="/personaggi"
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-semibold shadow-lg hover:shadow-xl"
              >
                Scopri Personaggi
              </Link>
            </div>
          </div>
        </div>

        {/* Services Section - What a Comic Artist Can Offer */}
        <div className="py-16 px-4 bg-white">
          <h3 className="text-4xl font-bold mb-12 text-center text-gray-900">Servizi Offerti</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <span className="text-4xl">✏️</span>
              <div>
                <h4 className="font-bold text-xl mb-2 text-gray-900">Character Design</h4>
                <p className="text-gray-700">Creazione di personaggi originali con personalità uniche, dal concept iniziale al design finale</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <span className="text-4xl">📖</span>
              <div>
                <h4 className="font-bold text-xl mb-2 text-gray-900">Tavole Fumettistiche</h4>
                <p className="text-gray-700">Realizzazione di tavole complete con layout dinamici, sequenze narrative e storytelling visivo</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <span className="text-4xl">🎨</span>
              <div>
                <h4 className="font-bold text-xl mb-2 text-gray-900">Illustrazioni Custom</h4>
                <p className="text-gray-700">Illustrazioni personalizzate per copertine, poster, merchandising e progetti editoriali</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <span className="text-4xl">�️</span>
              <div>
                <h4 className="font-bold text-xl mb-2 text-gray-900">Storyboard & Concept Art</h4>
                <p className="text-gray-700">Sviluppo di storyboard per animazioni, film e video, con attenzione ai dettagli narrativi</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <span className="text-4xl">�</span>
              <div>
                <h4 className="font-bold text-xl mb-2 text-gray-900">Character Sheets</h4>
                <p className="text-gray-700">Fogli di riferimento completi con espressioni facciali, pose e turnaround per animatori</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <span className="text-4xl">�</span>
              <div>
                <h4 className="font-bold text-xl mb-2 text-gray-900">Graphic Novel & Copertine</h4>
                <p className="text-gray-700">Design di copertine impattanti e layout per graphic novel, manga e webcomics</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}