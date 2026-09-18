"use client";

import { FileText, Plus, Play } from "lucide-react";
import { cn } from "@/lib/cn";

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
    name: "{brand}_200mg_Pack_Front.png",
    kind: "image",
    role: "product",
    note: "Hero packshot, front of pack",
    origin: "HCP Launch Film",
    size: "4.2 MB",
    previewUrl:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "wa-device",
    name: "{brand}_Autoinjector_3Q.png",
    kind: "image",
    role: "product",
    note: "Device at three-quarter angle",
    origin: "Field Detail Aid",
    size: "2.8 MB",
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

/** The brand's history, with its name written into the filenames. */
export function workspaceAssets(brandName: string, role: WorkspaceAssetRole): WorkspaceAsset[] {
  const brand = brandName || "Brand";
  return LIBRARY.filter((asset) => asset.role === role).map((asset) => ({
    ...asset,
    name: asset.name.replace(/\{brand\}/g, brand),
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
      {source === "swishx" ? "SwishX" : "Workspace"}
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
  onAdd,
}: {
  name: string;
  note: string;
  origin?: string;
  previewUrl?: string;
  kind: WorkspaceAssetKind;
  source?: "swishx" | "workspace";
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
        <span className="block truncate text-caption text-ink-3" title={note}>
          {note}
        </span>
        {origin && <span className="block truncate text-micro text-ink-4">{origin}</span>}
      </div>
    </div>
  );
}
