import { useState } from 'react';
import { useProduitsAValider, useValiderProduit, useRejeterProduit } from '@/domains/shop/hooks/useAdminBoutique';
import Icon from '@/shared/components/dashboard/Icon';
import { StateRow, fcfa } from './_state';

interface Demande {
  id: string;
  nom?: string;
  titre?: string;
  prix?: number;
  vendeur?: { nom?: string; prenom?: string } | string;
  createdAt?: string;
}

const nomVendeur = (v: Demande['vendeur']) =>
  typeof v === 'string' ? v : v ? `${v.prenom ?? ''} ${v.nom ?? ''}`.trim() : '—';

export default function DemandesPanel() {
  const { data, isLoading, isError } = useProduitsAValider();
  const valider = useValiderProduit();
  const rejeter = useRejeterProduit();
  const [rejet, setRejet] = useState<Demande | null>(null);
  const [motif, setMotif] = useState('');

  const demandes: Demande[] = data?.produits ?? [];

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: '1rem', alignItems: 'center' }}>
        <div style={{ fontSize: '0.9rem', color: '#555' }}>
          <strong>{data?.total ?? demandes.length}</strong> demande(s) en attente de validation
        </div>
      </div>

      <div className="db-card">
        <div className="db-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Vendeur</th>
                <th>Prix</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <StateRow colSpan={4} loading={isLoading} error={isError} empty={demandes.length === 0} emptyLabel="Aucune demande en attente" />
              {!isLoading && !isError &&
                demandes.map((d) => (
                  <tr key={d.id}>
                    <td className="db-td-bold">{d.nom || d.titre || '—'}</td>
                    <td>{nomVendeur(d.vendeur)}</td>
                    <td>{fcfa(d.prix)}</td>
                    <td>
                      <div className="db-actions">
                        <button className="db-btn-ghost" style={{ color: '#065f46', borderColor: '#065f46', fontSize: '0.78rem' }} disabled={valider.isPending} onClick={() => valider.mutate({ id: d.id, step: 1 })}>Étape 1 ✓</button>
                        <button className="db-btn-ghost" style={{ color: '#1a56db', borderColor: '#1a56db', fontSize: '0.78rem' }} disabled={valider.isPending} onClick={() => valider.mutate({ id: d.id, step: 2 })}>Étape 2 ✓</button>
                        <button className="db-btn-danger" onClick={() => { setRejet(d); setMotif(''); }}>Rejeter</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {rejet && (
        <div onClick={() => setRejet(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
            <div className="db-modal-head">
              <div className="db-modal-title">Rejeter la demande</div>
              <button className="db-modal-close" onClick={() => setRejet(null)}><Icon name="x" size={14} /></button>
            </div>
            <div style={{ padding: '0 1.65rem' }}>
              <div className="db-form-group">
                <label className="db-form-label">Motif du rejet</label>
                <textarea className="db-form-input" value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Expliquez la raison…" rows={3} />
              </div>
            </div>
            <div className="db-modal-footer">
              <button className="db-btn secondary" onClick={() => setRejet(null)}>Annuler</button>
              <button className="db-btn confirm" disabled={rejeter.isPending} onClick={() => { rejeter.mutate({ id: rejet.id, motif }); setRejet(null); }}>Rejeter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
