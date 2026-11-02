"use client";

import { useState } from "react";
import { Check, FileText, Film, Image as ImageIcon, Library, Search, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { Modal } from "@/components/ui/modal";
import { Field } from "@/components/ui/field";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import { AssetPreview, StatusChip } from "@/features/content-library/asset-preview";
import { useEmailStore } from "@/features/workspace/email-store";
import { audienceNoun, suggestedPiece, type EmailPiece } from "@/features/workspace/email-options";
import type { EmailProject } from "@/features/workspace/email-project";

const CARD = "relative flex flex-col overflow-hidden rounded-control border text-left transition";
const cardState = (on: boolean, disabled = false) =>
  disabled ? "cursor-not-allowed border-hair bg-canvas" : on ? "cursor-pointer border-brand bg-tint shadow-2xs ring-2 ring-brand/15" : "cursor-pointer border-hair-2 bg-card hover:border-hair-3";

const Picked = () => (
  <span className="absolute right-2 top-2 z-[2] grid size-5 place-items-center rounded-full bg-brand text-white shadow-sm">
    <Check className="size-3 stroke-[3]" />
  </span>
);

const newest = (a: EmailPiece, b: EmailPiece) => Date.parse(b.asset.updated) - Date.parse(a.asset.updated);

/** One Content Library piece, the way the shelf shows it. Pieces still in MLR are greyed with the reason. */
export function PieceCard({ piece: pc, on, suggested, onPick }: { piece: EmailPiece; on: boolean; suggested?: boolean; onPick: () => void }) {
  const Kind = pc.kind === "Video" ? Film : ImageIcon;
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={!pc.linkable}
      title={pc.linkable ? undefined : pc.approval}
      onClick={onPick}
      className={cn(CARD, cardState(on, !pc.linkable))}
    >
      {on && <Picked />}
      <div className={cn("relative", !pc.linkable && "opacity-50 grayscale")}>
        <AssetPreview asset={pc.asset} className="h-24" />
        <span className="absolute left-2 top-2 z-[2] inline-flex items-center gap-1 rounded-chip bg-black/40 px-1.5 py-0.5 text-micro font-extrabold uppercase tracking-[.04em] text-white/90 backdrop-blur-sm">
          <Kind size={10} />
          {pc.kind === "Video" ? "Video" : "Doc"} · {pc.spec}
        </span>
      </div>
      <span className="grid gap-1 p-2.5">
        <b className={cn("line-clamp-2 text-body", pc.linkable ? "text-ink" : "text-ink-3")}>{pc.title}</b>
        {pc.linkable ? (
          <span className="flex flex-wrap items-center gap-1.5 text-label text-ink-3">
            <StatusChip status={pc.asset.status} />
            {pc.asset.updated}
            {suggested && <span className="font-bold text-brand-deep">· Suggested</span>}
          </span>
        ) : (
          <span className="text-label text-ink-3">{pc.approval}</span>
        )}
      </span>
    </button>
  );
}

/**
 * The Content Library, opened to pick from: every piece for this brand and
 * audience, searchable, approved ones first. In MLR or draft pieces can be
 * shown, greyed, so the one someone expected is never simply missing.
 */
