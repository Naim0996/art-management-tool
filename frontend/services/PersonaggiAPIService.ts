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

class PersonaggiAPIService {
  private async fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  // GET /api/personaggi - Ottieni tutti i personaggi attivi
  async getAllPersonaggi(): Promise<PersonaggiListResponse> {
    return this.fetchJSON<PersonaggiListResponse>('/api/personaggi');
  }

  // GET /api/personaggi/{id} - Ottieni un personaggio specifico
  async getPersonaggio(id: number): Promise<PersonaggioDTO> {
    return this.fetchJSON<PersonaggioDTO>(`/api/personaggi/${id}`);
  }

  // POST /api/personaggi - Crea un nuovo personaggio
  async createPersonaggio(data: Omit<PersonaggioDTO, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<PersonaggioDTO> {
    return this.fetchJSON<PersonaggioDTO>('/api/personaggi', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT /api/personaggi/{id} - Aggiorna un personaggio esistente
  async updatePersonaggio(id: number, data: Partial<PersonaggioDTO>): Promise<PersonaggioDTO> {
    return this.fetchJSON<PersonaggioDTO>(`/api/personaggi/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE /api/personaggi/{id} - Soft delete di un personaggio
  async deletePersonaggio(id: number): Promise<{ message: string; id: string }> {
    return this.fetchJSON<{ message: string; id: string }>(`/api/personaggi/${id}`, {
      method: 'DELETE',
    });
  }

  // POST /api/personaggi/{id}/restore - Ripristina un personaggio cancellato
  async restorePersonaggio(id: number): Promise<PersonaggioDTO> {
    return this.fetchJSON<PersonaggioDTO>(`/api/personaggi/${id}/restore`, {
      method: 'POST',
    });
  }

  // GET /api/personaggi/deleted - Ottieni tutti i personaggi cancellati
  async getDeletedPersonaggi(): Promise<PersonaggiListResponse> {
    return this.fetchJSON<PersonaggiListResponse>('/api/personaggi/deleted');
  }

  // POST /api/personaggi/{id}/upload - Upload immagine per un personaggio
  async uploadImage(id: number, file: File, type: 'icon' | 'gallery'): Promise<{ path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${API_BASE_URL}/api/personaggi/${id}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }
}

// Esporta un'istanza singleton del service
export const personaggiAPI = new PersonaggiAPIService();
