import { useAuth } from '@/auth/hooks/useAuth';
import Icon from '@/shared/components/dashboard/Icon';
import '@/assets/css/Login.css';
import LOGO from '@/assets/images/logo.png';

interface Espace {
  id: 'shop' | 'shipment';
  accent: string;
  ink: string;
  titre: string;
  desc: string;
  chips: string[];
  icon: string;
  useLogo?: boolean;
}

const ESPACES: Espace[] = [
  {
    id: 'shop',
    accent: '#f5c518',
    ink: '#0f1729',
    titre: 'Yobante Boutique',
    desc: "Gérez le catalogue, les promotions, les bannières et l'application mobile.",
    chips: ['Produits', 'Promotions', 'Bannières', 'Vendeurs', 'Commandes'],
    icon: 'shopping-bag',
    useLogo: true,
  },
  {
    id: 'shipment',
    accent: '#17379b',
    ink: '#ffffff',
    titre: 'Yobante Colis',
    desc: 'Pilotez les expéditions, les conteneurs, les tarifs et le suivi client.',
    chips: ['Expéditions', 'Conteneurs', 'Suivi', 'Tarifs', 'Clients'],
    icon: 'ship',
  },
];

export const AppSelector = () => {
  const { selectApp, logout } = useAuth();

  return (
    <div className="auth-page selector-page">
      <div className="selector-shell">
        <div className="selector-head">
          <div className="selector-brand-tile">
            <img src={LOGO} alt="Yobante" />
          </div>
          <span className="selector-eyebrow">Plateforme d'administration</span>
          <div className="selector-title">Bienvenue sur Yobante</div>
          <div className="selector-sub">Choisissez l'espace que vous souhaitez gérer</div>
        </div>

        <div className="selector-grid">
          {ESPACES.map((e) => (
            <button
              key={e.id}
              className="selector-card"
              style={{ '--accent': e.accent, '--accent-ink': e.ink } as React.CSSProperties}
              onClick={() => selectApp(e.id)}
            >
              <div className="selector-card-logo">
                {e.useLogo ? (
                  <img src={LOGO} alt={e.titre} />
                ) : (
                  <Icon name={e.icon} size={40} />
                )}
              </div>
              <div className="selector-card-title">{e.titre}</div>
              <div className="selector-card-desc">{e.desc}</div>
              <div className="selector-chips">
                {e.chips.map((c) => (
                  <span className="selector-chip" key={c}>{c}</span>
                ))}
              </div>
              <div className="selector-card-cta">
                Accéder à l'espace
                <Icon name="arrow-right" size={16} />
              </div>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="selector-logout" onClick={logout}>
            <Icon name="log-out" size={14} />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};
