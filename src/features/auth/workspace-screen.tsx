"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { useSettingsStore } from "@/features/settings/settings-store";
import { Field } from "@/components/ui/field";
import { ChipMultiSelect } from "@/components/patterns/chip-multi-select";
import { AuthButton, AuthCardHead, AuthLabel, AuthStage } from "@/features/auth/auth-stage";
import { cn } from "@/lib/cn";

const PRIMARY_MARKETS = [
  { id: "United States · FDA", flag: "🇺🇸", desc: "Claims checked against the approved PI and OPDP promotional guidance" },
  { id: "European Union · EMA", flag: "🇪🇺", desc: "Claims checked against the SmPC and EFPIA code" },
];
const SECONDARY_MARKETS = ["UK", "Japan", "India", "Australia", "Brazil"];
const THERAPY_AREAS = ["Cardiology", "Oncology", "Immunology", "Neurology", "Dermatology"];

/** The organisation's first workspace: a brand or market, with the markets that set its rules. */
export function WorkspaceScreen() {
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);
  const orgName = useSettingsStore((s) => s.orgName);
  const [name, setName] = useState(`${orgName.split(" ")[0]} Commercial`);
  const [primary, setPrimary] = useState(PRIMARY_MARKETS[0].id);
  const [secondary, setSecondary] = useState<string[]>(["UK", "Japan"]);
  const [therapies, setTherapies] = useState<string[]>(["Cardiology", "Oncology"]);

  const toggle = (list: string[], set: (v: string[]) => void, id: string) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const next = () => {
    useSettingsStore.setState({
      workspaceName: name.trim(),
      markets: [primary, ...secondary],
      therapyAreas: therapies,
      region: primary.startsWith("European") ? "European Union" : "United States",
    });
    setAuthView("team");
  };

  return (
    <AuthStage
      eyebrow="Step 3 of 4 · First workspace"
      title="Your markets"
      accent="set the rules."
      body="A workspace is one brand or market, with its own team, libraries and credits. Each asset is written against the label and promotional guidance of the market it ships to, so one dossier can produce an FDA-compliant US reel and an EMA-compliant EU reel without rewriting a claim."
      footnote={`More workspaces can be added later from Settings → Organisation.`}
    >
      <AuthCardHead title="Create your first workspace">
        Inside {orgName}. This becomes the default for every dossier, reel and campaign made here.
      </AuthCardHead>

      <div className="grid gap-5">
        <Field label="Workspace name" value={name} onChange={(e) => setName(e.target.value)} hint="Usually a brand or market, like Velmora US" />

        <div>
          <AuthLabel>Primary market</AuthLabel>
          <div className="grid gap-2">
            {PRIMARY_MARKETS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPrimary(m.id)}
                aria-pressed={primary === m.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-control border px-3.5 py-3 text-left transition-colors",
                  primary === m.id ? "border-brand bg-tint" : "border-hair-2 bg-card hover:border-ink-4"
                )}
              >
                <span className="text-title leading-none">{m.flag}</span>
                <span>
                  <b className="mb-0.5 block text-body text-ink">{m.id}</b>
                  <span className="text-label leading-snug text-ink-3">{m.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <AuthLabel>Also operating in</AuthLabel>
          <ChipMultiSelect options={SECONDARY_MARKETS.map((m) => ({ id: m, label: m }))} selected={secondary} onToggle={(id) => toggle(secondary, setSecondary, id)} />
        </div>

        <div>
          <AuthLabel>Therapy areas</AuthLabel>
          <ChipMultiSelect options={THERAPY_AREAS.map((t) => ({ id: t, label: t }))} selected={therapies} onToggle={(id) => toggle(therapies, setTherapies, id)} />
        </div>

        <AuthButton onClick={next} disabled={name.trim().length < 2}>Meet your team</AuthButton>
      </div>
    </AuthStage>
  );
}
