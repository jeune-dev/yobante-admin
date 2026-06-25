import shopClient from '@/infrastructure/http/shop.client';

export interface OrderItem {
  id: number;
  produitId: number;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  Produit?: { id: number; nom: string; images?: any };
}

export interface Order {
  id: string;
  statut: 'en_attente' | 'validee' | 'en_preparation' | 'expediee' | 'livree' | 'annulee';
  methodePaiement: string;
  note?: string;
  noteAdmin?: string;
  total?: number;
  createdAt: string;
  User?: { id: string; nom: string; prenom: string; email: string };
  Adresse?: { rue: string; ville: string; pays: string };
  CommandeItems?: OrderItem[];
  Paiement?: { statut: string; montant: number };
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  statut?: string;
  search?: string;
}

const extract = (res: any) => res?.data ?? res;

export const ordersApi = {
  getAll: (filters: OrderFilters = {}): Promise<{ rows: Order[]; count: number; totalPages: number }> =>
    shopClient.get('/admin/commandes', { params: filters }).then(extract),

  getById: (id: string): Promise<Order> =>
    shopClient.get(`/admin/commandes/${id}`).then(extract),

  valider: (id: string): Promise<Order> =>
    shopClient.patch(`/admin/commandes/${id}/valider`).then(extract),

  rejeter: (id: string): Promise<Order> =>
    shopClient.patch(`/admin/commandes/${id}/rejeter`).then(extract),

  preparation: (id: string): Promise<Order> =>
    shopClient.patch(`/admin/commandes/${id}/preparation`).then(extract),

  expedier: (id: string): Promise<Order> =>
    shopClient.patch(`/admin/commandes/${id}/expedier`).then(extract),

  livrer: (id: string): Promise<Order> =>
    shopClient.patch(`/admin/commandes/${id}/livrer`).then(extract),
};
