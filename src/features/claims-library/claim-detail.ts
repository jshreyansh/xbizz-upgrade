import type { LibraryProduct, ProductClaim } from "@/features/product-library/product-library-types";
import { buildProductDetail, variationLabelsFor } from "@/features/product-library/mock-product-detail";
import { LIBRARY_ASSETS, type LibraryAsset } from "@/features/content-library/content-library-data";

/**
 * Who put this claim in the library, and who stood behind it.
 *
 * The two are different promises. A claim somebody typed and SwishX then
 * checked against the label carries the author's name; a claim SwishX pulled
 * out of the approved source itself never had an author to name. Collapsing
 * them into one "verified" badge would hide the only part a reviewer asks
 * about.
 */
export type ClaimOrigin = "authored" | "sourced";

export interface ClaimReference {
  label: string;
  /** Either a link out, or a file in the brand's attachments. */
  kind: "link" | "attachment";
  detail: string;
  /** What it is, so the preview knows how to show it. */
  fileKind: "doc" | "image" | "video";
  /** The file itself, where there is one to show. */
  previewUrl?: string;
}

export interface ClaimDetail {
  claim: ProductClaim;
  product: LibraryProduct;
  origin: ClaimOrigin;
  /** Who typed it, when the claim was authored rather than sourced. */
  author?: string;
  addedOn: string;
  updatedOn: string;
  /** Which presentations of the product this claim holds for. */
  variations: string[];
  references: ClaimReference[];
  /** Published work that cites this claim. */
  usedIn: LibraryAsset[];
}

/** Every claim in the catalogue, with the brand it belongs to. */
export function allClaims(products: LibraryProduct[]): Array<{ claim: ProductClaim; product: LibraryProduct }> {
  return products.flatMap((product) =>
    buildProductDetail(product).claims.map((claim) => ({ claim, product }))
  );
}

/** A stable number from a claim id, so nothing here reshuffles on a reload. */
function seed(id: string): number {
  let total = 0;
  for (let i = 0; i < id.length; i += 1) total += id.charCodeAt(i) * (i + 1);
  return total;
}

const AUTHORS = ["Maya Kapoor", "Dr. Anita Rao", "Sanjay Kulkarni", "Priya Menon"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * A date in 2026, counted in days from the first of January.
 *
 * Counting days rather than picking a month and a day out of the same number
 * separately is what keeps "updated" after "added": two modulos against
 * different bases could put the revision two months before the claim.
 */
function dayIn2026(offset: number): string {
  const d = new Date(Date.UTC(2026, 0, 1 + offset));
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/** When the claim went into the library. */
function addedDay(claimId: string): number {
  return seed(claimId) % 190;
}

/**
 * The published work a brand could have cited this claim in.
 *
 * Only four brands have real entries in the Content Library, which left the
 * Usage tab empty for most of the catalogue — a tab that is blank for two
 * claims in three teaches people not to open it. The rest borrow the shape of
 * that work under their own name: the same formats, specs and figures, titled
 * for the brand whose claim this is, so the grid reads as this brand's shelf
 * rather than somebody else's film.
 */
function publishedFor(product: LibraryProduct): LibraryAsset[] {
  const own = LIBRARY_ASSETS.filter((asset) => asset.brand === product.name);
  if (own.length >= 3) return own;
  const borrowed = LIBRARY_ASSETS.filter((asset) => asset.brand !== product.name).map((asset) => ({
    ...asset,
    id: `${product.id}-${asset.id}`,
    title: asset.title.replace(asset.brand, product.name),
    brand: product.name,
    gradient: product.gradient,
  }));
  return [...own, ...borrowed];
}

/**
 * When a claim last changed, without building its whole record.
 *
 * The shelf needs one line in a tile footer; buildClaimDetail assembles
 * references, usage and an audit trail to get there. Same derivation either
 * way, so the tile and the detail page never disagree.
 */
export function claimUpdatedOn(claimId: string): string {
  const added = addedDay(claimId);
  return dayIn2026(added + 14 + (seed(claimId) % 47));
}

/**
 * Everything the detail page shows about one claim, derived from its id so the
 * same claim always reads the same way. Mock, in the way the rest of the
 * catalogue is mock: a plausible record rather than a real audit trail.
 */
export function buildClaimDetail(claim: ProductClaim, product: LibraryProduct): ClaimDetail {
  const n = seed(claim.id);
  const origin: ClaimOrigin = n % 3 === 0 ? "authored" : "sourced";

  const presentations = variationLabelsFor(product.type);
  /* A claim about dosing holds for one presentation; a claim about the
     molecule holds for all of them. */
  const scoped = claim.dossierType === "Regulatory" || claim.dossierType === "Clinical";
  const variations = scoped ? presentations : [presentations[n % presentations.length]];

  const references: ClaimReference[] = [
    {
      label: `${product.name} approved label`,
      kind: "attachment",
      detail: `${claim.source} · PDF`,
      fileKind: "doc",
    },
    {
      label: `${product.name} pack artwork`,
      kind: "attachment",
      detail: "Front of pack · PNG",
      fileKind: "image",
      previewUrl: `/products/${product.type.toLowerCase()}.jpg`,
    },
  ];
  if (n % 2 === 0) {
    references.push({
      label: "EMBRACE-3 pivotal readout",
      kind: "link",
      detail: "Trial registry record",
      fileKind: "doc",
    });
  }

  /* Not every claim goes into every asset of its brand: a patient explainer
     and a congress poster cite different halves of the same dossier. Two or
     three each, chosen from the claim's own id so the same claim always shows
     the same work. */
  const shelf = publishedFor(product);
  const take = 2 + (n % 2);
  const usedIn = Array.from({ length: Math.min(take, shelf.length) }, (_, i) => shelf[(n + i) % shelf.length]);

  return {
    claim,
    product,
    origin,
    author: origin === "authored" ? AUTHORS[n % AUTHORS.length] : undefined,
    addedOn: dayIn2026(addedDay(claim.id)),
    updatedOn: claimUpdatedOn(claim.id),
    variations,
    references,
    usedIn,
  };
}
