import { useCommandes } from '@/domains/shop/hooks/useAdminBoutique';
import { StateRow, fcfa } from './_state';

interface Commande {
  id: string;
  numero?: string;
  reference?: string;
  client?: { nom?: string; prenom?: string } | string;
  montant?: number;
  total?: number;
  statut?: string;
  createdAt?: string;
}

const nomClient = (c: Commande['client']) =>
  typeof c === 'string' ? c : c ? `${c.prenom ?? ''} ${c.nom ?? ''}`.trim() : '—';

export default function CommandesPanel() {
  const { data, isLoading, isError } = useCommandes();
  const commandes: Commande[] = data?.commandes ?? [];

  return (
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
            </tr>
          </thead>
          <tbody>
            <StateRow colSpan={5} loading={isLoading} error={isError} empty={commandes.length === 0} emptyLabel="Aucune commande" />
            {!isLoading && !isError &&
              commandes.map((c) => (
                <tr key={c.id}>
                  <td className="db-td-bold">{c.numero || c.reference || c.id.slice(0, 8)}</td>
                  <td>{nomClient(c.client)}</td>
                  <td>{fcfa(c.montant ?? c.total)}</td>
                  <td><span className="badge bgo">{c.statut || '—'}</span></td>
                  <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
