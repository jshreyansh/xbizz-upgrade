"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ListChecks, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { LibraryProduct, ProductDetail, DossierTypeName } from "@/features/product-library/product-library-types";
import { DOSSIER_STATUS_STYLE } from "@/features/product-library/dossier-status";
import { DOSSIER_TYPE_ICON, ClaimCard } from "@/features/product-library/claim-card";
import { buildDossierSections } from "@/features/product-library/mock-product-detail";

/**
 * One dossier, in full — its sections and the claims it grounds — reached
 * by clicking a dossier's "head" on the product's Dossier tab. The "All
 * dossiers" rail up top is what makes this a destination rather than a
 * dead end: every other dossier type is one click away without a trip
 * back through the tab.
 */
export function DossierDetailScreen({
  product,
  detail,
  activeType,
}: {
  product: LibraryProduct;
  detail: ProductDetail;
  activeType: DossierTypeName;
}) {
  const router = useRouter();
  const entry = detail.dossiers.find((d) => d.type === activeType);

  if (!entry) return null;

  const sections = buildDossierSections(entry);
  const claims = detail.claims.filter((c) => c.dossierType === activeType);
  const s = DOSSIER_STATUS_STYLE[entry.status];
  const HeadIcon = DOSSIER_TYPE_ICON[activeType];

  const goToDossier = (type: DossierTypeName) => router.push(`/product-library/${product.id}/dossier/${type}`);

  return (
    <div className="page-enter space-y-6">
      <button
        onClick={() => router.push(`/product-library/${product.id}`)}
        className="inline-flex items-center gap-1.5 text-body-lg font-bold text-ink-3 transition-colors hover:text-brand-deep"
      >
        <ChevronLeft size={15} /> {product.name}
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 rounded-panel border border-hair bg-card p-5 shadow-hair">
        <span className={cn("grid size-12 shrink-0 place-items-center rounded-control", s.bg, s.tone)}>
          <HeadIcon size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-title font-extrabold tracking-tight text-ink">{activeType} dossier</h1>
            <span className={cn("rounded-chip px-2.5 py-1 text-caption font-extrabold", s.bg, s.tone)}>{s.label}</span>
          </div>
          <span className="text-body text-ink-3">
            {entry.status === "not started"
              ? "Not started yet"
              : `${entry.sections} sections · ${entry.claimsCited} claims cited · Updated ${entry.updated}`}
          </span>
        </div>
      </div>

      {/* All dossiers — the whole point of this being a page rather than an
          expanded row: every other type is one click away from here. */}
      <div className="space-y-2.5">
        <h2 className="text-caption font-extrabold uppercase tracking-[.05em] text-ink-4">All dossiers</h2>
        <div className="flex flex-wrap gap-2">
          {detail.dossiers.map((d) => {
            const ds = DOSSIER_STATUS_STYLE[d.status];
            const DIcon = DOSSIER_TYPE_ICON[d.type];
            const isActive = d.type === activeType;
            return (
              <button
                key={d.type}
                onClick={() => goToDossier(d.type)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-control border px-3 py-2 text-body font-bold transition-all",
                  isActive ? "border-brand bg-tint text-brand-deep shadow-brand-soft" : "border-hair bg-card text-ink-2 hover:border-hair-3"
                )}
              >
                <span className={cn("grid size-5 shrink-0 place-items-center rounded-chip", ds.bg, ds.tone)}>
                  <DIcon size={11} />
                </span>
                {d.type}
                <ds.icon size={13} className={ds.tone} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <h2 className="text-subhead font-extrabold tracking-tight text-ink">Sections</h2>
        {sections.length === 0 ? (
          <EmptyBlock
            icon={ListChecks}
            title="Not started yet"
            description="This dossier hasn't been started — its sections will appear here once it is."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {sections.map((sec) => {
              const ss = DOSSIER_STATUS_STYLE[sec.status];
              return (
                <div key={sec.id} className="flex items-center gap-3.5 rounded-control border border-hair bg-card p-3.5">
                  <ss.icon size={15} className={cn("shrink-0", ss.tone)} />
                  <span className="min-w-0 flex-1 truncate text-body-lg font-bold text-ink-2">{sec.title}</span>
                  <span className="shrink-0 text-caption text-ink-4">{sec.claimsCited} claims cited</span>
                  <span className={cn("shrink-0 rounded-chip px-2 py-0.5 text-micro font-extrabold uppercase tracking-[.03em]", ss.bg, ss.tone)}>
                    {ss.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Claims from this dossier — reuses the same ClaimCard the Claims
          tab and the Claims Library use, filtered to this dossier type. */}
      <div className="space-y-3">
        <h2 className="text-subhead font-extrabold tracking-tight text-ink">Claims from this dossier</h2>
        {claims.length === 0 ? (
          <EmptyBlock icon={ListChecks} title="No claims cited yet" description="Claims this dossier grounds will show up here once it's underway." />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
            {claims.map((c) => (
              <ClaimCard key={c.id} claim={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyBlock({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-panel border border-dashed border-hair-2 py-12 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-subtle text-ink-4">
        <Icon size={20} />
      </span>
      <p className="text-body-lg font-bold text-ink-2">{title}</p>
      <p className="max-w-[36ch] text-body text-ink-4">{description}</p>
    </div>
  );
}
