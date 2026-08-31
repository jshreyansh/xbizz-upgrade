"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, WifiOff, Paperclip, Send, ArrowRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import type { BrandDossier, ApprovalStatus } from "@/features/dossiers/dossier-types";

/* ─── Chat-based refinement panel, shown alongside the generated preview on
   both the Create and Upload paths. Runs entirely client-side (pattern-
   matches the typed message against a handful of intents — fix/edit a
   section, flag an approval, attach a document) so it works identically
   whether or not the real AI generator is configured; every accepted
   change is applied straight to the dossier draft so the left-hand
   preview updates live. ───────────────────────────────────────────────── */

type ChatMessage = { id: string; role: "user" | "assistant"; text: string };

const APPROVAL_STYLES: Record<ApprovalStatus, { bg: string; fg: string; label: string }> = {
  pending: { bg: "var(--surface-subtle)", fg: "var(--ink-4)", label: "Pending" },
  reviewing: { bg: "#fefce8", fg: "#a16207", label: "In review" },
  approved: { bg: "var(--ok-bg)", fg: "var(--ok)", label: "Approved" },
  "changes-requested": { bg: "#fff5f5", fg: "#dc2626", label: "Changes requested" },
};

interface DossierPreviewChatProps {
  dossier: BrandDossier;
  onChange: (updater: (d: BrandDossier) => BrandDossier) => void;
  onFinish: () => void;
  finishLabel?: string;
}

