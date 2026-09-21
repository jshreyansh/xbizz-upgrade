"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { BrandDossier } from "@/features/dossiers/dossier-types";
import { DossierReader } from "@/features/dossiers/dossier-reader";

/**
 * The same dossier, without leaving the page.
 *
 * "See in dossier" used to open a summary written for the purpose — three
 * claims and a list of attachments — which meant the thing a claim traced
 * back to looked nothing like the dossier you would find by navigating to
 * it. The document is the document; this is a window onto it.
 *
 * No Create Magic Video here: you are checking a citation mid-edit, not
 * starting a project.
 */
export function DossierReaderModal({
  dossier,
  onClose,
}: {
  dossier: BrandDossier | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!dossier) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${dossier.brandName} dossier`}
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-card border border-hair bg-canvas shadow-float"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-hair bg-card px-5 py-3">
          <span className="truncate text-body-lg font-extrabold text-ink">
            {dossier.brandName} dossier
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dossier"
            className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-ink-3 transition hover:bg-black/5 hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <DossierReader dossier={dossier} onCreateVideo={null} />
        </div>
      </div>
    </div>,
    document.body
  );
}
