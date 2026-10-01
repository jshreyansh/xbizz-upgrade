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
/** The strip every InspectorTabButton sits in: 18px, 1px border, 4px in. */
export const INSPECTOR_TAB_STRIP = "squircle flex gap-1 rounded-panel border border-hair p-1";
const INSPECTOR_TAB_RADIUS = "calc(var(--radius-panel) - 5px)";

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
      /* Nested in its strip: panel radius minus the strip's 4px padding and
         1px border, so the open tab's corner follows the strip's. */
      style={{ borderRadius: INSPECTOR_TAB_RADIUS }}
      aria-label={typeof children === "string" ? children : undefined}
      className={cn(
        /* No browser outline on click: the open tab is already lifted and
           white. A keyboard user still gets a ring, in the brand. */
        "group relative flex items-center justify-center gap-1.5 h-8.5 text-body transition-all duration-150 cursor-pointer font-[800] select-none whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
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
