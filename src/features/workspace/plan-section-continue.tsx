"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The footer action every section in a plan canvas ends with.
 *
 * The point is that it is the SAME affordance in every section, in the same
 * place, saying the same thing. Before this, four sections had a bespoke
 * confirm button, four had none, and each one decided for itself which section
 * to open next — which is why the flow had dead ends you had to hunt out of.
 * Sections advance through one ordered `advance()`; this is what triggers it.
 */
export interface PlanSectionContinueProps {
  onClick: () => void;
  /** Override only when the section confirms something specific. */
  label?: string;
  disabled?: boolean;
  /** Shown instead of the button when the section is not yet satisfiable. */
  hint?: string;
}

export function PlanSectionContinue({ onClick, label = "Save & Continue", disabled, hint }: PlanSectionContinueProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      {hint && <span className="text-label text-ink-3">{hint}</span>}
      <Button
        size="sm"
        variant="secondary"
        onClick={onClick}
        disabled={disabled}
        className="text-body font-bold gap-1 cursor-pointer"
      >
        <span>{label}</span>
        <ArrowRight className="size-3" />
      </Button>
    </div>
  );
}
