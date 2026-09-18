"use client";

import { FileText, Pencil, Play, Plus, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

/**
 * What this brand already has, from the projects before this one.
 *
 * A file uploaded for last month's film was invisible to this month's, so the
 * same file got uploaded again and explained again. The note is the expensive
 * part, so a reused asset brings its note with it.
 *
 * Mock history: a plausible set per brand rather than a real asset store.
 */
export type WorkspaceAssetKind = "doc" | "image" | "video";
export type WorkspaceAssetRole = "source" | "product" | "reference";

export interface WorkspaceAsset {
  id: string;
  name: string;
  kind: WorkspaceAssetKind;
  role: WorkspaceAssetRole;
  /** What it was for, from the last time it was used. */
  note: string;
  /** Which project it came from. */
  origin: string;
  size: string;
  previewUrl?: string;
  /** Which presentation of the brand this shows, for product artwork. */
  variation?: string;
}

/**
 * The presentations a brand ships in.
 *
 * Product artwork is never of a brand in the abstract — it is of one pack,
 * one device, one strength. Tagging it at the moment it is added is what
 * makes the library searchable later; tagging it afterwards never happens.
 */
export const BRAND_VARIATIONS = [
  "200mg tablet",
  "50mg tablet",
  "Autoinjector pen",
  "Oral suspension",
];

/**
 * Narrowed to what the project is about.
 *
 * A project scoped to the autoinjector should not be asking which of four
 * presentations a pack shot is of. The scope is chosen once, in Start Project,
 * and does not change afterwards — so this reads it rather than subscribing.
 */
export function brandVariations(brandName: string): string[] {
  void brandName;
  const picked = useWorkspaceStore.getState().variations;
  return picked.length > 0 ? picked : BRAND_VARIATIONS;
}

const LIBRARY: WorkspaceAsset[] = [
  {
    id: "wa-csr",
    name: "{brand}_EMBRACE3_Full_CSR.pdf",
    kind: "doc",
    role: "source",
    note: "Endpoint tables",
    origin: "HCP Launch Film",
    size: "8.1 MB",
  },
  {
    id: "wa-isi",
    name: "{brand}_Approved_ISI.docx",
    kind: "doc",
    role: "source",
    note: "Safety wording, verbatim",
    origin: "Patient Explainer",
    size: "420 KB",
  },
  {
    id: "wa-monograph",
    name: "{brand}_Prescribing_Information.pdf",
    kind: "doc",
    role: "source",
    note: "Dosing and cut-offs",
    origin: "Field Detail Aid",
    size: "3.4 MB",
  },
  {
    id: "wa-pack",
    name: "{brand}_{v0}_Pack_Front.png",
    kind: "image",
    role: "product",
    note: "Hero packshot, front of pack",
    origin: "HCP Launch Film",
    size: "4.2 MB",
    variation: "{v0}",
    previewUrl:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "wa-device",
    name: "{brand}_{v1}_3Q.png",
    kind: "image",
    role: "product",
    note: "Pack at three-quarter angle",
    origin: "Field Detail Aid",
    size: "2.8 MB",
    variation: "{v1}",
    previewUrl:
      "https://images.unsplash.com/photo-1563213126-a4273aed2016?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "wa-moodfilm",
    name: "{brand}_Brand_Film_2025.mp4",
    kind: "video",
    role: "reference",
    note: "Pacing and grade to match",
    origin: "Brand Campaign",
    size: "24 MB",
    previewUrl: "/reel-moa.mp4",
  },
  {
    id: "wa-layout",
    name: "Congress_Poster.png",
    kind: "image",
    role: "reference",
    note: "Evidence block density",
    origin: "AAD Congress Poster",
    size: "1.6 MB",
    previewUrl:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80",
  },
];

/** "10 mg · 10s strip" as a filename would have been written. */
function slug(label: string): string {
  return label.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

/**
 * The brand's history, with its name and its real presentations written into
 * the filenames.
 *
 * The two packshots used to be hard-coded to a 200mg tablet and an
 * autoinjector pen, which is fine until the brand is neither — an oral
 * antihypertensive does not have an autoinjector, and a suggested asset
 * tagged with a variation the project has never heard of cannot be filed.
 */
export function workspaceAssets(brandName: string, role: WorkspaceAssetRole): WorkspaceAsset[] {
  const brand = brandName || "Brand";
  const options = brandVariations(brandName);
  const variationAt = (index: number) => options[index] ?? options[0] ?? "";
  const fill = (text: string, asFilename: boolean) =>
    text
      .replace(/\{brand\}/g, brand)
      .replace(/\{v(\d)\}/g, (_, i) => {
        const label = variationAt(Number(i));
        return asFilename ? slug(label) : label;
      });

  return LIBRARY.filter((asset) => asset.role === role).map((asset) => ({
    ...asset,
    name: fill(asset.name, true),
    variation: asset.variation ? fill(asset.variation, false) : undefined,
  }));
}

/** The corner button that pulls an asset in. */
function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full border border-hair-2 bg-card text-ink-3 shadow-2xs transition group-hover:border-brand group-hover:text-brand"
    >
      <Plus className="size-3.5" />
    </span>
  );
}

