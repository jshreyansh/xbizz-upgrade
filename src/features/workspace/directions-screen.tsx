"use client";

import {
  ArrowRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileCheck2,
  Film,
  Globe2,
  Info,
  LayoutList,
  Mic2,
  Music2,
  MonitorPlay,
  PackageCheck,
  Pause,
  Play,
  Plus,
  ShieldCheck,
  Target,
  Users,
  Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AudienceIcon, ChannelIcon } from "@/components/ui/select-icons";
import { deriveContentPlan } from "@/features/workspace/content-plan";
import { displayIntendedUses, parseIntendedUses, serializeIntendedUses } from "@/features/workspace/intended-use";
import { planningSources } from "@/features/workspace/mock-data";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { cn } from "@/lib/cn";
import type { AssetType, Audience, PresentationMode } from "@/types/content";

type PlanSectionId = "treatment" | "message" | "delivery" | "voice" | "brand" | "story";

const audienceOptions: Audience[] = ["HCP", "Patient", "Payer", "Field team", "Consumer"];
const useOptions = ["HCP meeting", "LinkedIn", "Instagram", "YouTube", "Email", "Website", "Congress / event", "Internal presentation"];
const topics = ["Product introduction", "Mechanism", "Pivotal evidence", "Dosing & safety", "Patient impact"];
const presenters = [
  { name: "Dr. Maya Kapoor", role: "Dermatologist · warm, reassuring", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=160&q=80" },
  { name: "Dr. Rohan Mehta", role: "Physician · clear, authoritative", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=160&q=80" },
  { name: "Dr. Aisha Shah", role: "Medical presenter · calm, precise", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=160&q=80" },
  { name: "Dr. Daniel Lee", role: "Physician · conversational", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=160&q=80" },
];

const profiles: Record<AssetType, {
  noun: string;
  recommendation: string;
  rationale: string;
  treatments: Array<{ id: string; label: string; description: string }>;
  units: Array<{ title: string; detail: string; time?: string }>;
  formatOptions: string[];
  lengthOptions: string[];
}> = {
  video: {
    noun: "video",
    recommendation: "Narrated visual story",
    rationale: "The clearest way to explain the mechanism and evidence without introducing an unnecessary presenter.",
    treatments: [
      { id: "narrated", label: "Narrated visual story", description: "Voiceover with branded scenes, evidence and restrained motion." },
      { id: "presenter", label: "Presenter-led", description: "A doctor or approved presenter delivers the story on screen." },
      { id: "visual-only", label: "Visual-only", description: "On-screen copy and visuals carry the story without narration." },
    ],
    units: [
      { title: "The unresolved need", detail: "Establish the clinical context", time: "8s" },
      { title: "Product introduction", detail: "State the molecule's intended role", time: "8s" },
      { title: "How it works", detail: "Explain the mechanism of action", time: "12s" },
      { title: "Pivotal evidence", detail: "Present the approved endpoint", time: "20s" },
      { title: "Close and fair balance", detail: "CTA and required safety", time: "12s" },
    ],
    formatOptions: ["16:9", "9:16", "1:1"],
    lengthOptions: ["30 sec", "45 sec", "60 sec", "90 sec"],
  },
  carousel: {
    noun: "carousel",
    recommendation: "Evidence-led page story",
    rationale: "A concise sequence lets readers scan the clinical argument while keeping every claim connected to its source.",
    treatments: [
      { id: "evidence", label: "Evidence-led", description: "Lead with the strongest approved result and build context around it." },
      { id: "story", label: "Story-led", description: "Move from the unmet need to the product and proof." },
      { id: "data", label: "Data-led", description: "Use charts and concise interpretation as the main structure." },
    ],
    units: [
      { title: "Cover", detail: "One clear launch message" },
      { title: "Clinical need", detail: "Why this matters" },
      { title: "Product introduction", detail: "The role of the molecule" },
      { title: "Mechanism", detail: "Simple scientific explanation" },
      { title: "Pivotal evidence", detail: "Approved result and citation" },
      { title: "Close", detail: "CTA and fair balance" },
    ],
    formatOptions: ["LinkedIn carousel", "1:1 pages", "16:9 slides"],
    lengthOptions: ["5 pages", "6 pages", "8 pages"],
  },
  infographic: {
    noun: "infographic",
    recommendation: "Guided evidence hierarchy",
    rationale: "A clear top-to-bottom information path makes the science understandable without becoming a dense scientific poster.",
    treatments: [
      { id: "guided", label: "Guided evidence hierarchy", description: "Move from context to mechanism, evidence and implication." },
      { id: "process", label: "Process explanation", description: "Use a sequential scientific pathway as the organizing device." },
      { id: "comparison", label: "Comparison", description: "Organize the content around two or more evidence states." },
    ],
    units: [
      { title: "Headline", detail: "Primary communication message" },
      { title: "Clinical context", detail: "Concise unmet need" },
      { title: "Mechanism", detail: "Scientific pathway" },
      { title: "Evidence", detail: "Approved endpoint and citation" },
      { title: "Implication", detail: "CTA and required safety" },
    ],
    formatOptions: ["Vertical", "Landscape", "Presentation slide"],
    lengthOptions: ["Compact", "Standard", "Detailed"],
  },
  visual: {
    noun: "visual",
    recommendation: "Message-first composition",
    rationale: "One approved message should dominate; brand and evidence remain visible without overcrowding the asset.",
    treatments: [
      { id: "message", label: "Message-first", description: "Lead with the approved communication message." },
      { id: "product", label: "Product-first", description: "Make the product and packshot the visual anchor." },
      { id: "evidence", label: "Evidence-first", description: "Use one approved result as the main focus." },
    ],
    units: [
      { title: "Primary message", detail: "The one thing viewers should retain" },
      { title: "Supporting proof", detail: "One approved evidence point" },
      { title: "Brand and action", detail: "Logo, CTA and required safety" },
    ],
    formatOptions: ["1:1", "4:5", "16:9", "9:16"],
    lengthOptions: ["Single composition"],
  },
};

import { VideoWizardHeader } from "@/features/workspace/video-wizard-header";
import { useRouter } from "next/navigation";

export function DirectionsScreen({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const {
    assetType,
    brief,
    audience,
    market,
    intendedUse,
    format,
    duration,
    language,
    presentationMode,
    voice,
    music,
    selectedSourceIds,
    creationMode,
    sourceType,
    sourcePayload,
    setAudience,
    setIntendedUse,
    setFormat,
    setDuration,
    setLanguage,
    setPresentationMode,
    setVoice,
    setMusic,
    toggleSource,
    setView,
    setVideoSubStage,
    goal: storeGoal,
    topics: storeTopics,
    setGoal: setStoreGoal,
    setTopics: setStoreTopics,
  } = useWorkspaceStore();

  const dossierNames: Record<string, string> = {
    velmora: "Velmora",
    onkavia: "Onkavia",
    nirvexa: "Nirvexa",
    cardioxa: "Cardioxa",
    pulmovax: "PulmoVax",
  };

  const brandName = dossierNames[sourcePayload.dossierId || "velmora"] || "Velmora";

  const profile = profiles[assetType];
  const derivedPlan = useMemo(
    () =>
      deriveContentPlan({
        assetType,
        brief,
        audience,
        market,
        intendedUse,
        selectedSourceIds,
        creationMode,
        sourceType,
        sourcePayload,
      }),
    [assetType, audience, brief, intendedUse, market, selectedSourceIds, creationMode, sourceType, sourcePayload]
  );

  const defaultTreatment = creationMode === "magic-avatar" ? "presenter" : creationMode === "magic-reel" ? "narrated" : (assetType === "video" ? presentationMode : derivedPlan.treatmentId);
  const [treatmentId, setTreatmentId] = useState<string>(defaultTreatment);
  const [goal, setGoal] = useState<string>(storeGoal || derivedPlan.goal);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(storeTopics && storeTopics.length > 0 ? storeTopics : derivedPlan.topics);
  const [confirmedTreatment, setConfirmedTreatment] = useState(true);
  const [sourceConflictResolved, setSourceConflictResolved] = useState(false);
  const [storyStructure, setStoryStructure] = useState(derivedPlan.storyStructure);
  const [presenter, setPresenter] = useState(
    creationMode === "magic-avatar" ? "Dr. Maya Kapoor" : (presentationMode === "presenter" ? "Dr. Maya Kapoor" : "")
  );
  const [openSection, setOpenSection] = useState<PlanSectionId | null>("treatment");
  const [editingDecision, setEditingDecision] = useState<string | null>(null);
  const [previewingAudio, setPreviewingAudio] = useState<string | null>(null);
  const [presenterLibraryOpen, setPresenterLibraryOpen] = useState(false);
  const [sourceManagerOpen, setSourceManagerOpen] = useState(false);

  const approvedEvidenceCount = selectedSourceIds.filter((id) => id !== "dermora-reference").length;
  const needsPresenter = presentationMode === "presenter" || treatmentId === "presenter" || creationMode === "magic-avatar";
  const unresolvedCount = (confirmedTreatment ? 0 : 1) + (needsPresenter && !presenter ? 1 : 0) + (derivedPlan.sourceConflict && !sourceConflictResolved ? 1 : 0);
  const selectedTreatment = profile.treatments.find((item) => item.id === treatmentId) ?? profile.treatments[0];

  const toggleSection = (section: PlanSectionId) => {
    setEditingDecision(null);
    setOpenSection((current) => (current === section ? null : section));
  };

  const selectTreatment = (id: string) => {
    setTreatmentId(id);
    if (assetType === "video") setPresentationMode(id as PresentationMode);
    if (id !== "presenter") setPresenter("");
    if (!derivedPlan.followsSuppliedScript) setStoryStructure(structureForTreatment(assetType, id));
    setConfirmedTreatment(true);
    setOpenSection(id === "presenter" ? "voice" : null);
  };

  const toggleTopic = (topic: string) =>
    setSelectedTopics((current) => {
      const next = current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic];
      setStoreTopics(next);
      return next;
    });

  const previewAudio = (kind: "voice" | "music", label: string) => {
    stopAudioPreview();
    if (previewingAudio === label) {
      setPreviewingAudio(null);
      return;
    }
    setPreviewingAudio(label);
    if (kind === "voice" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`${brandName} brings approved evidence into a clear clinical story.`);
      utterance.rate = label.includes("Riya") || label.includes("Maya") ? 0.95 : 0.9;
      utterance.pitch = label.includes("Riya") || label.includes("Maya") ? 1.05 : 0.95;
      utterance.onend = () => setPreviewingAudio(null);
      window.speechSynthesis.speak(utterance);
    } else {
      playMusicTone(label);
      window.setTimeout(() => setPreviewingAudio(null), 2200);
    }
  };

  const effectiveFormat = format.includes("·") ? format.split("·")[0].trim() : format;

  const handleBackToBrief = () => {
    setVideoSubStage("intake");
    setView("create");
  };

  const handleClose = () => {
    setView("home");
    router.push("/");
  };

  const content = (
    <main className="mx-auto w-full max-w-[1280px] px-6 py-6 sm:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] items-start w-full">
        {/* Left Column: Plan Sections */}
        <section className="min-w-0 w-full space-y-3">
            <PlanSection icon={Film} title="Creative treatment" summary={confirmedTreatment ? selectedTreatment.label : `${profile.recommendation} · needs confirmation`} status={confirmedTreatment ? "Confirmed" : "Needs you"} open={openSection === "treatment"} onToggle={() => toggleSection("treatment")} tone={confirmedTreatment ? "done" : "attention"}>
              <div className="squircle rounded-[18px] bg-[#f5f8f6] px-4 py-3.5"><div className="text-[13px] font-semibold text-[var(--brand)]">Why this fits</div><p className="mt-1 text-[14px] leading-5 text-[#5f6b65]">{profile.rationale}</p></div>
              <div className="mt-3 grid gap-2.5">
                {profile.treatments.map((item, index) => {
                  const selected = treatmentId === item.id;
                  return <button key={item.id} onClick={() => selectTreatment(item.id)} className={cn("focus-ring flex min-h-[64px] items-center gap-3 rounded-[13px] border px-3.5 text-left transition-[opacity,transform,background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-px hover:opacity-100 focus-visible:opacity-100", selected ? "border-[#b8ccc2] bg-[#f2f7f4] opacity-100 shadow-[0_2px_10px_rgb(19_31_26/4%)]" : "border-[#e4e9e6] opacity-70 hover:border-[#ccd7d1] hover:bg-[#fcfdfc]")}><span className={cn("grid size-5 shrink-0 place-items-center rounded-full border", selected ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-[#d6ddd9]")}>{selected && <Check className="size-3" strokeWidth={3} />}</span><span className="min-w-0 flex-1"><span className="flex items-center gap-2 text-[14px] font-semibold">{item.label}{index === 0 && <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10.5px] font-semibold text-[var(--brand)]">Recommended</span>}</span><span className="mt-0.5 block text-[13px] leading-5 text-[var(--ink-muted)]">{item.description}</span></span></button>;
                })}
              </div>
              {!confirmedTreatment && <Button onClick={() => { setConfirmedTreatment(true); setOpenSection(null); }} className="mt-3">Use recommendation <ArrowRight className="size-4" /></Button>}
            </PlanSection>

            <PlanSection icon={Target} title="Message and audience" summary={`${audience} · ${goal} · ${selectedTopics.length} topics`} status="From brief" open={openSection === "message"} onToggle={() => toggleSection("message")}>
              <div className="space-y-2">
                <DecisionRow label="Audience" value={audience} icon={<AudienceIcon value={audience} />} editing={editingDecision === "audience"} onEdit={() => setEditingDecision(editingDecision === "audience" ? null : "audience")}>
                  <ChoiceGroup label="Choose the primary audience" value={audience} onChange={(next) => { setAudience(next as Audience); setEditingDecision(null); }} options={audienceOptions} icon={(next) => <AudienceIcon value={next} />} />
                </DecisionRow>
                <DecisionRow label="Objective" value={goal} icon={<Target className="size-4" />} editing={editingDecision === "objective"} onEdit={() => setEditingDecision(editingDecision === "objective" ? null : "objective")}>
                  <ChoiceGroup label="What should this accomplish?" value={goal} onChange={(next) => { setGoal(next); setStoreGoal(next); setEditingDecision(null); }} options={["New launch", "Awareness", "Adoption", "Retention", "Education"]} icon={() => <Target className="size-4" />} />
                </DecisionRow>
                <DecisionRow label="Topics" value={selectedTopics.join(" · ")} icon={<LayoutList className="size-4" />} editing={editingDecision === "topics"} onEdit={() => setEditingDecision(editingDecision === "topics" ? null : "topics")}>
                  <div className="text-[13px] font-semibold text-[#5f6b65]">Include only what matters</div><div className="mt-2 flex flex-wrap gap-2">{topics.map((topic) => <button key={topic} onClick={() => toggleTopic(topic)} aria-pressed={selectedTopics.includes(topic)} className={cn("focus-ring min-h-10 rounded-[12px] border px-3 text-[13px] font-medium transition", selectedTopics.includes(topic) ? "border-[#b8ccc2] bg-[#f2f7f4] text-[var(--brand)]" : "border-[#e3e8e5] hover:border-[#cbd6d0]")}>{selectedTopics.includes(topic) && <Check className="mr-1.5 inline size-3.5" />}{topic}</button>)}</div><div className="mt-3 flex justify-end"><Button size="sm" onClick={() => setEditingDecision(null)}>Done</Button></div>
                </DecisionRow>
              </div>
            </PlanSection>

            <PlanSection icon={MonitorPlay} title="Delivery" summary={`${displayIntendedUses(intendedUse)} · ${effectiveFormat} · ${duration}`} status="Recommended" open={openSection === "delivery"} onToggle={() => toggleSection("delivery")}>
              <div className="space-y-2">
                <DecisionRow label="Destinations" value={displayIntendedUses(intendedUse)} icon={<ChannelIcon value={parseIntendedUses(intendedUse)[0]} />} editing={editingDecision === "channel"} onEdit={() => setEditingDecision(editingDecision === "channel" ? null : "channel")}>
                  <MultiChoiceGroup label="Choose one or more destinations" values={parseIntendedUses(intendedUse)} onChange={(next) => setIntendedUse(serializeIntendedUses(next))} onDone={() => setEditingDecision(null)} options={useOptions} icon={(next) => <ChannelIcon value={next} />} />
                </DecisionRow>
                <DecisionRow label={assetType === "video" ? "Frame" : "Format"} value={effectiveFormat} icon={<FrameGlyph value={effectiveFormat} />} editing={editingDecision === "format"} onEdit={() => setEditingDecision(editingDecision === "format" ? null : "format")}>
                  <FormatChoices label="Choose the output shape" value={effectiveFormat} options={profile.formatOptions} onChange={(next) => { setFormat(next); setEditingDecision(null); }} />
                </DecisionRow>
                <DecisionRow label={assetType === "video" ? "Length" : "Amount"} value={duration} icon={<Clock3 className="size-4" />} editing={editingDecision === "length"} onEdit={() => setEditingDecision(editingDecision === "length" ? null : "length")}>
                  <SteppedControl label={assetType === "video" ? "Video length" : "Content amount"} value={duration} options={profile.lengthOptions} onChange={setDuration} />
                  <div className="mt-3 flex justify-end"><Button size="sm" onClick={() => setEditingDecision(null)}>Done</Button></div>
                </DecisionRow>
              </div>
            </PlanSection>

            {assetType === "video" && treatmentId !== "visual-only" && (
              <PlanSection icon={Mic2} title={needsPresenter ? "Presenter, voice and sound" : "Voice and sound"} summary={needsPresenter ? `${presenter || "Choose presenter"} · ${language} · ${music}` : `${voice} · ${language} · ${music}`} status={needsPresenter && !presenter ? "Needs you" : "Recommended"} open={openSection === "voice"} onToggle={() => toggleSection("voice")} tone={needsPresenter && !presenter ? "attention" : "default"}>
                {needsPresenter && <div className="mb-4"><div className="text-[13px] font-semibold text-[#5f6b65]">Who appears on screen?</div><div className="mt-2 grid gap-2 sm:grid-cols-3">{presenters.slice(0, 2).map((person) => <button key={person.name} onClick={() => setPresenter(person.name)} className={cn("focus-ring flex min-h-[58px] items-center gap-2.5 rounded-[13px] border px-2.5 text-left text-[13px] font-medium transition hover:-translate-y-px", presenter === person.name ? "border-[#b8ccc2] bg-[#f2f7f4] text-[var(--brand)] shadow-sm" : "border-[#e3e8e5] hover:border-[#cbd6d0]")}><FacePhoto person={person} className="size-9 rounded-full ring-2 ring-white" /><span className="min-w-0 truncate">{person.name}</span>{presenter === person.name && <Check className="ml-auto size-4 shrink-0" />}</button>)}<button onClick={() => setPresenterLibraryOpen(true)} className="focus-ring flex min-h-[58px] items-center gap-2.5 rounded-[13px] border border-[#e3e8e5] px-2.5 text-left text-[13px] font-medium transition hover:-translate-y-px hover:border-[#cbd6d0] hover:bg-[#fcfdfc]"><span className="flex -space-x-2">{presenters.slice(2).map((person) => <FacePhoto key={person.name} person={person} className="size-8 rounded-full border-2 border-white" />)}</span><span>View library</span><ArrowRight className="ml-auto size-4 text-[var(--ink-muted)]" /></button></div></div>}
                <div className="space-y-2">
                  <DecisionRow label="Language" value={language} icon={<Globe2 className="size-4" />} editing={editingDecision === "language"} onEdit={() => setEditingDecision(editingDecision === "language" ? null : "language")}>
                    <ChoiceGroup label="Choose a language" value={language} onChange={(next) => { setLanguage(next); setEditingDecision(null); }} options={["English", "Hindi", "Spanish", "French", "German"]} icon={() => <Globe2 className="size-4" />} />
                  </DecisionRow>
                  <DecisionRow label="Voice" value={voice} icon={<Mic2 className="size-4" />} editing={editingDecision === "voice"} onEdit={() => setEditingDecision(editingDecision === "voice" ? null : "voice")} onPreview={() => previewAudio("voice", voice)} playing={previewingAudio === voice}>
                    <AudioChoices label="Choose and preview a voice" value={voice} options={["Rohan · clear and measured", "Riya · friendly and clear", "Dev · warm and conversational"]} onChange={(next) => { setVoice(next); setEditingDecision(null); }} previewing={previewingAudio} onPreview={(option) => previewAudio("voice", option)} />
                  </DecisionRow>
                  <DecisionRow label="Background music" value={music} icon={<Music2 className="size-4" />} editing={editingDecision === "music"} onEdit={() => setEditingDecision(editingDecision === "music" ? null : "music")} onPreview={music === "No music" ? undefined : () => previewAudio("music", music)} playing={previewingAudio === music}>
                    <AudioChoices label="Choose and preview music" value={music} options={["No music", "Calm clinical", "Warm", "Uplifting"]} onChange={(next) => { setMusic(next); setEditingDecision(null); }} previewing={previewingAudio} onPreview={(option) => previewAudio("music", option)} music />
                  </DecisionRow>
                </div>
              </PlanSection>
            )}

            <PlanSection icon={ShieldCheck} title="Brand and evidence" summary={derivedPlan.sourceConflict && !sourceConflictResolved ? "Source authority needs confirmation" : approvedEvidenceCount > 0 ? `${approvedEvidenceCount} approved sources · brand kit applied` : "Concept only · approved source needed"} status={derivedPlan.sourceConflict && !sourceConflictResolved ? "Needs you" : approvedEvidenceCount > 0 ? "From source" : "Review"} open={openSection === "brand"} onToggle={() => toggleSection("brand")} tone={derivedPlan.sourceConflict && !sourceConflictResolved ? "attention" : approvedEvidenceCount > 0 ? "default" : "attention"}>
              {derivedPlan.sourceConflict && !sourceConflictResolved && <div className="mb-3 rounded-[12px] border border-[#e4c17f] bg-[var(--warning-soft)] p-3.5"><div className="flex items-start gap-3"><Info className="mt-0.5 size-5 shrink-0 text-[var(--warning)]" /><div><div className="text-[14px] font-bold text-[#704b13]">Confirm source authority</div><p className="mt-1 text-[13px] leading-5 text-[#765b31]">{derivedPlan.sourceConflict}</p><button onClick={() => setSourceConflictResolved(true)} className="focus-ring mt-2 min-h-10 rounded-[9px] bg-white px-3 text-[13px] font-bold text-[#704b13] shadow-sm">Use current {market} source as authority</button></div></div></div>}
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoCard icon={PackageCheck} title="Brand material" body={`Primary logo, packshot, typography and fair balance for ${brandName} will be applied automatically.`} />
                <InfoCard icon={BookOpenCheck} title="Evidence coverage" body={approvedEvidenceCount > 0 ? `Mechanism, efficacy and required safety language are linked to current ${market} sources.` : "This can become a concept storyboard, but it will not be marked evidence-ready."} />
              </div>
              <button onClick={() => setSourceManagerOpen(true)} className="focus-ring mt-3 flex min-h-10 items-center gap-2 rounded-[10px] px-3 text-[14px] font-semibold text-[var(--brand)] hover:bg-[var(--brand-soft)]"><Plus className="size-4" /> Add or remove sources</button>
            </PlanSection>

            <PlanSection icon={LayoutList} title="Story structure" summary={`${storyStructure} · ${profile.units.length} ${assetType === "video" ? "scenes" : assetType === "carousel" ? "pages" : "sections"}`} status={derivedPlan.followsSuppliedScript ? "From script" : "Recommended"} open={openSection === "story"} onToggle={() => toggleSection("story")}>
              <StructureChoices value={storyStructure} onChange={setStoryStructure} options={assetType === "video" ? ["Product → Proof", "Problem → Solution", "Mechanism → Evidence"] : profile.treatments.map((item) => item.label)} />
            </PlanSection>
          </section>

          {/* Right Sidebar: Sticky Grounding Context (Fixed to Top) */}
          <aside className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-[76px] self-start">
            <div className="squircle-card overflow-hidden border border-[var(--line)] bg-white shadow-[var(--shadow-sm)]">
              <div className="border-b border-[var(--line)] bg-[#fafbf9] px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">Available Context</span>
                  <span className="rounded-full bg-[var(--ok-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--ok)]">
                    Grounding verified
                  </span>
                </div>
                <h2 className="mt-0.5 text-[16px] font-bold tracking-tight text-[var(--ink)]">{brandName} Dossier</h2>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-[var(--brand-soft)] text-[var(--brand)]">
                    <Users className="size-4" />
                  </span>
                  <div>
                    <span className="block text-[13.5px] font-semibold">Audience &amp; Goal</span>
                    <span className="mt-0.5 block text-[12.5px] leading-4 text-[var(--ink-muted)]">
                      {audience} · {goal}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-[var(--brand-soft)] text-[var(--brand)]">
                    <Layers className="size-4" />
                  </span>
                  <div>
                    <span className="block text-[13.5px] font-semibold">Focus Topics ({selectedTopics.length})</span>
                    <span className="mt-0.5 block text-[12.5px] leading-4 text-[var(--ink-muted)]">
                      {selectedTopics.join(" · ")}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-[var(--brand-soft)] text-[var(--brand)]">
                    <Film className="size-4" />
                  </span>
                  <div>
                    <span className="block text-[13.5px] font-semibold">Creative Treatment</span>
                    <span className="mt-0.5 block text-[12.5px] leading-4 text-[var(--ink-muted)]">
                      {selectedTreatment.label} · {effectiveFormat} · {duration}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-[var(--brand-soft)] text-[var(--brand)]">
                    <FileCheck2 className="size-4" />
                  </span>
                  <div>
                    <span className="block text-[13.5px] font-semibold">Evidence Grounding</span>
                    <span className="mt-0.5 block text-[12.5px] leading-4 text-[var(--ink-muted)]">
                      {approvedEvidenceCount > 0 ? `214 approved claims cited against ${market} label.` : "Grounding verified from attached source."}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto border-t border-[var(--line)] bg-[#f7f9f7] px-4 py-2.5 text-[11.5px] leading-4 text-[var(--ink-muted)]">
                Next: SwishX will generate the editable script, clinical scene prompts, and citation links in Studio.
              </div>
            </div>

            <Button
              onClick={() => setView("studio")}
              size="lg"
              disabled={unresolvedCount > 0}
              className="group mt-3 h-[48px] w-full px-6 rounded-[13px] text-[14.5px] font-bold shadow-md bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <span>Create storyboard</span>
              <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </Button>

            <div className="mt-2 flex items-center justify-center gap-1.5 text-[11.5px] text-[var(--ink-muted)]">
              {unresolvedCount === 0 ? <CheckCircle2 className="size-3.5 text-[var(--brand)]" /> : <Info className="size-3.5 text-[var(--warning)]" />}
              <span>{unresolvedCount === 0 ? "The plan is ready for an editable storyboard" : `${unresolvedCount} decision${unresolvedCount === 1 ? "" : "s"} remaining`}</span>
            </div>
          </aside>
        </div>
      </main>
  );

  if (embedded) {
    return (
      <div className="pb-10">
        {content}
        {presenterLibraryOpen && <PresenterLibrary selected={presenter} onSelect={(name) => { setPresenter(name); setPresenterLibraryOpen(false); }} onClose={() => setPresenterLibraryOpen(false)} />}
        {sourceManagerOpen && <SourceManager selectedIds={selectedSourceIds} onToggle={toggleSource} onClose={() => setSourceManagerOpen(false)} />}
      </div>
    );
  }

  return (
    <div className="page-enter min-h-screen bg-[#f7f8f6] pb-10">
      <VideoWizardHeader
        currentStep={3}
        onBack={handleBackToBrief}
        onClose={handleClose}
      />
      {content}
      {presenterLibraryOpen && <PresenterLibrary selected={presenter} onSelect={(name) => { setPresenter(name); setPresenterLibraryOpen(false); }} onClose={() => setPresenterLibraryOpen(false)} />}
      {sourceManagerOpen && <SourceManager selectedIds={selectedSourceIds} onToggle={toggleSource} onClose={() => setSourceManagerOpen(false)} />}
    </div>
  );
}

function PresenterLibrary({ selected, onSelect, onClose }: { selected: string; onSelect: (name: string) => void; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#10231c]/42 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Presenter library"><div className="select-pop w-full max-w-[640px] overflow-hidden rounded-[24px] border border-white/60 bg-white shadow-[var(--shadow-lg)]"><div className="flex items-start justify-between border-b border-[var(--line)] p-5 sm:px-6"><div><div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand)]">Presenter library</div><h2 className="mt-1 text-[23px] font-semibold tracking-[-0.03em]">Choose who appears on screen</h2><p className="mt-1 text-[14px] text-[var(--ink-muted)]">Preview the face and delivery style before choosing.</p></div><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close presenter library"><XIcon /></Button></div><div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">{presenters.map((person) => { const active = selected === person.name; return <button key={person.name} onClick={() => onSelect(person.name)} className={cn("focus-ring group flex items-center gap-3 rounded-[16px] border p-3 text-left transition hover:-translate-y-px hover:shadow-sm", active ? "border-[#afc5ba] bg-[#f1f7f3]" : "border-[#e3e8e5] hover:border-[#c8d4ce]")}><FacePhoto person={person} className="size-14 rounded-[14px]" /><span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold">{person.name}</span><span className="mt-1 block text-[12.5px] leading-4 text-[var(--ink-muted)]">{person.role}</span></span><span className={cn("grid size-6 place-items-center rounded-full border", active ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-[#d5ddd8]")}>{active && <Check className="size-3.5" />}</span></button>; })}</div></div></div>;
}

function FacePhoto({ person, className }: { person: (typeof presenters)[number]; className: string }) {
  return <span aria-hidden="true" className={cn("shrink-0 bg-cover bg-center", className)} style={{ backgroundImage: `url(${person.image})` }} />;
}

function XIcon() {
  return <span aria-hidden="true" className="text-[22px] font-light leading-none">×</span>;
}

function SourceManager({ selectedIds, onToggle, onClose }: { selectedIds: string[]; onToggle: (id: string) => void; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#10231c]/42 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Manage source material"><div className="select-pop w-full max-w-[720px] overflow-hidden rounded-[24px] border border-white/60 bg-white shadow-[var(--shadow-lg)]"><div className="flex items-start justify-between border-b border-[var(--line)] p-5 sm:px-6"><div><div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand)]">Plan sources</div><h2 className="mt-1 text-[23px] font-semibold tracking-[-0.03em]">Add or remove source material</h2><p className="mt-1 text-[14px] text-[var(--ink-muted)]">Evidence coverage updates here without reloading the plan.</p></div><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close source manager"><XIcon /></Button></div><div className="max-h-[430px] space-y-2 overflow-y-auto p-4 sm:p-6">{planningSources.map((source) => { const active = selectedIds.includes(source.id); return <div key={source.id} className={cn("flex min-h-[68px] items-center gap-3 rounded-[14px] border p-3 transition", active ? "border-[#b8ccc2] bg-[#f2f7f4]" : "border-[#e3e8e5]")}><span className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-white text-[var(--brand)] shadow-sm"><FileCheck2 className="size-[18px]" /></span><span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-semibold">{source.name}</span><span className="mt-0.5 block truncate text-[12.5px] text-[var(--ink-muted)]">{source.detail}</span></span><button type="button" onClick={() => onToggle(source.id)} className={cn("focus-ring flex min-h-10 items-center gap-1.5 rounded-[10px] px-3 text-[12.5px] font-semibold", active ? "bg-white text-[#6a756f] shadow-sm" : "bg-[var(--brand)] text-white")}>{active ? <Check className="size-4" /> : <Plus className="size-4" />}{active ? "Attached" : "Add"}</button></div>; })}</div><div className="flex items-center justify-between border-t border-[var(--line)] bg-[#f8faf8] p-4 sm:px-6"><span className="text-[12.5px] text-[var(--ink-muted)]">{selectedIds.length} sources attached</span><Button onClick={onClose}>Done</Button></div></div></div>;
}

function PlanSection({ icon: Icon, title, summary, status, open, onToggle, tone = "default", children }: { icon: LucideIcon; title: string; summary: string; status: string; open: boolean; onToggle: () => void; tone?: "default" | "done" | "attention"; children: React.ReactNode }) {
  return (
    <section className={cn("squircle-card relative border bg-white shadow-[var(--shadow-sm)] transition-[opacity,filter,box-shadow,border-color] duration-300 ease-[cubic-bezier(.2,.8,.2,1)]", open ? "z-20 opacity-100 saturate-100 shadow-[0_8px_24px_rgb(19_31_26/6%)]" : "z-0 opacity-[.72] saturate-[.72] hover:opacity-100 hover:saturate-100 hover:shadow-[0_7px_22px_rgb(19_31_26/5%)]", tone === "attention" ? "border-[#ead8b5]" : "border-[var(--line)]")}>
      <button onClick={onToggle} className="focus-ring group flex min-h-[70px] w-full items-center gap-3 px-4 text-left sm:px-5" aria-expanded={open}>
        <span className={cn("squircle-control grid size-9 shrink-0 place-items-center transition-transform group-hover:scale-105", tone === "attention" ? "bg-[var(--warning-soft)] text-[var(--warning)]" : tone === "done" ? "bg-[var(--brand)] text-white" : "bg-[#edf3ef] text-[var(--brand)]")}>{tone === "done" ? <Check className="size-4" /> : <Icon className="size-[18px]" />}</span>
        <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold">{title}</span><span className="mt-0.5 block truncate text-[12.5px] text-[var(--ink-muted)]">{summary}</span></span>
        <span className={cn("hidden rounded-full px-2.5 py-1 text-[11.5px] font-semibold sm:inline", tone === "attention" ? "bg-[var(--warning-soft)] text-[var(--warning)]" : "bg-[#eef2ef] text-[#66736c]")}>{status}</span>
        <ChevronDown className={cn("size-[18px] shrink-0 text-[var(--ink-muted)] transition-transform", open && "rotate-180")} />
      </button>
      <div aria-hidden={!open} inert={!open} className={cn("grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(.2,.8,.2,1)]", open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden"><div className="border-t border-[var(--line)] px-4 py-4 sm:px-5">{children}</div></div>
      </div>
    </section>
  );
}

function DecisionRow({ label, value, icon, editing, onEdit, onPreview, playing = false, children }: { label: string; value: string; icon: React.ReactNode; editing: boolean; onEdit: () => void; onPreview?: () => void; playing?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("squircle-panel overflow-hidden border transition-[opacity,border-color,box-shadow,background-color] duration-300 ease-[cubic-bezier(.2,.8,.2,1)]", editing ? "border-[#b7c9c0] bg-[#fbfdfc] opacity-100 shadow-[0_3px_14px_rgb(19_31_26/4%)]" : "border-[#e5e9e6] bg-white opacity-75 hover:opacity-100")}>
      <div className="flex min-h-[58px] items-center gap-3 px-3.5">
        <span className="squircle-control grid size-8 shrink-0 place-items-center bg-[#edf3ef] text-[var(--brand)]">{icon}</span>
        <span className="min-w-0 flex-1"><span className="block text-[11.5px] font-medium text-[var(--ink-muted)]">{label}</span><span className="mt-0.5 block truncate text-[13.5px] font-medium">{value}</span></span>
        {onPreview && <button type="button" onClick={onPreview} className="focus-ring grid size-9 place-items-center rounded-full bg-[#f4f7f5] text-[var(--brand)] transition hover:bg-[var(--brand-soft)]" aria-label={`${playing ? "Stop" : "Preview"} ${value}`}>{playing ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}</button>}
        <button type="button" onClick={onEdit} className="squircle-control focus-ring min-h-9 px-2.5 text-[12.5px] font-medium text-[var(--brand)] transition hover:bg-[var(--brand-soft)]">{editing ? "Close" : "Change"}</button>
      </div>
      <div aria-hidden={!editing} inert={!editing} className={cn("grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(.2,.8,.2,1)]", editing ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden"><div className="border-t border-[#e8ece9] bg-white px-3.5 py-4">{children}</div></div>
      </div>
    </div>
  );
}

function ChoiceGroup({ label, value, options, onChange, icon, className }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void; icon: (value: string) => React.ReactNode; className?: string }) {
  return <div className={className}><div className="text-[13px] font-medium text-[#5f6b65]">{label}</div><div className="mt-2 flex flex-wrap gap-2">{options.map((option) => { const selected = value === option; return <button type="button" key={option} aria-pressed={selected} onClick={() => onChange(option)} className={cn("focus-ring flex min-h-10 items-center gap-2 rounded-full border px-3 text-[13px] font-medium transition-[opacity,transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-px hover:opacity-100 focus-visible:opacity-100", selected ? "border-[#adc4b8] bg-[#eff6f2] text-[var(--brand)] opacity-100 shadow-sm" : "border-[#e3e8e5] bg-white opacity-65 hover:border-[#cbd6d0]")}>{icon(option)}<span>{option}</span>{selected && <Check className="size-3.5" />}</button>; })}</div></div>;
}

function MultiChoiceGroup({ label, values, options, onChange, onDone, icon }: { label: string; values: string[]; options: readonly string[]; onChange: (values: string[]) => void; onDone: () => void; icon: (value: string) => React.ReactNode }) {
  const selectedValues = values.length > 0 ? values : [options[0]];
  const toggle = (option: string) => {
    if (selectedValues.includes(option)) {
      if (selectedValues.length > 1) onChange(selectedValues.filter((item) => item !== option));
    } else onChange([...selectedValues, option]);
  };
  return <div><div className="text-[13px] font-medium text-[#5f6b65]">{label}</div><div className="mt-2 flex flex-wrap gap-2">{options.map((option) => { const selected = selectedValues.includes(option); return <button type="button" key={option} aria-pressed={selected} onClick={() => toggle(option)} className={cn("focus-ring flex min-h-10 items-center gap-2 rounded-full border px-3 text-[13px] font-medium transition-[opacity,transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-px hover:opacity-100 focus-visible:opacity-100", selected ? "border-[#adc4b8] bg-[#eff6f2] text-[var(--brand)] opacity-100 shadow-sm" : "border-[#e3e8e5] bg-white opacity-65 hover:border-[#cbd6d0]")}>{icon(option)}<span>{option}</span>{selected && <Check className="size-3.5" />}</button>; })}</div><div className="mt-3 flex items-center justify-between"><span className="text-[12px] text-[var(--ink-muted)]">{selectedValues.length} selected</span><Button size="sm" onClick={onDone}>Done</Button></div></div>;
}

function FormatChoices({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <div><div className="text-[13px] font-medium text-[#5f6b65]">{label}</div><div className="mt-2 flex flex-wrap gap-2">{options.map((option) => { const selected = value === option; return <button type="button" key={option} aria-pressed={selected} onClick={() => onChange(option)} className={cn("focus-ring flex min-h-[54px] min-w-[96px] items-center gap-3 rounded-[13px] border px-3 text-[13px] font-medium transition-[opacity,transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-px hover:opacity-100 focus-visible:opacity-100", selected ? "border-[#adc4b8] bg-[#eff6f2] text-[var(--brand)] opacity-100 shadow-sm" : "border-[#e3e8e5] opacity-65 hover:border-[#cbd6d0]")}><FrameGlyph value={option} /><span>{option}</span></button>; })}</div></div>;
}

function FrameGlyph({ value }: { value: string }) {
  const shape = value.includes("9:16") || value.includes("Vertical") ? "h-7 w-4" : value.includes("1:1") ? "size-5" : "h-4 w-7";
  return <span className={cn("block shrink-0 rounded-[3px] border-2 border-current", shape)} />;
}

function SteppedControl({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  const currentIndex = Math.max(0, options.indexOf(value));
  return <div><div className="flex items-center justify-between"><div className="text-[13px] font-semibold text-[#5f6b65]">{label}</div><output className="rounded-full bg-[#edf3ef] px-2.5 py-1 text-[12px] font-semibold text-[var(--brand)]">{options[currentIndex]}</output></div><input aria-label={label} type="range" min={0} max={Math.max(0, options.length - 1)} step={1} value={currentIndex} onChange={(event) => onChange(options[Number(event.target.value)])} className="mt-4 w-full accent-[var(--brand)]" /><div className="mt-1.5 flex justify-between gap-1">{options.map((option, index) => <button type="button" key={option} onClick={() => onChange(option)} className={cn("focus-ring rounded-md px-1 py-1 text-[11px]", index === currentIndex ? "font-semibold text-[var(--brand)]" : "text-[var(--ink-muted)]")}>{option.replace(" sec", "s")}</button>)}</div></div>;
}

function AudioChoices({ label, value, options, onChange, previewing, onPreview, music = false, className }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void; previewing: string | null; onPreview: (value: string) => void; music?: boolean; className?: string }) {
  return <div className={className}><div className="flex items-center justify-between"><div className="text-[13px] font-medium text-[#5f6b65]">{label}</div><span className="text-[11.5px] text-[var(--ink-muted)]">Preview before choosing</span></div><div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{options.map((option) => { const selected = value === option; const playing = previewing === option; const silent = music && option === "No music"; return <div key={option} className={cn("flex min-h-[60px] items-center rounded-[13px] border transition-[opacity,background-color,border-color,box-shadow] duration-200 hover:opacity-100", selected ? "border-[#adc4b8] bg-[#eff6f2] opacity-100" : "border-[#e3e8e5] bg-white opacity-65 hover:border-[#cbd6d0]")}><button type="button" aria-pressed={selected} onClick={() => onChange(option)} className="focus-ring flex min-w-0 flex-1 items-center gap-2.5 rounded-l-[13px] p-3 text-left"><span className={cn("grid size-7 shrink-0 place-items-center rounded-[9px]", selected ? "bg-[var(--brand)] text-white" : "bg-[#f0f3f1] text-[#6d7972]")}>{music ? <Music2 className="size-4" /> : <Mic2 className="size-4" />}</span><span className="min-w-0"><span className="block truncate text-[13px] font-semibold">{option.split(" · ")[0]}</span><span className="mt-0.5 block truncate text-[11.5px] text-[var(--ink-muted)]">{option.split(" · ")[1] ?? (silent ? "Voice only" : "Music bed")}</span></span></button>{!silent && <button type="button" onClick={() => onPreview(option)} className="focus-ring mr-2 grid size-9 shrink-0 place-items-center rounded-full bg-white text-[var(--brand)] shadow-sm transition hover:scale-105" aria-label={`${playing ? "Stop" : "Preview"} ${option}`}>{playing ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}</button>}</div>; })}</div></div>;
}

function StructureChoices({ value, options, onChange }: { value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <div><div className="text-[13px] font-medium text-[#5f6b65]">How the story progresses</div><div className="mt-2 grid gap-2 sm:grid-cols-3">{options.map((option) => { const selected = value === option; return <button type="button" key={option} aria-pressed={selected} onClick={() => onChange(option)} className={cn("focus-ring rounded-[14px] border p-3.5 text-left transition-[opacity,transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-px hover:opacity-100 focus-visible:opacity-100", selected ? "border-[#adc4b8] bg-[#eff6f2] opacity-100 shadow-sm" : "border-[#e3e8e5] opacity-65 hover:border-[#cbd6d0]")}><span className="flex items-center gap-2 text-[13px] font-semibold"><LayoutList className="size-4 text-[var(--brand)]" />{option}</span><span className="mt-1.5 block text-[12px] leading-4 text-[var(--ink-muted)]">{structureDescription(option)}</span></button>; })}</div></div>;
}

function InfoCard({ icon: Icon, title, body }: { icon: typeof Film; title: string; body: string }) {
  return <div className="flex min-h-[90px] items-start gap-3 rounded-[14px] bg-[#f6f8f6] p-3.5"><span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-white text-[var(--brand)] shadow-sm"><Icon className="size-4" /></span><span><span className="block text-[14px] font-semibold">{title}</span><span className="mt-1 block text-[13px] leading-5 text-[var(--ink-muted)]">{body}</span></span></div>;
}

function structureDescription(option: string) {
  if (option.includes("Problem") || option.includes("Need")) return "Open with the audience need, then resolve it with the product and proof.";
  if (option.includes("Mechanism")) return "Explain how it works first, then connect the science to approved evidence.";
  if (option.includes("Data") || option.includes("Evidence")) return "Lead with the strongest result and make its meaning easy to scan.";
  return "Introduce the product early, then build confidence with benefit and evidence.";
}

function stopAudioPreview() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

function playMusicTone(label: string) {
  const AudioContextConstructor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return;
  const context = new AudioContextConstructor();
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 2.1);
  gain.connect(context.destination);
  const base = label === "Uplifting" ? 392 : label === "Warm" ? 293.66 : 261.63;
  [1, 1.25, 1.5].forEach((ratio, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = index === 0 ? "sine" : "triangle";
    oscillator.frequency.value = base * ratio;
    oscillator.connect(gain);
    oscillator.start(context.currentTime + index * 0.12);
    oscillator.stop(context.currentTime + 2.15);
  });
  window.setTimeout(() => void context.close(), 2400);
}

function structureForTreatment(assetType: AssetType, treatmentId: string) {
  if (assetType === "video") return treatmentId === "presenter" ? "Presenter → Evidence → Close" : treatmentId === "visual-only" ? "Message → Visual proof → Action" : "Product → Proof";
  if (assetType === "carousel") return treatmentId === "data" ? "Data → Meaning → Action" : treatmentId === "story" ? "Need → Product → Proof" : "Evidence → Interpretation";
  if (assetType === "infographic") return treatmentId === "comparison" ? "Comparison" : treatmentId === "process" ? "Step-by-step process" : "Context → Evidence → Implication";
  return treatmentId === "product" ? "Product-first composition" : treatmentId === "evidence" ? "Evidence-first composition" : "Message-first composition";
}
