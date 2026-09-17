"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/features/workspace/app-shell";
import { DossierDetailScreen } from "@/features/product-library/dossier-detail-screen";
import { useProductLibraryStore } from "@/features/product-library/product-library-store";
import { buildProductDetail } from "@/features/product-library/mock-product-detail";
import { DOSSIER_TYPES, type DossierTypeName } from "@/features/product-library/product-library-types";

// Client-rendered for the same reason the product detail page is: a brand
// created via "Create brand" only exists in the zustand store, so a static
// param list can't know its id at build time — this still works for it via
// client-side navigation, the same fine print as the parent page.
export default function DossierDetailClient() {
  const { id, type } = useParams<{ id: string; type: string }>();
  const router = useRouter();
  const product = useProductLibraryStore((s) => s.products.find((p) => p.id === id));
  const detail = useMemo(() => (product ? buildProductDetail(product) : null), [product]);
  const activeType = (DOSSIER_TYPES as readonly string[]).includes(type) ? (type as DossierTypeName) : null;

  if (!product || !detail || !activeType) {
    return (
      <AppShell pageTitle="Product Library">
        <div className="page-enter flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-title font-bold text-ink">Dossier not found</p>
          <p className="max-w-[40ch] text-body-lg text-ink-3">It may have been removed, or the link is out of date.</p>
          <button
            onClick={() => router.push(product ? `/product-library/${product.id}` : "/product-library")}
            className="inline-flex items-center gap-1.5 text-body-lg font-bold text-brand hover:text-brand-deep transition-colors"
          >
            <ChevronLeft size={15} /> {product ? `Back to ${product.name}` : "Back to Product Library"}
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle={`${activeType} dossier — ${product.name}`}>
      <DossierDetailScreen product={product} detail={detail} activeType={activeType} />
    </AppShell>
  );
}
