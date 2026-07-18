import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi, ReviewFilters } from '@/domains/shop/api/reviews.api';

const KEY = 'shop-reviews';

export const useReviews = (filters: ReviewFilters = {}) =>
  useQuery({
    queryKey: [KEY, filters],
    queryFn: () => reviewsApi.getAll(filters),
    staleTime: 30_000,
  });

export const useToggleApprove = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewsApi.approuver(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useDeleteReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};
