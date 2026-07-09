import shopClient from '@/infrastructure/http/shop.client';
import type { ShopStats, KpiStocks, TopProduit, ClientActif } from '../types';

export const dashboardApi = {
  getStats: (): Promise<{ data: { stats: ShopStats } }> =>
    shopClient.get('/v1/admin/dashboard/stats'),

  getKpiStocks: (): Promise<{ data: { kpi: KpiStocks } }> =>
    shopClient.get('/v1/admin/dashboard/kpi-stocks'),

  getTopProduits: (limit = 5): Promise<{ data: { produits: TopProduit[] } }> =>
    shopClient.get('/v1/admin/dashboard/top-produits', { params: { limit } }),

  getClientsActifs: (limit = 5): Promise<{ data: { clients: ClientActif[] } }> =>
    shopClient.get('/v1/admin/dashboard/clients-actifs', { params: { limit } }),
};
