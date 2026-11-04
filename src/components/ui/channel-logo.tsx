"use client";

import { useState } from "react";
import type { EmailChannel } from "@/features/workspace/email-options";
import { cn } from "@/lib/cn";

/**
 * High-fidelity brand vector logos for all supported pharma email and CRM platforms.
 * Veeva, HubSpot, SFMC, IQVIA OCE, Life Sciences Cloud, Braze, and Universal HTML.
 */
export function ChannelLogo({
  id,
  className,
  customSrc,
  mark = false,
}: {
  id: EmailChannel;
  className?: string;
  customSrc?: string;
  /** The logo on its own and larger, for lists where it identifies the row. */
  mark?: boolean;
}) {
  const [customFailed, setCustomFailed] = useState(false);

  if (customSrc && !customFailed) {
    return (
      <div className={cn("shrink-0", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={customSrc}
          alt=""
          className="size-9 rounded-control object-contain"
          onError={() => setCustomFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={cn("shrink-0", className)}>
      {renderVectorLogo(id, mark)}
    </div>
  );
}

/** The logo in its tinted tile, or (mark) the logo on its own, larger. */
function Tile({ mark, box, title, children }: { mark: boolean; box: string; title: string; children: React.ReactNode }) {
  if (mark) {
    return (
      <span className="grid size-12 place-items-center" title={title}>
        {children}
      </span>
    );
  }
  return (
    <div className={cn("flex size-9 items-center justify-center rounded-control border shadow-2xs", box)} title={title}>
      {children}
    </div>
  );
}

function renderVectorLogo(id: EmailChannel, mark: boolean) {
  switch (id) {
    case "veeva":
      return (
        <Tile mark={mark} box="border-[#FCD2B2] bg-[#FFF2E8]" title="Veeva Vault CRM">
          <svg viewBox="0 0 32 32" className={mark ? "size-11" : "size-5"} fill="none">
            <path d="M7 9.5l9 13.5 9-13.5h-4.8l-4.2 6.8L11.8 9.5H7z" fill="#EE7202" />
            <path d="M12.5 9.5l3.5 5.5 3.5-5.5h-7z" fill="#F7941E" opacity="0.8" />
          </svg>
        </Tile>
      );

    case "hubspot":
      return (
        <Tile mark={mark} box="border-[#FFD3C4] bg-[#FFF0EB]" title="HubSpot">
          <svg viewBox="0 0 32 32" className={mark ? "size-11" : "size-5"} fill="none">
            <circle cx="16" cy="16" r="4.2" fill="#FF7A59" />
            <path d="M16 11.8V6" stroke="#FF7A59" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="16" cy="5" r="2.2" fill="#FF7A59" />
            <path d="M19 13l4.5-2.8" stroke="#FF7A59" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="24.8" cy="9.2" r="2.2" fill="#FF7A59" />
            <path d="M13 19l-4.5 2.8" stroke="#FF7A59" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="7.2" cy="22.8" r="2.2" fill="#FF7A59" />
          </svg>
        </Tile>
      );

    case "sfmc":
      return (
        <Tile mark={mark} box="border-[#BCE3FA] bg-[#EAF6FD]" title="Salesforce Marketing Cloud">
          <svg viewBox="0 0 32 32" className={mark ? "size-11" : "size-5"} fill="none">
            <path
              d="M13.2 10a5.2 5.2 0 0 1 8.8 1.8 4.5 4.5 0 0 1 3.8 4.4c0 2.5-2 4.5-4.5 4.5h-11a4.5 4.5 0 0 1-4.5-4.5c0-2.2 1.6-4 3.8-4.4a5.2 5.2 0 0 1 3.6-1.8z"
              fill="#00A1E0"
            />
            <path d="M14.5 15.5l1.5-3 1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="#FFF" opacity="0.95" />
          </svg>
        </Tile>
      );

    case "oce":
      return (
        <Tile mark={mark} box="border-[#BEE0F2] bg-[#EAF4FA]" title="IQVIA OCE">
          <svg viewBox="0 0 32 32" className={mark ? "size-11" : "size-5"} fill="none">
            <path d="M16 6.5l8 4.6v9.2l-8 4.6-8-4.6v-9.2l8-4.6z" stroke="#005587" strokeWidth="2.2" strokeLinejoin="round" />
            <circle cx="16" cy="15.8" r="3.2" fill="#00A3E0" />
            <path d="M16 6.5v5.5M24 20.3l-5-2.8M8 20.3l5-2.8" stroke="#005587" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </Tile>
      );

    case "sfdc":
      return (
        <Tile mark={mark} box="border-[#DDD8FE] bg-[#F4F3FF]" title="Salesforce Life Sciences Cloud">
          <svg viewBox="0 0 32 32" className={mark ? "size-11" : "size-5"} fill="none">
            <path
              d="M13.2 9.5a5.2 5.2 0 0 1 8.8 1.8 4.5 4.5 0 0 1 3.8 4.4c0 2.5-2 4.5-4.5 4.5h-11a4.5 4.5 0 0 1-4.5-4.5c0-2.2 1.6-4 3.8-4.4a5.2 5.2 0 0 1 3.6-1.8z"
              fill="#00A1E0"
            />
            <path d="M13 14c1.5 1 4.5 1 6 0M13 18c1.5-1 4.5-1 6 0" stroke="#FFF" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="16" cy="16" r="1.4" fill="#FFF" />
          </svg>
        </Tile>
      );

    case "braze":
      return (
        <Tile mark={mark} box="border-[#FDC4CB] bg-[#FFF0F2]" title="Braze">
          <svg viewBox="0 0 32 32" className={mark ? "size-11" : "size-5"} fill="none">
            <path
              d="M9.5 21.5c2 2 5.5 2 7.5 0l6-6c2-2 2-5.5 0-7.5s-5.5-2-7.5 0l-6 6c-2 2-2 5.5 0 7.5z"
              stroke="#FF3F56"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="15" r="2.2" fill="#FF3F56" />
          </svg>
        </Tile>
      );

    case "html":
      return (
        <Tile mark={mark} box="border-[#C7D2FE] bg-[#EEF2FF]" title="HTML Package">
          <svg viewBox="0 0 32 32" className={mark ? "size-11" : "size-5"} fill="none">
            <rect x="5" y="7" width="22" height="18" rx="3.5" stroke="#6366F1" strokeWidth="2" />
            <path d="M11 13l-3 3 3 3M21 13l3 3-3 3M17 11.5l-2 9" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Tile>
      );
  }
}
