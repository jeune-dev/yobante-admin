import shopClient from '@/infrastructure/http/shop.client';

export const fraisLivraisonApi = {
  getAll: (): Promise<any> =>
    shopClient.get('/v1/admin/frais-livraison'),

  create: (data: { ville: string; montant: number }): Promise<any> =>
    shopClient.post('/v1/admin/frais-livraison', data),

  update: (id: string, data: { ville?: string; montant?: number }): Promise<any> =>
    shopClient.put(`/v1/admin/frais-livraison/${id}`, data),

  delete: (id: string): Promise<any> =>
    shopClient.delete(`/v1/admin/frais-livraison/${id}`),

  toggleActive: (id: string): Promise<any> =>
    shopClient.patch(`/v1/admin/frais-livraison/${id}/toggle`),
};
