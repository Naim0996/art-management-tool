# Etsy Frontend Integration Documentation

## Overview

This document describes the frontend implementation for Etsy product and inventory synchronization management in the Art Management Tool admin panel.

## Implementation Summary

### Files Added

1. **`frontend/services/EtsyAPIService.ts`** (~270 lines)
   - Complete TypeScript API client for Etsy integration endpoints
   - Type-safe interfaces for all API requests and responses
   - Authentication handling with JWT tokens
   - Error handling and response parsing

2. **`frontend/app/[locale]/admin/etsy-sync/page.tsx`** (~550 lines)
   - Full-featured admin page for Etsy synchronization
   - Real-time sync status dashboard
   - Manual sync triggers
   - Product listing with filtering
   - Sync logs viewer
   - Configuration display

3. **Internationalization Updates**
   - `frontend/messages/en.json` - English translations
   - `frontend/messages/it.json` - Italian translations
   - Complete i18n support for all UI elements

4. **Navigation Updates**
   - Updated `AdminSidebar.tsx` to include Etsy Sync menu item
   - Updated admin dashboard `page.tsx` to include quick action button

## Features Implemented

### 1. Sync Status Dashboard

The dashboard displays real-time statistics:
- **Total Products**: Number of products synced from Etsy
- **Synced Products**: Successfully synchronized products
- **Pending Products**: Products awaiting synchronization
- **Failed Products**: Products with synchronization errors
- **Rate Limit Status**: Current API rate limit remaining

### 2. Manual Synchronization Controls

#### Product Sync
- Single button to trigger full product catalog synchronization
- Displays last sync timestamp
- Shows loading state during sync operation
- Disabled when sync is already in progress

#### Inventory Sync
- Dropdown to select sync direction:
  - **Bidirectional**: Sync both ways (default)
  - **Push to Etsy**: Local → Etsy only
  - **Pull from Etsy**: Etsy → Local only
- Button to trigger inventory synchronization
- Displays last sync timestamp
- Shows loading state during sync operation

### 3. Products Table

Features:
- Paginated table of all Etsy products
- Columns: Listing ID, Title, SKU, Price, Quantity, Status, Last Synced
- Filter by sync status (All, Synced, Pending, Failed, Unlinked)
- Color-coded status tags:
  - Green: Synced
  - Orange: Pending
  - Red: Failed
  - Blue: Unlinked
- Lazy loading with server-side pagination

### 4. Sync Logs Table

Features:
- Detailed history of all synchronization operations
- Columns: Listing ID, Type, Direction, Quantity Change, Status, Error, Synced At
- Filter by status (All, Success, Failed)
- Visual quantity change indicator with color coding:
  - Green: Quantity increased
  - Red: Quantity decreased
  - Gray: No change
- Paginated display with server-side loading

### 5. Configuration Viewer

Modal dialog displaying:
- Integration enabled status
- API key configuration status
- Shop ID
- Rate limit settings
- Requests per day limit

### 6. Toast Notifications

Real-time feedback for:
- Sync operation started
- Sync operation completed
- Error messages with details
- Configuration load errors

## API Integration

### Endpoints Used

