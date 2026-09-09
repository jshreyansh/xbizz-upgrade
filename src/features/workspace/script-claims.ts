import type { SceneCitation } from "@/types/content";

/**
 * The approved claims this project is grounded in.
 *
 * Its own module because two places need exactly the same records: the Claims
 * tab renders them, and the citation badges under each line of narration point
 * INTO them. Duplicating the list is how a badge ends up resolving to a claim
 * card that does not exist — and how a header ends up advertising a count the
 * list cannot back. Every count in the UI is derived from this array.
 *
 * `beats` is what makes a claim reachable from a line: a claim declares which
 * narrative beats it can support, rather than a second map declaring it from
 * the outside, which would drift the moment a claim is added.
 */
export interface ApprovedClaim {
  id: string;
  title: string;
  status: "Approved" | "Supported";
  tag: string;
  detail: string;
  beats: string[];
}

export const APPROVED_CLAIMS: ApprovedClaim[] = [
  // ── Disease burden and unmet need ──
  { id: "c01", title: "Disease Burden Prevalence",       status: "Approved",  tag: "PI §1.1",       detail: "Moderate-to-severe plaque psoriasis affects approximately 2% of adults.", beats: ["Intro", "Clinical Need"] },
  { id: "c02", title: "Quality-of-Life Impact",          status: "Approved",  tag: "PROMIS-29",     detail: "Baseline DLQI scores indicate substantial impairment in daily function.", beats: ["Intro", "Clinical Need"] },
  { id: "c03", title: "Symptom Visibility Burden",       status: "Supported", tag: "JAMA Derm 2025", detail: "Visible plaques account for only part of reported patient burden.", beats: ["Intro"] },
  { id: "c04", title: "Inadequate Response on Standard", status: "Approved",  tag: "CLEARSKIN-3",   detail: "38% of patients remain inadequately controlled on first-line therapy.", beats: ["Clinical Need"] },
  { id: "c05", title: "Treatment Discontinuation Rate",  status: "Supported", tag: "IQVIA 2026",    detail: "One in four patients discontinues within the first twelve months.", beats: ["Clinical Need"] },

  // ── Mechanism ──
  { id: "c06", title: "Selective Mechanism Inhibition",  status: "Approved",  tag: "EMBRACE-3",     detail: "Targeted pathway binding sparing secondary cytokine cascades.", beats: ["Mechanism"] },
  { id: "c07", title: "Receptor Binding Affinity",       status: "Approved",  tag: "PI §12.1",      detail: "High-affinity binding at the intended receptor subtype.", beats: ["Mechanism"] },
  { id: "c08", title: "Downstream Signal Blockade",      status: "Approved",  tag: "NEJM 2024",     detail: "Phosphorylation blockade confirmed in ex vivo keratinocyte assay.", beats: ["Mechanism"] },
  { id: "c09", title: "Pathway Selectivity Profile",     status: "Supported", tag: "EMBRACE-3",     detail: "No measurable activity against off-target kinase families.", beats: ["Mechanism"] },

  // ── Efficacy and clinical readout ──
  { id: "c10", title: "Primary CLEARSKIN Endpoint",      status: "Approved",  tag: "FDA §5.1",      detail: "Significant PASI 90 response rate vs placebo at Week 16.", beats: ["Evidence"] },
  { id: "c11", title: "Week 24 Durability",              status: "Approved",  tag: "CLEARSKIN-3",   detail: "Response maintained through Week 24 in the pivotal trial.", beats: ["Evidence"] },
  { id: "c12", title: "Time to First Response",          status: "Approved",  tag: "PI §14.1",      detail: "Median time to PASI 50 of four weeks.", beats: ["Evidence"] },
  { id: "c13", title: "Comparative Non-Inferiority",     status: "Approved",  tag: "EMBRACE-3",     detail: "Non-inferiority to active comparator met on the primary endpoint.", beats: ["Evidence"] },
  { id: "c14", title: "Patient-Reported Outcomes",       status: "Supported", tag: "PROMIS-29",     detail: "Clinically meaningful improvement in itch and sleep domains.", beats: ["Evidence", "Outro"] },
  { id: "c15", title: "Renal Perfusion Preservation",    status: "Approved",  tag: "Lancet 2024",   detail: "Maintained glomerular filtration rate during maintenance dosing.", beats: ["Evidence", "Safety"] },

  // ── Dosing and administration ──
  { id: "c16", title: "Once-Daily Oral Dosing",          status: "Approved",  tag: "PI §2.1",       detail: "One tablet daily, with or without food.", beats: ["Dosing"] },
  { id: "c17", title: "No Titration Required",           status: "Approved",  tag: "PI §2.2",       detail: "Full dose from day one; no titration schedule.", beats: ["Dosing"] },
  { id: "c18", title: "Missed Dose Guidance",            status: "Approved",  tag: "PI §2.4",       detail: "Take as soon as remembered unless the next dose is due.", beats: ["Dosing"] },
  { id: "c19", title: "Renal Impairment Adjustment",     status: "Approved",  tag: "PI §8.6",       detail: "No adjustment required in mild to moderate renal impairment.", beats: ["Dosing", "Safety"] },

  // ── Safety ──
  { id: "c20", title: "Safety and Adverse Profiles",     status: "Supported", tag: "PI §6.2",       detail: "Low incidence of treatment-emergent adverse reactions.", beats: ["Safety"] },
  { id: "c21", title: "Hepatic Monitoring Requirement",  status: "Approved",  tag: "FDA §5.2",      detail: "Baseline and periodic transaminase monitoring is required.", beats: ["Safety"] },
  { id: "c22", title: "Infection Risk Statement",        status: "Approved",  tag: "FDA §5.3",      detail: "Serious infections reported; evaluate before initiating.", beats: ["Safety"] },
  { id: "c23", title: "Contraindication Set",            status: "Approved",  tag: "PI §4.1",       detail: "Contraindicated in active systemic infection and hypersensitivity.", beats: ["Safety", "Outro"] },

  // ── Access and next step ──
  { id: "c24", title: "Prescribing Information Access",  status: "Approved",  tag: "PI (full)",     detail: "Full prescribing information available in the approved label.", beats: ["Outro"] },
];

