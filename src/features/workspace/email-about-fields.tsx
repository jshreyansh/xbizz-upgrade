"use client";

import {
  BookOpen,
  Briefcase,
  Calculator,
  CalendarCheck,
  CalendarDays,
  ChartLine,
  ClipboardList,
  HandCoins,
  HeartHandshake,
  Lightbulb,
  Lock,
  Megaphone,
  MessageCircleQuestion,
  PenLine,
  PiggyBank,
  Presentation,
  Reply,
  Rocket,
  Sprout,
  Stethoscope,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useEmailStore } from "@/features/workspace/email-store";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { AUDIENCE_OPTIONS } from "@/features/workspace/brand-modal-data";
import { AUDIENCE_LABEL, EMAIL_AUDIENCES, EMAIL_PURPOSES, isPersonalSender, purposesFor, senderInfo, sendersFor, type EmailPurpose, type EmailSender } from "@/features/workspace/email-options";

const SENDER_ICON: Record<EmailSender, LucideIcon> = { rep: Briefcase, msl: Stethoscope, hq: Megaphone, support: HeartHandshake };

const PURPOSE_ICON: Record<EmailPurpose, LucideIcon> = {
  followup: Reply,
  newdata: ChartLine,
  launch: Rocket,
  congress: CalendarDays,
  access: HandCoins,
  medq: MessageCircleQuestion,
  pub: BookOpen,
  mslcongress: Presentation,
  formulary: ClipboardList,
  value: Calculator,
  onboarding: Sprout,
  savings: PiggyBank,
  adherence: CalendarCheck,
  supportfu: HeartHandshake,
  awareness: Lightbulb,
  signup: UserPlus,
};

/** What this sender can change, as one short line under its name. */
const senderFreedoms = (sender: EmailSender) =>
  !isPersonalSender(sender) ? "Sent as approved" : sender === "msl" ? "Medical only · adds a note" : "Adds a note · picks blocks";

/* The start modal's own row: an icon tile, the choice, and its state on the right. */
const ROW = "group relative flex items-start gap-2.5 rounded-control border p-3 text-left shadow-2xs transition-all duration-150 cursor-pointer";
const rowState = (on: boolean) => (on ? "border-brand bg-tint ring-2 ring-brand/15 shadow-sm" : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas");
const IconTile = ({ icon: Icon, on }: { icon: LucideIcon; on: boolean }) => (
  <span className={cn("grid size-7 shrink-0 place-items-center rounded-glyph transition-colors mt-0.5", on ? "bg-brand text-white shadow-2xs" : "bg-tint text-brand-deep group-hover:bg-brand group-hover:text-white")}>
    <Icon className="size-3.5" />
  </span>
);
const Dot = ({ on }: { on: boolean }) => <span className={cn("size-4 shrink-0 rounded-full border transition-colors mt-0.5", on ? "border-[5px] border-brand" : "border-hair-3 bg-card")} />;

/**
 * The questions only an email asks: who sends it and what it is for — and,
 * outside the start modal, who it is for. The sender changes what can be
 * personalised, so it is asked rather than guessed. What it is built from
 * and how it looks are plan decisions, not start ones.
 *
 * Used by the start modal (which asks the audience in its own first step) and
 * again from the prompt screen's tile.
 */
export function EmailAboutFields({ withAudience = false }: { withAudience?: boolean }) {
  const { audience, sender, purpose, setAbout } = useEmailStore();
  const senders = sendersFor(audience);

  return (
    <div className="space-y-4">
      {withAudience && (
        <div className="space-y-2">
          <span className="text-label font-bold text-ink-2">Who is it for?</span>
          <div className="grid gap-2 sm:grid-cols-2">
            {EMAIL_AUDIENCES.map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={audience === a}
                onClick={() => {
                  setAbout({ audience: a });
                  useWorkspaceStore.getState().setAudience(a);
                }}
                className={cn(ROW, rowState(audience === a))}
              >
                <IconTile icon={AUDIENCE_OPTIONS.find((o) => o.id === a)?.icon ?? Stethoscope} on={audience === a} />
                <span className="min-w-0 flex-1">
                  <span className="block text-body font-bold text-ink">{AUDIENCE_LABEL[a].title}</span>
                  <span className="block truncate text-caption text-ink-3">{AUDIENCE_LABEL[a].hint}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {senders.length > 1 ? (
        <div className="space-y-2">
          <span className="text-label font-bold text-ink-2">Who sends it?</span>
          <div className={cn("grid gap-2", senders.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
            {senders.map((id) => {
              const info = senderInfo(id, audience);
              const on = sender === id;
              return (
                <button key={id} type="button" aria-pressed={on} title={info.hint} onClick={() => setAbout({ sender: id })} className={cn(ROW, rowState(on))}>
                  <IconTile icon={SENDER_ICON[id]} on={on} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-body font-bold text-ink">
                      {info.long}
                      {id === "msl" && <span className="ml-1 text-ink-3 font-semibold">(MSL)</span>}
                    </span>
                    <span className="mt-0.5 block text-caption text-ink-3 leading-snug">{info.subtitle}</span>
                    <span className="mt-1 flex items-center gap-1 text-caption font-semibold text-ink-4">
                      {isPersonalSender(id) ? <PenLine className="size-3 shrink-0" /> : <Lock className="size-3 shrink-0" />}
                      <span className="truncate">{senderFreedoms(id)}</span>
                    </span>
                  </span>
                  <Dot on={on} />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="flex items-center gap-2.5 rounded-control border border-hair bg-canvas px-3 py-2.5 text-label text-ink-3">
          <IconTile icon={SENDER_ICON[senders[0]]} on={false} />
          <span>
            Sent by the <b className="font-bold text-ink-2">{senderInfo(senders[0], audience).long.toLowerCase()}</b> from your consumer email platform. Nobody personalises it.
          </span>
        </p>
      )}

      <div className="space-y-2">
        <span className="text-label font-bold text-ink-2">What is it for?</span>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {purposesFor(sender, audience).map((id) => {
            const on = purpose === id;
            return (
              <button key={id} type="button" aria-pressed={on} title={EMAIL_PURPOSES[id].subtitle} onClick={() => setAbout({ purpose: id })} className={cn(ROW, rowState(on))}>
                <IconTile icon={PURPOSE_ICON[id]} on={on} />
                <span className="min-w-0 flex-1 text-body font-bold leading-snug text-ink">{EMAIL_PURPOSES[id].label}</span>
                <Dot on={on} />
              </button>
            );
          })}
        </div>
        {EMAIL_PURPOSES[purpose].unbranded && <p className="text-label text-ink-3">About the condition only: no product is named, so the email carries no safety information.</p>}
      </div>
    </div>
  );
}
