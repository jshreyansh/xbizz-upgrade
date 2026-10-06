"use client";

import { useRef, useState, type ReactNode } from "react";
import { Check, Eye, Pencil, TriangleAlert, Plus, X, FileText, Loader2, Upload } from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { AttachmentPreviewModal } from "@/features/workspace/chat-attachments";
import { Portal } from "@/components/ui/portal";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import { PlanSectionContinue } from "@/features/workspace/plan-section-continue";
import { cn } from "@/lib/cn";
import { FileNoteDialog, type PendingFile } from "@/features/workspace/file-note-dialog";
import { evidencePack, type EvidencePack } from "@/features/workspace/evidence-pack";

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
  /** Where the file can be opened, if it can be. */
  previewUrl?: string;
}
import type { PlanResearch } from "@/features/workspace/use-plan-research";
import { workspaceAssets, type WorkspaceAsset } from "@/features/workspace/workspace-assets";

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
   * Whether SwishX's evidence pack is in the grounding. Held by the screen, so
   * the section's summary can say so. It starts out: the pack is recommended,
   * and the user is the one who uses it.
   */
  dossierInUse: boolean;
  onDossierInUseChange: (inUse: boolean) => void;
}

/** The Research and Sources summary line: only what has actually been added. */
export function researchSummary(brandName: string, dossierInUse: boolean, fileCount: number) {
  const files = `${fileCount} ${fileCount === 1 ? "file" : "files"}`;
  if (dossierInUse) return `${brandName} evidence dossier + ${files}`;
  return fileCount > 0 ? `${files} · evidence dossier not added` : "No sources added yet";
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
  const [pending, setPending] = useState<Array<PendingFile & { size: string; previewUrl?: string }>>([]);
  const [editing, setEditing] = useState<{ index: number; doc: UploadedDoc } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const docUploadRef = useRef<HTMLInputElement>(null);
  const [viewing, setViewing] = useState<UploadedDoc | null>(null);
  const researching = Boolean(research?.researching);
  const pack = evidencePack(brandName);
  const audience = useWorkspaceStore((st) => st.audience);
  const market = useWorkspaceStore((st) => st.market);
  const dossierPhrase = dossierFor(market, audience);
  /* What earlier projects on this brand used. Ones already in your files
     stay in the list, marked added, so the list doesn't shift as you pick. */
  const reusableDocs = workspaceAssets(brandName, "source");
  const inProject = uploadedDocs.map((doc) => doc.name);

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

      {/* One card, in the order the work is grounded: what SwishX already
          verified, then what you brought. Numbered because it is an order —
          the dossier is the base, your files narrow or add to it. */}
      <div className="overflow-hidden rounded-card border border-brand/30 bg-card">
        <StepBand number={1} tone="brand">
          {researching
            ? `SwishX is preparing ${dossierPhrase} for you`
            : `SwishX has already made ${dossierPhrase} for you`}
        </StepBand>
        <DossierRow
          pack={pack}
          inUse={dossierInUse}
          research={researching ? research : undefined}
          onView={onPreviewDossier}
          onToggle={() => {
            onDossierInUseChange(!dossierInUse);
            onToast?.(
              dossierInUse ? `${pack.name} removed from the project` : `${pack.name} in use for this project`,
              dossierInUse ? "undone" : "done"
            );
          }}
        />

        <StepBand number={2} tone="neutral">
          Your files for this project <span className="font-semibold text-ink-3">({uploadedDocs.length})</span>
        </StepBand>
        <div className="@container space-y-3 p-4">
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
                    previewUrl: URL.createObjectURL(f),
                  }))
                );
              }
              e.target.value = "";
            }}
          />

          {uploadedDocs.length > 0 && (
            /* Two columns that fill the card, one when the card is too narrow
               for a readable file name (the chat panel open beside it). */
            <div className="grid grid-cols-1 gap-3 @2xl:grid-cols-2">
              {uploadedDocs.map((doc, idx) => (
                <FileTile
                  key={idx}
                  doc={doc}
                  unusable={sourcesUnusable}
                  onView={() => setViewing(doc)}
                  onEditNote={() => setEditing({ index: idx, doc })}
                  onRemove={() => onSetUploadedDocs((prev) => prev.filter((_, i) => i !== idx))}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-control border border-dashed border-brand/45 bg-tint/50 px-3 py-3 text-body-lg font-bold text-brand-deep transition-colors hover:border-brand hover:bg-tint"
          >
            <Plus className="size-3.5" />
            Add files
          </button>
          {uploadedDocs.length === 0 && (
            <p className="text-center text-label text-ink-3">
              A label, a study readout or a brief, or one reused from an earlier project.
            </p>
          )}
        </div>
      </div>

      {addOpen && (
        <AddFilesModal
          brandName={brandName}
          docs={reusableDocs}
          inProject={inProject}
          onClose={() => setAddOpen(false)}
          onUpload={() => {
            setAddOpen(false);
            docUploadRef.current?.click();
          }}
          onAdd={(asset) => {
            if (inProject.includes(asset.name)) return;
            onSetUploadedDocs((prev) => [
              ...prev,
              {
                name: asset.name,
                size: "—",
                date: "Earlier project",
                note: asset.note,
                origin: "previous",
                previewUrl: asset.previewUrl,
              },
            ]);
            onToast?.(`${asset.name} added to the project`);
          }}
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
                previewUrl: f.previewUrl,
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

      {viewing && (
        <AttachmentPreviewModal
          file={{ id: viewing.name, name: viewing.name, kind: "doc", previewUrl: viewing.previewUrl }}
          onClose={() => setViewing(null)}
        />
      )}

      <PlanSectionContinue onClick={onContinue} />
    </div>
  );
}

/** "an FDA-approved HCP dossier", from the project's market and audience. */
function dossierFor(market: string, audience: string) {
  const m = market.toLowerCase();
  const regulator = /united states|^us\b|usa/.test(m)
    ? "FDA"
    : /united kingdom|^uk\b|britain/.test(m)
    ? "MHRA"
    : /europe|^eu\b/.test(m)
    ? "EMA"
    : /japan/.test(m)
    ? "PMDA"
    : /india/.test(m)
    ? "CDSCO"
    : /australia/.test(m)
    ? "TGA"
    : /brazil/.test(m)
    ? "ANVISA"
    : "";
  const who = audience === "HCP" ? "HCP" : audience ? audience.toLowerCase() : "";
  const kind = [regulator && `${regulator}-approved`, who, "dossier"].filter(Boolean).join(" ");
  /* Said the way it is read aloud: "an FDA", "an MHRA", "a PMDA". */
  return `${/^[AEFHILMNORSX]/.test(kind) ? "an" : "a"} ${kind}`;
}

/** A numbered part of the card. The number says what comes first. */
function StepBand({ number, tone, children }: { number: number; tone: "brand" | "neutral"; children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b px-4 py-2.5",
        tone === "brand" ? "border-brand/20 bg-tint" : "border-t border-hair bg-subtle"
      )}
    >
      <span
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-full text-label font-extrabold text-white",
          tone === "brand" ? "bg-brand" : "bg-ink"
        )}
      >
        {number}
      </span>
      <span className={cn("min-w-0 text-body-lg font-extrabold tracking-tight", tone === "brand" ? "text-brand-deep" : "text-ink")}>
        {children}
      </span>
    </div>
  );
}

/* The dark button the reference uses for View: a one-off, not a variant. */
const VIEW_BUTTON = "gap-1.5 border-transparent bg-ink font-bold text-white hover:bg-ink-2";

/**
 * SwishX's evidence dossier: who made it is said in the band above, so the
 * row is only what it is, how much it holds, and the one decision — use it.
 * It is offered, not pre-added; once in use it can be taken out again.
 */
function DossierRow({
  pack,
  inUse,
  research,
  onView,
  onToggle,
}: {
  pack: EvidencePack;
  inUse: boolean;
  /** Set while the plan is still being researched. */
  research?: PlanResearch;
  onView: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-4">
      <span className="relative grid size-12 shrink-0 place-items-center rounded-panel bg-brand text-white shadow-brand-lift">
        <FileText className="size-5.5" />
        {/* The seal: reviewed, not just uploaded. */}
        <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-ok text-white ring-2 ring-card">
          <Check className="size-3" strokeWidth={3.5} />
        </span>
      </span>
      <div className="min-w-[11rem] flex-1">
        <div className="text-subhead font-[850] tracking-tight text-ink">{pack.name}</div>
        <p className="text-body leading-snug text-ink-2">
          Every line in your script will cite one of its approved claims.
        </p>
      </div>

      {research ? (
        /* The research plays here while the plan is built. The figures wait
           for it: they would be counts of dossiers not yet read. */
        <div className="w-full space-y-1.5 sm:w-64" aria-live="polite">
          <div className="flex items-center gap-2 text-label">
            <Loader2 className="size-3.5 shrink-0 animate-spin text-brand" />
            <span className="min-w-0 truncate font-semibold text-ink-2">{research.label}</span>
            <span className="ml-auto shrink-0 tabular-nums text-ink-3">
              Step {research.current} of {research.total}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-subtle">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-150 ease-linear"
              style={{ width: `${research.progress ?? 0}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="grid grid-cols-2 divide-x divide-hair rounded-panel border border-hair bg-card">
            <div className="px-4 py-1.5">
              <div className="text-subhead font-[850] tabular-nums leading-tight text-brand-deep">{pack.totalClaims}</div>
              <div className="text-label text-ink-3">Approved claims</div>
            </div>
            <div className="px-4 py-1.5">
              <div className="text-subhead font-[850] tabular-nums leading-tight text-ink">
                {pack.verifiedOn.replace(/, \d{4}$/, "")}
              </div>
              <div className="text-label text-ink-3">Last updated</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onView} className={cn(VIEW_BUTTON, "h-10 px-4")}>
              <Eye className="size-4" />
              View
            </Button>
            {inUse ? (
              <IconButton
                aria-label={`Remove ${pack.name} from the project`}
                title="Remove from the project"
                onClick={onToggle}
                size={9}
                className="size-10 rounded-control border border-hair-2 hover:text-danger"
              >
                <X className="size-4" />
              </IconButton>
            ) : (
              <Button size="sm" onClick={onToggle} className="h-10 gap-1.5 px-4 font-bold">
                <Plus className="size-3.5" />
                Use dossier
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** A file you brought: what it is for, and the means to read, re-note or drop it. */
function FileTile({
  doc,
  unusable,
  onView,
  onEditNote,
  onRemove,
}: {
  doc: UploadedDoc;
  /** The file was checked and holds nothing usable. Marked where the file is. */
  unusable: boolean;
  onView: () => void;
  onEditNote: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-panel border px-3.5 py-3",
        unusable ? "border-danger-line bg-danger-bg" : "border-hair-2 bg-card"
      )}
    >
      <FileText className={cn("size-4 shrink-0", unusable ? "text-danger" : "text-brand")} />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-body font-bold text-ink" title={doc.name}>
            {doc.name}
          </span>
          {/* Where it came from: with the brief, or reused from an earlier
              project, so one is not mistaken for the other. */}
          <span className="shrink-0 rounded-chip bg-subtle px-1.5 py-0.5 text-caption font-bold text-ink-3">
            {doc.origin === "previous" ? "Reused" : "Brief"}
          </span>
        </div>
        {/* What you said it is for, which is also where you change it. */}
        <button
          type="button"
          onClick={onEditNote}
          title="Edit note"
          className="group flex max-w-full cursor-pointer items-center gap-1 text-left text-label text-ink-3 hover:text-ink"
        >
          <span className="truncate">{[doc.note, doc.size !== "—" && doc.size].filter(Boolean).join(" · ")}</span>
          <Pencil className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
        {unusable && <span className="block text-caption font-bold text-danger">No usable clinical content</span>}
      </div>
      <Button size="sm" onClick={onView} className={cn(VIEW_BUTTON, "h-9")}>
        <Eye className="size-3.5" />
        View
      </Button>
      <IconButton
        aria-label={`Remove ${doc.name}`}
        title="Remove"
        onClick={onRemove}
        size={9}
        className="rounded-control border border-hair-2 hover:text-danger"
      >
        <X className="size-3.5" />
      </IconButton>
    </div>
  );
}

/**
 * Add files: upload something new, or reuse what the team already has for
 * this medicine.
 *
 * Earlier projects' files sat in an accordion at the foot of the section —
 * a second place to add from, open or shut. One window, reached from the one
 * Add files button, with both routes in it.
 */
function AddFilesModal({
  brandName,
  docs,
  inProject,
  onClose,
  onUpload,
  onAdd,
}: {
  brandName: string;
  docs: WorkspaceAsset[];
  /** Names already in the project's files. */
  inProject: string[];
  onClose: () => void;
  onUpload: () => void;
  onAdd: (asset: WorkspaceAsset) => void;
}) {
  const [tab, setTab] = useState<"workspace" | "upload">(docs.length > 0 ? "workspace" : "upload");
  const [added, setAdded] = useState<string[]>([]);
  const [viewing, setViewing] = useState<WorkspaceAsset | null>(null);
  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add files"
        onClick={onClose}
        className="fixed inset-0 z-[9999] grid place-items-center bg-ink/55 p-4 backdrop-blur-sm"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[80vh] w-full max-w-[560px] flex-col overflow-hidden rounded-card border border-hair bg-card shadow-float"
        >
          <div className="flex items-start justify-between gap-3 border-b border-hair px-5 py-4">
            <div>
              <h2 className="text-subhead font-[850] tracking-tight text-ink">Add files</h2>
              <p className="mt-0.5 text-label text-ink-3">
                Upload something new, or reuse what your team already has for {brandName}.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-ink-3 transition hover:bg-black/5 hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="px-5 pt-3">
            <Segmented className="inline-flex">
              <SegmentedButton active={tab === "workspace"} onClick={() => setTab("workspace")}>
                From workspace ({docs.length})
              </SegmentedButton>
              <SegmentedButton active={tab === "upload"} onClick={() => setTab("upload")}>
                Upload
              </SegmentedButton>
            </Segmented>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 py-3">
            {tab === "workspace" ? (
              docs.length > 0 ? (
                docs.map((asset) => {
                  const isAdded = inProject.includes(asset.name);
                  return (
                    <div key={asset.id} className="flex items-center gap-2.5 rounded-control border border-hair-2 px-3 py-2">
                      <FileText className="size-4 shrink-0 text-brand" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body font-bold text-ink">{asset.name}</span>
                        <span className="block truncate text-caption text-ink-3">
                          {asset.note}
                          {asset.origin ? ` · used in ${asset.origin}` : ""}
                        </span>
                      </span>
                      {/* Read it before taking it in: a file from another
                          project is only worth adding if it says what you need. */}
                      <Button
                        size="sm"
                        onClick={() => setViewing(asset)}
                        aria-label={`View ${asset.name}`}
                        className={cn(VIEW_BUTTON, "h-7 px-2.5 text-label")}
                      >
                        <Eye className="size-3" />
                        View
                      </Button>
                      <button
                        type="button"
                        disabled={isAdded}
                        onClick={() => {
                          setAdded((prev) => [...prev, asset.id]);
                          onAdd(asset);
                        }}
                        className={cn(
                          "shrink-0 cursor-pointer rounded-glyph border px-2.5 py-1 text-label font-extrabold transition disabled:cursor-default",
                          isAdded
                            ? "border-ok-line bg-ok-bg text-ok"
                            : "border-brand/50 bg-card text-brand hover:bg-brand hover:text-white"
                        )}
                      >
                        {isAdded ? "✓ Added" : "+ Add"}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="py-8 text-center text-body text-ink-4">
                  Nothing from earlier {brandName} projects yet.
                </p>
              )
            ) : (
              <button
                type="button"
                onClick={onUpload}
                className="grid w-full cursor-pointer justify-items-center gap-1.5 rounded-panel border border-dashed border-hair-3 px-4 py-8 text-center transition-colors hover:border-brand"
              >
                <Upload className="size-5 text-brand" />
                <span className="text-body-lg font-bold text-ink">Choose files to upload</span>
                <span className="text-label text-ink-3">A label, a study readout or a brief. PDF, Word, PowerPoint.</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-hair px-5 py-3">
            <span className="text-label text-ink-3">
              {added.length > 0 ? `${added.length} added to this project` : "Nothing added yet"}
            </span>
            <Button size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
      {viewing && (
        <AttachmentPreviewModal
          file={{ id: viewing.id, name: viewing.name, kind: "doc", previewUrl: viewing.previewUrl }}
          onClose={() => setViewing(null)}
        />
      )}
    </Portal>
  );
}
