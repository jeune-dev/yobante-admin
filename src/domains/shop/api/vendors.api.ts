import shopClient from '@/infrastructure/http/shop.client';

export interface VendeurFilters {
  search?: string;
  statut?: 'en_attente' | 'step1' | 'valide';
  page?: number;
  limit?: number;
}

export interface CreateVendeurData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  nomBoutique: string;
  description?: string;
}

export const vendorsApi = {
  getAll: (filters?: VendeurFilters): Promise<any> =>
    shopClient.get('/v1/admin/vendeurs', { params: filters }),

  getById: (id: string): Promise<any> =>
    shopClient.get(`/v1/admin/vendeurs/${id}`),

  create: (data: CreateVendeurData): Promise<any> =>
    shopClient.post('/v1/admin/vendeurs', data),

  validerStep1: (id: string): Promise<any> =>
    shopClient.patch(`/v1/admin/vendeurs/${id}/valider-step1`),

  validerStep2: (id: string): Promise<any> =>
    shopClient.patch(`/v1/admin/vendeurs/${id}/valider-step2`),

  rejeter: (id: string, motifRejet?: string): Promise<any> =>
    shopClient.patch(`/v1/admin/vendeurs/${id}/rejeter`, { motifRejet }),

  toggleActivation: (id: string): Promise<any> =>
    shopClient.patch(`/v1/admin/vendeurs/${id}/toggle`),

  updateProfil: (id: string, data: Record<string, any>): Promise<any> =>
    shopClient.put(`/v1/admin/vendeurs/${id}/profil`, data),
};
