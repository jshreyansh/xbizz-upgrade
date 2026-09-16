"use client";

import { useRef, useState } from "react";
import {
  Pencil,
  TriangleAlert,
  ShieldCheck,
  Eye,
  Check,
  ChevronDown,
  Plus,
  X,
  FileText,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { DossierPreviewData } from "@/features/workspace/dossier-preview-modal";
import type { PlanResearch } from "@/features/workspace/use-plan-research";
import { groundingDossiers } from "@/features/workspace/grounding-dossiers";

export interface ResearchSourcesSectionProps {
  brandName: string;
  sourceGroundingMode: "both" | "my-sources" | "swishx-only";
  onSetSourceGroundingMode: (mode: "both" | "my-sources" | "swishx-only") => void;
  uploadedDocs: Array<{ name: string; size: string; date: string }>;
  onSetUploadedDocs: React.Dispatch<React.SetStateAction<Array<{ name: string; size: string; date: string }>>>;
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
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const docUploadRef = useRef<HTMLInputElement>(null);
  // null = follow the research; true/false = the reader's own choice.
  // Without the null state the tray snapped shut the instant research
  // finished, throwing away the three dossiers you just watched it assemble.
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
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
  /**
   * A grounding mode you cannot honour is not an option. Offering "Only my
   * sources" with nothing attached invites a choice that produces an ungrounded
   * script, so each mode is enabled only where its material exists — and the
   * option comes back the moment the user uploads something.
   */
  const modeAvailable = {
    "both": hasDossiers && hasUserDocs,
    "my-sources": hasUserDocs,
    "swishx-only": hasDossiers,
  } as const;
  const nothingToGroundIn = !hasDossiers && !hasUserDocs;

  const prebuiltDossiers = groundingDossiers(brandName, molecule);

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
          Three mutually exclusive options that between them fit on one line,
          so they are one row of segments rather than three cards. The cards
          carried a sentence of description each, which is three sentences
          restating three titles that already say it — and about a fifth of
          this accordion's height. An option that cannot be honoured keeps its
          reason in the tooltip, and the empty states below say it in full. */}
      <div className="flex w-full gap-1.5 rounded-control border border-hair-2 bg-canvas p-1">
        {[
          { id: "both" as const, title: "Dossiers + my files", missing: "Needs both an approved dossier and at least one attachment" },
          { id: "my-sources" as const, title: "Only my files", missing: "Attach a file to use this" },
          { id: "swishx-only" as const, title: "Only SwishX dossiers", missing: "No approved dossier exists for this request" },
        ].map((opt) => {
          const isSelected = sourceGroundingMode === opt.id;
          const available = modeAvailable[opt.id];
          return (
            <button
              key={opt.id}
              type="button"
              disabled={!available}
              aria-pressed={isSelected}
              title={available ? undefined : opt.missing}
              onClick={() => onSetSourceGroundingMode(opt.id)}
              className={cn(
                "flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-glyph px-2.5 py-1.5 text-label font-bold transition",
                !available
                  ? "cursor-not-allowed text-ink-4 opacity-55"
                  : isSelected
                  ? "cursor-pointer bg-card text-brand-deep shadow-2xs ring-1 ring-brand/30"
                  : "cursor-pointer text-ink-2 hover:bg-card/70 hover:text-ink"
              )}
            >
              {isSelected && <Check className="size-3 shrink-0 stroke-[3] text-brand" />}
              <span className="truncate">{opt.title}</span>
            </button>
          );
        })}
      </div>

      {/* With nothing found there is nothing to disclose, so the tray becomes
          the one line it would have contained. A collapsible that opens onto
          an empty state is two clicks to learn there is no news. */}
      {!hasDossiers && !researching ? (
        <p className="flex items-center gap-2 rounded-panel border border-hair bg-[#f4f6f3] px-3 py-2 text-label text-ink-3">
          <ShieldCheck className="size-3.5 shrink-0 text-ink-4" />
          <span className="min-w-0">
            No approved {brandName || "brand"} dossier is cleared for this market and audience —
            your own files are the grounding.
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
              Verified dossiers · {brandName || "Brand"}
            </span>
            {/* The count is the point when it is zero: "we looked and there
                are none" is information, where a missing tray reads as a
                section that failed to load. */}
            <span className={cn(
              "shrink-0 rounded-chip border px-2 py-0.2 text-caption font-bold tabular-nums",
              hasDossiers ? "border-hair-2 bg-card text-ink-3" : "border-danger-line bg-danger-bg text-danger"
            )}>
              {hasDossiers ? prebuiltDossiers.length : 0} sourced
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
          {!hasDossiers && (
            <div className="rounded-control border border-dashed border-hair-2 bg-card px-3 py-3 text-center">
              <p className="text-label text-ink-3">
                Nothing in the {brandName || "brand"} library is cleared for this market and
                audience — your own files are the grounding.
              </p>
            </div>
          )}

          <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-2.5", !hasDossiers && "hidden")}>
            {prebuiltDossiers.map((dossier, idx) => (
              researching && idx >= (research?.step ?? 0) ? (
                <div
                  key={idx}
                  aria-hidden
                  className="p-3 rounded-control bg-card border border-hair-2 shadow-2xs flex flex-col gap-2 shimmer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-3.5 w-16 rounded-chip bg-black/8" />
                    <div className="h-3.5 w-14 rounded-chip bg-black/6" />
                  </div>
                  <div className="h-3.5 w-full rounded-chip bg-black/8" />
                  <div className="mt-1 h-6.5 w-full rounded-chip bg-black/5" />
                </div>
              ) : (
              <div
                key={idx}
                className={cn(
                  "p-3 rounded-control bg-card border border-hair-2 flex flex-col justify-between shadow-2xs gap-2",
                  researching && "animate-in fade-in zoom-in-95 duration-300",
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    {/* A document mark, because that is what a dossier is —
                        the market badge says WHICH one, not what kind. */}
                    <span className="flex min-w-0 items-center gap-1.5">
                      <FileText className="size-3.5 shrink-0 text-brand-deep" />
                      <span className="truncate text-caption font-extrabold uppercase tracking-wide text-brand-deep bg-tint px-1.5 py-0.2 rounded-glyph border border-tint-line">
                        {dossier.market}
                      </span>
                    </span>
                    <span className="text-caption font-bold text-ok bg-ok-bg px-1.5 py-0.2 rounded-glyph">
                      {dossier.claims} claims
                    </span>
                  </div>
                  <div className="text-body font-bold text-ink leading-snug line-clamp-1">
                    {dossier.name}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onPreviewDossier(dossier)}
                  className="mt-1 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-chip bg-[#f0f4f1] hover:bg-tint text-brand-deep text-label font-bold border border-hair-2 transition-colors cursor-pointer"
                >
                  <Eye className="size-3.5 text-brand" />
                  <span>View</span>
                </button>
              </div>
              )
            ))}
          </div>
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
            {/* "Add more" rather than "Add more files": attaching a file is
                only one of the two ways to supply what is missing, and the
                other one is editing the prompt this plan was built from. */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setAddMenuOpen((v) => !v)}
                aria-expanded={addMenuOpen}
                aria-haspopup="menu"
                className="inline-flex items-center gap-1.5 text-label font-bold text-brand hover:underline cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Add more</span>
                <ChevronDown className={cn("size-3 transition-transform", addMenuOpen && "rotate-180")} />
              </button>

              {addMenuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setAddMenuOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  <div role="menu" className="absolute right-0 top-full z-50 mt-1.5 w-60 rounded-panel border border-hair-2 bg-card p-1.5 shadow-float">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { setAddMenuOpen(false); docUploadRef.current?.click(); }}
                      className="flex w-full items-center gap-2 rounded-control px-2.5 py-2 text-left text-body font-medium text-ink transition hover:bg-tint hover:text-brand-deep cursor-pointer"
                    >
                      <FileText className="size-3.5 shrink-0 text-brand" />
                      <span>Upload files</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { setAddMenuOpen(false); onEditPrompt(); }}
                      className="flex w-full items-start gap-2 rounded-control px-2.5 py-2 text-left transition hover:bg-tint cursor-pointer group"
                    >
                      <Pencil className="mt-0.5 size-3.5 shrink-0 text-brand" />
                      <span className="min-w-0">
                        <span className="block text-body font-medium text-ink group-hover:text-brand-deep">Edit the prompt</span>
                        <span className="block text-caption leading-snug text-ink-3">Add the context in words instead of a file</span>
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <input
            ref={docUploadRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const newFiles = Array.from(e.target.files).map((f) => ({
                  name: f.name,
                  size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                  date: "Just now",
                }));
                onSetUploadedDocs((prev) => [...prev, ...newFiles]);
              }
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
                    <span className="block truncate font-semibold text-ink">{doc.name}</span>
                    {sourcesUnusable && (
                      <span className="block text-caption font-bold text-danger">No usable clinical content</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-caption text-ink-3">{doc.size}</span>
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
