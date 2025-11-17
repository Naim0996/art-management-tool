import Image from 'next/image';
import { CSSProperties } from 'react';

interface NavButtonProps {
  imageSrc: string;
  alt: string;
  onClick: () => void;
  style?: CSSProperties;
  imageStyle?: CSSProperties;
}

export default function NavButton({ 
  imageSrc, 
  alt, 
  onClick, 
  style,
  imageStyle 
}: NavButtonProps) {
  const defaultStyle: CSSProperties = {
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
    lineHeight: 0,
    flexShrink: 0,
    ...style,
  };

  const defaultImageStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'fill',
    display: 'block',
    margin: '0px',
    padding: '0px',
    ...imageStyle,
  };

  return (
    <button
      onClick={onClick}
      style={defaultStyle}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <Image
        src={imageSrc}
        alt={alt}
        width={180}
        height={90}
        style={defaultImageStyle}
      />
    </button>
  );
}