/** Where a tile came from: our library, or yours. */
function OriginTag({ source }: { source: "swishx" | "workspace" }) {
  return (
    <span
      className={cn(
        "rounded-glyph border px-1.5 py-0.5 text-micro font-extrabold uppercase tracking-wide",
        source === "swishx"
          ? "border-tint-line bg-tint text-brand-deep"
          : "border-hair-2 bg-subtle text-ink-3"
      )}
    >
      {source === "swishx" ? "From SwishX" : "From Workspace"}
    </span>
  );
}

/**
 * One row of everything available to a section, ours and yours together.
 *
 * These were two stacked panels — verified dossiers, then a shelf of what the
 * workspace already had — which made one question ("what can this be grounded
 * in?") look like two. One strip, tagged by where each tile came from, and it
 * scrolls sideways rather than growing down the accordion.
 */
export function AssetStrip({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-0.5 flex gap-2 overflow-x-auto px-0.5 pb-1">{children}</div>
  );
}

/** A document tile: no picture to show, so the note does the work. */
export function DocAssetTile({
  name,
  note,
  origin,
  source,
  onAdd,
  action,
}: {
  name: string;
  note: string;
  origin?: string;
  source: "swishx" | "workspace";
  onAdd?: () => void;
  /** Used instead of the + when the tile opens something (a dossier). */
  action?: React.ReactNode;
}) {
  return (
    <div className="group flex w-[248px] shrink-0 flex-col gap-1.5 rounded-control border border-hair-2 bg-card p-2.5 shadow-2xs transition hover:border-brand/40">
      <div className="flex items-center justify-between gap-2">
        <OriginTag source={source} />
        {onAdd ? <AddButton onClick={onAdd} label={`Add ${name}`} /> : action}
      </div>
      <div className="flex min-w-0 items-start gap-1.5">
        <FileText className="mt-0.5 size-3.5 shrink-0 text-ink-3" />
        <span className="min-w-0">
          <span className="block truncate text-body font-bold text-ink">{name}</span>
          <span className="block truncate text-caption text-ink-3" title={note}>
            {note}
          </span>
          {origin && <span className="block truncate text-micro text-ink-4">{origin}</span>}
        </span>
      </div>
    </div>
  );
}

/** A media tile: the picture is the point, so it leads. */
export function MediaAssetTile({
  name,
  note,
  origin,
  previewUrl,
  kind,
  source,
  variation,
  onAdd,
}: {
  name: string;
  note: string;
  origin?: string;
  previewUrl?: string;
  kind: WorkspaceAssetKind;
  source?: "swishx" | "workspace";
  /** Which presentation of the brand this is. */
  variation?: string;
  onAdd?: () => void;
}) {
  return (
    <div className="group flex w-[176px] shrink-0 flex-col overflow-hidden rounded-control border border-hair-2 bg-card shadow-2xs transition hover:border-brand/40">
      <div className="relative aspect-video w-full overflow-hidden bg-[#1a2b26]">
        {kind === "video" && previewUrl ? (
          <video
            src={previewUrl}
            muted
            playsInline
            preload="metadata"
            onLoadedData={(e) => {
              if (e.currentTarget.currentTime === 0) e.currentTarget.currentTime = 0.1;
            }}
            className="size-full object-cover"
          />
        ) : previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="size-full object-cover" />
        ) : null}
        {kind === "video" && (
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-7 place-items-center rounded-full bg-white/85 text-black shadow-xs">
              <Play className="ml-0.5 size-3 fill-black" />
            </span>
          </span>
        )}
        {source && (
          <span className="absolute left-1.5 top-1.5">
            <OriginTag source={source} />
          </span>
        )}
        {onAdd && (
          <span className="absolute right-1.5 top-1.5">
            <AddButton onClick={onAdd} label={`Add ${name}`} />
          </span>
        )}
      </div>
      <div className="min-w-0 p-2">
        <span className="block truncate text-body font-bold text-ink">{name}</span>
        {variation && (
          <span className="mt-0.5 inline-flex max-w-full items-center rounded-glyph border border-tint-line bg-tint px-1.5 py-0.5 text-micro font-bold text-brand-deep">
            <span className="truncate">{variation}</span>
          </span>
        )}
        <span className="block truncate text-caption text-ink-3" title={note}>
          {note}
        </span>
        {origin && <span className="block truncate text-micro text-ink-4">{origin}</span>}
      </div>
    </div>
  );
}

