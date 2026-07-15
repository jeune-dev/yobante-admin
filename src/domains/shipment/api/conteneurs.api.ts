import shipmentClient from '@/infrastructure/http/shipment.client';

export const getConteneurs = (params?: { page?: number; limit?: number; statut?: string }): Promise<any> =>
  shipmentClient.get('/admin/conteneurs', { params });

export const createConteneur = (data: { numero: string; statut?: string; dateDepart?: string; dateArrivee?: string; direction?: string }): Promise<any> =>
  shipmentClient.post('/admin/conteneurs', data);

export const updateStatutConteneur = (id: string, statut: string): Promise<any> =>
  shipmentClient.patch(`/admin/conteneurs/${id}/statut`, { statut });
