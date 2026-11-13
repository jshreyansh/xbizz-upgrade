"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { useAuthFlow } from "@/features/auth/auth-flow";
import { useSettingsStore, type AccountType } from "@/features/settings/settings-store";
import type { AuthView } from "@/types/content";

/**
 * The two-column frame every sign-in step shares: what this step is about on
 * the dark ground at left, the step itself on a card at right. One headline,
 * one paragraph and, where it helps, one thing to look at — the left side
 * explains, it doesn't advertise.
 */

/** Setting up a new account is the one path with a fixed number of steps; an agency's are named for an agency. */
export function newAccountSteps(type: AccountType): Array<{ view: AuthView; label: string }> {
  return type === "agency"
    ? [
        { view: "otp", label: "Verify email" },
        { view: "organisation", label: "Your agency" },
        { view: "workspace", label: "First workspace" },
        { view: "team", label: "Your team" },
      ]
    : [
        { view: "otp", label: "Verify email" },
        { view: "organisation", label: "Organisation" },
        { view: "workspace", label: "First workspace" },
        { view: "team", label: "Your team" },
      ];
}

function StepList() {
  const authView = useWorkspaceStore((s) => s.authView);
  const path = useAuthFlow((s) => s.route.path);
  const accountType = useSettingsStore((s) => s.accountType);
  const NEW_COMPANY_STEPS = newAccountSteps(accountType);
  const at = NEW_COMPANY_STEPS.findIndex((s) => s.view === authView);
  if (path !== "new" || at < 0) return null;
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-2" aria-label="Setting up your company">
      {NEW_COMPANY_STEPS.map((step, i) => (
        <li key={step.view} className="flex items-center gap-2">
          <span
            className={cn(
              "grid size-6 place-items-center rounded-full text-caption font-bold",
              i < at && "bg-white/15 text-white",
              i === at && "bg-brand text-white",
              i > at && "border border-white/20 text-white/45"
            )}
          >
            {i < at ? <Check className="size-3.5 stroke-[3]" /> : i + 1}
          </span>
          <span className={cn("text-label font-semibold", i === at ? "text-white" : "text-white/50")}>{step.label}</span>
          {i < NEW_COMPANY_STEPS.length - 1 && <span aria-hidden className="mx-1 h-px w-6 bg-white/20" />}
        </li>
      ))}
    </ol>
  );
}

/** The same assurance under every step. */
export const AUTH_FOOTNOTE = "SOC 2 Type II · ISO 27001 · GDPR · HIPAA and 21 CFR Part 11 aligned";

export function AuthStage({
  eyebrow, title, accent, body, aside, footnote, compact, children,
}: {
  eyebrow?: string;
  title: string;
  /** The part of the headline set in the brand colour. */
  accent?: string;
  body: ReactNode;
  /** One thing to look at under the paragraph, when the step has one. */
  aside?: ReactNode;
  footnote?: ReactNode;
  /** A smaller headline, when the aside is the thing to look at. */
  compact?: boolean;
  /** The card's contents. */
  children: ReactNode;
}) {
  const words = title.split(" ");
  const bodyAt = 260 + words.length * 75;
  return (
    <div className="stage-in flex h-full w-full">
      <div className="relative z-[2] hidden min-w-0 flex-[1.1] flex-col justify-between gap-10 overflow-y-auto px-14 py-12 text-white md:flex">
        <div className="inline-flex items-center gap-2 text-title font-extrabold tracking-tight">
          <LogoMark size={24} />
          <span>
            swish<span className="text-brand">X</span><span className="ml-1.5 font-semibold text-current opacity-60">Studio</span>
          </span>
        </div>

        <div className="max-w-[720px]">
          {eyebrow && <div className="auth-rise mb-4 text-caption font-bold uppercase tracking-[.18em] text-white/50">{eyebrow}</div>}
          {/* Word by word, then the coloured phrase as one, with its sheen. */}
          <h1 className="m-0 font-extrabold text-balance" style={{ fontSize: compact ? "clamp(28px, 2.6vw, 40px)" : "clamp(38px, 4vw, 60px)", lineHeight: 1.06, letterSpacing: "-0.04em" }}>
            {words.map((w, i) => (
              <span key={i}>
                <span className="auth-word" style={{ animationDelay: `${120 + i * 75}ms` }}>{w}</span>{" "}
              </span>
            ))}
            {accent && (
              <span className="auth-word" style={{ animationDelay: `${120 + words.length * 75 + 60}ms` }}>
                <span className="auth-sheen">{accent}</span>
              </span>
            )}
          </h1>
          <div className={cn("auth-rise max-w-[56ch] leading-relaxed text-white/65", compact ? "mt-3 text-body" : "mt-5 text-body-lg")} style={{ animationDelay: `${bodyAt}ms` }}>
            {body}
          </div>
          {aside && (
            <div className={cn("auth-rise", compact ? "mt-7" : "mt-9")} style={{ animationDelay: `${bodyAt + 150}ms` }}>
              {aside}
            </div>
          )}
        </div>

        <div className="grid gap-5">
          <StepList />
          <p className="m-0 text-caption text-white/35">{footnote ?? AUTH_FOOTNOTE}</p>
        </div>
      </div>

      <div className="relative z-[3] flex flex-1 items-center justify-center overflow-y-auto p-6 md:flex-[.9] md:p-10">
        <div className="auth-rise my-auto w-full max-w-[420px] rounded-card bg-card p-8 shadow-modal sm:p-9" style={{ animationDelay: "180ms" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** The card's heading and the line under it. */
export function AuthCardHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <>
      <h2 className="mb-2 text-display-lg font-extrabold tracking-tight text-ink">{title}</h2>
      {children && <div className="mb-6 text-body-lg leading-relaxed text-ink-3">{children}</div>}
    </>
  );
}

/** The auth flow's own buttons: the primary and a plain secondary, full width. */
export function AuthButton({
  variant = "primary", className, children, ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "focus-ring group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-control px-5 py-3 text-body-lg font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" ? "bg-brand text-white shadow-soft hover:bg-brand-deep" : "mt-2.5 border border-hair-2 bg-card text-ink hover:bg-subtle",
        className
      )}
    >
      {children}
      {variant === "primary" && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
    </button>
  );
}

/** The label over a group of choices: the same style as a field's label, so every question on a card reads alike. */
export function AuthLabel({ children }: { children: ReactNode }) {
  return <span className="mb-2 block text-label font-semibold text-ink-2">{children}</span>;
}
