"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/features/workspace/app-shell";
import { ProductDetailScreen } from "@/features/product-library/product-detail-screen";
import { useProductLibraryStore } from "@/features/product-library/product-library-store";
import { buildProductDetail } from "@/features/product-library/mock-product-detail";

// Client-rendered (rather than the async server component this used to be)
// because products created via "Create brand" only exist in the zustand
// store — a server component reading the static PRODUCTS array would 404 on
// every brand created this session.
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const product = useProductLibraryStore((s) => s.products.find((p) => p.id === id));
  const detail = useMemo(() => (product ? buildProductDetail(product) : null), [product]);

  if (!product || !detail) {
    return (
      <AppShell pageTitle="Product Library">
        <div className="page-enter flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-title font-bold text-ink">Brand not found</p>
          <p className="max-w-[40ch] text-body-lg text-ink-3">It may have been removed, or the link is out of date.</p>
          <button
            onClick={() => router.push("/product-library")}
            className="inline-flex items-center gap-1.5 text-body-lg font-bold text-brand hover:text-brand-deep transition-colors"
          >
            <ChevronLeft size={15} /> Back to Product Library
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle={product.name}>
      <ProductDetailScreen product={product} detail={detail} />
    </AppShell>
  );
}
