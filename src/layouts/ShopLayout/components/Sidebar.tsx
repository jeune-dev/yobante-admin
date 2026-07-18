import { NavLink } from 'react-router-dom';
import Icon from '@/shared/components/dashboard/Icon';
import logo from '@/assets/images/Logo Yobante Boutique.png';
import pictogramme from '@/assets/images/Logo Yobante pictogramme - Version.png';

const NAV = [
  { label: 'Dashboard', icon: 'layout-dashboard', path: '/boutique/dashboard' },
  { label: "Page d'accueil", icon: 'layout-template', path: '/boutique/accueil' },
  { label: 'Rayons', icon: 'grid', path: '/boutique/rayons' },
  { label: 'Produits', icon: 'package', path: '/boutique/produits' },
  { label: 'Commandes', icon: 'shopping-cart', path: '/boutique/commandes' },
  { label: 'Clients', icon: 'users', path: '/boutique/clients' },
  { label: 'Vendeurs', icon: 'store', path: '/boutique/vendeurs' },
  { label: 'Demandes', icon: 'clipboard-list', path: '/boutique/demandes' },
  { label: 'Bannières', icon: 'image', path: '/boutique/bannieres' },
  { label: 'Avis', icon: 'star', path: '/boutique/avis' },
  { label: 'Paiements', icon: 'credit-card', path: '/boutique/paiements' },
  { label: 'Profil', icon: 'user', path: '/boutique/profil' },
  { label: 'Paramètres', icon: 'settings', path: '/boutique/parametres' },
];

interface Props {
  /** Repliée : seules les icônes restent visibles. */
  replie: boolean;
  onBasculer: () => void;
}

export default function ShopSidebar({ replie, onBasculer }: Props) {
  return (
    <aside
      className={`${
        replie ? 'w-20' : 'w-64'
      } min-h-screen bg-white border-r border-gray-100 flex flex-col transition-[width] duration-200`}
    >
      <div
        className={`h-16 flex items-center border-b border-gray-100 ${
          replie ? 'justify-center px-2' : 'justify-between px-4'
        }`}
      >
        {/* Repliée, le pictogramme seul tient dans la largeur réduite. */}
        <img
          src={replie ? pictogramme : logo}
          alt="Yobante Boutique"
          className={replie ? 'h-9 w-auto' : 'h-10 w-auto'}
        />
        {!replie && (
          <button
            type="button"
            onClick={onBasculer}
            aria-label="Replier le menu"
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700"
          >
            <Icon name="chevrons-left" size={18} />
          </button>
        )}
      </div>

      {replie && (
        <button
          type="button"
          onClick={onBasculer}
          aria-label="Déplier le menu"
          className="mx-auto mt-3 p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700"
        >
          <Icon name="chevrons-right" size={18} />
        </button>
      )}

      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            // `title` sert d'infobulle quand le libellé est masqué.
            title={replie ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 py-2.5 text-sm font-medium transition-colors ${
                replie ? 'justify-center px-0' : 'px-6'
              } ${
                isActive
                  ? 'bg-yellow-50 text-yellow-700 border-r-2 border-yellow-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon name={item.icon} size={18} />
            {!replie && item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
