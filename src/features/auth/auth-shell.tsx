"use client";

import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { SignInScreen } from "@/features/auth/sign-in-screen";
import { OtpScreen } from "@/features/auth/otp-screen";
import { WorkspaceScreen } from "@/features/auth/workspace-screen";
import { TeamScreen } from "@/features/auth/team-screen";
import { SignedOutScreen } from "@/features/auth/signed-out-screen";

/** Aurora background blobs rendered behind all auth stages */
function Aurora() {
  return (
    <div
      className="pointer-events-none absolute inset-[-35%]"
      style={{ filter: "blur(80px)", opacity: 0.9 }}
    >
      {[
        { size: "58vw", left: "-6%", top: "-2%", bg: "radial-gradient(circle,#fd4816cc,transparent 63%)" },
        { size: "46vw", left: "30%", top: "38%", bg: "radial-gradient(circle,#ff9a4dbb,transparent 62%)", delay: "-5s" },
        { size: "44vw", left: "6%", top: "56%", bg: "radial-gradient(circle,#8b1e0aaa,transparent 64%)", delay: "-10s" },
        { size: "36vw", left: "46%", top: "-8%", bg: "radial-gradient(circle,#e0348a99,transparent 65%)", delay: "-15s" },
        { size: "30vw", left: "58%", top: "52%", bg: "radial-gradient(circle,#3b1d8f88,transparent 66%)", delay: "-8s" },
      ].map((blob, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            width: blob.size,
            height: blob.size,
            left: blob.left,
            top: blob.top,
            background: blob.bg,
            mixBlendMode: "screen",
            animation: `float 22s ease-in-out infinite alternate${blob.delay ? ` ${blob.delay}` : ""}`,
          }}
        />
      ))}
    </div>
  );
}

/** Grain overlay */
function Grain() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        opacity: 0.055,
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='.55'/></svg>\")",
      }}
    />
  );
}

/** Vignette */
function Vignette() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(120% 90% at 30% 40%,transparent 40%,rgba(0,0,0,.55) 100%)",
      }}
    />
  );
}

const STAGES = ["signin", "otp", "workspace", "team"] as const;

export function AuthShell() {
  const authView = useWorkspaceStore((s) => s.authView);

  return (
    <div className="relative flex h-full w-full overflow-hidden" style={{ background: "#06070a" }}>
      <Aurora />
      <Grain />
      <Vignette />

      {/* Stage content */}
      <div className="relative z-10 flex h-full w-full">
        {authView === "signin" && <SignInScreen />}
        {authView === "otp" && <OtpScreen />}
        {authView === "workspace" && <WorkspaceScreen />}
        {authView === "team" && <TeamScreen />}
        {authView === "signedout" && <SignedOutScreen />}
      </div>

      {/* Progress dots for signin → otp → workspace → team */}
      {STAGES.includes(authView as (typeof STAGES)[number]) && (
        <div
          className="absolute bottom-6 left-0 right-0 flex justify-center gap-[7px]"
          style={{ zIndex: 5 }}
        >
          {STAGES.map((stage) => (
            <span
              key={stage}
              style={{
                width: authView === stage ? 24 : 6,
                height: 6,
                borderRadius: 6,
                background: authView === stage ? "var(--brand)" : "rgba(255,255,255,.26)",
                transition: "all 0.35s var(--e)",
                display: "block",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
