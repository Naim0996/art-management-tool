/**
 * Etsy API Service - Frontend client for Etsy integration management
 * Handles Etsy product and inventory synchronization operations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ==================== Types ====================

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

// ==================== Etsy API Service ====================

class EtsyAPIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/admin/etsy`;
  }

  /**
   * Get auth token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    // Handle 204 No Content or 202 Accepted
    if (response.status === 204 || response.status === 202) {
      // For 202, try to parse response but don't fail if empty
      if (response.status === 202) {
        try {
          return await response.json();
        } catch {
          return {} as T;
        }
      }
      return {} as T;
    }

    return response.json();
  }

  // ==================== Sync Management ====================

  /**
   * Trigger product synchronization
   */
  async triggerProductSync(request?: SyncTriggerRequest): Promise<{ message: string; status: string }> {
    return this.request('/sync/products', {
      method: 'POST',
      body: JSON.stringify(request || {}),
    });
  }

  /**
   * Trigger inventory synchronization
   */
  async triggerInventorySync(request?: SyncTriggerRequest): Promise<{ message: string; status: string }> {
    return this.request('/sync/inventory', {
      method: 'POST',
      body: JSON.stringify(request || {}),
    });
  }

  /**
   * Get synchronization status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    return this.request<SyncStatus>('/sync/status');
  }

  /**
   * Get inventory sync logs
   */
  async getInventorySyncLogs(params?: {
    listing_id?: string;
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<InventorySyncLogResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const query = queryParams.toString();
    return this.request<InventorySyncLogResponse>(
      `/sync/logs${query ? `?${query}` : ''}`
    );
  }

  // ==================== Product Management ====================

  /**
   * List Etsy products
   */
  async listEtsyProducts(params?: {
    sync_status?: string;
    linked?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<EtsyProductListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const query = queryParams.toString();
    return this.request<EtsyProductListResponse>(
      `/products${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get Etsy product by listing ID
   */
  async getEtsyProduct(listingId: string): Promise<EtsyProduct> {
    return this.request<EtsyProduct>(`/products/${listingId}`);
  }

  /**
   * Link Etsy listing to local product
   */
  async linkProduct(listingId: string, productId: number): Promise<void> {
    await this.request(`/products/${listingId}/link`, {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  }

  /**
   * Unlink Etsy listing from local product
   */
  async unlinkProduct(listingId: string): Promise<void> {
    await this.request(`/products/${listingId}/link`, {
      method: 'DELETE',
    });
  }

  // ==================== Configuration ====================

  /**
   * Get Etsy configuration status
   */
  async getEtsyConfig(): Promise<EtsyConfig> {
    return this.request<EtsyConfig>('/config');
  }

  /**
   * Validate Etsy credentials
   */
  async validateCredentials(): Promise<{ valid: boolean; message: string }> {
    return this.request('/validate', {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const etsyAPI = new EtsyAPIService();
export default etsyAPI;
