"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ClipboardCheck, Clapperboard, Compass, PenLine, ShieldCheck, type LucideIcon } from "lucide-react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { TEAM, type TeamMember } from "@/features/workspace/mock-personas";
import { Mascot, mascotColour } from "@/features/workspace/mascot";
import { LogoMark } from "@/components/ui/logo-mark";
import { AuthButton, newAccountSteps } from "@/features/auth/auth-stage";
import { useSettingsStore } from "@/features/settings/settings-store";

/**
 * The last sign-up step: the specialists who work inside the studio.
 *
 * Shown as the chain they are — each one hands something to the next, and
 * nothing moves on until it has been checked — rather than five unrelated
 * cards. Each is a character of its own shape and colour, watching the
 * pointer and smiling when you reach them, with the icon of what they do.
 */

const ICON: Record<TeamMember["key"], LucideIcon> = {
  amber: Compass,
  brand: PenLine,
  green: ShieldCheck,
  blue: Clapperboard,
  violet: ClipboardCheck,
};

export function TeamScreen() {
  const router = useRouter();
  const setIsFirstRun = useWorkspaceStore((s) => s.setIsFirstRun);
  const [hovered, setHovered] = useState<number | null>(null);
  const steps = newAccountSteps(useSettingsStore((s) => s.accountType));

  /* Straight into the studio: sign-up has already said what it needed to. */
  function enterApp() {
    setIsFirstRun(false);
    router.push("/");
  }

  return (
    <div className="stage-in relative flex h-full w-full flex-col overflow-y-auto px-6 py-10 text-white md:px-14 md:py-12">
      <div className="inline-flex items-center gap-2 text-title font-extrabold tracking-tight">
        <LogoMark size={24} />
        <span>
          swish<span className="text-brand">X</span><span className="ml-1.5 font-semibold text-current opacity-60">Studio</span>
        </span>
      </div>

      <div className="mx-auto my-auto w-full max-w-[1080px] py-10 text-center">
        <div className="mb-4 text-caption font-bold uppercase tracking-[.18em] text-white/50">Step {steps.length} of {steps.length} · Your team</div>
        <h2 className="m-0 font-extrabold text-balance" style={{ fontSize: "clamp(30px, 3.2vw, 44px)", lineHeight: 1.08, letterSpacing: "-0.035em" }}>
          Five specialists. <span style={{ color: "var(--brand-2)" }}>One record of truth.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[58ch] text-body-lg leading-relaxed text-white/65">
          They work as a chain. Each hands their work to the next, every line is cited to an approved source, and nothing reaches your asset until it has been checked.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:items-stretch lg:gap-0">
          {TEAM.map((member, i) => {
            const Icon = ICON[member.key];
            const colour = mascotColour(member.key);
            return (
              <div
                key={member.name}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
                className="flex min-w-0 items-stretch lg:flex-1"
              >
                <div
                  className="relative flex min-w-0 flex-1 flex-col items-center overflow-hidden rounded-card border border-white/10 bg-white/[.04] px-4 pb-4 pt-6 transition-colors hover:border-white/20 hover:bg-white/[.06]"
                  style={{ animation: `slide-up .7s var(--spring) ${0.08 + i * 0.1}s both` }}
                >
                  {/* Their colour, faintly, behind the portrait. */}
                  <span aria-hidden className="absolute -top-16 left-1/2 size-44 -translate-x-1/2 rounded-full opacity-15 blur-3xl" style={{ background: colour }} />

                  <div className="relative mb-4 size-20">
                    <Mascot who={member.key} size={80} follow mood={hovered === i ? "happy" : "idle"} />
                    <span
                      title={member.name}
                      className="absolute -bottom-0.5 -right-1.5 grid size-6 place-items-center rounded-full bg-ink"
                      style={{ border: `1.5px solid ${colour}` }}
                    >
                      <Icon size={12} strokeWidth={2.4} color={colour} />
                    </span>
                  </div>

                  <b className="relative block text-body-lg font-bold">{member.name}</b>
                  <span className="relative mt-1.5 block text-label leading-snug text-white/55">{member.role}</span>

                  <span className="min-h-4 flex-1" />
                  <span className="relative inline-flex max-w-full items-center gap-1.5 rounded-chip border border-white/10 bg-white/[.06] px-2.5 py-1 text-caption font-semibold text-white/80">
                    <span className="size-1.5 shrink-0 rounded-full" style={{ background: colour }} />
                    <span className="truncate">{i === TEAM.length - 1 ? `Delivers ${member.handsOn.toLowerCase()}` : `Hands on ${member.handsOn.toLowerCase()}`}</span>
                  </span>
                </div>

                {/* The hand-off to the next specialist. */}
                {i < TEAM.length - 1 && (
                  <div aria-hidden className="hidden w-6 shrink-0 place-items-center lg:grid" style={{ animation: `fadeIn .6s ease ${0.3 + i * 0.1}s both` }}>
                    <ChevronRight className="size-4 text-white/35" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <AuthButton onClick={enterApp} className="w-auto px-8">Enter SwishX Studio</AuthButton>
        </div>
      </div>
    </div>
  );
}
