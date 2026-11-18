"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { Check, Plus, Search } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/features/settings/settings-store";

/**
 * Who an agency's workspace makes content for. Demo product counts; picking
 * one adds that company's products and their data to the workspace, so a
 * newcomer can tap Pfizer and try it without searching.
 *
 * Asked inside the platform, not at sign-up: an agency's workspace can't
 * make assets until it has a client.
 */
export const CLIENTS: Array<{ name: string; products: string }> = [
  { name: "Pfizer", products: "95K+" },
  { name: "Novartis", products: "70K+" },
  { name: "Johnson & Johnson", products: "60K+" },
  { name: "Roche", products: "50K+" },
  { name: "Sanofi", products: "45K+" },
  { name: "Merck", products: "40K+" },
  { name: "AstraZeneca", products: "35K+" },
  { name: "GSK", products: "30K+" },
  { name: "AbbVie", products: "25K+" },
  { name: "Takeda", products: "22K+" },
  { name: "Eli Lilly", products: "20K+" },
  { name: "Bristol Myers Squibb", products: "18K+" },
  { name: "Novo Nordisk", products: "12K+" },
  { name: "Amgen", products: "10K+" },
];
export type Client = { name: string; products?: string };

/** Pick the client company: popular ones to tap, or search, or type one that isn't listed. */
export function ClientPicker({ client, onPick }: { client?: Client; onPick: (c?: Client) => void }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = q ? CLIENTS.filter((c) => c.name.toLowerCase().includes(q)) : [];
  const exact = CLIENTS.some((c) => c.name.toLowerCase() === q);

  if (client) {
    return (
      <div className="rise-in grid gap-2">
        <div className="flex items-center gap-3 rounded-panel border border-brand bg-tint/50 px-3 py-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-control bg-card text-body font-extrabold text-brand-deep shadow-soft">{client.name.slice(0, 1)}</span>
          <span className="min-w-0 flex-1">
            <b className="block truncate text-body text-ink">{client.name}</b>
            <span className="block text-label text-ink-3">{client.products ? `${client.products} products` : "Products from FDA listings"}</span>
          </span>
          <button type="button" onClick={() => { onPick(undefined); setQuery(""); }} className="shrink-0 cursor-pointer text-label font-bold text-brand hover:text-brand-deep">
            Change
          </button>
        </div>
        {/* What picking it does. */}
        <p className="flex items-start gap-1.5 rounded-control bg-ok-bg px-3 py-2 text-label leading-snug text-ok">
          <Check className="mt-0.5 size-3.5 shrink-0 stroke-[3]" />
          <span>
            <b>{client.products ? `${client.products} ${client.name} products` : `${client.name}'s products`}</b> and their data will be added to this workspace.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-4" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a company, like Pfizer"
          aria-label="Client Company"
          className="w-full rounded-control border border-hair-2 bg-card py-2.5 pl-9 pr-3 text-body text-ink outline-none transition-colors placeholder:text-ink-4 focus:border-brand focus:ring-1 focus:ring-brand/20"
        />
      </div>
      {q ? (
        <div className="grid overflow-hidden rounded-control border border-hair-2 bg-card">
          {matches.slice(0, 5).map((c) => (
            <button key={c.name} type="button" onClick={() => onPick(c)} className="flex cursor-pointer items-center justify-between px-3 py-2 text-left text-body text-ink hover:bg-subtle">
              {c.name}
              <span className="text-label text-ink-4">{c.products} products</span>
            </button>
          ))}
          {!exact && (
            <button type="button" onClick={() => onPick({ name: query.trim() })} className="flex cursor-pointer items-center gap-1.5 px-3 py-2 text-left text-body text-brand hover:bg-tint/50">
              <Plus className="size-3.5" />
              Use &ldquo;{query.trim()}&rdquo;
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {CLIENTS.slice(0, 6).map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => onPick(c)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-chip border border-hair-2 bg-card px-2.5 py-1 text-label font-semibold text-ink transition-colors hover:border-brand hover:bg-tint/50"
            >
              {c.name}
              <span className="text-micro font-semibold text-ink-4">{c.products}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** True for an agency workspace that hasn't been given a client yet: making assets waits on it. */
export function useClientNeeded() {
  return useSettingsStore((s) => s.accountType === "agency" && !s.client);
}

/* One pop-up for the whole app, opened by whatever needs a client, with what to do once there is one. */
const useClientPrompt = create<{ open: boolean; then?: () => void; greeted: boolean; ask: (then?: () => void) => void; close: () => void }>((set) => ({
  open: false,
  /* Asked once on landing; after that only when something needs the client. */
  greeted: false,
  ask: (then) => set({ open: true, then, greeted: true }),
  close: () => set({ open: false, then: undefined }),
}));

/**
 * Runs an action that makes or uses assets, asking for the client first if
 * this agency workspace hasn't got one. Once it's chosen, the action carries on.
 */
export function requireClient(action: () => void) {
  const s = useSettingsStore.getState();
  if (s.accountType === "agency" && !s.client) useClientPrompt.getState().ask(action);
  else action();
}

/** Choose the client and save it on the workspace. */
function PickClient({ onDone }: { onDone?: () => void }) {
  const setClient = useSettingsStore((s) => s.setClient);
  const [client, setPicked] = useState<Client>();
  return (
    <div className="grid gap-4">
      <ClientPicker client={client} onPick={setPicked} />
      <Button disabled={!client} onClick={() => { if (client) { setClient(client); onDone?.(); } }} className="w-full gap-1.5 font-bold">
        <Check className="size-4" />
        Assign Client to This Workspace
      </Button>
    </div>
  );
}

/** The pop-up itself, mounted once in the app shell. */
export function ClientPromptHost() {
  const { open, then, close } = useClientPrompt();
  const needed = useClientNeeded();
  /* A new agency workspace is asked for its client as it lands. Closing it is fine: making anything asks again. */
  useEffect(() => {
    if (needed && !useClientPrompt.getState().greeted) useClientPrompt.getState().ask();
  }, [needed]);
  return (
    <Modal open={open} onClose={close} title="Select a Client" description="Assets in this workspace are made from one client's products. Pick the client to start." size="sm">
      <PickClient onDone={() => { close(); then?.(); }} />
    </Modal>
  );
}
