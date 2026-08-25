"use client";

import type { BrandDossier } from "@/features/dossiers/dossier-types";

interface DossierListScreenProps {
  dossiers: BrandDossier[];
  onSelectDossier: (dossier: BrandDossier) => void;
  onCreateNew: () => void;
}

export function DossierListScreen({
  dossiers,
  onSelectDossier,
  onCreateNew,
}: DossierListScreenProps) {
  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 800, marginBottom: 5 }}>
            Master Knowledge Base
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 8px" }}>Brand Dossiers</h1>
          <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-3)", lineHeight: 1.6, maxWidth: "64ch" }}>
            The single source of truth for your brand — grounded in approved prescribing info, clinical trial readouts, and HEOR models.
          </p>
        </div>
        <button
          onClick={onCreateNew}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 20px",
            borderRadius: "var(--r)",
            fontWeight: 700,
            fontSize: 14,
            background: "linear-gradient(180deg,#ff5b2d,var(--brand))",
            color: "#fff",
            boxShadow: "0 12px 26px -14px rgba(253,72,22,.9)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create Brand Dossier
        </button>
      </div>

      {/* Grid of Dossiers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
        {dossiers.map((dossier) => (
          <div
            key={dossier.id}
            onClick={() => onSelectDossier(dossier)}
            style={{
              background: "#fff",
              borderRadius: "var(--r-xl)",
              border: "1px solid var(--hair)",
              padding: "24px 22px",
              boxShadow: "var(--sh-1)",
              cursor: "pointer",
              transition: "transform .2s var(--e), box-shadow .2s var(--e)",
              position: "relative",
              overflow: "hidden",
            }}
            className="hover:scale-[1.01] hover:shadow-lg"
          >
            {/* Top Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: dossier.gradient,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 16,
                  fontWeight: 800,
                  boxShadow: "0 8px 18px -6px rgba(0,0,0,.35)",
                }}
              >
                {dossier.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <b style={{ fontSize: 18, letterSpacing: "-.5px", fontWeight: 800 }}>{dossier.brandName}</b>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "2px 7px",
                      borderRadius: 99,
                      background: "var(--ok-bg)",
                      color: "var(--ok)",
                      border: "1px solid var(--ok-line)",
                    }}
                  >
                    {dossier.regulatoryAnchor} Anchor
                  </span>
                </div>
                <span style={{ fontSize: 12, color: "var(--ink-4)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {dossier.genericName}
                </span>
              </div>
            </div>

            {/* Indication */}
            <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5, minHeight: 40, margin: "0 0 16px" }}>
              {dossier.indication}
            </p>

            {/* Stats row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
                padding: "12px 10px",
                background: "var(--tint-2)",
                borderRadius: "var(--r)",
                border: "1px solid var(--tint-line)",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              <div>
                <b style={{ display: "block", fontSize: 15, fontWeight: 800, color: "var(--brand-deep)" }}>
                  {dossier.sectionsCount}
                </b>
                <span style={{ fontSize: 10, color: "var(--ink-4)", textTransform: "uppercase", fontWeight: 700 }}>Sections</span>
              </div>
              <div>
                <b style={{ display: "block", fontSize: 15, fontWeight: 800, color: "var(--ok)" }}>
                  {dossier.claimsCited}
                </b>
                <span style={{ fontSize: 10, color: "var(--ink-4)", textTransform: "uppercase", fontWeight: 700 }}>Claims Cited</span>
              </div>
              <div>
                <b style={{ display: "block", fontSize: 15, fontWeight: 800, color: "var(--ink-3)" }}>
                  {dossier.sourcesCount}
                </b>
                <span style={{ fontSize: 10, color: "var(--ink-4)", textTransform: "uppercase", fontWeight: 700 }}>Sources</span>
              </div>
            </div>

            {/* Footer action */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--ink-4)" }}>
              <span>Updated {dossier.lastUpdated}</span>
              <span style={{ color: "var(--brand)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                Inspect dossier →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
