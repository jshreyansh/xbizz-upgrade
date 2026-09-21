"use client";

import { cn } from "@/lib/cn";

/**
 * A card on a shelf, once.
 *
 * Four shelves drew the same card four ways: Product led with a gradient band
 * and closed with a date and an Open link, Content did nearly that but
 * prefixed its date with the word "Updated", Claims had no picture at all,
 * and Characters had a picture and no footer. Same object — a thing you own,
 * with a name, a state and a way in — presented as four.
 *
 * Product's is the one that works, so it is the shape here: a media band with
 * a chip in each top corner, then the name and what it is, then chips, then a
 * rule and a footer carrying when it last changed and the way in. Every slot
 * is optional; a shelf fills what it has.
 */
export function LibraryTile({
  media,
  mediaTopLeft,
  mediaTopRight,
  mediaHover,
  title,
  subtitle,
  chips,
  footerLeft,
  footerRight,
  actions,
  onClick,
  className,
  delayMs = 0,
}: {
  /** The band across the top — artwork, a clip, a composition, a view strip. */
  media?: React.ReactNode;
  mediaTopLeft?: React.ReactNode;
  mediaTopRight?: React.ReactNode;
  /** Appears over the band on hover, e.g. a play affordance. */
  mediaHover?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  chips?: React.ReactNode;
  /** When it last changed. */
  footerLeft?: React.ReactNode;
  /** The way in. */
  footerRight?: React.ReactNode;
  /** Controls in the body's top-right — edit, archive, a menu. */
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  delayMs?: number;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter") onClick();
            }
          : undefined
      }
      style={{ animationDelay: `${delayMs}ms` }}
      className={cn(
        "rise-in-stagger group flex flex-col overflow-hidden rounded-card border border-hair bg-card shadow-hair transition-all duration-200",
        onClick && "cursor-pointer hover:-translate-y-1 hover:shadow-soft",
        className
      )}
    >
      {media && (
        <div className="relative isolate overflow-hidden">
          {media}
          {(mediaTopLeft || mediaTopRight) && (
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
              <span className="pointer-events-auto min-w-0">{mediaTopLeft}</span>
              <span className="pointer-events-auto shrink-0">{mediaTopRight}</span>
            </div>
          )}
          {mediaHover && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {mediaHover}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-body-lg font-extrabold tracking-[-.2px] text-ink">
              {title}
            </div>
            {subtitle && <div className="mt-0.5 truncate text-caption text-ink-3">{subtitle}</div>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-0.5">{actions}</div>}
        </div>

        {chips && <div className="mt-2.5 flex flex-wrap items-center gap-1.5">{chips}</div>}

        {(footerLeft || footerRight) && (
          <>
            <div className="mt-3 h-px bg-hair" />
            <div className="mt-2.5 flex items-center justify-between gap-3 text-caption text-ink-4">
              <span className="min-w-0 truncate">{footerLeft}</span>
              {footerRight && <span className="shrink-0">{footerRight}</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** The link that closes a tile. One arrow, one behaviour, every shelf. */
export function TileOpen({ label = "Open" }: { label?: string }) {
  return (
    <span className="flex items-center gap-1 font-bold text-brand transition-[gap] duration-200 group-hover:gap-2">
      {label} →
    </span>
  );
}
