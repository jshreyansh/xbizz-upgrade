"use client";

import { useState } from "react";
import { FileText, Library, ListChecks, Type } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useEmailStore } from "@/features/workspace/email-store";
import { EmailCanvas } from "@/features/workspace/email-canvas";
import { EmailPieceBrowser } from "@/features/workspace/email-piece-picker";
import { Tag, TickRow } from "@/features/workspace/email-plan-parts";
import { SENDER_PLURAL, type EmailBlock } from "@/features/workspace/email-options";
import type { EmailProject } from "@/features/workspace/email-project";

const Card = ({ icon: Icon, title, hint, children }: { icon: typeof Type; title: string; hint: string; children: React.ReactNode }) => (
  <section className="space-y-2.5 rounded-card border border-hair bg-card p-4 shadow-2xs">
    <div className="flex items-start gap-2.5">
      <span className="grid size-7 shrink-0 place-items-center rounded-glyph bg-tint text-brand-deep">
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0">
        <h3 className="text-body-lg font-[850] text-ink">{title}</h3>
        <p className="text-label text-ink-3">{hint}</p>
      </div>
    </div>
    {children}
  </section>
);

/**
 * The email plan: what SwishX drafted once the sources were settled. The
 * subject lines, the blocks and the look can only be suggested now — they are
 * written from the dossier, the approved piece and the user's files — so they
 * are chosen here, beside a live preview, rather than on Need your input.
 */
export function EmailPlanStep({ project: p }: { project: EmailProject }) {
  const setEmail = useEmailStore((s) => s.set);
  const [browsing, setBrowsing] = useState(false);
  const { email } = p;
  const who = SENDER_PLURAL[email.sender];
  const choice = email.subjectMode === "choice";

  /* Blocks under the source each was drafted from. */
  const groups: Array<{ id: string; label: string; blocks: EmailBlock[] }> = [
    { id: "dossier", label: `From the ${p.unbranded ? "disease information" : `${p.brandName} dossier`}`, blocks: p.blocks.filter((b) => (b.group ?? "dossier") === "dossier") },
    ...(p.startPiece ? [{ id: "piece", label: `From the ${p.startPiece.title}`, blocks: p.blocks.filter((b) => b.group === "piece") }] : []),
    ...email.files.map((f) => ({ id: `file-${f.name}`, label: `From your file ${f.name}`, blocks: p.blocks.filter((b) => b.id === `file-${f.name}`) })),
  ].filter((g) => g.blocks.length > 0);

  const looks = [{ id: null as string | null, title: "SwishX designs it" }, ...p.templates.map((t) => ({ id: t.id as string | null, title: t.title }))];

  return (
    <>
      <div className="shrink-0">
        <h2 className="text-display font-[850] tracking-tight text-ink">Email plan</h2>
        <p className="mt-0.5 text-body text-ink-3">Drafted from your sources. Choose the subject lines, blocks and documents, and how it looks.</p>
      </div>

      <div className="grid items-start gap-5 pb-24 xl:grid-cols-[minmax(0,1fr)_minmax(0,600px)]">
        <div className="min-w-0 space-y-3">
          <Card
            icon={Type}
            title={choice ? "Subject lines" : "Subject line"}
            hint={choice ? `Tick the ones ${who} can choose from. Each goes to MLR.` : "Pick one. It goes to MLR with the email."}
          >
            {p.subjects.map((line, i) => {
              const on = email.subjects.includes(i);
              return (
                <TickRow
                  key={line}
                  on={on}
                  title={line}
                  tag={<span className="text-label font-semibold text-ink-4">{line.length} characters</span>}
                  onToggle={() =>
                    setEmail({ subjects: !choice ? [i] : on ? (email.subjects.length > 1 ? email.subjects.filter((x) => x !== i) : email.subjects) : [...email.subjects, i].sort() })
                  }
                />
              );
            })}
          </Card>

          <Card
            icon={ListChecks}
            title="Blocks"
            hint={
              p.isHQ
                ? "Every ticked block is sent. Each comes from one approved claim and goes to MLR on its own."
                : `Ticked blocks are the set ${who} pick up to ${email.maxBlocks} from. Each goes to MLR on its own.`
            }
          >
            {groups.map((g) => (
              <div key={g.id} className="space-y-1.5">
                <div className="text-label font-bold text-ink-3">{g.label}</div>
                {g.blocks.map((b) => {
                  const on = !email.offBlocks.includes(b.id);
                  return (
                    <TickRow
                      key={b.id}
                      on={on}
                      onToggle={() => setEmail({ offBlocks: on ? [...email.offBlocks, b.id] : email.offBlocks.filter((x) => x !== b.id) })}
                      title={b.title}
                      tag={b.newClaim ? <Tag tone="warn">New claim · goes to MLR</Tag> : b.expires ? <Tag tone="warn">Source approval ends {b.expires}</Tag> : undefined}
                      detail={
                        <>
                          {b.text}
                          <span className="mt-0.5 block text-ink-4">
                            {b.newClaim ? "" : `${b.claimId} · `}
                            {b.source}
                          </span>
                        </>
                      }
                    />
                  );
                })}
              </div>
            ))}
          </Card>

          {!p.unbranded && (
            <Card icon={FileText} title="Documents" hint="Sent as link cards at the end of the email, never as attachments. Every click is tracked.">
              {p.pieces.length === 0 && <p className="text-label text-ink-3">No approved documents for {p.brandName} and this audience in the Content Library yet.</p>}
              {p.pieces
                .filter((pc) => email.attached.includes(pc.id))
                .map((pc) => (
                  <TickRow
                    key={pc.id}
                    on
                    onToggle={() => setEmail({ attached: email.attached.filter((x) => x !== pc.id) })}
                    title={pc.title}
                    tag={pc.id === p.startPiece?.id ? <Tag tone="lock">Built from</Tag> : undefined}
                    detail={`${pc.kind === "Video" ? "Video" : "Document"} · ${pc.spec} · ${pc.approval}`}
                  />
                ))}
              {p.pieces.length > 0 && (
                <Button size="sm" variant="secondary" onClick={() => setBrowsing(true)} className="h-7.5 gap-1.5 text-label font-bold">
                  <Library className="size-3.5" />
                  Add from Content Library
                </Button>
              )}
            </Card>
          )}
        </div>

        {/* The drafted email, live, with the look switched above it. */}
        <div className="min-w-0 space-y-2 xl:sticky xl:top-0">
          <div className="flex flex-wrap items-center gap-1.5" role="radiogroup" aria-label="Template">
            <span className="mr-1 text-label font-bold text-ink-3">Template</span>
            {looks.map((t) => {
              const on = (email.template ?? null) === t.id;
              return (
                <button
                  key={t.id ?? "swishx"}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setEmail({ template: t.id })}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-control border px-3 py-1.5 text-label font-bold transition",
                    on ? "border-brand bg-tint text-brand-deep" : "border-hair-2 bg-card text-ink-2 hover:border-hair-3"
                  )}
                >
                  {t.id === null && <LogoMark size={12} className="shrink-0 text-brand" />}
                  {t.title}
                </button>
              );
            })}
          </div>
          <div className="flex justify-center rounded-card bg-canvas p-4">
            <EmailCanvas project={p} view="inbox" />
          </div>
        </div>
      </div>

      {browsing && (
        <EmailPieceBrowser
          project={p}
          title="Add a document"
          picked={email.attached}
          onPick={(id) => {
            if (!email.attached.includes(id)) setEmail({ attached: [...email.attached, id] });
            setBrowsing(false);
          }}
          onClose={() => setBrowsing(false)}
        />
      )}
    </>
  );
}
