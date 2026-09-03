import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/button";

/**
 * The pill used for specialities, topics, sources and filters — 80
 * hand-rolled copies before this existed. Chips became a core interaction
 * when the floating dropdowns were removed in favour of direct selection,
 * so `selected` is the important prop.
 *
 * Renders a <button> when interactive and a <span> when it is only a label,
 * so a non-interactive chip does not land in the tab order.
 */

type ChipTone = "default" | "brand" | "ok" | "warn" | "danger";
type ChipSize = "sm" | "md";

const unselected: Record<ChipTone, string> = {
  default: "border-hair-2 bg-card text-ink-2 hover:border-brand hover:text-brand",
  brand: "border-tint-line bg-tint text-brand-deep hover:border-brand",
  ok: "border-ok-line bg-ok-bg text-ok",
  warn: "border-warn-line bg-warn-bg text-warn",
  danger: "border-danger bg-danger-bg text-danger",
};

const selectedTone: Record<ChipTone, string> = {
  default: "border-brand bg-tint text-brand-deep",
  brand: "border-brand bg-brand text-white",
  ok: "border-ok bg-ok text-white",
  warn: "border-warn bg-warn text-white",
  danger: "border-danger bg-danger text-white",
};

const sizes: Record<ChipSize, string> = {
  sm: "h-6 px-2 text-micro gap-1",
  md: "h-7 px-2.5 text-label gap-1.5",
};

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLElement>, "onSelect"> {
  selected?: boolean;
  tone?: ChipTone;
  size?: ChipSize;
  iconLeft?: ReactNode;
  /** Shows a remove affordance. Requires onRemove. */
  removable?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
}

export const Chip = forwardRef<HTMLElement, ChipProps>(function Chip(
  { selected, tone = "default", size = "md", iconLeft, removable, onRemove,
    removeLabel = "Remove", className, children, onClick, ...props },
  ref,
) {
  const interactive = Boolean(onClick);
  const Tag = (interactive ? "button" : "span") as "button";

  return (
    <Tag
      ref={ref as React.Ref<HTMLButtonElement>}
      {...(interactive ? { type: "button" as const, onClick, "aria-pressed": selected } : {})}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border font-semibold transition-colors",
        interactive && "focus-ring cursor-pointer",
        selected ? selectedTone[tone] : unselected[tone],
        sizes[size],
        className,
      )}
      {...props}
    >
      {iconLeft}
      {children}
      {removable && onRemove && (
        <IconButton
          aria-label={removeLabel}
          size={6}
          className="-mr-1 ml-0.5 size-4 opacity-60 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden="true">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </IconButton>
      )}
    </Tag>
  );
});