The frontend integrates with the following backend endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/etsy/sync/products` | Trigger product sync |
| POST | `/api/admin/etsy/sync/inventory` | Trigger inventory sync |
| GET | `/api/admin/etsy/sync/status` | Get sync status |
| GET | `/api/admin/etsy/sync/logs` | Get sync logs |
| GET | `/api/admin/etsy/products` | List Etsy products |
| GET | `/api/admin/etsy/products/:id` | Get product details |
| POST | `/api/admin/etsy/products/:id/link` | Link product |
| DELETE | `/api/admin/etsy/products/:id/link` | Unlink product |
| GET | `/api/admin/etsy/config` | Get configuration |
| POST | `/api/admin/etsy/validate` | Validate credentials |

### Type Safety

All API requests and responses are fully typed with TypeScript interfaces:

```typescript
export interface SyncStatus {
  enabled: boolean;
  last_product_sync?: string;
  last_inventory_sync?: string;
  product_sync_in_progress: boolean;
  inventory_sync_in_progress: boolean;
  total_products: number;
  synced_products: number;
  failed_products: number;
  pending_products: number;
  rate_limit_remaining?: number;
  rate_limit_reset?: string;
}
```

## User Interface Components

### Technology Stack

- **Next.js 15**: App router with server-side rendering
- **PrimeReact**: UI component library
  - Card
  - DataTable
  - Button
  - Dropdown
  - Dialog
  - Toast
  - Tag
  - Column
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **next-intl**: Internationalization

### Design Principles

1. **Responsive**: Mobile-friendly grid layouts
2. **Accessible**: Semantic HTML and ARIA labels
3. **Consistent**: Follows existing admin panel design
4. **Intuitive**: Clear labels and visual feedback
5. **Fast**: Lazy loading and pagination
6. **Informative**: Real-time status updates

## Internationalization

### Supported Languages

- **English (en)**: Complete translations
- **Italian (it)**: Complete translations

### Translation Keys

```json
{
  "etsy": {
    "title": "Etsy Integration",
    "subtitle": "Manage product and inventory synchronization with Etsy",
    "status": { /* status labels */ },
    "sync": { /* sync controls */ },
    "products": { /* product table */ },
    "logs": { /* logs table */ },
    "filters": { /* filter options */ },
    "config": { /* configuration */ },
    "errors": { /* error messages */ }
  }
}
```

## Usage Guide

### Accessing the Page

1. Log in to admin panel at `/[locale]/admin/login`
2. Navigate to **Etsy Sync** from:
   - Sidebar menu item
   - Dashboard quick action button
3. URL: `/[locale]/admin/etsy-sync`

### Performing a Product Sync

1. Click "Sync Products" button
2. Wait for confirmation toast
3. Monitor sync status in dashboard cards
4. Review products table for results

### Performing an Inventory Sync

1. Select sync direction from dropdown:
   - Bidirectional (recommended)
   - Push to Etsy
   - Pull from Etsy
2. Click "Sync Inventory" button
3. Wait for confirmation toast
4. Review sync logs for detailed results

### Filtering Products

1. Use "Filter by status" dropdown above products table
2. Select status: All, Synced, Pending, Failed, or Unlinked
3. Table updates automatically

### Viewing Sync History

1. Scroll to "Synchronization Logs" section
2. Use status filter to view success/failed syncs
3. Review quantity changes and error messages
4. Navigate pages using pagination controls

### Checking Configuration

1. Click "View Configuration" button in header
2. Dialog displays current Etsy settings
3. Verify API key status and shop ID
4. Check rate limit settings

## Error Handling

### User-Facing Errors

All errors display as toast notifications with:
- **Severity**: Error (red)
- **Summary**: Brief error description
- **Detail**: Specific error message from API
- **Duration**: 5 seconds

### Error Scenarios

1. **Sync Failed**: API error or network issue
2. **Load Failed**: Unable to fetch data
3. **Config Load Failed**: Configuration not available
4. **Not Configured**: Etsy integration not enabled (HTTP 501)

## Performance Considerations

### Optimization Features

1. **Lazy Loading**: Tables load data only when needed
2. **Pagination**: Server-side pagination reduces data transfer
3. **Async Operations**: Sync operations run in background
4. **Debouncing**: Filter changes debounced to reduce API calls
5. **Caching**: Reuses authentication token from localStorage

### Loading States

- Spinner overlay during initial data load
- Button loading state during sync operations
- Table loading indicator during pagination
- Skeleton screens for better perceived performance

## Security

### Authentication

- JWT token required for all API requests
- Token stored in localStorage
- Automatic token injection in request headers
- Redirect to login if token invalid

### Authorization

- Admin-only access (protected route)
- Backend validates token on every request
- Rate limiting enforced by backend

## Testing Recommendations

### Manual Testing Checklist

- [ ] Page loads without errors
- [ ] Dashboard cards display correct data
- [ ] Product sync button triggers sync
- [ ] Inventory sync button triggers sync with selected direction
- [ ] Products table displays and paginates correctly
- [ ] Product filters work as expected
- [ ] Sync logs table displays and paginates correctly
- [ ] Log filters work as expected
- [ ] Configuration dialog displays correctly
- [ ] Toast notifications appear for all actions
- [ ] Error states handled gracefully
- [ ] Loading states display correctly
- [ ] Internationalization works for both languages
- [ ] Navigation works from sidebar and dashboard
- [ ] Mobile responsive design works

### Integration Testing

1. **Backend Connection**: Verify all API endpoints respond correctly
2. **Authentication**: Test with valid/invalid tokens
3. **Data Flow**: Verify data matches backend responses
4. **Error Cases**: Test network failures, 404s, 500s
5. **Edge Cases**: Empty states, large datasets, rapid clicks

## Future Enhancements

### Potential Improvements

1. **Real-time Updates**: WebSocket connection for live sync status
2. **Batch Operations**: Select multiple products for bulk actions
3. **Advanced Filters**: Date ranges, SKU search, price ranges
4. **Export Functionality**: Download sync logs as CSV
5. **Sync Scheduling**: Configure automatic sync intervals
6. **Product Linking UI**: Visual interface to link Etsy/local products
7. **Sync Preview**: Show what will change before syncing
8. **Conflict Resolution**: UI for handling sync conflicts
9. **Dashboard Graphs**: Visual charts of sync history
10. **Email Notifications**: Alert admins of sync failures

## Maintenance Notes

### Code Organization

- Services in `/services` directory
- Pages in `/app/[locale]/admin` directory
- Components follow PrimeReact patterns
- i18n files in `/messages` directory

### Updating Translations

Add new keys to both `en.json` and `it.json`:

```json
{
  "etsy": {
    "newFeature": {
      "en": "New Feature",
      "it": "Nuova Funzionalità"
    }
  }
}
```

### Adding New API Endpoints

1. Add types to `EtsyAPIService.ts`
2. Add method to `EtsyAPIService` class
3. Use in page component with error handling
4. Update documentation

## Support

### Common Issues

**Q: Sync button is disabled**
A: Check if sync is already in progress or if Etsy integration is disabled

**Q: "Etsy integration not configured" error**
A: Backend needs Etsy API credentials in environment variables

**Q: Empty tables**
A: No products synced yet - trigger product sync first

**Q: Rate limit error**
A: Wait for rate limit reset time shown in status

### Debugging

Enable console logging in browser DevTools:
- Check Network tab for API requests/responses
- Review Console for JavaScript errors
- Verify localStorage contains `adminToken`

## Conclusion

The Etsy frontend integration provides a complete, user-friendly interface for managing product and inventory synchronization. It follows Next.js and React best practices, includes full TypeScript support, and offers comprehensive internationalization.

The implementation is production-ready and can be deployed immediately once backend Etsy credentials are configured.

---

**Implementation Date**: October 22, 2025  
**Status**: ✅ Complete  
**Framework**: Next.js 15 with PrimeReact  
**Languages**: TypeScript, English, Italian
