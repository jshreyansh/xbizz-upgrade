"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Check, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { CopyDeckCard, type CopyBlock } from "@/features/workspace/copy-deck-card";
import { copyFit } from "@/features/workspace/copy-fit";

/**
 * The copy deck.
 *
 * The stage the image flow was missing. The video flow reviews its words
 * before it spends anything on media; the image flow went from a blueprint
 * straight to a rendered page, so the first time anyone read the copy it was
 * already set in a layout — and the first time anyone discovered a block was
 * too long was after the art had been paid for.
 *
 * So: every block of copy, page by page, read before the art exists, with fit
 * as a status on each one. Continue is blocked while anything overflows, for
 * the same reason the plan screen blocks on fit — a clipped safety block is a
 * regulatory failure, not a layout preference.
 */
export function CopyDeckScreen({
  blocks,
  pages,
  title,
  claimSummary,
  leftOut,
  onChangeBlock,
  onContinue,
  scope,
  onScopeChange,
  pendingIds,
  onCitationDetails,
}: {
  blocks: CopyBlock[];
  pages: number[];
  /** What this deck is, in one line. */
  title: string;
  /** Sections and verified claims — what the blueprint used to say on its own. */
  claimSummary: string;
  /** What was deliberately not said, and why. The one thing the separate
   *  blueprint carried that a list of copy blocks cannot. */
  leftOut: string;
  onChangeBlock: (id: string, text: string) => void;
  onContinue: () => void;
  /** Blocks the chat's next instruction applies to. */
  scope: string[];
  onScopeChange: (ids: string[]) => void;
  /** Being rewritten right now — content is withheld rather than half-shown. */
  pendingIds: string[];
  /** Jump to the approved claim behind a citation. */
  onCitationDetails?: (claimId: string) => void;
}) {
  const [activePage, setActivePage] = useState(pages[0] ?? 1);
  const [editingId, setEditingId] = useState<string | null>(null);

  const onPage = blocks.filter((b) => b.pageNumber === activePage);

  /* Counted across the whole deck, not the open page: a block that overflows
     on page three still stops the deck, and hiding that behind a tab is how
     you get a surprise at the end. */
  const overflowing = useMemo(
    () => blocks.filter((b) => copyFit(b.text, b.kind).state === "overflows"),
    [blocks]
  );
  const tight = useMemo(
    () => blocks.filter((b) => copyFit(b.text, b.kind).state === "tight"),
    [blocks]
  );

  const toggleScope = (id: string) =>
    onScopeChange(scope.includes(id) ? scope.filter((s) => s !== id) : [...scope, id]);

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-hair bg-[#f4f6f3]">
      {/* ── Where you are, and what still needs a hand ── */}
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-hair bg-card px-3 py-2 sm:px-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileText className="size-3.5 shrink-0 text-brand" />
            <span className="truncate text-body-lg font-[850] tracking-tight text-ink">Copy deck</span>
          </div>
          <p className="mt-0.5 text-micro text-ink-3">
            Read the words before the art is made. Tick a block to aim the chat at it, or edit it here.
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {overflowing.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-chip border border-warn-line bg-warn-bg px-2.5 py-1 text-caption font-bold text-warn">
              <AlertTriangle className="size-3" />
              {overflowing.length} {overflowing.length === 1 ? "block overflows" : "blocks overflow"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-chip border border-ok-line bg-ok-bg px-2.5 py-1 text-caption font-bold text-ok">
              <Check className="size-3" />
              Every block fits
            </span>
          )}
          {tight.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-chip border border-tint-line bg-tint px-2.5 py-1 text-caption font-bold text-brand-deep">
              {tight.length} tight
            </span>
          )}
        </div>
      </header>

      {/* ── What this deck says, and what it deliberately does not ──
          The blueprint was a second screen showing the same words in a
          different shape. Its counts and its MLR note live here, where the
          words themselves are — the rest of it was a duplicate. */}
      <div className="border-b border-hair bg-canvas px-3 py-3 sm:px-4">
        <div className="mx-auto max-w-[760px] space-y-2.5">
          <div className="rounded-panel border border-hair-2 bg-card p-3.5 shadow-2xs">
            <div className="mb-1 text-label font-extrabold uppercase tracking-wider text-brand">
              Content &amp; claim partition
            </div>
            <h2 className="text-body-lg font-[850] leading-snug tracking-tight text-ink">{title}</h2>
            <p className="mt-1 text-label text-ink-3">{claimSummary}</p>
          </div>

          <div className="rounded-panel border border-warn-line/80 bg-warn-bg/70 p-3.5 shadow-2xs">
            <div className="mb-1 flex items-center gap-2 text-body font-bold text-warn">
              <ShieldCheck className="size-4 shrink-0 text-warn" />
              <span>Left out deliberately for MLR compliance</span>
            </div>
            <p className="text-label leading-relaxed text-warn/90">{leftOut}</p>
          </div>
        </div>
      </div>

      {/* ── Pages ── */}
      {pages.length > 1 && (
        <div className="flex gap-1 border-b border-hair bg-canvas px-3 pt-2 sm:px-4">
          {pages.map((page) => {
            const bad = blocks.some(
              (b) => b.pageNumber === page && copyFit(b.text, b.kind).state === "overflows"
            );
            return (
              <button
                key={page}
                type="button"
                onClick={() => setActivePage(page)}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-t-control px-3.5 py-2 text-body font-bold transition",
                  activePage === page
                    ? "border-b-2 border-brand text-brand"
                    : "text-ink-3 hover:text-ink"
                )}
              >
                Page {page}
                {bad && <span className="size-1.5 rounded-full bg-warn" />}
              </button>
            );
          })}
        </div>
      )}

      {/* ── The blocks ── */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="mx-auto flex max-w-[760px] flex-col gap-2.5">
          {onPage.map((block) => (
            <CopyDeckCard
              key={block.id}
              block={block}
              selected={scope.includes(block.id)}
              editing={editingId === block.id}
              pending={pendingIds.includes(block.id)}
              onToggleSelect={() => toggleScope(block.id)}
              onToggleEdit={() => setEditingId(editingId === block.id ? null : block.id)}
              onChange={(text) => onChangeBlock(block.id, text)}
              onCitationDetails={onCitationDetails}
            />
          ))}
        </div>
      </div>

      {/* ── Where you are, and the way on ──
          No composer here: the chat panel beside this screen is the composer,
          the same as the script stage. Ticking cards is how an instruction is
          aimed, so a second input on the canvas would be a second way to say
          the same thing. */}
      <div className="shrink-0 border-t border-hair bg-card px-3 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="min-w-0 text-micro text-ink-3">
            {overflowing.length > 0
              ? "Blocks that overflow have to be shortened before the art is made — a clipped safety block cannot ship."
              : scope.length > 0
                ? `${scope.length} ${scope.length === 1 ? "block" : "blocks"} in the chat\u2019s scope — ask for a change in the panel.`
                : "Tick any block to aim the chat at it, or click Edit to retype it yourself."}
          </span>
          <Button
            onClick={onContinue}
            disabled={overflowing.length > 0}
            className="h-9 shrink-0 cursor-pointer gap-1.5 rounded-control bg-brand px-5 text-body font-bold text-white hover:bg-brand-deep disabled:opacity-40"
          >
            Approve copy &amp; open studio
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </section>
  );
}