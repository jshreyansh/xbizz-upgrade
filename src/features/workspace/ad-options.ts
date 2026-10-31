/**
 * What an Ads project is made of: the starting points, the three kinds of
 * pharma ad, where an ad runs and what that produces.
 *
 * The kinds are the FDA's own (21 CFR 202.1): a product claim, a reminder,
 * and disease awareness, which is not advertising at all if it names no drug.
 * The kind decides what every ad must carry, so it is the one regulatory
 * decision the project has to know. The starting points are the campaigns
 * US pharma marketers actually run, each of which implies a kind, an
 * audience and the usual placements, so most people never answer those
 * questions themselves.
 *
 * Placements, not platforms. "Meta" says where the money goes; "Meta Reels &
 * Stories" says the ad is a 9:16 video. The placement decides the format and
 * the size, so it is the only thing asked — what gets made follows from it.
 */

import {
  Clapperboard,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  PanelsTopLeft,
  type LucideIcon,
  TextCursorInput,
} from "lucide-react";
import type { Audience } from "@/types/content";

export type AdKind =
  | "scratch"
  | "brand-launch"
  | "disease-awareness"
  | "reminder"
  | "hcp-campaign"
  | "savings"
  | "new-indication";

export type AdType = "product-claim" | "reminder" | "unbranded";

/** What a placement produces. A banner is the animated HTML5 kind with a
 *  scrolling safety panel, the standard pharma display ad. */
export type AdFormat = "video" | "image" | "carousel" | "banner" | "text" | "document";

export type AdAccount = "Google Ads" | "Meta Ads" | "LinkedIn Ads" | "Programmatic" | "HCP networks" | "TikTok Ads";

export type AdPlacement =
  | "youtube"
  | "google-search"
  | "google-display"
  | "meta-feed"
  | "meta-reels-stories"
  | "programmatic-display"
  | "programmatic-video"
  | "ctv"
  | "hcp-networks"
  | "tiktok"
  | "linkedin-feed";

/** Ads are for the people a platform can reach. Trade and market-access
 *  audiences are reached through dossiers and portals, not ad accounts. */
export const AD_AUDIENCES: Audience[] = ["HCP", "Patient", "Consumer"];

/* Labelled in the words MLR reviewers use — branded, reminder, unbranded —
   so "Branding" is never mistaken for the ad formats, which come from the
   placements. The hint says what each kind legally requires. */
export const AD_TYPES: Array<{ id: AdType; label: string; hint: string }> = [
  {
    id: "product-claim",
    label: "Product Claim Ads",
    hint: "Names the product and what it's for, with the safety information alongside the claim.",
  },
  {
    id: "reminder",
    label: "Reminder Ads",
    hint: "Brand and generic name only, no claims. Not allowed for a drug with a boxed warning.",
  },
  {
    id: "unbranded",
    label: "Help-Seeking Ads",
    hint: "About the condition, ending with \u201ctalk to your doctor\u201d. No product named or implied.",
  },
];

/** The account each group of placements is bought through, with the tools
 *  behind it where the name alone would not say. */
export const AD_ACCOUNTS: Array<{ id: AdAccount; detail?: string; note: string }> = [
  { id: "Google Ads", note: "Needs Google's pharmaceutical manufacturer certification." },
  { id: "Meta Ads", detail: "Facebook and Instagram", note: "Needs Meta's prescription drug authorization · 18+ · US, Canada and New Zealand. Placements stay as chosen; Meta never moves the ads." },
  {
    id: "LinkedIn Ads",
    note: "Prescription ads follow LinkedIn's healthcare ad policy; check it before booking. Reaches HCPs by job title and specialty, but anyone can still see a shared ad.",
  },
  { id: "Programmatic", detail: "DV360 and The Trade Desk", note: "Bought through your DSP, served from your ad server." },
  { id: "HCP networks", detail: "Doximity, Medscape, Epocrates", note: "Booked with each network directly, on its own specs." },
  { id: "TikTok Ads", note: "Needs proof of FDA approval · 18+." },
];

/** Which formats each chosen placement makes. A placement not listed makes all it can. */
export type AdFormatChoice = Partial<Record<AdPlacement, AdFormat[]>>;

/**
 * Where an ad can run, and what running there means it is.
 *
 * `makes` is what SwishX produces for the placement by default. Where a
 * placement takes both video and stills, both are made: a still that is
 * designed as its own piece — composed for a glance, like a good thumbnail,
 * not a frame lifted from the video. Rows the marketer does not want come
 * out in the production plan, which is easier than ticking formats blind.
 */
export const AD_PLACEMENTS: Array<{
  id: AdPlacement;
  account: AdAccount;
  label: string;
  makes: AdFormat[];
  sizes: string;
  /** Who the placement can reach. */
  audiences: Audience[];
}> = [
  { id: "youtube", account: "Google Ads", label: "YouTube", makes: ["video"], sizes: "16:9 skippable in-stream, 9:16 Shorts · 6 sec bumpers for reminders", audiences: ["Patient", "Consumer", "HCP"] },
  { id: "google-search", account: "Google Ads", label: "Search", makes: ["text"], sizes: "Up to 15 headlines and 4 descriptions · Google mixes them", audiences: ["Patient", "Consumer", "HCP"] },
  { id: "google-display", account: "Google Ads", label: "Display", makes: ["banner"], sizes: "Image banners in fixed sizes, with a static safety band", audiences: ["Patient", "Consumer", "HCP"] },
  { id: "meta-feed", account: "Meta Ads", label: "Feed", makes: ["video", "image", "carousel"], sizes: "1:1 and 4:5", audiences: ["Patient", "Consumer", "HCP"] },
  { id: "meta-reels-stories", account: "Meta Ads", label: "Reels & Stories", makes: ["video", "image"], sizes: "9:16 full screen", audiences: ["Patient", "Consumer", "HCP"] },
  { id: "linkedin-feed", account: "LinkedIn Ads", label: "Feed", makes: ["image", "video", "carousel", "document"], sizes: "1:1 image and video, square carousel, PDF document", audiences: ["HCP", "Patient", "Consumer"] },
  { id: "programmatic-display", account: "Programmatic", label: "Display", makes: ["banner"], sizes: "HTML5 banners with scrolling safety information", audiences: ["Patient", "Consumer", "HCP"] },
  { id: "programmatic-video", account: "Programmatic", label: "Online video", makes: ["video"], sizes: "16:9 · 15 or 30 sec", audiences: ["Patient", "Consumer", "HCP"] },
  { id: "ctv", account: "Programmatic", label: "Connected TV", makes: ["video"], sizes: "16:9 TV spot · 15, 30 or 60 sec", audiences: ["Patient", "Consumer"] },
  { id: "hcp-networks", account: "HCP networks", label: "In-feed and banners", makes: ["video", "image"], sizes: "Each network's own specs", audiences: ["HCP"] },
  { id: "tiktok", account: "TikTok Ads", label: "In-feed", makes: ["video", "carousel"], sizes: "9:16 video and image carousels", audiences: ["Patient", "Consumer", "HCP"] },
];

export const AD_FORMATS: Array<{ id: AdFormat; label: string; icon: LucideIcon }> = [
  { id: "video", label: "Video", icon: Clapperboard },
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "carousel", label: "Carousel", icon: LayoutGrid },
  { id: "banner", label: "Banner", icon: PanelsTopLeft },
  { id: "text", label: "Text", icon: TextCursorInput },
  { id: "document", label: "Document", icon: FileText },
];

export function placementName(id: AdPlacement): string {
  const p = AD_PLACEMENTS.find((x) => x.id === id);
  return p ? `${p.account} · ${p.label}` : id;
}

