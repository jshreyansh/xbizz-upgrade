/**
 * The campaign plan: what one Ads project will say and show, before anything
 * is generated.
 *
 * One project is one campaign. It is built from a single video story and a
 * single key visual; every ad is one of those, cut or resized for a
 * placement. The same cut serves every placement that takes it (a 30-second
 * 16:9 story runs on YouTube, programmatic video and connected TV alike), so
 * the ad list is grouped by output, not by placement — which is why six
 * placements come out as a handful of assets rather than six designs.
 *
 * Mock content, keyed by brand, standing in for what the model writes from
 * the dossier and the Claims Library.
 */

import type { Scene, SceneGraph, Shot } from "@/types/content";
import type { AdClaim, AdFormat, AdPlacement, AdType } from "@/features/workspace/ad-options";
import { AD_PLACEMENTS } from "@/features/workspace/ad-options";

/* ── Brand facts the story needs ── */

const CONDITION: Record<string, string> = {
  velmora: "moderate-to-severe plaque psoriasis",
  onkavia: "myelofibrosis",
  nirvexa: "rheumatoid arthritis",
  cardioxa: "heart failure",
  pulmovax: "asthma",
};

export function conditionFor(brandId: string): string {
  return CONDITION[brandId] ?? "their condition";
}

const RESULT_GRAPH: Record<string, (brand: string) => SceneGraph> = {
  velmora: (brand) => ({
    title: "PASI 90 at Week 16",
    unit: "% of patients",
    max: 60,
    series: [{ label: brand, value: 52, highlight: true }, { label: "Placebo", value: 18 }],
    footnote: "EMBRACE-3 · Primary endpoint",
  }),
  onkavia: (brand) => ({
    title: "Spleen volume reduction ≥35% at Week 24",
    unit: "% of patients",
    max: 50,
    series: [{ label: brand, value: 41, highlight: true }, { label: "Placebo", value: 1 }],
    footnote: "RELIEF-MF · Primary endpoint",
  }),
  nirvexa: (brand) => ({
    title: "ACR50 at Week 24",
    unit: "% of patients",
    max: 60,
    series: [{ label: brand, value: 46, highlight: true }, { label: "Placebo", value: 15 }],
    footnote: "TARGET-RA · Primary endpoint",
  }),
};

/** The most important risks, as the safety statement speaks them. */
const MAJOR_STATEMENT: Record<string, string> = {
  velmora:
    "Velmora can cause serious infections. Don't start it if you have an infection. Tell your doctor if you've had tuberculosis or hepatitis, or are pregnant. Common side effects include upper respiratory infections and headache.",
  onkavia:
    "Onkavia has a boxed warning for serious infections, death, cancer, major heart events and blood clots. Tell your doctor about any infection, heart problem or blood clot.",
  nirvexa:
    "Nirvexa has a boxed warning for serious bleeding. Tell your doctor if you have a bleeding disorder or are taking blood thinners.",
  pulmovax:
    "PulmoVax can cause serious side effects, including worsening breathing right after use. Common side effects include headache and throat irritation.",
};

export function majorStatement(brandId: string, brand: string): string {
  return (
    MAJOR_STATEMENT[brandId] ??
    `${brand} can cause serious side effects. Talk to your doctor about the risks, and see the full Prescribing Information.`
  );
}

/* ── The video story ── */

const BG = {
  calm: "/6973-197914400_medium.mp4",
  people: "/21617-319452308_medium.mp4",
  science: "/27019-361107952_medium.mp4",
  product: "/133898-758336558_medium.mp4",
  quiet: "/46621-448480587_medium.mp4",
};

function shots(sceneId: string, beats: Array<[string, number, string, string]>): Shot[] {
  let at = 0;
  return beats.map(([label, length, narrationFragment, visualStory], i) => {
    const shot = { id: `${sceneId}-${i + 1}`, index: i + 1, startAt: at, endAt: at + length, label, transitionIn: i === 0 ? "Cut" : "Cross dissolve 300ms", narrationFragment, visualStory };
    at += length;
    return shot;
  });
}

