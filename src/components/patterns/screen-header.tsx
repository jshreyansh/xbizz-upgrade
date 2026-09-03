import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
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
}

export const ScreenHeader = forwardRef<HTMLElement, ScreenHeaderProps>(
  function ScreenHeader({ actions, spread, className, children, ...props }, ref) {
    return (
      <header
        ref={ref}
        className={cn(
          "z-30 flex h-(--screen-header-h) shrink-0 items-center border-b border-hair bg-card px-3 sm:px-5",
          (actions || spread) && "justify-between",
          className,
        )}
        {...props}
      >
        {children}
        {actions}
      </header>
    );
  },
);
