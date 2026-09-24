"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Grid3x3, List, ShieldCheck, Eye, Star, Package, MoreHorizontal } from "lucide-react";
import { ProductArtwork } from "@/features/product-library/product-artwork";
import { useProductLibraryStore } from "@/features/product-library/product-library-store";
import { CreateBrandModal } from "@/features/product-library/create-brand-modal";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import { DataList } from "@/components/patterns/data-list";
import { LibraryTile, TileOpen } from "@/components/patterns/library-tile";

export function ProductLibraryScreen() {
  const router = useRouter();
  const products = useProductLibraryStore((s) => s.products);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [createOpen, setCreateOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const STATS = useMemo(
    () => [
      { icon: Package, label: "products in the library", value: products.length, tint: "var(--tint)", color: "var(--brand-deep)" },
      { icon: Eye, label: "named product views", value: products.reduce((s, p) => s + p.views, 0), tint: "#eef1ff", color: "#3d3fce" },
      { icon: ShieldCheck, label: "dossiers verified", value: products.reduce((s, p) => s + p.dossiersVerified, 0), tint: "var(--ok-bg)", color: "var(--ok)" },
      { icon: Star, label: "approved claims", value: products.reduce((s, p) => s + p.claimsApproved, 0), tint: "#f4edff", color: "#7c3aed" },
    ],
    [products]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.genericName.toLowerCase().includes(q));
  }, [products, query]);

  return (
    <div className="page-enter space-y-6" onClick={() => setOpenMenuId(null)}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 8px" }}>Product Library</h1>
          <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-3)", lineHeight: 1.6, maxWidth: "62ch" }}>
            Every brand you own, with its photography, dossiers and approved claims in one place.
          </p>
        </div>
        {/* Create brand is hidden while brands are seeded rather than made
            here. The modal and its wiring stay — this is the one line that
            turns it back on. */}
      </div>

      <CreateBrandModal open={createOpen} onClose={() => setCreateOpen(false)} />

      {/* Search + view toggle */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 420 }}>
          <Search size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products or molecules…"
            style={{ width: "100%", padding: "10px 13px 10px 36px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 13.5, color: "var(--ink)", background: "#fff" }}
          />
        </div>
        <Segmented>
          {(["grid", "list"] as const).map((v) => (
            <SegmentedButton key={v} active={view === v} onClick={() => setView(v)}>
              {v === "grid" ? <Grid3x3 size={13} /> : <List size={13} />}
              {v === "grid" ? "Grid" : "List"}
            </SegmentedButton>
          ))}
        </Segmented>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className="rise-in-stagger hover:-translate-y-0.5 hover:shadow-md transition-all"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              padding: "16px 18px",
              borderRadius: "var(--r-l)",
              background: "#fff",
              border: "1px solid var(--hair)",
              boxShadow: "var(--sh-1)",
              animationDelay: `${i * 60}ms`,
            }}
          >
            <span style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: "grid", placeItems: "center", background: s.tint, color: s.color }}>
              <s.icon size={18} />
            </span>
            <div>
              <b style={{ display: "block", fontSize: 22, fontWeight: 800, letterSpacing: "-.5px", color: "var(--ink)" }}>{s.value.toLocaleString()}</b>
              <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Product grid */}
      {view === "grid" ? (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
        {filtered.map((p, i) => (
          <LibraryTile
            key={p.id}
            delayMs={80 + i * 45}
            onClick={() => router.push(`/product-library/${p.id}`)}
            media={
              <div className="relative h-[168px] w-full overflow-hidden" style={{ background: p.gradient }}>
                {/* Soft pastel wash — lightens the brand gradient into the
                    airy, photography-forward card tone. */}
                <span aria-hidden className="pointer-events-none absolute inset-0 bg-white/60" />
                <span
                  aria-hidden
                  className="pointer-events-none absolute rounded-full"
                  style={{ width: "70%", height: "70%", right: "-10%", top: "-10%", background: "radial-gradient(circle,rgba(255,255,255,.5),transparent 70%)" }}
                />
                <span
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/2 opacity-0 group-hover:opacity-100 group-hover:[animation:shimmer-sweep_1.1s_ease-out]"
                  style={{ background: "linear-gradient(115deg,transparent 30%,rgba(255,255,255,.32) 50%,transparent 70%)" }}
                />
                <div className="absolute -bottom-3 right-[-8%] h-[85%] w-3/5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-[1.03]">
                  <ProductArtwork kind={p.type} photoUrl={p.referenceImageUrl} className="h-full w-full" />
                </div>
              </div>
            }
            mediaTopLeft={
              <span className="rounded-chip bg-black/45 px-2 py-0.5 text-micro font-extrabold uppercase tracking-[.04em] text-white/90">
                {p.type}
              </span>
            }
            mediaTopRight={
              <span className="relative">
                <button
                  type="button"
                  title="More options"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === p.id ? null : p.id);
                  }}
                  className="grid size-6 cursor-pointer place-items-center rounded-full bg-white/75 text-ink-2 backdrop-blur-sm transition-colors hover:bg-card"
                >
                  <MoreHorizontal size={14} />
                </button>
                {openMenuId === p.id && (
                  <span
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-[calc(100%+6px)] z-30 block w-36 overflow-hidden rounded-control border border-hair bg-card py-1 shadow-float"
                  >
                    {["Duplicate", "Archive"].map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => setOpenMenuId(null)}
                        className="flex w-full cursor-pointer items-center px-3 py-1.5 text-left text-body font-medium text-ink-2 hover:bg-black/[0.04]"
                      >
                        {action}
                      </button>
                    ))}
                  </span>
                )}
              </span>
            }
            title={p.name}
            subtitle={<span className="italic">{p.genericName}</span>}
            chips={
              <>
                <span
                  className={`rounded-chip border px-2 py-0.5 text-caption font-bold ${
                    p.dossiersVerified === p.dossiersTotal
                      ? "border-ok-line bg-ok-bg text-ok"
                      : "border-tint-line bg-tint text-brand-deep"
                  }`}
                >
                  {p.dossiersVerified} dossiers
                </span>
                <span className="rounded-chip border border-hair bg-subtle px-2 py-0.5 text-caption font-bold text-ink-3">
                  {p.claimsApproved} claims
                </span>
              </>
            }
            footerLeft={p.updated}
            footerRight={<TileOpen />}
          />
        ))}
      </div>
      ) : (
        <DataList
          rows={filtered}
          rowKey={(p) => p.id}
          onRowClick={(p) => router.push(`/product-library/${p.id}`)}
          emptyLabel={`No products match “${query}”.`}
          columns={[
            {
              id: "product",
              header: "Product",
              minWidth: 260,
              cell: (p) => (
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-chip"
                    style={{ background: p.gradient }}
                  >
                    <ProductArtwork kind={p.type} photoUrl={p.referenceImageUrl} className="h-7 w-7" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-body font-bold text-ink">{p.name}</span>
                    <span className="block truncate text-caption italic text-ink-3">{p.genericName}</span>
                  </span>
                </div>
              ),
            },
            {
              id: "type",
              header: "Type",
              width: 110,
              cell: (p) => (
                <span className="rounded-chip bg-subtle px-2 py-0.5 text-caption font-bold uppercase tracking-[.03em] text-ink-3">
                  {p.type}
                </span>
              ),
            },
            {
              id: "dossiers",
              header: "Dossiers",
              width: 120,
              cell: (p) => (
                <span
                  className={`rounded-chip border px-2 py-0.5 text-caption font-bold ${
                    p.dossiersVerified === p.dossiersTotal
                      ? "border-ok-line bg-ok-bg text-ok"
                      : "border-tint-line bg-tint text-brand-deep"
                  }`}
                >
                  {p.dossiersVerified} of {p.dossiersTotal}
                </span>
              ),
            },
            {
              id: "claims",
              header: "Claims",
              width: 100,
              cell: (p) => (
                <span className="text-body font-bold tabular-nums text-ink-2">{p.claimsApproved}</span>
              ),
            },
            {
              id: "updated",
              header: "Updated",
              width: 130,
              cell: (p) => <span className="truncate text-caption text-ink-4">{p.updated}</span>,
            },
            {
              id: "open",
              header: "",
              width: 80,
              align: "right",
              hideHeader: true,
              cell: () => <span className="text-label font-bold text-brand">Open →</span>,
            },
          ]}
        />
      )}

      {view === "grid" && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-4)", fontSize: 14 }}>
          No products match &ldquo;{query}&rdquo;.
        </div>
      )}
    </div>
  );
}
