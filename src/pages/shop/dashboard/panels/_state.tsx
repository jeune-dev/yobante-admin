// Petits helpers d'état partagés par les panneaux (loading / erreur / vide).
interface StateRowProps {
  colSpan: number;
  loading?: boolean;
  error?: unknown;
  empty?: boolean;
  emptyLabel?: string;
}

export function StateRow({ colSpan, loading, error, empty, emptyLabel = 'Aucune donnée' }: StateRowProps) {
  let content = emptyLabel;
  if (loading) content = 'Chargement…';
  else if (error) content = 'Erreur de chargement';
  if (!loading && !error && !empty) return null;
  return (
    <tr>
      <td colSpan={colSpan} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
        {content}
      </td>
    </tr>
  );
}

export const fcfa = (n: number | string | undefined) =>
  `${Number(n || 0).toLocaleString()} FCFA`;
