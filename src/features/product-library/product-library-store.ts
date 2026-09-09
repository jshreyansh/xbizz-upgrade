import { create } from "zustand";
import { PRODUCTS as SEED_PRODUCTS } from "@/features/product-library/mock-products";
import type { LibraryProduct } from "@/features/product-library/product-library-types";

interface ProductLibraryState {
  products: LibraryProduct[];
  addProduct: (product: LibraryProduct) => void;
}

/** A real, mutable store rather than the static PRODUCTS array directly —
 *  "Create brand" needs a new product to actually appear in the grid and be
 *  reachable at its own detail URL, not just flash a success toast. */
export const useProductLibraryStore = create<ProductLibraryState>((set) => ({
  products: SEED_PRODUCTS,
  addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),
}));
