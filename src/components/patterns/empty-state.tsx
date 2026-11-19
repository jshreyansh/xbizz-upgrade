import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Text } from "@/components/ui/text";

/**
 * The dashed box that stands where a list would be: "No dossiers in Oncology
 * yet", and one line on how something gets here.
 *
 * Sixteen hand-rolled copies, all the same idea and drifting in the details:
 * title at body or body-lg, hint at label or body, ink-3 or ink-4, padding
 * anywhere from py-10 to py-16, an icon disc in brand or grey. This is the
 * two sizes they actually cluster into.
 *
 *   sm  inside a tab or a panel: body title, label hint, py-10
 *   md  a whole shelf is empty: body-lg title, body hint, py-14, icon disc
 *
 * `tone` is the fill. Most copies sat on the page with no fill of their own
 * (none); a few were a card on the canvas (card) or a well inside a white
 * panel (canvas).
 */
type EmptyTone = "none" | "card" | "canvas";
type EmptySize = "sm" | "md";

const tones: Record<EmptyTone, string> = {
  none: "",
  card: "bg-card",
  canvas: "bg-canvas",
};

export function EmptyState({
  icon,
  iconTone = "neutral",
  title,
  hint,
  action,
  tone = "none",
  size = "sm",
  className,
}: {
  /** A glyph, drawn in a disc above the title. */
  icon?: ReactNode;
  /** Grey for "nothing here"; brand when the box is an invitation to start. */
  iconTone?: "neutral" | "brand";
  /** Sentence case, no full stop: "No images yet". */
  title: ReactNode;
  /** One sentence on how something gets here. */
  hint?: ReactNode;
  /** One or two buttons, centred under the hint. */
  action?: ReactNode;
  tone?: EmptyTone;
  size?: EmptySize;
  className?: string;
}) {
  const md = size === "md";
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-panel border border-dashed border-hair-2 px-4 text-center",
        md ? "gap-2 py-14" : "gap-1 py-10",
        tones[tone],
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            "mb-1 grid place-items-center rounded-full",
            md ? "size-11" : "size-9",
            iconTone === "brand" ? "bg-tint text-brand-deep" : "bg-subtle text-ink-4",
          )}
        >
          {icon}
        </span>
      )}
      <Text as="p" size={md ? "body-lg" : "body"} weight="bold" tone="muted">{title}</Text>
      {hint && (
        <Text as="p" size={md ? "body" : "label"} tone="faint" className="max-w-[44ch]">{hint}</Text>
      )}
      {action && <div className="mt-2 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
