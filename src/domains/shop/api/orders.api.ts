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

  // Le backend n'expose pas de route générique /statut : chaque transition a
  // la sienne, ce qui évite d'accepter un enchaînement d'états incohérent.
  valider: (id: string): Promise<any> =>
    shopClient.patch(`/admin/commandes/${id}/valider`),

  rejeter: (id: string, raison = 'Non précisée'): Promise<any> =>
    shopClient.patch(`/admin/commandes/${id}/rejeter`, { raison }),

  preparation: (id: string): Promise<any> =>
    shopClient.patch(`/admin/commandes/${id}/preparation`),

  expedier: (id: string): Promise<any> =>
    shopClient.patch(`/admin/commandes/${id}/expedier`),

  livrer: (id: string): Promise<any> =>
    shopClient.patch(`/admin/commandes/${id}/livrer`),

  getKpi: (): Promise<any> => shopClient.get('/admin/commandes/kpi'),

  exportCsv: (filters?: OrderFilters): Promise<any> =>
    shopClient.get('/admin/commandes/export', { params: filters }),
};
