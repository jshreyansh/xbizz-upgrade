"use client";

import { Shapes, Target } from "lucide-react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { useBrandCatalogue } from "@/features/workspace/brand-catalogue";
import { DOSSIERS } from "@/features/workspace/brand-modal-data";
import { cdcDisease, diseaseTherapyArea, indicationsForVariants, labelIndications, medtechDevice, onlyIndication, therapyAreasFor, type Indication } from "@/features/workspace/ad-options";
import { ChipChoices, DecisionRow } from "@/features/workspace/plan-decisions";

/** "All 6 indications", or "All 4 uses" for a device. */
export const allIndicationsLabel = (count: number, device = false) => `All ${count} ${device ? "uses" : "indications"}`;

/** Areas as one line: named while there are a few, counted past three. */
export const areasLabel = (areas: string[]) => (areas.length > 3 ? `${areas.length} therapy areas` : areas.join(" + "));

/** Picked indications as one line: named while there are one or two, counted past that. */
export const indicationsLabel = (picked: Indication[], available: number) =>
  picked.length === 0 ? (available > 1 ? "All indications" : "") : picked.length > 2 ? `${picked.length} indications` : picked.map((i) => i.label).join(" + ");

/** A chip's text: the indication's short name, marked when it is newly approved. */
export const indicationChipLabel = (i: Indication) => (i.isNew ? `${i.label} · Newly approved` : i.label);

/**
 * One click on a chip in an All-or-some row, the way variants work: from All
 * a click narrows to that one, while narrowed clicks add or remove, and
 * emptying it or ticking every one goes back to All. Empty means All.
 */
export function toggleChip(options: string[], picked: string[], id: string): string[] {
  const next = picked.includes(id) ? picked.filter((p) => p !== id) : [...picked, id];
  return next.length === options.length ? [] : next;
}

/**
 * What the picked indications say, in the label's own words, or what All
 * covers.
 *
 * Indications are picked by their short name, which is what marketers call
 * them; the wording is one or two sentences each and is what claims are
 * checked against, so it shows in full under the chips rather than in them.
 */
