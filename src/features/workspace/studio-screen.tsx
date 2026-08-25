"use client";

import { Player } from "@remotion/player";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpenCheck,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Expand,
  FileCheck2,
  Film,
  History,
  LayoutPanelTop,
  Link2,
  MessageSquare,
  Mic2,
  MoreHorizontal,
  Play,
  Plus,
  Redo2,
  RefreshCw,
  ScanLine,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TextCursorInput,
  Undo2,
  WandSparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { scenes } from "@/features/workspace/mock-data";
import { DermoraComposition } from "@/features/workspace/video-composition";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { cn } from "@/lib/cn";
import type { EvidenceState, InspectorTab } from "@/types/content";

const evidenceConfig: Record<EvidenceState, { label: string; className: string }> = {
  approved: { label: "Approved", className: "bg-[#e5f1e9] text-[#2d6749]" },
  supported: { label: "Supported", className: "bg-[#e8eef6] text-[#45617e]" },
  changed: { label: "Changed", className: "bg-[var(--warning-soft)] text-[var(--warning)]" },
  unsupported: { label: "Unsupported", className: "bg-[var(--danger-soft)] text-[var(--danger)]" },
};

export function StudioScreen() {
  const { selectedSceneId, setSelectedSceneId, inspectorTab, setInspectorTab, setView } = useWorkspaceStore();
  const [preflightOpen, setPreflightOpen] = useState(false);
  const [relatedOpen, setRelatedOpen] = useState(false);
  const [assistantValue, setAssistantValue] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const selectedScene = useMemo(() => scenes.find((scene) => scene.id === selectedSceneId) ?? scenes[0], [selectedSceneId]);

  const applyAssistant = () => {
    if (!assistantValue.trim()) return;
    setIsApplying(true);
    window.setTimeout(() => {
      setIsApplying(false);
      setAssistantValue("");
    }, 900);
  };

  return (
    <div className="flex h-screen min-h-[720px] flex-col overflow-hidden bg-[#edf0ed]">
      <header className="z-30 flex h-[60px] shrink-0 items-center border-b border-[var(--line)] bg-white px-3 sm:px-4">
        <button onClick={() => setView("home")} className="focus-ring mr-2 grid size-8 place-items-center rounded-lg text-[var(--ink-muted)] hover:bg-black/5" aria-label="Back home"><ArrowLeft className="size-4" /></button>
        <SwishXMark compact />
        <div className="mx-3 h-5 w-px bg-[var(--line)]" />
        <div className="min-w-0">
          <div className="flex items-center gap-2"><span className="truncate text-[11px] font-bold">DERMORA HCP launch</span><span className="hidden rounded-full bg-[#edf1ee] px-2 py-0.5 text-[8px] font-bold text-[#69736e] sm:inline">Draft v1</span></div>
          <div className="mt-0.5 hidden text-[8px] text-[var(--ink-muted)] sm:block">Saved just now · Maya Kapoor</div>
        </div>

        <div className="ml-4 hidden items-center gap-0.5 lg:flex">
          <Button variant="ghost" size="icon" aria-label="Undo"><Undo2 className="size-4" /></Button>
          <Button variant="ghost" size="icon" aria-label="Redo" disabled><Redo2 className="size-4" /></Button>
          <div className="mx-1 h-5 w-px bg-[var(--line)]" />
          <Button variant="ghost" size="sm"><History className="size-3.5" /> Versions</Button>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="icon" aria-label="Comments"><MessageSquare className="size-4" /></Button>
          <Button variant="secondary" size="sm" className="hidden sm:inline-flex" onClick={() => setRelatedOpen(true)}><Plus className="size-3.5" /> Related asset</Button>
          <Button size="sm" onClick={() => setPreflightOpen(true)}><ShieldCheck className="size-3.5" /> Review & export</Button>
          <Button variant="ghost" size="icon" aria-label="More"><MoreHorizontal className="size-4" /></Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[208px_minmax(0,1fr)_310px] max-[980px]:grid-cols-[180px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-r border-[var(--line)] bg-[#f8f9f7]">
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--line)] px-3">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#77817c]">Scenes · 50 sec</span>
            <Button variant="ghost" size="icon" className="size-7" aria-label="Add scene"><Plus className="size-3.5" /></Button>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2.5">
            {scenes.map((scene) => {
              const active = scene.id === selectedSceneId;
              return (
                <button key={scene.id} onClick={() => setSelectedSceneId(scene.id)} className={cn("focus-ring group w-full rounded-[12px] border p-2 text-left transition", active ? "border-[var(--brand)] bg-white shadow-sm ring-1 ring-[rgb(37_79_63/10%)]" : "border-transparent hover:border-[var(--line)] hover:bg-white/70")}>
                  <div className="relative aspect-video overflow-hidden rounded-[8px] bg-[#244a3c]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(216,240,93,.25),transparent_24%)]" />
                    <span className="absolute left-2 top-2 grid size-5 place-items-center rounded-md bg-black/25 text-[8px] font-bold text-white">{scene.number}</span>
                    <span className="absolute bottom-1.5 right-1.5 rounded bg-black/35 px-1.5 py-0.5 text-[7px] font-bold text-white/90">{scene.duration}s</span>
                    {active && <span className="absolute inset-0 grid place-items-center"><span className="grid size-7 place-items-center rounded-full bg-white/90 text-[var(--brand)] shadow"><Play className="ml-0.5 size-3" fill="currentColor" /></span></span>}
                  </div>
                  <div className="mt-2 flex items-start gap-2">
                    <span className="min-w-0 flex-1"><span className="block truncate text-[9px] font-bold">{scene.title}</span><span className="mt-0.5 block truncate text-[7.5px] text-[var(--ink-muted)]">{scene.narration}</span></span>
                    <span className={cn("mt-0.5 size-1.5 shrink-0 rounded-full", scene.evidenceState === "approved" ? "bg-[#4b9a68]" : scene.evidenceState === "changed" ? "bg-[#d29231]" : "bg-[#6488ab]")} />
                  </div>
                </button>
              );
            })}
          </div>
          <button className="focus-ring m-2.5 flex shrink-0 items-center justify-center gap-2 rounded-[10px] border border-dashed border-[var(--line-strong)] py-2.5 text-[8px] font-bold text-[var(--ink-muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"><Plus className="size-3" /> Add scene</button>
        </aside>

        <main className="grid min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_76px]">
          <div className="relative flex min-h-0 flex-col bg-[#e6e9e6]">
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-[rgb(202_209_205/70%)] bg-white/45 px-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[8px] font-bold text-[#717b76]"><span className="rounded-md bg-white px-2 py-1 shadow-sm">Scene {selectedScene.number} of {scenes.length}</span><span>{selectedScene.title}</span></div>
              <div className="flex items-center gap-1.5 text-[8px] font-bold text-[#717b76]"><span className="rounded-md bg-white px-2 py-1 shadow-sm">Fit</span><Button variant="ghost" size="icon" className="size-7" aria-label="Full screen preview"><Expand className="size-3.5" /></Button></div>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center p-5 lg:p-8">
              <div className="w-full max-w-[840px] overflow-hidden rounded-[8px] bg-[#173d31] shadow-[0_28px_80px_rgb(24_37_31/22%)] ring-1 ring-black/10">
                <Player
                  component={DermoraComposition}
                  durationInFrames={300}
                  compositionWidth={960}
                  compositionHeight={540}
                  fps={30}
                  controls
                  loop
                  style={{ width: "100%", aspectRatio: "16 / 9" }}
                />
              </div>
            </div>

          </div>

          <div className="flex min-w-0 items-center gap-3 border-t border-[var(--line)] bg-white px-3">
            <div className="flex shrink-0 items-center gap-2 pr-1 text-[8px] font-bold text-[var(--ink-muted)]"><LayoutPanelTop className="size-3.5" /><span className="text-[var(--ink)]">Story</span></div>
            <div className="flex min-w-0 flex-1 gap-1.5">
              {scenes.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => setSelectedSceneId(scene.id)}
                  className={cn(
                    "focus-ring flex min-w-0 flex-1 items-center gap-2 rounded-[9px] border px-2.5 py-2 text-left",
                    scene.id === selectedSceneId ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]" : "border-[var(--line)] bg-[#fafbf9] text-[#65706a] hover:bg-white",
                  )}
                >
                  <span className="grid size-5 shrink-0 place-items-center rounded-md bg-white text-[7px] font-bold shadow-sm">{scene.number}</span>
                  <span className="min-w-0 flex-1 truncate text-[7.5px] font-bold">{scene.title}</span>
                  <span className="hidden text-[7px] font-semibold opacity-70 xl:inline">{scene.duration}s</span>
                </button>
              ))}
            </div>
            <span className="shrink-0 text-[8px] font-bold text-[var(--ink-muted)]">50 sec</span>
          </div>
        </main>

        <aside className="flex min-h-0 flex-col border-l border-[var(--line)] bg-white max-[980px]:hidden">
          <div className="grid h-11 shrink-0 grid-cols-3 border-b border-[var(--line)] px-2">
            <InspectorTabButton tab="edit" current={inspectorTab} onClick={setInspectorTab} icon={SlidersHorizontal}>Edit</InspectorTabButton>
            <InspectorTabButton tab="assistant" current={inspectorTab} onClick={setInspectorTab} icon={Sparkles}>Ask SwishX</InspectorTabButton>
            <InspectorTabButton tab="evidence" current={inspectorTab} onClick={setInspectorTab} icon={BookOpenCheck}>Sources</InspectorTabButton>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {inspectorTab === "edit" && (
              <div className="p-4">
                <div className="flex items-start justify-between gap-3"><div><div className="text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--ink-muted)]">Scene {selectedScene.number} · {selectedScene.duration} sec</div><h2 className="mt-1 text-[14px] font-bold tracking-[-0.02em]">{selectedScene.title}</h2></div><Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-4" /></Button></div>

                <InspectorSection icon={Mic2} label="Narration">
                  <textarea defaultValue={selectedScene.narration} key={`${selectedScene.id}-narration`} rows={5} className="focus-ring w-full resize-none rounded-[10px] border border-[var(--line)] bg-[#fafbf9] p-3 text-[10px] leading-4" />
                  <div className="mt-2 flex items-center justify-between text-[8px] text-[var(--ink-muted)]"><span>32 words · ~{selectedScene.duration}s</span><button onClick={() => setInspectorTab("assistant")} className="font-bold text-[var(--brand)]">Improve with SwishX</button></div>
                </InspectorSection>

                <InspectorSection icon={LayoutPanelTop} label="Visual">
                  <textarea defaultValue={selectedScene.visual} key={`${selectedScene.id}-visual`} rows={4} className="focus-ring w-full resize-none rounded-[10px] border border-[var(--line)] bg-[#fafbf9] p-3 text-[10px] leading-4" />
                  <button className="focus-ring mt-2 flex w-full items-center justify-between rounded-[9px] border border-[var(--line)] bg-white px-3 py-2 text-left"><span><span className="block text-[7px] font-bold uppercase tracking-[0.08em] text-[#8a938e]">Style</span><span className="mt-0.5 block text-[8px] font-semibold">Scientific · measured pace</span></span><span className="text-[8px] font-bold text-[var(--brand)]">Change</span></button>
                </InspectorSection>

                <InspectorSection icon={TextCursorInput} label="On-screen text">
                  <input defaultValue={selectedScene.number === 3 ? "A clearer view of clinical response" : selectedScene.title} key={`${selectedScene.id}-copy`} className="focus-ring h-10 w-full rounded-[10px] border border-[var(--line)] bg-[#fafbf9] px-3 text-[10px]" />
                </InspectorSection>
              </div>
            )}

            {inspectorTab === "assistant" && (
              <div className="flex min-h-full flex-col">
                <div className="border-b border-[var(--line)] bg-[#f8fbf8] p-4"><div className="flex items-center gap-2 text-[10px] font-bold"><span className="grid size-7 place-items-center rounded-[9px] bg-[var(--brand)] text-white"><Sparkles className="size-3.5" /></span> Work on Scene {selectedScene.number}</div><p className="mt-2 text-[9px] leading-4 text-[var(--ink-muted)]">Your request will apply only to this scene. SwishX will show the change before replacing anything.</p></div>
                <div className="space-y-2 p-4"><PromptChip onClick={setAssistantValue}>Make the evidence easier to understand</PromptChip><PromptChip onClick={setAssistantValue}>Make the visual more scientific</PromptChip><PromptChip onClick={setAssistantValue}>Shorten without changing the claim</PromptChip></div>
                <div className="mt-auto border-t border-[var(--line)] p-3">
                  {isApplying && <div className="mb-2 flex items-center gap-2 rounded-[10px] bg-[var(--brand-soft)] px-3 py-2 text-[8px] font-bold text-[var(--brand)]"><RefreshCw className="size-3 animate-spin" /> Preparing a scoped preview…</div>}
                  <div className="rounded-[12px] border border-[var(--line-strong)] bg-white p-2 focus-within:border-[var(--brand)]"><textarea value={assistantValue} onChange={(event) => setAssistantValue(event.target.value)} rows={3} placeholder="Describe the change…" className="w-full resize-none px-1 py-1 text-[10px] leading-4 outline-none" /><div className="mt-1 flex items-center justify-between"><span className="rounded bg-[#f1f3f1] px-2 py-1 text-[7px] font-bold text-[var(--ink-muted)]">Scope: Scene {selectedScene.number}</span><Button onClick={applyAssistant} disabled={!assistantValue.trim() || isApplying} size="icon" className="size-7"><Send className="size-3" /></Button></div></div>
                </div>
              </div>
            )}

            {inspectorTab === "evidence" && (
              <div className="p-4">
                <div className="flex items-center justify-between"><div><div className="text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--ink-muted)]">Scene evidence</div><h2 className="mt-1 text-[14px] font-bold">1 claim occurrence</h2></div><span className={cn("rounded-full px-2.5 py-1 text-[8px] font-bold", evidenceConfig[selectedScene.evidenceState].className)}>{evidenceConfig[selectedScene.evidenceState].label}</span></div>
                <div className="mt-4 rounded-[12px] border border-[var(--line)] p-3"><div className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#7f8983]">Claim</div><p className="mt-2 text-[10px] font-semibold leading-4">{selectedScene.claim}</p><div className="mt-3 flex items-center gap-2"><span className="grid size-7 place-items-center rounded-lg bg-[#f0e8e4] text-[#985947]"><FileCheck2 className="size-3.5" /></span><span className="min-w-0 flex-1"><span className="block truncate text-[8px] font-bold">DERMORA Core Launch Deck</span><span className="text-[7px] text-[var(--ink-muted)]">v4.2 · pages 18–20</span></span><Button variant="ghost" size="icon" className="size-7"><Link2 className="size-3.5" /></Button></div></div>
                {selectedScene.evidenceState === "changed" && <div className="mt-3 flex items-start gap-2 rounded-[12px] bg-[var(--warning-soft)] p-3 text-[8px] leading-4 text-[var(--warning)]"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" /><span><strong>Wording changed.</strong> Compare this sentence with the approved dosing statement before submission.</span></div>}
                <div className="mt-5 border-t border-[var(--line)] pt-4"><div className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#7f8983]">Inherited by</div><div className="mt-2 flex items-center gap-2 rounded-[10px] border border-[var(--line)] p-2.5"><Copy className="size-3.5 text-[var(--ink-muted)]" /><span className="flex-1 text-[8px] font-semibold">No related assets yet</span><Button variant="ghost" size="sm" onClick={() => setRelatedOpen(true)}>Create</Button></div></div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {preflightOpen && <PreflightModal onClose={() => setPreflightOpen(false)} />}
      {relatedOpen && <RelatedAssetModal onClose={() => setRelatedOpen(false)} />}
    </div>
  );
}

function InspectorTabButton({ tab, current, onClick, icon: Icon, children }: { tab: InspectorTab; current: InspectorTab; onClick: (tab: InspectorTab) => void; icon: typeof Sparkles; children: React.ReactNode }) {
  const active = tab === current;
  return <button onClick={() => onClick(tab)} className={cn("focus-ring relative flex items-center justify-center gap-1.5 text-[8px] font-bold", active ? "text-[var(--brand)]" : "text-[var(--ink-muted)] hover:text-[var(--ink)]") }><Icon className="size-3.5" />{children}{active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[var(--brand)]" />}</button>;
}

function InspectorSection({ icon: Icon, label, children }: { icon: typeof Mic2; label: string; children: React.ReactNode }) {
  return <section className="mt-5 border-t border-[var(--line)] pt-4"><div className="mb-2 flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.1em] text-[#717b76]"><Icon className="size-3.5" />{label}</div>{children}</section>;
}

function PromptChip({ children, onClick }: { children: string; onClick: (value: string) => void }) {
  return <button onClick={() => onClick(children)} className="focus-ring flex w-full items-center gap-2 rounded-[10px] border border-[var(--line)] bg-white px-3 py-2.5 text-left text-[8px] font-semibold hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"><WandSparkles className="size-3.5 shrink-0 text-[var(--brand)]" />{children}</button>;
}

function PreflightModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#10231c]/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Review and export">
      <div className="rise-in w-full max-w-[720px] overflow-hidden rounded-[22px] border border-white/40 bg-white shadow-[var(--shadow-lg)]">
        <div className="flex items-start justify-between border-b border-[var(--line)] p-5 sm:p-6"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand)]"><ShieldCheck className="size-3.5" /> Review readiness</div><h2 className="mt-2 text-[22px] font-[750] tracking-[-0.035em]">One issue needs a decision.</h2><p className="mt-1 text-[10px] text-[var(--ink-muted)]">Preflight checked evidence, brand, accessibility, and video production.</p></div><Button variant="ghost" size="icon" onClick={onClose}><X className="size-4" /></Button></div>
        <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
          <PreflightStat icon={BookOpenCheck} value="11/12" label="Evidence linked" tone="success" />
          <PreflightStat icon={CheckCircle2} value="Passed" label="Brand system" tone="success" />
          <PreflightStat icon={AlertTriangle} value="1 change" label="Needs review" tone="warning" />
        </div>
        <div className="mx-5 rounded-[14px] border border-[#edd5aa] bg-[var(--warning-soft)] p-4 sm:mx-6"><div className="flex items-start gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-white/75 text-[var(--warning)]"><AlertTriangle className="size-4" /></span><div className="min-w-0 flex-1"><div className="text-[10px] font-bold text-[var(--warning)]">Scene 4 dosing wording changed</div><p className="mt-1 text-[9px] leading-4 text-[#7a5b28]">The meaning appears consistent, but the sentence no longer exactly matches the approved statement. Restore approved wording or send the change for reviewer judgment.</p><div className="mt-3 flex gap-2"><Button variant="secondary" size="sm">Restore approved wording</Button><Button variant="ghost" size="sm">Keep and flag</Button></div></div></div></div>
        <div className="mt-5 border-t border-[var(--line)] bg-[#f8faf8] p-5 sm:flex sm:items-center sm:justify-between sm:p-6"><div className="flex items-center gap-2 text-[9px] text-[var(--ink-muted)]"><FileCheck2 className="size-4" /> Review package includes storyboard timestamps and source anchors.</div><div className="mt-4 flex gap-2 sm:mt-0"><Button variant="secondary"><Download className="size-3.5" /> Export draft</Button><Button><Send className="size-3.5" /> Send for review</Button></div></div>
      </div>
    </div>
  );
}

