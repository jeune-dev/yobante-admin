import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, PaymentFilters } from '@/domains/shop/api/payments.api';

const KEY = 'shop-payments';

export const usePayments = (filters: PaymentFilters = {}) =>
  useQuery({
    queryKey: [KEY, filters],
    queryFn: () => paymentsApi.getAll(filters),
    staleTime: 30_000,
  });

export const useRembourser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentsApi.rembourser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};
