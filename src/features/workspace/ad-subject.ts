import { useBrandName } from "@/features/workspace/brand-catalogue";
import { DOSSIERS } from "@/features/workspace/brand-modal-data";
import { conditionFor } from "@/features/workspace/ad-campaign";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

/**
 * What an Ads project is about, read the same way everywhere.
 *
 * A drug comes from the dossier the project started from; a medical device
 * or a disease from the subject the start modal recorded. The condition is
 * what the copy names: a disease's own name, the one indication a
 * help-seeking campaign is about, or the product's condition.
 */
export function useAdSubject(): { kind: "drug" | "device" | "disease"; brandId: string; brandName: string; condition: string } {
  const dossierId = useWorkspaceStore((s) => s.sourcePayload?.dossierId);
  const subject = useWorkspaceStore((s) => s.adSubject);
  const drugName = useBrandName(dossierId);
  if (subject && subject.kind !== "drug") {
    return { kind: subject.kind, brandId: subject.id, brandName: subject.name, condition: subject.condition ?? conditionFor(subject.id) };
  }
  const brandId = dossierId ? (DOSSIERS[dossierId]?.brandId ?? dossierId) : "";
  return { kind: "drug", brandId, brandName: drugName, condition: subject?.condition ?? conditionFor(brandId) };
}

/** A disease name as it reads mid-sentence: "Atrial Fibrillation" → "atrial fibrillation", but COPD and HIV stay as they are. */
export function conditionPhrase(label: string): string {
  return label
    .replace(/\s*\(.*?\)\s*/g, " ")
    .trim()
    .split(" ")
    /* Acronyms and names stay as written: COPD, HIV, Alzheimer's, Lyme. */
    .map((w) => (w.length > 1 && w === w.toUpperCase()) || /'s$/.test(w) || ["Lyme", "Down"].includes(w) ? w : w.toLowerCase())
    .join(" ");
}
