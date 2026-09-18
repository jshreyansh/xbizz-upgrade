"use client";

import { FileText, ImageIcon, Plus, Video } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * What this brand already has, from the projects before this one.
 *
 * A document uploaded for last month's film is invisible to this month's:
 * the plan only ever showed what SwishX verified and what you attached to
 * this brief, so the same file gets uploaded again and explained again. The
 * explanation is the expensive part — a note saying what to take from a file
 * is worth more than the file — so a reused asset brings its note with it.
 *
 * Mock data: a plausible history per brand rather than a real asset store.
 * The shape is what matters for the demo — where these appear, how they are
 * labelled, and that picking one carries its note across.
 */
export type WorkspaceAssetKind = "doc" | "image" | "video";
export type WorkspaceAssetRole = "source" | "product" | "reference";

export interface WorkspaceAsset {
  id: string;
  name: string;
  kind: WorkspaceAssetKind;
  role: WorkspaceAssetRole;
  /** What it was for, written the last time somebody used it. */
  note: string;
  /** Where it came from — "Velmora HCP Launch Film · Aug". */
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
    note: "Primary and secondary endpoint tables — the numbers every efficacy claim traces to",
    origin: "{brand} HCP Launch Film · Aug",
    size: "8.1 MB",
  },
  {
    id: "wa-isi",
    name: "{brand}_Approved_ISI_and_Fair_Balance.docx",
    kind: "doc",
    role: "source",
    note: "The safety wording as approved — use verbatim, do not paraphrase",
    origin: "{brand} Patient Explainer · Jul",
    size: "420 KB",
  },
  {
    id: "wa-monograph",
    name: "{brand}_Prescribing_Information.pdf",
    kind: "doc",
    role: "source",
    note: "Label sections for dosing and the prescribing cut-offs",
    origin: "{brand} Field Detail Aid · Jun",
    size: "3.4 MB",
  },
  {
    id: "wa-pack",
    name: "{brand}_200mg_Pack_Front.png",
    kind: "image",
    role: "product",
    note: "Hero packshot — front of pack, cleared artwork",
    origin: "{brand} HCP Launch Film · Aug",
    size: "4.2 MB",
    previewUrl:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "wa-device",
    name: "{brand}_Autoinjector_3Q_View.png",
    kind: "image",
    role: "product",
    note: "Device at three-quarter angle, for the dosing scene",
    origin: "{brand} Field Detail Aid · Jun",
    size: "2.8 MB",
    previewUrl:
      "https://images.unsplash.com/photo-1563213126-a4273aed2016?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "wa-moodfilm",
    name: "{brand}_Brand_Film_2025.mp4",
    kind: "video",
    role: "reference",
    note: "The pacing and the grade we liked — match this, not the script",
    origin: "{brand} Brand Campaign · Mar",
    size: "24 MB",
    previewUrl: "/reel-moa.mp4",
  },
  {
    id: "wa-layout",
    name: "Congress_Poster_Reference.png",
    kind: "image",
    role: "reference",
    note: "How the evidence block was laid out — density we are aiming for",
    origin: "AAD Congress Poster · Feb",
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
    origin: asset.origin.replace(/\{brand\}/g, brand),
  }));
}

const KIND_ICON = { doc: FileText, image: ImageIcon, video: Video } as const;

/**
 * The shelf under a section's own list: what you could pull in, offered
 * quietly enough that the section still reads as what this project uses.
 */
export function WorkspaceAssetShelf({
  assets,
  used,
  onAdd,
  label = "Already in your workspace",
}: {
  assets: WorkspaceAsset[];
  /** Names already in the section, so nothing is offered twice. */
  used: string[];
  onAdd: (asset: WorkspaceAsset) => void;
  label?: string;
}) {
  const offered = assets.filter((asset) => !used.includes(asset.name));
  if (offered.length === 0) return null;

  return (
    <div className="mt-3 border-t border-hair pt-2.5">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-label font-bold uppercase tracking-wider text-ink-3">{label}</span>
        <span className="text-caption text-ink-4">· from earlier projects on this brand</span>
      </div>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {offered.map((asset) => {
          const Icon = KIND_ICON[asset.kind];
          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => onAdd(asset)}
              className={cn(
                "group flex min-w-0 items-center gap-2 rounded-control border border-hair-2 bg-canvas px-2.5 py-1.5 text-left transition",
                "cursor-pointer hover:border-brand hover:bg-tint"
              )}
            >
              <Icon className="size-3.5 shrink-0 text-ink-3 group-hover:text-brand" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body font-semibold text-ink">{asset.name}</span>
                {/* The note it already carries — the reason reusing it is
                    cheaper than uploading it again. */}
                <span className="block truncate text-caption text-ink-3" title={asset.note}>
                  {asset.note}
                </span>
                <span className="block truncate text-micro text-ink-4">{asset.origin}</span>
              </span>
              <span className="grid size-5 shrink-0 place-items-center rounded-full border border-hair-2 bg-card text-ink-3 transition group-hover:border-brand group-hover:text-brand">
                <Plus className="size-3" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
