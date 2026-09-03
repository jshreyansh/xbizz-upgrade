"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SidePanel, SIDE_PANEL_DEFAULT_WIDTH } from "@/components/patterns/side-panel";
import { atLeast, useLayout, type Layout } from "@/lib/use-breakpoint";

/**
 * The studio shape: header, optional left rail, main region, optional right
 * panel, optional bottom bar, plus overlays.
 *
 * SLOT-BASED ON PURPOSE. A screen declares WHAT its regions are; this decides
 * HOW they are presented at a given width. That is what lets the tablet and
 * (later) mobile presentations swap in — a panel becoming a sheet, a rail
 * becoming a filmstrip — without the six screens knowing anything about it.
 *
 * This step deliberately changes NOTHING at desktop width: the presentation
 * below is the current three-column behaviour, and the responsive rules sit
 * behind `autoCollapsePanelBelow`, which is off unless a caller opts in. That
 * keeps introducing the layout separable from changing how it behaves — doing
 * both at once is what made earlier regressions impossible to bisect.
 */
export interface WorkbenchLayoutProps {
  header?: ReactNode;
  /** Left rail — scene list, page list. Omit for a two-pane screen. */
  rail?: ReactNode;
  main: ReactNode;
  /** Right inspector — chat, edit, claims. */
  panel?: ReactNode;
  /** Pinned strip under the main region. */
  bottomBar?: ReactNode;
  /** Overlays, positioned by themselves. */
  overlay?: ReactNode;

  railWidth?: number;
  panelWidth?: number;
  /** Supply this to make the panel drag-resizable. */
  onPanelWidthChange?: (width: number) => void;
  onPanelResizingChange?: (resizing: boolean) => void;
  panelStorageKey?: string;

  /** Controlled: whether the right panel is showing. */
  panelOpen?: boolean;
  onPanelOpenChange?: (open: boolean) => void;

  /**
   * Close the panel automatically below this layout. Off by default so this
   * component can be adopted without any behaviour change; turned on in the
   * responsive step.
   */
  autoCollapsePanelBelow?: Layout;

  className?: string;
}

export function WorkbenchLayout({
  header, rail, main, panel, bottomBar, overlay,
  railWidth = 305, panelWidth = SIDE_PANEL_DEFAULT_WIDTH,
  onPanelWidthChange, onPanelResizingChange, panelStorageKey,
  panelOpen = true, onPanelOpenChange,
  autoCollapsePanelBelow,
  className,
}: WorkbenchLayoutProps) {
  const layout = useLayout();
  const collapsed = useRef(false);

  useEffect(() => {
    if (!autoCollapsePanelBelow || !onPanelOpenChange || !layout) return;
    const roomy = atLeast(layout, autoCollapsePanelBelow);
    // Only auto-close once on the way down, so a deliberate re-open sticks.
    if (!roomy && !collapsed.current) {
      collapsed.current = true;
      onPanelOpenChange(false);
    } else if (roomy) {
      collapsed.current = false;
    }
  }, [layout, autoCollapsePanelBelow, onPanelOpenChange]);

  return (
    <div className={cn("flex h-screen flex-col overflow-hidden bg-canvas", className)}>
      {header}

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {rail && (
          <aside
            className="flex min-h-0 shrink-0 flex-col overflow-hidden border-r border-hair"
            style={{ width: railWidth, minWidth: railWidth }}
          >
            {rail}
          </aside>
        )}

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-hidden">{main}</div>
          {bottomBar && <div className="shrink-0 border-t border-hair">{bottomBar}</div>}
        </main>

        {panel && (
          <SidePanel
            open={panelOpen}
            width={panelWidth}
            onWidthChange={onPanelWidthChange}
            onResizingChange={onPanelResizingChange}
            resizable={Boolean(onPanelWidthChange)}
            storageKey={panelStorageKey}
          >
            {panel}
          </SidePanel>
        )}

        {overlay}
      </div>
    </div>
  );
}

/**
 * The two-pane shape: header, main region, right panel. A WorkbenchLayout
 * without a rail — kept as its own name because that is what the directions,
 * plan and blueprint screens are, and naming it makes the archetype legible.
 */
export type SplitLayoutProps = Omit<WorkbenchLayoutProps, "rail" | "railWidth">;

export function SplitLayout(props: SplitLayoutProps) {
  return <WorkbenchLayout {...props} />;
}
