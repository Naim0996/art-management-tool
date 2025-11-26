"use client";

import { useTranslations } from 'next-intl';

export default function FooterComponent() {
  const t = useTranslations('footer');

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://instagram.com/giorgiopriviteralab',
      icon: (
        <svg
          className="w-7 h-7"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm9 1a1 1 0 100 2 1 1 0 000-2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" />
        </svg>
      ),
    },
    {
      name: 'TikTok',
      href: 'https://www.tiktok.com/@giorgiopriviteralab',
      icon: (
        <svg
          className="w-7 h-7"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M21 8.5a6.5 6.5 0 01-4.5-1.8V14a6 6 0 11-6-6c.17 0 .34.01.5.03V11a3 3 0 103 3V3h3.5a6.5 6.5 0 006.5 6.5V13a9 9 0 11-9-9c.17 0 .34.01.5.02V8.5a3 3 0 003 3 3 3 0 003-3V8.5z" />
        </svg>
      ),
    },
    {
      name: 'Etsy',
      href: 'https://www.etsy.com/shop/giorgiopriviteralab',
      icon: (
        <svg
          className="w-7 h-7"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M6 3h12v2H8v14h10v2H6V3zm5 3h6v2h-4v3h4v2h-4v5h-2V6z" />
        </svg>
      ),
    },
    {
      name: 'Linktree',
      href: 'https://linktr.ee/giorgioprivitera',
      icon: (
        <svg
          className="w-7 h-7"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 4v8.82c0 4.54-3.07 8.83-7.09 9.95C8.07 21.83 5 17.54 5 13V8.18l7-3.82z" />
          <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-black text-white py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-12 sm:px-16 lg:px-24 xl:px-32">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Sezione sinistra - Titolo e Contatti */}
          <div className="flex-1">
            <h2 className="skranji-title text-white mb-6" style={{ fontSize: '37px' }}>
              {t('labName')}
            </h2>
            
            <div className="space-y-2">
              <h3 className="text-white font-semibold mb-2">{t('contact.title')}</h3>
              <div className="space-y-1 text-sm text-white">
                <div>{t('contact.emailLabel')}:</div>
                <a 
                  href={`mailto:${t('contact.email1')}`} 
                  className="block hover:text-gray-300 transition-colors"
                >
                  {t('contact.email1')}
                </a>
                <a 
                  href={`mailto:${t('contact.email2')}`} 
                  className="block hover:text-gray-300 transition-colors"
                >
                  {t('contact.email2')}
                </a>
              </div>
            </div>

            {/* Social - visibili solo su mobile, sotto i contatti */}
            <div className="md:hidden mt-6">
              <h3 className="text-white font-semibold mb-4">{t('social.title')}</h3>
              <div className="flex gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.name}
                    className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Social - visibili solo su desktop, a destra */}
          <div className="hidden md:flex flex-1 flex-col items-end">
            <h3 className="text-white font-semibold mb-4">{t('social.title')}</h3>
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                  className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright centrato in fondo */}
        <p className="text-white text-xs pt-8 text-center">{t('copyright')}</p>
      </div>
    </footer>
  );
}