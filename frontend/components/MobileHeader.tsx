"use client";

import Image from 'next/image';

interface MobileHeaderProps {
  onNavigate: (path: string) => void;
  onLanguageToggle: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isAnimantraOpen: boolean;
  setIsAnimantraOpen: (open: boolean) => void;
  locale: string;
}

export default function MobileHeader({
  onNavigate,
  onLanguageToggle,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isAnimantraOpen,
  setIsAnimantraOpen,
  locale,
}: MobileHeaderProps) {
  return (
    <>
      <div
        className="md:hidden flex items-center justify-between py-3"
        style={{
          marginLeft: '0px',
          marginRight: '0px',
          paddingLeft: '16px',
          paddingRight: '16px',
          backgroundImage: 'url(/assets/Vector.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '70px',
          overflow: 'visible',
          width: '100%',
        }}
      >
        <div
          className="cursor-pointer"
          onClick={() => onNavigate('')}
          style={{
            position: 'relative',
            zIndex: 60,
            marginTop: '-26px',
            marginBottom: '-26px',
          }}
        >
          <Image
            src="/assets/LOGO_SITO-02 1.svg"
            alt="Giorgio Privitera Lab"
            width={260}
            height={132}
            priority
          />
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-white hover:bg-white/20 rounded-md transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          className="md:hidden shadow-lg"
          style={{
            backgroundColor: '#F5F5DC',
            borderTop: '3px solid #6E4220',
          }}
        >
          <MobileMenuItem label="Fumetti" onClick={() => onNavigate('/fumetti')} />

          <div>
            <button
              onClick={() => setIsAnimantraOpen(!isAnimantraOpen)}
              className="w-full text-left px-4 py-4 transition-colors font-semibold text-lg flex items-center justify-between block"
              style={{
                color: '#6E4220',
                borderBottom: '1px solid #D4A574',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E8D5B7')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span>Animantra</span>
              <svg
                className={`w-5 h-5 transition-transform ${isAnimantraOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: '#6E4220' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isAnimantraOpen && (
              <div style={{ backgroundColor: '#8B6F47', borderRadius: '0 0 6px 6px' }}>
                <MobileSubMenuItem label="Brand" onClick={() => onNavigate('/brand')} />
                <MobileSubMenuItem label="Personaggi" onClick={() => onNavigate('/personaggi')} hasBorder />
              </div>
            )}
          </div>

          <MobileMenuItem label="Shop" onClick={() => onNavigate('/shop')} />
          <MobileMenuItem label={locale.toUpperCase()} onClick={onLanguageToggle} noBorder />
        </div>
      )}
    </>
  );
}

function MobileMenuItem({ label, onClick, noBorder = false }: { label: string; onClick: () => void; noBorder?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-4 transition-colors font-semibold text-lg block"
      style={{
        color: '#6E4220',
        borderBottom: noBorder ? 'none' : '1px solid #D4A574',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E8D5B7')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {label}
    </button>
  );
}

function MobileSubMenuItem({ label, onClick, hasBorder = false }: { label: string; onClick: () => void; hasBorder?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 transition-colors font-medium text-white"
      style={{
        borderTop: hasBorder ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(110, 66, 32, 0.5)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {label}
    </button>
  );
}
