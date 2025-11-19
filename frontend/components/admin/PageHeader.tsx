import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string | ReactNode;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: {
    label: string;
    icon: string;
    onClick: () => void;
    severity?: 'success' | 'info' | 'warning' | 'danger' | 'help';
  }[];
}

export default function PageHeader({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  actions = [],
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <div className="flex gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              label={action.label}
              icon={action.icon}
              onClick={action.onClick}
              severity={action.severity}
            />
          ))}
        </div>
      </div>
      {onSearchChange && (
        <div className="flex gap-2">
          <span className="p-input-icon-left flex-1">
            <i className="pi pi-search" />
            <InputText
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full"
            />
          </span>
        </div>
      )}
    </div>
  );
}
