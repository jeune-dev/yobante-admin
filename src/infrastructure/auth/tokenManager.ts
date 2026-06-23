// ─────────────────────────────────────────────────────────────
// infrastructure/auth/tokenManager.ts
// Gestion centralisée des tokens pour les 2 applications
// ─────────────────────────────────────────────────────────────

// TODO: SHOP TOKEN
//   getShopToken(): string | null    -> localStorage.getItem('token_shop')
//   setShopToken(token: string): void -> localStorage.setItem('token_shop', token)
//   removeShopToken(): void           -> localStorage.removeItem('token_shop')

// TODO: SHIPMENT TOKEN
//   getShipmentToken(): string | null
//   setShipmentToken(token: string): void
//   removeShipmentToken(): void

// TODO: clearAll(): void
//   - Supprime token_shop ET token_shipment
//   - Utilisé au logout global

// export const tokenManager = { getShopToken, setShopToken, ... }
