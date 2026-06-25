import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSelector } from '@/auth/components/AppSelector';
import { useAuthStore } from '@/auth/store/auth.store';

export const SelectAppPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return <AppSelector />;
};
