"use client";

import { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  PanelRight,
  Plus,
  Send,
  ShieldCheck,
  Target,
  Palette,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { useBrandName } from "@/features/workspace/brand-catalogue";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { DossierPreviewModal, type DossierPreviewData } from "@/features/workspace/dossier-preview-modal";
import { ResearchSourcesContent, type UploadedDoc } from "@/features/workspace/research-sources-section";
import { cn } from "@/lib/cn";
import { ScreenHeader } from "@/components/patterns/screen-header";
import { VersionChip, type AssetVersion } from "@/features/workspace/version-trail";
import { FlowBreadcrumb, previousStep } from "@/features/workspace/flow-breadcrumb";
import { useCreativeSteps } from "@/features/workspace/flow-steps";
import { LogoMark } from "@/components/ui/logo-mark";
import { ActionBar } from "@/components/patterns/action-bar";
import { PlanSectionContinue } from "@/features/workspace/plan-section-continue";
import { usePlanResearch } from "@/features/workspace/use-plan-research";
import { SplitLayout } from "@/components/patterns/workbench-layout";
import { ScenarioDrawer } from "@/features/workspace/scenario-drawer";
import { demoScenarios, type DemoScenario } from "@/features/workspace/demo-scenarios";
import { TemplateStepScreen } from "@/features/workspace/template-step-screen";
import { PlanSectionShell, planState } from "@/features/workspace/plan-status";
import { GenerationProgress } from "@/features/workspace/generation-progress";
import { FileNoteDialog } from "@/features/workspace/file-note-dialog";
import {
  AssetStrip,
  MediaAssetTile,
  MediaAttachmentGrid,
  brandVariations,
  workspaceAssets,
} from "@/features/workspace/workspace-assets";
import {
  ChatAttachmentRow,
  useChatAttachments,
  type LocalAttachment,
} from "@/features/workspace/chat-attachments";
import { FormattedMessageText } from "@/features/workspace/chat-message";
import {
  buildIntakeQuestions,
  intakeSteps,
  readIntakeAnswer,
  type IntakeAnswer,
} from "@/features/workspace/plan-intake";

type InfographicSubStep = "brief" | "template";
type PlanSectionId = "sources" | "treatment" | "audience" | "format" | "design" | "objective" | "assets" | "references";

/** One name per section, so the progress bar and the tiles agree. */
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







/* Nothing has been published yet on the way in, so the trail is one entry. */
const DRAFT_ONLY: AssetVersion[] = [
  { label: "Draft v1", state: "current", at: "Saved just now" },
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

  /* From the catalogue, not from two hard-coded ids and a "Velmora" default. */
  const brandName = useBrandName(sourcePayload?.dossierId);

  /* In the store, not local: the breadcrumb in the canvas studio needs to be
     able to send you back to this step. */
  const currentStep = useWorkspaceStore((st) => st.creativeStep) as InfographicSubStep;
  const setCurrentStep = useWorkspaceStore((st) => st.setCreativeStep);
  const flowSteps = useCreativeSteps({});
  const backStep = previousStep(flowSteps, currentStep === "template" ? "layout" : "plan");

  /* ── The use case is the whole context, not a label ──────────────────────
     Same switcher as the video plan, filtered to image cases. Changing it
     swaps brief, audience, market, intended use, sources, page shape and
     archetype, because the plan is derived from those. */
  /** Set when the layout came from the library rather than the five. */
  const [libraryTemplateId, setLibraryTemplateId] = useState<string | null>(null);

  const [useCaseDrawerOpen, setUseCaseDrawerOpen] = useState(false);
  /* Only image cases count here. demoScenarioId is shared with the video flow,
     so matching the whole library made this button announce "HCP launch video"
     on a deck — a label that is simply untrue. Unmatched reads as unchosen. */
  const imageScenarios = demoScenarios.filter((sc) => sc.inputs.assetType === "infographic");
  const activeScenario = imageScenarios.find((sc) => sc.id === demoScenarioId) ?? null;

  /* Whether the attachments will fail verification is known to the case from
     the start, but it is not KNOWN to the user until Confirm runs the check.
     Two flags, because showing the failure early gives away an answer the
     screen has not earned yet. */
  const [sourcesWillFail, setSourcesWillFail] = useState(false);
  const [sourcesUnusable, setSourcesUnusable] = useState(false);
  const [verifyingSources, setVerifyingSources] = useState(false);
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
  const sectionOrder: PlanSectionId[] = ["sources", "format", "audience", "objective", "assets", "references"];

  const advanceFrom = (section: PlanSectionId) => {
    // Working a section through is what confirms it; the status then reads as
    // a record rather than a recommendation.
    setFoundBlock((prev) => (prev?.section === section ? null : prev));
    /* Continue goes to the next thing that still needs an answer, not the
       literal next tile — walking someone past settled sections to reach the
       one blocking them is the accordion wasting their time on its own
       ordering. */
    const from = sectionOrder.indexOf(section);
    const rest = sectionOrder.slice(from + 1);
    setOpenSection(rest.find((id) => sectionNeedsYou(id)) ?? rest[0] ?? null);
  };

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
        ? docs.map((name) => ({
            name,
            size: "1.2 MB",
            date: "Today",
            note: "Attached with the brief",
            origin: "new" as const,
          }))
        : [
            {
              name: `${brandName}_Clinical_Summary_LeaveBehind.pdf`,
              size: "3.6 MB",
              date: "Today",
              note: "Endpoint figures for the hero stat",
              origin: "new" as const,
            },
            {
              name: `${brandName}_Visual_Claims_Master.docx`,
              size: "720 KB",
              date: "Today",
              note: "Approved claim wording, verbatim",
              origin: "new" as const,
            },
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
    setFoundBlock(null);
    setChatMessages([]);
  };


  const [sourceGroundingMode, setSourceGroundingMode] = useState<"both" | "my-sources" | "swishx-only">("both");
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([
    {
      name: `${brandName}_Clinical_Summary_LeaveBehind.pdf`,
      size: "3.6 MB",
      date: "Today",
      note: "Endpoint figures for the hero stat",
      origin: "new",
    },
    {
      name: `${brandName}_Visual_Claims_Master.docx`,
      size: "720 KB",
      date: "Today",
      note: "Approved claim wording, verbatim",
      origin: "new",
    },
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

  /**
   * Whether a section is still asking something of you.
   *
   * One definition behind the chip, the bar, what opens on arrival and where
   * Continue goes — and deliberately narrow: a section filled in from the
   * brief is answered, whether or not you have looked at it. Treating
   * "unacknowledged" as "needs you" marks a settled plan as outstanding and
   * makes the count say nothing.
   */
  const sectionNeedsYou = (section: PlanSectionId) =>
    section === "sources" ? !hasGrounding || sourcesUnusable : false;

  /* References are always optional: a page blocked for want of a mood board
     is a plan refusing to start over a nice-to-have. */
  const sectionOptional = (section: PlanSectionId) =>
    section === "assets" || section === "references";

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
        setOpenSection(block as PlanSectionId);
        return;
      }
      // The plan settles the brief; the layout is the next decision.
      setCurrentStep("template");
    }, 900);
  };


  // Local state for brief questions
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>(audience === "Patient" ? "patient" : audience === "Consumer" ? "consumer" : "hcp");
  const [specialty, setSpecialty] = useState<string>("Dermatology");
  const [language, setLanguage] = useState<string>("English");
  const [objective, setObjective] = useState<string>("adoption");
  const [selectedAngles, setSelectedAngles] = useState<string[]>(["Product Introduction", "Mechanism of Action", "Indications"]);
  /** Reference material: how it should look, not what it may say. */
  const [referenceList, setReferenceList] = useState<
    Array<{ id: string; name: string; note: string; previewUrl?: string; kind?: "image" | "video" }>
  >([]);
  const [packshots, setPackshots] = useState<
    Array<{ id: string; name: string; url: string; note?: string; variation?: string }>
  >([
    {
      id: "packshot-1",
      name: `${brandName}_Autoinjector_3D_Packshot.png`,
      url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
    },
  ]);

  // Expanded citations state in Content step


  // The intake conversation that settles what the brief could not say.
  const planPhase = useWorkspaceStore((st) => st.planPhase);
  const setPlanPhase = useWorkspaceStore((st) => st.setPlanPhase);
  const briefAttachments = useWorkspaceStore((st) => st.briefAttachments);
  const [intakeIndex, setIntakeIndex] = useState(0);
  const [, setIntakeAnswers] = useState<IntakeAnswer[]>([]);
  const intakeQuestions = buildIntakeQuestions(briefAttachments, "infographic");
  const currentIntake = planPhase === "intake" ? intakeQuestions[intakeIndex] : undefined;
  const intakeStepList = intakeSteps(briefAttachments, brandName);

  const handleIntakeResearched = () => {
    setPlanPhase("intake");
    const count = briefAttachments.length;
    addChatMessage({
      role: "swishx",
      text: count
        ? `I've read the brief and opened ${count === 1 ? "the attachment" : `all ${count} attachments`}. ${intakeQuestions.length} quick ${intakeQuestions.length === 1 ? "thing" : "things"} and I can lay the plan out.`
        : `I've read the brief against the **${brandName}** dossier. A couple of things and I can lay the plan out.`,
    });
    setTimeout(() => {
      const first = intakeQuestions[0];
      if (first) addChatMessage({ role: "swishx", text: first.prompt });
    }, 600);
  };

  const answerIntake = (text: string) => {
    const question = intakeQuestions[intakeIndex];
    if (!question) return;
    const file = briefAttachments.find((f) => `file-${f.id}` === question.id);
    const answer = readIntakeAnswer(question, text, file?.kind ?? "doc");
    setIntakeAnswers((prev) => [...prev, answer]);
    if (answer.kind === "pages") setInfographicPages(answer.value);
    if (answer.kind === "shape") {
      /* A page is A4, tablet or screen — the creative flow has no mobile
         shape, so a mobile answer lands on the nearest upright page. */
      setPageShape(
        answer.value === "16:9 landscape" ? "16:9"
          : answer.value === "3:4 tablet" || answer.value === "9:16 mobile" ? "3:4"
          : "A4"
      );
    }

    const nextIndex = intakeIndex + 1;
    const next = intakeQuestions[nextIndex];
    setIntakeIndex(nextIndex);

    setTimeout(() => {
      if (next) {
        addChatMessage({ role: "swishx", text: `${answer.reply} ${next.prompt}` });
        return;
      }
      addChatMessage({
        role: "swishx",
        text: `${answer.reply}\n\nThat's everything I needed. I've laid the plan out on the left — grounded in the **${brandName}** dossier and approved claims. Check it over and confirm, or tell me what to change.`,
      });
      setPlanPhase("plan");
    }, 650);
  };

  // Chat state
  const chatFiles = useChatAttachments();
  const [pendingChatFiles, setPendingChatFiles] = useState<LocalAttachment[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  /* Media picked but not yet attached: what it is for is asked before it
     joins the plan, the same as a source file and the same as the video
     flow. The uploader here used to open a file input with no handler at
     all, so nothing was ever added and nothing was ever asked. */
  const [pendingMedia, setPendingMedia] = useState<
    Array<{ id: string; name: string; url: string }>
  >([]);
  const [editingPackshot, setEditingPackshot] = useState<
    { id: string; name: string; note: string; variation?: string } | null
  >(null);
  const [pendingReference, setPendingReference] = useState<
    Array<{ id: string; name: string; kind: "image" | "video"; previewUrl?: string }>
  >([]);
  const [editingReference, setEditingReference] = useState<{ id: string; name: string; note: string } | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, currentStep]);

  const toggleAngle = (angle: string) => {
    setSelectedAngles((prev) =>
      prev.includes(angle) ? prev.filter((a) => a !== angle) : [...prev, angle]
    );
  };

  const handleSendChat = (directText?: string) => {
    const attached = directText ? [] : chatFiles.take();
    const text = directText || chatInput.trim();
    if (!text && attached.length === 0) return;

    addChatMessage({
      role: "user",
      text: attached.length
        ? [text, ...attached.map((f) => `\u{1F4CE} ${f.name}`)].filter(Boolean).join("\n")
        : text,
    });
    if (!directText) setChatInput("");

    /* A file arrives without a job, and the two it could be doing here are
       different enough that guessing is worse than asking. */
    if (attached.length > 0) {
      setPendingChatFiles(attached);
      setTimeout(() => {
        addChatMessage({
          role: "swishx",
          text:
            attached.length === 1
              ? `Got **${attached[0].name}**. Where should it go — a grounded source, page artwork, a creative reference for the look, or just context for this question?`
              : `Got ${attached.length} files. Where should they go — grounded sources, page artwork, creative references for the look, or just context for this question?`,
        });
      }, 600);
      return;
    }

    if (pendingChatFiles.length > 0) {
      const lower = text.toLowerCase();
      const files = pendingChatFiles;
      const say = (message: string) =>
        setTimeout(() => addChatMessage({ role: "swishx", text: message }), 500);
      if (/\b(source|ground|grounding|evidence|research|dossier|claims?|study|data)\b/.test(lower)) {
        setPendingChatFiles([]);
        setUploadedDocs((prev) => [
          ...prev,
          ...files.map((f) => ({
            name: f.name,
            size: "—",
            date: "Just now",
            note: text.trim(),
            origin: "new" as const,
          })),
        ]);
        setOpenSection("sources");
        say(
          `Added ${files.length === 1 ? `**${files[0].name}**` : `${files.length} files`} to **Research and Sources**, with what you just said as the note.`
        );
        return;
      }
      if (/\b(reference|look|style|feel|layout|density|palette|inspiration)\b/.test(lower)) {
        setPendingChatFiles([]);
        setReferenceList((prev) => [
          ...prev,
          ...files.map((f, i) => ({
            id: `ref-chat-${Date.now()}-${i}`,
            name: f.name,
            note: text.trim(),
            previewUrl: f.previewUrl,
            kind: (f.kind === "video" ? "video" : "image") as "image" | "video",
          })),
        ]);
        setOpenSection("references");
        say(
          `Filed ${files.length === 1 ? `**${files[0].name}**` : `${files.length} files`} under **Visual & creative references**, with your note against ${files.length === 1 ? "it" : "them"}. It steers the layout — no claim will ground in it.`
        );
        return;
      }
      if (/\b(packshot|pack shot|product|artwork|photo|image|asset|device|pen)\b/.test(lower)) {
        setPendingChatFiles([]);
        setPackshots((prev) => [
          ...prev,
          ...files.map((f, i) => ({ id: `ps-chat-${Date.now()}-${i}`, name: f.name, url: f.previewUrl ?? "" })),
        ]);
        setOpenSection("assets");
        say(
          `Placed ${files.length === 1 ? `**${files[0].name}**` : `${files.length} files`} in **Product & Device Visual Assets**.`
        );
        return;
      }
      if (/\b(context|just|only|nothing|ignore|question|message)\b/.test(lower)) {
        setPendingChatFiles([]);
        say(`Understood — reading ${files.length === 1 ? "it" : "them"} for this question only. Nothing added to the plan.`);
        return;
      }
    }

    /* While a question is outstanding, what you type is its answer — not a
       change request against a plan that does not exist yet. */
    if (currentIntake) {
      answerIntake(text);
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
              // One step at a time, rather than dropping out of the flow.
              backStep?.onGo?.();
            }}
            disabled={!backStep?.onGo}
            className="focus-ring mr-2 grid size-8 place-items-center rounded-chip text-ink-3 transition hover:bg-black/5 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            aria-label={backStep ? `Back to ${backStep.label}` : "Back"}
            title={backStep ? `Back to ${backStep.label}` : undefined}
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
              <VersionChip versions={DRAFT_ONLY} />
            </div>
            <div className="mt-0.5 hidden text-micro text-ink-3 sm:block">
              Saved just now · Canvas Studio · MLR Ready
            </div>
          </div>

          {/* The case this plan is for, changeable without walking back to
              the brief — the same switcher the video plan has, filtered to
              image cases. */}
          <div className="ml-6 hidden items-center gap-1.5 sm:flex">
            <FlowBreadcrumb steps={flowSteps} currentId={currentStep === "template" ? "layout" : "plan"} />
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
        currentStep === "template" ? (
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
            onContinue={() => {
              setView("studio");
              setVideoSubStage("studio");
            }}
          />
        ) : (
          <section
            className="flex flex-1 min-w-0 flex-col min-h-0 border-r border-hair bg-[#eef1ed] overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-4 relative"
          >
            {/* ══════════════════════════════════════════════════════════════════
                STAGE 1: BRIEF & CREATIVE PARAMETERS (Exact Layout as Video Screen)
               ══════════════════════════════════════════════════════════════════ */}
            {currentStep === "brief" && planPhase === "research" && (
              /* Reading the request and whatever came with it — which is what
                 the questions are about, so the wait explains why it asks. */
              <GenerationProgress
                title="Reading your request..."
                subtitle={
                  briefAttachments.length
                    ? `Understanding the brief and checking what each of the ${briefAttachments.length} attached ${briefAttachments.length === 1 ? "file" : "files"} can ground.`
                    : "Understanding the brief and checking it against the approved dossier."
                }
                steps={intakeStepList}
                onDone={handleIntakeResearched}
              />
            )}

            {currentStep === "brief" && planPhase === "intake" && (
              /* Nothing to review yet. A plan drawn before the questions were
                 answered would be a guess presented as a decision, and the
                 accordion makes a guess look settled. */
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <h2 className="text-display font-[850] tracking-tight text-ink">Need your input</h2>
                <p className="mt-1.5 max-w-[42ch] text-body-lg text-ink-3">
                  Answer in chat to help us make the best plan for you.
                </p>
                {intakeQuestions.length > 0 && (
                  <p className="mt-5 text-label font-bold tabular-nums text-ink-4">
                    {Math.min(intakeIndex + 1, intakeQuestions.length)} of {intakeQuestions.length}
                  </p>
                )}
              </div>
            )}

            {currentStep === "brief" && planPhase === "plan" && (
              <>
                {/* Header first, then the shape of the work — as the video
                    plan has it. The progress bar was above the heading here,
                    so the screen answered "how much is left" before it had
                    said what it was. */}
                <div className="flex items-center justify-between pb-1 shrink-0">
                  <div>
                    {/* Named after what it wants, as the video plan is. This
                        flow has no production plan stage, so it names the
                        thing it actually leads to. */}
                    <h2 className="text-display font-[850] text-ink tracking-tight">
                      Need your input
                    </h2>
                    <p className="text-body text-ink-3 mt-0.5">
                      Answer below to help us refine the creative for you.
                    </p>
                  </div>
                </div>

                {/* No progress bar — see the video plan: the rails on the
                    rows already say which sections want something. */}

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
                    state={planState(sectionNeedsYou("sources"))}
                    source={research.researching ? `researching ${research.current}/${research.total}` : "from source"}
                    error={foundBlock?.section === "sources" ? foundBlock : null}
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
                    state={planState(sectionNeedsYou("format"), sectionOptional("format"))}
                    source="from brief"
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
                    state={planState(sectionNeedsYou("audience"), sectionOptional("audience"))}
                    source="from brief"
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
                    state={planState(sectionNeedsYou("objective"), sectionOptional("objective"))}
                    source="recommended"
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
                    state={planState(sectionNeedsYou("assets"), sectionOptional("assets"))}
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
                        <MediaAttachmentGrid
                          items={packshots.map((ps) => ({
                            id: ps.id,
                            name: ps.name,
                            note: ps.note,
                            previewUrl: ps.url,
                            kind: "image" as const,
                            variation: ps.variation,
                          }))}
                          uploadLabel={packshots.length === 0 ? "Upload product image" : "Add another"}
                          uploadHint="PNG, JPG"
                          onUpload={() =>
                            setPendingMedia([
                              {
                                id: `ps-${Date.now()}`,
                                name: `${brandName}_Pack_Front.png`,
                                url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
                              },
                            ])
                          }
                          onRemove={(id) => setPackshots((prev) => prev.filter((ps) => ps.id !== id))}
                          onEditNote={(item) =>
                            setEditingPackshot({
                              id: item.id,
                              name: item.name,
                              note: item.note ?? "",
                              variation: item.variation,
                            })
                          }
                        />

                        {/* Cleared artwork this brand already has, shown as
                            artwork rather than as a filename. */}
                        {(() => {
                          const reusable = workspaceAssets(brandName, "product").filter(
                            (asset) => !packshots.some((ps) => ps.name === asset.name)
                          );
                          if (reusable.length === 0) return null;
                          return (
                            <div className="mt-3">
                              <span className="mb-1.5 block text-label font-bold uppercase tracking-wider text-ink-3">
                                From your workspace
                              </span>
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
                                        {
                                          id: `ps-${asset.id}-${Date.now()}`,
                                          name: asset.name,
                                          url: asset.previewUrl ?? "",
                                          note: asset.note,
                                          variation: asset.variation,
                                        },
                                      ])
                                    }
                                  />
                                ))}
                              </AssetStrip>
                            </div>
                          );
                        })()}
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

                  {/* 6. Visual & creative references — how it should look, not
                      what it may say. Its own section because an asset from you
                      is doing one of three jobs, and this is the third:
                      evidence grounds a claim, a packshot appears on the page,
                      and a reference shapes the layout. */}
                  <CreativePlanSection
                    icon={Palette}
                    title="Visual & creative references"
                    summary={
                      referenceList.length > 0
                        ? `${referenceList.length} reference${referenceList.length === 1 ? "" : "s"}`
                        : "The look you are after"
                    }
                    state={planState(false, referenceList.length === 0)}
                    source={referenceList.length > 0 ? `${referenceList.length} attached` : undefined}
                    open={openSection === "references"}
                    onToggle={() => setOpenSection(openSection === "references" ? null : "references")}
                  >
                    <div className="space-y-3">
                      <p className="text-body leading-snug text-ink-3">
                        A poster or a spread that shows the look you want. Steers density, hierarchy
                        and palette. <strong className="font-bold text-ink-2">Grounds no claims.</strong>
                      </p>

                      <MediaAttachmentGrid
                        items={referenceList.map((r) => ({
                          id: r.id,
                          name: r.name,
                          note: r.note,
                          previewUrl: r.previewUrl,
                          kind: r.kind ?? "image",
                        }))}
                        uploadLabel={referenceList.length === 0 ? "Upload a reference" : "Add another"}
                        onUpload={() =>
                          setPendingReference([
                            {
                              id: `ref-${Date.now()}`,
                              name: "Congress_Poster_Reference.png",
                              kind: "image" as const,
                              previewUrl:
                                "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80",
                            },
                          ])
                        }
                        onRemove={(id) => setReferenceList((prev) => prev.filter((r) => r.id !== id))}
                        onEditNote={(item) =>
                          setEditingReference({ id: item.id, name: item.name, note: item.note ?? "" })
                        }
                      />

                      {/* What earlier projects referenced, shown as what it is. */}
                      {(() => {
                        const reusable = workspaceAssets(brandName, "reference").filter(
                          (asset) => !referenceList.some((r) => r.name === asset.name)
                        );
                        if (reusable.length === 0) return null;
                        return (
                          <div>
                            <span className="mb-1.5 block text-label font-bold uppercase tracking-wider text-ink-3">
                              Referenced before
                            </span>
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
                                    setReferenceList((prev) => [
                                      ...prev,
                                      {
                                        id: `ref-${asset.id}-${Date.now()}`,
                                        name: asset.name,
                                        note: asset.note,
                                        previewUrl: asset.previewUrl,
                                        kind: asset.kind === "video" ? ("video" as const) : ("image" as const),
                                      },
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
                      label={referenceList.length === 0 ? "Skip & Continue" : "Save & Continue"}
                      onClick={() => advanceFrom("references")}
                    />
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
            {/* Not while the intake is still running: confirming a plan is not
                on offer until there is one. */}
            {(currentStep !== "brief" || planPhase === "plan") && (
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
                    else {
                      setView("studio");
                      setVideoSubStage("studio");
                    }
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
            )}
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

          </div>

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
                    <FormattedMessageText text={msg.text} />
                  </div>

                  {/* Suggestion Chips in SwishX bubble. Only against a plan —
                      under an intake question they offered changes to
                      something that had not been drawn yet. */}
                  {msg.role === "swishx" && idx === chatMessages.length - 1 && planPhase === "plan" && (
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
            {currentStep === "brief" && planPhase === "plan" && (
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
                  onClick={() => setCurrentStep("template")}
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
              <ChatAttachmentRow attachments={chatFiles} />
              <div className="flex items-center gap-2 rounded-control border border-hair-2 bg-subtle px-3 py-2 focus-within:border-brand focus-within:bg-card focus-within:shadow-xs transition">
                {/* The + was a drawn icon that did nothing. It attaches a file,
                    the same as every other chat input. */}
                <button
                  type="button"
                  onClick={chatFiles.open}
                  className="grid size-5 shrink-0 place-items-center rounded-chip text-ink-3 transition hover:bg-black/5 hover:text-ink cursor-pointer"
                  title="Attach a file"
                  aria-label="Attach a file"
                >
                  <Plus className="size-3.5" />
                </button>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendChat();
                  }}
                  placeholder="Ask or request changes..."
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
      }
      overlay={
        <>
          {/* The same note dialog the sources uploader and the video flow use:
              a file arrives with a note about what it is for, or it does not
              arrive. */}
          {pendingMedia.length > 0 && (
            <FileNoteDialog
              files={pendingMedia.map((m) => ({ id: m.id, name: m.name, kind: "media" as const }))}
              title="What is this asset for?"
              prompt="A note and a variation travel with each asset, so it lands in the catalogue as one pack rather than as a file."
              placeholder="e.g. the hero packshot, front of pack"
              variations={brandVariations(brandName)}
              onCancel={() => setPendingMedia([])}
              onConfirm={(notes, variations) => {
                setPackshots((prev) => [
                  ...prev,
                  ...pendingMedia.map((m) => ({
                    ...m,
                    note: notes[m.id].trim(),
                    variation: variations[m.id],
                  })),
                ]);
                setPendingMedia([]);
              }}
            />
          )}

          {editingPackshot && (
            <FileNoteDialog
              files={[{
                id: editingPackshot.id,
                name: editingPackshot.name,
                kind: "media",
                note: editingPackshot.note,
                variation: editingPackshot.variation,
              }]}
              title="What is this asset for?"
              prompt="The note and the variation travel with the asset wherever the page places it."
              placeholder="e.g. the hero packshot, front of pack"
              variations={brandVariations(brandName)}
              onCancel={() => setEditingPackshot(null)}
              onConfirm={(notes, variations) => {
                const next = notes[editingPackshot.id].trim();
                setPackshots((prev) =>
                  prev.map((ps) =>
                    ps.id === editingPackshot.id
                      ? { ...ps, note: next, variation: variations[editingPackshot.id] }
                      : ps
                  )
                );
                setEditingPackshot(null);
              }}
            />
          )}

          {pendingReference.length > 0 && (
            <FileNoteDialog
              files={pendingReference.map((r) => ({ id: r.id, name: r.name, kind: "media" as const }))}
              title="What should we take from this reference?"
              prompt="A reference steers the layout. Saying which part matters is what makes it usable."
              placeholder="e.g. the density of the evidence block"
              onCancel={() => setPendingReference([])}
              onConfirm={(notes) => {
                setReferenceList((prev) => [
                  ...prev,
                  ...pendingReference.map((r) => ({ ...r, note: notes[r.id].trim() })),
                ]);
                setPendingReference([]);
              }}
            />
          )}

          {editingReference && (
            <FileNoteDialog
              files={[{ id: editingReference.id, name: editingReference.name, kind: "media", note: editingReference.note }]}
              title="What should we take from this reference?"
              prompt="The note travels with the reference wherever the layout uses it."
              placeholder="e.g. the density of the evidence block"
              onCancel={() => setEditingReference(null)}
              onConfirm={(notes) => {
                const next = notes[editingReference.id].trim();
                setReferenceList((prev) =>
                  prev.map((r) => (r.id === editingReference.id ? { ...r, note: next } : r))
                );
                setEditingReference(null);
              }}
            />
          )}

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

/** The same shell the video plan uses — this was a second copy of it. */
const CreativePlanSection = PlanSectionShell;

