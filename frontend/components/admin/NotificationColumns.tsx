import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Notification } from '@/services/AdminShopAPIService';

export function getNotificationColumns(
  onMarkAsRead: (id: number) => void,
  onDelete: (notification: Notification) => void
) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const typeBodyTemplate = (rowData: Notification) => {
    const label = rowData.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
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
            onClick={() => onMarkAsRead(rowData.id)}
            tooltip="Mark as Read"
          />
        )}
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => onDelete(rowData)}
          tooltip="Delete"
        />
      </div>
    );
  };

  return [
    <Column key="type" header="Type" body={typeBodyTemplate} sortable />,
    <Column key="message" field="message" header="Message" />,
    <Column key="severity" header="Severity" body={severityBodyTemplate} sortable />,
    <Column key="status" header="Status" body={statusBodyTemplate} />,
    <Column key="date" header="Date" body={dateBodyTemplate} sortable />,
    <Column key="actions" header="Actions" body={actionBodyTemplate} style={{ width: '150px' }} />,
  ];
}

export function getRowClassName(rowData: Notification) {
  return rowData.read_at ? '' : 'bg-blue-50';
}
