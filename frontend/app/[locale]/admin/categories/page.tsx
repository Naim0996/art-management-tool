'use client';

import { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { CategoryDTO, CategoryAPIService } from '@/services/CategoryAPIService';

export default function AdminCategoriesPage() {
  const toast = useRef<Toast>(null);

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);

  const [formData, setFormData] = useState<Partial<CategoryDTO>>({
    name: '',
    slug: '',
    description: '',
    parent_id: null,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await CategoryAPIService.getAllCategoriesAdmin(undefined, true, true);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load categories',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      parent_id: null,
    });
    setShowFormDialog(true);
  };

  const handleEdit = (category: CategoryDTO) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parent_id: category.parent_id || null,
    });
    setShowFormDialog(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.slug) {
        toast.current?.show({
          severity: 'warn',
          summary: 'Validation Error',
          detail: 'Name and Slug are required',
          life: 3000,
        });
        return;
      }

      if (editingCategory?.id) {
        await CategoryAPIService.updateCategory(editingCategory.id, formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Category updated successfully',
          life: 3000,
        });
      } else {
        await CategoryAPIService.createCategory(formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Category created successfully',
          life: 3000,
        });
      }

      setShowFormDialog(false);
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'Failed to save category',
        life: 5000,
      });
    }
  };

  const handleDelete = (category: CategoryDTO) => {
    confirmDialog({
      message: `Are you sure you want to delete "${category.name}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          if (category.id) {
            await CategoryAPIService.deleteCategory(category.id);
            toast.current?.show({
              severity: 'success',
              summary: 'Success',
              detail: 'Category deleted successfully',
              life: 3000,
            });
            loadCategories();
          }
        } catch (error) {
          console.error('Error deleting category:', error);
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to delete category',
            life: 5000,
          });
        }
      },
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const actionsBodyTemplate = (rowData: CategoryDTO) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-info"
          onClick={() => handleEdit(rowData)}
          tooltip="Edit"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          onClick={() => handleDelete(rowData)}
          tooltip="Delete"
        />
      </div>
    );
  };

  const parentBodyTemplate = (rowData: CategoryDTO) => {
    return rowData.parent ? rowData.parent.name : <span className="text-gray-400">—</span>;
  };

  const childrenBodyTemplate = (rowData: CategoryDTO) => {
    return rowData.children && rowData.children.length > 0 ? (
      <span className="text-sm">{rowData.children.length} child(ren)</span>
    ) : (
      <span className="text-gray-400">—</span>
    );
  };

  const parentOptions = [
    { label: 'None (Top Level)', value: null },
    ...categories
      .filter(c => !editingCategory || c.id !== editingCategory.id)
      .map(c => ({ label: c.name, value: c.id })),
  ];

  const formDialogFooter = (
    <div>
      <Button label="Cancel" icon="pi pi-times" onClick={() => setShowFormDialog(false)} className="p-button-text" />
      <Button label="Save" icon="pi pi-check" onClick={handleSave} />
    </div>
  );

  return (
    <div className="p-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-2">Manage product categories for your shop</p>
        </div>
        <Button
          label="New Category"
          icon="pi pi-plus"
          onClick={handleCreate}
          className="p-button-primary"
        />
      </div>

      <DataTable
        value={categories}
        loading={loading}
        paginator
        rows={20}
        rowsPerPageOptions={[10, 20, 50]}
        responsiveLayout="scroll"
        emptyMessage="No categories found"
        className="shadow-lg"
      >
        <Column field="id" header="ID" sortable style={{ width: '80px' }} />
        <Column field="name" header="Name" sortable />
        <Column field="slug" header="Slug" sortable />
        <Column field="description" header="Description" />
        <Column header="Parent" body={parentBodyTemplate} />
        <Column header="Children" body={childrenBodyTemplate} />
        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '120px' }} />
      </DataTable>

      <Dialog
        header={editingCategory ? 'Edit Category' : 'New Category'}
        visible={showFormDialog}
        style={{ width: '600px' }}
        onHide={() => setShowFormDialog(false)}
        footer={formDialogFooter}
        modal
      >
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <InputText
              id="name"
              value={formData.name || ''}
              onChange={(e) => {
                const name = e.target.value;
                setFormData({ ...formData, name });
                // Auto-generate slug if creating new category
                if (!editingCategory) {
                  setFormData({ ...formData, name, slug: generateSlug(name) });
                }
              }}
              className="w-full"
              placeholder="Enter category name"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <InputText
              id="slug"
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full"
              placeholder="category-slug"
            />
            <small className="text-gray-500">URL-friendly identifier (lowercase, hyphens)</small>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <InputTextarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full"
              placeholder="Enter category description"
            />
          </div>

          <div>
            <label htmlFor="parent" className="block text-sm font-medium text-gray-700 mb-1">
              Parent Category
            </label>
            <Dropdown
              id="parent"
              value={formData.parent_id}
              options={parentOptions}
              onChange={(e) => setFormData({ ...formData, parent_id: e.value })}
              className="w-full"
              placeholder="Select parent category"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
