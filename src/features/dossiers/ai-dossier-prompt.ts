import type { BrandDossier, DossierSection, RegulatoryBody, UnverifiedClaim } from "@/features/dossiers/dossier-types";

/** The Brand Dossier Generator system prompt — Content IQ's core USP.
 *  Converts unstructured brand material into the seven-section dossier
 *  that Video, Canvas, and Website studios read from. Kept verbatim so
 *  it stays auditable against whatever the product team hands us next. */
export const DOSSIER_SYSTEM_PROMPT = `You are the Brand Dossier Generator for Content IQ. You convert whatever a
user provides about their brand into a structured brand dossier — the single
source of truth that Video, Canvas, and Website studios will read from.

You will be given:
- RAW_INPUT: unstructured material (website text, uploaded brand guideline,
  social bio/posts, or wizard question-answer pairs). May be partial.
- EXISTING_DOSSIER (optional): a prior dossier's JSON, if this is a
  duplicate/update rather than a fresh creation.

Fill exactly these seven sections. For every field:
- Use only what is stated or directly inferable from RAW_INPUT or
  EXISTING_DOSSIER. Do not invent facts, competitors, numbers, or claims.
- If a field cannot be supported by the input, set its value to null and add
  it to "needs_review" — never guess to fill a gap.
- Tag each filled field's confidence as "high" (stated directly),
  "medium" (reasonably inferred), or "low" (weak signal, should be
  user-confirmed).

SECTIONS AND FIELDS:

01_brand_basics: name, industry, tagline, mission, vision, founded_year,
  markets_served

02_visual_identity: primary_colors (hex if derivable), secondary_colors,
  headline_font, body_font, logo_notes, imagery_style (descriptive phrases,
  not fabricated adjectives), visual_donts

03_voice_and_tone: personality_traits (3-5 adjectives), tone_description,
  sample_phrases (2-3 verbatim excerpts pulled from RAW_INPUT, quoted
  exactly, with their source noted), avoid_words

04_audience_personas: primary_segment, demographics, psychographics,
  pain_points, buying_motivations

05_positioning_messaging: value_proposition (one sentence), key_messages
  (3-5 bullets), differentiators, elevator_pitch

06_guardrails: regulatory_constraints, restricted_claims,
  required_disclaimers, trademark_rules
  — if the input signals a regulated category (health, finance, alcohol,
    children's products, etc.), flag it explicitly here even if no
    guideline text was provided, and mark confidence "low" pending legal
    review.

07_asset_library: provided_assets (list of {name, type, tag}) drawn only
  from files actually referenced in RAW_INPUT — do not list placeholders.

OUTPUT — return only this JSON, no prose outside it:

{
  "sections": {
    "01_brand_basics": { "fields": {...}, "confidence": {...} },
    "02_visual_identity": { "fields": {...}, "confidence": {...} },
    "03_voice_and_tone": { "fields": {...}, "confidence": {...} },
    "04_audience_personas": { "fields": {...}, "confidence": {...} },
    "05_positioning_messaging": { "fields": {...}, "confidence": {...} },
    "06_guardrails": { "fields": {...}, "confidence": {...} },
    "07_asset_library": { "fields": {...}, "confidence": {...} }
  },
  "needs_review": [
    { "section": "...", "field": "...", "reason": "no supporting input" }
  ]
}`;

export type AiConfidence = "high" | "medium" | "low";

export interface AiDossierSection {
  fields: Record<string, unknown>;
  confidence: Record<string, AiConfidence>;
}

export interface AiNeedsReviewItem {
  section: string;
  field: string;
  reason: string;
}

export interface AiDossierResult {
  sections: Record<string, AiDossierSection>;
  needs_review: AiNeedsReviewItem[];
}

const SECTION_TITLES: Record<string, string> = {
  "01_brand_basics": "Brand Basics",
  "02_visual_identity": "Visual Identity",
  "03_voice_and_tone": "Voice & Tone",
  "04_audience_personas": "Audience Personas",
  "05_positioning_messaging": "Positioning & Messaging",
  "06_guardrails": "Guardrails",
  "07_asset_library": "Asset Library",
};

const SECTION_ORDER = Object.keys(SECTION_TITLES);

function humanizeKey(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined) return "Not stated";
  if (Array.isArray(value)) {
    if (value.length === 0) return "Not stated";
    return value
      .map((v) => (typeof v === "object" && v !== null ? Object.values(v).join(" — ") : String(v)))
      .join("; ");
  }
  if (typeof value === "object") return Object.values(value).join(", ");
  return String(value);
}