/** The formats one placement will make: what was chosen for it, or everything it takes. */
export function formatsOf(id: AdPlacement, choice: AdFormatChoice = {}): AdFormat[] {
  const makes = AD_PLACEMENTS.find((p) => p.id === id)?.makes ?? [];
  const chosen = choice[id]?.filter((f) => makes.includes(f));
  return chosen && chosen.length ? chosen : makes;
}

/** What the chosen placements add up to, in the order formats are listed. */
export function formatsFor(placements: AdPlacement[], choice: AdFormatChoice = {}): AdFormat[] {
  const made = new Set(placements.flatMap((id) => formatsOf(id, choice)));
  return AD_FORMATS.map((f) => f.id).filter((f) => made.has(f));
}

export function formatsLabel(placements: AdPlacement[], choice: AdFormatChoice = {}): string {
  return formatsFor(placements, choice)
    .map((f) => AD_FORMATS.find((o) => o.id === f)?.label)
    .join(" · ");
}

export interface AdKindPreset {
  id: AdKind;
  title: string;
  /** "Launch Ads", for the suggested project name. */
  noun: string;
  audience: Audience;
  adType: AdType;
  placements: AdPlacement[];
}

export const AD_KIND_PRESETS: Record<AdKind, AdKindPreset> = {
  scratch: {
    id: "scratch",
    title: "Create From Scratch",
    noun: "Ads",
    audience: "Patient",
    adType: "product-claim",
    placements: ["youtube", "meta-feed", "meta-reels-stories", "google-display"],
  },
  "brand-launch": {
    id: "brand-launch",
    title: "Brand Launch",
    noun: "Launch Ads",
    audience: "Patient",
    adType: "product-claim",
    placements: ["youtube", "meta-feed", "meta-reels-stories", "ctv"],
  },
  "disease-awareness": {
    id: "disease-awareness",
    title: "Disease Awareness",
    noun: "Awareness Ads",
    audience: "Patient",
    adType: "unbranded",
    placements: ["meta-feed", "meta-reels-stories", "youtube", "ctv"],
  },
  reminder: {
    id: "reminder",
    title: "Reminder Ads",
    noun: "Reminder Ads",
    audience: "Patient",
    adType: "reminder",
    placements: ["youtube", "google-display", "meta-feed"],
  },
  "hcp-campaign": {
    id: "hcp-campaign",
    title: "HCP Campaign",
    noun: "HCP Ads",
    audience: "HCP",
    adType: "product-claim",
    placements: ["hcp-networks", "programmatic-display"],
  },
  savings: {
    id: "savings",
    title: "Savings & Copay Card",
    noun: "Savings Ads",
    audience: "Patient",
    adType: "product-claim",
    placements: ["meta-feed", "google-display", "youtube"],
  },
  "new-indication": {
    id: "new-indication",
    title: "New Indication or Data",
    noun: "New Indication Ads",
    audience: "HCP",
    adType: "product-claim",
    placements: ["hcp-networks", "programmatic-display", "programmatic-video"],
  },
};

/** Keeps what still fits an audience — TikTok and Connected TV cannot reach
 *  doctors, HCP networks cannot reach patients — or starts from a default. */
export function placementsFor(audience: Audience, preferred: AdPlacement[]): AdPlacement[] {
  const allowed = AD_PLACEMENTS.filter((p) => p.audiences.includes(audience)).map((p) => p.id);
  const kept = preferred.filter((p) => allowed.includes(p));
  if (kept.length > 0) return kept;
  return audience === "HCP" ? ["hcp-networks", "programmatic-display"] : ["youtube", "meta-feed", "meta-reels-stories"];
}

/**
 * Placements read from the media agency's plan.
 *
 * A prototype stand-in: any file "reads" as the plan a launch of this kind
 * would usually carry. The real version parses the agency's spreadsheet.
 */
export function placementsFromMediaPlan(audience: Audience): AdPlacement[] {
  return audience === "HCP"
    ? ["hcp-networks", "programmatic-display", "programmatic-video", "google-display"]
    : ["youtube", "meta-feed", "meta-reels-stories", "ctv", "programmatic-display"];
}

/**
 * What the label says about advertising a brand.
 *
 * Mock facts, standing in for the Product Library's label data: whether the
 * drug carries a boxed warning (which rules out reminder ads), whether a
 * cheaper generic exists (California limits copay coupons then), and the
 * indications approved today, newest first.
 */
export interface BrandAdFacts {
  boxedWarning: boolean;
  genericAvailable: boolean;
  /** Approved uses. `condition` is how a help-seeking ad names it; `onlyTreatment`
   *  marks a condition this product is the only approved treatment for. */
  indications: Indication[];
}

export interface Indication {
  /** What people call it, short enough for a chip: "Crohn's disease", "HFpEF". */
  label: string;
  /** The label's own words, one or two sentences. Claims are checked against
   *  this, so it is shown in full wherever an indication is picked. */
  wording?: string;
  isNew?: boolean;
  condition?: string;
  onlyTreatment?: boolean;
  /** The therapy areas this use sits in, the main one first. A use can span
   *  several (heart risk in psoriasis is cardiology and dermatology), and the
   *  person picks which the content speaks to. */
  therapyAreas?: string[];
}

/* Shorthand for the label data below: name, therapy areas, plain-language
   condition, the label's wording, and any flags. */
const ind = (label: string, therapyAreas: string[], condition: string, wording: string, flags?: Pick<Indication, "isNew" | "onlyTreatment">): Indication => ({
  label,
  therapyAreas,
  condition,
  wording,
  ...flags,
});

