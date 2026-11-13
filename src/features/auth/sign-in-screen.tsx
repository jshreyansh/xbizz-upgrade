"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { StudioDemo } from "@/features/auth/studio-demo";
import { emailProblem, routeEmail, TRY_EMAILS, useAuthFlow } from "@/features/auth/auth-flow";
import { AuthButton, AuthCardHead, AuthStage } from "@/features/auth/auth-stage";
import { useSettingsStore } from "@/features/settings/settings-store";

function GoogleMark() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6z" />
      <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6v-3H1.8a12 12 0 0 0 0 10.6l3.8-3z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.6 11.6 0 0 0 12 0 12 12 0 0 0 1.8 6.1l3.8 3c.9-2.7 3.4-4.3 6.4-4.3z" />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg width={15} height={15} viewBox="0 0 23 23" aria-hidden>
      <path fill="#f35325" d="M1 1h10v10H1z" />
      <path fill="#81bc06" d="M12 1h10v10H12z" />
      <path fill="#05a6f0" d="M1 12h10v10H1z" />
      <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  );
}

export function SignInScreen() {
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);
  const { email: storedEmail, setEmail, setRoute, inviteId } = useAuthFlow();
  const [email, setDraft] = useState(storedEmail);
  const [error, setError] = useState<string>();

  /* Work email only: a personal address is stopped here, before any code is sent. */
  function proceed(address = email) {
    const problem = emailProblem(address);
    if (problem) { setError(problem); return; }
    /* Prototype: the seeded agency and company each own their domain, so the right one opens. */
    useSettingsStore.getState().switchAccountForEmail(address);
    setEmail(address.trim());
    setRoute(routeEmail(address, inviteId));
    setAuthView("otp");
  }

  return (
    <AuthStage
      title="Your brand's whole team,"
      accent="on day one."
      body="Specialists who make videos, images, docs, ads and emails from your approved dossier, with every claim cited."
      aside={<StudioDemo />}
      compact
      footnote="Claims come only from your approved sources · SOC 2 Type II · GDPR · HIPAA-aligned"
    >
      <AuthCardHead title="Sign in to SwishX Studio">
        Sign in with your work email. New here? We&apos;ll set up your company in about ninety seconds.
      </AuthCardHead>

      <form onSubmit={(e) => { e.preventDefault(); proceed(); }} className="grid gap-3">
        <Field
          type="email"
          label="Work email"
          value={email}
          onChange={(e) => { setDraft(e.target.value); setError(undefined); }}
          placeholder="you@company.com"
          error={error}
          autoComplete="email"
        />
        <AuthButton type="submit">Continue</AuthButton>
      </form>

      <div className="my-5 flex items-center gap-3 text-caption font-semibold text-ink-4">
        <span className="h-px flex-1 bg-hair" />
        or
        <span className="h-px flex-1 bg-hair" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {[
          { name: "Google", mark: <GoogleMark /> },
          { name: "Microsoft", mark: <MicrosoftMark /> },
        ].map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => proceed()}
            className="focus-ring flex cursor-pointer items-center justify-center gap-2 rounded-control border border-hair-2 bg-card py-2.5 text-body font-semibold text-ink transition hover:bg-subtle"
          >
            {p.mark}
            {p.name}
          </button>
        ))}
      </div>

      <p className="mt-5 text-caption leading-relaxed text-ink-4">
        By continuing you agree to the <a href="#" className="font-semibold text-ink-3 underline hover:text-ink">Terms</a> and{" "}
        <a href="#" className="font-semibold text-ink-3 underline hover:text-ink">Privacy Notice</a>.
      </p>

      {/* Prototype only: one address per path, so each sign-up flow can be walked. */}
      <div className="mt-5 rounded-panel border border-dashed border-hair-3 p-3">
        <span className="mb-2 flex items-center gap-1.5 text-micro font-extrabold uppercase tracking-wider text-ink-4">
          Try a path
          <span className="rounded-glyph bg-warn-bg px-1.5 py-px normal-case tracking-normal text-warn">Prototype</span>
        </span>
        <div className="grid gap-1.5">
          {(["Either", "Life sciences", "Agency"] as const).map((group) => (
          <div key={group} className="flex flex-wrap items-center gap-1.5">
          {group !== "Either" && <span className="w-full text-micro font-bold text-ink-4">{group === "Agency" ? "Agency · Brightwave Health" : "Life sciences · Velmora"}</span>}
          {TRY_EMAILS.filter((t) => t.group === group).map((t) => (
            <button
              key={t.email}
              type="button"
              title={t.email}
              onClick={() => { setDraft(t.email); setError(undefined); }}
              className={cn(
                "cursor-pointer rounded-chip border px-2 py-0.5 text-caption font-semibold transition-colors",
                email === t.email ? "border-brand bg-tint text-brand-deep" : "border-hair-2 bg-card text-ink-3 hover:border-ink-4 hover:text-ink"
              )}
            >
              {t.label}
            </button>
          ))}
          </div>
          ))}
        </div>
      </div>
    </AuthStage>
  );
}
