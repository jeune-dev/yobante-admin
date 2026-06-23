// ─────────────────────────────────────────────────────────────
// infrastructure/http/shipment.client.ts
// Instance Axios dédiée UNIQUEMENT à l'API Yobante Colis
// ─────────────────────────────────────────────────────────────

// TODO: importer axios et tokenManager
// TODO: créer shipmentClient = axios.create({ baseURL: import.meta.env.VITE_SHIPMENT_API_URL })

// TODO: Intercepteur REQUEST
//   - Lire le token colis via tokenManager.getShipmentToken()
//   - L'injecter dans headers.Authorization = Bearer token

// TODO: Intercepteur RESPONSE
//   - Si réponse OK : retourner response.data
//   - Si erreur 401 : tenter refresh token via /auth/refresh-token
//   - Si refresh échoue : tokenManager.clearAll() + redirect /login

// export default shipmentClient
