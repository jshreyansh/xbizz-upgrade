import { Building2, Globe2, Mail, MonitorPlay, Presentation, Stethoscope, UsersRound } from "lucide-react";

const iconClass = "size-[17px] shrink-0";

export function ChannelIcon({ value }: { value: string }) {
  if (value === "LinkedIn") return <span className="grid size-5 shrink-0 place-items-center rounded-[5px] bg-[#0A66C2] text-label font-bold leading-none text-white">in</span>;
  if (value === "Instagram") return <span className="grid size-5 shrink-0 place-items-center rounded-[6px] bg-gradient-to-br from-[#7c3aed] via-[#db2777] to-[#f59e0b] text-white"><InstagramMark /></span>;
  if (value === "YouTube") return <span className="grid size-5 shrink-0 place-items-center rounded-[6px] bg-[#FF0033] text-white"><PlayMark /></span>;
  if (value === "Email") return <Mail className={iconClass} />;
  if (value === "Website") return <Globe2 className={iconClass} />;
  if (value === "Congress / event") return <UsersRound className={iconClass} />;
  if (value === "Internal presentation") return <Presentation className={iconClass} />;
  return <MonitorPlay className={iconClass} />;
}

export function AudienceIcon({ value }: { value: string }) {
  if (value === "HCP") return <Stethoscope className={iconClass} />;
  if (value === "Field team") return <UsersRound className={iconClass} />;
  if (value === "Payer") return <Building2 className={iconClass} />;
  return <UsersRound className={iconClass} />;
}

function InstagramMark() {
  return <svg viewBox="0 0 20 20" aria-hidden="true" className="size-[14px] fill-none stroke-current" strokeWidth="1.8"><rect x="3.5" y="3.5" width="13" height="13" rx="4" /><circle cx="10" cy="10" r="3" /><circle cx="14.4" cy="5.8" r=".8" fill="currentColor" stroke="none" /></svg>;
}

function PlayMark() {
  return <svg viewBox="0 0 20 20" aria-hidden="true" className="size-[14px] fill-current"><path d="M7.5 5.8 14 10l-6.5 4.2V5.8Z" /></svg>;
}
