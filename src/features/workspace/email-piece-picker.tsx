"use client";

import { Check, FileText, Film, Image as ImageIcon, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { AssetPreview, StatusChip } from "@/features/content-library/asset-preview";
import { useEmailStore } from "@/features/workspace/email-store";
import { audienceNoun, suggestedPiece } from "@/features/workspace/email-options";
import type { EmailProject } from "@/features/workspace/email-project";

const CARD = "relative flex flex-col overflow-hidden rounded-control border text-left transition";
const cardState = (on: boolean, disabled = false) =>
  disabled ? "cursor-not-allowed border-hair bg-canvas" : on ? "cursor-pointer border-brand bg-tint shadow-2xs ring-2 ring-brand/15" : "cursor-pointer border-hair-2 bg-card hover:border-hair-3";

const Picked = () => (
  <span className="absolute right-2 top-2 z-[2] grid size-5 place-items-center rounded-full bg-brand text-white shadow-sm">
    <Check className="size-3 stroke-[3]" />
  </span>
);

/**
 * What the email is built from: one of the brand's approved pieces in the
 * Content Library, or the dossier alone. A piece lends the email its claims
 * and goes with it as the attachment.
 *
 * Pieces still in MLR stay on the shelf, greyed with the reason, so the one a
 * marketer expected to see is never simply missing.
 */
export function EmailPiecePicker({ project: p }: { project: EmailProject }) {
  const setEmail = useEmailStore((s) => s.set);
  const { email, library, startPiece } = p;
  if (p.unbranded || p.purpose.noBlocks) return null;

  const suggested = suggestedPiece(p.brandName, p.audience, email.purpose);
  const linkable = library.filter((pc) => pc.linkable);
  const choose = (id: string | null) =>
    setEmail({ startPiece: id, attached: id && !email.attached.includes(id) ? [id, ...email.attached] : email.attached });

  return (
    <div className="space-y-2 border-t border-hair pt-4">
      <div>
        <div className="text-body font-bold text-ink-2">Build from an approved piece</div>
        <p className="text-label text-ink-3">Optional. Its claims lead the email, and it goes with it as the attachment.</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
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

        {library.map((pc) => {
          const on = startPiece?.id === pc.id;
          const Kind = pc.kind === "Video" ? Film : ImageIcon;
          return (
            <button
              key={pc.id}
              type="button"
              aria-pressed={on}
              disabled={!pc.linkable}
              title={pc.linkable ? undefined : pc.approval}
              onClick={() => choose(pc.id)}
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
                    {pc.id === suggested && <span className="font-bold text-brand-deep">· Suggested</span>}
                  </span>
                ) : (
                  <span className="text-label text-ink-3">{pc.approval}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {linkable.length === 0 && (
        <p className="flex items-start gap-2 rounded-control border border-hair bg-canvas px-3 py-2 text-label text-ink-3">
          <FileText className="mt-0.5 size-3.5 shrink-0" />
          No approved {p.brandName} pieces for {audienceNoun(p.audience)} in the Content Library yet. SwishX builds the email from the dossier.
        </p>
      )}
    </div>
  );
}