const BRAND_AD_FACTS: Record<string, BrandAdFacts> = {
  velmora: {
    boxedWarning: false,
    genericAvailable: false,
    indications: [
      ind("CV risk in psoriasis", ["Cardiology", "Dermatology"], "heart risk in psoriasis", "To reduce the risk of major adverse cardiovascular events in adults with moderate-to-severe plaque psoriasis and established cardiovascular disease.", { isNew: true }),
      ind("Plaque psoriasis", ["Dermatology", "Immunology"], "plaque psoriasis", "Moderate-to-severe plaque psoriasis in adults who are candidates for systemic therapy or phototherapy."),
      ind("Psoriatic arthritis", ["Rheumatology", "Dermatology", "Immunology"], "psoriatic arthritis", "Active psoriatic arthritis in adults, alone or in combination with a conventional synthetic DMARD such as methotrexate."),
      ind("Crohn's disease", ["Gastroenterology", "Immunology"], "Crohn's disease", "Moderately to severely active Crohn's disease in adults who have had an inadequate response, lost response or were intolerant to conventional therapy or a TNF blocker."),
      ind("Ulcerative colitis", ["Gastroenterology", "Immunology"], "ulcerative colitis", "Moderately to severely active ulcerative colitis in adults who have had an inadequate response or were intolerant to conventional therapy."),
      ind("Non-infectious uveitis", ["Ophthalmology", "Rheumatology"], "uveitis", "Non-infectious intermediate, posterior and panuveitis in adults, to reduce the risk of flare and preserve vision."),
    ],
  },
  onkavia: {
    boxedWarning: true,
    genericAvailable: false,
    indications: [
      ind("Polycythemia vera", ["Hematology", "Oncology"], "polycythemia vera", "Polycythemia vera in adults who have had an inadequate response to or are intolerant of hydroxyurea.", { isNew: true }),
      ind("Myelofibrosis", ["Oncology", "Hematology"], "myelofibrosis", "Intermediate or high-risk myelofibrosis in adults, including primary myelofibrosis, post-polycythemia vera and post-essential thrombocythemia myelofibrosis.", { onlyTreatment: true }),
      ind("Acute GVHD", ["Transplant Medicine", "Hematology"], "graft-versus-host disease", "Steroid-refractory acute graft-versus-host disease in adult and pediatric patients 12 years and older."),
      ind("Chronic GVHD", ["Transplant Medicine", "Hematology", "Dermatology"], "chronic graft-versus-host disease", "Chronic graft-versus-host disease after failure of one or two lines of systemic therapy in adult and pediatric patients 12 years and older."),
      ind("Atopic dermatitis", ["Dermatology", "Allergy & Immunology", "Pediatrics"], "eczema", "Short-term and non-continuous chronic treatment of mild to moderate atopic dermatitis in non-immunocompromised patients 12 years and older (cream only)."),
      ind("Nonsegmental vitiligo", ["Dermatology", "Immunology"], "vitiligo", "Topical treatment of nonsegmental vitiligo in adult and pediatric patients 12 years and older (cream only)."),
    ],
  },
  nirvexa: {
    boxedWarning: true,
    genericAvailable: false,
    indications: [
      ind("Alopecia areata", ["Dermatology", "Immunology"], "alopecia areata", "Severe alopecia areata in adults.", { isNew: true }),
      ind("Rheumatoid arthritis", ["Rheumatology", "Immunology"], "rheumatoid arthritis", "Moderately to severely active rheumatoid arthritis in adults who have had an inadequate response or intolerance to one or more TNF blockers."),
      ind("Juvenile idiopathic arthritis", ["Pediatrics", "Rheumatology"], "juvenile arthritis", "Active polyarticular juvenile idiopathic arthritis in patients 2 years of age and older."),
      ind("Ulcerative colitis", ["Gastroenterology", "Immunology"], "ulcerative colitis", "Moderately to severely active ulcerative colitis in adults who have had an inadequate response or intolerance to one or more TNF blockers."),
      ind("Atopic dermatitis", ["Dermatology", "Allergy & Immunology", "Pediatrics"], "eczema", "Refractory, moderate-to-severe atopic dermatitis in adults and adolescents 12 and older whose disease is not adequately controlled with other systemic drugs."),
      ind("COVID-19 in hospital", ["Infectious Diseases", "Respiratory", "Hospital Medicine"], "COVID-19", "COVID-19 in hospitalized adults requiring supplemental oxygen, non-invasive or invasive mechanical ventilation, or ECMO."),
    ],
  },
  cardioxa: {
    boxedWarning: true,
    genericAvailable: false,
    indications: [
      ind("HFpEF", ["Cardiology", "Internal Medicine"], "heart failure", "To reduce the risk of cardiovascular death and hospitalization for heart failure in adults with heart failure and left ventricular ejection fraction above 40%.", { isNew: true }),
      ind("HFrEF", ["Cardiology", "Internal Medicine"], "heart failure", "To reduce the risk of cardiovascular death and hospitalization for heart failure in adults with heart failure with reduced ejection fraction (NYHA class II–IV)."),
      ind("Chronic kidney disease", ["Nephrology", "Cardiology", "Endocrinology"], "chronic kidney disease", "To reduce the risk of sustained eGFR decline, end-stage kidney disease, cardiovascular death and hospitalization in adults with chronic kidney disease at risk of progression."),
      ind("Type 2 diabetes", ["Endocrinology", "Primary Care", "Cardiology"], "type 2 diabetes", "As an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus."),
      ind("Type 2 diabetes, ages 10+", ["Pediatrics", "Endocrinology"], "type 2 diabetes in children", "As an adjunct to diet and exercise to improve glycemic control in pediatric patients aged 10 years and older with type 2 diabetes mellitus."),
    ],
  },
  pulmovax: {
    boxedWarning: false,
    genericAvailable: true,
    indications: [
      ind("Asthma, ages 12–17", ["Pediatrics", "Respiratory", "Allergy & Immunology"], "asthma in teens", "As-needed treatment or prevention of bronchoconstriction, and to reduce the risk of exacerbations, in patients 12 to 17 years of age with asthma.", { isNew: true }),
      ind("Asthma, adults", ["Respiratory", "Allergy & Immunology", "Primary Care"], "asthma", "As-needed treatment or prevention of bronchoconstriction, and to reduce the risk of exacerbations, in adults with asthma."),
      ind("COPD", ["Respiratory", "Primary Care"], "COPD", "Maintenance treatment of airflow obstruction in adults with chronic obstructive pulmonary disease, including chronic bronchitis and emphysema."),
      ind("Exercise-induced bronchoconstriction", ["Sports Medicine", "Respiratory"], "exercise-induced asthma", "Prevention of exercise-induced bronchoconstriction in patients 12 years and older, taken 15 to 30 minutes before exercise."),
      ind("Seasonal allergic asthma", ["Allergy & Immunology", "Respiratory"], "allergic asthma", "Relief of acute bronchospasm in patients 12 years and older with seasonal allergic asthma during pollen season."),
    ],
  },
  "3d": {
    boxedWarning: true,
    genericAvailable: true,
    indications: [
      ind("Migraine attacks", ["Neurology", "Pain Management"], "migraine", "Acute treatment of migraine attacks, with or without aura, in adults 18 years of age or older (oral solution only).", { isNew: true }),
      ind("Osteoarthritis", ["Rheumatology & Musculoskeletal", "Orthopedics"], "osteoarthritis", "Relief of the signs and symptoms of osteoarthritis."),
      ind("Rheumatoid arthritis", ["Rheumatology & Musculoskeletal", "Immunology"], "rheumatoid arthritis", "Relief of the signs and symptoms of rheumatoid arthritis."),
      ind("Acute pain", ["Pain Management", "Primary Care"], "acute pain", "Management of mild to moderate acute pain in adults."),
      ind("Primary dysmenorrhea", ["Women's Health", "Pain Management"], "period pain", "Treatment of primary dysmenorrhea."),
      ind("Actinic keratosis", ["Dermatology", "Oncology"], "actinic keratosis", "Topical treatment of actinic keratoses (3% gel only)."),
    ],
  },
  "3d-flam": {
    boxedWarning: true,
    genericAvailable: true,
    indications: [
      ind("Acute gout flare", ["Rheumatology & Musculoskeletal", "Primary Care"], "gout", "Relief of pain and inflammation in acute gout flares in adults.", { isNew: true }),
      ind("Acute pain", ["Pain Management", "Primary Care"], "acute pain", "Relief of mild to moderate acute pain in adults, where a rapid onset of action is needed."),
      ind("Post-operative pain", ["Pain Management", "Orthopedics"], "pain after surgery", "Short-term management of post-operative pain, including after dental and orthopedic procedures."),
      ind("Primary dysmenorrhea", ["Women's Health", "Pain Management"], "period pain", "Treatment of primary dysmenorrhea in adults and adolescents 14 years and older."),
      ind("Migraine attacks", ["Neurology", "Pain Management"], "migraine", "Acute treatment of migraine attacks, with or without aura, in adults."),
      ind("Sprains and strains", ["Sports Medicine", "Orthopedics"], "sprains and strains", "Relief of pain and swelling from soft-tissue injuries such as sprains, strains and contusions."),
    ],
  },
  "3d-plus": {
    boxedWarning: true,
    genericAvailable: true,
    indications: [
      ind("Acute musculoskeletal pain", ["Rheumatology & Musculoskeletal", "Orthopedics"], "muscle and joint pain", "Short-term relief of acute musculoskeletal pain and inflammation in adults."),
      ind("Low back pain", ["Rheumatology & Musculoskeletal", "Pain Management"], "back pain", "Short-term relief of acute low back pain in adults, alongside physical therapy."),
      ind("Post-operative pain", ["Pain Management", "Orthopedics"], "pain after surgery", "Management of mild to moderate post-operative pain in adults."),
      ind("Dental pain", ["Dentistry", "Pain Management"], "toothache", "Relief of acute dental pain, including after tooth extraction, in adults."),
      ind("Primary dysmenorrhea", ["Women's Health", "Pain Management"], "period pain", "Relief of pain in primary dysmenorrhea in adults."),
    ],
  },
  "abd-1": {
    boxedWarning: true,
    genericAvailable: false,
    indications: [
      ind("HIV-1 in pregnancy", ["Obstetrics", "Anti-infectives"], "HIV in pregnancy", "Continuation of treatment of HIV-1 infection in pregnant people who are virologically suppressed and HLA-B*5701-negative.", { isNew: true }),
      ind("HIV-1, treatment-naive", ["Anti-infectives", "Primary Care"], "HIV", "Treatment of HIV-1 infection in adults who have not received antiretroviral therapy and are HLA-B*5701-negative."),
      ind("HIV-1, switching", ["Anti-infectives", "Primary Care"], "HIV", "To replace the current antiretroviral regimen in adults who are virologically suppressed on a stable regimen, with no history of treatment failure."),
      ind("HIV-1, adolescents", ["Pediatrics", "Anti-infectives"], "HIV in teens", "Treatment of HIV-1 infection in adolescents 12 years and older weighing at least 40 kg."),
      ind("HIV-1 with tuberculosis", ["Respiratory", "Anti-infectives"], "HIV and TB", "Treatment of HIV-1 infection in adults receiving rifampin for tuberculosis, with the dolutegravir dose adjusted as labeled."),
    ],
  },
  dermora: {
    boxedWarning: false,
    genericAvailable: false,
    indications: [
      ind("Radiation dermatitis", ["Oncology Supportive Care", "Dermatology"], "skin reactions to radiation", "Prevention and treatment of radiation dermatitis in adults receiving radiotherapy for cancer.", { isNew: true }),
      ind("Atopic dermatitis", ["Dermatology", "Allergy & Immunology", "Pediatrics"], "eczema", "Short-term treatment of moderate atopic dermatitis flares in adults and children 2 years and older."),
      ind("Chronic hand eczema", ["Dermatology", "Allergy & Immunology"], "hand eczema", "Moderate to severe chronic hand eczema in adults when topical corticosteroids are inadequate or inappropriate."),
      ind("Insect bite reactions", ["Allergy & Immunology", "Dermatology"], "bite and sting reactions", "Relief of itching and swelling from local hypersensitivity reactions to insect bites and stings."),
      ind("Diaper dermatitis", ["Pediatrics", "Dermatology"], "diaper rash", "Short-term treatment of moderate diaper dermatitis in infants 3 months and older (cream only)."),
    ],
  },
  pulmavia: {
    boxedWarning: false,
    genericAvailable: false,
    indications: [
      ind("SSc-associated ILD", ["Rheumatology", "Respiratory"], "scleroderma lung disease", "To slow the rate of decline in pulmonary function in adults with systemic sclerosis-associated interstitial lung disease.", { isNew: true }),
      ind("Idiopathic pulmonary fibrosis", ["Respiratory", "Rare Diseases"], "pulmonary fibrosis", "Treatment of idiopathic pulmonary fibrosis in adults."),
      ind("Progressive fibrosing ILD", ["Respiratory", "Rheumatology"], "lung scarring", "Chronic fibrosing interstitial lung diseases with a progressive phenotype in adults."),
      ind("Pulmonary arterial hypertension", ["Cardiology", "Respiratory"], "pulmonary hypertension", "Pulmonary arterial hypertension (WHO Group 1) in adults, to improve exercise ability and delay disease progression."),
      ind("EGFR-mutated NSCLC", ["Oncology", "Respiratory"], "lung cancer", "Metastatic non-small cell lung cancer in adults whose tumors have EGFR exon 19 deletions or exon 21 L858R mutations."),
      ind("Lymphangioleiomyomatosis", ["Rare Diseases", "Respiratory", "Women's Health"], "LAM", "Treatment of lymphangioleiomyomatosis in adults with declining lung function."),
    ],
  },
  renalis: {
    boxedWarning: false,
    genericAvailable: false,
    indications: [
      ind("IgA nephropathy", ["Nephrology", "Immunology"], "IgA nephropathy", "To slow kidney function decline in adults with primary IgA nephropathy at risk of disease progression.", { isNew: true }),
      ind("Polycystic kidney disease", ["Nephrology", "Rare Diseases"], "polycystic kidney disease", "To slow kidney function decline in adults at risk of rapidly progressing autosomal dominant polycystic kidney disease."),
      ind("Diabetic kidney disease", ["Endocrinology", "Nephrology"], "kidney disease in diabetes", "To reduce the risk of eGFR decline and end-stage kidney disease in adults with chronic kidney disease associated with type 2 diabetes."),
      ind("Overactive bladder", ["Urology", "Women's Health"], "overactive bladder", "Overactive bladder with symptoms of urge urinary incontinence, urgency and urinary frequency in adults."),
      ind("Kidney transplant", ["Transplant Medicine", "Nephrology"], "kidney transplant", "Prophylaxis of organ rejection in adult kidney transplant recipients, in combination with other immunosuppressants."),
      ind("Hyperkalemia in heart failure", ["Cardiology", "Nephrology"], "high potassium", "Treatment of hyperkalemia in adults with heart failure, to allow continued use of RAAS inhibitors."),
    ],
  },
  affolmy: {
    boxedWarning: true,
    genericAvailable: true,
    indications: [
      ind("Stroke risk with LVH", ["Neurology", "Cardiology"], "stroke risk", "To reduce the risk of stroke in adults with hypertension and left ventricular hypertrophy.", { isNew: true }),
      ind("Hypertension, adults", ["Cardiology", "Primary Care"], "high blood pressure", "Treatment of hypertension in adults, alone or with other antihypertensive agents, to lower blood pressure."),
      ind("Hypertension, ages 6–16", ["Pediatrics", "Cardiology"], "high blood pressure in children", "Treatment of hypertension in pediatric patients 6 to 16 years of age."),
      ind("Diabetic nephropathy", ["Nephrology", "Endocrinology"], "kidney disease in diabetes", "Treatment of diabetic nephropathy with elevated serum creatinine and proteinuria in adults with type 2 diabetes and hypertension."),
      ind("Microalbuminuria in type 2 diabetes", ["Endocrinology", "Nephrology"], "kidney damage in diabetes", "To delay the onset of microalbuminuria in adults with type 2 diabetes and hypertension."),
    ],
  },
  abdec: {
    boxedWarning: false,
    genericAvailable: true,
    indications: [
      ind("H. pylori eradication", ["Gastroenterology", "Infectious Diseases"], "H. pylori", "In combination therapy, to eradicate H. pylori and reduce the risk of duodenal ulcer recurrence in adults.", { isNew: true }),
      ind("Ear, nose and throat infections", ["ENT", "Pediatrics", "Primary Care"], "ear and throat infections", "Infections of the ear, nose and throat, including acute otitis media and streptococcal pharyngitis, caused by susceptible bacteria."),
      ind("Lower respiratory tract infections", ["Respiratory", "Infectious Diseases"], "chest infections", "Lower respiratory tract infections caused by susceptible strains of Streptococcus, Staphylococcus or Haemophilus influenzae."),
      ind("Urinary tract infections", ["Urology", "Women's Health"], "urinary tract infections", "Infections of the genitourinary tract caused by susceptible strains of E. coli, Proteus mirabilis or Enterococcus faecalis."),
      ind("Skin infections", ["Dermatology", "Infectious Diseases"], "skin infections", "Infections of the skin and skin structure caused by susceptible streptococci, staphylococci or E. coli."),
    ],
  },
  /* Medical devices: their intended use stands in for an indication. */
  "device-glucora": {
    boxedWarning: false,
    genericAvailable: false,
    indications: [
      ind("Diabetes in pregnancy", ["Obstetrics", "Diabetes"], "diabetes in pregnancy", "Glucose monitoring in pregnant people with type 1, type 2 or gestational diabetes.", { isNew: true }),
      ind("Diabetes, ages 2+", ["Diabetes", "Pediatrics"], "diabetes", "Real-time glucose monitoring to replace fingerstick testing for treatment decisions in people with diabetes, ages 2 and up."),
      ind("Not on insulin", ["Primary Care", "Diabetes"], "type 2 diabetes", "Over-the-counter glucose monitoring for adults 18 and up who do not use insulin."),
      ind("In hospital", ["Hospital Medicine", "Diabetes"], "diabetes in hospital", "Glucose monitoring in hospitalized adults, including critical care, under the supervision of a healthcare professional."),
    ],
  },
  "device-cardiyn": {
    boxedWarning: false,
    genericAvailable: false,
    indications: [
      ind("AV block, dual chamber", ["Cardiology", "Electrophysiology"], "heart block", "Dual-chamber leadless pacing for adults with high-grade atrioventricular block who need atrial and ventricular synchrony.", { isNew: true }),
      ind("Bradycardia with AF", ["Electrophysiology", "Cardiology"], "a slow heart rhythm", "Symptomatic bradycardia in adults with permanent atrial fibrillation who need single-chamber ventricular pacing."),
      ind("Sinus node dysfunction", ["Electrophysiology", "Cardiology"], "a slow heart rhythm", "Symptomatic sinus node dysfunction in adults with infrequent pauses or unexplained syncope."),
      ind("Limited venous access", ["Nephrology", "Electrophysiology"], "a slow heart rhythm", "Pacing in adults with limited venous access or high infection risk, such as people on hemodialysis."),
      ind("Bradyarrhythmia in older adults", ["Geriatrics", "Cardiology"], "fainting from a slow heart rhythm", "Syncope from documented bradyarrhythmia in adults 75 and older, where a transvenous lead is not preferred."),
    ],
  },
  "device-pulseva": {
    boxedWarning: false,
    genericAvailable: false,
    indications: [
      ind("AF after stroke", ["Neurology", "Cardiology"], "atrial fibrillation after stroke", "Long-term ECG monitoring to detect atrial fibrillation in adults after a cryptogenic stroke or TIA.", { isNew: true }),
      ind("Atrial fibrillation", ["Cardiology", "Electrophysiology"], "atrial fibrillation", "Continuous ECG recording for up to 14 days to detect atrial fibrillation in adults with suspected arrhythmia."),
      ind("Palpitations and syncope", ["Electrophysiology", "Primary Care"], "palpitations", "Evaluation of palpitations, dizziness or unexplained syncope in adults with suspected arrhythmia."),
      ind("After cardiac surgery", ["Cardiac Surgery", "Cardiology"], "heart rhythm after surgery", "Detection of post-operative atrial fibrillation in adults discharged after cardiac surgery."),
      ind("Remote monitoring", ["Primary Care", "Cardiology"], "an irregular heartbeat", "Remote ECG monitoring ordered in primary care for adults with intermittent symptoms."),
    ],
  },
};

