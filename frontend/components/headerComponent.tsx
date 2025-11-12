"use client";

import Image from "next/image";
import { useLocale } from 'next-intl';
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HeaderComponent() {
    const locale = useLocale();
    const navRouter = useRouter();
    const [isAnimantraOpen, setIsAnimantraOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNavigate = (path: string) => {
        navRouter.push(`/${locale}${path}`);
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Navigation Bar - Sticky Header with Wood Texture */}
            <header className="sticky top-0 z-50">
                {/* Desktop Header */}
                <div 
                    className="hidden md:flex items-center justify-between px-6 py-4"
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
                        className="cursor-pointer flex-shrink-0" 
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
                            width={360} 
                            height={132}
                            priority
                        />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-3">
                        {/* Fumetti Button */}
                        <button
                            onClick={() => handleNavigate('/fumetti')}
                            className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                        >
                            <Image 
                                src="/assets/Fumetti.svg" 
                                alt="Fumetti" 
                                width={110} 
                                height={42}
                            />
                        </button>

                        {/* Animantra Button with Dropdown */}
                        <div 
                            className="relative"
                            onMouseEnter={() => setIsAnimantraOpen(true)}
                            onMouseLeave={() => setIsAnimantraOpen(false)}
                        >
                            <button
                                className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                            >
                                <Image 
                                    src="/assets/personaggiButton.svg" 
                                    alt="Animantra" 
                                    width={110} 
                                    height={42}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {isAnimantraOpen && (
                                <div 
                                    className="absolute top-full left-0 shadow-xl rounded-md overflow-hidden min-w-[160px] z-50"
                                    style={{
                                        backgroundColor: '#8B6F47',
                                        border: '2px solid #6E4220',
                                        marginTop: '-2px'
                                    }}
                                >
                                    <button
                                        onClick={() => handleNavigate('/brand')}
                                        className="w-full text-left px-4 py-3 transition-colors text-white font-semibold hover:bg-opacity-80"
                                        style={{
                                            backgroundColor: 'rgba(110, 66, 32, 0.3)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(110, 66, 32, 0.5)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(110, 66, 32, 0.3)'}
                                    >
                                        Brand
                                    </button>
                                    <button
                                        onClick={() => handleNavigate('/personaggi')}
                                        className="w-full text-left px-4 py-3 transition-colors text-white font-semibold"
                                        style={{
                                            backgroundColor: 'rgba(110, 66, 32, 0.3)',
                                            borderTop: '1px solid rgba(255, 255, 255, 0.2)'
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
                            className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                        >
                            <Image 
                                src="/assets/shopButton.svg" 
                                alt="Shop" 
                                width={80} 
                                height={42}
                            />
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
                                color: '#6E4220'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E8D5B7'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            Shop
                        </button>
                    </div>
                )}
            </header>
        </>
    );
}