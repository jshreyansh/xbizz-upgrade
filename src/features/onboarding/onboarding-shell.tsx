"use client";

import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { BeatSources } from "@/features/onboarding/beat-sources";
import { BeatOutputs } from "@/features/onboarding/beat-outputs";
import type { OnboardingBeat } from "@/types/content";
import { LogoMark } from "@/components/ui/logo-mark";

const TOTAL = 2;

export function OnboardingShell() {
  const router = useRouter();
  const beat = useWorkspaceStore((s) => s.onboardingBeat);
  const setOnboardingBeat = useWorkspaceStore((s) => s.setOnboardingBeat);
  const setIsFirstRun = useWorkspaceStore((s) => s.setIsFirstRun);

  const isLast = beat === TOTAL;

  function goNext() {
    if (!isLast) {
      setOnboardingBeat((beat + 1) as OnboardingBeat);
    }
  }

  function endIntro() {
    setIsFirstRun(false);
    router.push("/");
  }

  const progress = ((beat - 1) / (TOTAL - 1)) * 100;

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: "var(--canvas)" }}
    >
      {/* Soft ambient light — warm, low-opacity glow, brightest toward the
          right where the illustration sits */}
      <div className="pointer-events-none absolute inset-[-20%]" style={{ filter: "blur(90px)" }}>
        {[
          { size: "36vw", left: "62%", top: "6%", bg: "radial-gradient(circle,rgba(253,72,22,.16),transparent 68%)" },
          { size: "30vw", left: "78%", top: "48%", bg: "radial-gradient(circle,rgba(255,154,77,.14),transparent 70%)", delay: "-8s" },
          { size: "26vw", left: "4%", top: "62%", bg: "radial-gradient(circle,rgba(91,33,182,.06),transparent 70%)", delay: "-14s" },
        ].map((b, i) => (
          <span key={i} className="absolute rounded-full" style={{ width: b.size, height: b.size, left: b.left, top: b.top, background: b.bg, animation: `float 24s ease-in-out infinite alternate${b.delay ? ` ${b.delay}` : ""}` }} />
        ))}
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-9 py-7">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--ink)", fontSize: 20, fontWeight: 800, letterSpacing: "-1px" }}>
          <LogoMark size={22} />
          swish<span style={{ color: "var(--brand)" }}>X</span>
        </div>
        {!isLast && (
          <button
            onClick={endIntro}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 640, color: "var(--ink-3)", padding: "7px 14px", borderRadius: "var(--r)", border: "1px solid var(--hair)", background: "var(--surface-subtle)" }}
          >
            Skip
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative z-10 mx-9" style={{ height: 2.5, background: "var(--hair)", borderRadius: 99 }}>
        <span
          style={{
            display: "block",
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg,var(--brand),#ff9a5e)",
            borderRadius: 99,
            transition: "width .55s var(--e)",
          }}
        />
      </div>

      {/* Beat content */}
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-9 py-8">
        {beat === 1 && <BeatSources />}
        {beat === 2 && <BeatOutputs />}
      </div>

      {/* Bottom nav */}
      <div className="relative z-10 flex items-center justify-between px-9 pb-9">
        {/* Step dots */}
        <div style={{ display: "flex", gap: 7 }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <span
              key={i}
              style={{
                width: beat === i + 1 ? 24 : 6,
                height: 6,
                borderRadius: 6,
                background: beat === i + 1 ? "var(--brand)" : "var(--hair-2)",
                transition: "all .35s var(--e)",
                display: "block",
              }}
            />
          ))}
        </div>

        <button
          onClick={isLast ? endIntro : goNext}
          style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "12px 24px", borderRadius: "var(--r)", fontWeight: 680, fontSize: 14.5, background: "linear-gradient(180deg,#ff5b2d,var(--brand))", color: "#fff", boxShadow: "0 12px 26px -14px rgba(253,72,22,.5),inset 0 1px 0 rgba(255,255,255,.28)" }}
        >
          {isLast ? "Get started" : "Next"}
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