/* ── What an ad is about: a drug, a medical device or a disease ── */

/**
 * Medical devices, for Ads. Mock records standing in for the Product Library.
 *
 * Who regulates a device's ads depends on it: a "restricted" device (most
 * that went through FDA premarket approval) is held to FDA advertising
 * rules and every ad carries a brief statement of its intended use and
 * risks; most others answer to the FTC, where every claim must be truthful
 * and substantiated, with no brief statement required.
 */
export interface MedtechDevice {
  id: string;
  name: string;
  kind: string;
  clearance: string;
  restricted: boolean;
  therapyArea: string;
  /** Placeholder picture and backing until the Product Library holds device photos. */
  image: string;
  gradient: string;
}

export const MEDTECH_DEVICES: MedtechDevice[] = [
  { id: "device-glucora", name: "Glucora CGM", kind: "Continuous glucose monitor", clearance: "FDA 510(k) cleared", restricted: false, therapyArea: "Diabetes", image: "/products/device.jpg", gradient: "linear-gradient(150deg,#0f766e,#14b8a6 55%,#99f6e4)" },
  { id: "device-cardiyn", name: "Cardiyn", kind: "Leadless pacemaker", clearance: "FDA premarket approval (PMA)", restricted: true, therapyArea: "Cardiology", image: "/products/device.jpg", gradient: "linear-gradient(150deg,#9f1239,#e11d48 55%,#fda4af)" },
  { id: "device-pulseva", name: "Pulseva Patch", kind: "Wearable ECG monitor", clearance: "FDA 510(k) cleared", restricted: false, therapyArea: "Cardiology", image: "/products/device.jpg", gradient: "linear-gradient(150deg,#1e40af,#3b82f6 55%,#bfdbfe)" },
];

