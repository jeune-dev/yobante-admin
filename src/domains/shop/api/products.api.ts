import shopClient from '@/infrastructure/http/shop.client';
import type { Produit } from '../types';

export interface ProductFilters {
  search?: string;
  categorieId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  prixMin?: number;
  prixMax?: number;
  page?: number;
  limit?: number;
}

export const productsApi = {
  getAll: (filters?: ProductFilters): Promise<any> =>
    shopClient.get('/admin/produits', { params: filters }),

  getById: (id: string): Promise<any> =>
    shopClient.get(`/admin/produits/${id}`),

  getAValider: (): Promise<any> =>
    shopClient.get('/admin/produits/a-valider'),

  create: (data: FormData): Promise<any> =>
    shopClient.post('/admin/produits', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, data: FormData | Record<string, any>): Promise<any> =>
    shopClient.put(`/admin/produits/${id}`, data,
      data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    ),

  delete: (id: string): Promise<any> =>
    shopClient.delete(`/admin/produits/${id}`),

  updateStock: (id: string, quantite: number): Promise<any> =>
    shopClient.patch(`/admin/produits/${id}/stock`, { quantite }),

  toggleFeatured: (id: string): Promise<any> =>
    shopClient.patch(`/admin/produits/${id}/featured`),

  toggleVisibilite: (id: string): Promise<any> =>
    shopClient.patch(`/admin/produits/${id}/visibilite`),

  validerStep1: (id: string): Promise<any> =>
    shopClient.patch(`/admin/produits/${id}/valider-step1`),

  validerStep2: (id: string): Promise<any> =>
    shopClient.patch(`/admin/produits/${id}/valider-step2`),

  rejeter: (id: string, motif?: string): Promise<any> =>
    shopClient.patch(`/admin/produits/${id}/rejeter`, { motif }),
};
