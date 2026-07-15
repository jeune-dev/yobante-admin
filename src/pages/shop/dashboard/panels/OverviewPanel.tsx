import React from 'react';
import {
  useDashboardOverview, useDashboardStats,
  useVendeurs, useCategories, useProduits,
  useRevenus, useCommandesParStatut,
} from '@/domains/shop/hooks/useAdminBoutique';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import Icon from '@/shared/components/dashboard/Icon';
import { fcfa } from './_state';

const MOIS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

const STATUT_COLORS: Record<string, string> = {
  en_attente:  '#f59e0b',
  confirmee:   '#3b82f6',
  en_cours:    '#8b5cf6',
  expediee:    '#0891b2',
  livree:      '#10b981',
  annulee:     '#ef4444',
};
const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente', confirmee: 'Confirmée', en_cours: 'En cours',
  expediee: 'Expédiée', livree: 'Livrée', annulee: 'Annulée',
};

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
  const overview   = useDashboardOverview();
  const fallback   = useDashboardStats();
  // Fallbacks via endpoints liste (si /stats ne compte pas les inactifs)
  const { data: vendeursData }   = useVendeurs();
  const { data: categoriesData } = useCategories();
  const { data: produitsData }   = useProduits();

  const isLoading = overview.isLoading || (overview.isError && fallback.isLoading);
  const isError   = overview.isError && fallback.isError;
  const d         = ((overview.isError ? fallback.data : overview.data) ?? overview.data) as any;

  const totalVendeurs   = (vendeursData   as any)?.pagination?.total ?? (vendeursData   as any)?.vendeurs?.length   ?? d?.totalVendeurs   ?? 0;
  const totalCategories = (categoriesData as any)?.categories?.length                                                ?? d?.totalCategories ?? 0;
  // Priorité au total de la liste (inclut produits masqués), stats ne compte que isActive=true
  const totalProduits   = (produitsData   as any)?.pagination?.total ?? (produitsData   as any)?.produits?.length   ?? d?.totalProduits   ?? 0;

  const kpis = [
    { label: 'Total clients',       value: d?.totalClients       ?? 0,  icon: 'users',          color: '#7c3aed' },
    { label: 'Total vendeurs',      value: totalVendeurs,               icon: 'store',          color: '#8b5cf6' },
    { label: 'Total catégories',    value: totalCategories,             icon: 'list',           color: '#2a7fac' },
    { label: 'Total produits',      value: totalProduits,                          icon: 'shopping-bag',   color: '#0891b2' },
    { label: 'Total commandes',     value: d?.totalCommandes     ?? 0,           icon: 'package',        color: '#059669' },
    { label: "Chiffre d'affaires",  value: fcfa(d?.chiffreAffaires ?? 0),       icon: 'coins',          color: '#b8860b' },
    { label: 'Produits en attente', value: d?.produitsEnAttente  ?? 0,           icon: 'alert-triangle', color: '#d97706' },
    { label: 'Rupture de stock',    value: d?.produitsEnRupture  ?? 0,           icon: 'alert-triangle', color: '#dc2626' },
  ];

  const tops: any[]    = d?.topProduits   ?? [];
  const clients: any[] = d?.clientsActifs ?? [];

  const { data: revenusRaw }  = useRevenus();
  const { data: statutsRaw }  = useCommandesParStatut();

  const revenusData = ((revenusRaw as any)?.revenus ?? []).map((r: any) => ({
    mois: MOIS[r.mois - 1],
    revenus: r.revenus,
  }));

  const statutsData = ((statutsRaw as any)?.stats ?? []).map((s: any) => ({
    name: STATUT_LABELS[s.statut] ?? s.statut,
    value: Number(s.count),
    color: STATUT_COLORS[s.statut] ?? '#9ca3af',
  }));

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

      {/* Graphiques */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>

        {/* Revenus par mois */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 10px rgba(0,0,0,0.05)', padding: '1.2rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Revenus par mois ({new Date().getFullYear()})</div>
          {revenusData.length === 0 || revenusData.every((r: any) => r.revenus === 0) ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '3rem 0' }}>Aucune donnée</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenusData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a56db" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1a56db" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [fcfa(v), 'Revenus']} labelStyle={{ fontWeight: 600 }} contentStyle={{ borderRadius: 8, fontSize: '0.82rem' }} />
                <Area type="monotone" dataKey="revenus" stroke="#1a56db" strokeWidth={2} fill="url(#colorRev)" dot={{ r: 3, fill: '#1a56db' }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Commandes par statut */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 10px rgba(0,0,0,0.05)', padding: '1.2rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Commandes par statut</div>
          {statutsData.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '3rem 0' }}>Aucune donnée</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statutsData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {statutsData.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, name: string) => [v, name]} contentStyle={{ borderRadius: 8, fontSize: '0.82rem' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
                {statutsData.map((s: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                    <span style={{ color: '#555', flex: 1 }}>{s.name}</span>
                    <span style={{ fontWeight: 600, color: '#111' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
