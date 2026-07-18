import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, UserFilters } from '@/domains/shop/api/users.api';

const KEY = 'shop-users';

export const useUsers = (filters: UserFilters = {}) =>
  useQuery({
    queryKey: [KEY, filters],
    queryFn: () => usersApi.getAll(filters),
    staleTime: 30_000,
  });

export const useToggleUserActive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? usersApi.bloquer(id) : usersApi.activer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

// Pas de suppression de client : le backend n'expose aucune route pour cela,
// et supprimer un compte porteur de commandes casserait leur historique.
// La désactivation ci-dessus est l'opération prévue.
