import { useState, useEffect } from 'react';
import { PersonaggioDTO, PersonaggiAPIService } from '@/services/PersonaggiAPIService';
import { useToast } from './useToast';

const initialFormData: Partial<PersonaggioDTO> = {
  name: '',
  description: '',
  icon: '',
  images: [],
  backgroundColor: '#E0E7FF',
  backgroundType: 'solid',
  gradientFrom: '',
  gradientTo: '',
  backgroundImage: '',
  order: 0,
};

export const usePersonaggioManagement = () => {
  const { showSuccess, showError } = useToast();
  
  const [personaggi, setPersonaggi] = useState<PersonaggioDTO[]>([]);
  const [deletedPersonaggi, setDeletedPersonaggi] = useState<PersonaggioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingPersonaggio, setEditingPersonaggio] = useState<PersonaggioDTO | null>(null);
  const [formData, setFormData] = useState<Partial<PersonaggioDTO>>(initialFormData);

  useEffect(() => {
    loadPersonaggi();
  }, []);

  const loadPersonaggi = async () => {
    setLoading(true);
    try {
      const [activeResponse, deletedResponse] = await Promise.all([
        PersonaggiAPIService.getAllPersonaggiAdmin(),
        PersonaggiAPIService.getDeletedPersonaggi(),
      ]);
      setPersonaggi(activeResponse);
      setDeletedPersonaggi(deletedResponse);
    } catch (error) {
      console.error('Error loading personaggi:', error);
      showError('Failed to load personaggi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPersonaggio(null);
    setFormData(initialFormData);
    setShowFormDialog(true);
  };

  const handleEdit = (personaggio: PersonaggioDTO) => {
    setEditingPersonaggio(personaggio);
    setFormData({
      name: personaggio.name,
      description: personaggio.description,
      icon: personaggio.icon,
      images: personaggio.images,
      backgroundColor: personaggio.backgroundColor,
      backgroundType: personaggio.backgroundType,
      gradientFrom: personaggio.gradientFrom,
      gradientTo: personaggio.gradientTo,
      backgroundImage: personaggio.backgroundImage,
      order: personaggio.order,
    });
    setShowFormDialog(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name) {
        showError('Name is required', 'Validation');
        return;
      }

      if (editingPersonaggio) {
        await PersonaggiAPIService.updatePersonaggio(editingPersonaggio.id!, formData as PersonaggioDTO);
        showSuccess('Personaggio updated successfully');
      } else {
        await PersonaggiAPIService.createPersonaggio(formData as PersonaggioDTO);
        showSuccess('Personaggio created successfully');
      }

      setShowFormDialog(false);
      loadPersonaggi();
    } catch (error) {
      console.error('Error saving personaggio:', error);
      showError('Failed to save personaggio');
    }
  };

  const handleSaveForUpload = async (): Promise<number | undefined> => {
    if (!formData.name) {
      throw new Error('Name is required');
    }

    try {
      if (editingPersonaggio) {
        return editingPersonaggio.id;
      } else {
        const newPersonaggio = await PersonaggiAPIService.createPersonaggio(formData as PersonaggioDTO);
        setEditingPersonaggio(newPersonaggio);
        setFormData({ ...formData, ...newPersonaggio });
        showSuccess('Personaggio created successfully', undefined, 2000);
        return newPersonaggio.id;
      }
    } catch (error) {
      console.error('Error saving personaggio:', error);
      throw error;
    }
  };

  const handleReloadAfterUpload = async (): Promise<void> => {
    if (!editingPersonaggio?.id) return;

    try {
      const updatedPersonaggio = await PersonaggiAPIService.getPersonaggioAdmin(editingPersonaggio.id);
      setFormData({
        name: updatedPersonaggio.name,
        description: updatedPersonaggio.description,
        icon: updatedPersonaggio.icon,
        images: updatedPersonaggio.images || [],
        backgroundColor: updatedPersonaggio.backgroundColor,
        backgroundType: updatedPersonaggio.backgroundType,
        gradientFrom: updatedPersonaggio.gradientFrom,
        gradientTo: updatedPersonaggio.gradientTo,
        backgroundImage: updatedPersonaggio.backgroundImage,
        order: updatedPersonaggio.order,
      });
      setEditingPersonaggio(updatedPersonaggio);
    } catch (error) {
      console.error('Error reloading after upload:', error);
      showError('Failed to reload personaggio data');
      throw error;
    }
  };

  const handleDelete = async (personaggio: PersonaggioDTO) => {
    try {
      await PersonaggiAPIService.deletePersonaggio(personaggio.id!);
      showSuccess('Personaggio deleted successfully');
      loadPersonaggi();
    } catch (error) {
      console.error('Error deleting personaggio:', error);
      showError('Failed to delete personaggio');
    }
  };

  const handleRestore = async (personaggio: PersonaggioDTO) => {
    try {
      await PersonaggiAPIService.restorePersonaggio(personaggio.id!);
      showSuccess('Personaggio restored successfully');
      loadPersonaggi();
    } catch (error) {
      console.error('Error restoring personaggio:', error);
      showError('Failed to restore personaggio');
    }
  };

  return {
    personaggi,
    deletedPersonaggi,
    loading,
    showFormDialog,
    setShowFormDialog,
    editingPersonaggio,
    formData,
    setFormData,
    handleCreate,
    handleEdit,
    handleSave,
    handleSaveForUpload,
    handleReloadAfterUpload,
    handleDelete,
    handleRestore,
  };
};
