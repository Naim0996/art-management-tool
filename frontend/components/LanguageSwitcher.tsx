"use client";

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Dropdown } from 'primereact/dropdown';
import { useState } from 'react';

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

export default function LanguageSwitcher() {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const languages: LanguageOption[] = [
    { code: 'it', name: t('italian'), flag: '🇮🇹' },
    { code: 'en', name: t('english'), flag: '🇺🇸' }
  ];

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(
    languages.find(lang => lang.code === locale) || languages[0]
  );

  const handleLanguageChange = (e: { value: LanguageOption }) => {
    const newLocale = e.value.code;
    setSelectedLanguage(e.value);
    
    // Sostituisce la locale nel pathname corrente
    const segments = pathname.split('/');
    segments[1] = newLocale; // La locale è sempre il primo segmento dopo /
    const newPath = segments.join('/');
    
    router.push(newPath);
  };

  const itemTemplate = (option: LanguageOption) => {
    return (
      <div className="flex align-items-center gap-2">
        <span className="text-lg">{option.flag}</span>
        <span>{option.name}</span>
      </div>
    );
  };

  const valueTemplate = (option: LanguageOption) => {
    if (option) {
      return (
        <div className="flex align-items-center justify-content-center" style={{ padding: '0.25rem 0' }}>
          <span className="text-xl">{option.flag}</span>
        </div>
      );
    }
    return <span>Select...</span>;
  };

  return (
    <Dropdown
      value={selectedLanguage}
      options={languages}
      onChange={handleLanguageChange}
      itemTemplate={itemTemplate}
      valueTemplate={valueTemplate}
      className="w-auto"
      style={{ 
        minWidth: '6rem',
        height: '2.5rem'
      }}
      panelClassName="text-sm w-auto"
      showClear={false}
    />
  );
}