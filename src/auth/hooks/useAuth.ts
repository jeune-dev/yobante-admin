import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/auth/store/auth.store';
import { authService } from '@/auth/services/auth.service';

export const useAuth = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const selectedApp = useAuthStore((state) => state.selectedApp);
  const isShopAvailable = useAuthStore((state) => state.isShopAvailable);
  const isShipmentAvailable = useAuthStore((state) => state.isShipmentAvailable);
  const setSelectedApp = useAuthStore((state) => state.setSelectedApp);
  const logout = useAuthStore((state) => state.logout);

  const selectApp = (app: 'shop' | 'shipment') => {
    setSelectedApp(app);
    navigate(app === 'shop' ? '/boutique/dashboard' : '/colis/dashboard');
  };

  const handleLogout = async () => {
    await authService.logout();
    logout();
    navigate('/login');
  };

  return {
    user,
    isAuthenticated,
    selectedApp,
    isShopAvailable,
    isShipmentAvailable,
    selectApp,
    logout: handleLogout,
  };
};
