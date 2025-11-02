"use client";

import { useTranslations } from 'next-intl';

export default function FooterComponent() {
    const t = useTranslations('footer');
    
    return (
        <footer className="bg-gray-900 text-white py-8 border-t border-gray-700 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-gray-400 text-sm">{t('copyright')}</p>
            </div>
        </footer>
    );
}