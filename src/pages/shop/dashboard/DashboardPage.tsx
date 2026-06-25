import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import '@/assets/css/Dashboard.css';
import LOGO from '@/assets/images/logo.png';

const FAKE_DATA = {
  jour: { produitsActifs: 24, produitsInactifs: 3, commandes: 5, ca: 125000, clientsActifs: 18, clientsInactifs: 2 },
  semaine: { produitsActifs: 24, produitsInactifs: 3, commandes: 31, ca: 870000, clientsActifs: 18, clientsInactifs: 2 },
  mois: { produitsActifs: 24, produitsInactifs: 3, commandes: 98, ca: 2340000, clientsActifs: 18, clientsInactifs: 2 },
};

const PAGES = {
  overview: { t: 'Vue d\'ensemble', s: 'Aperçu global de votre boutique' },
  produits: { t: 'Produits', s: 'Gestion de vos produits' },
  commandes: { t: 'Commandes', s: 'Suivi de vos commandes' },
  clients: { t: 'Clients', s: 'Gestion de vos clients' },
};

export const ShopDashboard = () => {
  const [page, setPage] = useState('overview');
  const [sbOpen, setSbOpen] = useState(true);
  const [toast, setToast] = useState({ msg: '', show: false });
  const toastTimer = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const NAV_ITEMS = [
    { section: 'Tableau de bord' },
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'grid' },
    { section: 'Gestion Boutique' },
    { id: 'produits', label: 'Produits', badge: '0', icon: 'box' },
    { id: 'commandes', label: 'Commandes', badge: '0', icon: 'check' },
    { id: 'clients', label: 'Clients', badge: '0', icon: 'users' },
  ];

  const data = FAKE_DATA.mois;

  const statCards = [
    { label: 'Produits actifs', value: data.produitsActifs, color: 'green' },
    { label: 'Produits inactifs', value: data.produitsInactifs, color: 'red' },
    { label: 'Total commandes', value: data.commandes, color: 'blue' },
    { label: 'Chiffre d\'affaires', value: `${data.ca.toLocaleString()} FCFA`, color: 'gold' },
    { label: 'Clients actifs', value: data.clientsActifs, color: 'green' },
    { label: 'Clients inactifs', value: data.clientsInactifs, color: 'red' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="db-app boutique">
      <aside className={`db-sb${sbOpen ? '' : ' closed'}`}>
        <div className="db-sb-top">
          <img className="db-sb-logo" src={LOGO} alt="Yobante" />
          <div className="db-sb-brand">
            <div className="db-sb-name">Yobante</div>
            <div className="db-sb-sub">Boutique</div>
          </div>
          <button className="db-sb-toggle" onClick={() => setSbOpen(!sbOpen)} title="Réduire / Agrandir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        <nav className="db-nav">
          {NAV_ITEMS.map((item, i) =>
            'section' in item ? (
              <div key={i} className="db-nav-section">{item.section}</div>
            ) : (
              <div key={item.id} className={`db-nav-item${page === item.id ? ' active' : ''}`} data-label={item.label} onClick={() => setPage(item.id)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                </svg>
                <span className="db-nav-label">{item.label}</span>
                {item.badge && <span className="db-nav-badge">{item.badge}</span>}
              </div>
            )
          )}
        </nav>

        <div className="db-sb-foot">
          <div className="db-admin-pill">
            <div className="db-admin-ava">{user ? `${user.nom[0]}${user.prenom[0]}`.toUpperCase() : 'A'}</div>
            <div className="db-admin-info">
              <div className="db-admin-name">{user ? `${user.nom} ${user.prenom}` : 'Admin'}</div>
              <div className="db-admin-role">{user?.role || 'Admin'}</div>
            </div>
            <button className="db-logout-btn" onClick={handleLogout} title="Déconnexion">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <div className={`db-main${sbOpen ? '' : ' wide'}`}>
        <div className="db-topbar">
          <div>
            <div className="db-page-title">{PAGES[page as keyof typeof PAGES]?.t || 'Dashboard'}</div>
            <div className="db-page-sub">{PAGES[page as keyof typeof PAGES]?.s || ''}</div>
          </div>
        </div>

        <div className="db-content">
          {page === 'overview' && (
            <div className="db-panel active">
              <div className="db-stats-grid">
                {statCards.map((card, i) => (
                  <div key={i} className="db-stat-card">
                    <div className={`db-stat-icon ${card.color}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      </svg>
                    </div>
                    <div className="db-stat-label">{card.label}</div>
                    <div className="db-stat-value">{card.value}</div>
                  </div>
                ))}
              </div>
              <div className="db-card" style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: '#888' }}>Contenu du dashboard en construction...</p>
              </div>
            </div>
          )}
          {page !== 'overview' && (
            <div className="db-panel active">
              <div className="db-card" style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: '#888' }}>Cette section est en développement</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`db-toast${toast.show ? ' show' : ''}`}>
        <div className="db-toast-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        {toast.msg}
      </div>
    </div>
  );
};
