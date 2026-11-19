import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Text } from "@/components/ui/text";

/**
 * The heading over one section of a page: "Dossiers", one line on what they
 * are, and the section's own buttons on the right.
 *
 * The sibling of PageHeading, one level down, with the same props. Thirteen
 * copies of `h2 text-title font-extrabold tracking-tight` over a `p text-body
 * text-ink-3`, with the actions aligned items-start in some and items-end in
 * others. End, so the buttons sit on the description's baseline rather than
 * floating at the title's cap height.
 *
 * `size="subhead"` is for a section inside a panel or a modal, where a 17px
 * heading would outrank the panel's own title.
 */
export function SectionHeading({
  title,
  description,
  eyebrow,
  actions,
  size = "title",
  as = "h2",
  className,
}: {
  /** Title Case: "Brand Kit". */
  title: ReactNode;
  /** Sentence case, one line: what is in the section. */
  description?: ReactNode;
  /** A small uppercase label above the title. */
  eyebrow?: ReactNode;
  /** Pinned to the right; wraps under the text on narrow screens. */
  actions?: ReactNode;
  size?: "subhead" | "title";
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <Text size="micro" weight="extrabold" tone="faint" uppercase tracking="wider" className="mb-1 block">{eyebrow}</Text>
        )}
        <Text as={as} size={size} weight="extrabold" tracking="tight" className="block">{title}</Text>
        {description && (
          <Text as="p" size="body" tone="subtle" className="mt-0.5 block">{description}</Text>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
