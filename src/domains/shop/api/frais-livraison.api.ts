import shopClient from '@/infrastructure/http/shop.client';

export const fraisLivraisonApi = {
  getAll: (): Promise<any> =>
    shopClient.get('/admin/frais-livraison'),

  create: (data: { ville: string; montant: number }): Promise<any> =>
    shopClient.post('/admin/frais-livraison', data),

  update: (id: string, data: { ville?: string; montant?: number }): Promise<any> =>
    shopClient.put(`/admin/frais-livraison/${id}`, data),

  delete: (id: string): Promise<any> =>
    shopClient.delete(`/admin/frais-livraison/${id}`),

  toggleActive: (id: string): Promise<any> =>
    shopClient.patch(`/admin/frais-livraison/${id}/toggle`),
};
