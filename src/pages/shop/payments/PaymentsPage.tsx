import { useState, useRef } from 'react';
import { usePayments, useRembourser } from '@/domains/shop/hooks/usePayments';
import { Payment } from '@/domains/shop/api/payments.api';

function fmtFcfa(n: number) { return Number(n).toLocaleString('fr-FR') + ' FCFA'; }
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUTS: Record<string, { label: string; cls: string }> = {
  en_attente: { label: 'En attente', cls: 'bgo' },
  succes:     { label: 'Succès',     cls: 'bg'  },
  echec:      { label: 'Échoué',     cls: 'br'  },
  rembourse:  { label: 'Remboursé',  cls: 'bx'  },
};

const METHODES: Record<string, string> = {
  wave: 'Wave', orange_money: 'Orange Money', carte: 'Carte', cash_livraison: 'À la livraison',
};

export const PaymentsPage = () => {
  const [page, setPage] = useState(1);
  const [statutFilter, setStatutFilter] = useState('');
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);

  const [toast, setToast] = useState({ msg: '', show: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast({ msg, show: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2800);
  };

  const { data, isLoading, isError } = usePayments({ page, limit: 15, statut: statutFilter || undefined });
  const rembourserMut = useRembourser();

  const payments = (data as any)?.rows ?? [];
  const totalPages = (data as any)?.totalPages ?? 1;
  const count = (data as any)?.count ?? 0;

  const totalSucces = payments
    .filter((p: Payment) => p.statut === 'succes')
    .reduce((a: number, p: Payment) => a + Number(p.montant), 0);

  const handleRefund = () => {
    if (!refundTarget) return;
    rembourserMut.mutate(refundTarget.id, {
      onSuccess: () => { setRefundTarget(null); showToast('Paiement remboursé'); },
    });
  };

  const FILTRES = [
    { label: 'Tous', val: '' },
    { label: 'Succès', val: 'succes' },
    { label: 'En attente', val: 'en_attente' },
    { label: 'Échoués', val: 'echec' },
    { label: 'Remboursés', val: 'rembourse' },
  ];

  return (
    <div style={{ padding: '1.6rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.6rem' }}>
        <div>
          <div style={{ fontSize: '1.08rem', fontWeight: 700, color: 'var(--black)' }}>Paiements</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: 2 }}>
            {count} paiement{count > 1 ? 's' : ''} au total
          </div>
        </div>
        {totalSucces > 0 && (
          <div style={{ background: 'rgba(26,86,219,0.07)', border: '1px solid rgba(26,86,219,0.15)', borderRadius: 10, padding: '0.6rem 1.1rem', textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>Total encaissé (page)</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--green)' }}>{fmtFcfa(totalSucces)}</div>
          </div>
        )}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {FILTRES.map(f => (
          <button key={f.val} className={`db-chip${statutFilter === f.val ? ' active' : ''}`}
            onClick={() => { setStatutFilter(f.val); setPage(1); }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div className="db-card">
        {isLoading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text3)' }}>Chargement…</div>
        ) : isError ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--red)' }}>Erreur lors du chargement.</div>
        ) : payments.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text3)' }}>Aucun paiement trouvé.</div>
        ) : (
          <div className="db-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Client</th>
                  <th>Méthode</th>
                  <th>Montant</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p: Payment) => {
                  const s = STATUTS[p.statut];
                  const user = (p as any).Commande?.User;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 600 }}>
                        #{p.commandeId?.slice(0, 8).toUpperCase() ?? '—'}
                      </td>
                      <td>
                        {user ? (
                          <>
                            <div style={{ fontWeight: 600, fontSize: '0.87rem' }}>{user.nom} {user.prenom}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{user.email}</div>
                          </>
                        ) : <span style={{ color: 'var(--text3)' }}>—</span>}
                      </td>
                      <td style={{ fontSize: '0.84rem' }}>
                        {METHODES[p.methodePaiement] ?? p.methodePaiement ?? '—'}
                      </td>
                      <td className="db-td-bold">{fmtFcfa(p.montant)}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                        {p.payeAt ? fmtDate(p.payeAt) : fmtDate(p.createdAt)}
                      </td>
                      <td><span className={`badge ${s?.cls}`}>{s?.label ?? p.statut}</span></td>
                      <td>
                        {p.statut === 'succes' && (
                          <button className="db-btn-ghost" onClick={() => setRefundTarget(p)}>
                            Rembourser
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', borderTop: '1px solid var(--border)' }}>
            <button className="db-btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Précédent</button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>Page {page} / {totalPages}</span>
            <button className="db-btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Suivant →</button>
          </div>
        )}
      </div>

      {/* Confirm remboursement */}
      {refundTarget && (
        <div className="db-modal-overlay db-modal-overlay--visible" onClick={(e) => e.target === e.currentTarget && setRefundTarget(null)}>
          <div className="db-modal db-modal--visible" style={{ maxWidth: 400, width: '95%' }}>
            <div style={{ padding: '1.1rem 1.4rem', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
              Confirmer le remboursement
            </div>
            <div style={{ padding: '1.2rem 1.4rem', fontSize: '0.9rem', color: 'var(--text2)' }}>
              Rembourser <strong>{fmtFcfa(refundTarget.montant)}</strong> pour la commande{' '}
              <strong>#{refundTarget.commandeId?.slice(0, 8).toUpperCase()}</strong> ?
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', padding: '1rem 1.4rem', borderTop: '1px solid var(--border)' }}>
              <button className="db-btn secondary" onClick={() => setRefundTarget(null)}>Annuler</button>
              <button className="db-btn confirm" disabled={rembourserMut.isPending} onClick={handleRefund}>
                {rembourserMut.isPending ? 'Traitement…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`db-toast${toast.show ? ' show' : ''}`}>
        <div className="db-toast-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        {toast.msg}
      </div>
    </div>
  );
};
