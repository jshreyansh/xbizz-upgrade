#!/usr/bin/env python3
"""Migrate feature code onto the design-system tokens.

Three phases, separable so each can be committed and reverted on its own:

  vars     zero visual change    [var(--x)] -> utilities, font sizes -> the
                                 type scale, exact-match radii, easings
  palette  near-zero             bg-white -> bg-card, Tailwind palette ->
                                 semantic tokens, mapped hex literals
  hair     VISIBLE               border-black/N and the green-cast hex
                                 borders -> the hair family

Usage:  migrate-to-tokens.py <phase> [--apply] [--dir src/features/x]
Without --apply it reports and writes nothing.
"""
import json, os, re, sys
from collections import Counter

ROOT = "src"
MOCK = re.compile(r"(mock-|demo-scenarios|personas)")

# ── phase: vars ────────────────────────────────────────────────────────
ALIAS = {
    "ink": "ink", "ink-2": "ink-2", "ink-3": "ink-3", "ink-4": "ink-4",
    "ink-muted": "ink-3",
    "brand": "brand", "brand-deep": "brand-deep", "brand-soft": "tint",
    "tint": "tint", "tint-strong": "tint-strong", "tint-line": "tint-line",
    "line": "hair", "line-strong": "hair-2", "hair": "hair", "hair-2": "hair-2",
    "ok": "ok", "ok-bg": "ok-bg",
    "warn": "warn", "warning": "warn", "warning-soft": "warn-bg",
    "danger": "danger",
}
SIZE = {"7.5":"micro","8":"micro","8.5":"micro","9":"micro","9.5":"micro",
        "10":"caption","10.5":"caption","11":"label","11.5":"label",
        "12":"body","12.5":"body","13":"body-lg","13.5":"body-lg","14":"body-lg",
        "14.5":"subhead","15":"subhead","15.5":"subhead","16":"subhead",
        "16.5":"title","17":"title","18":"title",
        "19":"display","20":"display","21":"display","22":"display",
        "23":"display-lg","24":"display-lg","26":"display-lg",
        "28":"hero","30":"hero","32":"hero","34":"hero-lg"}
RADIUS = {"10":"chip","14":"control","18":"panel","24":"card"}

# ── phase: palette ────────────────────────────────────────────────────
# Shade decides role: 50/100 pale fill, 100-300 border line, 600-950 text.
# 300/400 text sits on dark video overlays and gets the on-dark tokens.
PALETTE = {}
for fam, tok in (("emerald","ok"), ("amber","warn"), ("rose","danger"),
                 ("red","danger"), ("orange","brand"), ("blue","accent-blue"),
                 ("sky","accent-blue"), ("lime","lime")):
    bg   = f"{tok}-bg"   if tok in ("ok","warn","danger") else ("tint" if tok=="brand" else tok)
    line = f"{tok}-line" if tok in ("ok","warn") else ("tint-line" if tok=="brand" else (f"{tok}" if tok!="danger" else "danger"))
    base = "brand-deep" if tok == "brand" else tok
    for sh in ("50","100"):
        PALETTE[f"bg-{fam}-{sh}"] = f"bg-{bg}"
    for sh in ("100","200","300"):
        PALETTE[f"border-{fam}-{sh}"] = f"border-{line}"
    for sh in ("600","700","800","900","950"):
        PALETTE[f"text-{fam}-{sh}"] = f"text-{base}"
    for sh in ("500","600"):
        PALETTE[f"bg-{fam}-{sh}"] = f"bg-{base}"
    PALETTE[f"ring-{fam}-400"] = f"ring-{base}"
# on-dark: light shades used as text over dark video canvas
for fam, tok in (("emerald","ok-on-dark"), ("amber","warn-on-dark"), ("sky","info-on-dark")):
    for sh in ("300","400"):
        PALETTE[f"text-{fam}-{sh}"] = f"text-{tok}"
