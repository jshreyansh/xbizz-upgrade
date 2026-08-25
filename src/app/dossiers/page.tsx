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
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (openId) {
      const match = dossiers.find((d) => d.id.toLowerCase() === openId.toLowerCase());
      if (match) {
        setSelectedDossier(match);
        setIsCreating(false);
      }
    }
  }, [openId, dossiers]);

  const handleSelect = (dossier: BrandDossier) => {
    setSelectedDossier(dossier);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setSelectedDossier(null);
    setIsCreating(true);
  };

  const handleBackToList = () => {
    setSelectedDossier(null);
    setIsCreating(false);
  };

  const handleDossierCreated = (newDossier: BrandDossier) => {
    if (!dossiers.some((d) => d.id === newDossier.id)) {
      setDossiers([newDossier, ...dossiers]);
    }
  };

  return (
    <AppShell pageTitle="Brand Dossiers">
      {selectedDossier || isCreating ? (
        <DossierWizard
          initialDossier={selectedDossier}
          onBackToList={handleBackToList}
          onDossierCreated={handleDossierCreated}
        />
      ) : (
        <DossierListScreen
          dossiers={dossiers}
          onSelectDossier={handleSelect}
          onCreateNew={handleCreateNew}
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
