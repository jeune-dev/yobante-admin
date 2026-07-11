import shopClient from '@/infrastructure/http/shop.client';

export const categoriesApi = {
  getAll: (): Promise<any> =>
    shopClient.get('/admin/categories'),

  getById: (id: string): Promise<any> =>
    shopClient.get(`/admin/categories/${id}`),

  create: (data: FormData | Record<string, any>): Promise<any> =>
    shopClient.post('/admin/categories', data,
      data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    ),

  update: (id: string, data: FormData | Record<string, any>): Promise<any> =>
    shopClient.put(`/admin/categories/${id}`, data,
      data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    ),

  delete: (id: string): Promise<any> =>
    shopClient.delete(`/admin/categories/${id}`),
};
