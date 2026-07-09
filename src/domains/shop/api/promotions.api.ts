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
    shopClient.get('/v1/admin/promotions', { params }),

  getById: (id: string): Promise<any> =>
    shopClient.get(`/v1/admin/promotions/${id}`),

  getParSection: (): Promise<any> =>
    shopClient.get('/v1/admin/promotions/par-section'),

  create: (data: CreatePromotionData): Promise<any> =>
    shopClient.post('/v1/admin/promotions', data),

  update: (id: string, data: Partial<CreatePromotionData>): Promise<any> =>
    shopClient.put(`/v1/admin/promotions/${id}`, data),

  delete: (id: string): Promise<any> =>
    shopClient.delete(`/v1/admin/promotions/${id}`),

  toggleActive: (id: string): Promise<any> =>
    shopClient.patch(`/v1/admin/promotions/${id}/toggle`),
};
