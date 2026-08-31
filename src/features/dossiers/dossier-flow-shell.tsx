"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { useDossierDraftStore } from "@/features/dossiers/dossier-draft-store";

const TOTAL_STEPS = 3;

interface DossierFlowShellProps {
  step: 1 | 2 | 3;
  stepLabel: string;
  /** Explicit back target — omit to use router.back(). */
  backHref?: string;
  /** Widens the card for two-column layouts (e.g. preview + refinement chat). */
  wide?: boolean;
  /** Assistant chat panel — when provided, renders as a right-hand column
   *  next to `children` and forces the wide layout, so every step can be
   *  driven by prompt alongside its manual form controls. */
  chat?: React.ReactNode;
  children: React.ReactNode;
}

export function DossierFlowShell({ step, stepLabel, backHref, wide, chat, children }: DossierFlowShellProps) {
  const router = useRouter();
  const reset = useDossierDraftStore((s) => s.reset);

  function handleBack() {
    if (backHref) router.push(backHref);
    else router.back();
  }

  function handleCancel() {
    reset();
    router.push("/dossiers");
  }

  const progress = (step / TOTAL_STEPS) * 100;
  const isWide = wide || !!chat;

  return (
    <div className="page-enter" style={{ maxWidth: isWide ? 1080 : 640, margin: "0 auto", paddingBottom: 48, transition: "max-width .3s var(--e)" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <button
          type="button"
          onClick={handleBack}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--ink-3)", padding: "7px 12px 7px 8px", borderRadius: "var(--r)", border: "1px solid var(--hair)", background: "#fff" }}
        >
          <ChevronLeft size={15} />
          Back
        </button>

        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-4)" }}>
          Step {step} of {TOTAL_STEPS} · {stepLabel}
        </span>

        <button
          type="button"
          onClick={handleCancel}
          title="Cancel"
          style={{ width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center", color: "var(--ink-3)", background: "#fff", border: "1px solid var(--hair)" }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, borderRadius: 99, background: "var(--hair)", marginBottom: 28, overflow: "hidden" }}>
        <span
          style={{
            display: "block",
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg,var(--brand),#ff9a5e)",
            borderRadius: 99,
            transition: "width .4s var(--e)",
          }}
        />
      </div>

      {/* Page content */}
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--hair)",
          borderRadius: "var(--r-xl)",
          boxShadow: "var(--sh-1)",
          padding: "32px 32px 30px",
        }}
      >
        {chat ? (
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 22, alignItems: "start" }}>
            <div style={{ minWidth: 0 }}>{children}</div>
            {/* Sticky so the agent stays in view while the left column's
                content (e.g. the long form's section list) scrolls past. */}
            <div style={{ position: "sticky", top: 16 }}>{chat}</div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
