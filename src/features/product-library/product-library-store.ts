import { create } from "zustand";
import { PRODUCTS as SEED_PRODUCTS } from "@/features/product-library/mock-products";
import type { LibraryProduct } from "@/features/product-library/product-library-types";

interface ProductLibraryState {
  products: LibraryProduct[];
  addProduct: (product: LibraryProduct) => void;
  /** Products belong to a workspace; the others wait here. */
  stash: Record<string, LibraryProduct[]>;
  switchWorkspace: (from: string, to: string) => void;
  ensureWorkspace: (id: string) => void;
}

/** A real, mutable store rather than the static PRODUCTS array directly —
 *  "Create brand" needs a new product to actually appear in the grid and be
 *  reachable at its own detail URL, not just flash a success toast.
 *
 *  Per workspace, like the Claims Library built from it: a new workspace
 *  starts with no products. Velmora EU starts with Velmora only. */
export const useProductLibraryStore = create<ProductLibraryState>((set) => ({
  products: SEED_PRODUCTS,
  addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),
  stash: { ws_velmora_eu_2c81: SEED_PRODUCTS.filter((p) => p.name === "Velmora") },
  switchWorkspace: (from, to) =>
    set((state) => {
      const stash = { ...state.stash, [from]: state.products };
      const products = stash[to] ?? [];
      delete stash[to];
      return { stash, products };
    }),
  ensureWorkspace: (id) => set((state) => (state.stash[id] ? state : { stash: { ...state.stash, [id]: [] } })),
}));
