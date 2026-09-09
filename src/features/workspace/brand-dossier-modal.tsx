"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Box,
  Check,
  ChevronRight,
  Edit3,
  Lock,
  Search,
  Square,
  Target,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { ChipMultiSelect } from "@/components/patterns/chip-multi-select";
import { cn } from "@/lib/cn";
import type { Audience } from "@/types/content";
export {
  INITIAL_BRANDS,
  DOSSIERS,
  INITIAL_DISEASE_OPTIONS,
} from "@/features/workspace/brand-modal-data";
export type {
  BrandItem,
  DossierItem,
  OutputShape,
} from "@/features/workspace/brand-modal-data";
import {
  INITIAL_BRANDS,
  DOSSIERS,
  INITIAL_DISEASE_OPTIONS,
  INITIAL_HCP_SPECIALITIES,
  AUDIENCE_OPTIONS,
  TOPICS_BY_AUDIENCE,
  SHAPE_OPTIONS,
  GROUNDING_BY_AUDIENCE,
} from "@/features/workspace/brand-modal-data";
import type {
  BrandItem,
  DossierItem,
  OutputShape,
} from "@/features/workspace/brand-modal-data";

/**
 * Audience comes first because it decides what grounding is even offered —
 * asking for a brand before knowing who the asset is for meant the Brand /
 * Therapy Area toggle had to show both options to everyone, including the four
 * audiences for which therapy-area grounding makes no sense.
 */
type RevealStage = "audience" | "grounding" | "details";

interface BrandDossierModalProps {
  open: boolean;
  onClose: () => void;
  onSelectDossier?: (brandId: string, dossierId: string) => void;
}

