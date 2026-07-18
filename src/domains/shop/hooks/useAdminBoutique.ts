// domains/shop/hooks/useAdminBoutique.ts
// Hooks React Query pour l'espace Admin Boutique (wired sur /api/v1/admin/*).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as api from '@/domains/shop/api/admin.api';

// Clés de cache
export const boutiqueKeys = {
  stats: ['boutique', 'stats'] as const,
  produits: (params?: unknown) => ['boutique', 'produits', params] as const,
  produitsAValider: ['boutique', 'produits', 'a-valider'] as const,
  commandes: (params?: unknown) => ['boutique', 'commandes', params] as const,
  clients: (params?: unknown) => ['boutique', 'clients', params] as const,
  admins: ['boutique', 'admins'] as const,
  vendeurs: ['boutique', 'vendeurs'] as const,
  bannieres: ['boutique', 'bannieres'] as const,
  promotions: ['boutique', 'promotions'] as const,
  promotionsSections: ['boutique', 'promotions', 'sections'] as const,
  blocsPromo: ['boutique', 'blocs-promo'] as const,
  categories: ['boutique', 'categories'] as const,
};

// ─── Dashboard ────────────────────────────────────────────────
export const useDashboardStats = () =>
  useQuery({ queryKey: boutiqueKeys.stats, queryFn: api.getDashboardStats });

// ─── Produits ─────────────────────────────────────────────────
export const useProduits = (params?: Record<string, any>) =>
  useQuery({
    queryKey: boutiqueKeys.produits(params),
    queryFn: () => api.listerProduits(params),
  });

export const useCreerProduit = () => {
  const invalidate = useInvalidate([boutiqueKeys.produits(), boutiqueKeys.stats]);
  return useMutation({
    mutationFn: (data: FormData) => api.creerProduit(data),
    onSuccess: () => {
      toast.success('Produit créé');
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message || 'Erreur'),
  });
};

export const useModifierProduit = () => {
  const invalidate = useInvalidate([boutiqueKeys.produits()]);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => api.modifierProduit(id, data),
    onSuccess: () => {
      toast.success('Produit mis à jour');
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message || 'Erreur'),
  });
};

export const useCreerCategorie = () => {
  const invalidate = useInvalidate([boutiqueKeys.categories]);
  return useMutation({
    mutationFn: (data: FormData) => api.creerCategorie(data),
    onSuccess: () => {
      toast.success('Catégorie créée');
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message || 'Erreur'),
  });
};

// ─── Demandes de publication (produits à valider) ─────────────
export const useProduitsAValider = () =>
  useQuery({ queryKey: boutiqueKeys.produitsAValider, queryFn: api.listerProduitsAValider });

const useInvalidate = (keys: readonly (readonly unknown[])[]) => {
  const qc = useQueryClient();
  return () => keys.forEach((k) => qc.invalidateQueries({ queryKey: k as unknown[] }));
};

export const useValiderProduit = () => {
  const invalidate = useInvalidate([boutiqueKeys.produitsAValider, boutiqueKeys.stats]);
  return useMutation({
    mutationFn: ({ id, step }: { id: string; step: 1 | 2 }) =>
      step === 1 ? api.validerProduitStep1(id) : api.validerProduitStep2(id),
    onSuccess: () => {
      toast.success('Produit validé');
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message || 'Erreur de validation'),
  });
};

export const useRejeterProduit = () => {
  const invalidate = useInvalidate([boutiqueKeys.produitsAValider]);
  return useMutation({
    mutationFn: ({ id, motif }: { id: string; motif?: string }) => api.rejeterProduit(id, motif),
    onSuccess: () => {
      toast.success('Produit rejeté');
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message || 'Erreur'),
  });
};

// ─── Commandes ────────────────────────────────────────────────
export const useCommandes = (params?: Record<string, any>) =>
  useQuery({
    queryKey: boutiqueKeys.commandes(params),
    queryFn: () => api.listerCommandes(params),
  });

// ─── Clients ──────────────────────────────────────────────────
export const useClients = (params?: Record<string, any>) =>
  useQuery({
    queryKey: boutiqueKeys.clients(params),
    queryFn: () => api.listerClients(params),
  });

export const useToggleClient = () => {
  const invalidate = useInvalidate([boutiqueKeys.clients()]);
  return useMutation({
    mutationFn: ({ id, actif }: { id: string; actif: boolean }) =>
      actif ? api.desactiverClient(id) : api.activerClient(id),
    onSuccess: () => {
      toast.success('Statut client mis à jour');
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message || 'Erreur'),
  });
};

// ─── Admins ───────────────────────────────────────────────────
export const useAdmins = () =>
  useQuery({ queryKey: boutiqueKeys.admins, queryFn: () => api.listerAdmins() });

export const useCreerAdmin = () => {
  const invalidate = useInvalidate([boutiqueKeys.admins]);
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.creerAdmin(data),
    onSuccess: () => {
      toast.success('Administrateur créé');
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message || 'Erreur'),
  });
};

