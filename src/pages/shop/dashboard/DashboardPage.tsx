import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import '@/assets/css/Dashboard.css';
import LOGO from '@/assets/images/logo.png';

import { dashboardApi } from '@/domains/shop/api/dashboard.api';
import { productsApi } from '@/domains/shop/api/products.api';
import { categoriesApi } from '@/domains/shop/api/categories.api';
import { ordersApi } from '@/domains/shop/api/orders.api';
import { paymentsApi } from '@/domains/shop/api/payments.api';
import { reviewsApi } from '@/domains/shop/api/reviews.api';
import { usersApi } from '@/domains/shop/api/users.api';
import { vendorsApi } from '@/domains/shop/api/vendors.api';
import { bannièresApi } from '@/domains/shop/api/bannieres.api';
import { promotionsApi } from '@/domains/shop/api/promotions.api';
import { fraisLivraisonApi } from '@/domains/shop/api/frais-livraison.api';

import type {
  ShopStats, KpiStocks, TopProduit, ClientActif,
  Produit, Categorie, Commande, Paiement, Avis,
  ShopUser, Vendeur, Banniere, Promotion, FraisLivraison,
  StatutCommande, Pagination,
} from '@/domains/shop/types';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => n?.toLocaleString('fr-FR');
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR');
const fmtDateTime = (d: string) => new Date(d).toLocaleString('fr-FR');
const fmtMontant = (n: number) => `${fmt(n)} FCFA`;

const STATUT_COMMANDE_LABELS: Record<string, { label: string; cls: string }> = {
  en_attente:     { label: 'En attente',    cls: 'bgo' },
  validee:        { label: 'Validée',       cls: 'bb' },
  en_preparation: { label: 'En préparation', cls: 'bb' },
  expediee:       { label: 'Expédiée',      cls: 'bg' },
  livree:         { label: 'Livrée',        cls: 'bg' },
  annulee:        { label: 'Annulée',       cls: 'br' },
};

const STATUT_PAIEMENT_LABELS: Record<string, { label: string; cls: string }> = {
  en_attente: { label: 'En attente', cls: 'bgo' },
  succes:     { label: 'Succès',    cls: 'bg' },
  echoue:     { label: 'Échoué',    cls: 'br' },
  rembourse:  { label: 'Remboursé', cls: 'bb' },
};

const STATUT_PRODUIT_LABELS: Record<string, { label: string; cls: string }> = {
  en_attente:  { label: 'En attente',  cls: 'bgo' },
  valide_step1:{ label: 'Étape 1 ✓',  cls: 'bb' },
  valide:      { label: 'Validé',      cls: 'bg' },
  rejete:      { label: 'Rejeté',      cls: 'br' },
};

const Badge = ({ statut, map }: { statut: string; map: Record<string, { label: string; cls: string }> }) => {
  const s = map[statut] ?? { label: statut, cls: 'bx' };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
};

// ── Toast ─────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error';
const useToast = () => {
  const [toast, setToast] = useState({ msg: '', show: false, type: 'success' as ToastType });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = (msg: string, type: ToastType = 'success') => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ msg, show: true, type });
    timer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };
  return { toast, show };
};

