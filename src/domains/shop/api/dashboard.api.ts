import shopClient from '@/infrastructure/http/shop.client';

export interface ShopStats {
  totalUsers: number;
  totalCommandes: number;
  totalSales: number;
  totalProduits: number;
  totalAvis: number;
}

export interface MonthlyRevenue {
  month: string;
  total: number;
}

export interface TopProduct {
  produit: {
    id: number;
    nom: string;
    prix: number;
    image?: string;
  };
  quantite: number;
}

export interface StockAlert {
  id: number;
  nom: string;
  stock: number;
  prix: number;
  image?: string;
}

const extract = (res: any) => res?.data ?? res;

export const dashboardApi = {
  getStats: (): Promise<ShopStats> =>
    shopClient.get('/admin/dashboard/stats').then(extract),

  getRevenus: (): Promise<MonthlyRevenue[]> =>
    shopClient.get('/admin/dashboard/revenus').then(extract),

  getTopProduits: (limit = 5): Promise<TopProduct[]> =>
    shopClient.get(`/admin/dashboard/top-produits?limit=${limit}`).then(extract),

  getStockAlertes: (threshold = 5): Promise<StockAlert[]> =>
    shopClient.get(`/admin/dashboard/stock-alertes?threshold=${threshold}`).then(extract),
};
