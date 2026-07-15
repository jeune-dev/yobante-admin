import { useQuery } from '@tanstack/react-query';
import * as api from '@/domains/shop/api/admin.api';
import Icon from '@/shared/components/dashboard/Icon';

// Les "sections" (rayons de l'app) sont dérivées des promotions groupées par section
// via /admin/promotions/sections côté backend.
export default function SectionsPanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['boutique', 'promotions', 'sections'],
    queryFn: api.getPromotionsParSection,
  });

  // Le backend renvoie { sections: { nos_promos_du_moment: [...], a_ne_pas_rater: [...], ... } }
  const rawSections = (data as any)?.sections;
  const sections: { key: string; items: any[] }[] = rawSections
    ? Object.entries(rawSections).map(([key, items]) => ({ key, items: items as any[] }))
    : [];

  if (isLoading) return <div className="db-card" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Chargement…</div>;
  if (isError) return <div className="db-card" style={{ padding: '2rem', textAlign: 'center', color: '#991b1b' }}>Erreur de chargement</div>;

  if (sections.length === 0) {
    return (
      <div className="db-card" style={{ padding: '2.5rem', textAlign: 'center', color: '#888' }}>
        <Icon name="tag" size={40} style={{ opacity: 0.4 }} />
        <p style={{ marginTop: 12 }}>Aucune section configurée</p>
      </div>
    );
  }

  const LABELS: Record<string, string> = {
    nos_promos_du_moment: 'Nos promos du moment',
    a_ne_pas_rater: 'À ne pas rater',
    nos_promos_a_venir: 'Nos promos à venir',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
      {sections.map(({ key, items }) => (
        <div key={key} className="db-card" style={{ padding: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ display: 'inline-flex', color: '#2a7fac' }}><Icon name="tag" size={20} /></span>
            <div className="db-td-bold">{LABELS[key] ?? key}</div>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#777' }}>
            {items.length} élément(s)
          </div>
        </div>
      ))}
    </div>
  );
}
