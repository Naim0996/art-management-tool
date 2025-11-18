interface DropdownItemProps {
  label: string;
  onClick: () => void;
  isFirst?: boolean;
}

export default function DropdownItem({ label, onClick, isFirst = false }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '10px 13px',
        backgroundColor: 'rgba(110, 66, 32, 0.3)',
        color: 'white',
        fontWeight: '600',
        border: 'none',
        borderTop: isFirst ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(110, 66, 32, 0.5)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(110, 66, 32, 0.3)')}
    >
      {label}
    </button>
  );
}
