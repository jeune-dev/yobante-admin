// domains/shop/schemas/product.schema.ts — Validation formulaire produit
// TODO: createProductSchema = z.object({
//   nom: z.string().min(2).max(255),
//   description: z.string().optional(),
//   prix: z.number().min(0),
//   prixPromo: z.number().min(0).optional(),
//   stock: z.number().int().min(0),
//   categorieId: z.number().int().positive(),
//   poids: z.number().min(0).optional(),
// })
// TODO: updateProductSchema = createProductSchema.partial()
// TODO: updateStockSchema = z.object({ quantite: z.number().int().min(0) })
