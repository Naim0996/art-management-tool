/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { useRef } from 'react';
import { PersonaggioDTO, PersonaggiAPIService } from '@/services/PersonaggiAPIService';
import PersonaggioPreview from '@/components/PersonaggioPreview';
import ImageUpload from '@/components/ImageUpload';

export default function AdminPersonaggiPage() {
  const toast = useRef<Toast>(null);

  const [personaggi, setPersonaggi] = useState<PersonaggioDTO[]>([]);
  const [deletedPersonaggi, setDeletedPersonaggi] = useState<PersonaggioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [editingPersonaggio, setEditingPersonaggio] = useState<PersonaggioDTO | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const [formData, setFormData] = useState<Partial<PersonaggioDTO>>({
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
  });

  const backgroundTypeOptions = [
    { label: 'Solid Color', value: 'solid' },
    { label: 'Gradient', value: 'gradient' },
    { label: 'Image', value: 'image' },
  ];

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
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load personaggi',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPersonaggio(null);
    setFormData({
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
    });
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
        toast.current?.show({
          severity: 'warn',
          summary: 'Validation',
          detail: 'Name is required',
          life: 3000,
        });
        return;
      }

      if (editingPersonaggio) {
        await PersonaggiAPIService.updatePersonaggio(editingPersonaggio.id!, formData as PersonaggioDTO);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Personaggio updated successfully',
          life: 3000,
        });
      } else {
        await PersonaggiAPIService.createPersonaggio(formData as PersonaggioDTO);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Personaggio created successfully',
          life: 3000,
        });
      }

      setShowFormDialog(false);
      loadPersonaggi();
    } catch (error) {
      console.error('Error saving personaggio:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save personaggio',
        life: 3000,
      });
    }
  };

  // Funzione per salvare il personaggio prima dell'upload (se necessario)
  const handleSaveForUpload = async (): Promise<number | undefined> => {
    if (!formData.name) {
      throw new Error('Name is required');
    }

    try {
      if (editingPersonaggio) {
        // Se stiamo modificando, usa l'ID esistente
        return editingPersonaggio.id;
      } else {
        // Crea un nuovo personaggio e restituisci l'ID
        const newPersonaggio = await PersonaggiAPIService.createPersonaggio(formData as PersonaggioDTO);
        // Aggiorna lo stato per riflettere che ora stiamo modificando (non creando)
        setEditingPersonaggio(newPersonaggio);
        setFormData({ ...formData, ...newPersonaggio });
        
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Personaggio created successfully',
          life: 2000,
        });
        
        return newPersonaggio.id;
      }
    } catch (error) {
      console.error('Error saving personaggio:', error);
      throw error;
    }
  };

  // Funzione per ricaricare i dati dopo l'upload dell'immagine
  const handleReloadAfterUpload = async (): Promise<void> => {
    if (!editingPersonaggio?.id) {
      return;
    }

    try {
      // Ricarica i dati aggiornati dal backend
      const updatedPersonaggio = await PersonaggiAPIService.getPersonaggioAdmin(editingPersonaggio.id);
      
      // Aggiorna il formData con i dati freschi dal backend
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
      
      // Aggiorna anche editingPersonaggio
      setEditingPersonaggio(updatedPersonaggio);
      
      console.log('Reloaded personaggio data:', updatedPersonaggio);
    } catch (error) {
      console.error('Error reloading after upload:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to reload personaggio data',
        life: 3000,
      });
      throw error;
    }
  };

  const handleDelete = (personaggio: PersonaggioDTO) => {
    confirmDialog({
      message: `Are you sure you want to delete "${personaggio.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await PersonaggiAPIService.deletePersonaggio(personaggio.id!);
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Personaggio deleted successfully',
            life: 3000,
          });
          loadPersonaggi();
        } catch (error) {
          console.error('Error deleting personaggio:', error);
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete personaggio',
            life: 3000,
          });
        }
      },
    });
  };

  const handleRestore = async (personaggio: PersonaggioDTO) => {
    try {
      await PersonaggiAPIService.restorePersonaggio(personaggio.id!);
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Personaggio restored successfully',
        life: 3000,
      });
      loadPersonaggi();
    } catch (error) {
      console.error('Error restoring personaggio:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to restore personaggio',
        life: 3000,
      });
    }
  };

  const handlePreview = (personaggio?: PersonaggioDTO) => {
    if (personaggio) {
      setFormData({
        name: personaggio.name,
        description: personaggio.description,
        icon: personaggio.icon,
        images: personaggio.images || [],
        backgroundColor: personaggio.backgroundColor,
        backgroundType: personaggio.backgroundType,
        gradientFrom: personaggio.gradientFrom,
        gradientTo: personaggio.gradientTo,
        backgroundImage: personaggio.backgroundImage,
        order: personaggio.order,
      });
    }
    setShowPreviewDialog(true);
  };

  const actionBodyTemplate = (rowData: PersonaggioDTO) => {
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

  const restoreActionTemplate = (rowData: PersonaggioDTO) => {
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

  const backgroundPreviewTemplate = (rowData: PersonaggioDTO) => {
    const style: React.CSSProperties = {};
    if (rowData.backgroundType === 'gradient' && rowData.gradientFrom && rowData.gradientTo) {
      style.background = `linear-gradient(135deg, ${rowData.gradientFrom}, ${rowData.gradientTo})`;
    } else if (rowData.backgroundColor) {
      style.backgroundColor = rowData.backgroundColor;
    }

    return (
      <div
        className="w-20 h-10 rounded border border-gray-300"
        style={style}
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
        <h1 className="text-3xl font-bold mb-2 text-black">Gestione Personaggi</h1>
        <p className="text-gray-600">Manage characters and their properties</p>
      </div>

      <div className="mb-4">
        <Button
          label="Create New Personaggio"
          icon="pi pi-plus"
          onClick={handleCreate}
          className="p-button-success"
        />
      </div>

      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        <TabPanel header={`Active Personaggi (${personaggi.length})`}>
          <DataTable
            value={personaggi}
            loading={loading}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            tableStyle={{ maxWidth: '60rem' }}
            emptyMessage="No active personaggi found"
          >
            <Column field="id" header="ID" sortable style={{ width: '5%' }} />
            <Column field="name" header="Name" sortable style={{ width: '15%' }} />
            <Column
              field="description"
              header="Description"
              style={{ width: '20%' }}
              body={(rowData) => (
                <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={rowData.description}>
                  {rowData.description}
                </div>
              )}
            />
            <Column
              field="icon"
              header="Icon"
              style={{ width: '10%' }}
              body={(rowData) => (
                rowData.icon ? (
                  <img src={rowData.icon} alt={rowData.name} className="w-12 h-12 object-cover rounded" />
                ) : (
                  <span className="text-gray-400">No icon</span>
                )
              )}
            />
            <Column
              field="backgroundType"
              header="Background"
              style={{ width: '15%' }}
              body={backgroundPreviewTemplate}
            />
            <Column field="order" header="Order" sortable style={{ width: '10%' }} />
            <Column
              header="Actions"
              body={actionBodyTemplate}
              style={{ width: '20%' }}
            />
          </DataTable>
        </TabPanel>

        <TabPanel header={`Deleted Personaggi (${deletedPersonaggi.length})`}>
          <DataTable
            value={deletedPersonaggi}
            loading={loading}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            tableStyle={{ minWidth: '60rem' }}
            emptyMessage="No deleted personaggi found"
          >
            <Column field="id" header="ID" sortable style={{ width: '5%' }} />
            <Column field="name" header="Name" sortable style={{ width: '20%' }} />
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
              field="deletedAt"
              header="Deleted At"
              sortable
              style={{ width: '20%' }}
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
        header={editingPersonaggio ? 'Edit Personaggio' : 'Create New Personaggio'}
        visible={showFormDialog}
        style={{ width: '50vw' }}
        onHide={() => setShowFormDialog(false)}
        footer={formDialogFooter}
        draggable={false}
        resizable={false}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-semibold">
              Name *
            </label>
            <InputText
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter name"
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
            <label htmlFor="icon" className="font-semibold">
              Icon URL
            </label>
            <InputText
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="Enter icon URL"
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

          <div className="flex flex-col gap-2">
            <label htmlFor="backgroundType" className="font-semibold">
              Background Type
            </label>
            <Dropdown
              id="backgroundType"
              value={formData.backgroundType}
              options={backgroundTypeOptions}
              onChange={(e) => setFormData({ ...formData, backgroundType: e.value })}
              placeholder="Select background type"
            />
          </div>

          {formData.backgroundType === 'solid' ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="backgroundColor" className="font-semibold">
                Background Color
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  id="backgroundColor"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  className="h-10 w-20 rounded border"
                />
                <InputText
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  placeholder="#E0E7FF"
                />
              </div>
            </div>
          ) : formData.backgroundType === 'gradient' ? (
            <>
              <div className="flex flex-col gap-2">
                <label htmlFor="gradientFrom" className="font-semibold">
                  Gradient From
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    id="gradientFrom"
                    value={formData.gradientFrom}
                    onChange={(e) => setFormData({ ...formData, gradientFrom: e.target.value })}
                    className="h-10 w-20 rounded border"
                  />
                  <InputText
                    value={formData.gradientFrom}
                    onChange={(e) => setFormData({ ...formData, gradientFrom: e.target.value })}
                    placeholder="#FF0000"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="gradientTo" className="font-semibold">
                  Gradient To
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    id="gradientTo"
                    value={formData.gradientTo}
                    onChange={(e) => setFormData({ ...formData, gradientTo: e.target.value })}
                    className="h-10 w-20 rounded border"
                  />
                  <InputText
                    value={formData.gradientTo}
                    onChange={(e) => setFormData({ ...formData, gradientTo: e.target.value })}
                    placeholder="#0000FF"
                  />
                </div>
              </div>
            </>
          ) : formData.backgroundType === 'image' ? (
            <ImageUpload
              label="Background Image"
              images={formData.backgroundImage ? [formData.backgroundImage] : []}
              onImagesChange={(images) => setFormData({ ...formData, backgroundImage: images[0] || '' })}
              maxImages={1}
              type="background"
              personaggioId={editingPersonaggio?.id}
              onSaveRequired={handleSaveForUpload}
              onUploadComplete={handleReloadAfterUpload}
            />
          ) : null}

          {/* Icon Upload */}
          <ImageUpload
            label="Icon Image"
            images={formData.icon ? [formData.icon] : []}
            onImagesChange={(images) => setFormData({ ...formData, icon: images[0] || '' })}
            maxImages={1}
            type="icon"
            personaggioId={editingPersonaggio?.id}
            onSaveRequired={handleSaveForUpload}
            onUploadComplete={handleReloadAfterUpload}
          />

          {/* Gallery Images Upload */}
          <ImageUpload
            label="Gallery Images"
            images={formData.images || []}
            onImagesChange={(images) => setFormData({ ...formData, images })}
            maxImages={10}
            type="gallery"
            personaggioId={editingPersonaggio?.id}
            onSaveRequired={handleSaveForUpload}
            onUploadComplete={handleReloadAfterUpload}
          />

          {/* Background Preview */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Preview</label>
            <div
              className="w-full h-32 rounded border border-gray-300"
              style={
                formData.backgroundType === 'gradient' && formData.gradientFrom && formData.gradientTo
                  ? { background: `linear-gradient(135deg, ${formData.gradientFrom}, ${formData.gradientTo})` }
                  : formData.backgroundType === 'image' && formData.backgroundImage
                  ? { backgroundImage: `url(${formData.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { backgroundColor: formData.backgroundColor }
              }
            />
          </div>
        </div>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        visible={showPreviewDialog}
        onHide={() => setShowPreviewDialog(false)}
        header="Personaggio Preview"
        modal
        style={{ width: '95vw', maxWidth: '1400px' }}
        draggable={false}
        resizable={false}
      >
        <PersonaggioPreview personaggio={formData} />
      </Dialog>
    </div>
  );
}
