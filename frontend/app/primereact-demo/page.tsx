'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Chip } from 'primereact/chip';
import { Tag } from 'primereact/tag';
import { useRef } from 'react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  status: string;
}

export default function PrimeReactDemo() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [date, setDate] = useState<Date | null>(null);
  const [visible, setVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const toast = useRef<Toast>(null);

  const cities = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
  ];

  const products: Product[] = [
    { id: 1, name: 'Abstract Painting', category: 'Art', price: 500, status: 'available' },
    { id: 2, name: 'Sculpture', category: 'Sculpture', price: 1200, status: 'sold' },
    { id: 3, name: 'Digital Art', category: 'Digital', price: 300, status: 'available' },
    { id: 4, name: 'Photography', category: 'Photo', price: 400, status: 'reserved' },
  ];

  const showSuccess = () => {
    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: 'PrimeReact is working perfectly!',
      life: 3000
    });
  };

  const statusBodyTemplate = (rowData: Product) => {
    const severity = rowData.status === 'available' ? 'success' : 
                     rowData.status === 'sold' ? 'danger' : 'warning';
    return <Tag value={rowData.status} severity={severity} />;
  };

  const priceBodyTemplate = (rowData: Product) => {
    return `$${rowData.price}`;
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Toast ref={toast} />
      
      <header className="max-w-6xl mx-auto mb-8">
        <Link href="/" className="text-blue-600 hover:underline mb-4 block">
          ← Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <i className="pi pi-prime text-4xl text-blue-600"></i>
          <h1 className="text-4xl font-bold">PrimeReact Demo</h1>
        </div>
        <p className="text-gray-600">Showcase of PrimeReact components and themes</p>
      </header>

      <main className="max-w-6xl mx-auto space-y-6">
        {/* Buttons Section */}
        <Card title="Buttons & Icons" className="shadow-md">
          <div className="flex flex-wrap gap-3">
            <Button label="Primary" icon="pi pi-check" onClick={showSuccess} />
            <Button label="Secondary" icon="pi pi-times" severity="secondary" />
            <Button label="Success" icon="pi pi-verified" severity="success" />
            <Button label="Info" icon="pi pi-info-circle" severity="info" />
            <Button label="Warning" icon="pi pi-exclamation-triangle" severity="warning" />
            <Button label="Danger" icon="pi pi-ban" severity="danger" />
            <Button label="Outlined" icon="pi pi-bookmark" outlined />
            <Button label="Text" icon="pi pi-user" text />
            <Button icon="pi pi-heart" rounded />
            <Button icon="pi pi-star" rounded severity="warning" />
          </div>
        </Card>

        {/* Form Controls Section */}
        <Card title="Form Controls" className="shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="search" className="font-semibold">
                <i className="pi pi-search mr-2"></i>Search
              </label>
              <InputText 
                id="search"
                value={searchValue} 
                onChange={(e) => setSearchValue(e.target.value)} 
                placeholder="Search artworks..."
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="city" className="font-semibold">
                <i className="pi pi-map-marker mr-2"></i>City
              </label>
              <Dropdown 
                id="city"
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.value)} 
                options={cities} 
                optionLabel="name"
                placeholder="Select a City" 
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="calendar" className="font-semibold">
                <i className="pi pi-calendar mr-2"></i>Date
              </label>
              <Calendar 
                id="calendar"
                value={date} 
                onChange={(e) => setDate(e.value as Date)} 
                showIcon
                placeholder="Select a date"
              />
            </div>

            <div className="flex items-end">
              <Button 
                label="Open Dialog" 
                icon="pi pi-external-link" 
                onClick={() => setVisible(true)}
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* Chips Section */}
        <Card title="Chips & Tags" className="shadow-md">
          <div className="flex flex-wrap gap-3">
            <Chip label="Art" icon="pi pi-palette" />
            <Chip label="Sculpture" icon="pi pi-box" removable />
            <Chip label="Photography" icon="pi pi-camera" removable />
            <Tag value="New" severity="success" icon="pi pi-star-fill" />
            <Tag value="Sale" severity="danger" icon="pi pi-tag" />
            <Tag value="Popular" severity="info" icon="pi pi-bolt" />
          </div>
        </Card>

        {/* DataTable Section */}
        <Card title="Data Table" className="shadow-md">
          <DataTable 
            value={products} 
            stripedRows 
            showGridlines
            paginator 
            rows={5}
            tableStyle={{ minWidth: '50rem' }}
          >
            <Column field="id" header="ID" sortable />
            <Column field="name" header="Name" sortable />
            <Column field="category" header="Category" sortable />
            <Column field="price" header="Price" body={priceBodyTemplate} sortable />
            <Column field="status" header="Status" body={statusBodyTemplate} sortable />
          </DataTable>
        </Card>

        {/* Dialog */}
        <Dialog 
          header="PrimeReact Dialog" 
          visible={visible} 
          style={{ width: '50vw' }} 
          onHide={() => setVisible(false)}
        >
          <p className="mb-4">
            <i className="pi pi-check-circle text-green-600 mr-2 text-2xl"></i>
            PrimeReact is successfully integrated!
          </p>
          <p className="text-gray-700">
            You now have access to over 90+ components including tables, forms, 
            charts, overlays, and more. The Lara Light Blue theme is applied by default.
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
            <p className="font-semibold mb-2">
              <i className="pi pi-info-circle mr-2"></i>Available Features:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Rich UI Components (Buttons, Inputs, Dropdowns, etc.)</li>
              <li>Data Tables with sorting, filtering, and pagination</li>
              <li>Form validation and controls</li>
              <li>Charts and visualizations</li>
              <li>Overlays (Dialogs, Tooltips, Menus)</li>
              <li>Multiple theme options</li>
              <li>Responsive design support</li>
            </ul>
          </div>
        </Dialog>
      </main>
    </div>
  );
}
