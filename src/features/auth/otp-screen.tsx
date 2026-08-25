"use client";

import { useEffect, useRef } from "react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

const DEMO_CODE = "704192";

export function OtpScreen() {
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-fill OTP after 420ms for demo
  useEffect(() => {
    const t = setTimeout(() => {
      DEMO_CODE.split("").forEach((digit, i) => {
        if (inputRefs.current[i]) {
          inputRefs.current[i]!.value = digit;
        }
      });
    }, 420);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="stage-in flex h-full w-full">
      {/* Left */}
      <div
        className="relative z-[2] flex min-w-0 flex-[1.12] flex-col justify-between"
        style={{ padding: "54px 62px", color: "#fff" }}
      >
        <div>
          <svg viewBox="0 0 120 24" fill="none" height={30} aria-label="SwishX">
            <text x="0" y="20" fill="white" fontSize="22" fontWeight="800" letterSpacing="-1">SwishX</text>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,.62)", fontWeight: 700, marginBottom: 22, display: "inline-flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 22, height: 1, background: "linear-gradient(90deg,var(--brand),transparent)", display: "inline-block" }} />
            Step 1 of 3 · Verify
          </div>
          <h1 style={{ fontSize: "clamp(38px,4.1vw,58px)", lineHeight: 1.01, fontWeight: 800, letterSpacing: "-2.2px", margin: "0 0 20px", maxWidth: "14ch" }}>
            One code.{" "}
            <em style={{ fontStyle: "normal", background: "linear-gradient(96deg,#ffd8c6,#ff8654 48%,#ffcbb4)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Then we build.</em>
          </h1>
          <p style={{ fontSize: 16.5, lineHeight: 1.62, color: "rgba(255,255,255,.7)", maxWidth: "46ch", margin: 0 }}>
            We never store passwords. A six-digit code, valid for ten minutes, is all it takes to open your workspace.
          </p>
        </div>
        <p style={{ margin: 0, fontSize: 11.5, color: "rgba(255,255,255,.34)", letterSpacing: ".01em" }}>
          SOC 2 Type II · ISO 27001 · GDPR · DPDP Act · 21 CFR Part 11 aligned
        </p>
      </div>

      {/* Right glass card */}
      <div className="relative z-[3] flex flex-[.9] items-center justify-center p-10">
        <div style={{ width: "100%", maxWidth: 430, background: "rgba(255,255,255,.97)", borderRadius: "var(--r-xl)", padding: "38px 36px", boxShadow: "var(--sh-4)", border: "1px solid rgba(255,255,255,.6)", position: "relative", overflow: "hidden" }}>
          <span style={{ position: "absolute", inset: "0 0 auto", height: 2, background: "linear-gradient(90deg,transparent,var(--brand),transparent)", opacity: 0.7 }} />
          <h2 style={{ fontSize: 27, letterSpacing: "-1.1px", margin: "0 0 8px", fontWeight: 800 }}>Check your inbox</h2>
          <p style={{ margin: "0 0 26px", color: "var(--ink-3)", fontSize: 14.5, lineHeight: 1.6 }}>
            We sent a six-digit code to <b>sivaprakasam.gnanam@swishx.com</b>.
          </p>

          {/* OTP boxes */}
          <div style={{ display: "flex", gap: 9, margin: "4px 0 6px" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                maxLength={1}
                inputMode="numeric"
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  textAlign: "center",
                  fontSize: 23,
                  fontWeight: 750,
                  border: "1px solid var(--hair-2)",
                  borderRadius: "var(--r)",
                  outline: "none",
                  background: "#fff",
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: 11.5, color: "var(--ink-4)", lineHeight: 1.65, marginBottom: 24 }}>
            Didn&apos;t get it? <a href="#" style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>Resend in 0:24</a> · <a href="#" style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>Use a magic link instead</a>
          </p>

          <button onClick={() => setAuthView("workspace")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, width: "100%", padding: "13px 22px", borderRadius: "var(--r)", fontWeight: 680, fontSize: 14.5, background: "linear-gradient(180deg,#ff5b2d,var(--brand))", color: "#fff", boxShadow: "0 12px 26px -14px rgba(253,72,22,.95),inset 0 1px 0 rgba(255,255,255,.28)" }}>
            Verify &amp; continue
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
          <button onClick={() => setAuthView("signin")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "13px 22px", borderRadius: "var(--r)", fontWeight: 680, fontSize: 14.5, background: "#fff", border: "1px solid var(--hair-2)", marginTop: 10 }}>
            Use a different email
          </button>
        </div>
      </div>
    </div>
  );
}
