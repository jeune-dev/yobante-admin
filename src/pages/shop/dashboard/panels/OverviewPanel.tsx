import React from 'react';
import { useDashboardOverview, useDashboardStats } from '@/domains/shop/hooks/useAdminBoutique';
import Icon from '@/shared/components/dashboard/Icon';
import { fcfa } from './_state';

const card = (): React.CSSProperties => ({
  background: '#fff',
  padding: '1.1rem',
  borderRadius: 12,
  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
});

const iconBox = (color: string): React.CSSProperties => ({
  width: 40,
  height: 40,
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `${color}18`,
  color,
  marginBottom: 8,
});

export default function OverviewPanel() {
  const overview = useDashboardOverview();
  const fallback = useDashboardStats();

  // Si /overview n'est pas encore déployé, on se rabat sur /stats
  const isLoading = overview.isLoading || (overview.isError && fallback.isLoading);
  const isError   = overview.isError && fallback.isError;
  const d         = ((overview.isError ? fallback.data : overview.data) ?? overview.data) as any;

  const kpis = [
    { label: 'Total clients',       value: d?.totalClients       ?? 0,           icon: 'users',          color: '#7c3aed' },
    { label: 'Total vendeurs',      value: d?.totalVendeurs      ?? 0,           icon: 'store',          color: '#8b5cf6' },
    { label: 'Total catégories',    value: d?.totalCategories    ?? 0,           icon: 'list',           color: '#2a7fac' },
    { label: 'Total produits',      value: d?.totalProduits      ?? 0,           icon: 'shopping-bag',   color: '#0891b2' },
    { label: 'Total commandes',     value: d?.totalCommandes     ?? 0,           icon: 'package',        color: '#059669' },
    { label: "Chiffre d'affaires",  value: fcfa(d?.chiffreAffaires ?? 0),       icon: 'coins',          color: '#b8860b' },
    { label: 'Produits en attente', value: d?.produitsEnAttente  ?? 0,           icon: 'alert-triangle', color: '#d97706' },
    { label: 'Rupture de stock',    value: d?.produitsEnRupture  ?? 0,           icon: 'alert-triangle', color: '#dc2626' },
  ];

  const tops: any[]    = d?.topProduits   ?? [];
  const clients: any[] = d?.clientsActifs ?? [];

  if (isError) {
    return (
      <div className="db-card" style={{ padding: '1rem', color: '#991b1b' }}>
        Impossible de charger les statistiques.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 8 KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {kpis.map((k) => (
          <div key={k.label} style={card()}>
            <div style={iconBox(k.color)}>
              <Icon name={k.icon} size={20} />
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
              {isLoading ? '…' : k.value}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#777' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tableaux */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Top 5 produits vendus */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 10px rgba(0,0,0,0.05)', padding: '1.2rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Top 5 produits vendus</div>
          {isLoading ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '2rem 0' }}>Chargement…</p>
          ) : tops.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '2rem 0' }}>Aucune donnée</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f0f0f0', color: '#888' }}>
                  <th style={{ textAlign: 'left', paddingBottom: 8 }}>Produit</th>
                  <th style={{ textAlign: 'right', paddingBottom: 8 }}>Ventes</th>
                  <th style={{ textAlign: 'right', paddingBottom: 8 }}>Prix</th>
                </tr>
              </thead>
              <tbody>
                {tops.slice(0, 5).map((p: any, i: number) => (
                  <tr key={p.produitId ?? i} style={{ borderBottom: '1px solid #f8f8f8' }}>
                    <td style={{ padding: '8px 0' }}>{p.nom ?? '—'}</td>
                    <td style={{ textAlign: 'right', padding: '8px 0', fontWeight: 600 }}>{p.totalVendu ?? 0}</td>
                    <td style={{ textAlign: 'right', padding: '8px 0', color: '#059669', fontWeight: 600 }}>
                      {fcfa(p.prix ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top 5 clients actifs */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 10px rgba(0,0,0,0.05)', padding: '1.2rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Top clients actifs</div>
          {isLoading ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '2rem 0' }}>Chargement…</p>
          ) : clients.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '2rem 0' }}>Aucune donnée</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f0f0f0', color: '#888' }}>
                  <th style={{ textAlign: 'left', paddingBottom: 8 }}>Client</th>
                  <th style={{ textAlign: 'left', paddingBottom: 8 }}>Email</th>
                  <th style={{ textAlign: 'right', paddingBottom: 8 }}>Commandes</th>
                </tr>
              </thead>
              <tbody>
                {clients.slice(0, 5).map((c: any, i: number) => (
                  <tr key={c.userId ?? i} style={{ borderBottom: '1px solid #f8f8f8' }}>
                    <td style={{ padding: '8px 0' }}>{`${c.prenom ?? ''} ${c.nom ?? ''}`.trim() || '—'}</td>
                    <td style={{ padding: '8px 0', color: '#555', fontSize: '0.82rem' }}>{c.email ?? '—'}</td>
                    <td style={{ textAlign: 'right', padding: '8px 0', fontWeight: 600, color: '#7c3aed' }}>
                      {c.nbCommandes ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
