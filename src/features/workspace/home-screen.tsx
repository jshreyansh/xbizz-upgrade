"use client";

import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  FileImage,
  FileText,
  Film,
  Layers3,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Presentation,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import type { AssetType } from "@/types/content";

const assetTypes: Array<{ type: AssetType; label: string; description: string; icon: typeof Film; accent: string }> = [
  { type: "video", label: "Video", description: "Explainers, cutdowns, stories", icon: Film, accent: "bg-[#dce9e2] text-[#315b49]" },
  { type: "carousel", label: "Carousel", description: "Page-based visual stories", icon: Layers3, accent: "bg-[#e9e5f2] text-[#5c4f79]" },
  { type: "infographic", label: "Infographic", description: "Evidence made visual", icon: Presentation, accent: "bg-[#f4e7dd] text-[#76503b]" },
  { type: "visual", label: "Visual", description: "Social, display, print", icon: FileImage, accent: "bg-[#e3eaf3] text-[#435d7d]" },
];

const projects = [
  { title: "DERMORA HCP launch", type: "Video · 50 sec", status: "In progress", updated: "12 min ago", color: "#244b3c", progress: 68 },
  { title: "CLEARSKIN congress story", type: "Carousel · 8 pages", status: "Changes requested", updated: "Yesterday", color: "#37445f", progress: 84 },
  { title: "Patient discussion guide", type: "Infographic · Letter", status: "In review", updated: "Mon", color: "#6b4e40", progress: 100 },
];

