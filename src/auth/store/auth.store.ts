import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tokenManager } from '@/infrastructure/auth/tokenManager';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  selectedApp: 'shop' | 'shipment' | null;
  isShopAvailable: boolean;
  isShipmentAvailable: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
  setSelectedApp: (app: 'shop' | 'shipment' | null) => void;
  setTokenAvailability: (shop: boolean, shipment: boolean) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      selectedApp: null,
      isShopAvailable: false,
      isShipmentAvailable: false,
      isLoading: false,

      setUser: (user) => set({ user }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setSelectedApp: (app) => set({ selectedApp: app }),
      setTokenAvailability: (shop, shipment) =>
        set({ isShopAvailable: shop, isShipmentAvailable: shipment }),
      setLoading: (loading) => set({ isLoading: loading }),

      logout: () => {
        tokenManager.clearAll();
        set({
          user: null,
          isAuthenticated: false,
          selectedApp: null,
          isShopAvailable: false,
          isShipmentAvailable: false,
        });
      },
    }),
    {
      name: 'auth-store',
      // Seul selectedApp est persisté — les tokens et données sensibles restent en mémoire.
      // La session est restaurée au démarrage via le cookie HttpOnly (silent refresh).
      partialize: (state) => ({
        selectedApp: state.selectedApp,
      }),
    }
  )
);