export const isDeviceId = (id: string) => id.startsWith("device-");
export const isDiseaseId = (id: string) => id.startsWith("disease-");
export const medtechDevice = (id: string) => MEDTECH_DEVICES.find((d) => d.id === id);

/**
 * Diseases and conditions for help-seeking ads, a curated subset of the
 * CDC's Health Topics A–Z (cdc.gov/az). The index covers all of CDC.gov,
 * so only diseases and conditions are kept, under their common names.
 */
export const CDC_DISEASES: Array<{ id: string; label: string; group: string }> = (
  [
    ["Alzheimer's Disease", "Brain and nerves"], ["ALS (Amyotrophic Lateral Sclerosis)", "Brain and nerves"], ["Autism Spectrum Disorder", "Brain and nerves"],
    ["ADHD", "Brain and nerves"], ["Cerebral Palsy", "Brain and nerves"], ["Epilepsy", "Brain and nerves"], ["Migraine", "Brain and nerves"],
    ["Multiple Sclerosis", "Brain and nerves"], ["Parkinson's Disease", "Brain and nerves"], ["Stroke", "Brain and nerves"], ["Traumatic Brain Injury", "Brain and nerves"],
    ["Depression", "Mental health"], ["Anxiety Disorders", "Mental health"], ["Bipolar Disorder", "Mental health"], ["Schizophrenia", "Mental health"], ["Postpartum Depression", "Mental health"],
    ["Heart Disease", "Heart and blood"], ["Heart Failure", "Heart and blood"], ["Atrial Fibrillation", "Heart and blood"], ["High Blood Pressure", "Heart and blood"],
    ["High Cholesterol", "Heart and blood"], ["Congenital Heart Defects", "Heart and blood"], ["Peripheral Artery Disease", "Heart and blood"], ["Sickle Cell Disease", "Heart and blood"],
    ["Hemophilia", "Heart and blood"], ["Venous Thromboembolism (Blood Clots)", "Heart and blood"], ["Anemia", "Heart and blood"],
    ["Diabetes", "Hormones and metabolism"], ["Type 1 Diabetes", "Hormones and metabolism"], ["Type 2 Diabetes", "Hormones and metabolism"], ["Prediabetes", "Hormones and metabolism"],
    ["Gestational Diabetes", "Hormones and metabolism"], ["Obesity", "Hormones and metabolism"], ["Thyroid Disease", "Hormones and metabolism"], ["Osteoporosis", "Hormones and metabolism"],
    ["Asthma", "Lungs"], ["COPD", "Lungs"], ["Cystic Fibrosis", "Lungs"], ["Pulmonary Fibrosis", "Lungs"], ["Pneumonia", "Lungs"], ["Tuberculosis", "Lungs"], ["Sleep Apnea", "Lungs"],
    ["Chronic Kidney Disease", "Kidney and liver"], ["Hepatitis B", "Kidney and liver"], ["Hepatitis C", "Kidney and liver"], ["Fatty Liver Disease", "Kidney and liver"], ["Kidney Stones", "Kidney and liver"],
    ["Breast Cancer", "Cancer"], ["Lung Cancer", "Cancer"], ["Colorectal Cancer", "Cancer"], ["Prostate Cancer", "Cancer"], ["Cervical Cancer", "Cancer"], ["Ovarian Cancer", "Cancer"],
    ["Skin Cancer (Melanoma)", "Cancer"], ["Leukemia", "Cancer"], ["Lymphoma", "Cancer"], ["Multiple Myeloma", "Cancer"], ["Myelofibrosis", "Cancer"], ["Pancreatic Cancer", "Cancer"],
    ["Liver Cancer", "Cancer"], ["Bladder Cancer", "Cancer"], ["Kidney Cancer", "Cancer"], ["Thyroid Cancer", "Cancer"], ["Head and Neck Cancer", "Cancer"],
    ["Rheumatoid Arthritis", "Bones, joints and immune system"], ["Osteoarthritis", "Bones, joints and immune system"], ["Lupus", "Bones, joints and immune system"],
    ["Psoriatic Arthritis", "Bones, joints and immune system"], ["Gout", "Bones, joints and immune system"], ["Fibromyalgia", "Bones, joints and immune system"],
    ["Ankylosing Spondylitis", "Bones, joints and immune system"], ["Myasthenia Gravis", "Bones, joints and immune system"], ["Celiac Disease", "Bones, joints and immune system"],
    ["Psoriasis", "Skin"], ["Eczema (Atopic Dermatitis)", "Skin"], ["Hidradenitis Suppurativa", "Skin"], ["Alopecia Areata", "Skin"], ["Vitiligo", "Skin"], ["Shingles", "Skin"],
    ["Crohn's Disease", "Digestive system"], ["Ulcerative Colitis", "Digestive system"], ["Irritable Bowel Syndrome", "Digestive system"], ["GERD (Acid Reflux)", "Digestive system"],
    ["HIV", "Infections"], ["Influenza (Flu)", "Infections"], ["COVID-19", "Infections"], ["RSV", "Infections"], ["HPV", "Infections"], ["Lyme Disease", "Infections"],
    ["Measles", "Infections"], ["Meningococcal Disease", "Infections"], ["Pneumococcal Disease", "Infections"], ["Sepsis", "Infections"], ["Urinary Tract Infection", "Infections"],
    ["Chlamydia", "Infections"], ["Syphilis", "Infections"], ["Malaria", "Infections"],
    ["Glaucoma", "Eyes and ears"], ["Macular Degeneration", "Eyes and ears"], ["Diabetic Retinopathy", "Eyes and ears"], ["Hearing Loss", "Eyes and ears"], ["Cataracts", "Eyes and ears"],
    ["Endometriosis", "Women's and men's health"], ["Polycystic Ovary Syndrome (PCOS)", "Women's and men's health"], ["Menopause", "Women's and men's health"],
    ["Infertility", "Women's and men's health"], ["Overactive Bladder", "Women's and men's health"], ["Erectile Dysfunction", "Women's and men's health"],
    ["Down Syndrome", "Genetic and rare conditions"], ["Fragile X Syndrome", "Genetic and rare conditions"], ["Muscular Dystrophy", "Genetic and rare conditions"],
    ["Spina Bifida", "Genetic and rare conditions"], ["Hereditary Angioedema", "Genetic and rare conditions"], ["Paroxysmal Nocturnal Hemoglobinuria (PNH)", "Genetic and rare conditions"],
    ["Chronic Pain", "Other conditions"], ["Chronic Fatigue Syndrome (ME/CFS)", "Other conditions"], ["Insomnia", "Other conditions"], ["Dementia", "Other conditions"],
  ] as Array<[string, string]>
).map(([label, group]) => ({ id: `disease-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`, label, group }));

