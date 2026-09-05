export type ProductType = "Tablet" | "Device" | "Syrup" | "Injection" | "Capsule";

export interface LibraryProduct {
  id: string;
  name: string;
  genericName: string;
  type: ProductType;
  gradient: string;
  dossiersVerified: number;
  dossiersTotal: number;
  claimsApproved: number;
  views: number;
  updated: string;
}

/** The six standard dossier types every product is tracked against. */
export const DOSSIER_TYPES = ["Regulatory", "Clinical", "Safety", "Commercial", "Patient", "HCP"] as const;
export type DossierTypeName = (typeof DOSSIER_TYPES)[number];

export type DossierEntryStatus = "verified" | "in review" | "not started";

export interface ProductDossierEntry {
  type: DossierTypeName;
  status: DossierEntryStatus;
  sections: number;
  claimsCited: number;
  updated: string;
}

export type ClaimStatus = "approved" | "pending" | "held out";

export interface ProductClaim {
  id: string;
  text: string;
  source: string;
  dossierType: DossierTypeName;
  status: ClaimStatus;
}

export type ProductImageKind = "Pack shot" | "Device" | "Reference" | "Lifestyle";

export interface ProductImage {
  id: string;
  label: string;
  kind: ProductImageKind;
  gradient: string;
}

export interface ProductDetail {
  images: ProductImage[];
  dossiers: ProductDossierEntry[];
  claims: ProductClaim[];
}
