"use client";

import { Shapes, Target } from "lucide-react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { useBrandCatalogue } from "@/features/workspace/brand-catalogue";
import { DOSSIERS } from "@/features/workspace/brand-modal-data";
import { cdcDisease, diseaseTherapyArea, labelIndications, medtechDevice, therapyAreasFor, type Indication } from "@/features/workspace/ad-options";
import { ChipChoices, DecisionRow } from "@/features/workspace/plan-decisions";

/** "All 6 indications", or "All 4 uses" for a device. */
export const allIndicationsLabel = (count: number, device = false) => `All ${count} ${device ? "uses" : "indications"}`;

/** Areas as one line: named while there are a few, counted past three. */
export const areasLabel = (areas: string[]) => (areas.length > 3 ? `${areas.length} therapy areas` : areas.join(" + "));

/** A chip's text: the indication's short name, marked when it is newly approved. */
export const indicationChipLabel = (i: Indication) => (i.isNew ? `${i.label} · Newly approved` : i.label);

/**
 * The picked indication in the label's own words, or what "All" covers.
 *
 * Indications are picked by their short name, which is what marketers call
 * them; the wording is one or two sentences and is what claims are checked
 * against, so it shows in full under the chips rather than inside them.
 */
export function IndicationWording({ options, picked, allowAll = true }: { options: Indication[]; picked?: Indication; allowAll?: boolean }) {
  if (!picked && (!allowAll || options.length < 2)) return null;
  return (
    <div className="mt-2 rounded-control border border-hair bg-card px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-micro font-extrabold uppercase tracking-wide text-ink-4">{picked ? "Approved wording" : `Covers all ${options.length}`}</span>
        {picked?.therapyAreas && <span className="text-caption font-semibold text-ink-3">{picked.therapyAreas.join(" · ")}</span>}
      </div>
      {picked ? (
        <p className="mt-1 text-body text-ink">{picked.wording ?? picked.label}</p>
      ) : (
        <p className="mt-1 text-body text-ink-3">{options.map((i) => i.label).join(" · ")}. The content stays at brand level and can draw on any of them.</p>
      )}
    </div>
  );
}

/**
 * The project's indication and therapy area, as the start step left them.
 *
 * The store holds the answers; the options come from the product's label, so
 * they are looked up here rather than copied into the store with the project.
 */
export function useProjectIndication() {
  const assetType = useWorkspaceStore((s) => s.assetType);
  const adSubject = useWorkspaceStore((s) => s.adSubject);
  const dossierId = useWorkspaceStore((s) => s.sourcePayload.dossierId) ?? "";
  const indication = useWorkspaceStore((s) => s.indication);
  const therapyAreas = useWorkspaceStore((s) => s.therapyAreas);
  const brands = useBrandCatalogue();

  const isAd = assetType === "ad";
  const subjectId = isAd ? (adSubject?.id ?? "") : (DOSSIERS[dossierId]?.brandId ?? dossierId);
  const kind = isAd ? (adSubject?.kind ?? "drug") : "drug";
  const options = kind === "disease" ? [] : labelIndications(subjectId);
  const picked = options.find((i) => i.label === indication) ?? (options.length === 1 ? options[0] : undefined);
  const productAreas =
    kind === "device"
      ? [medtechDevice(subjectId)?.therapyArea].filter((a): a is string => !!a)
      : kind === "disease"
        ? [diseaseTherapyArea(cdcDisease(subjectId)?.group ?? "")]
        : (brands.find((b) => b.id === subjectId)?.therapyAreas ?? []);
  /* A project started before the start step asked has none stored. */
  const areas = therapyAreas.length > 0 ? therapyAreas : therapyAreasFor(options, picked?.label ?? "", productAreas);

  return {
    kind,
    options,
    picked,
    productAreas,
    therapyAreas: areas,
    /** How the indication reads in a sentence: its condition, or all of them. */
    short: picked ? (picked.condition ?? picked.label) : options.length > 1 ? "All indications" : "",
  };
}

/**
 * The indication and therapy area, as rows in Need your input.
 *
 * Shared by the Video, Docs and Ads plans, and laid out like the start step:
 * short names as chips, the picked one's label wording under them. Changing
 * the indication resets the therapy areas to all of its own; any of them can
 * then be dropped.
 */
export function IndicationRows({ editing, onEdit }: { editing: string | null; onEdit: (id: string | null) => void }) {
  const setIndication = useWorkspaceStore((s) => s.setIndication);
  const setTherapyAreas = useWorkspaceStore((s) => s.setTherapyAreas);
  const { kind, options, picked, productAreas, therapyAreas } = useProjectIndication();
  const isDevice = kind === "device";
  const all = allIndicationsLabel(options.length, isDevice);
  /* The picked indication's areas, or every area the label covers on All. */
  const candidateAreas = [...new Set([...therapyAreasFor(options, picked?.label ?? "", productAreas), ...therapyAreas])];

  return (
    <>
      {options.length > 0 && (
        <DecisionRow
          label={isDevice ? "Intended use" : "Indication"}
          value={picked?.label ?? all}
          icon={<Target className="size-4" />}
          editing={editing === "indication"}
          onEdit={() => onEdit(editing === "indication" ? null : "indication")}
        >
          <ChipChoices
            label={options.length > 1 ? "Which indication is this about?" : "The only indication in the label"}
            options={options.length > 1 ? [all, ...options.map(indicationChipLabel)] : options.map(indicationChipLabel)}
            values={[picked ? indicationChipLabel(picked) : all]}
            onToggle={(chip) => {
              const next = options.find((i) => indicationChipLabel(i) === chip)?.label ?? "";
              setIndication(next);
              setTherapyAreas(therapyAreasFor(options, next, productAreas));
            }}
            onDone={() => onEdit(null)}
            footnote="The therapy area moves with it."
          >
            <IndicationWording options={options} picked={picked} />
          </ChipChoices>
        </DecisionRow>
      )}
      <DecisionRow
        label="Therapy area"
        value={areasLabel(therapyAreas)}
        icon={<Shapes className="size-4" />}
        editing={editing === "therapyArea"}
        onEdit={() => onEdit(editing === "therapyArea" ? null : "therapyArea")}
      >
        <ChipChoices
          label="Therapy area"
          options={candidateAreas}
          values={therapyAreas}
          onToggle={(area) => {
            const next = therapyAreas.includes(area) ? therapyAreas.filter((a) => a !== area) : [...therapyAreas, area];
            /* Never none: the area decides which terms and specialists the content speaks to. */
            if (next.length > 0) setTherapyAreas(next);
          }}
          onDone={() => onEdit(null)}
          footnote="The areas the indication sits in. Keep the ones the content speaks to."
        />
      </DecisionRow>
    </>
  );
}
