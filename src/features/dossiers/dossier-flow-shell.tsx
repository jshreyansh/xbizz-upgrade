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
  children: React.ReactNode;
}

export function DossierFlowShell({ step, stepLabel, backHref, children }: DossierFlowShellProps) {
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

  return (
    <div className="page-enter" style={{ maxWidth: 640, margin: "0 auto", paddingBottom: 48 }}>
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
        {children}
      </div>
    </div>
  );
}
