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

  // Le backend renvoie soit un tableau de sections, soit un objet { sections: [...] }.
  const sections: any[] = Array.isArray(data) ? data : data?.sections ?? [];

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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
      {sections.map((s: any, i: number) => (
        <div key={s.id ?? s.section ?? i} className="db-card" style={{ padding: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ display: 'inline-flex', color: '#2a7fac' }}><Icon name="tag" size={20} /></span>
            <div className="db-td-bold">{s.section || s.nom || s.titre || 'Section'}</div>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#777' }}>
            {(s.promotions?.length ?? s.produits?.length ?? 0)} élément(s)
          </div>
        </div>
      ))}
    </div>
  );
}
