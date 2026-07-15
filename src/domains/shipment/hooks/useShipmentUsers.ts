import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClients, toggleClient,
  getAdmins, createAdmin, toggleAdmin, deleteAdmin,
  UsersParams,
} from '@/domains/shipment/api/users.api';

export const useShipmentClients = (params?: UsersParams) =>
  useQuery({
    queryKey: ['shipment-clients', params],
    queryFn: () => getClients(params),
    staleTime: 30_000,
    retry: 1,
  });

export const useToggleShipmentClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleClient(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shipment-clients'] }),
  });
};

export const useShipmentAdmins = () =>
  useQuery({ queryKey: ['shipment-admins'], queryFn: getAdmins, staleTime: 30_000, retry: 1 });

export const useCreateShipmentAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdmin,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shipment-admins'] }),
  });
};

export const useToggleShipmentAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleAdmin(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shipment-admins'] }),
  });
};

export const useDeleteShipmentAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdmin(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shipment-admins'] }),
  });
};
