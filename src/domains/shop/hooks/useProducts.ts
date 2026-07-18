import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, ProductFilters } from '@/domains/shop/api/products.api';

const KEY = 'shop-products';

export const useProducts = (filters: ProductFilters = {}) =>
  useQuery({
    queryKey: [KEY, filters],
    queryFn: () => productsApi.getAll(filters),
    staleTime: 30_000,
  });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => productsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => productsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useToggleVisibilite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.toggleVisibilite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useToggleFeatured = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.toggleFeatured(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useUpdateStock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantite }: { id: string; quantite: number }) => productsApi.updateStock(id, quantite),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};
