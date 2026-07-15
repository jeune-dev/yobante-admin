import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '@/auth/store/auth.store';
import { tokenManager } from '@/infrastructure/auth/tokenManager';
import { ENV } from '@/config/env';

// Tente de restaurer la session via le cookie HttpOnly sans interaction utilisateur.
// Si le cookie est valide, le backend retourne un nouvel access token → session restaurée.
// Si le cookie est absent ou expiré → redirection vers /login.
const useSilentRefresh = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const [checking, setChecking] = useState(!isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      setChecking(false);
      return;
    }

    axios
      .post(`${ENV.VITE_SHOP_API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        const token = res.data?.data?.token;
        const user = res.data?.data?.user;
        if (token) {
          tokenManager.setShopToken(token);
          setAuthenticated(true);
          if (user) setUser(user);
        }
      })
      .catch(() => {
        // Cookie absent ou expiré — l'utilisateur devra se reconnecter
        setAuthenticated(false);
      })
      .finally(() => setChecking(false));
  }, []);

  return checking;
};

export const PrivateRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const checking = useSilentRefresh();

  if (checking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f3' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e2e2de', borderTopColor: '#1a56db', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
};
