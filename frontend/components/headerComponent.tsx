"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import DesktopHeader from './DesktopHeader';
import MobileHeader from './MobileHeader';

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
        <header className="sticky top-0 z-50" style={{ marginTop: '0px' }}>
            <DesktopHeader
                onNavigate={handleNavigate}
                onLanguageToggle={toggleLanguage}
                isAnimantraOpen={isAnimantraOpen}
                setIsAnimantraOpen={setIsAnimantraOpen}
                locale={locale}
            />
            <MobileHeader
                onNavigate={handleNavigate}
                onLanguageToggle={toggleLanguage}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                isAnimantraOpen={isAnimantraOpen}
                setIsAnimantraOpen={setIsAnimantraOpen}
                locale={locale}
            />
        </header>
    );
}