import shopClient from '@/infrastructure/http/shop.client';
import shipmentClient from '@/infrastructure/http/shipment.client';
import { tokenManager } from '@/infrastructure/auth/tokenManager';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

// Forme de réponse du backend boutique :
// { success, message, data: { token, user } } — refreshToken via cookie HttpOnly
interface ShopLoginBody {
  data?: {
    token?: string;
    user?: AuthUser;
  };
}

const normalizeShopAuth = (body: ShopLoginBody): AuthResponse => ({
  accessToken: body?.data?.token ?? '',
  user: body?.data?.user as AuthUser,
});

const normalizeShipmentAuth = (body: any): AuthResponse => ({
  accessToken: body?.data?.accessToken ?? '',
  user: body?.data?.utilisateur as AuthUser,
});

export interface LoginResult {
  shop: { success: boolean; data?: AuthResponse; error?: any };
  shipment: { success: boolean; data?: AuthResponse; error?: any };
  user?: AuthResponse['user'];
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResult> => {
    const shipmentUrl = import.meta.env.VITE_SHIPMENT_API_URL ?? '';
    const shipmentAvailable = !shipmentUrl.includes('localhost') && !shipmentUrl.includes('127.0.0.1');

    const results = await Promise.allSettled([
      // Backend boutique : attend { identifiant, password }
      shopClient.post('/auth/login', {
        identifiant: payload.email,
        password: payload.password,
      }),
      // Skip si le back colis tourne en local et n'est pas démarré
      shipmentAvailable
        ? shipmentClient.post('/auth/login', payload)
        : Promise.reject(new Error('Shipment backend non disponible')),
    ]);

    const shopResult =
      results[0].status === 'fulfilled'
        ? { success: true, data: normalizeShopAuth(results[0].value as unknown as ShopLoginBody) }
        : { success: false, error: results[0].reason };

    const shipmentResult =
      results[1].status === 'fulfilled'
        ? { success: true, data: normalizeShipmentAuth((results[1].value as any)?.data) }
        : { success: false, error: results[1].reason };

    // Store tokens
    if (shopResult.success && shopResult.data) {
      tokenManager.setShopToken(shopResult.data.accessToken);
      // Refresh token reçu via cookie HttpOnly — pas besoin de le stocker côté JS
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
