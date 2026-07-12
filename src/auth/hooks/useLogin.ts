import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
      // Aucun backend n'a authentifié l'utilisateur → identifiants invalides / serveur injoignable
      if (!result.user) {
        const message =
          result.shop.error?.message ||
          result.shipment.error?.message ||
          'Identifiant ou mot de passe incorrect';
        toast.error(message);
        setLoading(false);
        return;
      }

      // Store user and token availability
      setUser(result.user);
      setAuthenticated(true);
      setTokenAvailability(result.shop.success, result.shipment.success);

      // On affiche TOUJOURS la page de choix d'espace (Boutique / Colis).
      useAuthStore.getState().setSelectedApp(null);
      navigate('/select-app');

      setLoading(false);
    },
    onError: () => {
      toast.error('Connexion impossible. Réessayez.');
      setLoading(false);
    },
  });
};