export function DossierPreviewChat({ dossier, onChange, onFinish, finishLabel = "Looks good — finish" }: DossierPreviewChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m0",
      role: "assistant",
      text: `Here's the first draft of ${dossier.brandName}'s dossier. Tell me what to fix, flag for approval, or attach a supporting document — I'll update the preview on the left live.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef(0);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  function pushMessage(role: ChatMessage["role"], text: string) {
    counterRef.current += 1;
    setMessages((m) => [...m, { id: `m${counterRef.current}`, role, text }]);
  }

  function findSectionMatch(lower: string) {
    return dossier.sections.find((s) =>
      s.title
        .toLowerCase()
        .split(/[\s&/]+/)
        .filter((word) => word.length > 3)
        .some((word) => lower.includes(word))
    );
  }

  function findApprovalMatch(lower: string) {
    return dossier.approvals.find(
      (a) => lower.includes(a.role.toLowerCase()) || lower.includes(a.role.toLowerCase().split(" ")[0])
    );
  }

  function handleSend() {
    const text = input.trim();
    if (!text || thinking) return;
    pushMessage("user", text);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply: string;

      if (/(fix|change|update|edit|revise|rewrite|correct)/.test(lower)) {
        const section = findSectionMatch(lower);
        if (section) {
          onChange((d) => ({
            ...d,
            claimsCited: d.claimsCited + 1,
            sections: d.sections.map((s) =>
              s.id === section.id
                ? { ...s, content: `${s.content} Revised per your note — "${text}".`, claimsCount: s.claimsCount + 1, edited: true }
                : s
            ),
          }));
          reply = `Updated "${section.title}" — you'll see it marked as edited in the preview.`;
        } else {
          onChange((d) => ({ ...d, changeLog: [...(d.changeLog ?? []), text] }));
          reply = "Got it — I've logged that as an open item for the medical writer to address.";
        }
      } else if (/(approv|pending review|reviewer|sign.?off)/.test(lower)) {
        const approval = findApprovalMatch(lower) ?? dossier.approvals.find((a) => a.status === "pending");
        if (approval) {
          onChange((d) => ({
            ...d,
            approvals: d.approvals.map((a) => (a.role === approval.role ? { ...a, status: "reviewing" } : a)),
          }));
          reply = `Marked as pending review — ${approval.role} will see this in their approval queue below.`;
        } else {
          reply = "All approvals are already cleared for this dossier.";
        }
      } else if (/(upload|attach|document|file|support)/.test(lower)) {
        reply = "Sure — click the 📎 icon below and I'll attach it as a cited source right away.";
      } else {
        onChange((d) => ({ ...d, changeLog: [...(d.changeLog ?? []), text] }));
        reply = "Noted — I've logged that for the review team.";
      }

      pushMessage("assistant", reply);
      setThinking(false);
    }, 650 + Math.random() * 450);
  }

  function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    pushMessage("user", `📎 Attached ${file.name}`);
    setThinking(true);
    setTimeout(() => {
      onChange((d) => ({
        ...d,
        sourcesCount: d.sourcesCount + 1,
        sources: [
          ...d.sources,
          { id: `src-user-${d.sources.length + 1}`, name: file.name, type: "slides", date: "Just now", status: "approved", details: "Attached by you", citationCount: 0 },
        ],
      }));
      pushMessage("assistant", `Added "${file.name}" as a cited source — it now shows in Sources on the left.`);
      setThinking(false);
    }, 550);
    e.target.value = "";
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
        <h1 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.3px", margin: 0, color: "var(--ink)" }}>
          Preview — {dossier.brandName}
        </h1>
        {dossier.generatedBy === "ai" ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "var(--brand-deep)", background: "var(--tint)", border: "1px solid var(--tint-line)", padding: "3px 9px", borderRadius: 99, flexShrink: 0 }}>
            <Sparkles size={11} />
            Generated with Claude
          </span>
        ) : (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "var(--ink-4)", background: "var(--surface-subtle)", border: "1px solid var(--hair)", padding: "3px 9px", borderRadius: 99, flexShrink: 0 }}>
            <WifiOff size={11} />
            Offline preview data
          </span>
        )}
      </div>
      <p style={{ fontSize: 13.5, color: "var(--ink-3)", margin: "0 0 18px" }}>
        {dossier.sectionsCount} sections drafted and grounded to {dossier.sourcesCount} sources. Ask for changes on the right — this is the exact view you&rsquo;d walk a client through.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 20, alignItems: "start" }}>
        {/* ── Left: document-style preview ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 340, overflowY: "auto", paddingRight: 2 }}>
            {dossier.sections.map((s) => (
              <div
                key={s.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--r)",
                  background: s.edited ? "var(--tint-2)" : "var(--surface-subtle)",
                  border: s.edited ? "1px solid var(--tint-line)" : "1px solid var(--hair)",
                  transition: "background .3s var(--e), border-color .3s var(--e)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: s.content ? 6 : 0 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: "var(--ok-bg)", border: "1px solid var(--ok-line)", fontSize: 10.5, fontWeight: 800, color: "var(--ok)" }}>
                    {s.number}
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 650, color: "var(--ink-2)", flex: 1 }}>{s.title}</span>
                  {s.edited && (
                    <span style={{ fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", color: "var(--brand-deep)", background: "var(--tint)", padding: "2px 7px", borderRadius: 99 }}>
                      Edited
                    </span>
                  )}
                  <span style={{ fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", color: "var(--ink-4)" }}>{s.claimsCount} claims</span>
                </div>
                {s.content && (
                  <p style={{ margin: "0 0 0 32px", fontSize: 12, lineHeight: 1.5, color: "var(--ink-3)" }}>{s.content}</p>
                )}
              </div>
            ))}
          </div>

          {/* Sources */}
          <div>
            <span style={{ display: "block", fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink-4)", marginBottom: 7 }}>
              Sources ({dossier.sourcesCount})
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {dossier.sources.map((src) => (
                <span
                  key={src.id}
                  style={{ fontSize: 11.5, fontWeight: 650, color: "var(--ink-3)", background: "#fff", border: "1px solid var(--hair)", padding: "5px 10px", borderRadius: 99 }}
                >
                  {src.details === "Attached by you" ? "📎 " : ""}
                  {src.name}
                </span>
              ))}
            </div>
          </div>

          {/* Approvals */}
          <div>
            <span style={{ display: "block", fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink-4)", marginBottom: 7 }}>
              Approvals
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {dossier.approvals.map((a) => {
                const st = APPROVAL_STYLES[a.status];
                return (
                  <span
                    key={a.role}
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, color: st.fg, background: st.bg, padding: "5px 10px", borderRadius: 99 }}
                  >
                    {a.status === "approved" ? <CheckCircle2 size={11} /> : a.status === "changes-requested" ? <AlertCircle size={11} /> : <Clock size={11} />}
                    {a.role} · {st.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Open items logged from chat */}
          {dossier.changeLog && dossier.changeLog.length > 0 && (
            <div>
              <span style={{ display: "block", fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink-4)", marginBottom: 7 }}>
                Open items ({dossier.changeLog.length})
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {dossier.changeLog.map((note, i) => (
                  <div key={i} style={{ fontSize: 12, color: "var(--ink-3)", background: "#fefce8", border: "1px solid #fef08a", borderRadius: "var(--r)", padding: "7px 10px" }}>
                    “{note}”
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: refinement chat ── */}
        <div style={{ display: "flex", flexDirection: "column", border: "1px solid var(--hair)", borderRadius: "var(--r-l)", background: "var(--surface-subtle)", height: 460 }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--hair)" }}>
            <b style={{ fontSize: 13, fontWeight: 750, color: "var(--ink)" }}>Ask for changes</b>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--ink-4)" }}>Prompt-based edits, approvals & documents</p>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m) => (
              <div key={m.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                {m.role === "assistant" && (
                  <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: "linear-gradient(140deg,#ff7a3d,var(--brand) 55%,#d8320c)" }}>
                    <LogoMark size={12} className="text-white" />
                  </span>
                )}
                <div
                  style={{
                    maxWidth: "80%",
                    fontSize: 12.5,
                    lineHeight: 1.45,
                    padding: "8px 11px",
                    borderRadius: 12,
                    color: m.role === "user" ? "#fff" : "var(--ink-2)",
                    background: m.role === "user" ? "linear-gradient(180deg,#ff5b2d,var(--brand))" : "#fff",
                    border: m.role === "user" ? "none" : "1px solid var(--hair)",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {thinking && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: "linear-gradient(140deg,#ff7a3d,var(--brand) 55%,#d8320c)" }}>
                  <LogoMark size={12} className="text-white animate-brand-spin" />
                </span>
                <span style={{ fontSize: 12, color: "var(--ink-4)", fontStyle: "italic" }}>thinking…</span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 12px", borderTop: "1px solid var(--hair)" }}>
            <button
              type="button"
              title="Attach a supporting document"
              onClick={() => fileRef.current?.click()}
              style={{ width: 32, height: 32, borderRadius: "var(--r)", flexShrink: 0, display: "grid", placeItems: "center", color: "var(--ink-3)", background: "#fff", border: "1px solid var(--hair)" }}
            >
              <Paperclip size={14} />
            </button>
            <input ref={fileRef} type="file" onChange={handleFilePicked} style={{ display: "none" }} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="e.g. “fix the safety section wording”"
              style={{ flex: 1, minWidth: 0, padding: "8px 11px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 12.5, color: "var(--ink)" }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || thinking}
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--r)",
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                color: "#fff",
                background: !input.trim() || thinking ? "var(--ink-4)" : "linear-gradient(180deg,#ff5b2d,var(--brand))",
                opacity: !input.trim() || thinking ? 0.5 : 1,
                border: "none",
              }}
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onFinish}
        style={{
          width: "100%",
          marginTop: 22,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "13px 0",
          borderRadius: "var(--r)",
          fontWeight: 750,
          fontSize: 14.5,
          color: "#fff",
          background: "linear-gradient(180deg,#ff5b2d,var(--brand))",
          boxShadow: "0 12px 24px -12px rgba(253,72,22,.6)",
        }}
      >
        {finishLabel}
        <ArrowRight size={15} />
      </button>
    </div>
  );
}
