"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ListChecks, CheckCircle2, Clock, XCircle, PackagePlus, SlidersHorizontal, X } from "lucide-react";
import { useProductLibraryStore } from "@/features/product-library/product-library-store";
import { buildProductDetail } from "@/features/product-library/mock-product-detail";
import { TileList } from "@/components/patterns/tile-list";
import { ClaimRow } from "@/features/claims-library/claim-row";
import { ProductFilterModal } from "@/features/claims-library/product-filter-modal";
import { cn } from "@/lib/cn";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import type { ClaimStatus, LibraryProduct, ProductClaim } from "@/features/product-library/product-library-types";

/**
 * Every claim, from every brand, in one shelf.
 *
 * A claim already lives on its brand's own Claims tab — this screen doesn't
 * own any data, it just re-slices the same claims across brands so "what's
 * still pending across the whole portfolio" is one screen instead of one
 * screen per brand. Opening a card goes to that claim's real home (the
 * brand's Claims tab), the same way Content Library's cards open the real
 * review rather than showing a copy of it.
 */

interface LibraryClaim extends ProductClaim {
  product: LibraryProduct;
}

type StatusFilter = "all" | ClaimStatus;

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "approved", label: "Approved" },
  { id: "pending", label: "Pending" },
  { id: "held out", label: "Held out" },
];

function StatTile({
  icon: Icon,
  label,
  value,
  tint,
  color,
}: {
  icon: typeof ListChecks;
  label: string;
  value: number;
  tint: string;
  color: string;
}) {
  return (
    <div
      className="rise-in-stagger flex items-center gap-3.5 rounded-panel border border-hair bg-card p-4 shadow-hair transition-all hover:-translate-y-0.5 hover:shadow-soft"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-chip" style={{ background: tint, color }}>
        <Icon size={18} />
      </span>
      <div>
        <b className="block text-title font-extrabold leading-none tracking-tight text-ink">{value.toLocaleString()}</b>
        <span className="text-caption text-ink-3">{label}</span>
      </div>
    </div>
  );
}

