"use client";

import { PickChip, PickEmpty, PickList, PickRow, PickSearch } from "@/components/patterns/pick-list";
import { useState, useMemo, useEffect, useRef } from "react";
import { PlacementPicker } from "@/features/workspace/placement-picker";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Box,
  Check,
  ChevronRight,
  Edit3,
  Lock,
  Search,
  Target,
  X,
  FileImage,
  Video,
  Megaphone,
  Info,
  ShieldAlert,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { ChipMultiSelect } from "@/components/patterns/chip-multi-select";
import { cn } from "@/lib/cn";
import { useBrandCatalogue, filterBrands } from "@/features/workspace/brand-catalogue";
import { BRAND_VARIATIONS } from "@/features/workspace/workspace-assets";
import { ProductArtwork } from "@/features/product-library/product-artwork";
import { variationLabelsFor } from "@/features/product-library/mock-product-detail";
import type { Audience } from "@/types/content";
import {
  AD_AUDIENCES,
  AD_KIND_PRESETS,
  AD_PLACEMENTS,
  adSamplePrompts,
  brandAdFacts,
  placementsFromMediaPlan,
  promptKindFor,
  type AdPlacement,
  type AdType,
} from "@/features/workspace/ad-options";
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
  DOSSIERS,
  INITIAL_DISEASE_OPTIONS,
  INITIAL_HCP_SPECIALITIES,
  AUDIENCE_OPTIONS,
  TOPICS_BY_AUDIENCE,
  GROUNDING_BY_AUDIENCE,
} from "@/features/workspace/brand-modal-data";
import type {
  BrandItem,
  DossierItem,
} from "@/features/workspace/brand-modal-data";

/**
 * Audience comes first because it decides what grounding is even offered —
 * asking for a brand before knowing who the asset is for meant the Brand /
 * Therapy Area toggle had to show both options to everyone, including the four
 * audiences for which therapy-area grounding makes no sense.
 */
type RevealStage = "audience" | "grounding" | "details";

/** The chip that means "no narrowing", kept out of the real variant names. */
const ALL_VARIANTS = "__all__";

/** The brand's packshot at thumbnail size — the Product Library's own
 *  photography, so a row here looks like the row there. */
function BrandThumb({ brand, className }: { brand: BrandItem; className?: string }) {
  if (brand.type) {
    return (
      <ProductArtwork
        kind={brand.type}
        variant="icon"
        photoUrl={brand.referenceImageUrl}
        className={cn("overflow-hidden rounded-chip border border-hair-2", className)}
      />
    );
  }
  return (
    <div className={cn("grid place-items-center rounded-chip border border-hair-2 bg-subtle text-caption font-black text-ink-2", className)}>
      {brand.name.slice(0, 2).toUpperCase()}
    </div>
  );
}

/**
 * The brand you picked, as a tile.
 *
 * It was a highlighted row in the result list, which read as "still choosing"
 * — the same strip as the four you did not pick. A choice that has been made
 * deserves to look like an object: the packshot, the molecule, what it treats.
 */
