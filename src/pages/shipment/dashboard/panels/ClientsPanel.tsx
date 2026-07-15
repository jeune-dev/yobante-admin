import { useState } from 'react';
import { useShipmentClients, useToggleShipmentClient } from '@/domains/shipment/hooks/useShipmentUsers';
import Pagination from '@/shared/components/dashboard/Pagination';
import Icon from '@/shared/components/dashboard/Icon';

const PAGE_SIZE = 10;

interface Client {
  _id?: string;
  id?: string | number;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  isActive?: boolean;
  actif?: boolean;
  nbColis?: number;
  totalColis?: number;
}

const cId = (c: Client) => String(c._id ?? c.id ?? '');
const isActif = (c: Client) => c.isActive ?? c.actif ?? true;
const initiales = (c: Client) => `${(c.prenom ?? '?')[0]}${(c.nom ?? '?')[0]}`.toUpperCase();

export default function ClientsPanel() {
  const [page, setPage]             = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]         = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [selected, setSelected]     = useState<Client | null>(null);

  const { data, isLoading, isError } = useShipmentClients({
    page, limit: PAGE_SIZE,
    ...(search      ? { search }              : {}),
    ...(filtreStatut ? { statut: filtreStatut } : {}),
  });

  const toggle = useToggleShipmentClient();

  const clients: Client[] = (data as any)?.clients ?? (data as any)?.users ?? (data as any)?.data ?? [];
  const total: number     = (data as any)?.pagination?.total ?? (data as any)?.total ?? clients.length;

  const handleSearch = () => { setSearch(searchInput); setPage(1); };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.7rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="db-form-input"
          placeholder="Rechercher nom, email, téléphone..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ width: 280, padding: '0.5rem 0.9rem' }}
        />
        <button className="db-btn primary" onClick={handleSearch} style={{ padding: '0.5rem 1rem' }}>Rechercher</button>
        {(['', 'actif', 'inactif'] as const).map((s) => (
          <button key={s} className={`db-chip${filtreStatut === s ? ' active' : ''}`} onClick={() => { setFiltreStatut(s); setPage(1); }}>
            {s === '' ? 'Tous' : s === 'actif' ? 'Actifs' : 'Inactifs'}
          </button>
        ))}
        {!isLoading && <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#888' }}>{total} client{total > 1 ? 's' : ''}</div>}
      </div>

      <div className="db-card">
        <div className="db-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Adresse</th>
                <th>Colis</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Chargement…</td></tr>
              ) : isError ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#991b1b' }}>Erreur de chargement</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Aucun client trouvé</td></tr>
              ) : clients.map((c) => {
                const actif = isActif(c);
                const nbColis = c.nbColis ?? c.totalColis ?? 0;
                return (
                  <tr key={cId(c)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #1a56db, #3b7df5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>{initiales(c)}</div>
                        <span className="db-td-bold">{c.prenom} {c.nom}</span>
                      </div>
                    </td>
                    <td>{c.email || '—'}</td>
                    <td>{c.telephone || '—'}</td>
                    <td>{c.adresse || '—'}</td>
                    <td><span style={{ background: '#e0e7ff', color: '#3730a3', padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>{nbColis} colis</span></td>
                    <td><span style={{ background: actif ? '#d1fae5' : '#fee2e2', color: actif ? '#065f46' : '#991b1b', padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>{actif ? 'Actif' : 'Inactif'}</span></td>
                    <td>
                      <div className="db-actions">
                        <button className="db-btn-ghost" onClick={() => setSelected(c)}>Voir</button>
                        <button
                          className="db-btn-ghost"
                          style={{ color: actif ? '#991b1b' : '#065f46', borderColor: actif ? '#991b1b' : '#065f46' }}
                          disabled={toggle.isPending}
                          onClick={() => toggle.mutate(cId(c))}
                        >
                          {actif ? 'Désactiver' : 'Activer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} limit={PAGE_SIZE} onChange={setPage} />
      </div>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 460, boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
            <div style={{ background: 'linear-gradient(135deg, #1a56db, #3b7df5)', borderRadius: '18px 18px 0 0', padding: '2rem 1.65rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.4rem' }}>{initiales(selected)}</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{selected.prenom} {selected.nom}</div>
              <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '3px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>{isActif(selected) ? 'Actif' : 'Inactif'}</span>
            </div>
            <div style={{ padding: '1.4rem 1.65rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <InfoRow icon="mail" label="Email" value={selected.email ?? '—'} />
              <InfoRow icon="phone" label="Téléphone" value={selected.telephone ?? '—'} />
              <InfoRow icon="map-pin" label="Adresse" value={selected.adresse ?? '—'} />
              <InfoRow icon="package" label="Nombre de colis" value={`${selected.nbColis ?? selected.totalColis ?? 0} colis envoyés`} />
            </div>
            <div className="db-modal-footer">
              <button className="db-btn secondary" onClick={() => setSelected(null)}>Fermer</button>
              <button
                className="db-btn primary"
                style={{ background: isActif(selected) ? '#c94030' : '#1a56db' }}
                disabled={toggle.isPending}
                onClick={() => { toggle.mutate(cId(selected)); setSelected(null); }}
              >
                {isActif(selected) ? 'Désactiver' : 'Activer'}
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
