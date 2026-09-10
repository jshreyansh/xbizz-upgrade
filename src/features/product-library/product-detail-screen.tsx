"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Image as ImageIcon,
  FileText,
  ListChecks,
  FolderOpen,
  CheckCircle2,
  Clock,
  Circle,
  Plus,
  Upload,
  Trash2,
  RefreshCw,
  Download,
  Layers,
} from "lucide-react";
import type {
  LibraryProduct,
  ProductDetail,
  ProductVariation,
  ProductImage,
  ProductImageAngle,
  ProductDocument,
  DocumentFileType,
  DossierEntryStatus,
  ClaimStatus,
} from "@/features/product-library/product-library-types";
import { IMAGE_ANGLES } from "@/features/product-library/product-library-types";
import { ProductArtwork, type ArtworkKind } from "@/features/product-library/product-artwork";

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

type Tab = "images" | "dossier" | "claims" | "documents";

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

export function ProductDetailScreen({ product, detail }: { product: LibraryProduct; detail: ProductDetail }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("images");
  const [variations, setVariations] = useState<ProductVariation[]>(detail.variations);
  const [activeVariationId, setActiveVariationId] = useState(detail.variations[0]?.id ?? "");
  const [angleFilter, setAngleFilter] = useState<ProductImageAngle | "All">("All");
  const [documents, setDocuments] = useState<ProductDocument[]>(detail.documents);

  const activeVariation = useMemo(
    () => variations.find((v) => v.id === activeVariationId) ?? variations[0],
    [variations, activeVariationId]
  );

  const visibleImages = useMemo(
    () => (angleFilter === "All" ? activeVariation?.images ?? [] : (activeVariation?.images ?? []).filter((img) => img.angle === angleFilter)),
    [activeVariation, angleFilter]
  );

  const totalImages = variations.reduce((sum, v) => sum + v.images.length, 0);

  const TABS: { key: Tab; label: string; icon: typeof ImageIcon; count: number }[] = [
    { key: "images", label: "Product Images", icon: ImageIcon, count: totalImages },
    { key: "dossier", label: "Dossier", icon: FileText, count: detail.dossiers.length },
    { key: "claims", label: "Claims", icon: ListChecks, count: detail.claims.length },
    { key: "documents", label: "Documents", icon: FolderOpen, count: documents.length },
  ];

  const UPLOADABLE_TYPES: DocumentFileType[] = ["PDF", "DOCX", "PPTX", "XLSX"];

  function handleUploadDocument() {
    const fileType = UPLOADABLE_TYPES[documents.length % UPLOADABLE_TYPES.length];
    const doc: ProductDocument = {
      id: `${product.id}-doc-${Date.now()}`,
      name: `${product.name} — Untitled document`,
      category: "Uncategorized",
      fileType,
      size: "—",
      updated: "Just now",
    };
    setDocuments((prev) => [doc, ...prev]);
  }

  function handleDeleteDocument(id: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  function updateActiveImages(fn: (images: ProductImage[]) => ProductImage[]) {
    setVariations((prev) => prev.map((v) => (v.id === activeVariation?.id ? { ...v, images: fn(v.images) } : v)));
  }

  function handleUpload() {
    if (!activeVariation) return;
    const used = new Set(activeVariation.images.map((img) => img.angle));
    const nextAngle = IMAGE_ANGLES.find((a) => !used.has(a)) ?? "Front";
    const id = `${activeVariation.id}-img-${Date.now()}`;
    updateActiveImages((images) => [...images, { id, label: `${nextAngle} shot`, angle: nextAngle, gradient: product.gradient }]);
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

  function handleAddVariation() {
    const id = `${product.id}-var-custom-${Date.now()}`;
    const label = `New variation ${variations.length + 1}`;
    const newVariation: ProductVariation = { id, label, images: [] };
    setVariations((prev) => [...prev, newVariation]);
    setActiveVariationId(id);
    setAngleFilter("All");
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
        <span
          className="grid size-12 shrink-0 place-items-center rounded-control text-title font-extrabold text-white"
          style={{ background: product.gradient }}
        >
          {product.name.slice(0, 2).toUpperCase()}
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
          <Stat value={product.views} label="Views" />
          <Stat value={documents.length} label="Docs" />
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
              <span className={`rounded-chip px-1.5 py-0.5 text-micro font-extrabold ${active ? "bg-tint text-brand-deep" : "bg-subtle text-ink-4"}`}>
                {t.count}
              </span>
              {active && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-brand" />}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "images" && (
        <div className="space-y-4">
          {/* Variations */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 inline-flex items-center gap-1.5 text-label font-bold uppercase tracking-[.06em] text-ink-4">
              <Layers size={12} /> Variation
            </span>
            {variations.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setActiveVariationId(v.id);
                  setAngleFilter("All");
                }}
                className={`rounded-chip border px-3 py-1.5 text-body font-bold transition-colors ${
                  v.id === activeVariation?.id
                    ? "border-brand bg-tint text-brand-deep"
                    : "border-hair-2 bg-card text-ink-2 hover:border-hair-3"
                }`}
              >
                {v.label}
              </button>
            ))}
            <button
              onClick={handleAddVariation}
              className="inline-flex items-center gap-1 rounded-chip border border-dashed border-hair-2 px-3 py-1.5 text-body font-bold text-ink-4 transition-colors hover:border-brand hover:text-brand-deep"
            >
              <Plus size={13} /> Add variation
            </button>
          </div>

          {/* Angle filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(["All", ...IMAGE_ANGLES] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAngleFilter(a)}
                className={`rounded-chip px-2.5 py-1 text-caption font-bold transition-colors ${
                  angleFilter === a ? "bg-ink text-white" : "bg-subtle text-ink-3 hover:bg-tint-2"
                }`}
              >
                {a === "All" ? "All angles" : a}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {visibleImages.map((img) => (
              <div
                key={img.id}
                className="group overflow-hidden rounded-panel border border-hair bg-card shadow-hair transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
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

                  {/* Hover toolbar — Replace / Delete */}
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                      type="button"
                      title="Replace image"
                      onClick={() => handleReplace(img.id)}
                      className="grid size-7 place-items-center rounded-control text-white backdrop-blur-sm transition-colors hover:bg-black/50"
                      style={{ background: "rgba(0,0,0,.35)" }}
                    >
                      <RefreshCw size={13} />
                    </button>
                    <button
                      type="button"
                      title="Delete image"
                      onClick={() => handleDelete(img.id)}
                      className="grid size-7 place-items-center rounded-control text-white backdrop-blur-sm transition-colors hover:bg-danger"
                      style={{ background: "rgba(0,0,0,.35)" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <span className="block text-body font-bold text-ink">{img.angle}</span>
                  <span className="text-caption text-ink-4">{img.label}</span>
                </div>
              </div>
            ))}

            <button
              onClick={handleUpload}
              className="flex min-h-[178px] flex-col items-center justify-center gap-2 rounded-panel border border-dashed border-hair-2 text-ink-4 transition-colors hover:border-brand hover:text-brand-deep hover:bg-tint-2"
            >
              <Upload size={18} />
              <span className="text-body font-bold">Upload</span>
            </button>
          </div>

          {visibleImages.length === 0 && (
            <p className="py-6 text-center text-body text-ink-4">No {angleFilter.toLowerCase()} shot yet for this variation — upload one above.</p>
          )}
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
                <span className={`rounded-chip px-2.5 py-1 text-caption font-extrabold ${s.bg} ${s.tone}`}>{s.label}</span>
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
                <span className={`mt-0.5 shrink-0 rounded-chip px-2 py-0.5 text-micro font-extrabold uppercase tracking-[.03em] ${s.bg} ${s.tone}`}>
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

      {tab === "documents" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={handleUploadDocument}
              className="inline-flex items-center gap-1.5 rounded-control border border-dashed border-hair-2 px-3 py-1.5 text-body font-bold text-ink-3 transition-colors hover:border-brand hover:text-brand-deep hover:bg-tint-2"
            >
              <Upload size={13} /> Upload document
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {documents.map((doc) => (
              <div key={doc.id} className="group flex items-center gap-3.5 rounded-panel border border-hair bg-card p-3.5 shadow-hair">
                <span className={`grid size-9 shrink-0 place-items-center rounded-control text-caption font-extrabold ${FILE_TONE[doc.fileType] ?? "bg-subtle text-ink-3"}`}>
                  {doc.fileType}
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block text-body-lg font-bold text-ink">{doc.name}</b>
                  <span className="text-caption text-ink-4">
                    {doc.category} · {doc.size} · Updated {doc.updated}
                  </span>
                </div>
                <button className="inline-flex items-center gap-1.5 text-body-lg font-bold text-brand hover:text-brand-deep transition-colors">
                  <Download size={14} /> Download
                </button>
                <button
                  type="button"
                  title="Delete document"
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="grid size-8 shrink-0 place-items-center rounded-control text-ink-4 opacity-0 transition-all group-hover:opacity-100 hover:bg-danger-bg hover:text-danger"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          {documents.length === 0 && (
            <p className="py-10 text-center text-body-lg text-ink-4">No documents yet — upload one above.</p>
          )}
        </div>
      )}
    </div>
  );
}
