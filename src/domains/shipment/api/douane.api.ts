// domains/shipment/api/douane.api.ts
// TODO: getDeclarations(filters): Promise<PaginatedResponse<DeclarationDouane>> -> GET /admin/douane
// TODO: getDeclarationsEnAttente(): Promise<DeclarationDouane[]>                -> GET /admin/douane/en-attente
// TODO: getDeclarationById(id): Promise<DeclarationDouane>                      -> GET /admin/douane/:id
// TODO: approuverDeclaration(id, note): Promise<DeclarationDouane>              -> PATCH /admin/douane/:id/approuver
// TODO: rejeterDeclaration(id, note): Promise<DeclarationDouane>                -> PATCH /admin/douane/:id/rejeter
// TODO: mettreEnRevision(id, note): Promise<DeclarationDouane>                  -> PATCH /admin/douane/:id/revision
// TODO: calculerTaxes(data): Promise<{ taxesMontant: number }>                  -> POST /admin/douane/calculer-taxes
