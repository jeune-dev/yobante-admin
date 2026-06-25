import shopClient from '@/infrastructure/http/shop.client';
import shipmentClient from '@/infrastructure/http/shipment.client';
import { tokenManager } from '@/infrastructure/auth/tokenManager';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    nom: string;
    prenom: string;
    role: string;
  };
}

export interface LoginResult {
  shop: { success: boolean; data?: AuthResponse; error?: any };
  shipment: { success: boolean; data?: AuthResponse; error?: any };
  user?: AuthResponse['user'];
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResult> => {
    const results = await Promise.allSettled([
      shopClient.post('/auth/login', payload),
      shipmentClient.post('/auth/login', payload),
    ]);

    const shopResult =
      results[0].status === 'fulfilled'
        ? { success: true, data: results[0].value as AuthResponse }
        : { success: false, error: results[0].reason };

    const shipmentResult =
      results[1].status === 'fulfilled'
        ? { success: true, data: results[1].value as AuthResponse }
        : { success: false, error: results[1].reason };

    // Store tokens
    if (shopResult.success && shopResult.data) {
      tokenManager.setShopToken(shopResult.data.accessToken);
    }

    if (shipmentResult.success && shipmentResult.data) {
      tokenManager.setShipmentToken(shipmentResult.data.accessToken);
    }

    // Use shop user data if available, else shipment
    const user = shopResult.data?.user || shipmentResult.data?.user;

    return {
      shop: shopResult,
      shipment: shipmentResult,
      user,
    };
  },

  logout: async (): Promise<void> => {
    try {
      await Promise.allSettled([
        shopClient.post('/auth/logout', {}),
        shipmentClient.post('/auth/logout', {}),
      ]);
    } catch {
      // Ignore errors on logout
    } finally {
      tokenManager.clearAll();
    }
  },
};
