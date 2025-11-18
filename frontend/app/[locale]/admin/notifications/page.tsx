'use client';

import { useState, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dropdown } from 'primereact/dropdown';
import { Badge } from 'primereact/badge';
import { InputSwitch } from 'primereact/inputswitch';
import { adminShopAPI, Notification } from '@/services/AdminShopAPIService';
import { useToast, useDataTable } from '@/hooks';
import PageHeader from '@/components/admin/PageHeader';
import { getNotificationColumns, getRowClassName } from '@/components/admin/NotificationColumns';

const typeOptions = [
  { label: 'All Types', value: '' },
  { label: 'Low Stock', value: 'low_stock' },
  { label: 'Payment Failed', value: 'payment_failed' },
  { label: 'Order Created', value: 'order_created' },
  { label: 'Order Paid', value: 'order_paid' },
];

const severityOptions = [
  { label: 'All Severities', value: '' },
  { label: 'Info', value: 'info' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' },
  { label: 'Critical', value: 'critical' },
];

export default function NotificationsPage() {
  const { toast, showSuccess, showError } = useToast();
  const [filterType, setFilterType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const {
    items: notifications,
    loading,
    totalRecords,
    first,
    onPageChange,
    refresh,
  } = useDataTable<Notification>({
    fetchData: useCallback(
      async (params) => {
        const response = await adminShopAPI.listNotifications({
          type: filterType || undefined,
          severity: filterSeverity || undefined,
          unread: showUnreadOnly || undefined,
          page: params.page,
          per_page: params.per_page,
        });
        setUnreadCount(response.unread_count || 0);
        return {
          items: response.notifications || [],
          total: response.total || 0,
        };
      },
      [filterType, filterSeverity, showUnreadOnly]
    ),
  });

  const handleMarkAsRead = async (id: number) => {
    try {
      await adminShopAPI.markAsRead(id);
      showSuccess('Success', 'Notification marked as read');
      refresh();
    } catch {
      showError('Error', 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await adminShopAPI.markAllAsRead();
      showSuccess('Success', 'All notifications marked as read');
      refresh();
    } catch {
      showError('Error', 'Failed to mark all as read');
    }
  };

  const handleDelete = (notification: Notification) => {
    confirmDialog({
      message: 'Are you sure you want to delete this notification?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await adminShopAPI.deleteNotification(notification.id);
          showSuccess('Success', 'Notification deleted successfully');
          refresh();
        } catch {
          showError('Error', 'Failed to delete notification');
        }
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>Notifications</span>
            {unreadCount > 0 && <Badge value={unreadCount} severity="warning" />}
          </div>
        }
        subtitle="System notifications and alerts"
        actions={[
          {
            label: 'Mark All as Read',
            icon: 'pi pi-check-circle',
            onClick: handleMarkAllAsRead,
            severity: 'info',
          },
        ]}
      />

      <div className="flex gap-4 items-center flex-wrap bg-white p-4 rounded-lg shadow">
        <Dropdown
          value={filterType}
          options={typeOptions}
          onChange={(e) => setFilterType(e.value)}
          placeholder="Filter by Type"
          className="w-48"
        />
        <Dropdown
          value={filterSeverity}
          options={severityOptions}
          onChange={(e) => setFilterSeverity(e.value)}
          placeholder="Filter by Severity"
          className="w-48"
        />
        <div className="flex items-center gap-2">
          <InputSwitch checked={showUnreadOnly} onChange={(e) => setShowUnreadOnly(e.value)} />
          <label className="text-sm font-medium">Show Unread Only</label>
        </div>
      </div>

      <DataTable
        value={notifications}
        loading={loading}
        lazy
        paginator
        rows={20}
        totalRecords={totalRecords}
        onPage={onPageChange}
        first={first}
        rowClassName={getRowClassName}
        emptyMessage="No notifications found"
        className="shadow-lg"
      >
        {getNotificationColumns(handleMarkAsRead, handleDelete)}
      </DataTable>
    </div>
  );
}
