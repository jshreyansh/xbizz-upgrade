"use client";

import { useEffect, useState } from "react";
import { Activity, Building2, Check, Dna, FlaskConical, Handshake, Lock, Pill, type LucideIcon } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { STARTING_CREDITS, creditsInUsd, type AccountType, type Sector } from "@/features/settings/settings-store";
import { ConfettiBurst } from "@/features/dossiers/confetti-burst";
import { AuthButton, AuthLabel } from "@/features/auth/auth-stage";

/**
 * A new account says what it is, once, on the sign-in card: a life sciences
 * company making content for its own brands, or an agency making it for its
 * clients. The choice sets the workflows that follow and can't be changed,
 * so it's confirmed first, and applied once the email is verified. Agencies
 * are then welcomed with their starting credits.
 */

const TYPES: Array<{ id: AccountType; title: string; body: string; icon: LucideIcon; tint: string; ink: string }> = [
  {
    id: "lifesciences", title: "Life Sciences Company", body: "Create content for your organisation’s brands and products.", icon: FlaskConical,
    tint: "linear-gradient(135deg,#eef2ff 0%,#e0f2fe 100%)", ink: "#4f46e5",
  },
  {
    id: "agency", title: "Agency Partner", body: "Create content for your life sciences clients.", icon: Handshake,
    tint: "linear-gradient(135deg,#fff1e8 0%,#fde7f1 100%)", ink: "#e8590c",
  },
];

const SECTORS: Array<{ id: Sector; icon: LucideIcon; hint: string }> = [
  { id: "Pharma", icon: Pill, hint: "Medicines" },
  { id: "Biotech", icon: Dna, hint: "Biologics and Cell Therapies" },
  { id: "Medtech", icon: Activity, hint: "Devices and Diagnostics" },
];

/** A small drawing for each type: a molecule for life sciences, two overlapping circles for an agency and its client. */
function TileArt({ id, ink }: { id: AccountType; ink: string }) {
  return id === "lifesciences" ? (
    <svg viewBox="0 0 120 48" className="absolute inset-0 h-full w-full" aria-hidden>
      <g stroke={ink} strokeOpacity=".28" strokeWidth="1.4" fill="none">
        <path d="M70 12 L84 20 L84 34 L70 42 L56 34 L56 20 Z" />
        <path d="M84 20 L98 12 M98 12 L112 20 M56 34 L42 42" />
      </g>
      {[[70, 12], [84, 20], [84, 34], [70, 42], [56, 34], [56, 20], [98, 12], [112, 20], [42, 42]].map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r={k % 3 === 0 ? 3.2 : 2.2} fill={ink} fillOpacity={k % 3 === 0 ? 0.45 : 0.25} />
      ))}
    </svg>
  ) : (
    <svg viewBox="0 0 120 48" className="absolute inset-0 h-full w-full" aria-hidden>
      <circle cx="78" cy="26" r="17" fill={ink} fillOpacity=".12" stroke={ink} strokeOpacity=".3" strokeWidth="1.4" />
      <circle cx="98" cy="26" r="17" fill={ink} fillOpacity=".08" stroke={ink} strokeOpacity=".3" strokeWidth="1.4" />
      <circle cx="88" cy="26" r="3" fill={ink} fillOpacity=".5" />
    </svg>
  );
}

/**
 * The choice, on the sign-up card. Shown only for a company new to SwishX
 * Studio: anyone joining an existing account inherits its type.
 */
