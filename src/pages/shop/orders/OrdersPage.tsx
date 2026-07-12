import { useState, useRef } from 'react';
import {
  useOrders, useValiderCommande, useRejeterCommande,
  usePreparationCommande, useExpedierCommande, useLivrerCommande,
} from '@/domains/shop/hooks/useOrders';
import { ordersApi, Order } from '@/domains/shop/api/orders.api';

function fmtFcfa(n: number) { return Number(n).toLocaleString('fr-FR') + ' FCFA'; }
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUTS: Record<string, { label: string; cls: string }> = {
  en_attente:    { label: 'En attente',    cls: 'bgo' },
  validee:       { label: 'Validée',       cls: 'bb' },
  en_preparation:{ label: 'En préparation',cls: 'bb' },
  expediee:      { label: 'Expédiée',      cls: 'bg' },
  livree:        { label: 'Livrée',        cls: 'bg' },
  annulee:       { label: 'Annulée',       cls: 'br' },
};

const PAIEMENT_LABELS: Record<string, string> = {
  wave: 'Wave', orange_money: 'Orange Money', carte: 'Carte', cash_livraison: 'À la livraison',
};

// ── Détail commande modal ───────────────────────────────────────────────────
function OrderDetail({ id, onClose, onStatutChange }: {
  id: string; onClose: () => void; onStatutChange: () => void;
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useState(() => {
    ordersApi.getById(id).then(o => { setOrder(o as any); setLoading(false); });
  });

  const action = async (fn: () => Promise<any>) => {
    setActing(true);
    try { await fn(); onStatutChange(); onClose(); } finally { setActing(false); }
  };

  const s = order ? STATUTS[order.statut] : null;
  const items = (order as any)?.CommandeItems ?? [];
  const total = items.reduce((a: number, i: any) => a + Number(i.sousTotal), 0);

  return (
    <div className="db-modal-overlay db-modal-overlay--visible" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="db-modal db-modal--visible" style={{ maxWidth: 620, width: '96%', maxHeight: '90vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.4rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>Commande #{id.slice(0, 8).toUpperCase()}</span>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: 'var(--text2)' }}>✕</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '1.2rem 1.4rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '2rem' }}>Chargement…</div>
          ) : !order ? (
            <div style={{ textAlign: 'center', color: 'var(--red)', padding: '2rem' }}>Erreur de chargement.</div>
          ) : (
            <>
              {/* Infos client + statut */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.1rem' }}>
                <div style={{ background: 'var(--gray)', borderRadius: 10, padding: '0.9rem 1rem', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Client</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{(order as any).User?.nom} {(order as any).User?.prenom}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: 2 }}>{(order as any).User?.email}</div>
                </div>
                <div style={{ background: 'var(--gray)', borderRadius: 10, padding: '0.9rem 1rem', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Livraison</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{(order as any).Adresse?.ville ?? '—'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: 2 }}>{(order as any).Adresse?.rue ?? ''}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', marginBottom: '1.1rem' }}>
                <div style={{ background: 'var(--gray)', borderRadius: 10, padding: '0.9rem 1rem', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4 }}>Statut</div>
                  <span className={`badge ${s?.cls}`}>{s?.label}</span>
                </div>
                <div style={{ background: 'var(--gray)', borderRadius: 10, padding: '0.9rem 1rem', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4 }}>Paiement</div>
                  <div style={{ fontWeight: 600, fontSize: '0.87rem' }}>{PAIEMENT_LABELS[order.methodePaiement] ?? order.methodePaiement}</div>
                </div>
                <div style={{ background: 'var(--gray)', borderRadius: 10, padding: '0.9rem 1rem', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4 }}>Date</div>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{fmtDate(order.createdAt)}</div>
                </div>
              </div>

              {/* Articles */}
              <div style={{ fontWeight: 700, fontSize: '0.87rem', marginBottom: '0.6rem', color: 'var(--black)' }}>Articles commandés</div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: '1rem' }}>
                <table style={{ margin: 0 }}>
                  <thead><tr><th>Produit</th><th>Qté</th><th>Prix unit.</th><th>Sous-total</th></tr></thead>
                  <tbody>
                    {items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="db-td-bold">{item.Produit?.nom ?? `Produit #${item.produitId}`}</td>
                        <td>{item.quantite}</td>
                        <td>{fmtFcfa(item.prixUnitaire)}</td>
                        <td className="db-td-bold">{fmtFcfa(item.sousTotal)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, color: 'var(--black)' }}>Total</td>
                      <td style={{ fontWeight: 700, color: 'var(--black)', fontSize: '1rem' }}>{fmtFcfa(total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {order.note && (
                <div style={{ background: 'var(--gray)', borderRadius: 8, padding: '0.7rem 1rem', fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '0.8rem' }}>
                  <strong>Note client :</strong> {order.note}
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions selon statut */}
        {order && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem 1.4rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap', flexShrink: 0 }}>
            {order.statut === 'en_attente' && <>
              <button className="db-btn primary" disabled={acting} onClick={() => action(() => ordersApi.valider(id))}>Valider</button>
              <button className="db-btn confirm" disabled={acting} onClick={() => action(() => ordersApi.rejeter(id))}>Rejeter</button>
            </>}
            {order.statut === 'validee' && (
              <button className="db-btn primary" disabled={acting} onClick={() => action(() => ordersApi.preparation(id))}>Mettre en préparation</button>
            )}
            {order.statut === 'en_preparation' && (
              <button className="db-btn primary" disabled={acting} onClick={() => action(() => ordersApi.expedier(id))}>Marquer expédiée</button>
            )}
            {order.statut === 'expediee' && (
              <button className="db-btn primary" disabled={acting} onClick={() => action(() => ordersApi.livrer(id))}>Marquer livrée</button>
            )}
            <button className="db-btn secondary" style={{ marginLeft: 'auto' }} onClick={onClose}>Fermer</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page principale ─────────────────────────────────────────────────────────
export const OrdersPage = () => {
  const [page, setPage] = useState(1);
  const [statutFilter, setStatutFilter] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);

  const [toast, setToast] = useState({ msg: '', show: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast({ msg, show: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2800);
  };

  const { data, isLoading, isError, refetch } = useOrders({ page, limit: 15, statut: statutFilter || undefined });

  const orders = (data as any)?.rows ?? [];
  const totalPages = (data as any)?.totalPages ?? 1;
  const count = (data as any)?.count ?? 0;

  const FILTRES = [
    { label: 'Toutes', val: '' },
    { label: 'En attente', val: 'en_attente' },
    { label: 'Validées', val: 'validee' },
    { label: 'En préparation', val: 'en_preparation' },
    { label: 'Expédiées', val: 'expediee' },
    { label: 'Livrées', val: 'livree' },
    { label: 'Annulées', val: 'annulee' },
  ];

  return (
    <div style={{ padding: '1.6rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <div>
          <div style={{ fontSize: '1.08rem', fontWeight: 700, color: 'var(--black)' }}>Commandes</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: 2 }}>{count} commande{count > 1 ? 's' : ''} au total</div>
        </div>
      </div>

      {/* Filtres statut */}
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
        ) : orders.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text3)' }}>Aucune commande trouvée.</div>
        ) : (
          <div className="db-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Paiement</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o: Order) => {
                  const items = (o as any).CommandeItems ?? [];
                  const total = items.reduce((a: number, i: any) => a + Number(i.sousTotal), 0);
                  const s = STATUTS[o.statut];
                  return (
                    <tr key={o.id}>
                      <td className="db-td-bold" style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                        #{o.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.87rem' }}>
                          {(o as any).User?.nom} {(o as any).User?.prenom}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{(o as any).User?.email}</div>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                        {fmtDate(o.createdAt)}
                      </td>
                      <td style={{ fontSize: '0.83rem' }}>
                        {PAIEMENT_LABELS[o.methodePaiement] ?? o.methodePaiement}
                      </td>
                      <td className="db-td-bold">{total > 0 ? fmtFcfa(total) : '—'}</td>
                      <td><span className={`badge ${s?.cls}`}>{s?.label}</span></td>
                      <td>
                        <button className="db-btn-ghost" onClick={() => setDetailId(o.id)}>Voir détail</button>
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

      {detailId && (
        <OrderDetail
          id={detailId}
          onClose={() => setDetailId(null)}
          onStatutChange={() => { refetch(); showToast('Statut mis à jour'); }}
        />
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
