import { useState, useRef } from 'react';
import { useReviews, useToggleApprove, useDeleteReview } from '@/domains/shop/hooks/useReviews';
import { Review } from '@/domains/shop/api/reviews.api';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Stars({ note }: { note: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} viewBox="0 0 24 24" fill={i <= note ? '#eab308' : 'none'} stroke={i <= note ? '#eab308' : '#ccc'} strokeWidth={2} style={{ width: 14, height: 14 }}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [approvedFilter, setApprovedFilter] = useState<boolean | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  const [toast, setToast] = useState({ msg: '', show: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast({ msg, show: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2800);
  };

  const { data, isLoading, isError } = useReviews({ page, limit: 15, isApproved: approvedFilter });
  const approveMut = useToggleApprove();
  const deleteMut = useDeleteReview();

  const reviews = (data as any)?.rows ?? [];
  const totalPages = (data as any)?.totalPages ?? 1;
  const count = (data as any)?.count ?? 0;

  const handleToggle = (r: Review) => {
    approveMut.mutate(r.id, {
      onSuccess: () => showToast(r.isApproved ? 'Avis désapprouvé' : 'Avis approuvé'),
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.id, {
      onSuccess: () => { setDeleteTarget(null); showToast('Avis supprimé'); },
    });
  };

  return (
    <div style={{ padding: '1.6rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <div>
          <div style={{ fontSize: '1.08rem', fontWeight: 700, color: 'var(--black)' }}>Avis clients</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: 2 }}>
            {count} avis au total
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
        {[{ label: 'Tous', val: undefined }, { label: 'Approuvés', val: true }, { label: 'En attente', val: false }].map(f => (
          <button key={String(f.val)} className={`db-chip${approvedFilter === f.val ? ' active' : ''}`}
            onClick={() => { setApprovedFilter(f.val as any); setPage(1); }}>
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
        ) : reviews.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text3)' }}>Aucun avis trouvé.</div>
        ) : (
          <div className="db-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Produit</th>
                  <th>Note</th>
                  <th>Commentaire</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r: Review) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.87rem' }}>
                        {r.User?.nom} {r.User?.prenom}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text2)' }}>
                      {r.Produit?.nom ?? '—'}
                    </td>
                    <td><Stars note={r.note} /></td>
                    <td style={{ maxWidth: 260 }}>
                      {r.commentaire ? (
                        <div style={{ fontSize: '0.83rem', color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                          {r.commentaire}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                      {fmtDate(r.createdAt)}
                    </td>
                    <td>
                      <button onClick={() => handleToggle(r)} disabled={approveMut.isPending}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <span className={`badge ${r.isApproved ? 'bg' : 'bgo'}`}>
                          {r.isApproved ? 'Approuvé' : 'En attente'}
                        </span>
                      </button>
                    </td>
                    <td>
                      <div className="db-actions">
                        <button className={r.isApproved ? 'db-btn-ghost' : 'db-btn-ghost'}
                          onClick={() => handleToggle(r)} disabled={approveMut.isPending}>
                          {r.isApproved ? 'Désapprouver' : 'Approuver'}
                        </button>
                        <button className="db-btn-danger" onClick={() => setDeleteTarget(r)}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Confirm suppression */}
      {deleteTarget && (
        <div className="db-modal-overlay db-modal-overlay--visible" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="db-modal db-modal--visible" style={{ maxWidth: 380, width: '95%' }}>
            <div style={{ padding: '1.1rem 1.4rem', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
              Confirmer la suppression
            </div>
            <div style={{ padding: '1.2rem 1.4rem', fontSize: '0.9rem', color: 'var(--text2)' }}>
              Supprimer l'avis de <strong>{deleteTarget.User?.nom} {deleteTarget.User?.prenom}</strong> sur <strong>{deleteTarget.Produit?.nom}</strong> ?
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', padding: '1rem 1.4rem', borderTop: '1px solid var(--border)' }}>
              <button className="db-btn secondary" onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button className="db-btn confirm" disabled={deleteMut.isPending} onClick={handleDelete}>
                {deleteMut.isPending ? 'Suppression…' : 'Supprimer'}
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