/* ── One grid for every kind of attached media ─────────────────────────────
 *
 * Product packshots and creative references are the same interaction wearing
 * two labels: attached media with a preview and a note, a tile to add more,
 * and a strip of what earlier projects used. They were built twice — the
 * references list came out as rows of filenames with a dashed upload block
 * three times the height of a thumbnail — so this is the one definition.
 */

export interface AttachedMedia {
  id: string;
  name: string;
  note?: string;
  previewUrl?: string;
  kind: "image" | "video";
  /** "4.2 MB", shown under the name when known. */
  size?: string;
  /** Which presentation of the brand this is, for product artwork. */
  variation?: string;
}

export function MediaAttachmentGrid({
  items,
  onUpload,
  uploadLabel,
  uploadHint = "PNG, JPG, MP4",
  onRemove,
  onEditNote,
}: {
  items: AttachedMedia[];
  onUpload: () => void;
  uploadLabel: string;
  uploadHint?: string;
  onRemove: (id: string) => void;
  onEditNote?: (item: AttachedMedia) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative flex flex-col overflow-hidden rounded-control border border-hair bg-card shadow-2xs transition-all hover:shadow-xs"
        >
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-[#1a2b26]">
            {item.kind === "video" && item.previewUrl ? (
              <video
                src={item.previewUrl}
                muted
                playsInline
                preload="metadata"
                onLoadedData={(e) => {
                  if (e.currentTarget.currentTime === 0) e.currentTarget.currentTime = 0.1;
                }}
                className="size-full object-cover"
              />
            ) : item.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.previewUrl}
                alt={item.name}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : null}
            {item.kind === "video" && (
              <span className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="grid size-8 place-items-center rounded-full bg-white/85 text-black shadow-md">
                  <Play className="ml-0.5 size-3.5 fill-black" />
                </span>
              </span>
            )}
            <span className="absolute bottom-2 left-2 rounded-glyph bg-black/60 px-1.5 py-0.5 text-micro font-bold uppercase text-white backdrop-blur-xs">
              {item.kind}
            </span>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              title={`Remove ${item.name}`}
              aria-label={`Remove ${item.name}`}
              className="absolute right-2 top-2 grid size-6 cursor-pointer place-items-center rounded-full bg-black/60 text-white backdrop-blur-xs transition hover:bg-danger"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="min-w-0 p-2.5">
            <span className="block truncate text-body font-bold text-ink">{item.name}</span>
            {item.variation && (
              <span className="mt-0.5 inline-flex max-w-full items-center rounded-glyph border border-tint-line bg-tint px-1.5 py-0.5 text-micro font-bold text-brand-deep">
                <span className="truncate">{item.variation}</span>
              </span>
            )}
            {item.note && (
              <span className="mt-0.5 flex items-start gap-1 text-caption text-ink-3">
                <span className="line-clamp-2 min-w-0 flex-1" title={item.note}>
                  {item.note}
                </span>
                {onEditNote && (
                  <button
                    type="button"
                    onClick={() => onEditNote(item)}
                    aria-label={`Edit note on ${item.name}`}
                    title="Edit note"
                    className="grid size-4 shrink-0 cursor-pointer place-items-center rounded-full text-ink-3 transition hover:bg-black/5 hover:text-brand"
                  >
                    <Pencil className="size-2.5" />
                  </button>
                )}
              </span>
            )}
            {item.size && (
              <span className="mt-0.5 block text-caption font-medium text-ink-4">{item.size}</span>
            )}
          </div>
        </div>
      ))}

      {/* The uploader is a tile in the same grid, so adding one more is the
          same size as the ones already there. */}
      <button
        type="button"
        onClick={onUpload}
        className="flex min-h-[110px] cursor-pointer flex-col items-center justify-center gap-2 rounded-control border-2 border-dashed border-brand/20 bg-card p-4 text-center transition hover:border-brand hover:bg-tint"
      >
        <span className="grid size-8 place-items-center rounded-full bg-tint text-brand">
          <Plus className="size-4" />
        </span>
        <span>
          <span className="block text-body font-bold text-brand">{uploadLabel}</span>
          <span className="mt-0.5 block text-caption text-ink-3">{uploadHint}</span>
        </span>
      </button>
    </div>
  );
}
