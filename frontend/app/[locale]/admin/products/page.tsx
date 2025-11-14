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
import { useRef } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
}

export default function ProductsManagement() {
  const toast = useRef<Toast>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    stock: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    try {
      const response = await fetch('http://giorgiopriviteralab.com:8080/api/admin/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load products',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      image_url: '',
      stock: 0,
    });
    setShowFormDialog(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      stock: product.stock,
    });
    setShowFormDialog(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('adminToken');
    
    if (!formData.name) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Name is required',
        life: 3000,
      });
      return;
    }

    try {
      const url = editingProduct
        ? `http://giorgiopriviteralab.com:8080/api/admin/products/${editingProduct.id}`
        : 'http://giorgiopriviteralab.com:8080/api/admin/products';
      
      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: `Product ${editingProduct ? 'updated' : 'created'} successfully`,
          life: 3000,
        });
        setShowFormDialog(false);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save product',
        life: 3000,
      });
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
          await fetch(`http://giorgiopriviteralab.com:8080/api/admin/products/${product.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Product deleted successfully',
            life: 3000,
          });
          fetchProducts();
        } catch (error) {
          console.error('Error deleting product:', error);
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete product',
            life: 3000,
          });
        }
      },
    });
  };

  const actionBodyTemplate = (rowData: Product) => {
    return (
      <div className="flex gap-2">
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

  const priceBodyTemplate = (rowData: Product) => {
    return `$${rowData.price.toFixed(2)}`;
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

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Products Management</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <Button
          label="Create New Product"
          icon="pi pi-plus"
          onClick={handleCreate}
          className="p-button-success"
        />
      </div>

      <DataTable
        value={products}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '60rem' }}
        emptyMessage="No products found"
      >
        <Column field="id" header="ID" sortable style={{ width: '10%' }} />
        <Column field="name" header="Name" sortable style={{ width: '20%' }} />
        <Column
          field="description"
          header="Description"
          style={{ width: '25%' }}
          body={(rowData) => (
            <div className="max-w-xs truncate">{rowData.description}</div>
          )}
        />
        <Column
          field="price"
          header="Price"
          sortable
          style={{ width: '15%' }}
          body={priceBodyTemplate}
        />
        <Column field="stock" header="Stock" sortable style={{ width: '10%' }} />
        <Column
          header="Actions"
          body={actionBodyTemplate}
          style={{ width: '15%' }}
        />
      </DataTable>

      <Dialog
        header={editingProduct ? 'Edit Product' : 'Create New Product'}
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
              placeholder="Enter product name"
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
              placeholder="Enter product description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="price" className="font-semibold">
                Price ($)
              </label>
              <InputNumber
                id="price"
                value={formData.price}
                onValueChange={(e) => setFormData({ ...formData, price: e.value || 0 })}
                mode="currency"
                currency="USD"
                locale="en-US"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="stock" className="font-semibold">
                Stock
              </label>
              <InputNumber
                id="stock"
                value={formData.stock}
                onValueChange={(e) => setFormData({ ...formData, stock: e.value || 0 })}
                placeholder="Stock quantity"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="image_url" className="font-semibold">
              Image URL
            </label>
            <InputText
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="Enter image URL"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
