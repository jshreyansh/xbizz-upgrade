/**
 * The five layout families, with a sample of each.
 *
 * Kept apart from the plan and template screens because both show them and
 * the studio names them: five families is the shortlist a person chooses
 * from, and the thousand-odd variants behind them live in template-library.
 */

export interface TemplateArchetype {
  id: "stat-hero" | "trial-summary" | "bench-data" | "moa-scroll" | "burden-disease";
  name: string;
  tagline: string;
  accent: string;
  previewBg: string;
  badge: string;
  metric: string;
  metricSub: string;
  points: string[];
}

export const TEMPLATE_ARCHETYPES: TemplateArchetype[] = [
  {
    id: "stat-hero",
    name: "Stat Hero",
    tagline: "A dark hero band, then two oversized headline figures, an icon grid and one chart. Suits a single result read from across a room.",
    accent: "#fd4816",
    previewBg: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
    badge: "PASI 90 Primary Readout",
    metric: "52% PASI 90",
    metricSub: "vs 18% Placebo (p < 0.001)",
    points: ["Over 50% skin clearance at Week 16", "Maintained through Week 52 extension", "Single daily oral administration"],
  },
  {
    id: "trial-summary",
    name: "Trial Summary",
    tagline: "Light and airy: pulled-out highlights box, credential bullets and time-course chart. For a single trial told properly.",
    accent: "#0284c7",
    previewBg: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    badge: "EMBRACE-3 Pivotal Study",
    metric: "N=613 Patients",
    metricSub: "Multi-Center Randomized Trial",
    points: ["Dual kinase blockade mechanism", "FDA §2.1 label indication partition", "Zero microvascular adverse accumulation"],
  },
  {
    id: "bench-data",
    name: "Bench Data",
    tagline: "Circular callouts around measured values, with horizontal bar comparisons under them. Suits a head-to-head on key metrics.",
    accent: "#059669",
    previewBg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    badge: "Pharmacokinetic Profile",
    metric: "eGFR ≥25",
    metricSub: "Prescribing Cut-Off Threshold",
    points: ["Clear therapeutic window boundary", "Predictable systemic clearance", "Validated in renal impairment cohorts"],
  },
  {
    id: "moa-scroll",
    name: "Anatomy & MoA Scroll",
    tagline: "3D cellular pathways with dual kinase cascade diagram and tissue uptake markers.",
    accent: "#7c3aed",
    previewBg: "linear-gradient(135deg, #1e1035 0%, #2e1852 100%)",
    badge: "3D Cellular Cascade",
    metric: "Dual Kinase Block",
    metricSub: "Receptor Selectivity >350x",
    points: ["Selectively suppresses inflammatory cytokines", "Preserves peripheral vascular perfusion", "Fast receptor binding in dermis"],
  },
  {
    id: "burden-disease",
    name: "Burden of Disease",
    tagline: "Population epidemiology hero chart with prevalence curves and unmet need callouts.",
    accent: "#d97706",
    previewBg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    badge: "Epidemiological Need",
    metric: "8.2M Patients",
    metricSub: "Moderate-to-Severe Psoriasis",
    points: ["High flare recurrence under topical-only", "Substantial quality of life disruption", "Urgent requirement for targeted oral options"],
  },
];