export function AccountTypePicker({
  type, sector, onType, onSector,
}: {
  type?: AccountType;
  sector?: Sector;
  onType: (t: AccountType) => void;
  onSector: (s: Sector) => void;
}) {
  return (
    <div className="rise-in">
      <AuthLabel>Which best describes your organisation?</AuthLabel>
      <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Which best describes your organisation?">
        {TYPES.map((t) => {
          const on = type === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onType(t.id)}
              className={cn(
                "focus-ring group relative flex cursor-pointer flex-col overflow-hidden rounded-panel border bg-card text-left transition-all duration-300",
                on
                  ? "-translate-y-0.5 border-brand shadow-soft ring-2 ring-brand/15"
                  : "border-hair-2 hover:-translate-y-0.5 hover:border-hair-3 hover:shadow-soft"
              )}
            >
              {/* The type's picture, with its icon badge sitting on its edge. */}
              <span className="relative block h-14" style={{ background: t.tint }}>
                <TileArt id={t.id} ink={t.ink} />
                <span
                  className="absolute -bottom-4 left-3 grid size-9 place-items-center rounded-control bg-card shadow-soft ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-105"
                  style={{ color: t.ink }}
                >
                  <t.icon className="size-4.5" />
                </span>
                <span
                  className={cn(
                    "absolute right-2 top-2 grid size-5 place-items-center rounded-full transition-all duration-200",
                    on ? "scale-100 bg-brand text-white shadow-soft" : "scale-90 border border-hair-3 bg-card/80"
                  )}
                >
                  {on && <Check className="size-3 stroke-[3]" />}
                </span>
              </span>
              <span className="block px-3 pb-3 pt-6">
                <b className="block text-body font-bold leading-tight text-ink">{t.title}</b>
                <span className="mt-1 block text-label leading-snug text-ink-3">{t.body}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* The sector, in a panel that points back at the life sciences card. */}
      {type === "lifesciences" && (
        <div className="rise-in relative mt-3 rounded-panel border border-hair bg-canvas p-3">
          <span aria-hidden className="absolute -top-[7px] left-[22%] size-3 rotate-45 border-l border-t border-hair bg-canvas" />
          <AuthLabel>Which sector best describes your company?</AuthLabel>
          <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Which sector best describes your company?">
            {SECTORS.map((x) => {
              const on = sector === x.id;
              return (
                <button
                  key={x.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onSector(x.id)}
                  className={cn(
                    "focus-ring flex cursor-pointer flex-col items-center gap-1 rounded-control border px-1.5 py-2.5 text-center transition-all duration-200",
                    on ? "border-brand bg-card shadow-soft ring-2 ring-brand/15" : "border-transparent hover:border-hair-2 hover:bg-card"
                  )}
                >
                  <span className={cn("grid size-7 place-items-center rounded-full transition-colors", on ? "bg-brand text-white" : "bg-subtle text-ink-3")}>
                    <x.icon className="size-3.5" />
                  </span>
                  <b className={cn("text-body leading-none", on ? "text-brand-deep" : "text-ink")}>{x.id}</b>
                  <span className="text-micro leading-tight text-ink-4">{x.hint}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="mt-3 flex items-center gap-1.5 text-label leading-snug text-ink-3">
        <Lock className="size-3 shrink-0" />
        This sets your workflows and can&rsquo;t be changed later.
      </p>
    </div>
  );
}

/** "Are you sure?": the type can't be changed, so it's confirmed before anything is created. */
export function AccountTypeConfirm({
  open, type, sector, onBack, onConfirm,
}: {
  open: boolean;
  type?: AccountType;
  sector?: Sector;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onBack}
      title="Confirm Your Account Type"
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onBack}>Go Back</Button>
          <Button onClick={onConfirm}>Confirm and Continue</Button>
        </div>
      }
    >
      <div className="grid gap-4">
        <div className="flex items-center gap-3 rounded-panel border border-hair bg-canvas p-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-control bg-brand text-white">
            {type === "agency" ? <Handshake className="size-5" /> : <Building2 className="size-5" />}
          </span>
          <span className="min-w-0">
            <span className="block text-caption font-bold uppercase tracking-wider text-ink-4">Selected Account</span>
            <b className="block text-body-lg text-ink">{type === "agency" ? "Agency Partner" : `Life Sciences Company · ${sector}`}</b>
          </span>
        </div>
        <p className="text-body leading-relaxed text-ink-2">
          {type === "agency"
            ? "Your SwishX Studio workflows will be tailored to creating content for your life sciences clients. Once confirmed, your account type cannot be changed."
            : "Your SwishX Studio workflows will be tailored to this selection. Once confirmed, your account type and sector cannot be changed."}
        </p>
      </div>
    </Modal>
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
          <h1 className="relative m-0 text-display-lg font-extrabold tracking-tight text-ink">A Head Start for Your Agency</h1>

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
            <AuthButton onClick={() => setAuthView("organisation")}>Set Up Your Agency</AuthButton>
          </div>
        </div>
      </div>
    </div>
  );
}
