// domains/shipment/api/expeditions.api.ts
// TODO: getExpeditions(filters): Promise<PaginatedResponse<Expedition>>  -> GET /admin/expeditions
// TODO: getExpeditionById(id): Promise<Expedition>                        -> GET /admin/expeditions/:id
// TODO: createExpedition(data): Promise<Expedition>                       -> POST /admin/expeditions
// TODO: calculerTarif(data): Promise<TarifResult>                         -> POST /admin/expeditions/calculer-tarif
// TODO: confirmerExpedition(id): Promise<Expedition>                      -> PATCH /admin/expeditions/:id/confirmer
// TODO: marquerEnTransit(id, { transporteur, numeroSuivi }): Promise<Expedition> -> PATCH /admin/expeditions/:id/en-transit
// TODO: marquerEnDouane(id, note): Promise<Expedition>                    -> PATCH /admin/expeditions/:id/en-douane
// TODO: marquerLivraisonLocale(id): Promise<Expedition>                   -> PATCH /admin/expeditions/:id/livraison-locale
// TODO: marquerLivree(id): Promise<Expedition>                            -> PATCH /admin/expeditions/:id/livree
// TODO: annulerExpedition(id, raison): Promise<Expedition>                -> PATCH /admin/expeditions/:id/annuler
