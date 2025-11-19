'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { CategoryDTO, CategoryAPIService } from '@/services/CategoryAPIService';
import { useToast, useFormDialog } from '@/hooks';
import PageHeader from '@/components/admin/PageHeader';
import FormDialog from '@/components/admin/FormDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CategoryForm from '@/components/admin/CategoryForm';
import { getCategoryColumns } from '@/components/admin/CategoryColumns';

const initialFormData: Partial<CategoryDTO> = {
  name: '',
  slug: '',
  description: '',
  parent_id: null,
};

export default function AdminCategoriesPage() {
  const { toast, showSuccess, showError, showWarning } = useToast();
  const {
    showDialog,
    formData,
    isEditing,
    openDialog,
    closeDialog,
    updateFormData,
  } = useFormDialog<Partial<CategoryDTO>>(initialFormData);

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CategoryAPIService.getAllCategoriesAdmin(undefined, true, true);
      setCategories(data);
    } catch {
      showError('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreate = () => {
    openDialog();
  };

  const handleEdit = (category: CategoryDTO) => {
    openDialog({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parent_id: category.parent_id || null,
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      showWarning('Validation Error', 'Name and Slug are required');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await CategoryAPIService.updateCategory((formData as CategoryDTO).id!, formData);
        showSuccess('Success', 'Category updated successfully');
      } else {
        await CategoryAPIService.createCategory(formData);
        showSuccess('Success', 'Category created successfully');
      }
      closeDialog();
      loadCategories();
    } catch (error) {
      showError('Error', error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setSaving(false);
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
            showSuccess('Success', 'Category deleted successfully');
            loadCategories();
          }
        } catch (error) {
          showError('Error', error instanceof Error ? error.message : 'Failed to delete category');
        }
      },
    });
  };

  const parentOptions = useMemo(() => {
    const editingId = isEditing ? (formData as CategoryDTO).id : null;
    return [
      { label: 'None (Top Level)', value: null as number | null },
      ...categories
        .filter((c) => !editingId || c.id !== editingId)
        .map((c) => ({ label: c.name, value: c.id as number | null })),
    ];
  }, [categories, formData, isEditing]);

  if (loading && categories.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="p-6">
      {toast}
      <ConfirmDialog />

      <PageHeader
        title="Category Management"
        subtitle="Manage product categories for your shop"
        actions={[
          {
            label: 'New Category',
            icon: 'pi pi-plus',
            onClick: handleCreate,
            severity: 'success',
          },
        ]}
      />

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
        {getCategoryColumns(handleEdit, handleDelete)}
      </DataTable>

      <FormDialog
        visible={showDialog}
        title={isEditing ? 'Edit Category' : 'New Category'}
        onHide={closeDialog}
        onSave={handleSave}
        loading={saving}
        maxWidth="600px"
      >
        <CategoryForm
          formData={formData}
          onChange={updateFormData}
          parentOptions={parentOptions}
        />
      </FormDialog>
    </div>
  );
}
