"use client";

import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { BeatSources } from "@/features/onboarding/beat-sources";
import { BeatDossier } from "@/features/onboarding/beat-dossier";
import { BeatOutputs } from "@/features/onboarding/beat-outputs";
import { BeatChoice } from "@/features/onboarding/beat-choice";
import type { OnboardingBeat } from "@/types/content";

const TOTAL = 4;

export function OnboardingShell() {
  const router = useRouter();
  const beat = useWorkspaceStore((s) => s.onboardingBeat);
  const setOnboardingBeat = useWorkspaceStore((s) => s.setOnboardingBeat);
  const setIsFirstRun = useWorkspaceStore((s) => s.setIsFirstRun);

  function goNext() {
    if (beat < TOTAL) {
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
      style={{
        background: "linear-gradient(145deg,#181014,#120e10 40%,#1a1008)",
        fontFamily: "Figtree,system-ui,sans-serif",
      }}
    >
      {/* Warm mesh blobs */}
      <div className="pointer-events-none absolute inset-[-35%]" style={{ filter: "blur(80px)", opacity: 0.6 }}>
        {[
          { size: "42vw", left: "8%", top: "-10%", bg: "radial-gradient(circle,rgba(253,72,22,.36),transparent 64%)" },
          { size: "34vw", left: "62%", top: "10%", bg: "radial-gradient(circle,rgba(255,154,77,.22),transparent 66%)", delay: "-6s" },
          { size: "30vw", left: "20%", top: "58%", bg: "radial-gradient(circle,rgba(139,30,10,.28),transparent 68%)", delay: "-12s" },
          { size: "26vw", left: "72%", top: "60%", bg: "radial-gradient(circle,rgba(91,33,182,.2),transparent 70%)", delay: "-18s" },
        ].map((b, i) => (
          <span key={i} className="absolute rounded-full" style={{ width: b.size, height: b.size, left: b.left, top: b.top, background: b.bg, mixBlendMode: "screen", animation: `float 22s ease-in-out infinite alternate${b.delay ? ` ${b.delay}` : ""}` }} />
        ))}
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-9 py-7">
        <svg viewBox="0 0 120 24" fill="none" height={26} aria-label="SwishX">
          <text x="0" y="20" fill="white" fontSize="22" fontWeight="800" letterSpacing="-1">SwishX</text>
        </svg>
        {beat < TOTAL && (
          <button
            onClick={endIntro}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 640, color: "rgba(255,255,255,.52)", padding: "7px 14px", borderRadius: "var(--r)", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.05)" }}
          >
            Skip
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative z-10 mx-9" style={{ height: 2.5, background: "rgba(255,255,255,.1)", borderRadius: 99 }}>
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
        {beat === 2 && <BeatDossier />}
        {beat === 3 && <BeatOutputs />}
        {beat === 4 && <BeatChoice onDone={endIntro} />}
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
                background: beat === i + 1 ? "var(--brand)" : "rgba(255,255,255,.26)",
                transition: "all .35s var(--e)",
                display: "block",
              }}
            />
          ))}
        </div>

        {beat < TOTAL && (
          <button
            onClick={goNext}
            style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "12px 24px", borderRadius: "var(--r)", fontWeight: 680, fontSize: 14.5, background: "linear-gradient(180deg,#ff5b2d,var(--brand))", color: "#fff", boxShadow: "0 12px 26px -14px rgba(253,72,22,.95),inset 0 1px 0 rgba(255,255,255,.28)" }}
          >
            Next
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}
