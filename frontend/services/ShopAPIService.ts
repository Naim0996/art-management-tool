/**
 * Shop API Service - Frontend client for e-commerce shop endpoints
 * Handles public shop API interactions (products, cart, checkout)
 */

// Use relative paths - Next.js rewrites will proxy to backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ==================== Types ====================

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
  attributes: string; // JSON string
  price_adjustment: number;
  stock: number;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  per_page: number;
}

export interface Cart {
  id: number;
  session_token: string;
  user_id?: number;
  items: CartItem[];
  discount_code?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  variant_id?: number;
  quantity: number;
  product?: Product;
  variant?: ProductVariant;
}

export interface CartResponse {
  cart: Cart;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

export interface CheckoutRequest {
  session_token?: string;
  email: string;
  name: string;
  payment_method: string;
  shipping_address: Address;
  billing_address?: Address;
  discount_code?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface CheckoutResponse {
  order_id: string;
  order_number: string;
  payment_intent_id?: string;
  client_secret?: string;
  total: number;
  status: string;
}

export interface DiscountResponse {
  discount_code: string;
  discount_type: string;
  discount_value: number;
  discount_amount: number;
  subtotal: number;
  tax: number;
  total_before: number;
  total_after: number;
}

// ==================== Shop API Service ====================

class ShopAPIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/shop`;
  }

  /**
   * Get or generate cart session token
   * Uses hybrid approach: cookie first, localStorage fallback, generate new if needed
   */
  private getSessionToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    const allCookies = document.cookie;
    console.log(`🍪 Frontend: All cookies: ${allCookies || 'none'}`);
    
    // Try to get from cookie first
    const cookieMatch = document.cookie.match(/cart_session=([^;]+)/);
    let token = cookieMatch ? cookieMatch[1] : null;
    
    if (token) {
      console.log(`🍪 Frontend: Found cookie token: ${token.substring(0, 20)}...`);
      // Store in localStorage as backup
      localStorage.setItem('cart_session_backup', token);
      return token;
    }
    
    // Fallback to localStorage
    token = localStorage.getItem('cart_session_backup');
    if (token) {
      console.log(`🍪 Frontend: Using localStorage backup token: ${token.substring(0, 20)}...`);
      // Try to restore cookie
      document.cookie = `cart_session=${token}; path=/; max-age=${86400 * 7}; SameSite=Lax`;
      return token;
    }
    
    console.log(`🍪 Frontend: No session token found`);
    return null;
  }

  /**
   * Set session token in both cookie and localStorage
   */
  private setSessionToken(token: string): void {
    if (typeof document === 'undefined') return;
    
    console.log(`🍪 Frontend: Setting session token: ${token.substring(0, 20)}...`);
    
    // Set cookie
    document.cookie = `cart_session=${token}; path=/; max-age=${86400 * 7}; SameSite=Lax`;
    
    // Set localStorage backup
    localStorage.setItem('cart_session_backup', token);
  }

  /**
   * Make API request with proper error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get session token for header fallback
    const sessionToken = this.getSessionToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    
    // Add session token to header as fallback
    if (sessionToken) {
      headers['X-Cart-Session'] = sessionToken;
      console.log(`🍪 Frontend: Adding session token to header: ${sessionToken.substring(0, 20)}...`);
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for cart session
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Check if response contains a cart with session_token and save it
    if (data && typeof data === 'object' && data.cart && data.cart.session_token) {
      console.log(`🍪 Frontend: Response contains session token: ${data.cart.session_token.substring(0, 20)}...`);
      this.setSessionToken(data.cart.session_token);
    }

    return data;
  }

  // ==================== Products ====================

  /**
   * List products with filters and pagination
   */
  async listProducts(params?: {
    status?: string;
    category?: number;
    min_price?: number;
    max_price?: number;
    search?: string;
    in_stock?: boolean;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: string;
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
   * Get product by slug
   */
  async getProduct(slug: string): Promise<Product> {
    return this.request<Product>(`/products/${slug}`);
  }

  // ==================== Cart ====================

  /**
   * Get current cart
   */
  async getCart(): Promise<CartResponse> {
    console.log(`🛒 Frontend: Getting cart...`);
    const result = await this.request<CartResponse>('/cart');
    console.log(`🛒 Frontend: Cart response:`, result);
    return result;
  }

  /**
   * Add item to cart
   */
  async addToCart(data: {
    product_id: number;
    variant_id?: number;
    quantity: number;
  }): Promise<CartResponse> {
    console.log(`🛒 Frontend: Adding to cart:`, data);
    const result = await this.request<CartResponse>('/cart/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log(`🛒 Frontend: Add to cart response:`, result);
    return result;
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(itemId: number, quantity: number): Promise<CartResponse> {
    return this.request<CartResponse>(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  /**
   * Remove item from cart
   */
  async removeCartItem(itemId: number): Promise<void> {
    await this.request(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    await this.request('/cart', {
      method: 'DELETE',
    });
  }

  // ==================== Checkout ====================

  /**
   * Apply discount code
   */
  async applyDiscount(code: string): Promise<DiscountResponse> {
    return this.request<DiscountResponse>('/cart/discount', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  /**
   * Process checkout
   */
  async checkout(data: CheckoutRequest): Promise<CheckoutResponse> {
    // Include session token from cookie if not provided
    if (!data.session_token) {
      const sessionToken = this.getSessionToken();
      if (sessionToken) {
        data.session_token = sessionToken;
      }
    }

    return this.request<CheckoutResponse>('/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Export singleton instance
export const shopAPI = new ShopAPIService();
export default shopAPI;
