import Image from 'next/image';

interface LanguageSwitcherButtonProps {
  onClick: () => void;
}

export default function LanguageSwitcherButton({ onClick }: LanguageSwitcherButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 'clamp(40px, 4.5vw, 80px)',
        width: 'clamp(80px, 8vw, 140px)',
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
        flexShrink: 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <Image
        src="/assets/language_switch.svg"
        alt="Switch Language"
        width={140}
        height={80}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          margin: '0px',
          padding: '0px',
        }}
      />
    </button>
  );
}
