import { useMemo, useState } from 'react';
import { useClients, useToggleClient } from '@/domains/shop/hooks/useAdminBoutique';
import Icon from '@/shared/components/dashboard/Icon';
import { StateRow } from './_state';

const STATUT_COLORS: Record<string, { background: string; color: string }> = {
  actif: { background: '#d1fae5', color: '#065f46' },
  inactif: { background: '#fee2e2', color: '#991b1b' },
};

interface Client {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  isActive?: boolean;
  adresse?: string;
}

export default function ClientsPanel() {
  const { data, isLoading, isError } = useClients();
  const toggle = useToggleClient();
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<'tous' | 'actif' | 'inactif'>('tous');
  const [selected, setSelected] = useState<Client | null>(null);

  const clients: Client[] = data?.clients ?? [];

  const filtered = useMemo(
    () =>
      clients.filter((c) => {
        const q = search.toLowerCase();
        const matchSearch =
          c.nom?.toLowerCase().includes(q) ||
          c.prenom?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          (c.telephone || '').includes(search);
        const statut = c.isActive ? 'actif' : 'inactif';
        const matchStatut = filtreStatut === 'tous' || statut === filtreStatut;
        return matchSearch && matchStatut;
      }),
    [clients, search, filtreStatut]
  );

  const initiales = (c: Client) => `${c.prenom?.[0] ?? ''}${c.nom?.[0] ?? ''}`.toUpperCase();
  const statutLabel = (c: Client) => (c.isActive ? 'actif' : 'inactif');

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.7rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="db-form-input"
          placeholder="Rechercher nom, email, téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280, padding: '0.5rem 0.9rem' }}
        />
        {(['tous', 'actif', 'inactif'] as const).map((s) => (
          <button key={s} className={`db-chip${filtreStatut === s ? ' active' : ''}`} onClick={() => setFiltreStatut(s)}>
            {s === 'tous' ? 'Tous' : s === 'actif' ? 'Actifs' : 'Inactifs'}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#888' }}>
          {filtered.length} client{filtered.length > 1 ? 's' : ''}
        </div>
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
              <StateRow colSpan={5} loading={isLoading} error={isError} empty={filtered.length === 0} emptyLabel="Aucun client trouvé" />
              {!isLoading && !isError &&
                filtered.map((c) => (
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
      </div>

      {selected && (
        <div onClick={() => setSelected(null)} className="db-pop-overlay">
          <div onClick={(e) => e.stopPropagation()} className="db-pop" style={{ maxWidth: 460 }}>
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
                <InfoRow icon="mail" label="Email" value={selected.email} />
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
