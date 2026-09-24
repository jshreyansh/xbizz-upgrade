"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ChevronLeft,
  Image as ImageIcon,
  FileText,
  ListChecks,
  Paperclip,
  Upload,
  Undo2,
  Download,
  Eye,
  Layers,
  MoreHorizontal,
} from "lucide-react";
import type {
  LibraryProduct,
  ProductDetail,
  ProductVariation,
  ProductImage,
  ProductImageAngle,
  ProductDocument,
  DocumentFileType,
} from "@/features/product-library/product-library-types";
import { ProductArtwork, type ArtworkKind } from "@/features/product-library/product-artwork";
import { originLabel } from "@/features/product-library/asset-origin";
import { PERSONA } from "@/features/workspace/mock-personas";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import { DetailHeader, type DetailTab } from "@/components/patterns/detail-header";
import { FileNoteDialog, type PendingFile } from "@/features/workspace/file-note-dialog";
import { AttachmentPreviewModal } from "@/features/workspace/chat-attachments";
import { ClaimRow } from "@/features/claims-library/claim-row";
import { DOSSIER_STATUS_STYLE as STATUS_STYLE } from "@/features/product-library/dossier-status";

/** 1.8 MB, 420 KB — the way the seeded attachments already read. */
function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Whoever is signed in — anything uploaded here is theirs. */
const UPLOADER = { name: PERSONA.name, team: "Brand" };

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
  const [documents, setDocuments] = useState<ProductDocument[]>(detail.documents);
  /**
   * Active or archived, on both file shelves.
   *
   * Nothing here is deleted: an attachment is the record of what a brand was
   * grounded in, and an image somebody shot is still the image they shot.
   * Putting one away takes it out of the way without taking it off the
   * record, so both shelves need somewhere to look for what was put away.
   */
  const [docShelf, setDocShelf] = useState<"active" | "archived">("active");
  const [imageShelf, setImageShelf] = useState<"active" | "archived">("active");
  const [openImageMenuId, setOpenImageMenuId] = useState<string | null>(null);
  /** The attachment being read, in the same viewer the studio uses. */
  const [previewDoc, setPreviewDoc] = useState<ProductDocument | null>(null);
  /**
   * Files picked but not yet filed.
   *
   * A file lands here with nothing said about it, and the same dialog the
   * studio uses collects the note — and, for a packshot, which presentation
   * it is of. The library is built out of what people say about what they
   * upload, so asking afterwards means never asking.
   */
  const [pendingImages, setPendingImages] = useState<PendingFile[] | null>(null);
  const [pendingDocs, setPendingDocs] = useState<PendingFile[] | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  /** File sizes, kept from the pick so the row can print one. */
  const pendingSizes = useRef<Record<string, string>>({});

  const activeVariation = useMemo(
    () => variations.find((v) => v.id === activeVariationId) ?? variations[0],
    [variations, activeVariationId]
  );

  /* Every shot for the variant, unfiltered. The angle row underneath the
     variant chips filtered six tiles down to one, which is a control for a
     list this size and a way to hide five of the six things you came to
     look at. The angle is on the tile; that is enough. */
  const allImages = activeVariation?.images ?? [];
  const visibleImages = allImages.filter((img) => !!img.archived === (imageShelf === "archived"));
  const archivedImageCount = allImages.filter((img) => img.archived).length;

  const visibleDocs = documents.filter((doc) => !!doc.archived === (docShelf === "archived"));
  const archivedDocCount = documents.filter((doc) => doc.archived).length;

  /* Header counts and tab badges count what is on the shelf, not what the
     shelf has ever held. Archived is a separate view with its own count. */
  const activeImageTotal = variations.reduce((sum, v) => sum + v.images.filter((i) => !i.archived).length, 0);

  const TABS: DetailTab<Tab>[] = [
    { key: "dossier", label: "Dossier", icon: FileText, count: detail.dossiers.length },
    { key: "claims", label: "Claims", icon: ListChecks, count: detail.claims.length },
    { key: "documents", label: "Team Attachments", icon: Paperclip, count: documents.filter((d) => !d.archived).length },
    { key: "images", label: "Product Images", icon: ImageIcon, count: activeImageTotal },
  ];


  function updateActiveImages(fn: (images: ProductImage[]) => ProductImage[]) {
    setVariations((prev) => prev.map((v) => (v.id === activeVariation?.id ? { ...v, images: fn(v.images) } : v)));
  }

  function handleUpload() {
    imageInputRef.current?.click();
  }

  function pickFiles(event: React.ChangeEvent<HTMLInputElement>, into: "images" | "docs") {
    const picked = Array.from(event.target.files ?? []);
    /* Reset first: picking the same file twice in a row fires no change
       event otherwise, and the second attempt silently does nothing. */
    event.target.value = "";
    if (picked.length === 0) return;
    const files: PendingFile[] = picked.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      name: file.name,
      kind: into === "images" ? "media" : "doc",
      previewUrl: into === "images" ? URL.createObjectURL(file) : undefined,
      mediaKind: into === "images" ? "image" : undefined,
    }));
    files.forEach((f, i) => { pendingSizes.current[f.id] = formatSize(picked[i].size); });
    if (into === "images") setPendingImages(files);
    else setPendingDocs(files);
  }

  function fileTypeOf(name: string): DocumentFileType {
    const ext = name.split(".").pop()?.toUpperCase();
    return ext === "DOCX" || ext === "PPTX" || ext === "XLSX" ? ext : "PDF";
  }

  function confirmImages(notes: Record<string, string>, picked: Record<string, string>) {
    const files = pendingImages ?? [];
    setVariations((prev) =>
      prev.map((variation) => {
        const mine = files.filter((f) => picked[f.id] === variation.label);
        if (mine.length === 0) return variation;
        const added: ProductImage[] = mine.map((file, i) => {
          return {
            id: `${variation.id}-img-${Date.now()}-${i}`,
            name: file.name,
            comment: notes[file.id] ?? "",
            label: file.name,
            gradient: product.gradient,
            addedBy: UPLOADER,
            addedOn: "Just now",
            updatedOn: "Just now",
            imageUrl: file.previewUrl,
          };
        });
        return { ...variation, images: [...variation.images, ...added] };
      })
    );
    setImageShelf("active");
    setPendingImages(null);
  }

  function confirmDocs(notes: Record<string, string>) {
    const files = pendingDocs ?? [];
    setDocuments((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: `${product.id}-doc-${file.id}`,
        name: file.name,
        comment: notes[file.id] ?? "",
        fileType: fileTypeOf(file.name),
        size: pendingSizes.current[file.id] ?? "—",
        addedOn: "Just now",
        addedBy: UPLOADER,
      })),
    ]);
    setDocShelf("active");
    setPendingDocs(null);
  }

  function setImageArchived(imageId: string, archived: boolean) {
    updateActiveImages((images) => images.map((img) => (img.id === imageId ? { ...img, archived } : img)));
  }

  function setDocArchived(docId: string, archived: boolean) {
    setDocuments((prev) => prev.map((doc) => (doc.id === docId ? { ...doc, archived } : doc)));
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

      {/* What this brand is, and the four ways of looking at it — one card,
          because the tabs belong to the brand rather than to the page. */}
      <DetailHeader tabs={TABS} active={tab} onSelect={setTab}>
        <div className="flex flex-wrap items-center gap-4">
          <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-control" style={{ background: product.gradient }}>
            <span
              aria-hidden
              className="pointer-events-none absolute rounded-full"
              style={{ width: "140%", height: "140%", right: "-30%", top: "-30%", background: "radial-gradient(circle,rgba(255,255,255,.3),transparent 70%)" }}
            />
            {product.referenceImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
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
            <Stat value={documents.filter((d) => !d.archived).length} label="Attachments" />
            <Stat value={activeImageTotal} label="Images" />
          </div>
        </div>
      </DetailHeader>

      {/* Tab content */}
      {tab === "images" && (
        <div className="space-y-4" onClick={() => setOpenImageMenuId(null)}>
          {/* Section header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-title font-extrabold tracking-tight text-ink">Product Images</h2>
              <p className="text-body text-ink-3">Every image this brand has, by presentation, with what the person who uploaded it said it was for</p>
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

            <Segmented className="ml-auto">
              <SegmentedButton active={imageShelf === "active"} onClick={() => setImageShelf("active")}>
                Active {allImages.length - archivedImageCount}
              </SegmentedButton>
              <SegmentedButton active={imageShelf === "archived"} onClick={() => setImageShelf("archived")}>
                Archived {archivedImageCount}
              </SegmentedButton>
            </Segmented>
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
                    /* The skew stands in for a camera angle on generated
                       artwork. A real photograph already has one. */
                    style={{ transform: img.angle && !img.imageUrl ? ANGLE_TRANSFORM[img.angle] : undefined }}
                  >
                    {img.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img.imageUrl} alt="" className="h-full w-full object-contain drop-shadow-lg" />
                    ) : (
                      <ProductArtwork kind={artworkFor(img.angle ?? "Front", product.type)} className="h-full w-full" />
                    )}
                  </div>

                  {/* Always-visible overflow menu — Archive / Restore */}
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
                        className="absolute right-0 top-[calc(100%+6px)] z-10 w-40 overflow-hidden rounded-control border border-hair bg-card shadow-float"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setImageArchived(img.id, !img.archived);
                            setOpenImageMenuId(null);
                          }}
                          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-body font-semibold text-ink-2 transition-colors hover:bg-subtle"
                        >
                          {img.archived ? <><Undo2 size={13} /> Restore</> : <><Archive size={13} /> Archive</>}
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
                    {img.angle ? `${img.angle} · ` : ""}{originLabel(img.addedBy)}
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
            <p className="py-6 text-center text-body text-ink-4">No images yet for this variant, upload one above.</p>
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
            <p className="text-body text-ink-3">Every statement approved for use, open one for its sources, the presentations it holds for, and where it has gone out</p>
          </div>

          {detail.claims.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-panel border border-dashed border-hair-2 py-14 text-center">
              <span className="grid size-11 place-items-center rounded-full bg-subtle text-ink-4">
                <ListChecks size={20} />
              </span>
              <p className="text-body-lg font-bold text-ink-2">No claims cited yet</p>
              <p className="max-w-[36ch] text-body text-ink-4">Dossiers for this product haven&rsquo;t started, claims appear here once a dossier cites them.</p>
            </div>
          ) : (
            /* Rows, like the dossiers and the attachments above. A claim is a
               sentence and a way in; a card gave it a picture's worth of room
               and let eighteen of them fill the screen. Same row as the
               Claims Library, without the brand chip — every row here is
               this brand's. */
            <div className="flex flex-col gap-2">
              {detail.claims.map((c) => (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/claims-library/${c.id}`)}
                  onKeyDown={(e) => { if (e.key === "Enter") router.push(`/claims-library/${c.id}`); }}
                  className="group flex cursor-pointer flex-wrap items-center gap-3.5 rounded-panel border border-hair bg-card p-3.5 shadow-hair transition-all hover:border-hair-3 hover:shadow-soft"
                >
                  <ClaimRow claim={c} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "documents" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-title font-extrabold tracking-tight text-ink">Team Attachments</h2>
              <p className="text-body text-ink-3">Prescribing information, decks, and anything else your team grounded this brand in</p>
            </div>
            <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-control border border-hair-2 bg-card px-3 py-1.5 text-body font-bold text-ink-2 transition-colors hover:border-brand hover:bg-tint hover:text-brand-deep"
            >
              <Upload size={14} /> Add attachment
            </button>
            <Segmented>
              <SegmentedButton active={docShelf === "active"} onClick={() => setDocShelf("active")}>
                Active {documents.length - archivedDocCount}
              </SegmentedButton>
              <SegmentedButton active={docShelf === "archived"} onClick={() => setDocShelf("archived")}>
                Archived {archivedDocCount}
              </SegmentedButton>
            </Segmented>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {visibleDocs.map((doc) => (
              <div key={doc.id} className="flex flex-wrap items-center gap-3.5 rounded-panel border border-hair bg-card p-3.5 shadow-hair">
                <span className={`grid size-9 shrink-0 place-items-center rounded-control text-caption font-extrabold ${FILE_TONE[doc.fileType] ?? "bg-subtle text-ink-3"}`}>
                  {doc.fileType}
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-body-lg font-bold text-ink">{doc.name}</b>
                  {doc.comment && (
                    <p className="line-clamp-2 text-caption leading-snug text-ink-3">{doc.comment}</p>
                  )}
                  {/* Added, not updated: an attachment is a record of what
                      was supplied, and who supplied it is half of that. */}
                  <span className="mt-0.5 block text-caption text-ink-4">
                    {doc.size} · Added {doc.addedOn} · {originLabel(doc.addedBy)}
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
                <button
                  type="button"
                  onClick={() => setDocArchived(doc.id, !doc.archived)}
                  title={doc.archived ? "Restore" : "Archive"}
                  aria-label={doc.archived ? `Restore ${doc.name}` : `Archive ${doc.name}`}
                  className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-control text-ink-4 transition-colors hover:bg-subtle hover:text-ink"
                >
                  {doc.archived ? <Undo2 size={14} /> : <Archive size={14} />}
                </button>
              </div>
            ))}
          </div>
          {visibleDocs.length === 0 && (
            <p className="py-10 text-center text-body-lg text-ink-4">
              {docShelf === "archived" ? "Nothing archived." : "No attachments yet. Add one above."}
            </p>
          )}
        </div>
      )}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => pickFiles(e, "images")}
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
        multiple
        hidden
        onChange={(e) => pickFiles(e, "docs")}
      />

      {/* The studio's own dialog. A file is not filed until somebody has
          said what it is for, and a packshot is of a presentation rather
          than of a brand — so both are asked at the moment of upload. */}
      {pendingImages && (
        <FileNoteDialog
          files={pendingImages}
          title={pendingImages.length === 1 ? "Add this image" : `Add ${pendingImages.length} images`}
          prompt="Say what the shot is for and which presentation it is of, so anyone picking it later knows."
          placeholder="e.g. Front-of-pack hero, approved for HCP material"
          variations={variations.map((v) => v.label)}
          onCancel={() => setPendingImages(null)}
          onConfirm={confirmImages}
        />
      )}

      {pendingDocs && (
        <FileNoteDialog
          files={pendingDocs}
          title={pendingDocs.length === 1 ? "Add this attachment" : `Add ${pendingDocs.length} attachments`}
          prompt="Say what the team should use it for. The note sits under the file on the shelf."
          placeholder="e.g. Signed MLR minutes for the launch pack"
          onCancel={() => setPendingDocs(null)}
          onConfirm={confirmDocs}
        />
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
