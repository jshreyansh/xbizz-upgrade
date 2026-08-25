"use client";

import { useWorkspaceStore } from "@/features/workspace/workspace-store";

export function SignedOutScreen() {
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);

  return (
    <div className="stage-in flex h-full w-full items-center justify-center p-11">
      <div style={{ width: "100%", maxWidth: 460, textAlign: "center", color: "#fff" }}>
        {/* Ring icon */}
        <div
          style={{
            width: 76, height: 76, borderRadius: "50%", margin: "0 auto 22px",
            display: "grid", placeItems: "center",
            background: "rgba(255,255,255,.07)",
            border: "1px solid rgba(255,255,255,.18)",
            backdropFilter: "blur(14px)",
          }}
        >
          <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.9} strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5M21 12H9" />
          </svg>
        </div>

        <h2 style={{ fontSize: 34, letterSpacing: "-1.4px", margin: "0 0 10px", fontWeight: 800 }}>You&apos;re signed out</h2>
        <p style={{ color: "rgba(255,255,255,.66)", fontSize: 15, lineHeight: 1.65, margin: "0 auto 30px", maxWidth: "44ch" }}>
          Your session on this device has ended. Everything you made is safe in the Meridian Therapeutics workspace.
        </p>

        {/* Recap stats */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 30 }}>
          {[
            { val: "1", label: "dossier built" },
            { val: "1", label: "reel shipped" },
            { val: "5,000", label: "tokens used" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.13)",
                borderRadius: "var(--r)",
                padding: "12px 18px",
                minWidth: 106,
              }}
            >
              <b style={{ display: "block", fontSize: 20, fontWeight: 800, letterSpacing: "-.7px" }}>{s.val}</b>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>{s.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setAuthView("signin")}
          style={{ padding: "14px 30px", display: "inline-flex", alignItems: "center", gap: 9, borderRadius: "var(--r)", fontWeight: 680, fontSize: 15, background: "linear-gradient(180deg,#ff5b2d,var(--brand))", color: "#fff", boxShadow: "0 12px 26px -14px rgba(253,72,22,.95),inset 0 1px 0 rgba(255,255,255,.28)" }}
        >
          Sign back in
        </button>
        <p style={{ marginTop: 22, fontSize: 11.5, color: "rgba(255,255,255,.34)" }}>
          Signed in as sivaprakasam.gnanam@swishx.com
        </p>
      </div>
    </div>
  );
}
