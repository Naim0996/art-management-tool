/**
 * Type definitions for Admin Shop API
 * Extracted from AdminShopAPIService.ts for better maintainability
 */

// ==================== Order Types ====================

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

// ==================== Notification Types ====================

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

// ==================== Product Types ====================

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
  character_value?: string;
  etsy_link?: string;
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

// ==================== Request Types ====================

export interface CreateProductRequest {
  slug: string;
  title: string;
  short_description: string;
  long_description?: string;
  base_price: number;
  currency?: string;
  sku: string;
  gtin?: string;
  character_value?: string;
  etsy_link?: string;
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
