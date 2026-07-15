import { useState } from 'react';
import { useColis, useUpdateStatutColis, useRefuserColis } from '@/domains/shipment/hooks/useColis';
import Pagination from '@/shared/components/dashboard/Pagination';
import Icon from '@/shared/components/dashboard/Icon';

const PAGE_SIZE = 10;

interface Personne { nom: string; prenom: string; telephone: string; adresse?: string }
interface Colis {
  _id?: string;
  id?: string;
  numeroColis?: string;
  trackingNumber?: string;
  expediteur?: Personne;
  destinataire?: Personne;
  categorie?: string | { nom?: string; _id?: string };
  direction?: string;
  modeDepot?: string;
  mode_depot?: string;
  statut?: string;
  createdAt?: string;
  date?: string;
}

const colisId = (c: Colis) => c._id ?? c.id ?? '';
const colisNum = (c: Colis) => c.numeroColis ?? c.trackingNumber ?? colisId(c).slice(0, 14).toUpperCase();
const nomCategorie = (cat: Colis['categorie']) => {
  if (!cat) return '—';
  if (typeof cat === 'string') return cat;
  return (cat as any).nom ?? '—';
};
const STATUT_TERMINAUX = ['livre', 'annule', 'refuse'];

const STATUTS: Record<string, { label: string; background: string; color: string }> = {
  en_attente: { label: 'En attente', background: '#fef3c7', color: '#92400e' },
  valide:     { label: 'Validé',     background: '#dbeafe', color: '#1e40af' },
  paye:       { label: 'Payé',       background: '#e0e7ff', color: '#3730a3' },
  collecte:   { label: 'Collecté',   background: '#ede9fe', color: '#5b21b6' },
  en_transit: { label: 'En transit', background: '#e0f2fe', color: '#075985' },
  arrive_dakar: { label: 'Arrivé Dakar', background: '#dcfce7', color: '#166534' },
  livre:      { label: 'Livré',      background: '#d1fae5', color: '#065f46' },
  annule:     { label: 'Annulé',     background: '#f3f4f6', color: '#6b7280' },
  refuse:     { label: 'Refusé',     background: '#fee2e2', color: '#991b1b' },
};

const DIRECTIONS: Record<string, string> = {
  france_senegal: 'France → Sénégal',
  senegal_france: 'Sénégal → France',
};