export const cdcDisease = (id: string) => CDC_DISEASES.find((d) => d.id === id);

/** The therapy area a CDC group belongs to, so a disease campaign has one too. */
const THERAPY_AREA_BY_GROUP: Record<string, string> = {
  "Brain and nerves": "Neurology",
  "Mental health": "Psychiatry",
  "Heart and blood": "Cardiology",
  "Hormones and metabolism": "Endocrinology",
  Lungs: "Respiratory",
  "Kidney and liver": "Nephrology & Hepatology",
  Cancer: "Oncology",
  "Bones, joints and immune system": "Immunology",
  Skin: "Dermatology",
  "Digestive system": "Gastroenterology",
  Infections: "Infectious Diseases",
  "Eyes and ears": "Ophthalmology & ENT",
  "Women's and men's health": "Women's & Men's Health",
  "Genetic and rare conditions": "Rare Diseases",
  "Other conditions": "General Medicine",
};
export const diseaseTherapyArea = (group: string) => THERAPY_AREA_BY_GROUP[group] ?? "General Medicine";

/**
 * The indications a product's label lists, from its dossier. Unlike
 * brandAdFacts there is no stand-in: a product with no label data has none,
 * and the start step says so instead of offering a placeholder to pick.
 */
export const labelIndications = (subjectId: string): Indication[] => BRAND_AD_FACTS[subjectId]?.indications ?? [];

/**
 * The therapy areas the person picks from: the picked indication's, or every
 * area the label's indications cover while all of them are in play. The
 * product's own areas only stand in when there is no label data.
 */
export function therapyAreasFor(indications: Indication[], picked: string, productAreas: string[]): string[] {
  const one = indications.find((i) => i.label === picked) ?? (indications.length === 1 ? indications[0] : undefined);
  if (one?.therapyAreas?.length) return one.therapyAreas;
  const fromLabel = labelTherapyAreas(indications);
  return fromLabel.length > 0 ? fromLabel : productAreas;
}

/** Every therapy area a label's indications sit in, in label order. */
export const labelTherapyAreas = (indications: Indication[]) => [...new Set(indications.flatMap((i) => i.therapyAreas ?? []))];

