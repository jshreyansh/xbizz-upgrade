import { create } from "zustand";
import type { BrandKit } from "@/features/settings/settings-types";
import { PERSONA } from "@/features/workspace/mock-personas";

/**
 * The Therapy Library: unbranded, disease-level grounding, the way the
 * Product Library is for brands. A therapy area holds one dossier per
 * disease, either uploaded or made by SwishX from cited sources. Once it is
 * in, it is read-only: changing it means a new version, and the old one is kept.
 */

export type TherapyOrigin = "swishx" | "upload";

export interface TherapyVersion {
  version: number;
  origin: TherapyOrigin;
  fileName?: string;
  updated: string;
  by: string;
}

export interface TherapyDossier extends TherapyVersion {
  id: string;
  areaId: string;
  diseaseId: string;
  disease: string;
  /** "making" while SwishX writes it or reads the uploaded file. */
  status: "making" | "ready";
  sections: number;
  sources: number;
  /** Earlier versions, newest first. Nothing is thrown away. */
  previous: TherapyVersion[];
}

export interface TherapyImage {
  id: string;
  name: string;
  url?: string;
  /** Illustration stand-in for seeded images, which have no file. */
  gradient?: string;
  note?: string;
  /** The disease dossier it belongs to. Without one it belongs to the whole area, and every disease in it can use it. */
  dossierId?: string;
}

/** What a dossier made by SwishX covers. Uploaded ones are read into the same sections. */
export const THERAPY_SECTIONS = [
  "Disease Overview",
  "Epidemiology",
  "Signs and Symptoms",
  "Diagnosis",
  "Treatment Landscape",
  "Patient Journey and Unmet Need",
];

const today = () => new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const by = PERSONA.name;

/* Sample library for the seeded workspace (mock data, no real dossier content). */
const SEED: TherapyDossier[] = [
  {
    id: "td-lung-cancer", areaId: "oncology", diseaseId: "disease-lung-cancer", disease: "Lung Cancer",
    status: "ready", origin: "swishx", version: 2, updated: "4 Nov 2026", by, sections: 6, sources: 38,
    previous: [{ version: 1, origin: "upload", fileName: "lung-cancer-landscape-2025.pdf", updated: "12 Aug 2026", by }],
  },
  {
    id: "td-breast-cancer", areaId: "oncology", diseaseId: "disease-breast-cancer", disease: "Breast Cancer",
    status: "ready", origin: "upload", fileName: "breast-cancer-disease-dossier.pdf", version: 1, updated: "21 Oct 2026", by, sections: 6, sources: 24,
    previous: [],
  },
  {
    id: "td-heart-failure", areaId: "cardiology", diseaseId: "disease-heart-failure", disease: "Heart Failure",
    status: "ready", origin: "swishx", version: 1, updated: "30 Oct 2026", by, sections: 6, sources: 31,
    previous: [],
  },
];

const SEED_IMAGES: Record<string, TherapyImage[]> = {
  oncology: [
    { id: "ti-onc-1", name: "awareness-hero.jpg", gradient: "linear-gradient(135deg,#f6d5e1,#c9a7f0)", note: "Campaign hero" },
    { id: "ti-onc-2", name: "patient-portrait.jpg", gradient: "linear-gradient(135deg,#ffe3c4,#f3a683)", note: "Patient, consented" },
    { id: "ti-onc-3", name: "lung-screening.jpg", gradient: "linear-gradient(135deg,#d6e9ff,#8fb8f0)", note: "Screening campaign", dossierId: "td-lung-cancer" },
  ],
};

interface TherapyLibraryState {
  dossiers: TherapyDossier[];
  images: Record<string, TherapyImage[]>;
  /** Brand kits by therapy area id, or by dossier id where a disease has its own. */
  kits: Record<string, BrandKit>;
  /** Adds a dossier, or a new version of the one already there for that disease. */
  addDossier: (input: { areaId: string; diseaseId: string; disease: string; origin: TherapyOrigin; fileName?: string }) => string;
  addImages: (areaId: string, images: TherapyImage[]) => void;
  removeImage: (areaId: string, id: string) => void;
  setKit: (key: string, kit: BrandKit | undefined) => void;
  /** Per workspace, like the Product Library. */
  stash: Record<string, Pick<TherapyLibraryState, "dossiers" | "images" | "kits">>;
  switchWorkspace: (from: string, to: string) => void;
  ensureWorkspace: (id: string) => void;
}

export const useTherapyLibraryStore = create<TherapyLibraryState>((set, get) => ({
  dossiers: SEED,
  images: SEED_IMAGES,
  kits: {},
  addDossier: ({ areaId, diseaseId, disease, origin, fileName }) => {
    const existing = get().dossiers.find((d) => d.diseaseId === diseaseId);
    const id = existing?.id ?? `td-${diseaseId}-${Date.now().toString(36)}`;
    const fresh: TherapyDossier = {
      id, areaId, diseaseId, disease, origin, fileName,
      status: "making",
      version: existing ? existing.version + 1 : 1,
      updated: today(), by,
      sections: THERAPY_SECTIONS.length,
      sources: existing?.sources ?? 0,
      previous: existing
        ? [{ version: existing.version, origin: existing.origin, fileName: existing.fileName, updated: existing.updated, by: existing.by }, ...existing.previous]
        : [],
    };
    set((s) => ({ dossiers: existing ? s.dossiers.map((d) => (d.id === id ? fresh : d)) : [fresh, ...s.dossiers] }));
    /* SwishX writes it, or reads the file, then it is ready to use. */
    setTimeout(() => {
      set((s) => ({
        dossiers: s.dossiers.map((d) =>
          d.id === id && d.status === "making" ? { ...d, status: "ready", sources: origin === "swishx" ? 28 + (disease.length % 14) : 12 + (disease.length % 9) } : d
        ),
      }));
    }, origin === "swishx" ? 4500 : 2500);
    return id;
  },
  addImages: (areaId, images) => set((s) => ({ images: { ...s.images, [areaId]: [...images, ...(s.images[areaId] ?? [])] } })),
  removeImage: (areaId, id) => set((s) => ({ images: { ...s.images, [areaId]: (s.images[areaId] ?? []).filter((i) => i.id !== id) } })),
  setKit: (key, kit) =>
    set((s) => {
      const kits = { ...s.kits };
      if (kit) kits[key] = kit;
      else delete kits[key];
      return { kits };
    }),
  stash: {},
  switchWorkspace: (from, to) =>
    set((s) => {
      const stash = { ...s.stash, [from]: { dossiers: s.dossiers, images: s.images, kits: s.kits } };
      const next = stash[to] ?? { dossiers: [], images: {}, kits: {} };
      delete stash[to];
      return { stash, ...next };
    }),
  ensureWorkspace: (id) => set((s) => (s.stash[id] ? s : { stash: { ...s.stash, [id]: { dossiers: [], images: {}, kits: {} } } })),
}));
