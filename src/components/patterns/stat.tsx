import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Text } from "@/components/ui/text";

/**
 * A number with what it counts under it: "12 / Dossiers".
 *
 * Four copies across the detail headers and the Claims Library tiles. Two
 * sizes, because they were two:
 *
 *   title    the detail-header row (Therapy area, Disease) and stat tiles,
 *            with a caption label
 *   subhead  a compact profile row (Product Detail), with an uppercase
 *            micro label so the smaller number still reads as a heading
 *
 * Always one solid figure, never "3/5": a count reads faster than a ratio.
 * Numbers get thousands separators and tabular figures so a row of stats
 * lines up.
 */
export function Stat({
  value,
  label,
  size = "title",
  align = "center",
  className,
}: {
  value: ReactNode;
  /** Title Case: "Sources", "Approved Claims". */
  label: ReactNode;
  size?: "subhead" | "title";
  align?: "center" | "start";
  className?: string;
}) {
  const shown = typeof value === "number" ? value.toLocaleString() : value;
  return (
    <div className={cn(align === "center" ? "text-center" : "text-left", className)}>
      <Text as="b" size={size} weight="extrabold" leading="none" tracking="tight" tabular className="block">
        {shown}
      </Text>
      {size === "subhead" ? (
        <Text size="micro" weight="bold" tone="faint" uppercase tracking="wide" className="mt-1 block">{label}</Text>
      ) : (
        <Text size="caption" tone="faint" className="mt-1 block">{label}</Text>
      )}
    </div>
  );
}
