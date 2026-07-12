import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/domains/shop/api/dashboard.api';

export const useDashboard = () => {
  const stats = useQuery({
    queryKey: ['shop', 'dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
    staleTime: 60_000,
  });

  const revenus = useQuery({
    queryKey: ['shop', 'dashboard', 'revenus'],
    queryFn: () => dashboardApi.getRevenus(),
    staleTime: 60_000,
  });

  const topProduits = useQuery({
    queryKey: ['shop', 'dashboard', 'top-produits'],
    queryFn: () => dashboardApi.getTopProduits(5),
    staleTime: 60_000,
  });

  const stockAlertes = useQuery({
    queryKey: ['shop', 'dashboard', 'stock-alertes'],
    queryFn: () => dashboardApi.getStockAlertes(5),
    staleTime: 60_000,
  });

  return { stats, revenus, topProduits, stockAlertes };
};
