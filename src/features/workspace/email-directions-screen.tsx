"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Check, CheckCircle2, Image as ImageIcon, LayoutTemplate, Link2, ListChecks, Mail, PanelRight, PenLine, ShieldCheck, Type, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { LogoMark } from "@/components/ui/logo-mark";
import { ChatComposer, ComposerAttachButton } from "@/components/patterns/chat-composer";
import { ScreenHeader } from "@/components/patterns/screen-header";
import { ActionBar } from "@/components/patterns/action-bar";
import { SplitLayout } from "@/components/patterns/workbench-layout";
import { SaveOrDiscardDialog } from "@/components/patterns/save-or-discard-dialog";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import { Toast, useToast } from "@/components/patterns/toast";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { useProjectExit } from "@/features/workspace/project-exit";
import { ProjectMenu, ProjectTitle } from "@/features/workspace/project-title";
import { VersionChip, type AssetVersion } from "@/features/workspace/version-trail";
import { DossierReaderModal } from "@/features/dossiers/dossier-reader-modal";
import { dossierFor } from "@/features/dossiers/dossier-for";
import { moleculeFor } from "@/features/workspace/grounding-dossiers";
import type { BrandDossier } from "@/features/dossiers/dossier-types";
import { ResearchSourcesContent, researchSummary, type UploadedDoc } from "@/features/workspace/research-sources-section";
import { usePlanResearch } from "@/features/workspace/use-plan-research";
import { PlanSectionShell, planState } from "@/features/workspace/plan-status";
import { PlanSectionContinue } from "@/features/workspace/plan-section-continue";
import { GenerationProgress } from "@/features/workspace/generation-progress";
import { ChipChoices, DecisionRow } from "@/features/workspace/plan-decisions";
import { IndicationRows } from "@/features/workspace/indication-rows";
import { ChatAttachmentRow, useChatAttachments } from "@/features/workspace/chat-attachments";
import { FormattedMessageText } from "@/features/workspace/chat-message";
import { labelVersion } from "@/features/workspace/ad-options";
import { useEmailStore } from "@/features/workspace/email-store";
import { useEmailProject } from "@/features/workspace/email-project";
import { EmailInsertDialogs, type EmailInsertRequest } from "@/features/workspace/email-insert";
import { EmailPiecePicker } from "@/features/workspace/email-piece-picker";
import { HEADER_ART } from "@/features/workspace/email-canvas";
import { AUDIENCE_LABEL, EMAIL_AUDIENCES, EMAIL_PURPOSES, LINK_STATUS, SENDER_PLURAL, audienceNoun, purposesFor, senderInfo, sendersFor, type EmailAudience } from "@/features/workspace/email-options";

type SectionId = "sources" | "subject" | "blocks" | "edit" | "media" | "template" | "audience";

const DRAFT_ONLY: AssetVersion[] = [{ label: "Draft v1", state: "current", at: "Saved just now" }];

/** A row of the plan that is a tick box, the same in every section here. */
function TickRow({ on, onToggle, title, detail, tag, disabled }: { on: boolean; onToggle: () => void; title: React.ReactNode; detail?: React.ReactNode; tag?: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "flex w-full items-start gap-3 rounded-control border p-3 text-left transition",
        disabled ? "cursor-not-allowed border-hair bg-canvas opacity-60" : "cursor-pointer",
        !disabled && (on ? "border-brand/40 bg-tint/60" : "border-hair-2 bg-card hover:border-hair-3")
      )}
    >
      <span className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded-chip border", on ? "border-brand bg-brand text-white" : "border-hair-3 bg-card")}>
        {on && <Check className="size-3 stroke-[3]" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 text-body font-bold text-ink">
          {title}
          {tag}
        </span>
        {detail && <span className="mt-0.5 block text-label text-ink-3">{detail}</span>}
      </span>
    </button>
  );
}

const Tag = ({ tone, children }: { tone: "ok" | "lock" | "warn" | "danger"; children: React.ReactNode }) => (
  <span
    className={cn(
      "rounded-chip px-1.5 py-0.5 text-micro font-extrabold",
      tone === "ok" ? "bg-ok-bg text-ok" : tone === "warn" ? "bg-warn-bg text-warn" : tone === "danger" ? "bg-danger-bg text-danger" : "bg-subtle text-ink-3"
    )}
  >
    {children}
  </span>
);

/**
 * The plan for an approved email: one drafted email and only the decisions a
 * marketer can judge — the subject, which blocks reps pick from, what reps can
 * change, where the button goes, what it is built from and which template it
 * uses. Safety information, unsubscribe and job code are decided and shown,
 * never asked.
 *
 * The same screen as the Video, Docs and Ads plans: sources first, sections
 * that say when they need you, chat on the right.
 */
