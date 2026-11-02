"use client";

import { cn } from "@/lib/cn";
import { useEmailStore } from "@/features/workspace/email-store";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { AUDIENCE_LABEL, EMAIL_AUDIENCES, EMAIL_PURPOSES, purposesFor, senderInfo, sendersFor } from "@/features/workspace/email-options";

const RADIO = "flex items-start gap-3 rounded-control border p-3 text-left transition cursor-pointer";
const radioState = (on: boolean) => (on ? "border-brand bg-tint shadow-2xs ring-2 ring-brand/15" : "border-hair-2 bg-card hover:border-hair-3");
const Dot = ({ on }: { on: boolean }) => <span className={cn("mt-0.5 size-4 shrink-0 rounded-full border", on ? "border-[5px] border-brand" : "border-hair-3 bg-card")} />;

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
          <div className="grid gap-2 sm:grid-cols-4">
            {EMAIL_AUDIENCES.map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={audience === a}
                onClick={() => {
                  setAbout({ audience: a });
                  useWorkspaceStore.getState().setAudience(a);
                }}
                className={cn(RADIO, radioState(audience === a))}
              >
                <Dot on={audience === a} />
                <span className="min-w-0">
                  <span className="block text-body font-bold text-ink">{AUDIENCE_LABEL[a].title}</span>
                  <span className="mt-0.5 block text-label text-ink-3">{AUDIENCE_LABEL[a].hint}</span>
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
              return (
                <button key={id} type="button" aria-pressed={sender === id} onClick={() => setAbout({ sender: id })} className={cn(RADIO, radioState(sender === id))}>
                  <Dot on={sender === id} />
                  <span className="min-w-0">
                    <span className="block text-body font-bold text-ink">{info.long}</span>
                    <span className="mt-0.5 block text-label text-ink-3">{info.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="rounded-control border border-hair bg-canvas px-3 py-2 text-label text-ink-3">
          Sent by the <b className="font-bold text-ink-2">{senderInfo(senders[0], audience).long.toLowerCase()}</b> from your consumer email platform. Nobody personalises it.
        </p>
      )}

      <div className="space-y-2">
        <span className="text-label font-bold text-ink-2">What is it for?</span>
        <div className="flex flex-wrap gap-1.5">
          {purposesFor(sender, audience).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={purpose === id}
              onClick={() => setAbout({ purpose: id })}
              className={cn(
                "cursor-pointer rounded-control border px-3 py-1.5 text-body font-semibold transition",
                purpose === id ? "border-brand bg-tint text-brand-deep" : "border-hair-2 bg-card text-ink-2 hover:border-hair-3"
              )}
            >
              {EMAIL_PURPOSES[id].label}
            </button>
          ))}
        </div>
        {EMAIL_PURPOSES[purpose].unbranded && <p className="text-label text-ink-3">About the condition only: no product is named, so the email carries no safety information.</p>}
      </div>

    </div>
  );
}
