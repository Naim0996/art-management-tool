import { useState, useCallback } from 'react';
import { FumettoDTO, FumettiAPIService } from '@/services/FumettiAPIService';

interface UseFumettoManagementProps {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarn: (message: string) => void;
}

export default function useFumettoManagement({
  showSuccess,
  showError,
  showWarn,
}: UseFumettoManagementProps) {
  const [fumetti, setFumetti] = useState<FumettoDTO[]>([]);
  const [deletedFumetti, setDeletedFumetti] = useState<FumettoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFumetto, setEditingFumetto] = useState<FumettoDTO | null>(null);

  const loadFumetti = useCallback(async () => {
    setLoading(true);
    try {
      const [activeResponse, deletedResponse] = await Promise.all([
        FumettiAPIService.getAllFumettiAdmin(),
        FumettiAPIService.getDeletedFumetti(),
      ]);
      setFumetti(activeResponse);
      setDeletedFumetti(deletedResponse);
    } catch (error) {
      console.error('Error loading fumetti:', error);
      showError('Failed to load fumetti');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const handleSave = useCallback(
    async (formData: Partial<FumettoDTO>, isEditing: boolean, editingFumetto: FumettoDTO | null) => {
      try {
        if (!formData.title) {
          showWarn('Title is required');
          return;
        }

        const dataToSave = {
          ...formData,
          pages: formData.pages || [],
        };

        if (isEditing && editingFumetto) {
          await FumettiAPIService.updateFumetto(editingFumetto.id!, dataToSave as FumettoDTO);
          showSuccess('Fumetto updated successfully');
        } else {
          await FumettiAPIService.createFumetto(
            dataToSave as Omit<FumettoDTO, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
          );
          showSuccess('Fumetto created successfully');
        }

        loadFumetti();
        return true;
      } catch (error) {
        console.error('Error saving fumetto:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to save fumetto';
        showError(errorMessage);
        return false;
      }
    },
    [showSuccess, showError, showWarn, loadFumetti]
  );

  const handleSaveForUpload = useCallback(
    async (formData: Partial<FumettoDTO>, editingFumetto: FumettoDTO | null): Promise<number | undefined> => {
      if (!formData.title) {
        throw new Error('Title is required');
      }

      try {
        if (editingFumetto) {
          return editingFumetto.id;
        } else {
          const dataToSave = {
            ...formData,
            pages: formData.pages || [],
          };

          const newFumetto = await FumettiAPIService.createFumetto(
            dataToSave as Omit<FumettoDTO, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
          );

          setEditingFumetto(newFumetto);
          showSuccess('Fumetto created successfully');

          return newFumetto.id;
        }
      } catch (error) {
        console.error('Error saving fumetto:', error);
        throw error;
      }
    },
    [showSuccess]
  );

  const handleSaveAfterUpload = useCallback(
    async (editingFumetto: FumettoDTO | null): Promise<Partial<FumettoDTO> | undefined> => {
      if (!editingFumetto?.id) {
        return;
      }

      try {
        const updatedFumetto = await FumettiAPIService.getFumettoAdmin(editingFumetto.id);

        setEditingFumetto(updatedFumetto);
        showSuccess('Image uploaded successfully');

        return {
          title: updatedFumetto.title,
          description: updatedFumetto.description,
          coverImage: updatedFumetto.coverImage,
          pages: updatedFumetto.pages || [],
          order: updatedFumetto.order,
        };
      } catch (error) {
        console.error('Error reloading after upload:', error);
        showError('Failed to reload fumetto');
        throw error;
      }
    },
    [showSuccess, showError]
  );

  const handleRestore = useCallback(
    async (fumetto: FumettoDTO) => {
      try {
        await FumettiAPIService.restoreFumetto(fumetto.id!);
        showSuccess('Fumetto restored successfully');
        loadFumetti();
      } catch (error) {
        console.error('Error restoring fumetto:', error);
        showError('Failed to restore fumetto');
      }
    },
    [showSuccess, showError, loadFumetti]
  );

  return {
    fumetti,
    deletedFumetti,
    loading,
    editingFumetto,
    setEditingFumetto,
    loadFumetti,
    handleSave,
    handleSaveForUpload,
    handleSaveAfterUpload,
    handleRestore,
  };
}
