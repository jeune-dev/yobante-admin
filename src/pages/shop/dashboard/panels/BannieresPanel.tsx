import { useBannieres, useToggleBanniere, useSupprimerBanniere } from '@/domains/shop/hooks/useAdminBoutique';
import Icon from '@/shared/components/dashboard/Icon';

interface Banniere {
  id: string;
  titre?: string;
  image?: string;
  imageUrl?: string;
  isActive?: boolean;
  active?: boolean;
  lien?: string;
}

export default function BannieresPanel() {
  const { data, isLoading, isError } = useBannieres();
  const toggle = useToggleBanniere();
  const supprimer = useSupprimerBanniere();

  const bannieres: Banniere[] = data?.bannieres ?? [];
  const estActive = (b: Banniere) => b.isActive ?? b.active ?? false;

  if (isLoading) return <div className="db-card" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Chargement…</div>;
  if (isError) return <div className="db-card" style={{ padding: '2rem', textAlign: 'center', color: '#991b1b' }}>Erreur de chargement</div>;

  return (
    <div>
      {bannieres.length === 0 ? (
        <div className="db-card" style={{ padding: '2.5rem', textAlign: 'center', color: '#888' }}>
          <Icon name="image" size={40} style={{ opacity: 0.4 }} />
          <p style={{ marginTop: 12 }}>Aucune bannière</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {bannieres.map((b) => (
            <div key={b.id} className="db-card" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ height: 130, background: '#f0f0ee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                {b.image || b.imageUrl ? (
                  <img src={b.image || b.imageUrl} alt={b.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Icon name="image" size={34} />
                )}
              </div>
              <div style={{ padding: '0.9rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div className="db-td-bold">{b.titre || 'Bannière'}</div>
                  <span style={{ background: estActive(b) ? '#d1fae5' : '#fee2e2', color: estActive(b) ? '#065f46' : '#991b1b', padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600 }}>
                    {estActive(b) ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="db-actions" style={{ marginTop: 10 }}>
                  <button className="db-btn-ghost" disabled={toggle.isPending} onClick={() => toggle.mutate(b.id)}>{estActive(b) ? 'Désactiver' : 'Activer'}</button>
                  <button className="db-btn-danger" disabled={supprimer.isPending} onClick={() => supprimer.mutate(b.id)}>Supprimer</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
