"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, FileText, Image as ImageIcon, Mail, Megaphone, Video, type LucideIcon } from "lucide-react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { AccountTypeConfirm, AccountTypePicker } from "@/features/auth/account-type-screen";
import { emailProblem, routeEmail, TRY_EMAILS, useAuthFlow } from "@/features/auth/auth-flow";
import { AuthButton, AuthCardHead, AuthStage } from "@/features/auth/auth-stage";
import { existingAccountFor, useSettingsStore, type AccountType, type Sector } from "@/features/settings/settings-store";

const MAKES: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Video", icon: Video },
  { label: "Image", icon: ImageIcon },
  { label: "Docs", icon: FileText },
  { label: "Ads", icon: Megaphone },
  { label: "Emails", icon: Mail },
];
const PROOF = [
  "Every claim cited to an approved source",
  "Ready for your MLR review",
  "Written to the label of each market",
];

/** What SwishX Studio makes, and the three things true of all of it. */
function WhatYouMake() {
  return (
    <div className="grid max-w-[520px] gap-7">
      <div className="grid grid-cols-5 gap-2">
        {MAKES.map((m, i) => (
          <div
            key={m.label}
            className="auth-rise flex flex-col items-center gap-2 rounded-panel border border-white/10 bg-white/[.04] py-4 text-white/85 transition-colors hover:border-white/25 hover:bg-white/[.08]"
            style={{ animationDelay: `${700 + i * 80}ms` }}
          >
            <m.icon className="size-5" style={{ color: "var(--brand-2)" }} />
            <span className="text-label font-semibold">{m.label}</span>
          </div>
        ))}
      </div>
      <ul className="grid gap-2.5">
        {PROOF.map((p) => (
          <li key={p} className="flex items-center gap-2.5 text-body text-white/70">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-ok-on-dark/15 text-ok-on-dark">
              <Check className="size-3 stroke-[3]" />
            </span>
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

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

export function SignInScreen({ mode }: { mode: "signin" | "signup" }) {
  const router = useRouter();
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);
  const { email: storedEmail, setEmail, setRoute, inviteId } = useAuthFlow();
  const [email, setDraft] = useState(storedEmail);
  const [error, setError] = useState<string>();
  const [type, setType] = useState<AccountType>();
  const [sector, setSector] = useState<Sector>();
  const [confirming, setConfirming] = useState(false);
  const [tryOpen, setTryOpen] = useState(false);
  /* Sign in is just the email; sign up adds what the organisation is. Each has its own address. An invite link is always a sign-in. */
  const setMode = (next: "signin" | "signup") => router.push(next === "signup" ? "/signup" : "/signin");

  /* Whether this email's company is already on SwishX Studio, and so has a type of its own. */
  const settings = useSettingsStore();
  const existing = existingAccountFor(settings, email);
  const isNew = !inviteId && !emailProblem(email) && !existing;
  const chosen = type === "agency" || (type === "lifesciences" && !!sector);
  const signingUp = mode === "signup" && !inviteId;
  /* Each mode points to the other when the email belongs there. */
  const wrongMode = !emailProblem(email) && (signingUp ? !!existing : isNew);

  /* Work email only: a personal address is stopped here, before any code is sent. */
  function proceed(address = email) {
    const problem = emailProblem(address);
    if (problem) { setError(problem); return; }
    if (wrongMode) return;
    if (signingUp) {
      if (!chosen) { setError("Choose what describes your organisation."); return; }
      setConfirming(true);
      return;
    }
    go(address);
  }

  function go(address = email) {
    /* Prototype: the seeded agency and company each own their domain, so the right one opens. */
    useSettingsStore.getState().switchAccountForEmail(address);
    useAuthFlow.getState().setChoice(signingUp && type ? { type, sector } : undefined);
    setEmail(address.trim());
    setRoute(routeEmail(address, inviteId));
    setAuthView("otp");
  }

  return (
    <AuthStage
      title="Your brand's whole team,"
      accent="on day one."
      body="Specialists who make videos, images, docs, ads and emails from your approved dossier, with every claim cited."
      /* The studio demo (StudioDemo) is hidden for now; this is the simpler picture. */
      aside={<WhatYouMake />}
    >
      {/* The mode is the heading; the line under it switches to the other one. */}
      <AuthCardHead title={signingUp ? "Create Your Account" : "Sign In to SwishX Studio"}>
        {inviteId ? (
          "Sign in with your work email."
        ) : (
          <>
            {signingUp ? "Already have an account? " : "New to SwishX Studio? "}
            <button
              type="button"
              onClick={() => { setMode(signingUp ? "signin" : "signup"); setError(undefined); }}
              className="cursor-pointer font-bold text-brand underline-offset-4 hover:text-brand-deep hover:underline"
            >
              {signingUp ? "Sign In" : "Create an Account"}
            </button>
          </>
        )}
      </AuthCardHead>

      <form onSubmit={(e) => { e.preventDefault(); proceed(); }} className="grid gap-4">
        {signingUp && (
          <AccountTypePicker type={type} sector={sector} onType={(t) => { setType(t); setError(undefined); }} onSector={(x) => { setSector(x); setError(undefined); }} />
        )}
        <Field
          type="email"
          label="Work Email"
          value={email}
          onChange={(e) => { setDraft(e.target.value); setError(undefined); }}
          placeholder="you@company.com"
          error={error}
          autoComplete="email"
        />
        {wrongMode && (
          <div className="rise-in flex items-center gap-2.5 rounded-panel border border-hair bg-canvas px-3 py-2.5">
            <span className="min-w-0 flex-1 text-label leading-snug text-ink-2">
              {signingUp
                ? <><b className="text-ink">{existing?.name}</b> is already on SwishX Studio.</>
                : <>No SwishX Studio account for <b className="text-ink">@{email.split("@")[1]}</b> yet.</>}
            </span>
            <button
              type="button"
              onClick={() => setMode(signingUp ? "signin" : "signup")}
              className="shrink-0 cursor-pointer text-label font-bold text-brand hover:text-brand-deep"
            >
              {signingUp ? "Sign In Instead" : "Sign Up Instead"}
            </button>
          </div>
        )}
        <AuthButton type="submit" disabled={wrongMode || (signingUp && !chosen)}>{signingUp ? "Sign Up" : "Sign In"}</AuthButton>
      </form>

      <AccountTypeConfirm
        open={confirming}
        type={type}
        sector={sector}
        onBack={() => setConfirming(false)}
        onConfirm={() => { setConfirming(false); go(); }}
      />

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

      {/* Prototype only: one address per path, so each sign-up flow can be walked. Folded, so it doesn't crowd the card. */}
      <div className="mt-5 rounded-panel border border-dashed border-hair-3 p-3">
        <button
          type="button"
          onClick={() => setTryOpen((o) => !o)}
          aria-expanded={tryOpen}
          className="flex w-full cursor-pointer items-center gap-1.5 text-micro font-extrabold uppercase tracking-wider text-ink-4"
        >
          Try a path
          <span className="rounded-glyph bg-warn-bg px-1.5 py-px normal-case tracking-normal text-warn">Prototype</span>
          <ChevronDown className={cn("ml-auto size-3.5 transition-transform", tryOpen && "rotate-180")} />
        </button>
        {tryOpen && (
        <div className="mt-2 grid gap-1.5">
          {(["Either", "Life sciences", "Agency"] as const).map((group) => (
          <div key={group} className="flex flex-wrap items-center gap-1.5">
          {group !== "Either" && <span className="w-full text-micro font-bold text-ink-4">{group === "Agency" ? "Agency · Brightwave Health" : "Life sciences · Velmora"}</span>}
          {TRY_EMAILS.filter((t) => t.group === group).map((t) => (
            <button
              key={t.email}
              type="button"
              title={t.email}
              onClick={() => { setDraft(t.email); setError(undefined); setMode(t.label === "New company" ? "signup" : "signin"); }}
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
        )}
      </div>
    </AuthStage>
  );
}
