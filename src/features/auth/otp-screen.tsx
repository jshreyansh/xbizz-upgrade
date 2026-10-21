"use client";

import { useEffect, useRef } from "react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { useAuthFlow } from "@/features/auth/auth-flow";
import { AuthButton, AuthCardHead, AuthStage } from "@/features/auth/auth-stage";
import { useAuthNext } from "@/features/auth/auth-steps";

const DEMO_CODE = "704192";

export function OtpScreen() {
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);
  const email = useAuthFlow((s) => s.email);
  const path = useAuthFlow((s) => s.route.path);
  const next = useAuthNext();
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
    <AuthStage
      eyebrow={path === "new" ? "Step 1 of 4 · Verify" : "Verify your email"}
      title="One code."
      accent="Then we build."
      body="We never store passwords. A six-digit code, valid for ten minutes, is all it takes to open your workspace."
    >
      <AuthCardHead title="Check your inbox">
        We sent a six-digit code to <b className="text-ink [overflow-wrap:anywhere]">{email}</b>.
      </AuthCardHead>

      <div className="mb-1.5 mt-1 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            maxLength={1}
            inputMode="numeric"
            aria-label={`Digit ${i + 1}`}
            className="aspect-square w-full rounded-control border border-hair-2 bg-card text-center text-title font-bold text-ink outline-none focus:border-brand"
          />
        ))}
      </div>
      <p className="mb-6 text-caption leading-relaxed text-ink-4">
        Didn&apos;t get it? <a href="#" className="font-semibold text-brand">Resend in 0:24</a> · <a href="#" className="font-semibold text-brand">Use a magic link instead</a>
      </p>

      <AuthButton onClick={next}>Verify &amp; continue</AuthButton>
      <AuthButton variant="secondary" onClick={() => setAuthView("signin")}>Use a different email</AuthButton>
    </AuthStage>
  );
}