function PreflightStat({ icon: Icon, value, label, tone }: { icon: typeof CheckCircle2; value: string; label: string; tone: "success" | "warning" }) {
  return <div className="rounded-[13px] border border-[var(--line)] p-3"><div className="flex items-center gap-2"><Icon className={cn("size-4", tone === "success" ? "text-[#3f815a]" : "text-[var(--warning)]")} /><span className="text-[12px] font-bold">{value}</span></div><div className="mt-1 text-[8px] font-semibold text-[var(--ink-muted)]">{label}</div></div>;
}

function RelatedAssetModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState("carousel");
  const assets = [{ id: "carousel", label: "6-page carousel", detail: "Reuse the evidence-led visual system", icon: LayoutPanelTop }, { id: "cutdown", label: "15-second cutdown", detail: "Keep the pivotal evidence and close", icon: Film }, { id: "visual", label: "Congress visual", detail: "Turn the evidence scene into a static", icon: ScanLine }];
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#10231c]/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Create related asset"><div className="rise-in w-full max-w-[610px] overflow-hidden rounded-[22px] bg-white shadow-[var(--shadow-lg)]"><div className="flex items-start justify-between border-b border-[var(--line)] p-5"><div><div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--brand)]">Reuse this content</div><h2 className="mt-2 text-[21px] font-[750] tracking-[-0.035em]">Create a related asset</h2><p className="mt-1 text-[9px] text-[var(--ink-muted)]">Brief, sources, evidence, and visual decisions stay connected.</p></div><Button variant="ghost" size="icon" onClick={onClose}><X className="size-4" /></Button></div><div className="space-y-2 p-5">{assets.map(({ id, label, detail, icon: Icon }) => <button key={id} onClick={() => setSelected(id)} className={cn("focus-ring flex w-full items-center gap-3 rounded-[13px] border p-3 text-left", selected === id ? "border-[var(--brand)] bg-[var(--brand-soft)] ring-1 ring-[var(--brand)]" : "border-[var(--line)] hover:bg-[#fafbf9]")}><span className="grid size-10 place-items-center rounded-[11px] bg-white text-[var(--brand)] shadow-sm"><Icon className="size-4" /></span><span className="flex-1"><span className="block text-[10px] font-bold">{label}</span><span className="mt-1 block text-[8px] text-[var(--ink-muted)]">{detail}</span></span>{selected === id && <span className="grid size-5 place-items-center rounded-full bg-[var(--brand)] text-white"><Check className="size-3" /></span>}</button>)}</div><div className="border-t border-[var(--line)] bg-[#f8faf8] p-5"><Button className="w-full"><Sparkles className="size-3.5" /> Create related draft</Button></div></div></div>;
}
