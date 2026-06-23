// domains/shop/api/orders.api.ts — Appels API Boutique / Commandes
// import shopClient from '@/infrastructure/http/shop.client'

// TODO: getOrders(filters: OrderFilters): Promise<PaginatedResponse<Order>>
//   -> shopClient.get('/admin/commandes', { params: filters })

// TODO: getOrderById(id: string): Promise<Order>
//   -> shopClient.get(/admin/commandes/)

// TODO: validateOrder(id: string, noteAdmin?: string): Promise<Order>
//   -> shopClient.patch(/admin/commandes//valider, { noteAdmin })

// TODO: rejectOrder(id: string, raison: string): Promise<Order>
//   -> shopClient.patch(/admin/commandes//rejeter, { raison })

// TODO: markPreparing(id: string): Promise<Order>
//   -> shopClient.patch(/admin/commandes//preparation)

// TODO: markShipped(id: string, trackingInfo: string): Promise<Order>
//   -> shopClient.patch(/admin/commandes//expedier, { trackingInfo })

// TODO: markDelivered(id: string): Promise<Order>
//   -> shopClient.patch(/admin/commandes//livrer)

// TODO: exportOrders(filters: OrderFilters, format: 'csv' | 'xlsx'): Promise<Blob>
//   -> shopClient.get('/admin/commandes/export', { params: { ...filters, format }, responseType: 'blob' })
