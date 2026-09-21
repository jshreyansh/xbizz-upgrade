"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { Portal } from "@/components/ui/portal";

/**
 * Looking at a layout before committing to it.
 *
 * A card can only carry one page, and a layout is a deck — so the card shows
 * the cover and this shows the rest. The pages here are stand-ins: the real
 * ones arrive with the template service, and the shape of this screen is what
 * they will land in.
 */

export interface TemplatePreviewSpec {
  name: string;
  /** Family · shape · elements — whatever the card already says under the name. */
  meta: string;
  /** "16:9" | "9:16" | "1:1" | "A4" */
  shape: string;
  accent: string;
  previewBg: string;
  badge: string;
  metric: string;
  metricSub: string;
  points: string[];
}

/** Each page answers a different question, which is why paging is worth having. */
const PAGE_ROLES = [
  { label: "Cover", kind: "hero" as const },
  { label: "Evidence", kind: "chart" as const },
  { label: "Mechanism", kind: "diagram" as const },
  { label: "Safety & ISI", kind: "dense" as const },
];

function aspectOf(shape: string) {
  if (shape === "A4") return "1 / 1.414";
  if (shape === "3:4") return "3 / 4";
  return shape.replace(":", " / ");
}

export function TemplatePreviewModal({
  spec,
  selected,
  onUse,
  onClose,
}: {
  spec: TemplatePreviewSpec;
  selected: boolean;
  onUse: () => void;
  onClose: () => void;
}) {
  const total = PAGE_ROLES.length;
  const [page, setPage] = useState(0);

  const go = useCallback(
    (delta: number) => setPage((current) => Math.min(total - 1, Math.max(0, current + delta))),
    [total]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const role = PAGE_ROLES[page];

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-[2px] sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label={`${spec.name} preview`}
        onClick={onClose}
      >
        <div
          className="flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-card border border-hair bg-card shadow-float"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="flex items-start justify-between gap-3 border-b border-hair px-4 py-3">
            <div className="min-w-0">
              <h2 className="truncate text-body-lg font-[850] tracking-tight text-ink">{spec.name}</h2>
              <p className="truncate text-label text-ink-3">{spec.meta}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button size="sm" onClick={onUse} disabled={selected}>
                {selected ? (
                  <>
                    <Check className="size-3.5 stroke-[3]" />
                    In use
                  </>
                ) : (
                  `Use ${spec.name}`
                )}
              </Button>
              <button
                onClick={onClose}
                className="grid size-8 place-items-center rounded-control text-ink-3 transition hover:bg-black/5 hover:text-ink cursor-pointer"
                aria-label="Close preview"
              >
                <X className="size-4" />
              </button>
            </div>
          </header>

          {/* The page, flanked by the two controls that move between pages. */}
          <div className="flex min-h-0 items-center gap-2 bg-canvas p-3 sm:gap-3 sm:p-4">
            <PageArrow direction="prev" disabled={page === 0} onClick={() => go(-1)} />
            <div className="flex min-w-0 flex-1 justify-center">
              <div
                style={{ aspectRatio: aspectOf(spec.shape) }}
                className="max-h-[58vh] w-full max-w-full overflow-hidden rounded-panel border border-hair bg-card shadow-xs"
              >
                <DummyPage spec={spec} kind={role.kind} pageNumber={page + 1} />
              </div>
            </div>
            <PageArrow direction="next" disabled={page === total - 1} onClick={() => go(1)} />
          </div>

          <footer className="flex items-center justify-between gap-3 border-t border-hair px-4 py-2.5">
            <span className="text-label font-bold tabular-nums text-ink-3">
              Page {page + 1} of {total}
              <span className="ml-2 font-medium text-ink-4">{role.label}</span>
            </span>
            <div className="flex items-center gap-1.5">
              {PAGE_ROLES.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setPage(index)}
                  aria-label={`Page ${index + 1} — ${item.label}`}
                  aria-current={index === page}
                  className={cn(
                    "h-1.5 rounded-full transition-all cursor-pointer",
                    index === page ? "w-5 bg-brand" : "w-1.5 bg-hair-3 hover:bg-ink-4"
                  )}
                />
              ))}
            </div>
          </footer>
        </div>
      </div>
    </Portal>
  );
}

function PageArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const Glyph = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous page" : "Next page"}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full border border-hair bg-card text-ink-2 shadow-2xs transition",
        disabled
          ? "cursor-not-allowed opacity-35"
          : "cursor-pointer hover:border-brand hover:text-brand hover:shadow-xs"
      )}
    >
      <Glyph className="size-4 stroke-[2.5]" />
    </button>
  );
}

/* Stand-in pages. Each one is built from the template's own palette and
   figures so the composition reads as this layout rather than as a generic
   placeholder — the blocks are where the real content will sit. */
