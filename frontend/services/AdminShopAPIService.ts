/**
 * Admin Shop API Service - Frontend client for admin shop management endpoints
 * Handles authenticated admin operations (products, orders, inventory, notifications)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ==================== Types ====================

export interface Order {
  id: number;
  order_number: string;
  customer_email: string;
  customer_name: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  payment_intent_id?: string;
  fulfillment_status: 'unfulfilled' | 'fulfilled' | 'partially_fulfilled';
  shipping_address: Address;
  billing_address: Address;
  items: OrderItem[];
  discount_code?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id?: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_title: string;
  product_sku: string;
  variant_name?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  per_page: number;
}

export interface Notification {
  id: number;
  type: 'low_stock' | 'payment_failed' | 'order_created' | 'order_paid';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  payload?: string;
  read_at?: string;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
  page: number;
  per_page: number;
}

export interface Product {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  long_description?: string;
  base_price: number;
  currency: string;
  sku: string;
  gtin?: string;
  status: 'published' | 'draft' | 'archived';
  categories?: Category[];
  images?: ProductImage[];
  variants?: ProductVariant[];
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface ProductImage {
  id: number;
  url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  name: string;
  attributes: string;
  price_adjustment: number;
  stock: number;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  per_page: number;
}

export interface CreateProductRequest {
  slug: string;
  title: string;
  short_description: string;
  long_description?: string;
  base_price: number;
  currency?: string;
  sku: string;
  gtin?: string;
  status?: 'published' | 'draft' | 'archived';
}

export interface UpdateProductRequest {
  slug?: string;
  title?: string;
  short_description?: string;
  long_description?: string;
  base_price?: number;
  currency?: string;
  sku?: string;
  gtin?: string;
  status?: 'published' | 'draft' | 'archived';
}

export interface CreateVariantRequest {
  sku: string;
  name: string;
  attributes: string;
  price_adjustment: number;
  stock: number;
}

export interface InventoryAdjustRequest {
  variant_id: number;
  quantity: number;
  operation: 'set' | 'add' | 'subtract';
}

// ==================== Admin Shop API Service ====================

class AdminShopAPIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/admin/shop`;
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

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // ==================== Products ====================

  /**
   * List all products (admin view)
   */
  async listProducts(params?: {
    status?: string;
    category?: number;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<ProductListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const query = queryParams.toString();
    return this.request<ProductListResponse>(
      `/products${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get product by ID
   */
  async getProduct(id: number): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  /**
   * Create new product
   */
  async createProduct(data: CreateProductRequest): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update product
   */
  async updateProduct(id: number, data: UpdateProductRequest): Promise<void> {
    await this.request(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete product
   */
  async deleteProduct(id: number): Promise<void> {
    await this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Add variant to product
   */
  async addVariant(productId: number, data: CreateVariantRequest): Promise<ProductVariant> {
    return this.request<ProductVariant>(`/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update variant
   */
  async updateVariant(variantId: number, data: Partial<CreateVariantRequest>): Promise<void> {
    await this.request(`/variants/${variantId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Adjust inventory
   */
  async adjustInventory(data: InventoryAdjustRequest): Promise<void> {
    await this.request('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== Orders ====================

  /**
   * List orders
   */
  async listOrders(params?: {
    payment_status?: string;
    fulfillment_status?: string;
    customer_email?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
  }): Promise<OrderListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const query = queryParams.toString();
    return this.request<OrderListResponse>(
      `/orders${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get order by ID
   */
  async getOrder(id: number): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  /**
   * Update fulfillment status
   */
  async updateFulfillmentStatus(
    id: number,
    status: 'unfulfilled' | 'fulfilled' | 'partially_fulfilled'
  ): Promise<void> {
    await this.request(`/orders/${id}/fulfillment`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  /**
   * Refund order
   */
  async refundOrder(id: number, amount?: number): Promise<void> {
    await this.request(`/orders/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify(amount ? { amount } : {}),
    });
  }

  // ==================== Notifications ====================

  /**
   * List notifications
   */
  async listNotifications(params?: {
    type?: string;
    severity?: string;
    unread?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<NotificationListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const query = queryParams.toString();
    return this.request<NotificationListResponse>(
      `/notifications${query ? `?${query}` : ''}`.replace('/shop', '')
    );
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: number): Promise<void> {
    await this.request(`/notifications/${id}/read`.replace('/shop', ''), {
      method: 'PATCH',
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await this.request('/notifications/read-all'.replace('/shop', ''), {
      method: 'POST',
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: number): Promise<void> {
    await this.request(`/notifications/${id}`.replace('/shop', ''), {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const adminShopAPI = new AdminShopAPIService();
export default adminShopAPI;
