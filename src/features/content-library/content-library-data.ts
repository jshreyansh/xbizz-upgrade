import type { AssetType } from "@/types/content";

/**
 * Assets that have been published — the ones a shared link already points at.
 *
 * Each row names the demo scenario it was built from, so opening one loads
 * that project's real state and lands on its shared review rather than on a
 * mock of it. The library is a way back into work that exists, not a gallery
 * of pictures of it.
 */
export interface LibraryAsset {
  id: string;
  title: string;
  /** Which studio owns it, and therefore which review view opens. */
  kind: AssetType;
  /** The demo scenario whose inputs rebuild this project. */
  scenarioId: string;
  brand: string;
  audience: string;
  /** "16:9 · 50 sec" for video, "A4 · 2 pages" for a creative. */
  spec: string;
  status: "Published" | "In MLR review" | "Approved";
  /**
   * Where it is in its life, which is a different question from its review
   * status: a draft can be in MLR, and an archived asset was published once.
   */
  stage: "draft" | "published" | "archived";
  updated: string;
  views: number;
  comments: number;
  gradient: string;
  /** Video assets show the reel itself — the same files the studio plays. */
  videoSrc?: string;
  /** Doc & image assets show their own composition instead: the badge they
   *  carry and the figure they lead on, which is what tells two decks apart. */
  badge?: string;
  metric?: string;
  metricLabel?: string;
}

export const LIBRARY_ASSETS: LibraryAsset[] = [
  {
    id: "velmora-hcp-launch",
    title: "Velmora HCP Launch Film",
    kind: "video",
    scenarioId: "hcp-launch",
    brand: "Velmora",
    audience: "HCP · Dermatology",
    spec: "16:9 · 50 sec",
    status: "Published",
    stage: "published",
    updated: "Sep 19, 2026",
    views: 412,
    comments: 3,
    gradient: "linear-gradient(150deg,#0f2d22,#14532d 55%,#1f7a4d)",
    videoSrc: "/reel-moa.mp4",
  },
  {
    id: "velmora-leave-behind",
    title: "Velmora Mechanism of Action Panel",
    kind: "infographic",
    scenarioId: "mechanism-infographic",
    brand: "Velmora",
    audience: "HCP · Dermatology",
    spec: "Landscape · 1 page",
    status: "Published",
    stage: "published",
    updated: "Sep 18, 2026",
    views: 288,
    comments: 1,
    gradient: "linear-gradient(150deg,#111827,#1f2937 55%,#334155)",
    badge: "Cellular Pathway",
    metric: "Dual Kinase Block",
    metricLabel: "Targeted cytokine clearance",
  },
  {
    id: "velmora-patient-explainer",
    title: "Velmora Patient Explainer",
    kind: "video",
    scenarioId: "patient-education",
    brand: "Velmora",
    audience: "Patients",
    spec: "16:9 · 45 sec",
    status: "In MLR review",
    stage: "draft",
    updated: "Sep 21, 2026",
    views: 96,
    comments: 5,
    gradient: "linear-gradient(150deg,#3b1d5e,#5b21b6 55%,#7c3aed)",
    videoSrc: "/27019-361107952_medium.mp4",
  },
  {
    id: "onkavia-kol-briefing",
    title: "Onkavia KOL Digital Twin Briefing",
    kind: "video",
    scenarioId: "presenter-social",
    brand: "Onkavia",
    audience: "HCP · Oncology",
    spec: "9:16 · 40 sec",
    status: "Approved",
    stage: "published",
    updated: "Sep 15, 2026",
    views: 173,
    comments: 0,
    gradient: "linear-gradient(150deg,#0c2740,#0e4f6e 55%,#1d7fa8)",
    videoSrc: "/avatar-showcase.mp4",
  },
  {
    id: "onkavia-congress-poster",
    title: "Onkavia Stat Leave-Behind",
    kind: "infographic",
    scenarioId: "stat-leavebehind",
    brand: "Onkavia",
    audience: "HCP · Oncology",
    spec: "A4 print · 1 page",
    status: "Published",
    stage: "published",
    updated: "Sep 15, 2026",
    views: 134,
    comments: 2,
    gradient: "linear-gradient(150deg,#3a1414,#7f1d1d 55%,#b91c1c)",
    badge: "Clinical Infographic",
    metric: "52% PASI 90",
    metricLabel: "vs 18% Placebo (p < 0.001)",
  },
  {
    id: "nirvexa-field-aid",
    title: "Nirvexa Field Detail Aid",
    kind: "infographic",
    scenarioId: "field-detail-aid",
    brand: "Nirvexa",
    audience: "Field force",
    spec: "16:9 · 3 pages",
    status: "In MLR review",
    stage: "draft",
    updated: "Sep 8, 2026",
    views: 61,
    comments: 4,
    gradient: "linear-gradient(150deg,#12303a,#155e75 55%,#0891b2)",
    badge: "Interactive Detail Aid",
    metric: "N=613 Patients",
    metricLabel: "Multi-centre randomised trial",
  },
  {
    id: "nirvexa-silent-social",
    title: "Nirvexa Silent Social Cut",
    kind: "video",
    scenarioId: "visual-only",
    brand: "Nirvexa",
    audience: "HCP · Immunology",
    spec: "9:16 · 30 sec",
    status: "Published",
    stage: "archived",
    updated: "Sep 1, 2026",
    views: 502,
    comments: 0,
    gradient: "linear-gradient(150deg,#1c1917,#44403c 55%,#78716c)",
    videoSrc: "/40781-426939561_medium.mp4",
  },
  {
    id: "cardioxa-burden",
    title: "Cardioxa Patient Explainer Sheet",
    kind: "infographic",
    scenarioId: "patient-explainer-sheet",
    brand: "Cardioxa",
    audience: "Patients",
    spec: "3:4 tablet · 1 page",
    status: "Approved",
    stage: "archived",
    updated: "Aug 24, 2026",
    views: 219,
    comments: 1,
    gradient: "linear-gradient(150deg,#422006,#854d0e 55%,#ca8a04)",
    badge: "Burden of Disease",
    metric: "1 in 4 adults",
    metricLabel: "Living with the condition untreated",
  },
];
