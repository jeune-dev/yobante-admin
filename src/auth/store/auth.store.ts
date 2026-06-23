// ─────────────────────────────────────────────────────────────
// auth/store/auth.store.ts — Zustand store global d'authentification
// ─────────────────────────────────────────────────────────────

// TODO: State
//   user: AdminUser | null
//   isAuthenticated: boolean
//   selectedApp: 'shop' | 'shipment' | null
//   isShopAvailable: boolean    (token shop obtenu avec succès)
//   isShipmentAvailable: boolean (token shipment obtenu avec succès)
//   isLoading: boolean

// TODO: Actions
//   setUser(user: AdminUser): void
//   setSelectedApp(app: 'shop' | 'shipment'): void
//   setTokenAvailability(shop: boolean, shipment: boolean): void
//   logout(): void  -> reset tout le state + tokenManager.clearAll()

// TODO: Persist avec zustand/middleware persist
//   - Persister : selectedApp, isAuthenticated
//   - Ne PAS persister : tokens (gérés par tokenManager dans localStorage)
