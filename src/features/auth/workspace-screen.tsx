"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

const PRIMARY_MARKETS = [
  { flag: "🇺🇸", label: "United States · FDA", desc: "Claims checked against the approved PI and OPDP promotional guidance" },
  { flag: "🇪🇺", label: "European Union · EMA", desc: "Claims checked against the SmPC and EFPIA code" },
];
const SECONDARY_MARKETS = ["🇬🇧 UK", "🇯🇵 Japan", "🇮🇳 India", "🇦🇺 Australia", "🇧🇷 Brazil"];
const THERAPY_AREAS = ["Cardiology", "Oncology", "Immunology", "Neurology"];

export function WorkspaceScreen() {
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);
  const [primaryMarket, setPrimaryMarket] = useState(0);
  const [secMarkets, setSecMarkets] = useState<string[]>(["🇬🇧 UK", "🇯🇵 Japan"]);
  const [therapies, setTherapies] = useState<string[]>(["Cardiology", "Oncology"]);

  const toggleSec = (m: string) => setSecMarkets((p) => p.includes(m) ? p.filter((x) => x !== m) : [...p, m]);
  const toggleTherapy = (t: string) => setTherapies((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);

  return (
    <div className="stage-in flex h-full w-full">
      {/* Left */}
      <div className="relative z-[2] flex min-w-0 flex-[1.12] flex-col justify-between" style={{ padding: "54px 62px", color: "#fff" }}>
        <div>
          <svg viewBox="0 0 120 24" fill="none" height={30} aria-label="SwishX">
            <text x="0" y="20" fill="white" fontSize="22" fontWeight="800" letterSpacing="-1">SwishX</text>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,.62)", fontWeight: 700, marginBottom: 22, display: "inline-flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 22, height: 1, background: "linear-gradient(90deg,var(--brand),transparent)", display: "inline-block" }} />
            Step 2 of 3 · Workspace
          </div>
          <h1 style={{ fontSize: "clamp(38px,4.1vw,58px)", lineHeight: 1.01, fontWeight: 800, letterSpacing: "-2.2px", margin: "0 0 20px", maxWidth: "14ch" }}>
            Your markets{" "}
            <em style={{ fontStyle: "normal", background: "linear-gradient(96deg,#ffd8c6,#ff8654 48%,#ffcbb4)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>set the rules.</em>
          </h1>
          <p style={{ fontSize: 16.5, lineHeight: 1.62, color: "rgba(255,255,255,.7)", maxWidth: "46ch", margin: 0 }}>
            Pick every market you operate in. Each asset is written against the label and promotional guidance of the market it ships to — so one dossier can produce an FDA-compliant US reel and an EMA-compliant EU reel without rewriting a claim.
          </p>
        </div>
        <p style={{ margin: 0, fontSize: 11.5, color: "rgba(255,255,255,.34)", letterSpacing: ".01em" }}>
          Markets can be added, per document, at any time in the Brief step.
        </p>
      </div>

      {/* Right glass card */}
      <div className="relative z-[3] flex flex-[.9] items-center justify-center p-10">
        <div style={{ width: "100%", maxWidth: 430, background: "rgba(255,255,255,.97)", borderRadius: "var(--r-xl)", padding: "38px 36px", boxShadow: "var(--sh-4)", border: "1px solid rgba(255,255,255,.6)", position: "relative", overflow: "hidden" }}>
          <span style={{ position: "absolute", inset: "0 0 auto", height: 2, background: "linear-gradient(90deg,transparent,var(--brand),transparent)", opacity: 0.7 }} />
          <h2 style={{ fontSize: 27, letterSpacing: "-1.1px", margin: "0 0 8px", fontWeight: 800 }}>Set up your workspace</h2>
          <p style={{ margin: "0 0 26px", color: "var(--ink-3)", fontSize: 14.5, lineHeight: 1.6 }}>This becomes the default for every dossier, reel and campaign your team produces.</p>

          {/* Org field */}
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", fontSize: 11, letterSpacing: ".11em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 8, fontWeight: 750 }}>Organisation</label>
            <input defaultValue="Meridian Therapeutics" style={{ width: "100%", padding: "13px 15px", border: "1px solid var(--hair-2)", borderRadius: "var(--r)", background: "#fff", fontSize: 15, outline: "none" }} />
          </div>

          {/* Primary market */}
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", fontSize: 11, letterSpacing: ".11em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 8, fontWeight: 750 }}>Primary market</label>
            <div style={{ display: "grid", gap: 9 }}>
              {PRIMARY_MARKETS.map((m, i) => (
                <button key={m.label} onClick={() => setPrimaryMarket(i)} style={{ display: "flex", gap: 13, alignItems: "flex-start", padding: "13px 14px", border: `1px solid ${primaryMarket === i ? "var(--brand)" : "var(--hair-2)"}`, borderRadius: "var(--r)", background: primaryMarket === i ? "var(--tint)" : "#fff", textAlign: "left", boxShadow: primaryMarket === i ? "0 0 0 3px rgba(253,72,22,.09)" : "none" }}>
                  <span style={{ fontSize: 19 }}>{m.flag}</span>
                  <span><b style={{ display: "block", fontSize: 14, marginBottom: 2 }}>{m.label}</b><span style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>{m.desc}</span></span>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary markets */}
          <div style={{ marginTop: 18, marginBottom: 15 }}>
            <label style={{ display: "block", fontSize: 11, letterSpacing: ".11em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 8, fontWeight: 750 }}>Also operating in</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SECONDARY_MARKETS.map((m) => (
                <button key={m} onClick={() => toggleSec(m)} style={{ padding: "8px 14px", border: `1px solid ${secMarkets.includes(m) ? "var(--brand)" : "var(--hair-2)"}`, borderRadius: 99, fontSize: 13, fontWeight: 650, background: secMarkets.includes(m) ? "var(--tint)" : "#fff", color: secMarkets.includes(m) ? "var(--brand-deep)" : "var(--ink)" }}>{m}</button>
              ))}
            </div>
          </div>

          {/* Therapy areas */}
          <div style={{ marginTop: 18, marginBottom: 26 }}>
            <label style={{ display: "block", fontSize: 11, letterSpacing: ".11em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 8, fontWeight: 750 }}>Therapy areas</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {THERAPY_AREAS.map((t) => (
                <button key={t} onClick={() => toggleTherapy(t)} style={{ padding: "8px 14px", border: `1px solid ${therapies.includes(t) ? "var(--brand)" : "var(--hair-2)"}`, borderRadius: 99, fontSize: 13, fontWeight: 650, background: therapies.includes(t) ? "var(--tint)" : "#fff", color: therapies.includes(t) ? "var(--brand-deep)" : "var(--ink)" }}>{t}</button>
              ))}
            </div>
          </div>

          <button onClick={() => setAuthView("team")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, width: "100%", padding: "13px 22px", borderRadius: "var(--r)", fontWeight: 680, fontSize: 14.5, background: "linear-gradient(180deg,#ff5b2d,var(--brand))", color: "#fff", boxShadow: "0 12px 26px -14px rgba(253,72,22,.95),inset 0 1px 0 rgba(255,255,255,.28)" }}>
            Meet your team
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