export function IndicationWording({ options, picked }: { options: Indication[]; picked: Indication[] }) {
  if (picked.length === 0 && options.length < 2) return null;
  return (
    <div className="mt-2 rounded-control border border-hair bg-card px-3 py-2.5">
      {picked.length === 0 ? (
        <>
          <span className="text-micro font-extrabold uppercase tracking-wide text-ink-4">Covers all {options.length}</span>
          <p className="mt-1 text-body text-ink-3">{options.map((i) => i.label).join(" · ")}. The content can draw on any of them.</p>
        </>
      ) : (
        <>
          <span className="text-micro font-extrabold uppercase tracking-wide text-ink-4">Approved wording</span>
          <div className="mt-1 space-y-2">
            {picked.map((i) => (
              <div key={i.label}>
                {picked.length > 1 && <span className="block text-label font-bold text-ink">{i.label}</span>}
                <p className="text-body text-ink">{i.wording ?? i.label}</p>
                {i.therapyAreas && <span className="text-caption text-ink-3">{i.therapyAreas.join(" · ")}</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * The project's variants, indications and therapy areas, as the start step
 * left them.
 *
 * The store holds the answers; the options come from the product's label,
 * narrowed by the variants picked, so they are looked up here rather than
 * copied into the store with the project.
 */
export function useProjectIndication() {
  const assetType = useWorkspaceStore((s) => s.assetType);
  const adSubject = useWorkspaceStore((s) => s.adSubject);
  const dossierId = useWorkspaceStore((s) => s.sourcePayload.dossierId) ?? "";
  const variations = useWorkspaceStore((s) => s.variations);
  const indications = useWorkspaceStore((s) => s.indications);
  const therapyAreas = useWorkspaceStore((s) => s.therapyAreas);
  const brands = useBrandCatalogue();

  const isAd = assetType === "ad";
  const subjectId = isAd ? (adSubject?.id ?? "") : (DOSSIERS[dossierId]?.brandId ?? dossierId);
  const kind = isAd ? (adSubject?.kind ?? "drug") : "drug";
  const brandVariants = brands.find((b) => b.id === subjectId)?.variants ?? [];
  /* Every variant stored is the same as All: nothing to narrow by. */
  const pickedVariants = variations.length > 0 && variations.length < brandVariants.length ? variations : [];
  const options = kind === "disease" ? [] : indicationsForVariants(labelIndications(subjectId), kind === "drug" ? pickedVariants : []);
  const picked = options.filter((i) => indications.includes(i.label));
  const pickedLabels = picked.map((i) => i.label);
  const productAreas =
    kind === "device"
      ? [medtechDevice(subjectId)?.therapyArea].filter((a): a is string => !!a)
      : kind === "disease"
        ? [diseaseTherapyArea(cdcDisease(subjectId)?.group ?? "")]
        : (brands.find((b) => b.id === subjectId)?.therapyAreas ?? []);
  const candidateAreas = therapyAreasFor(options, pickedLabels, productAreas);
  /* A project started before the start step asked has none stored. */
  const areas = therapyAreas.length > 0 ? therapyAreas : candidateAreas;
  const only = onlyIndication(options, pickedLabels);

  return {
    kind,
    options,
    picked,
    only,
    productAreas,
    candidateAreas,
    therapyAreas: areas,
    /** How the indications read in a line: the one's condition, a couple by name, or a count. */
    short: only ? (only.condition ?? only.label) : indicationsLabel(picked, options.length),
  };
}

/**
 * The indications and therapy areas, as rows in Need your input.
 *
 * Shared by the Video, Docs and Ads plans, and laid out like the start step:
 * short names as chips with All first, the picked ones' label wording under
 * them. Changing the indications resets the therapy areas to all of theirs;
 * any of those can then be dropped.
 */
export function IndicationRows({ editing, onEdit }: { editing: string | null; onEdit: (id: string | null) => void }) {
  const setIndications = useWorkspaceStore((s) => s.setIndications);
  const setTherapyAreas = useWorkspaceStore((s) => s.setTherapyAreas);
  const { kind, options, picked, productAreas, candidateAreas, therapyAreas } = useProjectIndication();
  const isDevice = kind === "device";
  const allChip = allIndicationsLabel(options.length, isDevice);
  const ALL_AREAS = "All areas";
  const allAreasPicked = candidateAreas.every((a) => therapyAreas.includes(a));

  return (
    <>
      {options.length > 0 && (
        <DecisionRow
          label={isDevice ? "Intended use" : "Indication"}
          value={picked.length === 0 ? allChip : indicationsLabel(picked, options.length)}
          icon={<Target className="size-4" />}
          editing={editing === "indication"}
          onEdit={() => onEdit(editing === "indication" ? null : "indication")}
        >
          <ChipChoices
            label={options.length > 1 ? "Which indications is this about?" : "The only indication for these variants"}
            options={options.length > 1 ? [allChip, ...options.map(indicationChipLabel)] : options.map(indicationChipLabel)}
            values={picked.length === 0 ? [allChip, ...options.map(indicationChipLabel)] : picked.map(indicationChipLabel)}
            onToggle={(chip) => {
              const label = options.find((i) => indicationChipLabel(i) === chip)?.label;
              const next = label ? toggleChip(options.map((i) => i.label), picked.map((i) => i.label), label) : [];
              setIndications(next);
              setTherapyAreas(therapyAreasFor(options, next, productAreas));
            }}
            onDone={() => onEdit(null)}
            footnote="The therapy areas follow the indications picked."
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
          options={candidateAreas.length > 1 ? [ALL_AREAS, ...candidateAreas] : candidateAreas}
          values={allAreasPicked ? [ALL_AREAS, ...candidateAreas] : therapyAreas}
          onToggle={(area) => {
            const next = area === ALL_AREAS ? [] : toggleChip(candidateAreas, allAreasPicked ? [] : therapyAreas, area);
            setTherapyAreas(next.length > 0 ? next : candidateAreas);
          }}
          onDone={() => onEdit(null)}
          footnote="The areas the picked indications sit in. Keep the ones the content speaks to."
        />
      </DecisionRow>
    </>
  );
}
