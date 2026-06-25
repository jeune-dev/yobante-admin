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

    const shopRaw = results[0].status === 'fulfilled' ? (results[0].value as any) : null;
    const shipmentRaw = results[1].status === 'fulfilled' ? (results[1].value as any) : null;

    const shopData: AuthResponse | undefined = shopRaw?.data || shopRaw;
    const shipmentData: AuthResponse | undefined = shipmentRaw?.data || shipmentRaw;

    const shopResult = shopData?.accessToken
      ? { success: true, data: shopData }
      : { success: false, error: results[0].status === 'rejected' ? (results[0] as any).reason : 'No token' };

    const shipmentResult = shipmentData?.accessToken
      ? { success: true, data: shipmentData }
      : { success: false, error: results[1].status === 'rejected' ? (results[1] as any).reason : 'No token' };

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
