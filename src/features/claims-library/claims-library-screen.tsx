"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ListChecks, CheckCircle2, Clock, XCircle, PackagePlus, SlidersHorizontal, FileSearch, X } from "lucide-react";
import { useProductLibraryStore } from "@/features/product-library/product-library-store";
import { buildProductDetail } from "@/features/product-library/mock-product-detail";
import { TileList } from "@/components/patterns/tile-list";
import { ClaimRow } from "@/features/claims-library/claim-row";
import { FilterPickerModal } from "@/features/claims-library/filter-picker-modal";
import { ProductArtwork } from "@/features/product-library/product-artwork";
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

/** Where the evidence behind a claim can be checked, most-cited first. */
const SOURCE_ORDER = ["FDA", "PubMed", "ClinicalTrials.gov", "Data on file"];
const SOURCE_DETAIL: Record<string, string> = {
  FDA: "Prescribing information and approved labelling",
  PubMed: "Peer-reviewed literature",
  "ClinicalTrials.gov": "Registered trial records",
  "Data on file": "The company's own data on file",
};

/** "Affolmy", or "Affolmy +2" once there is more than one. */
function pickedLabel(names: string[], all: string) {
  if (names.length === 0) return all;
  return names.length === 1 ? names[0] : `${names[0]} +${names.length - 1}`;
}

/**
 * The button that opens a filter, and the × that clears it. Outlined while
 * showing everything, tinted once it narrows the list, so a filtered shelf
 * never looks like the whole one.
 */
function FilterTrigger({
  label,
  active,
  onOpen,
  onClear,
  clearLabel,
}: {
  label: string;
  active: boolean;
  onOpen: () => void;
  onClear: () => void;
  clearLabel: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-control border px-3 py-2 text-body font-bold transition-colors",
          active
            ? "border-brand bg-tint text-brand-deep"
            : "border-hair-2 bg-card text-ink-2 hover:border-hair-3 hover:bg-canvas"
        )}
      >
        <SlidersHorizontal size={14} />
        {label}
      </button>
      {active && (
        <button
          type="button"
          onClick={onClear}
          aria-label={clearLabel}
          className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-control text-ink-4 transition hover:bg-subtle hover:text-ink"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

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
  /**
   * Which brands, and which evidence sources — each picked in its own
   * dialog, any number of each, and the two narrow the shelf together.
   * Nothing picked means everything, the same as picking every one.
   */
  const [productIds, setProductIds] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [picker, setPicker] = useState<"product" | "source" | null>(null);

  const allClaims: LibraryClaim[] = useMemo(
    () => products.flatMap((product) => buildProductDetail(product).claims.map((claim) => ({ ...claim, product }))),
    [products]
  );

  /**
   * Every filter but one. Each dialog counts its rows against the filters it
   * does not own, so picking a brand shows how many of that brand's claims
   * come from each source — the two filters answer each other rather than
   * each pretending the other is not set.
   */
  const passes = (c: LibraryClaim, skip?: "product" | "source") => {
    if (skip !== "product" && productIds.length > 0 && !productIds.includes(c.product.id)) return false;
    if (skip !== "source" && sources.length > 0 && !sources.includes(c.evidenceSource)) return false;
    if (status !== "all" && c.status !== status) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.text.toLowerCase().includes(q) ||
      c.product.name.toLowerCase().includes(q) ||
      c.dossierType.toLowerCase().includes(q)
    );
  };

  const filtered = allClaims.filter((c) => passes(c));

  const productCounts: Record<string, number> = {};
  const sourceCounts: Record<string, number> = {};
  for (const c of allClaims) {
    if (passes(c, "product")) productCounts[c.product.id] = (productCounts[c.product.id] ?? 0) + 1;
    if (passes(c, "source")) sourceCounts[c.evidenceSource] = (sourceCounts[c.evidenceSource] ?? 0) + 1;
  }

  /* The sources that actually back a claim here, in a fixed order so the
     list does not reshuffle as the other filters change. */
  const allSources = [...new Set(allClaims.map((c) => c.evidenceSource))].sort(
    (x, y) => (SOURCE_ORDER.indexOf(x) + 1 || 99) - (SOURCE_ORDER.indexOf(y) + 1 || 99)
  );

  const pickedProducts = products.filter((p) => productIds.includes(p.id)).map((p) => p.name);
  const anyFilter = !!query || status !== "all" || productIds.length > 0 || sources.length > 0;

  /* Counted over what is on screen. Totals that ignore the filter read as a
     bug the moment you pick a brand and the number above the list disagrees
     with the list. */
  const stats = {
      total: filtered.length,
      approved: filtered.filter((c) => c.status === "approved").length,
      pending: filtered.filter((c) => c.status === "pending").length,
      heldOut: filtered.filter((c) => c.status === "held out").length,
      brands: new Set(filtered.map((c) => c.product.id)).size,
    };

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
                every other brand's claim that happened to mention it. The
                source is the same kind of pick: where the evidence lives. */}
            <FilterTrigger
              label={pickedLabel(pickedProducts, "All products")}
              active={productIds.length > 0}
              onOpen={() => setPicker("product")}
              onClear={() => setProductIds([])}
              clearLabel="Clear product filter"
            />
            <FilterTrigger
              label={pickedLabel(allSources.filter((x) => sources.includes(x)), "All sources")}
              active={sources.length > 0}
              onOpen={() => setPicker("source")}
              onClear={() => setSources([])}
              clearLabel="Clear source filter"
            />

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
          description={
            query
              ? `Nothing found for "${query}", try a different search or clear the filters.`
              : productIds.length > 0 || sources.length > 0
              ? "No claim matches both the brands and the sources you picked."
              : "No claims have this status yet."
          }
          actionLabel={anyFilter ? "Clear filters" : undefined}
          onAction={
            anyFilter
              ? () => {
                  setQuery("");
                  setStatus("all");
                  setProductIds([]);
                  setSources([]);
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

      {picker === "product" && (
        <FilterPickerModal
          title="Filter by product"
          description="Show the claims that belong to the brands you pick."
          allLabel="All products"
          allSublabel={`Every claim across ${products.length} brands`}
          searchPlaceholder="Search by brand, molecule or therapy area…"
          items={products.map((product) => ({
            id: product.id,
            label: product.name,
            sublabel: product.genericName,
            keywords: [product.genericName, ...(product.therapyAreas ?? [])],
            count: productCounts[product.id] ?? 0,
            leading: (
              <span
                className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-control"
                style={{ background: product.gradient }}
              >
                <ProductArtwork kind={product.type} photoUrl={product.referenceImageUrl} className="relative h-6 w-6" />
              </span>
            ),
          }))}
          selectedIds={productIds}
          onChange={setProductIds}
          resultCount={filtered.length}
          onClose={() => setPicker(null)}
        />
      )}
      {picker === "source" && (
        <FilterPickerModal
          title="Filter by source"
          description="Show the claims whose evidence comes from the sources you pick."
          allLabel="All sources"
          allSublabel={`Every claim across ${allSources.length} sources`}
          searchPlaceholder="Search sources…"
          items={allSources.map((source) => ({
            id: source,
            label: source,
            sublabel: SOURCE_DETAIL[source],
            count: sourceCounts[source] ?? 0,
            leading: (
              <span className="grid size-9 shrink-0 place-items-center rounded-control bg-tint-2 text-brand-deep">
                <FileSearch size={16} />
              </span>
            ),
          }))}
          selectedIds={sources}
          onChange={setSources}
          resultCount={filtered.length}
          onClose={() => setPicker(null)}
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
