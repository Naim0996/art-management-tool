import { useState } from 'react';

export function useFormDialog<T>(initialData: T) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState<T>(initialData);
  const [editingItem, setEditingItem] = useState<{ id?: number } | null>(null);

  const openDialog = (item?: { id?: number } & Partial<T>) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...initialData, ...item });
    } else {
      setEditingItem(null);
      setFormData(initialData);
    }
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingItem(null);
    setFormData(initialData);
  };

  const updateFormData = (updates: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const isEditing = !!editingItem?.id;

  return {
    showDialog,
    formData,
    editingItem,
    isEditing,
    openDialog,
    closeDialog,
    updateFormData,
    setFormData,
  };
}
