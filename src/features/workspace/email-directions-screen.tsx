"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Check, CheckCircle2, Eye, FileText, Film, Image as ImageIcon, Library, Link2, Mail, Megaphone, MousePointerClick, Palette, Stamp, PanelRight, PenLine, Plus, Send, ShieldCheck, Users, X } from "lucide-react";
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
import { ApprovedMaterialsModal } from "@/features/workspace/approved-materials-modal";
import { ApprovedMaterialViewerModal } from "@/features/workspace/approved-material-viewer-modal";
import { AssetPreview } from "@/features/content-library/asset-preview";
import { Tag, TickRow } from "@/features/workspace/email-plan-parts";
import { EmailPlanStep } from "@/features/workspace/email-plan-step";
import { FileNoteDialog } from "@/features/workspace/file-note-dialog";
import { AssetStrip, MediaAssetTile, MediaAttachmentGrid, brandVariations, workspaceAssets } from "@/features/workspace/workspace-assets";
import { AUDIENCE_LABEL, EMAIL_AUDIENCES, EMAIL_CHANNELS, EMAIL_PURPOSES, SENDER_PLURAL, audienceNoun, isUrl, purposesFor, senderInfo, sendersFor, type EmailAudience, type EmailBacklinkItem, type EmailBlock, type EmailChannel, type EmailCtaItem, type EmailPiece } from "@/features/workspace/email-options";
import { ChannelLogo } from "@/components/ui/channel-logo";

