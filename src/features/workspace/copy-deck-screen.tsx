"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, FileText, Sparkles } from "lucide-react";
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
  onChangeBlock,
  onBack,
  onContinue,
  onAsk,
  scope,
  onScopeChange,
}: {
  blocks: CopyBlock[];
  pages: number[];
  onChangeBlock: (id: string, text: string) => void;
  onBack: () => void;
  onContinue: () => void;
  /** Ask the agent to rewrite whatever is in scope. */
  onAsk: (instruction: string, scopeIds: string[]) => void;
  /** Blocks the chat's next instruction applies to. */
  scope: string[];
  onScopeChange: (ids: string[]) => void;
}) {
  const [activePage, setActivePage] = useState(pages[0] ?? 1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [instruction, setInstruction] = useState("");

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

  const send = () => {
    const text = instruction.trim();
    if (!text || scope.length === 0) return;
    setPendingIds(scope);
    onAsk(text, scope);
    setInstruction("");
    // The rewrite lands on the blocks that were in scope; they are withheld
    // until it does rather than shown half-changed.
    setTimeout(() => setPendingIds([]), 1600);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f4f6f3]">
      {/* ── Where you are, and what still needs a hand ── */}
      <header className="flex flex-wrap items-center gap-2 border-b border-hair bg-card px-3 py-2 sm:px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to the blueprint"
          className="focus-ring grid size-8 shrink-0 cursor-pointer place-items-center rounded-chip text-ink-3 hover:bg-black/5 hover:text-ink"
        >
          <ArrowLeft className="size-4" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileText className="size-3.5 shrink-0 text-brand" />
            <span className="truncate text-body-lg font-[850] tracking-tight text-ink">Copy deck</span>
          </div>
          <p className="mt-0.5 text-micro text-ink-3">
            Read the words before the art is made. Every block shows how much of its box it uses.
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
            />
          ))}
        </div>
      </div>

      {/* ── Ask the agent, scoped to what is ticked ── */}
      <div className="border-t border-hair bg-card px-3 py-2.5 sm:px-4">
        <div className="mx-auto flex max-w-[760px] flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-label font-bold text-ink-2">
              {scope.length === 0
                ? "Tick the blocks an instruction should apply to"
                : `${scope.length} ${scope.length === 1 ? "block" : "blocks"} in scope`}
            </span>
            {scope.length > 0 && (
              <button
                type="button"
                onClick={() => onScopeChange([])}
                className="cursor-pointer text-label font-bold text-brand hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-end gap-2">
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder="e.g. Cut this to one sentence and keep the p-value."
              className="flex-1 resize-none rounded-control border border-hair-2 bg-canvas p-2.5 text-body text-ink outline-none focus:border-brand focus:bg-card"
            />
            <Button
              size="sm"
              onClick={send}
              disabled={!instruction.trim() || scope.length === 0}
              className="h-9 shrink-0 cursor-pointer gap-1.5 rounded-control bg-brand px-4 text-body font-bold text-white hover:bg-brand-deep disabled:opacity-40"
            >
              <Sparkles className="size-3.5" />
              Rewrite
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <span className="text-micro text-ink-3">
              {overflowing.length > 0
                ? "Blocks that overflow have to be shortened before the art is made — a clipped safety block cannot ship."
                : "Nothing overflows. The art can be generated against these boxes."}
            </span>
            <Button
              onClick={onContinue}
              disabled={overflowing.length > 0}
              className="h-9 shrink-0 cursor-pointer gap-1.5 rounded-control bg-brand px-5 text-body font-bold text-white hover:bg-brand-deep disabled:opacity-40"
            >
              Approve copy & open studio
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