function DummyPage({
  spec,
  kind,
  pageNumber,
}: {
  spec: TemplatePreviewSpec;
  kind: "hero" | "chart" | "diagram" | "dense";
  pageNumber: number;
}) {
  const dark = /#(0|1|2)/.test(spec.previewBg.replace(/\s/g, "").slice(0, 40));
  const onArt = dark ? "text-white" : "text-ink";

  if (kind === "hero") {
    return (
      <div className="flex size-full flex-col">
        <div style={{ background: spec.previewBg }} className="flex flex-col gap-1.5 p-[5%]">
          <span
            className={cn(
              "w-fit rounded-glyph px-1.5 py-0.5 text-micro font-extrabold uppercase tracking-wider",
              dark ? "bg-white/20 text-white/90" : "bg-black/10 text-ink-2"
            )}
          >
            {spec.badge}
          </span>
          <span className={cn("text-display font-[850] leading-tight tracking-tight", onArt)}>
            {spec.metric}
          </span>
          <span className={cn("text-caption", dark ? "text-white/70" : "text-ink-3")}>{spec.metricSub}</span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-2 p-[5%]">
          {spec.points.map((point) => (
            <div key={point} className="flex items-start gap-2">
              <span
                style={{ background: spec.accent }}
                className="mt-1.5 size-1.5 shrink-0 rounded-full"
                aria-hidden
              />
              <span className="text-caption leading-snug text-ink-2">{point}</span>
            </div>
          ))}
        </div>
        <PageFoot number={pageNumber} accent={spec.accent} />
      </div>
    );
  }

  if (kind === "chart") {
    const bars = [62, 88, 44, 71, 96, 53];
    return (
      <div className="flex size-full flex-col p-[5%]">
        <Heading accent={spec.accent}>Time-course response</Heading>
        <div className="flex min-h-0 flex-1 items-end gap-[3%] pt-3">
          {bars.map((height, index) => (
            <div
              key={index}
              style={{ height: `${height}%`, background: spec.accent, opacity: 0.35 + index * 0.1 }}
              className="min-w-0 flex-1 rounded-t-glyph"
            />
          ))}
        </div>
        <div className="mt-1 h-px w-full bg-hair-3" />
        <div className="mt-2 flex gap-2">
          <div className="h-1.5 w-1/4 rounded-glyph bg-black/10" />
          <div className="h-1.5 w-1/3 rounded-glyph bg-black/10" />
        </div>
        <PageFoot number={pageNumber} accent={spec.accent} />
      </div>
    );
  }

  if (kind === "diagram") {
    return (
      <div className="flex size-full flex-col p-[5%]">
        <Heading accent={spec.accent}>Mechanism cascade</Heading>
        <div className="flex min-h-0 flex-1 items-center justify-between gap-[3%] pt-3">
          {["Bind", "Block", "Clear"].map((step, index) => (
            <div key={step} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <span
                style={{ borderColor: spec.accent, color: spec.accent }}
                className="grid aspect-square w-[62%] place-items-center rounded-full border-2 text-caption font-extrabold"
              >
                {index + 1}
              </span>
              <span className="truncate text-micro font-bold text-ink-2">{step}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 space-y-1">
          <div className="h-1.5 w-full rounded-glyph bg-black/[0.07]" />
          <div className="h-1.5 w-4/5 rounded-glyph bg-black/[0.07]" />
        </div>
        <PageFoot number={pageNumber} accent={spec.accent} />
      </div>
    );
  }

  return (
    <div className="flex size-full flex-col p-[5%]">
      <Heading accent={spec.accent}>Important safety information</Heading>
      <div className="min-h-0 flex-1 space-y-1.5 pt-3">
        {[100, 96, 88, 99, 72, 94, 61].map((width, index) => (
          <div
            key={index}
            style={{ width: `${width}%` }}
            className="h-1.5 rounded-glyph bg-black/[0.07]"
          />
        ))}
      </div>
      <div className="mt-2 rounded-control border border-hair-2 bg-canvas px-2 py-1.5">
        <span className="text-micro font-bold text-ink-3">Prescribing information · Full ISI</span>
      </div>
      <PageFoot number={pageNumber} accent={spec.accent} />
    </div>
  );
}

function Heading({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ background: accent }} className="h-3.5 w-1 shrink-0 rounded-full" aria-hidden />
      <span className="truncate text-body font-[850] tracking-tight text-ink">{children}</span>
    </div>
  );
}

function PageFoot({ number, accent }: { number: number; accent: string }) {
  return (
    <div className="mt-auto flex items-center justify-between pt-2">
      <span style={{ background: accent }} className="h-1 w-6 rounded-full opacity-50" aria-hidden />
      <span className="text-micro font-bold tabular-nums text-ink-4">{number}</span>
    </div>
  );
}
