"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Image as ImageIcon,
  ListChecks,
  MessageSquareQuote,
  Palette,
  PanelRight,
  ShieldCheck,
  Stamp,
  Stethoscope,
  Tag,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatComposer, ComposerAttachButton } from "@/components/patterns/chat-composer";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { LogoMark } from "@/components/ui/logo-mark";
import { ScreenHeader } from "@/components/patterns/screen-header";
import { ActionBar } from "@/components/patterns/action-bar";
import { SplitLayout } from "@/components/patterns/workbench-layout";
import { SaveOrDiscardDialog } from "@/components/patterns/save-or-discard-dialog";
import { Toast, useToast } from "@/components/patterns/toast";
import { AudienceIcon } from "@/components/ui/select-icons";
import { cn } from "@/lib/cn";
import type { Audience } from "@/types/content";
import { ProjectMenu, ProjectTitle } from "@/features/workspace/project-title";
import { useBrandName } from "@/features/workspace/brand-catalogue";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { useProjectExit } from "@/features/workspace/project-exit";
import { VersionChip, type AssetVersion } from "@/features/workspace/version-trail";
import { DossierReaderModal } from "@/features/dossiers/dossier-reader-modal";
import { dossierFor } from "@/features/dossiers/dossier-for";
import { moleculeFor } from "@/features/workspace/grounding-dossiers";
import type { BrandDossier } from "@/features/dossiers/dossier-types";
import { ResearchSourcesContent, researchSummary, type UploadedDoc } from "@/features/workspace/research-sources-section";
import { usePlanResearch } from "@/features/workspace/use-plan-research";
import { IntakePlaceholder } from "@/features/workspace/intake-checklist";
import { PlanSectionShell, planState, type PlanState } from "@/features/workspace/plan-status";
import { PlanSectionContinue } from "@/features/workspace/plan-section-continue";
import { GenerationProgress } from "@/features/workspace/generation-progress";
import { AdsCampaignStoryboard, AdsToMakeList, KeyMessageFields } from "@/features/workspace/ads-campaign-plan";
import { buildAdOutputs } from "@/features/workspace/ad-campaign";
import {
  BrandMarkContent,
  ChipChoices,
  ChoiceGroup,
  DecisionRow,
  HCP_SPECIALITIES,
  specialityLabel,
} from "@/features/workspace/plan-decisions";
import { LOGO_CORNERS } from "@/features/workspace/logo-watermark";
import { ChatAttachmentRow, useChatAttachments } from "@/features/workspace/chat-attachments";
import { FormattedMessageText } from "@/features/workspace/chat-message";
import { IntakeQuestionCard } from "@/features/workspace/intake-question-card";
import { ProjectContextModal } from "@/features/workspace/project-context-modal";
import { FileNoteDialog } from "@/features/workspace/file-note-dialog";
import {
  AssetStrip,
  MediaAssetTile,
  MediaAttachmentGrid,
  brandVariations,
  workspaceAssets,
} from "@/features/workspace/workspace-assets";
import { DOSSIERS, INITIAL_BRANDS } from "@/features/workspace/brand-modal-data";
import {
  buildIntakeQuestions,
  choicesMessage,
  intakeSteps,
  readIntakeBundle,
  type IntakeAnswer,
} from "@/features/workspace/plan-intake";
import {
  AD_AUDIENCES,
  AD_KIND_PRESETS,
  AD_TYPES,
  adClaims,
  brandAdFacts,
  closingLine,
  defaultNextStep,
  labelVersion,
  leadMessages,
  type AdType,
} from "@/features/workspace/ad-options";

/**
 * The Ads plan: the same screen as the Video and Docs plans.
 *
 * Need your input collects everything the storyboards are written from: the
 * sources, the key message and claims drawn from them (shown being
 * extracted), audience and branding, the ads to make, visuals, references and
 * the brand mark. Confirming writes the campaign storyboard: the video
 * storyboard and the image and carousel plan.
 */
type SectionId = "sources" | "message" | "audience" | "ads" | "visuals" | "references" | "logo";
type Extraction = "waiting" | "extracting" | "ready";
/** Long enough to read as work on the dossier, short enough not to stall the demo. */
const EXTRACT_MS = 6000;
const EXTRACT_STEPS = ["Reading the dossier and your files", "Matching approved claims in the Claims Library", "Drafting the key message"];
/** Need your input, then the wait while the plan is written, then the plan. */
type Stage = "input" | "building" | "campaign";

const DRAFT_ONLY: AssetVersion[] = [{ label: "Draft v1", state: "current", at: "Saved just now" }];

