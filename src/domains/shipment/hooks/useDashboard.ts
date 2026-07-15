import { useQuery } from '@tanstack/react-query';
import { getStats, getColisParStatut, getRevenusParMois } from '@/domains/shipment/api/dashboard.api';

export const useShipmentStats = () =>
  useQuery({ queryKey: ['shipment-stats'], queryFn: getStats, staleTime: 30_000, retry: 1 });

export const useColisParStatut = () =>
  useQuery({ queryKey: ['shipment-colis-par-statut'], queryFn: getColisParStatut, staleTime: 30_000, retry: 1 });

export const useShipmentRevenus = (annee?: number) =>
  useQuery({ queryKey: ['shipment-revenus', annee], queryFn: () => getRevenusParMois(annee), staleTime: 30_000, retry: 1 });
