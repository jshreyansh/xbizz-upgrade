"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Image as ImageIcon,
  FileText,
  ListChecks,
  Paperclip,
  Upload,
  Trash2,
  RefreshCw,
  Download,
  Eye,
  Layers,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type {
  LibraryProduct,
  ProductDetail,
  ProductVariation,
  ProductImage,
  ProductImageAngle,
  ProductDocument,
} from "@/features/product-library/product-library-types";
import { IMAGE_ANGLES } from "@/features/product-library/product-library-types";
import { ProductArtwork, type ArtworkKind } from "@/features/product-library/product-artwork";
import { ClaimCard } from "@/features/product-library/claim-card";
import { AssetStateBadge, originLabel } from "@/features/product-library/asset-state-badge";
import { AttachmentPreviewModal } from "@/features/workspace/chat-attachments";
import { DOSSIER_STATUS_STYLE as STATUS_STYLE } from "@/features/product-library/dossier-status";

/** Only the lifestyle angle borrows the generic wellness scene — every other
 *  angle is a shot of the product's own type, distinguished by orientation. */
function artworkFor(angle: ProductImageAngle, productType: LibraryProduct["type"]): ArtworkKind {
  return angle === "Lifestyle" ? "Lifestyle" : productType;
}

/** A cheap stand-in for a different camera angle: the same vector artwork,
 *  reflected/rotated, since there's no real photography to shoot from. */
const ANGLE_TRANSFORM: Record<ProductImageAngle, string> = {
  Front: "none",
  Back: "scaleX(-1)",
  Side: "rotate(-10deg) scale(1.05)",
  Top: "rotate(90deg) scale(0.92)",
  Packaging: "rotate(5deg)",
  Lifestyle: "none",
};

export type Tab = "dossier" | "claims" | "documents" | "images";
export const TAB_IDS: Tab[] = ["dossier", "claims", "documents", "images"];

const FILE_TONE: Record<string, string> = {
  PDF: "bg-danger-bg text-danger",
  DOCX: "bg-[#e8f0ff] text-[#2452d6]",
  PPTX: "bg-warn-bg text-warn",
  XLSX: "bg-ok-bg text-ok",
};

/** Small stat used in the compact profile row — a single solid number, never
 *  an "x/y" fraction (a completed count reads clearer than a ratio here). */
function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <b className="block text-subhead font-extrabold leading-none text-ink">{value}</b>
      <span className="text-micro font-bold uppercase tracking-[.05em] text-ink-4">{label}</span>
    </div>
  );
}

