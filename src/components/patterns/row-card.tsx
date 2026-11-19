"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Text } from "@/components/ui/text";

/**
 * One object as a row you open: a glyph, its name, a quiet line of facts,
 * whatever status it carries, and "View →".
 *
 * Dossiers on the product page, disease dossiers in the Therapy Library and
 * claims on a product were each a div with role="button", Enter to open and
 * the same lift on hover, written out three times. This is that row.
 *
 * Pass `children` instead of title and meta when the middle is not a name
 * and a line, e.g. a claim's sentence, or a Stat in a stat tile. Without
 * `onOpen` it is a static card with the same shape and no hover.
 */
export function RowCard({
  leading,
  title,
  meta,
  trailing,
  openLabel,
  onOpen,
  children,
  className,
}: {
  /** A 36px glyph tile or mark. */
  leading?: ReactNode;
  title?: ReactNode;
  /** Sentence case facts, joined with " · ". Truncates to one line. */
  meta?: ReactNode;
  /** Chips and status, before the open link. */
  trailing?: ReactNode;
  /** "View", "Start", "Open". Drawn as the brand link with an arrow. */
  openLabel?: string;
  onOpen?: () => void;
  /** Replaces the title and meta block. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={onOpen ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } } : undefined}
      className={cn(
        "group flex items-center gap-4 rounded-panel border border-hair bg-card p-4 shadow-hair transition-all duration-200",
        onOpen && "focus-ring cursor-pointer hover:-translate-y-0.5 hover:shadow-soft",
        className,
      )}
    >
      {leading && <span className="shrink-0">{leading}</span>}
      <div className="min-w-0 flex-1">
        {children ?? (
          <>
            {title && <Text as="b" size="subhead" weight="bold" className="block">{title}</Text>}
            {meta && <Text size="body" tone="subtle" truncate className="block">{meta}</Text>}
          </>
        )}
      </div>
      {trailing && <div className="flex shrink-0 items-center gap-2">{trailing}</div>}
      {openLabel && (
        <span className="inline-flex shrink-0 items-center gap-1 text-body-lg font-bold text-brand transition-all group-hover:gap-1.5 group-hover:text-brand-deep">
          {openLabel} <span aria-hidden>→</span>
        </span>
      )}
    </div>
  );
}
