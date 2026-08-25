"use client";

import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { TEAM } from "@/features/workspace/mock-personas";

export function TeamScreen() {
  const router = useRouter();
  const setIsFirstRun = useWorkspaceStore((s) => s.setIsFirstRun);

  function enterApp() {
    setIsFirstRun(true);
    router.push("/onboarding");
  }

  return (
    <div className="stage-in flex h-full w-full items-center justify-center p-11">
      <div style={{ width: "100%", maxWidth: 1040, textAlign: "center", color: "#fff" }}>
        <div style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,.62)", fontWeight: 700, marginBottom: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
          <span style={{ width: 22, height: 1, background: "linear-gradient(90deg,var(--brand),transparent)", display: "inline-block" }} />
          Step 3 of 3 · Your co-workers
        </div>
        <h2 style={{ fontSize: "clamp(32px,3.6vw,46px)", letterSpacing: "-1.9px", margin: "0 0 12px", fontWeight: 800 }}>Five specialists. One record of truth.</h2>
        <p style={{ color: "rgba(255,255,255,.68)", fontSize: 16, margin: "0 auto 46px", maxWidth: "58ch", lineHeight: 1.62 }}>
          They don&apos;t improvise. Every line one of them writes is retrieved from an allow-listed source, cited, and checked by the next person in the chain — or it never reaches the asset.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 15 }}>
          {TEAM.map((member, i) => (
            <div
              key={member.name}
              style={{
                background: "rgba(255,255,255,.055)",
                border: "1px solid rgba(255,255,255,.13)",
                backdropFilter: "blur(18px)",
                borderRadius: "var(--r-l)",
                padding: "24px 15px",
                position: "relative",
                overflow: "hidden",
                animation: `slide-up .8s var(--spring) ${0.08 + i * 0.12}s both`,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: "0 0 auto",
                  height: 1,
                  background: "linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent)",
                }}
              />
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  margin: "0 auto 13px",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: 18,
                  color: "#fff",
                  background: member.gradient,
                  boxShadow: "0 12px 26px -10px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,255,255,.3)",
                }}
              >
                {member.initials}
              </div>
              <b style={{ display: "block", fontSize: 14, marginBottom: 6 }}>{member.name}</b>
              <span style={{ fontSize: 11.5, color: "rgba(255,255,255,.58)", lineHeight: 1.55, display: "block" }}>{member.role}</span>
            </div>
          ))}
        </div>

        <button
          onClick={enterApp}
          style={{
            marginTop: 46,
            padding: "15px 32px",
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            borderRadius: "var(--r)",
            fontWeight: 680,
            fontSize: 15,
            background: "linear-gradient(180deg,#ff5b2d,var(--brand))",
            color: "#fff",
            boxShadow: "0 12px 26px -14px rgba(253,72,22,.95),inset 0 1px 0 rgba(255,255,255,.28)",
          }}
        >
          Enter SwishX
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
