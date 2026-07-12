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

// Forme de réponse du backend boutique (Render) :
// { success, message, data: { token, refreshToken, user } }
interface ShopLoginBody {
  data?: {
    token?: string;
    refreshToken?: string;
    user?: AuthUser;
  };
}

// Normalise la réponse boutique vers { accessToken, user }
const normalizeShopAuth = (body: ShopLoginBody): AuthResponse => ({
  accessToken: body?.data?.token ?? '',
  refreshToken: body?.data?.refreshToken,
  user: body?.data?.user as AuthUser,
});

export interface LoginResult {
  shop: { success: boolean; data?: AuthResponse; error?: any };
  shipment: { success: boolean; data?: AuthResponse; error?: any };
  user?: AuthResponse['user'];
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResult> => {
    const results = await Promise.allSettled([
      // Backend boutique : attend { identifiant, password }
      shopClient.post('/auth/login', {
        identifiant: payload.email,
        password: payload.password,
      }),
      shipmentClient.post('/auth/login', payload),
    ]);

    const shopResult =
      results[0].status === 'fulfilled'
        ? { success: true, data: normalizeShopAuth(results[0].value as unknown as ShopLoginBody) }
        : { success: false, error: results[0].reason };

    const shipmentResult =
      results[1].status === 'fulfilled'
        ? { success: true, data: results[1].value as unknown as AuthResponse }
        : { success: false, error: results[1].reason };

    // Store tokens
    if (shopResult.success && shopResult.data) {
      tokenManager.setShopToken(shopResult.data.accessToken);
      if (shopResult.data.refreshToken) {
        tokenManager.setShopRefreshToken(shopResult.data.refreshToken);
      }
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
