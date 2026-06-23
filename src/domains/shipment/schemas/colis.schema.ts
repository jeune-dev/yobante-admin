// domains/shipment/schemas/colis.schema.ts
// TODO: createColisSchema = z.object({
//   nom: z.string().min(2),
//   description: z.string().optional(),
//   categorie: z.string().optional(),
//   poids: z.number().positive(),
//   longueur: z.number().positive().optional(),
//   largeur: z.number().positive().optional(),
//   hauteur: z.number().positive().optional(),
//   valeurDeclaree: z.number().min(0),
//   typeColis: z.enum(['standard','express','fragile','volumineux']),
//   entrepotId: z.number().int().positive(),
//   userId: z.string().uuid(),
// })
// TODO: updateStatutSchema = z.object({ statut: ColisStatutEnum, localisation: z.string().optional(), description: z.string().optional() })
