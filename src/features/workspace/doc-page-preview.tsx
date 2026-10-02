"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/components/ui/button";

/**
 * The document as it will go out, one page at a time, read-only.
 *
 * It mirrors the page the editor has drawn rather than drawing it a second
 * time, so the preview cannot disagree with the canvas about what the page
 * says. Choosing a page here turns the editor to it behind the window, and
 * the copy is taken again.
 */
export function DocPagePreview({
  sourceRef,
  pageSize,
  pages,
  activePage,
  onSelectPage,
  frozen = false,
}: {
  /** The editor's page element, drawn at its true size. */
  sourceRef: RefObject<HTMLDivElement | null>;
  pageSize: { width: number; height: number };
  pages: { id: number; name: string }[];
  activePage: number;
  onSelectPage: (id: number) => void;
  /** Page turning is off while an MLR review runs. */
  frozen?: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  /* Fit to the room, re-measured as the window resizes. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(([entry]) => {
      setBox({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  const scale = box.width > 0 ? Math.min(box.width / pageSize.width, box.height / pageSize.height) * 0.94 : 0;

  /* Take the page as drawn, after the editor has turned to it. */
  useEffect(() => {
    const host = hostRef.current;
    const source = sourceRef.current;
    if (!host || !source || scale === 0) return;
    const frame = requestAnimationFrame(() => {
      const copy = source.cloneNode(true) as HTMLElement;
      copy.style.transform = `scale(${scale})`;
      copy.style.transformOrigin = "top left";
      copy.style.pointerEvents = "none";
      copy.querySelectorAll("[data-editor-chrome]").forEach((el) => el.remove());
      host.replaceChildren(copy);
    });
    return () => cancelAnimationFrame(frame);
  }, [sourceRef, activePage, scale]);

  return (
    <div className="flex h-full flex-col">
      <div ref={stageRef} className="relative min-h-0 flex-1 p-5">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-card shadow-float"
          style={{ width: pageSize.width * scale, height: pageSize.height * scale }}
        >
          <div ref={hostRef} />
        </div>
      </div>
      {pages.length > 1 && (
        <PageTurner pages={pages} activePage={activePage} onSelectPage={onSelectPage} frozen={frozen} />
      )}
    </div>
  );
}

/**
 * Turning pages the way a PDF reader does: back, forward, or type a number.
 * A row of page tabs reads well at three pages and breaks at thirty, and a
 * brief can run to a hundred.
 */
function PageTurner({
  pages,
  activePage,
  onSelectPage,
  frozen,
}: {
  pages: { id: number; name: string }[];
  activePage: number;
  onSelectPage: (id: number) => void;
  frozen: boolean;
}) {
  const index = Math.max(0, pages.findIndex((p) => p.id === activePage));
  const current = pages[index];
  const [draft, setDraft] = useState<string | null>(null);

  const goTo = (i: number) => {
    const next = pages[Math.min(pages.length - 1, Math.max(0, i))];
    if (next && next.id !== activePage) onSelectPage(next.id);
  };

  /* The arrow keys turn pages, unless someone is typing a page number. */
  useEffect(() => {
    if (frozen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const commit = () => {
    const n = Number.parseInt(draft ?? "", 10);
    if (Number.isFinite(n)) goTo(n - 1);
    setDraft(null);
  };

  return (
    <div className="flex shrink-0 items-center gap-3 border-t border-hair bg-card px-4 py-2">
      <span className="min-w-0 flex-1 truncate text-label font-semibold text-ink-2" title={current?.name}>
        {current?.name.replace(/^Page \d+:\s*/, "")}
      </span>
      <div className="flex shrink-0 items-center gap-1">
        <IconButton aria-label="Previous page" onClick={() => goTo(index - 1)} disabled={frozen || index === 0}>
          <ChevronLeft className="size-4" />
        </IconButton>
        <label className="flex items-center gap-1.5 text-label font-semibold text-ink-3">
          Page
          <input
            type="text"
            inputMode="numeric"
            aria-label={`Page number, 1 to ${pages.length}`}
            disabled={frozen}
            value={draft ?? String(index + 1)}
            onFocus={(e) => {
              setDraft(String(index + 1));
              e.currentTarget.select();
            }}
            onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setDraft(null);
                e.currentTarget.blur();
              }
            }}
            className="focus-ring h-7 rounded-chip border border-hair-2 bg-card text-center text-label font-bold tabular-nums text-ink disabled:opacity-50"
            style={{ width: `${Math.max(2, String(pages.length).length) + 2}ch` }}
          />
          <span className="tabular-nums">of {pages.length}</span>
        </label>
        <IconButton
          aria-label="Next page"
          onClick={() => goTo(index + 1)}
          disabled={frozen || index === pages.length - 1}
        >
          <ChevronRight className="size-4" />
        </IconButton>
      </div>
    </div>
  );
}
