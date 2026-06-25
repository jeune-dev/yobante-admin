import { useEffect } from 'react';
import { useAuth } from '@/auth/hooks/useAuth';

export const AppSelector = () => {
  const { isShopAvailable, isShipmentAvailable, selectApp, logout } = useAuth();

  // Auto-redirect if only one app is available
  useEffect(() => {
    if (isShopAvailable && !isShipmentAvailable) {
      selectApp('shop');
    } else if (!isShopAvailable && isShipmentAvailable) {
      selectApp('shipment');
    }
  }, [isShopAvailable, isShipmentAvailable, selectApp]);

  const handleSelectApp = (app: 'shop' | 'shipment') => {
    selectApp(app);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bienvenue dans Yobante Admin</h1>
          <p className="text-gray-600 text-lg">Sélectionnez une application pour continuer</p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Boutique Card */}
          {isShopAvailable && (
            <button
              onClick={() => handleSelectApp('shop')}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-left hover:scale-105 transform"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="text-4xl">🛍️</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Yobante Boutique</h2>
                  <p className="text-sm text-gray-500">E-commerce Admin</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Gérez vos produits, commandes, paiements et avis clients. Contrôlez votre boutique
                en ligne complètement.
              </p>
              <div className="flex items-center text-blue-600 font-semibold group">
                Accéder à Boutique
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform">
                  <path
                    fill="currentColor"
                    d="M5 3l3.057 3.057M5 3l-3.057 3.057M5 3v12a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
            </button>
          )}

          {/* Colis Card */}
          {isShipmentAvailable && (
            <button
              onClick={() => handleSelectApp('shipment')}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-left hover:scale-105 transform"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="text-4xl">📦</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Yobante Colis</h2>
                  <p className="text-sm text-gray-500">Gestion Expéditions</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Tracez vos colis, gérez les expéditions, traitez les déclarations douanières et
                générez des factures.
              </p>
              <div className="flex items-center text-blue-600 font-semibold group">
                Accéder à Colis
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform">
                  <path
                    fill="currentColor"
                    d="M5 3l3.057 3.057M5 3l-3.057 3.057M5 3v12a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
            </button>
          )}

          {/* Fallback if neither available */}
          {!isShopAvailable && !isShipmentAvailable && (
            <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de connexion</h2>
              <p className="text-gray-600 mb-6">
                Impossible de se connecter aux services. Veuillez vérifier votre connexion Internet
                ou contacter le support.
              </p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="flex justify-center">
          <button
            onClick={logout}
            className="text-gray-600 hover:text-gray-900 font-semibold py-2 px-6 rounded-lg border border-gray-300 hover:border-gray-900 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
};
