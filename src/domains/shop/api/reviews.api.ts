import shopClient from '@/infrastructure/http/shop.client';

/** Avis tel que renvoyé par l'administration. */
export interface Review {
  id: string;
  produitId: string;
  userId: string;
  note: number;
  commentaire?: string | null;
  isApproved?: boolean;
  // Toujours présent : les modèles sont horodatés côté backend.
  createdAt: string;
  produit?: Record<string, any>;
  user?: Record<string, any>;
}

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
