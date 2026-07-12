// statusBadge — mappe un libellé de statut vers une classe de badge (db-*).
// Porté depuis yobante-frontend/src/helpers/statusBadge.jsx
export function statusBadge(s: string): string {
  const map: Record<string, string> = {
    Actif: 'badge bg',
    Inactif: 'badge bgo',
    Banni: 'badge br',
    'En attente': 'badge bgo',
    'Publié': 'badge bg',
    'Signalé': 'badge br',
    'Expiré': 'badge br',
    'Expire bientôt': 'badge bgo',
    Premium: 'badge bgo',
    Gratuit: 'badge bx',
    'Cuisinière': 'badge bg',
    Agriculteur: 'badge bb',
    'Plat cuisiné': 'badge bg',
    Fruit: 'badge bb',
    'Légume': 'badge bb',
    Boisson: 'badge bb',
  };
  return map[s] || 'badge bx';
}
