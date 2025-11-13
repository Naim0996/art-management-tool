"use client";

import Image from "next/image";
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function HeaderComponent() {
    const locale = useLocale();
    const navRouter = useRouter();
    const pathname = usePathname();
    const [isAnimantraOpen, setIsAnimantraOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNavigate = (path: string) => {
        navRouter.push(`/${locale}${path}`);
        setIsMobileMenuOpen(false);
    };

    const toggleLanguage = () => {
        const newLocale = locale === 'it' ? 'en' : 'it';
        // Rimuovi il prefisso locale corrente dal pathname
        const currentPath = pathname.replace(`/${locale}`, '') || '';
        // Hard reload per forzare il ricaricamento dei messaggi next-intl
        window.location.href = `/${newLocale}${currentPath}`;
    };

    return (
        <>
            {/* Navigation Bar - Sticky Header with Wood Texture */}
            <header className="sticky top-0 z-50">
                {/* Desktop Header */}
                <div 
                    className="hidden md:flex items-center justify-between px-6 py-4"
                    style={{
                        marginTop: '10px',
                        backgroundImage: 'url(/assets/Vector.svg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        minHeight: '70px',
                        overflow: 'visible'
                    }}
                >
                    {/* Logo - completely on the left */}
                    <div
                        className="cursor-pointer flex-shrink-0" 
                        onClick={() => handleNavigate('')}
                        style={{
                            position: 'relative',
                            zIndex: 60,
                            marginTop: '-50px',
                            marginBottom: '-50px',
                            marginLeft: '-40px'
                        }}
                    >
                        <Image 
                            src="/assets/LOGO_SITO-02 1.svg" 
                            alt="Giorgio Privitera Lab" 
                            width={700} 
                            height={280}
                            priority
                        />
                    </div>

                    {/* Navigation Buttons - completely on the right */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '0px',
                        height: '110px',
                        marginBottom: '15px'
                    }}>
                        {/* Fumetti Button */}
                        <button
                            onClick={() => handleNavigate('/fumetti')}
                            style={{ 
                                height: '110px', 
                                width: '220px',
                                padding: 0,
                                margin: 0,
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: 0,
                                flexShrink: 0,
                                flexBasis: '220px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Image 
                                src="/assets/pulsante_fumetti.svg" 
                                alt="Fumetti" 
                                width={220} 
                                height={110}
                                style={{ 
                                    display: 'block',
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        </button>

                        {/* Animantra Button with Dropdown */}
                        <div 
                            onMouseEnter={() => setIsAnimantraOpen(true)}
                            onMouseLeave={() => setIsAnimantraOpen(false)}
                            style={{ 
                                position: 'relative',
                                height: '110px',
                                width: '220px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                flexBasis: '220px'
                            }}
                        >
                            <button
                                style={{ 
                                    height: '110px', 
                                    width: '220px',
                                    padding: 0,
                                    margin: 0,
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: 0
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <Image 
                                    src="/assets/pulsante_animantra.svg" 
                                    alt="Animantra" 
                                    width={220} 
                                    height={110}
                                    style={{ 
                                        display: 'block',
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {isAnimantraOpen && (
                                <div 
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        backgroundColor: '#8B6F47',
                                        border: '2px solid #6E4220',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        minWidth: '160px',
                                        zIndex: 50,
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        marginTop: '-2px'
                                    }}
                                >
                                    <button
                                        onClick={() => handleNavigate('/brand')}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '12px 16px',
                                            backgroundColor: 'rgba(110, 66, 32, 0.3)',
                                            color: 'white',
                                            fontWeight: '600',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(110, 66, 32, 0.5)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(110, 66, 32, 0.3)'}
                                    >
                                        Brand
                                    </button>
                                    <button
                                        onClick={() => handleNavigate('/personaggi')}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '12px 16px',
                                            backgroundColor: 'rgba(110, 66, 32, 0.3)',
                                            color: 'white',
                                            fontWeight: '600',
                                            border: 'none',
                                            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(110, 66, 32, 0.5)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(110, 66, 32, 0.3)'}
                                    >
                                        Personaggi
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Shop Button */}
                        <button
                            onClick={() => handleNavigate('/shop')}
                            style={{ 
                                height: '110px', 
                                width: '220px',
                                padding: 0,
                                margin: 0,
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: 0,
                                flexShrink: 0,
                                flexBasis: '220px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Image 
                                src="/assets/pulsante_shop.svg" 
                                alt="Shop" 
                                width={220} 
                                height={110}
                                style={{ 
                                    display: 'block',
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        </button>

                        <button
                            onClick={toggleLanguage}
                            title={locale === 'it' ? 'Switch to English' : 'Passa all\'Italiano'}
                            style={{
                                position: 'relative',
                                width: '240px',
                                height: '130px',
                                padding: 0,
                                margin: 0,
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: 0,
                                flexShrink: 0,
                                flexBasis: '220px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Image 
                                src="/assets/pulsante_lingua.svg" 
                                alt="Language" 
                                width={240} 
                                height={130}
                                style={{ 
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'fill',
                                }}
                            />
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: 1,
                                    color: '#6E4220',
                                    fontWeight: '900',
                                    fontSize: '24px',
                                    pointerEvents: 'none',
                                    lineHeight: 1,
                                    letterSpacing: '2px',
                                    marginTop: '28px',
                                    marginRight: '5px',
                                }}
                            >
                                {locale.toUpperCase()}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Mobile Header */}
                <div 
                    className="md:hidden flex items-center justify-between px-4 py-3"
                    style={{
                        backgroundImage: 'url(/assets/Vector.svg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        minHeight: '70px',
                        overflow: 'visible'
                    }}
                >
                    {/* Logo - height = texture (112px) + 20px = 132px */}
                    <div
                        className="cursor-pointer" 
                        onClick={() => handleNavigate('')}
                        style={{
                            position: 'relative',
                            zIndex: 60,
                            marginTop: '-26px',
                            marginBottom: '-26px'
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

                    {/* Hamburger Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-white hover:bg-white/20 rounded-md transition-colors"
                        aria-label="Toggle menu"
                    >
                        <svg 
                            className="w-6 h-6" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            {isMobileMenuOpen ? (
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M6 18L18 6M6 6l12 12" 
                                />
                            ) : (
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M4 6h16M4 12h16M4 18h16" 
                                />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div 
                        className="md:hidden shadow-lg"
                        style={{
                            backgroundColor: '#F5F5DC',
                            borderTop: '3px solid #6E4220'
                        }}
                    >
                        <button
                            onClick={() => handleNavigate('/fumetti')}
                            className="w-full text-left px-6 py-4 transition-colors font-semibold text-lg"
                            style={{
                                color: '#6E4220',
                                borderBottom: '1px solid #D4A574'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E8D5B7'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            Fumetti
                        </button>

                        {/* Animantra with Submenu */}
                        <div>
                            <button
                                onClick={() => setIsAnimantraOpen(!isAnimantraOpen)}
                                className="w-full text-left px-6 py-4 transition-colors font-semibold text-lg flex items-center justify-between"
                                style={{
                                    color: '#6E4220',
                                    borderBottom: '1px solid #D4A574'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E8D5B7'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <span>Animantra</span>
                                <svg 
                                    className={`w-5 h-5 transition-transform ${isAnimantraOpen ? 'rotate-180' : ''}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                    style={{ color: '#6E4220' }}
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2.5} 
                                        d="M19 9l-7 7-7-7" 
                                    />
                                </svg>
                            </button>

                            {isAnimantraOpen && (
                                <div style={{ backgroundColor: '#8B6F47' }}>
                                    <button
                                        onClick={() => handleNavigate('/brand')}
                                        className="w-full text-left px-10 py-3 transition-colors font-medium text-white"
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(110, 66, 32, 0.5)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        Brand
                                    </button>
                                    <button
                                        onClick={() => handleNavigate('/personaggi')}
                                        className="w-full text-left px-10 py-3 transition-colors font-medium text-white"
                                        style={{
                                            borderTop: '1px solid rgba(255, 255, 255, 0.2)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(110, 66, 32, 0.5)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        Personaggi
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => handleNavigate('/shop')}
                            className="w-full text-left px-6 py-4 transition-colors font-semibold text-lg"
                            style={{
                                color: '#6E4220',
                                borderBottom: '1px solid #D4A574'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E8D5B7'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            Shop
                        </button>

                        <button
                            onClick={toggleLanguage}
                            className="w-full text-left px-6 py-4 transition-colors font-semibold text-lg"
                            style={{
                                color: '#6E4220'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E8D5B7'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {locale.toUpperCase()}
                        </button>
                    </div>
                )}
            </header>
        </>
    );
}