import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/auth/store/auth.store';
import Icon from '@/shared/components/dashboard/Icon';

/** Libellés des sections, pour situer l'utilisateur dans le dashboard. */
const TITRES: Record<string, string> = {
  dashboard: 'Tableau de bord',
  accueil: "Page d'accueil",
  rayons: 'Rayons',
  produits: 'Produits',
  commandes: 'Commandes',
  clients: 'Clients',
  vendeurs: 'Vendeurs',
  demandes: 'Demandes de publication',
  bannieres: 'Bannières',
  avis: 'Avis',
  paiements: 'Paiements',
  profil: 'Mon profil',
  parametres: 'Paramètres',
};

export default function ShopHeader() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { pathname } = useLocation();

  // /boutique/<section>/... → on ne garde que la section pour le titre.
  const section = pathname.split('/')[2] ?? 'dashboard';
  const titre = TITRES[section] ?? 'Boutique';

  const initiales = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase();

  return (
    <header className="h-16 shrink-0 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <div className="min-w-0">
        <h1 className="text-[15px] font-bold text-gray-900 truncate">{titre}</h1>
        <p className="text-xs text-gray-400">Yobante Boutique</p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/boutique/profil"
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          title="Mon profil"
        >
          <span className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-700 text-xs font-bold flex items-center justify-center shrink-0">
            {initiales || <Icon name="user" size={15} />}
          </span>
          <span className="text-sm text-gray-700 hidden sm:block">
            {user?.prenom} {user?.nom}
          </span>
        </Link>

        <button
          onClick={logout}
          className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          title="Déconnexion"
        >
          <Icon name="log-out" size={18} />
        </button>
      </div>
    </header>
  );
}
