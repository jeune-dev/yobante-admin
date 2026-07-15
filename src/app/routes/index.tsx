import { createBrowserRouter, Navigate, useRouteError } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SelectAppPage } from '@/pages/select-app/SelectAppPage';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { AppSelectGuard } from './AppSelectGuard';
import { ShopDashboard } from '@/pages/shop/dashboard/DashboardPage';
import { ShipmentDashboard } from '@/pages/shipment/dashboard/DashboardPage';

const NotFound = () => {
  const error = useRouteError() as any;
  const is404 = !error || error?.status === 404;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', maxWidth: 600, padding: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          {is404 ? '404' : '🚨 Erreur'}
        </h1>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          {is404 ? 'Page non trouvée' : (error?.message || String(error))}
        </p>
        {!is404 && error?.stack && (
          <pre style={{ textAlign: 'left', fontSize: '0.75rem', background: '#f5f5f5', padding: '1rem', borderRadius: 8, overflow: 'auto', maxHeight: 200, color: '#991b1b' }}>
            {error.stack}
          </pre>
        )}
        <a href="/yobante-admin/login" style={{ color: '#1a56db' }}>Retour à l'accueil</a>
      </div>
    </div>
  );
};

export const router = createBrowserRouter(
  [
    {
      path: '/',
      errorElement: <NotFound />,
      children: [
        // Redirect root to login
        {
          index: true,
          element: <Navigate to="/login" replace />,
        },

        // Public routes — redirige vers select-app si déjà connecté
        {
          element: <PublicRoute />,
          children: [
            {
              path: 'login',
              element: <LoginPage />,
            },
          ],
        },

        // Protected routes - Auth required
        {
          element: <PrivateRoute />,
          children: [
            {
              path: 'select-app',
              element: <SelectAppPage />,
            },

            // Shop routes
            {
              element: <AppSelectGuard requiredApp="shop" />,
              children: [
                {
                  path: 'boutique/dashboard',
                  element: <ShopDashboard />,
                },
              ],
            },

            // Shipment routes
            {
              element: <AppSelectGuard requiredApp="shipment" />,
              children: [
                {
                  path: 'colis/dashboard',
                  element: <ShipmentDashboard />,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  {
    basename: '/yobante-admin',
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);
