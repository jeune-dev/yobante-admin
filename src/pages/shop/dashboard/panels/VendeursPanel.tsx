import { useVendeurs, useValiderVendeur, useToggleVendeur } from '@/domains/shop/hooks/useAdminBoutique';
import { StateRow } from './_state';

interface Vendeur {
  id: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string | null;
  isActive?: boolean;
  statutValidation?: string;
  boutique?: { nom?: string } | string;
}

const nomBoutique = (b: Vendeur['boutique']) =>
  typeof b === 'string' ? b : b?.nom || '—';

export default function VendeursPanel() {
  const { data, isLoading, isError } = useVendeurs();
  const valider = useValiderVendeur();
  const toggle = useToggleVendeur();

  const vendeurs: Vendeur[] = data?.vendeurs ?? [];

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: '1rem', alignItems: 'center' }}>
        <div style={{ fontSize: '0.9rem', color: '#555' }}>{vendeurs.length} vendeur(s)</div>
      </div>
      <div className="db-card">
        <div className="db-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vendeur</th>
                <th>Boutique</th>
                <th>Email</th>
                <th>Validation</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <StateRow colSpan={6} loading={isLoading} error={isError} empty={vendeurs.length === 0} emptyLabel="Aucun vendeur" />
              {!isLoading && !isError &&
                vendeurs.map((v) => (
                  <tr key={v.id}>
                    <td className="db-td-bold">{v.prenom} {v.nom}</td>
                    <td>{nomBoutique(v.boutique)}</td>
                    <td>{v.email || '—'}</td>
                    <td>
                      <span className="badge bgo">{v.statutValidation || 'En attente'}</span>
                    </td>
                    <td>
                      <span style={{ background: v.isActive ? '#d1fae5' : '#fee2e2', color: v.isActive ? '#065f46' : '#991b1b', padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                        {v.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <div className="db-actions">
                        <button className="db-btn-ghost" style={{ color: '#065f46', borderColor: '#065f46' }} disabled={valider.isPending} onClick={() => valider.mutate({ id: v.id, step: 1 })}>Valider</button>
                        <button className="db-btn-ghost" disabled={toggle.isPending} onClick={() => toggle.mutate(v.id)}>{v.isActive ? 'Désactiver' : 'Activer'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
