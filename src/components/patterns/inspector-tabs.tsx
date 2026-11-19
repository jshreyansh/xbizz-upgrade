"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/ui/logo-mark";
import { Chip } from "@/components/ui/chip";

/**
 * The tab strip at the top of every studio's right panel (Chat, Claims,
 * Comments), and the two headers that sit with it.
 *
 * Used by the four studios (Video, Docs, Ads, Email) and their four plan
 * screens, so every right panel looks and behaves the same.
 *
 * A tab spends its width on the one that is open. Four tabs of equal width
 * leaves no room for the open one to say anything beyond its name, and the
 * names are the least useful part of a row you already know. So the closed
 * ones keep their glyph, which is what you scan for, and the open one takes
 * the space back to spell itself out.
 */

/** The strip every InspectorTabButton sits in: 18px, 1px border, 4px in. */
export const INSPECTOR_TAB_STRIP = "squircle flex gap-1 rounded-panel border border-hair bg-rail p-1 shadow-inner-xs";

/* Nested in its strip: panel radius minus the strip's 4px padding and 1px
   border, so the open tab's corner follows the strip's. */
const INSPECTOR_TAB_RADIUS = "calc(var(--radius-panel) - 5px)";

/** The strip, in its pinned band at the top of the panel. */
export function InspectorTabStrip({ children }: { children: React.ReactNode }) {
  return (
    <div className="shrink-0 border-b border-hair bg-subtle p-2.5">
      <div className={INSPECTOR_TAB_STRIP}>{children}</div>
    </div>
  );
}

/** Shown above the conversation in the review view: the chat is there to understand the asset, not to change it. */
export function ReadOnlyChatNote() {
  return (
    <div className="shrink-0 border-b border-hair bg-canvas px-3.5 py-2 text-label text-ink-3">
      Read-only. This is how the asset was made; changes happen in the editor.
    </div>
  );
}

/** The header of the chat on every plan screen. */
export function PlanChatHeader({ busy }: { busy?: boolean }) {
  return (
    <div className="shrink-0 border-b border-hair bg-card p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-body font-bold text-brand">
          <LogoMark size={14} />
          <span>Direct with SwishX</span>
        </div>
        <Chip tone="ok" size="xs" weight="bold">{busy ? "Thinking…" : "Online"}</Chip>
      </div>
    </div>
  );
}

export function InspectorTabButton({
  tab,
  current,
  onClick,
  icon: Icon,
  badge,
  count,
  chip,
  alwaysCount,
  disabledHint,
  children,
}: {
  tab: string;
  current: string;
  /* `any` on purpose, as in the feature copy: each screen passes its own
     setTab over its own tab union, and this must accept every one of them. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick: (tab: any) => void;
  icon: LucideIcon;
  /** Drawn before the glyph, e.g. an unread dot. */
  badge?: React.ReactNode;
  count?: number;
  /** Shown beside the label when open, e.g. the scene being edited. */
  chip?: string;
  /** Keep the count visible when closed: an open comment is worth a glance. */
  alwaysCount?: boolean;
  /** Turned off, with the reason as its tooltip: e.g. Comments before the asset is published. */
  disabledHint?: string;
  children: React.ReactNode;
}) {
  const disabled = !!disabledHint;
  const active = !disabled && tab === current;
  const name = typeof children === "string" ? children : undefined;
  return (
    <button
      type="button"
      onClick={() => { if (!disabled) onClick(tab); }}
      aria-disabled={disabled || undefined}
      title={disabledHint ?? name}
      style={{ borderRadius: INSPECTOR_TAB_RADIUS }}
      aria-label={name}
      className={cn(
        /* No browser outline on click: the open tab is already lifted and
           white. A keyboard user still gets a ring, in the brand. */
        "group relative flex h-8.5 cursor-pointer select-none items-center justify-center gap-1.5 whitespace-nowrap px-2.5 text-body font-extrabold outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-brand/40",
        active ? "flex-1" : "shrink-0",
        active
          ? "border border-hair bg-card text-ink shadow-xs"
          : disabled
            ? "cursor-not-allowed border border-transparent text-ink-4 opacity-60"
            : "border border-transparent text-ink-3 hover:bg-card/50 hover:text-ink",
      )}
    >
      {badge}
      <Icon className="size-3.5 shrink-0" />
      {active && <span className="truncate">{children}</span>}
      {active && chip && (
        <span className="shrink-0 rounded-glyph border border-tint-line bg-tint px-1.5 py-0.2 text-caption font-bold text-brand-deep">
          {chip}
        </span>
      )}
      {count !== undefined && (active || (alwaysCount && count > 0)) && (
        <span
          className={cn(
            "shrink-0 rounded-chip px-1.5 py-0.2 text-caption font-extrabold transition-colors",
            active ? "border border-brand/20 bg-tint-strong text-brand-deep" : "bg-black/5 text-ink-3",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
