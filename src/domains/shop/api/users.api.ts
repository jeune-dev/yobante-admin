import shopClient from '@/infrastructure/http/shop.client';

export interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const usersApi = {
  getAll: (filters?: UserFilters): Promise<any> =>
    shopClient.get('/admin/users', { params: filters }),

  getById: (id: string): Promise<any> =>
    shopClient.get(`/admin/users/${id}`),

  toggleActivation: (id: string): Promise<any> =>
    shopClient.patch(`/admin/users/${id}/toggle`),
};