/** Who a therapy area's prescribers are, for sample prompts that name them. */
const PRESCRIBERS: Record<string, string> = {
  Dermatology: "dermatologists",
  Cardiology: "cardiologists",
  Oncology: "oncologists",
  Hematology: "hematologists",
  Immunology: "rheumatologists",
  Rheumatology: "rheumatologists",
  "Rheumatology & Musculoskeletal": "rheumatologists",
  Respiratory: "pulmonologists",
  Diabetes: "endocrinologists",
  Endocrinology: "endocrinologists",
  Neurology: "neurologists",
  Gastroenterology: "gastroenterologists",
  Ophthalmology: "ophthalmologists",
  Pediatrics: "pediatricians",
  Nephrology: "nephrologists",
  Urology: "urologists",
  "Transplant Medicine": "transplant teams",
  "Infectious Diseases": "infectious disease specialists",
  "Anti-infectives": "infectious disease specialists",
  "Allergy & Immunology": "allergists",
  "Pain Management": "pain specialists",
  "Women's Health": "gynecologists",
  Obstetrics: "obstetricians",
  Electrophysiology: "electrophysiologists",
  "Primary Care": "primary care physicians",
  ENT: "ENT specialists",
  Dentistry: "dentists",
  Geriatrics: "geriatricians",
  "Hospital Medicine": "hospitalists",
  Orthopedics: "orthopedic surgeons",
  "Internal Medicine": "internists",
};
/** One area names its prescribers; several, while every indication is in play, don't single one out. */
export const prescribersFor = (areas: string[]) => (areas.length === 1 ? (PRESCRIBERS[areas[0]] ?? "specialists") : "specialists");

export function brandAdFacts(brandId: string): BrandAdFacts {
  return (
    BRAND_AD_FACTS[brandId] ?? {
      boxedWarning: false,
      genericAvailable: false,
      indications: [{ label: "Approved indication, as worded in the label" }],
    }
  );
}

/**
 * Which starting point's examples fit now. The tile's own, unless the kind of
 * ad has since changed — a reminder tile turned into product claim ads should
 * not keep suggesting six-second name-only bumpers.
 */
export function promptKindFor(kind: AdKind, adType: AdType, audience: Audience): AdKind {
  if (AD_KIND_PRESETS[kind].adType === adType) return kind;
  if (adType === "reminder") return "reminder";
  if (adType === "unbranded") return "disease-awareness";
  return audience === "HCP" ? "hcp-campaign" : "brand-launch";
}

/** Example briefs under the prompt, written for the starting point chosen. */
/** `condition` is the picked indication's, so the examples are about what the campaign is about. */
export function adSamplePrompts(kind: AdKind, brand: string, condition = "plaque psoriasis"): Array<{ id: string; tag: string; prompt: string }> {
  const byKind: Record<AdKind, Array<{ id: string; tag: string; prompt: string }>> = {
    scratch: [
      { id: "launch", tag: "Patient Launch", prompt: `Launch ${brand} to adults with ${condition}. Lead with the approved result and drive people to the savings card.` },
      { id: "hcp", tag: "HCP Awareness", prompt: `Reach dermatologists with the EMBRACE-3 result for ${brand} and send them to the HCP site to request samples.` },
      { id: "awareness", tag: "Disease Awareness", prompt: `An unbranded campaign about living with ${condition} that ends with “talk to your doctor”.` },
    ],
    "brand-launch": [
      { id: "clear-skin", tag: "Clear Skin Launch", prompt: `Launch ${brand} to adults with ${condition}. Lead with the approved result and drive people to the savings card.` },
      { id: "once-daily", tag: "Once-Daily Story", prompt: `Introduce ${brand} as one tablet, once a day, with the EMBRACE-3 result and a link to find a specialist.` },
      { id: "caregiver", tag: "Caregivers", prompt: `Launch ads for caregivers of adults with ${condition}, explaining what ${brand} is and how to ask about it.` },
    ],
    "disease-awareness": [
      { id: "living-with", tag: "Living With It", prompt: `An unbranded campaign about the everyday burden of ${condition} that ends with “talk to your doctor”.` },
      { id: "symptom-check", tag: "Symptom Check", prompt: `Short videos helping people recognise the signs of ${condition}, linking to an unbranded symptom checker.` },
      { id: "myths", tag: "Myth vs Fact", prompt: `A carousel busting three common myths about ${condition}, with no product named or implied.` },
    ],
    reminder: [
      { id: "bumper", tag: "6s Bumpers", prompt: `Six-second YouTube bumpers that remind people who saw the launch ad of the ${brand} name.` },
      { id: "feed", tag: "Feed Reminder", prompt: `Feed ads that keep the ${brand} name in front of people who watched the launch video.` },
      { id: "retarget", tag: "Retargeting", prompt: `Display reminder banners for visitors of the ${brand} site who did not sign up for savings.` },
    ],
    "hcp-campaign": [
      { id: "efficacy", tag: "Efficacy Data", prompt: `Reach dermatologists with the EMBRACE-3 PASI 90 result for ${brand} and send them to the HCP site.` },
      { id: "samples", tag: "Request Samples", prompt: `Ads for dermatologists and NPs that drive ${brand} sample requests, led by once-daily dosing.` },
      { id: "switch", tag: "Switch Patients", prompt: `Show dermatologists which patients may be candidates for ${brand} after an inadequate response to topicals.` },
    ],
    savings: [
      { id: "copay", tag: "$0 Copay", prompt: `Drive eligible commercially insured patients to sign up for the ${brand} savings card, pay as little as $0.` },
      { id: "cost", tag: "Cost Worries", prompt: `Ads for people worried about the cost of ${brand}, explaining the savings card and sending them to the savings page.` },
      { id: "support", tag: "Patient Support", prompt: `Tell patients starting ${brand} about the savings card and nurse support line.` },
    ],
    "new-indication": [
      { id: "approval", tag: "Now Approved", prompt: `Announce the newly approved indication for ${brand} to dermatologists and cardiologists, with the pivotal result.` },
      { id: "data", tag: "New Data", prompt: `Share the new long-term data for ${brand} with prescribers, leading with the primary endpoint.` },
      { id: "who", tag: "Who It's For", prompt: `Help prescribers identify which patients the new ${brand} indication covers.` },
    ],
  };
  return byKind[kind];
}

/* ── The plan ─────────────────────────────────────────────────────────────
   What the Ads plan fills in for the marketer to check. Mock data standing
   in for the Claims Library and the label, keyed by brand. A brand with no
   approved claims gets none: nothing is invented to fill the row. */

export interface AdClaim {
  id: string;
  text: string;
  source: string;
  /** Short enough for the smallest banner. */
  short?: boolean;
}

const AD_CLAIMS: Record<string, AdClaim[]> = {
  velmora: [
    { id: "CL-014", text: "52% reached PASI 90 at Week 16 vs 18% with placebo", source: "EMBRACE-3 · Primary endpoint" },
    { id: "CL-031", text: "Clear or almost clear skin by Week 16", source: "EMBRACE-3 · Secondary endpoint", short: true },
    { id: "CL-022", text: "One tablet, once a day", source: "Prescribing Information §2.1", short: true },
  ],
  onkavia: [
    { id: "CL-102", text: "41% reached at least 35% spleen volume reduction at Week 24 vs 1% with placebo", source: "RELIEF-MF · Primary endpoint" },
    { id: "CL-108", text: "Meaningful symptom relief by Week 24", source: "RELIEF-MF · Secondary endpoint", short: true },
    { id: "CL-115", text: "Oral, twice-daily dosing", source: "Prescribing Information §2.1", short: true },
  ],
  nirvexa: [
    { id: "CL-301", text: "ACR50 response in 46% at Week 24 vs 15% with placebo", source: "TARGET-RA · Primary endpoint" },
    { id: "CL-305", text: "One injection every two weeks", source: "Prescribing Information §2", short: true },
  ],
  pulmovax: [
    { id: "CL-201", text: "27% fewer severe asthma attacks vs albuterol alone", source: "MANDALA · Primary endpoint" },
    { id: "CL-204", text: "Rescue and anti-inflammatory in one inhaler", source: "Prescribing Information §1", short: true },
  ],
  /* Device claims trace to the clearance summary, the study behind it, or the Instructions for Use. */
  "device-glucora": [
    { id: "DC-201", text: "Glucose readings every minute, without routine fingersticks", source: "510(k) summary · Indications for Use" },
    { id: "DC-204", text: "14 days of wear per sensor", source: "Instructions for Use §1", short: true },
  ],
  "device-cardiyn": [
    { id: "DC-301", text: "98% free of major complications at 12 months", source: "LEAP pivotal study · Primary safety endpoint" },
    { id: "DC-305", text: "No leads, no chest pocket", source: "Instructions for Use §1", short: true },
  ],
  "device-pulseva": [
    { id: "DC-401", text: "Detected atrial fibrillation with 96% sensitivity vs a 12-lead ECG", source: "PULSE-AF validation study" },
    { id: "DC-404", text: "Wear for up to 14 days", source: "Instructions for Use §2", short: true },
  ],
};