function brandIdFor(dossierId: string | undefined) {
  if (!dossierId) return "";
  return DOSSIERS[dossierId]?.brandId ?? dossierId;
}

export function AdsDirectionsScreen() {
  const {
    brief,
    sourcePayload,
    setSourcePayload,
    audience,
    setAudience,
    specialities,
    setSpecialities,
    adKind,
    adType,
    setAdType,
    adPlacements,
    setAdPlacements,
    projectName,
    logoMark,
    chatMessages,
    addChatMessage,
    copilotPanelOpen,
    copilotPanelWidth,
    setCopilotPanelWidth,
    setCopilotPanelOpen,
    toggleCopilotPanel,
  } = useWorkspaceStore();
  const exit = useProjectExit();
  const brandName = useBrandName(sourcePayload?.dossierId);
  const brandId = brandIdFor(sourcePayload?.dossierId);
  const facts = brandAdFacts(brandId);
  const claims = adClaims(brandId);
  const who: Audience = audience === "HCP" ? "HCP" : "Patient";
  const title = projectName || `${brandName} · ${AD_KIND_PRESETS[adKind].noun}`;
  const branding = AD_TYPES.find((t) => t.id === adType)!;

  /* ── The intake ── */
  const planPhase = useWorkspaceStore((st) => st.planPhase);
  const setPlanPhase = useWorkspaceStore((st) => st.setPlanPhase);
  const briefAttachments = useWorkspaceStore((st) => st.briefAttachments);
  const [intakeIndex, setIntakeIndex] = useState(0);
  const intakeQuestions = buildIntakeQuestions(briefAttachments, "ad", { brief });
  const currentIntake = planPhase === "intake" ? intakeQuestions[intakeIndex] : undefined;
  const intakeStepList = [
    ...intakeSteps(briefAttachments, brandName).slice(0, -1),
    { label: "Checked each placement's specs and policies", seconds: 0.8 },
    { label: "Listed what still needs your answer", seconds: 0.7 },
  ];

  /* ── Sources ── */
  const [dossierInUse, setDossierInUse] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [previewDossier, setPreviewDossier] = useState<BrandDossier | null>(null);
  const research = usePlanResearch();
  const hasSources = dossierInUse || uploadedDocs.length > 0;
  const [stage, setStage] = useState<Stage>("input");

  /* The key message and claims are drawn FROM the sources, so they wait for
     some and are shown being extracted whenever the sources change. */
  const [extraction, setExtraction] = useState<Extraction>("waiting");
  const [extractStep, setExtractStep] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const extract = (stillHasSources: boolean) => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    if (!stillHasSources) {
      setExtraction("waiting");
      return;
    }
    setExtraction("extracting");
    setExtractStep(0);
    EXTRACT_STEPS.forEach((_, i) => {
      if (i > 0) timers.current.push(window.setTimeout(() => setExtractStep(i), (EXTRACT_MS / EXTRACT_STEPS.length) * i));
    });
    timers.current.push(window.setTimeout(() => setExtraction("ready"), EXTRACT_MS));
  };
  const changeDossierInUse = (inUse: boolean) => {
    setDossierInUse(inUse);
    extract(inUse || uploadedDocs.length > 0);
  };
  const changeUploadedDocs: React.Dispatch<React.SetStateAction<UploadedDoc[]>> = (next) => {
    const value = typeof next === "function" ? next(uploadedDocs) : next;
    setUploadedDocs(value);
    extract(dossierInUse || value.length > 0);
  };

  /* ── What the plan holds ── */
  const [nextStep, setNextStep] = useState(defaultNextStep(adKind, who));
  const messages = leadMessages(adType, brandName, claims);
  const [chosenMessage, setChosenMessage] = useState("");
  const leadMessage = messages.includes(chosenMessage) ? chosenMessage : messages[0] ?? brandName;
  const [pickedClaims, setPickedClaims] = useState<string[]>(claims.slice(0, 2).map((c) => c.text));
  const usedClaims = claims.filter((c) => pickedClaims.includes(c.text));
  const closing = closingLine(nextStep, adType, brandName);

  /* What the campaign makes. Unticked ads aren't written, made, charged or sent to MLR. */
  const outputs = buildAdOutputs(adPlacements, adType);
  const [removed, setRemoved] = useState<string[]>([]);
  const kept = outputs.filter((o) => !removed.includes(o.id));
  const credits = kept.reduce((sum, o) => sum + o.credits, 0);
  const [editingDecision, setEditingDecision] = useState<string | null>(null);
  const [changingPlacements, setChangingPlacements] = useState(false);
  const showsProduct = adType !== "unbranded";

  const [packshots, setPackshots] = useState<Array<{ id: string; name: string; url: string; note?: string; variation?: string }>>([]);
  const [references, setReferences] = useState<Array<{ id: string; name: string; note?: string; previewUrl?: string; kind: "image" | "video" }>>([]);
  const [pendingPackshot, setPendingPackshot] = useState<Array<{ id: string; name: string; url: string }>>([]);
  const [pendingReference, setPendingReference] = useState<Array<{ id: string; name: string; previewUrl: string }>>([]);

  /* ── What still needs the marketer ── */
  const noClaims = adType === "product-claim" && claims.length === 0;
  const reminderBlocked = adType === "reminder" && facts.boxedWarning;
  const needsYou: Record<SectionId, boolean> = {
    sources: !hasSources,
    message: extraction === "ready" && noClaims,
    audience: reminderBlocked,
    ads: kept.length === 0,
    visuals: false,
    references: false,
    logo: false,
  };
  const messageState: PlanState = extraction !== "ready" ? "waiting" : planState(needsYou.message);
  const order: SectionId[] = ["sources", "message", "audience", "ads", ...(showsProduct ? (["visuals"] as const) : []), "references", "logo"];

  const [openSection, setOpenSection] = useState<SectionId | null>("sources");
  const toggleSection = (id: SectionId) => setOpenSection(openSection === id ? null : id);
  const advanceFrom = (section: SectionId) => {
    const rest = order.slice(order.indexOf(section) + 1);
    setOpenSection(rest.find((id) => needsYou[id]) ?? rest[0] ?? null);
  };

  const blocker = !hasSources
    ? { title: "Add a source to start", detail: "Use the evidence dossier or add files in Research and Sources." }
    : extraction === "extracting"
      ? { title: "Extracting key messages and claims", detail: `Reading the ${brandName} dossier and your files` }
      : noClaims
        ? { title: `No approved claims for ${brandName}`, detail: "Add claims in the Claims Library, or make the ads unbranded." }
        : reminderBlocked
          ? { title: "Reminder ads aren't allowed", detail: `${brandName} has a boxed warning. Choose Branded or Unbranded.` }
          : kept.length === 0
            ? { title: "No ads to make", detail: "Tick at least one ad in Ads to make." }
            : null;
  const planReady = planPhase === "plan" && !blocker;

  const { message: toastMessage, open: toastOpen, tone: toastTone, showToast } = useToast();

  /* ── Intake ── */
  const handleIntakeResearched = () => {
    if (intakeQuestions.length === 0) {
      addChatMessage({
        role: "swishx",
        text: `I've read the brief against the **${brandName}** dossier and checked each placement. The plan is on the left: add your sources, check the rest, then confirm and I'll write the campaign storyboard from them.`,
      });
      setPlanPhase("plan");
      return;
    }
    setPlanPhase("intake");
    const count = briefAttachments.length;
    addChatMessage({
      role: "swishx",
      text: count
        ? `I've read the brief and opened ${count === 1 ? "the attachment" : `all ${count} attachments`}. ${intakeQuestions.length} quick ${intakeQuestions.length === 1 ? "thing" : "things"} and I can lay the plan out: pick below, or just type.`
        : `I've read the brief against the **${brandName}** dossier and checked each placement. One thing and I can lay the plan out: pick below, or just type.`,
    });
  };

  const finishIntake = (answers: IntakeAnswer[]) => {
    setIntakeIndex(intakeQuestions.length);
    const step = answers.find((a) => a.kind === "nextstep");
    if (step) setNextStep(step.value);
    setTimeout(() => {
      addChatMessage({
        role: "swishx",
        text: `${answers.map((a) => a.reply).join(" ")}\n\nThat's everything I needed. The plan is on the left. Start with **Research and Sources**; once you confirm, I'll write the campaign storyboard from them.`,
      });
      setPlanPhase("plan");
      setOpenSection("sources");
    }, 650);
  };

  const answerIntakeChoices = (answers: IntakeAnswer[]) => {
    addChatMessage({ role: "user", text: choicesMessage(answers, intakeQuestions) });
    finishIntake(answers);
  };

  /* ── Chat ── */
  const chatFiles = useChatAttachments();
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const changeBranding = (next: AdType) => {
    setAdType(next);
    if (next === "unbranded") setPackshots([]);
  };

  const handleSendChat = (directText?: string) => {
    const attached = directText ? [] : chatFiles.take();
    const text = directText || chatInput.trim();
    if (!text && attached.length === 0) return;
    addChatMessage({
      role: "user",
      text: attached.length ? [text, ...attached.map((f) => `\u{1F4CE} ${f.name}`)].filter(Boolean).join("\n") : text,
    });
    if (!directText) setChatInput("");

    if (currentIntake) {
      finishIntake(readIntakeBundle(intakeQuestions, text, () => "doc"));
      return;
    }

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = `Understood. I've updated the plan, still grounded in the **${brandName}** dossier.`;
      if (/unbranded|disease awareness/.test(lower)) {
        changeBranding("unbranded");
        reply = `Switched to **unbranded** ads. ${brandName} won't be named or shown, so the packshots are gone too.`;
      } else if (/hcp|doctor|physician/.test(lower) && /audience|switch|for/.test(lower)) {
        setAudience("HCP");
        reply = "The ads are now for **HCPs**. Pick a specialty in **Audience and branding** if you want to narrow it.";
      } else if (/saving|copay/.test(lower)) {
        setNextStep("Sign up for savings");
        reply = `Every ad now closes with: **${closingLine("Sign up for savings", adType, brandName)}**`;
      }
      addChatMessage({ role: "swishx", text: reply });
    }, 450);
  };

  const confirmPlan = () => setStage("building");
  const buildSteps = [
    { label: `Read the ${brandName} dossier${uploadedDocs.length ? ` and ${uploadedDocs.length} ${uploadedDocs.length === 1 ? "file" : "files"}` : ""}`, seconds: 1.4 },
    { label: `Built every scene around "${leadMessage}"`, seconds: 1.4 },
    ...(kept.some((o) => o.format === "video") ? [{ label: "Wrote the video story and drew each shot", seconds: 1.8 }] : []),
    ...(kept.some((o) => o.format !== "video") ? [{ label: "Planned the image and carousel ads", seconds: 1.2 }] : []),
    { label: `Fitted ${kept.length} ads to their placements`, seconds: 1.0 },
  ];
  const handleCampaignBuilt = () => {
    setStage("campaign");
    addChatMessage({
      role: "swishx",
      text: `The campaign storyboard is ready, built around **${leadMessage}**. Select a scene or shot to change it, or tell me what to change.`,
    });
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
            <ProjectTitle kind="ad" fallback={title} className="text-body font-[800]" />
            <div className="mt-0.5 hidden text-micro text-ink-3 sm:block">Saved just now · Maya Kapoor</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ProjectMenu kind="ad" fallback={title} />
            <button
              type="button"
              onClick={toggleCopilotPanel}
              className={cn(
                "grid size-8 place-items-center rounded-chip border transition-colors cursor-pointer",
                copilotPanelOpen
                  ? "border-hair-2 bg-black/5 text-ink hover:bg-black/10"
                  : "border-hair-2 bg-card text-ink-3 hover:text-ink hover:border-brand shadow-2xs"
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
          {planPhase === "research" && (
            <GenerationProgress
              title="Reading your request..."
              subtitle="Understanding the brief, checking it against the approved dossier and each placement's specs."
              steps={intakeStepList}
              onDone={handleIntakeResearched}
            />
          )}

          {planPhase === "intake" && <IntakePlaceholder />}

          {planPhase === "plan" && stage === "building" && (
            <GenerationProgress
              title="Building the campaign storyboard..."
              subtitle={`Writing the video story and planning the image ads from your key message and the ${brandName} dossier.`}
              steps={buildSteps}
              onDone={handleCampaignBuilt}
            />
          )}

          {planPhase === "plan" && stage === "campaign" && (
            <AdsCampaignStoryboard
              brandId={brandId}
              brandName={brandName}
              adType={adType}
              leadMessage={leadMessage}
              claims={usedClaims}
              closing={closing}
              kept={kept}
              onConfirm={({ ads, credits: total, hasStills }) =>
                showToast(`${total.toLocaleString()} credits for ${ads} ads. ${hasStills ? "Layout selection" : "The editor"} is the next screen to build`)
              }
            />
          )}

          {planPhase === "plan" && stage === "input" && (
            <>
              <div className="flex shrink-0 items-center justify-between pb-1">
                <div>
                  <h2 className="text-display font-[850] tracking-tight text-ink">Need your input</h2>
                  <p className="mt-0.5 text-body text-ink-3">Answer below to help us refine the ads for you.</p>
                </div>
              </div>

              <div className="stagger-children w-full min-w-0 space-y-3">
                {/* 1. Research and Sources — the same tile as every plan, plus
                    the label the safety information comes from. */}
                <PlanSectionShell
                  icon={ShieldCheck}
                  title="Research and Sources"
                  summary={researchSummary(brandName, dossierInUse, uploadedDocs.length)}
                  state={planState(needsYou.sources)}
                  source={research.researching ? `researching ${research.current}/${research.total}` : "from source"}
                  open={research.researching || openSection === "sources"}
                  onToggle={() => { if (!research.researching) toggleSection("sources"); }}
                >
                  <ResearchSourcesContent
                    brandName={brandName || "Velmora"}
                    uploadedDocs={uploadedDocs}
                    onSetUploadedDocs={changeUploadedDocs}
                    onPreviewDossier={() => setPreviewDossier(dossierFor(brandName, moleculeFor(brandName)))}
                    onContinue={() => advanceFrom("sources")}
                    research={research}
                    onToast={showToast}
                    dossierInUse={dossierInUse}
                    onDossierInUseChange={changeDossierInUse}
                    notice={`Safety information comes from the ${brandName} ${labelVersion(brandId)}.${facts.boxedWarning ? " It carries a boxed warning, which every branded ad shows in full." : ""}`}
                  />
                </PlanSectionShell>

                {/* 2. Key message & claims — drawn from the sources, so it waits
                    for them and shows the extraction running. */}
                <PlanSectionShell
                  icon={MessageSquareQuote}
                  title="Key message & claims"
                  summary={
                    extraction === "waiting"
                      ? "Add a source first. The key message and claims come from it"
                      : extraction === "extracting"
                        ? "Extracting from the dossier and your files…"
                        : noClaims
                          ? `No approved claims for ${brandName} yet`
                          : adType === "product-claim"
                            ? `${leadMessage} · ${usedClaims.length} approved ${usedClaims.length === 1 ? "claim" : "claims"}`
                            : leadMessage
                  }
                  state={messageState}
                  source={extraction === "ready" ? (adType === "product-claim" ? "from Claims Library" : "from dossier") : undefined}
                  open={openSection === "message"}
                  onToggle={() => toggleSection("message")}
                >
                  {extraction === "waiting" && (
                    <div className="rounded-control border border-dashed border-hair-2 bg-canvas px-4 py-5 text-center">
                      <p className="text-body font-bold text-ink-2">Waiting for your sources</p>
                      <p className="mt-0.5 text-label text-ink-3">
                        Use the evidence dossier or add files in Research and Sources. SwishX pulls the key message and approved claims from them.
                      </p>
                      <Button size="sm" variant="secondary" className="mt-3" onClick={() => setOpenSection("sources")}>
                        Go to Research and Sources
                      </Button>
                    </div>
                  )}
                  {extraction === "extracting" && (
                    <div className="space-y-3" aria-live="polite">
                      <p className="text-body font-semibold text-ink-2">{EXTRACT_STEPS[extractStep]}…</p>
                      <div aria-hidden className="space-y-2.5">
                        {[100, 86, 72].map((width, index) => (
                          <div key={width} className="h-10 overflow-hidden rounded-control border border-hair-2 bg-card" style={{ width: `${width}%` }}>
                            <div className="intake-sweep h-full w-full" style={{ animationDelay: `${index * 0.22}s` }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {extraction === "ready" && noClaims && (
                    <div className="rounded-control border border-danger-line bg-danger-bg p-3.5">
                      <p className="text-body font-bold text-ink">{brandName} has no approved claims yet</p>
                      <p className="mt-0.5 text-label leading-snug text-ink-2">
                        A branded ad can only say what the Claims Library has approved. Add claims there, or make these ads unbranded.
                      </p>
                      <Button size="sm" variant="secondary" className="mt-2.5" onClick={() => changeBranding("unbranded")}>
                        Make them unbranded
                      </Button>
                    </div>
                  )}
                  {extraction === "ready" && !noClaims && (
                    <KeyMessageFields
                      adType={adType}
                      brandName={brandName}
                      messages={messages}
                      leadMessage={leadMessage}
                      onLeadMessage={setChosenMessage}
                      claims={claims}
                      pickedClaims={pickedClaims}
                      onToggleClaim={(text) =>
                        setPickedClaims((prev) => (prev.includes(text) ? (prev.length > 1 ? prev.filter((t) => t !== text) : prev) : [...prev, text]))
                      }
                      nextStep={nextStep}
                      onNextStep={setNextStep}
                    />
                  )}
                  {extraction === "ready" && <PlanSectionContinue onClick={() => advanceFrom("message")} />}
                </PlanSectionShell>

                {/* 3. Audience and branding — answered at the start, changeable here. */}
                <PlanSectionShell
                  icon={Users}
                  title="Audience and branding"
                  summary={`${who === "HCP" ? "HCPs" : "Patients"}${who === "HCP" && specialities.length > 0 ? ` · ${specialityLabel(specialities)}` : ""} · ${branding.label}`}
                  state={planState(needsYou.audience)}
                  source="from project start"
                  open={openSection === "audience"}
                  onToggle={() => toggleSection("audience")}
                >
                  <div className="space-y-2">
                    <DecisionRow
                      label="Audience"
                      value={who === "HCP" ? "HCPs" : "Patients"}
                      icon={<AudienceIcon value={who} />}
                      editing={editingDecision === "audience"}
                      onEdit={() => setEditingDecision(editingDecision === "audience" ? null : "audience")}
                    >
                      <ChoiceGroup
                        label="Who the ads are for"
                        value={who}
                        options={AD_AUDIENCES}
                        onChange={(next) => {
                          setAudience(next as Audience);
                          if (next !== "HCP") setSpecialities([]);
                          setEditingDecision(null);
                        }}
                        icon={(next) => <AudienceIcon value={next} />}
                      />
                    </DecisionRow>
                    {who === "HCP" && (
                      <DecisionRow
                        label="Specialty"
                        value={specialities.length > 0 ? specialityLabel(specialities) : "Any specialty"}
                        icon={<Stethoscope className="size-4" />}
                        editing={editingDecision === "speciality"}
                        onEdit={() => setEditingDecision(editingDecision === "speciality" ? null : "speciality")}
                      >
                        <ChipChoices
                          label="Narrow to the specialties these ads should reach"
                          options={HCP_SPECIALITIES}
                          values={specialities}
                          onToggle={(spec) =>
                            setSpecialities(specialities.includes(spec) ? specialities.filter((s) => s !== spec) : [...specialities, spec])
                          }
                          onDone={() => setEditingDecision(null)}
                        />
                      </DecisionRow>
                    )}
                    <DecisionRow
                      label="Branding"
                      value={branding.label}
                      icon={<Tag className="size-4" />}
                      editing={editingDecision === "branding"}
                      onEdit={() => setEditingDecision(editingDecision === "branding" ? null : "branding")}
                    >
                      <ChoiceGroup
                        label="What every ad must include follows from this"
                        value={branding.label}
                        options={AD_TYPES.map((t) => t.label)}
                        onChange={(label) => {
                          const next = AD_TYPES.find((t) => t.label === label)!;
                          if (next.id === "reminder" && facts.boxedWarning) {
                            showToast(`${brandName} has a boxed warning, so reminder ads aren't allowed`);
                            return;
                          }
                          changeBranding(next.id);
                          setEditingDecision(null);
                        }}
                        icon={() => <Tag className="size-4" />}
                        hint={(label) => {
                          const t = AD_TYPES.find((x) => x.label === label)!;
                          return t.id === "reminder" && facts.boxedWarning ? `Not allowed: ${brandName} has a boxed warning` : t.hint;
                        }}
                      />
                    </DecisionRow>
                  </div>
                  <PlanSectionContinue onClick={() => advanceFrom("audience")} />
                </PlanSectionShell>

                {/* 4. Ads to make — what the placements produce, decided before
                    anything is written. */}
                <PlanSectionShell
                  icon={ListChecks}
                  title="Ads to make"
                  summary={`${kept.length} ads · ${credits.toLocaleString()} credits · from ${adPlacements.length} placements`}
                  state={planState(needsYou.ads)}
                  source="from placements"
                  open={openSection === "ads"}
                  onToggle={() => toggleSection("ads")}
                >
                  <div className="space-y-3">
                    <p className="text-body leading-snug text-ink-2">
                      One video story and one image ad, adapted to each placement. Untick what you don&apos;t need: it won&apos;t be made, charged, sent to MLR or exported.
                    </p>
                    <AdsToMakeList
                      outputs={outputs}
                      removed={removed}
                      onToggle={(id) => setRemoved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))}
                    />
                    <Button size="sm" variant="secondary" onClick={() => setChangingPlacements(true)}>
                      Change placements
                    </Button>
                  </div>
                  <PlanSectionContinue onClick={() => advanceFrom("ads")} />
                </PlanSectionShell>

                {/* 5. Product & device visuals — not for unbranded ads, which
                    can't show the product. */}
                {showsProduct && (
                  <PlanSectionShell
                    icon={ImageIcon}
                    title="Product & Device Visual Assets"
                    summary={packshots.length > 0 ? `${packshots.length} packshot${packshots.length === 1 ? "" : "s"} attached` : "Packshots for the end card and key visual"}
                    state={planState(false, packshots.length === 0)}
                    open={openSection === "visuals"}
                    onToggle={() => toggleSection("visuals")}
                  >
                    <div className="space-y-3">
                      <MediaAttachmentGrid
                        items={packshots.map((ps) => ({ id: ps.id, name: ps.name, note: ps.note, previewUrl: ps.url, kind: "image" as const, variation: ps.variation }))}
                        uploadLabel={packshots.length === 0 ? "Upload product image" : "Add another"}
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
                        onRemove={(id) => setPackshots((prev) => prev.filter((ps) => ps.id !== id))}
                      />
                      {(() => {
                        const reusable = workspaceAssets(brandName, "product").filter((a) => !packshots.some((ps) => ps.name === a.name));
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
                                    setPackshots((prev) => [
                                      ...prev,
                                      { id: `ps-${asset.id}-${Date.now()}`, name: asset.name, url: asset.previewUrl ?? "", note: asset.note, variation: asset.variation },
                                    ])
                                  }
                                />
                              ))}
                            </AssetStrip>
                          </div>
                        );
                      })()}
                    </div>
                    <PlanSectionContinue
                      label={packshots.length === 0 ? "Skip & Continue" : "Save & Continue"}
                      onClick={() => advanceFrom("visuals")}
                    />
                  </PlanSectionShell>
                )}

                {/* 6. Visual & creative references — the look, never a claim. */}
                <PlanSectionShell
                  icon={Palette}
                  title="Visual & creative references"
                  summary={references.length > 0 ? `${references.length} reference${references.length === 1 ? "" : "s"}` : "The look you are after"}
                  state={planState(false, references.length === 0)}
                  source={references.length > 0 ? `${references.length} attached` : undefined}
                  open={openSection === "references"}
                  onToggle={() => toggleSection("references")}
                >
                  <div className="space-y-3">
                    <p className="text-body leading-snug text-ink-3">
                      Ads or campaigns with the look you want. Steers style, pace and palette. <strong className="font-bold text-ink-2">Grounds no claims.</strong>
                    </p>
                    <MediaAttachmentGrid
                      items={references.map((r) => ({ id: r.id, name: r.name, note: r.note, previewUrl: r.previewUrl, kind: r.kind }))}
                      uploadLabel={references.length === 0 ? "Upload a reference" : "Add another"}
                      onUpload={() =>
                        setPendingReference([
                          {
                            id: `ref-${Date.now()}`,
                            name: "Campaign_Look_Reference.png",
                            previewUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80",
                          },
                        ])
                      }
                      onRemove={(id) => setReferences((prev) => prev.filter((r) => r.id !== id))}
                    />
                    {(() => {
                      const reusable = workspaceAssets(brandName, "reference").filter((a) => !references.some((r) => r.name === a.name));
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
                                  setReferences((prev) => [
                                    ...prev,
                                    { id: `ref-${asset.id}-${Date.now()}`, name: asset.name, note: asset.note, previewUrl: asset.previewUrl, kind: asset.kind === "video" ? "video" : "image" },
                                  ])
                                }
                              />
                            ))}
                          </AssetStrip>
                        </div>
                      );
                    })()}
                  </div>
                  <PlanSectionContinue
                    label={references.length === 0 ? "Skip & Continue" : "Save & Continue"}
                    onClick={() => advanceFrom("references")}
                  />
                </PlanSectionShell>

                {/* 7. Brand mark — the same section as the video plan. */}
                <PlanSectionShell
                  icon={Stamp}
                  title="Brand mark"
                  summary={
                    adType === "unbranded"
                      ? "No logo. Unbranded ads carry no brand mark"
                      : logoMark.position === "none"
                        ? "No logo"
                        : `${LOGO_CORNERS.find((c) => c.id === logoMark.position)?.label} · ${logoMark.name}`
                  }
                  state={planState(false, true)}
                  source={adType === "unbranded" ? "from branding" : "from brand kit"}
                  open={openSection === "logo"}
                  onToggle={() => toggleSection("logo")}
                >
                  {adType === "unbranded" ? (
                    <p className="rounded-control border border-hair-2 bg-subtle px-3.5 py-3 text-body leading-snug text-ink-2">
                      An unbranded ad can&apos;t show the {brandName} logo, colours or type, or it stops being unbranded.
                    </p>
                  ) : (
                    <BrandMarkContent unit="ad" />
                  )}
                  <PlanSectionContinue onClick={() => setOpenSection(null)} />
                </PlanSectionShell>
              </div>
            </>
          )}

          {planPhase === "plan" && stage === "input" && (
            <ActionBar
              icon={
                planReady ? <CheckCircle2 className="size-4.5 shrink-0 text-ok-on-dark" /> : <AlertTriangle className="size-4.5 shrink-0 text-warn-on-dark" />
              }
              title={planReady ? "Ready to build the storyboard" : blocker!.title}
              description={planReady ? `Grounded in the ${brandName} dossier and ${claims.length} approved claims` : blocker!.detail}
              action={
                <Button
                  disabled={!planReady}
                  onClick={confirmPlan}
                  className="h-9 shrink-0 cursor-pointer rounded-control bg-brand px-5 text-body font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-deep disabled:opacity-40"
                >
                  <span>Confirm Plan &amp; Build Storyboard</span>
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
                {msg.role === "swishx" && (
                  <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand text-caption font-bold text-white shadow-2xs">SX</div>
                )}
                <div className="max-w-[88%] space-y-2">
                  <div
                    className={cn(
                      "rounded-panel p-3 text-body leading-relaxed",
                      msg.role === "user" ? "rounded-tr-xs bg-brand text-white" : "rounded-tl-xs border border-hair bg-subtle text-ink"
                    )}
                  >
                    <FormattedMessageText text={msg.text} />
                  </div>
                  {msg.role === "swishx" && idx === chatMessages.length - 1 && planPhase === "plan" && stage !== "building" && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(stage === "campaign"
                        ? ["Make the opening about a caregiver", "Warmer light in scene 1", "Slow down the safety scene"]
                        : ["Make it unbranded", "Switch the audience to HCPs", "Close on the savings card"]
                      ).map((chip) => (
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
              <div className="flex items-center justify-between gap-2 rounded-panel border border-brand/20 bg-gradient-to-r from-tint via-white to-tint p-2 shadow-2xs">
                <div className="flex min-w-0 items-center gap-2">
                  <div className={cn("grid size-6 shrink-0 place-items-center rounded-full text-white", planReady ? "bg-ok" : "bg-warn")}>
                    {planReady ? <Check className="size-3.5 stroke-[3]" /> : <AlertTriangle className="size-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-label font-bold text-ink">{planReady ? "Plan ready" : blocker!.title}</div>
                    <div className="truncate text-micro text-ink-3">{planReady ? `Grounded in ${claims.length} approved claims` : blocker!.detail}</div>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={!planReady}
                  onClick={confirmPlan}
                  className="h-7.5 shrink-0 cursor-pointer rounded-chip bg-brand px-3 text-label font-bold text-white shadow-xs transition-all hover:scale-[1.02] hover:bg-brand-deep disabled:opacity-40"
                >
                  <span>Build Storyboard</span>
                  <ArrowRight className="ml-1 size-3" />
                </Button>
              </div>
            )}

            {planPhase === "intake" && intakeIndex < intakeQuestions.length && (
              <IntakeQuestionCard questions={intakeQuestions} attachments={briefAttachments} onComplete={answerIntakeChoices} />
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
              prompt="A note and a variant travel with each asset, so it lands on the right ad."
              placeholder="e.g. the end-card packshot, front of pack"
              variations={brandVariations(brandName)}
              onCancel={() => setPendingPackshot([])}
              onConfirm={(notes, variations) => {
                setPackshots((prev) => [...prev, ...pendingPackshot.map((m) => ({ ...m, note: notes[m.id].trim(), variation: variations[m.id] }))]);
                setPendingPackshot([]);
              }}
            />
          )}
          {pendingReference.length > 0 && (
            <FileNoteDialog
              files={pendingReference.map((r) => ({ id: r.id, name: r.name, kind: "media" as const, previewUrl: r.previewUrl, mediaKind: "image" as const }))}
              title="What should we take from this reference?"
              prompt="A reference steers the look. Saying which part matters is what makes it usable."
              placeholder="e.g. the pacing of the opening shots"
              onCancel={() => setPendingReference([])}
              onConfirm={(notes) => {
                setReferences((prev) => [...prev, ...pendingReference.map((r) => ({ ...r, note: notes[r.id].trim(), kind: "image" as const }))]);
                setPendingReference([]);
              }}
            />
          )}
          {changingPlacements && (
            <ProjectContextModal
              ad
              open="placements"
              context={{
                brandId: INITIAL_BRANDS.find((b) => b.id === brandId)?.id ?? INITIAL_BRANDS[0].id,
                audience: who,
                topics: [],
                shape: "landscape",
                adType,
                placements: adPlacements,
              }}
              onClose={() => setChangingPlacements(false)}
              onSave={(next) => {
                if (next.brandId !== brandId) setSourcePayload({ dossierId: next.brandId });
                setAudience(next.audience);
                const blocked = next.adType === "reminder" && brandAdFacts(next.brandId).boxedWarning;
                changeBranding(blocked ? "product-claim" : next.adType ?? adType);
                setAdPlacements(next.placements ?? adPlacements);
                setChangingPlacements(false);
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
