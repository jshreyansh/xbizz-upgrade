"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/cn";

/**
 * The two-column frame every sign-in step shares: the narration on the dark
 * aurora at left, the step itself on a glass card at right. Sign-in, verify
 * and workspace setup each carried their own copy of it; the new steps
 * (organisation, invite, join, waiting) would have made seven.
 */
export function AuthStage({
  eyebrow, title, accent, body, footnote, children,
}: {
  eyebrow: string;
  title: string;
  /** The gradient half of the headline. */
  accent?: string;
  body: ReactNode;
  footnote?: ReactNode;
  /** The card's contents. */
  children: ReactNode;
}) {
  return (
    <div className="stage-in flex h-full w-full">
      <div className="relative z-[2] hidden min-w-0 flex-[1.12] flex-col justify-between text-white md:flex" style={{ padding: "54px 62px" }}>
        <div className="inline-flex items-center gap-2 text-title font-extrabold tracking-tight">
          <LogoMark size={24} />
          <span>swish<span className="text-brand">X</span></span>
        </div>
        <div>
          <div className="mb-5 inline-flex items-center gap-2 text-caption font-bold uppercase tracking-[.22em] text-white/60">
            <span aria-hidden className="inline-block h-px w-5" style={{ background: "linear-gradient(90deg,var(--brand),transparent)" }} />
            {eyebrow}
          </div>
          <h1 className="mb-5 max-w-[14ch] font-extrabold" style={{ fontSize: "clamp(38px,4.1vw,58px)", lineHeight: 1.01, letterSpacing: "-2.2px" }}>
            {title}{accent && " "}
            {accent && (
              <em className="not-italic" style={{ background: "linear-gradient(96deg,#ffd8c6,#ff8654 48%,#ffcbb4)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                {accent}
              </em>
            )}
          </h1>
          <div className="max-w-[46ch] text-body-lg leading-relaxed text-white/70">{body}</div>
        </div>
        <p className="m-0 text-caption text-white/35">{footnote ?? "SOC 2 Type II · ISO 27001 · GDPR · DPDP Act · 21 CFR Part 11 aligned"}</p>
      </div>

      <div className="relative z-[3] flex flex-1 items-center justify-center overflow-y-auto p-6 md:flex-[.9] md:p-10">
        <div
          className="relative my-auto w-full max-w-[430px] overflow-hidden rounded-card border border-white/60 bg-card shadow-modal"
          style={{ padding: "38px 36px" }}
        >
          <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 opacity-70" style={{ background: "linear-gradient(90deg,transparent,var(--brand),transparent)" }} />
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
      <h2 className="mb-2 text-display font-extrabold tracking-tight text-ink">{title}</h2>
      {children && <div className="mb-6 text-body-lg leading-relaxed text-ink-3">{children}</div>}
    </>
  );
}

/** The auth flow's own buttons: the lit primary and a plain secondary, full width. */
export function AuthButton({
  variant = "primary", className, children, ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "focus-ring inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-control px-5 py-3 text-body-lg font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary"
          ? "text-white"
          : "mt-2.5 border border-hair-2 bg-card text-ink hover:bg-subtle",
        className
      )}
      style={variant === "primary" ? { background: "linear-gradient(180deg,#ff5b2d,var(--brand))", boxShadow: "0 12px 26px -14px rgba(253,72,22,.95),inset 0 1px 0 rgba(255,255,255,.28)" } : undefined}
    >
      {children}
      {variant === "primary" && (
        <svg aria-hidden width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      )}
    </button>
  );
}

/** Small caps label over a group of choices. */
export function AuthLabel({ children }: { children: ReactNode }) {
  return <span className="mb-2 block text-caption font-extrabold uppercase tracking-[.11em] text-ink-4">{children}</span>;
}
