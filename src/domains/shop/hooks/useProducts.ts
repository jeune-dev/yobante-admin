// domains/shop/hooks/useProducts.ts — TanStack Query hooks pour les produits
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { QUERY_KEYS } from '@/shared/constants/queryKeys'

// TODO: useProducts(filters) -> useQuery({ queryKey: [QUERY_KEYS.SHOP.PRODUCTS, filters], queryFn: () => productsApi.getProducts(filters) })
// TODO: useProduct(id)       -> useQuery({ queryKey: [QUERY_KEYS.SHOP.PRODUCT, id], ... })
// TODO: useCreateProduct()   -> useMutation({ mutationFn: productsApi.createProduct, onSuccess: invalidate PRODUCTS })
// TODO: useUpdateProduct()   -> useMutation({ mutationFn: ({ id, data }) => productsApi.updateProduct(id, data) })
// TODO: useDeleteProduct()   -> useMutation({ mutationFn: productsApi.deleteProduct, onSuccess: toast + invalidate })
// TODO: useUpdateStock()     -> useMutation(...)
// TODO: useToggleFeatured()  -> useMutation(...)
