"use client";

import { useRef, useState } from "react";
import { Check, Eye, Pencil, TriangleAlert, Plus, X, FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}
import type { PlanResearch } from "@/features/workspace/use-plan-research";
import { workspaceAssets, type WorkspaceAsset } from "@/features/workspace/workspace-assets";
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
  if (dossierInUse) return `${brandName} evidence pack + ${files}`;
  return fileCount > 0 ? `${files} · evidence pack not added` : "No sources added yet";
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
  const [addOpen, setAddOpen] = useState(false);
  const docUploadRef = useRef<HTMLInputElement>(null);
  const researching = Boolean(research?.researching);
  const pack = evidencePack(brandName);
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

      {/* SwishX's own evidence first and on its own: the curated pack is
          the one thing here that has been through review, so it is set apart
          from files people uploaded rather than mixed in with them. */}
      <EvidencePackCard
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

      {/* What you added yourself — uploaded now, or reused from an earlier
          project through the same Add files window. */}
      <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-label font-bold uppercase tracking-wider text-ink-3">
              Your files for this project ({uploadedDocs.length})
            </span>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-glyph px-1.5 py-1 text-label font-bold text-brand transition-colors hover:bg-tint"
            >
              <Plus className="size-3.5" />
              <span>Add files</span>
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

          {uploadedDocs.length === 0 && (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="w-full cursor-pointer rounded-control border border-dashed border-hair-3 px-3 py-4 text-center text-label text-ink-3 transition-colors hover:border-brand hover:text-brand"
            >
              Add a label, study readout or brief, or reuse one from an earlier project
            </button>
          )}

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
              { name: asset.name, size: "—", date: "Earlier project", note: asset.note, origin: "previous" },
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

      <PlanSectionContinue onClick={onContinue} />
    </div>
  );
}

/**
 * SwishX's evidence pack, as the head of the section.
 *
 * Dark, like the product's action bars, so it reads as ours and not as one
 * more file. It has to earn trust at a glance, so it says who made it (SwishX
 * Science), what it is in one plain sentence, and what was checked and when —
 * the things an MLR reviewer would ask before anything else. One decision,
 * use the pack, with each dossier there to read (View) and its claims coverage
 * beside them, area by area.
 */
