import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import Icon from '@/shared/components/dashboard/Icon';
import '@/assets/css/Dashboard.css';
import LOGO from '@/assets/images/logo.png';

import OverviewPanel from './panels/OverviewPanel';
import ColisPanel from './panels/ColisPanel';
import ConteneursPanel from './panels/ConteneursPanel';
import ClientsPanel from './panels/ClientsPanel';
import AdminsPanel from './panels/AdminsPanel';

type NavItem = { section: string } | { id: string; label: string; icon: string; badge?: string };

const NAV: NavItem[] = [
  { section: 'Tableau de bord' },
  { id: 'overview', label: "Vue d'ensemble", icon: 'home' },
  { section: 'Gestion Colis' },
  { id: 'demandes', label: 'Colis', icon: 'package' },
  { id: 'conteneurs', label: 'Conteneurs', icon: 'truck' },
  { id: 'clients', label: 'Clients', icon: 'users' },
  { section: 'Configuration' },
  { id: 'admins', label: 'Administrateurs', icon: 'lock' },
];

const PAGES: Record<string, { t: string; s: string }> = {
  overview: { t: "Vue d'ensemble", s: 'Tableau de bord Colis' },
  demandes: { t: 'Colis', s: 'Gestion des colis et expéditions' },
  conteneurs: { t: 'Conteneurs', s: 'Gestion des conteneurs' },
  clients: { t: 'Clients', s: 'Gestion des clients' },
  admins: { t: 'Administrateurs', s: 'Gestion des accès' },
};

export const ShipmentDashboard = () => {
  const [page, setPage] = useState('overview');
  const [sbOpen, setSbOpen] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="db-app">
      <aside className={`db-sb${sbOpen ? '' : ' closed'}`}>
        <div className="db-sb-top">
          <img className="db-sb-logo" src={LOGO} alt="Yobante" style={{ objectFit: 'contain', background: '#fff', padding: 4 }} />
          <div className="db-sb-brand">
            <div className="db-sb-name">Yobante</div>
            <div className="db-sb-sub">Expédition Colis</div>
          </div>
          <button className="db-sb-toggle" onClick={() => setSbOpen((o) => !o)} title="Réduire / Agrandir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        <nav className="db-nav">
          {NAV.map((item, i) =>
            'section' in item ? (
              <div className="db-nav-section" key={i}>{item.section}</div>
            ) : (
              <div
                key={item.id}
                className={`db-nav-item${page === item.id ? ' active' : ''}`}
                data-label={item.label}
                onClick={() => setPage(item.id)}
              >
                <Icon name={item.icon} size={18} />
                <span className="db-nav-label">{item.label}</span>
                {item.badge && <span className="db-nav-badge">{item.badge}</span>}
              </div>
            )
          )}
        </nav>

        <div style={{ padding: '0 0.75rem', marginBottom: '0.5rem' }}>
          <button
            onClick={() => navigate('/select-app')}
            className="db-btn secondary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
          >
            <Icon name="chevron-right" size={14} style={{ transform: 'rotate(180deg)' }} />
            Changer d'espace
          </button>
        </div>

        <div className="db-sb-foot">
          <div className="db-admin-pill">
            <div className="db-admin-ava">{user ? `${user.nom[0]}${user.prenom[0]}`.toUpperCase() : 'A'}</div>
            <div className="db-admin-info">
              <div className="db-admin-name">{user ? `${user.nom} ${user.prenom}` : 'Administrateur'}</div>
              <div className="db-admin-role">{user?.role || 'Admin'}</div>
            </div>
            <button className="db-logout-btn" onClick={handleLogout} title="Déconnexion">
              <Icon name="log-out" size={14} />
            </button>
          </div>
        </div>
      </aside>

      {!sbOpen && (
        <button className="db-sb-mini-toggle" onClick={() => setSbOpen(true)} title="Ouvrir le menu">
          <Icon name="chevron-right" size={20} style={{ transform: 'rotate(180deg)' }} />
        </button>
      )}

      <div className={`db-main${sbOpen ? '' : ' wide'}`}>
        <header className="db-topbar">
          <div>
            <div className="db-page-title">{PAGES[page]?.t || 'Dashboard'}</div>
            <div className="db-page-sub">{PAGES[page]?.s || ''}</div>
          </div>
        </header>

        <div className="db-content">
          <div className="db-panel active">
            {page === 'overview' && <OverviewPanel />}
            {page === 'demandes' && <ColisPanel />}
            {page === 'conteneurs' && <ConteneursPanel />}
            {page === 'clients' && <ClientsPanel />}
            {page === 'admins' && <AdminsPanel />}
          </div>
        </div>
      </div>
    </div>
  );
};