export function HomeScreen() {
  const setView = useWorkspaceStore((state) => state.setView);
  const setAssetType = useWorkspaceStore((state) => state.setAssetType);

  const startAsset = (type: AssetType) => {
    setAssetType(type);
    setView("create");
  };

  return (
    <div className="mx-auto w-full max-w-[1420px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
      <section className="rise-in flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
            <span className="size-1.5 rounded-full bg-[var(--lime)] ring-4 ring-[#e6efcf]" />
            Monday, 24 August
          </div>
          <h1 className="text-[30px] font-[750] tracking-[-0.045em] sm:text-[36px]">Good afternoon, Maya.</h1>
          <p className="mt-1 text-[13px] text-[var(--ink-muted)]">Three pieces need your attention. One is ready to move forward.</p>
        </div>
        <Button variant="secondary" className="self-start sm:self-auto">
          View all activity <ArrowRight className="size-4" />
        </Button>
      </section>

      <section className="soft-noise rise-in mt-8 overflow-hidden rounded-[22px] border border-[#1f4939] bg-[var(--brand)] px-5 py-6 text-white shadow-[var(--shadow-lg)] [animation-delay:60ms] sm:px-7 sm:py-7 lg:grid lg:grid-cols-[1.3fr_0.7fr] lg:gap-10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#c9d8cf]">
            <Sparkles className="size-3.5 text-[var(--lime)]" /> Start with the content job
          </div>
          <h2 className="mt-4 max-w-[640px] text-[25px] font-[720] leading-[1.14] tracking-[-0.035em] sm:text-[31px]">
            Turn an approved source into content people can use.
          </h2>
          <p className="mt-3 max-w-[600px] text-[13px] leading-6 text-[#c6d4ce]">
            Bring the brief, deck, study, or existing asset. SwishX will organise it into a content plan for you to review before building the work.
          </p>
        </div>
        <div className="mt-6 flex items-end justify-start lg:mt-0 lg:justify-end">
          <Button onClick={() => setView("create")} size="lg" className="border-[var(--lime)] bg-[var(--lime)] text-[#173429] hover:bg-[#e1f777]">
            <Plus className="size-4" /> Create new content
          </Button>
        </div>
      </section>

      <section className="rise-in mt-8 [animation-delay:110ms]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[14px] font-bold tracking-[-0.015em]">Start with an asset</h2>
          <button className="focus-ring flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-[var(--ink-muted)] hover:bg-black/5">Browse all <ChevronRight className="size-3.5" /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {assetTypes.map(({ type, label, description, icon: Icon, accent }) => (
            <button
              key={type}
              onClick={() => startAsset(type)}
              className="focus-ring group flex min-h-[98px] items-center gap-4 rounded-[16px] border border-[var(--line)] bg-white p-4 text-left shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:shadow-md"
            >
              <span className={cn("grid size-11 place-items-center rounded-[13px]", accent)}><Icon className="size-5" strokeWidth={1.8} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold">{label}</span>
                <span className="mt-1 block text-[11px] text-[var(--ink-muted)]">{description}</span>
              </span>
              <ChevronRight className="size-4 text-[#aab1ad] transition group-hover:translate-x-0.5 group-hover:text-[var(--brand)]" />
            </button>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rise-in [animation-delay:160ms]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-bold tracking-[-0.015em]">Continue working</h2>
            <button className="focus-ring rounded-lg px-2 py-1 text-[11px] font-semibold text-[var(--ink-muted)] hover:bg-black/5">View all content</button>
          </div>
          <div className="overflow-hidden rounded-[17px] border border-[var(--line)] bg-white shadow-[var(--shadow-sm)]">
            {projects.map((project, index) => (
              <button
                key={project.title}
                onClick={() => index === 0 && setView("studio")}
                className={cn("focus-ring group grid w-full grid-cols-[54px_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 text-left hover:bg-[#fafbf9] sm:grid-cols-[58px_minmax(0,1fr)_160px_110px_auto]", index > 0 && "border-t border-[var(--line)]")}
              >
                <span className="relative grid aspect-video w-[54px] place-items-center overflow-hidden rounded-[9px]" style={{ background: project.color }}>
                  {index === 0 ? <Film className="size-4 text-white/75" /> : index === 1 ? <Layers3 className="size-4 text-white/75" /> : <FileText className="size-4 text-white/75" />}
                  <span className="absolute inset-x-0 bottom-0 h-1 bg-white/20"><span className="block h-full bg-[var(--lime)]" style={{ width: `${project.progress}%` }} /></span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-bold">{project.title}</span>
                  <span className="mt-1 block text-[10px] text-[var(--ink-muted)]">{project.type}</span>
                </span>
                <span className="hidden sm:block">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold", project.status === "Changes requested" ? "bg-[var(--warning-soft)] text-[var(--warning)]" : project.status === "In review" ? "bg-[#e8edf5] text-[#4a617d]" : "bg-[var(--brand-soft)] text-[var(--brand)]") }>
                    <span className="size-1.5 rounded-full bg-current opacity-70" /> {project.status}
                  </span>
                </span>
                <span className="hidden text-[10px] text-[var(--ink-muted)] sm:block">{project.updated}</span>
                <MoreHorizontal className="size-4 text-[#9ba39f] opacity-70 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </section>

        <aside className="rise-in [animation-delay:210ms]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-bold tracking-[-0.015em]">Needs attention</h2>
            <span className="rounded-full bg-[#e9ece9] px-2 py-0.5 text-[9px] font-bold text-[var(--ink-muted)]">3</span>
          </div>
          <div className="rounded-[17px] border border-[var(--line)] bg-white p-2 shadow-[var(--shadow-sm)]">
            <AttentionItem icon={MessageSquareText} title="2 changes requested" detail="CLEARSKIN congress story" meta="Review by today" tone="warning" />
            <AttentionItem icon={ShieldAlert} title="Source update may affect 3 assets" detail="DERMORA Prescribing Information · v4.2" meta="Review impact" tone="danger" />
            <AttentionItem icon={Check} title="Ready for your decision" detail="Patient discussion guide" meta="5 min review" tone="success" />
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-[14px] border border-dashed border-[var(--line-strong)] bg-white/45 px-4 py-3 text-[10px] text-[var(--ink-muted)]">
            <Clock3 className="size-4 text-[#818b86]" /> Next deadline: DERMORA launch review · Wed 4 PM
          </div>
        </aside>
      </div>
    </div>
  );
}

function AttentionItem({ icon: Icon, title, detail, meta, tone }: { icon: typeof Check; title: string; detail: string; meta: string; tone: "warning" | "danger" | "success" }) {
  const tones = {
    warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
    danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
    success: "bg-[var(--brand-soft)] text-[var(--brand)]",
  };

  return (
    <button className="focus-ring group flex w-full gap-3 rounded-[12px] p-3 text-left hover:bg-[#f7f8f6]">
      <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-[10px]", tones[tone])}><Icon className="size-4" strokeWidth={1.8} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold">{title}</span>
        <span className="mt-0.5 block truncate text-[10px] text-[var(--ink-muted)]">{detail}</span>
        <span className="mt-1.5 block text-[9px] font-semibold text-[var(--brand)]">{meta}</span>
      </span>
      <ChevronRight className="mt-2 size-3.5 text-[#aab1ad] group-hover:text-[var(--brand)]" />
    </button>
  );
}
