import { useRef } from 'react';
import { Toast } from 'primereact/toast';

export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

export interface ShowToastOptions {
  severity: ToastSeverity;
  summary: string;
  detail?: string;
  life?: number;
}

export function useToast() {
  const toast = useRef<Toast>(null);

  const showToast = ({
    severity,
    summary,
    detail,
    life = 3000,
  }: ShowToastOptions) => {
    toast.current?.show({
      severity,
      summary,
      detail,
      life,
    });
  };

  const showSuccess = (summary: string, detail?: string) => {
    showToast({ severity: 'success', summary, detail });
  };

  const showError = (summary: string, detail?: string) => {
    showToast({ severity: 'error', summary, detail });
  };

  const showInfo = (summary: string, detail?: string) => {
    showToast({ severity: 'info', summary, detail });
  };

  const showWarning = (summary: string, detail?: string) => {
    showToast({ severity: 'warn', summary, detail });
  };

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}
