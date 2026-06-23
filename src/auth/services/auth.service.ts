// ─────────────────────────────────────────────────────────────
// auth/services/auth.service.ts
// ─────────────────────────────────────────────────────────────

// TODO: login(payload: LoginPayload): Promise<AuthTokens>
//   - Appeler shopClient.post('/auth/login', payload)
//     ET shipmentClient.post('/auth/login', payload) en PARALLÈLE via Promise.allSettled
//   - Si les 2 réussissent : stocker les 2 tokens via tokenManager
//   - Si seulement 1 réussit : stocker le token disponible, marquer l'autre indisponible
//   - Retourner { accessToken_shop, accessToken_shipment, user }

// TODO: logout(): Promise<void>
//   - Appeler shopClient.post('/auth/logout') ET shipmentClient.post('/auth/logout') en parallèle
//   - Appeler tokenManager.clearAll()
//   - Vider le store auth (authStore.logout())

// TODO: refreshShopToken(): Promise<string>
//   - POST shopClient('/auth/refresh-token') avec le cookie refresh
//   - Mettre à jour tokenManager.setShopToken(newToken)

// TODO: refreshShipmentToken(): Promise<string>
//   - POST shipmentClient('/auth/refresh-token')
//   - Mettre à jour tokenManager.setShipmentToken(newToken)
