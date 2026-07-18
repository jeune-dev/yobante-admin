import shopClient from '@/infrastructure/http/shop.client';
import type { SectionPromotion } from '../types';

/**
 * Blocs promotionnels — les « sous-sections » de l'accueil client.
 *
 * Une section (nos promos du moment, à ne pas rater, promos à venir) peut en
 * porter plusieurs, affichées dans l'ordre défini ici.
 */
export interface BlocPromo {
  id: string;
  section: SectionPromotion;
  titre: string | null;
  sousTitre: string | null;
  image: string | null;
  isActive: boolean;
  ordre: number;
}

/** Les champs texte et l'image voyagent ensemble en multipart. */
const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const blocsPromoApi = {
  /** Renvoie la liste brute et le regroupement par section. */
  getAll: (): Promise<any> => shopClient.get('/admin/blocs-promo'),

  getById: (id: string): Promise<any> => shopClient.get(`/admin/blocs-promo/${id}`),

  create: (data: FormData): Promise<any> =>
    shopClient.post('/admin/blocs-promo', data, multipart),

  update: (id: string, data: FormData): Promise<any> =>
    shopClient.put(`/admin/blocs-promo/${id}`, data, multipart),

  delete: (id: string): Promise<any> => shopClient.delete(`/admin/blocs-promo/${id}`),

  toggleActive: (id: string): Promise<any> =>
    shopClient.patch(`/admin/blocs-promo/${id}/toggle`),

  reordonner: (elements: { id: string; ordre: number }[]): Promise<any> =>
    shopClient.post('/admin/blocs-promo/reordonner', { elements }),
};
