# Etsy Integration UI Mockup

## Page Structure

The Etsy Sync page (`/admin/etsy-sync`) consists of the following sections:

### 1. Header Section
```
┌─────────────────────────────────────────────────────────────────┐
│  🎨 Etsy Integration                          [View Configuration]│
│  Manage product and inventory synchronization with Etsy          │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Status Dashboard (4 Metric Cards)
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 📦 Total     │ ✅ Synced    │ ⏰ Pending   │ ❌ Failed    │
│ Products     │ Products     │ Products     │ Products     │
│   150        │    142       │     5        │     3        │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### 3. Manual Synchronization Controls
```
┌─────────────────────────────────────────────────────────────────┐
│ Manual Synchronization                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [🔄 Sync Products]              [▼ Bidirectional] [🔄 Sync     │
│                                                    Inventory]    │
│  Last sync: 2025-10-22 14:30    Last sync: 2025-10-22 15:15    │
│                                                                   │
│  ℹ️ API Rate Limit: 8,547 requests remaining                    │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Etsy Products Table
```
┌─────────────────────────────────────────────────────────────────┐
│ Etsy Products                                [Filter: All ▼]     │
├──────────┬───────────────┬──────┬────────┬─────┬────────┬───────┤
│ Listing  │ Title         │ SKU  │ Price  │ Qty │ Status │ Last  │
│    ID    │               │      │        │     │        │ Synced│
├──────────┼───────────────┼──────┼────────┼─────┼────────┼───────┤
│ 12345678 │ Abstract Art  │ ART1 │ $45.00 │ 12  │ ✅ Syn │ 2h ago│
│ 12345679 │ Modern Canvas │ ART2 │ $65.00 │  8  │ ✅ Syn │ 2h ago│
│ 12345680 │ Digital Print │ ART3 │ $25.00 │  0  │ ⚠️ Pen │ 3d ago│
│ 12345681 │ Oil Painting  │ ART4 │ $120.0 │ 15  │ ✅ Syn │ 1h ago│
│ 12345682 │ Watercolor    │ ART5 │ $35.00 │  5  │ ❌ Fai │ 5d ago│
├──────────┴───────────────┴──────┴────────┴─────┴────────┴───────┤
│              [◄] Page 1 of 15 [►]                                │
└─────────────────────────────────────────────────────────────────┘
```

