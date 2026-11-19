"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { BackLink } from "@/components/patterns/back-link";
import { AppShell } from "@/features/workspace/app-shell";
import { ClaimDetailScreen } from "@/features/claims-library/claim-detail-screen";
import { allClaims, buildClaimDetail } from "@/features/claims-library/claim-detail";
import { useProductLibraryStore } from "@/features/product-library/product-library-store";

/**
 * Client-rendered for the same reason the product detail page is: claims are
 * derived from the products in the zustand store, and a brand created this
 * session has no pre-rendered path.
 */
export default function ClaimDetailClient() {
  const { id } = useParams<{ id: string }>();
  const products = useProductLibraryStore((s) => s.products);

  const detail = useMemo(() => {
    const hit = allClaims(products).find((entry) => entry.claim.id === id);
    return hit ? buildClaimDetail(hit.claim, hit.product) : null;
  }, [products, id]);

  if (!detail) {
    return (
      <AppShell pageTitle="Claims Library">
        <div className="page-enter flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-title font-bold text-ink">Claim Not Found</p>
          <p className="max-w-[40ch] text-body-lg text-ink-3">
            It may have been removed, or the link is out of date.
          </p>
          <BackLink href="/claims-library">Back to Claims Library</BackLink>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle={detail.product.name}>
      <ClaimDetailScreen detail={detail} />
    </AppShell>
  );
}
