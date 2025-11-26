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
          className="w-5 h-5 md:w-6 md:h-6 text-white hover:text-gray-300 transition-colors"
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
          className="w-5 h-5 md:w-6 md:h-6 text-white hover:text-gray-300 transition-colors"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      ),
    },
    {
      name: 'Etsy',
      href: 'https://www.etsy.com/shop/giorgiopriviteralab',
      icon: (
        <svg
          className="w-5 h-5 md:w-6 md:h-6 text-white hover:text-gray-300 transition-colors"
          fill="currentColor"
          viewBox="0 0 97.75 97.75"
          aria-hidden="true"
        >
          <path d="M48.875,0C21.882,0,0,21.883,0,48.875S21.882,97.75,48.875,97.75S97.75,75.867,97.75,48.875S75.868,0,48.875,0z M78.729,68.146c-0.556,4.598-1.133,9.192-1.649,13.795c-0.19,1.713-0.125,1.703-1.881,1.683 c-13.405-0.167-26.809-0.384-40.214-0.459c-4.803-0.028-9.607,0.289-14.412,0.44c-0.636,0.021-1.271,0.004-2.027,0.004 c0-1.336,0-2.629,0-4.129c1.713-0.338,3.529-0.674,5.334-1.063c0.742-0.16,1.478-0.392,2.181-0.674 c1.061-0.427,1.727-1.216,1.88-2.38c0.071-0.547,0.179-1.096,0.184-1.644c0.092-10.002,0.218-20.003,0.232-30.004 c0.009-6.213-0.15-12.425-0.252-18.636c-0.057-3.517-0.988-4.611-4.417-5.266c-1.457-0.277-2.93-0.497-4.372-0.833 c-0.348-0.083-0.843-0.506-0.871-0.81c-0.104-1.133-0.041-2.279-0.041-3.516c19.228,0.32,38.347,1.13,57.646-0.536 c-0.404,6.527-0.809,13.066-1.221,19.722c-1.169,0-2.239,0.093-3.277-0.049c-0.367-0.052-0.828-0.62-0.955-1.04 c-0.588-1.948-1.023-3.943-1.613-5.892c-0.346-1.132-0.812-2.241-1.346-3.299c-1.207-2.395-3.019-3.681-5.888-3.632 c-6.896,0.121-13.794,0.037-20.69,0.041c-1.754,0.002-1.806,0.06-1.808,1.778c-0.01,7.748-0.016,15.497-0.022,23.244 c-0.002,0.423,0,0.846,0,1.378c3.049,0,5.932,0.048,8.813-0.018c1.867-0.041,3.731-0.225,5.595-0.379 c2.549-0.211,3.455-0.955,4.096-3.415c0.48-1.846,0.91-3.705,1.326-5.567c0.164-0.734,0.498-1.072,1.303-1.015 c1.014,0.072,2.037,0.018,3.199,0.018c0,0.677,0.006,1.284,0,1.894c-0.062,7.271-0.141,14.542-0.164,21.813 c-0.004,0.967-0.228,1.352-1.266,1.357c-3.055,0.022-3.053,0.063-3.773-2.92c-0.26-1.072-0.521-2.146-0.803-3.211 c-0.647-2.455-2.479-3.359-4.783-3.435c-4.335-0.146-8.676-0.188-13.015-0.271c-0.118-0.002-0.237,0.063-0.47,0.125 c-0.021,0.481-0.063,0.979-0.064,1.476c-0.01,6.472-0.016,12.942-0.018,19.413c-0.003,4.021,1.512,5.972,5.546,6.086 c6.204,0.178,12.423,0.049,18.629-0.141c3.754-0.113,6.325-2.312,7.935-5.58c1.312-2.666,2.512-5.392,3.621-8.146 c0.49-1.221,1.129-1.787,2.451-1.584c0.573,0.09,1.174,0.015,1.98,0.015C79.141,64.745,78.934,66.445,78.729,68.146z"/>
        </svg>
      ),
    },
    {
      name: 'Linktree',
      href: 'https://linktr.ee/giorgioprivitera',
      icon: (
        <svg
          className="w-5 h-5 md:w-6 md:h-6 text-white hover:text-gray-300 transition-colors"
          fill="currentColor"
          viewBox="0 0 80 80"
          aria-hidden="true"
        >
          <path d="M0.2,33.1h24.2L7.1,16.7l9.5-9.6L33,23.8V0h14.2v23.8L63.6,7.1l9.5,9.6L55.8,33H80v13.5H55.7l17.3,16.7   l-9.5,9.4L40,49.1L16.5,72.7L7,63.2l17.3-16.7H0V33.1H0.2z M33.1,65.8h14.2v32H33.1V65.8z"/>
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