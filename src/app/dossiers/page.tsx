"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/features/workspace/app-shell";
import { DossierListScreen } from "@/features/dossiers/dossier-list-screen";
import { DossierWizard } from "@/features/dossiers/dossier-wizard";
import { MOCK_DOSSIERS } from "@/features/dossiers/mock-dossiers";
import { useDossierDraftStore } from "@/features/dossiers/dossier-draft-store";
import type { BrandDossier } from "@/features/dossiers/dossier-types";

function DossiersContent() {
  const searchParams = useSearchParams();
  const openId = searchParams.get("open");

  // Dossiers created via the /dossiers/new pages this session (in-memory,
  // survives navigating away from those pages) come before the seed data.
  const createdDossiers = useDossierDraftStore((s) => s.createdDossiers);
  const allDossiers: BrandDossier[] = [...createdDossiers, ...MOCK_DOSSIERS];

  const [selectedDossier, setSelectedDossier] = useState<BrandDossier | null>(() => {
    if (openId) {
      return allDossiers.find((d) => d.id.toLowerCase() === openId.toLowerCase()) || null;
    }
    return null;
  });

  useEffect(() => {
    if (openId) {
      const match = allDossiers.find((d) => d.id.toLowerCase() === openId.toLowerCase());
      if (match) {
        setSelectedDossier(match);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  const handleSelect = (dossier: BrandDossier) => {
    setSelectedDossier(dossier);
  };

  const handleBackToList = () => {
    setSelectedDossier(null);
  };

  const handleDossierCreated = (newDossier: BrandDossier) => {
    setSelectedDossier(newDossier);
  };

  return (
    <AppShell pageTitle="Brand Dossiers">
      {selectedDossier ? (
        <DossierWizard
          initialDossier={selectedDossier}
          onBackToList={handleBackToList}
          onDossierCreated={handleDossierCreated}
        />
      ) : (
        <DossierListScreen dossiers={allDossiers} onSelectDossier={handleSelect} />
      )}
    </AppShell>
  );
}

export default function DossiersPage() {
  return (
    <Suspense fallback={null}>
      <DossiersContent />
    </Suspense>
  );
}
