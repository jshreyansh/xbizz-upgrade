/**
 * Data for the brand dossier modal: brands, dossiers, therapy areas,
 * audiences, focus topics and output shapes.
 *
 * Moved out of brand-dossier-modal.tsx verbatim — this is a pure move,
 * with no changes to any value. It kept ~200 lines of fixture data ahead
 * of the component that renders it.
 *
 * .tsx rather than .ts because SHAPE_OPTIONS carries renderIcon JSX.
 */

import type { ProductType } from "@/features/product-library/product-library-types";
import {
  Activity,
  AlertCircle,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Box,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  FileSpreadsheet,
  FileText,
  Heart,
  HeartHandshake,
  MessageSquareQuote,
  Package,
  Pill,
  Scale,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Stethoscope,
  Target,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { Audience } from "@/types/content";


export interface BrandItem {
  id: string;
  name: string;
  genericName: string;
  therapyAreas: string[];
  hasDossier: boolean;
  dossierIds?: string[];
  /** What the product physically is — decides its packshot and the
   *  presentations it ships in. Carried over from the Product Library. */
  type?: ProductType;
  gradient?: string;
  referenceImageUrl?: string;
}

export interface DossierItem {
  id: string;
  brandId: string;
  name: string;
  molecule: string;
  market: string;
  sections: number;
  claims: number;
  heldOut: number;
  avatarBg: string;
  skeletonWidths: number[];
  isSample?: boolean;
  documents?: Array<{ name: string; citations: number }>;
}

export const INITIAL_BRANDS: BrandItem[] = [
  { id: "velmora", name: "Velmora", genericName: "tirzelamide", therapyAreas: ["Dermatology", "Cardiology"], hasDossier: true, dossierIds: ["velmora-commercial", "velmora-smpc", "velmora-heor"] },
  { id: "onkavia", name: "Onkavia", genericName: "relunocitinib", therapyAreas: ["Oncology"], hasDossier: true, dossierIds: ["onkavia-ema", "onkavia-fda"] },
  { id: "nirvexa", name: "Nirvexa", genericName: "brentaxaban", therapyAreas: ["Immunology"], hasDossier: true, dossierIds: ["nirvexa-mhra", "nirvexa-fda"] },
  { id: "cardioxa", name: "Cardioxa", genericName: "levomilnacipran ER", therapyAreas: ["Cardiology"], hasDossier: true, dossierIds: ["cardioxa-sample"], type: "Tablet", gradient: "linear-gradient(150deg,#0f766e,#14b8a6 55%,#5eead4)" },
  { id: "pulmovax", name: "PulmoVax", genericName: "albuterol / budesonide", therapyAreas: ["Respiratory"], hasDossier: true, dossierIds: ["pulmovax-sample"], type: "Device", gradient: "linear-gradient(150deg,#1d4ed8,#3b82f6 55%,#93c5fd)" },
  { id: "3d", name: "3D", genericName: "Diclofenac", therapyAreas: ["Rheumatology & Musculoskeletal"], hasDossier: false },
  { id: "3d-flam", name: "3D Flam", genericName: "Diclofenac", therapyAreas: ["Rheumatology & Musculoskeletal"], hasDossier: false },
  { id: "3d-plus", name: "3D-Plus", genericName: "Diclofenac + Paracetamol", therapyAreas: ["Rheumatology & Musculoskeletal"], hasDossier: false },
  { id: "abd-1", name: "ABD 1", genericName: "Abacavir + Dolutegravir", therapyAreas: ["Anti-infectives"], hasDossier: false },
  { id: "dermora", name: "Dermora", genericName: "dermoclizine fumarate", therapyAreas: ["Dermatology"], hasDossier: false },
  { id: "pulmavia", name: "Pulmavia", genericName: "pulmavatinib citrate", therapyAreas: ["Respiratory"], hasDossier: false },
  { id: "renalis", name: "Renalis", genericName: "renalisertib sodium", therapyAreas: ["Nephrology & Urology"], hasDossier: false },
];

export const DOSSIERS: Record<string, DossierItem> = {
  "velmora-commercial": {
    id: "velmora-commercial", brandId: "velmora", name: "Velmora Commercial Launch Dossier", molecule: "tirzelamide", market: "US · FDA",
    sections: 18, claims: 214, heldOut: 0, avatarBg: "linear-gradient(140deg,#4f83ff,#1d4ed8)", skeletonWidths: [88, 72, 94, 60, 80],
    documents: [{ name: "FDA Approved Prescribing Information (Rev. 04/2026)", citations: 112 }, { name: "CLARITY-CV Phase III Pivotal Readout (NEJM 2025)", citations: 64 }, { name: "Global HEOR Budget Impact & QALY Analysis", citations: 20 }, { name: "ClinicalTrials.gov Protocol NCT04892110", citations: 18 }],
  },
  "velmora-smpc": {
    id: "velmora-smpc", brandId: "velmora", name: "Velmora EU Summary of Product Characteristics (SmPC)", molecule: "tirzelamide", market: "EU · EMA",
    sections: 19, claims: 186, heldOut: 0, avatarBg: "linear-gradient(140deg,#22c07a,#12784a)", skeletonWidths: [92, 65, 84, 55, 78],
    documents: [{ name: "EMA Approved Summary of Product Characteristics (SmPC)", citations: 104 }, { name: "EU Multi-Center CLARITY-EU Phase III Sub-study", citations: 52 }, { name: "European HTA Joint Clinical Assessment Submission", citations: 30 }],
  },
  "velmora-heor": {
    id: "velmora-heor", brandId: "velmora", name: "Velmora HEOR & Value Evidence Dossier", molecule: "tirzelamide", market: "Global · HEOR",
    sections: 14, claims: 128, heldOut: 0, avatarBg: "linear-gradient(140deg,#f59e0b,#d97706)", skeletonWidths: [80, 85, 70, 90, 65],
    documents: [{ name: "Global Health Economics & QALY Impact Dossier", citations: 76 }, { name: "30-Day Hospital Readmission Reduction Health Economic Model", citations: 52 }],
  },
  "onkavia-ema": {
    id: "onkavia-ema", brandId: "onkavia", name: "Onkavia Clinical Reference Dossier", molecule: "relunocitinib", market: "EU · EMA",
    sections: 19, claims: 188, heldOut: 0, avatarBg: "linear-gradient(140deg,#22c07a,#12784a)", skeletonWidths: [92, 65, 84, 55, 78],
    documents: [{ name: "EMA Summary of Product Characteristics (SmPC)", citations: 96 }, { name: "EMBRACE-3 Pivotal Trial Readout (Lancet Oncology)", citations: 58 }, { name: "EU HEOR Relative Effectiveness Dossier", citations: 34 }],
  },
  "onkavia-fda": {
    id: "onkavia-fda", brandId: "onkavia", name: "Onkavia US Prescribing Dossier", molecule: "relunocitinib", market: "US · FDA",
    sections: 17, claims: 172, heldOut: 0, avatarBg: "linear-gradient(140deg,#4f83ff,#1d4ed8)", skeletonWidths: [85, 70, 90, 65, 75],
    documents: [{ name: "FDA Prescribing Information §14 Clinical Studies", citations: 88 }, { name: "US Oncology Core Visual Claims Library", citations: 54 }, { name: "NCCN Clinical Practice Guidelines in Oncology Review", citations: 30 }],
  },
  "nirvexa-mhra": {
    id: "nirvexa-mhra", brandId: "nirvexa", name: "Nirvexa Regulatory Launch Dossier", molecule: "brentaxaban", market: "UK · MHRA",
    sections: 16, claims: 142, heldOut: 0, avatarBg: "linear-gradient(140deg,#a855f7,#7e22ce)", skeletonWidths: [80, 88, 65, 75, 90],
    documents: [{ name: "MHRA Assessment Report & Great Britain Authorisation", citations: 74 }, { name: "NICE Single Technology Appraisal (STA) Submission", citations: 48 }, { name: "Pivotal TARGET-RA Phase III Study Readout", citations: 20 }],
  },
  "nirvexa-fda": {
    id: "nirvexa-fda", brandId: "nirvexa", name: "Nirvexa US Commercial Claims Library", molecule: "brentaxaban", market: "US · FDA",
    sections: 15, claims: 136, heldOut: 0, avatarBg: "linear-gradient(140deg,#4f83ff,#1d4ed8)", skeletonWidths: [82, 74, 86, 68, 70],
    documents: [{ name: "FDA Approved Label (Full Prescribing Info)", citations: 82 }, { name: "US Rheumatology Advisory Board Consensus", citations: 34 }, { name: "ACR Guidelines Evidence Synthesis", citations: 20 }],
  },
  "cardioxa-sample": {
    id: "cardioxa-sample", brandId: "cardioxa", name: "Cardioxa Cardiology Evidence Brief", molecule: "levomilnacipran ER", market: "US · FDA",
    sections: 14, claims: 96, heldOut: 0, avatarBg: "linear-gradient(140deg,#ef4444,#b91c1c)", skeletonWidths: [78, 82, 60, 70, 85],
    documents: [{ name: "FDA Approved Prescribing Information", citations: 58 }, { name: "Heart Failure Association Clinical Review", citations: 38 }],
  },
  "pulmovax-sample": {
    id: "pulmovax-sample", brandId: "pulmovax", name: "PulmoVax Respiratory Core Dossier", molecule: "albuterol / budesonide", market: "US · FDA",
    sections: 15, claims: 110, heldOut: 0, avatarBg: "linear-gradient(140deg,#06b6d4,#0891b2)", skeletonWidths: [85, 75, 90, 65, 80],
    documents: [{ name: "FDA Approved Label & Inhaler Instructions", citations: 68 }, { name: "MANDALA Phase III Pivotal Trial Readout", citations: 42 }],
  },
};

// ── Initial Disease / Therapy Area options ──
export const INITIAL_DISEASE_OPTIONS = [
  { id: "dermatology", label: "Dermatology", desc: "Psoriasis, Eczema, Acne, Atopic Dermatitis" },
  { id: "oncology", label: "Oncology", desc: "Lung Cancer, Breast Cancer, Melanoma, Lymphoma" },
  { id: "cardiology", label: "Cardiology", desc: "Heart Failure, Atrial Fibrillation, Hypertension" },
  { id: "immunology", label: "Immunology & Rheumatology", desc: "Rheumatoid Arthritis, Lupus, Crohn's Disease" },
  { id: "respiratory", label: "Respiratory", desc: "Asthma, COPD, Interstitial Pulmonary Fibrosis" },
  { id: "neurology", label: "Neurology", desc: "Multiple Sclerosis, Parkinson's, Alzheimer's" },
  { id: "diabetes", label: "Diabetes & Metabolism", desc: "Type 1 & Type 2 Diabetes, Obesity, Thyroid" },
  { id: "nephrology", label: "Nephrology & Urology", desc: "CKD, IgA Nephropathy, Bladder Cancer" },
  { id: "gastroenterology", label: "Gastroenterology", desc: "IBD, Ulcerative Colitis, GERD, NAFLD" },
  { id: "anti-infectives", label: "Anti-infectives", desc: "HIV, TB, Bacterial Infections, Antifungals" },
  { id: "psychiatry", label: "Psychiatry & CNS", desc: "Depression, Schizophrenia, ADHD, Anxiety" },
  { id: "endocrinology", label: "Endocrinology", desc: "Thyroid Disorders, Adrenal, Pituitary Conditions" },
];

// ── Initial HCP Specialities ──
export const INITIAL_HCP_SPECIALITIES = [
  "Dermatologist", "Oncologist", "Cardiologist", "Rheumatologist", "Neurologist",
  "Pulmonologist", "Gastroenterologist", "Nephrologist", "Immunologist",
  "General Practitioner", "Endocrinologist", "Psychiatrist",
];

// ── Audience Options ──
export const AUDIENCE_OPTIONS: Array<{ id: Audience; title: string; subtitle: string; icon: any }> = [
  { id: "HCP", title: "HCP", subtitle: "Doctors & Specialists", icon: Stethoscope },
  { id: "Patient", title: "Patients", subtitle: "Clarity & Adherence", icon: HeartHandshake },
  { id: "Field team", title: "Field Force", subtitle: "Detailing & Sales", icon: Briefcase },
  { id: "Hospital", title: "Hospital", subtitle: "Formulary & Value", icon: Building2 },
  { id: "Distributor", title: "Distributors", subtitle: "Trade & Logistics", icon: Truck },
  { id: "Consumer", title: "Consumers", subtitle: "Public Awareness", icon: ShoppingCart },
];

/**
 * Which grounding an audience is allowed to use.
 *
 * A conversation with a prescriber, a rep, a procurement lead or a trade
 * partner is always about a specific product — there is no such thing as a
 * detail aid for a therapy area. Patient and consumer education genuinely can
 * be about the condition itself ("living with psoriasis"), so those two keep
 * the choice. Four of six are brand-only, which is why the toggle is absent
 * rather than disabled: an absent control asks no question.
 */
export const GROUNDING_BY_AUDIENCE: Record<Audience, Array<"brand" | "disease">> = {
  HCP:            ["brand"],
  "Field team":   ["brand"],
  Patient:        ["brand", "disease"],
  Consumer:       ["brand", "disease"],
  Hospital:       ["brand"],
  Distributor:    ["brand"],
};

/**
 * What each audience is actually asked about.
 *
 * Every audience used to get exactly six, and the six were written from the
 * HCP list outwards — a distributor was offered "HTA Submissions" and a
 * consumer "Living with the Condition" because the shape wanted six rows,
 * not because either is a thing those people ask for. The lists are the
 * length the audience makes them: a prescriber has more to decide than a
 * stockist does.
 *
 * Labels only. A one-line gloss under each was explaining the topic to
 * someone who already picked the audience, and six of them turned a choice
 * into a page of reading.
 */
export const TOPICS_BY_AUDIENCE: Record<Audience, Array<{ id: string; label: string; icon: LucideIcon }>> = {
  HCP: [
    { id: "product-intro", label: "Product Introduction", icon: Pill },
    { id: "moa", label: "Mechanism of Action", icon: Activity },
    { id: "indications", label: "Indications", icon: Target },
    { id: "dosage-safety", label: "Dosage & Safety", icon: ShieldCheck },
    { id: "interactions", label: "Drug Interactions", icon: Zap },
    { id: "side-effects", label: "Side Effects", icon: AlertCircle },
    { id: "efficacy", label: "Efficacy & Clinical Readout", icon: TrendingUp },
    { id: "head-to-head", label: "Comparative Head-to-Head", icon: Scale },
  ],
  "Field team": [
    { id: "product-pitch", label: "Product Pitch", icon: Target },
    { id: "key-indications", label: "Key Indications", icon: BookOpen },
    { id: "competitive", label: "Competitive Advantages", icon: TrendingUp },
    { id: "objection-handling", label: "Objection Handling", icon: MessageSquareQuote },
    { id: "dosing-guide", label: "Dosing Guide", icon: Pill },
    { id: "fair-balance", label: "Fair Balance & ISI", icon: ShieldAlert },
  ],
  Patient: [
    { id: "what-it-treats", label: "What It Treats", icon: Sparkles },
    { id: "how-to-take", label: "How to Take It", icon: Pill },
    { id: "safety-side-effects", label: "Safety & Side Effects", icon: AlertCircle },
    { id: "lifestyle-adherence", label: "Lifestyle & Adherence", icon: Heart },
    { id: "how-it-works", label: "How it Works", icon: Activity },
    { id: "what-to-expect", label: "What to Expect", icon: Clock },
    { id: "real-outcomes", label: "Real Patient Outcomes", icon: CheckCircle2 },
  ],
  Consumer: [
    { id: "product-overview-consumer", label: "Product Overview", icon: Package },
    { id: "key-benefits", label: "Key Benefits", icon: Sparkles },
    { id: "how-to-use", label: "How to Use", icon: Pill },
    { id: "safety-basics", label: "Safety Basics", icon: ShieldCheck },
    { id: "who-its-for", label: "Who it's For", icon: Users },
    { id: "talk-to-doctor", label: "Talking to Your Doctor", icon: Stethoscope },
    { id: "lifestyle-tips", label: "Lifestyle Tips", icon: Heart },
  ],
  Hospital: [
    { id: "product-overview-hospital", label: "Product Overview", icon: Package },
    { id: "clinical-evidence", label: "Clinical Evidence", icon: BookOpenCheck },
    { id: "quality-standards", label: "Safety & Quality Standards", icon: ShieldCheck },
    { id: "cost-procurement", label: "Cost & Procurement", icon: Coins },
    { id: "heor", label: "HEOR & QALY", icon: BarChart3 },
    { id: "formulary", label: "Formulary Positioning", icon: Building2 },
    { id: "cost-effectiveness", label: "Cost-Effectiveness", icon: Scale },
    { id: "contracting", label: "Contracting & GPO", icon: FileText },
  ],
  Distributor: [
    { id: "product-overview-trade", label: "Product Overview", icon: Package },
    { id: "market-demand", label: "Market & Demand", icon: TrendingUp },
    { id: "margins", label: "Margins & Commercials", icon: FileSpreadsheet },
    { id: "storage-handling", label: "Storage & Handling", icon: Truck },
    { id: "sku-packaging", label: "SKU & Packaging", icon: Box },
    { id: "reimbursement", label: "Reimbursement Landscape", icon: CreditCard },
  ],
};

// ── Two shapes: landscape and portrait ──
export type OutputShape = "landscape" | "portrait";

export const SHAPE_OPTIONS = [
  {
    id: "landscape" as OutputShape,
    label: "Landscape",
    renderIcon: (isSel: boolean) => (
      <svg className={cn("size-4.5 shrink-0 transition-colors", isSel ? "text-brand" : "text-ink-3")} viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="1.5" y="1.5" width="17" height="11" rx="2" fill={isSel ? "currentColor" : "none"} fillOpacity={isSel ? 0.18 : 0} />
      </svg>
    ),
  },
  {
    id: "portrait" as OutputShape,
    label: "Portrait",
    renderIcon: (isSel: boolean) => (
      <svg className={cn("size-4.5 shrink-0 transition-colors", isSel ? "text-brand" : "text-ink-3")} viewBox="0 0 14 20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="1.5" y="1.5" width="11" height="17" rx="2" fill={isSel ? "currentColor" : "none"} fillOpacity={isSel ? 0.18 : 0} />
      </svg>
    ),
  },
];
