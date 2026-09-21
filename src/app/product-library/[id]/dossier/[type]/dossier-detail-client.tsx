"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/features/workspace/app-shell";
// The summary screen this route used to render. Kept, not deleted: it is one
// import swap away if the master-document reader turns out to be too much
// for a six-row tab.
// import { DossierDetailScreen } from "@/features/product-library/dossier-detail-screen";
import { DossierReader } from "@/features/dossiers/dossier-reader";
import { dossierFor } from "@/features/dossiers/dossier-for";
import { useProductLibraryStore } from "@/features/product-library/product-library-store";
import { DOSSIER_TYPES, type DossierTypeName } from "@/features/product-library/product-library-types";

// Client-rendered for the same reason the product detail page is: a brand
// created via "Create brand" only exists in the zustand store, so a static
// param list can't know its id at build time — this still works for it via
// client-side navigation, the same fine print as the parent page.
export default function DossierDetailClient() {
  const { id, type } = useParams<{ id: string; type: string }>();
  const router = useRouter();
  const product = useProductLibraryStore((s) => s.products.find((p) => p.id === id));
  const activeType = (DOSSIER_TYPES as readonly string[]).includes(type) ? (type as DossierTypeName) : null;
  /* Each of the six types is a dossier in its own right — its own sections,
     its own claims — not a slice of one bigger document. */
  const dossier = useMemo(
    () => (product && activeType ? dossierFor(product.name, product.genericName, activeType) : null),
    [product, activeType]
  );

  if (!product || !dossier || !activeType) {
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
      <div className="page-enter space-y-6">
        <button
          onClick={() => router.push(`/product-library/${product.id}`)}
          className="inline-flex cursor-pointer items-center gap-1.5 text-body-lg font-bold text-ink-3 transition-colors hover:text-ink"
        >
          <ChevronLeft size={15} /> {product.name}
        </button>
        <DossierReader dossier={dossier} />
      </div>
    </AppShell>
  );
}