export function ClaimsLibraryScreen() {
  const router = useRouter();
  const products = useProductLibraryStore((s) => s.products);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  /** Which brand's claims, picked in its own dialog rather than typed. */
  const [productId, setProductId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const allClaims: LibraryClaim[] = useMemo(
    () => products.flatMap((product) => buildProductDetail(product).claims.map((claim) => ({ ...claim, product }))),
    [products]
  );

  const claimCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of allClaims) counts[c.product.id] = (counts[c.product.id] ?? 0) + 1;
    return counts;
  }, [allClaims]);

  const activeProduct = productId ? products.find((p) => p.id === productId) ?? null : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allClaims.filter((c) => {
      if (productId && c.product.id !== productId) return false;
      if (status !== "all" && c.status !== status) return false;
      if (!q) return true;
      return (
        c.text.toLowerCase().includes(q) ||
        c.product.name.toLowerCase().includes(q) ||
        c.dossierType.toLowerCase().includes(q)
      );
    });
  }, [allClaims, query, status, productId]);

  /* Counted over what is on screen. Totals that ignore the filter read as a
     bug the moment you pick a brand and the number above the list disagrees
     with the list. */
  const stats = useMemo(
    () => ({
      total: filtered.length,
      approved: filtered.filter((c) => c.status === "approved").length,
      pending: filtered.filter((c) => c.status === "pending").length,
      heldOut: filtered.filter((c) => c.status === "held out").length,
      brands: new Set(filtered.map((c) => c.product.id)).size,
    }),
    [filtered]
  );

  /* Two zeroed tiles and two empty tabs are worse than none. */
  const mixedStatuses = stats.pending > 0 || stats.heldOut > 0;

  /* Its own page, not the brand's Claims tab. A claim has a record of its
     own — which presentations it holds for, who stood behind it, where it has
     gone out — and none of that fits in a card on a shelf. */
  const openClaim = (claim: LibraryClaim) => router.push(`/claims-library/${claim.id}`);

  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 8px" }}>Claims Library</h1>
        <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-3)", lineHeight: 1.6, maxWidth: "62ch" }}>
          Every approved claim across your brands, in one place.
        </p>
      </div>

      {products.length > 0 && (
        <>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 420 }}>
              <Search size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)" }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search claims or brands…"
                style={{ width: "100%", padding: "10px 13px 10px 36px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 13.5, color: "var(--ink)", background: "#fff" }}
              />
            </div>

            {/* Picking a brand is not the same act as searching the
                sentences — typing "Affolmy" into the search also returned
                every other brand's claim that happened to mention it. */}
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className={cn(
                "inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-control border px-3 py-2 text-body font-bold transition-colors",
                activeProduct
                  ? "border-brand bg-tint text-brand-deep"
                  : "border-hair-2 bg-card text-ink-2 hover:border-hair-3 hover:bg-canvas"
              )}
            >
              <SlidersHorizontal size={14} />
              {activeProduct ? activeProduct.name : "All products"}
            </button>
            {activeProduct && (
              <button
                type="button"
                onClick={() => setProductId(null)}
                aria-label="Clear product filter"
                className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-control text-ink-4 transition hover:bg-subtle hover:text-ink"
              >
                <X size={14} />
              </button>
            )}

            {/* Only where there is something to filter. Every claim in the
                library is approved — one that has not cleared review is still
                in the dossier being worked on — so the three review tabs
                would be one full list and two empty ones. The filter stays
                in the code for the day that changes. */}
            {mixedStatuses && (
              <Segmented>
                {STATUS_TABS.map((t) => (
                  <SegmentedButton key={t.id} active={status === t.id} onClick={() => setStatus(t.id)}>
                    {t.label}
                  </SegmentedButton>
                ))}
              </Segmented>
            )}

          </div>

          {/* Under the controls, not over them. The Product Library settled
              this order: you arrive to search, and the totals are context you
              read on the way past — not a wall between the heading and the
              only control on the screen. */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <StatTile icon={ListChecks} label="claims cited" value={stats.total} tint="var(--tint)" color="var(--brand-deep)" />
            <StatTile icon={CheckCircle2} label="approved" value={stats.approved} tint="var(--color-ok-bg)" color="var(--ok)" />
            <StatTile icon={PackagePlus} label={stats.brands === 1 ? "brand covered" : "brands covered"} value={stats.brands} tint="var(--tint-2)" color="var(--brand)" />
            {mixedStatuses && (
              <>
                <StatTile icon={Clock} label="pending review" value={stats.pending} tint="var(--color-warn-bg)" color="var(--warn)" />
                <StatTile icon={XCircle} label="held out" value={stats.heldOut} tint="var(--color-danger-bg)" color="var(--danger)" />
              </>
            )}
          </div>
        </>
      )}

      {products.length === 0 ? (
        <EmptyState
          title="No brands yet"
          description="Claims are cited from a brand's dossiers, so there's nothing to show until you create your first brand."
          actionLabel="Create a brand"
          onAction={() => router.push("/product-library")}
        />
      ) : allClaims.length === 0 ? (
        <EmptyState
          title="No claims cited yet"
          description="None of your brands have started a dossier yet, once one does, the claims it cites will show up here."
          actionLabel="Go to Product Library"
          onAction={() => router.push("/product-library")}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No claims match"
          description={query ? `Nothing found for "${query}", try a different search or clear the filter.` : "No claims have this status yet."}
          actionLabel={query || status !== "all" || productId ? "Clear filters" : undefined}
          onAction={
            query || status !== "all" || productId
              ? () => {
                  setQuery("");
                  setStatus("all");
                  setProductId(null);
                }
              : undefined
          }
        />
      ) : (
        /* Rows that are cards, the way the product page lists its dossiers
           and its claims. Each row is a thing you open rather than a set of
           values you read down a column, and a table put the claim — the
           only part anyone reads — in a cell between two headings. */
        <TileList
          rows={filtered}
          rowKey={(c) => `${c.product.id}-${c.id}`}
          onRowClick={openClaim}
          emptyLabel="No claims match."
          renderRow={(c) => <ClaimRow claim={c} product={c.product} />}
        />
      )}

      {pickerOpen && (
        <ProductFilterModal
          products={products}
          claimCounts={claimCounts}
          selectedId={productId}
          onSelect={(next) => {
            setProductId(next);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-panel border border-dashed border-hair-2 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-tint text-brand-deep">
        <PackagePlus size={22} />
      </span>
      <div className="space-y-1">
        <p className="text-body-lg font-bold text-ink-2">{title}</p>
        <p className="max-w-[42ch] text-body text-ink-4">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-1 inline-flex items-center gap-1.5 rounded-control bg-brand px-4 py-2 text-body-lg font-bold text-white shadow-brand-lift transition-transform hover:-translate-y-0.5"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
