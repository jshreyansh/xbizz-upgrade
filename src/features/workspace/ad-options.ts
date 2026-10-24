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
export const AD_AUDIENCES: Audience[] = ["Patient", "HCP"];

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
  { id: "youtube", account: "Google Ads", label: "YouTube", makes: ["video"], sizes: "16:9 skippable in-stream, 9:16 Shorts · 6 sec bumpers for reminders", audiences: ["Patient", "HCP"] },
  { id: "google-search", account: "Google Ads", label: "Search", makes: ["text"], sizes: "Up to 15 headlines and 4 descriptions · Google mixes them", audiences: ["Patient", "HCP"] },
  { id: "google-display", account: "Google Ads", label: "Display", makes: ["banner"], sizes: "Image banners in fixed sizes, with a static safety band", audiences: ["Patient", "HCP"] },
  { id: "meta-feed", account: "Meta Ads", label: "Feed", makes: ["video", "image", "carousel"], sizes: "1:1 and 4:5", audiences: ["Patient", "HCP"] },
  { id: "meta-reels-stories", account: "Meta Ads", label: "Reels & Stories", makes: ["video", "image"], sizes: "9:16 full screen", audiences: ["Patient", "HCP"] },
  { id: "linkedin-feed", account: "LinkedIn Ads", label: "Feed", makes: ["image", "video", "carousel", "document"], sizes: "1:1 image and video, square carousel, PDF document", audiences: ["HCP", "Patient"] },
  { id: "programmatic-display", account: "Programmatic", label: "Display", makes: ["banner"], sizes: "HTML5 banners with scrolling safety information", audiences: ["Patient", "HCP"] },
  { id: "programmatic-video", account: "Programmatic", label: "Online video", makes: ["video"], sizes: "16:9 · 15 or 30 sec", audiences: ["Patient", "HCP"] },
  { id: "ctv", account: "Programmatic", label: "Connected TV", makes: ["video"], sizes: "16:9 TV spot · 15, 30 or 60 sec", audiences: ["Patient"] },
  { id: "hcp-networks", account: "HCP networks", label: "In-feed and banners", makes: ["video", "image"], sizes: "Each network's own specs", audiences: ["HCP"] },
  { id: "tiktok", account: "TikTok Ads", label: "In-feed", makes: ["video", "carousel"], sizes: "9:16 video and image carousels", audiences: ["Patient", "HCP"] },
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
  indications: Array<{ label: string; isNew?: boolean; condition?: string; onlyTreatment?: boolean }>;
}

const BRAND_AD_FACTS: Record<string, BrandAdFacts> = {
  velmora: {
    boxedWarning: false,
    genericAvailable: false,
    indications: [
      { label: "Cardiovascular risk reduction in plaque psoriasis", isNew: true, condition: "heart risk in psoriasis" },
      { label: "Moderate-to-severe plaque psoriasis in adults", condition: "plaque psoriasis" },
    ],
  },
  onkavia: {
    boxedWarning: true,
    genericAvailable: false,
    indications: [
      { label: "Polycythemia vera after hydroxyurea", isNew: true, condition: "polycythemia vera" },
      { label: "Intermediate or high-risk myelofibrosis", condition: "myelofibrosis", onlyTreatment: true },
    ],
  },
  nirvexa: {
    boxedWarning: true,
    genericAvailable: false,
    indications: [{ label: "Moderate-to-severe rheumatoid arthritis in adults", condition: "rheumatoid arthritis" }],
  },
  cardioxa: {
    boxedWarning: true,
    genericAvailable: false,
    indications: [{ label: "Heart failure with reduced ejection fraction", condition: "heart failure" }],
  },
  pulmovax: {
    boxedWarning: false,
    genericAvailable: true,
    indications: [
      { label: "As-needed relief in asthma, ages 12 and up", isNew: true, condition: "asthma in teens" },
      { label: "As-needed relief in asthma, adults", condition: "asthma" },
    ],
  },
  /* Medical devices: their intended use stands in for an indication. */
  "device-glucora": { boxedWarning: false, genericAvailable: false, indications: [{ label: "Glucose monitoring in people with diabetes, ages 2 and up", condition: "diabetes" }] },
  "device-cardiyn": { boxedWarning: false, genericAvailable: false, indications: [{ label: "Pacing for slow heart rhythms (bradycardia)", condition: "a slow heart rhythm" }] },
  "device-pulseva": { boxedWarning: false, genericAvailable: false, indications: [{ label: "Detecting atrial fibrillation from a wearable ECG", condition: "atrial fibrillation" }] },
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
export function adSamplePrompts(kind: AdKind, brand: string): Array<{ id: string; tag: string; prompt: string }> {
  const byKind: Record<AdKind, Array<{ id: string; tag: string; prompt: string }>> = {
    scratch: [
      { id: "launch", tag: "Patient Launch", prompt: `Launch ${brand} to adults with moderate-to-severe plaque psoriasis. Lead with clear skin at Week 16 and drive people to the savings card.` },
      { id: "hcp", tag: "HCP Awareness", prompt: `Reach dermatologists with the EMBRACE-3 result for ${brand} and send them to the HCP site to request samples.` },
      { id: "awareness", tag: "Disease Awareness", prompt: `An unbranded campaign about living with plaque psoriasis that ends with “talk to your dermatologist”.` },
    ],
    "brand-launch": [
      { id: "clear-skin", tag: "Clear Skin Launch", prompt: `Launch ${brand} to adults with moderate-to-severe plaque psoriasis. Lead with clear skin at Week 16 and drive people to the savings card.` },
      { id: "once-daily", tag: "Once-Daily Story", prompt: `Introduce ${brand} as one tablet, once a day, with the EMBRACE-3 result and a link to find a dermatologist.` },
      { id: "caregiver", tag: "Caregivers", prompt: `Launch ads for caregivers of adults with plaque psoriasis, explaining what ${brand} is and how to ask about it.` },
    ],
    "disease-awareness": [
      { id: "living-with", tag: "Living With It", prompt: `An unbranded campaign about the everyday burden of plaque psoriasis that ends with “talk to your dermatologist”.` },
      { id: "symptom-check", tag: "Symptom Check", prompt: `Short videos helping people recognise when psoriasis is moderate to severe, linking to an unbranded symptom checker.` },
      { id: "myths", tag: "Myth vs Fact", prompt: `A carousel busting three common myths about plaque psoriasis, with no product named or implied.` },
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
