// API Service for managing categories
// Handles all HTTP calls to backend for category CRUD operations

export interface CategoryDTO {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number | null;
  parent?: CategoryDTO;
  children?: CategoryDTO[];
  created_at?: string;
  updated_at?: string;
}

export interface CategoryListResponse {
  categories: CategoryDTO[];
  total: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export class CategoryAPIService {
  private static getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private static async fetchJSON<T>(url: string, options?: RequestInit, useAuth = false): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    if (useAuth) {
      const authHeaders = this.getAuthHeaders();
      Object.assign(headers, authHeaders);
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  // GET /api/shop/categories - Get all active categories (public)
  static async getAllCategories(includeChildren = false): Promise<CategoryDTO[]> {
    const url = `/api/shop/categories${includeChildren ? '?include_children=true' : ''}`;
    const response = await this.fetchJSON<CategoryListResponse>(url);
    return response.categories || [];
  }

  // GET /api/shop/categories/{id} - Get specific category (public)
  static async getCategory(id: number): Promise<CategoryDTO> {
    return this.fetchJSON<CategoryDTO>(`/api/shop/categories/${id}`);
  }

  // GET /api/admin/categories - Get all categories (admin)
  static async getAllCategoriesAdmin(
    parentId?: number | null,
    includeChildren = false,
    includeParent = false
  ): Promise<CategoryDTO[]> {
    const params = new URLSearchParams();
    if (parentId !== undefined) {
      params.append('parent_id', parentId === null ? 'null' : parentId.toString());
    }
    if (includeChildren) params.append('include_children', 'true');
    if (includeParent) params.append('include_parent', 'true');
    
    const url = `/api/admin/categories${params.toString() ? '?' + params.toString() : ''}`;
    const response = await this.fetchJSON<CategoryListResponse>(url, {}, true);
    return response.categories || [];
  }

  // GET /api/admin/categories/{id} - Get specific category (admin)
  static async getCategoryAdmin(id: number): Promise<CategoryDTO> {
    return this.fetchJSON<CategoryDTO>(`/api/admin/categories/${id}`, {}, true);
  }

  // POST /api/admin/categories - Create new category
  static async createCategory(category: Partial<CategoryDTO>): Promise<CategoryDTO> {
    return this.fetchJSON<CategoryDTO>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    }, true);
  }

  // PATCH /api/admin/categories/{id} - Update category
  static async updateCategory(id: number, category: Partial<CategoryDTO>): Promise<CategoryDTO> {
    return this.fetchJSON<CategoryDTO>(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(category),
    }, true);
  }

  // DELETE /api/admin/categories/{id} - Delete category
  static async deleteCategory(id: number): Promise<{ message: string; id: number }> {
    return this.fetchJSON<{ message: string; id: number }>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    }, true);
  }
}
