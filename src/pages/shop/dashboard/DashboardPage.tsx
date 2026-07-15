import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import Icon from '@/shared/components/dashboard/Icon';
import '@/assets/css/Dashboard.css';
import LOGO from '@/assets/images/logo.png';

import OverviewPanel from './panels/OverviewPanel';
import ProduitsPanel from './panels/ProduitsPanel';
import SectionsPanel from './panels/SectionsPanel';
import CommandesPanel from './panels/CommandesPanel';
import ClientsPanel from './panels/ClientsPanel';
import BannieresPanel from './panels/BannieresPanel';
import PromotionsPanel from './panels/PromotionsPanel';
import DemandesPanel from './panels/DemandesPanel';
import VendeursPanel from './panels/VendeursPanel';
import AdminsPanel from './panels/AdminsPanel';
import { PanelErrorBoundary } from '@/shared/components/dashboard/PanelErrorBoundary';

type NavItem =
  | { section: string }
  | { id: string; label: string; icon: string; badge?: string; badgeRed?: boolean };

const NAV: NavItem[] = [
  { section: 'Tableau de bord' },
  { id: 'overview', label: "Vue d'ensemble", icon: 'home' },
  { section: 'Gestion Boutique' },
  { id: 'produits', label: 'Produits', icon: 'shopping-bag' },
  { id: 'sections', label: 'Sections', icon: 'tag' },
  { id: 'commandes', label: 'Commandes', icon: 'package' },
  { id: 'clients', label: 'Clients', icon: 'users' },
  { section: 'Marketing & Contenu' },
  { id: 'bannieres', label: 'Bannières', icon: 'image' },
  { id: 'promotions', label: 'Promotions', icon: 'sparkles' },
  { section: 'Collaboration' },
  { id: 'demandes', label: 'Demandes', icon: 'inbox' },
  { id: 'vendeurs', label: 'Vendeurs', icon: 'user' },
  { section: 'Configuration' },
  { id: 'admins', label: 'Administrateurs', icon: 'lock' },
];

const PAGES: Record<string, { t: string; s: string }> = {
  overview: { t: "Vue d'ensemble", s: 'Tableau de bord Boutique' },
  produits: { t: 'Produits', s: 'Validation et gestion des produits' },
  sections: { t: 'Sections', s: "Rayons et collections de l'app" },
  commandes: { t: 'Commandes', s: 'Gestion des commandes' },
  clients: { t: 'Clients', s: 'Gestion des clients boutique' },
  bannieres: { t: 'Bannières', s: "Carrousel affiché sur l'app" },
  promotions: { t: 'Promotions', s: 'Sessions promotionnelles et réductions' },
  demandes: { t: 'Demandes de publication', s: 'Validation des soumissions vendeurs' },
  vendeurs: { t: 'Vendeurs', s: 'Collaborateurs et permissions' },
  admins: { t: 'Administrateurs', s: 'Gestion des accès' },
};

export const ShopDashboard = () => {
  const [page, setPage] = useState('overview');
  const [sbOpen, setSbOpen] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="db-app boutique">
      <aside className={`db-sb${sbOpen ? '' : ' closed'}`}>
        <div className="db-sb-top">
          <img className="db-sb-logo" src={LOGO} alt="Yobante" style={{ objectFit: 'contain', background: '#fff', padding: 4 }} />
          <div className="db-sb-brand">
            <div className="db-sb-name">Yobante</div>
            <div className="db-sb-sub">Boutique</div>
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
                style={!sbOpen ? { justifyContent: 'center', padding: '0.7rem 0', gap: 0, borderLeftColor: 'transparent' } : undefined}
              >
                <Icon name={item.icon} size={18} />
                <span className="db-nav-label">{item.label}</span>
                {item.badge && <span className={`db-nav-badge${item.badgeRed ? ' red' : ''}`}>{item.badge}</span>}
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

      <div className={`db-main${sbOpen ? '' : ' wide'}`}>
        <header className="db-topbar">
          <div>
            <div className="db-page-title">{PAGES[page]?.t || 'Dashboard'}</div>
            <div className="db-page-sub">{PAGES[page]?.s || ''}</div>
          </div>
        </header>

        <div className="db-content">
          <div className="db-panel active">
            <PanelErrorBoundary panel={PAGES[page]?.t ?? page}>
              {page === 'overview'    && <OverviewPanel />}
              {page === 'produits'    && <ProduitsPanel />}
              {page === 'sections'    && <SectionsPanel />}
              {page === 'commandes'   && <CommandesPanel />}
              {page === 'clients'     && <ClientsPanel />}
              {page === 'bannieres'   && <BannieresPanel />}
              {page === 'promotions'  && <PromotionsPanel />}
              {page === 'demandes'    && <DemandesPanel />}
              {page === 'vendeurs'    && <VendeursPanel />}
              {page === 'admins'      && <AdminsPanel />}
            </PanelErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};