export function EmailPieceBrowser({
  project: p,
  title,
  picked,
  onPick,
  onClose,
}: {
  project: EmailProject;
  title: string;
  /** Already chosen: shown ticked. */
  picked: string[];
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | "Docs" | "Video">("all");
  const [approvedOnly, setApprovedOnly] = useState(true);
  const q = query.trim().toLowerCase();
  const shown = p.library
    .filter((pc) => (approvedOnly ? pc.linkable : true) && (kind === "all" || pc.kind === kind) && (!q || pc.title.toLowerCase().includes(q)))
    .sort((a, b) => Number(b.linkable) - Number(a.linkable) || newest(a, b));

  return (
    <Modal open onClose={onClose} title={title} description={`${p.brandName} pieces for ${audienceNoun(p.audience)} in the Content Library.`} size="xl">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-56 flex-1">
            <Field size="sm" iconLeft={<Search className="size-3.5" />} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name" aria-label="Search the Content Library" />
          </div>
          <Segmented className="shrink-0">
            {([["all", "All"], ["Docs", "Documents"], ["Video", "Videos"]] as const).map(([id, label]) => (
              <SegmentedButton key={id} active={kind === id} onClick={() => setKind(id)}>
                {label}
              </SegmentedButton>
            ))}
          </Segmented>
          <Segmented className="shrink-0">
            <SegmentedButton active={approvedOnly} onClick={() => setApprovedOnly(true)}>
              Approved only
            </SegmentedButton>
            <SegmentedButton active={!approvedOnly} onClick={() => setApprovedOnly(false)}>
              Everything
            </SegmentedButton>
          </Segmented>
        </div>
        {shown.length === 0 ? (
          <p className="rounded-control border border-dashed border-hair-3 px-4 py-8 text-center text-body text-ink-3">
            {q ? `Nothing matches "${query}".` : `No ${approvedOnly ? "approved " : ""}pieces for ${p.brandName} and ${audienceNoun(p.audience)} yet.`}
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((pc) => (
              <PieceCard key={pc.id} piece={pc} on={picked.includes(pc.id)} onPick={() => onPick(pc.id)} />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

/**
 * What the email is built from, beside the dossier and files: optionally one
 * approved piece. Three are shown — the suggestion, then the most recent —
 * and the Content Library opens for the rest. A piece lends the email its
 * claims and goes with it as a document card.
 */
export function EmailPiecePicker({ project: p }: { project: EmailProject }) {
  const setEmail = useEmailStore((s) => s.set);
  const [browsing, setBrowsing] = useState(false);
  const { email, library, startPiece } = p;
  if (p.unbranded) return null;

  const suggested = suggestedPiece(p.brandName, p.audience, email.purpose);
  const linkable = library.filter((pc) => pc.linkable).sort(newest);
  const choose = (id: string | null) =>
    setEmail({ startPiece: id, attached: id && !email.attached.includes(id) ? [id, ...email.attached] : email.attached });
  /* The chosen one, the suggestion, then the newest, three at most. */
  const inline = [startPiece, linkable.find((pc) => pc.id === suggested), ...linkable]
    .filter((pc): pc is EmailPiece => !!pc)
    .filter((pc, i, all) => all.findIndex((x) => x.id === pc.id) === i)
    .slice(0, 3);
  const waiting = library.length - linkable.length;

  /* Nothing approved yet: one line, not a picker with a single choice in it. */
  if (linkable.length === 0)
    return (
      <p className="flex items-start gap-2 border-t border-hair pt-4 text-label text-ink-3">
        <FileText className="mt-0.5 size-3.5 shrink-0" />
        <span>
          <b className="font-bold text-ink-2">Build it from an approved piece:</b> none approved for {p.brandName} and {audienceNoun(p.audience)} in the Content Library yet
          {waiting > 0 ? ` (${waiting} still in review)` : ""}, so SwishX writes the email from the dossier.
        </span>
      </p>
    );

  return (
    <div className="space-y-2 border-t border-hair pt-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="text-body font-bold text-ink-2">
            Build it from an approved piece? <span className="font-semibold text-ink-4">Optional</span>
          </div>
          <p className="text-label text-ink-3">Base the email on a leave-behind or video you already got approved. Its claims lead the email, and it&apos;s included as a document card.</p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <button type="button" aria-pressed={!startPiece} onClick={() => choose(null)} className={cn(CARD, cardState(!startPiece))}>
          {!startPiece && <Picked />}
          <div className="grid h-24 w-full place-items-center border-b border-dashed border-hair-3 bg-canvas text-ink-4">
            <ShieldCheck className="size-6" />
          </div>
          <span className="grid gap-0.5 p-2.5">
            <b className="text-body text-ink">The dossier only</b>
            <span className="text-label text-ink-3">SwishX picks the claims from the {p.brandName} dossier.</span>
          </span>
        </button>

        {inline.map((pc) => (
          <PieceCard key={pc.id} piece={pc} on={startPiece?.id === pc.id} suggested={pc.id === suggested} onPick={() => choose(pc.id)} />
        ))}

        <button
          type="button"
          onClick={() => setBrowsing(true)}
          className={cn(CARD, "cursor-pointer items-center justify-center gap-1.5 border-dashed border-hair-3 bg-card p-4 text-center hover:border-brand hover:text-brand")}
        >
          <Library className="size-5 text-brand" />
          <b className="text-body text-ink">Browse Content Library</b>
          <span className="text-label text-ink-3">
            {library.length} {library.length === 1 ? "piece" : "pieces"} for {audienceNoun(p.audience)}
          </span>
        </button>
      </div>

      {browsing && (
        <EmailPieceBrowser
          project={p}
          title="Build it from an approved piece"
          picked={startPiece ? [startPiece.id] : []}
          onPick={(id) => {
            choose(id);
            setBrowsing(false);
          }}
          onClose={() => setBrowsing(false)}
        />
      )}
    </div>
  );
}