function sectionToContent(section: AiDossierSection | undefined): string {
  if (!section) return "No supporting input for this section yet.";
  const lines = Object.entries(section.fields).map(([key, value]) => `${humanizeKey(key)}: ${formatFieldValue(value)}`);
  return lines.length ? lines.join("\n") : "No supporting input for this section yet.";
}

/** Converts the AI generator's 7-section JSON into the app's existing
 *  BrandDossier/DossierSection shape, so it renders in DossierWizard
 *  without touching that file's own section model. */
export function mapAiResultToBrandDossier(
  result: AiDossierResult,
  meta: {
    brandName: string;
    genericName: string;
    regulatoryAnchor: RegulatoryBody;
    category?: string;
    targetAudience?: string[];
  }
): BrandDossier {
  const id = `${meta.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;

  const sections: DossierSection[] = SECTION_ORDER.map((key, i) => {
    const aiSection = result.sections?.[key];
    const filledCount = aiSection ? Object.values(aiSection.fields).filter((v) => v !== null && v !== undefined).length : 0;
    const reviewItems = (result.needs_review ?? []).filter((r) => r.section === key);

    const unverifiedClaims: UnverifiedClaim[] = reviewItems.map((r, j) => ({
      id: `${key}-review-${j}`,
      claim: humanizeKey(r.field),
      issue: r.reason,
      sourceLink: "",
      status: "pending",
    }));

    return {
      id: key,
      number: i + 1,
      title: SECTION_TITLES[key],
      category: (["clinical", "commercial", "regulatory", "safety"] as const)[i % 4],
      content: sectionToContent(aiSection),
      claimsCount: filledCount,
      heldOutCount: reviewItems.length,
      citations: [],
      unverifiedClaims: unverifiedClaims.length ? unverifiedClaims : undefined,
    };
  });

  const basics = result.sections?.["01_brand_basics"]?.fields ?? {};
  const positioning = result.sections?.["05_positioning_messaging"]?.fields ?? {};
  const industry = typeof basics.industry === "string" ? basics.industry : undefined;
  const valueProposition = typeof positioning.value_proposition === "string" ? positioning.value_proposition : undefined;
  const mission = typeof basics.mission === "string" ? basics.mission : undefined;

  const gradients = [
    "linear-gradient(145deg,#1b2a4a,#2f4a7d 50%,#5b7fb8)",
    "linear-gradient(145deg,#3a1e4d,#63307a 48%,#a06bc4)",
    "linear-gradient(145deg,#12332c,#1d5a4a 48%,#3f9c7f)",
  ];

  const totalClaims = sections.reduce((sum, s) => sum + s.claimsCount, 0);
  const totalHeldOut = sections.reduce((sum, s) => sum + s.heldOutCount, 0);

  return {
    id,
    brandName: meta.brandName,
    genericName: meta.genericName || meta.brandName.toLowerCase(),
    indication: valueProposition || mission || "Positioning pending source confirmation.",
    therapyArea: industry || "General Medicine",
    regulatoryAnchor: meta.regulatoryAnchor,
    documentType: "commercial",
    gradient: gradients[sections.length % gradients.length],
    accentColor: "#22c07a",
    initials: meta.brandName.slice(0, 2).toUpperCase(),
    sectionsCount: sections.length,
    claimsCited: totalClaims,
    claimsHeldOut: totalHeldOut,
    verifiedClaimsCount: totalClaims,
    totalClaimsCount: totalClaims,
    healthStatus: totalHeldOut > 0 ? "warning" : "healthy",
    sourcesCount: 1,
    lastUpdated: "Just now",
    status: "complete",
    isSample: false,
    generatedBy: "ai",
    category: meta.category,
    targetAudience: meta.targetAudience,
    sources: [{ id: "src-ai", name: "AI-generated from supplied brand material", type: "slides", date: "This year", status: "under-review", details: "Generated by the Content IQ Brand Dossier Generator", citationCount: totalClaims }],
    sections,
    approvals: [
      { role: "Medical Writer", name: "Medical Writer", initials: "MW", gradient: "linear-gradient(140deg,#ff7a3d,#c9310a)", status: "pending" },
      { role: "MLR Reviewer", name: "MLR Reviewer", initials: "MR", gradient: "linear-gradient(140deg,#22c07a,#12784a)", status: "pending" },
      { role: "Project Manager", name: "Project Manager", initials: "PM", gradient: "linear-gradient(140deg,#9b6bff,#5b21b6)", status: "pending" },
      { role: "Brand Lead", name: "You", initials: "N", gradient: "linear-gradient(140deg,#3a3f4b,#0d1017)", status: "pending" },
    ],
  };
}
