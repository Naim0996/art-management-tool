import Image from 'next/image';

interface HeaderLogoProps {
  onClick: () => void;
}

export default function HeaderLogo({ onClick }: HeaderLogoProps) {
  return (
    <div
      className="cursor-pointer flex-shrink-0"
      onClick={onClick}
      style={{
        position: 'relative',
        zIndex: 60,
        marginTop: '-50px',
        marginBottom: '-50px',
        marginLeft: '0px',
        maxWidth: 'min(700px, calc(50% - 200px))',
        width: 'auto',
        height: 'auto',
        flexShrink: 1,
        minWidth: '200px',
      }}
    >
      <Image
        src="/assets/LOGO_SITO-02 1.svg"
        alt="Giorgio Privitera Lab"
        width={700}
        height={280}
        priority
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: '700px',
          minWidth: '200px',
        }}
      />
    </div>
  );
}
