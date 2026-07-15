import shipmentClient from '@/infrastructure/http/shipment.client';

export const getStats = (): Promise<any> =>
  shipmentClient.get('/admin/dashboard/stats');

export const getColisParStatut = (): Promise<any> =>
  shipmentClient.get('/admin/dashboard/colis-par-statut');

export const getRevenusParMois = (annee?: number): Promise<any> =>
  shipmentClient.get('/admin/dashboard/revenus', { params: annee ? { annee } : {} });
