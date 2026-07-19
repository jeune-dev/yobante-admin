import shopClient from '@/infrastructure/http/shop.client';

/**
 * Rayons et sous-rayons — le rangement du catalogue.
 *
 * Un produit est obligatoirement classé dans un rayon puis dans l'un de ses
 * sous-rayons : c'est ce qui détermine sa place dans la navigation mobile.
 */
export interface SousRayon {
  id: string;
  nom: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  rayonId: string;
}

export interface Rayon {
  id: string;
  nom: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sousRayons?: SousRayon[];
}

export const rayonsApi = {
  getAll: (): Promise<any> => shopClient.get('/admin/rayons'),

  getById: (id: string): Promise<any> => shopClient.get(`/admin/rayons/${id}`),

  create: (data: Partial<Rayon>): Promise<any> => shopClient.post('/admin/rayons', data),

  update: (id: string, data: Partial<Rayon>): Promise<any> =>
    shopClient.put(`/admin/rayons/${id}`, data),

  archiver: (id: string): Promise<any> => shopClient.patch(`/admin/rayons/${id}/archiver`),

  /** Sous-rayons d'un rayon donné — alimente le second sélecteur du formulaire produit. */
  getSousRayons: (rayonId: string): Promise<any> =>
    shopClient.get(`/admin/rayons/${rayonId}/sous-rayons`),

  createSousRayon: (rayonId: string, data: Partial<SousRayon>): Promise<any> =>
    shopClient.post(`/admin/rayons/${rayonId}/sous-rayons`, data),

  updateSousRayon: (id: string, data: Partial<SousRayon>): Promise<any> =>
    shopClient.put(`/admin/rayons/sous-rayons/${id}`, data),

  archiverSousRayon: (id: string): Promise<any> =>
    shopClient.patch(`/admin/rayons/sous-rayons/${id}/archiver`),
};
