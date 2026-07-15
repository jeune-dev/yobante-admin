import { useState } from 'react';
import { useClients, useToggleClient } from '@/domains/shop/hooks/useAdminBoutique';
import Icon from '@/shared/components/dashboard/Icon';
import Pagination from '@/shared/components/dashboard/Pagination';
import { StateRow } from './_state';

const PAGE_SIZE = 10;

const STATUT_COLORS: Record<string, { background: string; color: string }> = {
  actif:   { background: '#d1fae5', color: '#065f46' },
  inactif: { background: '#fee2e2', color: '#991b1b' },
};

interface Client {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  isActive?: boolean;
}

export default function ClientsPanel() {
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<'' | 'actif' | 'inactif'>('');
  const [selected, setSelected]   = useState<Client | null>(null);

  const { data, isLoading, isError } = useClients({
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(filtreStatut ? { statut: filtreStatut } : {}),
  });

  const toggle = useToggleClient();

  const clients: Client[] = (data as any)?.clients ?? [];
  const total: number     = (data as any)?.pagination?.total ?? clients.length;

  const handleSearch = () => { setPage(1); setSearch(searchInput); };
  const handleKey    = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); };
  const changeStatut = (s: '' | 'actif' | 'inactif') => { setFiltreStatut(s); setPage(1); };

  const initiales  = (c: Client) => `${c.prenom?.[0] ?? ''}${c.nom?.[0] ?? ''}`.toUpperCase();
  const statutLabel = (c: Client) => (c.isActive ? 'actif' : 'inactif');

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.7rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="db-form-input"
          placeholder="Rechercher nom, email, téléphone..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKey}
          style={{ width: 280, padding: '0.5rem 0.9rem' }}
        />
        <button className="db-btn primary" style={{ padding: '0.5rem 1rem' }} onClick={handleSearch}>
          Rechercher
        </button>
        {(['', 'actif', 'inactif'] as const).map((s) => (
          <button key={s} className={`db-chip${filtreStatut === s ? ' active' : ''}`} onClick={() => changeStatut(s)}>
            {s === '' ? 'Tous' : s === 'actif' ? 'Actifs' : 'Inactifs'}
          </button>
        ))}
      </div>

      <div className="db-card">
        <div className="db-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <StateRow colSpan={5} loading={isLoading} error={isError} empty={clients.length === 0} emptyLabel="Aucun client trouvé" />
              {!isLoading && !isError &&
                clients.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #1a56db, #3b7df5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                          {initiales(c)}
                        </div>
                        <span className="db-td-bold">{c.prenom} {c.nom}</span>
                      </div>
                    </td>
                    <td>{c.email}</td>
                    <td>{c.telephone || '—'}</td>
                    <td>
                      <span style={{ ...STATUT_COLORS[statutLabel(c)], padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                        {statutLabel(c)}
                      </span>
                    </td>
                    <td>
                      <div className="db-actions">
                        <button className="db-btn-ghost" onClick={() => setSelected(c)}>Voir</button>
                        <button
                          className="db-btn-ghost"
                          disabled={toggle.isPending}
                          style={{ color: c.isActive ? '#991b1b' : '#065f46', borderColor: c.isActive ? '#991b1b' : '#065f46' }}
                          onClick={() => toggle.mutate({ id: c.id, actif: !!c.isActive })}
                        >
                          {c.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} limit={PAGE_SIZE} onChange={setPage} />
      </div>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 460, boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
            <div style={{ background: 'linear-gradient(135deg, #1a56db, #3b7df5)', borderRadius: '18px 18px 0 0', padding: '2rem 1.65rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.4rem' }}>
                {initiales(selected)}
              </div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{selected.prenom} {selected.nom}</div>
              <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '3px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                {statutLabel(selected)}
              </span>
            </div>
            <div style={{ padding: '1.4rem 1.65rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <InfoRow icon="mail"  label="Email"     value={selected.email} />
                <InfoRow icon="phone" label="Téléphone" value={selected.telephone || '—'} />
              </div>
            </div>
            <div className="db-modal-footer">
              <button className="db-btn secondary" onClick={() => setSelected(null)}>Fermer</button>
              <button
                className="db-btn primary"
                style={{ background: selected.isActive ? '#c94030' : '#1a56db' }}
                onClick={() => { toggle.mutate({ id: selected.id, actif: !!selected.isActive }); setSelected(null); }}
              >
                {selected.isActive ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f7f9fc', border: '1px solid #eaecf0', borderRadius: 10, padding: '0.75rem 1rem' }}>
      <span style={{ display: 'inline-flex', color: '#1a56db' }}><Icon name={icon} size={18} /></span>
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 2 }}>{label}</div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111' }}>{value}</div>
      </div>
    </div>
  );
}
