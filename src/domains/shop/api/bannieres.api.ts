import shopClient from '@/infrastructure/http/shop.client';

export const bannièresApi = {
  getAll: (): Promise<any> =>
    shopClient.get('/admin/bannieres'),

  create: (data: FormData): Promise<any> =>
    shopClient.post('/admin/bannieres', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, data: FormData | Record<string, any>): Promise<any> =>
    shopClient.put(`/admin/bannieres/${id}`, data,
      data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    ),

  delete: (id: string): Promise<any> =>
    shopClient.delete(`/admin/bannieres/${id}`),

  toggleActive: (id: string): Promise<any> =>
    shopClient.patch(`/admin/bannieres/${id}/toggle`),
};