# neutrals
PALETTE.update({
    "border-slate-100":"border-hair", "border-slate-200":"border-hair-2",
    "border-slate-300":"border-hair-3", "border-slate-400":"border-hair-3",
    "divide-slate-100":"divide-hair",
    "text-slate-800":"text-ink-2", "text-slate-700":"text-ink-2",
    "text-slate-600":"text-ink-3", "text-slate-500":"text-ink-3",
    "text-slate-400":"text-ink-4",
    "placeholder:text-slate-400":"placeholder:text-ink-4",
    "bg-slate-50":"bg-subtle", "bg-slate-100":"bg-subtle",
    "bg-slate-900":"bg-ink", "border-slate-900":"border-ink",
    "text-gray-400":"text-ink-4", "text-gray-500":"text-ink-3",
    "text-gray-600":"text-ink-3", "placeholder:text-gray-400":"placeholder:text-ink-4",
    "bg-gray-50":"bg-subtle",
})
HEX = {k: v for k, v in json.load(open("scripts/codemod/palette-map.json"))["map"].items()}
HEX_PREFIX = {"bg":"bg","text":"text","border":"border","ring":"ring"}

# ── phase: hair ───────────────────────────────────────────────────────
# Alpha -> nearest hairline token. --hair is .08, --hair-2 .14, --hair-3 .22.
BLACK_BORDER = {"3":"hair","4":"hair","5":"hair","6":"hair","8":"hair","09":"hair",
                "0.03":"hair","0.04":"hair","0.05":"hair","0.06":"hair",
                "0.08":"hair","0.09":"hair",
                "10":"hair-2","12":"hair-2","15":"hair-2","0.12":"hair-2","0.15":"hair-2",
                "20":"hair-3","25":"hair-3","30":"hair-3","0.2":"hair-3","0.22":"hair-3"}
GREEN_BORDER_HEX = {"#e3e8e5":"hair-2","#e9ece9":"hair-2","#e5e8e4":"hair-2",
                    "#dfe5e1":"hair-2","#cbd6d0":"hair-3","#b8ccc2":"hair-3",
                    "#ccd7d1":"hair-3","#d8e0db":"hair-3"}


def apply_vars(s, hits):
    def var_sub(m):
        pre, name, alpha = m.group(1), m.group(2), m.group(3) or ""
        if name not in ALIAS: return m.group(0)
        hits[f"{pre}-[var(--{name})]"] += 1
        return f"{pre}-{ALIAS[name]}{alpha}"
    s = re.sub(r"\b(bg|text|border|ring|from|to|via|divide|placeholder:text|caret|accent|fill|stroke|outline)-\[var\(--([a-z0-9-]+)\)\](/\[?[0-9.]+\]?)?", var_sub, s)
    s = re.sub(r"shadow-\[var\(--shadow-sm\)\]", lambda m: (hits.__setitem__("shadow-[var(--shadow-sm)]", hits["shadow-[var(--shadow-sm)]"]+1), "shadow-hair")[1], s)

    def size_sub(m):
        v = m.group(1)
        if v not in SIZE: return m.group(0)
        hits[f"text-[{v}px]"] += 1
        return f"text-{SIZE[v]}"
    s = re.sub(r"text-\[([0-9.]+)px\]", size_sub, s)

    def rad_sub(m):
        v = m.group(1)
        if v not in RADIUS: return m.group(0)
        hits[f"rounded-[{v}px]"] += 1
        return f"rounded-{RADIUS[v]}"
    s = re.sub(r"rounded-\[([0-9.]+)px\]", rad_sub, s)

    for lit, tok in (("ease-[cubic-bezier(.2,.8,.2,1)]","ease-entrance"),
                     ("ease-[cubic-bezier(0.2,0.8,0.2,1)]","ease-entrance"),
                     ("ease-[cubic-bezier(.4,0,1,1)]","ease-exit")):
        if lit in s:
            hits[lit] += s.count(lit); s = s.replace(lit, tok)
    return s


