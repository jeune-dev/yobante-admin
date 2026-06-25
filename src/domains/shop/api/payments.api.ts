import shopClient from '@/infrastructure/http/shop.client';

export interface Payment {
  id: number;
  commandeId: string;
  montant: number;
  methodePaiement: string;
  statut: 'en_attente' | 'succes' | 'echec' | 'rembourse';
  transactionId?: string;
  payeAt?: string;
  createdAt: string;
  Commande?: {
    id: string;
    User?: { nom: string; prenom: string; email: string };
  };
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  statut?: string;
}

const extract = (res: any) => res?.data ?? res;

export const paymentsApi = {
  getAll: (filters: PaymentFilters = {}): Promise<{ rows: Payment[]; count: number; totalPages: number }> =>
    shopClient.get('/admin/paiements', { params: filters }).then(extract),

  getById: (id: number): Promise<Payment> =>
    shopClient.get(`/admin/paiements/${id}`).then(extract),

  rembourser: (id: number): Promise<Payment> =>
    shopClient.patch(`/admin/paiements/${id}/rembourser`).then(extract),
};
