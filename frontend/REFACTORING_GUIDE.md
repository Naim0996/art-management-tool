# Frontend Refactoring Guide - DRY Principles Applied

## Overview
This document outlines the refactoring approach used to reduce code duplication and ensure all files are under 200 lines. Follow these patterns to refactor remaining large files.

## Key Principles

### 1. **Extract Reusable Hooks** (`/frontend/hooks/`)
Custom hooks eliminate repetitive state management and side effects.

#### Available Hooks:
- **`useToast`** (54 lines) - Toast notifications with helper methods
- **`useDataTable`** (69 lines) - Data fetching, pagination, and loading states
- **`useFormDialog`** (42 lines) - Dialog visibility and form state management  
- **`useApiCall`** (60 lines) - Generic API calls with loading/error states
- **`usePagination`** (47 lines) - Pagination state and callbacks

#### Example: Before & After

**Before (repetitive pattern):**
```typescript
const toast = useRef<Toast>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  setLoading(true);
  try {
    const result = await apiCall();
    // ...
  } catch (err) {
    setError(err.message);
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch',
      life: 3000
    });
  } finally {
    setLoading(false);
  }
};
```

**After (using hooks):**
```typescript
const { toast, showError } = useToast();
const { execute, loading, error } = useApiCall(apiCall, {
  showToast: showError,
  errorMessage: 'Failed to fetch'
});
```

### 2. **Extract UI Components** (`/frontend/components/ui/`)
Reusable UI components for common patterns.

#### Available Components:
- **`LoadingSpinner`** (21 lines) - Loading states
- **`ErrorDisplay`** (26 lines) - Error messages
- **`EmptyState`** (29 lines) - Empty data states

#### Example:
**Before:**
```typescript
{loading && (
  <div className="flex items-center justify-center p-8">
    <ProgressSpinner />
    <p className="mt-4 text-gray-600">Loading...</p>
  </div>
)}
```

**After:**
```typescript
{loading && <LoadingSpinner message="Loading..." />}
```

### 3. **Extract Admin Components** (`/frontend/components/admin/`)
Admin-specific reusable components.

#### Available Components:
- **`PageHeader`** (62 lines) - Page title, subtitle, and action buttons
- **`FormDialog`** (51 lines) - Generic form dialog wrapper
- **Form Components** - Extracted form logic (e.g., `DiscountForm`, `DiscountColumns`)

#### Example - PageHeader:
**Before:**
```typescript
<div className="mb-6 flex justify-between items-center">
  <div>
    <h1 className="text-3xl font-bold text-gray-800">Products</h1>
    <p className="text-gray-600 mt-2">Manage your products</p>
  </div>
  <Button label="New Product" icon="pi pi-plus" onClick={handleCreate} />
</div>
```

**After:**
```typescript
<PageHeader
  title="Products"
  subtitle="Manage your products"
  actions={[{
    label: 'New Product',
    icon: 'pi pi-plus',
    onClick: handleCreate
  }]}
/>
```

### 4. **Split Large Components** 
When a component exceeds 200 lines, split it into:
1. **Main page component** - Orchestration and state
2. **Form component** - Form fields and validation
3. **Columns/Table component** - DataTable column definitions
4. **Helper sub-components** - Specific UI sections

#### Example: Discounts Page Refactoring

**Before:** 432 lines in one file
**After:** Split into 4 files (all < 200 lines)
- `page.tsx` - 186 lines (main orchestration)
- `DiscountForm.tsx` - 147 lines (form fields)
- `DiscountColumns.tsx` - 104 lines (table columns)
- Using shared hooks and components

### 5. **Split Navigation Components**
Large navigation components should be split by concern:

#### Example: Header Component Refactoring
**Before:** 505 lines
**After:** 7 files (all < 200 lines)
- `headerComponent.tsx` - 47 lines (main orchestrator)
- `DesktopHeader.tsx` - 120 lines (desktop navigation)
- `MobileHeader.tsx` - 156 lines (mobile navigation)
- `NavButton.tsx` - 62 lines (reusable button)
- `DropdownMenu.tsx` - 57 lines (dropdown container)
- `DropdownItem.tsx` - 29 lines (dropdown item)
- `HeaderLogo.tsx` - 37 lines (logo component)