// ── Modal ─────────────────────────────────────────────────────────────────────
const Modal = ({ open, title, onClose, children, wide }: {
  open: boolean; title: string; onClose: () => void; children: React.ReactNode; wide?: boolean;
}) => (
  <div className={`db-modal-overlay${open ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="db-modal" style={wide ? { maxWidth: 640 } : {}}>
      <div className="db-modal-head">
        <div className="db-modal-title">{title}</div>
        <button className="db-modal-close" onClick={onClose}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      {children}
    </div>
  </div>
);

const ConfirmModal = ({ open, title, message, onConfirm, onClose, danger }: {
  open: boolean; title: string; message: string;
  onConfirm: () => void; onClose: () => void; danger?: boolean;
}) => (
  <Modal open={open} title={title} onClose={onClose}>
    <div className="db-card-body">
      <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>{message}</p>
      <div className="db-modal-footer" style={{ padding: 0 }}>
        <button className="db-btn secondary" onClick={onClose}>Annuler</button>
        <button className={`db-btn ${danger ? 'confirm' : 'primary'}`} onClick={onConfirm}>Confirmer</button>
      </div>
    </div>
  </Modal>
);

// ── Pagination ────────────────────────────────────────────────────────────────
const Pager = ({ pagination, onChange }: { pagination: Pagination | null; onChange: (p: number) => void }) => {
  if (!pagination || pagination.totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 0.9rem', borderTop: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text3)' }}>
      <span>{pagination.total} résultat(s)</span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="db-btn-ghost" disabled={pagination.page <= 1} onClick={() => onChange(pagination.page - 1)}>‹ Préc</button>
        <span style={{ padding: '0.33rem 0.85rem', color: 'var(--text2)' }}>{pagination.page} / {pagination.totalPages}</span>
        <button className="db-btn-ghost" disabled={pagination.page >= pagination.totalPages} onClick={() => onChange(pagination.page + 1)}>Suiv ›</button>
      </div>
    </div>
  );
};

// ── Input helpers ─────────────────────────────────────────────────────────────
const Input = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="db-form-group">
    <label className="db-form-label">{label}</label>
    <input className="db-form-input" {...props} />
  </div>
);

const Textarea = ({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <div className="db-form-group">
    <label className="db-form-label">{label}</label>
    <textarea className="db-form-input" rows={3} {...props} />
  </div>
);

const Select = ({ label, children, ...props }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="db-form-group">
    <label className="db-form-label">{label}</label>
    <select className="db-form-input db-form-select" {...props}>{children}</select>
  </div>
);

// ── Empty / Loading ───────────────────────────────────────────────────────────
const Loading = () => (
  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>Chargement…</div>
);
const Empty = ({ msg = 'Aucun élément' }: { msg?: string }) => (
  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>{msg}</div>
);

// ════════════════════════════════════════════════════════════════════════════
// PANEL: OVERVIEW
// ════════════════════════════════════════════════════════════════════════════
const OverviewPanel = ({ showToast }: { showToast: (m: string, t?: ToastType) => void }) => {
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [kpi, setKpi] = useState<KpiStocks | null>(null);
  const [topProduits, setTopProduits] = useState<TopProduit[]>([]);
  const [clientsActifs, setClientsActifs] = useState<ClientActif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getKpiStocks(),
      dashboardApi.getTopProduits(5),
      dashboardApi.getClientsActifs(5),
    ]).then(([s, k, tp, ca]) => {
      setStats(s?.data?.stats ?? null);
      setKpi(k?.data?.kpi ?? null);
      setTopProduits(tp?.data?.produits ?? []);
      setClientsActifs(ca?.data?.clients ?? []);
    }).catch(() => showToast('Erreur chargement dashboard', 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const statCards = [
    { label: 'Total clients',    value: fmt(stats?.totalClients ?? 0),           color: 'blue' },
    { label: 'Produits actifs',  value: fmt(kpi?.produitsActifs ?? 0),            color: 'green' },
    { label: 'Total commandes',  value: fmt(stats?.totalCommandes ?? 0),          color: 'gold' },
    { label: 'Chiffre d\'affaires', value: fmtMontant(stats?.chiffreAffaires ?? 0), color: 'gold' },
    { label: 'Produits en attente', value: fmt(kpi?.produitsEnAttente ?? 0),      color: 'red' },
    { label: 'Rupture de stock', value: fmt(kpi?.produitsEnRupture ?? 0),         color: 'red' },
  ];

  const icons = {
    blue:  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>,
    green: <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>,
    gold:  <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
    red:   <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></>,
  };

  return (
    <>
      <div className="db-stats-grid">
        {statCards.map((c, i) => (
          <div key={i} className="db-stat-card">
            <div className={`db-stat-icon ${c.color}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                {icons[c.color as keyof typeof icons]}
              </svg>
            </div>
            <div className="db-stat-label">{c.label}</div>
            <div className="db-stat-value">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="db-grid-2">
        <div className="db-card">
          <div className="db-card-head">
            <div className="db-card-title">Top 5 produits vendus</div>
          </div>
          {topProduits.length === 0 ? <Empty /> : (
            <div className="db-table-wrap">
              <table>
                <thead><tr><th>Produit</th><th>Vendus</th><th>CA</th></tr></thead>
                <tbody>
                  {topProduits.map(p => (
                    <tr key={p.id}>
                      <td className="db-td-bold">{p.nom}</td>
                      <td>{fmt(p.totalVendu)}</td>
                      <td>{fmtMontant(p.chiffreAffaires)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="db-card">
          <div className="db-card-head">
            <div className="db-card-title">Top clients actifs</div>
          </div>
          {clientsActifs.length === 0 ? <Empty /> : (
            <div className="db-table-wrap">
              <table>
                <thead><tr><th>Client</th><th>Commandes</th><th>Dépensé</th></tr></thead>
                <tbody>
                  {clientsActifs.map(c => (
                    <tr key={c.id}>
                      <td className="db-td-bold">{c.nom} {c.prenom}</td>
                      <td>{fmt(c.totalCommandes)}</td>
                      <td>{fmtMontant(c.totalDepense)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {(kpi?.produitsRupture ?? []).length > 0 && (
        <div className="db-mod-alert">
          <div className="db-mod-alert-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <div className="db-mod-alert-title">{kpi!.produitsEnRupture} produit(s) en rupture de stock</div>
            <div className="db-mod-alert-sub">{kpi!.produitsRupture?.slice(0, 3).map(p => p.nom).join(', ')}</div>
          </div>
        </div>
      )}
    </>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PANEL: PRODUITS
// ════════════════════════════════════════════════════════════════════════════
const ProduitsPanel = ({ showToast }: { showToast: (m: string, t?: ToastType) => void }) => {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Produit | null>(null);
  const [modalDetail, setModalDetail] = useState(false);
  const [modalStock, setModalStock] = useState(false);
  const [modalRejet, setModalRejet] = useState(false);
  const [stockVal, setStockVal] = useState('');
  const [motifRejet, setMotifRejet] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(() => async () => {});
  const [confirmMsg, setConfirmMsg] = useState('');
  const [categories, setCategories] = useState<Categorie[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    productsApi.getAll({ search, statutValidation: statutFilter || undefined, page, limit: 20 } as any)
      .then(r => { setProduits(r?.data?.produits ?? []); setPagination(r?.data?.pagination ?? null); })
      .catch(() => showToast('Erreur chargement produits', 'error'))
      .finally(() => setLoading(false));
  }, [search, statutFilter, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    categoriesApi.getAll().then(r => setCategories(r?.data?.categories ?? [])).catch(() => {});
  }, []);

  const doToggleFeatured = async (id: string) => {
    try { await productsApi.toggleFeatured(id); showToast('Mise en avant modifiée'); load(); } catch { showToast('Erreur', 'error'); }
  };
  const doToggleVisible = async (id: string) => {
    try { await productsApi.toggleVisibilite(id); showToast('Visibilité modifiée'); load(); } catch { showToast('Erreur', 'error'); }
  };
  const doValiderStep1 = async (id: string) => {
    try { await productsApi.validerStep1(id); showToast('Étape 1 validée ✓'); load(); } catch { showToast('Erreur', 'error'); }
  };
  const doValiderStep2 = async (id: string) => {
    try { await productsApi.validerStep2(id); showToast('Produit validé et publié ✓'); load(); } catch { showToast('Erreur', 'error'); }
  };
  const doRejeter = async () => {
    if (!selected) return;
    try { await productsApi.rejeter(selected.id, motifRejet); showToast('Produit rejeté'); setModalRejet(false); setMotifRejet(''); load(); } catch { showToast('Erreur', 'error'); }
  };
  const doUpdateStock = async () => {
    if (!selected) return;
    try { await productsApi.updateStock(selected.id, parseInt(stockVal)); showToast('Stock mis à jour'); setModalStock(false); setStockVal(''); load(); } catch { showToast('Erreur', 'error'); }
  };

  const flatCategories = (cats: Categorie[], depth = 0): { cat: Categorie; depth: number }[] =>
    cats.flatMap(c => [{ cat: c, depth }, ...flatCategories(c.sousCategories ?? [], depth + 1)]);

  return (
    <>
      <div className="db-card">
        <div className="db-card-head">
          <div className="db-card-title">Produits ({pagination?.total ?? '…'})</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="db-form-input" placeholder="Rechercher…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ width: 200, padding: '0.35rem 0.8rem' }} />
            <select className="db-form-input db-form-select" value={statutFilter}
              onChange={e => { setStatutFilter(e.target.value); setPage(1); }} style={{ width: 160, padding: '0.35rem 0.8rem' }}>
              <option value="">Tous statuts</option>
              <option value="en_attente">En attente</option>
              <option value="valide_step1">Étape 1 validée</option>
              <option value="valide">Validé</option>
              <option value="rejete">Rejeté</option>
            </select>
          </div>
        </div>
        {loading ? <Loading /> : produits.length === 0 ? <Empty /> : (
          <div className="db-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Produit</th><th>Catégorie</th><th>Prix</th><th>Stock</th>
                  <th>Statut</th><th>Visible</th><th>Vedette</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {produits.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                          : <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--gray2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📦</div>
                        }
                        <div>
                          <div className="db-td-bold">{p.nom}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{p.reference ?? p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td>{p.categorie?.nom ?? '—'}</td>
                    <td>{fmtMontant(p.prix)}</td>
                    <td><span style={{ color: p.stock === 0 ? 'var(--red)' : 'inherit', fontWeight: p.stock === 0 ? 700 : 400 }}>{p.stock}</span></td>
                    <td><Badge statut={p.statutValidation} map={STATUT_PRODUIT_LABELS} /></td>
                    <td>
                      <button className={`badge ${p.isActive ? 'bg' : 'br'}`} onClick={() => doToggleVisible(p.id)} style={{ cursor: 'pointer', border: 'none' }}>
                        {p.isActive ? 'Oui' : 'Non'}
                      </button>
                    </td>
                    <td>
                      <button className={`badge ${p.isFeatured ? 'bgo' : 'bx'}`} onClick={() => doToggleFeatured(p.id)} style={{ cursor: 'pointer', border: 'none' }}>
                        {p.isFeatured ? '⭐' : '—'}
                      </button>
                    </td>
                    <td>
                      <div className="db-actions">
                        <button className="db-btn-ghost" onClick={() => { setSelected(p); setModalDetail(true); }}>Voir</button>
                        <button className="db-btn-ghost" onClick={() => { setSelected(p); setStockVal(String(p.stock)); setModalStock(true); }}>Stock</button>
                        {p.statutValidation === 'en_attente' && (
                          <button className="db-btn-ghost" style={{ color: 'var(--green)' }} onClick={() => doValiderStep1(p.id)}>✓ Step1</button>
                        )}
                        {p.statutValidation === 'valide_step1' && (
                          <button className="db-btn-ghost" style={{ color: 'var(--green)' }} onClick={() => doValiderStep2(p.id)}>✓ Step2</button>
                        )}
                        {['en_attente', 'valide_step1'].includes(p.statutValidation) && (
                          <button className="db-btn-danger" onClick={() => { setSelected(p); setModalRejet(true); }}>Rejeter</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager pagination={pagination} onChange={setPage} />
      </div>

      {/* Modal Détail */}
      <Modal open={modalDetail} title={selected?.nom ?? ''} onClose={() => setModalDetail(false)} wide>
        {selected && (
          <div className="db-card-body">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
              {selected.images?.map((img, i) => (
                <img key={i} src={img} alt="" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} />
              ))}
            </div>
            <div className="db-modal-stats">
              <div className="db-modal-stat"><div className="db-modal-stat-label">Prix</div><div className="db-modal-stat-value--price">{fmtMontant(selected.prix)}</div></div>
              <div className="db-modal-stat-divider" />
              <div className="db-modal-stat"><div className="db-modal-stat-label">Stock</div><div className="db-modal-stat-value">{selected.stock}</div></div>
              <div className="db-modal-stat-divider" />
              <div className="db-modal-stat"><div className="db-modal-stat-label">Note</div><div className="db-modal-stat-value">{selected.noteMoyenne ?? '—'} ⭐</div></div>
              <div className="db-modal-stat-divider" />
              <div className="db-modal-stat"><div className="db-modal-stat-label">Statut</div><div className="db-modal-stat-value"><Badge statut={selected.statutValidation} map={STATUT_PRODUIT_LABELS} /></div></div>
            </div>
            <div className="db-modal-section">
              <div className="db-modal-section-label">Description</div>
              <div className="db-modal-section-text">{selected.description ?? 'Aucune description'}</div>
            </div>
            <div className="db-modal-meta">
              <div className="db-modal-meta-item">
                <div className="db-modal-meta-icon">🗂</div>
                <div><div className="db-modal-meta-label">Catégorie</div><div className="db-modal-meta-value">{selected.categorie?.nom ?? '—'}</div></div>
              </div>
              <div className="db-modal-meta-item">
                <div className="db-modal-meta-icon">📅</div>
                <div><div className="db-modal-meta-label">Ajouté le</div><div className="db-modal-meta-value">{fmtDate(selected.createdAt)}</div></div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Stock */}
      <Modal open={modalStock} title="Mettre à jour le stock" onClose={() => setModalStock(false)}>
        <div className="db-card-body">
          <Input label="Nouveau stock" type="number" min="0" value={stockVal} onChange={e => setStockVal(e.target.value)} />
          <div className="db-modal-footer" style={{ padding: 0 }}>
            <button className="db-btn secondary" onClick={() => setModalStock(false)}>Annuler</button>
            <button className="db-btn primary" onClick={doUpdateStock}>Mettre à jour</button>
          </div>
        </div>
      </Modal>

      {/* Modal Rejet */}
      <Modal open={modalRejet} title="Rejeter le produit" onClose={() => setModalRejet(false)}>
        <div className="db-card-body">
          <Textarea label="Motif de rejet (optionnel)" value={motifRejet} onChange={e => setMotifRejet(e.target.value)} placeholder="Expliquez pourquoi ce produit est rejeté…" />
          <div className="db-modal-footer" style={{ padding: 0 }}>
            <button className="db-btn secondary" onClick={() => setModalRejet(false)}>Annuler</button>
            <button className="db-btn confirm" onClick={doRejeter}>Rejeter</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PANEL: CATÉGORIES
// ════════════════════════════════════════════════════════════════════════════
const CategoriesPanel = ({ showToast }: { showToast: (m: string, t?: ToastType) => void }) => {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Categorie | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Categorie | null>(null);
  const [form, setForm] = useState({ nom: '', description: '', parentId: '' });

  const load = () => {
    setLoading(true);
    categoriesApi.getAll()
      .then(r => setCategories(r?.data?.categories ?? []))
      .catch(() => showToast('Erreur', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ nom: '', description: '', parentId: '' }); setModalOpen(true); };
  const openEdit = (c: Categorie) => { setEditing(c); setForm({ nom: c.nom, description: c.description ?? '', parentId: c.parentId ?? '' }); setModalOpen(true); };

  const doSave = async () => {
    if (!form.nom.trim()) return showToast('Nom requis', 'error');
    try {
      const data = { nom: form.nom, description: form.description, parentId: form.parentId || null };
      if (editing) await categoriesApi.update(editing.id, data);
      else await categoriesApi.create(data);
      showToast(editing ? 'Catégorie mise à jour' : 'Catégorie créée');
      setModalOpen(false); load();
    } catch (e: any) { showToast(e?.message ?? 'Erreur', 'error'); }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    try { await categoriesApi.delete(confirmDelete.id); showToast('Catégorie désactivée'); setConfirmDelete(null); load(); }
    catch (e: any) { showToast(e?.message ?? 'Erreur', 'error'); }
  };

  const flatCategories = (cats: Categorie[], depth = 0): { cat: Categorie; depth: number }[] =>
    cats.flatMap(c => [{ cat: c, depth }, ...flatCategories(c.sousCategories ?? [], depth + 1)]);

  return (
    <>
      <div className="db-card">
        <div className="db-card-head">
          <div className="db-card-title">Catégories</div>
          <button className="db-btn primary" onClick={openCreate} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>+ Nouvelle catégorie</button>
        </div>
        {loading ? <Loading /> : categories.length === 0 ? <Empty /> : (
          <div className="db-table-wrap">
            <table>
              <thead><tr><th>Nom</th><th>Slug</th><th>Sous-catégories</th><th>Active</th><th>Actions</th></tr></thead>
              <tbody>
                {flatCategories(categories).map(({ cat, depth }) => (
                  <tr key={cat.id}>
                    <td className="db-td-bold" style={{ paddingLeft: `${0.9 + depth * 1.5}rem` }}>
                      {depth > 0 && <span style={{ color: 'var(--text3)', marginRight: 6 }}>└</span>}
                      {cat.nom}
                    </td>
                    <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{cat.slug}</td>
                    <td>{cat.sousCategories?.length ?? 0}</td>
                    <td><span className={`badge ${cat.isActive ? 'bg' : 'br'}`}>{cat.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className="db-actions">
                        <button className="db-btn-ghost" onClick={() => openEdit(cat)}>Modifier</button>
                        <button className="db-btn-danger" onClick={() => setConfirmDelete(cat)}>Désactiver</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title={editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'} onClose={() => setModalOpen(false)}>
        <div className="db-card-body">
          <Input label="Nom *" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Ex: Vêtements" />
          <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description optionnelle…" />
          <Select label="Catégorie parente" value={form.parentId} onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}>
            <option value="">Aucune (catégorie racine)</option>
            {flatCategories(categories).filter(({ cat }) => !editing || cat.id !== editing.id).map(({ cat, depth }) => (
              <option key={cat.id} value={cat.id}>{'  '.repeat(depth)}{cat.nom}</option>
            ))}
          </Select>
          <div className="db-modal-footer" style={{ padding: 0 }}>
            <button className="db-btn secondary" onClick={() => setModalOpen(false)}>Annuler</button>
            <button className="db-btn primary" onClick={doSave}>Enregistrer</button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!confirmDelete} title="Désactiver la catégorie" danger
        message={`Désactiver "${confirmDelete?.nom}" ? Les produits associés ne seront plus visibles.`}
        onConfirm={doDelete} onClose={() => setConfirmDelete(null)} />
    </>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PANEL: COMMANDES
// ════════════════════════════════════════════════════════════════════════════
const CommandesPanel = ({ showToast }: { showToast: (m: string, t?: ToastType) => void }) => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [statutFilter, setStatutFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Commande | null>(null);
  const [modalDetail, setModalDetail] = useState(false);
  const [modalStatut, setModalStatut] = useState(false);
  const [newStatut, setNewStatut] = useState<StatutCommande>('validee');
  const [noteAdmin, setNoteAdmin] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    ordersApi.getAll({ statut: (statutFilter as StatutCommande) || undefined, page, limit: 20 })
      .then(r => { setCommandes(r?.data?.commandes ?? []); setPagination(r?.data?.pagination ?? null); })
      .catch(() => showToast('Erreur', 'error'))
      .finally(() => setLoading(false));
  }, [statutFilter, page]);

  useEffect(() => { load(); }, [load]);

  const doUpdateStatut = async () => {
    if (!selected) return;
    try { await ordersApi.updateStatut(selected.id, newStatut, noteAdmin); showToast('Statut mis à jour'); setModalStatut(false); load(); }
    catch (e: any) { showToast(e?.message ?? 'Erreur', 'error'); }
  };

  const openStatut = (c: Commande) => { setSelected(c); setNewStatut(c.statut); setNoteAdmin(c.noteAdmin ?? ''); setModalStatut(true); };

  const STATUTS_SUIVANTS: Record<string, StatutCommande[]> = {
    en_attente:     ['validee', 'annulee'],
    validee:        ['en_preparation', 'annulee'],
    en_preparation: ['expediee'],
    expediee:       ['livree'],
    livree:         [],
    annulee:        [],
  };

  return (
    <>
      <div className="db-card">
        <div className="db-card-head">
          <div className="db-card-title">Commandes ({pagination?.total ?? '…'})</div>
          <select className="db-form-input db-form-select" value={statutFilter}
            onChange={e => { setStatutFilter(e.target.value); setPage(1); }} style={{ width: 180, padding: '0.35rem 0.8rem' }}>
            <option value="">Tous statuts</option>
            {Object.entries(STATUT_COMMANDE_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        {loading ? <Loading /> : commandes.length === 0 ? <Empty /> : (
          <div className="db-table-wrap">
            <table>
              <thead><tr><th>Référence</th><th>Client</th><th>Montant</th><th>Statut</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {commandes.map(c => (
                  <tr key={c.id}>
                    <td className="db-td-bold">{c.reference}</td>
                    <td>{c.user ? `${c.user.nom} ${c.user.prenom}` : c.userId}</td>
                    <td>{fmtMontant(c.montantTotal)}</td>
                    <td><Badge statut={c.statut} map={STATUT_COMMANDE_LABELS} /></td>
                    <td>{fmtDateTime(c.createdAt)}</td>
                    <td>
                      <div className="db-actions">
                        <button className="db-btn-ghost" onClick={() => { setSelected(c); setModalDetail(true); }}>Voir</button>
                        {STATUTS_SUIVANTS[c.statut]?.length > 0 && (
                          <button className="db-btn-ghost" onClick={() => openStatut(c)}>Changer statut</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager pagination={pagination} onChange={setPage} />
      </div>

      {/* Modal Détail */}
      <Modal open={modalDetail} title={`Commande ${selected?.reference}`} onClose={() => setModalDetail(false)} wide>
        {selected && (
          <div className="db-card-body">
            <div className="db-modal-stats">
              <div className="db-modal-stat"><div className="db-modal-stat-label">Montant</div><div className="db-modal-stat-value--price">{fmtMontant(selected.montantTotal)}</div></div>
              <div className="db-modal-stat-divider" />
              <div className="db-modal-stat"><div className="db-modal-stat-label">Livraison</div><div className="db-modal-stat-value">{fmtMontant(selected.fraisLivraison)}</div></div>
              <div className="db-modal-stat-divider" />
              <div className="db-modal-stat"><div className="db-modal-stat-label">Statut</div><div className="db-modal-stat-value"><Badge statut={selected.statut} map={STATUT_COMMANDE_LABELS} /></div></div>
            </div>
            {selected.items && selected.items.length > 0 && (
              <div className="db-modal-section">
                <div className="db-modal-section-label">Articles ({selected.items.length})</div>
                <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                  <table style={{ fontSize: '0.85rem' }}>
                    <thead><tr><th>Produit</th><th>Qté</th><th>Prix unit.</th><th>Sous-total</th></tr></thead>
                    <tbody>
                      {selected.items.map(item => (
                        <tr key={item.id}>
                          <td>{item.produit?.nom ?? item.produitId}</td>
                          <td>{item.quantite}</td>
                          <td>{fmtMontant(item.prixUnitaire)}</td>
                          <td className="db-td-bold">{fmtMontant(item.sousTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {selected.note && (
              <div className="db-modal-section">
                <div className="db-modal-section-label">Note client</div>
                <div className="db-modal-section-text">{selected.note}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Statut */}
      <Modal open={modalStatut} title="Changer le statut" onClose={() => setModalStatut(false)}>
        <div className="db-card-body">
          <Select label="Nouveau statut" value={newStatut} onChange={e => setNewStatut(e.target.value as StatutCommande)}>
            {STATUTS_SUIVANTS[selected?.statut ?? 'en_attente']?.map(s => (
              <option key={s} value={s}>{STATUT_COMMANDE_LABELS[s]?.label}</option>
            ))}
          </Select>
          <Textarea label="Note admin (optionnel)" value={noteAdmin} onChange={e => setNoteAdmin(e.target.value)} placeholder="Commentaire interne…" />
          <div className="db-modal-footer" style={{ padding: 0 }}>
            <button className="db-btn secondary" onClick={() => setModalStatut(false)}>Annuler</button>
            <button className="db-btn primary" onClick={doUpdateStatut}>Confirmer</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PANEL: PAIEMENTS
// ════════════════════════════════════════════════════════════════════════════
const PaiementsPanel = ({ showToast }: { showToast: (m: string, t?: ToastType) => void }) => {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statutFilter, setStatutFilter] = useState('');
  const [selected, setSelected] = useState<Paiement | null>(null);
  const [modalConfirm, setModalConfirm] = useState(false);
  const [modalRembourser, setModalRembourser] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [raisonRemb, setRaisonRemb] = useState('');
  const [totalRevenu, setTotalRevenu] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      paymentsApi.getAll({ statut: statutFilter || undefined, page, limit: 20 }),
      paymentsApi.getRevenusTotal(),
    ]).then(([r, rev]) => {
      setPaiements(r?.data?.paiements ?? []);
      setPagination(r?.data?.pagination ?? null);
      setTotalRevenu(rev?.data?.total ?? 0);
    }).catch(() => showToast('Erreur', 'error'))
      .finally(() => setLoading(false));
  }, [statutFilter, page]);

  useEffect(() => { load(); }, [load]);

  const doConfirmer = async () => {
    if (!selected) return;
    try { await paymentsApi.confirmer(selected.id, transactionId); showToast('Paiement confirmé ✓'); setModalConfirm(false); load(); }
    catch (e: any) { showToast(e?.message ?? 'Erreur', 'error'); }
  };

  const doRembourser = async () => {
    if (!selected) return;
    try { await paymentsApi.rembourser(selected.id, raisonRemb); showToast('Remboursement effectué'); setModalRembourser(false); load(); }
    catch (e: any) { showToast(e?.message ?? 'Erreur', 'error'); }
  };

  return (
    <>
      {totalRevenu !== null && (
        <div className="db-stat-card" style={{ marginBottom: 16, background: 'var(--white)' }}>
          <div className="db-stat-label">Total revenus (paiements réussis)</div>
          <div className="db-stat-value">{fmtMontant(totalRevenu)}</div>
        </div>
      )}

      <div className="db-card">
        <div className="db-card-head">
          <div className="db-card-title">Paiements ({pagination?.total ?? '…'})</div>
          <select className="db-form-input db-form-select" value={statutFilter}
            onChange={e => { setStatutFilter(e.target.value); setPage(1); }} style={{ width: 160, padding: '0.35rem 0.8rem' }}>
            <option value="">Tous statuts</option>
            {Object.entries(STATUT_PAIEMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        {loading ? <Loading /> : paiements.length === 0 ? <Empty /> : (
          <div className="db-table-wrap">
            <table>
              <thead><tr><th>Commande</th><th>Client</th><th>Montant</th><th>Méthode</th><th>Statut</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {paiements.map(p => (
                  <tr key={p.id}>
                    <td className="db-td-bold">{p.commande?.reference ?? p.commandeId}</td>
                    <td>{p.user ? `${p.user.nom} ${p.user.prenom}` : p.userId}</td>
                    <td>{fmtMontant(p.montant)}</td>
                    <td><span className="badge bx">{p.methode?.replace('_', ' ')}</span></td>
                    <td><Badge statut={p.statut} map={STATUT_PAIEMENT_LABELS} /></td>
                    <td>{fmtDate(p.createdAt)}</td>
                    <td>
                      <div className="db-actions">
                        {p.statut === 'en_attente' && (
                          <button className="db-btn-ghost" style={{ color: 'var(--green)' }} onClick={() => { setSelected(p); setTransactionId(''); setModalConfirm(true); }}>Confirmer</button>
                        )}
                        {p.statut === 'succes' && (
                          <button className="db-btn-danger" onClick={() => { setSelected(p); setRaisonRemb(''); setModalRembourser(true); }}>Rembourser</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager pagination={pagination} onChange={setPage} />
      </div>

      <Modal open={modalConfirm} title="Confirmer le paiement" onClose={() => setModalConfirm(false)}>
        <div className="db-card-body">
          <Input label="ID de transaction (optionnel)" value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="TXN-…" />
          <div className="db-modal-footer" style={{ padding: 0 }}>
            <button className="db-btn secondary" onClick={() => setModalConfirm(false)}>Annuler</button>
            <button className="db-btn primary" onClick={doConfirmer}>Confirmer le paiement</button>
          </div>
        </div>
      </Modal>

      <Modal open={modalRembourser} title="Rembourser le paiement" onClose={() => setModalRembourser(false)}>
        <div className="db-card-body">
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginBottom: 12 }}>Montant : <strong>{selected ? fmtMontant(selected.montant) : ''}</strong></p>
          <Textarea label="Raison du remboursement" value={raisonRemb} onChange={e => setRaisonRemb(e.target.value)} placeholder="Expliquez la raison…" />
          <div className="db-modal-footer" style={{ padding: 0 }}>
            <button className="db-btn secondary" onClick={() => setModalRembourser(false)}>Annuler</button>
            <button className="db-btn confirm" onClick={doRembourser}>Rembourser</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PANEL: AVIS
// ════════════════════════════════════════════════════════════════════════════
const AvisPanel = ({ showToast }: { showToast: (m: string, t?: ToastType) => void }) => {
  const [avis, setAvis] = useState<Avis[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'' | 'true' | 'false'>('');
  const [confirmDelete, setConfirmDelete] = useState<Avis | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params: any = { page, limit: 20 };
    if (filter !== '') params.isApproved = filter === 'true';
    reviewsApi.getAll(params)
      .then(r => { setAvis(r?.data?.avis ?? []); setPagination(r?.data?.pagination ?? null); })
      .catch(() => showToast('Erreur', 'error'))
      .finally(() => setLoading(false));
  }, [filter, page]);

  useEffect(() => { load(); }, [load]);

  const doApprouver = async (id: string) => {
    try { await reviewsApi.approuver(id); showToast('Avis approuvé ✓'); load(); } catch { showToast('Erreur', 'error'); }
  };
  const doRejeter = async (id: string) => {
    try { await reviewsApi.rejeter(id); showToast('Avis rejeté'); load(); } catch { showToast('Erreur', 'error'); }
  };
  const doDelete = async () => {
    if (!confirmDelete) return;
    try { await reviewsApi.delete(confirmDelete.id); showToast('Avis supprimé'); setConfirmDelete(null); load(); } catch { showToast('Erreur', 'error'); }
  };

  const Stars = ({ n }: { n: number }) => (
    <span style={{ color: '#eab308' }}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
  );

  return (
    <>
      <div className="db-card">
        <div className="db-card-head">
          <div className="db-card-title">Avis clients ({pagination?.total ?? '…'})</div>
          <div className="db-filters" style={{ margin: 0 }}>
            {[['', 'Tous'], ['false', 'En attente'], ['true', 'Approuvés']].map(([v, l]) => (
              <button key={v} className={`db-chip${filter === v ? ' active' : ''}`} onClick={() => { setFilter(v as any); setPage(1); }}>{l}</button>
            ))}
          </div>
        </div>
        {loading ? <Loading /> : avis.length === 0 ? <Empty /> : (
          <div className="db-table-wrap">
            <table>
              <thead><tr><th>Client</th><th>Produit</th><th>Note</th><th>Commentaire</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {avis.map(a => (
                  <tr key={a.id}>
                    <td className="db-td-bold">{a.user ? `${a.user.nom} ${a.user.prenom}` : a.userId}</td>
                    <td>{a.produit?.nom ?? a.produitId}</td>
                    <td><Stars n={a.note} /></td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.commentaire ?? '—'}</td>
                    <td><span className={`badge ${a.isApproved ? 'bg' : 'bgo'}`}>{a.isApproved ? 'Approuvé' : 'En attente'}</span></td>
                    <td>
                      <div className="db-actions">
                        {!a.isApproved && <button className="db-btn-ghost" style={{ color: 'var(--green)' }} onClick={() => doApprouver(a.id)}>✓ Approuver</button>}
                        {a.isApproved && <button className="db-btn-ghost" onClick={() => doRejeter(a.id)}>Rejeter</button>}
                        <button className="db-btn-danger" onClick={() => setConfirmDelete(a)}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager pagination={pagination} onChange={setPage} />
      </div>

      <ConfirmModal open={!!confirmDelete} title="Supprimer l'avis" danger
        message={`Supprimer définitivement cet avis de "${confirmDelete?.user?.nom ?? 'ce client'}" ?`}
        onConfirm={doDelete} onClose={() => setConfirmDelete(null)} />
    </>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PANEL: CLIENTS
// ════════════════════════════════════════════════════════════════════════════
const ClientsPanel = ({ showToast }: { showToast: (m: string, t?: ToastType) => void }) => {
  const [users, setUsers] = useState<ShopUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filterActive, setFilterActive] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params: any = { search, page, limit: 20, role: 'CLIENT' };
    if (filterActive !== '') params.isActive = filterActive === 'true';
    usersApi.getAll(params)
      .then(r => { setUsers(r?.data?.users ?? []); setPagination(r?.data?.pagination ?? null); })
      .catch(() => showToast('Erreur', 'error'))
      .finally(() => setLoading(false));
  }, [search, page, filterActive]);

  useEffect(() => { load(); }, [load]);

  const doToggle = async (u: ShopUser) => {
    try { await usersApi.toggleActivation(u.id); showToast(`Compte ${u.isActive ? 'désactivé' : 'activé'}`); load(); }
    catch { showToast('Erreur', 'error'); }
  };

  const Ava = ({ u }: { u: ShopUser }) => (
    u.avatar
      ? <img src={u.avatar} alt="" className="db-avatar" />
      : <div className="db-avatar-placeholder">{u.nom[0]}{u.prenom[0]}</div>
  );

  return (
    <div className="db-card">
      <div className="db-card-head">
        <div className="db-card-title">Clients ({pagination?.total ?? '…'})</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="db-form-input" placeholder="Rechercher…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ width: 200, padding: '0.35rem 0.8rem' }} />
          <select className="db-form-input db-form-select" value={filterActive}
            onChange={e => { setFilterActive(e.target.value); setPage(1); }} style={{ width: 140, padding: '0.35rem 0.8rem' }}>
            <option value="">Tous</option>
            <option value="true">Actifs</option>
            <option value="false">Inactifs</option>
          </select>
        </div>
      </div>
      {loading ? <Loading /> : users.length === 0 ? <Empty /> : (
        <div className="db-table-wrap">
          <table>
            <thead><tr><th>Client</th><th>Email</th><th>Téléphone</th><th>Vérifié</th><th>Statut</th><th>Inscrit le</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Ava u={u} />
                      <div className="db-td-bold">{u.nom} {u.prenom}</div>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.telephone ?? '—'}</td>
                  <td><span className={`badge ${u.isVerified ? 'bg' : 'bx'}`}>{u.isVerified ? 'Oui' : 'Non'}</span></td>
                  <td><span className={`badge ${u.isActive ? 'bg' : 'br'}`}>{u.isActive ? 'Actif' : 'Inactif'}</span></td>
                  <td>{fmtDate(u.createdAt)}</td>
                  <td>
                    <button className={`db-btn-${u.isActive ? 'danger' : 'ghost'}`} onClick={() => doToggle(u)}>
                      {u.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager pagination={pagination} onChange={setPage} />
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PANEL: VENDEURS
// ════════════════════════════════════════════════════════════════════════════
const VendeursPanel = ({ showToast }: { showToast: (m: string, t?: ToastType) => void }) => {
  const [vendeurs, setVendeurs] = useState<Vendeur[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Vendeur | null>(null);
  const [modalDetail, setModalDetail] = useState(false);
  const [modalCreate, setModalCreate] = useState(false);
  const [modalRejet, setModalRejet] = useState(false);
  const [motifRejet, setMotifRejet] = useState('');
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '', telephone: '', nomBoutique: '', description: '' });

  const load = useCallback(() => {
    setLoading(true);
    vendorsApi.getAll({ search, statut: (statutFilter as any) || undefined, page, limit: 20 })
      .then(r => { setVendeurs(r?.data?.vendeurs ?? []); setPagination(r?.data?.pagination ?? null); })
      .catch(() => showToast('Erreur', 'error'))
      .finally(() => setLoading(false));
  }, [search, statutFilter, page]);

  useEffect(() => { load(); }, [load]);

  const doValiderStep1 = async (id: string) => {
    try { await vendorsApi.validerStep1(id); showToast('Étape 1 validée ✓'); load(); } catch (e: any) { showToast(e?.message ?? 'Erreur', 'error'); }
  };
  const doValiderStep2 = async (id: string) => {
    try { await vendorsApi.validerStep2(id); showToast('Vendeur entièrement validé ✓'); load(); } catch (e: any) { showToast(e?.message ?? 'Erreur', 'error'); }
  };
  const doRejeter = async () => {
    if (!selected) return;
    try { await vendorsApi.rejeter(selected.id, motifRejet); showToast('Vendeur rejeté'); setModalRejet(false); load(); }
    catch (e: any) { showToast(e?.message ?? 'Erreur', 'error'); }
  };
  const doToggle = async (v: Vendeur) => {
    try { await vendorsApi.toggleActivation(v.id); showToast(`Vendeur ${v.isActive ? 'désactivé' : 'activé'}`); load(); }
    catch { showToast('Erreur', 'error'); }
  };
  const doCreate = async () => {
    if (!form.nom || !form.email || !form.password || !form.nomBoutique) return showToast('Champs requis manquants', 'error');
    try { await vendorsApi.create(form as any); showToast('Vendeur créé ✓'); setModalCreate(false); load(); }
    catch (e: any) { showToast(e?.message ?? 'Erreur', 'error'); }
  };

  const getStatutVendeur = (v: Vendeur) => {
    const p = v.profilVendeur;
    if (!p) return { label: 'Sans profil', cls: 'bx' };
    if (p.isValidatedStep2 && p.isActive) return { label: 'Validé', cls: 'bg' };
    if (p.isValidatedStep1) return { label: 'Step 1 ✓', cls: 'bb' };
    return { label: 'En attente', cls: 'bgo' };
  };

  return (
    <>
      <div className="db-card">
        <div className="db-card-head">
          <div className="db-card-title">Vendeurs ({pagination?.total ?? '…'})</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="db-form-input" placeholder="Rechercher…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ width: 180, padding: '0.35rem 0.8rem' }} />
            <select className="db-form-input db-form-select" value={statutFilter}
              onChange={e => { setStatutFilter(e.target.value); setPage(1); }} style={{ width: 150, padding: '0.35rem 0.8rem' }}>
              <option value="">Tous</option>
              <option value="en_attente">En attente</option>
              <option value="step1">Step 1 validé</option>
              <option value="valide">Validés</option>
            </select>
            <button className="db-btn primary" onClick={() => setModalCreate(true)} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>+ Nouveau vendeur</button>
          </div>
        </div>
        {loading ? <Loading /> : vendeurs.length === 0 ? <Empty /> : (
          <div className="db-table-wrap">
            <table>
              <thead><tr><th>Vendeur</th><th>Boutique</th><th>Email</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {vendeurs.map(v => {
                  const s = getStatutVendeur(v);
                  const p = v.profilVendeur;
                  return (
                    <tr key={v.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="db-avatar-placeholder">{v.nom[0]}{v.prenom[0]}</div>
                          <div className="db-td-bold">{v.nom} {v.prenom}</div>
                        </div>
                      </td>
                      <td>{p?.nomBoutique ?? '—'}</td>
                      <td>{v.email}</td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                      <td>
                        <div className="db-actions">
                          <button className="db-btn-ghost" onClick={() => { setSelected(v); setModalDetail(true); }}>Voir</button>
                          {p && !p.isValidatedStep1 && <button className="db-btn-ghost" style={{ color: 'var(--green)' }} onClick={() => doValiderStep1(v.id)}>✓ Step1</button>}
                          {p && p.isValidatedStep1 && !p.isValidatedStep2 && <button className="db-btn-ghost" style={{ color: 'var(--green)' }} onClick={() => doValiderStep2(v.id)}>✓ Step2</button>}
                          {p && (!p.isValidatedStep2) && <button className="db-btn-danger" onClick={() => { setSelected(v); setMotifRejet(''); setModalRejet(true); }}>Rejeter</button>}
                          {p?.isValidatedStep2 && <button className={`db-btn-${v.isActive ? 'danger' : 'ghost'}`} onClick={() => doToggle(v)}>{v.isActive ? 'Désactiver' : 'Activer'}</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pager pagination={pagination} onChange={setPage} />
      </div>

      {/* Modal Détail Vendeur */}
      <Modal open={modalDetail} title={selected?.profilVendeur?.nomBoutique ?? ''} onClose={() => setModalDetail(false)} wide>
        {selected && (
          <div className="db-card-body">
            <div className="db-modal-meta">
              <div className="db-modal-meta-item">
                <div className="db-modal-meta-icon">🏪</div>
                <div>
                  <div className="db-modal-meta-label">Boutique</div>
                  <div className="db-modal-meta-value">{selected.profilVendeur?.nomBoutique ?? '—'}</div>
                </div>
              </div>
              <div className="db-modal-meta-item">
                <div className="db-modal-meta-icon">📍</div>
                <div>
                  <div className="db-modal-meta-label">Adresse boutique</div>
                  <div className="db-modal-meta-value">{selected.profilVendeur?.adresseBoutique ?? '—'}</div>
                </div>
              </div>
            </div>
            <div className="db-modal-meta" style={{ marginTop: 10 }}>
              <div className="db-modal-meta-item">
                <div className="db-modal-meta-icon">📧</div>
                <div><div className="db-modal-meta-label">Email</div><div className="db-modal-meta-value">{selected.email}</div></div>
              </div>
              <div className="db-modal-meta-item">
                <div className="db-modal-meta-icon">📱</div>
                <div><div className="db-modal-meta-label">Téléphone</div><div className="db-modal-meta-value">{selected.telephone ?? '—'}</div></div>
              </div>
            </div>
            {selected.profilVendeur?.description && (
              <div className="db-modal-section" style={{ marginTop: 12 }}>
                <div className="db-modal-section-label">Description</div>
                <div className="db-modal-section-text">{selected.profilVendeur.description}</div>
              </div>
            )}
            <div className="db-modal-stats" style={{ marginTop: 12 }}>
              <div className="db-modal-stat">
                <div className="db-modal-stat-label">Step 1</div>
                <div className="db-modal-stat-value">{selected.profilVendeur?.isValidatedStep1 ? '✓' : '—'}</div>
              </div>
              <div className="db-modal-stat-divider" />
              <div className="db-modal-stat">
                <div className="db-modal-stat-label">Step 2</div>
                <div className="db-modal-stat-value">{selected.profilVendeur?.isValidatedStep2 ? '✓' : '—'}</div>
              </div>
              <div className="db-modal-stat-divider" />
              <div className="db-modal-stat">
                <div className="db-modal-stat-label">Compte</div>
                <div className="db-modal-stat-value">{selected.isActive ? '🟢 Actif' : '🔴 Inactif'}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Créer Vendeur */}
      <Modal open={modalCreate} title="Nouveau vendeur" onClose={() => setModalCreate(false)} wide>
        <div className="db-card-body">
          <div className="db-grid-2">
            <Input label="Nom *" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
            <Input label="Prénom *" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
          </div>
          <Input label="Email *" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <Input label="Mot de passe *" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          <Input label="Téléphone" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} />
          <Input label="Nom de la boutique *" value={form.nomBoutique} onChange={e => setForm(f => ({ ...f, nomBoutique: e.target.value }))} />
          <Textarea label="Description boutique" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="db-modal-footer" style={{ padding: 0 }}>
            <button className="db-btn secondary" onClick={() => setModalCreate(false)}>Annuler</button>
            <button className="db-btn primary" onClick={doCreate}>Créer le vendeur</button>
          </div>
        </div>
      </Modal>

      {/* Modal Rejet */}
      <Modal open={modalRejet} title="Rejeter le vendeur" onClose={() => setModalRejet(false)}>
        <div className="db-card-body">
          <Textarea label="Motif de rejet (optionnel)" value={motifRejet} onChange={e => setMotifRejet(e.target.value)} placeholder="Expliquez pourquoi le dossier est refusé…" />
          <div className="db-modal-footer" style={{ padding: 0 }}>
            <button className="db-btn secondary" onClick={() => setModalRejet(false)}>Annuler</button>
            <button className="db-btn confirm" onClick={doRejeter}>Rejeter</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PANEL: BANNIÈRES
// ════════════════════════════════════════════════════════════════════════════
const BannièresPanel = ({ showToast }: { showToast: (m: string, t?: ToastType) => void }) => {
  const [bannieres, setBannieres] = useState<Banniere[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banniere | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Banniere | null>(null);
  const [form, setForm] = useState({ titre: '', lien: '', ordre: '1' });
  const [file, setFile] = useState<File | null>(null);

  const load = () => {
    setLoading(true);
    bannièresApi.getAll()
      .then(r => setBannieres(r?.data?.bannieres ?? []))
      .catch(() => showToast('Erreur', 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ titre: '', lien: '', ordre: '1' }); setFile(null); setModalOpen(true); };
  const openEdit = (b: Banniere) => { setEditing(b); setForm({ titre: b.titre, lien: b.lien ?? '', ordre: String(b.ordre) }); setFile(null); setModalOpen(true); };

  const doSave = async () => {
    if (!form.titre.trim()) return showToast('Titre requis', 'error');
    try {
      if (editing) {
        const data: any = { titre: form.titre, lien: form.lien, ordre: parseInt(form.ordre) };
        if (file) { const fd = new FormData(); Object.entries(data).forEach(([k, v]) => fd.append(k, String(v))); fd.append('image', file); await bannièresApi.update(editing.id, fd); }
        else await bannièresApi.update(editing.id, data);
      } else {
        if (!file) return showToast('Image requise', 'error');
        const fd = new FormData(); fd.append('titre', form.titre); fd.append('lien', form.lien); fd.append('ordre', form.ordre); fd.append('image', file);
        await bannièresApi.create(fd);
      }
      showToast(editing ? 'Bannière mise à jour' : 'Bannière créée');
      setModalOpen(false); load();
    } catch (e: any) { showToast(e?.message ?? 'Erreur', 'error'); }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    try { await bannièresApi.delete(confirmDelete.id); showToast('Bannière supprimée'); setConfirmDelete(null); load(); }
    catch { showToast('Erreur', 'error'); }
  };

  const doToggle = async (b: Banniere) => {
    try { await bannièresApi.toggleActive(b.id); showToast('Statut modifié'); load(); } catch { showToast('Erreur', 'error'); }
  };

  return (
    <>
      <div className="db-card">
        <div className="db-card-head">
          <div className="db-card-title">Bannières ({bannieres.length})</div>
          <button className="db-btn primary" onClick={openCreate} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>+ Nouvelle bannière</button>
        </div>
        {loading ? <Loading /> : bannieres.length === 0 ? <Empty /> : (
          <div className="db-table-wrap">
            <table>
              <thead><tr><th>Image</th><th>Titre</th><th>Lien</th><th>Ordre</th><th>Active</th><th>Actions</th></tr></thead>
              <tbody>
                {bannieres.map(b => (
                  <tr key={b.id}>
                    <td><img src={b.image} alt={b.titre} style={{ width: 80, height: 40, objectFit: 'cover', borderRadius: 6 }} /></td>
                    <td className="db-td-bold">{b.titre}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{b.lien ?? '—'}</td>
                    <td>{b.ordre}</td>
                    <td>
                      <button className={`badge ${b.isActive ? 'bg' : 'br'}`} onClick={() => doToggle(b)} style={{ cursor: 'pointer', border: 'none' }}>
                        {b.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="db-actions">
                        <button className="db-btn-ghost" onClick={() => openEdit(b)}>Modifier</button>
                        <button className="db-btn-danger" onClick={() => setConfirmDelete(b)}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title={editing ? 'Modifier la bannière' : 'Nouvelle bannière'} onClose={() => setModalOpen(false)}>
        <div className="db-card-body">
          <Input label="Titre *" value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} />
          <Input label="Lien (optionnel)" value={form.lien} onChange={e => setForm(f => ({ ...f, lien: e.target.value }))} placeholder="https://…" />
          <Input label="Ordre d'affichage" type="number" min="1" value={form.ordre} onChange={e => setForm(f => ({ ...f, ordre: e.target.value }))} />
          <div className="db-form-group">
            <label className="db-form-label">Image {editing ? '(laisser vide pour garder l\'actuelle)' : '*'}</label>
            <input type="file" accept="image/*" className="db-form-input" onChange={e => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="db-modal-footer" style={{ padding: 0 }}>
            <button className="db-btn secondary" onClick={() => setModalOpen(false)}>Annuler</button>
            <button className="db-btn primary" onClick={doSave}>Enregistrer</button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!confirmDelete} title="Supprimer la bannière" danger
        message={`Supprimer la bannière "${confirmDelete?.titre}" ?`}
        onConfirm={doDelete} onClose={() => setConfirmDelete(null)} />
    </>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PANEL: PROMOTIONS
// ════════════════════════════════════════════════════════════════════════════
const PromotionsPanel = ({ showToast }: { showToast: (m: string, t?: ToastType) => void }) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sectionFilter, setSectionFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Promotion | null>(null);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [form, setForm] = useState({ produitId: '', section: 'nos_promos_du_moment', ordre: '1', prixPromo: '', pourcentageReduction: '', dateDebut: '', dateFin: '' });

  const SECTIONS = [
    { value: 'nos_promos_du_moment', label: 'Promos du moment' },
    { value: 'a_ne_pas_rater', label: 'À ne pas rater' },
    { value: 'nos_promos_a_venir', label: 'Promos à venir' },
  ];

  const load = useCallback(() => {
    setLoading(true);
    promotionsApi.getAll({ section: (sectionFilter as any) || undefined, page, limit: 20 })
      .then(r => { setPromotions(r?.data?.promotions ?? []); setPagination(r?.data?.pagination ?? null); })
      .catch(() => showToast('Erreur', 'error'))
      .finally(() => setLoading(false));
  }, [sectionFilter, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    productsApi.getAll({ isActive: true, limit: 100 } as any).then(r => setProduits(r?.data?.produits ?? [])).catch(() => {});
  }, []);

  const openCreate = () => { setEditing(null); setForm({ produitId: '', section: 'nos_promos_du_moment', ordre: '1', prixPromo: '', pourcentageReduction: '', dateDebut: '', dateFin: '' }); setModalOpen(true); };
  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({ produitId: p.produitId, section: p.section, ordre: String(p.ordre), prixPromo: p.prixPromo ? String(p.prixPromo) : '', pourcentageReduction: p.pourcentageReduction ? String(p.pourcentageReduction) : '', dateDebut: p.dateDebut?.slice(0, 10) ?? '', dateFin: p.dateFin?.slice(0, 10) ?? '' });
    setModalOpen(true);
  };

  const doSave = async () => {
    if (!form.produitId || !form.section) return showToast('Champs requis manquants', 'error');
    try {
      const data: any = { produitId: form.produitId, section: form.section, ordre: parseInt(form.ordre) };
      if (form.prixPromo) data.prixPromo = parseFloat(form.prixPromo);
      if (form.pourcentageReduction) data.pourcentageReduction = parseFloat(form.pourcentageReduction);
      if (form.dateDebut) data.dateDebut = form.dateDebut;
      if (form.dateFin) data.dateFin = form.dateFin;
      if (editing) await promotionsApi.update(editing.id, data);
      else await promotionsApi.create(data);
      showToast(editing ? 'Promotion mise à jour' : 'Promotion créée');
      setModalOpen(false); load();
    } catch (e: any) { showToast(e?.message ?? 'Erreur', 'error'); }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    try { await promotionsApi.delete(confirmDelete.id); showToast('Promotion supprimée'); setConfirmDelete(null); load(); }
    catch { showToast('Erreur', 'error'); }
  };

  const doToggle = async (p: Promotion) => {
    try { await promotionsApi.toggleActive(p.id); showToast('Statut modifié'); load(); } catch { showToast('Erreur', 'error'); }
  };

  return (
    <>
      <div className="db-card">
        <div className="db-card-head">
          <div className="db-card-title">Promotions ({pagination?.total ?? '…'})</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="db-form-input db-form-select" value={sectionFilter}
              onChange={e => { setSectionFilter(e.target.value); setPage(1); }} style={{ width: 180, padding: '0.35rem 0.8rem' }}>
              <option value="">Toutes sections</option>
              {SECTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button className="db-btn primary" onClick={openCreate} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>+ Nouvelle promo</button>
          </div>
        </div>
        {loading ? <Loading /> : promotions.length === 0 ? <Empty /> : (
          <div className="db-table-wrap">
            <table>
              <thead><tr><th>Produit</th><th>Section</th><th>Prix promo</th><th>Réduction</th><th>Période</th><th>Active</th><th>Actions</th></tr></thead>
              <tbody>
                {promotions.map(p => (
                  <tr key={p.id}>
                    <td className="db-td-bold">{p.produit?.nom ?? p.produitId}</td>
                    <td><span className="badge bb">{SECTIONS.find(s => s.value === p.section)?.label ?? p.section}</span></td>
                    <td>{p.prixPromo ? fmtMontant(p.prixPromo) : '—'}</td>
                    <td>{p.pourcentageReduction ? `${p.pourcentageReduction}%` : '—'}</td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {p.dateDebut ? fmtDate(p.dateDebut) : '—'} → {p.dateFin ? fmtDate(p.dateFin) : '—'}
                    </td>
                    <td>
                      <button className={`badge ${p.isActive ? 'bg' : 'br'}`} onClick={() => doToggle(p)} style={{ cursor: 'pointer', border: 'none' }}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="db-actions">
                        <button className="db-btn-ghost" onClick={() => openEdit(p)}>Modifier</button>
                        <button className="db-btn-danger" onClick={() => setConfirmDelete(p)}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager pagination={pagination} onChange={setPage} />
      </div>

      <Modal open={modalOpen} title={editing ? 'Modifier la promotion' : 'Nouvelle promotion'} onClose={() => setModalOpen(false)} wide>
        <div className="db-card-body">
          <Select label="Produit *" value={form.produitId} onChange={e => setForm(f => ({ ...f, produitId: e.target.value }))}>
            <option value="">— Sélectionner —</option>
            {produits.map(p => <option key={p.id} value={p.id}>{p.nom} ({fmtMontant(p.prix)})</option>)}
          </Select>
          <Select label="Section *" value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))}>
            {SECTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
          <div className="db-grid-2">
            <Input label="Prix promo (FCFA)" type="number" min="0" value={form.prixPromo} onChange={e => setForm(f => ({ ...f, prixPromo: e.target.value }))} placeholder="Optionnel" />
            <Input label="Réduction (%)" type="number" min="1" max="100" value={form.pourcentageReduction} onChange={e => setForm(f => ({ ...f, pourcentageReduction: e.target.value }))} placeholder="Optionnel" />
          </div>
          <div className="db-grid-2">
            <Input label="Date début" type="date" value={form.dateDebut} onChange={e => setForm(f => ({ ...f, dateDebut: e.target.value }))} />
            <Input label="Date fin" type="date" value={form.dateFin} onChange={e => setForm(f => ({ ...f, dateFin: e.target.value }))} />
          </div>
          <Input label="Ordre d'affichage" type="number" min="1" value={form.ordre} onChange={e => setForm(f => ({ ...f, ordre: e.target.value }))} />
          <div className="db-modal-footer" style={{ padding: 0 }}>
            <button className="db-btn secondary" onClick={() => setModalOpen(false)}>Annuler</button>
            <button className="db-btn primary" onClick={doSave}>Enregistrer</button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!confirmDelete} title="Supprimer la promotion" danger
        message={`Supprimer cette promotion pour "${confirmDelete?.produit?.nom ?? 'ce produit'}" ?`}
        onConfirm={doDelete} onClose={() => setConfirmDelete(null)} />
    </>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PANEL: FRAIS DE LIVRAISON
// ════════════════════════════════════════════════════════════════════════════
const FraisLivraisonPanel = ({ showToast }: { showToast: (m: string, t?: ToastType) => void }) => {
  const [frais, setFrais] = useState<FraisLivraison[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FraisLivraison | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<FraisLivraison | null>(null);
  const [form, setForm] = useState({ ville: '', montant: '' });

  const load = () => {
    setLoading(true);
    fraisLivraisonApi.getAll()
      .then(r => setFrais(r?.data?.fraisLivraison ?? []))
      .catch(() => showToast('Erreur', 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ ville: '', montant: '' }); setModalOpen(true); };
  const openEdit = (f: FraisLivraison) => { setEditing(f); setForm({ ville: f.ville, montant: String(f.montant) }); setModalOpen(true); };

  const doSave = async () => {
    if (!form.ville.trim() || !form.montant) return showToast('Champs requis manquants', 'error');
    try {
      const data = { ville: form.ville, montant: parseFloat(form.montant) };
      if (editing) await fraisLivraisonApi.update(editing.id, data);
      else await fraisLivraisonApi.create(data);
      showToast(editing ? 'Frais mis à jour' : 'Frais créé');
      setModalOpen(false); load();
    } catch (e: any) { showToast(e?.message ?? 'Erreur', 'error'); }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    try { await fraisLivraisonApi.delete(confirmDelete.id); showToast('Frais supprimé'); setConfirmDelete(null); load(); }
    catch { showToast('Erreur', 'error'); }
  };

  const doToggle = async (f: FraisLivraison) => {
    try { await fraisLivraisonApi.toggleActive(f.id); showToast('Statut modifié'); load(); } catch { showToast('Erreur', 'error'); }
  };

  return (
    <>
      <div className="db-card">
        <div className="db-card-head">
          <div className="db-card-title">Frais de livraison ({frais.length})</div>
          <button className="db-btn primary" onClick={openCreate} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>+ Ajouter une ville</button>
        </div>
        {loading ? <Loading /> : frais.length === 0 ? <Empty msg="Aucun tarif de livraison configuré" /> : (
          <div className="db-table-wrap">
            <table>
              <thead><tr><th>Ville</th><th>Montant</th><th>Actif</th><th>Actions</th></tr></thead>
              <tbody>
                {frais.map(f => (
                  <tr key={f.id}>
                    <td className="db-td-bold">{f.ville}</td>
                    <td>{fmtMontant(f.montant)}</td>
                    <td>
                      <button className={`badge ${f.isActive ? 'bg' : 'br'}`} onClick={() => doToggle(f)} style={{ cursor: 'pointer', border: 'none' }}>
                        {f.isActive ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td>
                      <div className="db-actions">
                        <button className="db-btn-ghost" onClick={() => openEdit(f)}>Modifier</button>
                        <button className="db-btn-danger" onClick={() => setConfirmDelete(f)}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title={editing ? 'Modifier le tarif' : 'Nouveau tarif de livraison'} onClose={() => setModalOpen(false)}>
        <div className="db-card-body">
          <Input label="Ville *" value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} placeholder="Ex: Dakar" />
          <Input label="Montant (FCFA) *" type="number" min="0" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} placeholder="Ex: 2000" />
          <div className="db-modal-footer" style={{ padding: 0 }}>
            <button className="db-btn secondary" onClick={() => setModalOpen(false)}>Annuler</button>
            <button className="db-btn primary" onClick={doSave}>Enregistrer</button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!confirmDelete} title="Supprimer le tarif" danger
        message={`Supprimer le tarif pour "${confirmDelete?.ville}" ?`}
        onConfirm={doDelete} onClose={() => setConfirmDelete(null)} />
    </>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// NAVIGATION CONFIG
// ════════════════════════════════════════════════════════════════════════════
type PageId = 'overview' | 'produits' | 'categories' | 'commandes' | 'paiements' | 'avis' | 'clients' | 'vendeurs' | 'bannieres' | 'promotions' | 'frais_livraison';

interface NavItem {
  id?: PageId;
  label?: string;
  icon?: React.ReactNode;
  section?: string;
}

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d={d} />
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  { section: 'Tableau de bord' },
  { id: 'overview', label: 'Vue d\'ensemble', icon: <Icon d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" /> },
  { section: 'Catalogue' },
  { id: 'produits', label: 'Produits', icon: <Icon d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /> },
  { id: 'categories', label: 'Catégories', icon: <Icon d="M4 6h16M4 10h16M4 14h16M4 18h16" /> },
  { section: 'Commerce' },
  { id: 'commandes', label: 'Commandes', icon: <Icon d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /> },
  { id: 'paiements', label: 'Paiements', icon: <Icon d="M1 4h22v16H1zM1 10h22" /> },
  { id: 'avis', label: 'Avis clients', icon: <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /> },
  { section: 'Utilisateurs' },
  { id: 'clients', label: 'Clients', icon: <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /> },
  { id: 'vendeurs', label: 'Vendeurs', icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
  { section: 'Marketing' },
  { id: 'bannieres', label: 'Bannières', icon: <Icon d="M4 3h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /> },
  { id: 'promotions', label: 'Promotions', icon: <Icon d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /> },
  { id: 'frais_livraison', label: 'Frais livraison', icon: <Icon d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3m-1 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /> },
];

const PAGE_META: Record<PageId, { title: string; sub: string }> = {
  overview:       { title: 'Vue d\'ensemble', sub: 'Aperçu global de votre boutique' },
  produits:       { title: 'Produits', sub: 'Gestion du catalogue produits' },
  categories:     { title: 'Catégories', sub: 'Organisation du catalogue' },
  commandes:      { title: 'Commandes', sub: 'Suivi et traitement des commandes' },
  paiements:      { title: 'Paiements', sub: 'Suivi des transactions' },
  avis:           { title: 'Avis clients', sub: 'Modération des avis produits' },
  clients:        { title: 'Clients', sub: 'Gestion des comptes clients' },
  vendeurs:       { title: 'Vendeurs', sub: 'Validation et gestion des vendeurs' },
  bannieres:      { title: 'Bannières', sub: 'Diaporama de la page d\'accueil' },
  promotions:     { title: 'Promotions', sub: 'Produits mis en avant par section' },
  frais_livraison:{ title: 'Frais de livraison', sub: 'Tarifs par ville de livraison' },
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export const ShopDashboard = () => {
  const [page, setPage] = useState<PageId>('overview');
  const [sbOpen, setSbOpen] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast, show: showToast } = useToast();

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const renderPanel = () => {
    const props = { showToast };
    switch (page) {
      case 'overview':        return <OverviewPanel {...props} />;
      case 'produits':        return <ProduitsPanel {...props} />;
      case 'categories':      return <CategoriesPanel {...props} />;
      case 'commandes':       return <CommandesPanel {...props} />;
      case 'paiements':       return <PaiementsPanel {...props} />;
      case 'avis':            return <AvisPanel {...props} />;
      case 'clients':         return <ClientsPanel {...props} />;
      case 'vendeurs':        return <VendeursPanel {...props} />;
      case 'bannieres':       return <BannièresPanel {...props} />;
      case 'promotions':      return <PromotionsPanel {...props} />;
      case 'frais_livraison': return <FraisLivraisonPanel {...props} />;
    }
  };

  return (
    <div className="db-app boutique">
      <aside className={`db-sb${sbOpen ? '' : ' closed'}`}>
        <div className="db-sb-top">
          <img className="db-sb-logo" src={LOGO} alt="Yobante" />
          <div className="db-sb-brand">
            <div className="db-sb-name">Yobante</div>
            <div className="db-sb-sub">Boutique Admin</div>
          </div>
          <button className="db-sb-toggle" onClick={() => setSbOpen(o => !o)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        <nav className="db-nav">
          {NAV_ITEMS.map((item, i) =>
            'section' in item && !item.id ? (
              <div key={i} className="db-nav-section">{item.section}</div>
            ) : item.id ? (
              <div key={item.id} className={`db-nav-item${page === item.id ? ' active' : ''}`}
                data-label={item.label} onClick={() => setPage(item.id!)}>
                {item.icon}
                <span className="db-nav-label">{item.label}</span>
              </div>
            ) : null
          )}
        </nav>

        <div className="db-sb-foot">
          <div className="db-admin-pill">
            <div className="db-admin-ava">
              {user ? `${user.nom[0]}${user.prenom[0]}`.toUpperCase() : 'A'}
            </div>
            <div className="db-admin-info">
              <div className="db-admin-name">{user ? `${user.nom} ${user.prenom}` : 'Admin'}</div>
              <div className="db-admin-role">Administrateur</div>
            </div>
            <button className="db-logout-btn" onClick={handleLogout} title="Déconnexion">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <div className={`db-main${sbOpen ? '' : ' wide'}`}>
        <div className="db-topbar">
          <div>
            <div className="db-page-title">{PAGE_META[page].title}</div>
            <div className="db-page-sub">{PAGE_META[page].sub}</div>
          </div>
          <div className="db-topbar-right">
            <button className="db-icon-btn" onClick={() => navigate('/select-app')} title="Changer d'application">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="db-content">
          <div className="db-panel active">
            {renderPanel()}
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`db-toast${toast.show ? ' show' : ''}`} style={{ borderLeftColor: toast.type === 'error' ? 'var(--red)' : 'var(--green)' }}>
        <div className="db-toast-icon" style={{ background: toast.type === 'error' ? 'var(--red)' : 'var(--green)' }}>
          {toast.type === 'error'
            ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>
          }
        </div>
        {toast.msg}
      </div>
    </div>
  );
};