### 5. Synchronization Logs Table
```
┌─────────────────────────────────────────────────────────────────┐
│ Synchronization Logs                     [Filter: All ▼]        │
├──────────┬───────┬──────────┬───────────┬────────┬──────┬───────┤
│ Listing  │ Type  │ Direction│ Quantity  │ Status │ Error│ Time  │
│    ID    │       │          │  Change   │        │      │       │
├──────────┼───────┼──────────┼───────────┼────────┼──────┼───────┤
│ 12345678 │ Inv   │ Bidir    │ 12 → 15(+3│ ✅ Succ│  -   │ 2h ago│
│ 12345679 │ Inv   │ Pull     │ 10 → 8(-2)│ ✅ Succ│  -   │ 2h ago│
│ 12345680 │ Inv   │ Push     │ 5 → 0(-5) │ ❌ Fail│ Rate │ 3d ago│
│          │       │          │           │        │ limit│       │
│ 12345681 │ Prod  │ Pull     │     -     │ ✅ Succ│  -   │ 1h ago│
│ 12345682 │ Inv   │ Bidir    │ 10 → 5(-5)│ ❌ Fail│ Netw │ 5d ago│
│          │       │          │           │        │ error│       │
├──────────┴───────┴──────────┴───────────┴────────┴──────┴───────┤
│              [◄] Page 1 of 8 [►]                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Color Coding

### Status Tags
- **Synced** (✅): Green background, indicates successful sync
- **Pending** (⏰): Orange/yellow background, awaiting sync
- **Failed** (❌): Red background, sync error occurred
- **Unlinked** (🔗): Blue background, not linked to local product

### Quantity Changes
- **Positive** (+3, +5): Green text, inventory increased
- **Negative** (-2, -5): Red text, inventory decreased
- **No change** (0): Gray text, no inventory change

## Interactive Elements

### Buttons
1. **View Configuration**: Opens modal with Etsy settings
2. **Sync Products**: Triggers product synchronization
3. **Sync Inventory**: Triggers inventory synchronization with selected direction

### Dropdowns
1. **Sync Direction**: Bidirectional / Push to Etsy / Pull from Etsy
2. **Product Status Filter**: All / Synced / Pending / Failed / Unlinked
3. **Log Status Filter**: All / Success / Failed

### Tables
- Sortable columns (clickable headers)
- Pagination controls (previous/next)
- Loading indicators during data fetch

## Configuration Dialog

```
┌─────────────────────────────────────────────────────┐
│ Etsy Configuration                            [X]   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Integration Enabled:        ✅ Yes                 │
│  API Key Configured:         ✅ Yes                 │
│  Shop ID:                    shop_abc123           │
│  Rate Limit:                 10,000 requests/day   │
│                                                      │
│                              [Close]                │
└─────────────────────────────────────────────────────┘
```

## Toast Notifications

### Success
```
┌─────────────────────────────────────────────┐
│ ✅ Product sync initiated                   │
│ Synchronization has started in the          │
│ background. Check back shortly for results. │
└─────────────────────────────────────────────┘
```

### Error
```
┌─────────────────────────────────────────────┐
│ ❌ Synchronization failed                   │
│ Rate limit exceeded. Please try again in    │
│ 2 hours.                                    │
└─────────────────────────────────────────────┘
```

## Responsive Design

### Desktop (≥1024px)
- 4 columns for metric cards
- Full-width tables with all columns visible
- Side-by-side sync controls

### Tablet (768px - 1023px)
- 2 columns for metric cards
- Tables with horizontal scroll
- Stacked sync controls

### Mobile (<768px)
- 1 column for metric cards
- Tables with horizontal scroll
- Stacked sync controls
- Collapsible sidebar

## Loading States

### Initial Load
```
┌─────────────────────────────────────────────┐
│                                             │
│         ⏳ Loading...                       │
│                                             │
└─────────────────────────────────────────────┘
```

### Button Loading
```
[⏳ Syncing...] ← Button disabled with spinner
```

### Table Loading
```
┌─────────────────────────────────────────────┐
│                                             │
│         ⏳ Loading products...              │
│                                             │
└─────────────────────────────────────────────┘
```

## Navigation

### Sidebar Menu
```
┌─────────────────────┐
│ Admin Panel         │
├─────────────────────┤
│ 🏠 Dashboard        │
│ 👥 Personaggi       │
│ 🛍️ Products         │
│ 📦 Orders           │
│ 🔄 Etsy Sync   ←    │ (New item)
│ ⚙️ Settings         │
└─────────────────────┘
```

### Dashboard Quick Action
```
┌─────────────────────────────────────────────┐
│ Quick Actions                               │
├─────────────────────────────────────────────┤
│ ...other actions...                         │
│                                             │
│ [🔄 Etsy Sync         →]  ← New button     │
│                                             │
└─────────────────────────────────────────────┘
```

## User Flow

### Typical Workflow

1. **Access Page**: Click "Etsy Sync" in sidebar or dashboard
2. **Review Status**: Check dashboard cards for current sync status
3. **Trigger Sync**: 
   - Click "Sync Products" for catalog update
   - Select direction and click "Sync Inventory" for stock update
4. **Monitor Progress**: Toast notification confirms sync started
5. **Review Results**: 
   - Check updated metrics in dashboard cards
   - Review products table for individual product status
   - Check sync logs for detailed operation history
6. **Handle Errors**: Review error messages in sync logs, take corrective action

### Configuration Check

1. Click "View Configuration" button
2. Verify integration is enabled
3. Confirm API key is configured
4. Note rate limit settings
5. Close dialog

## Accessibility

- Semantic HTML structure
- ARIA labels on all interactive elements
- Keyboard navigation support
- Color contrast meets WCAG AA standards
- Screen reader friendly
- Focus indicators on all controls

## Performance Features

- Lazy loading for tables
- Server-side pagination
- Debounced filter inputs
- Optimistic UI updates
- Background sync operations
- Token caching in localStorage

---

This mockup represents the complete UI implementation for the Etsy integration admin page.
