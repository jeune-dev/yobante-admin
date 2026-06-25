import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/auth/store/auth.store';

export const PrivateRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
