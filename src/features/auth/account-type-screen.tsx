"use client";

import { useEffect, useState } from "react";
import { Activity, Building2, Check, Dna, FlaskConical, Handshake, Pill, type LucideIcon } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { STARTING_CREDITS, creditsInUsd, useSettingsStore, type AccountType, type Sector } from "@/features/settings/settings-store";
import { ConfettiBurst } from "@/features/dossiers/confetti-burst";
import { AuthButton, AuthCardHead, AuthLabel, AuthStage } from "@/features/auth/auth-stage";

/**
 * A new account says what it is, once: a life sciences company making
 * content for its own brands, or an agency making it for its clients. The
 * choice sets the workflows that follow and can't be changed, so it's
 * confirmed before it's saved. Agencies are then welcomed with their
 * starting credits.
 */

const TYPES: Array<{ id: AccountType; title: string; body: string; icon: LucideIcon }> = [
  { id: "lifesciences", title: "Life Sciences Company", body: "Create content for your organization’s brands and products.", icon: FlaskConical },
  { id: "agency", title: "Agency Partner", body: "Create content for your life sciences clients.", icon: Handshake },
];

const SECTORS: Array<{ id: Sector; icon: LucideIcon }> = [
  { id: "Pharma", icon: Pill },
  { id: "Biotech", icon: Dna },
  { id: "Medtech", icon: Activity },
];

export function AccountTypeScreen() {
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);
  const confirmAccountType = useSettingsStore((s) => s.confirmAccountType);
  const [type, setType] = useState<AccountType>();
  const [sector, setSector] = useState<Sector>();
  const [confirming, setConfirming] = useState(false);
  const complete = type === "agency" || (type === "lifesciences" && !!sector);

  const confirm = () => {
    if (!type) return;
    confirmAccountType(type, sector);
    setConfirming(false);
    setAuthView(type === "agency" ? "reward" : "organisation");
  };

  return (
    <AuthStage
      eyebrow="Account type"
      title="Built around"
      accent="who you make for."
      body="Life sciences companies make content for their own brands. Agencies make it for their clients. SwishX Studio sets up the workflows that fit."
    >
      <AuthCardHead title="Welcome to SwishX Studio">
        Tell us about your organization so we can tailor your content creation workflows.
      </AuthCardHead>

      <AuthLabel>Which best describes your organization?</AuthLabel>
      <div className="grid gap-2.5" role="radiogroup" aria-label="Which best describes your organization?">
        {TYPES.map((t) => {
          const on = type === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setType(t.id)}
              className={cn(
                "focus-ring flex cursor-pointer items-center gap-3 rounded-panel border p-3.5 text-left transition",
                on ? "border-brand bg-tint/60 ring-2 ring-brand/15" : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
              )}
            >
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-control", on ? "bg-brand text-white" : "bg-subtle text-ink-3")}>
                <t.icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <b className="block text-body-lg font-bold text-ink">{t.title}</b>
                <span className="block text-label leading-snug text-ink-3">{t.body}</span>
              </span>
              <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border", on ? "border-brand bg-brand text-white" : "border-hair-3")}>
                {on && <Check className="size-3 stroke-[3]" />}
              </span>
            </button>
          );
        })}
      </div>

      {type === "lifesciences" && (
        <div className="rise-in mt-5">
          <AuthLabel>Which sector best describes your company?</AuthLabel>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Which sector best describes your company?">
            {SECTORS.map((x) => {
              const on = sector === x.id;
              return (
                <button
                  key={x.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setSector(x.id)}
                  className={cn(
                    "focus-ring flex cursor-pointer flex-col items-center gap-1.5 rounded-panel border py-3 text-body font-bold transition",
                    on ? "border-brand bg-tint/60 text-brand-deep ring-2 ring-brand/15" : "border-hair-2 bg-card text-ink hover:border-hair-3 hover:bg-canvas"
                  )}
                >
                  <x.icon className="size-5" />
                  {x.id}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="mb-5 mt-4 text-label leading-snug text-ink-3">
        Your selection determines the workflows available in SwishX Studio and cannot be changed once confirmed.
      </p>

      <AuthButton onClick={() => setConfirming(true)} disabled={!complete}>Continue</AuthButton>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Confirm your account type"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirming(false)}>Go back</Button>
            <Button onClick={confirm}>Confirm and continue</Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <div className="flex items-center gap-3 rounded-panel border border-hair bg-canvas p-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-control bg-brand text-white">
              {type === "agency" ? <Handshake className="size-5" /> : <Building2 className="size-5" />}
            </span>
            <span className="min-w-0">
              <span className="block text-caption font-bold uppercase tracking-wider text-ink-4">Selected account</span>
              <b className="block text-body-lg text-ink">
                {type === "agency" ? "Agency Partner" : `Life Sciences Company · ${sector}`}
              </b>
            </span>
          </div>
          <p className="text-body leading-relaxed text-ink-2">
            {type === "agency"
              ? "Your SwishX Studio workflows will be tailored to creating content for your life sciences clients. Once confirmed, your account type cannot be changed."
              : "Your SwishX Studio workflows will be tailored to this selection. Once confirmed, your account type and sector cannot be changed."}
          </p>
        </div>
      </Modal>
    </AuthStage>
  );
}

/** Counts up to a number, once, so the reward lands rather than just appears. */
function useCountUp(target: number, ms = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

/** An agency's welcome: shown once its credits have been added. */
export function AgencyRewardScreen() {
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);
  const credits = STARTING_CREDITS.agency;
  const shown = useCountUp(credits);

  return (
    <div className="stage-in relative flex h-full w-full flex-col overflow-y-auto px-6 py-10 text-white md:px-14 md:py-12">
      <div className="inline-flex items-center gap-2 text-title font-extrabold tracking-tight">
        <LogoMark size={24} />
        <span>
          swish<span className="text-brand">X</span><span className="ml-1.5 font-semibold text-current opacity-60">Studio</span>
        </span>
      </div>

      <div className="relative mx-auto my-auto w-full max-w-[460px] py-10">
        <div className="pointer-events-none absolute -inset-x-24 -top-10 bottom-0">
          <ConfettiBurst count={110} />
        </div>
        <div className="auth-rise relative overflow-hidden rounded-card bg-card px-8 pb-8 pt-9 text-center shadow-modal">
          <span aria-hidden className="absolute inset-x-0 -top-24 mx-auto size-56 rounded-full bg-brand/20 blur-3xl" />
          <h1 className="relative m-0 text-display-lg font-extrabold tracking-tight text-ink">A head start for your agency</h1>

          <div className="relative mt-6">
            <b className="block font-black tabular-nums leading-none tracking-tight text-brand" style={{ fontSize: "clamp(56px, 7vw, 76px)" }}>
              {shown.toLocaleString("en-US")}
            </b>
            <span className="mt-1 block text-title font-bold text-ink">complimentary credits</span>
            <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-chip bg-ok-bg px-3 py-1 text-body font-bold text-ok">
              <Check className="size-3.5 stroke-[3]" />
              Worth {creditsInUsd(credits)}
            </span>
          </div>

          <p className="relative mx-auto mt-6 max-w-[36ch] text-body-lg leading-relaxed text-ink-3">
            Welcome to SwishX Studio! Your credits have been added to your account. Bring your first client brief to life.
          </p>

          <div className="relative mt-7">
            <AuthButton onClick={() => setAuthView("organisation")}>Set up your agency</AuthButton>
          </div>
        </div>
      </div>
    </div>
  );
}