function SelectedBrandTile({ brand, onChange }: { brand: BrandItem; onChange: () => void }) {
  return (
    <div className="group flex items-stretch gap-3.5 rounded-panel border border-brand/30 bg-card p-3 shadow-2xs ring-2 ring-brand/10 animate-in fade-in slide-in-from-top-1 duration-200">
      <div
        className="relative grid size-[84px] shrink-0 place-items-center overflow-hidden rounded-control"
        style={{ background: brand.gradient ?? "linear-gradient(150deg,var(--brand-deep),var(--brand) 55%,#ffb38a)" }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(155deg,rgba(255,255,255,.34),transparent 45%)" }}
        />
        {brand.type ? (
          <ProductArtwork
            kind={brand.type}
            photoUrl={brand.referenceImageUrl}
            className="relative h-[80%] w-[80%] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="relative text-body-lg font-black text-white">{brand.name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-body-lg font-extrabold text-ink">{brand.name}</span>
          <span className="shrink-0 rounded-chip border border-ok-line bg-ok-bg px-2 py-0.5 text-caption font-bold text-ok">
            Verified
          </span>
        </div>
        <span className="truncate text-label italic text-ink-3">{brand.genericName}</span>
        {brand.therapyAreas.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {brand.therapyAreas.map((area) => (
              <span
                key={area}
                className="rounded-chip border border-hair-2 bg-subtle px-2 py-0.5 text-caption font-semibold text-ink-3"
              >
                {area}
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onChange}
        className="flex h-fit shrink-0 cursor-pointer items-center gap-1 text-label font-bold text-brand hover:underline"
      >
        <Edit3 className="size-3" />
        <span>Change</span>
      </button>
    </div>
  );
}

/**
 * What the label says about this brand's ads, shown under the brand.
 *
 * A reminder ad for a drug with a boxed warning is not allowed at all, so
 * that blocks the step with the fix beside it. The rest are things the
 * marketer should know now rather than at MLR.
 */
function AdLabelChecks({
  brandName,
  adKind,
  adType,
  facts,
  indication,
  onIndication,
  onMakeProductClaim,
}: {
  brandName: string;
  adKind: string;
  adType: AdType;
  facts: ReturnType<typeof brandAdFacts>;
  indication: string;
  onIndication: (label: string) => void;
  onMakeProductClaim: () => void;
}) {
  return (
    <div className="space-y-2.5">
      {adType === "reminder" && facts.boxedWarning && (
        <div className="flex items-start gap-2.5 rounded-control border border-danger-line bg-danger-bg p-3">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-danger" />
          <div className="min-w-0 flex-1">
            <p className="text-body font-bold text-ink">Reminder ads aren&apos;t allowed for {brandName}</p>
            <p className="text-label text-ink-2">
              {brandName} carries a boxed warning, so every ad must include its claims and safety information.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={onMakeProductClaim} className="h-7.5 shrink-0 text-label font-bold">
            Make them branded ads
          </Button>
        </div>
      )}

      {adType === "unbranded" && (
        <div className="flex items-start gap-2.5 rounded-control border border-hair-2 bg-subtle p-3">
          <Info className="mt-0.5 size-4 shrink-0 text-ink-3" />
          <p className="text-label text-ink-2">
            {brandName} sets the condition. It won&apos;t be named or shown in the ads, and they will look different from the brand.
          </p>
        </div>
      )}

      {adKind === "savings" && facts.genericAvailable && (
        <div className="flex items-start gap-2.5 rounded-control border border-warn-line bg-warn-bg p-3">
          <Info className="mt-0.5 size-4 shrink-0 text-warn" />
          <p className="text-label text-ink-2">
            A generic of {brandName} is available. California limits copay coupons when a cheaper generic exists, so the plan will flag California placements.
          </p>
        </div>
      )}

      {adKind === "new-indication" && (
        <div className="space-y-2">
          <span className="text-label font-bold text-ink-2">Which indication are these ads about?</span>
          <div className="grid gap-2">
            {facts.indications.map((option) => {
              const isSel = indication === option.label;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => onIndication(option.label)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-control border p-2.5 text-left transition cursor-pointer",
                    isSel ? "border-brand bg-tint ring-2 ring-brand/15" : "border-hair-2 bg-card hover:border-hair-3"
                  )}
                >
                  <span className={cn("size-4 shrink-0 rounded-full border", isSel ? "border-[5px] border-brand" : "border-hair-3")} />
                  <span className="min-w-0 flex-1 text-body font-semibold text-ink">{option.label}</span>
                  {option.isNew && (
                    <span className="shrink-0 rounded-chip border border-ok-line bg-ok-bg px-2 py-0.5 text-caption font-bold text-ok">
                      Newly approved
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-caption text-ink-4">Only indications in the current label are listed.</p>
        </div>
      )}
    </div>
  );
}

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
  const setVariationsStore = useWorkspaceStore((s) => s.setVariations);
  const adKind = useWorkspaceStore((s) => s.adKind);
  const isAd = assetType === "ad";
  const adPreset = AD_KIND_PRESETS[adKind];

  // Progressive Stage: "audience" -> "grounding" -> "details"
  const [stage, setStage] = useState<RevealStage>("audience");

  // 2. Grounding: Brand vs Therapy Area (Starts completely empty)
  const [sourceMode, setSourceMode] = useState<"brand" | "disease">("brand");
  const [brandSearch, setBrandSearch] = useState("");
  const [diseaseSearch, setDiseaseSearch] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  /**
   * Which presentations of the brand the project covers.
   *
   * Empty is not "none chosen" — it is All, the state the step opens in. A
   * project is usually about the whole product, and making people tick four
   * boxes to say so would be a worse default than the one answer that is
   * right most of the time.
   */
  const [selectedVariations, setSelectedVariations] = useState<string[]>([]);
  const [selectedDiseaseIds, setSelectedDiseaseIds] = useState<string[]>([]);
  const [customDiseases, setCustomDiseases] = useState<Array<{ id: string; label: string; desc: string }>>([]);
  const [customDiseaseInput, setCustomDiseaseInput] = useState("");
  const [showCustomDiseaseBox, setShowCustomDiseaseBox] = useState(false);

  // 1. Audience & Speciality. Nothing is chosen until the user chooses it.
  const [audience, setAudience] = useState<Audience | null>(null);
  const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>([]);

  // 4. Focus Topics
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  /* Ads only. Step 3 asks where the ads run instead of which topics they
     cover: an ad carries one message, and the placements decide every size,
     length, format and how the safety information fits. */
  const [adPlacements, setAdPlacements] = useState<AdPlacement[]>([]);
  /* The media agency's plan, when there is one: it already names the
     placements, so reading it beats ticking them again. */
  const [mediaPlanName, setMediaPlanName] = useState("");
  const mediaPlanInputRef = useRef<HTMLInputElement>(null);
  const [adType, setAdType] = useState<AdType>("product-claim");
  const [adIndication, setAdIndication] = useState("");

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
      setSelectedVariations([]);
      setSelectedDiseaseIds([]);
      setCustomDiseases([]);
      setCustomDiseaseInput("");
      setShowCustomDiseaseBox(false);
      setBrandSearch("");
      setDiseaseSearch("");
      /* Every project starts blank: no audience, topics or placements are
         picked for the user. The tile only sets the kind of ad. */
      setAudience(null);
      setSelectedSpecialities([]);
      setSelectedTopics([]);
      if (isAd) {
        setAdPlacements([]);
        setMediaPlanName("");
        setAdType(adPreset.adType);
        setAdIndication("");
      }
    }
  }, [open, assetType, isAd, adPreset.adType]);

  useEffect(() => {
    if (!audience) return;
    /* Topics belong to an audience, so a new audience clears them rather than picking new ones. */
    setSelectedTopics([]);
    setSelectedSpecialities([]);
    /* TikTok and CTV cannot reach doctors, HCP networks cannot reach patients. */
    /* Keeps only what this audience can reach; never picks placements for them. */
    setAdPlacements((prev) => prev.filter((id) => AD_PLACEMENTS.find((p) => p.id === id)?.audiences.includes(audience)));
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

  const brandCatalogue = useBrandCatalogue();
  const selectedBrand = useMemo(
    () => brandCatalogue.find((b) => b.id === selectedBrandId) || null,
    [brandCatalogue, selectedBrandId]
  );

  /**
   * The presentations this brand actually ships in.
   *
   * The Product Library already knows them — a tablet comes in strips and a
   * bottle, a device in a pen and a refill — so asking here with a generic
   * list would have offered an autoinjector pen for an oral antihypertensive.
   */
  const variationOptions = useMemo(
    () => (selectedBrand?.type ? variationLabelsFor(selectedBrand.type) : BRAND_VARIATIONS),
    [selectedBrand]
  );

  // Search-only. A real catalogue runs to a few thousand products, so an
  // unfiltered list is a scroll-bar, not a choice — nothing renders until
  // there is a query. Therapy areas stay browsable: that list is finite.
  /**
   * Verified only.
   *
   * An unverified brand could never be picked here — it has no approved
   * source for a claim to trace back to, so every row was disabled. Listing
   * rows you cannot choose, above a button that adds another one you cannot
   * choose, made the step look like it was refusing you. A brand becomes
   * selectable by being verified in the Product Library, which is where that
   * work belongs.
   */
  const filteredBrands = useMemo(
    () => filterBrands(brandCatalogue, brandSearch).filter((b) => b.hasDossier),
    [brandCatalogue, brandSearch]
  );

  const allDiseases = useMemo(() => [...INITIAL_DISEASE_OPTIONS, ...customDiseases], [customDiseases]);

  const filteredDiseases = useMemo(() => {
    const q = diseaseSearch.toLowerCase().trim();
    if (!q) return allDiseases;
    return allDiseases.filter((d) => d.label.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q));
  }, [diseaseSearch, allDiseases]);

  const allSpecialities = INITIAL_HCP_SPECIALITIES;

  const currentTopics = (audience && TOPICS_BY_AUDIENCE[audience]) || TOPICS_BY_AUDIENCE.HCP;

  /* Ads reach patients and HCPs. Trade and market-access audiences are
     reached through dossiers and portals, not ad accounts. */
  const audienceOptions = isAd ? AUDIENCE_OPTIONS.filter((a) => AD_AUDIENCES.includes(a.id)) : AUDIENCE_OPTIONS;
  const audienceTitle = AUDIENCE_OPTIONS.find((a) => a.id === audience)?.title ?? "";
  const studioNoun = isAd ? "Ads" : assetType === "infographic" ? "Creative" : "Video";
  const groundingModes = (audience && GROUNDING_BY_AUDIENCE[audience]) || ["brand"];
  /**
   * Therapy-area grounding is hidden for now — every audience grounds in a
   * brand. The toggle, the disease picker and the mode they switch between
   * are all still here and still work; this one flag is what turns them back
   * on. Flipping it to groundingModes.includes("disease") restores the
   * original behaviour for the audiences that allow it.
   */
  const canUseTherapyArea = false;
  void groundingModes;

  /** What the project is grounded in, in one phrase, for the name and chips. */
  const groundingLabel = useMemo(() => {
    if (sourceMode === "brand") return selectedBrand?.name ?? "";
    if (selectedDiseaseIds.length === 0) return "";
    const first = allDiseases.find((d) => d.id === selectedDiseaseIds[0])?.label ?? "";
    return selectedDiseaseIds.length > 1 ? `${first} +${selectedDiseaseIds.length - 1}` : first;
  }, [sourceMode, selectedBrand, selectedDiseaseIds, allDiseases]);

  const suggestedName = useMemo(() => {
    if (!groundingLabel) return "";
    /* The tile's name, unless the kind of ad changed away from it. */
    if (isAd) {
      const keepsTileName = adPreset.id !== "scratch" && adType === adPreset.adType;
      return `${groundingLabel} · ${keepsTileName ? adPreset.noun : `${audienceTitle} Ads`}`;
    }
    return `${groundingLabel} · ${audienceTitle} ${studioNoun}`;
  }, [groundingLabel, audienceTitle, studioNoun, isAd, adPreset, adType]);

  /* What the label allows, checked the moment the brand is picked rather
     than discovered at MLR. */
  const adFacts = brandAdFacts(selectedBrandId);
  const reminderBlocked = isAd && adType === "reminder" && adFacts.boxedWarning;
  const needsIndication = isAd && adKind === "new-indication";
  const brandStepBlocked = reminderBlocked || (needsIndication && !adIndication);

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
  const hasReachedFocusTopics = stage === "details";
  const canProceed =
    !!audience &&
    (sourceMode === "brand" ? !!selectedBrandId : selectedDiseaseIds.length > 0) &&
    hasReachedFocusTopics &&
    (isAd ? adPlacements.length > 0 && !brandStepBlocked : selectedTopics.length > 0);

  const toggleAdPlacement = (id: AdPlacement) =>
    setAdPlacements((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  const toggleTopic = (label: string) => {
    if (selectedTopics.includes(label)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== label));
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

  /**
   * Picking the brand no longer closes the step — the variations belong to the
   * brand, so they cannot be asked before it and do not deserve a step of
   * their own. The step stays open on All until Continue.
   */
  const handleSelectBrand = (brand: BrandItem) => {
    setSelectedBrandId(brand.id);
    setBrandSearch(brand.name);
    setSelectedVariations([]);
    /* The newest indication is usually the reason for a new-indication campaign. */
    setAdIndication(brandAdFacts(brand.id).indications.find((i) => i.isNew)?.label ?? "");
  };

  /**
   * One click reads as "this one", not "one more" — so a click from All
   * narrows to that single variation, and only a click made while already
   * narrowed adds to the set. Clearing the last one falls back to All rather
   * than leaving the project grounded in nothing.
   */
  const toggleVariation = (variation: string) => {
    setSelectedVariations((prev) =>
      prev.includes(variation) ? prev.filter((v) => v !== variation) : [...prev, variation]
    );
  };

  const variationLabel =
    selectedVariations.length === 0 || selectedVariations.length === variationOptions.length
      ? "All variants"
      : selectedVariations.join(", ");

  const handleSelectAudience = (itemAudience: Audience) => {
    setAudience(itemAudience);
    // HCP holds the step open for the optional speciality chips; every other
    // audience has nothing left to answer here, so it moves on.
    if (itemAudience !== "HCP") {
      setStage("grounding");
    }
  };

  const handleStartProject = () => {
    /* Start Project is only enabled once an audience is picked. */
    if (!audience) return;
    // A fresh project walks the flow, whatever the last thing opened was — the
    // Content Library sets this to "review" and nothing else would clear it.
    useWorkspaceStore.getState().setStudioEntry("create");
    setSourceType("dossier");
    if (sourceMode === "brand") {
      const primaryDossier = selectedBrand?.dossierIds?.[0] || selectedBrandId;
      setSourcePayload({ dossierId: primaryDossier });
      if (onSelectDossier && selectedBrandId) onSelectDossier(selectedBrandId, primaryDossier);
    } else {
      setSourcePayload({ dossierId: selectedDiseaseIds.join(",") });
    }
    setAudienceStore(audience);
    /* Kept, so the plan's Specialty row starts where the modal left it. */
    useWorkspaceStore.getState().setSpecialities(audience === "HCP" ? selectedSpecialities : []);
    setTopicsStore(selectedTopics);
    // Stored as a concrete list either way, so everything downstream asks
    // about this brand's presentations rather than a generic set.
    setVariationsStore(selectedVariations.length > 0 ? selectedVariations : variationOptions);
    setProjectNameStore(nameValue.trim() || suggestedName);
    
    /**
     * Portrait, until somebody says otherwise.
     *
     * Shape is not a decision that has to be made before the project exists —
     * it is visible and changeable on the brief, and the intake asks about it
     * again. Asking here only added a step to a screen that should be about
     * what the asset is, not how tall it is.
     */
    if (isAd) {
      const store = useWorkspaceStore.getState();
      store.setAdType(adType);
      store.setAdPlacements(adPlacements);
      setTopicsStore(needsIndication ? [adIndication] : []);
      store.setBrief(adSamplePrompts(promptKindFor(adKind, adType, audience), selectedBrand?.name ?? groundingLabel)[0].prompt);
    } else if (assetType === "infographic") {
      setPageShapeStore("3:4");
    } else {
      setFormatStore("9:16");
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
            {/* What is being made, not a generic "new thing" plus — the same
                glyph the sidebar uses for this studio, so the modal says which
                one you are in before you have read a word of it. */}
            <div className="grid size-9 place-items-center rounded-control bg-tint text-brand-deep border border-tint-line shadow-2xs">
              {isAd ? (
                <Megaphone className="size-4.5" strokeWidth={1.9} />
              ) : assetType === "infographic" ? (
                <FileImage className="size-4.5" strokeWidth={1.9} />
              ) : (
                <Video className="size-4.5" strokeWidth={1.9} />
              )}
            </div>
            {/* Before there is anything to name it after, this is the modal's
                title. Once audience and grounding are answered it becomes the
                project's name — suggested, and editable in place, so naming
                never has to occupy a step of its own. */}
            <div className="min-w-0">
              {groundingLabel ? (
                <>
                  <p className="text-micro font-extrabold uppercase tracking-[.14em] text-ink-4 leading-none mb-1">
                    New {studioNoun} Project
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
                      aria-label={`Rename project, currently ${nameValue}`}
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
                    New {isAd ? "Ads" : assetType === "infographic" ? "Creative / Infographic" : "Video"} Project
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
                  Target Audience
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
                <div className={cn("grid gap-3.5", isAd ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6")}>
                  {audienceOptions.map((item) => {
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
                          className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-control transition-all duration-200"
                          style={{
                            background: isSel
                              ? "linear-gradient(155deg,#ff8a52,var(--brand) 55%,var(--brand-deep))"
                              : "linear-gradient(155deg,var(--tint),var(--tint-2))",
                            boxShadow: isSel
                              ? "0 10px 20px -8px rgba(253,72,22,.45), inset 0 1px 0 rgba(255,255,255,.5), inset 0 -6px 10px -6px rgba(0,0,0,.18)"
                              : "inset 0 1px 0 rgba(255,255,255,.6), inset 0 -4px 8px -6px rgba(16,24,40,.08)",
                          }}
                        >
                          {/* Glass sheen — the same premium finish used on the homepage studio-picker icons */}
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0"
                            style={{ background: "linear-gradient(155deg,rgba(255,255,255,.45),transparent 45%)" }}
                          />
                          <IconComp className={cn("relative size-6", isSel ? "text-white" : "text-brand-deep")} strokeWidth={1.75} />
                        </div>
                        <div className="text-body-lg font-[850] text-ink leading-none">{item.title}</div>
                        <div className="text-label text-ink-3 leading-none">{item.subtitle}</div>
                      </button>
                    );
                  })}
                </div>

                {/* ── Direct 1-Click Doctor Speciality Chips ── */}
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

                    {/* The listed specialities are the ones the audience
                        targeting actually knows about. A typed-in one looked
                        like it narrowed the audience and did nothing of the
                        sort, so the field is gone rather than decorative. */}
                    <ChipMultiSelect
                      size="sm"
                      options={allSpecialities.map((spec) => ({ id: spec, label: spec }))}
                      selected={selectedSpecialities}
                      onToggle={toggleSpeciality}
                    />

                    <div className="flex justify-end pt-1">
                      <Button size="sm" variant="primary" onClick={() => setStage("grounding")} className="h-7.5 text-label font-bold px-4 cursor-pointer shadow-sm">
                        <span>Select Brand</span>
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
                  Select Brand
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
                    Select Brand
                  </span>
                  {stage !== "grounding" && groundingLabel && (
                    <span className="text-body font-semibold text-brand-deep bg-tint px-2.5 py-0.5 rounded-chip border border-tint-line ml-2">
                      {sourceMode === "brand"
                        ? groundingLabel
                        : `${selectedDiseaseIds.length} Therapy Area${selectedDiseaseIds.length > 1 ? "s" : ""}: ${selectedDiseaseIds.map((id) => allDiseases.find((d) => d.id === id)?.label).filter(Boolean).join(", ")}`}
                    </span>
                  )}
                  {stage !== "grounding" && sourceMode === "brand" && groundingLabel && (
                    <span className="text-label font-semibold text-ink-3 truncate max-w-[220px]">
                      {variationLabel}
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
                  <p className="text-label text-ink-3">
                    Every asset is grounded in a specific product, so its claims can be traced back
                    to an approved source.
                  </p>

                  {sourceMode === "brand" ? (
                    <div className="space-y-3">
                      {/* The search hides once a brand is chosen — the tile
                          below is the answer, and leaving a half-filled search
                          box above it read as if nothing had been picked. */}
                      {!selectedBrand && (
                        <PickSearch
                          value={brandSearch}
                          onChange={setBrandSearch}
                          placeholder="Search brand name or molecule (e.g. Velmora, Onkavia, Nirvexa)..."
                          autoFocus
                        />
                      )}

                      {selectedBrand ? (
                        <SelectedBrandTile
                          brand={selectedBrand}
                          onChange={() => { setSelectedBrandId(""); setBrandSearch(""); setSelectedVariations([]); }}
                        />
                      ) : !brandSearch.trim() ? (
                        /* Nothing until there is a query — see filteredBrands. */
                        <div className="rounded-panel border border-dashed border-hair-2 bg-card px-4 py-6 text-center">
                          <p className="text-body font-bold text-ink-2">Start typing to find a product</p>
                          <p className="text-label text-ink-4 mt-0.5">
                            Search your full catalogue by brand name, molecule or therapy area.
                          </p>
                        </div>
                      ) : (
                        <PickList>
                          {filteredBrands.map((brand) => (
                            <PickRow
                              key={brand.id}
                              onSelect={() => handleSelectBrand(brand)}
                              thumb={<BrandThumb brand={brand} className="size-10 shrink-0" />}
                              title={brand.name}
                              detail={[brand.genericName, brand.therapyAreas.join(", ")].filter(Boolean).join(" · ")}
                              chip={<PickChip tone="ok">Verified</PickChip>}
                            />
                          ))}
                          {filteredBrands.length === 0 && (
                            /* Naming where a brand comes from, without trying
                               to do it here. Adding one is a Product Library
                               job — it is not finished until the dossier is
                               verified, and that is not a step to bury inside
                               starting a project. */
                            <PickEmpty title={<>No verified brand matching &quot;{brandSearch}&quot;</>}>
                              Only products with a verified dossier can ground an asset. Add or verify one in the
                              Product Library, and it will appear here.
                            </PickEmpty>
                          )}
                        </PickList>
                      )}

                      {/* ── Which presentations, asked the way the speciality
                          chips are asked in step 1: a rule, a label, chips. ── */}
                      {selectedBrand && (
                        <div className="pt-3 border-t border-hair-2/80 space-y-2.5 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between">
                            <span className="text-label font-bold text-ink-2">
                              {selectedBrand.name} Variants:
                            </span>
                            {selectedVariations.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setSelectedVariations([])}
                                className="text-caption font-semibold text-ink-4 hover:text-ink-2 cursor-pointer"
                              >
                                Reset to all
                              </button>
                            )}
                          </div>

                          <ChipMultiSelect
                            size="sm"
                            options={[
                              { id: ALL_VARIANTS, label: "All variants" },
                              ...variationOptions.map((v) => ({ id: v, label: v })),
                            ]}
                            /* All means all: the individual chips tick with
                               it, because "every presentation" and "each of
                               these presentations" are the same answer, and
                               showing one ticked chip beside three empty ones
                               said the opposite. */
                            selected={
                              selectedVariations.length === 0
                                ? [ALL_VARIANTS, ...variationOptions]
                                : selectedVariations.length === variationOptions.length
                                  ? [ALL_VARIANTS, ...selectedVariations]
                                  : selectedVariations
                            }
                            onToggle={(id) =>
                              id === ALL_VARIANTS ? setSelectedVariations([]) : toggleVariation(id)
                            }
                          />

                          {isAd && (
                            <AdLabelChecks
                              brandName={selectedBrand.name}
                              adKind={adKind}
                              adType={adType}
                              facts={adFacts}
                              indication={adIndication}
                              onIndication={setAdIndication}
                              onMakeProductClaim={() => setAdType("product-claim")}
                            />
                          )}

                          <div className="flex justify-end pt-1">
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={brandStepBlocked}
                              onClick={() => setStage("details")}
                              className="h-7.5 text-label font-bold px-4 cursor-pointer shadow-sm disabled:opacity-40"
                            >
                              <span>Continue</span>
                              <ChevronRight className="size-3.5" />
                            </Button>
                          </div>
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

          {/* ══════════════ 3. CLINICAL FOCUS TOPICS ══════════════ */}
          {stage !== "details" ? (
            <div className="rounded-panel border border-dashed border-hair-2 bg-canvas p-3.5 flex items-center justify-between opacity-60">
              <div className="flex items-center gap-2.5">
                <div className="grid size-6 place-items-center rounded-full bg-black/5 text-label font-bold text-ink-3">
                  3
                </div>
                <span className="text-body font-bold text-ink-3">
                  {isAd ? "Where It Runs" : "Clinical Focus Topics"}
                </span>
              </div>
              <span className="text-label text-ink-3 flex items-center gap-1">
                <Lock className="size-3" />{" "}
                {stage === "audience" ? "Confirm audience first" : "Select a brand first"}
              </span>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-200">

              {/* 3. Where it runs — the ads version of step 3, in the same
                  row style as the topics, so the modal reads as one form.
                  Placements are grouped by the account they are bought
                  through, and each says what it will produce. */}
              {isAd && (
                <div className="rounded-panel border border-hair bg-card p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="grid size-5.5 place-items-center rounded-full bg-tint text-brand-deep text-caption font-extrabold">
                        3
                      </div>
                      <div>
                        <h3 className="text-body-lg font-extrabold text-ink">Where It Runs</h3>
                        <p className="text-label text-ink-3">
                          Each placement sets the format and size. SwishX makes what it needs.
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => mediaPlanInputRef.current?.click()}
                        className="h-7.5 gap-1.5 text-label font-bold"
                      >
                        <Upload className="size-3.5" />
                        <span>{mediaPlanName ? "Replace media plan" : "Upload media plan"}</span>
                      </Button>
                      <span className="text-label font-bold text-brand-deep bg-tint px-2.5 py-0.5 rounded-chip border border-tint-line">
                        {adPlacements.length} Selected
                      </span>
                    </div>
                    <input
                      ref={mediaPlanInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setMediaPlanName(file.name);
                        if (audience) setAdPlacements(placementsFromMediaPlan(audience));
                        e.target.value = "";
                      }}
                    />
                  </div>

                  {mediaPlanName && (
                    <div className="flex items-center gap-2 rounded-control border border-ok-line bg-ok-bg px-3 py-2 text-label text-ink-2">
                      <Check className="size-3.5 shrink-0 text-ok" />
                      <span className="min-w-0 truncate">
                        Placements read from <b className="font-bold text-ink">{mediaPlanName}</b>. Change any below.
                      </span>
                    </div>
                  )}

                  <div className="pt-1">
                    {audience && <PlacementPicker audience={audience} selected={adPlacements} onToggle={toggleAdPlacement} />}
                  </div>
                </div>
              )}

              {/* 3. Clinical Focus Topics (Audience-tailored Hero Cards) */}
              {!isAd && (
              <div className="rounded-panel border border-hair bg-card p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid size-5.5 place-items-center rounded-full bg-tint text-brand-deep text-caption font-extrabold">
                      3
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
                        /* One row, not a card with a body. The gloss under
                           each label is gone, and a tile still holding the
                           height for it stood a name in the top corner of an
                           empty box. */
                        className={cn(
                          "group relative flex items-center gap-2.5 p-3 rounded-control border text-left transition-all duration-150 cursor-pointer shadow-2xs",
                          isSel
                            ? "border-brand bg-[#f3f9f5] ring-2 ring-brand/15 shadow-sm"
                            : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
                        )}
                      >
                        <div className={cn("grid size-7 place-items-center rounded-glyph transition-colors shrink-0", isSel ? "bg-brand text-white shadow-2xs" : "bg-tint text-brand-deep group-hover:bg-brand group-hover:text-white")}>
                          <IconComp className="size-3.5" />
                        </div>
                        <span className="min-w-0 flex-1 text-body font-bold leading-snug text-ink">{top.label}</span>
                        <div className={cn("size-4 rounded-full border flex items-center justify-center transition-colors shrink-0", isSel ? "border-brand bg-brand text-white" : "border-hair-3 bg-card")}>
                          {isSel && <Check className="size-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              )}

            </div>
          )}

        </div>

        {/* ── Footer ── */}
        {/* Every step above already states its own answer beside its heading,
            so a running summary down here repeated all of them a second time. */}
        <div className="flex items-center justify-end border-t border-hair-2 bg-canvas px-7 py-4 shrink-0">
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

