"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * The "‹ Therapy Library" link above a detail page: the way back up.
 *
 * Six copies, three hovers (ink, brand-deep, brand). It is quiet on purpose,
 * ink-3 lifting to ink, because it is navigation rather than an action, and
 * a brand-coloured link at the top of the page competes with the page.
 *
 * `trail` adds further steps after the first, for a page two levels down:
 * ‹ Therapy Library / Oncology. Each step is a link; the page you are on is
 * not repeated, because the heading below already says it.
 */
export interface BackLinkStep {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
}

const LINK = "inline-flex cursor-pointer items-center gap-1.5 transition-colors hover:text-ink focus-ring rounded-glyph";

function Step({ href, onClick, className, children }: {
  href?: string; onClick?: () => void; className?: string; children: ReactNode;
}) {
  if (href) return <Link href={href} onClick={onClick} className={cn(LINK, className)}>{children}</Link>;
  return <button type="button" onClick={onClick} className={cn(LINK, className)}>{children}</button>;
}

export function BackLink({
  href,
  onClick,
  children,
  trail,
  className,
}: {
  href?: string;
  onClick?: () => void;
  /** Where it goes, in Title Case: "Therapy Library". No "Back to". */
  children: ReactNode;
  /** Further steps, shown after a slash: [{ label: "Oncology", onClick }]. */
  trail?: BackLinkStep[];
  className?: string;
}) {
  return (
    <nav aria-label="Back" className={cn("flex flex-wrap items-center gap-1.5 text-body-lg font-bold text-ink-3", className)}>
      <Step href={href} onClick={onClick}>
        <ChevronLeft size={15} aria-hidden />
        {children}
      </Step>
      {trail?.map((step, i) => (
        <Fragment key={i}>
          <span aria-hidden className="text-ink-4">/</span>
          <Step href={step.href} onClick={step.onClick}>{step.label}</Step>
        </Fragment>
      ))}
    </nav>
  );
}