export function BrandDossierModal({ open, onClose, onSelectDossier }: BrandDossierModalProps) {
  const assetType = useWorkspaceStore((s) => s.assetType);
  const setSourcePayload = useWorkspaceStore((s) => s.setSourcePayload);
  const setSourceType = useWorkspaceStore((s) => s.setSourceType);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);
  const setView = useWorkspaceStore((s) => s.setView);
  const setAudienceStore = useWorkspaceStore((s) => s.setAudience);
  const setFormatStore = useWorkspaceStore((s) => s.setFormat);
  const setPageShapeStore = useWorkspaceStore((s) => s.setPageShape);
  const setTopicsStore = useWorkspaceStore((s) => s.setTopics);
  const setProjectNameStore = useWorkspaceStore((s) => s.setProjectName);

  // Progressive Stage: "audience" -> "grounding" -> "details"
  const [stage, setStage] = useState<RevealStage>("audience");

  // 2. Grounding: Brand vs Therapy Area (Starts completely empty)
  const [sourceMode, setSourceMode] = useState<"brand" | "disease">("brand");
  const [brandSearch, setBrandSearch] = useState("");
  const [diseaseSearch, setDiseaseSearch] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [selectedDiseaseIds, setSelectedDiseaseIds] = useState<string[]>([]);
  const [customDiseases, setCustomDiseases] = useState<Array<{ id: string; label: string; desc: string }>>([]);
  const [customDiseaseInput, setCustomDiseaseInput] = useState("");
  const [showCustomDiseaseBox, setShowCustomDiseaseBox] = useState(false);

  // 1. Audience & Speciality
  const [audience, setAudience] = useState<Audience>("HCP");
  const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>([]);
  const [customSpecialities, setCustomSpecialities] = useState<string[]>([]);
  const [customSpecialityInput, setCustomSpecialityInput] = useState("");
  const [showCustomSpecialityBox, setShowCustomSpecialityBox] = useState(false);

  // 3. Format Shape (Landscape, Portrait, Square)
  const [selectedShape, setSelectedShape] = useState<OutputShape>("landscape");

  // 4. Focus Topics
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // Project name. Lives in the header rather than as a step: naming is not a
  // focus decision, and asking for one up front is asking before the user has
  // anything to name it after.
  const [projectName, setProjectNameLocal] = useState("");
  const [nameEdited, setNameEdited] = useState(false);
  const [editingName, setEditingName] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (open) {
      setStage("audience");
      setSourceMode("brand");
      setProjectNameLocal("");
      setNameEdited(false);
      setEditingName(false);
      setSelectedBrandId("");
      setSelectedDiseaseIds([]);
      setCustomDiseases([]);
      setCustomDiseaseInput("");
      setShowCustomDiseaseBox(false);
      setBrandSearch("");
      setDiseaseSearch("");
      setAudience("HCP");
      setSelectedSpecialities([]);
      setCustomSpecialities([]);
      setCustomSpecialityInput("");
      setShowCustomSpecialityBox(false);
      setSelectedShape("landscape");
      const def = TOPICS_BY_AUDIENCE["HCP"];
      setSelectedTopics([def[0].label, def[1].label]);
    }
  }, [open, assetType]);

  useEffect(() => {
    const topics = TOPICS_BY_AUDIENCE[audience];
    if (topics) setSelectedTopics([topics[0].label, topics[1].label]);
    setSelectedSpecialities([]);
    // Therapy-area grounding vanishes for brand-only audiences. Drop a
    // selection made under a previous audience rather than carrying an
    // impossible one forward — picking Patient, choosing two therapy areas,
    // then switching to HCP would otherwise start a project grounded in
    // something the audience cannot use.
    if (!(GROUNDING_BY_AUDIENCE[audience] ?? ["brand"]).includes("disease")) {
      setSourceMode("brand");
      setSelectedDiseaseIds([]);
      setDiseaseSearch("");
    }
  }, [audience]);

  const selectedBrand = useMemo(() => INITIAL_BRANDS.find((b) => b.id === selectedBrandId) || null, [selectedBrandId]);

  // Search-only. A real catalogue runs to a few thousand products, so an
  // unfiltered list is a scroll-bar, not a choice — nothing renders until
  // there is a query. Therapy areas stay browsable: that list is finite.
  const filteredBrands = useMemo(() => {
    const q = brandSearch.toLowerCase().trim();
    if (!q) return [];
    return INITIAL_BRANDS.filter((b) => b.name.toLowerCase().includes(q) || b.genericName.toLowerCase().includes(q) || b.therapyAreas.some((t) => t.toLowerCase().includes(q)));
  }, [brandSearch]);

  const allDiseases = useMemo(() => [...INITIAL_DISEASE_OPTIONS, ...customDiseases], [customDiseases]);

  const filteredDiseases = useMemo(() => {
    const q = diseaseSearch.toLowerCase().trim();
    if (!q) return allDiseases;
    return allDiseases.filter((d) => d.label.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q));
  }, [diseaseSearch, allDiseases]);

  const allSpecialities = useMemo(() => [...INITIAL_HCP_SPECIALITIES, ...customSpecialities], [customSpecialities]);

  const currentTopics = TOPICS_BY_AUDIENCE[audience] || TOPICS_BY_AUDIENCE.HCP;

  const audienceTitle = AUDIENCE_OPTIONS.find((a) => a.id === audience)?.title ?? "";
  const groundingModes = GROUNDING_BY_AUDIENCE[audience] ?? ["brand"];
  const canUseTherapyArea = groundingModes.includes("disease");

  /** What the project is grounded in, in one phrase, for the name and chips. */
  const groundingLabel = useMemo(() => {
    if (sourceMode === "brand") return selectedBrand?.name ?? "";
    if (selectedDiseaseIds.length === 0) return "";
    const first = allDiseases.find((d) => d.id === selectedDiseaseIds[0])?.label ?? "";
    return selectedDiseaseIds.length > 1 ? `${first} +${selectedDiseaseIds.length - 1}` : first;
  }, [sourceMode, selectedBrand, selectedDiseaseIds, allDiseases]);

  const suggestedName = useMemo(() => {
    if (!groundingLabel) return "";
    return `${groundingLabel} · ${audienceTitle} ${assetType === "infographic" ? "Creative" : "Video"}`;
  }, [groundingLabel, audienceTitle, assetType]);

  /**
   * Derived, not synced. Until the user types, the name IS the suggestion and
   * keeps following their choices; the moment they type, it is theirs and a
   * later change of audience or brand no longer rewrites it. Holding this in an
   * effect instead would mean a render where the two disagree.
   */
  const nameValue = nameEdited ? projectName : suggestedName;

  // Section 3 is REVEALED, not just answered. Two effects seed a default pair of
  // topics, and toggleTopic refuses to drop below one, so selectedTopics is
  // never empty — which meant this used to reduce to "a brand exists" and left
  // Start Project live while section 3 had never been opened.
  const hasReachedOutputShape = stage === "details";
  const canProceed =
    (sourceMode === "brand" ? !!selectedBrandId : selectedDiseaseIds.length > 0) &&
    hasReachedOutputShape &&
    selectedTopics.length > 0;

  const toggleTopic = (label: string) => {
    if (selectedTopics.includes(label)) {
      if (selectedTopics.length > 1) setSelectedTopics(selectedTopics.filter((t) => t !== label));
    } else {
      setSelectedTopics([...selectedTopics, label]);
    }
  };

  const toggleSpeciality = (spec: string) => {
    setSelectedSpecialities((prev) => prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]);
  };

  const toggleDisease = (diseaseId: string) => {
    setSelectedDiseaseIds((prev) =>
      prev.includes(diseaseId) ? prev.filter((id) => id !== diseaseId) : [...prev, diseaseId]
    );
  };

  const handleAddCustomDisease = () => {
    const trimmed = customDiseaseInput.trim();
    if (!trimmed) return;
    const newId = `custom-${Date.now()}`;
    const newEntry = { id: newId, label: trimmed, desc: "Custom Specified Area" };
    setCustomDiseases((prev) => [...prev, newEntry]);
    setSelectedDiseaseIds((prev) => [...prev, newId]);
    setCustomDiseaseInput("");
    setShowCustomDiseaseBox(false);
  };

  const handleAddCustomSpeciality = () => {
    const trimmed = customSpecialityInput.trim();
    if (!trimmed) return;
    setCustomSpecialities((prev) => [...prev, trimmed]);
    setSelectedSpecialities((prev) => [...prev, trimmed]);
    setCustomSpecialityInput("");
    setShowCustomSpecialityBox(false);
  };

  const handleSelectBrand = (brand: BrandItem) => {
    setSelectedBrandId(brand.id);
    setBrandSearch(brand.name);
    setStage("details");
  };

  const handleSelectAudience = (itemAudience: Audience) => {
    setAudience(itemAudience);
    // HCP holds the step open for the optional speciality chips; every other
    // audience has nothing left to answer here, so it moves on.
    if (itemAudience !== "HCP") {
      setStage("grounding");
    }
  };

  const handleStartProject = () => {
    setSourceType("dossier");
    if (sourceMode === "brand") {
      const primaryDossier = selectedBrand?.dossierIds?.[0] || selectedBrandId;
      setSourcePayload({ dossierId: primaryDossier });
      if (onSelectDossier && selectedBrandId) onSelectDossier(selectedBrandId, primaryDossier);
    } else {
      setSourcePayload({ dossierId: selectedDiseaseIds.join(",") });
    }
    setAudienceStore(audience);
    setTopicsStore(selectedTopics);
    setProjectNameStore(nameValue.trim() || suggestedName);
    
    // Map the 3 shapes to the target store format
    if (assetType === "infographic") {
      const pageShape = selectedShape === "portrait" ? "3:4" : selectedShape === "square" ? "3:4" : "16:9";
      setPageShapeStore(pageShape);
    } else {
      const format = selectedShape === "portrait" ? "9:16" : selectedShape === "square" ? "1:1" : "16:9";
      setFormatStore(format);
    }
    
    setView("create");
    setVideoSubStage("intake");
    onClose();
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-150"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, width: "100vw", height: "100vh" }}
      role="dialog" aria-modal="true"
    >
      <div className="relative flex min-h-[580px] max-h-[92vh] w-full max-w-[880px] flex-col rounded-card border border-hair-2 bg-card shadow-2xl overflow-hidden text-left">

        {/* ── Modal Header ── */}
        <div className="relative flex items-center justify-between overflow-hidden border-b border-hair-2 bg-canvas px-7 py-4 shrink-0">
          {/* Decorative organic wave texture — purely visual, sits behind the
              header content. Low-contrast coral/peach washes so the header
              reads as designed rather than a flat bar. */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full select-none"
            preserveAspectRatio="none"
            viewBox="0 0 880 84"
          >
            <path d="M0,54 C110,20 220,78 340,50 C460,22 560,72 660,46 C740,26 810,44 880,34 L880,84 L0,84 Z" fill="var(--tint)" opacity="0.55" />
            <path d="M0,64 C130,36 250,80 400,58 C520,40 620,74 740,54 C800,44 840,54 880,48 L880,84 L0,84 Z" fill="var(--tint-line)" opacity="0.4" />
            <path d="M0,74 C160,58 320,84 480,68 C600,56 700,78 880,62 L880,84 L0,84 Z" fill="var(--brand-2)" opacity="0.1" />
          </svg>

          {/* Handwritten script accent — a small human touch tucked in the
              header's quiet margin, echoing the homepage hero's own
              "From science to impact" annotation. */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-16 top-2.5 hidden select-none leading-none lg:block"
            style={{ fontFamily: "var(--font-script)", color: "var(--brand-deep)", transform: "rotate(-3deg)" }}
          >
            <span className="block" style={{ fontSize: 15 }}>Better conversations.</span>
            <span className="block" style={{ fontSize: 15 }}>Brighter outcomes.</span>
          </span>

          <div className="relative z-10 flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-control bg-tint text-brand-deep border border-tint-line shadow-2xs">
              <Plus className="size-4.5" strokeWidth={2.5} />
            </div>
            {/* Before there is anything to name it after, this is the modal's
                title. Once audience and grounding are answered it becomes the
                project's name — suggested, and editable in place, so naming
                never has to occupy a step of its own. */}
            <div className="min-w-0">
              {groundingLabel ? (
                <>
                  <p className="text-micro font-extrabold uppercase tracking-[.14em] text-ink-4 leading-none mb-1">
                    New {assetType === "infographic" ? "Creative" : "Video"} Project
                  </p>
                  {editingName ? (
                    <input
                      value={nameValue}
                      onChange={(e) => { setProjectNameLocal(e.target.value); setNameEdited(true); }}
                      onBlur={() => setEditingName(false)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "Escape") setEditingName(false);
                      }}
                      aria-label="Project name"
                      className="w-full max-w-[420px] rounded-control border border-brand bg-card px-2.5 py-1 text-title font-[850] text-ink tracking-tight focus:outline-none focus:ring-2 focus:ring-brand/15"
                      autoFocus
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingName(true)}
                      className="group flex items-center gap-2 text-left cursor-pointer max-w-full"
                      aria-label={`Rename project — currently ${nameValue}`}
                    >
                      <span className="text-title font-[850] text-ink tracking-tight truncate">
                        {nameValue}
                      </span>
                      <span className="grid size-6 shrink-0 place-items-center rounded-glyph text-ink-3 transition-colors group-hover:bg-tint group-hover:text-brand">
                        <Edit3 className="size-3.5" />
                      </span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-title font-[850] text-ink tracking-tight">
                    New {assetType === "infographic" ? "Creative / Infographic" : "Video"} Project
                  </h2>
                  <p className="text-body text-ink-3">
                    Answer each focus decision to configure your project.
                  </p>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="relative z-10 grid size-8 place-items-center rounded-full text-ink-3 hover:bg-black/5 hover:text-ink transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* ── Progressive Reveal Canvas ── */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-4">

          {/* ══════════════ 1. TARGET AUDIENCE ══════════════ */}
          <div className={cn(
            "rounded-panel border transition-all duration-200",
            stage === "audience"
              ? "border-brand/20 bg-[#f9faf9] shadow-xs p-5"
              : "border-hair bg-card hover:border-hair-3 p-3.5"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "grid size-6 place-items-center rounded-full text-label font-extrabold transition-colors",
                  stage !== "audience" ? "bg-ok-bg text-ok" : "bg-black/8 text-ink-3"
                )}>
                  {stage !== "audience" ? "✓" : "1"}
                </div>
                <span className="text-body-lg font-extrabold text-ink">
                  1. Target Audience
                </span>
                {stage !== "audience" && (
                  <span className="text-body font-semibold text-brand-deep bg-tint px-2.5 py-0.5 rounded-chip border border-tint-line ml-2">
                    {audienceTitle}
                    {audience === "HCP" && selectedSpecialities.length > 0 ? ` (${selectedSpecialities.join(", ")})` : ""}
                  </span>
                )}
              </div>

              {stage !== "audience" && (
                <button
                  type="button"
                  onClick={() => setStage("audience")}
                  className="flex items-center gap-1 text-label font-bold text-brand hover:underline cursor-pointer"
                >
                  <Edit3 className="size-3" />
                  <span>Change</span>
                </button>
              )}
            </div>

            {/* Expanded Body for Step 1 */}
            {stage === "audience" && (
              <div className="pt-4 space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                  {AUDIENCE_OPTIONS.map((item) => {
                    const isSel = audience === item.id;
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectAudience(item.id)}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-panel border text-center transition-all duration-200 cursor-pointer min-h-[128px] gap-2.5",
                          isSel
                            ? "border-brand bg-card ring-2 ring-brand/15 shadow-brand-soft -translate-y-0.5"
                            : "border-hair bg-card shadow-hair hover:-translate-y-0.5 hover:border-hair-3 hover:shadow-soft"
                        )}
                      >
                        <div
                          className={cn(
                            "grid size-12 place-items-center rounded-control shrink-0 transition-all duration-200",
                            isSel ? "bg-brand text-white shadow-brand-lift" : "bg-tint text-brand-deep"
                          )}
                        >
                          <IconComp className="size-6" />
                        </div>
                        <div className="text-body-lg font-[850] text-ink leading-none">{item.title}</div>
                        <div className="text-label text-ink-3 leading-none">{item.subtitle}</div>
                      </button>
                    );
                  })}
                </div>

                {/* ── Direct 1-Click Doctor Speciality Chips + "Other" ── */}
                {audience === "HCP" && (
                  <div className="pt-3 border-t border-hair-2/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-label font-bold text-ink-2">
                        Doctor Speciality (Optional):
                      </span>
                      {selectedSpecialities.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedSpecialities([])}
                          className="text-caption font-semibold text-ink-4 hover:text-ink-2 cursor-pointer"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    <ChipMultiSelect
                      size="sm"
                      options={allSpecialities.map((spec) => ({ id: spec, label: spec }))}
                      selected={selectedSpecialities}
                      onToggle={toggleSpeciality}
                      otherLabel="Other"
                      otherOpen={showCustomSpecialityBox}
                      onToggleOther={() => setShowCustomSpecialityBox(!showCustomSpecialityBox)}
                      customValue={customSpecialityInput}
                      onCustomChange={setCustomSpecialityInput}
                      onCustomSubmit={handleAddCustomSpeciality}
                      customPlaceholder="Type custom doctor speciality (e.g. Hematologist, Pathologist)..."
                      addLabel="Add"
                    />

                    <div className="flex justify-end pt-1">
                      <Button size="sm" variant="primary" onClick={() => setStage("grounding")} className="h-7.5 text-label font-bold px-4 cursor-pointer shadow-sm">
                        <span>Continue to Grounding</span>
                        <ChevronRight className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ══════════════ 2. CLINICAL GROUNDING ══════════════ */}
          {stage === "audience" ? (
            <div className="rounded-panel border border-dashed border-hair-2 bg-canvas p-3.5 flex items-center justify-between opacity-60">
              <div className="flex items-center gap-2.5">
                <div className="grid size-6 place-items-center rounded-full bg-black/5 text-label font-bold text-ink-3">
                  2
                </div>
                <span className="text-body font-bold text-ink-3">
                  2. Clinical Grounding
                </span>
              </div>
              <span className="text-label text-ink-3 flex items-center gap-1">
                <Lock className="size-3" /> Select audience first
              </span>
            </div>
          ) : (
            <div className={cn(
              "rounded-panel border transition-all duration-200",
              stage === "grounding"
                ? "border-brand/20 bg-[#f9faf9] shadow-xs p-5"
                : "border-hair bg-card hover:border-hair-3 p-3.5"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "grid size-6 place-items-center rounded-full text-label font-extrabold transition-colors",
                    stage === "details" && groundingLabel ? "bg-ok-bg text-ok" : "bg-black/8 text-ink-3"
                  )}>
                    {stage === "details" && groundingLabel ? "✓" : "2"}
                  </div>
                  <span className="text-body-lg font-extrabold text-ink">
                    2. Clinical Grounding
                  </span>
                  {stage !== "grounding" && groundingLabel && (
                    <span className="text-body font-semibold text-brand-deep bg-tint px-2.5 py-0.5 rounded-chip border border-tint-line ml-2">
                      {sourceMode === "brand"
                        ? groundingLabel
                        : `${selectedDiseaseIds.length} Therapy Area${selectedDiseaseIds.length > 1 ? "s" : ""}: ${selectedDiseaseIds.map((id) => allDiseases.find((d) => d.id === id)?.label).filter(Boolean).join(", ")}`}
                    </span>
                  )}
                </div>

                {stage !== "grounding" ? (
                  <button
                    type="button"
                    onClick={() => setStage("grounding")}
                    className="flex items-center gap-1 text-label font-bold text-brand hover:underline cursor-pointer"
                  >
                    <Edit3 className="size-3" />
                    <span>Change</span>
                  </button>
                ) : canUseTherapyArea ? (
                  /* The toggle appears only where both grounds are real. For the
                     four brand-only audiences there is nothing to choose, so no
                     control is drawn at all. */
                  <div className="inline-flex rounded-chip border border-hair bg-card p-1 gap-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => { setSourceMode("brand"); setSelectedDiseaseIds([]); setDiseaseSearch(""); }}
                      className={cn("px-2.5 py-0.5 rounded-glyph text-label font-bold transition-all cursor-pointer", sourceMode === "brand" ? "bg-brand text-white" : "text-ink-3 hover:text-ink")}
                    >
                      Brand
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSourceMode("disease"); setSelectedBrandId(""); setBrandSearch(""); }}
                      className={cn("px-2.5 py-0.5 rounded-glyph text-label font-bold transition-all cursor-pointer", sourceMode === "disease" ? "bg-brand text-white" : "text-ink-3 hover:text-ink")}
                    >
                      Therapy Area
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Expanded Body for Step 2 */}
              {stage === "grounding" && (
                <div className="pt-4 space-y-3 animate-in fade-in duration-150">
                  {!canUseTherapyArea && (
                    <p className="text-label text-ink-3">
                      {audienceTitle} assets are always grounded in a specific product.
                    </p>
                  )}

                  {sourceMode === "brand" ? (
                    <div className="space-y-3">
                      <div className="relative flex items-center">
                        <Search className="absolute left-3.5 size-4 text-ink-4" />
                        <input
                          type="text"
                          value={brandSearch}
                          onChange={(e) => { setBrandSearch(e.target.value); }}
                          placeholder="Search brand name or molecule (e.g. Velmora, Onkavia, Nirvexa)..."
                          className="w-full rounded-control border border-hair-2 bg-card pl-10 pr-4 py-2.5 text-body-lg font-medium text-ink-2 placeholder:text-ink-4 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 shadow-2xs transition-all"
                          autoFocus
                        />
                      </div>

                      {/* Nothing until there is a query — see filteredBrands. */}
                      {!brandSearch.trim() ? (
                        <div className="rounded-panel border border-dashed border-hair-2 bg-card px-4 py-6 text-center">
                          <p className="text-body font-bold text-ink-2">Start typing to find a product</p>
                          <p className="text-label text-ink-4 mt-0.5">
                            Search your full catalogue by brand name, molecule or therapy area.
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-panel border border-hair-2/90 bg-card shadow-2xs divide-y divide-hair max-h-[220px] overflow-y-auto">
                          {filteredBrands.map((brand) => {
                            const isSel = brand.id === selectedBrandId;
                            return (
                              <button
                                key={brand.id}
                                type="button"
                                onClick={() => handleSelectBrand(brand)}
                                className={cn(
                                  "flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors cursor-pointer",
                                  isSel ? "bg-tint text-brand-deep font-bold" : "hover:bg-subtle text-ink-2"
                                )}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={cn("grid size-7 place-items-center rounded-chip text-caption font-black border shrink-0", isSel ? "bg-brand text-white border-brand" : "bg-subtle text-ink-2 border-hair-2")}>
                                    {brand.name.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-body font-bold">{brand.name}</div>
                                    <div className="text-label text-ink-3 italic truncate">{brand.genericName} · {brand.therapyAreas.join(", ")}</div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                  {brand.hasDossier && (
                                    <span className="text-caption font-bold text-ok bg-ok-bg px-2 py-0.5 rounded-chip border border-ok-line">
                                      Dossier Ready
                                    </span>
                                  )}
                                  <span className="text-label font-bold text-brand flex items-center gap-0.5">
                                    Select <ChevronRight className="size-3" />
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                          {filteredBrands.length === 0 && (
                            <div className="py-6 text-center text-body text-ink-4">
                              No brands matching &quot;{brandSearch}&quot;
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative flex items-center">
                        <Search className="absolute left-3.5 size-4 text-ink-4" />
                        <input
                          type="text"
                          value={diseaseSearch}
                          onChange={(e) => setDiseaseSearch(e.target.value)}
                          placeholder="Search therapy areas (e.g. Dermatology, Oncology, Cardiology)..."
                          className="w-full rounded-control border border-hair-2 bg-card pl-10 pr-4 py-2.5 text-body-lg font-medium text-ink-2 placeholder:text-ink-4 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 shadow-2xs transition-all"
                          autoFocus
                        />
                      </div>

                      <ChipMultiSelect
                        size="md"
                        rowClassName="max-h-[170px] overflow-y-auto p-1"
                        options={filteredDiseases}
                        selected={selectedDiseaseIds}
                        onToggle={toggleDisease}
                        otherLabel="Other (Specify)"
                        otherOpen={showCustomDiseaseBox}
                        onToggleOther={() => setShowCustomDiseaseBox(!showCustomDiseaseBox)}
                        customValue={customDiseaseInput}
                        onCustomChange={setCustomDiseaseInput}
                        onCustomSubmit={handleAddCustomDisease}
                        customPlaceholder="Type custom therapy or disease area (e.g. Rare Diseases, Ophthalmology)..."
                        addLabel="Add Area"
                      />

                      {selectedDiseaseIds.length > 0 && (
                        <div className="flex items-center justify-between pt-2 border-t border-hair">
                          <span className="text-label font-bold text-ink-3">
                            {selectedDiseaseIds.length} therapy area{selectedDiseaseIds.length > 1 ? "s" : ""} selected
                          </span>
                          <Button size="sm" variant="primary" onClick={() => setStage("details")} className="h-7.5 text-label font-bold px-4 cursor-pointer shadow-sm">
                            <span>Confirm &amp; Next</span>
                            <ChevronRight className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════ 3 & 4: OUTPUT SIZE + CLINICAL FOCUS TOPICS ══════════════ */}
          {stage !== "details" ? (
            <div className="rounded-panel border border-dashed border-hair-2 bg-canvas p-3.5 flex items-center justify-between opacity-60">
              <div className="flex items-center gap-2.5">
                <div className="grid size-6 place-items-center rounded-full bg-black/5 text-label font-bold text-ink-3">
                  3
                </div>
                <span className="text-body font-bold text-ink-3">
                  3. Output Shape &amp; Clinical Focus Topics
                </span>
              </div>
              <span className="text-label text-ink-3 flex items-center gap-1">
                <Lock className="size-3" />{" "}
                {stage === "audience" ? "Confirm audience first" : "Select grounding first"}
              </span>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* 3. Output Shape (ONLY 3: Landscape, Portrait, Square with Clean Geometric Icons) */}
              <div className="rounded-panel border border-hair bg-card p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid size-5.5 place-items-center rounded-full bg-tint text-brand-deep text-caption font-extrabold">
                      3
                    </div>
                    <span className="text-body font-extrabold text-ink">
                      Output Shape
                    </span>
                  </div>
                  <span className="text-label font-bold text-ok bg-ok-bg px-2.5 py-0.5 rounded-chip border border-ok-line">
                    {SHAPE_OPTIONS.find((s) => s.id === selectedShape)?.label}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {SHAPE_OPTIONS.map((opt) => {
                    const isSel = selectedShape === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedShape(opt.id)}
                        className={cn(
                          "flex items-center justify-center gap-2.5 py-3 px-4 rounded-control border transition-all cursor-pointer shadow-2xs",
                          isSel
                            ? "border-brand bg-tint text-brand-deep font-extrabold shadow-2xs ring-2 ring-brand/15"
                            : "border-hair bg-card hover:border-hair-3 text-ink"
                        )}
                      >
                        {opt.renderIcon(isSel)}
                        <span className="text-body-lg font-bold">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Clinical Focus Topics (Audience-tailored Hero Cards) */}
              <div className="rounded-panel border border-hair bg-card p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid size-5.5 place-items-center rounded-full bg-tint text-brand-deep text-caption font-extrabold">
                      4
                    </div>
                    <div>
                      <h3 className="text-body-lg font-extrabold text-ink">
                        Clinical Focus Topics
                      </h3>
                      <p className="text-label text-ink-3">
                        Select 1 to 3 story pillars (tailored for {AUDIENCE_OPTIONS.find((a) => a.id === audience)?.title}).
                      </p>
                    </div>
                  </div>
                  <span className="text-label font-bold text-brand-deep bg-tint px-2.5 py-0.5 rounded-chip border border-tint-line shrink-0">
                    {selectedTopics.length} Selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                  {currentTopics.map((top) => {
                    const isSel = selectedTopics.includes(top.label);
                    const IconComp = top.icon;
                    return (
                      <button
                        key={top.id}
                        type="button"
                        onClick={() => toggleTopic(top.label)}
                        className={cn(
                          "group relative flex flex-col justify-between p-3.5 rounded-control border text-left transition-all duration-150 cursor-pointer shadow-2xs min-h-[92px]",
                          isSel
                            ? "border-brand bg-[#f3f9f5] ring-2 ring-brand/15 shadow-sm"
                            : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
                        )}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className={cn("grid size-6 place-items-center rounded-glyph transition-colors shrink-0", isSel ? "bg-brand text-white shadow-2xs" : "bg-tint text-brand-deep group-hover:bg-brand group-hover:text-white")}>
                              <IconComp className="size-3" />
                            </div>
                            <div className={cn("size-3.5 rounded-full border flex items-center justify-center transition-colors shrink-0", isSel ? "border-brand bg-brand text-white" : "border-hair-3 bg-card")}>
                              {isSel && <Check className="size-2 stroke-[3]" />}
                            </div>
                          </div>
                          <div>
                            <div className="text-body font-bold text-ink leading-snug">{top.label}</div>
                            <div className="text-caption text-ink-3 mt-0.5 leading-snug line-clamp-2">{top.detail}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-hair-2 bg-canvas px-7 py-4 shrink-0">
          {/* Reads in the order the steps now run. */}
          <div className="flex flex-wrap items-center gap-1.5 text-body text-ink-3">
            <span className="font-bold text-ink">{audienceTitle}</span>
            {audience === "HCP" && selectedSpecialities.length > 0 && (
              <span>({selectedSpecialities.join(", ")})</span>
            )}
            <span>·</span>
            <span className={cn(groundingLabel ? "font-bold text-ink" : "text-ink-4")}>
              {sourceMode === "brand"
                ? selectedBrand?.name ?? "No brand selected"
                : selectedDiseaseIds.length > 0
                ? selectedDiseaseIds.map((id) => allDiseases.find((d) => d.id === id)?.label).filter(Boolean).join(", ")
                : "No therapy area selected"}
            </span>
            {stage === "details" && (
              <>
                <span>·</span>
                <span>{SHAPE_OPTIONS.find((s) => s.id === selectedShape)?.label}</span>
                <span>·</span>
                <span className="font-bold text-brand-deep">{selectedTopics.length} Topics</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button variant="secondary" size="sm" onClick={onClose} className="px-4 cursor-pointer font-bold text-body">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!canProceed}
              onClick={handleStartProject}
              className="gap-2 font-bold px-6 shadow-sm cursor-pointer disabled:opacity-40 text-body"
            >
              <span>Start Project</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

