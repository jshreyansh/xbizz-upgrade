/** Demo personas, team members, messages, and sample assets for the prototype. */

export const PERSONA = {
  name: "Siva Gnanam",
  firstName: "Siva",
  email: "sivaprakasam.gnanam@swishx.com",
  org: "Meridian Therapeutics",
  orgInitials: "MT",
  initials: "S",
  avatarGradient: "linear-gradient(140deg,#3a3f4b,#0d1017)",
} as const;

export interface TeamMember {
  name: string;
  role: string;
  initials: string;
  key: "amber" | "brand" | "green" | "blue" | "violet";
  gradient: string;
  color: string;
}

export const TEAM: TeamMember[] = [
  {
    name: "Content Strategist",
    role: "Shapes the brief, picks the source, sets the angle",
    initials: "CS",
    key: "amber",
    gradient: "linear-gradient(140deg,#f7b733,#d97706)",
    color: "#b45309",
  },
  {
    name: "Medical Writer",
    role: "Drafts every section, grounded in cited sources",
    initials: "MW",
    key: "brand",
    gradient: "linear-gradient(140deg,#ff7a3d,#c9310a)",
    color: "#b82f0c",
  },
  {
    name: "MLR Reviewer",
    role: "Clears or kills each claim before it ships",
    initials: "MR",
    key: "green",
    gradient: "linear-gradient(140deg,#22c07a,#12784a)",
    color: "#12784a",
  },
  {
    name: "Creative Producer",
    role: "Directs scenes, visuals, voice and pacing",
    initials: "CP",
    key: "blue",
    gradient: "linear-gradient(140deg,#4f83ff,#1d4ed8)",
    color: "#1d4ed8",
  },
  {
    name: "Project Manager",
    role: "Runs the render, keeps the record, pings the team",
    initials: "PM",
    key: "violet",
    gradient: "linear-gradient(140deg,#9b6bff,#5b21b6)",
    color: "#5b21b6",
  },
];

export interface DemoMessage {
  memberKey: TeamMember["key"];
  memberName: string;
  text: string;
  time: string;
  unread: boolean;
}

export const MESSAGES: DemoMessage[] = [
  {
    memberKey: "brand",
    memberName: "Medical Writer",
    text: "Drafted all 18 sections for the Velmora dossier. 214 claims cited, 63 held out pending your review.",
    time: "2m ago",
    unread: true,
  },
  {
    memberKey: "green",
    memberName: "MLR Reviewer",
    text: "Cleared the MOA section. One dosing claim needs an updated label reference — flagged in the dossier.",
    time: "14m ago",
    unread: true,
  },
  {
    memberKey: "blue",
    memberName: "Creative Producer",
    text: "Finished the Velmora MOA reel — 45 seconds, narrated, all claims on-screen. Ready to export.",
    time: "1h ago",
    unread: false,
  },
  {
    memberKey: "violet",
    memberName: "Project Manager",
    text: "4 assets sent to MLR queue. Estimated review turnaround: 48 hours based on your team's historical cadence.",
    time: "3h ago",
    unread: false,
  },
];

export interface SampleAsset {
  type: "video" | "canvas";
  title: string;
  engine: string;
  duration: string;
  audience: string;
  market: string;
  gradient: string;
  description: string;
}

export const SAMPLE_VIDEOS: SampleAsset[] = [
  {
    type: "video",
    title: "Velmora — MOA in 45 seconds",
    engine: "Video",
    duration: "0:45",
    audience: "Cardiologists · US",
    market: "FDA",
    gradient: "linear-gradient(160deg,#1b2a4a,#2f4a7d 45%,#5b7fb8)",
    description: "Dual-pathway mechanism, animated and cited to the approved PI.",
  },
  {
    type: "video",
    title: "Dr. Alvarez — digital twin",
    engine: "Avatar Video",
    duration: "0:58",
    audience: "Patients · US",
    market: "FDA",
    gradient: "linear-gradient(160deg,#4a2a1b,#7d4c2f 46%,#b8865b)",
    description: "The physician's own voice and likeness, lip-synced from an approved script.",
  },
  {
    type: "video",
    title: "Onkavia — congress recap",
    engine: "Video",
    duration: "1:12",
    audience: "Oncologists · EU",
    market: "EMA",
    gradient: "linear-gradient(160deg,#3a1e4d,#63307a 48%,#a06bc4)",
    description: "Three pivotal readouts cut down from a 40-minute symposium.",
  },
  {
    type: "video",
    title: "Nirvexa — access & value",
    engine: "Video",
    duration: "1:30",
    audience: "Payers · UK",
    market: "MHRA",
    gradient: "linear-gradient(160deg,#12332c,#1d5a4a 48%,#3f9c7f)",
    description: "Budget-impact story built from the HEOR section of the dossier.",
  },
];

export const SAMPLE_CANVAS: SampleAsset[] = [
  {
    type: "canvas",
    title: "Velmora — journal ad",
    engine: "Infographic",
    duration: "A4",
    audience: "Cardiologists · US",
    market: "FDA",
    gradient: "linear-gradient(150deg,#16233f,#2c4573 50%,#5b7fb8)",
    description: "Full-page journal advert with headline claim, ISI block and PI link, laid out to the brand grid.",
  },
  {
    type: "canvas",
    title: "Onkavia — congress panel",
    engine: "Infographic",
    duration: "2×1m",
    audience: "Oncologists · EU",
    market: "EMA",
    gradient: "linear-gradient(150deg,#33193f,#5b2c70 50%,#9a63bc)",
    description: "Booth panel built from the pivotal-evidence section, sized for a 2×1 metre stand.",
  },
  {
    type: "canvas",
    title: "Nirvexa — payer infographic",
    engine: "Infographic",
    duration: "1:1",
    audience: "Payers · UK",
    market: "MHRA",
    gradient: "linear-gradient(150deg,#0f2e28,#1b5546 50%,#3d9880)",
    description: "Budget-impact infographic drawn from the HEOR section, every figure cited.",
  },
  {
    type: "canvas",
    title: "Glucenta — savings card",
    engine: "Infographic",
    duration: "3.5×2in",
    audience: "Patients · US",
    market: "FDA",
    gradient: "linear-gradient(150deg,#3a2718,#7d5227 50%,#c99a4e)",
    description: "Co-pay savings card front and back, with eligibility terms auto-generated.",
  },
];
