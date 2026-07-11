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
    shopClient.get('/admin/paiements', { params: filters }),

  getById: (id: string): Promise<any> =>
    shopClient.get(`/admin/paiements/${id}`),

  getByCommande: (commandeId: string): Promise<any> =>
    shopClient.get(`/admin/paiements/commande/${commandeId}`),

  confirmer: (id: string, transactionId?: string): Promise<any> =>
    shopClient.patch(`/admin/paiements/${id}/confirmer`, { transactionId }),

  rembourser: (id: string, raison?: string): Promise<any> =>
    shopClient.patch(`/admin/paiements/${id}/rembourser`, { raison }),

  getRevenusTotal: (dateDebut?: string, dateFin?: string): Promise<any> =>
    shopClient.get('/admin/paiements/revenus-total', { params: { dateDebut, dateFin } }),
};
