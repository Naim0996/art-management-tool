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
        const currentPath = pathname.replace(`/${locale}`, '') || '';
        window.location.href = `/${newLocale}${currentPath}`;
    };

    return (
        <>
            {/* Navigation Bar - Sticky Header with Wood Texture */}
            <header className="sticky top-0 z-50"
                style={{ 
                    marginTop: '0px'
                }}>
            {/* Desktop Header */}
            <div 
                className="hidden md:flex items-center relative"
                style={{
                    marginTop: '0px',
                    marginLeft: '30px',
                    marginRight: '30px',
                    paddingLeft: 'clamp(120px, 8vw, 180px)',
                    paddingRight: 'clamp(120px, 8vw, 180px)',
                    paddingTop: '16px',
                    paddingBottom: '16px',
                    backgroundImage: 'url(/assets/Vector.svg)',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '112px',
                    height: 'auto',
                    overflow: 'visible',
                    width: 'calc(100% - 60px)',
                    maxWidth: '100%',
                    justifyContent: 'space-between'
                }}
            >
                {/* Logo - responsive on the left */}
                <div
                    className="cursor-pointer flex-shrink-0" 
                    onClick={() => handleNavigate('')}
                    style={{
                        position: 'relative',
                        zIndex: 60,
                        marginTop: '-50px',
                        marginBottom: '-50px',
                        marginLeft: '0px',
                        maxWidth: 'min(700px, calc(50% - 200px))',
                        width: 'auto',
                        height: 'auto',
                        flexShrink: 1,
                        minWidth: '200px'
                    }}
                >
                    <Image 
                        src="/assets/LOGO_SITO-02 1.svg" 
                        alt="Giorgio Privitera Lab" 
                        width={700} 
                        height={280}
                        priority
                        style={{
                            width: '100%',
                            height: 'auto',
                            maxWidth: '700px',
                            minWidth: '200px'
                        }}
                    />
                </div>

                {/* Navigation Buttons - responsive on the right */}
                <div
                    className="flex-shrink-0"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '24px',
                        padding: '0px',
                        flexWrap: 'nowrap',
                        width: 'auto',
                        height: 'auto',
                        maxWidth: 'min(calc(50% - 100px), 600px)',
                        minWidth: '400px',
                        marginLeft: 'auto',
                        flexShrink: 0
                    }}
                >
                        {/* Fumetti Button */}
                        <button
                            onClick={() => handleNavigate('/fumetti')}
                            style={{
                                height: 'clamp(45px, 5vw, 90px)',
                                width: 'clamp(115px, 11.5vw, 180px)',
                                padding: '0px',
                                margin: '0px',
                                marginRight: '-1px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: '10px',
                                lineHeight: 0,
                                flexShrink: 0
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <Image
                                    src="/assets/pulsante_fumetti.svg"
                                    alt="Fumetti"
                                    width={180} 
                                    height={90}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'fill',
                                        display: 'block',
                                        margin: '0px',
                                        padding: '0px'
                                    }}
                                />
                        </button>
                        {/* Animantra Button with Dropdown */}
                        <div
                            onMouseEnter={() => setIsAnimantraOpen(true)}
                            onMouseLeave={() => setIsAnimantraOpen(false)}
                            style={{
                                position: 'relative',
                                height: 'clamp(40px, 4.5vw, 80px)',
                                width: 'clamp(105px, 10.5vw, 160px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                margin: '0px',
                                padding: '0px'
                            }}
                        >
                            <button
                                style={{
                                    height: 'clamp(40px, 4.5vw, 80px)',
                                    width: 'clamp(105px, 10.5vw, 160px)',
                                    padding: '0px',
                                    margin: '0px',
                                    marginLeft: '-1px',
                                    marginRight: '-1px',
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
                                    width={180}
                                    height={90}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        display: 'block',
                                        margin: '0px',
                                        padding: '0px'
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
                                        minWidth: '130px',
                                        zIndex: 100,
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        marginTop: '-2px'
                                    }}
                                >
                                    <button
                                        onClick={() => handleNavigate('/brand')}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '10px 13px',
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
                                            padding: '10px 13px',
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
                                height: 'clamp(32px, 3.5vw, 60px)',
                                width: 'clamp(85px, 8.5vw, 140px)',
                                padding: '0px',
                                margin: '0px',
                                marginLeft: '-1px',
                                marginRight: '-1px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: 0,
                                flexShrink: 0
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <Image
                                    src="/assets/pulsante_shop.svg"
                                    alt="Shop"
                                    width={140}
                                    height={60}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        display: 'block',
                                        margin: '0px',
                                        padding: '0px'
                                    }}
                                />
                            </button>
                        {/* Language Button */}
                        <button
                            onClick={toggleLanguage}
                            title={locale === 'it' ? 'Switch to English' : 'Passa all\'Italiano'}
                            style={{
                                position: 'relative',
                                width: 'clamp(85px, 8.5vw, 140px)',
                                height: 'clamp(32px, 3.5vw, 60px)',
                                padding: '0px',
                                margin: '0px',
                                marginLeft: '-1px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: 0,
                                flexShrink: 0
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <Image
                                    src="/assets/pulsante_lingua.svg"
                                    alt="Language"
                                    width={140}
                                    height={60}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'fill',
                                        display: 'block',
                                        margin: '0px',
                                        padding: '0px'
                                    }}
                                />
                            </button>
                </div>
            </div>

                {/* Mobile Header */}
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
                        width: '100%'
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
                            className="w-full text-left px-4 py-4 transition-colors font-semibold text-lg block"
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
                                className="w-full text-left px-4 py-4 transition-colors font-semibold text-lg flex items-center justify-between block"
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
                                <div style={{ backgroundColor: '#8B6F47', borderRadius: '0 0 6px 6px' }}>
                                    <button
                                        onClick={() => handleNavigate('/brand')}
                                        className="w-full text-left px-4 py-3 transition-colors font-medium text-white"
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(110, 66, 32, 0.5)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        Brand
                                    </button>
                                    <button
                                        onClick={() => handleNavigate('/personaggi')}
                                        className="w-full text-left px-4 py-3 transition-colors font-medium text-white"
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
                            className="w-full text-left px-4 py-4 transition-colors font-semibold text-lg block"
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
                            className="w-full text-left px-4 py-4 transition-colors font-semibold text-lg block"
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