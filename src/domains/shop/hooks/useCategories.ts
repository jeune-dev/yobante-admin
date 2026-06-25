import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/domains/shop/api/categories.api';

export const useCategories = () =>
  useQuery({
    queryKey: ['shop-categories'],
    queryFn: () => categoriesApi.getAll(),
    staleTime: 60_000,
  });
