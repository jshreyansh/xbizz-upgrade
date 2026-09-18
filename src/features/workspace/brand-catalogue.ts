"use client";

import { useMemo } from "react";
import { INITIAL_BRANDS, type BrandItem } from "@/features/workspace/brand-modal-data";
import { useProductLibraryStore } from "@/features/product-library/product-library-store";
import type { LibraryProduct } from "@/features/product-library/product-library-types";

/**
 * One catalogue of brands, for the studio and the Product Library alike.
 *
 * They were two lists that had already drifted apart: the Product Library held
 * Affolmy and Abdec, which could not be found when starting a project, and the
 * Start Project modal held Cardioxa, PulmoVax and the 3D family, which did not
 * exist in the library. Six brands overlapped out of fourteen.
 *
 * That gap is also what stopped "add a brand from here" from working at all —
 * Create Brand writes to the library, so a brand made mid-flow would never
 * come back into the search that sent you there.
 *
 * The library is the live half: it is a store, and it is what Create Brand
 * writes to. The studio-only entries are folded in behind it, so a newly
 * created brand sorts to the top where the person who just made it will look.
 */

function fromProduct(product: LibraryProduct): BrandItem {
  return {
    id: product.id,
    name: product.name,
    genericName: product.genericName,
    therapyAreas: product.therapyAreas ?? [],
    // A dossier is a separate act; a brand record on its own has none.
    hasDossier: product.dossiersVerified > 0,
    type: product.type,
    gradient: product.gradient,
    referenceImageUrl: product.referenceImageUrl,
  };
}

/** Every brand, library first, deduped by id. */
export function useBrandCatalogue(): BrandItem[] {
  const products = useProductLibraryStore((s) => s.products);
  return useMemo(() => {
    const merged: BrandItem[] = products.map(fromProduct);
    const seen = new Set(merged.map((b) => b.id));
    for (const brand of INITIAL_BRANDS) {
      if (seen.has(brand.id)) continue;
      merged.push(brand);
      seen.add(brand.id);
    }
    // The studio-seeded records carry dossier ids the library rows do not, so
    // where both exist the studio's detail wins over the library's stub.
    return merged.map((brand) => {
      const seeded = INITIAL_BRANDS.find((b) => b.id === brand.id);
      return seeded ? { ...brand, ...seeded } : brand;
    });
  }, [products]);
}

export function filterBrands(brands: BrandItem[], query: string): BrandItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return brands.filter(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      b.genericName.toLowerCase().includes(q) ||
      b.therapyAreas.some((t) => t.toLowerCase().includes(q))
  );
}

/**
 * The brand a dossier id belongs to.
 *
 * Four screens each kept their own map of five brand names and defaulted to
 * "Velmora" for anything else — so picking Affolmy in Start Project produced
 * a project called "Velmora HCP launch", grounded in "the Velmora dossier",
 * for a brand nobody had chosen. The catalogue already knows every brand and
 * which dossiers belong to it; nothing else should be guessing from a string.
 */
export function brandNameForDossier(brands: BrandItem[], dossierId?: string): string {
  const id = (dossierId ?? "").trim();
  // Therapy-area mode joins several ids with commas — no single brand to name.
  if (!id || id.includes(",")) return "Velmora";
  const hit =
    brands.find((b) => b.id === id) ??
    brands.find((b) => b.dossierIds?.includes(id)) ??
    brands.find((b) => id.startsWith(`${b.id}-`));
  if (hit) return hit.name;
  // An id from outside the catalogue still names its brand in its first
  // segment — better than answering with somebody else's product.
  const head = id.split(/[-_]/)[0];
  return head.charAt(0).toUpperCase() + head.slice(1);
}

/** The same lookup, for a component that has a dossier id and wants a name. */
export function useBrandName(dossierId?: string): string {
  const brands = useBrandCatalogue();
  return useMemo(() => brandNameForDossier(brands, dossierId), [brands, dossierId]);
}
