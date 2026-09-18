"use client";

import { useRef, useState } from "react";
import {
  Pencil,
  TriangleAlert,
  ShieldCheck,
  Eye,
  ChevronDown,
  Plus,
  X,
  FileText,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { FileNoteDialog, type PendingFile } from "@/features/workspace/file-note-dialog";

/**
 * An attached file and what it is for.
 *
 * The note is not decoration: a PDF called Q3_readout could be the evidence,
 * the wording or the layout, and the three produce different assets. It is
 * collected when the file is attached.
 */
export interface UploadedDoc {
  name: string;
  size: string;
  date: string;
  note?: string;
  /**
   * Whether this arrived with the brief or was pulled in from an earlier
   * project. Both are grounding, but one has been used before and the other
   * has not, and that is worth a glance rather than a memory.
   */
  origin?: "new" | "previous";
}
import type { DossierPreviewData } from "@/features/workspace/dossier-preview-modal";
import type { PlanResearch } from "@/features/workspace/use-plan-research";
import { groundingDossiers } from "@/features/workspace/grounding-dossiers";
import { AssetStrip, DocAssetTile, workspaceAssets, type WorkspaceAsset } from "@/features/workspace/workspace-assets";

/**
 * A shelf document, opened.
 *
 * Taking a file into the grounding from its filename and a six-word note is
 * a guess. The dossier reader already knows how to show a document and what
 * was cited from it, so the shelf opens into that rather than into a viewer
 * of its own. Mocked contents for now — the real ones come from the asset
 * store.
 */
function workspaceDocPreview(asset: WorkspaceAsset, molecule: string): DossierPreviewData {
  const extension = asset.name.split(".").pop()?.toUpperCase();
  return {
    name: asset.name,
    molecule,
    market: `Workspace · ${asset.origin}`,
    sections: 6,
    claims: 24,
    indication: asset.note,
    documents: [{ name: asset.name, citations: 24, type: extension ? `${extension} document` : undefined }],
    keyClaims: [
      {
        category: "Efficacy & Primary Endpoints",
        claim: "Primary endpoint met at Week 16, with the responder rate and confidence interval stated as approved.",
        citation: `${asset.name} · §4.1 Indications`,
      },
      {
        category: "Safety & Tolerability",
        claim: "Adverse events at or above 2% incidence, reported verbatim from the approved safety wording.",
        citation: `${asset.name} · §4.8 Undesirable effects`,
      },
      {
        category: "Dosing & Administration",
        claim: "Once-daily oral administration, with the titration schedule and missed-dose guidance as written.",
        citation: `${asset.name} · §4.2 Posology`,
      },
    ],
  };
}

export interface ResearchSourcesSectionProps {
  brandName: string;
  sourceGroundingMode: "both" | "my-sources" | "swishx-only";
  onSetSourceGroundingMode: (mode: "both" | "my-sources" | "swishx-only") => void;
  uploadedDocs: UploadedDoc[];
  onSetUploadedDocs: React.Dispatch<React.SetStateAction<UploadedDoc[]>>;
  onPreviewDossier: (dossier: DossierPreviewData) => void;
  onContinue: () => void;
  /** Live grounding research, if the plan has just been generated. */
  research?: PlanResearch;
  /** Whether SwishX has approved dossiers for this case at all. */
  hasDossiers: boolean;
  /** Set when the attached files were checked and held nothing usable. */
  sourcesUnusable?: boolean;
  /** Open the prompt for editing — the other way to supply missing context. */
  onEditPrompt: () => void;
  /** Markets whose approved labels are both selected, if that has happened. */
  conflictingMarkets?: string[];
  /** Keep one market's label and drop the others. */
  onResolveConflict?: (market: string) => void;
}

export function ResearchSourcesContent({
  brandName,
  sourceGroundingMode,
  onSetSourceGroundingMode,
  uploadedDocs,
  onSetUploadedDocs,
  onPreviewDossier,
  onContinue,
  research,
  hasDossiers,
  sourcesUnusable = false,
  onEditPrompt,
  conflictingMarkets = [],
  onResolveConflict,
}: ResearchSourcesSectionProps) {
  /* Files picked but not yet attached — they are waiting on their note. */
  const [pending, setPending] = useState<Array<PendingFile & { size: string }>>([]);
  const [editing, setEditing] = useState<{ index: number; doc: UploadedDoc } | null>(null);
  const docUploadRef = useRef<HTMLInputElement>(null);
  // null = follow the research; true/false = the reader's own choice.
  // Without the null state the tray snapped shut the instant research
  // finished, throwing away the three dossiers you just watched it assemble.
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  /** Shelf items counted into the grounding. They stay on the shelf. */
  const [considered, setConsidered] = useState<string[]>([]);
  const researching = Boolean(research?.researching);
  // The research plays INSIDE this tray, so it is held open for the duration
  // and cannot be collapsed out from under itself.
  const trayOpen = researching || (userOpen ?? Boolean(research?.completed));

  const molecule =
    brandName === "Onkavia"
      ? "relunocitinib"
      : brandName === "PulmoVax"
      ? "albuterol / budesonide"
      : brandName === "Nirvexa"
      ? "brentaxaban"
      : brandName === "Cardioxa"
      ? "levomilnacipran ER"
      : "tirzelamide";

  const hasUserDocs = uploadedDocs.length > 0;

  const prebuiltDossiers = groundingDossiers(brandName, molecule);
  /* What earlier projects on this brand used, minus whatever is already in
     My files — nothing is offered twice. */
  const reusableDocs = workspaceAssets(brandName, "source").filter(
    (asset) => !uploadedDocs.some((doc) => doc.name === asset.name)
  );
  /**
   * Suggested is not only our dossiers. A brand with no cleared dossier for
   * this audience can still have three of its own approved documents on the
   * shelf, and greying out both suggested options in that case said there was
   * nothing to ground in while the material sat on screen.
   */
  const hasSuggested = hasDossiers || reusableDocs.length > 0;

  /**
   * A grounding mode you cannot honour is not an option. Offering "Only My
   * Files" with nothing attached invites a choice that produces an ungrounded
   * script, so each mode is enabled only where its material exists — and the
   * option comes back the moment the user uploads something.
   */
  const modeAvailable = {
    "both": hasSuggested && hasUserDocs,
    "my-sources": hasUserDocs,
    "swishx-only": hasSuggested,
  } as const;
  const nothingToGroundIn = !hasSuggested && !hasUserDocs;

  return (
    <div className="space-y-3">
      {nothingToGroundIn && (
        /* Stated plainly and at the top: there is no combination of these
           controls that produces a grounded script, so the user needs to
           supply something rather than keep choosing. */
        <div className="rounded-panel border border-danger-line bg-danger-bg p-3.5">
          <div className="flex items-start gap-2.5">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-danger" />
            <div className="min-w-0">
              <p className="text-body font-extrabold text-danger">Nothing to ground this in</p>
              <p className="mt-0.5 text-label leading-snug text-ink-2">
                There is no approved {brandName || "brand"} dossier for this request and no files
                attached. Add a file, or add the missing context to your prompt, before a script
                can be written.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <Button size="sm" variant="primary" onClick={() => docUploadRef.current?.click()} className="text-label font-bold cursor-pointer">
                  <Plus className="size-3.5" /> Attach files
                </Button>
                <Button size="sm" variant="secondary" onClick={onEditPrompt} className="text-label font-bold cursor-pointer">
                  Edit the prompt
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sourcesUnusable && !nothingToGroundIn && (
        /* The files are present but were checked and hold nothing usable. */
        <div className="rounded-panel border border-danger-line bg-danger-bg p-3.5">
          <div className="flex items-start gap-2.5">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-danger" />
            <div className="min-w-0">
              <p className="text-body font-extrabold text-danger">These sources cannot ground a script</p>
              <p className="mt-0.5 text-label leading-snug text-ink-2">
                We read every attached file and found no clinical content to build claims from.
                Replace them, or add the context to your prompt.
              </p>
            </div>
          </div>
        </div>
      )}

      {conflictingMarkets.length > 1 && onResolveConflict && (
        /* Two markets' approved labels are both selected. Which one governs is
           a regulatory answer, not an editorial one, so the plan must not pick
           — but it must offer the choice, or the plan is blocked with no way
           forward. Choosing keeps that market's label and drops the others,
           which removes the ambiguity rather than merely acknowledging it. */
        <div className="rounded-panel border border-warn-line bg-warn-bg p-3.5">
          <div className="flex items-start gap-2.5">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warn" />
            <div className="min-w-0 flex-1">
              <p className="text-body font-extrabold text-warn">
                Two markets&apos; labels are selected
              </p>
              <p className="mt-0.5 text-label leading-snug text-ink-2">
                {conflictingMarkets.join(" and ")} approved sources are both attached. One label has
                to govern this asset — choose which, and the others are removed.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {conflictingMarkets.map((market) => (
                  <Button
                    key={market}
                    size="sm"
                    variant="secondary"
                    onClick={() => onResolveConflict(market)}
                    className="text-label font-bold cursor-pointer"
                  >
                    Use the {market} label
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Where the claims come from.
          It was a segmented bar, which is a control for switching views, not
          for answering a question — and the question itself was never asked,
          so three titles sat there with nothing saying what they were an
          answer to. A question and three radio chips: one line, one choice,
          and the shape of the control says only one can be true. An option
          that cannot be honoured keeps its reason in the tooltip, and the
          empty states below say it in full. */}
      <div className="space-y-2">
        <span className="block text-label font-bold text-ink-2">Ground the claims in:</span>
        <div role="radiogroup" aria-label="Ground the claims in" className="flex flex-wrap gap-1.5">
          {[
            { id: "both" as const, title: "Suggested + My Files", missing: "Needs both an approved dossier and at least one attachment" },
            { id: "my-sources" as const, title: "Only My Files", missing: "Attach a file to use this" },
            { id: "swishx-only" as const, title: "Only From Suggested", missing: "No approved dossier exists for this request" },
          ].map((opt) => {
            const isSelected = sourceGroundingMode === opt.id;
            const available = modeAvailable[opt.id];
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={!available}
                title={available ? undefined : opt.missing}
                onClick={() => onSetSourceGroundingMode(opt.id)}
                className={cn(
                  "flex items-center gap-2 rounded-chip border px-3 py-1.5 text-label font-semibold transition-all",
                  !available
                    ? "cursor-not-allowed border-hair-2 bg-canvas text-ink-4 opacity-55"
                    : isSelected
                    ? "cursor-pointer border-brand bg-tint font-bold text-brand-deep shadow-2xs"
                    : "cursor-pointer border-hair-2 bg-card text-ink-2 hover:border-hair-3 hover:bg-subtle"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid size-3.5 shrink-0 place-items-center rounded-full border transition-colors",
                    isSelected ? "border-brand bg-brand" : "border-hair-3 bg-card"
                  )}
                >
                  {isSelected && <span className="size-1.5 rounded-full bg-card" />}
                </span>
                <span>{opt.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* With nothing at all to offer there is nothing to disclose, so the
          tray becomes the one line it would have contained. A collapsible
          that opens onto an empty state is two clicks to learn there is no
          news. The workspace's own files count as something to offer: no
          cleared dossier does not mean no material. */}
      {!hasDossiers && reusableDocs.length === 0 && !researching ? (
        <p className="flex items-center gap-2 rounded-panel border border-hair bg-[#f4f6f3] px-3 py-2 text-label text-ink-3">
          <ShieldCheck className="size-3.5 shrink-0 text-ink-4" />
          <span className="min-w-0">
            No cleared {brandName || "brand"} dossier for this audience. Your own files are the
            grounding.
          </span>
        </p>
      ) : (

      /* Verified dossiers. Reference material, not a decision, so it sits
         BELOW the choice and starts collapsed — except while the grounding
         research runs, which plays out inside it. */
      <div className="rounded-panel bg-[#f4f6f3] border border-hair">
        <button
          type="button"
          onClick={() => { if (!researching) setUserOpen(!trayOpen); }}
          aria-expanded={trayOpen}
          aria-busy={researching || undefined}
          className={cn(
            "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left",
            researching ? "cursor-default" : "cursor-pointer",
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck className="size-3.5 shrink-0 text-ok" />
            <span className="truncate text-body font-extrabold text-ink">
              Suggested from platform
            </span>
            {/* The count is the point when it is zero: "we looked and there
                are none" is information, where a missing tray reads as a
                section that failed to load. */}
            <span className={cn(
              "shrink-0 rounded-chip border px-2 py-0.2 text-caption font-bold tabular-nums",
              hasDossiers ? "border-hair-2 bg-card text-ink-3" : "border-danger-line bg-danger-bg text-danger"
            )}>
              {(hasDossiers ? prebuiltDossiers.length : 0) + reusableDocs.length} suggested
            </span>
            {researching && (
              <span className="shrink-0 rounded-chip border border-brand/20 bg-tint px-2 py-0.2 text-caption font-bold text-brand">
                Researching
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {researching && (
              <span className="text-label tabular-nums text-ink-3">{research?.progress ?? 0}%</span>
            )}
            {!researching && (
              <ChevronDown className={cn("size-4 text-ink-3 transition-transform duration-200", trayOpen && "rotate-180")} />
            )}
          </div>
        </button>

        {trayOpen && (
          <div className="px-3 pb-3 animate-in fade-in duration-150">
          {researching && (
            <div className="mb-3 space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="size-3.5 shrink-0 animate-spin text-brand" />
                <span className="text-label font-semibold text-ink-2">{research?.label}</span>
                <span className="ml-auto shrink-0 text-label text-ink-3 tabular-nums">
                  Step {research?.current} of {research?.total}
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-black/8">
                <div
                  className="h-full rounded-full bg-brand transition-[width] duration-150 ease-linear"
                  style={{ width: `${research?.progress ?? 0}%` }}
                />
              </div>
            </div>
          )}
          {/* Why there is no SwishX tile in the strip — one quiet line, not a
              dashed full-width panel with centred text. With a dossier present
              the tray reads fine; without one, that panel was a band of empty
              card sitting on top of the tiles that are actually on offer. */}
          {!hasDossiers && !researching && (
            <p className="mb-2 flex items-center gap-1.5 text-caption text-ink-4">
              <ShieldCheck className="size-3 shrink-0" />
              <span className="min-w-0">
                No cleared {brandName || "brand"} dossier for this audience.
              </span>
            </p>
          )}

          {/* Ours and yours in one strip, tagged by where each came from.
              These were two stacked panels, which made one question — what can
              this be grounded in — look like two. It scrolls sideways rather
              than growing down the accordion. */}
          <AssetStrip>
            {researching
              ? prebuiltDossiers.map((_, idx) => (
                  <div
                    key={idx}
                    aria-hidden
                    className="shimmer flex w-[248px] shrink-0 flex-col gap-2 rounded-control border border-hair-2 bg-card p-2.5 shadow-2xs"
                  >
                    <div className="h-3.5 w-16 rounded-chip bg-black/8" />
                    <div className="h-3.5 w-full rounded-chip bg-black/8" />
                    <div className="h-3.5 w-2/3 rounded-chip bg-black/6" />
                  </div>
                ))
              : (
                <>
                  {hasDossiers &&
                    prebuiltDossiers.map((dossier, idx) => (
                      <DocAssetTile
                        key={`sx-${idx}`}
                        source="swishx"
                        name={dossier.name}
                        note={`${dossier.claims} approved claims`}
                        action={
                          <button
                            type="button"
                            onClick={() => onPreviewDossier(dossier)}
                            className="focus-ring flex cursor-pointer items-center gap-1 rounded-chip border border-hair-2 bg-canvas px-2 py-0.5 text-label font-bold text-brand-deep transition hover:border-brand"
                          >
                            <Eye className="size-3" />
                            View
                          </button>
                        }
                      />
                    ))}
                  {reusableDocs.map((asset) => (
                    <DocAssetTile
                      key={asset.id}
                      source="workspace"
                      name={asset.name}
                      note={asset.note}
                      origin={asset.origin}
                      added={considered.includes(asset.id)}
                      onAdd={() =>
                        setConsidered((prev) =>
                          prev.includes(asset.id)
                            ? prev.filter((id) => id !== asset.id)
                            : [...prev, asset.id]
                        )
                      }
                      onPreview={() => onPreviewDossier(workspaceDocPreview(asset, molecule))}
                    />
                  ))}
                </>
              )}
          </AssetStrip>
          </div>
        )}
      </div>
      )}

      {/* Uploaded Documents Context */}
      {(sourceGroundingMode === "both" || sourceGroundingMode === "my-sources" || nothingToGroundIn || sourcesUnusable) && (
        <div className="space-y-1.5 border-t border-hair pt-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-label font-bold uppercase tracking-wider text-ink-3">
              My files ({uploadedDocs.length})
            </span>
            {/* One button, one action. This was a two-item menu whose second
                item — editing the prompt — is the remedy for having no file at
                all, and it is offered where that is actually the problem: in
                the blocked states above. A menu between you and a file picker
                is a click spent on a choice you had already made. */}
            <button
              type="button"
              onClick={() => docUploadRef.current?.click()}
              className="inline-flex cursor-pointer items-center gap-1.5 text-label font-bold text-brand hover:underline"
            >
              <Plus className="size-3.5" />
              <span>Add more</span>
            </button>
          </div>

          <input
            ref={docUploadRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                /* Held, not attached. What the file is for is asked before it
                   joins the list, because a file in the list is a file the
                   plan claims to have understood. */
                setPending(
                  Array.from(e.target.files).map((f, i) => ({
                    id: `pending-${Date.now()}-${i}`,
                    name: f.name,
                    kind: "doc" as const,
                    size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                  }))
                );
              }
              e.target.value = "";
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {uploadedDocs.map((doc, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-control border px-2.5 py-1.5 text-body",
                  // The file that failed verification is marked where the file
                  // is, not only in a banner above it.
                  sourcesUnusable ? "border-danger-line bg-danger-bg" : "bg-card border-hair-2"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className={cn("size-3.5 shrink-0", sourcesUnusable ? "text-danger" : "text-brand")} />
                  <span className="min-w-0">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate font-semibold text-ink">{doc.name}</span>
                      {/* Where it came from, so a reused file is not mistaken
                          for one you attached today. */}
                      <span
                        className={cn(
                          "shrink-0 rounded-glyph border px-1.5 py-0.5 text-micro font-extrabold uppercase tracking-wide",
                          doc.origin === "previous"
                            ? "border-hair-2 bg-subtle text-ink-3"
                            : "border-tint-line bg-tint text-brand-deep"
                        )}
                      >
                        {doc.origin === "previous" ? "Added previously" : "New"}
                      </span>
                    </span>
                    {/* What you said the file is for, where the file is. */}
                    {doc.note && (
                      <span className="block truncate text-caption text-ink-3" title={doc.note}>
                        {doc.note}
                      </span>
                    )}
                    {sourcesUnusable && (
                      <span className="block text-caption font-bold text-danger">No usable clinical content</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-caption text-ink-3">{doc.size}</span>
                  {/* Changing a sentence should not mean losing the file and
                      finding it on disk again. */}
                  <button
                    type="button"
                    onClick={() => setEditing({ index: idx, doc })}
                    className="grid size-5 place-items-center rounded-full text-ink-3 transition-colors hover:bg-black/5 hover:text-brand cursor-pointer"
                    aria-label={`Edit note on ${doc.name}`}
                    title="Edit note"
                  >
                    <Pencil className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetUploadedDocs((prev) => prev.filter((_, i) => i !== idx))}
                    className="grid size-5 place-items-center rounded-full text-ink-3 hover:bg-black/5 hover:text-danger transition-colors cursor-pointer"
                    aria-label="Remove"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {pending.length > 0 && (
        <FileNoteDialog
          files={pending}
          title={pending.length === 1 ? "What is this file for?" : "What are these files for?"}
          prompt="A note travels with each file, so the plan grounds it in the right thing rather than guessing."
          placeholder="e.g. the Week 16 efficacy table — use these numbers, not the ones in the brief"
          onCancel={() => setPending([])}
          onConfirm={(notes) => {
            onSetUploadedDocs((prev) => [
              ...prev,
              ...pending.map((f) => ({
                name: f.name,
                size: f.size,
                date: "Just now",
                note: notes[f.id].trim(),
                origin: "new" as const,
              })),
            ]);
            setPending([]);
          }}
        />
      )}

      {editing && (
        <FileNoteDialog
          files={[{ id: "edit", name: editing.doc.name, kind: "doc", note: editing.doc.note ?? "" }]}
          title="What is this file for?"
          prompt="The note travels with the file wherever the plan uses it."
          placeholder="e.g. the Week 16 efficacy table — use these numbers, not the ones in the brief"
          onCancel={() => setEditing(null)}
          onConfirm={(notes) => {
            const next = notes.edit.trim();
            onSetUploadedDocs((prev) =>
              prev.map((doc, i) => (i === editing.index ? { ...doc, note: next } : doc))
            );
            setEditing(null);
          }}
        />
      )}

      {/* Continue action */}
      <div className="flex justify-end pt-0.5">
        <Button
          size="sm"
          variant="secondary"
          onClick={onContinue}
          className="text-body font-bold gap-1 cursor-pointer"
        >
          <span>Save &amp; Continue</span>
          <ArrowRight className="size-3" />
        </Button>
      </div>
    </div>
  );
}
