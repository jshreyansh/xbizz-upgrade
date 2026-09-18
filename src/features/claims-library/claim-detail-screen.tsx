"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Info,
  Layers,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ProductArtwork } from "@/features/product-library/product-artwork";
import { CLAIM_STATUS_STYLE, DOSSIER_TYPE_ICON } from "@/features/product-library/claim-card";
import { AssetVideo } from "@/features/workspace/asset-video";
import { useOpenPublishedAsset } from "@/features/content-library/use-open-published-asset";
import { AttachmentPreviewModal } from "@/features/workspace/chat-attachments";
import type { ClaimDetail, ClaimReference } from "@/features/claims-library/claim-detail";

type Tab = "information" | "usage";

/** A labelled fact in the Information tab. */
function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <span className="block text-micro font-bold uppercase tracking-[.05em] text-ink-4">{label}</span>
      <div className="mt-1 text-body-lg font-semibold text-ink">{children}</div>
    </div>
  );
}

/**
 * One claim, on its own page.
 *
 * The Claims Library card says what the statement is and what kind of
 * evidence backs it. What it cannot say is the part a reviewer actually asks
 * about: which product and which presentations of it this holds for, who put
 * it there and who stood behind it, and where it has already gone out.
 *
 * Built to read like the Product Detail page, because it is the same kind of
 * screen — one record, a header and tabs — and two records that look
 * different teach the same person two layouts for one idea.
 */
