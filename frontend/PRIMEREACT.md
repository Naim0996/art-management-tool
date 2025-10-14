# PrimeReact Integration Guide

This project uses **PrimeReact** (v10.9.7) and **PrimeIcons** (v7.0.0) for rich UI components and icons.

## Getting Started

### View the Demo
Visit `/primereact-demo` to see examples of available components and how to use them.

## Available Components

PrimeReact provides 90+ components including:

### Form Components
- **InputText** - Text input fields
- **Dropdown** - Select dropdowns
- **Calendar** - Date picker
- **InputNumber** - Numeric input
- **Checkbox** - Checkboxes
- **RadioButton** - Radio buttons
- **InputTextarea** - Multi-line text input
- **MultiSelect** - Multiple selection dropdown
- And many more...

### Data Components
- **DataTable** - Advanced data tables with sorting, filtering, pagination
- **DataView** - List/grid view for data
- **Tree** - Tree structure display
- **TreeTable** - Tree + table combined

### Button Components
- **Button** - Styled buttons with various severities
- **SplitButton** - Button with dropdown menu
- **SpeedDial** - Floating action buttons

### Overlay Components
- **Dialog** - Modal dialogs
- **ConfirmDialog** - Confirmation dialogs
- **Toast** - Toast notifications
- **Tooltip** - Tooltips
- **Menu** - Context menus

### Display Components
- **Card** - Content cards
- **Panel** - Collapsible panels
- **Chip** - Compact elements
- **Tag** - Labels and tags
- **Badge** - Notification badges

## Usage Examples

### Button
```tsx
import { Button } from 'primereact/button';

<Button label="Click Me" icon="pi pi-check" onClick={handleClick} />
<Button label="Delete" severity="danger" icon="pi pi-trash" />
<Button label="Secondary" severity="secondary" outlined />
```

### Input with Icon
```tsx
import { InputText } from 'primereact/inputtext';

<div className="flex flex-col gap-2">
  <label htmlFor="search">
    <i className="pi pi-search mr-2"></i>Search
  </label>
  <InputText 
    id="search"
    value={searchValue} 
    onChange={(e) => setSearchValue(e.target.value)} 
    placeholder="Search..."
  />
</div>
```

### Dropdown
```tsx
import { Dropdown } from 'primereact/dropdown';

const cities = [
  { name: 'New York', code: 'NY' },
  { name: 'Rome', code: 'RM' },
  { name: 'London', code: 'LDN' }
];

<Dropdown 
  value={selectedCity} 
  onChange={(e) => setSelectedCity(e.value)} 
  options={cities} 
  optionLabel="name"
  placeholder="Select a City" 
/>
```

### DataTable
```tsx
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

<DataTable value={products} stripedRows paginator rows={10}>
  <Column field="id" header="ID" sortable />
  <Column field="name" header="Name" sortable />
  <Column field="price" header="Price" sortable />
</DataTable>
```

### Dialog
```tsx
import { Dialog } from 'primereact/dialog';

const [visible, setVisible] = useState(false);

<Button label="Show" onClick={() => setVisible(true)} />
<Dialog 
  header="Dialog Title" 
  visible={visible} 
  onHide={() => setVisible(false)}
  style={{ width: '50vw' }}
>
  <p>Dialog content goes here</p>
</Dialog>
```

### Toast Notifications
```tsx
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

const toast = useRef<Toast>(null);

const showSuccess = () => {
  toast.current?.show({
    severity: 'success',
    summary: 'Success',
    detail: 'Operation completed successfully',
    life: 3000
  });
};

<Toast ref={toast} />
<Button label="Show Success" onClick={showSuccess} />
```

### Chips and Tags
```tsx
import { Chip } from 'primereact/chip';
import { Tag } from 'primereact/tag';

<Chip label="Art" icon="pi pi-palette" />
<Tag value="New" severity="success" />
<Tag value="Sale" severity="danger" icon="pi pi-tag" />
```

## PrimeIcons

PrimeIcons provides 250+ icons. Use them with the `pi` prefix:

```tsx
<i className="pi pi-check"></i>
<i className="pi pi-times"></i>
<i className="pi pi-search"></i>
<i className="pi pi-user"></i>
<i className="pi pi-calendar"></i>
<i className="pi pi-heart"></i>
```

Browse all icons at: https://primereact.org/icons

## Button Severities

Available button severities (colors):
- `primary` (default) - Blue
- `secondary` - Gray
- `success` - Green
- `info` - Cyan
- `warning` - Orange
- `danger` - Red
- `help` - Purple
- `contrast` - Black/White

Button variations:
- Default (filled)
- `outlined` - Outlined style
- `text` - Text only
- `raised` - With shadow
- `rounded` - Circular buttons

## Themes

Currently using the **Lara Light Blue** theme. To change themes, edit `frontend/app/globals.css`:

```css
/* Change this line to use a different theme */
@import "primereact/resources/themes/lara-light-blue/theme.css";
```

Available themes:
- `lara-light-blue` (current)
- `lara-light-indigo`
- `lara-light-purple`
- `lara-dark-blue`
- `lara-dark-indigo`
- `bootstrap4-light-blue`
- `bootstrap4-dark-blue`
- `md-light-indigo`
- `md-dark-indigo`
- And many more...

## Documentation

Full documentation available at: https://primereact.org/

## Compatibility

- Works seamlessly with Next.js 15
- Compatible with React 19
- TypeScript support included
- Works alongside Tailwind CSS

## Tips

1. **Client Components**: Most PrimeReact components require `'use client'` directive
2. **CSS Order**: PrimeReact CSS is imported before Tailwind to allow Tailwind overrides
3. **Responsive**: Components are responsive by default
4. **Accessibility**: Components follow WCAG accessibility guidelines
5. **Customization**: Can be styled with CSS or Tailwind utility classes
