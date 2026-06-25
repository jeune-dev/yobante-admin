import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import { useDashboard } from '@/domains/shop/hooks/useDashboard';
import { ProductsPage } from '@/pages/shop/products/ProductsPage';
import { OrdersPage } from '@/pages/shop/orders/OrdersPage';
import { UsersPage } from '@/pages/shop/users/UsersPage';
import { ReviewsPage } from '@/pages/shop/reviews/ReviewsPage';
import { PaymentsPage } from '@/pages/shop/payments/PaymentsPage';
import '@/assets/css/Dashboard.css';
import LOGO from '@/assets/images/logo.png';

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k';
  return String(n);
}

function fmtFcfa(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

const NAV_ITEMS = [
  { section: 'Tableau de bord' },
  { id: 'overview', label: 'Vue d\'ensemble', icon: 'grid' },
  { section: 'Gestion Boutique' },
  { id: 'produits', label: 'Produits', icon: 'box' },
  { id: 'commandes', label: 'Commandes', icon: 'check' },
  { id: 'clients', label: 'Clients', icon: 'users' },
  { id: 'avis', label: 'Avis', icon: 'star' },
  { id: 'paiements', label: 'Paiements', icon: 'credit' },
];

const PAGES: Record<string, { t: string; s: string }> = {
  overview: { t: 'Vue d\'ensemble', s: 'Aperçu global de votre boutique' },
  produits: { t: 'Produits', s: 'Gestion de vos produits' },
  commandes: { t: 'Commandes', s: 'Suivi de vos commandes' },
  clients: { t: 'Clients', s: 'Gestion de vos clients' },
  avis: { t: 'Avis', s: 'Avis des clients' },
  paiements: { t: 'Paiements', s: 'Historique des paiements' },
};

function NavIcon({ id }: { id: string }) {
  const p = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 as any };
  if (id === 'grid') return <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
  if (id === 'box') return <svg {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
  if (id === 'check') return <svg {...p}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
  if (id === 'users') return <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  if (id === 'star') return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  if (id === 'credit') return <svg {...p}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
  return <svg {...p}><circle cx="12" cy="12" r="10"/></svg>;
}

export const ShopDashboard = () => {
  const [page, setPage] = useState('overview');
  const [sbOpen, setSbOpen] = useState(true);
  const [toast, setToast] = useState({ msg: '', show: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { stats, revenus, topProduits, stockAlertes } = useDashboard();

  const showToast = (msg: string) => {
    setToast({ msg, show: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2800);
  };

  void showToast; // referenced to avoid lint unused warning

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const s = stats.data as any;
  const revData = (revenus.data ?? []) as any[];
  const topData = (topProduits.data ?? []) as any[];
  const alertData = (stockAlertes.data ?? []) as any[];

  const maxRev = Math.max(...revData.map((r: any) => r.total), 1);
  const revByMonth: Record<number, number> = {};
  revData.forEach((r: any) => {
    const m = new Date(r.month).getMonth();
    revByMonth[m] = r.total;
  });

  const statCards = [
    {
      label: 'Chiffre d\'affaires', color: 'gold',
      value: s ? fmtFcfa(Number(s.totalSales)) : '—',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    },
    {
      label: 'Commandes', color: 'blue',
      value: s ? fmt(s.totalCommandes) : '—',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    },
    {
      label: 'Clients', color: 'green',
      value: s ? fmt(s.totalUsers) : '—',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
    },
    {
      label: 'Produits', color: 'blue',
      value: s ? fmt(s.totalProduits) : '—',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    },
    {
      label: 'Avis clients', color: 'gold',
      value: s ? fmt(s.totalAvis) : '—',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    },
  ];

  return (
    <div className="db-app boutique">
      {/* ── SIDEBAR ── */}
      <aside className={`db-sb${sbOpen ? '' : ' closed'}`}>
        <div className="db-sb-top">
          <img className="db-sb-logo" src={LOGO} alt="Yobante" />
          <div className="db-sb-brand">
            <div className="db-sb-name">Yobante</div>
            <div className="db-sb-sub">Boutique</div>
          </div>
          <button className="db-sb-toggle" onClick={() => setSbOpen(!sbOpen)} title="Réduire / Agrandir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        <nav className="db-nav">
          {NAV_ITEMS.map((item, i) =>
            'section' in item ? (
              <div key={i} className="db-nav-section">{item.section}</div>
            ) : (
              <div
                key={item.id}
                className={`db-nav-item${page === item.id ? ' active' : ''}`}
                data-label={item.label}
                onClick={() => setPage(item.id!)}
              >
                <NavIcon id={item.icon!} />
                <span className="db-nav-label">{item.label}</span>
              </div>
            )
          )}
        </nav>

        <div className="db-sb-foot">
          <div className="db-admin-pill">
            <div className="db-admin-ava">
              {user ? `${user.nom[0]}${user.prenom[0]}`.toUpperCase() : 'A'}
            </div>
            <div className="db-admin-info">
              <div className="db-admin-name">{user ? `${user.nom} ${user.prenom}` : 'Admin'}</div>
              <div className="db-admin-role">{user?.role || 'Admin'}</div>
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

      {/* ── MAIN ── */}
      <div className={`db-main${sbOpen ? '' : ' wide'}`}>
        <div className="db-topbar">
          <div>
            <div className="db-page-title">{PAGES[page]?.t || 'Dashboard'}</div>
            <div className="db-page-sub">{PAGES[page]?.s || ''}</div>
          </div>
        </div>

        <div className="db-content">
          {/* OVERVIEW */}
          {page === 'overview' && (
            <div className="db-panel active">
              {/* Stat cards */}
              {stats.isLoading ? (
                <div className="db-card" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text3)' }}>
                  Chargement des statistiques…
                </div>
              ) : stats.isError ? (
                <div className="db-card" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--red)' }}>
                  Impossible de charger les statistiques.
                </div>
              ) : (
                <div className="db-stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                  {statCards.map((card, i) => (
                    <div key={i} className="db-stat-card">
                      <div className={`db-stat-icon ${card.color}`}>{card.icon}</div>
                      <div className="db-stat-value">{card.value}</div>
                      <div className="db-stat-label">{card.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Revenus + Alertes stock */}
              <div className="db-charts-row">
                {/* Bar chart revenus */}
                <div className="db-card">
                  <div className="db-card-head">
                    <span className="db-card-title">Revenus mensuels</span>
                    {revenus.isFetching && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>actualisation…</span>
                    )}
                  </div>
                  <div className="db-card-body">
                    {revenus.isLoading ? (
                      <div style={{ color: 'var(--text3)', fontSize: '0.87rem' }}>Chargement…</div>
                    ) : revData.length === 0 ? (
                      <div style={{ color: 'var(--text3)', fontSize: '0.87rem', textAlign: 'center', padding: '1.5rem 0' }}>
                        Aucune donnée de revenu encore.
                      </div>
                    ) : (
                      <>
                        <div className="db-bar-chart">
                          {MONTHS.map((_, mi) => {
                            const val = revByMonth[mi] ?? 0;
                            const pct = (val / maxRev) * 100;
                            return (
                              <div key={mi} className="db-bar-col" title={`${MONTHS[mi]}: ${fmtFcfa(val)}`}>
                                <div className="db-bar-el" style={{ height: `${Math.max(pct, 2)}%` }} />
                              </div>
                            );
                          })}
                        </div>
                        <div className="db-bar-labels">
                          {MONTHS.map((m, mi) => (
                            <div key={mi} className="db-bar-label">{m}</div>
                          ))}
                        </div>
                        <div style={{ marginTop: '0.7rem', fontSize: '0.8rem', color: 'var(--text3)' }}>
                          Total annuel :{' '}
                          <strong style={{ color: 'var(--black)' }}>
                            {fmtFcfa(revData.reduce((a: number, r: any) => a + r.total, 0))}
                          </strong>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Alertes stock */}
                <div className="db-card">
                  <div className="db-card-head">
                    <span className="db-card-title">Alertes stock</span>
                    {alertData.length > 0 && (
                      <span className="badge br">{alertData.length} produit{alertData.length > 1 ? 's' : ''}</span>
                    )}
                  </div>
                  <div className="db-card-body">
                    {stockAlertes.isLoading ? (
                      <div style={{ color: 'var(--text3)', fontSize: '0.87rem' }}>Chargement…</div>
                    ) : alertData.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                          style={{ width: 28, height: 28, marginBottom: 6, color: 'var(--green)' }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <p style={{ color: 'var(--text3)', fontSize: '0.87rem' }}>Tous les stocks sont OK.</p>
                      </div>
                    ) : (
                      <div className="db-act-list">
                        {alertData.slice(0, 6).map((p: any) => (
                          <div key={p.id} className="db-act-row">
                            <div className="db-act-dot"
                              style={{ background: p.stock === 0 ? 'var(--red)' : 'var(--gold)' }} />
                            <div className="db-act-text"><span>{p.nom}</span></div>
                            <div style={{
                              fontSize: '0.78rem', fontWeight: 700,
                              color: p.stock === 0 ? 'var(--red)' : 'var(--gold)'
                            }}>
                              {p.stock === 0 ? 'Rupture' : `${p.stock} restant${p.stock > 1 ? 's' : ''}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top produits */}
              <div className="db-card">
                <div className="db-card-head">
                  <span className="db-card-title">Top 5 produits vendus</span>
                </div>
                {topProduits.isLoading ? (
                  <div style={{ padding: '1.5rem', color: 'var(--text3)', fontSize: '0.87rem' }}>Chargement…</div>
                ) : topData.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text3)', fontSize: '0.87rem' }}>
                    Aucune vente enregistrée pour l'instant.
                  </div>
                ) : (
                  <div className="db-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Produit</th>
                          <th>Prix unitaire</th>
                          <th>Quantité vendue</th>
                          <th>Revenu estimé</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topData.map((item: any, i: number) => (
                          <tr key={item.produit?.id ?? i}>
                            <td style={{ color: 'var(--text3)', fontWeight: 700 }}>{i + 1}</td>
                            <td className="db-td-bold">{item.produit?.nom ?? '—'}</td>
                            <td>{item.produit?.prix ? fmtFcfa(item.produit.prix) : '—'}</td>
                            <td><span className="badge bb">{item.quantite} unités</span></td>
                            <td className="db-td-bold">
                              {item.produit?.prix ? fmtFcfa(item.produit.prix * item.quantite) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Produits */}
          {page === 'produits' && (
            <div className="db-panel active">
              <ProductsPage />
            </div>
          )}

          {/* Commandes */}
          {page === 'commandes' && (
            <div className="db-panel active">
              <OrdersPage />
            </div>
          )}

          {/* Clients */}
          {page === 'clients' && (
            <div className="db-panel active">
              <UsersPage />
            </div>
          )}

          {/* Avis */}
          {page === 'avis' && (
            <div className="db-panel active">
              <ReviewsPage />
            </div>
          )}

          {/* Paiements */}
          {page === 'paiements' && (
            <div className="db-panel active">
              <PaymentsPage />
            </div>
          )}

          {/* Pages en développement */}
          {page !== 'overview' && page !== 'produits' && page !== 'commandes' && page !== 'clients' && page !== 'avis' && page !== 'paiements' && (
            <div className="db-panel active">
              <div className="db-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                  style={{ width: 44, height: 44, color: 'var(--text3)', marginBottom: '0.8rem' }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p style={{ color: 'var(--text2)', fontWeight: 600 }}>Section en développement</p>
                <p style={{ color: 'var(--text3)', fontSize: '0.85rem', marginTop: 4 }}>
                  Cette page sera disponible prochainement.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`db-toast${toast.show ? ' show' : ''}`}>
        <div className="db-toast-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        {toast.msg}
      </div>
    </div>
  );
};
