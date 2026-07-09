import shopClient from '@/infrastructure/http/shop.client';

export const categoriesApi = {
  getAll: (): Promise<any> =>
    shopClient.get('/v1/admin/categories'),

  getById: (id: string): Promise<any> =>
    shopClient.get(`/v1/admin/categories/${id}`),

  create: (data: FormData | Record<string, any>): Promise<any> =>
    shopClient.post('/v1/admin/categories', data,
      data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    ),

  update: (id: string, data: FormData | Record<string, any>): Promise<any> =>
    shopClient.put(`/v1/admin/categories/${id}`, data,
      data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    ),

  delete: (id: string): Promise<any> =>
    shopClient.delete(`/v1/admin/categories/${id}`),
};
