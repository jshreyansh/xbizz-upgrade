"use client";

import { useState } from "react";
import { PageHeading } from "@/components/patterns/page-heading";
import { CreateTile } from "@/components/patterns/create-tile";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { BrandDossierModal } from "@/features/workspace/brand-dossier-modal";
import { StartingPointCard, type StartingPointExample } from "@/features/workspace/starting-point-card";
import { EmailThumb, type EmailThumbSpec, type ThumbBlock } from "@/features/workspace/email-starting-preview";
import { useEmailStore } from "@/features/workspace/email-store";
import { EMAIL_PURPOSES, type EmailPurpose } from "@/features/workspace/email-options";

/**
 * Where an email starts.
 *
 * The same page as Video, Docs and Ads: Create From Scratch, then the emails
 * pharma actually sends to HCPs (reps, MSLs and head office) and to P&T
 * committees (formulary and value). Each one knows who it is for and who
 * usually sends it.
 */
const PLUM = "linear-gradient(135deg, #180924 0%, #2e1245 60%, #4a1d6e 100%)";
const DARK = "linear-gradient(135deg, #09101d 0%, #152238 60%, #1f3557 100%)";
const FOREST = "linear-gradient(135deg, #0a1f18 0%, #13382c 60%, #1d5442 100%)";
const SLATE = "linear-gradient(135deg, #162022 0%, #25373b 60%, #3a555c 100%)";
const UMBER = "linear-gradient(135deg, #221a16 0%, #3b2a25 60%, #5c413a 100%)";
const VIOLET = "linear-gradient(135deg, #1b1622 0%, #352b42 60%, #524266 100%)";

/* Each example is the email itself: who sends it, its subject, and the body it leads with. */
const ex = (id: string, bg: string, spec: EmailThumbSpec): StartingPointExample => ({
  id,
  bg,
  render: ({ large, hovered }) => <EmailThumb spec={spec} large={large} hovered={hovered} />,
});

const CLINIC: ThumbBlock = { kind: "photo", src: "/email/hcp-clinic.jpg", alt: "A specialist talking with a patient in clinic" };
const PRIMARY: ThumbBlock = { kind: "stat", title: "Primary endpoint", value: "52%", label: "reached PASI 90 at Week 16 vs 18% with placebo" };

