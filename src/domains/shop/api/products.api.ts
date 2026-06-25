import shopClient from '@/infrastructure/http/shop.client';

export interface Product {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  prix: number;
  prixPromo?: number;
  stock: number;
  categorieId: number;
  images?: string[];
  isActive: boolean;
  isFeatured: boolean;
  poids?: number;
  reference?: string;
  Categorie?: { id: number; nom: string };
  createdAt: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categorieId?: number;
  isActive?: boolean;
}

const extract = (res: any) => res?.data ?? res;

export const productsApi = {
  getAll: (filters: ProductFilters = {}): Promise<{ rows: Product[]; count: number; totalPages: number }> =>
    shopClient.get('/admin/produits', { params: filters }).then(extract),

  getById: (id: number): Promise<Product> =>
    shopClient.get(`/admin/produits/${id}`).then(extract),

  create: (data: FormData): Promise<Product> =>
    shopClient.post('/admin/produits', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(extract),

  update: (id: number, data: FormData): Promise<Product> =>
    shopClient.put(`/admin/produits/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(extract),

  remove: (id: number): Promise<void> =>
    shopClient.delete(`/admin/produits/${id}`).then(extract),

  updateStock: (id: number, quantite: number): Promise<Product> =>
    shopClient.patch(`/admin/produits/${id}/stock`, { quantite }).then(extract),

  toggleFeatured: (id: number): Promise<Product> =>
    shopClient.patch(`/admin/produits/${id}/featured`).then(extract),

  toggleVisibilite: (id: number): Promise<Product> =>
    shopClient.patch(`/admin/produits/${id}/visibilite`).then(extract),
};
