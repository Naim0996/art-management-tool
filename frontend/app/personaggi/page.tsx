"use client";

import Image from "next/image";
import { useState } from "react";
import PersonaggioModal from "@/components/PersonaggioModal";

export default function PersonaggiPage() {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Personaggi</h1>

      {/* Contenuto della pagina dei personaggi - sempre 2 colonne */}
      <div 
        id="personaggio-row" 
        className="grid grid-cols-2 gap-4 justify-center cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setModalVisible(true)}
      >
        <div className="bg-blue-100 rounded-lg p-2 sm:p-4 hover:shadow-lg transition-shadow">
          <div className="relative w-full aspect-square">
            <Image
              src="/Ribelle_pigro_ink.jpeg"
              alt="Ribelle Pigro Ink"
              fill
              className="object-contain rounded-lg"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            />
          </div>
        </div>
        <div className="bg-red-100 rounded-lg p-2 sm:p-4 hover:shadow-lg transition-shadow">
          <div className="relative w-full aspect-square">
            <Image
              src="/Ribelle_il_pigro_sign.jpeg"
              alt="Ribelle il Pigro Sign"
              fill
              className="object-contain rounded-lg"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            />
          </div>
        </div>
      </div>

      {/* Modal con la galleria */}
      <PersonaggioModal 
        visible={modalVisible} 
        onHide={() => setModalVisible(false)} 
      />
    </div>
  );
}