function scene(
  id: string,
  number: number,
  tag: string,
  title: string,
  narration: string,
  visual: string,
  claim: string,
  beats: Array<[string, number, string, string]>,
  extra: Partial<Scene> = {}
): Scene {
  const list = shots(id, beats);
  const duration = list[list.length - 1].endAt;
  return {
    id,
    number,
    title,
    duration,
    narration,
    visual,
    claim,
    evidenceState: "approved",
    narrativeTag: tag,
    mediaType: "none",
    backgroundKind: "video",
    shots: list,
    timings: [
      { elementId: "headline", inAt: 0.3, outAt: duration - 0.4, transitionIn: "Fade up 280ms", transitionOut: "Fade out 200ms" },
      { elementId: "narration", inAt: 0.5, outAt: duration, transitionIn: "Word-by-word reveal", transitionOut: "Hold to cut" },
      { elementId: "background", inAt: 0, outAt: duration, transitionIn: "Cut", transitionOut: "Cross dissolve 400ms" },
      { elementId: "bg-video", inAt: 0, outAt: duration, transitionIn: "Fade up 400ms", transitionOut: "Cross dissolve 400ms" },
      { elementId: "voiceover", inAt: 0.5, outAt: duration, transitionIn: "Fade in 200ms", transitionOut: "Fade out 400ms" },
      ...(extra.graph ? [{ elementId: "graph", inAt: 2, outAt: duration, transitionIn: "Bars draw up 900ms", transitionOut: "Fade out 300ms" }] : []),
    ],
    ...extra,
  };
}

/**
 * The master story. Branded: a moment, the result, how it's taken, the
 * safety statement, the end card — thirty seconds, so the safety statement
 * fits. Unbranded: the condition, never the drug. Reminder: a six-second
 * name-only bumper.
 */
export function buildAdStory(input: {
  brandId: string;
  brand: string;
  adType: AdType;
  claims: AdClaim[];
  leadMessage: string;
  closing: string;
}): Scene[] {
  const { brandId, brand, adType, claims, leadMessage, closing } = input;
  const condition = conditionFor(brandId);

  if (adType === "reminder") {
    return [
      scene("ad-r1", 1, "Brand", brand, `${brand}.`, "The brand name over a calm, bright frame.", "Brand and generic name only",
        [["Name the brand", 3, `${brand}.`, "Brand name resolves over soft light."]], { bgVideoSrc: BG.calm }),
      scene("ad-r2", 2, "Outro", "Ask your doctor", closing, "Logo and closing line, nothing else.", "No claims",
        [["Close on the line", 3, closing, "Logo holds while the closing line appears."]], { bgVideoSrc: BG.quiet }),
    ];
  }

  if (adType === "unbranded") {
    return [
      scene("ad-u1", 1, "Intro", "Living with it", `For many people with ${condition}, the symptoms are only part of it.`, "Everyday moments, shot close and warm.", "Disease-burden statement",
        [["Open on a real moment", 4, `For many people with ${condition},`, "A hand pauses before a sleeve is pulled down."], ["Widen to the day", 4, "the symptoms are only part of it.", "The frame widens to an ordinary morning."]], { bgVideoSrc: BG.people }),
      scene("ad-u2", 2, "Burden", "More than it looks", "It can shape how you sleep, work and show up for the people you love.", "Three quick vignettes: night, work, family.", "Quality-of-life statement",
        [["Night", 3, "It can shape how you sleep,", "A dim bedroom, a restless turn."], ["Work", 3, "work", "A meeting, a glance down."], ["Family", 2, "and show up for the people you love.", "A child's hand reaching up."]], { bgVideoSrc: BG.calm }),
      scene("ad-u3", 3, "Hope", "There are options", "Today there are more ways to manage it than ever.", "Light opens up; the palette warms.", "Treatment-landscape statement",
        [["Turn the light", 4, "Today there are more ways to manage it", "Morning light floods the room."], ["Hold", 4, "than ever.", "A calm, confident walk outside."]], { bgVideoSrc: BG.quiet }),
      scene("ad-u4", 4, "Outro", "Talk to your doctor", closing, "Campaign line on a clean frame. No brand, colours unlike the brand's.", "Call to action",
        [["Close", 6, closing, "The line lands on a clean frame with the campaign site."]], { bgVideoSrc: BG.calm }),
    ];
  }

  const graph = RESULT_GRAPH[brandId]?.(brand);
  const lead = claims[0];
  const easy = claims.find((c) => c.short && c.id !== lead?.id) ?? claims.find((c) => c.short);
  return [
    scene("ad-b1", 1, "Intro", "A moment back", `For adults living with ${condition}, ${leadMessage.charAt(0).toLowerCase()}${leadMessage.slice(1).replace(/\.$/, "")} can change how a day feels.`,
      "A real person, a real morning: shot close, warm and unhurried.", "Patient-moment framing",
      [["Open on the moment", 3.5, `For adults living with ${condition},`, "Close on a hand rolling up a sleeve without thinking twice."], ["Widen to the day", 3.5, "it can change how a day feels.", "The frame widens to a bright, ordinary morning."]],
      { bgVideoSrc: BG.people }),
    scene("ad-b2", 2, "Evidence", "The result", lead ? `${lead.text}.` : `${brand} met its primary endpoint.`,
      "The result as a simple, honest chart, the claim on screen as spoken.", lead ? `${lead.id} · ${lead.source}` : "Primary endpoint",
      [["State the result", 3, lead ? lead.text.split(" vs ")[0] : "", "Claim on a clean plate before anything moves."], ["Draw the chart", 5, lead?.text.includes(" vs ") ? `vs ${lead.text.split(" vs ")[1]}` : "", "Bars draw up; the brand's bar highlighted, placebo in grey."]],
      { bgVideoSrc: BG.science, graph }),
    scene("ad-b3", 3, "Dosing", "How it's taken", easy ? `${easy.text}.` : `Ask how ${brand} is taken.`,
      "The packshot, held still and lit simply.", easy ? `${easy.id} · ${easy.source}` : "Dosing statement",
      [["Show the pack", 4, easy?.text ?? "", "Packshot cross-dissolves in beside the line."]],
      { bgVideoSrc: BG.product }),
    scene("ad-b4", 4, "Safety", "Important safety information", majorStatement(brandId, brand),
      "The safety statement spoken at an even pace and shown as on-screen text, over calm, non-distracting visuals.", "Major statement · from the label",
      [["Speak and show the risks", 8, majorStatement(brandId, brand), "Full-screen safety text, read at an even pace. No competing visuals or music swells."]],
      { bgVideoSrc: BG.quiet }),
    scene("ad-b5", 5, "Outro", "End card", `${closing} See the full Prescribing Information and Medication Guide.`,
      "Logo, closing line and where to find full Prescribing Information.", "Call to action",
      [["Close on the brand", 3, closing, "Logo lockup, closing line, Prescribing Information line beneath."]],
      { bgVideoSrc: BG.calm }),
  ];
}

