import { useShipmentStats } from '@/domains/shipment/hooks/useDashboard';

const COLOR_MAP: Record<string, string> = {
  blue: '#1a56db', green: '#065f46', gold: '#b8860b', red: '#991b1b', purple: '#5b21b6',
};

export default function OverviewPanel() {
  const { data, isLoading, isError } = useShipmentStats();

  const d = (data as any)?.stats ?? (data as any) ?? {};

  const kpis = [
    { label: 'Total colis', value: d.totalColis ?? d.total ?? 0, color: 'blue' },
    { label: 'France → Sénégal', value: d.franceSenegal ?? d.colis_france_senegal ?? 0, color: 'green' },
    { label: 'Sénégal → France', value: d.senegalFrance ?? d.colis_senegal_france ?? 0, color: 'gold' },
    { label: 'En attente validation', value: d.enAttente ?? d.colis_en_attente ?? 0, color: 'red' },
    { label: 'Total clients', value: d.totalClients ?? d.clients ?? 0, color: 'purple' },
    { label: 'Total conteneurs', value: d.totalConteneurs ?? d.conteneurs ?? 0, color: 'blue' },
  ];

  if (isLoading) {
    return (
      <div className="db-stats-grid">
        {kpis.map((_, i) => (
          <div className="db-stat-card" key={i} style={{ opacity: 0.4 }}>
            <div className="db-stat-value" style={{ background: '#e5e7eb', borderRadius: 8, height: 32, width: 60 }} />
            <div className="db-stat-label" style={{ background: '#e5e7eb', borderRadius: 4, height: 14, width: 100, marginTop: 8 }} />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="db-card" style={{ padding: '2rem', textAlign: 'center', color: '#991b1b' }}>
        Impossible de charger les statistiques
      </div>
    );
  }

  return (
    <div className="db-stats-grid">
      {kpis.map((kpi, i) => (
        <div className="db-stat-card" key={i}>
          <div className="db-stat-icon" style={{ background: `${COLOR_MAP[kpi.color]}22`, color: COLOR_MAP[kpi.color] }} />
          <div className="db-stat-value">{kpi.value.toLocaleString('fr-FR')}</div>
          <div className="db-stat-label">{kpi.label}</div>
        </div>
      ))}
    </div>
  );
}
