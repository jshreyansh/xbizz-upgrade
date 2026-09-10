import { useMemo } from "react";
import { BRAND_REGISTRY } from "@/features/dossiers/mock-dossiers";
import { useProductLibraryStore } from "@/features/product-library/product-library-store";
import type { LibraryProduct } from "@/features/product-library/product-library-types";
import type { BrandOption } from "@/features/dossiers/dossier-types";

/** Product Library doesn't track therapy area or regulatory anchor yet, so a
 *  brand that only exists there gets sensible defaults here rather than
 *  blocking it from being pickable in a dossier flow. */
export function productToBrandOption(p: LibraryProduct): BrandOption {
  return {
    id: p.id,
    name: p.name,
    genericName: p.genericName,
    therapyArea: p.type,
    regulatoryAnchor: "FDA",
    hasDossier: p.dossiersVerified > 0,
  };
}

/** The brand list every dossier-creation flow should offer — shared with
 *  Product Library rather than each flow keeping its own copy, so a brand
 *  created from either place is immediately pickable from both.
 *  BRAND_REGISTRY stays authoritative for the handful of brands that
 *  already carry real therapy-area/regulatory data; anything Product
 *  Library knows about that isn't in there yet is added with defaults. */
export function useBrandCatalog(): BrandOption[] {
  const libraryProducts = useProductLibraryStore((s) => s.products);
  return useMemo(() => {
    const extra = libraryProducts.filter((p) => !BRAND_REGISTRY.some((b) => b.id === p.id)).map(productToBrandOption);
    return [...BRAND_REGISTRY, ...extra];
  }, [libraryProducts]);
}
