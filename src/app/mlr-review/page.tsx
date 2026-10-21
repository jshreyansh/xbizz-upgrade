"use client";

import { AppShell } from "@/features/workspace/app-shell";
import { MlrReviewScreen } from "@/features/review/mlr-review-screen";

export default function MlrReviewPage() {
  return (
    <AppShell pageTitle="MLR Review">
      <MlrReviewScreen />
    </AppShell>
  );
}
