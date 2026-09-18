import { PRODUCTS } from "@/features/product-library/mock-products";
import { allClaims } from "@/features/claims-library/claim-detail";
import ClaimDetailClient from "./claim-detail-client";

/**
 * A static export has to know its dynamic paths at build time, so every claim
 * the seeded catalogue produces is enumerated here. Claims belonging to a
 * brand created in-session are not pre-rendered, which costs nothing: that
 * brand does not survive a refresh either.
 */
export function generateStaticParams() {
  return allClaims(PRODUCTS).map(({ claim }) => ({ id: claim.id }));
}

export default function ClaimDetailPage() {
  return <ClaimDetailClient />;
}
