import shopClient from '@/infrastructure/http/shop.client';

export interface Review {
  id: number;
  note: number;
  commentaire?: string;
  isApproved: boolean;
  createdAt: string;
  User?: { id: string; nom: string; prenom: string };
  Produit?: { id: number; nom: string };
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  isApproved?: boolean;
}

const extract = (res: any) => res?.data ?? res;

export const reviewsApi = {
  getAll: (filters: ReviewFilters = {}): Promise<{ rows: Review[]; count: number; totalPages: number }> =>
    shopClient.get('/admin/avis', { params: filters }).then(extract),

  approuver: (id: number): Promise<Review> =>
    shopClient.patch(`/admin/avis/${id}/approuver`).then(extract),

  remove: (id: number): Promise<void> =>
    shopClient.delete(`/admin/avis/${id}`).then(extract),
};
