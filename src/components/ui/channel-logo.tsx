"use client";

import { useState } from "react";
import type { EmailChannel } from "@/features/workspace/email-options";
import { cn } from "@/lib/cn";

/**
 * High-fidelity brand vector logos for all supported pharma email and CRM platforms.
 * Veeva, HubSpot, SFMC, Health Cloud, IQVIA OCE, Life Sciences Cloud, Braze, and Universal HTML.
 */
export function ChannelLogo({
  id,
  className,
  customSrc,
}: {
  id: EmailChannel;
  className?: string;
  customSrc?: string;
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
      {renderVectorLogo(id)}
    </div>
  );
}

function renderVectorLogo(id: EmailChannel) {
  switch (id) {
    case "veeva":
      return (
        <div className="flex size-9 items-center justify-center rounded-control border border-[#FCD2B2] bg-[#FFF2E8] shadow-2xs" title="Veeva Vault CRM">
          <svg viewBox="0 0 32 32" className="size-5" fill="none">
            <path d="M7 9.5l9 13.5 9-13.5h-4.8l-4.2 6.8L11.8 9.5H7z" fill="#EE7202" />
            <path d="M12.5 9.5l3.5 5.5 3.5-5.5h-7z" fill="#F7941E" opacity="0.8" />
          </svg>
        </div>
      );

    case "hubspot":
      return (
        <div className="flex size-9 items-center justify-center rounded-control border border-[#FFD3C4] bg-[#FFF0EB] shadow-2xs" title="HubSpot">
          <svg viewBox="0 0 32 32" className="size-5" fill="none">
            <circle cx="16" cy="16" r="4.2" fill="#FF7A59" />
            <path d="M16 11.8V6" stroke="#FF7A59" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="16" cy="5" r="2.2" fill="#FF7A59" />
            <path d="M19 13l4.5-2.8" stroke="#FF7A59" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="24.8" cy="9.2" r="2.2" fill="#FF7A59" />
            <path d="M13 19l-4.5 2.8" stroke="#FF7A59" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="7.2" cy="22.8" r="2.2" fill="#FF7A59" />
          </svg>
        </div>
      );

    case "sfmc":
      return (
        <div className="flex size-9 items-center justify-center rounded-control border border-[#BCE3FA] bg-[#EAF6FD] shadow-2xs" title="Salesforce Marketing Cloud">
          <svg viewBox="0 0 32 32" className="size-5" fill="none">
            <path
              d="M13.2 10a5.2 5.2 0 0 1 8.8 1.8 4.5 4.5 0 0 1 3.8 4.4c0 2.5-2 4.5-4.5 4.5h-11a4.5 4.5 0 0 1-4.5-4.5c0-2.2 1.6-4 3.8-4.4a5.2 5.2 0 0 1 3.6-1.8z"
              fill="#00A1E0"
            />
            <path d="M14.5 15.5l1.5-3 1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="#FFF" opacity="0.95" />
          </svg>
        </div>
      );

    case "health":
      return (
        <div className="flex size-9 items-center justify-center rounded-control border border-[#BDEBD9] bg-[#EAF8F3] shadow-2xs" title="Salesforce Health Cloud">
          <svg viewBox="0 0 32 32" className="size-5" fill="none">
            <path
              d="M13.2 9.5a5.2 5.2 0 0 1 8.8 1.8 4.5 4.5 0 0 1 3.8 4.4c0 2.5-2 4.5-4.5 4.5h-11a4.5 4.5 0 0 1-4.5-4.5c0-2.2 1.6-4 3.8-4.4a5.2 5.2 0 0 1 3.6-1.8z"
              fill="#00A1E0"
            />
            <rect x="14.8" y="12.8" width="2.4" height="6.6" rx="0.8" fill="#FFF" />
            <rect x="12.7" y="14.9" width="6.6" height="2.4" rx="0.8" fill="#FFF" />
          </svg>
        </div>
      );

    case "oce":
      return (
        <div className="flex size-9 items-center justify-center rounded-control border border-[#BEE0F2] bg-[#EAF4FA] shadow-2xs" title="IQVIA OCE">
          <svg viewBox="0 0 32 32" className="size-5" fill="none">
            <path d="M16 6.5l8 4.6v9.2l-8 4.6-8-4.6v-9.2l8-4.6z" stroke="#005587" strokeWidth="2.2" strokeLinejoin="round" />
            <circle cx="16" cy="15.8" r="3.2" fill="#00A3E0" />
            <path d="M16 6.5v5.5M24 20.3l-5-2.8M8 20.3l5-2.8" stroke="#005587" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      );

    case "sfdc":
      return (
        <div className="flex size-9 items-center justify-center rounded-control border border-[#DDD8FE] bg-[#F4F3FF] shadow-2xs" title="Salesforce Life Sciences Cloud">
          <svg viewBox="0 0 32 32" className="size-5" fill="none">
            <path
              d="M13.2 9.5a5.2 5.2 0 0 1 8.8 1.8 4.5 4.5 0 0 1 3.8 4.4c0 2.5-2 4.5-4.5 4.5h-11a4.5 4.5 0 0 1-4.5-4.5c0-2.2 1.6-4 3.8-4.4a5.2 5.2 0 0 1 3.6-1.8z"
              fill="#00A1E0"
            />
            <path d="M13 14c1.5 1 4.5 1 6 0M13 18c1.5-1 4.5-1 6 0" stroke="#FFF" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="16" cy="16" r="1.4" fill="#FFF" />
          </svg>
        </div>
      );

    case "braze":
      return (
        <div className="flex size-9 items-center justify-center rounded-control border border-[#FDC4CB] bg-[#FFF0F2] shadow-2xs" title="Braze">
          <svg viewBox="0 0 32 32" className="size-5" fill="none">
            <path
              d="M9.5 21.5c2 2 5.5 2 7.5 0l6-6c2-2 2-5.5 0-7.5s-5.5-2-7.5 0l-6 6c-2 2-2 5.5 0 7.5z"
              stroke="#FF3F56"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="15" r="2.2" fill="#FF3F56" />
          </svg>
        </div>
      );

    case "html":
      return (
        <div className="flex size-9 items-center justify-center rounded-control border border-[#C7D2FE] bg-[#EEF2FF] shadow-2xs" title="HTML Package">
          <svg viewBox="0 0 32 32" className="size-5" fill="none">
            <rect x="5" y="7" width="22" height="18" rx="3.5" stroke="#6366F1" strokeWidth="2" />
            <path d="M11 13l-3 3 3 3M21 13l3 3-3 3M17 11.5l-2 9" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );
  }
}
