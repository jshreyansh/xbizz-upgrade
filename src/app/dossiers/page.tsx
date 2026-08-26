"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/features/workspace/app-shell";
import { DossierListScreen } from "@/features/dossiers/dossier-list-screen";
import { DossierWizard } from "@/features/dossiers/dossier-wizard";
import { MOCK_DOSSIERS } from "@/features/dossiers/mock-dossiers";
import type { BrandDossier } from "@/features/dossiers/dossier-types";

function DossiersContent() {
  const searchParams = useSearchParams();
  const openId = searchParams.get("open");

  const [dossiers, setDossiers] = useState<BrandDossier[]>(MOCK_DOSSIERS);
  const [selectedDossier, setSelectedDossier] = useState<BrandDossier | null>(() => {
    if (openId) {
      return MOCK_DOSSIERS.find((d) => d.id.toLowerCase() === openId.toLowerCase()) || null;
    }
    return null;
  });

  useEffect(() => {
    if (openId) {
      const match = dossiers.find((d) => d.id.toLowerCase() === openId.toLowerCase());
      if (match) {
        setSelectedDossier(match);
      }
    }
  }, [openId, dossiers]);

  const handleSelect = (dossier: BrandDossier) => {
    setSelectedDossier(dossier);
  };

  const handleBackToList = () => {
    setSelectedDossier(null);
  };

  const handleDossierCreated = (newDossier: BrandDossier) => {
    if (!dossiers.some((d) => d.id === newDossier.id)) {
      setDossiers([newDossier, ...dossiers]);
    }
  };

  /** From the quick Upload/Create flows — add the new dossier to the list and open it. */
  const handleQuickDossierCreated = (newDossier: BrandDossier) => {
    handleDossierCreated(newDossier);
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
        <DossierListScreen
          dossiers={dossiers}
          onSelectDossier={handleSelect}
          onDossierCreated={handleQuickDossierCreated}
        />
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
