import shopClient from '@/infrastructure/http/shop.client';

export interface PaymentFilters {
  statut?: string;
  methode?: string;
  userId?: string;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  limit?: number;
}

export const paymentsApi = {
  getAll: (filters?: PaymentFilters): Promise<any> =>
    shopClient.get('/v1/admin/paiements', { params: filters }),

  getById: (id: string): Promise<any> =>
    shopClient.get(`/v1/admin/paiements/${id}`),

  getByCommande: (commandeId: string): Promise<any> =>
    shopClient.get(`/v1/admin/paiements/commande/${commandeId}`),

  confirmer: (id: string, transactionId?: string): Promise<any> =>
    shopClient.patch(`/v1/admin/paiements/${id}/confirmer`, { transactionId }),

  rembourser: (id: string, raison?: string): Promise<any> =>
    shopClient.patch(`/v1/admin/paiements/${id}/rembourser`, { raison }),

  getRevenusTotal: (dateDebut?: string, dateFin?: string): Promise<any> =>
    shopClient.get('/v1/admin/paiements/revenus-total', { params: { dateDebut, dateFin } }),
};
