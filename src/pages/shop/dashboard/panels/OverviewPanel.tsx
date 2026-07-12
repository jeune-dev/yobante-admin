import { useDashboardStats } from '@/domains/shop/hooks/useAdminBoutique';
import Icon from '@/shared/components/dashboard/Icon';
import { fcfa } from './_state';

export default function OverviewPanel() {
  const { data, isLoading, isError } = useDashboardStats();

  const kpis = [
    { label: 'Clients', value: data?.totalClients ?? 0, icon: 'users', color: '#7c3aed' },
    { label: 'Produits', value: data?.totalProduits ?? 0, icon: 'shopping-bag', color: '#2a7fac' },
    { label: 'Commandes', value: data?.totalCommandes ?? 0, icon: 'package', color: '#059669' },
    { label: "Chiffre d'affaires", value: fcfa(data?.chiffreAffaires), icon: 'coins', color: '#b8860b' },
  ];

  return (
    <div>
      {isError && (
        <div className="db-card" style={{ padding: '1rem', marginBottom: '1rem', color: '#991b1b' }}>
          Impossible de charger les statistiques.
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={{ background: '#fff', padding: '1.1rem', borderRadius: 12, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${kpi.color}15`, color: kpi.color, marginBottom: 8 }}>
              <Icon name={kpi.icon} size={20} />
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{isLoading ? '…' : kpi.value}</div>
            <div style={{ fontSize: '0.85rem', color: '#777' }}>{kpi.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
