"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * A tab that spends its width on the one that is open.
 *
 * Four tabs of equal width leaves no room for the open one to say anything
 * beyond its name — and the names are the least useful part of a row you
 * already know. So the closed ones keep their glyph, which is what you scan
 * for, and the open one takes the space back to spell itself out.
 */
export function InspectorTabButton({
  tab,
  current,
  onClick,
  icon: Icon,
  badge,
  count,
  /** Shown beside the label when open — e.g. the scene being edited. */
  chip,
  alwaysCount,
  children,
}: {
  tab: string;
  current: string;
  onClick: (tab: any) => void;
  icon: LucideIcon;
  badge?: React.ReactNode;
  count?: number;
  chip?: string;
  /** Keep the count visible when closed: an open comment is worth a glance. */
  alwaysCount?: boolean;
  children: React.ReactNode;
}) {
  const active = tab === current;
  return (
    <button
      type="button"
      onClick={() => onClick(tab)}
      title={typeof children === "string" ? children : undefined}
      aria-label={typeof children === "string" ? children : undefined}
      className={cn(
        "group relative flex items-center justify-center gap-1.5 h-8.5 rounded-control text-body transition-all duration-150 cursor-pointer font-[800] select-none whitespace-nowrap",
        active ? "flex-1 px-2.5" : "shrink-0 px-2.5",
        active
          ? "bg-card text-ink shadow-xs border border-hair"
          : "text-ink-3 hover:text-ink hover:bg-white/50 border border-transparent"
      )}
    >
      {badge}
      <Icon className="size-3.5 shrink-0" />
      {active && <span className="truncate">{children}</span>}
      {active && chip && (
        <span className="shrink-0 rounded-glyph bg-tint px-1.5 py-0.2 text-caption font-bold text-brand-deep border border-tint-line">
          {chip}
        </span>
      )}
      {count !== undefined && (active || (alwaysCount && count > 0)) && (
        <span
          className={cn(
            "shrink-0 text-caption font-extrabold px-1.5 py-0.2 rounded-chip transition-colors",
            active
              ? "bg-tint-strong text-brand-deep border border-brand/20"
              : "bg-black/5 text-ink-3"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
