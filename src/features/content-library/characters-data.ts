/**
 * Characters: a person the studios can cast, held as a reusable identity.
 *
 * A character is not one picture. It is a set of views that have been checked
 * against each other — front, three-quarter, profile, full body — plus the
 * source the identity was built from. That set is the thing worth keeping:
 * one portrait is a photo, four agreeing views are a person a scene can be
 * shot around.
 */

export const CHARACTER_VIEWS = ["front", "threeQuarter", "profile", "fullBody"] as const;
export type CharacterViewId = (typeof CHARACTER_VIEWS)[number];

export const VIEW_LABEL: Record<CharacterViewId, string> = {
  front: "Front",
  threeQuarter: "¾ view",
  profile: "Profile",
  fullBody: "Full body",
};

/** What the identity was built from. */
export type CreationMethod = "prompt" | "reference";

export const CHARACTER_TYPES = [
  "Doctor",
  "Patient",
  "Company representative",
  "Brand Ambassador",
  "Others",
] as const;
export type CharacterType = (typeof CHARACTER_TYPES)[number];

export interface CharacterView {
  id: CharacterViewId;
  url: string;
  /**
   * How the stock portrait is turned into a different angle.
   *
   * Only for the seeded examples that have a single photograph behind them:
   * the Product Library does the same for camera angles, and a mirrored
   * portrait reads as another view where four unrelated faces read as a bug.
   * A character with real per-view photography leaves this unset.
   */
  transform?: string;
  /** Set when the pack came back short — the view is named but not rendered. */
  missing?: boolean;
}

export interface CharacterSource {
  kind: "prompt" | "image" | "video";
  /** The prompt text, or the file's name. */
  label: string;
  url?: string;
}

export interface Character {
  id: string;
  name: string;
  type: CharacterType;
  /** Free text when the type is Others. */
  typeOther?: string;
  description: string;
  method: CreationMethod;
  views: CharacterView[];
  sources: CharacterSource[];
  createdOn: string;
  /** When it last changed — a rename, a refine, a new identity pack. */
  updatedOn: string;
  archived?: boolean;
  /** Seeded examples sort behind anything this workspace made itself. */
  example?: boolean;
}

/** The type as it should read on a tile: Others gives way to what was typed. */
export function characterTypeLabel(character: Character): string {
  return character.type === "Others" && character.typeOther?.trim()
    ? character.typeOther.trim()
    : character.type;
}

/* ── Seeded examples ─────────────────────────────────────────────────────── */

/** The one character with real photography behind every view. */
const ANAYA_VIEWS: CharacterView[] = [
  { id: "front", url: "/characters/anaya-front.png" },
  { id: "threeQuarter", url: "/characters/anaya-three-quarter.png" },
  { id: "profile", url: "/characters/anaya-profile.png" },
  { id: "fullBody", url: "/characters/anaya-full-body.png" },
];

/** One stock portrait, turned to face four ways. See CharacterView.transform. */
function derivedViews(url: string, missing?: CharacterViewId[]): CharacterView[] {
  const transforms: Record<CharacterViewId, string> = {
    front: "none",
    threeQuarter: "scale(1.08) translateX(-4%)",
    profile: "scaleX(-1) scale(1.14) translateX(-6%)",
    fullBody: "scale(0.82)",
  };
  return CHARACTER_VIEWS.map((id) => ({
    id,
    url,
    transform: transforms[id],
    missing: missing?.includes(id),
  }));
}

export const EXAMPLE_CHARACTERS: Character[] = [
  {
    id: "char-anaya",
    name: "Anaya",
    type: "Doctor",
    description:
      "Indian-born consultant in her late 30s, shoulder-length hair, teal blazer over a plain white tee.",
    method: "reference",
    views: ANAYA_VIEWS,
    sources: [
      { kind: "image", label: "anaya_reference_01.png", url: "/characters/anaya-front.png" },
      { kind: "image", label: "anaya_reference_02.png", url: "/characters/anaya-profile.png" },
    ],
    createdOn: "Sep 12, 2026",
    updatedOn: "Sep 18, 2026",
    example: true,
  },
  {
    id: "char-marcus",
    name: "Marcus",
    type: "Doctor",
    description:
      "American physician in his 50s, close-cropped salt-and-pepper hair, clean white coat over a pale blue shirt.",
    method: "prompt",
    views: derivedViews(
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=900&q=80"
    ),
    sources: [
      {
        kind: "prompt",
        label:
          "American physician in his 50s, close-cropped salt-and-pepper hair, clean white coat over a pale blue shirt, neutral studio backdrop.",
      },
    ],
    createdOn: "Sep 9, 2026",
    updatedOn: "Sep 16, 2026",
    example: true,
  },
  {
    id: "char-hema",
    name: "Hema",
    type: "Patient",
    description:
      "Woman in her early 60s, warm expression, soft knit cardigan — lives with a long-term condition.",
    method: "prompt",
    views: derivedViews(
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80"
    ),
    sources: [
      {
        kind: "prompt",
        label:
          "Woman in her early sixties, warm expression, soft knit cardigan, sitting at home in daylight.",
      },
    ],
    createdOn: "Sep 4, 2026",
    updatedOn: "Sep 4, 2026",
    example: true,
  },
  {
    id: "char-wei",
    name: "Wei",
    type: "Company representative",
    description:
      "Field team lead based in Singapore, wears glasses and a professional turtleneck, lean and fit.",
    method: "reference",
    views: derivedViews(
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=900&q=80",
      ["fullBody"]
    ),
    sources: [{ kind: "video", label: "wei_turntable_60s.mp4", url: "/avatar-showcase.mp4" }],
    createdOn: "Aug 28, 2026",
    updatedOn: "Sep 11, 2026",
    example: true,
  },
];
