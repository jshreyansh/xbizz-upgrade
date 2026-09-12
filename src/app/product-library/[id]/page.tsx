import { PRODUCTS } from "@/features/product-library/mock-products";
import ProductDetailClient from "./product-detail-client";

/**
 * A static export has to know its dynamic paths at build time, so the seeded
 * catalogue is enumerated here. Brands created in-session live only in the
 * zustand store and are not pre-rendered — which costs nothing, because they
 * do not survive a refresh either way.
 *
 * This file is a server component purely so it can export this; the screen
 * itself stays a client component, for the reason its own comment gives.
 */
export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ id: product.id }));
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
