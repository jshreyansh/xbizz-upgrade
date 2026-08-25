"use client";

import { useCreationStore } from "@/features/creation/creation-store";

interface MVHeaderProps {
  currentSubStep?: 0 | 1 | 2;
}

export function MVHeader({ currentSubStep }: MVHeaderProps) {
  const stage = useCreationStore((s) => s.stage);
  const setStage = useCreationStore((s) => s.setStage);

  const STEPS = [
    { title: "Format", desc: "Short video or Digital Twin" },
    { title: "Sources", desc: "Brand Dossier or sample" },
    { title: "Audience & Voice", desc: "Who it speaks to" },
  ];

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Title block */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <span
          style={{
            width: 44,
            height: 44,
            borderRadius: "var(--r)",
            background: "linear-gradient(140deg,#ff7a3d,#c9310a)",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            boxShadow: "0 10px 24px -8px rgba(253,72,22,.85)",
            flexShrink: 0,
          }}
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="2" y="6" width="14" height="12" rx="2.5" />
            <path d="M16 10l6-3v10l-6-3z" />
          </svg>
        </span>
        <div>
          <h1 style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 800, letterSpacing: "-.6px" }}>Magic Video</h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>
            Three steps. We explain each one as you go — nothing here assumes you have done this before.
          </p>
        </div>
      </div>

      {/* 3-Step Wizard Step Bar */}
      {stage <= 3 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {STEPS.map((s, idx) => {
            const isCurrent = currentSubStep === idx;
            const isPassed = (currentSubStep ?? 0) > idx;
            return (
              <button
                key={s.title}
                onClick={() => isPassed && setStage((idx + 1) as 1 | 2 | 3)}
                disabled={!isPassed}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: "var(--r)",
                  background: isCurrent ? "var(--tint)" : isPassed ? "#fff" : "rgba(10,13,20,.03)",
                  border: `1.5px solid ${isCurrent ? "var(--brand)" : isPassed ? "var(--hair-2)" : "var(--hair)"}`,
                  textAlign: "left",
                  cursor: isPassed ? "pointer" : "default",
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: isCurrent ? "var(--brand)" : isPassed ? "var(--ok)" : "rgba(10,13,20,.12)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 11,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {isPassed ? (
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12l6 6L20 5" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </span>
                <div style={{ minWidth: 0 }}>
                  <b style={{ fontSize: 13, display: "block", color: isCurrent ? "var(--brand-deep)" : "var(--ink)" }}>{s.title}</b>
                  <span style={{ fontSize: 11, color: "var(--ink-4)", display: "block" }}>{s.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
