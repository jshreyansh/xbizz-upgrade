"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The one tab row for a page: underlined, with an optional count.
 *
 * Use it for the main split on any page — kinds of content, shelves, review
 * queues, settings sections, history inside a card. The app used to have three
 * (underline FilterTabs, a Segmented pill group, and a TabNav pill rail) for
 * what is one job, so the same idea looked different page to page. Underline
 * won because it is the tab Office, Teams and SharePoint users already know,
 * and the detail pages' headers already used it.
 *
 * Not for small view switches inside a page or editor (Grid / List, Inbox /
 * Phone): those stay a Segmented control, so a view toggle never reads as a
 * place to go.
 *
 * A tab with `href` renders as a link (Settings navigates by URL); without one
 * it calls `onSelect`. Scrolls sideways rather than wrapping when the row is
 * wider than the page.
 */
export interface PageTab {
  id: string;
  /** Title Case. */
  label: string;
  /** How many it holds. Leave out when the number means nothing. */
  count?: number;
  icon?: ReactNode;
  /** Navigates instead of selecting. */
  href?: string;
}

export function PageTabs({
  items,
  activeId,
  onSelect,
  ariaLabel,
  className,
}: {
  items: PageTab[];
  activeId: string;
  onSelect?: (id: string) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("flex items-end gap-5 overflow-x-auto border-b border-hair [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}
    >
      {items.map((tab) => {
        const on = tab.id === activeId;
        const cls = cn(
          "focus-ring -mb-px flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 pb-2.5 pt-1 text-body font-bold transition-colors",
          on ? "border-brand text-ink" : "border-transparent text-ink-3 hover:text-ink"
        );
        const inner = (
          <>
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn("rounded-glyph px-1.5 text-micro font-bold tabular-nums", on ? "bg-tint text-brand-deep" : "bg-subtle text-ink-4")}>{tab.count}</span>
            )}
          </>
        );
        return tab.href ? (
          <Link key={tab.id} href={tab.href} role="tab" aria-selected={on} className={cls}>
            {inner}
          </Link>
        ) : (
          <button key={tab.id} type="button" role="tab" aria-selected={on} onClick={() => onSelect?.(tab.id)} className={cls}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}
