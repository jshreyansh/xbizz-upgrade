"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { BrandDossier } from "@/features/dossiers/dossier-types";
import { NewDossierFlow } from "@/features/dossiers/dossier-quick-flows";

interface DossierListScreenProps {
  dossiers: BrandDossier[];
  onSelectDossier: (dossier: BrandDossier) => void;
  onDossierCreated: (dossier: BrandDossier) => void;
}

export function DossierListScreen({
  dossiers,
  onSelectDossier,
  onDossierCreated,
}: DossierListScreenProps) {
  const [flowOpen, setFlowOpen] = useState(false);

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
          onClick={() => setFlowOpen(true)}
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
            flexShrink: 0,
          }}
        >
          <Sparkles size={16} />
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
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <b style={{ fontSize: 20, letterSpacing: "-.5px", fontWeight: 800, color: "var(--ink)" }}>{dossier.brandName}</b>
                  {dossier.isSample && (
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: 99,
                        background: "#fef3c7",
                        color: "#b45309",
                        border: "1px solid #fde68a",
                      }}
                    >
                      Sample
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: 99,
                      background: "var(--ok-bg)",
                      color: "var(--ok)",
                      border: "1px solid var(--ok-line)",
                    }}
                  >
                    {dossier.regulatoryAnchor} Anchor
                  </span>
                </div>
                <span style={{ fontSize: 13, color: "var(--ink-4)", fontStyle: "italic", display: "block", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
                background:
                  dossier.healthStatus === "critical"
                    ? "#fff5f5"
                    : dossier.healthStatus === "warning"
                    ? "#fefce8"
                    : "var(--tint-2)",
                borderRadius: "var(--r)",
                border:
                  dossier.healthStatus === "critical"
                    ? "1px solid #fed7d7"
                    : dossier.healthStatus === "warning"
                    ? "1px solid #fef08a"
                    : "1px solid var(--tint-line)",
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
                <b
                  style={{
                    display: "block",
                    fontSize: 14.5,
                    fontWeight: 800,
                    color:
                      dossier.healthStatus === "critical"
                        ? "#dc2626"
                        : dossier.healthStatus === "warning"
                        ? "#ca8a04"
                        : "var(--ok)",
                  }}
                >
                  {dossier.healthStatus === "critical"
                    ? `${dossier.claimsCited}/${dossier.totalClaimsCount || 66}`
                    : dossier.healthStatus === "warning"
                    ? `${dossier.claimsCited}/${dossier.totalClaimsCount || 84}`
                    : dossier.claimsCited}
                </b>
                <span
                  style={{
                    fontSize: 9.5,
                    color:
                      dossier.healthStatus === "critical"
                        ? "#b91c1c"
                        : dossier.healthStatus === "warning"
                        ? "#a16207"
                        : "var(--ink-4)",
                    textTransform: "uppercase",
                    fontWeight: 800,
                  }}
                >
                  {dossier.healthStatus === "critical"
                    ? "2/66 Verified"
                    : dossier.healthStatus === "warning"
                    ? "50% Pending"
                    : "Claims Cited"}
                </span>
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

      {flowOpen && <NewDossierFlow onClose={() => setFlowOpen(false)} onCreated={onDossierCreated} />}
    </div>
  );
}
