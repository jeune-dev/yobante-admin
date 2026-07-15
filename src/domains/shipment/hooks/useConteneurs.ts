import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConteneurs, createConteneur, updateStatutConteneur } from '@/domains/shipment/api/conteneurs.api';

export const useConteneurs = (params?: { page?: number; limit?: number; statut?: string }) =>
  useQuery({
    queryKey: ['shipment-conteneurs', params],
    queryFn: () => getConteneurs(params),
    staleTime: 30_000,
    retry: 1,
  });

export const useCreateConteneur = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createConteneur,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shipment-conteneurs'] }),
  });
};

export const useUpdateStatutConteneur = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: string }) => updateStatutConteneur(id, statut),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shipment-conteneurs'] }),
  });
};