type SectionId = "sources" | "materials" | "audience" | "channel" | "visuals" | "references" | "logo" | "button" | "edit";

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
  const [approvedModalOpen, setApprovedModalOpen] = useState(false);
  const [previewPiece, setPreviewPiece] = useState<EmailPiece | null>(null);
  const { message: toastMessage, open: toastOpen, tone: toastTone, showToast } = useToast();

  const allCtasValid = p.ctas.every((c) => isUrl(c.url));
  const allBacklinksValid = p.backlinks.every((b) => isUrl(b.url));
  const missingCta = p.ctas.find((c) => !isUrl(c.url));
  const missingBacklink = p.backlinks.find((b) => !isUrl(b.url));

  const needsYou: Record<SectionId, boolean> = {
    sources: !hasSources,
    materials: false,
    audience: false,
    channel: false,
    visuals: false,
    references: false,
    logo: false,
    button: !allCtasValid || !allBacklinksValid,
    edit: false,
  };
  /* What SwishX needs first; everything it could decide follows. */
  /* Sources first: the blocks, subject lines and look are drafted from them, on the email plan. */
  const order: SectionId[] = [
    "sources",
    ...(!p.unbranded ? (["materials"] as const) : []),
    "audience",
    "channel",
    ...(p.unbranded ? [] : (["visuals"] as const)),
    "references",
    ...(p.unbranded ? [] : (["logo"] as const)),
    "button",
    ...(p.isHQ ? [] : (["edit"] as const)),
  ];
  const [openSection, setOpenSection] = useState<SectionId | null>("sources");
  const toggleSection = (id: SectionId) => setOpenSection(openSection === id ? null : id);
  const advanceFrom = (section: SectionId) => {
    const rest = order.slice(order.indexOf(section) + 1);
    setOpenSection(rest.find((id) => needsYou[id]) ?? rest[0] ?? null);
  };

  const blocker = !hasSources
    ? { title: "Add a source to start", detail: "Use the evidence dossier or add files in Research and Sources." }
    : needsYou.button
      ? {
          title: "Complete buttons & backlinks",
          detail: missingCta
            ? `Add a valid URL for "${missingCta.label || "CTA Button"}" in Email buttons & backlinks.`
            : missingBacklink
            ? `Add a valid URL for "${missingBacklink.title || "Backlink"}" in Email buttons & backlinks.`
            : "Every button and resource backlink must have a valid web address starting with https://",
        }
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
      if (/block/i.test(lower)) {
        const rawTopic = text
          .replace(/^(please\s+)?(add|create|draft|include)\s+(a\s+)?(content\s+)?block(\s+about|\s+on|\s+for)?/i, "")
          .replace(/\[topic,?\s*e\.g\.\s*|\]/gi, "")
          .trim() || "Additional clinical evidence";
        const title = rawTopic.split(/[.,\n]/)[0].slice(0, 42).replace(/^[a-z]/, (c) => c.toUpperCase());
        const newBlock: EmailBlock = {
          id: `custom-block-${Date.now()}`,
          title: title.length > 3 ? title : "Clinical evidence readout",
          claimId: `CL-CS${Math.floor(Math.random() * 800 + 100)}`,
          text: `Verified clinical evidence regarding ${rawTopic.toLowerCase()}, drafted directly from the ${brandName} dossier for promotional balance.`,
          source: `${brandName} Evidence Dossier · §3.2`,
          group: "custom" as const,
          newClaim: true,
        };
        setEmail({ extraBlocks: [...(email.extraBlocks || []), newBlock] });
        reply = `I've drafted and added a new content block: **${newBlock.title}** (Claim ID: **${newBlock.claimId}**), grounded in the **${brandName}** dossier. It has been added to your Content Blocks and ticked for inclusion.`;
      } else if (/(secondary\s+)?(cta|button)/i.test(lower) && /(add|create|new)/i.test(lower)) {
        const label = text.replace(/.*?(button|cta)(\s+(for|called|named))?\s+/i, "").replace(/\[.*?\]/g, "").trim() || "Explore More";
        const newCta: EmailCtaItem = {
          id: `cta-${Date.now()}`,
          label: label.slice(0, 32),
          url: `https://www.${brandName.toLowerCase()}-hcp.com/resources`,
          priority: "secondary",
          blockId: null,
        };
        setEmail({ ctas: [...p.ctas, newCta] });
        reply = `Added a secondary CTA button: **${newCta.label}**. You can assign it to a specific block in the Email Plan.`;
      } else if (/backlink|citation/i.test(lower) && /(add|attach|link)/i.test(lower)) {
        const title = text.replace(/.*?(backlink|citation)(\s+(for|to|called))?\s+/i, "").trim() || "Clinical Reference";
        const newBl: EmailBacklinkItem = {
          id: `bl-${Date.now()}`,
          title: title.slice(0, 40),
          context: `Study citation for ${brandName}`,
          url: "https://clinicaltrials.gov",
          blockId: null,
        };
        setEmail({ backlinks: [...p.backlinks, newBl] });
        reply = `Added resource backlink: **${newBl.title}**. You can tag it to any clinical block in the Email Plan.`;
      } else if (/head office|from the brand/.test(lower)) {
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

  const handleAskChatForBlock = (prefill?: string) => {
    setCopilotPanelOpen(true);
    if (prefill) {
      setChatInput(prefill);
    }
  };

  const handleAddSecondaryCta = () => {
    const newCta: EmailCtaItem = {
      id: `cta-${Date.now()}`,
      label: "Explore Clinical Study",
      url: `https://www.${brandName.toLowerCase()}-hcp.com/study`,
      priority: "secondary",
      blockId: null,
    };
    setEmail({ ctas: [...p.ctas, newCta] });
  };

  const handleUpdateCta = (id: string, patch: Partial<EmailCtaItem>) => {
    const updated = p.ctas.map((c) => (c.id === id ? { ...c, ...patch } : c));
    const prim = updated.find((c) => c.priority === "primary") || updated[0];
    setEmail({ ctas: updated, ctaText: prim?.label, ctaUrl: prim?.url });
  };

  const handleRemoveCta = (id: string) => {
    const updated = p.ctas.filter((c) => c.id !== id);
    setEmail({ ctas: updated });
  };

  const handleAddBacklink = () => {
    const newBl: EmailBacklinkItem = {
      id: `bl-${Date.now()}`,
      title: "Clinical Study Registry",
      context: "Phase III registration & study protocol on ClinicalTrials.gov",
      url: "https://clinicaltrials.gov",
      blockId: null,
    };
    setEmail({ backlinks: [...p.backlinks, newBl] });
  };

  const handleUpdateBacklink = (id: string, patch: Partial<EmailBacklinkItem>) => {
    setEmail({
      backlinks: p.backlinks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    });
  };

  const handleRemoveBacklink = (id: string) => {
    setEmail({ backlinks: p.backlinks.filter((b) => b.id !== id) });
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
                  />
                </PlanSectionShell>

                {/* 2. Approved brand materials: Videos, Docs, and selective Ad cutdowns */}
                {!p.unbranded && (
                  <PlanSectionShell
                    icon={Library}
                    title="Approved Brand Materials"
                    summary={
                      p.attachedPieces.length > 0
                        ? `${p.attachedPieces.length} approved ${p.attachedPieces.length === 1 ? "material" : "materials"} attached`
                        : "Attach approved videos, docs, or ad cutdowns for this drug"
                    }
                    state={planState(false, p.attachedPieces.length === 0)}
                    source={p.attachedPieces.length > 0 ? `${p.attachedPieces.length} attached` : "optional"}
                    open={openSection === "materials"}
                    onToggle={() => toggleSection("materials")}
                  >
                    <div className="space-y-3">
                      <p className="text-body leading-snug text-ink-3">
                        Videos, clinical infographics, or specific ad cutdowns already approved in the Content Library. SwishX includes them as interactive link cards and grounds the email&apos;s copy in their claims.
                      </p>
                      {p.attachedPieces.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {p.attachedPieces.map((pc) => {
                            const isVideo = pc.kind === "Video" || (pc.kind === "Ad" && /video|reel|shorts|youtube/i.test(pc.title));
                            return (
                              <div
                                key={pc.id}
                                className="group relative flex flex-col overflow-hidden rounded-panel border border-hair bg-card shadow-2xs hover:shadow-xs transition"
                              >
                                {/* Visual Preview Thumbnail Outside */}
                                <div className="relative h-28 w-full overflow-hidden bg-subtle">
                                  {pc.asset ? (
                                    <AssetPreview asset={pc.asset} className="h-full w-full" />
                                  ) : (
                                    <div
                                      className="h-full w-full"
                                      style={{ background: "linear-gradient(150deg,#111827,#1f2937 55%,#334155)" }}
                                    />
                                  )}
                                  <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-chip bg-black/60 px-2 py-0.5 text-micro font-bold uppercase tracking-wider text-white backdrop-blur-sm pointer-events-none">
                                    {isVideo ? <Film className="size-3" /> : pc.kind === "Ad" ? <Megaphone className="size-3" /> : <FileText className="size-3" />}
                                    {pc.kind} · {pc.spec}
                                  </span>

                                  {/* Overlay Full Preview Button */}
                                  <button
                                    type="button"
                                    onClick={() => setPreviewPiece(pc)}
                                    className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-chip bg-black/75 px-2.5 py-1 text-micro font-bold text-white shadow-sm backdrop-blur-sm hover:bg-black transition cursor-pointer"
                                    title="Open full interactive preview"
                                  >
                                    <Eye className="size-3.5" />
                                    <span>Full preview</span>
                                  </button>
                                </div>

                                {/* Content and Meta */}
                                <div className="flex flex-1 flex-col justify-between p-3.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <h4 className="line-clamp-1 text-body font-extrabold text-ink">{pc.title}</h4>
                                      <p className="mt-0.5 line-clamp-1 text-caption text-ink-3">
                                        {pc.spec} · {pc.approval}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setEmail({ attached: email.attached.filter((x) => x !== pc.id) })}
                                      className="grid size-7 cursor-pointer place-items-center rounded-full text-ink-4 hover:bg-black/5 hover:text-ink transition shrink-0"
                                      title="Remove material"
                                    >
                                      <X className="size-3.5" />
                                    </button>
                                  </div>

                                  <div className="mt-3 flex items-center justify-between border-t border-hair-2 pt-2 text-micro">
                                    <span className="text-ink-4">Attached</span>
                                    <button
                                      type="button"
                                      onClick={() => setPreviewPiece(pc)}
                                      className="inline-flex items-center gap-1 text-brand font-bold hover:underline cursor-pointer"
                                    >
                                      <Eye className="size-3" />
                                      <span>{isVideo ? "Play video" : pc.kind === "Docs" ? "Read all pages" : "Inspect cutdown"}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-control border border-dashed border-hair-3 p-4 text-center text-label text-ink-3">
                          No approved collateral attached yet.
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setApprovedModalOpen(true)}
                          className="h-8 gap-1.5 text-label font-bold cursor-pointer"
                        >
                          <Library className="size-3.5" />
                          <span>{p.attachedPieces.length > 0 ? "Change or add materials" : "Browse approved materials"}</span>
                        </Button>
                      </div>
                    </div>
                    <PlanSectionContinue onClick={() => advanceFrom("materials")} />
                  </PlanSectionShell>
                )}

                {/* 2. Audience and sender, as set at the start: a tile like every other, changeable here. */}
                <PlanSectionShell
                  icon={Users}
                  title="Audience & Sender"
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
                        footnote="HCP and P&T Committee emails are Approved Email, deployed through your CRM."
                      />
                    </DecisionRow>
                    <DecisionRow label="Sent by" value={p.sender.long} icon={<Mail className="size-4" />} editing={editing === "sender"} onEdit={() => setEditing(editing === "sender" ? null : "sender")}>
                      <ChipChoices
                        label="Who sends it?"
                        options={sendersFor(p.audience).map((id) => senderInfo(id, p.audience).long)}
                        values={[p.sender.long]}
                        onToggle={(long) => setAbout({ sender: sendersFor(p.audience).find((id) => senderInfo(id, p.audience).long === long)! })}
                        onDone={() => setEditing(null)}
                        footnote="Controls personalization: personal note and fragment selection for sales reps; scientific non-promotional material for MSLs; locked broadcast for HQ."
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

                {/* Sending Channel & CRM Platform */}
                <PlanSectionShell
                  icon={Send}
                  title="Sending Channels & CRM Platforms"
                  summary={(() => {
                    const activeIds = email.channels && email.channels.length > 0 ? email.channels : [email.channel || "veeva"];
                    const activeChannels = activeIds.map((id) => EMAIL_CHANNELS.find((c) => c.id === id)!).filter(Boolean);
                    if (activeChannels.length === 1) {
                      return `${activeChannels[0].name} · ${activeChannels[0].complianceTag}`;
                    }
                    return `${activeChannels.length} platforms selected (${activeChannels.map((c) => c.name).join(", ")})`;
                  })()}
                  state={planState(false)}
                  source="architecture target"
                  open={openSection === "channel"}
                  onToggle={() => toggleSection("channel")}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-body leading-snug text-ink-3">
                        Select one or more destination platforms where this email will be deployed. SwishX aligns fragment syntax, MLR compliance locking, and CRM personalization tokens across all selected targets.
                      </p>
                      <span className="rounded-chip bg-tint px-2 py-0.5 text-micro font-bold text-brand-deep">
                        Multi-select enabled
                      </span>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {EMAIL_CHANNELS.map((ch) => {
                        const activeIds = email.channels && email.channels.length > 0 ? email.channels : [email.channel || "veeva"];
                        const on = activeIds.includes(ch.id);
                        const isRecommended = ch.recommendedFor(p.audience, email.sender);

                        const toggleChannel = () => {
                          let next: EmailChannel[];
                          if (on) {
                            if (activeIds.length <= 1) return; // Keep at least one selected
                            next = activeIds.filter((x) => x !== ch.id);
                          } else {
                            next = [...activeIds, ch.id];
                          }
                          setEmail({ channels: next, channel: next[0] });
                        };

                        return (
                          <button
                            key={ch.id}
                            type="button"
                            aria-pressed={on}
                            onClick={toggleChannel}
                            className={cn(
                              "flex flex-col justify-between rounded-control border p-3.5 text-left transition shadow-2xs cursor-pointer",
                              on
                                ? "border-brand bg-tint/60 ring-2 ring-brand/15"
                                : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas/50"
                            )}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <ChannelLogo id={ch.id} />
                                  <div className="min-w-0">
                                    <span className="font-bold text-body text-ink block truncate">{ch.name}</span>
                                    <span className="text-micro font-semibold text-accent-violet block truncate">{ch.sub}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {isRecommended && <Tag tone="brand">Recommended</Tag>}
                                  <div
                                    className={cn(
                                      "grid size-5 place-items-center rounded-sm border transition",
                                      on ? "border-brand bg-brand text-white shadow-2xs" : "border-hair-3 bg-card"
                                    )}
                                  >
                                    {on && <Check className="size-3.5 stroke-[3]" />}
                                  </div>
                                </div>
                              </div>
                              <p className="mt-2.5 text-caption text-ink-3 leading-relaxed">
                                {ch.hint}
                              </p>
                            </div>

                            <div className="mt-3 border-t border-hair-2 pt-2 flex items-center justify-between text-micro font-mono text-ink-4">
                              <span className="truncate max-w-[220px]">{ch.tokens}</span>
                              <span className="font-sans font-bold text-ink-3">{ch.category.toUpperCase()}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <PlanSectionContinue onClick={() => advanceFrom("channel")} />
                </PlanSectionShell>

                {/* 3. Product & device visuals, as in every module. Not for unbranded emails, which can't show the product. */}
                {!p.unbranded && (
                  <PlanSectionShell
                    icon={ImageIcon}
                    title="Product & Device Visuals"
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
                  title="Visual & Creative References"
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
                    title="Brand Logo & Mark"
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

                {/* 6. Email buttons and backlinks: Primary, Secondary CTAs, and verified resource backlinks */}
                <PlanSectionShell
                  icon={MousePointerClick}
                  title="Email Buttons & Backlinks"
                  summary={
                    needsYou.button
                      ? "Add missing destination URLs for buttons or backlinks"
                      : `Primary: "${p.ctaText}" · ${p.ctas.length} ${p.ctas.length === 1 ? "button" : "buttons"}${p.backlinks.length ? ` · ${p.backlinks.length} backlink${p.backlinks.length === 1 ? "" : "s"}` : ""}`
                  }
                  state={planState(needsYou.button)}
                  source="from you"
                  open={openSection === "button"}
                  onToggle={() => toggleSection("button")}
                >
                  <div className="space-y-5">
                    {/* Part 1: Buttons and CTAs */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-body font-bold text-ink">Action Buttons (CTAs)</span>
                          <span className="text-caption font-medium text-ink-3">({p.ctas.length} active)</span>
                        </div>
                        <p className="mt-0.5 text-label text-ink-3">
                          Primary CTA serves as the main campaign conversion goal. Secondary CTAs can be positioned alongside or assigned to specific content blocks in the Email Plan.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {p.ctas.map((cta, idx) => {
                          const isPrimary = cta.priority === "primary";
                          const missing = !isUrl(cta.url);
                          return (
                            <div
                              key={cta.id}
                              className={cn(
                                "flex flex-col gap-3 rounded-control border p-3.5 transition shadow-2xs",
                                isPrimary ? "border-hair-2 bg-card" : "border-hair bg-canvas/70"
                              )}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {isPrimary ? (
                                    <Tag tone="brand">Primary CTA</Tag>
                                  ) : (
                                    <Tag tone="lock">Secondary CTA</Tag>
                                  )}
                                  <span className="text-caption font-semibold text-ink-3">
                                    {isPrimary ? "Main campaign button" : `Secondary button #${idx}`}
                                  </span>
                                </div>
                                {!isPrimary && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCta(cta.id)}
                                    className="grid size-6 cursor-pointer place-items-center rounded-full text-ink-4 hover:bg-black/5 hover:text-ink transition"
                                    title="Remove button"
                                  >
                                    <X className="size-3.5" />
                                  </button>
                                )}
                              </div>

                              <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                                <Field
                                  size="sm"
                                  label="Button text"
                                  value={cta.label}
                                  placeholder={isPrimary ? purpose.cta : "e.g. Explore Clinical Study"}
                                  maxLength={35}
                                  onChange={(e) => handleUpdateCta(cta.id, { label: e.target.value })}
                                  hint="Short and actionable."
                                />
                                <Field
                                  size="sm"
                                  label="Page it opens"
                                  type="url"
                                  value={cta.url}
                                  placeholder="https://"
                                  onChange={(e) => handleUpdateCta(cta.id, { url: e.target.value.trim() })}
                                  error={cta.url && missing ? "Enter a full web address starting with https://" : undefined}
                                  hint="Goes to MLR with the email as a linked destination."
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleAddSecondaryCta}
                          className="h-8 gap-1.5 text-label font-bold cursor-pointer"
                        >
                          <Plus className="size-3.5" />
                          <span>Add Secondary Button</span>
                        </Button>
                      </div>
                    </div>

                    {/* Part 2: Resource Backlinks and External Citations */}
                    <div className="space-y-3 border-t border-hair-2 pt-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-body font-bold text-ink">Resource Backlinks &amp; Citations</span>
                          <span className="text-caption font-medium text-ink-3">({p.backlinks.length} active)</span>
                        </div>
                        <p className="mt-0.5 text-label text-ink-3">
                          Provide verified external links (e.g. journal publications, ClinicalTrials.gov, co-pay portals). In the Email Plan, you can assign each backlink to a specific content block.
                        </p>
                      </div>

                      {p.backlinks.length > 0 ? (
                        <div className="space-y-3">
                          {p.backlinks.map((bl) => {
                            const missing = !isUrl(bl.url);
                            return (
                              <div
                                key={bl.id}
                                className="flex flex-col gap-3 rounded-control border border-hair-2 bg-card p-3.5 shadow-2xs"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <Tag tone="ok">Backlink</Tag>
                                    <span className="truncate text-caption font-bold text-ink">{bl.title}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveBacklink(bl.id)}
                                    className="grid size-6 cursor-pointer place-items-center rounded-full text-ink-4 hover:bg-black/5 hover:text-ink transition"
                                    title="Remove backlink"
                                  >
                                    <X className="size-3.5" />
                                  </button>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                  <Field
                                    size="sm"
                                    label="Anchor title"
                                    value={bl.title}
                                    placeholder="e.g. AFFIRM-3 Study Publication"
                                    onChange={(e) => handleUpdateBacklink(bl.id, { title: e.target.value })}
                                  />
                                  <Field
                                    size="sm"
                                    label="Clinical context / note"
                                    value={bl.context}
                                    placeholder="e.g. Full Phase III trial methodology in NEJM"
                                    onChange={(e) => handleUpdateBacklink(bl.id, { context: e.target.value })}
                                  />
                                </div>
                                <Field
                                  size="sm"
                                  label="Redirect URL"
                                  type="url"
                                  value={bl.url}
                                  placeholder="https://"
                                  onChange={(e) => handleUpdateBacklink(bl.id, { url: e.target.value.trim() })}
                                  error={bl.url && missing ? "Enter a full web address starting with https://" : undefined}
                                  hint="Tracked destination link for HCP reference."
                                />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-control border border-dashed border-hair-3 p-3 text-center text-label text-ink-3">
                          No resource backlinks added yet.
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleAddBacklink}
                          className="h-8 gap-1.5 text-label font-bold cursor-pointer"
                        >
                          <Link2 className="size-3.5" />
                          <span>Add Resource Backlink</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <PlanSectionContinue onClick={() => advanceFrom("button")} />
                </PlanSectionShell>

                {/* 7. What the sender can change: every freedom in one place. Head office sends it as it is. */}
                {!p.isHQ && (
                  <PlanSectionShell
                    icon={PenLine}
                    title={p.email.sender === "rep" ? "What Sales Reps Can Change" : `What ${who[0].toUpperCase() + who.slice(1)} Can Change`}
                    summary={
                      [
                        email.repEdit.note && "a note",
                        email.subjectMode === "choice" && "the subject line",
                        email.repEdit.blocks && "which blocks",
                        email.repEdit.reorder && "reorder blocks",
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
                        detail="From the blocks you confirm on the email plan, reps pick which to send (unless marked Mandatory)."
                        onToggle={() => setEmail({ repEdit: { ...email.repEdit, blocks: !email.repEdit.blocks } })}
                      />
                      <TickRow
                        on={!!email.repEdit.reorder}
                        title="Reorder content blocks"
                        detail="Allow sales reps in Veeva CRM Approved Email to rearrange the order of blocks to match conversation flow."
                        onToggle={() => setEmail({ repEdit: { ...email.repEdit, reorder: !email.repEdit.reorder } })}
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
                        ? ["No Safety Information", "no product is named or implied, so none is needed"]
                        : ["Important Safety Information", `the current ${brandName} ISI${p.professional ? "" : " in plain language"}${p.boxedWarning ? ", with the boxed warning," : ""} at the foot of every email`],
                      ["Unsubscribe & Company Address", p.professional ? "required in every commercial email" : "required, with why they're receiving it and the privacy policy"],
                      ["MLR Job Code", `US-${brandName.slice(0, 3).toUpperCase()}-2611-0042, the number MLR approves this email under`],
                      ["Layout & Responsiveness", "single column, 600 px wide, responsive across mobile, desktop, and Outlook"],
                      ["Clinical References", "numbered automatically from each block's verified claim"],
                      ["Tracked Compliance Links", `${p.unbranded ? "" : p.professional ? "Prescribing Information, Important Safety Information, " : "Medication Guide, Important Safety Information, "}unsubscribe and privacy, each tracked for click reports`],
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
              <EmailPlanStep project={p} onAskChatForBlock={handleAskChatForBlock} />
              <ActionBar
                icon={p.included.length ? <CheckCircle2 className="size-4.5 shrink-0 text-ok-on-dark" /> : <AlertTriangle className="size-4.5 shrink-0 text-warn-on-dark" />}
                title={p.included.length ? "Ready to build the email" : "No blocks in the email"}
                description={p.included.length ? `${p.included.length} blocks · ${p.template.title}${p.attachedPieces.length ? ` · ${p.attachedPieces.length} approved ${p.attachedPieces.length === 1 ? "material" : "materials"}` : ""}` : "Tick at least one block."}
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
          <ApprovedMaterialsModal
            open={approvedModalOpen}
            onClose={() => setApprovedModalOpen(false)}
            brandName={brandName}
            audience={p.audience}
            allPieces={p.library}
            selectedIds={email.attached}
            onConfirm={(ids) => setEmail({ attached: ids })}
          />
          {previewPiece && (
            <ApprovedMaterialViewerModal
              piece={previewPiece}
              onClose={() => setPreviewPiece(null)}
              isAttached={email.attached.includes(previewPiece.id)}
              onToggleAttach={(id) =>
                setEmail({
                  attached: email.attached.includes(id)
                    ? email.attached.filter((x) => x !== id)
                    : [...email.attached, id],
                })
              }
            />
          )}
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
