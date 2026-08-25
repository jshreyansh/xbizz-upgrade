"use client";

import { useWorkspaceStore } from "@/features/workspace/workspace-store";

const MARKETS = ["🇺🇸 FDA", "🇪🇺 EMA", "🇬🇧 MHRA", "🇯🇵 PMDA", "🇮🇳 CDSCO", "🇦🇺 TGA", "🇧🇷 ANVISA", "+33 more"];
const STATS = [
  { val: "32", label: "content formats" },
  { val: "5", label: "Magic Engines" },
  { val: "5", label: "AI co-workers" },
  { val: "0", label: "uncited claims" },
];
const TICKER = [
  "Medical Writer drafted 18 sections from FDA label + PubMed",
  "MLR Reviewer held out 63 unsupported claims",
  "Creative Producer cut a 60s HCP reel in 11 minutes",
  "Project Manager pushed 4 assets into review",
];

export function SignInScreen() {
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);

  return (
    <div className="stage-in flex h-full w-full">
      {/* Left narration column */}
      <div
        className="relative z-[2] flex min-w-0 flex-[1.12] flex-col justify-between"
        style={{ padding: "54px 62px", color: "#fff" }}
      >
        {/* Wordmark */}
        <div>
          <svg viewBox="0 0 120 24" fill="none" height={30} aria-label="SwishX">
            <text x="0" y="20" fill="white" fontSize="22" fontWeight="800" letterSpacing="-1">
              SwishX
            </text>
          </svg>
        </div>

        <div>
          <div
            className="mb-[22px] inline-flex items-center gap-[9px] font-bold uppercase"
            style={{ fontSize: 11, letterSpacing: ".22em", color: "rgba(255,255,255,.62)" }}
          >
            <span
              style={{
                width: 22,
                height: 1,
                background: "linear-gradient(90deg,var(--brand),transparent)",
                display: "inline-block",
              }}
            />
            Medical-grade content · 40+ markets
          </div>

          <h1
            style={{
              fontSize: "clamp(38px,4.1vw,58px)",
              lineHeight: 1.01,
              fontWeight: 800,
              letterSpacing: "-2.2px",
              margin: "0 0 20px",
              maxWidth: "14ch",
            }}
          >
            Your brand&apos;s{" "}
            <em
              style={{
                fontStyle: "normal",
                background: "linear-gradient(96deg,#ffd8c6,#ff8654 48%,#ffcbb4)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              whole team
            </em>
            , on day one.
          </h1>

          <p style={{ fontSize: 16.5, lineHeight: 1.62, color: "rgba(255,255,255,.7)", maxWidth: "46ch", margin: 0 }}>
            A Content Strategist, Medical Writer, MLR Reviewer, Creative Producer and Project Manager — working from your dossier, citing every claim against the label that governs your market, and shipping review-ready assets in minutes.
          </p>

          {/* Stats */}
          <div className="mt-[38px] flex flex-wrap gap-[34px]">
            {STATS.map((s) => (
              <div key={s.label}>
                <b style={{ display: "block", fontSize: 27, fontWeight: 800, letterSpacing: "-1.1px" }}>{s.val}</b>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)", letterSpacing: ".02em" }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Market pills */}
          <div className="mt-[30px] flex flex-wrap gap-[7px]">
            {MARKETS.map((m) => (
              <span
                key={m}
                style={{
                  fontSize: 11.5,
                  fontWeight: 650,
                  padding: "5px 11px",
                  borderRadius: 99,
                  border: "1px solid rgba(255,255,255,.16)",
                  color: "rgba(255,255,255,.78)",
                  background: "rgba(255,255,255,.05)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {m}
              </span>
            ))}
          </div>

          {/* Ticker */}
          <div style={{ marginTop: 26, height: 24, overflow: "hidden", fontSize: 13.5, color: "rgba(255,255,255,.82)" }}>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                animation: "ticker 14s steps(4) infinite",
              }}
            >
              {TICKER.map((t) => (
                <li key={t} style={{ height: 24, lineHeight: "24px", display: "flex", alignItems: "center", gap: 9 }}>
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#5eead4",
                      boxShadow: "0 0 10px #5eead4",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 11.5, color: "rgba(255,255,255,.34)", letterSpacing: ".01em" }}>
          Every claim retrieved from allow-listed sources, cited, and fact-checked — or dropped. SOC 2 Type II · GDPR · HIPAA-aligned
        </p>
      </div>

      {/* Right glass card */}
      <div className="relative z-[3] flex flex-[.9] items-center justify-center p-10">
        <div
          style={{
            width: "100%",
            maxWidth: 430,
            background: "rgba(255,255,255,.97)",
            borderRadius: "var(--r-xl)",
            padding: "38px 36px",
            boxShadow: "var(--sh-4)",
            border: "1px solid rgba(255,255,255,.6)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top accent line */}
          <span
            style={{
              position: "absolute",
              inset: "0 0 auto",
              height: 2,
              background: "linear-gradient(90deg,transparent,var(--brand),transparent)",
              opacity: 0.7,
            }}
          />
          <h2 style={{ fontSize: 27, letterSpacing: "-1.1px", margin: "0 0 8px", fontWeight: 800 }}>Welcome to SwishX</h2>
          <p style={{ margin: "0 0 26px", color: "var(--ink-3)", fontSize: 14.5, lineHeight: 1.6 }}>
            Sign in with your work email. We&apos;ll set up your workspace, your markets and your team in about ninety seconds.
          </p>

          <div style={{ marginBottom: 15 }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                letterSpacing: ".11em",
                textTransform: "uppercase",
                color: "var(--ink-4)",
                marginBottom: 8,
                fontWeight: 750,
              }}
            >
              Work email
            </label>
            <input
              type="email"
              defaultValue="sivaprakasam.gnanam@swishx.com"
              placeholder="you@company.com"
              style={{
                width: "100%",
                padding: "13px 15px",
                border: "1px solid var(--hair-2)",
                borderRadius: "var(--r)",
                background: "#fff",
                fontSize: 15,
                outline: "none",
              }}
            />
          </div>

          <button
            onClick={() => setAuthView("otp")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              width: "100%",
              padding: "13px 22px",
              borderRadius: "var(--r)",
              fontWeight: 680,
              fontSize: 14.5,
              background: "linear-gradient(180deg,#ff5b2d,var(--brand))",
              color: "#fff",
              boxShadow: "0 12px 26px -14px rgba(253,72,22,.95),inset 0 1px 0 rgba(255,255,255,.28)",
              transition: ".22s var(--e)",
            }}
          >
            Continue
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              margin: "22px 0",
              color: "var(--ink-4)",
              fontSize: 11.5,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              fontWeight: 650,
            }}
          >
            <span style={{ flex: 1, height: 1, background: "var(--hair)" }} />
            or continue with
            <span style={{ flex: 1, height: 1, background: "var(--hair)" }} />
          </div>

          {/* SSO row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[("Google"), ("Microsoft")].map((provider) => (
              <button
                key={provider}
                onClick={() => setAuthView("otp")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  padding: 12,
                  border: "1px solid var(--hair-2)",
                  borderRadius: "var(--r)",
                  background: "#fff",
                  fontSize: 13.5,
                  fontWeight: 650,
                }}
              >
                {provider === "Google" ? (
                  <svg width={16} height={16} viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6z" />
                    <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A12 12 0 0 0 12 24z" />
                    <path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6v-3H1.8a12 12 0 0 0 0 10.6l3.8-3z" />
                    <path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.6 11.6 0 0 0 12 0 12 12 0 0 0 1.8 6.1l3.8 3c.9-2.7 3.4-4.3 6.4-4.3z" />
                  </svg>
                ) : (
                  <svg width={15} height={15} viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                )}
                {provider}
              </button>
            ))}
          </div>

          <p style={{ fontSize: 11.5, color: "var(--ink-4)", lineHeight: 1.65, marginTop: 20 }}>
            By continuing you agree to the{" "}
            <a href="#" style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>Terms</a>{" "}
            and{" "}
            <a href="#" style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>Privacy Notice</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
