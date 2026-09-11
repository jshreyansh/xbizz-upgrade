"use client";

import { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  History,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  PanelRight,
  Plus,
  Redo2,
  Send,
  ShieldCheck,
  Target,
  Undo2,
  Upload,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { DossierPreviewModal, type DossierPreviewData } from "@/features/workspace/dossier-preview-modal";
import { ResearchSourcesContent } from "@/features/workspace/research-sources-section";
import { cn } from "@/lib/cn";
import { ScreenHeader } from "@/components/patterns/screen-header";
import { LogoMark } from "@/components/ui/logo-mark";
import { ActionBar } from "@/components/patterns/action-bar";
import { PlanSectionContinue } from "@/features/workspace/plan-section-continue";
import { usePlanResearch } from "@/features/workspace/use-plan-research";
import { SplitLayout } from "@/components/patterns/workbench-layout";
import { ScenarioDrawer } from "@/features/workspace/scenario-drawer";
import { demoScenarios, type DemoScenario } from "@/features/workspace/demo-scenarios";
import { CopyDeckScreen } from "@/features/workspace/copy-deck-screen";
import type { CopyBlock } from "@/features/workspace/copy-deck-card";
import { TemplateStepScreen } from "@/features/workspace/template-step-screen";
import { ClaimsPanel } from "@/features/workspace/claims-panel";
import { APPROVED_CLAIMS } from "@/features/workspace/script-claims";

type InfographicSubStep = "brief" | "template" | "copy";
type PlanSectionId = "sources" | "treatment" | "audience" | "format" | "design" | "objective" | "assets";

interface AudienceOption {
  id: string;
  title: string;
  desc: string;
  whyFits: string;
}

const AUDIENCE_OPTIONS: AudienceOption[] = [
  { id: "hcp", title: "Doctor / HCP", desc: "Clinical detail, peer-to-peer tone", whyFits: "Deep mechanistic clarity with primary clinical endpoints & prescribing limits." },
  { id: "rep", title: "Sales Rep / Medical Rep", desc: "30-sec pitch, objection handling", whyFits: "Rapid 3-point value proposition and head-to-head objection handling." },
  { id: "patient", title: "Patient", desc: "Plain-language, what to expect", whyFits: "Clear, reassuring everyday language focusing on symptom relief and safety." },
  { id: "consumer", title: "Consumer", desc: "Benefit-led, everyday language", whyFits: "Accessible benefit-driven narrative without heavy clinical jargon." },
  { id: "procurement", title: "Hospital Procurement", desc: "Formulary value, evidence, supply & cost", whyFits: "Cost-effectiveness, hospital formulary integration, and supply reliability." },
  { id: "retailer", title: "Retailer / Stockist", desc: "Demand, margins, stocking decisions", whyFits: "Prescription velocity, stock turn rates, and pharmacy dispensing margins." },
];

const SPECIALTIES = [
  "Any specialty",
  "Dermatology",
  "Cardiology",
  "Oncology",
  "Endocrinology",
  "Neurology",
  "Rheumatology",
  "General Medicine",
];

const FORMAT_OPTIONS = [
  { id: "16:9", label: "Landscape 16:9", sub: "Screens, laptops, projected", whyFits: "Best for Veeva digital detailers and slide deck presentations." },
  { id: "3:4", label: "Portrait 3:4", sub: "Held upright, and prints well", whyFits: "Ideal for iPad clinical discussions and vertical digital reading." },
  { id: "A4", label: "A4 Document", sub: "Printed and left behind", whyFits: "Standard clinic leave-behind format with high-density evidence layout." },
];

const OBJECTIVE_OPTIONS = [
  { id: "awareness", label: "Awareness", desc: "They may not know the problem exists", whyFits: "Highlights disease burden and unmet clinical need in current treatment pathways." },
  { id: "consideration", label: "Consideration", desc: "They know it and are weighing it up", whyFits: "Compares novel mechanism and Phase III endpoints against current standard of care." },
  { id: "adoption", label: "Adoption", desc: "They are ready to prescribe or order", whyFits: "Focuses on dosing titration, eGFR cut-offs, and first-line prescription protocols." },
  { id: "retention", label: "Retention", desc: "They already use it", whyFits: "Reiterates 52-week durable skin clearance and long-term tolerability." },
];

const CONTENT_ANGLES = [
  "Product Introduction",
  "Mechanism of Action",
  "Indications",
  "Dosage & Safety",
  "Drug Interactions",
  "Side Effects",
];

const LOGO_PLACEMENTS = [
  { id: "bottom-right", label: "Bottom right", desc: "Beside the job code — the usual place" },
  { id: "bottom-left", label: "Bottom left", desc: "Footer, leading side" },
  { id: "top-right", label: "Top right", desc: "Trailing corner, above the content" },
  { id: "top-left", label: "Top left", desc: "Leading corner, above the content" },
  { id: "none", label: "No logo", desc: "Leave every page unbranded" },
];







export function InfographicDirectionsScreen() {
  const {
    brief,
    audience,
    pageShape,
    infographicPages,
    infographicTemplate,
    infographicLogoPlacement,
    sourcePayload,
    chatMessages,
    setChatMessages,
    addChatMessage,
    setAudience,
    setPageShape,
    setInfographicPages,
    setInfographicTemplate,
    setInfographicLogoPlacement,
    setBrief,
    setMarket,
    setIntendedUse,
    setSelectedSourceIds,
    demoScenarioId,
    setDemoScenarioId,
    setView,
    setVideoSubStage,
    copilotPanelOpen,
    copilotPanelWidth,
    setCopilotPanelWidth,
    toggleCopilotPanel,
    setCopilotPanelOpen,
  } = useWorkspaceStore();

  const brandName = sourcePayload?.dossierId === "onkavia" ? "Onkavia" : sourcePayload?.dossierId === "pulmovax" ? "PulmoVax" : "Velmora";

  const [currentStep, setCurrentStep] = useState<InfographicSubStep>("brief");

  /* ── The use case is the whole context, not a label ──────────────────────
     Same switcher as the video plan, filtered to image cases. Changing it
     swaps brief, audience, market, intended use, sources, page shape and
     archetype, because the plan is derived from those. */
  /* The copy the deck will carry, block by block. Seeded from the plan so the
     stage opens on real words rather than an empty form — the point of the
     stage is to read and cut, not to type from nothing. */
  const [copyBlocks, setCopyBlocks] = useState<CopyBlock[]>([]);
  const [copyScope, setCopyScope] = useState<string[]>([]);
  /** Set when the layout came from the library rather than the five. */
  const [libraryTemplateId, setLibraryTemplateId] = useState<string | null>(null);
  /** Blocks the agent is rewriting right now. */
  const [pendingCopyIds, setPendingCopyIds] = useState<string[]>([]);
  /* The panel is a two-tab inspector on the content plan, the same as the video
     script stage: what you are writing, and what you are allowed to say. */
  const [panelTab, setPanelTab] = useState<"chat" | "claims">("chat");
  const [highlightedClaimId, setHighlightedClaimId] = useState<string | null>(null);

  const [useCaseDrawerOpen, setUseCaseDrawerOpen] = useState(false);
  /* Only image cases count here. demoScenarioId is shared with the video flow,
     so matching the whole library made this button announce "HCP launch video"
     on a deck — a label that is simply untrue. Unmatched reads as unchosen. */
  const imageScenarios = demoScenarios.filter((sc) => sc.inputs.assetType === "infographic");
  const activeScenario = imageScenarios.find((sc) => sc.id === demoScenarioId) ?? null;

  /* Sections the user has actually worked through. A status is a fact about
     what happened, not a decoration — which is why it has to survive a bounce
     back from a failed Confirm. */
  const [confirmedSections, setConfirmedSections] = useState<PlanSectionId[]>([]);

  /* Whether the attachments will fail verification is known to the case from
     the start, but it is not KNOWN to the user until Confirm runs the check.
     Two flags, because showing the failure early gives away an answer the
     screen has not earned yet. */
  const [sourcesWillFail, setSourcesWillFail] = useState(false);
  const [sourcesUnusable, setSourcesUnusable] = useState(false);
  const [verifyingSources, setVerifyingSources] = useState(false);
  const [blockedSections, setBlockedSections] = useState<PlanSectionId[]>([]);
  /* What the check FOUND, as opposed to what it would find. The latent block
     is derived and always knowable; showing it before Confirm runs gives away
     an answer the screen has not earned, and the pill sat there reading as a
     failure on a plan nobody had submitted. */
  const [foundBlock, setFoundBlock] = useState<{ section: PlanSectionId; title: string; detail: string } | null>(null);
  const [openSection, setOpenSection] = useState<PlanSectionId | null>("sources");
  const research = usePlanResearch();

  /**
   * Same ordered walk as the video plan: every section advances through this,
   * so the canvas is worked top to bottom by clicking rather than by hunting
   * for whichever tile still needs attention.
   */
  /* No "design" here: the layout archetype became its own step, because it
     decides the page's whole composition and because the twelve hundred
     variants behind the five families need room the accordion never had. */
  const sectionOrder: PlanSectionId[] = ["sources", "format", "audience", "objective", "assets"];

  const advanceFrom = (section: PlanSectionId) => {
    // Working a section through is what confirms it; the status then reads as
    // a record rather than a recommendation.
    setConfirmedSections((prev) => (prev.includes(section) ? prev : [...prev, section]));
    setBlockedSections((prev) => prev.filter((b) => b !== section));
    setFoundBlock((prev) => (prev?.section === section ? null : prev));
    const i = sectionOrder.indexOf(section);
    setOpenSection(i >= 0 && i < sectionOrder.length - 1 ? sectionOrder[i + 1] : null);
  };

  /**
   * What a section's chip says.
   *
   * Confirmed beats everything, including a bounce back — a section the user
   * settled does not become "Recommended" again because a later one failed.
   * That was the specific complaint: the good answers lost their standing on
   * the way back.
   */
  /**
   * Switching the use case swaps the context the plan is derived from.
   *
   * Page shape and archetype come across too, which the video flow has no
   * equivalent of — they are the image flow's own axes, and a case that says
   * "three-page detail aid" is not being honoured if the plan stays on one.
   */
  const loadUseCase = (scenario: DemoScenario) => {
    setBrief(scenario.inputs.brief);
    setAudience(scenario.inputs.audience);
    setMarket(scenario.inputs.market);
    setIntendedUse(scenario.inputs.intendedUse);
    setSelectedSourceIds(scenario.inputs.selectedSourceIds);
    setDemoScenarioId(scenario.id);
    setUseCaseDrawerOpen(false);

    if (scenario.assertions.archetypeId) {
      setInfographicTemplate(scenario.assertions.archetypeId as never);
    }
    if (scenario.assertions.pages) {
      setInfographicPages(String(scenario.assertions.pages) as never);
    }

    // What the user has attached is part of the case, not a constant.
    const docs = scenario.inputs.uploadedDocs;
    setUploadedDocs(
      docs
        ? docs.map((name) => ({ name, size: "1.2 MB", date: "Today" }))
        : [
            { name: `${brandName}_Clinical_Summary_LeaveBehind.pdf`, size: "3.6 MB", date: "Today" },
            { name: `${brandName}_Visual_Claims_Master.docx`, size: "720 KB", date: "Today" },
          ]
    );
    setSourceGroundingMode(docs && docs.length > 0 ? "my-sources" : "both");

    // Latent, not found: the check runs on Confirm.
    setSourcesWillFail(scenario.inputs.sourcesVerify === false);
    setSourcesUnusable(false);
    setVerifyingSources(false);

    // The plan is being rebuilt around a different job, so the worked-through
    // state goes back to the top rather than pretending the old answers hold.
    setOpenSection("sources");
    setConfirmedSections([]);
    setBlockedSections([]);
    setFoundBlock(null);
    setChatMessages([]);
  };

  const statusFor = (section: PlanSectionId, fallback: string) =>
    blockedSections.includes(section)
      ? "Needs a fix"
      : confirmedSections.includes(section)
        ? "Confirmed"
        : fallback;
  const [sourceGroundingMode, setSourceGroundingMode] = useState<"both" | "my-sources" | "swishx-only">("both");
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ name: string; size: string; date: string }>>([
    { name: `${brandName}_Clinical_Summary_LeaveBehind.pdf`, size: "3.6 MB", date: "Today" },
    { name: `${brandName}_Visual_Claims_Master.docx`, size: "720 KB", date: "Today" },
  ]);
  const [previewDossier, setPreviewDossier] = useState<DossierPreviewData | null>(null);

  /**
   * Why the plan cannot be confirmed, or null.
   *
   * Three reasons, and the third is the image flow's own. A page is a fixed
   * box: copy that does not fit is copy that gets clipped, and a clipped
   * safety block is a regulatory failure rather than a layout preference. So
   * fit blocks, the same as having nothing to ground on.
   */
  const hasGrounding = (sourcePayload?.dossierId ?? "").length > 0 || uploadedDocs.length > 0;

  const planBlock: { section: PlanSectionId; title: string; detail: string } | null = !hasGrounding
    ? {
        section: "sources",
        title: "Nothing to ground this on",
        detail: "Attach a document or choose a dossier. A creative with no source cannot carry a claim.",
      }
    : sourcesUnusable
      ? {
          section: "sources",
          title: "Those attachments hold nothing usable",
          detail: "The files verified as having no approved claim text. Attach the label or the study readout, or edit the request to something they can support.",
        }
      : null;

  /* Verification happens on Confirm, not on arrival — and a failure sends you
     back to the offending section with everything else still Confirmed. */
  const handleConfirmPlan = () => {
    if (verifyingSources) return;
    setVerifyingSources(true);

    setTimeout(() => {
      setVerifyingSources(false);
      const unusable = sourcesWillFail;
      if (unusable) setSourcesUnusable(true);

      const block = !hasGrounding || unusable ? "sources" : null;

      if (block) {
        setFoundBlock(planBlock);
        setBlockedSections([block as PlanSectionId]);
        setConfirmedSections((prev) => prev.filter((sec) => sec !== block));
        setOpenSection(block as PlanSectionId);
        return;
      }
      // The plan settles the brief; the layout is the next decision.
      setCurrentStep("template");
    }, 900);
  };

  /**
   * The content plan's starting words.
   *
   * Built from the plan rather than typed, and one block per real slot on the
   * page. It arrives finished and inside its boxes: this stage is where you
   * read the final copy, so opening it with a block already broken would be
   * showing work rather than showing a result. Overflow is a thing editing
   * can cause, and the chips are there for when it does.
   */
  const seedCopyBlocks = (): CopyBlock[] => {
    const pageCount = Number(infographicPages) || 1;
    const out: CopyBlock[] = [];
    for (let page = 1; page <= pageCount; page++) {
      const first = page === 1;
      out.push(
        { id: `p${page}-eyebrow`, pageNumber: page, label: "Eyebrow", kind: "eyebrow", text: first ? "HCP Clinical Brief" : "Clinical Evidence Spread" },
        {
          id: `p${page}-headline`, pageNumber: page, label: "Headline", kind: "headline",
          text: first ? `${brandName}™ (tirzelamide) · 200mg` : `${brandName}™ · Clinical Evidence & Safety`,
        },
        {
          id: `p${page}-subhead`, pageNumber: page, label: "Subhead", kind: "subhead",
          text: first
            ? "First-in-Class Dual Mechanism Kinase Inhibitor for Moderate-to-Severe Plaque Psoriasis"
            : "Long-Term Extension Cohorts, Organ Safety & Prescribing Thresholds",
        },
        {
          id: `p${page}-metric`, pageNumber: page, label: "Hero metric", kind: "metric",
          text: first ? "52% PASI 90" : "84.6% Durability",
          citations: [{ id: `p${page}-cit-1`, claimId: "c13", source: "EMBRACE-3", title: "Table 2.4 · primary endpoint", date: "2024", anchor: 0 }],
        },
        {
          id: `p${page}-body`, pageNumber: page, label: "Supporting copy", kind: "body",
          text: first
            ? "Over half of patients achieved clear or almost clear skin by Week 16, against 18% in the placebo cohort. Response was maintained through the 52-week open-label extension."
            : "Clearance profile validated across mild-to-moderate renal impairment cohorts without dosage adjustment above eGFR 25.",
          citations: [{ id: `p${page}-cit-2`, claimId: "c11", source: "CLEARSKIN-3", title: "Week 24 durability", date: "2024", anchor: 1 }],
        }
      );
    }
    // One safety block for the deck, on the last page, as fair balance is.
    out.push({
      id: "safety",
      pageNumber: pageCount,
      label: "Safety copy",
      kind: "safety",
      text:
        "Contraindicated in severe hepatic impairment (Child-Pugh C). Not recommended below eGFR 25 mL/min/1.73m². Most common adverse events were mild headache (5.1%) and nausea (4.2%). Review the full Prescribing Information before administration.",
      citations: [{ id: "safety-cit", claimId: "c21", source: "FDA §5.2", title: "Hepatic monitoring requirement", date: "2026", anchor: 0 }],
    });
    return out;
  };

  const openTemplateStep = () => {
    setCurrentStep("template");
  };

  const openContentPlan = () => {
    setCopyBlocks((prev) => (prev.length > 0 ? prev : seedCopyBlocks()));
    setCopyScope([]);
    setCurrentStep("copy");
  };

  /* The agent rewriting what is in scope. It shortens, because that is what
     the stage is for — an instruction that lengthens a block it was asked to
     fix would be the one thing the fit chip cannot forgive. */
  /**
   * The chat rewriting whatever is ticked on the content plan.
   *
   * Selection is how an instruction is aimed, exactly as scene selection aims
   * one in the script stage — so this is driven from the chat's own send
   * rather than a second composer on the canvas.
   */
  const rewriteCopy = (instruction: string, scopeIds: string[]) => {
    setPendingCopyIds(scopeIds);
    setTimeout(() => {
      setCopyBlocks((prev) =>
        prev.map((block) => {
          if (!scopeIds.includes(block.id)) return block;
          const trimmed = block.text
            .split(/(?<=[.!?])\s+/)
            .slice(0, 1)
            .join(" ")
            .trim();
          return { ...block, text: trimmed.length > 0 ? trimmed : block.text };
        })
      );
      setPendingCopyIds([]);
      addChatMessage({
        role: "swishx",
        text: `Cut ${scopeIds.length === 1 ? "that block" : `those ${scopeIds.length} blocks`} back to the leading sentence and kept the citations attached. Anything still flagged needs another pass.`,
      });
    }, 1500);
  };


  // Local state for brief questions
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>(audience === "Patient" ? "patient" : audience === "Consumer" ? "consumer" : "hcp");
  const [specialty, setSpecialty] = useState<string>("Dermatology");
  const [language, setLanguage] = useState<string>("English");
  const [objective, setObjective] = useState<string>("adoption");
  const [selectedAngles, setSelectedAngles] = useState<string[]>(["Product Introduction", "Mechanism of Action", "Indications"]);
  const [packshots] = useState<Array<{ id: string; name: string; url: string }>>([
    {
      id: "packshot-1",
      name: `${brandName}_Autoinjector_3D_Packshot.png`,
      url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
    },
  ]);

  // Expanded citations state in Content step


  // Chat state
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, currentStep]);

  const toggleAngle = (angle: string) => {
    setSelectedAngles((prev) =>
      prev.includes(angle) ? prev.filter((a) => a !== angle) : [...prev, angle]
    );
  };

  const handleSendChat = (directText?: string) => {
    const text = directText || chatInput.trim();
    if (!text) return;

    addChatMessage({
      role: "user",
      text:
        currentStep === "copy" && copyScope.length > 0
          ? `[${copyScope.length} ${copyScope.length === 1 ? "block" : "blocks"}] ${text}`
          : text,
    });
    if (!directText) setChatInput("");

    // On the content plan an instruction applies to what is ticked. Nothing
    // ticked means nothing aimed at, so the agent says so rather than
    // rewriting the whole deck on a guess.
    if (currentStep === "copy") {
      if (copyScope.length === 0) {
        setTimeout(() => {
          addChatMessage({
            role: "swishx",
            text: "Tick the blocks you want changed first — then tell me what to do and I will apply it to those.",
          });
        }, 400);
        return;
      }
      rewriteCopy(text, copyScope);
      return;
    }

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = `Understood. I have updated the creative parameters grounded in the **${brandName}** dossier.`;

      if (lower.includes("16:9") || lower.includes("landscape")) {
        setPageShape("16:9");
        reply = `Updated page shape to **Landscape 16:9** (optimized for screen projection and desktop detailers).`;
      } else if (lower.includes("3:4") || lower.includes("portrait")) {
        setPageShape("3:4");
        reply = `Updated page shape to **Portrait 3:4** (ideal for iPad detailers and vertical reading).`;
      } else if (lower.includes("a4") || lower.includes("print")) {
        setPageShape("A4");
        reply = `Updated page format to **A4 Print** with standard 3mm bleed and print-ready typography.`;
      } else if (lower.includes("stat hero") || lower.includes("stat")) {
        setInfographicTemplate("stat-hero");
        reply = `Selected **Stat Hero** template: dark hero band with high-impact PASI 90 clearance callouts.`;
      } else if (lower.includes("trial summary") || lower.includes("trial")) {
        setInfographicTemplate("trial-summary");
        reply = `Selected **Trial Summary** template: clean highlights box with study credential markers.`;
      } else if (lower.includes("bench data") || lower.includes("bench")) {
        setInfographicTemplate("bench-data");
        reply = `Selected **Bench Data** template: circular callouts and horizontal bar metrics.`;
      } else if (lower.includes("2 page") || lower.includes("two")) {
        setInfographicPages("2");
        reply = `Expanded format to **Two Pages** (Front summary + back evidence and safety breakdown).`;
      } else if (lower.includes("1 page") || lower.includes("one")) {
        setInfographicPages("1");
        reply = `Set format to **One Page** concise executive leave-behind.`;
      }

      addChatMessage({ role: "swishx", text: reply });
    }, 450);
  };


  /**
   * The content plan is its own stage, returned after every hook above has run.
   * An early return higher up would unmount the hooks beneath it — the same
   * trap the asset-type branch at the top of this file already sets.
   */
  return (
    <SplitLayout
      className="bg-[#eef1ed] text-left"
      panelOpen={copilotPanelOpen}
      onPanelOpenChange={setCopilotPanelOpen}
      panelWidth={copilotPanelWidth}
      onPanelWidthChange={setCopilotPanelWidth}
      panelStorageKey="swishx.copilotPanelWidth"
      /* Below 1024 there is not enough width for canvas + inspector:
         the panel closes once on the way down, and a deliberate
         re-open sticks. Tablet portrait is review-only by design. */
      autoCollapsePanelBelow="laptop"
      header={
        <ScreenHeader>
          <button
            type="button"
            onClick={() => {
              // The shell's back button is the only one. The layout step had
              // grown its own, two arrows apart, which is a choice between
              // two things that should be one.
              // One step at a time. Back from the content plan was falling
              // through to the prompt screen, skipping the layout step and
              // losing the two decisions in between.
              if (currentStep === "copy") {
                setCurrentStep("template");
                return;
              }
              if (currentStep === "template") {
                setCurrentStep("brief");
                return;
              }
              setVideoSubStage("intake");
              setView("create");
            }}
            className="focus-ring mr-2 grid size-8 place-items-center rounded-chip text-ink-3 hover:bg-black/5 cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="size-4" />
          </button>

          <SwishXMark compact />
          <div className="mx-3 h-5 w-px bg-hair" />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-body font-[800] text-ink">
                {brandName} HCP launch
              </span>
              <span className="hidden rounded-chip bg-ok-bg px-2 py-0.5 text-micro font-bold text-ink-3 sm:inline">
                Draft v1
              </span>
            </div>
            <div className="mt-0.5 hidden text-micro text-ink-3 sm:block">
              Saved just now · Canvas Studio · MLR Ready
            </div>
          </div>

          {/* The case this plan is for, changeable without walking back to
              the brief — the same switcher the video plan has, filtered to
              image cases. */}
          <div className="ml-6 hidden items-center gap-1.5 sm:flex">
            <span className="rounded-chip bg-tint px-2.5 py-0.5 text-caption font-extrabold tracking-wide text-brand-deep border border-tint-line">
              {currentStep === "template"
                ? "Layout View"
                : currentStep === "copy"
                  ? "Content Plan"
                  : "Plan View"}
            </span>
            <button
              type="button"
              onClick={() => setUseCaseDrawerOpen(true)}
              aria-haspopup="dialog"
              className="flex max-w-[240px] cursor-pointer items-center gap-1.5 rounded-chip border border-hair-2 bg-card px-2.5 py-1 text-caption font-bold text-ink-2 transition-colors hover:border-brand hover:text-brand"
            >
              <Layers className="size-3 shrink-0 text-brand" />
              <span className="truncate">{activeScenario?.label ?? "Choose use case"}</span>
              <ChevronDown className="size-3 shrink-0 opacity-60" />
            </button>
          </div>

          <div className="ml-4 hidden items-center gap-0.5 lg:flex">
            <Button variant="ghost" size="icon" aria-label="Undo">
              <Undo2 className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Redo" disabled>
              <Redo2 className="size-4" />
            </Button>
            <div className="mx-1 h-5 w-px bg-hair" />
            <Button variant="ghost" size="sm">
              <History className="size-3.5" /> Versions
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Toggle Right Sidebar Panel Button */}
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
            >
              <PanelRight className="size-4" />
            </button>
          </div>
        </ScreenHeader>
      }
      main={
        currentStep === "copy" ? (
          <CopyDeckScreen
            blocks={copyBlocks}
            pages={Array.from({ length: Number(infographicPages) || 1 }, (_, i) => i + 1)}
            title={`One tablet, three approved jobs: ${brandName} (tirzelamide) in moderate-to-severe plaque psoriasis`}
            claimSummary={`${copyBlocks.length} blocks on ${infographicPages === "2" ? "2 pages" : "1 page"} · 13 verified claims grounded in the FDA dossier`}
            leftOut="The dossier contains no head-to-head comparator study against biologic X — no comparative superiority claim is made. Only approved FDA primary endpoints (52% PASI 90 at Week 16) are cited. Left out deliberately: (a) non-approved indication claims, (b) unverified exploratory endpoints, (c) uncalibrated dosing titration outside §2.1."
            scope={copyScope}
            onScopeChange={setCopyScope}
            pendingIds={pendingCopyIds}
            onChangeBlock={(id, text) =>
              setCopyBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, text } : b)))
            }
            onCitationDetails={(claimId) => {
              // The same gesture as the script stage: a citation takes you to
              // its claim and holds it lit long enough to read.
              setPanelTab("claims");
              setHighlightedClaimId(claimId);
              setTimeout(() => setHighlightedClaimId(null), 2000);
            }}
            onContinue={() => {
              setView("studio");
              setVideoSubStage("studio");
            }}
          />
        ) : currentStep === "template" ? (
          <TemplateStepScreen
            brief={brief}
            pageShape={pageShape}
            pages={Number(infographicPages) || 1}
            selectedId={infographicTemplate}
            libraryTemplateId={libraryTemplateId}
            onSelectArchetype={(id) => {
              setInfographicTemplate(id);
              setLibraryTemplateId(null);
            }}
            onSelectTemplate={(template) => {
              // A library pick sets the family too, because the family is what
              // decides which blocks exist — the variant only arranges them.
              setInfographicTemplate(template.family);
              setLibraryTemplateId(template.id);
              setPageShape(template.shape as never);
            }}
            onContinue={openContentPlan}
          />
        ) : (
          <section
            className="flex flex-1 min-w-0 flex-col min-h-0 border-r border-hair bg-[#eef1ed] overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-4 relative"
          >
            {/* ══════════════════════════════════════════════════════════════════
                STAGE 1: BRIEF & CREATIVE PARAMETERS (Exact Layout as Video Screen)
               ══════════════════════════════════════════════════════════════════ */}
            {currentStep === "brief" && (
              <>
                {/* Header in Left Canvas (Identical to Video Screen) */}
                <div className="flex items-center justify-between pb-1 shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-label font-bold uppercase tracking-[0.12em] text-brand">
                        Available Context
                      </span>
                      <span className="rounded-chip bg-ok-bg px-2 py-0.5 text-caption font-bold text-ok border border-ok-line">
                        Grounding active
                      </span>
                    </div>
                    <h2 className="text-display font-[850] text-ink tracking-tight mt-0.5">
                      {brandName} Dossier Plan &amp; Creative Parameters
                    </h2>
                    <p className="text-body text-ink-3 mt-0.5">
                      Refine audience target, page format, layout archetype, and clinical angles before confirming the creative.
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="rounded-chip bg-card px-3 py-1 text-label font-bold text-ok border border-hair shadow-2xs">
                      ✓ 214 approved claims cited
                    </span>
                  </div>
                </div>

                {/* ─── Rich Accordion Sections with Distinct Icons & Zoom Animation ─── */}
                <div className="space-y-3 min-w-0 w-full">
                  {/* 1. Research & Sources (Unified Top Starting Tile) */}
                  <CreativePlanSection
                    icon={ShieldCheck}
                    title="Research and Sources"
                    summary={
                      sourceGroundingMode === "both"
                        ? `${brandName} Approved Dossier + ${uploadedDocs.length} custom files active`
                        : sourceGroundingMode === "my-sources"
                        ? `${uploadedDocs.length} custom files active · Dossier ignored`
                        : `${brandName} Approved Dossier · 214 claims`
                    }
                    status={research.researching ? `Researching · ${research.current}/${research.total}` : statusFor("sources", "From source")}
                    error={foundBlock?.section === "sources" ? foundBlock : null}
                    tone="done"
                    /* Open while the research runs — same as the video plan. */
                    open={research.researching || openSection === "sources"}
                    onToggle={() => { if (!research.researching) setOpenSection(openSection === "sources" ? null : "sources"); }}
                  >
                    <ResearchSourcesContent
                      brandName={brandName || "Velmora"}
                      sourceGroundingMode={sourceGroundingMode}
                      onSetSourceGroundingMode={setSourceGroundingMode}
                      uploadedDocs={uploadedDocs}
                      onSetUploadedDocs={setUploadedDocs}
                      onPreviewDossier={(d) => setPreviewDossier(d)}
                      onContinue={() => advanceFrom("sources")}
                      research={research}
                      /* The image flow keeps its dossiers for now; the blocked
                         cases are wired on the video plan screen only. */
                      hasDossiers
                      onEditPrompt={() => setOpenSection("sources")}
                    />
                  </CreativePlanSection>

                  {/* 2. Format & Page Shape */}
                  <CreativePlanSection
                    icon={LayoutGrid}
                    title="Format & Page shape"
                    summary={`${FORMAT_OPTIONS.find((f) => f.id === pageShape)?.label || "Portrait 3:4"}`}
                    status={statusFor("format", "From brief")}
                    tone="done"
                    open={openSection === "format"}
                    onToggle={() => setOpenSection(openSection === "format" ? null : "format")}
                  >
                    <div className="space-y-4">
                      <div className="rounded-control bg-subtle p-3 border border-hair">
                        <div className="text-label font-extrabold uppercase tracking-wider text-brand-deep mb-0.5">
                          Why this fits
                        </div>
                        <p className="text-body text-ink-2">
                          {FORMAT_OPTIONS.find((f) => f.id === pageShape)?.whyFits || "Ideal for iPad clinical discussions and vertical digital reading."}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {FORMAT_OPTIONS.map((fmt) => {
                          const isSelected = pageShape === fmt.id;
                          return (
                            <button
                              key={fmt.id}
                              type="button"
                              onClick={() => setPageShape(fmt.id as any)}
                              className={cn(
                                "relative p-3.5 rounded-control border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[85px]",
                                isSelected
                                  ? "border-brand bg-card text-ink shadow-xs ring-2 ring-brand/15"
                                  : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="font-bold text-body-lg">{fmt.label}</div>
                                <div
                                  className={cn(
                                    "size-4.5 rounded-full border-2 grid place-items-center shrink-0 mt-0.5",
                                    isSelected
                                      ? "border-brand bg-brand text-white"
                                      : "border-hair-3"
                                  )}
                                >
                                  {isSelected && <Check className="size-2.5 stroke-[3]" />}
                                </div>
                              </div>
                              <div className="text-label text-ink-3 mt-1">{fmt.sub}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <PlanSectionContinue onClick={() => advanceFrom("format")} />
                  </CreativePlanSection>

                  {/* 2. Message and Audience */}
                  <CreativePlanSection
                    icon={Users}
                    title="Message and audience"
                    summary={`${AUDIENCE_OPTIONS.find((a) => a.id === selectedAudienceId)?.title || "Doctor / HCP"} · ${specialty} · ${language}`}
                    status={statusFor("audience", "From brief")}
                    tone="done"
                    open={openSection === "audience"}
                    onToggle={() => setOpenSection(openSection === "audience" ? null : "audience")}
                  >
                    <div className="space-y-4">
                      <div className="rounded-control bg-subtle p-3 border border-hair">
                        <div className="text-label font-extrabold uppercase tracking-wider text-brand-deep mb-0.5">
                          Why this fits
                        </div>
                        <p className="text-body text-ink-2">
                          {AUDIENCE_OPTIONS.find((a) => a.id === selectedAudienceId)?.whyFits || "Deep mechanistic clarity with primary clinical endpoints & prescribing limits."}
                        </p>
                      </div>

                      <div>
                        <div className="text-body-lg font-bold text-ink mb-2.5">Who is this for?</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {AUDIENCE_OPTIONS.map((opt) => {
                            const isSelected = selectedAudienceId === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  setSelectedAudienceId(opt.id);
                                  setAudience(opt.title.split("/")[0].trim() as any);
                                }}
                                className={cn(
                                  "relative p-3.5 rounded-control border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[90px]",
                                  isSelected
                                    ? "border-brand bg-card text-ink shadow-xs ring-2 ring-brand/15"
                                    : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
                                )}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="font-bold text-body-lg text-ink">{opt.title}</div>
                                  <div
                                    className={cn(
                                      "size-4.5 rounded-full border-2 grid place-items-center shrink-0 mt-0.5",
                                      isSelected
                                        ? "border-brand bg-brand text-white"
                                        : "border-hair-3"
                                    )}
                                  >
                                    {isSelected && <Check className="size-2.5 stroke-[3]" />}
                                  </div>
                                </div>
                                <div className="text-label text-ink-3 mt-1.5 leading-snug">{opt.desc}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-body font-bold text-ink mb-1">
                            Specialty (optional)
                          </label>
                          <select
                            value={specialty}
                            onChange={(e) => setSpecialty(e.target.value)}
                            className="w-full h-10 rounded-control border border-hair-2 bg-subtle px-3 text-body-lg font-semibold text-ink outline-none focus:border-brand"
                          >
                            {SPECIALTIES.map((sp) => (
                              <option key={sp} value={sp}>
                                {sp}
                              </option>
                            ))}
                          </select>
                          <p className="text-caption text-ink-3 mt-1">
                            Decides which endpoints and terminology count as key messages.
                          </p>
                        </div>

                        <div>
                          <label className="block text-body font-bold text-ink mb-1">Language</label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full h-10 rounded-control border border-hair-2 bg-subtle px-3 text-body-lg font-semibold text-ink outline-none focus:border-brand"
                          >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <PlanSectionContinue onClick={() => advanceFrom("audience")} />
                  </CreativePlanSection>

                  {/* The layout archetype used to sit here. It became its own
                      step: it decides the page's whole composition, and the
                      twelve hundred variants behind the five families need
                      room an accordion never had. */}
                  {/* 4. What should this deck achieve? (Objective & Angle) */}
                  <CreativePlanSection
                    icon={Target}
                    title="What should this deck achieve? (Objective & Angle)"
                    summary={`${OBJECTIVE_OPTIONS.find((o) => o.id === objective)?.label || "Adoption"} · ${selectedAngles.length} topics`}
                    status={statusFor("objective", "Recommended")}
                    tone="done"
                    open={openSection === "objective"}
                    onToggle={() => setOpenSection(openSection === "objective" ? null : "objective")}
                  >
                    <div className="space-y-4">
                      <div className="rounded-control bg-subtle p-3 border border-hair">
                        <div className="text-label font-extrabold uppercase tracking-wider text-brand-deep mb-0.5">
                          Why this fits
                        </div>
                        <p className="text-body text-ink-2">
                          {OBJECTIVE_OPTIONS.find((o) => o.id === objective)?.whyFits || "Focuses on dosing titration, eGFR cut-offs, and first-line prescription protocols."}
                        </p>
                      </div>

                      <div>
                        <label className="block text-body font-bold text-ink mb-1.5">
                          Campaign Objective
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                          {OBJECTIVE_OPTIONS.map((obj) => {
                            const isSelected = objective === obj.id;
                            return (
                              <button
                                key={obj.id}
                                type="button"
                                onClick={() => setObjective(obj.id)}
                                className={cn(
                                  "relative p-3 rounded-control border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[80px]",
                                  isSelected
                                    ? "border-brand bg-card text-ink shadow-xs ring-2 ring-brand/15"
                                    : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
                                )}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="font-bold text-body-lg">{obj.label}</div>
                                  <div
                                    className={cn(
                                      "size-4.5 rounded-full border-2 grid place-items-center shrink-0",
                                      isSelected
                                        ? "border-brand bg-brand text-white"
                                        : "border-hair-3"
                                    )}
                                  >
                                    {isSelected && <Check className="size-2.5 stroke-[3]" />}
                                  </div>
                                </div>
                                <div className="text-caption text-ink-3 mt-1 leading-tight">{obj.desc}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-body font-bold text-ink mb-1.5">
                          Content Angles (Select topics to prioritize)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {CONTENT_ANGLES.map((ang) => {
                            const isSelected = selectedAngles.includes(ang);
                            return (
                              <button
                                key={ang}
                                type="button"
                                onClick={() => toggleAngle(ang)}
                                className={cn(
                                  "px-3.5 py-1.5 rounded-control border text-body font-bold transition cursor-pointer flex items-center gap-1.5",
                                  isSelected
                                    ? "bg-brand text-white border-brand shadow-2xs hover:bg-brand-deep"
                                    : "bg-card text-ink-2 border-hair-2 hover:border-hair-3 hover:bg-canvas"
                                )}
                              >
                                {isSelected && <Check className="size-3 stroke-[3]" />}
                                <span>{ang}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <PlanSectionContinue onClick={() => advanceFrom("objective")} />
                  </CreativePlanSection>

                  {/* 5. Product & Brand Visual Assets */}
                  <CreativePlanSection
                    icon={ImageIcon}
                    title="Product & Device Visual Assets"
                    summary={`${LOGO_PLACEMENTS.find((l) => l.id === infographicLogoPlacement)?.label || "Bottom right"} · ${infographicPages === "2" ? "2 pages" : "1 page"}`}
                    status={statusFor("assets", "Optional")}
                    tone="default"
                    open={openSection === "assets"}
                    onToggle={() => setOpenSection(openSection === "assets" ? null : "assets")}
                  >
                    <div className="space-y-4">
                      <div>
                        <div className="text-body font-bold text-ink mb-1">Logo placement</div>
                        <p className="text-label text-ink-3 mb-2">
                          Every page keeps this corner clear, and your approved logo is placed into it after the page is drawn.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {LOGO_PLACEMENTS.map((lp) => {
                            const isSelected = infographicLogoPlacement === lp.id;
                            return (
                              <button
                                key={lp.id}
                                type="button"
                                onClick={() => setInfographicLogoPlacement(lp.id as any)}
                                className={cn(
                                  "p-2.5 rounded-control border text-left transition cursor-pointer flex flex-col justify-between min-h-[75px]",
                                  isSelected
                                    ? "border-brand bg-card text-ink shadow-2xs ring-2 ring-brand/15"
                                    : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
                                )}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="font-bold text-body">{lp.label}</div>
                                  <div
                                    className={cn(
                                      "size-4 rounded-full border-2 grid place-items-center shrink-0",
                                      isSelected
                                        ? "border-brand bg-brand text-white"
                                        : "border-hair-3"
                                    )}
                                  >
                                    {isSelected && <Check className="size-2.5 stroke-[3]" />}
                                  </div>
                                </div>
                                <div className="text-micro text-ink-3 mt-0.5 leading-tight">{lp.desc}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <div className="text-body font-bold text-ink mb-1">Product packshots (Optional)</div>
                        <div className="flex flex-wrap items-center gap-3">
                          {packshots.map((ps) => (
                            <div key={ps.id} className="relative group rounded-control border border-hair-2 overflow-hidden bg-card p-1 shadow-2xs">
                              <img src={ps.url} alt={ps.name} className="size-16 object-cover rounded-chip" />
                              <span className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-micro font-bold px-1 rounded-glyph truncate">
                                {ps.name}
                              </span>
                            </div>
                          ))}
                          <input type="file" ref={fileUploadRef} className="hidden" />
                          <button
                            type="button"
                            onClick={() => fileUploadRef.current?.click()}
                            className="h-16 px-4 rounded-control border-2 border-dashed border-hair-3 hover:border-brand flex flex-col items-center justify-center gap-1 text-label font-bold text-ink-2 hover:text-brand bg-card cursor-pointer transition"
                          >
                            <Upload className="size-4" />
                            <span>Add product image</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="text-body font-bold text-ink mb-1.5">How many pages?</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[460px]">
                          <button
                            type="button"
                            onClick={() => setInfographicPages("1")}
                            className={cn(
                              "p-3 rounded-control border text-left transition cursor-pointer flex flex-col justify-between min-h-[75px]",
                              infographicPages === "1"
                                ? "border-brand bg-card text-ink shadow-2xs ring-2 ring-brand/15"
                                : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="font-bold text-body-lg">One page</div>
                              <div
                                className={cn(
                                  "size-4.5 rounded-full border-2 grid place-items-center shrink-0",
                                  infographicPages === "1"
                                    ? "border-brand bg-brand text-white"
                                    : "border-hair-3"
                                )}
                              >
                                {infographicPages === "1" && <Check className="size-3 stroke-[3]" />}
                              </div>
                            </div>
                            <div className="text-label text-ink-3 mt-0.5">A single concise surface</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setInfographicPages("2")}
                            className={cn(
                              "p-3 rounded-control border text-left transition cursor-pointer flex flex-col justify-between min-h-[75px]",
                              infographicPages === "2"
                                ? "border-brand bg-card text-ink shadow-2xs ring-2 ring-brand/15"
                                : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="font-bold text-body-lg">Two pages</div>
                              <div
                                className={cn(
                                  "size-4.5 rounded-full border-2 grid place-items-center shrink-0",
                                  infographicPages === "2"
                                    ? "border-brand bg-brand text-white"
                                    : "border-hair-3"
                                )}
                              >
                                {infographicPages === "2" && <Check className="size-3 stroke-[3]" />}
                              </div>
                            </div>
                            <div className="text-label text-ink-3 mt-0.5">A front summary and back evidence spread</div>
                          </button>
                        </div>
                      </div>
                    </div>
                    <PlanSectionContinue onClick={() => advanceFrom("assets")} />
                  </CreativePlanSection>


                </div>
              </>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                STAGE 2: CONTENT BLUEPRINT / PLAN (Expandable Citations)
               ══════════════════════════════════════════════════════════════════ */}
            

            {/* ══════════════════════════════════════════════════════════════════
                UNIFIED FLOATING ACTION PILL AT MIDDLE BOTTOM (Exact Video Twin)
               ══════════════════════════════════════════════════════════════════ */}
            <ActionBar
              icon={
                foundBlock && currentStep === "brief" ? (
                  <AlertTriangle className="size-4.5 shrink-0 text-warn-on-dark" />
                ) : (
                  <CheckCircle2 className="size-4.5 text-ok-on-dark shrink-0" />
                )
              }
              title={
                verifyingSources
                  ? "Checking your sources…"
                  : foundBlock && currentStep === "brief"
                    ? foundBlock.title
                    : currentStep === "brief"
                      ? "Ready to create creative"
                      : "Ready to generate canvas"
              }
              description={
                foundBlock && currentStep === "brief" && !verifyingSources
                  ? foundBlock.detail
                  : "Grounded against 214 approved claims"
              }
              action={
                <Button
                  disabled={verifyingSources}
                  onClick={() => {
                    if (currentStep === "brief") handleConfirmPlan();
                    // The blueprint approves the structure; the words come
                    // next. Going straight to the studio meant the first read
                    // of the copy happened after the art was paid for.
                    else openContentPlan();
                  }}
                  className="h-9 px-5 rounded-control text-body font-bold shadow-sm transition-all duration-200 shrink-0 bg-brand hover:bg-brand-deep text-white cursor-pointer hover:-translate-y-0.5"
                >
                  <span>
                    {currentStep === "brief"
                      ? "Confirm Plan & Choose Layout"
                      : "Choose Layout"}
                  </span>
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Button>
              }
            />
          </section>
        )
      }
      panel={
        <>
          {/* Chat Top Banner */}
          <div className="p-3.5 border-b border-hair bg-card shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-body font-bold text-brand">
                <LogoMark size={14} />
                <span>Direct with SwishX</span>
              </div>
              <span className="rounded-chip bg-ok/15 text-ok px-2 py-0.5 text-micro font-bold">
                Online
              </span>
            </div>

            {/* Writing copy is the one stage that needs the claims beside it,
                which is why the script stage has exactly these two tabs. */}
            {currentStep === "copy" && (
              <div className="mt-2.5 grid grid-cols-2 gap-1 rounded-panel border border-hair bg-[#e6ebe6] p-1 shadow-inner-xs">
                {([
                  { id: "chat" as const, label: "Chat" },
                  { id: "claims" as const, label: "Claims" },
                ]).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPanelTab(tab.id)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-chip py-1.5 text-label font-bold transition cursor-pointer",
                      panelTab === tab.id ? "bg-card text-ink shadow-2xs" : "text-ink-3 hover:text-ink"
                    )}
                  >
                    {tab.id === "chat" && <span className="size-1.5 shrink-0 rounded-full bg-ok" />}
                    <span>{tab.label}</span>
                    {tab.id === "claims" && (
                      <span className="text-micro font-black tabular-nums text-ink-4">
                        {APPROVED_CLAIMS.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {currentStep === "copy" && panelTab === "claims" ? (
            <ClaimsPanel highlightedClaimId={highlightedClaimId} />
          ) : (
          <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex gap-2.5 max-w-full",
                  msg.role === "user" ? "ml-auto justify-end" : "mr-auto"
                )}
              >
                {msg.role === "swishx" && (
                  <div className="size-7 rounded-full bg-brand text-white grid place-items-center font-bold text-caption shrink-0 mt-0.5 shadow-2xs">
                    SX
                  </div>
                )}
                <div className="space-y-2 max-w-[88%]">
                  <div
                    className={cn(
                      "rounded-panel p-3 text-body leading-relaxed",
                      msg.role === "user"
                        ? "bg-brand text-white rounded-tr-xs"
                        : "bg-subtle text-ink border border-hair rounded-tl-xs"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Suggestion Chips in SwishX bubble */}
                  {msg.role === "swishx" && idx === chatMessages.length - 1 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        "Switch to Portrait 3:4",
                        "Use Stat Hero Template",
                        "Elevate MoA in Section 2",
                        "Set to 2 Pages",
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleSendChat(chip)}
                          className="text-label font-semibold text-ink-2 bg-card hover:bg-tint hover:text-brand border border-hair-2 rounded-chip px-2.5 py-1 transition cursor-pointer shadow-2xs"
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

          {/* Chat Input Area with Synchronized Docked Action Bar */}
          <div className="p-3 border-t border-hair bg-card shrink-0 space-y-2">
            {/* ── Sub-step 1 Action Bar ── */}
            {currentStep === "brief" && (
              <div className="rounded-panel border border-brand/20 bg-gradient-to-r from-tint via-white to-tint p-2 shadow-2xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-6 rounded-full bg-ok text-white grid place-items-center shrink-0">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-label font-bold text-ink truncate">
                      Ready to generate blueprint
                    </div>
                    <div className="text-micro text-ink-3 truncate">
                      Grounded against 214 approved claims
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={openTemplateStep}
                  size="sm"
                  className="h-7.5 px-3 rounded-chip text-label font-bold shadow-xs transition-all shrink-0 cursor-pointer bg-brand hover:bg-brand-deep text-white hover:scale-[1.02]"
                >
                  <span>Choose Layout</span>
                  <ArrowRight className="size-3 ml-1" />
                </Button>
              </div>
            )}

            {/* ── Sub-step 2 Action Bar ── */}
            

            {/* Input Bar */}
            <div className="relative">
              <div className="flex items-center gap-2 rounded-control border border-hair-2 bg-subtle px-3 py-2 focus-within:border-brand focus-within:bg-card focus-within:shadow-xs transition">
                <Plus className="size-3.5 text-ink-3 shrink-0" />
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendChat();
                  }}
                  placeholder={
                    currentStep === "copy"
                      ? copyScope.length > 0
                        ? `Change ${copyScope.length} selected ${copyScope.length === 1 ? "block" : "blocks"}…`
                        : "Tick blocks on the left, then ask…"
                      : "Ask or request changes..."
                  }
                  className="flex-1 bg-transparent text-body outline-none text-ink placeholder:text-ink-3"
                />
                <button
                  type="button"
                  onClick={() => handleSendChat()}
                  disabled={!chatInput.trim()}
                  className="grid size-6 place-items-center rounded-chip bg-brand text-white disabled:opacity-30 hover:bg-brand-deep transition cursor-pointer disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="size-3" />
                </button>
              </div>
            </div>
          </div>
          </>
          )}
        </>
      }
      overlay={
        <>
          {useCaseDrawerOpen && (
            <ScenarioDrawer
              currentScenarioId={demoScenarioId}
              assetType="infographic"
              title="Use cases"
              onSelect={loadUseCase}
              onReset={() => {
                const fallback =
                  demoScenarios.find((sc) => sc.id === "mechanism-infographic") ??
                  demoScenarios.find((sc) => sc.inputs.assetType === "infographic")!;
                loadUseCase(fallback);
              }}
              onClose={() => setUseCaseDrawerOpen(false)}
            />
          )}
          {previewDossier && (
            <DossierPreviewModal
              dossier={previewDossier}
              onClose={() => setPreviewDossier(null)}
            />
          )}
        </>
      }
    />
  );
}

// ── CreativePlanSection with Zoom & Dimming Focus Animations (Matching Video Flow) ──
function CreativePlanSection({
  icon: Icon,
  title,
  summary,
  status,
  error,
  open,
  onToggle,
  tone = "default",
  children,
}: {
  icon: LucideIcon;
  title: string;
  summary: string;
  status: string;
  /** Set when this section is why Confirm refused. */
  error?: { title: string; detail: string } | null;
  open: boolean;
  onToggle: () => void;
  tone?: "default" | "done" | "attention";
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "squircle-card relative transition-all duration-300 ease-entrance",
        open
          ? "z-20 w-full scale-100 bg-card border border-hair shadow-brand-soft rounded-card my-3.5"
          : "z-0 w-[93%] sm:w-[94%] mx-auto scale-[0.985] bg-white/80 opacity-[.76] hover:opacity-100 hover:bg-card hover:shadow-xs border border-hair hover:border-hair-3 rounded-control my-1"
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          "focus-ring group flex w-full items-center gap-3 text-left transition-all duration-200 cursor-pointer",
          open ? "min-h-[70px] px-4 sm:px-5" : "min-h-[44px] py-1.5 px-3 sm:px-3.5"
        )}
        aria-expanded={open}
      >
        <span
          className={cn(
            "squircle-control grid shrink-0 place-items-center transition-transform group-hover:scale-105",
            open ? "size-10 rounded-control" : "size-7 rounded-chip",
            open
              ? "bg-brand text-white shadow-xs"
              : tone === "done"
              ? "bg-brand/15 text-brand"
              : "bg-[#edf3ef] text-brand"
          )}
        >
          {open ? (
            <Check className="size-4" strokeWidth={3} />
          ) : (
            <Icon className="size-3.5" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block font-bold tracking-tight transition-colors leading-snug",
              open ? "text-subhead text-ink" : "text-body-lg text-ink-2"
            )}
          >
            {title}
          </span>
          <span
            className={cn(
              "block truncate text-ink-3",
              open ? "mt-0.5 text-body" : "text-label max-w-[380px]"
            )}
          >
            {summary}
          </span>
        </span>

        <span
          className={cn(
            "hidden rounded-full font-bold sm:inline border",
            open ? "px-2.5 py-1 text-label" : "px-2 py-0.5 text-micro",
            status === "Confirmed"
              ? "bg-tint text-brand-deep border-tint-line"
              : status === "Optional"
              ? "bg-[#f5f5f5] text-[#737373] border-hair"
              : "bg-ok-bg text-ink-3 border-hair"
          )}
        >
          {status}
        </span>

        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-[#6f7c75] transition-transform duration-200",
            open && "rotate-180 text-brand"
          )}
        />
      </button>

      {open && (
        <div className="border-t border-hair px-4 pt-4 pb-5 sm:px-5 animate-in fade-in duration-200">
          {/* The error sits with the thing that has to change, not in a banner
              at the top of the page. A plan that bounces back should land you
              on the decision, already open, with the reason next to it. */}
          {error && (
            <div className="mb-3.5 flex items-start gap-2 rounded-control border border-warn-line bg-warn-bg p-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" />
              <div className="min-w-0">
                <div className="text-body font-bold text-warn">{error.title}</div>
                <p className="mt-0.5 text-label leading-snug text-ink-2">{error.detail}</p>
              </div>
            </div>
          )}
          {children}
        </div>
      )}
    </section>
  );
}
