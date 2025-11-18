"use client";

import HeaderLogo from './HeaderLogo';
import NavButton from './NavButton';
import DropdownMenu from './DropdownMenu';
import DropdownItem from './DropdownItem';

interface DesktopHeaderProps {
  onNavigate: (path: string) => void;
  onLanguageToggle: () => void;
  isAnimantraOpen: boolean;
  setIsAnimantraOpen: (open: boolean) => void;
  locale: string;
}

export default function DesktopHeader({
  onNavigate,
  onLanguageToggle,
  isAnimantraOpen,
  setIsAnimantraOpen,
  locale,
}: DesktopHeaderProps) {
  return (
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
        justifyContent: 'space-between',
      }}
    >
      <HeaderLogo onClick={() => onNavigate('')} />

      <div
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
          flexShrink: 0,
        }}
      >
        <NavButton
          imageSrc="/assets/pulsante_fumetti.svg"
          alt="Fumetti"
          onClick={() => onNavigate('/fumetti')}
          style={{ marginTop: '10px' }}
        />

        <DropdownMenu
          isOpen={isAnimantraOpen}
          onMouseEnter={() => setIsAnimantraOpen(true)}
          onMouseLeave={() => setIsAnimantraOpen(false)}
          button={
            <NavButton
              imageSrc="/assets/pulsante_animantra.svg"
              alt="Animantra"
              onClick={() => {}}
              style={{
                height: 'clamp(40px, 4.5vw, 80px)',
                width: 'clamp(105px, 10.5vw, 160px)',
                marginLeft: '-1px',
                marginRight: '-1px',
              }}
              imageStyle={{ objectFit: 'contain' }}
            />
          }
        >
          <DropdownItem label="Brand" onClick={() => onNavigate('/brand')} isFirst />
          <DropdownItem label="Personaggi" onClick={() => onNavigate('/personaggi')} />
        </DropdownMenu>

        <NavButton
          imageSrc="/assets/pulsante_shop.svg"
          alt="Shop"
          onClick={() => onNavigate('/shop')}
          style={{
            height: 'clamp(32px, 3.5vw, 60px)',
            width: 'clamp(85px, 8.5vw, 140px)',
            marginLeft: '-1px',
            marginRight: '-1px',
          }}
          imageStyle={{ objectFit: 'contain' }}
        />

        <NavButton
          imageSrc={locale === 'it' ? '/assets/pulsante_lingua_it.svg' : '/assets/pulsante_lingua_en.svg'}
          alt="Language"
          onClick={onLanguageToggle}
          style={{
            height: 'clamp(32px, 3.5vw, 60px)',
            width: 'clamp(85px, 8.5vw, 140px)',
            marginLeft: '-1px',
          }}
        />
      </div>
    </div>
  );
}
