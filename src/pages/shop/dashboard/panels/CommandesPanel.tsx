import { useState } from 'react';
import { useCommandes, useValiderCommande, useRejeterCommande } from '@/domains/shop/hooks/useAdminBoutique';
import Pagination from '@/shared/components/dashboard/Pagination';
import Icon from '@/shared/components/dashboard/Icon';
import { StateRow, fcfa } from './_state';

const PAGE_SIZE = 10;

const STATUT_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  en_attente: { bg: '#fef3c7', color: '#92400e', label: 'En attente' },
  confirmee:  { bg: '#dbeafe', color: '#1e40af', label: 'Confirmée' },
  en_cours:   { bg: '#ede9fe', color: '#5b21b6', label: 'En cours' },
  expediee:   { bg: '#e0f2fe', color: '#075985', label: 'Expédiée' },
  livree:     { bg: '#d1fae5', color: '#065f46', label: 'Livrée' },
  annulee:    { bg: '#fee2e2', color: '#991b1b', label: 'Annulée' },
};

interface Commande {
  id: string;
  numero?: string;
  reference?: string;
  user?: { nom?: string; prenom?: string };
  client?: { nom?: string; prenom?: string } | string;
  montantTotal?: number;
  montant?: number;
  total?: number;
  statut?: string;
  createdAt?: string;
}

const nomClient = (c: Commande) => {
  const u = c.user ?? c.client;
  if (!u) return '—';
  if (typeof u === 'string') return u;
  return `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || '—';
};

const statutStyle = (s?: string) => STATUT_STYLE[s ?? ''] ?? { bg: '#f3f4f6', color: '#374151', label: s ?? '—' };

export default function CommandesPanel() {
  const [page, setPage]         = useState(1);
  const [filtreStatut, setFiltre] = useState('');
  const [rejet, setRejet]       = useState<Commande | null>(null);
  const [motif, setMotif]       = useState('');

  const { data, isLoading, isError } = useCommandes({
    page, limit: PAGE_SIZE,
    ...(filtreStatut ? { statut: filtreStatut } : {}),
  });

  const valider = useValiderCommande();
  const rejeter = useRejeterCommande();

  const commandes: Commande[] = (data as any)?.commandes ?? [];
  const total: number         = (data as any)?.pagination?.total ?? commandes.length;

  const handleRejeter = () => {
    if (!rejet) return;
    rejeter.mutate({ id: rejet.id, motif }, { onSuccess: () => { setRejet(null); setMotif(''); } });
  };

  return (
    <div>
      {/* Filtres statut */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['', 'en_attente', 'confirmee', 'en_cours', 'expediee', 'livree', 'annulee'].map((s) => {
          const st = statutStyle(s || undefined);
          return (
            <button
              key={s}
              onClick={() => { setFiltre(s); setPage(1); }}
              style={{
                padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
                border: `1px solid ${filtreStatut === s ? '#1a56db' : '#e2e8f0'}`,
                background: filtreStatut === s ? '#1a56db' : '#fff',
                color: filtreStatut === s ? '#fff' : '#555',
                cursor: 'pointer',
              }}
            >
              {s === '' ? 'Tous' : st.label}
            </button>
          );
        })}
      </div>

      <div className="db-card">
        <div className="db-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Client</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <StateRow colSpan={6} loading={isLoading} error={isError} empty={commandes.length === 0} emptyLabel="Aucune commande" />
              {!isLoading && !isError && commandes.map((c) => {
                const st = statutStyle(c.statut);
                const montant = c.montantTotal ?? c.montant ?? c.total;
                return (
                  <tr key={c.id}>
                    <td className="db-td-bold">{c.numero || c.reference || c.id.slice(0, 8)}</td>
                    <td>{nomClient(c)}</td>
                    <td>{fcfa(montant)}</td>
                    <td>
                      <span style={{ background: st.bg, color: st.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                        {st.label}
                      </span>
                    </td>
                    <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                    <td>
                      <div className="db-actions">
                        {(c.statut === 'en_attente') && (
                          <button className="db-btn-ghost" style={{ color: '#065f46', borderColor: '#065f46' }} disabled={valider.isPending} onClick={() => valider.mutate(c.id)}>
                            Valider
                          </button>
                        )}
                        {(c.statut !== 'livree' && c.statut !== 'annulee') && (
                          <button className="db-btn-danger" disabled={rejeter.isPending} onClick={() => { setRejet(c); setMotif(''); }}>
                            Annuler
                          </button>
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

      {/* Modal rejet */}
      {rejet && (
        <div onClick={() => setRejet(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
            <div className="db-modal-head">
              <div className="db-modal-title">Annuler la commande</div>
              <button className="db-modal-close" onClick={() => setRejet(null)}><Icon name="x" size={14} /></button>
            </div>
            <div style={{ padding: '0 1.65rem' }}>
              <div className="db-form-group">
                <label className="db-form-label">Motif (optionnel)</label>
                <textarea className="db-form-input" value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Raison de l'annulation…" rows={3} />
              </div>
            </div>
            <div className="db-modal-footer">
              <button className="db-btn secondary" onClick={() => setRejet(null)}>Fermer</button>
              <button className="db-btn confirm" disabled={rejeter.isPending} onClick={handleRejeter}>Confirmer l'annulation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
