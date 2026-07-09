import shopClient from '@/infrastructure/http/shop.client';

export interface ReviewFilters {
  isApproved?: boolean;
  produitId?: string;
  page?: number;
  limit?: number;
}

export const reviewsApi = {
  getAll: (filters?: ReviewFilters): Promise<any> =>
    shopClient.get('/v1/admin/avis', { params: filters }),

  approuver: (id: string): Promise<any> =>
    shopClient.patch(`/v1/admin/avis/${id}/approuver`),

  rejeter: (id: string): Promise<any> =>
    shopClient.patch(`/v1/admin/avis/${id}/rejeter`),

  delete: (id: string): Promise<any> =>
    shopClient.delete(`/v1/admin/avis/${id}`),
};
