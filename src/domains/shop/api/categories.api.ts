import shopClient from '@/infrastructure/http/shop.client';

export interface Category {
  id: number;
  nom: string;
  description?: string;
  parentId?: number;
}

const extract = (res: any) => res?.data ?? res;
const extractList = (res: any) => {
  const d = res?.data ?? res;
  return Array.isArray(d) ? d : (d?.rows ?? []);
};

export const categoriesApi = {
  getAll: (): Promise<Category[]> =>
    shopClient.get('/admin/categories?limit=100').then(extractList),

  create: (data: { nom: string; description?: string; parentId?: number }): Promise<Category> =>
    shopClient.post('/admin/categories', data).then(extract),

  update: (id: number, data: { nom: string; description?: string }): Promise<Category> =>
    shopClient.put(`/admin/categories/${id}`, data).then(extract),

  remove: (id: number): Promise<void> =>
    shopClient.delete(`/admin/categories/${id}`).then(extract),
};
