"use client";

import Image from "next/image";
import { useTranslations, useLocale } from 'next-intl';

import { Button } from "primereact/button";
import { MegaMenu } from "primereact/megamenu";
import { Ripple } from "primereact/ripple";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

export default function HeaderComponent() {
    const t = useTranslations('navigation');
    const locale = useLocale();
    const navRouter = useRouter();

    const itemRenderer = (item: any, options: any) => {
        if (item.root) {
            return (
                <a className="flex align-items-center cursor-pointer px-3 py-2 overflow-hidden relative font-semibold text-lg uppercase p-ripple hover:surface-ground" style={{ borderRadius: '2rem' }} onClick={() => options.onClick && options.onClick()} >
                    <span className={item.icon} />
                    <span className="ml-2">{item.label}</span>
                    <Ripple />
                </a>
            );
        } else if (!item.image) {
            return (
                <a className="flex align-items-center p-3 cursor-pointer mb-2 gap-2 " onClick={() => options.onClick && options.onClick()}>
                    <span className="inline-flex align-items-center justify-content-center border-circle bg-primary w-3rem h-3rem">
                        <i className={`${item.icon} text-lg`}></i>
                    </span>
                    <span className="inline-flex flex-column gap-1">
                        <span className="font-medium text-lg text-900">{item.label}</span>
                        <span className="white-space-nowrap">{item.subtext}</span>
                    </span>
                </a>
            );
        } else {
            return (
                <div className="flex flex-column align-items-start gap-3" onClick={() => options.onClick && options.onClick()}>
                    <img alt="megamenu-demo" src={item.image} className="w-full" />
                    <span>{item.subtext}</span>
                    <Button className="p-button p-component p-button-outlined" label={item.label} />
                </div>
            );
        }
    };
    const items = [
        {
            label: t('home'),
            root: true,
            template: itemRenderer,
            command: () => {
                navRouter.push(`/${locale}`);
            }
        },
        {
            label: t('artGallery'),
            root: true,
            template: itemRenderer,
            items: [
                [
                    {
                        items: [
                            {
                                label: t('fumetti'), icon: 'pi pi-list', template: itemRenderer, command: () => {
                                    navRouter.push(`/${locale}/fumetti`);
                                },
                            },
                            {
                                label: t('personaggi'), icon: 'pi pi-users', template: itemRenderer, command: () => {
                                    navRouter.push(`/${locale}/personaggi`);
                                },
                            }
                        ]
                    }
                ]
            ]
        },
        {
            label: t('contact'),
            root: true,
            template: itemRenderer
        }
    ];

    const end = (
        <div className="flex align-items-center justify-content-center mr-4" style={{ height: '100%' }}>
            <LanguageSwitcher />
        </div>
    );

    const start = <Image src="/logo.jpeg" alt="Logo" width={75} height={25} />;



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
                    />
                </div>
            </div>
        </>
    );

}