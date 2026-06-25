import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SelectAppPage } from '@/pages/select-app/SelectAppPage';
import { PrivateRoute } from './PrivateRoute';
import { AppSelectGuard } from './AppSelectGuard';
import { ShopDashboard } from '@/pages/shop/dashboard/DashboardPage';

// Placeholder components for shipment
const ShipmentDashboard = () => <div className="p-8"><h1>Shipment Dashboard - À implémenter</h1></div>;
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

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <NotFound />,
    children: [
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
                path: 'shop/dashboard',
                element: <ShopDashboard />,
              },
              // Add more shop routes here as they're implemented
            ],
          },

          // Shipment routes
          {
            element: <AppSelectGuard requiredApp="shipment" />,
            children: [
              {
                path: 'shipment/dashboard',
                element: <ShipmentDashboard />,
              },
              // Add more shipment routes here as they're implemented
            ],
          },
        ],
      },

      // Redirect root to login
      {
        path: '/',
        element: <LoginPage />,
      },
    ],
  },
]);
