"use client";

import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { useBrandName } from "@/features/workspace/brand-catalogue";
import { DOSSIERS } from "@/features/workspace/brand-modal-data";
import { brandAdFacts } from "@/features/workspace/ad-options";
import { useProjectIndication } from "@/features/workspace/indication-rows";
import { useEmailStore } from "@/features/workspace/email-store";
import { EMAIL_PURPOSES, approvedLinks, ctaLink, emailBlocks, emailLinks, emailTemplates, isProfessional, libraryPieces, senderInfo, sourceBlocks } from "@/features/workspace/email-options";

/** The parts of an email, top to bottom. Inserted images and links are "m:" + their id. */
export type EmailZone =
  | "header"
  | "header:logo"
  | "header:links"
  | "header:image"
  | "header:heading"
  | "greeting"
  | "note"
  | "opening"
  | "blocks"
  | "piece"
  | "cta"
  | "signoff"
  | "isi"
  | "footer";
export type ZoneType = "lock" | "auto" | "choose" | "type";

export const ZONE_NAME: Record<EmailZone, string> = {
  header: "Header",
  "header:logo": "Logo & Brand Mark",
  "header:links": "Safety Links (PI / ISI)",
  "header:image": "Hero Image",
  "header:heading": "Subject Heading",
  greeting: "Greeting",
  note: "Personal Note",
  opening: "Opening & Indication",
  blocks: "Content Blocks",
  piece: "Attached Documents",
  cta: "Call to Action",
  signoff: "Sign-Off & Signature",
  isi: "Important Safety Information",
  footer: "Footer & Compliance",
};

export const ZONE_TYPE_LABEL: Record<ZoneType, string> = { lock: "Locked", auto: "Filled in", choose: "Sender chooses", type: "Sender types" };

/**
 * The email as the start step, the plan and the editor left it, with
 * everything derived from those answers worked out once.
 */
export function useEmailProject() {
  const dossierId = useWorkspaceStore((s) => s.sourcePayload.dossierId) ?? "";
  const projectName = useWorkspaceStore((s) => s.projectName);
  const brandName = useBrandName(dossierId) || "Onkavia";
  const brandId = DOSSIERS[dossierId]?.brandId ?? dossierId;
  const indication = useProjectIndication();
  const lead = indication.only ?? indication.picked[0] ?? indication.options[0];
  const condition = lead?.condition ?? "the indication";
  const email = useEmailStore();
  const purpose = EMAIL_PURPOSES[email.purpose];
  const audience = email.audience;
  const professional = isProfessional(audience);
  const unbranded = !!purpose.unbranded;
  const sender = senderInfo(email.sender, audience);
  const isHQ = email.sender === "hq";
  const library = libraryPieces(brandName, audience);
  const pieces = library.filter((p) => p.linkable);
  const startPiece = unbranded ? undefined : pieces.find((p) => p.id === email.startPiece);
  /* The pieces the user attached from approved materials or startPiece. */
  const attachedPieces = unbranded
    ? []
    : pieces.filter((p) => email.attached.includes(p.id) || p.id === email.startPiece).sort((a, b) => Number(b.id === startPiece?.id) - Number(a.id === startPiece?.id));
  /* The dossier's blocks, then approved blocks from attached materials, one per file the user added, and custom blocks from chat. */
  const blocks = [
    ...emailBlocks(brandId, brandName, email.sender, audience, condition, email.purpose).map((b) => ({ ...b, group: "dossier" as const })),
    ...sourceBlocks(attachedPieces, email.files),
    ...(email.extraBlocks || []),
  ];
  const included = blocks.filter((b) => !email.offBlocks.includes(b.id));
  const templates = emailTemplates(brandName, audience, condition);
  /* Nothing chosen yet: SwishX's first layout. */
  const template = templates.find((t) => t.id === email.template) ?? templates[0];
  const showNote = !isHQ && email.repEdit.note;
  const links = approvedLinks(brandName, audience, condition);
  const ctas = email.ctas?.length
    ? email.ctas
    : [{ id: "cta-primary", label: email.ctaText.trim() || purpose.cta, url: email.ctaUrl, priority: "primary" as const, blockId: null }];
  const primaryCta = ctas.find((c) => c.priority === "primary") || ctas[0];
  const secondaryCtas = ctas.filter((c) => c.id !== primaryCta.id);
  const backlinks = email.backlinks || [];

  /* What the primary button says: the marketer's words, or the purpose's own. */
  const ctaText = primaryCta?.label.trim() || email.ctaText.trim() || purpose.cta;
  const ctaUrl = primaryCta?.url.trim() || email.ctaUrl.trim();
  const cta = ctaLink(ctaText, ctaUrl, "primary");
  const allLinks = emailLinks(cta, email.media, attachedPieces, audience, unbranded, secondaryCtas, backlinks);
  const subjects = [...purpose.subjects(brandName, condition), ...email.extraSubjects];

  const zoneType = (id: string): ZoneType => {
    if (id === "greeting" || id === "footer") return "auto";
    if (id === "signoff") return isHQ ? "lock" : "auto";
    if (id === "note") return "type";
    if (id === "blocks") return isHQ || !email.repEdit.blocks ? "lock" : "choose";
    if (id === "piece") return isHQ || !email.repEdit.piece || attachedPieces.length < 2 ? "lock" : "choose";
    return "lock";
  };

  /* The parts this email has, in order. */
  const zones: string[] = [
    "header",
    "greeting",
    ...(showNote ? ["note"] : []),
    "opening",
    "blocks",
    ...email.media.map((m) => `m:${m.uid}`),
    ...(attachedPieces.length ? ["piece"] : []),
    "cta",
    "signoff",
    ...(unbranded ? [] : ["isi"]),
    "footer",
  ];

  return {
    email,
    brandName,
    brandId,
    condition,
    wording: lead?.wording,
    boxedWarning: brandAdFacts(brandId).boxedWarning,
    purpose,
    audience,
    professional,
    unbranded,
    sender,
    isHQ,
    blocks,
    included,
    /** Every library piece for this audience, linkable or not, for the picker. */
    library,
    pieces,
    startPiece,
    attachedPieces,
    templates,
    template,
    showNote,
    cta,
    ctaText,
    ctas,
    primaryCta,
    secondaryCtas,
    backlinks,
    /** The audience's approved pages, for the button and the link picker. */
    approved: links,
    links: allLinks,
    subjects,
    subject: subjects[email.subjects[0] ?? 0],
    zoneType,
    zones,
    title: projectName || `${unbranded ? condition[0].toUpperCase() + condition.slice(1) : brandName} · ${purpose.label} email`,
    /** Every claim the email shows: its blocks and anything inserted with a claim on it. */
    claimIds: [...new Set([...included.filter((b) => !b.newClaim).map((b) => b.claimId), ...email.media.flatMap((m) => m.claims)])],
  };
}

export type EmailProject = ReturnType<typeof useEmailProject>;
