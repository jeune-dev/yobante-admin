import shipmentClient from '@/infrastructure/http/shipment.client';

export interface ColisParams {
  page?: number;
  limit?: number;
  statut?: string;
  direction?: string;
  search?: string;
}

export const getColis = (params?: ColisParams): Promise<any> =>
  shipmentClient.get('/admin/colis', { params });

export const getColisById = (id: string): Promise<any> =>
  shipmentClient.get(`/admin/colis/${id}`);

export const updateStatutColis = (id: string, payload: { statut: string; localisation?: string; description?: string }): Promise<any> =>
  shipmentClient.patch(`/admin/colis/${id}/statut`, payload);

export const refuserColis = (id: string, raison: string): Promise<any> =>
  shipmentClient.patch(`/admin/colis/${id}/refuser`, { raison });
