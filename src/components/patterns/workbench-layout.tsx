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
  /** Left rail — scene list, page list. A complete element. Omit for two-pane. */
  rail?: ReactNode;
  main: ReactNode;
  /** Right inspector — chat, edit, claims. */
  panel?: ReactNode;
  /** Pinned strip under the main region. */
  bottomBar?: ReactNode;
  /** Overlays, positioned by themselves. */
  overlay?: ReactNode;

  panelWidth?: number;
  /** Supply this to make the panel drag-resizable. */
  onPanelWidthChange?: (width: number) => void;
  onPanelResizingChange?: (resizing: boolean) => void;
  panelStorageKey?: string;
  /** Floor for the region beside the panel; caps how wide a drag can go. */
  panelMinCanvas?: number;

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
  panelWidth = SIDE_PANEL_DEFAULT_WIDTH,
  onPanelWidthChange, onPanelResizingChange, panelStorageKey, panelMinCanvas,
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
        {/* The rail renders as given. Its width is genuinely screen-specific
            (the scene rail is responsive, the page rail is fixed) and it
            brings its own scroll, so a wrapper here could only fight it. */}
        {rail}

        {/* Every slot renders as given. The layout owns the root column and
            the row; each region owns its own element, width and scrolling.
            This is not fussiness — studio-screen cross-fades its rail and
            canvas (flex 0 <-> 1 with opacity), so a flex-1 wrapper here would
            pin the canvas open and break the collapse; and an extra
            overflow-hidden ancestor is what breaks the scroll contract that
            <Panel> exists to protect. The one exception is a bottom bar,
            which by definition needs a column to sit under. */}
        {bottomBar ? (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {main}
            <div className="shrink-0 border-t border-hair">{bottomBar}</div>
          </div>
        ) : main}

        {panel && (
          <SidePanel
            open={panelOpen}
            width={panelWidth}
            onWidthChange={onPanelWidthChange}
            onResizingChange={onPanelResizingChange}
            resizable={Boolean(onPanelWidthChange)}
            storageKey={panelStorageKey}
            {...(panelMinCanvas !== undefined && { minCanvas: panelMinCanvas })}
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
export type SplitLayoutProps = Omit<WorkbenchLayoutProps, "rail">;

export function SplitLayout(props: SplitLayoutProps) {
  return <WorkbenchLayout {...props} />;
}
