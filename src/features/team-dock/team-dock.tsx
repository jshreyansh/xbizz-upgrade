"use client";

import { useState, useRef } from "react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { TEAM, type TeamMember } from "@/features/workspace/mock-personas";

interface ChatMessage {
  id: string;
  sender: "user" | TeamMember["key"];
  senderName: string;
  text: string;
  time: string;
  tag?: string;
}

const INITIAL_FEED: ChatMessage[] = [
  {
    id: "m1",
    sender: "brand",
    senderName: "Medical Writer",
    text: "Reviewing the Aveloxa Phase III exacerbation data against FDA guidance.",
    time: "10:24 AM",
    tag: "Dossier",
  },
  {
    id: "m2",
    sender: "green",
    senderName: "MLR Reviewer",
    text: "All 18 on-screen citations have been verified against the approved label.",
    time: "10:25 AM",
    tag: "Audit",
  },
  {
    id: "m3",
    sender: "blue",
    senderName: "Creative Producer",
    text: "Scene 2 molecular kinetic animation is locked at 142 wpm voice cadence.",
    time: "10:26 AM",
    tag: "Direction",
  },
];

const SUGGESTIONS = [
  "Make it 30 seconds",
  "Lead with the safety data",
  "Rewrite this for patients",
  "Check FDA on-screen citation",
];

export function TeamDock() {
  const teamDockOpen = useWorkspaceStore((s) => s.teamDockOpen);
  const toggleTeamDock = useWorkspaceStore((s) => s.toggleTeamDock);

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_FEED);
  const [inputText, setInputText] = useState("");
  const msgIdRef = useRef(100);

  if (!teamDockOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    msgIdRef.current += 1;
    const userMsg: ChatMessage = {
      id: `u-${msgIdRef.current}`,
      sender: "user",
      senderName: "You",
      text,
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");

    // Simulate AI co-worker response
    setTimeout(() => {
      let replyMember: TeamMember["key"] = "brand";
      let replyName = "Medical Writer";
      let replyText = "On it — I will cross-reference the relevant section in the dossier and update the scene script.";

      if (text.toLowerCase().includes("safety") || text.toLowerCase().includes("fda") || text.toLowerCase().includes("citation")) {
        replyMember = "green";
        replyName = "MLR Reviewer";
        replyText = "Verified against FDA OPDP guidance: the safety statement is balanced and the PI link is attached.";
      } else if (text.toLowerCase().includes("second") || text.toLowerCase().includes("patient") || text.toLowerCase().includes("voice")) {
        replyMember = "blue";
        replyName = "Creative Producer";
        replyText = "Adjusting the narrative pace and visual framing to fit the revised timing and tone.";
      }

      msgIdRef.current += 1;
      const aiMsg: ChatMessage = {
        id: `ai-${msgIdRef.current}`,
        sender: replyMember,
        senderName: replyName,
        text: replyText,
        time: "Just now",
        tag: "Action",
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 900);
  };

  return (
    <aside
      style={{
        width: 340,
        flexShrink: 0,
        borderLeft: "1px solid var(--hair)",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        zIndex: 20,
        boxShadow: "var(--sh-3)",
        animation: "dock-in .26s var(--spring) both",
      }}
    >
      {/* Head */}
      <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hair)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <b style={{ fontSize: 15, fontWeight: 800 }}>Your Team</b>
            <span style={{ fontSize: 11, fontWeight: 800, background: "rgba(10,13,20,.08)", color: "var(--ink-3)", padding: "1px 7px", borderRadius: 99 }}>
              5 co-workers
            </span>
          </div>
          <button
            onClick={toggleTeamDock}
            style={{ width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", color: "var(--ink-3)", cursor: "pointer" }}
            title="Close dock (⌘J)"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--ok)", fontWeight: 700 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ok)", display: "block", animation: "blink 2s infinite" }} />
          Session live · All specialists on standby
        </div>
      </div>

      {/* Team Roster Bar */}
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--hair)", background: "var(--tint-2)", maxHeight: 160, overflowY: "auto" }}>
        <div style={{ display: "grid", gap: 6 }}>
          {TEAM.map((t) => (
            <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12 }}>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: t.gradient,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 9,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {t.initials}
              </span>
              <span style={{ flex: 1, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t.name}
              </span>
              <span style={{ fontSize: 10, color: "var(--ok)", fontWeight: 800 }}>Ready</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feed Messages */}
      <div style={{ flex: 1, padding: "14px 16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", textAlign: "center" }}>
          Live Collab Feed
        </div>
        {messages.map((m) => {
          const isUser = m.sender === "user";
          const member = !isUser ? TEAM.find((t) => t.key === m.sender) : null;
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                flexDirection: isUser ? "row-reverse" : "row",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              {!isUser && member && (
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: member.gradient,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 10,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {member.initials}
                </span>
              )}
              <div
                style={{
                  maxWidth: "82%",
                  background: isUser ? "var(--brand)" : "var(--tint)",
                  color: isUser ? "#fff" : "var(--ink)",
                  padding: "10px 12px",
                  borderRadius: isUser ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                  border: isUser ? "none" : "1px solid var(--tint-line)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                  <b style={{ fontSize: 11.5, color: isUser ? "rgba(255,255,255,.9)" : member?.color || "var(--ink)" }}>
                    {m.senderName}
                  </b>
                  <span style={{ fontSize: 10, opacity: 0.6 }}>{m.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.45 }}>{m.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggestions + Prompt Bar Footer */}
      <div style={{ padding: "12px 14px 16px", borderTop: "1px solid var(--hair)", background: "#fff" }}>
        {/* Chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              style={{
                fontSize: 11,
                padding: "4px 9px",
                borderRadius: 99,
                background: "var(--canvas)",
                border: "1px solid var(--hair-2)",
                color: "var(--ink-2)",
                cursor: "pointer",
              }}
              className="hover:border-brand hover:text-brand"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: "flex", gap: 6 }}
        >
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask your team anything…"
            style={{
              flex: 1,
              padding: "9px 12px",
              borderRadius: "var(--r)",
              border: "1px solid var(--hair-2)",
              fontSize: 13,
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "9px 12px",
              borderRadius: "var(--r)",
              background: "var(--brand)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </form>
      </div>
    </aside>
  );
}
