"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { useSettingsStore } from "@/features/settings/settings-store";
import { Field } from "@/components/ui/field";
import { Check } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import { AuthButton, AuthCardHead, AuthLabel, AuthStage } from "@/features/auth/auth-stage";

/* Each market sets the rules its assets are checked against. Only the US is open today; others are coming. */
const AVAILABLE = ["United States"];

/** The organisation's first workspace: a brand or market, and the markets it operates in. */
export function WorkspaceScreen() {
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);
  const orgName = useSettingsStore((s) => s.orgName);
  /* An agency's workspaces are usually its clients. */
  const agency = useSettingsStore((s) => s.accountType === "agency");
  /* An agency names itself here, and its first workspace takes the same name until edited. Its client is chosen later, inside the platform. */
  const [agencyName, setAgencyName] = useState(orgName);
  const [name, setName] = useState(agency ? orgName : `${orgName.split(" ")[0]} Commercial`);
  const [nameEdited, setNameEdited] = useState(false);
  const markets = AVAILABLE;

  const next = () => {
    useSettingsStore.setState({
      ...(agency ? { orgName: agencyName.trim(), legalEntity: agencyName.trim(), client: undefined } : {}),
      workspaceName: name.trim(),
      markets,
      region: "United States",
    });
    /* An agency's welcome credits come once it has a name and a workspace to put them in. */
    setAuthView(agency ? "reward" : "team");
  };

  return (
    <AuthStage
      eyebrow="First workspace"
      title={agency ? "One client," : "Your markets"}
      accent={agency ? "one workspace." : "set the rules."}
      body={
        agency
          ? "Each workspace keeps one client's work in its own sandbox, so it never mixes with another client's."
          : "A workspace is one brand or market, with its own team, libraries and credits. Each asset is written against the label and promotional guidance of the market it ships to, so one dossier can produce an FDA-compliant US reel and an EMA-compliant EU reel without rewriting a claim."
      }
      footnote={`More workspaces can be added later from Settings → ${agency ? "Agency" : "Organisation"}.`}
    >
      <AuthCardHead title={agency ? "Name Your Agency and Workspace" : "Create Your First Workspace"}>
        {agency ? "Your first workspace is where your content is made. You'll pick its client once you're in." : <>Inside {orgName}. This becomes the default for every dossier, reel and campaign made here.</>}
      </AuthCardHead>

      <div className="grid gap-5">
        {agency && (
          <Field
            label="Agency Name"
            value={agencyName}
            onChange={(e) => {
              setAgencyName(e.target.value);
              if (!nameEdited) setName(e.target.value);
            }}
            placeholder="Brightwave Health"
            autoFocus
          />
        )}
        <Field
          label="Workspace Name"
          value={name}
          onChange={(e) => { setName(e.target.value); setNameEdited(true); }}
          placeholder={agency ? "Brightwave Health" : undefined}
          hint={agency ? "Same as your agency to start. You can rename it for a client later." : "Usually a brand or market, like Velmora US"}
        />

        <div>
          <AuthLabel>Country</AuthLabel>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE.map((m) => (
              <span key={m} className="inline-flex items-center gap-1.5 rounded-chip border border-brand bg-tint px-3 py-1.5 text-label font-semibold text-brand-deep">
                <Check className="size-3.5 stroke-[3]" />
                {m}
              </span>
            ))}
            <span aria-disabled className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-chip border border-hair-2 px-3 py-1.5 text-label font-semibold text-ink-4">
              Others
              <span className="rounded-glyph bg-subtle px-1.5 py-px text-micro font-bold text-ink-3">Coming Soon</span>
            </span>
          </div>
        </div>

        {/* Once the market is set: its sources are already connected. */}
        <div className="auth-rise relative overflow-hidden rounded-panel border border-tint-line bg-tint px-3.5 py-3" style={{ animationDelay: "320ms" }}>
          <span aria-hidden className="auth-shine pointer-events-none absolute inset-y-0 -left-1/3 w-1/3" />
          <div className="relative flex items-start gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-white shadow-soft">
              <LogoMark size={17} className="auth-twinkle" />
            </span>
            <p className="text-label leading-snug text-ink-2">
              <b className="text-body font-extrabold text-brand-deep">125+ US medical sources</b> already linked, including FDA, PubMed, ClinicalTrials.gov, CDC and more.
            </p>
          </div>
        </div>

        <AuthButton onClick={next} disabled={name.trim().length < 2 || (agency && agencyName.trim().length < 2)}>{agency ? "Create Workspace" : "Meet Your Team"}</AuthButton>
      </div>
    </AuthStage>
  );
}
