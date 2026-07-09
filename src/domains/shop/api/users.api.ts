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
    shopClient.get('/v1/admin/users', { params: filters }),

  getById: (id: string): Promise<any> =>
    shopClient.get(`/v1/admin/users/${id}`),

  toggleActivation: (id: string): Promise<any> =>
    shopClient.patch(`/v1/admin/users/${id}/toggle`),
};