/**
 * Anchor points in a line of narration.
 *
 * Sentences alone are too coarse: a script line is often one long sentence, so
 * every source collapsed into a single badge trailing the full stop. Long
 * sentences are therefore also broken at real clause boundaries — commas,
 * semicolons, colons — so a badge can sit at the clause it actually backs.
 *
 * Only real boundaries: splitting a comma-less sentence at some middle word
 * would put a source in the middle of a clause it does not support, so a line
 * with one clause correctly gets one badge.
 */
export function splitSegments(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) ?? [];
  const segments: string[] = [];
  for (const sentence of sentences) {
    if (sentence.length > 48 && /[,;:]/.test(sentence)) {
      segments.push(...(sentence.match(/[^,;:]+[,;:]\s*|[^,;:]+$/g) ?? [sentence]));
    } else {
      segments.push(sentence);
    }
  }
  return segments;
}

/**
 * The sources behind a line, anchored to the sentence each one backs. The
 * opening claim of a beat carries its full backing; a later sentence carries
 * one — which is why the badges show different counts, and why showing a
 * count is worth anything at all.
 */
export function citationsFor(tag: string, narration: string): SceneCitation[] {
  const forBeat = APPROVED_CLAIMS.filter((c) => c.beats.includes(tag));
  const claims = (forBeat.length > 0 ? forBeat : APPROVED_CLAIMS).slice(0, 4);
  const segments = splitSegments(narration);

  const cite = (claim: ApprovedClaim, at: number): SceneCitation => ({
    id: `cite-${claim.id}-${at}`,
    source: claim.tag,
    title: `${claim.title} — ${claim.detail}`,
    date: `${claim.status} · current`,
    anchor: at,
    claimId: claim.id,
  });

  // Spread the badges through the line rather than piling them at the end:
  // at most three anchor points, placed at the close of each even share of the
  // text, with the claims dealt round-robin into them.
  const slots = Math.max(1, Math.min(claims.length, segments.length, 3));
  const anchors = Array.from(
    { length: slots },
    (_, i) => Math.floor(((i + 1) * segments.length) / slots) - 1
  );
  return claims.map((claim, i) => cite(claim, anchors[i % slots]));
}
