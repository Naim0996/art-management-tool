'use client';

import { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { DiscountDTO, DiscountAPIService } from '@/services/DiscountAPIService';

export default function AdminDiscountsPage() {
  const toast = useRef<Toast>(null);

  const [discounts, setDiscounts] = useState<DiscountDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountDTO | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);

  const [formData, setFormData] = useState<Partial<DiscountDTO>>({
    code: '',
    type: 'percentage',
    value: 0,
    min_purchase: 0,
    max_uses: null,
    starts_at: null,
    expires_at: null,
    active: true,
  });

  const discountTypeOptions = [
    { label: 'Percentage', value: 'percentage' },
    { label: 'Fixed Amount', value: 'fixed_amount' },
  ];

  useEffect(() => {
    loadDiscounts();
  }, [page]);

  const loadDiscounts = async () => {
    setLoading(true);
    try {
      const response = await DiscountAPIService.getAllDiscounts(page, 20);
      setDiscounts(response.discounts);
      setTotalRecords(response.total);
    } catch (error) {
      console.error('Error loading discounts:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load discounts',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingDiscount(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      min_purchase: 0,
      max_uses: null,
      starts_at: null,
      expires_at: null,
      active: true,
    });
    setShowFormDialog(true);
  };

  const handleEdit = (discount: DiscountDTO) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      type: discount.type,
      value: discount.value,
      min_purchase: discount.min_purchase || 0,
      max_uses: discount.max_uses,
      starts_at: discount.starts_at || null,
      expires_at: discount.expires_at || null,
      active: discount.active,
    });
    setShowFormDialog(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.code || !formData.value) {
        toast.current?.show({
          severity: 'warn',
          summary: 'Validation Error',
          detail: 'Code and Value are required',
          life: 3000,
        });
        return;
      }

      if (formData.type === 'percentage' && (formData.value <= 0 || formData.value > 100)) {
        toast.current?.show({
          severity: 'warn',
          summary: 'Validation Error',
          detail: 'Percentage must be between 1 and 100',
          life: 3000,
        });
        return;
      }

      if (editingDiscount?.id) {
        await DiscountAPIService.updateDiscount(editingDiscount.id, formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Discount updated successfully',
          life: 3000,
        });
      } else {
        await DiscountAPIService.createDiscount(formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Discount created successfully',
          life: 3000,
        });
      }

      setShowFormDialog(false);
      loadDiscounts();
    } catch (error) {
      console.error('Error saving discount:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'Failed to save discount',
        life: 5000,
      });
    }
  };

  const handleDelete = (discount: DiscountDTO) => {
    confirmDialog({
      message: `Are you sure you want to delete discount code "${discount.code}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          if (discount.id) {
            const result = await DiscountAPIService.deleteDiscount(discount.id);
            toast.current?.show({
              severity: 'success',
              summary: 'Success',
              detail: result.message,
              life: 3000,
            });
            loadDiscounts();
          }
        } catch (error) {
          console.error('Error deleting discount:', error);
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to delete discount',
            life: 5000,
          });
        }
      },
    });
  };

  const actionsBodyTemplate = (rowData: DiscountDTO) => {
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

  const codeBodyTemplate = (rowData: DiscountDTO) => {
    return <span className="font-mono font-bold">{rowData.code}</span>;
  };

  const typeBodyTemplate = (rowData: DiscountDTO) => {
    return rowData.type === 'percentage' ? 'Percentage' : 'Fixed Amount';
  };

  const valueBodyTemplate = (rowData: DiscountDTO) => {
    return rowData.type === 'percentage' 
      ? `${rowData.value}%` 
      : `€${rowData.value.toFixed(2)}`;
  };

  const statusBodyTemplate = (rowData: DiscountDTO) => {
    const now = new Date();
    let status = 'inactive';
    let severity: 'success' | 'warning' | 'danger' | 'info' = 'danger';

    if (!rowData.active) {
      status = 'Inactive';
      severity = 'danger';
    } else if (rowData.starts_at && new Date(rowData.starts_at) > now) {
      status = 'Scheduled';
      severity = 'info';
    } else if (rowData.expires_at && new Date(rowData.expires_at) < now) {
      status = 'Expired';
      severity = 'warning';
    } else if (rowData.max_uses && rowData.used_count && rowData.used_count >= rowData.max_uses) {
      status = 'Used Up';
      severity = 'warning';
    } else {
      status = 'Active';
      severity = 'success';
    }

    return <Tag value={status} severity={severity} />;
  };

  const usageBodyTemplate = (rowData: DiscountDTO) => {
    if (!rowData.max_uses) return <span className="text-gray-500">Unlimited</span>;
    return `${rowData.used_count || 0} / ${rowData.max_uses}`;
  };

  const expiryBodyTemplate = (rowData: DiscountDTO) => {
    if (!rowData.expires_at) return <span className="text-gray-500">No expiry</span>;
    return new Date(rowData.expires_at).toLocaleDateString();
  };

  const formDialogFooter = (
    <div>
      <Button label="Cancel" icon="pi pi-times" onClick={() => setShowFormDialog(false)} className="p-button-text" />
      <Button label="Save" icon="pi pi-check" onClick={handleSave} />
    </div>
  );

  const onPageChange = (event: { page?: number; first: number; rows: number }) => {
    if (event.page !== undefined) {
      setPage(event.page + 1);
    }
  };

  return (
    <div className="p-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discount Code Management</h1>
          <p className="text-gray-600 mt-2">Create and manage promotional discount codes</p>
        </div>
        <Button
          label="New Discount"
          icon="pi pi-plus"
          onClick={handleCreate}
          className="p-button-primary"
        />
      </div>

      <DataTable
        value={discounts}
        loading={loading}
        lazy
        paginator
        rows={20}
        totalRecords={totalRecords}
        onPage={onPageChange}
        first={(page - 1) * 20}
        responsiveLayout="scroll"
        emptyMessage="No discount codes found"
        className="shadow-lg"
      >
        <Column field="code" header="Code" body={codeBodyTemplate} sortable />
        <Column header="Type" body={typeBodyTemplate} />
        <Column header="Value" body={valueBodyTemplate} />
        <Column field="min_purchase" header="Min Purchase" body={(data) => data.min_purchase ? `€${data.min_purchase}` : '—'} />
        <Column header="Usage" body={usageBodyTemplate} />
        <Column header="Expires" body={expiryBodyTemplate} />
        <Column header="Status" body={statusBodyTemplate} />
        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '120px' }} />
      </DataTable>

      <Dialog
        header={editingDiscount ? 'Edit Discount Code' : 'New Discount Code'}
        visible={showFormDialog}
        style={{ width: '700px' }}
        onHide={() => setShowFormDialog(false)}
        footer={formDialogFooter}
        modal
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Discount Code *
              </label>
              <InputText
                id="code"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full font-mono"
                placeholder="SUMMER2025"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type *
              </label>
              <Dropdown
                id="type"
                value={formData.type}
                options={discountTypeOptions}
                onChange={(e) => setFormData({ ...formData, type: e.value })}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                Value * {formData.type === 'percentage' ? '(%)' : '(€)'}
              </label>
              <InputNumber
                id="value"
                value={formData.value || 0}
                onValueChange={(e) => setFormData({ ...formData, value: e.value || 0 })}
                mode={formData.type === 'fixed_amount' ? 'currency' : 'decimal'}
                currency="EUR"
                locale="en-US"
                min={0}
                max={formData.type === 'percentage' ? 100 : undefined}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="minPurchase" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Purchase (€)
              </label>
              <InputNumber
                id="minPurchase"
                value={formData.min_purchase || 0}
                onValueChange={(e) => setFormData({ ...formData, min_purchase: e.value || 0 })}
                mode="currency"
                currency="EUR"
                locale="en-US"
                min={0}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Uses (leave empty for unlimited)
            </label>
            <InputNumber
              id="maxUses"
              value={formData.max_uses || undefined}
              onValueChange={(e) => setFormData({ ...formData, max_uses: e.value || null })}
              min={1}
              className="w-full"
              placeholder="Unlimited"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startsAt" className="block text-sm font-medium text-gray-700 mb-1">
                Starts At
              </label>
              <Calendar
                id="startsAt"
                value={formData.starts_at ? new Date(formData.starts_at) : null}
                onChange={(e) => setFormData({ ...formData, starts_at: e.value?.toISOString() || null })}
                showTime
                hourFormat="24"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">
                Expires At
              </label>
              <Calendar
                id="expiresAt"
                value={formData.expires_at ? new Date(formData.expires_at) : null}
                onChange={(e) => setFormData({ ...formData, expires_at: e.value?.toISOString() || null })}
                showTime
                hourFormat="24"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <InputSwitch
              id="active"
              checked={formData.active || false}
              onChange={(e) => setFormData({ ...formData, active: e.value })}
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
