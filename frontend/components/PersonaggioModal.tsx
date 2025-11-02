/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import type { PersonaggioDTO } from '@/services/PersonaggiAPIService';

interface PersonaggioModalProps {
    visible: boolean;
    onHide: () => void;
    personaggio: PersonaggioDTO | null;
}

export default function PersonaggioModal({ visible, onHide, personaggio }: PersonaggioModalProps) {
    const t = useTranslations('personaggi.modal');
    const locale = useLocale();
    const router = useRouter();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        // Usa le immagini del personaggio selezionato
        if (personaggio && personaggio.images && personaggio.images.length > 0) {
            setImages(personaggio.images);
            setCurrentImageIndex(0);
        } else {
            setImages([]);
            setCurrentImageIndex(0);
        }
    }, [personaggio, visible]);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToImage = (index: number) => {
        setCurrentImageIndex(index);
    };

    return (
        <Dialog
            visible={visible}
            onHide={onHide}
            header={personaggio?.name || t('title')}
            style={{ width: '90vw', maxWidth: '1000px' }}
            modal
            draggable={false}
            resizable={false}
            className="p-dialog-mobile-optimized"
            pt={{
                content: {
                    className: 'p-2 md:p-6'
                }
            }}
        >
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                {/* Galleria a sinistra */}
                <div className="flex-1">
                    {images && images.length > 0 ? (
                        <div className="w-full">
                            {/* Immagine principale */}
                            <div className="relative w-full h-[400px] mb-4 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                                <img 
                                    src={images[currentImageIndex]} 
                                    alt={`${personaggio?.name} - Image ${currentImageIndex + 1}`}
                                    className="max-w-full max-h-full object-contain"
                                />
                                
                                {/* Navigazione immagini (frecce) */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all duration-200 hover:scale-110"
                                            aria-label="Immagine precedente"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all duration-200 hover:scale-110"
                                            aria-label="Immagine successiva"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                                
                                {/* Indicatori punti (in alto) */}
                                {images.length > 1 && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
                                        {images.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => goToImage(index)}
                                                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                                    index === currentImageIndex 
                                                        ? 'bg-blue-500 w-8' 
                                                        : 'bg-gray-400 hover:bg-gray-500'
                                                }`}
                                                aria-label={`Vai all'immagine ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Carousel thumbnails (in basso) */}
                            {images.length > 1 && (
                                <div className="relative bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    {/* Scroll container */}
                                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                                        {images.map((img, index) => (
                                            <button
                                                key={index}
                                                onClick={() => goToImage(index)}
                                                className={`flex-shrink-0 relative w-20 h-20 rounded-lg border-2 transition-all duration-200 ${
                                                    index === currentImageIndex 
                                                        ? 'border-blue-500 ring-2 ring-blue-300' 
                                                        : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                                aria-label={`Anteprima ${index + 1}`}
                                            >
                                                <img 
                                                    src={img} 
                                                    alt={`Thumbnail ${index + 1}`}
                                                    className="w-full h-full object-cover rounded"
                                                />
                                                {index === currentImageIndex && (
                                                    <div className="absolute inset-0 bg-blue-500/10" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">Nessuna immagine disponibile</p>
                        </div>
                    )}
                </div>
                
                {/* Testo descrittivo a destra */}
                <div className="flex-1 md:max-w-md">
                    <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                        <h3 className="text-2xl font-bold mb-4 text-gray-800">
                            {personaggio?.name}
                        </h3>
                        
                        <div className="space-y-4 text-gray-700">
                            {personaggio?.description && (
                                <p className="text-base leading-relaxed">
                                    {personaggio.description}
                                </p>
                            )}
                            
                            {personaggio && (
                                <div className="bg-blue-50 p-3 rounded">
                                    <span className="text-sm font-medium text-blue-800">
                                        {personaggio.images.length} {personaggio.images.length === 1 ? 'immagine' : 'immagini'} disponibili
                                    </span>
                                </div>
                            )}
                            
                            {/* Link allo shop */}
                            {personaggio && personaggio.id && (
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <Button
                                        label="Vai allo Shop"
                                        icon="pi pi-shopping-cart"
                                        className="w-full"
                                        onClick={() => {
                                            router.push(`/${locale}/shop?character=${personaggio.id}`);
                                            onHide();
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}