export function adClaims(brandId: string): AdClaim[] {
  return AD_CLAIMS[brandId] ?? [];
}

/** The label the ads are built from, for the Sources row. */
export function labelVersion(brandId: string): string {
  if (isDeviceId(brandId)) return `Instructions for Use and ${medtechDevice(brandId)?.clearance ?? "FDA clearance"} summary`;
  if (isDiseaseId(brandId)) return "CDC disease information and your sources";
  return brandId in AD_CLAIMS ? "Prescribing Information, Rev. 04/2026" : "Prescribing Information on file";
}

/** One recommended headline and two alternatives, for the kind of ad. */
export function leadMessages(adType: AdType, brandName: string, claims: AdClaim[], condition?: string): string[] {
  if (adType === "unbranded") {
    /* About the condition, never the product. */
    return condition
      ? [
          `Living with ${condition}? Talk to your doctor.`,
          `${condition.charAt(0).toUpperCase()}${condition.slice(1)} is more than what people see.`,
          `Ask your doctor what your options for ${condition} really are.`,
        ]
      : [
          "You don't have to settle for living with symptoms.",
          "It's more than what people see. Talk to your doctor.",
          "Ask your doctor what your options really are.",
        ];
  }
  if (adType === "reminder") {
    return [`${brandName}. Ask your doctor.`, `Remember ${brandName}.`, `${brandName}: talk to your doctor today.`];
  }
  if (claims.length === 0) return [];
  const lead = claims.find((c) => c.short)?.text ?? claims[0].text;
  return [...new Set([lead, claims[0].text, `${brandName}. ${claims[claims.length - 1].text}`])];
}

export const NEXT_STEPS = ["Talk to their doctor", "Sign up for savings", "Visit the brand site", "Find a specialist"] as const;

/** The closing line every ad ends on, from the next step. */
export function closingLine(nextStep: string, adType: AdType, brandName: string): string {
  const name = adType === "unbranded" ? "your options" : brandName;
  switch (nextStep) {
    case "Sign up for savings":
      return adType === "unbranded" ? "Ask your doctor about support programmes." : `Pay as little as $0 with the ${brandName} savings card.`;
    case "Visit the brand site":
      return adType === "unbranded" ? "Learn more about the condition." : `Learn more about ${brandName}.`;
    case "Find a specialist":
      return "Find a specialist near you.";
    default:
      return `Ask your doctor about ${name}.`;
  }
}

/**
 * The key message, claims and closing line, crafted from what the marketer
 * said in the chat and the files they attached.
 *
 * Nothing they type goes into an ad as it is. Their words are matched to
 * the brand's approved claims, and the options offered are written from that
 * approved wording, so every line still traces to a claim. A result they
 * mention that no approved claim states is reported, never used.
 */
export interface CraftedMessage {
  messages: string[];
  claimIds: string[];
  nextStep?: string;
  /** A result in their input that no approved claim states. */
  unmatched?: string;
}

const STOP = new Set(["that", "this", "with", "from", "have", "want", "should", "about", "their", "they", "them", "make", "more", "less", "like", "line", "key", "message", "claim", "claims", "closing", "ads", "week", "weeks"]);
const words = (text: string) => text.toLowerCase().match(/[a-z0-9%]+/g)?.filter((w) => w.length > 3 && !STOP.has(w)) ?? [];

export function craftKeyMessage(input: string, files: string[], ctx: { adType: AdType; brandName: string; claims: AdClaim[]; current: string[] }): CraftedMessage {
  const said = `${input} ${files.join(" ")}`;
  const lower = said.toLowerCase();
  const nextStep = /saving|copay|co-pay|\$0|afford/.test(lower)
    ? "Sign up for savings"
    : /website|site|learn more|hcp portal/.test(lower)
      ? "Visit the brand site"
      : /specialist|find a doctor/.test(lower)
        ? "Find a specialist"
        : /ask (your|their) doctor|talk to/.test(lower)
          ? "Talk to their doctor"
          : undefined;

  /* Unbranded: no product claims, so only the disease-awareness lines, ordered by what was said. */
  if (ctx.adType !== "product-claim") {
    const said_ = words(said);
    const base = leadMessages(ctx.adType, ctx.brandName, ctx.claims);
    const ranked = [...base].sort((a, b) => words(b).filter((w) => said_.includes(w)).length - words(a).filter((w) => said_.includes(w)).length);
    return { messages: ranked, claimIds: [], nextStep };
  }

  const numbers = said.match(/\d+(\.\d+)?%?/g) ?? [];
  const tokens = words(said);
  const scored = ctx.claims
    .map((c) => {
      const text = `${c.text} ${c.source}`.toLowerCase();
      const hits = tokens.filter((t) => text.includes(t)).length + numbers.filter((n) => text.includes(n.toLowerCase())).length * 2;
      return { c, hits };
    })
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .map((x) => x.c);

  /* A number they gave that no approved claim contains. */
  const strayNumber = numbers.find((n) => n.length > 1 && !ctx.claims.some((c) => c.text.includes(n)));
  /* Just the phrase with the number in it, not the whole sentence around it. */
  const unmatched = strayNumber
    ? said.split(/[.\n,;]|\band\b|\bbut\b|\bthat\b/).find((part) => part.includes(strayNumber))?.trim()
    : undefined;

  const picked = scored.length ? scored : ctx.claims.filter((c) => ctx.current.includes(c.id));
  const lead = picked[0] ?? ctx.claims[0];
  const shortOne = picked.find((c) => c.short && c.id !== lead.id) ?? ctx.claims.find((c) => c.short && c.id !== lead.id);
  const messages = [
    lead.text,
    `${ctx.brandName}. ${lead.short ? lead.text : (shortOne ?? lead).text}`,
    ...(shortOne ? [`${lead.short ? lead.text : shortOne.text}. ${lead.short ? shortOne.text : lead.text}`.replace(/\.\./g, ".")] : []),
  ];
  return {
    messages: [...new Set(messages)].slice(0, 3),
    claimIds: [...new Set([lead.id, ...picked.slice(1, 2).map((c) => c.id), ...(shortOne && !picked.length ? [shortOne.id] : [])])],
    nextStep,
    unmatched,
  };
}

/** The best guess at the next step, before anyone answers. */
export function defaultNextStep(kind: AdKind, audience: Audience): string {
  if (kind === "savings") return "Sign up for savings";
  if (audience === "HCP") return "Visit the brand site";
  return "Talk to their doctor";
}

/** Placements grouped by account, in the order the accounts are listed. */
export function placementsByAccount(placements: AdPlacement[]) {
  return AD_ACCOUNTS.map((account) => ({
    account,
    rows: AD_PLACEMENTS.filter((p) => p.account === account.id && placements.includes(p.id)),
  })).filter((g) => g.rows.length > 0);
}
