"use client";

import { AppShell } from "@/features/workspace/app-shell";
import { ProductLibraryScreen } from "@/features/product-library/product-library-screen";

export default function ProductLibraryPage() {
  return (
    <AppShell pageTitle="Product Library">
      <ProductLibraryScreen />
    </AppShell>
  );
}
