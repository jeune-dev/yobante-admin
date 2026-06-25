import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, OrderFilters } from '@/domains/shop/api/orders.api';

const KEY = 'shop-orders';

export const useOrders = (filters: OrderFilters = {}) =>
  useQuery({
    queryKey: [KEY, filters],
    queryFn: () => ordersApi.getAll(filters),
    staleTime: 30_000,
  });

export const useOrder = (id: string) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn: () => ordersApi.getById(id),
    enabled: !!id,
  });

const makeStatutMutation = (fn: (id: string) => Promise<any>) => () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fn(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useValiderCommande = makeStatutMutation(ordersApi.valider);
export const useRejeterCommande = makeStatutMutation(ordersApi.rejeter);
export const usePreparationCommande = makeStatutMutation(ordersApi.preparation);
export const useExpedierCommande = makeStatutMutation(ordersApi.expedier);
export const useLivrerCommande = makeStatutMutation(ordersApi.livrer);
