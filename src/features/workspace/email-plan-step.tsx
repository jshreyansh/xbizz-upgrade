"use client";

import { useState } from "react";
import { Check, Eye, FileText, LayoutTemplate, Library, ListChecks, Plus, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";
import { PlanSectionShell, planState } from "@/features/workspace/plan-status";
import { PlanSectionContinue } from "@/features/workspace/plan-section-continue";
import { useEmailStore } from "@/features/workspace/email-store";
import { EmailCanvas, HEADER_ART } from "@/features/workspace/email-canvas";
import { EmailPieceBrowser } from "@/features/workspace/email-piece-picker";
import { Tag, TickRow } from "@/features/workspace/email-plan-parts";
import { SENDER_PLURAL, type EmailBlock, type EmailTemplate } from "@/features/workspace/email-options";
import type { EmailProject } from "@/features/workspace/email-project";

type SectionId = "subjects" | "blocks" | "documents" | "template";

/** A layout's shape, not a finished design: its header, then a bar per block it holds. */
function TemplateSketch({ template }: { template: EmailTemplate }) {
  return (
    <span className="grid w-36 overflow-hidden rounded-chip border border-hair bg-card shadow-2xs">
      {template.header === "letter" ? (
        <span className="mx-2.5 mb-1 mt-2.5 h-3 border-b-2 border-accent-violet" />
      ) : (
        <span className={template.header === "banner" ? "h-10" : "h-5"} style={{ background: HEADER_ART }} />
      )}
      <span className="grid gap-1 p-2.5">
        <span className="h-1 w-3/4 rounded-full bg-hair-3" />
        {Array.from({ length: Math.min(template.holds, 5) }, (_, i) => (
          <span key={i} className={cn("rounded-[3px] border border-hair-2", template.header === "plain" && i === 0 ? "h-4 bg-tint" : "h-2.5")} />
        ))}
        <span className="mt-0.5 h-2.5 w-14 rounded-full bg-accent-violet/70" />
      </span>
    </span>
  );
}

/**
 * The email plan: what SwishX drafted once the sources were settled, to be
 * confirmed. Need your input asked what should be in the email; this asks
 * about what SwishX made of it — the subject lines, the blocks, the documents
 * and the template — as the same kind of tiles, one decision each. Images
 * depend on the template, so they are made when the email is built.
 */
export function EmailPlanStep({ project: p }: { project: EmailProject }) {
  const setEmail = useEmailStore((s) => s.set);
  const [open, setOpen] = useState<SectionId | null>("subjects");
  const [browsing, setBrowsing] = useState(false);
  const [ownSubject, setOwnSubject] = useState("");
  const [preview, setPreview] = useState<EmailTemplate | null>(null);
  const { email } = p;
  const who = SENDER_PLURAL[email.sender];
  const choice = email.subjectMode === "choice";
  const order: SectionId[] = ["subjects", "blocks", ...(p.unbranded ? [] : (["documents"] as const)), "template"];
  const toggle = (id: SectionId) => setOpen(open === id ? null : id);
  const next = (id: SectionId) => setOpen(order[order.indexOf(id) + 1] ?? null);

  /* Blocks under the source each was drafted from. */
  const groups: Array<{ id: string; label: string; blocks: EmailBlock[] }> = [
    { id: "dossier", label: `From the ${p.unbranded ? "disease information" : `${p.brandName} dossier`}`, blocks: p.blocks.filter((b) => (b.group ?? "dossier") === "dossier") },
    ...(p.startPiece ? [{ id: "piece", label: `From the ${p.startPiece.title}`, blocks: p.blocks.filter((b) => b.group === "piece") }] : []),
    ...email.files.map((f) => ({ id: `file-${f.name}`, label: `From your file ${f.name}`, blocks: p.blocks.filter((b) => b.id === `file-${f.name}`) })),
  ].filter((g) => g.blocks.length > 0);

  const addSubject = () => {
    const line = ownSubject.trim();
    if (!line) return;
    const at = p.subjects.length;
    setEmail({ extraSubjects: [...email.extraSubjects, line], subjects: choice ? [...email.subjects, at] : [at] });
    setOwnSubject("");
  };

  return (
    <>
      <div className="shrink-0">
        <h2 className="text-display font-[850] tracking-tight text-ink">Email plan</h2>
        <p className="mt-0.5 text-body text-ink-3">Drafted from your sources. Confirm the subject lines, blocks and template, then build. Images are made with the template.</p>
      </div>

      <div className="stagger-children w-full min-w-0 space-y-3 pb-24">
        {/* 1. Subject lines */}
        <PlanSectionShell
          icon={Type}
          title={choice ? "Subject lines" : "Subject line"}
          summary={choice ? `${email.subjects.length} for ${who} to choose from` : `"${p.subject}"`}
          state={planState(email.subjects.length === 0)}
          source="drafted from your sources"
          open={open === "subjects"}
          onToggle={() => toggle("subjects")}
        >
          <div className="space-y-2">
            <p className="text-label text-ink-3">{choice ? `Tick the ones ${who} can choose from when sending.` : "Pick one."} Each goes to MLR with the email.</p>
            {p.subjects.map((line, i) => {
              const on = email.subjects.includes(i);
              return (
                <TickRow
                  key={`${line}-${i}`}
                  on={on}
                  title={line}
                  tag={
                    <>
                      <span className="text-label font-semibold text-ink-4">{line.length} characters</span>
                      {i >= p.subjects.length - email.extraSubjects.length && <Tag tone="lock">Yours</Tag>}
                    </>
                  }
                  onToggle={() => setEmail({ subjects: !choice ? [i] : on ? (email.subjects.length > 1 ? email.subjects.filter((x) => x !== i) : email.subjects) : [...email.subjects, i].sort() })}
                />
              );
            })}
            <div className="flex items-end gap-2 pt-1">
              <Field size="sm" className="flex-1" placeholder="Write your own subject line" maxLength={80} value={ownSubject} onChange={(e) => setOwnSubject(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSubject()} aria-label="Your own subject line" />
              <Button size="sm" variant="secondary" disabled={!ownSubject.trim()} onClick={addSubject} className="h-8 gap-1.5 text-label font-bold">
                <Plus className="size-3.5" />
                Add
              </Button>
            </div>
          </div>
          <PlanSectionContinue onClick={() => next("subjects")} />
        </PlanSectionShell>

        {/* 2. Content blocks, grouped by where each was drafted from */}
        <PlanSectionShell
          icon={ListChecks}
          title="Content blocks"
          summary={`${p.included.length} of ${p.blocks.length} blocks${p.isHQ ? " in the email" : ` for ${who} to pick from`}`}
          state={planState(p.included.length === 0)}
          error={p.included.length === 0 ? { title: "No blocks in the email", detail: "Tick at least one block." } : null}
          source="from your sources"
          open={open === "blocks"}
          onToggle={() => toggle("blocks")}
        >
          <div className="space-y-3">
            <p className="text-label text-ink-3">
              {p.isHQ ? "Every ticked block is sent." : `${who[0].toUpperCase() + who.slice(1)} pick which of the ticked blocks to send.`} Each comes from one approved claim and goes to MLR on its own.
            </p>
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
          </div>
          <PlanSectionContinue onClick={() => next("blocks")} />
        </PlanSectionShell>

        {/* 3. Documents that go with the email. Images come with the template, when the email is built. */}
        {!p.unbranded && (
          <PlanSectionShell
            icon={FileText}
            title="Documents"
            summary={p.attachedPieces.length ? `${p.attachedPieces.length} ${p.attachedPieces.length === 1 ? "document" : "documents"} as link cards` : "None yet"}
            state={planState(false)}
            source="from the Content Library"
            open={open === "documents"}
            onToggle={() => toggle("documents")}
          >
            <div className="space-y-2">
              <p className="text-label text-ink-3">Sent as link cards at the end of the email, never as attachments. Every click is tracked.</p>
              {p.attachedPieces.map((pc) => (
                <TickRow
                  key={pc.id}
                  on
                  onToggle={() => setEmail({ attached: email.attached.filter((x) => x !== pc.id) })}
                  title={pc.title}
                  tag={pc.id === p.startPiece?.id ? <Tag tone="lock">Built from</Tag> : undefined}
                  detail={`${pc.kind === "Video" ? "Video" : "Document"} · ${pc.spec} · ${pc.approval}`}
                />
              ))}
              {p.pieces.length > 0 ? (
                <Button size="sm" variant="secondary" onClick={() => setBrowsing(true)} className="h-7.5 gap-1.5 text-label font-bold">
                  <Library className="size-3.5" />
                  Add from Content Library
                </Button>
              ) : (
                <p className="text-label text-ink-3">No approved documents for {p.brandName} and this audience in the Content Library yet.</p>
              )}
            </div>
            <PlanSectionContinue onClick={() => next("documents")} />
          </PlanSectionShell>
        )}

        {/* 4. Template, as a grid of layouts */}
        <PlanSectionShell
          icon={LayoutTemplate}
          title="Template"
          summary={`${p.template.title} · holds ${p.template.holds} blocks`}
          state={planState(false)}
          source={p.template.from === "brand" ? "from your brand" : "SwishX layout"}
          open={open === "template"}
          onToggle={() => toggle("template")}
        >
          <div className="space-y-3">
            {(["swishx", "brand"] as const).map((from) => {
              const list = p.templates.filter((t) => t.from === from);
              if (list.length === 0) return null;
              return (
                <div key={from} className="space-y-2">
                  <div className="text-label font-bold text-ink-3">{from === "swishx" ? "SwishX layouts, in your brand kit" : `${p.brandName}'s email templates`}</div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {list.map((t) => {
                      const on = p.template.id === t.id;
                      const roomy = t.holds >= p.included.length;
                      return (
                        <div
                          key={t.id}
                          className={cn("flex flex-col overflow-hidden rounded-card border transition", on ? "border-brand bg-tint ring-2 ring-brand/15" : "border-hair-2 bg-card hover:border-brand/50")}
                        >
                          <button type="button" role="radio" aria-checked={on} onClick={() => setEmail({ template: t.id })} className="flex cursor-pointer flex-col text-left">
                            <span className="grid h-40 place-items-center border-b border-hair bg-canvas">
                              <TemplateSketch template={t} />
                            </span>
                            <span className="grid gap-0.5 p-3">
                              <span className="flex items-center gap-1.5 text-body font-[850] text-ink">
                                {t.title}
                                {on && <Check className="size-3.5 text-brand" />}
                              </span>
                              <span className="text-label leading-snug text-ink-3">{t.detail}</span>
                              <span className={cn("text-label font-bold", roomy ? "text-ink-4" : "text-warn")}>
                                Holds {t.holds} blocks{roomy ? "" : ` · you ticked ${p.included.length}`} · {t.approval}
                              </span>
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreview(t)}
                            className="flex cursor-pointer items-center justify-center gap-1.5 border-t border-hair py-2 text-label font-bold text-ink-2 hover:bg-subtle"
                          >
                            <Eye className="size-3.5" />
                            Preview with your content
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <PlanSectionContinue onClick={() => setOpen(null)} />
        </PlanSectionShell>
      </div>

      {preview && (
        <Modal
          open
          onClose={() => setPreview(null)}
          title={preview.title}
          description="A rough layout with your drafted content. The final design is made when you build."
          size="lg"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPreview(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setEmail({ template: preview.id });
                  setPreview(null);
                }}
                className="font-bold"
              >
                Use this template
              </Button>
            </div>
          }
        >
          <div className="flex justify-center rounded-panel bg-canvas p-4">
            <EmailCanvas project={p} view="inbox" template={preview} />
          </div>
        </Modal>
      )}

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