def apply_palette(s, hits, fname):
    n = len(re.findall(r"\bbg-white(?!/)", s))
    if n: hits["bg-white"] += n; s = re.sub(r"\bbg-white(?!/)", "bg-card", s)
    # Match bare and variant-prefixed forms (hover:, focus:, group-hover:, …)
    # while still refusing to match inside a longer class name.
    for cls in sorted(PALETTE, key=len, reverse=True):
        pat = rf"(?<![-\w])((?:[a-z-]+:)*){re.escape(cls)}(?![-\w])"
        def rep(m, _c=cls):
            hits[_c] += 1
            return m.group(1) + PALETTE[_c]
        s, n = re.subn(pat, rep, s)
    if not MOCK.search(fname):
        for hx, tok in HEX.items():
            if hx in GREEN_BORDER_HEX: continue           # phase: hair owns these
            for pre in HEX_PREFIX:
                lit = f"{pre}-[{hx}]"
                if lit in s:
                    hits[lit] += s.count(lit); s = s.replace(lit, f"{pre}-{tok}")
    return s


def apply_hair(s, hits):
    def blk(m):
        alpha = m.group(2).strip("[]")
        if alpha not in BLACK_BORDER: return m.group(0)
        hits[f"border-black/{alpha}"] += 1
        return f"{m.group(1)}border-{BLACK_BORDER[alpha]}"
    s = re.sub(r"((?:hover:|focus:|group-hover:)?)border-black/(\[?[0-9.]+\]?)", blk, s)
    for hx, tok in GREEN_BORDER_HEX.items():
        lit = f"border-[{hx}]"
        if lit in s:
            hits[lit] += s.count(lit); s = s.replace(lit, f"border-{tok}")
    return s


# ── phase: shadow ─────────────────────────────────────────────────────
BRAND_RE = re.compile(r"(253[,_]\s?72[,_]\s?22|235[,_]\s?94[,_]\s?40)")

def apply_shadow(s, hits):
    def sub(m):
        v = m.group(1)
        # A spread ring (0 0 0 Npx) is a focus affordance, not elevation.
        # A glow in some other hue is deliberate colour, not a neutral step.
        if re.match(r"^0_0_0_", v) or re.search(r"rgba?\((59[,_]|147[,_]|34[,_])", v):
            hits[f"LEFT ALONE  {v[:48]}"] += 1
            return m.group(0)
        if BRAND_RE.search(v):
            # tight and small = a control lift; wide = an ambient halo
            blur = max((int(x) for x in re.findall(r"(\d+)px", v)), default=0)
            tok = "shadow-brand-lift" if blur <= 14 else "shadow-brand-soft"
        elif v.lstrip().startswith("-"):
            tok = "shadow-panel-left"
        elif re.search(r"rgba\(0,0,0,0?\.(3[2-9]|[4-9]\d?)\)", v):
            tok = "shadow-on-dark"
        else:
            blur = max((int(x) for x in re.findall(r"(\d+)px", v)), default=0)
            tok = ("shadow-hair" if blur <= 3 else
                   "shadow-soft" if blur <= 30 else
                   "shadow-float" if blur <= 70 else "shadow-modal")
        hits[f"{tok}  <- {v[:52]}"] += 1
        return tok
    return re.sub(r"shadow-\[([^\]]+)\]", sub, s)

PHASES = {"vars": apply_vars, "palette": apply_palette, "hair": apply_hair,
          "shadow": apply_shadow}

def main():
    phase = sys.argv[1]
    apply_ = "--apply" in sys.argv
    root = ROOT
    if "--dir" in sys.argv: root = sys.argv[sys.argv.index("--dir") + 1]
    fn_ = PHASES[phase]
    hits, touched = Counter(), []
    for dp, _, fs in os.walk(root):
        for f in fs:
            if not f.endswith(".tsx"): continue
            p = os.path.join(dp, f)
            src = open(p, encoding="utf-8").read()
            out = fn_(src, hits, f) if phase == "palette" else fn_(src, hits)
            if out != src:
                touched.append(p)
                if apply_: open(p, "w", encoding="utf-8").write(out)
    print(f"phase '{phase}' — {sum(hits.values())} replacements in {len(touched)} files"
          f"{'' if apply_ else '  (DRY RUN — nothing written)'}")
    for k, c in hits.most_common(24):
        print(f"  {c:>4}  {k}")
    if len(hits) > 24: print(f"  … and {len(hits)-24} more patterns")

main()
