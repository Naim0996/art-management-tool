'use client';

import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DiscountDTO, DiscountAPIService } from '@/services/DiscountAPIService';
import { useToast, useFormDialog, usePagination } from '@/hooks';
import PageHeader from '@/components/admin/PageHeader';
import FormDialog from '@/components/admin/FormDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DiscountForm from '@/components/admin/DiscountForm';
import { getDiscountColumns } from '@/components/admin/DiscountColumns';

const initialFormData: Partial<DiscountDTO> = {
  code: '',
  type: 'percentage',
  value: 0,
  min_purchase: 0,
  max_uses: null,
  starts_at: null,
  expires_at: null,
  active: true,
};

export default function AdminDiscountsPage() {
  const { toast, showSuccess, showError, showWarning } = useToast();
  const { 
    showDialog, 
    formData, 
    isEditing, 
    openDialog, 
    closeDialog, 
    updateFormData 
  } = useFormDialog<Partial<DiscountDTO>>(initialFormData);
  const { 
    page, 
    totalRecords, 
    first, 
    setPage, 
    setTotalRecords, 
    onPageChange 
  } = usePagination({ initialPerPage: 20 });

  const [discounts, setDiscounts] = useState<DiscountDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadDiscounts = async () => {
    setLoading(true);
    try {
      const response = await DiscountAPIService.getAllDiscounts(page, 20);
      setDiscounts(response.discounts);
      setTotalRecords(response.total);
    } catch (error) {
      showError('Error', 'Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  // Load discounts when page changes
  useEffect(() => {
    loadDiscounts();
  }, [page]);

  const handleCreate = () => {
    openDialog();
  };

  const handleEdit = (discount: DiscountDTO) => {
    openDialog({
      id: discount.id,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      min_purchase: discount.min_purchase || 0,
      max_uses: discount.max_uses,
      starts_at: discount.starts_at || null,
      expires_at: discount.expires_at || null,
      active: discount.active,
    });
  };

  const handleSave = async () => {
    if (!formData.code || !formData.value) {
      showWarning('Validation Error', 'Code and Value are required');
      return;
    }

    if (formData.type === 'percentage' && (formData.value <= 0 || formData.value > 100)) {
      showWarning('Validation Error', 'Percentage must be between 1 and 100');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await DiscountAPIService.updateDiscount((formData as DiscountDTO).id!, formData);
        showSuccess('Success', 'Discount updated successfully');
      } else {
        await DiscountAPIService.createDiscount(formData);
        showSuccess('Success', 'Discount created successfully');
      }
      closeDialog();
      loadDiscounts();
    } catch (error) {
      showError('Error', error instanceof Error ? error.message : 'Failed to save discount');
    } finally {
      setSaving(false);
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
            showSuccess('Success', result.message);
            loadDiscounts();
          }
        } catch (error) {
          showError('Error', error instanceof Error ? error.message : 'Failed to delete discount');
        }
      },
    });
  };

  if (loading && discounts.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="p-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      <PageHeader
        title="Discount Code Management"
        subtitle="Create and manage promotional discount codes"
        actions={[
          {
            label: 'New Discount',
            icon: 'pi pi-plus',
            onClick: handleCreate,
            severity: 'success',
          },
        ]}
      />

      <DataTable
        value={discounts}
        loading={loading}
        lazy
        paginator
        rows={20}
        totalRecords={totalRecords}
        onPage={onPageChange}
        first={first}
        responsiveLayout="scroll"
        emptyMessage="No discount codes found"
        className="shadow-lg"
      >
        {getDiscountColumns(handleEdit, handleDelete)}
      </DataTable>

      <FormDialog
        visible={showDialog}
        title={isEditing ? 'Edit Discount Code' : 'New Discount Code'}
        onHide={closeDialog}
        onSave={handleSave}
        loading={saving}
        maxWidth="700px"
      >
        <DiscountForm formData={formData} onChange={updateFormData} />
      </FormDialog>
    </div>
  );
}
