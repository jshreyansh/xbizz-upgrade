import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * The fixed-height bar at the top of a screen. Five near-identical copies of
 * `z-30 flex h-[60px] shrink-0 items-center border-b border-hair bg-card
 * px-3 sm:px-5` existed across the workspace screens before this.
 *
 * Height comes from --screen-header-h so the chrome stays one decision.
 */
export interface ScreenHeaderProps extends HTMLAttributes<HTMLElement> {
  /** Pinned to the right of the bar. */
  actions?: ReactNode;
  /** Push children to the outer edges without a separate actions slot. */
  spread?: boolean;
  /**
   * Closes the project. Drawn last, so it sits at the bar's far right
   * regardless of how a screen lays out its own actions — every screen that
   * enters a project (video, doc/image, at every stage of either) passes
   * this the same way, rather than each one growing its own ✕.
   */
  onClose?: () => void;
}

export const ScreenHeader = forwardRef<HTMLElement, ScreenHeaderProps>(
  function ScreenHeader({ actions, spread, onClose, className, children, ...props }, ref) {
    /* `onClose` renders outside the justify-between group rather than as a
       third child inside it: `spread` headers rely on exactly two children
       splitting the row, and a third would have shared in that split
       instead of sitting flush at the edge. Wrapping the existing content
       keeps that split working unchanged and gives the ✕ a fixed home. */
    const content = (
      <div className={cn("flex min-w-0 flex-1 items-center", (actions || spread) && "justify-between")}>
        {children}
        {actions}
      </div>
    );

    return (
      <header
        ref={ref}
        className={cn(
          "z-30 flex h-(--screen-header-h) shrink-0 items-center border-b border-hair bg-card px-3 sm:px-5",
          className,
        )}
        {...props}
      >
        {content}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project"
            title="Close project"
            className="focus-ring ml-2 grid size-8 shrink-0 place-items-center rounded-chip text-ink-3 transition hover:bg-black/5 hover:text-ink cursor-pointer"
          >
            <X className="size-4" />
          </button>
        )}
      </header>
    );
  },
);
