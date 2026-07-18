import shopClient from '@/infrastructure/http/shop.client';
import type { SectionPromotion } from '../types';

export interface CreatePromotionData {
  produitId: string;
  section: SectionPromotion;
  ordre?: number;
  prixPromo?: number;
  pourcentageReduction?: number;
  dateDebut?: string;
  dateFin?: string;
}

export const promotionsApi = {
  getAll: (params?: { section?: SectionPromotion; isActive?: boolean; page?: number; limit?: number }): Promise<any> =>
    shopClient.get('/admin/promotions', { params }),

  getById: (id: string): Promise<any> =>
    shopClient.get(`/admin/promotions/${id}`),

  // La route backend est /sections, pas /par-section : l'ancien chemin
  // tombait sur /:id et repartait en erreur.
  getParSection: (): Promise<any> =>
    shopClient.get('/admin/promotions/sections'),

  create: (data: CreatePromotionData): Promise<any> =>
    shopClient.post('/admin/promotions', data),

  update: (id: string, data: Partial<CreatePromotionData>): Promise<any> =>
    shopClient.put(`/admin/promotions/${id}`, data),

  delete: (id: string): Promise<any> =>
    shopClient.delete(`/admin/promotions/${id}`),

  toggleActive: (id: string): Promise<any> =>
    shopClient.patch(`/admin/promotions/${id}/toggle`),
};