## Refactoring Workflow

### Step 1: Analyze the File
Identify repetitive patterns:
- [ ] Toast notifications → use `useToast`
- [ ] Data fetching with pagination → use `useDataTable`  
- [ ] Form dialogs → use `useFormDialog` + `FormDialog`
- [ ] Loading states → use `LoadingSpinner`
- [ ] Error display → use `ErrorDisplay`

### Step 2: Extract Form Logic
If the file contains forms:
1. Create `ComponentForm.tsx` for form fields
2. Use `FormDialog` wrapper
3. Pass `formData` and `onChange` as props

### Step 3: Extract Table Logic
If the file contains DataTable:
1. Create `ComponentColumns.tsx` for column definitions
2. Export column factory function
3. Pass callbacks (onEdit, onDelete) as parameters

### Step 4: Apply Hooks
Replace repetitive patterns with custom hooks:
```typescript
// Before
const [loading, setLoading] = useState(true);
const [page, setPage] = useState(1);
const [totalRecords, setTotalRecords] = useState(0);

// After
const { loading, page, totalRecords, onPageChange } = usePagination();
```

### Step 5: Verify
- [ ] All files ≤ 200 lines
- [ ] Build succeeds
- [ ] Lint passes
- [ ] No code duplication

## Files Remaining to Refactor

### Priority 1 (> 500 lines):
1. `app/[locale]/admin/shop-products/page.tsx` (759 lines)
2. `app/[locale]/admin/personaggi/page.tsx` (669 lines)
3. `app/[locale]/admin/personaggi/page-new.tsx` (656 lines)
4. `app/[locale]/cart/page.tsx` (584 lines)
5. `app/[locale]/admin/fumetti/page.tsx` (529 lines)
6. `services/AdminShopAPIService.ts` (499 lines)

### Priority 2 (300-500 lines):
7. `app/[locale]/admin/shop-orders/page.tsx` (457 lines)
8. `app/[locale]/admin/etsy-sync/page.tsx` (451 lines)
9. `services/ShopAPIService.ts` (423 lines)
10. `components/ImageUpload.tsx` (404 lines)
11. `services/validation.ts` (384 lines)
12. `components/ProductImageUpload.tsx` (380 lines)
13. `app/[locale]/admin/page.tsx` (368 lines)
14. `app/[locale]/admin/products/page.tsx` (336 lines)
15. `app/[locale]/shop/page.tsx` (333 lines)

### Priority 3 (200-300 lines):
16-21. Additional files between 201-333 lines

## Common Patterns to Extract

### Pattern 1: CRUD Operations
```typescript
// Extract to hooks/useCRUD.ts
export function useCRUD<T>(
  fetchFn: () => Promise<T[]>,
  createFn: (item: Partial<T>) => Promise<T>,
  updateFn: (id: number, item: Partial<T>) => Promise<T>,
  deleteFn: (id: number) => Promise<void>
) {
  // Implementation with useToast and useDataTable
}
```

### Pattern 2: Image Upload
```typescript
// Extract image upload logic to hooks/useImageUpload.ts
export function useImageUpload(onSuccess?: (url: string) => void) {
  // Reusable image upload state and handlers
}
```

### Pattern 3: Confirmation Dialogs
```typescript
// Extract to hooks/useConfirmDialog.ts
export function useConfirmDialog() {
  const confirm = (options: ConfirmOptions) => {
    confirmDialog({
      ...options,
      // Common defaults
    });
  };
  return { confirm };
}
```

## Success Metrics
✅ All files ≤ 200 lines  
✅ DRY principle applied (no duplicate code)
✅ Build passes with no errors
✅ Lint passes with no errors
✅ Code is more maintainable and readable

## Next Steps
1. Apply patterns to remaining large files
2. Create additional reusable components as needed
3. Run comprehensive tests
4. Request code review
5. Run security scan

---
**Note:** This refactoring maintains functionality while improving code organization, reusability, and maintainability.
