'use client';

import { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { adminShopAPI, Product } from '@/services/AdminShopAPIService';

export default function ShopProductsManagement() {
  const toast = useRef<Toast>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    short_description: '',
    long_description: '',
    base_price: 0,
    currency: 'EUR',
    sku: '',
    gtin: '',
    status: 'draft' as 'published' | 'draft' | 'archived',
  });

  const [variantData, setVariantData] = useState({
    sku: '',
    name: '',
    attributes: '{}',
    price_adjustment: 0,
    stock: 0,
  });

  const statusOptions = [
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
    { label: 'Archived', value: 'archived' },
  ];

  const currencyOptions = [
    { label: 'EUR (€)', value: 'EUR' },
    { label: 'USD ($)', value: 'USD' },
  ];

  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await adminShopAPI.listProducts({
        search: searchQuery || undefined,
        page,
        per_page: 10,
      });
      setProducts(response.products || []);
      setTotalRecords(response.total || 0);
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
      slug: '',
      title: '',
      short_description: '',
      long_description: '',
      base_price: 0,
      currency: 'EUR',
      sku: '',
      gtin: '',
      status: 'draft',
    });
    setShowFormDialog(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      slug: product.slug,
      title: product.title,
      short_description: product.short_description,
      long_description: product.long_description || '',
      base_price: product.base_price,
      currency: product.currency,
      sku: product.sku,
      gtin: product.gtin || '',
      status: product.status,
    });
    setShowFormDialog(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.sku) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Title, Slug, and SKU are required',
        life: 3000,
      });
      return;
    }

    try {
      if (editingProduct) {
        await adminShopAPI.updateProduct(editingProduct.id, formData);
      } else {
        await adminShopAPI.createProduct(formData);
      }
      
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Product ${editingProduct ? 'updated' : 'created'} successfully`,
        life: 3000,
      });
      setShowFormDialog(false);
      fetchProducts();
    } catch (error: unknown) {
      console.error('Error saving product:', error);
      const message = error instanceof Error ? error.message : 'Failed to save product';
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 3000,
      });
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

  const handleManageVariants = async (product: Product) => {
    try {
      const fullProduct = await adminShopAPI.getProduct(product.id);
      setSelectedProduct(fullProduct);
      setVariantData({
        sku: '',
        name: '',
        attributes: '{}',
        price_adjustment: 0,
        stock: 0,
      });
      setShowVariantDialog(true);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load product details',
        life: 3000,
      });
    }
  };

  const handleAddVariant = async () => {
    if (!selectedProduct || !variantData.name || !variantData.sku) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Name and SKU are required',
        life: 3000,
      });
      return;
    }

    try {
      await adminShopAPI.addVariant(selectedProduct.id, variantData);
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Variant added successfully',
        life: 3000,
      });
      
      const updated = await adminShopAPI.getProduct(selectedProduct.id);
      setSelectedProduct(updated);
      
      // AGGIORNAMENTO TEMPO REALE: Aggiorna anche la lista principale
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === updated.id ? updated : p
        )
      );
      
      setVariantData({
        sku: '',
        name: '',
        attributes: '{}',
        price_adjustment: 0,
        stock: 0,
      });
    } catch (error: unknown) {
      console.error('Error adding variant:', error);
      const message = error instanceof Error ? error.message : 'Failed to add variant';
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 3000,
      });
    }
  };

  const handleUpdateInventory = async (variantId: number, quantity: number, operation: 'set' | 'add' | 'subtract') => {
    try {
      await adminShopAPI.adjustInventory({ variant_id: variantId, quantity, operation });
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Inventory updated successfully',
        life: 2000,
      });
      
      // Aggiorna il prodotto selezionato nella dialog
      if (selectedProduct) {
        const updated = await adminShopAPI.getProduct(selectedProduct.id);
        setSelectedProduct(updated);
        
        // AGGIORNAMENTO TEMPO REALE: Aggiorna anche la lista principale
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p.id === updated.id ? updated : p
          )
        );
      }
    } catch (error: unknown) {
      console.error('Error updating inventory:', error);
      const message = error instanceof Error ? error.message : 'Failed to update inventory';
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 3000,
      });
    }
  };

  const statusBodyTemplate = (rowData: Product) => {
    const severity = rowData.status === 'published' ? 'success' : rowData.status === 'draft' ? 'warning' : 'danger';
    return <Tag value={rowData.status} severity={severity} />;
  };

  const priceBodyTemplate = (rowData: Product) => {
    return `${rowData.currency === 'EUR' ? '€' : '$'}${rowData.base_price.toFixed(2)}`;
  };

  const stockBodyTemplate = (rowData: Product) => {
    const totalStock = rowData.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
    const severity = totalStock > 10 ? 'success' : totalStock > 0 ? 'warning' : 'danger';
    return <Tag value={`${totalStock} units`} severity={severity} />;
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
          icon="pi pi-box"
          rounded
          outlined
          severity="warning"
          onClick={() => handleManageVariants(rowData)}
          tooltip="Manage Variants"
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

  return (
    <div className="p-6 space-y-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Shop Products Management</h1>
          <p className="text-gray-600 mt-1">Manage products, variants, and inventory</p>
        </div>
        <Button
          label="Create New Product"
          icon="pi pi-plus"
          onClick={handleCreate}
          severity="success"
        />
      </div>

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

      <DataTable
        value={products}
        loading={loading}
        paginator
        rows={10}
        totalRecords={totalRecords}
        lazy
        first={(page - 1) * 10}
        onPage={(e) => setPage((e.page || 0) + 1)}
        rowsPerPageOptions={[10, 20, 50]}
        tableStyle={{ minWidth: '60rem' }}
        emptyMessage="No products found"
      >
        <Column field="id" header="ID" sortable style={{ width: '5%' }} />
        <Column field="title" header="Title" sortable style={{ width: '20%' }} />
        <Column field="sku" header="SKU" style={{ width: '10%' }} />
        <Column
          field="short_description"
          header="Description"
          style={{ width: '20%' }}
          body={(rowData) => (
            <div className="max-w-xs truncate">{rowData.short_description}</div>
          )}
        />
        <Column
          field="base_price"
          header="Base Price"
          sortable
          style={{ width: '10%' }}
          body={priceBodyTemplate}
        />
        <Column
          field="status"
          header="Status"
          sortable
          style={{ width: '10%' }}
          body={statusBodyTemplate}
        />
        <Column
          header="Stock"
          style={{ width: '10%' }}
          body={stockBodyTemplate}
        />
        <Column
          header="Actions"
          style={{ width: '15%' }}
          body={actionBodyTemplate}
        />
      </DataTable>

      <Dialog
        header={editingProduct ? 'Edit Product' : 'Create New Product'}
        visible={showFormDialog}
        style={{ width: '50vw' }}
        onHide={() => setShowFormDialog(false)}
        footer={
          <div>
            <Button label="Cancel" icon="pi pi-times" onClick={() => setShowFormDialog(false)} text />
            <Button label="Save" icon="pi pi-check" onClick={handleSave} />
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <InputText
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <InputText
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Short Description</label>
            <InputTextarea
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              rows={2}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Long Description (Markdown)</label>
            <InputTextarea
              value={formData.long_description}
              onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
              rows={4}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                SKU <span className="text-red-500">*</span>
              </label>
              <InputText
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">GTIN</label>
              <InputText
                value={formData.gtin}
                onChange={(e) => setFormData({ ...formData, gtin: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <Dropdown
                value={formData.currency}
                options={currencyOptions}
                onChange={(e) => setFormData({ ...formData, currency: e.value })}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Base Price</label>
              <InputNumber
                value={formData.base_price}
                onValueChange={(e) => setFormData({ ...formData, base_price: e.value || 0 })}
                mode="decimal"
                minFractionDigits={2}
                maxFractionDigits={2}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Dropdown
                value={formData.status}
                options={statusOptions}
                onChange={(e) => setFormData({ ...formData, status: e.value })}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        header={`Manage Variants - ${selectedProduct?.title}`}
        visible={showVariantDialog}
        style={{ width: '70vw' }}
        onHide={
          () => setShowVariantDialog(false)
        }
      >
        <TabView>
          <TabPanel header="Variants">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Existing Variants</h3>
              {selectedProduct?.variants && selectedProduct.variants.length > 0 ? (
                <DataTable value={selectedProduct.variants} className="mb-4">
                  <Column field="name" header="Name" />
                  <Column field="sku" header="SKU" />
                  <Column
                    field="price_adjustment"
                    header="Price Adjustment"
                    body={(rowData) => `${rowData.price_adjustment > 0 ? '+' : ''}${rowData.price_adjustment.toFixed(2)}`}
                  />
                  <Column field="stock" header="Stock" />
                  <Column
                    header="Actions"
                    body={(rowData) => (
                      <div className="flex gap-2">
                        <Button
                          icon="pi pi-plus"
                          label="Add 10"
                          size="small"
                          onClick={() => handleUpdateInventory(rowData.id, 10, 'add')}
                        />
                        <Button
                          icon="pi pi-minus"
                          label="Remove 10"
                          size="small"
                          severity="warning"
                          onClick={() => handleUpdateInventory(rowData.id, 10, 'subtract')}
                        />
                      </div>
                    )}
                  />
                </DataTable>
              ) : (
                <p className="text-gray-500">No variants added yet</p>
              )}
            </div>
          </TabPanel>

          <TabPanel header="Add New Variant">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Variant Name <span className="text-red-500">*</span>
                  </label>
                  <InputText
                    value={variantData.name}
                    onChange={(e) => setVariantData({ ...variantData, name: e.target.value })}
                    placeholder="e.g., Medium, Blue, etc."
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <InputText
                    value={variantData.sku}
                    onChange={(e) => setVariantData({ ...variantData, sku: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Attributes (JSON)
                </label>
                <InputTextarea
                  value={variantData.attributes}
                  onChange={(e) => setVariantData({ ...variantData, attributes: e.target.value })}
                  placeholder='{"size": "M", "color": "Blue"}'
                  rows={3}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price Adjustment</label>
                  <InputNumber
                    value={variantData.price_adjustment}
                    onValueChange={(e) => setVariantData({ ...variantData, price_adjustment: e.value || 0 })}
                    mode="decimal"
                    minFractionDigits={2}
                    maxFractionDigits={2}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Initial Stock</label>
                  <InputNumber
                    value={variantData.stock}
                    onValueChange={(e) => setVariantData({ ...variantData, stock: e.value || 0 })}
                    className="w-full"
                  />
                </div>
              </div>

              <Button
                label="Add Variant"
                icon="pi pi-plus"
                onClick={handleAddVariant}
                className="w-full"
              />
            </div>
          </TabPanel>
        </TabView>
      </Dialog>
    </div>
  );
}
