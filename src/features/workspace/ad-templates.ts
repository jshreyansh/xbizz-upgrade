/**
 * Templates for the still ads: one for the image ad (it covers 4:5, 9:16 and
 * every banner size), one for the carousel's cards, one for the document's
 * pages.
 *
 * A template is a composition, not finished art: where the picture, the
 * headline, the claim, the packshot and the safety band sit. Each one is
 * checked against what this campaign has to say — a template built around a
 * number needs a claim with a number in it, a product hero needs a product
 * the ad is allowed to show — so a template that can't carry the campaign is
 * flagged before anything is made from it.
 */

import type { AdType } from "@/features/workspace/ad-options";

export type AdTemplateLayout = "stat" | "photo" | "product" | "split" | "headline" | "quote" | "minimal";

export interface AdTemplate {
  id: string;
  name: string;
  blurb: string;
  layout: AdTemplateLayout;
}

export const IMAGE_TEMPLATES: AdTemplate[] = [
  { id: "img-stat", name: "Result front and centre", blurb: "The number leads; the picture supports it.", layout: "stat" },
  { id: "img-photo", name: "Full picture, words on top", blurb: "A real moment fills the frame.", layout: "photo" },
  { id: "img-product", name: "Product hero", blurb: "The pack is the picture.", layout: "product" },
  { id: "img-split", name: "Picture beside the words", blurb: "Half picture, half message.", layout: "split" },
  { id: "img-headline", name: "Bold headline card", blurb: "Brand colour and one strong line.", layout: "headline" },
  { id: "img-quote", name: "In their words", blurb: "A patient's line, with their picture.", layout: "quote" },
  { id: "img-minimal", name: "Quiet and minimal", blurb: "Lots of space, one line, small picture.", layout: "minimal" },
];

export const CAROUSEL_TEMPLATES: AdTemplate[] = [
  { id: "car-stack", name: "Picture, then words", blurb: "Picture on top, the line beneath.", layout: "split" },
  { id: "car-photo", name: "Full-picture cards", blurb: "Each card is a moment, words over it.", layout: "photo" },
  { id: "car-stat", name: "Number-led cards", blurb: "Results lead on the proof cards.", layout: "stat" },
  { id: "car-headline", name: "Solid colour cards", blurb: "Brand colour, one line per card.", layout: "headline" },
];

/* A document is read, not glanced at: its templates are page designs, with
   the safety and reference pages always plain text whichever is chosen. */
export const DOCUMENT_TEMPLATES: AdTemplate[] = [
  { id: "doc-split", name: "Clinical summary", blurb: "Picture on top, the finding beneath, on white.", layout: "split" },
  { id: "doc-stat", name: "Data-first pages", blurb: "Each result leads with its number.", layout: "stat" },
  { id: "doc-photo", name: "Picture-led pages", blurb: "A full picture on every page, words over it.", layout: "photo" },
  { id: "doc-headline", name: "Brand colour pages", blurb: "Solid colour, one finding per page.", layout: "headline" },
  { id: "doc-minimal", name: "Quiet and minimal", blurb: "Mostly words and space, a small picture.", layout: "minimal" },
];

export interface TemplateFit {
  ok: boolean;
  note?: string;
}

/** Whether a template can carry this campaign, and why not when it can't. */
export function templateFit(template: AdTemplate, ctx: { adType: AdType; hasNumber: boolean; headline: string }): TemplateFit {
  if (template.layout === "stat" && !ctx.hasNumber) {
    return { ok: false, note: "Needs a result with a number. None of the chosen claims has one." };
  }
  if (template.layout === "product" && ctx.adType === "unbranded") {
    return { ok: false, note: "Help-seeking ads can't show the product." };
  }
  if (template.layout === "headline" && ctx.headline.length > 48) {
    return { ok: true, note: "Long headline: the 320×50 banner uses the short claim instead." };
  }
  return { ok: true };
}

/**
 * The order templates are offered in. References move the closest family to
 * the front; unbranded campaigns lead with people, not products.
 */
export function rankTemplates(list: AdTemplate[], ctx: { adType: AdType; hasReferences: boolean }): AdTemplate[] {
  const weight = (t: AdTemplate) => {
    if (ctx.hasReferences && t.layout === "photo") return -2;
    if (ctx.adType === "unbranded" && (t.layout === "quote" || t.layout === "photo")) return -1;
    if (ctx.adType === "product-claim" && t.layout === "stat") return -1;
    return 0;
  };
  return [...list].sort((a, b) => weight(a) - weight(b));
}
