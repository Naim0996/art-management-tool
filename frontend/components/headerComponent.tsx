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
                className="flex align-items-center cursor-pointer px-3 py-2 overflow-hidden relative font-semibold text-base uppercase p-ripple" 
                style={{ 
                    borderRadius: '0.5rem',
                    color: '#1f2937',
                    transition: 'all 150ms'
                }} 
                onClick={item.command}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <span>{item.label}</span>
                <Ripple />
            </a>
        );
    };

    const submenuItemRenderer = (item: any) => {
        return (
            <a 
                className="flex align-items-center cursor-pointer overflow-hidden relative p-ripple" 
                style={{ 
                    color: '#1f2937',
                    transition: 'all 150ms',
                    fontWeight: 'normal',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    padding: '0.5rem 1rem'
                }}
                onClick={item.command}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <span>{item.label}</span>
                <Ripple />
            </a>
        );
    };

    const items = [
        {
            label: t('fumetti'),
            template: itemRenderer,
            command: () => {
                navRouter.push(`/${locale}/fumetti`);
            }
        },
        {
            label: t('animantra'),
            template: itemRenderer,
            items: [
                [
                    {
                        items: [
                            {
                                label: t('brand'),
                                template: submenuItemRenderer,
                                command: () => {
                                    navRouter.push(`/${locale}/brand`);
                                }
                            },
                            {
                                label: t('personaggi'),
                                template: submenuItemRenderer,
                                command: () => {
                                    navRouter.push(`/${locale}/personaggi`);
                                }
                            }
                        ]
                    }
                ]
            ]
        },
        {
            label: 'Shop',
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
        </div>
    );

    return (
        <>
            {/* Navigation Bar - Fixed Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
                <div className="card">
                    <MegaMenu 
                        model={items}
                        orientation="horizontal" 
                        start={start}
                        end={end}
                        breakpoint="960px" 
                        className="p-3" 
                        style={{ 
                            borderRadius: '0',
                            backgroundColor: '#ffffff',
                            border: 'none'
                        }}
                        pt={{
                            root: {
                                className: 'flex align-items-center',
                                style: { 
                                    backgroundColor: '#ffffff', 
                                    display: 'flex',
                                    width: '100%'
                                }
                            },
                            start: {
                                className: 'flex',
                                style: { flex: '0 0 auto' }
                            },
                            menu: {
                                className: 'flex gap-4 p-0 m-0 border-none bg-transparent shadow-none',
                                style: { 
                                    marginLeft: 'auto',
                                    flex: '1 1 auto',
                                    justifyContent: 'flex-end',
                                    paddingRight: '1rem'
                                }
                            },
                            end: {
                                className: 'flex align-items-center gap-3',
                                style: { flex: '0 0 auto' }
                            },
                            menuButton: {
                                className: 'ml-auto',
                                style: { color: '#1f2937' }
                            },
                            submenu: {
                                style: { 
                                    backgroundColor: '#ffffff', 
                                    border: 'none',
                                    boxShadow: 'none',
                                    padding: '0'
                                }
                            },
                            panel: {
                                className: 'p-0 m-0'
                            }
                        }}
                    />
                </div>
            </div>
        </>
    );
}