"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Check, CheckCircle2, Image as ImageIcon, Link2, Mail, MousePointerClick, Palette, Stamp, PanelRight, PenLine, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { LogoMark } from "@/components/ui/logo-mark";
import { ChatComposer, ComposerAttachButton } from "@/components/patterns/chat-composer";
import { ScreenHeader } from "@/components/patterns/screen-header";
import { ActionBar } from "@/components/patterns/action-bar";
import { SplitLayout } from "@/components/patterns/workbench-layout";
import { SaveOrDiscardDialog } from "@/components/patterns/save-or-discard-dialog";
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
import { BrandMarkContent, ChipChoices, DecisionRow } from "@/features/workspace/plan-decisions";
import { IndicationRows } from "@/features/workspace/indication-rows";
import { ChatAttachmentRow, useChatAttachments } from "@/features/workspace/chat-attachments";
import { FormattedMessageText } from "@/features/workspace/chat-message";
import { labelVersion } from "@/features/workspace/ad-options";
import { useEmailStore } from "@/features/workspace/email-store";
import { useEmailProject } from "@/features/workspace/email-project";
import { EmailPiecePicker } from "@/features/workspace/email-piece-picker";
import { TickRow } from "@/features/workspace/email-plan-parts";
import { EmailPlanStep } from "@/features/workspace/email-plan-step";
import { FileNoteDialog } from "@/features/workspace/file-note-dialog";
import { AssetStrip, MediaAssetTile, MediaAttachmentGrid, brandVariations, workspaceAssets } from "@/features/workspace/workspace-assets";
import { AUDIENCE_LABEL, EMAIL_AUDIENCES, EMAIL_PURPOSES, SENDER_PLURAL, audienceNoun, purposesFor, senderInfo, sendersFor, type EmailAudience } from "@/features/workspace/email-options";

type SectionId = "sources" | "audience" | "visuals" | "references" | "logo" | "button" | "edit";

