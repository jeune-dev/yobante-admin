import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService, LoginPayload } from '@/auth/services/auth.service';
import { useAuthStore } from '@/auth/store/auth.store';

export const useLogin = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setTokenAvailability = useAuthStore((state) => state.setTokenAvailability);
  const setLoading = useAuthStore((state) => state.setLoading);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (result) => {
      if (!result.user) {
        throw new Error('No user data received');
      }

      // Store user and token availability
      setUser(result.user);
      setAuthenticated(true);
      setTokenAvailability(result.shop.success, result.shipment.success);

      // If only one backend is available, redirect directly
      if (result.shop.success && !result.shipment.success) {
        useAuthStore.getState().setSelectedApp('shop');
        navigate('/shop/dashboard');
      } else if (!result.shop.success && result.shipment.success) {
        useAuthStore.getState().setSelectedApp('shipment');
        navigate('/shipment/dashboard');
      } else if (result.shop.success && result.shipment.success) {
        // Both available - go to selection page
        navigate('/select-app');
      }

      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });
};