const STARTING_POINTS: Array<{ id: EmailPurpose; examples: StartingPointExample[] }> = [
  {
    id: "followup",
    examples: [
      ex("fu-1", PLUM, {
        from: "rep", to: "hcp", subject: "Following up on our conversation", cta: "Book a follow-up",
        blocks: [CLINIC, { kind: "text", text: "Thank you for your time on Tuesday. As promised, here is the Velmora data we discussed." }, PRIMARY, { kind: "doc", title: "Velmora leave-behind", meta: "The piece from our visit · 2 pages" }],
      }),
      ex("fu-2", DARK, {
        from: "rep", to: "hcp", subject: "The data we discussed", cta: "Book a follow-up",
        blocks: [
          { kind: "note", text: "Great to see you at the clinic. You asked about durability, so I've put that first." },
          { kind: "stat", title: "Durable responses", value: "3 yrs", label: "responses maintained through 3 years of follow-up" },
          PRIMARY,
        ],
      }),
    ],
  },
  {
    id: "newdata",
    examples: [
      ex("nd-1", FOREST, {
        from: "rep", to: "hcp", subject: "New long-term results for Velmora", cta: "Watch the 3-year data",
        blocks: [{ ...CLINIC, play: true }, { kind: "stat", title: "3-year extension", value: "3 yrs", label: "responses maintained through 3 years of follow-up" }],
      }),
      ex("nd-2", SLATE, {
        from: "hq", to: "hcp", subject: "What the follow-up showed", cta: "See the full results",
        blocks: [
          { kind: "text", text: "New data from EMBRACE-3, for doctors who asked to hear about Velmora." },
          { kind: "bars", title: "PASI 90 at Week 16", rows: [["Velmora", 52], ["Placebo", 18]] },
          { kind: "checks", items: ["Clear or almost clear skin by Week 16", "One tablet, once a day"] },
        ],
      }),
    ],
  },
  {
    id: "congress",
    examples: [
      ex("cg-1", VIOLET, {
        from: "rep", to: "hcp", subject: "You're invited: Velmora symposium", cta: "Reserve a seat",
        blocks: [
          { kind: "photo", src: "/email/awareness-together.jpg", alt: "Specialists talking at a meeting" },
          { kind: "date", day: "Sat", date: "14", month: "Nov", title: "Three years of Velmora: what the data shows", place: "Industry symposium · Room 6B · 12:30 PM" },
        ],
      }),
      ex("cg-2", UMBER, {
        from: "rep", to: "hcp", subject: "Join us at booth 1214", cta: "Sign up for a session",
        blocks: [
          { kind: "text", text: "Two Velmora data presentations this week. Visit us at booth 1214." },
          { kind: "sessions", items: [["Fri 10:15", "EMBRACE-3: 3-year durability"], ["Sat 14:00", "Real-world adherence to once-daily dosing"]] },
        ],
      }),
    ],
  },
  {
    id: "access",
    examples: [
      ex("ac-1", UMBER, {
        from: "rep", to: "hcp", subject: "Helping your patients start Velmora", cta: "Enrol a patient",
        blocks: [
          { kind: "photo", src: "/email/patient-support.jpg", alt: "A nurse talking with a patient" },
          { kind: "stat", title: "Velmora support", value: "$0", label: "copay for eligible commercially insured patients" },
        ],
      }),
      ex("ac-2", FOREST, {
        from: "hq", to: "hcp", subject: "Support for your patients", cta: "Open the support page",
        blocks: [
          { kind: "text", text: "How Velmora support gets your patients started:" },
          { kind: "steps", items: ["You prescribe and enrol", "We verify coverage", "Pharmacy calls within 48 h"] },
        ],
      }),
    ],
  },
  {
    id: "medq",
    examples: [
      ex("mq-1", SLATE, {
        from: "msl", to: "hcp", subject: "Your question on dose modification", tag: "Medical information · Non-promotional",
        blocks: [
          { kind: "text", text: "Thank you for your question about dose modification. The Prescribing Information says:" },
          { kind: "quote", cite: "Prescribing Information · §2.2", text: "Interrupt treatment if a serious infection develops until the infection resolves." },
          { kind: "text", text: "I'm happy to talk this through. Reply to this email or call me directly." },
        ],
      }),
      ex("mq-2", DARK, {
        from: "msl", to: "hcp", subject: "The paper you asked for", tag: "Medical information · Non-promotional",
        blocks: [
          { kind: "text", text: "As requested, here is the EMBRACE-3 publication. It is a licensed reprint, so you can share it with your team." },
          { kind: "doc", title: "EMBRACE-3 primary analysis", meta: "Licensed reprint · 12 pages" },
        ],
      }),
    ],
  },
  {
    id: "formulary",
    examples: [
      ex("fm-1", SLATE, {
        from: "hq", to: "pt", subject: "Ahead of your formulary review", cta: "Open the formulary kit",
        blocks: [
          { kind: "text", text: "A one-page summary of Velmora for your upcoming review." },
          { kind: "doc", title: "Velmora formulary summary", meta: "1 page · updated Nov 2026" },
          { kind: "checks", items: ["Indication and place in therapy", "Dosing: one tablet, once a day", "Storage at room temperature"] },
        ],
      }),
      ex("fm-2", DARK, {
        from: "hq", to: "pt", subject: "For your P&T committee", cta: "Request the dossier",
        blocks: [
          { kind: "text", text: "Three things your committee will weigh, in one place:" },
          { kind: "steps", items: ["Efficacy vs current options", "Dosing and storage", "Coverage and support"] },
        ],
      }),
    ],
  },
  {
    id: "value",
    examples: [
      ex("va-1", FOREST, {
        from: "hq", to: "pt", subject: "Budget impact and outcomes", cta: "Adjust to your plan",
        blocks: [
          { kind: "text", text: "Our budget impact model, set to a plan of 1 million members." },
          { kind: "bars", title: "Patients reaching PASI 90", rows: [["With Velmora", 52], ["Current mix", 31]] },
          { kind: "doc", title: "Velmora budget impact model", meta: "Adjustable to your population" },
        ],
      }),
      ex("va-2", UMBER, {
        from: "rep", to: "pt", subject: "The value dossier you asked for", cta: "Request the AMCP dossier",
        blocks: [
          { kind: "text", text: "As requested, the Velmora dossier in AMCP format, with the clinical and economic evidence." },
          { kind: "doc", title: "Velmora AMCP dossier", meta: "Clinical and economic evidence" },
        ],
      }),
    ],
  },
];

export function EmailModeScreen() {
  const [dossierModalOpen, setDossierModalOpen] = useState(false);

  const handleSelect = (purpose: EmailPurpose) => {
    useWorkspaceStore.getState().setAssetType("email");
    const def = EMAIL_PURPOSES[purpose];
    /* Formulary and value emails are for the P&T committee; the rest go to HCPs. */
    const audience = purpose === "formulary" || purpose === "value" ? "PT_Committee" : def.audience;
    useEmailStore.getState().setAbout({ audience, sender: def.senders[0], purpose });
    setDossierModalOpen(true);
  };

  return (
    <div className="page-enter max-w-[1140px] space-y-6">
      <PageHeading title="Create Email" description="Approved Email for HCPs and P&T committees, sent from your CRM." />

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
