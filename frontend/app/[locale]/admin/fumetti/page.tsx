/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { useRef } from 'react';
import { FumettoDTO, FumettiAPIService } from '@/services/FumettiAPIService';
import FumettiModal from '@/components/FumettiModal';
import ImageUpload from '@/components/ImageUpload';

export default function AdminFumettiPage() {
  const toast = useRef<Toast>(null);

  const [fumetti, setFumetti] = useState<FumettoDTO[]>([]);
  const [deletedFumetti, setDeletedFumetti] = useState<FumettoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [editingFumetto, setEditingFumetto] = useState<FumettoDTO | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const [formData, setFormData] = useState<Partial<FumettoDTO>>({
    title: '',
    description: '',
    coverImage: '',
    pages: [],
    order: 0,
  });

  useEffect(() => {
    loadFumetti();
  }, []);

  const loadFumetti = async () => {
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
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load fumetti',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingFumetto(null);
    setFormData({
      title: '',
      description: '',
      coverImage: '',
      pages: [],
      order: 0,
    });
    setShowFormDialog(true);
  };

  const handleEdit = (fumetto: FumettoDTO) => {
    setEditingFumetto(fumetto);
    setFormData({
      title: fumetto.title,
      description: fumetto.description,
      coverImage: fumetto.coverImage,
      pages: fumetto.pages,
      order: fumetto.order,
    });
    setShowFormDialog(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.title) {
        toast.current?.show({
          severity: 'warn',
          summary: 'Validation',
          detail: 'Title is required',
          life: 3000,
        });
        return;
      }

      // Assicurati che pages sia sempre un array
      const dataToSave = {
        ...formData,
        pages: formData.pages || [],
      };

      if (editingFumetto) {
        await FumettiAPIService.updateFumetto(editingFumetto.id!, dataToSave as FumettoDTO);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Fumetto updated successfully',
          life: 3000,
        });
      } else {
        await FumettiAPIService.createFumetto(dataToSave as Omit<FumettoDTO, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Fumetto created successfully',
          life: 3000,
        });
      }

      setShowFormDialog(false);
      loadFumetti();
    } catch (error) {
      console.error('Error saving fumetto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save fumetto';
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 5000,
      });
    }
  };

  // Funzione per salvare il fumetto prima dell'upload (se necessario)
  const handleSaveForUpload = async (): Promise<number | undefined> => {
    if (!formData.title) {
      throw new Error('Title is required');
    }

    try {
      if (editingFumetto) {
        // Se stiamo modificando, usa l'ID esistente
        return editingFumetto.id;
      } else {
        // Assicurati che pages sia sempre un array
        const dataToSave = {
          ...formData,
          pages: formData.pages || [],
        };
        
        // Crea un nuovo fumetto e restituisci l'ID
        const newFumetto = await FumettiAPIService.createFumetto(dataToSave as Omit<FumettoDTO, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>);
        // Aggiorna lo stato per riflettere che ora stiamo modificando (non creando)
        setEditingFumetto(newFumetto);
        setFormData({ ...formData, ...newFumetto });
        
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Fumetto created successfully',
          life: 2000,
        });
        
        return newFumetto.id;
      }
    } catch (error) {
      console.error('Error saving fumetto:', error);
      throw error;
    }
  };

  // Funzione per ricaricare dopo l'upload dell'immagine
  const handleSaveAfterUpload = async (): Promise<void> => {
    if (!editingFumetto?.id) {
      return;
    }

    try {
      // Ricarica il fumetto dal backend per ottenere i dati aggiornati
      const updatedFumetto = await FumettiAPIService.getFumettoAdmin(editingFumetto.id);
      
      // Aggiorna lo stato locale con i dati freschi dal backend
      setEditingFumetto(updatedFumetto);
      setFormData({
        title: updatedFumetto.title,
        description: updatedFumetto.description,
        coverImage: updatedFumetto.coverImage,
        pages: updatedFumetto.pages || [],
        order: updatedFumetto.order,
      });

      toast.current?.show({
        severity: 'success',
        summary: 'Saved',
        detail: 'Image uploaded successfully',
        life: 2000,
      });
    } catch (error) {
      console.error('Error reloading after upload:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to reload fumetto',
        life: 3000,
      });
      throw error;
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
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Fumetto deleted successfully',
            life: 3000,
          });
          loadFumetti();
        } catch (error) {
          console.error('Error deleting fumetto:', error);
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete fumetto',
            life: 3000,
          });
        }
      },
    });
  };

  const handleRestore = async (fumetto: FumettoDTO) => {
    try {
      await FumettiAPIService.restoreFumetto(fumetto.id!);
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Fumetto restored successfully',
        life: 3000,
      });
      loadFumetti();
    } catch (error) {
      console.error('Error restoring fumetto:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to restore fumetto',
        life: 3000,
      });
    }
  };

  const handlePreview = (fumetto?: FumettoDTO) => {
    if (fumetto) {
      setFormData({
        title: fumetto.title,
        description: fumetto.description,
        coverImage: fumetto.coverImage,
        pages: fumetto.pages || [],
        order: fumetto.order,
      });
    }
    setShowPreviewDialog(true);
  };

  const actionBodyTemplate = (rowData: FumettoDTO) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          rounded
          outlined
          severity="secondary"
          onClick={() => handlePreview(rowData)}
          tooltip="Preview"
        />
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          severity="info"
          onClick={() => handleEdit(rowData)}
          tooltip="Edit"
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => handleDelete(rowData)}
          tooltip="Delete"
        />
      </div>
    );
  };

  const restoreActionTemplate = (rowData: FumettoDTO) => {
    return (
      <Button
        icon="pi pi-refresh"
        rounded
        outlined
        severity="success"
        onClick={() => handleRestore(rowData)}
        tooltip="Restore"
      />
    );
  };

  const formDialogFooter = (
    <div>
      <Button label="Cancel" icon="pi pi-times" onClick={() => setShowFormDialog(false)} className="p-button-text" />
      <Button label="Save" icon="pi pi-check" onClick={handleSave} autoFocus />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-black">Gestione Fumetti</h1>
        <p className="text-gray-600">Manage comics and their pages</p>
      </div>

      <div className="mb-4">
        <Button
          label="Create New Fumetto"
          icon="pi pi-plus"
          onClick={handleCreate}
          className="p-button-success"
        />
      </div>

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
            <Column field="id" header="ID" sortable style={{ width: '5%' }} />
            <Column field="title" header="Title" sortable style={{ width: '20%' }} />
            <Column
              field="description"
              header="Description"
              style={{ width: '25%' }}
              body={(rowData) => (
                <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={rowData.description}>
                  {rowData.description}
                </div>
              )}
            />
            <Column
              field="coverImage"
              header="Cover"
              style={{ width: '10%' }}
              body={(rowData) => (
                rowData.coverImage ? (
                  <img src={rowData.coverImage} alt={rowData.title} className="w-12 h-16 object-cover rounded" />
                ) : (
                  <span className="text-gray-400">No cover</span>
                )
              )}
            />
            <Column
              field="pages"
              header="Pages"
              style={{ width: '10%' }}
              body={(rowData) => (
                <span>{rowData.pages?.length || 0} pages</span>
              )}
            />
            <Column field="order" header="Order" sortable style={{ width: '10%' }} />
            <Column
              header="Actions"
              body={actionBodyTemplate}
              style={{ width: '20%' }}
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
            <Column field="id" header="ID" sortable style={{ width: '5%' }} />
            <Column field="title" header="Title" sortable style={{ width: '25%' }} />
            <Column
              field="description"
              header="Description"
              style={{ width: '30%' }}
              body={(rowData) => (
                <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={rowData.description}>
                  {rowData.description}
                </div>
              )}
            />
            <Column
              field="deletedAt"
              header="Deleted At"
              sortable
              style={{ width: '25%' }}
              body={(rowData) => new Date(rowData.deletedAt!).toLocaleString()}
            />
            <Column
              header="Actions"
              body={restoreActionTemplate}
              style={{ width: '15%' }}
            />
          </DataTable>
        </TabPanel>
      </TabView>

      <Dialog
        header={editingFumetto ? 'Edit Fumetto' : 'Create New Fumetto'}
        visible={showFormDialog}
        style={{ width: '50vw' }}
        onHide={() => setShowFormDialog(false)}
        footer={formDialogFooter}
        draggable={false}
        resizable={false}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="font-semibold">
              Title *
            </label>
            <InputText
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter title"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="font-semibold">
              Description
            </label>
            <InputTextarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              placeholder="Enter description"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="order" className="font-semibold">
              Order
            </label>
            <InputNumber
              id="order"
              value={formData.order}
              onValueChange={(e) => setFormData({ ...formData, order: e.value || 0 })}
              placeholder="Display order"
            />
          </div>

          {/* Cover Image Upload */}
          <ImageUpload
            label="Cover Image"
            images={formData.coverImage ? [formData.coverImage] : []}
            onImagesChange={(images) => setFormData({ ...formData, coverImage: images[0] || '' })}
            maxImages={1}
            type="cover"
            fumettoId={editingFumetto?.id}
            onSaveRequired={handleSaveForUpload}
            onUploadComplete={handleSaveAfterUpload}
          />

          {/* Pages Upload */}
          <ImageUpload
            label="Comic Pages"
            images={formData.pages || []}
            onImagesChange={(images) => setFormData({ ...formData, pages: images })}
            maxImages={100}
            type="page"
            fumettoId={editingFumetto?.id}
            onSaveRequired={handleSaveForUpload}
            onUploadComplete={handleSaveAfterUpload}
          />
        </div>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        visible={showPreviewDialog}
        onHide={() => setShowPreviewDialog(false)}
        header="Fumetto Preview"
        modal
        style={{ width: '95vw', maxWidth: '1400px' }}
        draggable={false}
        resizable={false}
      >
        <FumettiModal
          visible={showPreviewDialog}
          onHide={() => setShowPreviewDialog(false)}
          fumetto={formData as FumettoDTO}
        />
      </Dialog>
    </div>
  );
}

