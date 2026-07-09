import shopClient from '@/infrastructure/http/shop.client';

export const bannièresApi = {
  getAll: (): Promise<any> =>
    shopClient.get('/v1/admin/bannieres'),

  create: (data: FormData): Promise<any> =>
    shopClient.post('/v1/admin/bannieres', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, data: FormData | Record<string, any>): Promise<any> =>
    shopClient.put(`/v1/admin/bannieres/${id}`, data,
      data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    ),

  delete: (id: string): Promise<any> =>
    shopClient.delete(`/v1/admin/bannieres/${id}`),

  toggleActive: (id: string): Promise<any> =>
    shopClient.patch(`/v1/admin/bannieres/${id}/toggle`),
};
