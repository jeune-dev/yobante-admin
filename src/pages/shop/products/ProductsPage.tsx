import { useState, useRef } from 'react';
import {
  useProducts, useCreateProduct, useUpdateProduct,
  useDeleteProduct, useToggleVisibilite, useToggleFeatured, useUpdateStock,
} from '@/domains/shop/hooks/useProducts';
import { useCategories } from '@/domains/shop/hooks/useCategories';
import { productsApi, Product } from '@/domains/shop/api/products.api';

function fmtFcfa(n: number) {
  return Number(n).toLocaleString('fr-FR') + ' FCFA';
}

function firstImage(images: any): string | null {
  if (!images) return null;
  const arr = typeof images === 'string' ? JSON.parse(images) : images;
  return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
}

// ── Formulaire produit ──────────────────────────────────────────────────────
function ProductForm({
  initial, categories, onClose, onSave, loading,
}: {
  initial?: Product | null;
  categories: { id: number; nom: string }[];
  onClose: () => void;
  onSave: (fd: FormData) => void;
  loading: boolean;
}) {
  const [nom, setNom] = useState(initial?.nom ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [prix, setPrix] = useState(String(initial?.prix ?? ''));
  const [prixPromo, setPrixPromo] = useState(String(initial?.prixPromo ?? ''));
  const [stock, setStock] = useState(String(initial?.stock ?? '0'));
  const [categorieId, setCategorieId] = useState(String(initial?.categorieId ?? ''));
  const [reference, setReference] = useState(initial?.reference ?? '');
  const [poids, setPoids] = useState(String(initial?.poids ?? ''));
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('nom', nom);
    fd.append('description', description);
    fd.append('prix', prix);
    if (prixPromo) fd.append('prixPromo', prixPromo);
    fd.append('stock', stock);
    fd.append('categorieId', categorieId);
    if (reference) fd.append('reference', reference);
    if (poids) fd.append('poids', poids);
    const files = fileRef.current?.files;
    if (files) for (let i = 0; i < files.length; i++) fd.append('images', files[i]);
    onSave(fd);
  };

  return (
    <div className="db-modal-overlay db-modal-overlay--visible" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="db-modal db-modal--visible" style={{ maxWidth: 560, width: '95%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.4rem', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>{initial ? 'Modifier le produit' : 'Nouveau produit'}</span>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: 'var(--text2)' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.2rem 1.4rem', maxHeight: '65vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className="db-form-group" style={{ margin: 0 }}>
              <label className="db-form-label">Nom *</label>
              <input className="db-form-input" value={nom} onChange={e => setNom(e.target.value)} required placeholder="Nom du produit" />
            </div>
            <div className="db-form-group" style={{ margin: 0 }}>
              <label className="db-form-label">Description</label>
              <textarea className="db-form-input" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Description…" style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div className="db-form-group" style={{ margin: 0 }}>
                <label className="db-form-label">Prix (FCFA) *</label>
                <input className="db-form-input" type="number" value={prix} onChange={e => setPrix(e.target.value)} required min="0" />
              </div>
              <div className="db-form-group" style={{ margin: 0 }}>
                <label className="db-form-label">Prix promo</label>
                <input className="db-form-input" type="number" value={prixPromo} onChange={e => setPrixPromo(e.target.value)} min="0" placeholder="Optionnel" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div className="db-form-group" style={{ margin: 0 }}>
                <label className="db-form-label">Stock *</label>
                <input className="db-form-input" type="number" value={stock} onChange={e => setStock(e.target.value)} required min="0" />
              </div>
              <div className="db-form-group" style={{ margin: 0 }}>
                <label className="db-form-label">Catégorie *</label>
                <select className="db-form-input db-form-select" value={categorieId} onChange={e => setCategorieId(e.target.value)} required>
                  <option value="">Choisir…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div className="db-form-group" style={{ margin: 0 }}>
                <label className="db-form-label">Référence</label>
                <input className="db-form-input" value={reference} onChange={e => setReference(e.target.value)} placeholder="REF-001" />
              </div>
              <div className="db-form-group" style={{ margin: 0 }}>
                <label className="db-form-label">Poids (kg)</label>
                <input className="db-form-input" type="number" value={poids} onChange={e => setPoids(e.target.value)} min="0" step="0.01" placeholder="0.5" />
              </div>
            </div>
            <div className="db-form-group" style={{ margin: 0 }}>
              <label className="db-form-label">Images {initial ? '(vide = garder les actuelles)' : ''}</label>
              <input ref={fileRef} type="file" accept="image/*" multiple className="db-form-input" style={{ padding: '0.5rem' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', padding: '1rem 1.4rem', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="db-btn secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="db-btn primary" disabled={loading}>
              {loading ? 'Enregistrement…' : initial ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal stock ─────────────────────────────────────────────────────────────
function StockModal({ product, onClose, onSave, loading }: {
  product: Product; onClose: () => void; onSave: (n: number) => void; loading: boolean;
}) {
  const [val, setVal] = useState(String(product.stock));
  return (
    <div className="db-modal-overlay db-modal-overlay--visible" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="db-modal db-modal--visible" style={{ maxWidth: 360, width: '95%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.4rem', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>Modifier le stock</span>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: 'var(--text2)' }}>✕</button>
        </div>
        <div style={{ padding: '1.2rem 1.4rem' }}>
          <p style={{ fontSize: '0.87rem', color: 'var(--text2)', marginBottom: '1rem' }}>
            Produit : <strong>{product.nom}</strong>
          </p>
          <div className="db-form-group">
            <label className="db-form-label">Nouveau stock</label>
            <input className="db-form-input" type="number" value={val} onChange={e => setVal(e.target.value)} min="0" autoFocus />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', padding: '1rem 1.4rem', borderTop: '1px solid var(--border)' }}>
          <button className="db-btn secondary" onClick={onClose}>Annuler</button>
          <button className="db-btn primary" disabled={loading} onClick={() => onSave(Number(val))}>
            {loading ? 'Mise à jour…' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ─────────────────────────────────────────────────────────
export const ProductsPage = () => {
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [catFilter, setCatFilter] = useState<number | undefined>();
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [stockTarget, setStockTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const [toast, setToast] = useState({ msg: '', show: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast({ msg, show: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2800);
  };

  const { data, isLoading, isError } = useProducts({ page, limit: 10, search, categorieId: catFilter, isActive: activeFilter });
  const { data: cats } = useCategories();
  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();
  const deleteMut = useDeleteProduct();
  const toggleVis = useToggleVisibilite();
  const toggleFeat = useToggleFeatured();
  const stockMut = useUpdateStock();

  const rawData = data as any;
  const products = rawData?.rows ?? [];
  const totalPages = rawData?.totalPages ?? 1;
  const categories = (cats as any) ?? [];

  const openCreate = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit = (p: Product) => { setEditTarget(p); setFormOpen(true); };

  const handleCreate = (fd: FormData) => {
    createMut.mutate(fd, {
      onSuccess: () => { setFormOpen(false); showToast('Produit créé avec succès'); },
    });
  };

  const handleUpdate = (fd: FormData) => {
    if (!editTarget) return;
    updateMut.mutate({ id: editTarget.id, data: fd }, {
      onSuccess: () => { setEditTarget(null); setFormOpen(false); showToast('Produit mis à jour'); },
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.id, {
      onSuccess: () => { setDeleteTarget(null); showToast('Produit supprimé'); },
    });
  };

  const handleStock = (quantite: number) => {
    if (!stockTarget) return;
    stockMut.mutate({ id: stockTarget.id, quantite }, {
      onSuccess: () => { setStockTarget(null); showToast('Stock mis à jour'); },
    });
  };

  return (
    <div style={{ padding: '1.6rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.6rem' }}>
        <div>
          <div style={{ fontSize: '1.08rem', fontWeight: 700, color: 'var(--black)' }}>Produits</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: 2 }}>
            {data?.count ?? 0} produit{(data?.count ?? 0) > 1 ? 's' : ''} au total
          </div>
        </div>
        <button className="db-btn primary" onClick={openCreate}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 14, height: 14 }}>
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nouveau produit
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} style={{ display: 'flex', gap: '0.4rem' }}>
          <div className="db-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="db-search-input" placeholder="Rechercher…" value={searchInput} onChange={e => setSearchInput(e.target.value)} />
          </div>
          <button type="submit" className="db-btn primary" style={{ padding: '0.42rem 0.9rem', fontSize: '0.85rem' }}>OK</button>
        </form>

        <select
          className="db-form-input db-form-select"
          style={{ width: 'auto', padding: '0.42rem 2rem 0.42rem 0.8rem', fontSize: '0.85rem' }}
          value={catFilter ?? ''}
          onChange={e => { setCatFilter(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
        >
          <option value="">Toutes catégories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[{ label: 'Tous', val: undefined }, { label: 'Actifs', val: true }, { label: 'Inactifs', val: false }].map(f => (
            <button key={String(f.val)} className={`db-chip${activeFilter === f.val ? ' active' : ''}`}
              onClick={() => { setActiveFilter(f.val as any); setPage(1); }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="db-card">
        {isLoading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text3)' }}>Chargement…</div>
        ) : isError ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--red)' }}>Erreur lors du chargement.</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text3)' }}>Aucun produit trouvé.</div>
        ) : (
          <div className="db-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Catégorie</th>
                  <th>Prix</th>
                  <th>Stock</th>
                  <th>Statut</th>
                  <th>Vedette</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const img = firstImage(p.images);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--gray2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {img
                              ? <img src={img} alt={p.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 16, height: 16, color: 'var(--text3)' }}>
                                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                                </svg>
                            }
                          </div>
                          <div>
                            <div className="db-td-bold" style={{ fontSize: '0.87rem' }}>{p.nom}</div>
                            {p.reference && <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{p.reference}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text3)', fontSize: '0.84rem' }}>{(p as any).Categorie?.nom ?? '—'}</td>
                      <td>
                        <div className="db-td-bold">{fmtFcfa(p.prix)}</div>
                        {p.prixPromo && <div style={{ fontSize: '0.72rem', color: 'var(--green)' }}>{fmtFcfa(p.prixPromo)}</div>}
                      </td>
                      <td>
                        <button onClick={() => setStockTarget(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} title="Modifier le stock">
                          <span className={`badge ${p.stock === 0 ? 'br' : p.stock <= 5 ? 'bgo' : 'bb'}`}>
                            {p.stock === 0 ? 'Rupture' : `${p.stock}`}
                          </span>
                        </button>
                      </td>
                      <td>
                        <button onClick={() => toggleVis.mutate(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          <span className={`badge ${p.isActive ? 'bg' : 'bx'}`}>{p.isActive ? 'Actif' : 'Inactif'}</span>
                        </button>
                      </td>
                      <td>
                        <button onClick={() => toggleFeat.mutate(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          <svg viewBox="0 0 24 24" fill={p.isFeatured ? '#eab308' : 'none'} stroke={p.isFeatured ? '#eab308' : '#aaa'} strokeWidth={2} style={{ width: 18, height: 18 }}>
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        </button>
                      </td>
                      <td>
                        <div className="db-actions">
                          <button className="db-btn-ghost" onClick={() => openEdit(p)}>Modifier</button>
                          <button className="db-btn-danger" onClick={() => setDeleteTarget(p)}>Supprimer</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', borderTop: '1px solid var(--border)' }}>
            <button className="db-btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Précédent</button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>Page {page} / {totalPages}</span>
            <button className="db-btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Suivant →</button>
          </div>
        )}
      </div>

      {/* Modals */}
      {formOpen && (
        <ProductForm
          initial={editTarget}
          categories={categories}
          onClose={() => { setFormOpen(false); setEditTarget(null); }}
          onSave={editTarget ? handleUpdate : handleCreate}
          loading={createMut.isPending || updateMut.isPending}
        />
      )}

      {stockTarget && (
        <StockModal
          product={stockTarget}
          onClose={() => setStockTarget(null)}
          onSave={handleStock}
          loading={stockMut.isPending}
        />
      )}

      {deleteTarget && (
        <div className="db-modal-overlay db-modal-overlay--visible" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="db-modal db-modal--visible" style={{ maxWidth: 380, width: '95%' }}>
            <div style={{ padding: '1.1rem 1.4rem', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>Confirmer la suppression</div>
            <div style={{ padding: '1.2rem 1.4rem', fontSize: '0.9rem', color: 'var(--text2)' }}>
              Supprimer <strong>"{deleteTarget.nom}"</strong> ? Cette action est irréversible.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', padding: '1rem 1.4rem', borderTop: '1px solid var(--border)' }}>
              <button className="db-btn secondary" onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button className="db-btn confirm" disabled={deleteMut.isPending} onClick={handleDelete}>
                {deleteMut.isPending ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`db-toast${toast.show ? ' show' : ''}`}>
        <div className="db-toast-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        {toast.msg}
      </div>
    </div>
  );
};
