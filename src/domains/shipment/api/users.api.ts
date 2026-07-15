import shipmentClient from '@/infrastructure/http/shipment.client';

export interface UsersParams {
  page?: number;
  limit?: number;
  search?: string;
  statut?: string;
}

export const getClients = (params?: UsersParams): Promise<any> =>
  shipmentClient.get('/admin/clients', { params });

export const toggleClient = (id: string): Promise<any> =>
  shipmentClient.patch(`/admin/clients/${id}/toggle`);

export const getAdmins = (): Promise<any> =>
  shipmentClient.get('/admin/admins');

export const createAdmin = (data: { prenom: string; nom: string; email: string; password: string; telephone?: string; role?: string }): Promise<any> =>
  shipmentClient.post('/admin/admins', data);

export const toggleAdmin = (id: string): Promise<any> =>
  shipmentClient.patch(`/admin/admins/${id}/toggle`);

export const deleteAdmin = (id: string): Promise<any> =>
  shipmentClient.delete(`/admin/admins/${id}`);
