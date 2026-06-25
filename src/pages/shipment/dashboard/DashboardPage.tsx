import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import '@/assets/css/Dashboard.css';
import LOGO from '@/assets/images/logo.png';

const FAKE_DATA = {
  jour: { colisActifs: 45, colisInactifs: 8, expeditions: 12, frais: 285000, clientsActifs: 32, clientsInactifs: 5 },
  semaine: { colisActifs: 45, colisInactifs: 8, expeditions: 78, frais: 1920000, clientsActifs: 32, clientsInactifs: 5 },
  mois: { colisActifs: 45, colisInactifs: 8, expeditions: 256, frais: 6840000, clientsActifs: 32, clientsInactifs: 5 },
};

const PAGES = {
  overview: { t: 'Vue d\'ensemble', s: 'Aperçu global de vos expéditions' },
  demandes: { t: 'Colis', s: 'Gestion de vos colis' },
  conteneurs: { t: 'Conteneurs', s: 'Gestion des conteneurs' },
  clients: { t: 'Clients', s: 'Gestion de vos clients' },
  admins: { t: 'Administrateurs', s: 'Gestion des administrateurs' },
};

export const ShipmentDashboard = () => {
  const [page, setPage] = useState('overview');
  const [sbOpen, setSbOpen] = useState(true);
  const [toast, setToast] = useState({ msg: '', show: false });
  const toastTimer = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const NAV_ITEMS = [
    { section: 'Tableau de bord' },
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'grid' },
    { section: 'Gestion Colis' },
    { id: 'demandes', label: 'Colis', badge: '0', icon: 'box' },
    { id: 'conteneurs', label: 'Conteneurs', badge: null, icon: 'container' },
    { id: 'clients', label: 'Clients', badge: '0', icon: 'users' },
    { section: 'Configuration' },
    { id: 'admins', label: 'Administrateurs', badge: null, icon: 'admin' },
  ];

  const data = FAKE_DATA.mois;

  const statCards = [
    { label: 'Colis actifs', value: data.colisActifs, color: 'green' },
    { label: 'Colis inactifs', value: data.colisInactifs, color: 'red' },
    { label: 'Expéditions', value: data.expeditions, color: 'blue' },
    { label: 'Frais totaux', value: `${data.frais.toLocaleString()} FCFA`, color: 'gold' },
    { label: 'Clients actifs', value: data.clientsActifs, color: 'green' },
    { label: 'Clients inactifs', value: data.clientsInactifs, color: 'red' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="db-app">
      <aside className={`db-sb${sbOpen ? '' : ' closed'}`}>
        <div className="db-sb-top">
          <img className="db-sb-logo" src={LOGO} alt="Yobante" />
          <div className="db-sb-brand">
            <div className="db-sb-name">Yobante</div>
            <div className="db-sb-sub">Expédition Colis</div>
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
                  <path d="M21 10V7a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 7v10a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 17v-7" />
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
                        <path d="M21 10V7a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 7v10a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 17v-7" />
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