export function EmailDirectionsScreen() {
  const { setView, chatMessages, addChatMessage, copilotPanelOpen, copilotPanelWidth, setCopilotPanelWidth, setCopilotPanelOpen, toggleCopilotPanel } = useWorkspaceStore();
  const planPhase = useWorkspaceStore((s) => s.planPhase);
  const setPlanPhase = useWorkspaceStore((s) => s.setPlanPhase);
  const exit = useProjectExit();
  const p = useEmailProject();
  const { email, brandName, brandId, purpose } = p;
  const setEmail = useEmailStore((s) => s.set);
  const setAbout = useEmailStore((s) => s.setAbout);
  const links = p.approved;
  /* "reps", "account managers", "support nurses": whoever personalises this email. */
  const who = SENDER_PLURAL[email.sender];
  const Who = who[0].toUpperCase() + who.slice(1);

  /* ── Sources: the dossier the start step picked is in use already ── */
  const [dossierInUse, setDossierInUse] = useState(true);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [previewDossier, setPreviewDossier] = useState<BrandDossier | null>(null);
  const research = usePlanResearch();
  const hasSources = dossierInUse || uploadedDocs.length > 0;

  const [stage, setStage] = useState<"input" | "building">("input");
  const [editing, setEditing] = useState<string | null>(null);
  const [insert, setInsert] = useState<EmailInsertRequest | null>(null);
  const { message: toastMessage, open: toastOpen, tone: toastTone, showToast } = useToast();

  const ctaTarget = email.cta[email.purpose];
  const needsYou: Record<SectionId, boolean> = {
    sources: !hasSources,
    subject: false,
    blocks: !purpose.noBlocks && p.included.length === 0,
    edit: false,
    media: p.cta.status === "missing",
    template: false,
    audience: false,
  };
  const order: SectionId[] = ["sources", "subject", ...(purpose.noBlocks ? [] : (["blocks"] as const)), ...(p.isHQ ? [] : (["edit"] as const)), "media", "template", "audience"];
  const [openSection, setOpenSection] = useState<SectionId | null>("media");
  const toggleSection = (id: SectionId) => setOpenSection(openSection === id ? null : id);
  const advanceFrom = (section: SectionId) => {
    const rest = order.slice(order.indexOf(section) + 1);
    setOpenSection(rest.find((id) => needsYou[id]) ?? rest[0] ?? null);
  };

  const blocker = !hasSources
    ? { title: "Add a source to start", detail: "Use the evidence dossier or add files in Research and Sources." }
    : needsYou.blocks
      ? { title: "No blocks in the email", detail: "Tick at least one block in Content blocks." }
      : needsYou.media
        ? { title: `Choose where "${purpose.cta}" goes`, detail: "Every button needs a destination. Choose one in Images and links." }
        : null;
  const planReady = planPhase === "plan" && !blocker;

  const handleResearched = () => {
    addChatMessage({
      role: "swishx",
      text: `I've drafted a **${purpose.label.toLowerCase()}** email for ${audienceNoun(p.audience)}, sent by the ${p.sender.long.toLowerCase()}, from the **${brandName}** dossier${p.startPiece ? `, led by the **${p.startPiece.title}** it follows up` : ""}. ${
        p.isHQ ? `The ${p.sender.long.toLowerCase()} sends it as it is.` : `${Who} pick up to ${email.maxBlocks} of ${p.included.length} approved blocks${p.showNote ? " and can add a short note" : ""}.`
      }${p.cta.status === "missing" ? ` One thing I couldn't tell: where **${purpose.cta}** should go. Choose it in **Images and links**.` : ""}`,
    });
    setPlanPhase("plan");
  };

  /* ── Chat ── */
  const chatFiles = useChatAttachments();
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);
  const handleSendChat = (directText?: string) => {
    const attached = directText ? [] : chatFiles.take();
    const text = directText || chatInput.trim();
    if (!text && attached.length === 0) return;
    addChatMessage({ role: "user", text: [text, ...attached.map((f) => `\u{1F4CE} ${f.name}`)].filter(Boolean).join("\n") });
    if (!directText) setChatInput("");
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = `Understood. I've updated the plan, still grounded in the **${brandName}** dossier.`;
      if (/head office|from the brand/.test(lower)) {
        setAbout({ sender: "hq" });
        reply = "Switched to a **head-office** email: sent under the brand, nothing for reps to change.";
      } else if (/msl|medical/.test(lower)) {
        setAbout({ sender: "msl" });
        reply = "Switched to an **MSL** email: medical material only, no promotional claims.";
      } else if (/booking|meeting link|calendar/.test(lower) && !p.isHQ) {
        setEmail({ cta: { ...email.cta, [email.purpose]: "scheduler" } });
        reply = `**${purpose.cta}** now opens the ${p.sender.label.toLowerCase()}'s booking link from the CRM.`;
      } else if (/no note|without (a )?note/.test(lower)) {
        setEmail({ repEdit: { ...email.repEdit, note: false } });
        reply = `${Who} can no longer add a note. Everything they send is approved text.`;
      }
      addChatMessage({ role: "swishx", text: reply });
    }, 450);
  };

  const buildSteps = [
    { label: `Read the ${brandName} dossier and approved claims`, seconds: 1.2 },
    { label: `Wrote ${p.included.length} blocks, each from one approved claim`, seconds: 1.2 },
    { label: p.unbranded ? "Added the unsubscribe link, privacy policy and job code" : "Added the safety information, unsubscribe link and job code", seconds: 1.0 },
    { label: p.isHQ ? "Locked every part: nothing is personalised" : `Marked what ${who} can change`, seconds: 0.8 },
  ];
  const openEditor = () => {
    addChatMessage({
      role: "swishx",
      text: `The email is ready. Select any part to see what ${p.isHQ ? "is locked" : `${who} can do with it`}, insert an image, video or link from the toolbar${p.isHQ ? "" : ", or try it as the sender"} before you send it to MLR.`,
    });
    setView("studio");
  };

  const insertChoice = (request: EmailInsertRequest, label: string) => (
    <Button key={request} size="sm" variant="secondary" onClick={() => setInsert(request)} className="h-7.5 text-label font-bold">
      {label}
    </Button>
  );

  return (
    <SplitLayout
      className="bg-[#eef1ed] text-left"
      panelOpen={copilotPanelOpen}
      onPanelOpenChange={setCopilotPanelOpen}
      panelWidth={copilotPanelWidth}
      onPanelWidthChange={setCopilotPanelWidth}
      panelStorageKey="swishx.copilotPanelWidth"
      autoCollapsePanelBelow="laptop"
      header={
        <ScreenHeader onClose={() => exit.requestExit()}>
          <SwishXMark compact />
          <div className="mx-3 h-5 w-px bg-hair" />
          <div className="min-w-0">
            <ProjectTitle kind="email" fallback={p.title} className="text-body font-[800]" />
            <div className="mt-0.5 hidden text-micro text-ink-3 sm:block">Saved just now · Maya Kapoor</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ProjectMenu kind="email" fallback={p.title} />
            <button
              type="button"
              onClick={toggleCopilotPanel}
              className={cn(
                "grid size-8 cursor-pointer place-items-center rounded-chip border transition-colors",
                copilotPanelOpen ? "border-hair-2 bg-black/5 text-ink hover:bg-black/10" : "border-hair-2 bg-card text-ink-3 shadow-2xs hover:border-brand hover:text-ink"
              )}
              title={copilotPanelOpen ? "Collapse sidebar (⌘\\)" : "Expand sidebar (⌘\\)"}
              aria-label="Toggle sidebar"
            >
              <PanelRight className="size-4" />
            </button>
            <VersionChip versions={DRAFT_ONLY} variant="button" />
          </div>
        </ScreenHeader>
      }
      main={
        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col space-y-4 overflow-y-auto border-r border-hair bg-[#eef1ed] p-4 sm:p-6 lg:p-7">
          {planPhase !== "plan" && (
            <GenerationProgress
              title="Reading your request..."
              subtitle={`Checking the brief against the ${brandName} dossier and its approved claims.`}
              steps={[
                { label: `Read the brief and the ${brandName} dossier`, seconds: 1.2 },
                { label: "Matched approved claims in the Claims Library", seconds: 1.2 },
                { label: `Worked out what a ${p.sender.long.toLowerCase()} can change`, seconds: 0.9 },
                { label: "Listed what still needs your answer", seconds: 0.7 },
              ]}
              onDone={handleResearched}
            />
          )}

          {planPhase === "plan" && stage === "building" && (
            <GenerationProgress title="Building the email..." subtitle={`Writing the ${purpose.label.toLowerCase()} email from approved claims.`} steps={buildSteps} onDone={openEditor} />
          )}

          {planPhase === "plan" && stage === "input" && (
            <>
              <div className="flex shrink-0 items-center justify-between pb-1">
                <div>
                  <h2 className="text-display font-[850] tracking-tight text-ink">Need your input</h2>
                  <p className="mt-0.5 text-body text-ink-3">Answer below and SwishX builds the email.</p>
                </div>
              </div>

              <div className="stagger-children w-full min-w-0 space-y-3">
                {/* 1. Research and Sources, the same tile as every plan. */}
                <PlanSectionShell
                  icon={ShieldCheck}
                  title="Research and Sources"
                  summary={`${researchSummary(brandName, dossierInUse, uploadedDocs.length)}${p.startPiece ? ` · built from ${p.startPiece.title}` : ""}`}
                  state={planState(needsYou.sources)}
                  source={research.researching ? `researching ${research.current}/${research.total}` : "from source"}
                  open={research.researching || openSection === "sources"}
                  onToggle={() => {
                    if (!research.researching) toggleSection("sources");
                  }}
                >
                  <ResearchSourcesContent
                    brandName={brandName}
                    uploadedDocs={uploadedDocs}
                    onSetUploadedDocs={setUploadedDocs}
                    onPreviewDossier={() => setPreviewDossier(dossierFor(brandName, moleculeFor(brandName)))}
                    onContinue={() => advanceFrom("sources")}
                    research={research}
                    onToast={showToast}
                    dossierInUse={dossierInUse}
                    onDossierInUseChange={setDossierInUse}
                    notice={`Safety information comes from ${brandName}'s ${labelVersion(brandId)}.${p.boxedWarning ? " It carries a boxed warning, so every email shows it in full." : ""}`}
                  >
                    <EmailPiecePicker project={p} />
                  </ResearchSourcesContent>
                </PlanSectionShell>

                {/* 2. Subject line. Reps can't type their own. */}
                <PlanSectionShell
                  icon={Type}
                  title="Subject line"
                  summary={email.subjectMode === "one" ? `"${p.subject}"` : `${email.subjects.length} approved options, ${who} pick`}
                  state={planState(false)}
                  source="drafted from the brief"
                  open={openSection === "subject"}
                  onToggle={() => toggleSection("subject")}
                >
                  <div className="space-y-2">
                    {!p.isHQ && (
                      <Segmented className="w-fit">
                        <SegmentedButton active={email.subjectMode === "one"} onClick={() => setEmail({ subjectMode: "one", subjects: [email.subjects[0] ?? 0] })}>
                          One subject line
                        </SegmentedButton>
                        <SegmentedButton active={email.subjectMode === "choice"} onClick={() => setEmail({ subjectMode: "choice" })}>
                          {Who} pick from approved options
                        </SegmentedButton>
                      </Segmented>
                    )}
                    {p.subjects.map((line, i) => {
                      const on = email.subjects.includes(i);
                      return (
                        <TickRow
                          key={line}
                          on={on}
                          title={line}
                          tag={<span className="text-label font-semibold text-ink-4">{line.length} characters</span>}
                          onToggle={() =>
                            setEmail({
                              subjects: email.subjectMode === "one" ? [i] : on ? (email.subjects.length > 1 ? email.subjects.filter((x) => x !== i) : email.subjects) : [...email.subjects, i].sort(),
                            })
                          }
                        />
                      );
                    })}
                    <p className="text-label text-ink-3">Every subject line goes to MLR with the email. Senders can&apos;t type their own.</p>
                  </div>
                  <PlanSectionContinue onClick={() => advanceFrom("subject")} />
                </PlanSectionShell>

                {/* 3. The blocks: Veeva's fragments, each reviewed on its own. */}
                {!purpose.noBlocks && (
                  <PlanSectionShell
                    icon={ListChecks}
                    title={p.isHQ ? "Blocks in the email" : email.sender === "msl" ? "Materials" : `Blocks ${who} pick from`}
                    summary={p.isHQ ? `${p.included.length} blocks, all sent` : `${p.included.length} approved blocks · ${who} pick up to ${email.maxBlocks}`}
                    state={planState(needsYou.blocks)}
                    source="from Claims Library"
                    open={openSection === "blocks"}
                    onToggle={() => toggleSection("blocks")}
                  >
                    <div className="space-y-2">
                      {p.blocks.map((b) => {
                        const on = !email.offBlocks.includes(b.id);
                        return (
                          <TickRow
                            key={b.id}
                            on={on}
                            onToggle={() => setEmail({ offBlocks: on ? [...email.offBlocks, b.id] : email.offBlocks.filter((x) => x !== b.id) })}
                            title={b.title}
                            tag={b.expires ? <Tag tone="warn">Source approval ends {b.expires}</Tag> : undefined}
                            detail={
                              <>
                                {b.text}
                                <span className="mt-0.5 block text-ink-4">
                                  {b.claimId} · {b.source}
                                </span>
                              </>
                            }
                          />
                        );
                      })}
                      {!p.isHQ && (
                        <div className="flex items-center gap-2 pt-1 text-body text-ink-2">
                          {Who} pick at most
                          <Button size="sm" variant="secondary" aria-label="Fewer" onClick={() => setEmail({ maxBlocks: Math.max(1, email.maxBlocks - 1) })} className="size-7 p-0">
                            −
                          </Button>
                          <b className="w-4 text-center text-ink">{email.maxBlocks}</b>
                          <Button size="sm" variant="secondary" aria-label="More" onClick={() => setEmail({ maxBlocks: Math.min(5, email.maxBlocks + 1) })} className="size-7 p-0">
                            +
                          </Button>
                          blocks per email
                        </div>
                      )}
                      <p className="text-label text-ink-3">Each block goes to MLR on its own, so one can be updated or withdrawn without re-reviewing the email.</p>
                    </div>
                    <PlanSectionContinue onClick={() => advanceFrom("blocks")} />
                  </PlanSectionShell>
                )}

                {/* 4. What reps can change. Head office sends it as it is. */}
                {!p.isHQ && (
                  <PlanSectionShell
                    icon={PenLine}
                    title={`What ${who} can change`}
                    summary={[email.repEdit.note && "Personal note", email.repEdit.blocks && "which blocks", email.repEdit.piece && "which piece"].filter(Boolean).join(", ") || "Nothing"}
                    state={planState(false)}
                    source={`for a ${p.sender.long.toLowerCase()}`}
                    open={openSection === "edit"}
                    onToggle={() => toggleSection("edit")}
                  >
                    <div className="space-y-2">
                      {([
                        ["note", "Personal note", "Up to 255 characters at the top, in the sender's own words. Plain text, so no claims can be formatted into it."],
                        ["blocks", "Which blocks", `Picks 1 to ${email.maxBlocks} from the approved set.`],
                        ["piece", "Which piece to attach", "Picks one of the approved pieces in Images and links."],
                      ] as const).map(([k, title, detail]) => (
                        <TickRow key={k} on={email.repEdit[k]} title={title} detail={detail} onToggle={() => setEmail({ repEdit: { ...email.repEdit, [k]: !email.repEdit[k] } })} />
                      ))}
                    </div>
                    <PlanSectionContinue onClick={() => advanceFrom("edit")} />
                  </PlanSectionShell>
                )}

                {/* 5. Images and links: where the button goes, what is inserted, what is attached. */}
                <PlanSectionShell
                  icon={ImageIcon}
                  title="Images and links"
                  summary={`${email.media.filter((m) => m.kind !== "link").length} images and media · ${p.links.length} links${p.cta.status === "missing" ? " · the button has no destination" : ""}`}
                  state={planState(needsYou.media)}
                  error={needsYou.media ? { title: "The button goes nowhere", detail: "Choose where it goes below." } : null}
                  source="from approved pages"
                  open={openSection === "media"}
                  onToggle={() => toggleSection("media")}
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-body font-bold text-ink-2">
                        Where should &ldquo;{purpose.cta}&rdquo; go?
                        <Tag tone={LINK_STATUS[p.cta.status].tone}>{p.cta.status === "missing" ? "Needed" : LINK_STATUS[p.cta.status].label}</Tag>
                      </div>
                      {email.purpose === "consent" ? (
                        <p className="text-label text-ink-3">The button opens the CRM&apos;s consent capture page. Nothing to choose.</p>
                      ) : (
                        <>
                          <div className="flex flex-wrap gap-1.5">
                            {([...(p.isHQ ? [] : [["scheduler", `The ${p.sender.label.toLowerCase()}'s booking link`]]), ...Object.entries(links).map(([k, l]) => [k, l.label]), ["custom", "Paste a URL"]] as Array<[string, string]>).map(([id, label]) => (
                              <button
                                key={id}
                                type="button"
                                aria-pressed={ctaTarget === id}
                                onClick={() => setEmail({ cta: { ...email.cta, [email.purpose]: id } })}
                                className={cn(
                                  "cursor-pointer rounded-control border px-3 py-1.5 text-body font-semibold transition",
                                  ctaTarget === id ? "border-brand bg-tint text-brand-deep" : "border-hair-2 bg-card text-ink-2 hover:border-hair-3"
                                )}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                          {ctaTarget === "custom" && (
                            <Field size="sm" placeholder="https://" value={email.customLink} onChange={(e) => setEmail({ customLink: e.target.value.trim() })} hint="A page outside the approved list goes to MLR as a linked destination." />
                          )}
                        </>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="text-body font-bold text-ink-2">Images, video and documents</div>
                      {email.media.filter((m) => m.kind !== "link").length === 0 && <p className="text-label text-ink-3">Nothing yet. Add from SwishX or upload your own.</p>}
                      {email.media
                        .filter((m) => m.kind !== "link")
                        .map((m) => (
                          <div key={m.uid} className="flex items-center gap-3 rounded-control border border-hair bg-card p-2.5">
                            <span className="relative h-8 w-12 shrink-0 overflow-hidden rounded-chip" style={{ background: m.gradient || undefined }}>
                              {m.visual}
                            </span>
                            <span className="min-w-0 flex-1">
                              <b className="block truncate text-body text-ink">{m.title}</b>
                              <span className="block text-label text-ink-3">
                                {m.from === "platform" ? `${m.src} · Approved ${m.code}` : "Uploaded · goes to MLR as a new item"}
                                {m.kind !== "doc" && (m.alt ? " · alt text set" : " · no alt text")}
                              </span>
                            </span>
                            <Tag tone={m.from === "platform" ? "ok" : "warn"}>{m.from === "platform" ? "From SwishX" : "Upload"}</Tag>
                            <button type="button" aria-label={`Remove ${m.title}`} onClick={() => setEmail({ media: email.media.filter((x) => x.uid !== m.uid) })} className="grid size-7 cursor-pointer place-items-center rounded-chip text-ink-3 hover:bg-subtle hover:text-ink">
                              <X className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      <div className="flex flex-wrap gap-1.5">
                        {insertChoice("brand-images", "Brand image")}
                        {insertChoice("upload-image", "Upload image")}
                        {insertChoice("videos", "Video")}
                        {insertChoice("documents", "Document")}
                        {insertChoice("approved-link", "Link")}
                      </div>
                    </div>

                    {!purpose.noBlocks && p.pieces.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-body font-bold text-ink-2">Attached pieces</div>
                        {p.pieces.map((pc) => {
                          const on = email.attached.includes(pc.id);
                          return (
                            <TickRow
                              key={pc.id}
                              on={on}
                              onToggle={() => setEmail({ attached: on ? email.attached.filter((x) => x !== pc.id) : [...email.attached, pc.id] })}
                              title={pc.title}
                              tag={pc.id === p.startPiece?.id ? <Tag tone="lock">Built from</Tag> : undefined}
                              detail={`${pc.kind} · ${pc.spec} · ${pc.approval}. Linked, not reviewed again.`}
                            />
                          );
                        })}
                      </div>
                    )}
                    <p className="text-label text-ink-3">Always added by SwishX: {p.unbranded ? "" : p.professional ? "Prescribing Information, safety information, " : "Medication Guide, safety information, "}unsubscribe and privacy links. Every link is tracked and labelled for click reports.</p>
                  </div>
                  <PlanSectionContinue onClick={() => advanceFrom("media")} />
                </PlanSectionShell>

                {/* 6. Template: SwishX's layout, or one of the brand's approved shells. */}
                <PlanSectionShell
                  icon={LayoutTemplate}
                  title="Template"
                  summary={p.template ? p.template.title : "SwishX designs it"}
                  state={planState(false)}
                  source="from the brand kit"
                  open={openSection === "template"}
                  onToggle={() => toggleSection("template")}
                >
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {[{ id: null, title: "SwishX designs it", detail: `Single column in the ${p.unbranded ? "disease awareness" : brandName} brand kit, built for this email.`, header: "plain" as const, approval: "Recommended" }, ...p.templates].map((t) => {
                      const on = (email.template ?? null) === t.id;
                      return (
                        <button
                          key={t.id ?? "swishx"}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setEmail({ template: t.id })}
                          className={cn(
                            "flex cursor-pointer flex-col overflow-hidden rounded-control border text-left transition",
                            on ? "border-brand bg-tint shadow-2xs ring-2 ring-brand/15" : "border-hair-2 bg-card hover:border-hair-3"
                          )}
                        >
                          {/* A thumbnail of the shell: its header, then lines of body. */}
                          <span className="grid h-24 w-full place-items-center border-b border-hair bg-canvas">
                            <span className="grid w-28 overflow-hidden rounded-chip border border-hair bg-card shadow-2xs">
                              {t.header === "letter" ? (
                                <span className="mx-2 mb-1 mt-2 h-2.5 border-b-2 border-accent-violet" />
                              ) : (
                                <span className={t.header === "banner" ? "h-8" : "h-4"} style={{ background: HEADER_ART }} />
                              )}
                              <span className="grid gap-1 p-2">
                                <span className="h-1 w-4/5 rounded-full bg-hair-2" />
                                <span className="h-1 w-full rounded-full bg-hair-2" />
                                <span className="h-1 w-3/5 rounded-full bg-hair-2" />
                              </span>
                            </span>
                          </span>
                          <span className="grid gap-0.5 p-2.5">
                            <b className="text-body text-ink">{t.title}</b>
                            <span className="text-label text-ink-3">{t.detail}</span>
                            <span className={cn("text-label font-bold", t.id ? "text-ink-4" : "text-brand-deep")}>{t.approval}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="pt-2 text-label text-ink-3">A brand template changes the header and spacing. The blocks, safety information and footer stay the same.</p>
                  <PlanSectionContinue onClick={() => advanceFrom("template")} />
                </PlanSectionShell>

                {/* 7. Audience, sender and indication — answered at the start, changeable here. */}
                <PlanSectionShell
                  icon={Users}
                  title="Audience and sender"
                  summary={`${AUDIENCE_LABEL[p.audience].title} · ${p.sender.long} · ${purpose.label}`}
                  state={planState(false)}
                  source="from project start"
                  open={openSection === "audience"}
                  onToggle={() => toggleSection("audience")}
                >
                  <div className="space-y-2">
                    <IndicationRows editing={editing} onEdit={setEditing} />
                    <DecisionRow label="Audience" value={AUDIENCE_LABEL[p.audience].title} icon={<Users className="size-4" />} editing={editing === "audience"} onEdit={() => setEditing(editing === "audience" ? null : "audience")}>
                      <ChipChoices
                        label="Who is it for?"
                        options={EMAIL_AUDIENCES.map((a) => AUDIENCE_LABEL[a].title)}
                        values={[AUDIENCE_LABEL[p.audience].title]}
                        onToggle={(title) => {
                          const a = EMAIL_AUDIENCES.find((x) => AUDIENCE_LABEL[x].title === title) as EmailAudience;
                          setAbout({ audience: a });
                          useWorkspaceStore.getState().setAudience(a);
                        }}
                        onDone={() => setEditing(null)}
                        footnote="HCP and hospital emails are Approved Email, sent from your CRM. Patient and consumer emails go out from your email platform."
                      />
                    </DecisionRow>
                    <DecisionRow label="Sent by" value={p.sender.long} icon={<Mail className="size-4" />} editing={editing === "sender"} onEdit={() => setEditing(editing === "sender" ? null : "sender")}>
                      <ChipChoices
                        label="Who sends it?"
                        options={sendersFor(p.audience).map((id) => senderInfo(id, p.audience).long)}
                        values={[p.sender.long]}
                        onToggle={(long) => setAbout({ sender: sendersFor(p.audience).find((id) => senderInfo(id, p.audience).long === long)! })}
                        onDone={() => setEditing(null)}
                        footnote="Changes what can be personalised: a note and a choice of blocks for a rep, account manager or support nurse; medical material only for an MSL; nothing from head office."
                      />
                    </DecisionRow>
                    <DecisionRow label="For" value={purpose.label} icon={<Link2 className="size-4" />} editing={editing === "purpose"} onEdit={() => setEditing(editing === "purpose" ? null : "purpose")}>
                      <ChipChoices
                        label="What is it for?"
                        options={purposesFor(email.sender, p.audience).map((id) => EMAIL_PURPOSES[id].label)}
                        values={[purpose.label]}
                        onToggle={(label) => setAbout({ purpose: purposesFor(email.sender, p.audience).find((id) => EMAIL_PURPOSES[id].label === label)! })}
                        onDone={() => setEditing(null)}
                      />
                    </DecisionRow>
                  </div>
                  <PlanSectionContinue onClick={() => setOpenSection(null)} />
                </PlanSectionShell>

                {/* What SwishX decided, shown rather than asked. */}
                <div className="rounded-panel border border-hair bg-card p-4 shadow-2xs">
                  <div className="text-micro font-extrabold uppercase tracking-wide text-ink-4">SwishX decided</div>
                  <ul className="mt-2 space-y-1.5 text-body text-ink-2">
                    {[
                      p.unbranded
                        ? ["No safety information", "no product is named or implied, so none is needed"]
                        : ["Important Safety Information", `the current ${brandName} ISI${p.professional ? "" : " in plain language"}${p.boxedWarning ? ", with the boxed warning," : ""} at the foot of every email`],
                      ["Unsubscribe and company address", p.professional ? "required in every commercial email" : "required, with why they're receiving it and the privacy policy"],
                      ["Job code", `US-${brandName.slice(0, 3).toUpperCase()}-2611-0042, the number MLR approves this email under`],
                      ["Layout", "single column, 600 px wide, reads on a phone and with images off"],
                      ["References", "numbered automatically from each block's claim"],
                    ].map(([title, detail]) => (
                      <li key={title} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-ok" />
                        <span>
                          <b className="font-bold text-ink">{title}</b> · {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {planPhase === "plan" && stage === "input" && (
            <ActionBar
              icon={planReady ? <CheckCircle2 className="size-4.5 shrink-0 text-ok-on-dark" /> : <AlertTriangle className="size-4.5 shrink-0 text-warn-on-dark" />}
              title={planReady ? "Ready to build the email" : blocker!.title}
              description={planReady ? `Grounded in the ${brandName} dossier and ${p.claimIds.length} approved claims` : blocker!.detail}
              action={
                <Button
                  disabled={!planReady}
                  onClick={() => setStage("building")}
                  className="h-9 shrink-0 cursor-pointer rounded-control bg-brand px-5 text-body font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-deep disabled:opacity-40"
                >
                  <span>Confirm Plan &amp; Build Email</span>
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Button>
              }
            />
          )}
        </section>
      }
      panel={
        <>
          <div className="shrink-0 border-b border-hair bg-card p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-body font-bold text-brand">
                <LogoMark size={14} />
                <span>Direct with SwishX</span>
              </div>
              <span className="rounded-chip bg-ok/15 px-2 py-0.5 text-micro font-bold text-ok">Online</span>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3.5">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={cn("flex max-w-full gap-2.5", msg.role === "user" ? "ml-auto justify-end" : "mr-auto")}>
                {msg.role === "swishx" && <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand text-caption font-bold text-white shadow-2xs">SX</div>}
                <div className="max-w-[88%] space-y-2">
                  <div className={cn("rounded-panel p-3 text-body leading-relaxed", msg.role === "user" ? "rounded-tr-xs bg-brand text-white" : "rounded-tl-xs border border-hair bg-subtle text-ink")}>
                    <FormattedMessageText text={msg.text} />
                  </div>
                  {msg.role === "swishx" && idx === chatMessages.length - 1 && planPhase === "plan" && stage === "input" && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {["Send it from head office", "Open the booking link from the button", "No personal note"].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleSendChat(chip)}
                          className="cursor-pointer rounded-chip border border-hair-2 bg-card px-2.5 py-1 text-label font-semibold text-ink-2 shadow-2xs transition hover:bg-tint hover:text-brand"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>
          <div className="shrink-0 space-y-2 border-t border-hair bg-card p-3">
            {planPhase === "plan" && stage === "input" && (
              <div className="flex items-center justify-between gap-2 rounded-panel border border-brand/20 bg-gradient-to-r from-tint via-card to-tint p-2 shadow-2xs">
                <div className="flex min-w-0 items-center gap-2">
                  <div className={cn("grid size-6 shrink-0 place-items-center rounded-full text-white", planReady ? "bg-ok" : "bg-warn")}>
                    {planReady ? <Check className="size-3.5 stroke-[3]" /> : <AlertTriangle className="size-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-label font-bold text-ink">{planReady ? "Plan ready" : blocker!.title}</div>
                    <div className="truncate text-micro text-ink-3">{planReady ? `Grounded in ${p.claimIds.length} approved claims` : blocker!.detail}</div>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={!planReady}
                  onClick={() => setStage("building")}
                  className="h-7.5 shrink-0 cursor-pointer rounded-chip bg-brand px-3 text-label font-bold text-white shadow-xs transition-all hover:scale-[1.02] hover:bg-brand-deep disabled:opacity-40"
                >
                  <span>Build Email</span>
                  <ArrowRight className="ml-1 size-3" />
                </Button>
              </div>
            )}
            <ChatComposer
              value={chatInput}
              onChange={setChatInput}
              onSubmit={() => handleSendChat()}
              placeholder="Ask SwishX or request a change to the plan..."
              attachControl={<ComposerAttachButton onClick={chatFiles.open} label="Attach a file" />}
            >
              <ChatAttachmentRow attachments={chatFiles} />
            </ChatComposer>
          </div>
        </>
      }
      overlay={
        <>
          <Toast message={toastMessage} open={toastOpen} tone={toastTone} />
          <EmailInsertDialogs
            request={insert}
            brandName={brandName}
            audience={p.audience}
            condition={p.condition}
            lead={p.included[0]}
            onClose={() => setInsert(null)}
            onInsert={(m) => {
              setEmail({ media: [...useEmailStore.getState().media, m] });
              setInsert(null);
              showToast(`${m.title} added`);
            }}
          />
          {previewDossier && <DossierReaderModal dossier={previewDossier} onClose={() => setPreviewDossier(null)} />}
          <SaveOrDiscardDialog
            open={!!exit.pending}
            destinationLabel={exit.pending?.label}
            onSaveDraft={() => exit.resolve(true)}
            onDiscard={() => exit.resolve(false)}
            onCancel={exit.cancel}
          />
        </>
      }
    />
  );
}
