import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/auth/store/auth.store';

interface AppSelectGuardProps {
  requiredApp: 'shop' | 'shipment';
}

export const AppSelectGuard = ({ requiredApp }: AppSelectGuardProps) => {
  const selectedApp = useAuthStore((state) => state.selectedApp);

  if (!selectedApp || selectedApp !== requiredApp) {
    return <Navigate to="/select-app" replace />;
  }

  return <Outlet />;
};