export function ProductDetailScreen({
  product,
  detail,
  initialTab = "dossier",
}: {
  product: LibraryProduct;
  detail: ProductDetail;
  /** Lets another screen (the Claims Library) link straight into a tab
   *  instead of always landing on Dossier. */
  initialTab?: Tab;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [variations, setVariations] = useState<ProductVariation[]>(detail.variations);
  const [activeVariationId, setActiveVariationId] = useState(detail.variations[0]?.id ?? "");
  const documents = detail.documents;
  const [openImageMenuId, setOpenImageMenuId] = useState<string | null>(null);
  /** The attachment being read, in the same viewer the studio uses. */
  const [previewDoc, setPreviewDoc] = useState<ProductDocument | null>(null);

  const activeVariation = useMemo(
    () => variations.find((v) => v.id === activeVariationId) ?? variations[0],
    [variations, activeVariationId]
  );

  /* Every shot for the variant, unfiltered. The angle row underneath the
     variant chips filtered six tiles down to one, which is a control for a
     list this size and a way to hide five of the six things you came to
     look at. The angle is on the tile; that is enough. */
  const visibleImages = activeVariation?.images ?? [];

  const totalImages = variations.reduce((sum, v) => sum + v.images.length, 0);

  const TABS: { key: Tab; label: string; icon: typeof ImageIcon; count: number }[] = [
    { key: "dossier", label: "Dossier", icon: FileText, count: detail.dossiers.length },
    { key: "claims", label: "Claims", icon: ListChecks, count: detail.claims.length },
    { key: "documents", label: "Attachments", icon: Paperclip, count: documents.length },
    { key: "images", label: "Product Images", icon: ImageIcon, count: totalImages },
  ];


  function updateActiveImages(fn: (images: ProductImage[]) => ProductImage[]) {
    setVariations((prev) => prev.map((v) => (v.id === activeVariation?.id ? { ...v, images: fn(v.images) } : v)));
  }

  function handleUpload() {
    if (!activeVariation) return;
    const used = new Set(activeVariation.images.map((img) => img.angle));
    const nextAngle = IMAGE_ANGLES.find((a) => !used.has(a)) ?? "Front";
    const id = `${activeVariation.id}-img-${Date.now()}`;
    updateActiveImages((images) => [
      ...images,
      {
        id,
        name: `${product.name.toLowerCase()}_${nextAngle.toLowerCase()}_new.png`,
        comment: "Uploaded here — add a note so the studio knows what it is for.",
        label: `${nextAngle} shot`,
        angle: nextAngle,
        gradient: product.gradient,
        state: "in progress",
        addedBy: { name: "Siva Gnanam", team: "Brand" },
        addedOn: "Just now",
        updatedOn: "Just now",
      },
    ]);
  }

  function handleReplace(imageId: string) {
    updateActiveImages((images) =>
      images.map((img) => {
        if (img.id !== imageId) return img;
        const i = IMAGE_ANGLES.indexOf(img.angle);
        const nextAngle = IMAGE_ANGLES[(i + 1) % IMAGE_ANGLES.length];
        return { ...img, angle: nextAngle, label: `${nextAngle} shot` };
      })
    );
  }

  function handleDelete(imageId: string) {
    updateActiveImages((images) => images.filter((img) => img.id !== imageId));
  }


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

      {/* Compact profile row — no full-width cover photo, just the essentials */}
      <div className="flex flex-wrap items-center gap-4 rounded-panel border border-hair bg-card p-4 shadow-hair">
        <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-control" style={{ background: product.gradient }}>
          <span
            aria-hidden
            className="pointer-events-none absolute rounded-full"
            style={{ width: "140%", height: "140%", right: "-30%", top: "-30%", background: "radial-gradient(circle,rgba(255,255,255,.3),transparent 70%)" }}
          />
          {product.referenceImageUrl ? (
            <img src={product.referenceImageUrl} alt="" className="relative h-full w-full object-cover" />
          ) : (
            <ProductArtwork kind={product.type} className="relative h-8 w-8" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-title font-extrabold tracking-tight text-ink">{product.name}</h1>
            <span className="rounded-chip bg-subtle px-2 py-0.5 text-caption font-bold uppercase tracking-[.03em] text-ink-3">{product.type}</span>
          </div>
          <span className="text-body italic text-ink-3">{product.genericName}</span>
        </div>
        <div className="flex items-center gap-5">
          <Stat value={product.dossiersVerified} label="Dossiers" />
          <Stat value={product.claimsApproved} label="Claims" />
          <Stat value={documents.length} label="Attachments" />
          <Stat value={totalImages} label="Images" />
        </div>
      </div>

      {/* Tabs — one bordered strip, divided, with a gradient bar under the active tab */}
      <div className="flex overflow-hidden rounded-panel border border-hair bg-card shadow-hair">
        {TABS.map((t, i) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-2 px-3.5 py-3.5 text-body-lg font-bold transition-colors",
                i > 0 && "border-l border-hair",
                active ? "bg-tint-2/50 text-brand-deep" : "text-ink-3 hover:text-ink"
              )}
            >
              <t.icon size={15} />
              {t.label}
              <span className={`rounded-chip px-1.5 py-0.5 text-micro font-extrabold ${active ? "bg-tint text-brand-deep" : "bg-subtle text-ink-4"}`}>
                {t.count}
              </span>
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

      {/* Tab content */}
      {tab === "images" && (
        <div className="space-y-4" onClick={() => setOpenImageMenuId(null)}>
          {/* Section header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-title font-extrabold tracking-tight text-ink">Product Images</h2>
              <p className="text-body text-ink-3">Every image this brand has, by presentation — with what the person who uploaded it said it was for</p>
            </div>
          </div>

          {/* Variations */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 inline-flex items-center gap-1.5 text-label font-bold uppercase tracking-[.06em] text-ink-4">
              <Layers size={12} /> Variant
            </span>
            {variations.map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveVariationId(v.id)}
                className={`rounded-chip border px-3 py-1.5 text-body font-bold transition-colors ${
                  v.id === activeVariation?.id
                    ? "border-brand bg-tint text-brand-deep"
                    : "border-hair-2 bg-card text-ink-2 hover:border-hair-3"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {visibleImages.map((img) => (
              <div
                key={img.id}
                className="group flex flex-col overflow-hidden rounded-panel border border-hair bg-card shadow-hair transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
              >
                <div className="relative overflow-hidden" style={{ background: img.gradient, height: 150 }}>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute rounded-full"
                    style={{ width: "70%", height: "70%", right: "-15%", top: "-15%", background: "radial-gradient(circle,rgba(255,255,255,.3),transparent 70%)" }}
                  />
                  <div
                    className="absolute inset-0 p-3 transition-transform duration-300 group-hover:scale-[1.04]"
                    style={{ transform: ANGLE_TRANSFORM[img.angle] }}
                  >
                    {img.imageUrl ? (
                      <img src={img.imageUrl} alt="" className="h-full w-full object-contain drop-shadow-lg" />
                    ) : (
                      <ProductArtwork kind={artworkFor(img.angle, product.type)} className="h-full w-full" />
                    )}
                  </div>

                  <div className="absolute left-2 top-2">
                    <AssetStateBadge state={img.state} onDark />
                  </div>

                  {/* Always-visible overflow menu — Replace / Delete */}
                  <div className="absolute right-2 top-2">
                    <button
                      type="button"
                      title="Image options"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenImageMenuId(openImageMenuId === img.id ? null : img.id);
                      }}
                      className="grid size-7 place-items-center rounded-full text-white backdrop-blur-sm transition-colors hover:bg-black/50"
                      style={{ background: "rgba(0,0,0,.35)" }}
                    >
                      <MoreHorizontal size={15} />
                    </button>
                    {openImageMenuId === img.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-[calc(100%+6px)] z-10 w-36 overflow-hidden rounded-control border border-hair bg-card shadow-float"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            handleReplace(img.id);
                            setOpenImageMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-body font-semibold text-ink-2 transition-colors hover:bg-subtle"
                        >
                          <RefreshCw size={13} /> Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleDelete(img.id);
                            setOpenImageMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-body font-semibold text-danger transition-colors hover:bg-danger-bg"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* The file and what the person who uploaded it said about
                    it — which is what the studio asked them for and what
                    anyone picking a shot actually needs. "Front / Front
                    shot" named the slot twice and said nothing. */}
                <div className="flex flex-1 flex-col p-3">
                  <b className="block truncate text-body font-bold text-ink" title={img.name}>
                    {img.name}
                  </b>
                  <p className="mt-1 line-clamp-2 text-caption leading-snug text-ink-3">{img.comment}</p>
                  <div className="mt-2.5 h-px bg-hair" />
                  <div className="mt-2 flex items-center justify-between gap-2 text-micro text-ink-4">
                    <span className="truncate">Added {img.addedOn}</span>
                    <span className="shrink-0">Updated {img.updatedOn}</span>
                  </div>
                  <span className="mt-1 truncate text-micro text-ink-4">
                    {img.angle} · {originLabel(img.addedBy)}
                  </span>
                </div>
              </div>
            ))}

            <button
              onClick={handleUpload}
              className="flex min-h-[178px] flex-col items-center justify-center gap-1.5 rounded-panel border border-dashed border-hair-2 text-ink-4 transition-colors hover:border-brand hover:text-brand-deep hover:bg-tint-2"
            >
              <Upload size={18} />
              <span className="text-body font-bold">Add product image</span>
              <span className="text-caption text-ink-4">JPG, PNG or WebP (max 10MB)</span>
            </button>
          </div>

          {visibleImages.length === 0 && (
            <p className="py-6 text-center text-body text-ink-4">No images yet for this variant — upload one above.</p>
          )}
        </div>
      )}

      {tab === "dossier" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-title font-extrabold tracking-tight text-ink">Dossier</h2>
            <p className="text-body text-ink-3">The six sections every claim in this brand traces back to</p>
          </div>
          <div className="flex flex-col gap-2.5">
          {detail.dossiers.map((d) => {
            const s = STATUS_STYLE[d.status];
            return (
              <div
                key={d.type}
                onClick={() => router.push(`/product-library/${product.id}/dossier/${d.type}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push(`/product-library/${product.id}/dossier/${d.type}`);
                }}
                className="group flex cursor-pointer items-center gap-4 rounded-panel border border-hair bg-card p-4 shadow-hair transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft"
              >
                <span className={`grid size-9 shrink-0 place-items-center rounded-control ${s.bg} ${s.tone}`}>
                  <s.icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block text-subhead font-bold text-ink">{d.type} dossier</b>
                  <span className="text-body text-ink-3">
                    {d.status === "not started" ? "Not started yet" : `${d.sections} sections · ${d.claimsCited} claims cited · Updated ${d.updated}`}
                  </span>
                </div>
                <span className={`rounded-chip px-2.5 py-1 text-caption font-extrabold ${s.bg} ${s.tone}`}>{s.label}</span>
                <span className="inline-flex items-center gap-1 text-body-lg font-bold text-brand transition-all group-hover:gap-1.5 group-hover:text-brand-deep">
                  {d.status === "not started" ? "Start" : "View"} →
                </span>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {tab === "claims" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-title font-extrabold tracking-tight text-ink">Claims</h2>
            <p className="text-body text-ink-3">Every statement approved for use, cited back to its dossier section</p>
          </div>

          {detail.claims.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-panel border border-dashed border-hair-2 py-14 text-center">
              <span className="grid size-11 place-items-center rounded-full bg-subtle text-ink-4">
                <ListChecks size={20} />
              </span>
              <p className="text-body-lg font-bold text-ink-2">No claims cited yet</p>
              <p className="max-w-[36ch] text-body text-ink-4">Dossiers for this product haven&rsquo;t started — claims appear here once a dossier cites them.</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
              {detail.claims.map((c) => (
                <ClaimCard key={c.id} claim={c} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "documents" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-title font-extrabold tracking-tight text-ink">Attachments</h2>
              <p className="text-body text-ink-3">Prescribing information, decks, and anything else this brand was grounded in</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex flex-wrap items-center gap-3.5 rounded-panel border border-hair bg-card p-3.5 shadow-hair">
                <span className={`grid size-9 shrink-0 place-items-center rounded-control text-caption font-extrabold ${FILE_TONE[doc.fileType] ?? "bg-subtle text-ink-3"}`}>
                  {doc.fileType}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <b className="truncate text-body-lg font-bold text-ink">{doc.name}</b>
                    <AssetStateBadge state={doc.state} />
                  </div>
                  {/* Added, not updated: an attachment is a record of what
                      was supplied, and who supplied it is half of that. */}
                  <span className="text-caption text-ink-4">
                    {doc.category} · {doc.size} · Added {doc.addedOn} · {originLabel(doc.addedBy)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(doc)}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-control border border-hair-2 px-2.5 py-1.5 text-body font-bold text-ink-2 transition-colors hover:border-brand hover:bg-tint hover:text-brand-deep"
                >
                  <Eye size={14} /> View
                </button>
                <button className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-body-lg font-bold text-brand transition-colors hover:text-brand-deep">
                  <Download size={14} /> Download
                </button>
              </div>
            ))}
          </div>
          {documents.length === 0 && (
            <p className="py-10 text-center text-body-lg text-ink-4">No attachments yet — upload one above.</p>
          )}
        </div>
      )}

      {/* The same viewer the studio opens for a workspace document. There is
          one way to read a file here. */}
      {previewDoc && (
        <AttachmentPreviewModal
          file={{ id: previewDoc.id, name: previewDoc.name, kind: "doc", previewUrl: previewDoc.previewUrl }}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
