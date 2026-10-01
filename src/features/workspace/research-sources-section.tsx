"use client";

import { useRef, useState } from "react";
import {
  Eye,
  Pencil,
  ShieldCheck,
  TriangleAlert,
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
import { AttachmentPreviewModal } from "@/features/workspace/chat-attachments";

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
import type { PlanResearch } from "@/features/workspace/use-plan-research";
import { groundingDossiers } from "@/features/workspace/grounding-dossiers";
import {
  AddToProjectButton,
  AssetStrip,
  DocAssetTile,
  TileButton,
  workspaceAssets,
  type WorkspaceAsset,
} from "@/features/workspace/workspace-assets";
import { LogoMark } from "@/components/ui/logo-mark";

export interface ResearchSourcesSectionProps {
  brandName: string;
  uploadedDocs: UploadedDoc[];
  onSetUploadedDocs: React.Dispatch<React.SetStateAction<UploadedDoc[]>>;
  /** Open the approved dossier itself. The reader lives with the parent. */
  onPreviewDossier: () => void;
  onContinue: () => void;
  /** Live grounding research, if the plan has just been generated. */
  research?: PlanResearch;
  /** Set when the attached files were checked and held nothing usable. */
  sourcesUnusable?: boolean;
  /** Markets whose approved labels are both selected, if that has happened. */
  conflictingMarkets?: string[];
  /** Keep one market's label and drop the others. */
  onResolveConflict?: (market: string) => void;
  /** Confirm what was taken in, since the strip does not move. */
  onToast?: (message: string, tone?: "done" | "undone") => void;
  /**
   * Whether the verified dossier is in the grounding. Held by the screen, so
   * the section's summary can say so. It starts out: the dossier is a
   * suggestion like the rest of the strip, and the user is the one who adds
   * it.
   */
  dossierInUse: boolean;
  onDossierInUseChange: (inUse: boolean) => void;
}

/** The Research and Sources summary line: only what has actually been added. */
export function researchSummary(brandName: string, dossierInUse: boolean, fileCount: number) {
  const files = `${fileCount} custom ${fileCount === 1 ? "file" : "files"}`;
  if (dossierInUse) return `${brandName} Approved Dossier + ${files} active`;
  return fileCount > 0 ? `${files} active · approved dossier not added` : "No sources added yet";
}

export function ResearchSourcesContent({
  brandName,
  uploadedDocs,
  onSetUploadedDocs,
  onPreviewDossier,
  onContinue,
  research,
  sourcesUnusable = false,
  conflictingMarkets = [],
  onResolveConflict,
  onToast,
  dossierInUse,
  onDossierInUseChange,
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
  /* A workspace file opens as a file — the browser's own viewer for a PDF,
     the picture for an image. It is the user's own document, not a dossier,
     and dressing it as one said it had sections and approved claims that
     nobody had written. */
  const [previewFile, setPreviewFile] = useState<WorkspaceAsset | null>(null);
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

  const prebuiltDossiers = groundingDossiers(brandName, molecule);
  /* What earlier projects on this brand used, minus whatever is already in
     My files — nothing is offered twice. */
  const reusableDocs = workspaceAssets(brandName, "source").filter(
    (asset) => !uploadedDocs.some((doc) => doc.name === asset.name)
  );

  return (
    <div className="space-y-3">
      {sourcesUnusable && (
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
                to govern this asset, choose which, and the others are removed.
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

      {/* What the platform has for this brand — our approved dossier and the
          brand's own documents from earlier projects — offered first, because
          it is the material you did not have to supply. There is no mode to
          choose any more: you take what you want from here, and My files
          below holds what you add yourself. */}
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
            <LogoMark size={14} className="shrink-0 text-brand" title="" />
            <span className="truncate text-body font-extrabold text-ink">
              Suggested from platform
            </span>
            {/* The count is the point when it is zero: "we looked and there
                are none" is information, where a missing tray reads as a
                section that failed to load. */}
            <span className="shrink-0 rounded-chip border border-hair-2 bg-card px-2 py-0.2 text-caption font-bold tabular-nums text-ink-3">
              {prebuiltDossiers.length + reusableDocs.length} suggested
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
          {/* Ours and yours in one strip, tagged by where each came from.
              The verified dossier was a full-width card above this tray,
              which made one question — what can this be grounded in — look
              like two lists of suggestions. It leads the strip instead, set
              apart by its mark and its verified state rather than by a
              component of its own. It scrolls sideways rather than growing
              down the accordion. */}
          <AssetStrip>
            {prebuiltDossiers.map((dossier) => (
              <DossierTile
                key={dossier.name}
                name={dossier.name}
                claims={dossier.claims}
                sections={dossier.sections}
                inUse={dossierInUse}
                onPreview={onPreviewDossier}
                onToggle={() => {
                  onDossierInUseChange(!dossierInUse);
                  onToast?.(
                    dossierInUse
                      ? `${dossier.name} removed from the project context`
                      : `${dossier.name} added to the project context for generation`,
                    dossierInUse ? "undone" : "done"
                  );
                }}
              />
            ))}
            {researching
              ? [0, 1].map((idx) => (
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
                  {reusableDocs.map((asset) => (
                    <DocAssetTile
                      key={asset.id}
                      source="workspace"
                      name={asset.name}
                      note={asset.note}
                      origin={asset.origin}
                      added={considered.includes(asset.id)}
                      onAdd={() => {
                        const taken = considered.includes(asset.id);
                        setConsidered((prev) =>
                          taken ? prev.filter((id) => id !== asset.id) : [...prev, asset.id]
                        );
                        onToast?.(
                          taken
                            ? `${asset.name} removed from the project context`
                            : `${asset.name} added to the project context for generation`,
                          taken ? "undone" : "done"
                        );
                      }}
                      onPreview={() => setPreviewFile(asset)}
                    />
                  ))}
                </>
              )}
          </AssetStrip>
          </div>
        )}
      </div>

      {/* What you added yourself. */}
      <div className="space-y-1.5 border-t border-hair pt-2.5">
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

      {previewFile && (
        <AttachmentPreviewModal
          file={{
            id: previewFile.id,
            name: previewFile.name,
            kind: previewFile.kind === "doc" ? "doc" : previewFile.kind,
            previewUrl: previewFile.previewUrl,
          }}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {pending.length > 0 && (
        <FileNoteDialog
          files={pending}
          title={pending.length === 1 ? "What is this file for?" : "What are these files for?"}
          prompt="A note travels with each file, so the plan grounds it in the right thing rather than guessing."
          placeholder="e.g. the Week 16 efficacy table, use these numbers, not the ones in the brief"
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
            onToast?.(
              pending.length === 1
                ? `${pending[0].name} added to the project context for generation`
                : `${pending.length} files added to the project context for generation`
            );
            setPending([]);
          }}
        />
      )}

      {editing && (
        <FileNoteDialog
          files={[{ id: "edit", name: editing.doc.name, kind: "doc", note: editing.doc.note ?? "" }]}
          title="What is this file for?"
          prompt="The note travels with the file wherever the plan uses it."
          placeholder="e.g. the Week 16 efficacy table, use these numbers, not the ones in the brief"
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

/**
 * Our approved dossier, as the first tile of the suggestions strip.
 *
 * It is the one tile that has been through regulatory review and the record
 * every claim traces back to, so it is set apart inside the row — the brand
 * mark, the verified chip, the sweep — rather than given a row of its own.
 * Like everything else in the strip it is offered, not assumed: the user
 * adds it.
 */
function DossierTile({
  name,
  claims,
  sections,
  inUse,
  onPreview,
  onToggle,
}: {
  name: string;
  claims: number;
  sections: number;
  inUse: boolean;
  onPreview: () => void;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "verified-sheen relative flex w-[280px] shrink-0 flex-col gap-1.5 overflow-hidden rounded-control border p-2.5 shadow-2xs transition",
        inUse
          ? "border-ok-line bg-ok-bg/50 ring-1 ring-ok/20"
          : "border-brand/35 bg-tint/50 ring-1 ring-brand/10 hover:border-brand/60"
      )}
    >
      <div className="relative z-10 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-glyph border border-ok-line bg-ok-bg px-1.5 py-0.5 text-micro font-extrabold uppercase tracking-wide text-ok">
          <ShieldCheck className="size-3" /> Verified from FDA
        </span>
        <TileButton
          onClick={onPreview}
          label={`Preview ${name}`}
          className="border-hair-2 bg-card text-ink-3 hover:border-brand hover:text-brand"
        >
          <Eye className="size-3.5" />
        </TileButton>
      </div>
      <div className="relative z-10 flex min-w-0 items-start gap-2">
        <span
          className="relative grid size-8 shrink-0 place-items-center overflow-hidden rounded-glyph"
          style={{ background: "linear-gradient(155deg,#ff8a52,var(--brand) 55%,var(--brand-deep))" }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(155deg,rgba(255,255,255,.45),transparent 45%)" }}
          />
          <LogoMark size={15} className="relative text-white" title="" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-body font-bold text-ink" title={name}>
            {name}
          </span>
          <span className="block truncate text-caption text-ink-3">
            {claims} approved claims · {sections} sections
          </span>
          <span className="block truncate text-micro text-ink-4">SwishX verified dossier</span>
        </span>
      </div>
      <div className="relative z-10 mt-auto">
        <AddToProjectButton
          onClick={onToggle}
          added={inUse}
          idleText="Use verified dossier"
          addedText="Dossier in use"
          label={inUse ? `Stop grounding in ${name}` : `Ground the project in ${name}`}
        />
      </div>
    </div>
  );
}
