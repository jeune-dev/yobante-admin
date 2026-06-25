const KEYS = {
  SHOP: 'token_shop',
  SHIPMENT: 'token_shipment',
} as const;

export const tokenManager = {
  // Shop tokens
  getShopToken: (): string | null => {
    return localStorage.getItem(KEYS.SHOP);
  },

  setShopToken: (token: string): void => {
    localStorage.setItem(KEYS.SHOP, token);
  },

  removeShopToken: (): void => {
    localStorage.removeItem(KEYS.SHOP);
  },

  // Shipment tokens
  getShipmentToken: (): string | null => {
    return localStorage.getItem(KEYS.SHIPMENT);
  },

  setShipmentToken: (token: string): void => {
    localStorage.setItem(KEYS.SHIPMENT, token);
  },

  removeShipmentToken: (): void => {
    localStorage.removeItem(KEYS.SHIPMENT);
  },

  // Clear all tokens (logout)
  clearAll: (): void => {
    localStorage.removeItem(KEYS.SHOP);
    localStorage.removeItem(KEYS.SHIPMENT);
  },
};
