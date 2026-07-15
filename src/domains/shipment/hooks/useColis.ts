import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getColis, updateStatutColis, refuserColis, ColisParams } from '@/domains/shipment/api/colis.api';

export const useColis = (params?: ColisParams) =>
  useQuery({
    queryKey: ['shipment-colis', params],
    queryFn: () => getColis(params),
    staleTime: 30_000,
    retry: 1,
  });

export const useUpdateStatutColis = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statut, localisation, description }: { id: string; statut: string; localisation?: string; description?: string }) =>
      updateStatutColis(id, { statut, localisation, description }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shipment-colis'] }),
  });
};

export const useRefuserColis = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, raison }: { id: string; raison: string }) => refuserColis(id, raison),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shipment-colis'] }),
  });
};