const DRAFT_ONLY: AssetVersion[] = [{ label: "Draft v1", state: "current", at: "Saved just now" }];

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
  /* "reps", "MSLs", "support nurses": whoever personalises this email. */
  const who = SENDER_PLURAL[email.sender];
  const Who = who[0].toUpperCase() + who.slice(1);

  /* ── Sources: the dossier the start step picked is in use already ── */
  const [dossierInUse, setDossierInUse] = useState(true);
  /* In the store, so the email plan can draft a block from each file. */
  const uploadedDocs = email.files;
  const setUploadedDocs: React.Dispatch<React.SetStateAction<UploadedDoc[]>> = (next) =>
    setEmail({ files: typeof next === "function" ? next(useEmailStore.getState().files) : next });
  /* Uploads wait here for their note, as in every plan. */
  const [pendingPackshot, setPendingPackshot] = useState<Array<{ id: string; name: string; url: string }>>([]);
  const [pendingReference, setPendingReference] = useState<Array<{ id: string; name: string; previewUrl: string }>>([]);
  const logoMark = useWorkspaceStore((s) => s.logoMark);
  const [previewDossier, setPreviewDossier] = useState<BrandDossier | null>(null);
  const research = usePlanResearch();
  const hasSources = dossierInUse || uploadedDocs.length > 0;

  const [stage, setStage] = useState<"input" | "drafting" | "emailplan" | "building">("input");
  const [editing, setEditing] = useState<string | null>(null);
  const { message: toastMessage, open: toastOpen, tone: toastTone, showToast } = useToast();

  const needsYou: Record<SectionId, boolean> = {
    sources: !hasSources,
    audience: false,
    visuals: false,
    references: false,
    logo: false,
    button: p.cta.status === "missing",
    edit: false,
  };
  /* What SwishX needs first; everything it could decide follows. */
  /* Sources first: the blocks, subject lines and look are drafted from them, on the email plan. */
  const order: SectionId[] = ["sources", "audience", ...(p.unbranded ? [] : (["visuals"] as const)), "references", ...(p.unbranded ? [] : (["logo"] as const)), "button", ...(p.isHQ ? [] : (["edit"] as const))];
  const [openSection, setOpenSection] = useState<SectionId | null>("sources");
  const toggleSection = (id: SectionId) => setOpenSection(openSection === id ? null : id);
  const advanceFrom = (section: SectionId) => {
    const rest = order.slice(order.indexOf(section) + 1);
    setOpenSection(rest.find((id) => needsYou[id]) ?? rest[0] ?? null);
  };

  const blocker = !hasSources
    ? { title: "Add a source to start", detail: "Use the evidence dossier or add files in Research and Sources." }
    : needsYou.button
      ? { title: `Add the page "${p.ctaText}" opens`, detail: "Enter its URL in The email's button." }
      : null;
  const planReady = planPhase === "plan" && !blocker;

  const handleResearched = () => {
    addChatMessage({
      role: "swishx",
      text: `I've drafted a **${purpose.label.toLowerCase()}** email for ${audienceNoun(p.audience)}, sent by the ${p.sender.long.toLowerCase()}, from the **${brandName}** dossier${p.startPiece ? `, led by the **${p.startPiece.title}** it follows up` : ""}. ${
        p.isHQ ? `The ${p.sender.long.toLowerCase()} sends it as it is.` : `${Who} pick which of ${p.included.length} approved blocks to send${p.showNote ? " and can add a short note" : ""}.`
      }${p.cta.status === "missing" ? ` One thing I need from you: the page **${p.ctaText}** opens. Add its URL in **The email's button**.` : ""}`,
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
      } else if (/no note|without (a )?note/.test(lower)) {
        setEmail({ repEdit: { ...email.repEdit, note: false } });
        reply = `${Who} can no longer add a note. Everything they send is approved text.`;
      }
      addChatMessage({ role: "swishx", text: reply });
    }, 450);
  };

  /* After Need your input: the content can only be drafted once the sources are settled. */
  const draftSteps = [
    { label: `Read the ${p.unbranded ? "disease information" : `${brandName} dossier`}${email.files.length ? ` and ${email.files.length} of your files` : ""}`, seconds: 1.1 },
    ...(p.startPiece ? [{ label: `Took the lead claim from the ${p.startPiece.title}`, seconds: 0.8 }] : []),
    { label: `Drafted ${p.blocks.length} blocks, each from one approved claim`, seconds: 1.1 },
    { label: email.subjectMode === "choice" ? `Wrote ${p.subjects.length} subject lines for ${who} to choose from` : "Wrote the subject line", seconds: 0.7 },
  ];
  const buildSteps = [
    { label: `Laid out the email in the ${p.template.title} template`, seconds: 1.0 },
    ...(p.template.header !== "letter" ? [{ label: "Generated the header image the template calls for", seconds: 0.9 }] : []),
    ...(email.packshots.length ? [{ label: "Placed the product shot beside the lead claim", seconds: 0.7 }] : []),
    { label: p.unbranded ? "Added the unsubscribe link, privacy policy and job code" : "Added the safety information, unsubscribe link and job code", seconds: 1.0 },
    { label: p.isHQ ? "Locked every part: nothing is personalised" : `Marked what ${who} can change`, seconds: 0.8 },
  ];
  const draftEmail = () => setStage("drafting");
  const openEmailPlan = () => {
    setStage("emailplan");
    addChatMessage({
      role: "swishx",
      text: `Here's the email plan, drafted from your sources: ${p.included.length} blocks${p.startPiece ? `, led by the **${p.startPiece.title}**` : ""}, and ${email.subjectMode === "choice" ? `${p.subjects.length} subject lines` : "a subject line"}. Confirm each part and pick a template; the images are made with it when you build.`,
    });
  };
  const openEditor = () => {
    addChatMessage({
      role: "swishx",
      text: `The email is ready. Select any part to see what ${p.isHQ ? "is locked" : `${who} can do with it`}, insert an image, video or link from the toolbar${p.isHQ ? "" : ", or try it as the sender"} before you send it to MLR.`,
    });
    setView("studio");
  };

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

          {planPhase === "plan" && stage === "drafting" && (
            <GenerationProgress title="Drafting the email plan..." subtitle="Writing the blocks and subject lines from your sources." steps={draftSteps} onDone={openEmailPlan} />
          )}

          {planPhase === "plan" && stage === "building" && (
            <GenerationProgress title="Building the email..." subtitle={`Writing the ${purpose.label.toLowerCase()} email from approved claims.`} steps={buildSteps} onDone={openEditor} />
          )}

          {planPhase === "plan" && stage === "input" && (
            <>
              <div className="flex shrink-0 items-center justify-between pb-1">
                <div>
                  <h2 className="text-display font-[850] tracking-tight text-ink">Need your input</h2>
                  <p className="mt-0.5 text-body text-ink-3">What SwishX needs comes first. Everything else is drafted; open a section to change it.</p>
                </div>
              </div>

              <div className="stagger-children w-full min-w-0 space-y-3 pb-24">
                {/* 1. Research and Sources, first: everything SwishX drafts later comes from here. */}
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

                {/* 2. Audience and sender, as set at the start: a tile like every other, changeable here. */}
                <PlanSectionShell
                  icon={Users}
                  title="Audience and sender"
                  summary={[brandName, AUDIENCE_LABEL[p.audience].title, p.sender.long, purpose.label, p.condition[0].toUpperCase() + p.condition.slice(1)].join(" · ")}
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
                        footnote="HCP emails are Approved Email, sent from your CRM. Patient and consumer emails go out from your email platform."
                      />
                    </DecisionRow>
                    <DecisionRow label="Sent by" value={p.sender.long} icon={<Mail className="size-4" />} editing={editing === "sender"} onEdit={() => setEditing(editing === "sender" ? null : "sender")}>
                      <ChipChoices
                        label="Who sends it?"
                        options={sendersFor(p.audience).map((id) => senderInfo(id, p.audience).long)}
                        values={[p.sender.long]}
                        onToggle={(long) => setAbout({ sender: sendersFor(p.audience).find((id) => senderInfo(id, p.audience).long === long)! })}
                        onDone={() => setEditing(null)}
                        footnote="Changes what can be personalised: a note and a choice of blocks for a rep or support nurse; medical material only for an MSL; nothing from head office."
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
                  <PlanSectionContinue onClick={() => advanceFrom("audience")} />
                </PlanSectionShell>

                {/* 3. Product & device visuals, as in every module. Not for unbranded emails, which can't show the product. */}
                {!p.unbranded && (
                  <PlanSectionShell
                    icon={ImageIcon}
                    title="Product & Device Visual Assets"
                    summary={email.packshots.length > 0 ? `${email.packshots.length} packshot${email.packshots.length === 1 ? "" : "s"} attached` : "Packshots SwishX can place in the email"}
                    state={planState(false, email.packshots.length === 0)}
                    open={openSection === "visuals"}
                    onToggle={() => toggleSection("visuals")}
                  >
                    <div className="space-y-3">
                      <MediaAttachmentGrid
                        items={email.packshots.map((ps) => ({ id: ps.id, name: ps.name, note: ps.note, previewUrl: ps.url, kind: "image" as const, variation: ps.variation }))}
                        uploadLabel={email.packshots.length === 0 ? "Upload product image" : "Add another"}
                        uploadHint="PNG, JPG"
                        onUpload={() =>
                          setPendingPackshot([
                            {
                              id: `ps-${Date.now()}`,
                              name: `${brandName}_${brandVariations(brandName)[0].replace(/[^a-zA-Z0-9]+/g, "_")}_Pack_Front.png`,
                              url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
                            },
                          ])
                        }
                        onRemove={(id) => setEmail({ packshots: email.packshots.filter((ps) => ps.id !== id) })}
                      />
                      {(() => {
                        const reusable = workspaceAssets(brandName, "product").filter((a) => !email.packshots.some((ps) => ps.name === a.name));
                        if (reusable.length === 0) return null;
                        return (
                          <div>
                            <span className="mb-1.5 block text-label font-bold uppercase tracking-wider text-ink-3">Suggested from platform</span>
                            <AssetStrip>
                              {reusable.map((asset) => (
                                <MediaAssetTile
                                  key={asset.id}
                                  source="workspace"
                                  name={asset.name}
                                  note={asset.note}
                                  origin={asset.origin}
                                  previewUrl={asset.previewUrl}
                                  kind={asset.kind}
                                  variation={asset.variation}
                                  onAdd={() =>
                                    setEmail({
                                      packshots: [
                                        ...useEmailStore.getState().packshots,
                                        { id: `ps-${asset.id}-${Date.now()}`, name: asset.name, url: asset.previewUrl ?? "", note: asset.note, variation: asset.variation },
                                      ],
                                    })
                                  }
                                />
                              ))}
                            </AssetStrip>
                          </div>
                        );
                      })()}
                    </div>
                    <PlanSectionContinue label={email.packshots.length === 0 ? "Skip & Continue" : "Save & Continue"} onClick={() => advanceFrom("visuals")} />
                  </PlanSectionShell>
                )}

                {/* 4. Visual & creative references: the look, and the user's own assets, each with what to take from it. */}
                <PlanSectionShell
                  icon={Palette}
                  title="Visual & creative references"
                  summary={email.references.length > 0 ? `${email.references.length} reference${email.references.length === 1 ? "" : "s"}` : "The look you are after, or your own assets to use"}
                  state={planState(false, email.references.length === 0)}
                  source={email.references.length > 0 ? `${email.references.length} attached` : undefined}
                  open={openSection === "references"}
                  onToggle={() => toggleSection("references")}
                >
                  <div className="space-y-3">
                    <p className="text-body leading-snug text-ink-3">
                      Emails or campaigns with the look you want, or images of your own to use, with a note on each. <strong className="font-bold text-ink-2">Grounds no claims.</strong>
                    </p>
                    <MediaAttachmentGrid
                      items={email.references.map((r) => ({ id: r.id, name: r.name, note: r.note, previewUrl: r.previewUrl, kind: r.kind }))}
                      uploadLabel={email.references.length === 0 ? "Upload a reference" : "Add another"}
                      uploadHint="PNG, JPG, PDF · an email screenshot works well"
                      onUpload={() =>
                        setPendingReference([
                          {
                            id: `ref-${Date.now()}`,
                            name: "Email_Look_Reference.png",
                            previewUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80",
                          },
                        ])
                      }
                      onRemove={(id) => setEmail({ references: email.references.filter((r) => r.id !== id) })}
                    />
                    {(() => {
                      const reusable = workspaceAssets(brandName, "reference").filter((a) => !email.references.some((r) => r.name === a.name));
                      if (reusable.length === 0) return null;
                      return (
                        <div>
                          <span className="mb-1.5 block text-label font-bold uppercase tracking-wider text-ink-3">Suggested from platform</span>
                          <AssetStrip>
                            {reusable.map((asset) => (
                              <MediaAssetTile
                                key={asset.id}
                                source="workspace"
                                name={asset.name}
                                note={asset.note}
                                origin={asset.origin}
                                previewUrl={asset.previewUrl}
                                kind={asset.kind}
                                onAdd={() =>
                                  setEmail({
                                    references: [
                                      ...useEmailStore.getState().references,
                                      { id: `ref-${asset.id}-${Date.now()}`, name: asset.name, note: asset.note, previewUrl: asset.previewUrl, kind: asset.kind === "video" ? "video" : "image" },
                                    ],
                                  })
                                }
                              />
                            ))}
                          </AssetStrip>
                        </div>
                      );
                    })()}
                  </div>
                  <PlanSectionContinue label={email.references.length === 0 ? "Skip & Continue" : "Save & Continue"} onClick={() => advanceFrom("references")} />
                </PlanSectionShell>

                {/* 5. Brand mark, the same section as every plan. It sits in the email's header. */}
                {!p.unbranded && (
                  <PlanSectionShell
                    icon={Stamp}
                    title="Brand mark"
                    summary={logoMark.position === "none" ? "No logo" : `In the header · ${logoMark.name}`}
                    state={planState(false, true)}
                    source="from brand kit"
                    open={openSection === "logo"}
                    onToggle={() => toggleSection("logo")}
                  >
                    <BrandMarkContent unit="email" />
                    <PlanSectionContinue onClick={() => advanceFrom("logo")} />
                  </PlanSectionShell>
                )}

                {/* 6. The email's button: what it says and the page it opens. SwishX has no list of the brand's pages, so the URL is asked. */}
                <PlanSectionShell
                  icon={MousePointerClick}
                  title="The email's button"
                  summary={p.cta.status === "missing" ? `Add the page "${p.ctaText}" opens` : `"${p.ctaText}" opens ${p.cta.dest}`}
                  state={planState(needsYou.button)}
                  source="from you"
                  open={openSection === "button"}
                  onToggle={() => toggleSection("button")}
                >
                  <div className="space-y-3">
                    {/* The button as it will look, before what it says and where it goes. */}
                    <div className="flex flex-wrap items-center gap-3 rounded-control border border-hair bg-canvas px-3 py-2.5">
                      <span className="inline-block rounded-full bg-accent-violet px-4 py-1.5 text-body font-extrabold text-white">{p.ctaText}</span>
                      <ArrowRight className="size-3.5 shrink-0 text-ink-4" />
                      <span className={cn("min-w-0 flex-1 truncate text-label font-semibold", p.cta.status === "missing" ? "text-danger" : "text-ink-2")}>
                        {p.cta.status === "missing" ? "Opens: no URL yet" : `Opens ${p.cta.dest}`}
                      </span>
                      <span className="w-full text-label text-ink-3">Every email ends with one button. It&apos;s what the reader clicks to act.</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                      <Field
                        size="sm"
                        label="Button text"
                        value={email.ctaText}
                        placeholder={purpose.cta}
                        maxLength={30}
                        onChange={(e) => setEmail({ ctaText: e.target.value })}
                        hint="Short and specific. Leave empty for the suggested wording."
                      />
                      <Field
                        size="sm"
                        label="Page it opens"
                        type="url"
                        value={email.ctaUrl}
                        placeholder="https://"
                        onChange={(e) => setEmail({ ctaUrl: e.target.value.trim() })}
                        error={email.ctaUrl && p.cta.status === "missing" ? "Enter a full web address, starting with https://" : undefined}
                        hint="The page goes to MLR with the email as a linked destination."
                      />
                    </div>
                  </div>
                  <PlanSectionContinue onClick={() => advanceFrom("button")} />
                </PlanSectionShell>

                {/* 7. What the sender can change: every freedom in one place. Head office sends it as it is. */}
                {!p.isHQ && (
                  <PlanSectionShell
                    icon={PenLine}
                    title={`What ${who} can change`}
                    summary={
                      [
                        email.repEdit.note && "a note",
                        email.subjectMode === "choice" && "the subject line",
                        email.repEdit.blocks && "which blocks",
                        email.repEdit.piece && "which documents",
                      ]
                        .filter(Boolean)
                        .join(", ") || "Nothing"
                    }
                    state={planState(false)}
                    source={`for a ${p.sender.long.toLowerCase()}`}
                    open={openSection === "edit"}
                    onToggle={() => toggleSection("edit")}
                  >
                    <div className="space-y-2">
                      <TickRow
                        on={email.repEdit.note}
                        title="Add a personal note"
                        detail="Up to 255 characters at the top, in their own words. Plain text, so no claims can be formatted into it."
                        onToggle={() => setEmail({ repEdit: { ...email.repEdit, note: !email.repEdit.note } })}
                      />
                      <TickRow
                        on={email.subjectMode === "choice"}
                        title="Choose the subject line"
                        detail="SwishX drafts several on the email plan; they pick one when sending."
                        onToggle={() => setEmail(email.subjectMode === "choice" ? { subjectMode: "one", subjects: [email.subjects[0] ?? 0] } : { subjectMode: "choice", subjects: p.subjects.map((_, i) => i) })}
                      />
                      <TickRow
                        on={email.repEdit.blocks}
                        title="Choose which blocks"
                        detail="From the blocks you confirm on the email plan, they pick which to send."
                        onToggle={() => setEmail({ repEdit: { ...email.repEdit, blocks: !email.repEdit.blocks } })}
                      />
                      <TickRow
                        on={email.repEdit.piece}
                        title="Choose which documents to include"
                        detail="When the email has more than one document, they tick which go with it."
                        onToggle={() => setEmail({ repEdit: { ...email.repEdit, piece: !email.repEdit.piece } })}
                      />
                      <p className="text-label text-ink-3">{Who} never upload files, add their own links or type their own subject line.</p>
                    </div>
                    <PlanSectionContinue onClick={() => advanceFrom("edit")} />
                  </PlanSectionShell>
                )}

                {/* What SwishX decided, shown rather than asked. */}
                <div className="rounded-panel border border-hair bg-card p-4 shadow-2xs">
                  <div className="text-micro font-extrabold uppercase tracking-wide text-ink-4">Handled by SwishX</div>
                  <ul className="mt-2 space-y-1.5 text-body text-ink-2">
                    {[
                      p.unbranded
                        ? ["No safety information", "no product is named or implied, so none is needed"]
                        : ["Important Safety Information", `the current ${brandName} ISI${p.professional ? "" : " in plain language"}${p.boxedWarning ? ", with the boxed warning," : ""} at the foot of every email`],
                      ["Unsubscribe and company address", p.professional ? "required in every commercial email" : "required, with why they're receiving it and the privacy policy"],
                      ["Job code", `US-${brandName.slice(0, 3).toUpperCase()}-2611-0042, the number MLR approves this email under`],
                      ["Layout", "single column, 600 px wide, reads on a phone and with images off"],
                      ["References", "numbered automatically from each block's claim"],
                      ["Links added for you", `${p.unbranded ? "" : p.professional ? "Prescribing Information, safety information, " : "Medication Guide, safety information, "}unsubscribe and privacy, each tracked for click reports`],
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
                  onClick={draftEmail}
                  className="h-9 shrink-0 cursor-pointer rounded-control bg-brand px-5 text-body font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-deep disabled:opacity-40"
                >
                  <span>Confirm &amp; Draft Email Plan</span>
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Button>
              }
            />
          )}

          {planPhase === "plan" && stage === "emailplan" && (
            <>
              <EmailPlanStep project={p} />
              <ActionBar
                icon={p.included.length ? <CheckCircle2 className="size-4.5 shrink-0 text-ok-on-dark" /> : <AlertTriangle className="size-4.5 shrink-0 text-warn-on-dark" />}
                title={p.included.length ? "Ready to build the email" : "No blocks in the email"}
                description={p.included.length ? `${p.included.length} blocks · ${p.template.title}${p.attachedPieces.length ? ` · ${p.attachedPieces.length} documents` : ""}` : "Tick at least one block."}
                action={
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="ghost" onClick={() => setStage("input")} className="h-9 text-body font-bold text-white hover:bg-white/10">
                      Back to Need your input
                    </Button>
                    <Button
                      disabled={p.included.length === 0}
                      onClick={() => setStage("building")}
                      className="h-9 shrink-0 cursor-pointer rounded-control bg-brand px-5 text-body font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-deep disabled:opacity-40"
                    >
                      <span>Build Email</span>
                      <ArrowRight className="ml-1.5 size-3.5" />
                    </Button>
                  </div>
                }
              />
            </>
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
                  {msg.role === "swishx" && idx === chatMessages.length - 1 && planPhase === "plan" && stage !== "building" && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(stage === "emailplan" ? ["Make the header plainer", "Use the brand colour more", "Make it read like a letter"] : ["Send it from head office", "Make the button say Book a call", "No personal note"]).map((chip) => (
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
                  onClick={draftEmail}
                  className="h-7.5 shrink-0 cursor-pointer rounded-chip bg-brand px-3 text-label font-bold text-white shadow-xs transition-all hover:scale-[1.02] hover:bg-brand-deep disabled:opacity-40"
                >
                  <span>Draft Email Plan</span>
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
          {pendingPackshot.length > 0 && (
            <FileNoteDialog
              files={pendingPackshot.map((m) => ({ id: m.id, name: m.name, kind: "media" as const, previewUrl: m.url, mediaKind: "image" as const }))}
              title="What is this asset for?"
              prompt="A note and a variant travel with each asset, so SwishX places it in the right part of the email."
              placeholder="e.g. the packshot beside the primary claim"
              variations={brandVariations(brandName)}
              onCancel={() => setPendingPackshot([])}
              onConfirm={(notes, variations) => {
                setEmail({ packshots: [...email.packshots, ...pendingPackshot.map((m) => ({ ...m, note: notes[m.id].trim(), variation: variations[m.id] }))] });
                setPendingPackshot([]);
              }}
            />
          )}
          {pendingReference.length > 0 && (
            <FileNoteDialog
              files={pendingReference.map((r) => ({ id: r.id, name: r.name, kind: "media" as const, previewUrl: r.previewUrl, mediaKind: "image" as const }))}
              title="What should we take from this reference?"
              prompt="Say whether it's the look to follow or an image to use, and which part matters."
              placeholder="e.g. use this clinic photo in the header, or follow this layout"
              onCancel={() => setPendingReference([])}
              onConfirm={(notes) => {
                setEmail({ references: [...email.references, ...pendingReference.map((r) => ({ ...r, note: notes[r.id].trim(), kind: "image" as const }))] });
                setPendingReference([]);
              }}
            />
          )}
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
