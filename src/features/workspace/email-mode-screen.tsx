"use client";

import { useState } from "react";
import { PageHeading } from "@/components/patterns/page-heading";
import { CreateTile } from "@/components/patterns/create-tile";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { BrandDossierModal } from "@/features/workspace/brand-dossier-modal";
import { StartingPointCard, type StartingPointExample } from "@/features/workspace/starting-point-card";
import { useEmailStore } from "@/features/workspace/email-store";
import { EMAIL_PURPOSES, type EmailPurpose } from "@/features/workspace/email-options";

/**
 * Where an email starts.
 *
 * The same page as Video, Docs and Ads: Create From Scratch, then the emails
 * pharma actually sends — reps, MSLs and head office to HCPs (formulary teams
 * included),
 * the brand and support nurses to patients, the brand to the public. Each one
 * knows who it is for and who usually sends it.
 */
const PLUM = "linear-gradient(135deg, #180924 0%, #2e1245 60%, #4a1d6e 100%)";
const DARK = "linear-gradient(135deg, #09101d 0%, #152238 60%, #1f3557 100%)";
const FOREST = "linear-gradient(135deg, #0a1f18 0%, #13382c 60%, #1d5442 100%)";
const SLATE = "linear-gradient(135deg, #162022 0%, #25373b 60%, #3a555c 100%)";
const UMBER = "linear-gradient(135deg, #221a16 0%, #3b2a25 60%, #5c413a 100%)";
const VIOLET = "linear-gradient(135deg, #1b1622 0%, #352b42 60%, #524266 100%)";

const ex = (id: string, bg: string, badge: string, eyebrow: string, metric: string, metricLabel: string, caption: string): StartingPointExample => ({
  id,
  bg,
  badge,
  aspect: "Email",
  eyebrow,
  metric,
  metricLabel,
  caption,
});

const STARTING_POINTS: Array<{ id: EmailPurpose; examples: StartingPointExample[] }> = [
  {
    id: "followup",
    examples: [
      ex("fu-1", PLUM, "Rep", "Following up on our conversation", "41%", "reached the primary endpoint", "Leave-behind attached"),
      ex("fu-2", DARK, "Rep", "The data we discussed", "3", "blocks the rep picks from", "Personal note at the top"),
    ],
  },
  {
    id: "newdata",
    examples: [
      ex("nd-1", FOREST, "Rep or head office", "New long-term results", "3 yrs", "responses maintained", "Video thumbnail opens the data"),
      ex("nd-2", SLATE, "Head office", "What the follow-up showed", "52%", "at the primary endpoint", "Sent to opted-in doctors"),
    ],
  },
  {
    id: "congress",
    examples: [
      ex("cg-1", VIOLET, "Rep", "You're invited", "Sat", "industry symposium", "Reserve a seat"),
      ex("cg-2", UMBER, "Rep", "Join us at the booth", "2", "data presentations", "Links to the sign-up page"),
    ],
  },
  {
    id: "access",
    examples: [
      ex("ac-1", UMBER, "Rep", "Helping your patients start", "$0", "copay for eligible patients", "Links to enrolment"),
      ex("ac-2", FOREST, "Head office", "Support for your patients", "48 h", "specialty pharmacy coordination", "Approved page link"),
    ],
  },
  {
    id: "medq",
    examples: [
      ex("mq-1", SLATE, "MSL", "Your question on dose modification", "PI §2.2", "cited word for word", "Non-promotional"),
      ex("mq-2", DARK, "MSL", "The paper you asked for", "1", "licensed reprint", "No call to action"),
    ],
  },
  {
    id: "onboarding",
    examples: [
      ex("on-1", VIOLET, "Brand team", "Welcome to your treatment", "Week 1", "what to expect", "Plain-language safety information"),
      ex("on-2", FOREST, "Support nurse", "Your first weeks", "1 call", "with a support nurse", "Medication Guide linked"),
    ],
  },
  {
    id: "savings",
    examples: [
      ex("sv-1", UMBER, "Brand team", "You could pay less", "$0", "a month for eligible patients", "Savings card sign-up"),
      ex("sv-2", PLUM, "Support nurse", "Help paying for treatment", "2 min", "to sign up", "Eligibility rules included"),
    ],
  },
  {
    id: "awareness",
    examples: [
      ex("aw-1", SLATE, "Brand team", "Questions to ask your doctor", "3", "signs worth discussing", "No product named"),
      ex("aw-2", FOREST, "Brand team", "Living with the condition", "1 click", "to find a specialist", "Unbranded, no safety information needed"),
    ],
  },
];

export function EmailModeScreen() {
  const [dossierModalOpen, setDossierModalOpen] = useState(false);

  const handleSelect = (purpose: EmailPurpose) => {
    useWorkspaceStore.getState().setAssetType("email");
    const def = EMAIL_PURPOSES[purpose];
    useEmailStore.getState().setAbout({ audience: def.audience, sender: def.senders[0], purpose });
    setDossierModalOpen(true);
  };

  return (
    <div className="page-enter max-w-[1140px] space-y-6">
      <PageHeading title="Create Email" description="Approved Email for HCPs, sent from your CRM. Patient and public email, sent from your email platform." />

      <div className="grid grid-cols-1 gap-5 pt-1 sm:grid-cols-2 lg:grid-cols-3">
        <CreateTile
          title="Create From Scratch"
          subtitle="Your own brief, grounded in the same approved claims. Senders pick from what you allow."
          delayMs={80}
          onSelect={() => handleSelect("followup")}
        />
        {STARTING_POINTS.map((point, i) => (
          <StartingPointCard
            key={point.id}
            title={EMAIL_PURPOSES[point.id].label}
            subtitle={EMAIL_PURPOSES[point.id].subtitle}
            examples={point.examples}
            delayMs={125 + i * 45}
            onSelect={() => handleSelect(point.id)}
          />
        ))}
      </div>

      <BrandDossierModal open={dossierModalOpen} onClose={() => setDossierModalOpen(false)} />
    </div>
  );
}
