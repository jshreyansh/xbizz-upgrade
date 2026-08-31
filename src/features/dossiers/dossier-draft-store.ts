import { create } from "zustand";
import type { BrandDossier, RegulatoryBody } from "@/features/dossiers/dossier-types";

export type DossierFlowPath = "create" | "upload" | null;

interface DossierDraftState {
  // Step 1 — product & classification
  productId: string;
  brandName: string;
  genericName: string;
  anchor: RegulatoryBody;
  category: string;
  audiences: string[];
  supportingFiles: File[];

  // Step 2 — path
  path: DossierFlowPath;

  // Step 3a — upload
  fileName: string | null;

  // Step 3b — create
  indication: string;

  // Result of the flow (set once processing finishes)
  dossier: BrandDossier | null;

  /** Dossiers created via this flow during the current session — the
   *  /dossiers list page merges these in on mount so a freshly-created
   *  dossier survives navigating away from the new-dossier pages. */
  createdDossiers: BrandDossier[];

  setProduct: (id: string) => void;
  setOtherBrandName: (name: string) => void;
  setOtherGenericName: (name: string) => void;
  setCategory: (category: string) => void;
  toggleAudience: (audience: string) => void;
  addSupportingFiles: (files: File[]) => void;
  setPath: (path: DossierFlowPath) => void;
  setFileName: (name: string | null) => void;
  setIndication: (text: string) => void;
  setDossier: (dossier: BrandDossier | null) => void;
  addCreatedDossier: (dossier: BrandDossier) => void;
  /** Clears the in-progress draft (not the session's createdDossiers history). */
  reset: () => void;
}

const DRAFT_DEFAULTS = {
  productId: "",
  brandName: "",
  genericName: "",
  anchor: "FDA" as RegulatoryBody,
  category: "",
  audiences: [] as string[],
  supportingFiles: [] as File[],
  path: null as DossierFlowPath,
  fileName: null as string | null,
  indication: "",
  dossier: null as BrandDossier | null,
};

export const useDossierDraftStore = create<DossierDraftState>((set) => ({
  ...DRAFT_DEFAULTS,
  createdDossiers: [],

  setProduct: (productId) => set({ productId }),
  setOtherBrandName: (brandName) => set({ brandName }),
  setOtherGenericName: (genericName) => set({ genericName }),
  setCategory: (category) => set({ category }),
  toggleAudience: (audience) =>
    set((s) => ({
      audiences: s.audiences.includes(audience) ? s.audiences.filter((a) => a !== audience) : [...s.audiences, audience],
    })),
  addSupportingFiles: (files) => set((s) => ({ supportingFiles: [...s.supportingFiles, ...files] })),
  setPath: (path) => set({ path }),
  setFileName: (fileName) => set({ fileName }),
  setIndication: (indication) => set({ indication }),
  setDossier: (dossier) => set({ dossier }),
  addCreatedDossier: (dossier) => set((s) => ({ createdDossiers: [dossier, ...s.createdDossiers] })),
  reset: () => set({ ...DRAFT_DEFAULTS }),
}));

export function applyProductSelection(
  productId: string,
  brand: { name: string; genericName: string; regulatoryAnchor: RegulatoryBody } | undefined
) {
  useDossierDraftStore.getState().setProduct(productId);
  if (brand) {
    useDossierDraftStore.setState({ brandName: brand.name, genericName: brand.genericName, anchor: brand.regulatoryAnchor });
  } else {
    useDossierDraftStore.setState({ brandName: "", genericName: "" });
  }
}
