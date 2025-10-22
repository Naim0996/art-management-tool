'use client';

import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import etsyAPI, { 
  SyncStatus, 
  EtsyProduct, 
  InventorySyncLog 
} from '@/services/EtsyAPIService';

export default function EtsySyncPage() {
  const t = useTranslations('etsy');
  const toast = useRef<Toast>(null);
  
  // State
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [products, setProducts] = useState<EtsyProduct[]>([]);
  const [syncLogs, setSyncLogs] = useState<InventorySyncLog[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);
  const [page, setPage] = useState(1);
  const [logsPage, setLogsPage] = useState(1);
  const [perPage] = useState(10);
  
  // Sync operation state
  const [productSyncLoading, setProductSyncLoading] = useState(false);
  const [inventorySyncLoading, setInventorySyncLoading] = useState(false);
  const [syncDirection, setSyncDirection] = useState<'push' | 'pull' | 'bidirectional'>('bidirectional');
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [logStatusFilter, setLogStatusFilter] = useState<string>('all');
  
  // Dialog state
  const [configDialogVisible, setConfigDialogVisible] = useState(false);
  const [etsyConfig, setEtsyConfig] = useState<{
    enabled: boolean;
    api_key_configured: boolean;
    shop_id?: string;
    rate_limit_enabled: boolean;
    max_requests_per_day: number;
  } | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, logsPage, statusFilter, logStatusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSyncStatus(),
        loadProducts(),
        loadSyncLogs(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('error', t('errors.loadFailed'), error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const loadSyncStatus = async () => {
    try {
      const status = await etsyAPI.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await etsyAPI.listEtsyProducts({
        sync_status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        per_page: perPage,
      });
      setProducts(response.products || []);
      setTotalProducts(response.total || 0);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadSyncLogs = async () => {
    try {
      const response = await etsyAPI.getInventorySyncLogs({
        status: logStatusFilter !== 'all' ? logStatusFilter : undefined,
        page: logsPage,
        per_page: perPage,
      });
      setSyncLogs(response.logs || []);
      setTotalLogs(response.total || 0);
    } catch (error) {
      console.error('Error loading sync logs:', error);
    }
  };

  const loadConfig = async () => {
    try {
      const config = await etsyAPI.getEtsyConfig();
      setEtsyConfig(config);
      setConfigDialogVisible(true);
    } catch (error) {
      console.error('Error loading config:', error);
      showToast('error', t('errors.configLoadFailed'), error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleProductSync = async () => {
    setProductSyncLoading(true);
    try {
      const result = await etsyAPI.triggerProductSync();
      showToast('success', t('sync.productSyncStarted'), result.message);
      
      // Refresh status after a delay
      setTimeout(() => {
        loadSyncStatus();
      }, 2000);
    } catch (error) {
      showToast('error', t('errors.syncFailed'), error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setProductSyncLoading(false);
    }
  };

  const handleInventorySync = async () => {
    setInventorySyncLoading(true);
    try {
      const result = await etsyAPI.triggerInventorySync({ direction: syncDirection });
      showToast('success', t('sync.inventorySyncStarted'), result.message);
      
      // Refresh status and logs after a delay
      setTimeout(() => {
        loadSyncStatus();
        loadSyncLogs();
      }, 2000);
    } catch (error) {
      showToast('error', t('errors.syncFailed'), error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setInventorySyncLoading(false);
    }
  };

  const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 5000 });
  };

  // Template functions
  const syncStatusTemplate = (rowData: EtsyProduct) => {
    const severity = {
      synced: 'success',
      pending: 'warning',
      failed: 'danger',
      unlinked: 'info',
    }[rowData.sync_status] as 'success' | 'warning' | 'danger' | 'info';
    
    return <Tag value={rowData.sync_status} severity={severity} />;
  };

  const logStatusTemplate = (rowData: InventorySyncLog) => {
    const severity = rowData.status === 'success' ? 'success' : 'danger';
    return <Tag value={rowData.status} severity={severity} />;
  };

  const dateTemplate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  };

  const quantityChangeTemplate = (rowData: InventorySyncLog) => {
    if (rowData.old_quantity === undefined || rowData.new_quantity === undefined) return '-';
    const change = rowData.new_quantity - rowData.old_quantity;
    const color = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';
    return (
      <span className={color}>
        {rowData.old_quantity} → {rowData.new_quantity} ({change > 0 ? '+' : ''}{change})
      </span>
    );
  };

  const statusFilterOptions = [
    { label: t('filters.all'), value: 'all' },
    { label: t('filters.synced'), value: 'synced' },
    { label: t('filters.pending'), value: 'pending' },
    { label: t('filters.failed'), value: 'failed' },
    { label: t('filters.unlinked'), value: 'unlinked' },
  ];

  const logStatusFilterOptions = [
    { label: t('filters.all'), value: 'all' },
    { label: t('filters.success'), value: 'success' },
    { label: t('filters.failed'), value: 'failed' },
  ];

  const syncDirectionOptions = [
    { label: t('sync.bidirectional'), value: 'bidirectional' },
    { label: t('sync.pushToEtsy'), value: 'push' },
    { label: t('sync.pullFromEtsy'), value: 'pull' },
  ];

  if (loading && !syncStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-4xl text-purple-600 mb-4"></i>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Toast ref={toast} />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <Button
          label={t('config.viewConfig')}
          icon="pi pi-cog"
          onClick={loadConfig}
          className="p-button-outlined"
        />
      </div>

      {/* Sync Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('status.totalProducts')}</p>
              <h3 className="text-2xl font-bold text-blue-600">{syncStatus?.total_products || 0}</h3>
            </div>
            <i className="pi pi-shopping-bag text-3xl text-blue-600"></i>
          </div>
        </Card>

        <Card className="shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('status.syncedProducts')}</p>
              <h3 className="text-2xl font-bold text-green-600">{syncStatus?.synced_products || 0}</h3>
            </div>
            <i className="pi pi-check-circle text-3xl text-green-600"></i>
          </div>
        </Card>

        <Card className="shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('status.pendingProducts')}</p>
              <h3 className="text-2xl font-bold text-orange-600">{syncStatus?.pending_products || 0}</h3>
            </div>
            <i className="pi pi-clock text-3xl text-orange-600"></i>
          </div>
        </Card>

        <Card className="shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('status.failedProducts')}</p>
              <h3 className="text-2xl font-bold text-red-600">{syncStatus?.failed_products || 0}</h3>
            </div>
            <i className="pi pi-times-circle text-3xl text-red-600"></i>
          </div>
        </Card>
      </div>

      {/* Sync Actions */}
      <Card title={t('sync.manualSync')} className="shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Button
              label={t('sync.syncProducts')}
              icon="pi pi-refresh"
              onClick={handleProductSync}
              loading={productSyncLoading}
              disabled={syncStatus?.product_sync_in_progress}
              className="w-full p-button-success"
            />
            {syncStatus?.last_product_sync && (
              <p className="text-sm text-gray-600 mt-2">
                {t('sync.lastSync')}: {dateTemplate(syncStatus.last_product_sync)}
              </p>
            )}
          </div>

          <div className="flex-1">
            <div className="flex gap-2">
              <Dropdown
                value={syncDirection}
                options={syncDirectionOptions}
                onChange={(e) => setSyncDirection(e.value)}
                className="flex-1"
              />
              <Button
                label={t('sync.syncInventory')}
                icon="pi pi-sync"
                onClick={handleInventorySync}
                loading={inventorySyncLoading}
                disabled={syncStatus?.inventory_sync_in_progress}
                className="p-button-info"
              />
            </div>
            {syncStatus?.last_inventory_sync && (
              <p className="text-sm text-gray-600 mt-2">
                {t('sync.lastSync')}: {dateTemplate(syncStatus.last_inventory_sync)}
              </p>
            )}
          </div>
        </div>

        {syncStatus?.rate_limit_remaining !== undefined && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <i className="pi pi-info-circle mr-2"></i>
              {t('status.rateLimit')}: {syncStatus.rate_limit_remaining} {t('status.requestsRemaining')}
            </p>
          </div>
        )}
      </Card>

      {/* Products Table */}
      <Card title={t('products.title')} className="shadow-lg">
        <div className="mb-4">
          <Dropdown
            value={statusFilter}
            options={statusFilterOptions}
            onChange={(e) => setStatusFilter(e.value)}
            placeholder={t('filters.filterByStatus')}
          />
        </div>
        
        <DataTable
          value={products}
          paginator
          rows={perPage}
          totalRecords={totalProducts}
          lazy
          first={(page - 1) * perPage}
          onPage={(e) => setPage((e.first / perPage) + 1)}
          loading={loading}
          emptyMessage={t('products.noProducts')}
        >
          <Column field="listing_id" header={t('products.listingId')} />
          <Column field="title" header={t('products.title')} />
          <Column field="sku" header={t('products.sku')} />
          <Column field="price" header={t('products.price')} body={(data) => `$${data.price.toFixed(2)}`} />
          <Column field="quantity" header={t('products.quantity')} />
          <Column field="sync_status" header={t('products.status')} body={syncStatusTemplate} />
          <Column 
            field="last_synced_at" 
            header={t('products.lastSynced')} 
            body={(data) => dateTemplate(data.last_synced_at)} 
          />
        </DataTable>
      </Card>

      {/* Sync Logs Table */}
      <Card title={t('logs.title')} className="shadow-lg">
        <div className="mb-4">
          <Dropdown
            value={logStatusFilter}
            options={logStatusFilterOptions}
            onChange={(e) => setLogStatusFilter(e.value)}
            placeholder={t('filters.filterByStatus')}
          />
        </div>
        
        <DataTable
          value={syncLogs}
          paginator
          rows={perPage}
          totalRecords={totalLogs}
          lazy
          first={(logsPage - 1) * perPage}
          onPage={(e) => setLogsPage((e.first / perPage) + 1)}
          loading={loading}
          emptyMessage={t('logs.noLogs')}
        >
          <Column field="listing_id" header={t('logs.listingId')} />
          <Column field="sync_type" header={t('logs.syncType')} />
          <Column field="direction" header={t('logs.direction')} />
          <Column header={t('logs.quantityChange')} body={quantityChangeTemplate} />
          <Column field="status" header={t('logs.status')} body={logStatusTemplate} />
          <Column field="error_message" header={t('logs.error')} />
          <Column 
            field="synced_at" 
            header={t('logs.syncedAt')} 
            body={(data) => dateTemplate(data.synced_at)} 
          />
        </DataTable>
      </Card>

      {/* Config Dialog */}
      <Dialog
        header={t('config.title')}
        visible={configDialogVisible}
        style={{ width: '50vw' }}
        onHide={() => setConfigDialogVisible(false)}
      >
        {etsyConfig && (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">{t('config.enabled')}</span>
              <Tag 
                value={etsyConfig.enabled ? t('config.yes') : t('config.no')} 
                severity={etsyConfig.enabled ? 'success' : 'danger'} 
              />
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">{t('config.apiKeyConfigured')}</span>
              <Tag 
                value={etsyConfig.api_key_configured ? t('config.yes') : t('config.no')} 
                severity={etsyConfig.api_key_configured ? 'success' : 'danger'} 
              />
            </div>
            {etsyConfig.shop_id && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">{t('config.shopId')}</span>
                <span>{etsyConfig.shop_id}</span>
              </div>
            )}
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">{t('config.rateLimit')}</span>
              <span>{etsyConfig.max_requests_per_day} {t('config.requestsPerDay')}</span>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
