import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SelectAppPage } from '@/pages/select-app/SelectAppPage';
import { PrivateRoute } from './PrivateRoute';
import { AppSelectGuard } from './AppSelectGuard';
import { ShopDashboard } from '@/pages/shop/dashboard/DashboardPage';
import { ShipmentDashboard } from '@/pages/shipment/dashboard/DashboardPage';
const NotFound = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-gray-600 mb-4">Page non trouvée</p>
      <a href="/" className="text-blue-600 hover:text-blue-700">
        Retour à l'accueil
      </a>
    </div>
  </div>
);

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

        // Public routes
        {
          path: 'login',
          element: <LoginPage />,
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
