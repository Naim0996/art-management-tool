/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import { MegaMenu } from "primereact/megamenu";
import { Ripple } from "primereact/ripple";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

export default function HeaderComponent() {
    const t = useTranslations('navigation');
    const locale = useLocale();
    const navRouter = useRouter();

    const itemRenderer = (item: any) => {
        return (
            <a 
                className="flex align-items-center cursor-pointer px-3 py-2 overflow-hidden relative font-semibold text-base uppercase p-ripple hover:surface-ground" 
                style={{ borderRadius: '2rem' }} 
                onClick={item.command}
            >
                <span className={item.icon} />
                <span className="ml-2">{item.label}</span>
                <Ripple />
            </a>
        );
    };

    const items = [
        {
            label: t('fumetti'),
            icon: 'pi pi-book',
            template: itemRenderer,
            command: () => {
                navRouter.push(`/${locale}/fumetti`);
            }
        },
        {
            label: t('personaggi'),
            icon: 'pi pi-users',
            template: itemRenderer,
            command: () => {
                navRouter.push(`/${locale}/personaggi`);
            }
        },
        {
            label: locale === 'it' ? 'Shop' : 'Shop',
            icon: 'pi pi-shopping-cart',
            template: itemRenderer,
            command: () => {
                navRouter.push(`/${locale}/shop`);
            }
        }
    ];

    const start = (
        <div
            className="cursor-pointer" 
            onClick={() => navRouter.push(`/${locale}`)}
        >
            <Image src="/logo.jpeg" alt="Logo" width={120} height={40} />
        </div>
    );

    const end = (
        <div className="flex align-items-center gap-3">
            <LanguageSwitcher />
            <Link href={`/${locale}/cart`} className="p-button p-component p-button-icon-only p-button-rounded" title="Shopping Cart">
                <i className="pi pi-shopping-cart"></i>
            </Link>
        </div>
    );

    return (
        <>
            {/* Navigation Bar - Sticky Header */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
                <div className="card">
                    <MegaMenu 
                        model={items}
                        orientation="horizontal" 
                        start={start}
                        end={end}
                        breakpoint="960px" 
                        className="p-3 surface-0 shadow-2" 
                        style={{ 
                            borderRadius: '3rem',
                        }}
                        pt={{
                            root: {
                                className: 'flex justify-content-between align-items-center'
                            },
                            menu: {
                                className: 'flex gap-2 p-0 m-0 border-none bg-transparent shadow-none ml-auto'
                            },
                            menuButton: {
                                className: 'ml-auto'
                            }
                        }}
                    />
                </div>
            </div>
        </>
    );
}