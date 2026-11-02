"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/** A row of the plan that is a tick box, the same in every section here. */
export function TickRow({ on, onToggle, title, detail, tag, disabled }: { on: boolean; onToggle: () => void; title: React.ReactNode; detail?: React.ReactNode; tag?: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "flex w-full items-start gap-3 rounded-control border p-3 text-left transition",
        disabled ? "cursor-not-allowed border-hair bg-canvas opacity-60" : "cursor-pointer",
        !disabled && (on ? "border-brand/40 bg-tint/60" : "border-hair-2 bg-card hover:border-hair-3")
      )}
    >
      <span className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded-chip border", on ? "border-brand bg-brand text-white" : "border-hair-3 bg-card")}>
        {on && <Check className="size-3 stroke-[3]" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 text-body font-bold text-ink">
          {title}
          {tag}
        </span>
        {detail && <span className="mt-0.5 block text-label text-ink-3">{detail}</span>}
      </span>
    </button>
  );
}

export const Tag = ({ tone, children }: { tone: "ok" | "lock" | "warn" | "danger"; children: React.ReactNode }) => (
  <span
    className={cn(
      "rounded-chip px-1.5 py-0.5 text-micro font-extrabold",
      tone === "ok" ? "bg-ok-bg text-ok" : tone === "warn" ? "bg-warn-bg text-warn" : tone === "danger" ? "bg-danger-bg text-danger" : "bg-subtle text-ink-3"
    )}
  >
    {children}
  </span>
);
