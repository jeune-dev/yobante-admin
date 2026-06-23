// ─────────────────────────────────────────────────────────────
// app/routes/index.tsx — Configuration centralisée des routes
// ─────────────────────────────────────────────────────────────

// TODO: Routes publiques (sans auth)
//   /login -> LoginPage (AuthLayout)

// TODO: Route sélection app (auth requise, pas d'app requise)
//   /select-app -> SelectAppPage (SelectAppLayout) [withAuth]

// TODO: Routes SHOP (auth + app='shop' requis)
//   /shop/dashboard            -> DashboardPage
//   /shop/products             -> ProductsPage
//   /shop/products/new         -> ProductCreatePage
//   /shop/products/:id/edit    -> ProductEditPage
//   /shop/categories           -> CategoriesPage
//   /shop/orders               -> OrdersPage
//   /shop/orders/:id           -> OrderDetailPage
//   /shop/payments             -> PaymentsPage
//   /shop/reviews              -> ReviewsPage
//   /shop/users                -> UsersPage
//   /shop/users/:id            -> UserDetailPage
//   /shop/analytics            -> AnalyticsPage
//   /shop/settings             -> SettingsPage
//   Toutes avec : [withAuth, withAppSelected('shop'), ShopLayout]

// TODO: Routes SHIPMENT (auth + app='shipment' requis)
//   /shipment/dashboard        -> DashboardPage
//   /shipment/colis            -> ColisPage
//   /shipment/colis/new        -> ColisCreatePage
//   /shipment/colis/:id        -> ColisDetailPage
//   /shipment/expeditions      -> ExpeditionsPage
//   /shipment/expeditions/new  -> ExpeditionCreatePage
//   /shipment/expeditions/:id  -> ExpeditionDetailPage
//   /shipment/douane           -> DouanePage
//   /shipment/douane/:id       -> DouaneDetailPage
//   /shipment/tarifs           -> TarifsPage
//   /shipment/entrepots        -> EntrepotsPage
//   /shipment/zones            -> ZonesPage
//   /shipment/factures         -> FacturesPage
//   /shipment/factures/:id     -> FactureDetailPage
//   /shipment/payments         -> PaymentsPage
//   /shipment/users            -> UsersPage
//   /shipment/users/:id        -> UserDetailPage
//   /shipment/analytics        -> AnalyticsPage
//   /shipment/settings         -> SettingsPage
//   Toutes avec : [withAuth, withAppSelected('shipment'), ShipmentLayout]

// TODO: Route catch-all -> redirect /login