function EvidencePackCard({
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
  const overall = Math.round(pack.areas.reduce((sum, a) => sum + a.coverage, 0) / pack.areas.length);
  const accent = inUse ? "text-ok-on-dark" : "text-[#ff8a5c]";
  return (
    <div
      className="relative overflow-hidden rounded-panel bg-ink text-white shadow-float ring-1 ring-white/5"
      style={{
        backgroundImage:
          "radial-gradient(90% 120% at 100% 0%, rgba(253,72,22,.14), transparent 55%), radial-gradient(120% 140% at 0% 0%, rgba(255,255,255,.06), transparent 55%)",
      }}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5"
        style={{
          background: inUse
            ? "linear-gradient(90deg,var(--color-ok-on-dark),var(--ok))"
            : "linear-gradient(90deg,#ff8a52,var(--brand),var(--brand-deep))",
        }}
      />

      {/* Who made it and what it is — the first thing to trust. */}
      <div className="flex items-start gap-3 px-4 pb-3 pt-3.5">
        <span className="relative grid size-10 shrink-0 place-items-center">
          <span
            aria-hidden
            className="absolute inset-0 rounded-[12px] shadow-brand-lift"
            style={{ background: "linear-gradient(155deg,#ff8a52,var(--brand) 55%,var(--brand-deep))" }}
          />
          <LogoMark size={18} className="relative text-white" title="" />
          {/* The seal: reviewed, not just uploaded. */}
          <span className="absolute -bottom-1 -right-1 grid size-4.5 place-items-center rounded-full bg-ok-on-dark text-ink ring-2 ring-ink">
            <Check className="size-3" strokeWidth={3.5} />
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-subhead font-[850] tracking-tight">{pack.name}</span>
            <span className="rounded-chip bg-white/10 px-1.5 py-0.5 text-micro font-extrabold uppercase tracking-wider text-white/80">
              by SwishX Science
            </span>
          </div>
          <p className="mt-0.5 text-label leading-snug text-white/65">
            Pre-approved claims your asset can use. Every line it writes cites one of them.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          disabled={Boolean(research)}
          aria-pressed={inUse}
          className={cn(
            "shrink-0 cursor-pointer rounded-control px-3.5 py-2 text-label font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50",
            inUse
              ? "bg-ok-on-dark/15 text-ok-on-dark ring-1 ring-inset ring-ok-on-dark/45"
              : "bg-brand text-white shadow-brand-lift hover:bg-brand-deep"
          )}
        >
          {inUse ? "✓ In use" : "+ Use pack"}
        </button>
      </div>

      {/* The numbers that matter, at a glance — once there are numbers. While
          the research runs they would be figures for dossiers not yet read. */}
      {!research && (
        <div className="grid grid-cols-3 border-y border-white/10 text-center">
          {[
            { value: pack.totalClaims, label: "Approved claims" },
            { value: pack.dossiers.length, label: "Verified dossiers" },
            { value: pack.verifiedOn.replace(/, \d{4}$/, ""), label: "Last checked" },
          ].map((stat, i) => (
            <div key={stat.label} className={cn("px-2 py-2", i > 0 && "border-l border-white/10")}>
              <div className="text-subhead font-[850] tabular-nums tracking-tight">{stat.value}</div>
              <div className="text-micro font-bold uppercase tracking-wider text-white/45">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {research ? (
        /* The research plays here while the plan is built, so there is
           something to watch rather than a pack that appears from nowhere. */
        <div className="space-y-2 border-t border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 text-label">
            <Loader2 className="size-3.5 shrink-0 animate-spin text-brand" />
            <span className="font-semibold text-white/80">{research.label}</span>
            <span className="ml-auto tabular-nums text-white/50">
              Step {research.current} of {research.total}
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-150 ease-linear"
              style={{ width: `${research.progress ?? 0}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div className="border-b border-white/10 sm:border-b-0 sm:border-r">
            {pack.dossiers.map((dossier) => (
              <div
                key={dossier.id}
                className="grid grid-cols-[22px_minmax(0,1fr)_auto_auto] items-center gap-2.5 border-b border-white/[0.06] px-4 py-2 last:border-b-0 hover:bg-white/[0.04]"
              >
                <FileText className={cn("size-4.5", accent)} />
                <span className="min-w-0">
                  <span className="block truncate text-body font-bold">{dossier.name}</span>
                  <span className="block truncate text-caption text-white/55">{dossier.source}</span>
                </span>
                <span className="whitespace-nowrap text-label tabular-nums text-white/55">
                  <b className="font-extrabold text-white">{dossier.claims}</b> claims
                </span>
                <button
                  type="button"
                  onClick={onView}
                  aria-label={`View ${dossier.name}`}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-glyph border border-white/15 bg-white/5 px-2 py-1 text-label font-bold transition-colors hover:border-brand hover:text-[#ff8a5c]"
                >
                  <Eye className="size-3.5" />
                  View
                </button>
              </div>
            ))}
          </div>
          {/* Claims coverage: how much of what each area usually needs to say
              the pack can back. Green from the start — it describes the pack,
              which is good whether or not it is in use yet. */}
          <div className="space-y-2 px-4 py-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-micro font-extrabold uppercase tracking-wider text-white/50">Claims coverage</span>
              <span className="text-caption font-bold tabular-nums text-ok-on-dark">{overall}% · Strong</span>
            </div>
            {pack.areas.map((area) => (
              <div
                key={area.label}
                title={`${area.claims} approved claims`}
                className="grid grid-cols-[104px_minmax(0,1fr)_34px] items-center gap-2 text-label"
              >
                <span className="truncate font-semibold text-white/80">{area.label}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${area.coverage}%`,
                      background: "linear-gradient(90deg,var(--ok),var(--color-ok-on-dark))",
                    }}
                  />
                </span>
                <span className="text-right font-bold tabular-nums text-ok-on-dark">{area.coverage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What was checked, so "verified" means something specific. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 bg-white/[0.03] px-4 py-2 text-caption text-white/60">
        {["Checked against the FDA label", "Every claim cited to its source", "Re-checked when the label changes"].map((item) => (
          <span key={item} className="inline-flex items-center gap-1.5">
            <Check className="size-3 text-ok-on-dark" strokeWidth={3} />
            {item}
          </span>
        ))}
        <span className="ml-auto text-white/40">{pack.reviewedBy}</span>
      </div>
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
    </Portal>
  );
}
