// API Service per la gestione dei personaggi
// Gestisce tutte le chiamate HTTP al backend per le operazioni CRUD

export interface PersonaggioDTO {
  id?: number;
  name: string;
  description: string;
  icon?: string;
  images: string[];
  backgroundColor?: string;
  backgroundType?: 'solid' | 'gradient';
  gradientFrom?: string;
  gradientTo?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface PersonaggiListResponse {
  personaggi: PersonaggioDTO[];
  count: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export class PersonaggiAPIService {
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
      console.log(`[PersonaggiAPI] Auth request to ${url}`, {
        hasToken: !!(authHeaders as Record<string, string>).Authorization,
      });
    } else {
      console.log(`[PersonaggiAPI] Public request to ${url}`);
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[PersonaggiAPI] Error ${response.status} for ${url}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    console.log(`[PersonaggiAPI] Success ${response.status} for ${url}`);
    return response.json();
  }

  // GET /api/personaggi - Ottieni tutti i personaggi attivi (public)
  static async getAllPersonaggi(): Promise<PersonaggioDTO[]> {
    const response = await this.fetchJSON<PersonaggiListResponse>('/api/personaggi');
    return response.personaggi || response as any;
  }

  // GET /api/admin/personaggi - Ottieni tutti i personaggi attivi (admin)
  static async getAllPersonaggiAdmin(): Promise<PersonaggioDTO[]> {
    const response = await this.fetchJSON<PersonaggiListResponse>('/api/admin/personaggi', {}, true);
    return response.personaggi || response as any;
  }

  // GET /api/personaggi/{id} - Ottieni un personaggio specifico (public)
  static async getPersonaggio(id: number): Promise<PersonaggioDTO> {
    return this.fetchJSON<PersonaggioDTO>(`/api/personaggi/${id}`);
  }

  // GET /api/admin/personaggi/{id} - Ottieni un personaggio specifico (admin)
  static async getPersonaggioAdmin(id: number): Promise<PersonaggioDTO> {
    return this.fetchJSON<PersonaggioDTO>(`/api/admin/personaggi/${id}`, {}, true);
  }

  // POST /api/admin/personaggi - Crea un nuovo personaggio
  static async createPersonaggio(data: Omit<PersonaggioDTO, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<PersonaggioDTO> {
    return this.fetchJSON<PersonaggioDTO>('/api/admin/personaggi', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  // PUT /api/admin/personaggi/{id} - Aggiorna un personaggio esistente
  static async updatePersonaggio(id: number, data: Partial<PersonaggioDTO>): Promise<PersonaggioDTO> {
    return this.fetchJSON<PersonaggioDTO>(`/api/admin/personaggi/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  // DELETE /api/admin/personaggi/{id} - Soft delete di un personaggio
  static async deletePersonaggio(id: number): Promise<{ message: string; id: string }> {
    return this.fetchJSON<{ message: string; id: string }>(`/api/admin/personaggi/${id}`, {
      method: 'DELETE',
    }, true);
  }

  // POST /api/admin/personaggi/{id}/restore - Ripristina un personaggio cancellato
  static async restorePersonaggio(id: number): Promise<PersonaggioDTO> {
    return this.fetchJSON<PersonaggioDTO>(`/api/admin/personaggi/${id}/restore`, {
      method: 'POST',
    }, true);
  }

  // GET /api/admin/personaggi/deleted - Ottieni tutti i personaggi cancellati
  static async getDeletedPersonaggi(): Promise<PersonaggioDTO[]> {
    const response = await this.fetchJSON<PersonaggiListResponse>('/api/admin/personaggi/deleted', {}, true);
    return response.personaggi || response as any;
  }

  // POST /api/admin/personaggi/{id}/upload - Upload immagine per un personaggio
  static async uploadImage(id: number, file: File, type: 'icon' | 'image'): Promise<{ message: string; url: string; type: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}/api/admin/personaggi/${id}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  // DELETE /api/admin/personaggi/{id}/images - Elimina un'immagine da un personaggio
  static async deleteImage(id: number, imageUrl: string, type: 'icon' | 'image'): Promise<{ message: string }> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/personaggi/${id}/images`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ imageUrl, type }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }
}
