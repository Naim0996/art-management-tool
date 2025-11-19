'use client';

import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { FumettoDTO, FumettiAPIService } from '@/services/FumettiAPIService';
import FumettiModal from '@/components/FumettiModal';
import { useToast } from '@/hooks/useToast';
import { useFormDialog } from '@/hooks/useFormDialog';
import useFumettoManagement from '@/hooks/useFumettoManagement';
import PageHeader from '@/components/admin/PageHeader';
import FumettoForm from '@/components/admin/FumettoForm';
import FumettoColumns from '@/components/admin/FumettoColumns';

export default function AdminFumettiPage() {
  const { toast, showSuccess, showError, showWarn } = useToast();
  const { showDialog, formData, isEditing, openDialog, closeDialog, updateFormData } = useFormDialog<FumettoDTO>({
    title: '',
    description: '',
    coverImage: '',
    pages: [],
    order: 0,
  });

  const {
    fumetti,
    deletedFumetti,
    loading,
    editingFumetto,
    setEditingFumetto,
    loadFumetti,
    handleSave: saveFumetto,
    handleSaveForUpload: saveForUpload,
    handleSaveAfterUpload: saveAfterUpload,
    handleRestore,
  } = useFumettoManagement({
    showSuccess,
    showError,
    showWarn,
  });

  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [previewFumetto, setPreviewFumetto] = useState<FumettoDTO | null>(null);

  useEffect(() => {
    loadFumetti();
  }, [loadFumetti]);

  const handleCreate = () => {
    openDialog({
      title: '',
      description: '',
      coverImage: '',
      pages: [],
      order: 0,
    });
    setEditingFumetto(null);
  };

  const handleEdit = (fumetto: FumettoDTO) => {
    openDialog(fumetto);
    setEditingFumetto(fumetto);
  };

  const handleSave = async () => {
    const success = await saveFumetto(formData, isEditing, editingFumetto);
    if (success) {
      closeDialog();
    }
  };

  const handleSaveForUpload = async (): Promise<number | undefined> => {
    const id = await saveForUpload(formData, editingFumetto);
    if (id && !isEditing) {
      const updatedData = await saveAfterUpload(editingFumetto);
      if (updatedData) {
        updateFormData(updatedData);
      }
    }
    return id;
  };

  const handleSaveAfterUpload = async (): Promise<void> => {
    const updatedData = await saveAfterUpload(editingFumetto);
    if (updatedData) {
      updateFormData(updatedData);
    }
  };

  const handleDelete = (fumetto: FumettoDTO) => {
    confirmDialog({
      message: `Are you sure you want to delete "${fumetto.title}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await FumettiAPIService.deleteFumetto(fumetto.id!);
          showSuccess('Fumetto deleted successfully');
          loadFumetti();
        } catch (error) {
          console.error('Error deleting fumetto:', error);
          showError('Failed to delete fumetto');
        }
      },
    });
  };

  const handlePreview = (fumetto: FumettoDTO) => {
    setPreviewFumetto(fumetto);
    setShowPreviewDialog(true);
  };

  return (
    <div className="p-6 space-y-6">
      {toast}
      <ConfirmDialog />

      <PageHeader
        title="Gestione Fumetti"
        subtitle="Manage comics and their pages"
        actions={[
          {
            label: 'Create New Fumetto',
            icon: 'pi pi-plus',
            onClick: handleCreate,
            severity: 'success',
          },
        ]}
      />

      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        <TabPanel header={`Active Fumetti (${fumetti.length})`}>
          <DataTable
            value={fumetti}
            loading={loading}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            tableStyle={{ minWidth: '60rem' }}
            emptyMessage="No active fumetti found"
          >
            <FumettoColumns
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPreview={handlePreview}
            />
          </DataTable>
        </TabPanel>

        <TabPanel header={`Deleted Fumetti (${deletedFumetti.length})`}>
          <DataTable
            value={deletedFumetti}
            loading={loading}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            tableStyle={{ minWidth: '60rem' }}
            emptyMessage="No deleted fumetti found"
          >
            <FumettoColumns
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPreview={handlePreview}
              onRestore={handleRestore}
              isDeleted
            />
          </DataTable>
        </TabPanel>
      </TabView>

      <FumettoForm
        visible={showDialog}
        formData={formData}
        isEditing={isEditing}
        onHide={closeDialog}
        onSave={handleSave}
        onChange={(field, value) => updateFormData({ [field]: value })}
        onSaveForUpload={handleSaveForUpload}
        onSaveAfterUpload={handleSaveAfterUpload}
      />

      {previewFumetto && (
        <FumettiModal
          fumetto={previewFumetto}
          visible={showPreviewDialog}
          onHide={() => {
            setShowPreviewDialog(false);
            setPreviewFumetto(null);
          }}
        />
      )}
    </div>
  );
}
