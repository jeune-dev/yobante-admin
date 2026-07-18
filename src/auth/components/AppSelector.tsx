import { useAuth } from '@/auth/hooks/useAuth';
import Icon from '@/shared/components/dashboard/Icon';
import '@/assets/css/Login.css';
import { LOGO_BOUTIQUE_WHITE, LOGO_REK_WHITE } from '@/assets/images/logos';

interface Espace {
  id: 'shop' | 'shipment';
  accent: string;
  ink: string;
  titre: string;
  desc: string;
  chips: string[];
  image: string;
}

const ESPACES: Espace[] = [
  {
    id: 'shop',
    accent: '#f5c518',
    ink: '#0f1729',
    titre: 'Yobante Boutique',
    desc: "Gérez le catalogue, les promotions, les bannières et l'application mobile.",
    chips: ['Produits', 'Promotions', 'Bannières', 'Vendeurs', 'Commandes'],
    image: LOGO_BOUTIQUE_WHITE,
  },
  {
    id: 'shipment',
    accent: '#17379b',
    ink: '#ffffff',
    titre: 'Yobante Colis',
    desc: 'Pilotez les expéditions, les conteneurs, les tarifs et le suivi client.',
    chips: ['Expéditions', 'Conteneurs', 'Suivi', 'Tarifs', 'Clients'],
    image: LOGO_REK_WHITE,
  },
];

export const AppSelector = () => {
  const { selectApp, logout } = useAuth();

  return (
    <div className="auth-page selector-page">
      <div className="selector-shell">
        <div className="selector-head">
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
                <img src={e.image} alt={e.titre} />
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
