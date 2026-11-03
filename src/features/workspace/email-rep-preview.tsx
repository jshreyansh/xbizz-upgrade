"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import { cn } from "@/lib/cn";
import { EmailCanvas, recipientFor } from "@/features/workspace/email-canvas";
import { SENDER_AS, SENDER_PLURAL } from "@/features/workspace/email-options";
import type { EmailProject } from "@/features/workspace/email-project";

type Consent = "in" | "none" | "out";
const NOTE_MAX = 255;

const CONSENT: Record<Consent, { title: string; detail: string; tone: string }> = {
  in: { title: "Opted in to email for this brand", detail: "Captured 12 Aug 2026, recorded in the CRM", tone: "border-ok-line bg-ok-bg text-ok" },
  none: { title: "No email consent", detail: "Nothing on record", tone: "border-warn-line bg-warn-bg text-warn" },
  out: { title: "Opted out", detail: "Unsubscribed 2 Oct 2026", tone: "border-danger-line bg-danger-bg text-danger" },
};

/**
 * The email as a rep sends it, simulated so the marketer can test the locks
 * before MLR. Real sending happens in the CRM.
 *
 * It shows the two checks a CRM makes when the rep presses Send — consent for
 * this brand, and that every block is still approved — and lets you trip each.
 */
export function EmailRepPreview({ project: p, onClose }: { project: EmailProject; onClose: () => void }) {
  const { email, purpose } = p;
  const chooses = p.zoneType("blocks") === "choose";
  const choosesPiece = p.zoneType("piece") === "choose";
  const [picked, setPicked] = useState<string[]>(p.included.slice(0, 2).map((b) => b.id));
  const [note, setNote] = useState(p.sender.sampleNote);
  const recipient = recipientFor(p);
  const lastName = recipient.name.split(",")[0];
  const [pieces, setPieces] = useState<string[]>(p.attachedPieces.map((pc) => pc.id));
  /* Several approved subject lines: the rep picks one. */
  const subjectOptions = email.subjectMode === "choice" ? email.subjects.map((i) => p.subjects[i]).filter(Boolean) : [];
  const [subject, setSubject] = useState(subjectOptions[0] ?? p.subject);
  const [consent, setConsent] = useState<Consent>("in");
  const [future, setFuture] = useState(false);
  const [sent, setSent] = useState(false);
  const expired = future ? p.included.filter((b) => b.expires).map((b) => b.id) : [];
  const sentBlocks = chooses ? p.included.filter((b) => picked.includes(b.id)) : p.included;
  const gone = sentBlocks.find((b) => expired.includes(b.id));

  const blocker =
    consent === "out"
      ? `${lastName} opted out of this brand's email on 2 Oct 2026. It won't be sent.`
      : consent === "none"
        ? p.professional
          ? `No email consent on record for ${lastName}. Capture it in the CRM before sending.`
          : `${lastName} hasn't authorised contact. Patients sign up, and consent to being contacted, before any email.`
        : chooses && picked.length === 0
          ? "Pick at least one block."
          : gone
            ? `The "${gone.title}" block's approval ended on ${gone.expires}. Remove it to send.`
            : p.showNote && note.length > NOTE_MAX
              ? `The note is over ${NOTE_MAX} characters.`
              : null;

  return (
    <Modal
      open
      onClose={onClose}
      title={`Try it as ${SENDER_AS[email.sender]}`}
      description={`A simulation, to test what ${SENDER_PLURAL[email.sender]} can and can't change. Real sending happens in ${p.professional ? "your CRM" : "your patient support platform"}.`}
      size="xl"
    >
      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-subtle text-label font-black text-accent-blue">{recipient.initials}</span>
            <span className="min-w-0">
              <b className="block text-body-lg text-ink">{recipient.name}</b>
              <span className="block text-label text-ink-3">{recipient.role}</span>
            </span>
          </div>
          <div className={cn("rounded-control border px-3 py-2 text-label", CONSENT[consent].tone)}>
            <b className="block font-extrabold">{CONSENT[consent].title}</b>
            {CONSENT[consent].detail}
          </div>
          <div className="rounded-control border border-hair bg-canvas px-3 py-2">
            <span className="text-micro font-extrabold uppercase tracking-wide text-ink-4">Template</span>
            <b className="block text-body text-ink">{purpose.label} · Approved</b>
            <span className="block truncate text-label text-ink-3">{subject}</span>
          </div>

          {subjectOptions.length > 1 && (
            <div className="space-y-1.5">
              <span className="text-label font-bold text-ink-2">
                Subject line <span className="font-semibold text-ink-4">· pick one</span>
              </span>
              {subjectOptions.map((line) => {
                const on = subject === line;
                return (
                  <button
                    key={line}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setSubject(line);
                      setSent(false);
                    }}
                    className={cn("flex w-full cursor-pointer items-center gap-2.5 rounded-control border p-2 text-left text-body transition", on ? "border-brand/40 bg-tint/60" : "border-hair-2 bg-card")}
                  >
                    <span className={cn("size-4 shrink-0 rounded-full border", on ? "border-[5px] border-brand" : "border-hair-3")} />
                    <span className="min-w-0 flex-1 font-semibold text-ink">{line}</span>
                  </button>
                );
              })}
            </div>
          )}

          {chooses && (
            <div className="space-y-1.5">
              <span className="text-label font-bold text-ink-2">
                Blocks <span className="font-semibold text-ink-4">· pick which to send</span>
              </span>
              {p.included.map((b) => {
                const on = picked.includes(b.id);
                const isGone = expired.includes(b.id);
                return (
                  <button
                    key={b.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setPicked(on ? picked.filter((x) => x !== b.id) : [...picked, b.id]);
                      setSent(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-control border p-2 text-left text-body transition",
                      "cursor-pointer",
                      on ? "border-brand/40 bg-tint/60" : "border-hair-2 bg-card"
                    )}
                  >
                    <span className={cn("grid size-4 shrink-0 place-items-center rounded-chip border", on ? "border-brand bg-brand text-white" : "border-hair-3")}>{on && <Check className="size-3 stroke-[3]" />}</span>
                    <span className="min-w-0 flex-1 font-semibold text-ink">{b.title}</span>
                    {isGone && <span className="rounded-chip bg-danger-bg px-1.5 py-0.5 text-micro font-extrabold text-danger">Expired</span>}
                  </button>
                );
              })}
            </div>
          )}

          {choosesPiece && (
            <div className="space-y-1.5">
              <span className="text-label font-bold text-ink-2">
                Documents <span className="font-semibold text-ink-4">· tick which to send</span>
              </span>
              {p.attachedPieces.map((pc) => {
                const on = pieces.includes(pc.id);
                return (
                  <button
                    key={pc.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setPieces(on ? pieces.filter((x) => x !== pc.id) : [...pieces, pc.id]);
                      setSent(false);
                    }}
                    className={cn("flex w-full cursor-pointer items-center gap-2.5 rounded-control border p-2 text-left text-body transition", on ? "border-brand/40 bg-tint/60" : "border-hair-2 bg-card")}
                  >
                    <span className={cn("grid size-4 shrink-0 place-items-center rounded-chip border", on ? "border-brand bg-brand text-white" : "border-hair-3")}>{on && <Check className="size-3 stroke-[3]" />}</span>
                    <span className="min-w-0 flex-1 font-semibold text-ink">{pc.title}</span>
                  </button>
                );
              })}
            </div>
          )}

          {p.showNote && (
            <div>
              <Field
                multiline
                rows={3}
                label="Personal note"
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  setSent(false);
                }}
              />
              <div className={cn("mt-1 text-right text-caption", note.length > NOTE_MAX ? "font-extrabold text-danger" : "text-ink-4")}>
                {note.length} / {NOTE_MAX}
              </div>
            </div>
          )}

          {blocker ? (
            <div className="rounded-control border border-danger-line bg-danger-bg px-3 py-2 text-body font-semibold text-danger">{blocker}</div>
          ) : (
            sent && <div className="rounded-control border border-ok-line bg-ok-bg px-3 py-2 text-body font-bold text-ok">Sent. Logged on {lastName}&apos;s record with the template and block versions.</div>
          )}
          <Button disabled={!!blocker} onClick={() => setSent(true)} className="w-full justify-center gap-1.5 font-bold">
            <Send className="size-3.5" />
            Send
          </Button>
          <p className="text-label text-ink-3">{SENDER_PLURAL[email.sender][0].toUpperCase() + SENDER_PLURAL[email.sender].slice(1)} can&apos;t upload files or add links. They only pick from what you approved.</p>

          <div className="space-y-2 rounded-control border border-dashed border-hair-3 p-2.5">
            <span className="text-micro font-extrabold uppercase tracking-wide text-ink-4">Try what&apos;s checked at send</span>
            <Segmented className="w-fit">
              {(["in", "none", "out"] as Consent[]).map((c) => (
                <SegmentedButton
                  key={c}
                  active={consent === c}
                  onClick={() => {
                    setConsent(c);
                    setSent(false);
                  }}
                >
                  {c === "in" ? "Opted in" : c === "none" ? "No consent" : "Opted out"}
                </SegmentedButton>
              ))}
            </Segmented>
            {p.included.some((b) => b.expires) && (
              <button
                type="button"
                aria-pressed={future}
                onClick={() => {
                  setFuture(!future);
                  setSent(false);
                }}
                className="flex w-full cursor-pointer items-center gap-2 text-left text-label text-ink-2"
              >
                <span className={cn("grid size-4 shrink-0 place-items-center rounded-chip border", future ? "border-brand bg-brand text-white" : "border-hair-3")}>{future && <Check className="size-3 stroke-[3]" />}</span>
                Jump to after {p.included.find((b) => b.expires)?.expires}, when a block&apos;s approval ends
              </button>
            )}
          </div>
        </div>
        <div className="grid justify-items-center gap-2 rounded-panel bg-canvas p-4">
          <span className="text-micro font-extrabold uppercase tracking-wide text-ink-4">What {lastName} gets</span>
          <EmailCanvas project={p} view="rep" note={note} picked={picked} pieceIds={pieces} expired={expired} subject={subject} />
        </div>
      </div>
    </Modal>
  );
}