/* ── The image ad: one designed still every static ad is made from ── */

export interface ImageAdPlan {
  headline: string;
  support?: string;
  imageIdea: string;
  riskLine?: string;
  packshot: boolean;
}

export function buildImageAd(input: { brandId: string; brand: string; adType: AdType; claims: AdClaim[]; leadMessage: string; closing: string }): ImageAdPlan {
  const { brandId, brand, adType, claims, leadMessage, closing } = input;
  if (adType === "unbranded") {
    return { headline: leadMessage, support: closing, imageIdea: `A warm, candid portrait of someone living with ${conditionFor(brandId)}, looking toward the light.`, packshot: false };
  }
  if (adType === "reminder") {
    return { headline: brand, support: closing, imageIdea: "The brand name and logo on a clean, bright field.", packshot: true };
  }
  const support = claims.find((c) => c.text !== leadMessage)?.text;
  return {
    headline: leadMessage,
    support,
    imageIdea: "The same real-morning moment as the video's opening, with space for the headline and the pack.",
    riskLine: `${majorStatement(brandId, brand).split(".")[0]}. See Important Safety Information.`,
    packshot: true,
  };
}

/* ── The carousel ── */

export interface CarouselCard {
  role: "Hook" | "Proof" | "Ask" | "Safety";
  title: string;
  body: string;
  /** What the picture on the card shows. */
  image: string;
}

/** The carousel's outline: what each card does, in the order it is swiped. */
export function buildCarousel(input: { brand: string; adType: AdType; claims: AdClaim[]; leadMessage: string; closing: string; condition: string }): CarouselCard[] {
  const { brand, adType, claims, leadMessage, closing, condition } = input;
  if (adType === "unbranded") {
    return [
      { role: "Hook", title: `Living with ${condition}`, body: "It's more than what people see.", image: "A candid portrait, morning light." },
      { role: "Proof", title: "It shapes the everyday", body: "Sleep, work, the people you love.", image: "Three small everyday moments." },
      { role: "Proof", title: "There are options", body: "More ways to manage it than ever.", image: "A calm walk outside." },
      { role: "Ask", title: "Talk to your doctor", body: closing, image: "A clean card with the campaign line." },
    ];
  }
  const proofs = claims.filter((c) => c.text !== leadMessage).slice(0, 2);
  return [
    { role: "Hook", title: leadMessage, body: brand, image: "The real-morning moment from the video." },
    ...proofs.map((c, i) => ({
      role: "Proof" as const,
      title: c.text,
      body: c.source,
      image: i === 0 ? "The result as a simple chart." : "The packshot, lit simply.",
    })),
    { role: "Ask", title: closing, body: "Tap to learn more", image: "Logo lockup and the closing line." },
    { role: "Safety", title: "Important Safety Information", body: "The full safety information, on its own card.", image: "Text only, no imagery." },
  ];
}