export default function ColisPanel() {
  const [page, setPage]               = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]           = useState('');
  const [filtreStatut, setFiltreStatut]       = useState('');
  const [filtreDirection, setFiltreDirection] = useState('');
  const [selected, setSelected]   = useState<Colis | null>(null);
  const [modalRefus, setModalRefus] = useState<Colis | null>(null);
  const [raisonRefus, setRaisonRefus] = useState('');
  const [modalStatut, setModalStatut] = useState<Colis | null>(null);
  const [newStatut, setNewStatut]     = useState('');

  const { data, isLoading, isError } = useColis({
    page, limit: PAGE_SIZE,
    ...(filtreStatut    ? { statut: filtreStatut }       : {}),
    ...(filtreDirection ? { direction: filtreDirection } : {}),
    ...(search          ? { search }                     : {}),
  });

  const updateStatut = useUpdateStatutColis();
  const refuser      = useRefuserColis();

  const colis: Colis[] = (data as any)?.colis ?? (data as any)?.data ?? [];
  const total: number  = (data as any)?.pagination?.total ?? (data as any)?.total ?? colis.length;

  const handleSearch = () => { setSearch(searchInput); setPage(1); };

  const handleUpdateStatut = () => {
    if (!modalStatut || !newStatut) return;
    updateStatut.mutate(
      { id: colisId(modalStatut), statut: newStatut },
      { onSuccess: () => { setModalStatut(null); setNewStatut(''); setSelected(null); } }
    );
  };

  const handleRefuser = () => {
    if (!raisonRefus.trim() || !modalRefus) return;
    refuser.mutate(
      { id: colisId(modalRefus), raison: raisonRefus },
      { onSuccess: () => { setModalRefus(null); setRaisonRefus(''); } }
    );
  };

  const st = (statut?: string) => STATUTS[statut ?? ''] ?? { label: statut ?? '—', background: '#f3f4f6', color: '#374151' };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.7rem', marginBottom: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="db-form-input"
          placeholder="Rechercher numéro, expéditeur, destinataire..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ width: 320, padding: '0.5rem 0.9rem' }}
        />
        <button className="db-btn primary" onClick={handleSearch} style={{ padding: '0.5rem 1rem' }}>Rechercher</button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: '#888', alignSelf: 'center' }}>Direction :</span>
        {([['', 'Toutes'], ['france_senegal', 'France → Sénégal'], ['senegal_france', 'Sénégal → France']] as [string, string][]).map(([val, lbl]) => (
          <button key={val} className={`db-chip${filtreDirection === val ? ' active' : ''}`} onClick={() => { setFiltreDirection(val); setPage(1); }}>
            {lbl}
          </button>
        ))}
        <span style={{ fontSize: '0.8rem', color: '#888', alignSelf: 'center', marginLeft: 8 }}>Statut :</span>
        <select className="db-form-input db-form-select" value={filtreStatut} onChange={(e) => { setFiltreStatut(e.target.value); setPage(1); }} style={{ width: 160, padding: '0.4rem 0.7rem', fontSize: '0.85rem' }}>
          <option value="">Tous</option>
          {Object.entries(STATUTS).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
        </select>
      </div>

      <div className="db-card">
        <div className="db-table-wrap">
          <table>
            <thead>
              <tr>
                <th>N° Suivi</th>
                <th>Expéditeur</th>
                <th>Destinataire</th>
                <th>Catégorie</th>
                <th>Direction</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Chargement…</td></tr>
              ) : isError ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#991b1b' }}>Erreur de chargement</td></tr>
              ) : colis.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Aucun colis trouvé</td></tr>
              ) : colis.map((c) => {
                const s = st(c.statut);
                const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-FR') : (c.date ?? '—');
                return (
                  <tr key={colisId(c)}>
                    <td className="db-td-bold" style={{ fontSize: '0.78rem' }}>{colisNum(c)}</td>
                    <td>{c.expediteur ? `${c.expediteur.prenom} ${c.expediteur.nom}` : '—'}</td>
                    <td>{c.destinataire ? `${c.destinataire.prenom} ${c.destinataire.nom}` : '—'}</td>
                    <td><span style={{ background: '#f0f4ff', color: '#1a56db', padding: '2px 8px', borderRadius: 20, fontSize: '0.73rem', fontWeight: 600 }}>{nomCategorie(c.categorie)}</span></td>
                    <td style={{ fontSize: '0.82rem' }}>{c.direction ? (DIRECTIONS[c.direction] ?? c.direction) : '—'}</td>
                    <td><span style={{ background: s.background, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>{s.label}</span></td>
                    <td style={{ fontSize: '0.82rem' }}>{dateStr}</td>
                    <td>
                      <div className="db-actions">
                        <button className="db-btn-ghost" onClick={() => setSelected(c)}>Voir</button>
                        {!STATUT_TERMINAUX.includes(c.statut ?? '') && (
                          <button className="db-btn-ghost" style={{ color: '#065f46', borderColor: '#065f46' }} onClick={() => { setModalStatut(c); setNewStatut(c.statut ?? ''); }}>Statut</button>
                        )}
                        {c.statut === 'en_attente' && (
                          <button className="db-btn-danger" onClick={() => { setModalRefus(c); setRaisonRefus(''); }}>Refuser</button>
                        )}
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

      {/* Modal détail */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 520, boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
            <div className="db-modal-head">
              <div className="db-modal-title">Colis {colisNum(selected)}</div>
              <button className="db-modal-close" onClick={() => setSelected(null)}><Icon name="x" size={14} /></button>
            </div>
            <div style={{ padding: '0 1.65rem 1.65rem', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ marginBottom: '1rem' }}>
                {(() => { const s = st(selected.statut); return <span style={{ background: s.background, color: s.color, padding: '4px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>{s.label}</span>; })()}
              </div>
              <SectionLabel label="Informations générales" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem', marginBottom: '1rem' }}>
                <InfoBox label="Catégorie" value={nomCategorie(selected.categorie)} />
                <InfoBox label="Direction" value={selected.direction ? (DIRECTIONS[selected.direction] ?? selected.direction) : '—'} />
                <InfoBox label="Mode dépôt" value={(() => { const m = selected.modeDepot ?? selected.mode_depot; return m === 'depot' ? 'Dépôt en agence' : m === 'collecte' ? 'Collecte à domicile' : m ?? '—'; })()} />
                <InfoBox label="Date" value={selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('fr-FR') : (selected.date ?? '—')} />
              </div>
              {selected.expediteur && (
                <>
                  <SectionLabel label="Expéditeur" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem', marginBottom: '1rem' }}>
                    <InfoBox label="Nom" value={`${selected.expediteur.prenom} ${selected.expediteur.nom}`} />
                    <InfoBox label="Téléphone" value={selected.expediteur.telephone} />
                  </div>
                </>
              )}
              {selected.destinataire && (
                <>
                  <SectionLabel label="Destinataire" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem', marginBottom: '1rem' }}>
                    <InfoBox label="Nom" value={`${selected.destinataire.prenom} ${selected.destinataire.nom}`} />
                    <InfoBox label="Téléphone" value={selected.destinataire.telephone} />
                    <InfoBox label="Adresse" value={selected.destinataire.adresse ?? '—'} />
                  </div>
                </>
              )}
            </div>
            <div className="db-modal-footer">
              <button className="db-btn secondary" onClick={() => setSelected(null)}>Fermer</button>
              {!STATUT_TERMINAUX.includes(selected.statut ?? '') && (
                <button className="db-btn primary" onClick={() => { setModalStatut(selected); setNewStatut(selected.statut ?? ''); setSelected(null); }}>Changer le statut</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal statut */}
      {modalStatut && (
        <div onClick={() => setModalStatut(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 400, boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
            <div className="db-modal-head">
              <div className="db-modal-title">Changer le statut</div>
              <button className="db-modal-close" onClick={() => setModalStatut(null)}><Icon name="x" size={14} /></button>
            </div>
            <div style={{ padding: '0 1.65rem' }}>
              <div className="db-form-group">
                <label className="db-form-label">Nouveau statut</label>
                <select className="db-form-input db-form-select" value={newStatut} onChange={(e) => setNewStatut(e.target.value)}>
                  {Object.entries(STATUTS).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                </select>
              </div>
            </div>
            <div className="db-modal-footer">
              <button className="db-btn secondary" onClick={() => setModalStatut(null)}>Annuler</button>
              <button className="db-btn primary" disabled={updateStatut.isPending} onClick={handleUpdateStatut}>{updateStatut.isPending ? 'Mise à jour…' : 'Confirmer'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal refus */}
      {modalRefus && (
        <div onClick={() => { setModalRefus(null); setRaisonRefus(''); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 460, boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
            <div className="db-modal-head">
              <div className="db-modal-title">Refuser le colis</div>
              <button className="db-modal-close" onClick={() => { setModalRefus(null); setRaisonRefus(''); }}><Icon name="x" size={14} /></button>
            </div>
            <div style={{ padding: '0 1.65rem' }}>
              <p style={{ color: '#444', marginBottom: '1rem', fontSize: '0.9rem' }}>Raison du refus pour le colis <strong>{colisNum(modalRefus)}</strong>.</p>
              <div className="db-form-group">
                <label className="db-form-label">Raison</label>
                <textarea className="db-form-input" rows={4} value={raisonRefus} onChange={(e) => setRaisonRefus(e.target.value)} placeholder="Ex: Contenu non conforme..." style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div className="db-modal-footer">
              <button className="db-btn secondary" onClick={() => { setModalRefus(null); setRaisonRefus(''); }}>Annuler</button>
              <button className="db-btn confirm" disabled={refuser.isPending || !raisonRefus.trim()} onClick={handleRefuser}>{refuser.isPending ? 'Refus…' : 'Confirmer le refus'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 8 }}>{label}</div>;
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#f7f9fc', border: '1px solid #eaecf0', borderRadius: 10, padding: '0.75rem 1rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#111' }}>{value}</div>
    </div>
  );
}
