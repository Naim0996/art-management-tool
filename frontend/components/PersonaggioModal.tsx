/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { Galleria } from 'primereact/galleria';
import { Dialog } from 'primereact/dialog';
import { useTranslations } from 'next-intl';
import { PersonaggioData } from '@/services/PersonaggiService';

interface PersonaggioModalProps {
    visible: boolean;
    onHide: () => void;
    personaggio: PersonaggioData | null;
}

interface GalleriaImage {
    itemImageSrc: string;
    thumbnailImageSrc: string;
    alt: string;
}

export default function PersonaggioModal({ visible, onHide, personaggio }: PersonaggioModalProps) {
    const t = useTranslations('personaggi.modal');
    const [images, setImages] = useState<GalleriaImage[]>([]);

    useEffect(() => {
        // Usa le immagini del personaggio selezionato
        if (personaggio && personaggio.images && personaggio.images.length > 0) {
            const formattedImages = personaggio.images.map(img => ({
                itemImageSrc: img.src,
                thumbnailImageSrc: img.thumbnail || img.src,
                alt: img.alt,
                title: img.title
            }));
            setImages(formattedImages);
        } else if (visible) {
            // Fallback alle immagini predefinite solo se il modal è visibile
            const mockImages = [
                {
                    itemImageSrc: '/personaggi/ribelle/Ribelle_pigro_ink.jpeg',
                    thumbnailImageSrc: '/personaggi/ribelle/Ribelle_pigro_ink.jpeg',
                    alt: 'Ribelle Pigro Ink',
                    title: 'Ribelle Pigro Ink'
                },
                {
                    itemImageSrc: '/personaggi/ribelle/Ribellepigro_nome.jpeg',
                    thumbnailImageSrc: '/personaggi/ribelle/Ribellepigro_nome.jpeg',
                    alt: 'Ribelle il Pigro Sign',
                    title: 'Ribelle il Pigro Sign'
                }
            ];
            setImages(mockImages);
        } else {
            // Svuota le immagini quando il modal è chiuso
            setImages([]);
        }
    }, [personaggio, visible]);

    const itemTemplate = (item: GalleriaImage) => {
        if (!item || !item.itemImageSrc) {
            return <div className="w-full h-96 bg-gray-200 flex items-center justify-center">No Image</div>;
        }
        return (
            <img 
                src={item.itemImageSrc} 
                alt={item.alt || 'Image'} 
                style={{ width: '100%', height: '400px', objectFit: 'contain', display: 'block' }} 
            />
        );
    };

    const thumbnailTemplate = (item: GalleriaImage) => {
        if (!item || !item.thumbnailImageSrc) {
            return <div className="w-15 h-15 bg-gray-200"></div>;
        }
        return (
            <img 
                src={item.thumbnailImageSrc} 
                alt={item.alt || 'Thumbnail'} 
                style={{ width: '60px', height: '60px', objectFit: 'cover', display: 'block' }} 
            />
        );
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
        >
            <div className="flex flex-col md:flex-row gap-6">
                {/* Galleria a sinistra */}
                <div className="flex-1">
                    {images && images.length > 0 ? (
                        <Galleria 
                            value={images} 
                            numVisible={3} 
                            circular 
                            style={{ maxWidth: '100%' }} 
                            showItemNavigators 
                            showItemNavigatorsOnHover 
                            showIndicators
                            showThumbnails={true} 
                            item={itemTemplate} 
                            thumbnail={thumbnailTemplate}
                            thumbnailsPosition="bottom"
                        />
                    ) : (
                        <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">Nessuna immagine disponibile</p>
                        </div>
                    )}
                </div>
                
                {/* Testo descrittivo a destra */}
                <div className="flex-1 md:max-w-md">
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-2xl font-bold mb-4 text-gray-800">
                            {personaggio?.name || t('charactersTitle')}
                        </h3>
                        
                        <div className="space-y-4 text-gray-700">
                            <p>
                                <strong>{personaggio?.name || 'Ribelle il Pigro'}</strong>{' '}
                                {personaggio?.description || t('description1')}
                            </p>
                            
                            <p>
                                {t('description2')}
                            </p>
                            
                            <div className="bg-white p-4 rounded border-l-4 border-blue-500">
                                <h4 className="font-semibold mb-2">{t('characteristicsTitle')}</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>{t('characteristics.style')}</li>
                                    <li>{t('characteristics.color')}</li>
                                    <li>{t('characteristics.emotion')}</li>
                                    <li>{t('characteristics.technique')}</li>
                                </ul>
                            </div>
                            
                            {personaggio && (
                                <div className="bg-blue-50 p-3 rounded">
                                    <span className="text-sm font-medium text-blue-800">
                                        {personaggio.images.length} {personaggio.images.length === 1 ? 'immagine' : 'immagini'} disponibili
                                    </span>
                                </div>
                            )}
                            
                            <p className="text-sm text-gray-600 italic">
                                {t('finalNote')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}