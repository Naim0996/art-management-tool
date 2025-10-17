'use client';

import { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dropdown } from 'primereact/dropdown';
import { Badge } from 'primereact/badge';
import { adminShopAPI, Notification } from '@/services/AdminShopAPIService';

export default function NotificationsPage() {
  const toast = useRef<Toast>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

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

  useEffect(() => {
    fetchNotifications();
  }, [page, filterType, filterSeverity, showUnreadOnly]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await adminShopAPI.listNotifications({
        type: filterType || undefined,
        severity: filterSeverity || undefined,
        unread: showUnreadOnly || undefined,
        page,
        per_page: 20,
      });
      setNotifications(response.notifications || []);
      setTotalRecords(response.total || 0);
      setUnreadCount(response.unread_count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load notifications',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await adminShopAPI.markAsRead(id);
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Notification marked as read',
        life: 2000,
      });
      fetchNotifications();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to mark notification as read',
        life: 3000,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await adminShopAPI.markAllAsRead();
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'All notifications marked as read',
        life: 2000,
      });
      fetchNotifications();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to mark all as read',
        life: 3000,
      });
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
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Notification deleted successfully',
            life: 2000,
          });
          fetchNotifications();
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete notification',
            life: 3000,
          });
        }
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const typeBodyTemplate = (rowData: Notification) => {
    const label = rowData.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return <span className="font-medium">{label}</span>;
  };

  const severityBodyTemplate = (rowData: Notification) => {
    const severityMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
      info: 'info',
      warning: 'warning',
      error: 'danger',
      critical: 'danger',
    };
    return <Tag value={rowData.severity} severity={severityMap[rowData.severity]} />;
  };

  const statusBodyTemplate = (rowData: Notification) => {
    return rowData.read_at ? (
      <Tag value="Read" severity="success" icon="pi pi-check" />
    ) : (
      <Tag value="Unread" severity="warning" icon="pi pi-exclamation-circle" />
    );
  };

  const dateBodyTemplate = (rowData: Notification) => {
    return formatDate(rowData.created_at);
  };

  const actionBodyTemplate = (rowData: Notification) => {
    return (
      <div className="flex gap-2">
        {!rowData.read_at && (
          <Button
            icon="pi pi-check"
            rounded
            outlined
            severity="success"
            onClick={() => handleMarkAsRead(rowData.id)}
            tooltip="Mark as Read"
          />
        )}
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

  const rowClassName = (rowData: Notification) => {
    return rowData.read_at ? '' : 'bg-blue-50';
  };

  return (
    <div className="p-6 space-y-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <Badge value={unreadCount} severity="warning" />
            )}
          </h1>
          <p className="text-gray-600 mt-1">System notifications and alerts</p>
        </div>
        {unreadCount > 0 && (
          <Button
            label="Mark All as Read"
            icon="pi pi-check-circle"
            onClick={handleMarkAllAsRead}
            outlined
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <Dropdown
            value={filterType}
            options={typeOptions}
            onChange={(e) => setFilterType(e.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Severity</label>
          <Dropdown
            value={filterSeverity}
            options={severityOptions}
            onChange={(e) => setFilterSeverity(e.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-end">
          <Button
            label={showUnreadOnly ? 'Show All' : 'Show Unread Only'}
            icon={showUnreadOnly ? 'pi pi-inbox' : 'pi pi-filter'}
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            outlined={!showUnreadOnly}
            className="w-full"
          />
        </div>
      </div>

      <DataTable
        value={notifications}
        loading={loading}
        paginator
        rows={20}
        totalRecords={totalRecords}
        lazy
        first={(page - 1) * 20}
        onPage={(e) => setPage((e.page || 0) + 1)}
        rowsPerPageOptions={[20, 50, 100]}
        tableStyle={{ minWidth: '60rem' }}
        emptyMessage="No notifications found"
        rowClassName={rowClassName}
      >
        <Column
          field="type"
          header="Type"
          sortable
          style={{ width: '15%' }}
          body={typeBodyTemplate}
        />
        <Column
          field="severity"
          header="Severity"
          sortable
          style={{ width: '10%' }}
          body={severityBodyTemplate}
        />
        <Column field="title" header="Title" style={{ width: '25%' }} />
        <Column
          field="message"
          header="Message"
          style={{ width: '30%' }}
          body={(rowData) => (
            <div className="max-w-md truncate">{rowData.message}</div>
          )}
        />
        <Column
          field="read_at"
          header="Status"
          style={{ width: '8%' }}
          body={statusBodyTemplate}
        />
        <Column
          field="created_at"
          header="Date"
          sortable
          style={{ width: '15%' }}
          body={dateBodyTemplate}
        />
        <Column
          header="Actions"
          style={{ width: '10%' }}
          body={actionBodyTemplate}
        />
      </DataTable>

      {notifications.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <i className="pi pi-bell-slash text-6xl text-gray-400 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Notifications</h3>
          <p className="text-gray-600">You're all caught up! No notifications to display.</p>
        </div>
      )}
    </div>
  );
}
