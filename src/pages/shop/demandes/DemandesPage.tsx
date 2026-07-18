import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import shopClient from '@/infrastructure/http/shop.client';
import { toast } from 'react-toastify';

const api = {
  getDemandes: (p: any) =>
    shopClient
      .get('/admin/produits', { params: { ...p, statutValidation: 'en_attente' } })
      .then((r: any) => r.data),
  valider: (id: string) => shopClient.patch(`/admin/produits/${id}/valider`),
  rejeter: (id: string, motif: string) =>
    shopClient.patch(`/admin/produits/${id}/rejeter`, { motif }),
};

export default function DemandesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [motifModal, setMotifModal] = useState<{ id: string; nom: string } | null>(null);
  const [motif, setMotif] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['demandes', search, page],
    queryFn: () => api.getDemandes({ search, page, limit: 20 }),
  });

  const validerMutation = useMutation({
    mutationFn: (id: string) => api.valider(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['demandes'] });
      toast.success('Produit validé');
    },
    onError: () => toast.error('Erreur'),
  });

  const rejeterMutation = useMutation({
    mutationFn: ({ id, motif }: { id: string; motif: string }) => api.rejeter(id, motif),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['demandes'] });
      setMotifModal(null);
      setMotif('');
      toast.success('Produit rejeté');
    },
    onError: () => toast.error('Erreur'),
  });

  const produits = data?.produits || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandes de publication</h1>
          <p className="text-sm text-gray-500 mt-1">Produits en attente de validation</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher un produit…"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          />
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Chargement…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="p-4 font-medium text-gray-500">Produit</th>
                  <th className="p-4 font-medium text-gray-500">Vendeur</th>
                  <th className="p-4 font-medium text-gray-500">Prix</th>
                  <th className="p-4 font-medium text-gray-500">Date soumission</th>
                  <th className="p-4 font-medium text-gray-500 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {produits.map((p: any) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            className="w-10 h-10 rounded-lg object-cover"
                            alt=""
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100" />
                        )}
                        <span className="font-medium">{p.nom}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {p.vendeur?.nomBoutique || p.vendeur?.nom || '—'}
                    </td>
                    <td className="p-4">{p.prix?.toLocaleString('fr-FR')} FCFA</td>
                    <td className="p-4 text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => validerMutation.mutate(p.id)}
                          disabled={validerMutation.isPending}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 disabled:opacity-60"
                        >
                          Valider
                        </button>
                        <button
                          onClick={() => {
                            setMotifModal({ id: p.id, nom: p.nom });
                            setMotif('');
                          }}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600"
                        >
                          Rejeter
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {produits.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      Aucune demande en attente
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {pagination?.totalPages > 1 && (
          <div className="flex justify-center p-4 gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded text-sm ${
                  page === p ? 'bg-yellow-500 text-white' : 'hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal motif rejet */}
      {motifModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setMotifModal(null)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-1">Rejeter le produit</h2>
            <p className="text-sm text-gray-500 mb-4">{motifModal.nom}</p>
            <div>
              <label className="text-sm font-medium text-gray-700">Motif du rejet</label>
              <textarea
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                rows={3}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                placeholder="Expliquer la raison du rejet…"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setMotifModal(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={() => rejeterMutation.mutate({ id: motifModal.id, motif })}
                disabled={rejeterMutation.isPending}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60"
              >
                {rejeterMutation.isPending ? 'Rejet…' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
