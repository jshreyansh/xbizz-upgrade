import { PRODUCTS } from "@/features/product-library/mock-products";
import { DOSSIER_TYPES } from "@/features/product-library/product-library-types";
import DossierDetailClient from "./dossier-detail-client";

/**
 * A static export has to know its dynamic paths at build time — same as
 * the product detail page one level up, and for the same reason: enumerate
 * every seeded product against every dossier type. Brands created this
 * session live only in the zustand store and aren't pre-rendered, which
 * costs nothing since a hard refresh loses them either way.
 */
export function generateStaticParams() {
  return PRODUCTS.flatMap((product) => DOSSIER_TYPES.map((type) => ({ id: product.id, type })));
}

export default function DossierDetailPage() {
  return <DossierDetailClient />;
}
