import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ReactNode } from 'react';

interface FormDialogProps {
  visible: boolean;
  title: string;
  onHide: () => void;
  onSave: () => void;
  children: ReactNode;
  loading?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  maxWidth?: string;
}

export default function FormDialog({
  visible,
  title,
  onHide,
  onSave,
  children,
  loading = false,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  maxWidth = '600px',
}: FormDialogProps) {
  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label={cancelLabel}
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
        disabled={loading}
      />
      <Button
        label={saveLabel}
        icon="pi pi-check"
        onClick={onSave}
        loading={loading}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={title}
      footer={footer}
      style={{ width: maxWidth }}
      modal
    >
      {children}
    </Dialog>
  );
}
