import shopClient from '@/infrastructure/http/shop.client';

export interface ShopUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

const extract = (res: any) => res?.data ?? res;

export const usersApi = {
  getAll: (filters: UserFilters = {}): Promise<{ rows: ShopUser[]; count: number; totalPages: number }> =>
    shopClient.get('/admin/users', { params: filters }).then(extract),

  getById: (id: string): Promise<ShopUser> =>
    shopClient.get(`/admin/users/${id}`).then(extract),

  bloquer: (id: string): Promise<ShopUser> =>
    shopClient.patch(`/admin/users/${id}/bloquer`).then(extract),

  activer: (id: string): Promise<ShopUser> =>
    shopClient.patch(`/admin/users/${id}/activer`).then(extract),

  remove: (id: string): Promise<void> =>
    shopClient.delete(`/admin/users/${id}`).then(extract),
};
