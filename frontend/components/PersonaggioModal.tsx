import React, { useState, useEffect } from 'react';
import { Galleria } from 'primereact/galleria';
import { Dialog } from 'primereact/dialog';

interface PersonaggioModalProps {
    visible: boolean;
    onHide: () => void;
}

export default function PersonaggioModal({ visible, onHide }: PersonaggioModalProps) {
    const [images, setImages] = useState<any[]>([]);

    useEffect(() => {
        // Simulo il caricamento delle immagini
        const mockImages = [
            {
                itemImageSrc: '/Ribelle_pigro_ink.jpeg',
                thumbnailImageSrc: '/Ribelle_pigro_ink.jpeg',
                alt: 'Ribelle Pigro Ink',
                title: 'Ribelle Pigro Ink'
            },
            {
                itemImageSrc: '/Ribelle_il_pigro_sign.jpeg',
                thumbnailImageSrc: '/Ribelle_il_pigro_sign.jpeg',
                alt: 'Ribelle il Pigro Sign',
                title: 'Ribelle il Pigro Sign'
            }
        ];
        setImages(mockImages);
    }, []);

    const itemTemplate = (item: any) => {
        return (
            <img 
                src={item.itemImageSrc} 
                alt={item.alt} 
                style={{ width: '100%', height: '400px', objectFit: 'contain', display: 'block' }} 
            />
        );
    };

    const thumbnailTemplate = (item: any) => {
        return (
            <img 
                src={item.thumbnailImageSrc} 
                alt={item.alt} 
                style={{ width: '60px', height: '60px', objectFit: 'cover', display: 'block' }} 
            />
        );
    };

    return (
        <Dialog 
            visible={visible} 
            onHide={onHide}
            header="Galleria Personaggi"
            style={{ width: '90vw', maxWidth: '1000px' }}
            modal
            maximizable
        >
            <div className="flex flex-col md:flex-row gap-6">
                {/* Galleria a sinistra */}
                <div className="flex-1">
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
                </div>
                
                {/* Testo descrittivo a destra */}
                <div className="flex-1 md:max-w-md">
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-2xl font-bold mb-4 text-gray-800">I Personaggi</h3>
                        
                        <div className="space-y-4 text-gray-700">
                            <p>
                                <strong>Ribelle il Pigro</strong> è il protagonista della nostra galleria d'arte. 
                                Un personaggio unico che rappresenta la creatività e l'originalità dell'arte contemporanea.
                            </p>
                            
                            <p>
                                Questa collezione presenta diverse interpretazioni artistiche del personaggio, 
                                mostrando l'evoluzione stilistica e le diverse tecniche utilizzate dall'artista.
                            </p>
                            
                            <div className="bg-white p-4 rounded border-l-4 border-blue-500">
                                <h4 className="font-semibold mb-2">Caratteristiche principali:</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Stile distintivo e riconoscibile</li>
                                    <li>Uso creativo del colore e della forma</li>
                                    <li>Rappresentazione emotiva e espressiva</li>
                                    <li>Tecnica mista su supporti diversi</li>
                                </ul>
                            </div>
                            
                            <p className="text-sm text-gray-600 italic">
                                Ogni opera racconta una storia diversa, mantenendo sempre l'essenza 
                                del personaggio che l'ha ispirata.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}