// ─────────────────────────────────────────────────────────────
// infrastructure/http/shop.client.ts
// Instance Axios dédiée UNIQUEMENT à l'API Yobante Boutique
// ─────────────────────────────────────────────────────────────

// TODO: importer axios et tokenManager
// TODO: créer shopClient = axios.create({ baseURL: import.meta.env.VITE_SHOP_API_URL })

// TODO: Intercepteur REQUEST
//   - Lire le token boutique via tokenManager.getShopToken()
//   - L'injecter dans headers.Authorization = Bearer token

// TODO: Intercepteur RESPONSE
//   - Si réponse OK : retourner response.data directement
//   - Si erreur 401 : tenter un refresh token via /auth/refresh-token
//   - Si refresh échoue : appeler tokenManager.clearAll() + redirect /login
//   - Si autre erreur : normaliser et rejeter

// export default shopClient
