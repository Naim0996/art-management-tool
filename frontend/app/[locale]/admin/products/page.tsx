'use client';

import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useToast } from '@/hooks/useToast';
import { useFormDialog } from '@/hooks/useFormDialog';
import { useDataTable } from '@/hooks/useDataTable';
import PageHeader from '@/components/admin/PageHeader';
import FormDialog from '@/components/admin/FormDialog';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProductColumns } from '@/components/admin/ProductColumns';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
}

const initialFormData = {
  name: '',
  description: '',
  price: 0,
  image_url: '',
  stock: 0,
};

export default function ProductsManagement() {
  const { toast, showSuccess, showError } = useToast();
  const { showDialog, formData, isEditing, openDialog, closeDialog, setFormData } = 
    useFormDialog<typeof initialFormData>(initialFormData);
  
  const { items: products, loading, refresh } = useDataTable<Product>({
    fetchData: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return { items: data || [], total: data?.length || 0 };
    },
  });

  const handleCreate = () => {
    openDialog(initialFormData);
  };

  const handleEdit = (product: Product) => {
    openDialog({
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      stock: product.stock,
    }, product);
  };

  const handleSave = async () => {
    if (!formData.name) {
      showError('Name is required');
      return;
    }

    const token = localStorage.getItem('adminToken');
    try {
      const url = isEditing
        ? `/api/admin/products/${(isEditing as any).id}`
        : '/api/admin/products';
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSuccess(`Product ${isEditing ? 'updated' : 'created'} successfully`);
        closeDialog();
        refresh();
      } else {
        showError('Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showError('Failed to save product');
    }
  };

  const handleDelete = (product: Product) => {
    confirmDialog({
      message: `Are you sure you want to delete "${product.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        const token = localStorage.getItem('adminToken');
        try {
          await fetch(`/api/admin/products/${product.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          showSuccess('Product deleted successfully');
          refresh();
        } catch (error) {
          console.error('Error deleting product:', error);
          showError('Failed to delete product');
        }
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      {toast}
      <ConfirmDialog />

      <PageHeader
        title="Products Management"
        subtitle="Manage your product catalog"
        actions={[
          {
            label: 'Create New Product',
            icon: 'pi pi-plus',
            onClick: handleCreate,
            severity: 'success',
          },
        ]}
      />

      <DataTable
        value={products}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '60rem' }}
        emptyMessage="No products found"
      >
        <ProductColumns onEdit={handleEdit} onDelete={handleDelete} />
      </DataTable>

      <FormDialog
        visible={showDialog}
        title={isEditing ? 'Edit Product' : 'Create New Product'}
        onHide={closeDialog}
        onSave={handleSave}
      >
        <ProductForm formData={formData} onChange={setFormData} />
      </FormDialog>
    </div>
  );
}
