"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { useSettingsStore } from "@/features/settings/settings-store";
import { Field } from "@/components/ui/field";
import { ChipMultiSelect } from "@/components/patterns/chip-multi-select";
import { AuthButton, AuthCardHead, AuthLabel, AuthStage } from "@/features/auth/auth-stage";

/* Each market sets the rules its assets are checked against. */
const MARKETS = ["United States", "European Union", "UK", "Japan", "India", "Australia", "Brazil"];

/** The organisation's first workspace: a brand or market, and the markets it operates in. */
export function WorkspaceScreen() {
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);
  const orgName = useSettingsStore((s) => s.orgName);
  const [name, setName] = useState(`${orgName.split(" ")[0]} Commercial`);
  const [markets, setMarkets] = useState<string[]>(["United States"]);
  const toggle = (id: string) => setMarkets((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  const next = () => {
    useSettingsStore.setState({
      workspaceName: name.trim(),
      markets,
      region: markets.includes("United States") || !markets.includes("European Union") ? "United States" : "European Union",
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
          <AuthLabel>Operating in</AuthLabel>
          <ChipMultiSelect options={MARKETS.map((m) => ({ id: m, label: m }))} selected={markets} onToggle={toggle} />
        </div>

        <AuthButton onClick={next} disabled={name.trim().length < 2 || markets.length === 0}>Meet your team</AuthButton>
      </div>
    </AuthStage>
  );
}
