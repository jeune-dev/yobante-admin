import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/auth/store/auth.store';

// Si l'utilisateur est déjà authentifié, la page de login est inaccessible.
export const PublicRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) return <Navigate to="/select-app" replace />;

  return <Outlet />;
};