/* ── The ad list ── */

export interface AdOutput {
  id: string;
  name: string;
  format: AdFormat;
  shape: string;
  length?: string;
  from: "Video story" | "Image ad" | "Carousel";
  placements: string[];
  safety: string;
  credits: number;
}

const PLACEMENT_LABEL = (id: AdPlacement) => {
  const p = AD_PLACEMENTS.find((x) => x.id === id)!;
  return `${p.account} · ${p.label}`;
};

/**
 * Every ad the campaign will produce, one row per distinct output, with the
 * placements that output serves. Credits: video by length, a still, a
 * banner set, a carousel.
 */
export function buildAdOutputs(placements: AdPlacement[], adType: AdType): AdOutput[] {
  const reminder = adType === "reminder";
  const safety = (format: AdFormat) =>
    adType === "reminder"
      ? "None needed: name only, no claims"
      : adType === "unbranded"
        ? "None needed: no drug named"
        : format === "video"
          ? "Spoken and on-screen safety statement, then the end card"
          : format === "banner"
            ? "Scrolling safety panel beside the claim"
            : format === "carousel"
              ? "Risk line on every card, last card is safety information"
              : "Risk line on the image, full safety in the post and link";

  type Spec = { key: string; name: string; format: AdFormat; shape: string; length?: string; from: AdOutput["from"]; credits: number };
  const longest = reminder ? "6 sec" : "30 sec";
  const specsFor = (id: AdPlacement): Spec[] => {
    /* One duration in every shape: the story is reframed, never cut down. */
    const videoCredits = reminder ? 250 : 1250;
    const wide30: Spec = { key: "v-16x9", name: "Video, landscape", format: "video", shape: "16:9", length: longest, from: "Video story", credits: videoCredits };
    const tall: Spec = { key: "v-9x16", name: "Video, vertical", format: "video", shape: "9:16", length: longest, from: "Video story", credits: videoCredits };
    const square: Spec = { key: "v-1x1", name: "Video, square", format: "video", shape: "1:1", length: longest, from: "Video story", credits: videoCredits };
    const still45: Spec = { key: "s-4x5", name: "Image ad", format: "image", shape: "4:5", from: "Image ad", credits: 300 };
    const still916: Spec = { key: "s-9x16", name: "Image ad, vertical", format: "image", shape: "9:16", from: "Image ad", credits: 300 };
    const still11: Spec = { key: "s-1x1", name: "Image ad, square", format: "image", shape: "1:1", from: "Image ad", credits: 300 };
    const banners: Spec = { key: "b-set", name: "Banner set", format: "banner", shape: "300×250 · 728×90 · 300×600 · 160×600 · 320×50", from: "Image ad", credits: 900 };
    const carousel: Spec = { key: "c-1x1", name: "Carousel", format: "carousel", shape: "1:1 · 5 cards", from: "Carousel", credits: 750 };
    switch (id) {
      case "youtube": return [wide30];
      case "programmatic-video": return [wide30];
      case "ctv": return [wide30];
      case "meta-feed": return reminder ? [square, still45] : [square, still45, carousel];
      case "meta-reels-stories": return [tall, still916];
      case "tiktok": return [tall];
      case "google-display":
      case "programmatic-display": return [banners];
      case "hcp-networks": return [square, still11];
    }
  };

  const byKey = new Map<string, AdOutput>();
  for (const id of placements) {
    for (const spec of specsFor(id)) {
      const existing = byKey.get(spec.key);
      if (existing) {
        if (!existing.placements.includes(PLACEMENT_LABEL(id))) existing.placements.push(PLACEMENT_LABEL(id));
      } else {
        byKey.set(spec.key, {
          id: spec.key,
          name: spec.name,
          format: spec.format,
          shape: spec.shape,
          length: spec.length,
          from: spec.from,
          placements: [PLACEMENT_LABEL(id)],
          safety: safety(spec.format),
          credits: spec.credits,
        });
      }
    }
  }
  const order: AdFormat[] = ["video", "image", "carousel", "banner"];
  return [...byKey.values()].sort((a, b) => order.indexOf(a.format) - order.indexOf(b.format));
}
