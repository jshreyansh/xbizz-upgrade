"use client";

import { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { ProductArtwork } from "@/features/product-library/product-artwork";
import type { LibraryProduct } from "@/features/product-library/product-library-types";
import { cn } from "@/lib/cn";

/**
 * Which brand's claims.
 *
 * The shelf holds every claim from every brand, and the only way to get to
 * one brand's was to type its name into a search that also matched the claim
 * text — so "Affolmy" returned its claims and every claim of another brand
 * that happened to mention it. Picking the brand is a different act from
 * searching the sentences, and it gets its own control.
 *
 * A modal rather than a dropdown because the catalogue is long enough to
 * need its own search, and each row has to show enough — the pack, the
 * molecule, how many claims — to pick from.
 */
export function ProductFilterModal({
  products,
  claimCounts,
  selectedId,
  onSelect,
  onClose,
}: {
  products: LibraryProduct[];
  claimCounts: Record<string, number>;
  selectedId: string | null;
  onSelect: (productId: string | null) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.genericName.toLowerCase().includes(q) ||
        (p.therapyAreas ?? []).some((area) => area.toLowerCase().includes(q))
    );
  }, [products, query]);

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[9999] grid place-items-center bg-ink/55 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Filter by product"
        onClick={onClose}
      >
        <div
          className="flex max-h-[80vh] w-full max-w-[560px] flex-col overflow-hidden rounded-card border border-hair bg-card shadow-float"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 border-b border-hair px-5 py-4">
            <div>
              <h2 className="text-subhead font-[850] tracking-tight text-ink">Filter by product</h2>
              <p className="mt-0.5 text-label text-ink-3">Show only the claims that belong to one brand.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-ink-3 transition hover:bg-black/5 hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="border-b border-hair px-5 py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-4" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by brand, molecule or therapy area…"
                className="w-full rounded-control border border-hair-2 bg-card py-2 pl-9 pr-3 text-body text-ink outline-none transition placeholder:text-ink-4 focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-3">
            <button
              type="button"
              onClick={() => onSelect(null)}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-control border p-3 text-left transition",
                selectedId === null
                  ? "border-brand bg-tint"
                  : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
              )}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-control bg-subtle text-caption font-extrabold text-ink-3">
                All
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-body-lg font-bold text-ink">All products</span>
                <span className="block text-caption text-ink-4">
                  Every claim across {products.length} brands
                </span>
              </span>
              {selectedId === null && <Check className="size-4 shrink-0 text-brand" />}
            </button>

            {results.map((product) => {
              const active = selectedId === product.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onSelect(product.id)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-control border p-3 text-left transition",
                    active ? "border-brand bg-tint" : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
                  )}
                >
                  <span
                    className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-control"
                    style={{ background: product.gradient }}
                  >
                    <ProductArtwork
                      kind={product.type}
                      photoUrl={product.referenceImageUrl}
                      className="relative h-6 w-6"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-lg font-bold text-ink">{product.name}</span>
                    <span className="block truncate text-caption italic text-ink-4">{product.genericName}</span>
                  </span>
                  <span className="shrink-0 rounded-chip bg-subtle px-2 py-0.5 text-caption font-bold tabular-nums text-ink-3">
                    {claimCounts[product.id] ?? 0} claims
                  </span>
                  {active && <Check className="size-4 shrink-0 text-brand" />}
                </button>
              );
            })}

            {results.length === 0 && (
              <p className="px-3 py-10 text-center text-body text-ink-4">
                No product matches &ldquo;{query}&rdquo;.
              </p>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