export const useSupprimerAdmin = () => {
  const invalidate = useInvalidate([boutiqueKeys.admins]);
  return useMutation({
    mutationFn: (id: string) => api.supprimerAdmin(id),
    onSuccess: () => {
      toast.success('Administrateur supprimé');
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message || 'Erreur'),
  });
};

export const useToggleAdmin = () => {
  const invalidate = useInvalidate([boutiqueKeys.admins]);
  return useMutation({
    mutationFn: (id: string) => api.toggleAdmin(id),
    onSuccess: () => invalidate(),
    onError: (e: any) => toast.error(e?.message || 'Erreur'),
  });
};

// ─── Vendeurs ─────────────────────────────────────────────────
export const useVendeurs = () =>
  useQuery({ queryKey: boutiqueKeys.vendeurs, queryFn: () => api.listerVendeurs() });

export const useCreerVendeur = () => {
  const invalidate = useInvalidate([boutiqueKeys.vendeurs]);
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.creerVendeur(data),
    onSuccess: () => {
      toast.success('Compte vendeur créé');
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message || 'Erreur'),
  });
};

export const useValiderVendeur = () => {
  const invalidate = useInvalidate([boutiqueKeys.vendeurs]);
  return useMutation({
    mutationFn: ({ id, step }: { id: string; step: 1 | 2 }) =>
      step === 1 ? api.validerVendeurStep1(id) : api.validerVendeurStep2(id),
    onSuccess: () => {
      toast.success('Vendeur validé');
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message || 'Erreur'),
  });
};

export const useToggleVendeur = () => {
  const invalidate = useInvalidate([boutiqueKeys.vendeurs]);
  return useMutation({
    mutationFn: (id: string) => api.toggleVendeur(id),
    onSuccess: () => invalidate(),
    onError: (e: any) => toast.error(e?.message || 'Erreur'),
  });
};

// ─── Bannières ────────────────────────────────────────────────
export const useBannieres = () =>
  useQuery({ queryKey: boutiqueKeys.bannieres, queryFn: api.listerBannieres });

export const useSupprimerBanniere = () => {
  const invalidate = useInvalidate([boutiqueKeys.bannieres]);
  return useMutation({
    mutationFn: (id: string) => api.supprimerBanniere(id),
    onSuccess: () => {
      toast.success('Bannière supprimée');
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message || 'Erreur'),
  });
};

export const useToggleBanniere = () => {
  const invalidate = useInvalidate([boutiqueKeys.bannieres]);
  return useMutation({
    mutationFn: (id: string) => api.toggleBanniere(id),
    onSuccess: () => invalidate(),
    onError: (e: any) => toast.error(e?.message || 'Erreur'),
  });
};

// ─── Promotions ───────────────────────────────────────────────
export const usePromotions = () =>
  useQuery({ queryKey: boutiqueKeys.promotions, queryFn: () => api.listerPromotions() });

// Promotions regroupées par section (les 3 blocs de l'app mobile)
export const usePromotionsParSection = () =>
  useQuery({ queryKey: boutiqueKeys.promotionsSections, queryFn: api.getPromotionsParSection });

const PROMO_KEYS = [boutiqueKeys.promotions, boutiqueKeys.promotionsSections];

export const useCreerPromotion = () => {
  const invalidate = useInvalidate(PROMO_KEYS);
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.creerPromotion(data),
    onSuccess: () => {
      toast.success('Produit ajouté au bloc');
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message || 'Erreur'),
  });
};

export const useModifierPromotion = () => {
  const invalidate = useInvalidate(PROMO_KEYS);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      api.modifierPromotion(id, data),
    onSuccess: () => {
      toast.success('Promotion mise à jour');
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message || 'Erreur'),
  });
};

export const useSupprimerPromotion = () => {
  const invalidate = useInvalidate(PROMO_KEYS);
  return useMutation({
    mutationFn: (id: string) => api.supprimerPromotion(id),
    onSuccess: () => {
      toast.success('Promotion retirée du bloc');
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message || 'Erreur'),
  });
};

export const useTogglePromotion = () => {
  const invalidate = useInvalidate(PROMO_KEYS);
  return useMutation({
    mutationFn: (id: string) => api.togglePromotion(id),
    onSuccess: () => invalidate(),
    onError: (e: any) => toast.error(e?.message || 'Erreur'),
  });
};

// ─── Blocs promo (image + titre par section) ──────────────────
export const useBlocsPromo = () =>
  useQuery({ queryKey: boutiqueKeys.blocsPromo, queryFn: api.listerBlocsPromo });

export const useUpdateBlocPromo = () => {
  const invalidate = useInvalidate([boutiqueKeys.blocsPromo]);
  return useMutation({
    mutationFn: ({ section, data }: { section: string; data: FormData }) =>
      api.updateBlocPromo(section, data),
    onSuccess: () => {
      toast.success('Bloc mis à jour');
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message || 'Erreur'),
  });
};

// ─── Catégories ───────────────────────────────────────────────
export const useCategories = () =>
  useQuery({ queryKey: boutiqueKeys.categories, queryFn: api.listerCategories });
