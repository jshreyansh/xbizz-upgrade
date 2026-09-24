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
  /** An actual uploaded reference photo, shown in place of the generated
   *  packshot art wherever this brand's single hero image appears (library
   *  cards, its default Front angle) — a local object URL, so it only
   *  lasts the browser session rather than surviving a reload. */
  referenceImageUrl?: string;
  /** Therapy areas this brand belongs to. The studio's brand search matches on
   *  them, so a brand created without any is findable by name and molecule
   *  only — which is why Create Brand asks. */
  therapyAreas?: string[];
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

/** One section within a dossier — what the Dossier detail page lists under
 *  a dossier type. A dossier's `sections` count on ProductDossierEntry is
 *  just that; these are the named rows that add up to it. */
export interface DossierSection {
  id: string;
  title: string;
  status: DossierEntryStatus;
  claimsCited: number;
}

export type ClaimStatus = "approved" | "pending" | "held out";

export interface ProductClaim {
  id: string;
  text: string;
  source: string;
  /** The public record the evidence sits in: FDA, PubMed, the trial registry. */
  evidenceSource: string;
  dossierType: DossierTypeName;
  status: ClaimStatus;
}

/** Every photography angle a variation's pack can be shot from. */
export const IMAGE_ANGLES = ["Front", "Back", "Side", "Top", "Packaging", "Lifestyle"] as const;
export type ProductImageAngle = (typeof IMAGE_ANGLES)[number];

/** Who on the team put a file here. */
export interface AssetOrigin {
  name: string;
  /** Their team, so a name on its own does not have to be recognised. */
  team: string;
}

export interface ProductImage {
  id: string;
  /** The file as it was uploaded. */
  name: string;
  /**
   * What the person said about it when they attached it.
   *
   * The studio asks which product and variant an image belongs to and what
   * it is for; that answer travels with the image and is editable here,
   * which is why the tile carries an updated date as well as an added one.
   */
  comment: string;
  label: string;
  /**
   * Which of the six standard shots this is.
   *
   * Only for the generated packshots, whose artwork is derived from it. A
   * photograph somebody uploaded is whatever they photographed — naming it
   * "Front" because Front was the next free slot is a caption nobody wrote.
   */
  angle?: ProductImageAngle;
  gradient: string;
  addedBy: AssetOrigin;
  addedOn: string;
  updatedOn: string;
  /** Put away rather than deleted — nothing here is thrown out. */
  archived?: boolean;
  /** Set only for the Front angle of the default variation when the brand
   *  was created with an uploaded reference photo. */
  imageUrl?: string;
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
  /** What the person who attached it said it was for. */
  comment: string;
  fileType: DocumentFileType;
  size: string;
  /** When it was attached. An attachment is a record of what was supplied,
   *  so the date that matters is the one it arrived on. */
  addedOn: string;
  addedBy: AssetOrigin;
  /** Put away rather than deleted — nothing here is thrown out. */
  archived?: boolean;
  /** The file itself, where there is one to open. */
  previewUrl?: string;
}

export interface ProductDetail {
  variations: ProductVariation[];
  dossiers: ProductDossierEntry[];
  claims: ProductClaim[];
  documents: ProductDocument[];
}
