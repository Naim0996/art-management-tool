import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { CategoryDTO } from '@/services/CategoryAPIService';

export function getCategoryColumns(
  onEdit: (category: CategoryDTO) => void,
  onDelete: (category: CategoryDTO) => void
) {
  const actionsBodyTemplate = (rowData: CategoryDTO) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-info"
          onClick={() => onEdit(rowData)}
          tooltip="Edit"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          onClick={() => onDelete(rowData)}
          tooltip="Delete"
        />
      </div>
    );
  };

  const parentBodyTemplate = (rowData: CategoryDTO) => {
    return rowData.parent ? rowData.parent.name : <span className="text-gray-400">—</span>;
  };

  const childrenBodyTemplate = (rowData: CategoryDTO) => {
    return rowData.children && rowData.children.length > 0 ? (
      <span className="text-sm">{rowData.children.length} child(ren)</span>
    ) : (
      <span className="text-gray-400">—</span>
    );
  };

  return [
    <Column key="name" field="name" header="Name" sortable />,
    <Column key="slug" field="slug" header="Slug" sortable />,
    <Column key="description" field="description" header="Description" />,
    <Column key="parent" header="Parent" body={parentBodyTemplate} />,
    <Column key="children" header="Children" body={childrenBodyTemplate} />,
    <Column key="actions" header="Actions" body={actionsBodyTemplate} style={{ width: '120px' }} />,
  ];
}
