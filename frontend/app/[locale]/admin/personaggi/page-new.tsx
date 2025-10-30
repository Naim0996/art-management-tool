/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, useRef } from 'react';
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
import { Divider } from 'primereact/divider';
import { PersonaggioDTO, PersonaggiAPIService } from '@/services/PersonaggiAPIService';
import ImageUpload from '@/components/ImageUpload';
import PersonaggioPreview from '@/components/PersonaggioPreview';

export default function AdminPersonaggiPageNew() {
  const toast = useRef<Toast>(null);

  const [personaggi, setPersonaggi] = useState<PersonaggioDTO[]>([]);
  const [deletedPersonaggi, setDeletedPersonaggi] = useState<PersonaggioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [editingPersonaggio, setEditingPersonaggio] = useState<PersonaggioDTO | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [formTab, setFormTab] = useState(0);

  const [formData, setFormData] = useState<Partial<PersonaggioDTO>>({
    name: '',
    description: '',
    icon: '',
    images: [],
    backgroundColor: '#E0E7FF',
    backgroundType: 'solid',
    gradientFrom: '#E0E7FF',
    gradientTo: '#FEE2E2',
    order: 0,
  });

  const backgroundTypeOptions = [
    { label: 'Solid Color', value: 'solid' },
    { label: 'Gradient', value: 'gradient' },
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
      gradientFrom: '#E0E7FF',
      gradientTo: '#FEE2E2',
      order: personaggi.length + 1,
    });
    setFormTab(0);
    setShowFormDialog(true);
  };

  const handleEdit = (personaggio: PersonaggioDTO) => {
    setEditingPersonaggio(personaggio);
    setFormData({
      name: personaggio.name,
      description: personaggio.description,
      icon: personaggio.icon,
      images: personaggio.images || [],
      backgroundColor: personaggio.backgroundColor,
      backgroundType: personaggio.backgroundType,
      gradientFrom: personaggio.gradientFrom || '#E0E7FF',
      gradientTo: personaggio.gradientTo || '#FEE2E2',
      order: personaggio.order,
    });
    setFormTab(0);
    setShowFormDialog(true);
  };

  const handleSave = async () => {
    try {
      // Validazione
      if (!formData.name || formData.name.trim() === '') {
        toast.current?.show({
          severity: 'warn',
          summary: 'Validation',
          detail: 'Name is required',
          life: 3000,
        });
        return;
      }

      if (!formData.description || formData.description.trim() === '') {
        toast.current?.show({
          severity: 'warn',
          summary: 'Validation',
          detail: 'Description is required',
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

  // Ricarica il personaggio in editing (usato dopo upload immagini)
  const reloadEditingPersonaggio = async () => {
    if (!editingPersonaggio?.id) return;
    try {
      const updated = await PersonaggiAPIService.getPersonaggioAdmin(editingPersonaggio.id);
      // aggiorna lista e form con i dati aggiornati
      await loadPersonaggi();
      setFormData({
        name: updated.name,
        description: updated.description,
        icon: updated.icon,
        images: updated.images || [],
        backgroundColor: updated.backgroundColor,
        backgroundType: updated.backgroundType,
        gradientFrom: updated.gradientFrom,
        gradientTo: updated.gradientTo,
        order: updated.order,
      });
    } catch (error) {
      console.error('Error reloading personaggio after upload:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to refresh after upload',
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
        order: personaggio.order,
      });
    }
    setShowPreviewDialog(true);
  };

  // Template per le colonne della tabella
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
      <div className="w-20 h-10 rounded border border-gray-300" style={style} />
    );
  };

  const iconTemplate = (rowData: PersonaggioDTO) => {
    if (!rowData.icon) return <span className="text-gray-400">No icon</span>;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const iconUrl = rowData.icon.startsWith('http') ? rowData.icon : `${API_BASE_URL}${rowData.icon}`;
    return (
      <img
        src={iconUrl}
        alt={rowData.name}
        className="w-10 h-10 rounded-full object-cover"
      />
    );
  };

  const imagesCountTemplate = (rowData: PersonaggioDTO) => {
    const count = rowData.images?.length || 0;
    return (
      <span className={count > 0 ? 'text-green-600 font-semibold' : 'text-gray-400'}>
        {count}
      </span>
    );
  };

  // Dialog Footer
  const formDialogFooter = (
    <div className="flex justify-between">
      <Button
        label="Preview"
        icon="pi pi-eye"
        onClick={() => handlePreview()}
        className="p-button-secondary"
      />
      <div className="flex gap-2">
        <Button
          label="Cancel"
          icon="pi pi-times"
          onClick={() => setShowFormDialog(false)}
          className="p-button-text"
        />
        <Button
          label={editingPersonaggio ? 'Update' : 'Create'}
          icon="pi pi-check"
          onClick={handleSave}
          autoFocus
        />
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Personaggi Management</h1>
        <Button
          label="New Personaggio"
          icon="pi pi-plus"
          onClick={handleCreate}
          className="p-button-success"
        />
      </div>

      {/* Tabs per Active/Deleted */}
      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        <TabPanel header={`Active (${personaggi.length})`} leftIcon="pi pi-check-circle">
          <DataTable
            value={personaggi}
            loading={loading}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            tableStyle={{ minWidth: '50rem' }}
            emptyMessage="No personaggi found"
          >
            <Column field="id" header="ID" sortable style={{ width: '5%' }} />
            <Column field="icon" header="Icon" body={iconTemplate} style={{ width: '8%' }} />
            <Column field="name" header="Name" sortable style={{ width: '15%' }} />
            <Column
              field="description"
              header="Description"
              body={(row) => (
                <div className="max-w-md truncate" title={row.description}>
                  {row.description}
                </div>
              )}
              style={{ width: '25%' }}
            />
            <Column
              field="backgroundColor"
              header="Background"
              body={backgroundPreviewTemplate}
              style={{ width: '10%' }}
            />
            <Column
              field="images"
              header="Images"
              body={imagesCountTemplate}
              sortable
              style={{ width: '8%' }}
            />
            <Column field="order" header="Order" sortable style={{ width: '8%' }} />
            <Column
              header="Actions"
              body={actionBodyTemplate}
              exportable={false}
              style={{ width: '15%' }}
            />
          </DataTable>
        </TabPanel>

        <TabPanel header={`Deleted (${deletedPersonaggi.length})`} leftIcon="pi pi-trash">
          <DataTable
            value={deletedPersonaggi}
            loading={loading}
            paginator
            rows={10}
            tableStyle={{ minWidth: '50rem' }}
            emptyMessage="No deleted personaggi"
          >
            <Column field="id" header="ID" sortable />
            <Column field="icon" header="Icon" body={iconTemplate} />
            <Column field="name" header="Name" sortable />
            <Column field="description" header="Description" />
            <Column header="Actions" body={restoreActionTemplate} exportable={false} />
          </DataTable>
        </TabPanel>
      </TabView>

      {/* Form Dialog */}
      <Dialog
        visible={showFormDialog}
        onHide={() => setShowFormDialog(false)}
        header={editingPersonaggio ? 'Edit Personaggio' : 'New Personaggio'}
        modal
        className="p-fluid"
        style={{ width: '90vw', maxWidth: '1200px' }}
        footer={formDialogFooter}
      >
        <TabView activeIndex={formTab} onTabChange={(e) => setFormTab(e.index)}>
          {/* Tab 1: Basic Info */}
          <TabPanel header="Basic Info" leftIcon="pi pi-info-circle">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="field">
                <label htmlFor="name" className="font-semibold">
                  Name *
                </label>
                <InputText
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter personaggio name"
                />
              </div>

              <div className="field">
                <label htmlFor="order" className="font-semibold">
                  Order
                </label>
                <InputNumber
                  id="order"
                  value={formData.order || 0}
                  onValueChange={(e) => setFormData({ ...formData, order: e.value || 0 })}
                  min={0}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="description" className="font-semibold">
                Description *
              </label>
              <InputTextarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={5}
                placeholder="Enter personaggio description"
              />
            </div>
          </TabPanel>

          {/* Tab 2: Appearance */}
          <TabPanel header="Appearance" leftIcon="pi pi-palette">
            <div className="field mb-4">
              <label htmlFor="backgroundType" className="font-semibold">
                Background Type
              </label>
              <Dropdown
                id="backgroundType"
                value={formData.backgroundType}
                options={backgroundTypeOptions}
                onChange={(e) =>
                  setFormData({ ...formData, backgroundType: e.value })
                }
                placeholder="Select background type"
              />
            </div>

            {formData.backgroundType === 'solid' ? (
              <div className="field">
                <label htmlFor="backgroundColor" className="font-semibold">
                  Background Color
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    id="backgroundColor"
                    value={formData.backgroundColor || '#E0E7FF'}
                    onChange={(e) =>
                      setFormData({ ...formData, backgroundColor: e.target.value })
                    }
                    className="w-20 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <InputText
                    value={formData.backgroundColor || '#E0E7FF'}
                    onChange={(e) =>
                      setFormData({ ...formData, backgroundColor: e.target.value })
                    }
                    placeholder="#E0E7FF"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="field">
                  <label htmlFor="gradientFrom" className="font-semibold">
                    Gradient From
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      id="gradientFrom"
                      value={formData.gradientFrom || '#E0E7FF'}
                      onChange={(e) =>
                        setFormData({ ...formData, gradientFrom: e.target.value })
                      }
                      className="w-20 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <InputText
                      value={formData.gradientFrom || '#E0E7FF'}
                      onChange={(e) =>
                        setFormData({ ...formData, gradientFrom: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="gradientTo" className="font-semibold">
                    Gradient To
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      id="gradientTo"
                      value={formData.gradientTo || '#FEE2E2'}
                      onChange={(e) =>
                        setFormData({ ...formData, gradientTo: e.target.value })
                      }
                      className="w-20 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <InputText
                      value={formData.gradientTo || '#FEE2E2'}
                      onChange={(e) =>
                        setFormData({ ...formData, gradientTo: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            <Divider />

            {/* Background Preview */}
            <div className="field">
              <label className="font-semibold mb-2 block">Background Preview</label>
              <div
                className="w-full h-32 rounded-lg shadow-inner"
                style={
                  formData.backgroundType === 'gradient'
                    ? {
                        background: `linear-gradient(135deg, ${formData.gradientFrom}, ${formData.gradientTo})`,
                      }
                    : { backgroundColor: formData.backgroundColor }
                }
              ></div>
            </div>
          </TabPanel>

          {/* Tab 3: Images */}
          <TabPanel header="Images" leftIcon="pi pi-images">
            <div className="space-y-6">
              {/* Icon */}
              <ImageUpload
                label="Icon (Logo)"
                images={formData.icon ? [formData.icon] : []}
                onImagesChange={(images) =>
                  setFormData({ ...formData, icon: images[0] || '' })
                }
                maxImages={1}
                type="icon"
                personaggioId={editingPersonaggio?.id}
                onUploadComplete={reloadEditingPersonaggio}
              />

              <Divider />

              {/* Gallery Images */}
              <ImageUpload
                label="Gallery Images"
                images={formData.images || []}
                onImagesChange={(images) => setFormData({ ...formData, images })}
                maxImages={20}
                type="gallery"
                personaggioId={editingPersonaggio?.id}
                onUploadComplete={reloadEditingPersonaggio}
              />
            </div>
          </TabPanel>
        </TabView>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        visible={showPreviewDialog}
        onHide={() => setShowPreviewDialog(false)}
        header="Personaggio Preview"
        modal
        style={{ width: '90vw', maxWidth: '1000px' }}
      >
        <PersonaggioPreview personaggio={formData} />
      </Dialog>
    </div>
  );
}
