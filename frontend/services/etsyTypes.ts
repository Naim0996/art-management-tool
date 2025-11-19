/**
 * Type definitions for Etsy integration
 */

export interface EtsyProduct {
  id: number;
  listing_id: string;
  product_id?: number;
  shop_id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  state: string;
  url: string;
  sku?: string;
  sync_status: 'synced' | 'pending' | 'failed' | 'unlinked';
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EtsyProductListResponse {
  products: EtsyProduct[];
  total: number;
  page: number;
  per_page: number;
}

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

export interface InventorySyncLog {
  id: number;
  listing_id: string;
  variant_id?: number;
  sync_type: string;
  direction: string;
  old_quantity?: number;
  new_quantity?: number;
  status: 'success' | 'failed';
  error_message?: string;
  synced_at: string;
}

export interface InventorySyncLogResponse {
  logs: InventorySyncLog[];
  total: number;
  page: number;
  per_page: number;
}

export interface EtsyConfig {
  enabled: boolean;
  api_key_configured: boolean;
  shop_id?: string;
  rate_limit_enabled: boolean;
  max_requests_per_day: number;
}

export interface SyncTriggerRequest {
  shop_id?: string;
  direction?: 'push' | 'pull' | 'bidirectional';
}

export interface LinkProductRequest {
  product_id: number;
}
