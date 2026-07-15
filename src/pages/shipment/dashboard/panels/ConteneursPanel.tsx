import { useState } from 'react';
import { useConteneurs, useCreateConteneur, useUpdateStatutConteneur } from '@/domains/shipment/hooks/useConteneurs';
import Pagination from '@/shared/components/dashboard/Pagination';
import Icon from '@/shared/components/dashboard/Icon';

const PAGE_SIZE = 10;

interface Conteneur {
  _id?: string;
  id?: string | number;
  numero?: string;
  statut?: string;
  dateDepart?: string;
  date_depart?: string;
  dateArrivee?: string;
  date_arrivee?: string;
  direction?: string;
}

const cId = (c: Conteneur) => String(c._id ?? c.id ?? '');
const cNum = (c: Conteneur) => c.numero ?? cId(c).slice(0, 8).toUpperCase();
const cDateDepart = (c: Conteneur) => c.dateDepart ?? c.date_depart ?? '—';
const cDateArrivee = (c: Conteneur) => c.dateArrivee ?? c.date_arrivee ?? '—';

const STATUTS: Record<string, { label: string; background: string; color: string }> = {
  ouvert:     { label: 'Ouvert',     background: '#d1fae5', color: '#065f46' },
  ferme:      { label: 'Fermé',      background: '#fee2e2', color: '#991b1b' },
  en_transit: { label: 'En transit', background: '#e0f2fe', color: '#075985' },
  arrive:     { label: 'Arrivé',     background: '#dcfce7', color: '#166534' },
};

const EMPTY = { numero: '', statut: 'ouvert', dateDepart: '', dateArrivee: '', direction: '' };

export default function ConteneursPanel() {
  const [page, setPage]   = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState(EMPTY);

  const { data, isLoading, isError } = useConteneurs({ page, limit: PAGE_SIZE });
  const creer         = useCreateConteneur();
  const updateStatut  = useUpdateStatutConteneur();

  const conteneurs: Conteneur[] = (data as any)?.conteneurs ?? (data as any)?.data ?? [];
  const total: number           = (data as any)?.pagination?.total ?? (data as any)?.total ?? conteneurs.length;

  const handleAjouter = () => {
    if (!form.numero) return;
    creer.mutate(
      { numero: form.numero, statut: form.statut, dateDepart: form.dateDepart || undefined, dateArrivee: form.dateArrivee || undefined, direction: form.direction || undefined },
      { onSuccess: () => { setModal(false); setForm(EMPTY); } }
    );
  };

  const st = (statut?: string) => STATUTS[statut ?? ''] ?? { label: statut ?? '—', background: '#f3f4f6', color: '#374151' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="db-btn primary" onClick={() => setModal(true)}>+ Nouveau conteneur</button>
      </div>

      <div className="db-card">
        <div className="db-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Statut</th>
                <th>Date de départ</th>
                <th>Date d'arrivée prévue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Chargement…</td></tr>
              ) : isError ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#991b1b' }}>Erreur de chargement</td></tr>
              ) : conteneurs.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Aucun conteneur</td></tr>
              ) : conteneurs.map((c) => {
                const s = st(c.statut);
                return (
                  <tr key={cId(c)}>
                    <td className="db-td-bold">{cNum(c)}</td>
                    <td>
                      <span style={{ background: s.background, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>{s.label}</span>
                    </td>
                    <td>{cDateDepart(c)}</td>
                    <td>{cDateArrivee(c)}</td>
                    <td>
                      <div className="db-actions">
                        {Object.entries(STATUTS).filter(([key]) => key !== c.statut).map(([key, val]) => (
                          <button
                            key={key}
                            className="db-btn-ghost"
                            style={{ color: val.color, borderColor: val.color, fontSize: '0.75rem' }}
                            disabled={updateStatut.isPending}
                            onClick={() => updateStatut.mutate({ id: cId(c), statut: key })}
                          >
                            → {val.label}
                          </button>
                        ))}
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

      {modal && (
        <div onClick={() => setModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 460, boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
            <div className="db-modal-head">
              <div className="db-modal-title">Nouveau conteneur</div>
              <button className="db-modal-close" onClick={() => setModal(false)}><Icon name="x" size={14} /></button>
            </div>
            <div style={{ padding: '0 1.65rem' }}>
              <div className="db-form-group">
                <label className="db-form-label">Numéro du conteneur *</label>
                <input className="db-form-input" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="Ex: CONT-005" />
              </div>
              <div className="db-form-group">
                <label className="db-form-label">Statut initial</label>
                <select className="db-form-input db-form-select" value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}>
                  {Object.entries(STATUTS).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className="db-form-group">
                  <label className="db-form-label">Date de départ</label>
                  <input className="db-form-input" type="date" value={form.dateDepart} onChange={(e) => setForm({ ...form, dateDepart: e.target.value })} />
                </div>
                <div className="db-form-group">
                  <label className="db-form-label">Date d'arrivée prévue</label>
                  <input className="db-form-input" type="date" value={form.dateArrivee} onChange={(e) => setForm({ ...form, dateArrivee: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="db-modal-footer">
              <button className="db-btn secondary" onClick={() => setModal(false)}>Annuler</button>
              <button className="db-btn primary" disabled={!form.numero || creer.isPending} onClick={handleAjouter}>
                {creer.isPending ? 'Création…' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
