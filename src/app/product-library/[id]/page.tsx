import { notFound } from "next/navigation";
import { AppShell } from "@/features/workspace/app-shell";
import { ProductDetailScreen } from "@/features/product-library/product-detail-screen";
import { PRODUCTS } from "@/features/product-library/mock-products";
import { buildProductDetail } from "@/features/product-library/mock-product-detail";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) notFound();

  const detail = buildProductDetail(product);

  return (
    <AppShell pageTitle={product.name}>
      <ProductDetailScreen product={product} detail={detail} />
    </AppShell>
  );
}
