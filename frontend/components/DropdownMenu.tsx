import { ReactNode } from 'react';

interface DropdownMenuProps {
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  button: ReactNode;
  children: ReactNode;
}

export default function DropdownMenu({
  isOpen,
  onMouseEnter,
  onMouseLeave,
  button,
  children,
}: DropdownMenuProps) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'relative',
        height: 'clamp(40px, 4.5vw, 80px)',
        width: 'clamp(105px, 10.5vw, 160px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        margin: '0px',
        padding: '0px',
      }}
    >
      {button}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            backgroundColor: '#8B6F47',
            border: '2px solid #6E4220',
            borderRadius: '6px',
            overflow: 'hidden',
            minWidth: '130px',
            zIndex: 100,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            marginTop: '-2px',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