export function ClaimDetailScreen({ detail }: { detail: ClaimDetail }) {
  const router = useRouter();
  const openReview = useOpenPublishedAsset();
  const [tab, setTab] = useState<Tab>("information");
  /* The reference being read. A citation you cannot open is a citation you
     have to take on trust, which is the opposite of what one is for. */
  const [preview, setPreview] = useState<ClaimReference | null>(null);

  const { claim, product } = detail;
  const status = CLAIM_STATUS_STYLE[claim.status];
  const TypeIcon = DOSSIER_TYPE_ICON[claim.dossierType];

  const TABS: { key: Tab; label: string; icon: typeof Info; count?: number }[] = [
    { key: "information", label: "Information", icon: Info },
    { key: "usage", label: "Usage", icon: Layers, count: detail.usedIn.length },
  ];

  return (
    <div className="page-enter max-w-[980px] space-y-6">
      <button
        onClick={() => router.push("/claims-library")}
        className="inline-flex cursor-pointer items-center gap-1.5 text-body-lg font-bold text-ink-3 transition-colors hover:text-ink"
      >
        <ChevronLeft size={15} />
        Claims Library
      </button>

      {/* The claim itself, in the header. No counts on the right: a single
          statement has nothing to total, and a row of zeroes would be worse
          than the space it filled. */}
      <div className="flex flex-wrap items-start gap-4 rounded-panel border border-hair bg-card p-4 shadow-hair">
        <span className={cn("grid size-12 shrink-0 place-items-center rounded-control", status.bg, status.tone)}>
          <TypeIcon size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-title font-extrabold tracking-tight text-ink">{claim.dossierType}</h1>
            <span
              className={cn(
                "rounded-chip px-2 py-0.5 text-micro font-extrabold uppercase tracking-[.03em]",
                status.bg,
                status.tone
              )}
            >
              {status.label}
            </span>
          </div>
          <p className="mt-1 text-body-lg leading-relaxed text-ink-2">{claim.text}</p>
          <span className="mt-1.5 block text-caption text-ink-4">{claim.source}</span>
        </div>
      </div>

      {/* Tabs — the same strip the Product Detail page uses. */}
      <div className="flex overflow-hidden rounded-panel border border-hair bg-card shadow-hair">
        {TABS.map((t, i) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative flex flex-1 cursor-pointer items-center justify-center gap-2 px-3.5 py-3.5 text-body-lg font-bold transition-colors",
                i > 0 && "border-l border-hair",
                active ? "bg-tint-2/50 text-brand-deep" : "text-ink-3 hover:text-ink"
              )}
            >
              <t.icon size={15} />
              {t.label}
              {t.count !== undefined && (
                <span
                  className={cn(
                    "rounded-chip px-1.5 py-0.5 text-micro font-extrabold",
                    active ? "bg-tint text-brand-deep" : "bg-subtle text-ink-4"
                  )}
                >
                  {t.count}
                </span>
              )}
              {active && (
                <span
                  className="absolute inset-x-0 bottom-0 h-[3px] rounded-t-full"
                  style={{ background: "linear-gradient(90deg,var(--brand),var(--brand-deep))" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {tab === "information" ? (
        <div className="space-y-4">
          {/* The product this belongs to. A claim is never about a brand in
              the abstract — it is about a product, in the presentations named
              underneath. */}
          <section className="rounded-panel border border-hair bg-card p-4 shadow-hair">
            <h2 className="text-body font-extrabold uppercase tracking-[.05em] text-ink-4">Product</h2>
            <div className="mt-3 flex flex-wrap items-center gap-3.5">
              <span
                className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-control"
                style={{ background: product.gradient }}
              >
                <ProductArtwork
                  kind={product.type}
                  photoUrl={product.referenceImageUrl}
                  className="relative h-8 w-8"
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-body-lg font-extrabold text-ink">{product.name}</div>
                <span className="text-body italic text-ink-3">{product.genericName}</span>
              </div>
              <button
                onClick={() => router.push(`/product-library/${product.id}`)}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-chip border border-hair-2 bg-canvas px-3 py-1.5 text-label font-bold text-brand-deep transition hover:border-brand"
              >
                Full Product Details
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="mt-4 border-t border-hair pt-3.5">
              <Fact label="Variants included">
                <div className="flex flex-wrap gap-1.5">
                  {detail.variations.map((variation) => (
                    <span
                      key={variation}
                      className="rounded-chip border border-hair-2 bg-subtle px-2.5 py-1 text-label font-bold text-ink-2"
                    >
                      {variation}
                    </span>
                  ))}
                </div>
              </Fact>
            </div>
          </section>

          {/* Where it came from and when. */}
          <section className="rounded-panel border border-hair bg-card p-4 shadow-hair">
            <h2 className="text-body font-extrabold uppercase tracking-[.05em] text-ink-4">Record</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <Fact label="Added">{detail.addedOn}</Fact>
              <Fact label="Last updated">{detail.updatedOn}</Fact>
              <Fact label="Source">
                {detail.origin === "authored" ? (
                  <span className="block leading-snug">
                    Added by {detail.author}
                    <span className="block text-label font-semibold text-ok">Verified by SwishX</span>
                  </span>
                ) : (
                  <span className="block leading-snug">
                    Sourced from the approved label
                    <span className="block text-label font-semibold text-ok">Sourced and verified by SwishX</span>
                  </span>
                )}
              </Fact>
            </div>
          </section>

          {/* What it traces back to. */}
          <section className="rounded-panel border border-hair bg-card p-4 shadow-hair">
            <h2 className="text-body font-extrabold uppercase tracking-[.05em] text-ink-4">
              References and attachments
            </h2>
            <ul className="mt-3 space-y-2">
              {detail.references.map((reference) => (
                <li key={reference.label}>
                  <button
                    type="button"
                    onClick={() => setPreview(reference)}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-control border border-hair-2 bg-canvas px-3 py-2.5 text-left transition hover:border-brand/40 hover:bg-card"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-chip bg-tint text-brand-deep">
                      {reference.kind === "link" ? <ExternalLink size={14} /> : <Paperclip size={14} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-body font-bold text-ink">{reference.label}</div>
                      <span className="truncate text-caption text-ink-3">{reference.detail}</span>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 text-caption font-bold text-brand">
                      <Eye size={13} /> Preview
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        /* Where this claim has already gone out. A grid, because each one is
           a piece of work with a face — a flat list of titles would be the
           least useful shape for the question "where is this live?". */
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
          {detail.usedIn.map((asset) => (
            <button
              key={asset.id}
              onClick={() => openReview(asset)}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-panel border border-hair bg-card text-left shadow-hair transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div
                className="relative aspect-video w-full overflow-hidden"
                style={{ background: asset.gradient }}
              >
                {asset.videoSrc ? (
                  <AssetVideo src={asset.videoSrc} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col justify-center gap-1 p-4 text-white">
                    {asset.badge && (
                      <span className="w-fit rounded-chip bg-white/15 px-2 py-0.5 text-micro font-extrabold uppercase tracking-wide">
                        {asset.badge}
                      </span>
                    )}
                    <span className="text-body-lg font-extrabold leading-tight">{asset.metric}</span>
                    <span className="text-caption text-white/70">{asset.metricLabel}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-1.5 p-3.5">
                <div className="text-body font-extrabold leading-snug text-ink group-hover:text-brand-deep">
                  {asset.title}
                </div>
                <span className="text-caption text-ink-3">
                  {asset.audience} · {asset.spec}
                </span>
                <div className="mt-auto flex items-center gap-3 pt-2 text-caption text-ink-4">
                  {asset.comments > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare size={12} /> {asset.comments}
                    </span>
                  )}
                  <span className="ml-auto font-bold text-brand">Open review</span>
                </div>
              </div>
            </button>
          ))}

          {detail.usedIn.length === 0 && (
            <div className="col-span-full rounded-panel border border-dashed border-hair-2 py-14 text-center">
              <p className="text-body-lg font-bold text-ink-2">Not used in anything yet</p>
              <p className="mt-1 text-body text-ink-4">
                Assets that cite this claim will appear here once they are published.
              </p>
            </div>
          )}
        </div>
      )}

      {preview && (
        <AttachmentPreviewModal
          file={{
            id: preview.label,
            name: preview.label,
            kind: preview.fileKind,
            previewUrl: preview.previewUrl,
          }}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
