import shopClient from '@/infrastructure/http/shop.client';

export interface ReviewFilters {
  isApproved?: boolean;
  produitId?: string;
  page?: number;
  limit?: number;
}

export const reviewsApi = {
  getAll: (filters?: ReviewFilters): Promise<any> =>
    shopClient.get('/admin/avis', { params: filters }),

  approuver: (id: string): Promise<any> =>
    shopClient.patch(`/admin/avis/${id}/approuver`),

  rejeter: (id: string): Promise<any> =>
    shopClient.patch(`/admin/avis/${id}/rejeter`),

  delete: (id: string): Promise<any> =>
    shopClient.delete(`/admin/avis/${id}`),
};
