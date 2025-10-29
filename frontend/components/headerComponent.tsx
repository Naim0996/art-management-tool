/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
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

    return (
        <>
            {/* Navigation Bar - Sticky Header */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
                <div className="card">
                    <MegaMenu 
                        model={items}
                        orientation="horizontal" 
                        start={start}
                        breakpoint="960px" 
                        className="p-3 surface-0 shadow-2" 
                        style={{ 
                            borderRadius: '3rem',
                        }}
                        pt={{
                            menu: {
                                style: {
                                    marginLeft: 'auto'
                                }
                            },
                            menuButton: {
                                style: {
                                    marginLeft: 'auto'
                                }
                            }
                        }}
                    />
                </div>
            </div>
        </>
    );
}