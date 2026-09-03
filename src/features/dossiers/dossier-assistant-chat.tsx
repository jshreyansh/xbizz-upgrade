"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, Send, Sparkles } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";

/* ─── Shared, fully-client-side "assistant chat" building block, reused on
   every screen of the New Brand Dossier flow (product → path → create/
   upload → preview → success) so each step can be driven by prompt as
   well as by the form controls. No network calls — every reply comes
   from local keyword-matching supplied per step, so it works identically
   with or without a configured ANTHROPIC_API_KEY. ─────────────────────── */

export type AssistantChatMessage = { id: string; role: "user" | "assistant"; text: string };

/** True for anything phrased as a question ("what does this do?", "why do
 *  you need this", "can I skip this") — lets every step answer explanatory
 *  questions before falling through to its normal intent-matching. */
export function isQuestion(text: string): boolean {
  const trimmed = text.trim();
  return /\?$/.test(trimmed) || /^(what|why|how|can|could|does|do|is|are|will|should|who|which)\b/i.test(trimmed);
}

export function useAssistantChat(initialText: string, respond: (text: string) => string) {
  const [messages, setMessages] = useState<AssistantChatMessage[]>([{ id: "m0", role: "assistant", text: initialText }]);
  const [thinking, setThinking] = useState(false);
  const counterRef = useRef(0);

  function push(role: AssistantChatMessage["role"], text: string) {
    counterRef.current += 1;
    setMessages((m) => [...m, { id: `m${counterRef.current}`, role, text }]);
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    push("user", trimmed);
    setThinking(true);
    setTimeout(() => {
      push("assistant", respond(trimmed));
      setThinking(false);
    }, 550 + Math.random() * 450);
  }

  return {
    messages,
    thinking,
    send,
    pushAssistant: (text: string) => push("assistant", text),
    pushUser: (text: string) => push("user", text),
  };
}

interface DossierAssistantPanelProps {
  messages: AssistantChatMessage[];
  thinking?: boolean;
  onSend: (text: string) => void;
  onAttachFile?: (file: File) => void;
  placeholder?: string;
  /** Small context line under the "Dossier Agent" brand name — what this step's prompt can do. */
  subtitle?: string;
  disabled?: boolean;
  disabledNote?: string;
  quickReplies?: string[];
  height?: number;
}

export function DossierAssistantPanel({
  messages,
  thinking,
  onSend,
  onAttachFile,
  placeholder = "Type a message…",
  subtitle = "Prompt-based help for this step",
  disabled,
  disabledNote,
  quickReplies,
  height = 460,
}: DossierAssistantPanelProps) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  function handleSend() {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
  }

  function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && onAttachFile) onAttachFile(file);
    e.target.value = "";
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 20,
        background: "linear-gradient(180deg,#fffaf7,#fff)",
        border: "1px solid var(--hair)",
        boxShadow: "0 1px 1px rgba(20,20,20,.02), 0 24px 48px -28px rgba(200,60,10,.22), 0 8px 20px -12px rgba(20,20,20,.08)",
        overflow: "hidden",
        height,
      }}
    >
      {/* Header — branded "Dossier Agent" identity with a live pulse, no generic label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 15px", borderBottom: "1px solid var(--hair)" }}>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(140deg,#ff7a3d,var(--brand) 55%,#d8320c)",
            boxShadow: "0 6px 14px -6px rgba(253,72,22,.55)",
          }}
        >
          <LogoMark size={16} className="text-white" />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <b style={{ fontSize: 13.5, fontWeight: 800, letterSpacing: "-.2px", color: "var(--ink)" }}>Dossier Agent</b>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c07a",
                animation: "chat-pulse 2s ease-in-out infinite",
              }}
            />
          </div>
          <p style={{ margin: "1px 0 0", fontSize: 11, color: "var(--ink-4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{subtitle}</p>
        </div>
        <Sparkles size={14} color="var(--brand)" style={{ flexShrink: 0, opacity: 0.55 }} />
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 15px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m) => (
          <div
            key={m.id}
            className="animate-in fade-in slide-in-from-bottom-1 duration-300"
            style={{ display: "flex", gap: 8, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}
          >
            {m.role === "assistant" && (
              <span style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: "linear-gradient(140deg,#ff7a3d,var(--brand) 55%,#d8320c)", boxShadow: "0 3px 8px -3px rgba(253,72,22,.5)" }}>
                <LogoMark size={13} className="text-white" />
              </span>
            )}
            <div
              style={{
                maxWidth: "82%",
                fontSize: 12.5,
                lineHeight: 1.5,
                padding: "9px 12px",
                borderRadius: m.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                color: m.role === "user" ? "#fff" : "var(--ink-2)",
                background: m.role === "user" ? "linear-gradient(180deg,#ff5b2d,var(--brand))" : "#fff",
                border: m.role === "user" ? "none" : "1px solid var(--hair)",
                boxShadow: m.role === "user" ? "0 6px 16px -8px rgba(253,72,22,.5)" : "0 1px 2px rgba(20,20,20,.04)",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="animate-in fade-in duration-200" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: "linear-gradient(140deg,#ff7a3d,var(--brand) 55%,#d8320c)" }}>
              <LogoMark size={13} className="text-white" />
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3.5, padding: "9px 13px", borderRadius: "14px 14px 14px 3px", background: "#fff", border: "1px solid var(--hair)", boxShadow: "0 1px 2px rgba(20,20,20,.04)" }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--ink-4)",
                    animation: "typing-bounce 1.1s ease-in-out infinite",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </span>
          </div>
        )}
      </div>

      {quickReplies && quickReplies.length > 0 && !disabled && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "0 15px 12px" }}>
          {quickReplies.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onSend(q)}
              className="hover:-translate-y-px hover:shadow-sm transition-all"
              style={{ fontSize: 11.5, fontWeight: 650, color: "var(--brand-deep)", background: "var(--tint)", border: "1px solid var(--tint-line)", padding: "6px 12px", borderRadius: 99, cursor: "pointer" }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: "11px 13px", borderTop: "1px solid var(--hair)", background: "#fff" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: 5,
            borderRadius: 16,
            background: "var(--surface-subtle)",
            border: `1.5px solid ${focused ? "var(--brand)" : "var(--hair)"}`,
            boxShadow: focused ? "0 0 0 3px rgba(253,72,22,.1)" : "none",
            transition: "border-color .15s var(--e), box-shadow .15s var(--e)",
          }}
        >
          {onAttachFile && (
            <>
              <button
                type="button"
                title="Attach a supporting document"
                onClick={() => fileRef.current?.click()}
                disabled={disabled}
                className="hover:bg-card transition-colors"
                style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", color: "var(--ink-3)", background: "transparent", border: "none" }}
              >
                <Paperclip size={14} />
              </button>
              <input ref={fileRef} type="file" onChange={handleFilePicked} style={{ display: "none" }} />
            </>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            disabled={disabled}
            placeholder={disabled ? disabledNote ?? "Please wait…" : placeholder}
            style={{ flex: 1, minWidth: 0, padding: "7px 4px", borderRadius: 12, border: "none", outline: "none", fontSize: 12.5, color: "var(--ink)", background: "transparent" }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className="hover:brightness-110 active:scale-95 transition"
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              color: "#fff",
              background: !input.trim() || disabled ? "var(--ink-4)" : "linear-gradient(180deg,#ff5b2d,var(--brand))",
              opacity: !input.trim() || disabled ? 0.4 : 1,
              border: "none",
              boxShadow: !input.trim() || disabled ? "none" : "0 4px 10px -4px rgba(253,72,22,.6)",
            }}
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
