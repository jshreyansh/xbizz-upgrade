"use client";

import { useState } from "react";
import { AppShell } from "@/features/workspace/app-shell";
import { DossierListScreen } from "@/features/dossiers/dossier-list-screen";
import { DossierWizard } from "@/features/dossiers/dossier-wizard";
import { MOCK_DOSSIERS } from "@/features/dossiers/mock-dossiers";
import type { BrandDossier } from "@/features/dossiers/dossier-types";

export default function DossiersPage() {
  const [dossiers, setDossiers] = useState<BrandDossier[]>(MOCK_DOSSIERS);
  const [selectedDossier, setSelectedDossier] = useState<BrandDossier | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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
