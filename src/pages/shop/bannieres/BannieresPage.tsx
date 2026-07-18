import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import shopClient from '@/infrastructure/http/shop.client';
import { toast } from 'react-toastify';

const api = {
  getBannieres: () => shopClient.get('/admin/bannieres').then((r: any) => r.data),
  creerBanniere: (data: FormData) => shopClient.post('/admin/bannieres', data),
  modifierBanniere: (id: string, data: FormData) => shopClient.put(`/admin/bannieres/${id}`, data),
  supprimerBanniere: (id: string) => shopClient.delete(`/admin/bannieres/${id}`),
  associerProduit: (id: string, produitId: string) =>
    shopClient.post(`/admin/bannieres/${id}/produits`, { produitId }),
  searchProduits: (search: string) =>
    shopClient
      .get('/admin/produits', { params: { search, limit: 10 } })
      .then((r: any) => r.data?.produits || []),
};

export default function BannieresPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [titre, setTitre] = useState('');
  const [lien, setLien] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchProduit, setSearchProduit] = useState('');
  const [produitResults, setProduitResults] = useState<any[]>([]);
  const [assocBanniere, setAssocBanniere] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['bannieres'],
    queryFn: api.getBannieres,
  });

  const creerMutation = useMutation({
    mutationFn: (fd: FormData) => api.creerBanniere(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bannieres'] });
      setShowModal(false);
      toast.success('Bannière créée');
    },
    onError: () => toast.error('Erreur'),
  });

  const modifierMutation = useMutation({
    mutationFn: ({ id, fd }: any) => api.modifierBanniere(id, fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bannieres'] });
      setShowModal(false);
      toast.success('Bannière modifiée');
    },
  });

  const supprimerMutation = useMutation({
    mutationFn: (id: string) => api.supprimerBanniere(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bannieres'] });
      toast.success('Bannière supprimée');
    },
  });

  const associerMutation = useMutation({
    mutationFn: ({ id, produitId }: any) => api.associerProduit(id, produitId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bannieres'] });
      setProduitResults([]);
      setSearchProduit('');
      toast.success('Produit associé');
    },
  });

  const bannieres = data?.bannieres || [];

  const openCreate = () => {
    setEditItem(null);
    setTitre('');
    setLien('');
    setImageFile(null);
    setShowModal(true);
  };

  const openEdit = (b: any) => {
    setEditItem(b);
    setTitre(b.titre || '');
    setLien(b.lien || '');
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('titre', titre);
    if (lien) fd.append('lien', lien);
    if (imageFile) fd.append('image', imageFile);
    if (editItem) modifierMutation.mutate({ id: editItem.id, fd });
    else creerMutation.mutate(fd);
  };

  const handleSearch = async () => {
    if (!searchProduit.trim()) return;
    setSearchLoading(true);
    try {
      const results = await api.searchProduits(searchProduit);
      setProduitResults(results);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bannières principales</h1>
        <button
          onClick={openCreate}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600"
        >
          + Nouvelle bannière
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-400">Chargement…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bannieres.map((b: any) => (
            <div
              key={b.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {b.image ? (
                <img src={b.image} alt={b.titre} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                  Aucune image
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{b.titre || 'Sans titre'}</h3>
                {b.lien && (
                  <p className="text-xs text-gray-400 truncate mt-1">{b.lien}</p>
                )}

                {/* Associer produit */}
                {assocBanniere?.id === b.id ? (
                  <div className="mt-3">
                    <div className="flex gap-2">
                      <input
                        value={searchProduit}
                        onChange={(e) => setSearchProduit(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Rechercher produit…"
                        className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-yellow-300"
                      />
                      <button
                        onClick={handleSearch}
                        disabled={searchLoading}
                        className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                      >
                        {searchLoading ? '…' : 'OK'}
                      </button>
                    </div>
                    {produitResults.length > 0 && (
                      <div className="mt-1 border border-gray-200 rounded max-h-32 overflow-y-auto">
                        {produitResults.map((p: any) => (
                          <button
                            key={p.id}
                            onClick={() => associerMutation.mutate({ id: b.id, produitId: p.id })}
                            className="w-full text-left px-2 py-1.5 text-xs hover:bg-yellow-50 border-b border-gray-50 last:border-0"
                          >
                            {p.nom}
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setAssocBanniere(null);
                        setProduitResults([]);
                        setSearchProduit('');
                      }}
                      className="mt-1 text-xs text-gray-400 hover:text-gray-600"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAssocBanniere(b);
                      setProduitResults([]);
                      setSearchProduit('');
                    }}
                    className="mt-3 text-xs text-blue-600 hover:text-blue-700"
                  >
                    + Associer un produit
                  </button>
                )}

                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openEdit(b)}
                    className="p-1.5 hover:bg-yellow-50 rounded text-gray-500 hover:text-yellow-600"
                    title="Modifier"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Supprimer cette bannière ?')) supprimerMutation.mutate(b.id);
                    }}
                    className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-500"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {bannieres.length === 0 && (
            <div className="col-span-3 p-8 text-center text-gray-400">
              Aucune bannière
            </div>
          )}
        </div>
      )}

      {/* Modal Bannière */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">
              {editItem ? 'Modifier la bannière' : 'Nouvelle bannière'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Titre *</label>
                <input
                  required
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Lien (optionnel)</label>
                <input
                  value={lien}
                  onChange={(e) => setLien(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  placeholder="https://…"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Image {editItem ? "(vide = garder l'actuelle)" : '*'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  required={!editItem}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creerMutation.isPending || modifierMutation.isPending}
                  className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-60"
                >
                  {editItem ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
