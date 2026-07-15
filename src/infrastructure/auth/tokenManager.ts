// Tokens stockés en mémoire JS uniquement — inaccessibles depuis localStorage.
// Le refresh token est géré par cookie HttpOnly côté serveur.
// Avantage : une XSS ne peut pas voler les tokens via document.cookie ou localStorage.

let shopToken: string | null = null;
let shipmentToken: string | null = null;

export const tokenManager = {
  getShopToken: (): string | null => shopToken,
  setShopToken: (token: string): void => { shopToken = token; },
  removeShopToken: (): void => { shopToken = null; },

  getShipmentToken: (): string | null => shipmentToken,
  setShipmentToken: (token: string): void => { shipmentToken = token; },
  removeShipmentToken: (): void => { shipmentToken = null; },

  clearAll: (): void => {
    shopToken = null;
    shipmentToken = null;
  },
};
