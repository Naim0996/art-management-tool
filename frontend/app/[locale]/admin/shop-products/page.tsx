'use client';

import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { adminShopAPI, Product } from '@/services/AdminShopAPIService';
import ProductVariantManagement from '@/components/admin/ProductVariantManagement';
import ShopProductForm from '@/components/admin/ShopProductForm';
import PageHeader from '@/components/admin/PageHeader';
import { getShopProductColumns } from '@/components/admin/ShopProductColumns';
import { useToast } from '@/hooks/useToast';
import { useFormDialog } from '@/hooks/useFormDialog';
import { useDataTable } from '@/hooks/useDataTable';
import { useShopProductManagement } from '@/hooks/useShopProductManagement';

const initialFormData = {
  slug: '',
  title: '',
  short_description: '',
  long_description: '',
  base_price: 0,
  currency: 'EUR',
  sku: '',
  gtin: '',
  character_value: '',
  etsy_link: '',
  status: 'draft' as 'published' | 'draft' | 'archived',
};

export default function ShopProductsManagement() {
  const { toast, showSuccess, showError } = useToast();
  const { showDialog, formData, isEditing, openDialog, closeDialog, setFormData } = useFormDialog(initialFormData);
  const [showVariantDialog, setShowVariantDialog] = useState(false);

  const {
    items: products,
    loading,
    searchQuery,
    setSearchQuery,
    setItems: setProducts,
    totalRecords,
    first,
    onPageChange,
    refresh: refetch,
  } = useDataTable<Product>({
    fetchData: async ({ page, per_page, search }) => {
      const response = await adminShopAPI.listProducts({
        search,
        page,
        per_page,
      });
      return {
        items: response.products || [],
        total: response.total || 0,
      };
    },
    onError: () => showError('Failed to load products'),
  });

  const {
    selectedProduct,
    variantData,
    setVariantData,
    handleManageVariants: openVariantDialog,
    handleAddVariant,
    handleUpdateInventory,
    handleImagesChange,
  } = useShopProductManagement({
    onSuccess: showSuccess,
    onError: showError,
    refetch,
    setProducts,
  });

  const handleCreate = () => {
    openDialog(null);
  };

  const handleEdit = (product: Product) => {
    const productData = {
      slug: product.slug,
      title: product.title,
      short_description: product.short_description,
      long_description: product.long_description || '',
      base_price: product.base_price,
      currency: product.currency,
      sku: product.sku,
      gtin: product.gtin || '',
      character_value: product.character_value || '',
      etsy_link: product.etsy_link || '',
      status: product.status,
    };
    setFormData(productData);
    openDialog(product);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.sku) {
      showError('Title, Slug, and SKU are required', 'Validation');
      return;
    }

    try {
      const editingProduct = isEditing as Product | null;
      if (editingProduct) {
        await adminShopAPI.updateProduct(editingProduct.id, formData);
        showSuccess(`Product updated successfully`);
      } else {
        await adminShopAPI.createProduct(formData);
        showSuccess(`Product created successfully`);
      }
      closeDialog();
      refetch();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save product';
      showError(message);
    }
  };

  const handleDelete = (product: Product) => {
    confirmDialog({
      message: `Are you sure you want to delete "${product.title}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await adminShopAPI.deleteProduct(product.id);
          showSuccess('Product deleted successfully');
          refetch();
        } catch (error) {
          showError('Failed to delete product');
        }
      },
    });
  };

  const handleManageVariants = async (product: Product) => {
    const result = await openVariantDialog(product);
    if (result) {
      setShowVariantDialog(true);
    }
  };

  const columns = getShopProductColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onManageVariants: handleManageVariants,
  });

  return (
    <div className="p-6 space-y-6">
      {toast}
      <ConfirmDialog />

      <PageHeader
        title="Shop Products Management"
        subtitle="Manage products, variants, inventory and images"
        actions={
          <Button
            label="Create New Product"
            icon="pi pi-plus"
            onClick={handleCreate}
            severity="success"
          />
        }
      />

      <div className="flex gap-4">
        <span className="p-input-icon-left flex-1">
          <i className="pi pi-search" />
          <InputText
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full"
          />
        </span>
      </div>

      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
        <div className="flex items-start">
          <i className="pi pi-info-circle text-purple-600 text-xl mr-3 mt-1"></i>
          <div>
            <h3 className="text-purple-900 font-semibold mb-1">Managing Product Images</h3>
            <p className="text-purple-800 text-sm">
              Click the <i className="pi pi-images text-green-600 mx-1"></i> button to upload custom images from your computer.
              You can upload multiple images, reorder them, and add SEO-friendly alt text.
            </p>
          </div>
        </div>
      </div>

      <DataTable
        value={products}
        loading={loading}
        paginator
        rows={10}
        totalRecords={totalRecords}
        lazy
        first={first}
        onPage={onPageChange}
        rowsPerPageOptions={[10, 20, 50]}
        tableStyle={{ minWidth: '60rem' }}
        emptyMessage="No products found"
      >
        {columns}
      </DataTable>

      <Dialog
        header={isEditing ? 'Edit Product' : 'Create New Product'}
        visible={showDialog}
        style={{ width: '50vw' }}
        onHide={closeDialog}
        footer={
          <div>
            <Button label="Cancel" icon="pi pi-times" onClick={closeDialog} text />
            <Button label="Save" icon="pi pi-check" onClick={handleSave} />
          </div>
        }
      >
        <ShopProductForm formData={formData} onChange={setFormData} />
      </Dialog>

      <Dialog
        header={`Manage Product: ${selectedProduct?.title}`}
        visible={showVariantDialog}
        style={{ width: '75vw', maxHeight: '90vh' }}
        onHide={() => setShowVariantDialog(false)}
        className="overflow-auto"
      >
        {selectedProduct && (
          <ProductVariantManagement
            product={selectedProduct}
            variantData={variantData}
            onVariantDataChange={setVariantData}
            onAddVariant={handleAddVariant}
            onUpdateInventory={handleUpdateInventory}
            onImagesChange={handleImagesChange}
          />
        )}
      </Dialog>
    </div>
  );
}
