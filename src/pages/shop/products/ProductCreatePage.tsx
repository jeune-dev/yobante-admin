import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import shopClient from '@/infrastructure/http/shop.client';
import { toast } from 'react-toastify';

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [prix, setPrix] = useState('');
  const [stock, setStock] = useState('0');
  const [poids, setPoids] = useState('');
  const [reference, setReference] = useState('');
  const [rayonId, setRayonId] = useState('');
  const [sousRayonId, setSousRayonId] = useState('');

  const { data: rayonsData } = useQuery({
    queryKey: ['rayons-select'],
    queryFn: () =>
      shopClient
        .get('/admin/rayons', { params: { actif: true, limit: 100 } })
        .then((r: any) => r.rayons ?? []),
  });

  const { data: sousRayonsData } = useQuery({
    queryKey: ['sous-rayons-select', rayonId],
    queryFn: () =>
      shopClient
        .get(`/admin/rayons/${rayonId}/sous-rayons`)
        .then((r: any) => r.sousRayons ?? []),
    enabled: !!rayonId,
  });

  const rayons: any[] = rayonsData || [];
  const sousRayons: any[] = sousRayonsData || [];

  const createMutation = useMutation({
    mutationFn: (fd: FormData) => shopClient.post('/admin/produits', fd),
    onSuccess: () => {
      toast.success('Produit créé avec succès');
      navigate('/boutique/produits');
    },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('nom', nom);
    fd.append('description', description);
    fd.append('prix', prix);
    fd.append('stock', stock);
    if (poids) fd.append('poids', poids);
    if (reference) fd.append('reference', reference);
    if (rayonId) fd.append('rayonId', rayonId);
    if (sousRayonId) fd.append('sousRayonId', sousRayonId);
    const files = fileRef.current?.files;
    if (files) for (let i = 0; i < files.length; i++) fd.append('images', files[i]);
    createMutation.mutate(fd);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/boutique/produits')}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau produit</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">Nom *</label>
            <input
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
              placeholder="Nom du produit"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 resize-vertical"
              placeholder="Description…"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Prix (FCFA) *</label>
              <input
                required
                type="number"
                min="0"
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Stock *</label>
              <input
                required
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Rayon</label>
            <select
              value={rayonId}
              onChange={(e) => {
                setRayonId(e.target.value);
                setSousRayonId('');
              }}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            >
              <option value="">— Sélectionner un rayon —</option>
              {rayons.map((r: any) => (
                <option key={r.id} value={r.id}>
                  {r.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Sous-rayon</label>
            <select
              value={sousRayonId}
              onChange={(e) => setSousRayonId(e.target.value)}
              disabled={!rayonId}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">— Sélectionner un sous-rayon —</option>
              {sousRayons.map((sr: any) => (
                <option key={sr.id} value={sr.id}>
                  {sr.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Référence</label>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                placeholder="REF-001"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Poids (kg)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={poids}
                onChange={(e) => setPoids(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                placeholder="0.5"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Images</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/boutique/produits')}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-60"
            >
              {createMutation.isPending ? 'Création…' : 'Créer le produit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
