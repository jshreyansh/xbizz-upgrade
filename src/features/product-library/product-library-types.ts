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

/** Every photography angle a variation's pack can be shot from. */
export const IMAGE_ANGLES = ["Front", "Back", "Side", "Top", "Packaging", "Lifestyle"] as const;
export type ProductImageAngle = (typeof IMAGE_ANGLES)[number];

export interface ProductImage {
  id: string;
  label: string;
  angle: ProductImageAngle;
  gradient: string;
}

/** A pack size, strength, or presentation of the product — each keeps its
 *  own full angle set of photography rather than sharing one image pool. */
export interface ProductVariation {
  id: string;
  label: string;
  images: ProductImage[];
}

export type DocumentFileType = "PDF" | "DOCX" | "PPTX" | "XLSX";

export interface ProductDocument {
  id: string;
  name: string;
  category: string;
  fileType: DocumentFileType;
  size: string;
  updated: string;
}

export interface ProductDetail {
  variations: ProductVariation[];
  dossiers: ProductDossierEntry[];
  claims: ProductClaim[];
  documents: ProductDocument[];
}
