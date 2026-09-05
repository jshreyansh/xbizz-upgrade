"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Image as ImageIcon, FileText, ListChecks, CheckCircle2, Clock, Circle, Plus } from "lucide-react";
import type { LibraryProduct, ProductDetail, DossierEntryStatus, ClaimStatus } from "@/features/product-library/product-library-types";

type Tab = "images" | "dossier" | "claims";

const STATUS_STYLE: Record<DossierEntryStatus, { icon: typeof CheckCircle2; tone: string; bg: string; label: string }> = {
  verified: { icon: CheckCircle2, tone: "text-ok", bg: "bg-ok-bg", label: "Verified" },
  "in review": { icon: Clock, tone: "text-warn", bg: "bg-warn-bg", label: "In review" },
  "not started": { icon: Circle, tone: "text-ink-4", bg: "bg-subtle", label: "Not started" },
};

const CLAIM_STYLE: Record<ClaimStatus, { tone: string; bg: string; line: string }> = {
  approved: { tone: "text-ok", bg: "bg-ok-bg", line: "border-ok-line" },
  pending: { tone: "text-warn", bg: "bg-warn-bg", line: "border-warn-line" },
  "held out": { tone: "text-danger", bg: "bg-danger-bg", line: "border-danger" },
};

export function ProductDetailScreen({ product, detail }: { product: LibraryProduct; detail: ProductDetail }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("images");

  const TABS: { key: Tab; label: string; icon: typeof ImageIcon; count: number }[] = [
    { key: "images", label: "Product Images", icon: ImageIcon, count: detail.images.length },
    { key: "dossier", label: "Dossier", icon: FileText, count: detail.dossiers.length },
    { key: "claims", label: "Claims", icon: ListChecks, count: detail.claims.length },
  ];

  return (
    <div className="page-enter space-y-6 max-w-[980px]">
      {/* Back */}
      <button
        onClick={() => router.push("/product-library")}
        className="inline-flex items-center gap-1.5 text-body-lg font-bold text-ink-3 hover:text-ink transition-colors"
      >
        <ChevronLeft size={15} />
        Product Library
      </button>

      {/* Header banner */}
      <div className="overflow-hidden rounded-card border border-hair bg-card shadow-soft">
        <div className="relative flex items-end gap-4 p-6" style={{ background: product.gradient, minHeight: 108 }}>
          <span
            aria-hidden
            className="absolute left-3 top-3 rounded-chip px-2.5 py-1 text-caption font-extrabold uppercase tracking-[.04em] text-white/90"
            style={{ background: "rgba(0,0,0,.22)" }}
          >
            {product.type}
          </span>
          <b className="text-hero-lg font-black tracking-tight text-white/95">{product.name.slice(0, 2).toUpperCase()}</b>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h1 className="text-display-lg font-extrabold tracking-tight text-ink">{product.name}</h1>
            <span className="text-body-lg italic text-ink-3">{product.genericName}</span>
          </div>
          <div className="flex gap-6">
            <div>
              <b className="block text-display font-extrabold text-ink">
                {product.dossiersVerified}/{product.dossiersTotal}
              </b>
              <span className="text-caption font-bold uppercase tracking-[.05em] text-ink-4">Dossiers</span>
            </div>
            <div>
              <b className="block text-display font-extrabold text-ink">{product.claimsApproved}</b>
              <span className="text-caption font-bold uppercase tracking-[.05em] text-ink-4">Claims</span>
            </div>
            <div>
              <b className="block text-display font-extrabold text-ink">{product.views}</b>
              <span className="text-caption font-bold uppercase tracking-[.05em] text-ink-4">Views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-hair">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`group relative flex items-center gap-2 px-3.5 py-2.5 text-body-lg font-bold transition-colors ${
                active ? "text-brand-deep" : "text-ink-3 hover:text-ink"
              }`}
            >
              <t.icon size={15} />
              {t.label}
              <span className={`rounded-full px-1.5 py-0.5 text-micro font-extrabold ${active ? "bg-tint text-brand-deep" : "bg-subtle text-ink-4"}`}>
                {t.count}
              </span>
              {active && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-brand" />}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "images" && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {detail.images.map((img) => (
            <div key={img.id} className="overflow-hidden rounded-panel border border-hair bg-card shadow-hair transition-shadow hover:shadow-soft">
              <div className="flex items-center justify-center" style={{ background: img.gradient, height: 130 }}>
                <ImageIcon size={26} className="text-white/80" strokeWidth={1.5} />
              </div>
              <div className="p-3">
                <span className="block text-body font-bold text-ink">{img.kind}</span>
                <span className="text-caption text-ink-4">{img.label}</span>
              </div>
            </div>
          ))}
          <button className="flex min-h-[178px] flex-col items-center justify-center gap-2 rounded-panel border border-dashed border-hair-2 text-ink-4 transition-colors hover:border-brand hover:text-brand-deep hover:bg-tint-2">
            <Plus size={18} />
            <span className="text-body font-bold">Add image</span>
          </button>
        </div>
      )}

      {tab === "dossier" && (
        <div className="flex flex-col gap-2.5">
          {detail.dossiers.map((d) => {
            const s = STATUS_STYLE[d.status];
            return (
              <div key={d.type} className="flex items-center gap-4 rounded-panel border border-hair bg-card p-4 shadow-hair">
                <span className={`grid size-9 shrink-0 place-items-center rounded-control ${s.bg} ${s.tone}`}>
                  <s.icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block text-subhead font-bold text-ink">{d.type} dossier</b>
                  <span className="text-body text-ink-3">
                    {d.status === "not started" ? "Not started yet" : `${d.sections} sections · ${d.claimsCited} claims cited · Updated ${d.updated}`}
                  </span>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-caption font-extrabold ${s.bg} ${s.tone}`}>{s.label}</span>
                <button className="text-body-lg font-bold text-brand hover:text-brand-deep transition-colors">
                  {d.status === "not started" ? "Start →" : "View →"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {tab === "claims" && (
        <div className="flex flex-col gap-2">
          {detail.claims.length === 0 && (
            <p className="py-10 text-center text-body-lg text-ink-4">No claims cited yet — dossiers for this product haven&rsquo;t started.</p>
          )}
          {detail.claims.map((c) => {
            const s = CLAIM_STYLE[c.status];
            return (
              <div key={c.id} className={`flex items-start gap-3 rounded-control border ${s.line} bg-card p-3.5`}>
                <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-micro font-extrabold uppercase tracking-[.03em] ${s.bg} ${s.tone}`}>
                  {c.status}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-body-lg leading-relaxed text-ink-2">{c.text}</p>
                  <span className="text-caption text-ink-4">{c.source}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
