"use client";

import { useMemo, useState } from "react";
import { Search, Grid3x3, List, Plus, ShieldCheck, Eye, Star, Package } from "lucide-react";
import { PRODUCTS } from "@/features/product-library/mock-products";

const STATS = [
  { icon: Package, label: "products in the library", value: PRODUCTS.length, tint: "var(--tint)", color: "var(--brand-deep)" },
  { icon: Eye, label: "named product views", value: PRODUCTS.reduce((s, p) => s + p.views, 0), tint: "#eef1ff", color: "#3d3fce" },
  { icon: ShieldCheck, label: "dossiers verified", value: PRODUCTS.reduce((s, p) => s + p.dossiersVerified, 0), tint: "var(--ok-bg)", color: "var(--ok)" },
  { icon: Star, label: "approved claims", value: PRODUCTS.reduce((s, p) => s + p.claimsApproved, 0), tint: "#f4edff", color: "#7c3aed" },
];

export function ProductLibraryScreen() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.genericName.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 8px" }}>Product Library</h1>
          <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-3)", lineHeight: 1.6, maxWidth: "62ch" }}>
            Every product you own — its photography, its dossiers and its approved claims, held together so nothing gets built from a stray file again.
          </p>
        </div>
        <button
          className="hover:-translate-y-0.5 hover:shadow-lg transition-all"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 20px",
            borderRadius: "var(--r)",
            fontWeight: 700,
            fontSize: 14,
            background: "linear-gradient(180deg,#ff5b2d,var(--brand))",
            color: "#fff",
            boxShadow: "0 12px 26px -14px rgba(253,72,22,.9)",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Plus size={16} />
          Add product
        </button>
      </div>

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
        <div style={{ display: "flex", border: "1px solid var(--hair-2)", borderRadius: "var(--r)", padding: 3, background: "var(--surface-subtle)" }}>
          {(["grid", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="transition-colors"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 13px",
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 700,
                color: view === v ? "var(--ink)" : "var(--ink-4)",
                background: view === v ? "#fff" : "transparent",
                boxShadow: view === v ? "var(--sh-1)" : "none",
              }}
            >
              {v === "grid" ? <Grid3x3 size={13} /> : <List size={13} />}
              {v === "grid" ? "Grid" : "List"}
            </button>
          ))}
        </div>
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
      <div
        style={
          view === "grid"
            ? { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }
            : { display: "flex", flexDirection: "column", gap: 10 }
        }
      >
        {filtered.map((p, i) => (
          <div
            key={p.id}
            className="group rise-in-stagger hover:-translate-y-1 transition-all duration-200"
            style={{
              background: "#fff",
              borderRadius: "var(--r-xl)",
              border: "1px solid var(--hair)",
              boxShadow: "var(--sh-1)",
              overflow: "hidden",
              cursor: "pointer",
              animationDelay: `${80 + i * 45}ms`,
              display: view === "list" ? "flex" : "block",
              alignItems: view === "list" ? "center" : undefined,
            }}
          >
            <div
              className="relative overflow-hidden"
              style={{
                background: p.gradient,
                height: view === "list" ? 64 : 120,
                width: view === "list" ? 90 : "100%",
                flexShrink: 0,
                display: "flex",
                alignItems: "flex-end",
                padding: view === "list" ? 0 : "10px 14px",
                justifyContent: view === "list" ? "center" : "flex-start",
              }}
            >
              <span
                className="pointer-events-none absolute inset-y-0 left-0 w-1/2 opacity-0 group-hover:opacity-100 group-hover:[animation:shimmer-sweep_1.1s_ease-out]"
                style={{
                  background: "linear-gradient(115deg,transparent 30%,rgba(255,255,255,.32) 50%,transparent 70%)",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  top: 10,
                  left: 12,
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                  color: "rgba(255,255,255,.85)",
                  background: "rgba(0,0,0,.22)",
                  padding: "3px 8px",
                  borderRadius: 99,
                }}
              >
                {p.type}
              </span>
              {view !== "list" && (
                <b style={{ fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,.92)", letterSpacing: "-1px" }}>
                  {p.name.slice(0, 2).toUpperCase()}
                </b>
              )}
            </div>

            <div style={{ padding: view === "list" ? "10px 16px" : "14px 16px 16px", flex: view === "list" ? 1 : undefined, display: view === "list" ? "flex" : "block", alignItems: view === "list" ? "center" : undefined, justifyContent: view === "list" ? "space-between" : undefined, gap: 16 }}>
              <div style={{ minWidth: 0 }}>
                <b style={{ display: "block", fontSize: 15.5, fontWeight: 800, color: "var(--ink)", letterSpacing: "-.2px" }}>{p.name}</b>
                <span style={{ fontSize: 12.5, color: "var(--ink-3)", fontStyle: "italic" }}>{p.genericName}</span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: view === "list" ? 0 : "10px 0" }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: p.dossiersVerified === p.dossiersTotal ? "var(--ok-bg)" : "var(--tint-2)", color: p.dossiersVerified === p.dossiersTotal ? "var(--ok)" : "var(--brand-deep)", border: `1px solid ${p.dossiersVerified === p.dossiersTotal ? "var(--ok-line)" : "var(--tint-line)"}` }}>
                  {p.dossiersVerified}/{p.dossiersTotal} dossiers
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: "var(--surface-subtle)", color: "var(--ink-3)", border: "1px solid var(--hair)" }}>
                  {p.claimsApproved} claims
                </span>
                {view !== "list" && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: "var(--surface-subtle)", color: "var(--ink-3)", border: "1px solid var(--hair)" }}>
                    {p.views} views
                  </span>
                )}
              </div>

              {view !== "list" && <div style={{ height: 1, background: "var(--hair)", margin: "10px 0" }} />}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--ink-4)" }}>
                <span>{p.updated}</span>
                <span
                  className="group-hover:gap-2"
                  style={{ color: "var(--brand)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4, transition: "gap .2s var(--e)" }}
                >
                  Open →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-4)", fontSize: 14 }}>
          No products match &ldquo;{query}&rdquo;.
        </div>
      )}
    </div>
  );
}
