import shopClient from '@/infrastructure/http/shop.client';
import type { StatutCommande } from '../types';

export interface OrderFilters {
  statut?: StatutCommande;
  userId?: string;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  limit?: number;
}

export const ordersApi = {
  getAll: (filters?: OrderFilters): Promise<any> =>
    shopClient.get('/admin/commandes', { params: filters }),

  getById: (id: string): Promise<any> =>
    shopClient.get(`/admin/commandes/${id}`),

  updateStatut: (id: string, statut: StatutCommande, noteAdmin?: string): Promise<any> =>
    shopClient.patch(`/admin/commandes/${id}/statut`, { statut, noteAdmin }),
};
