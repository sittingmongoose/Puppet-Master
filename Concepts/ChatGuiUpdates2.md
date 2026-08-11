# Chat GUI Updates 2

Eight PMConcept8 workstreams live in this file (now rebuilt through the true
parts → assemble → `build_pm7.py` lineage into `Concepts/PMConcept7.html` —
see **Lineage rebuild into PMConcept7** below):

1. **Top page selector** — smooth sliding tab indicator + directional page
   transitions (motion.dev smooth-tabs), documented in the sections below.
2. **Chat selector popouts** — corner-origin spring open/close, nearest-trigger
   sprout, search-resize bounce, modes-search removal — see
   “Chat selector popouts — corner-origin spring (PM8)” near the end.
3. **Effort / thoroughness option-count bounce** — side flyout spring-resizes
   in place when level count changes (model effort + Plan/Deep Plan) — see
   “Effort / thoroughness option-count bounce (PM8)” near the end.
4. **Context ring click sprout** — header context ring uses the same open/close
   motion as model popouts; **click to open** (hover only glows accent-blue);
   ring ~25% larger; token label removed — see “Context ring click sprout (PM8)”
   at the end.
5. **Header chrome menus** — worktree + context lens click-sprout; worktree
   hover matches context lens (CSS-only color; glass hover after late rules);
   more-options kebab; **theme-matched popout chrome** (same tokens / glass
   plate as model selectors) — see “Header chrome menus…” at the end.
6. **Chats rail cleanup** — provenance banner removed; HISTORY → Chats;
   resize-driven collapse (no button); status-color border glow; third-row
   indent fix; **Chats label 11.5px (matched collapsed/expanded)**; **+ btn
   18px centered**; **clear selected-thread left bar + tint** — see
   “Chats rail cleanup (PM8)” at the end.
7. **Magnet + spotlight hover** — replaces the pm6 one-shot jiggle wobble on
   the same box-set; pointer-tracking accent ring + interior wash + outward
   bloom + spring magnet lean; themed `--pm8-*` knobs for all 8 themes;
   Slint-portable (no tilt/click/stars) — see **Magnet + spotlight hover
   (PM8)** below.
8. **Title-bar notifications** — rightward stack + badge replaces bottom-right
   toasts and the status-bar bell; ephemeral stage fade; durable join;
   sprout inbox; clear-all collapse-up — see **Title-bar notifications**
   and **Rev 8** below.

---

## Title-bar + usage layout polish (2026-07-23, rev 9.3)

**Status:** parts → assemble g3 → `build_pm7.py --allow-new-base`.

**Fixes:**
1. Narrow title bar — `.app-name` nowrap; page tabs `flex: 0 0 auto` (scroll
   instead of squash); strip `flex: 0 1 auto` so it does not grow.
2. Wide screens — notify slot stays beside tabs (no longer shoved toward
   search); slot min/max width tightened.
3. Usage labeled CTAs — `.pm6-usage-btn-label` overrides 32×32 icon chrome
   (alerts, accounts, anomaly, ledger JSON, drill).
4. Friendly page-tab `letter-spacing: 0.04em`.
5. Theme + project selectors — chat more-options sprout menus (`PM6_SPROUT` /
   `PM_THEME`); no native `<select>` OS chrome. Slint: `PopupWindow`.

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
# adopt Concepts/PMConcept6.html → pm7-tools/base/PM7-base.html + BASE_SHA
cd ../pm7-tools && python3 build_pm7.py --allow-new-base \
  --outdir /tmp/pm7-titlebar-fix-build --out ../PMConcept7.html
```

**Shipped:** sha256 `bc40a7a7140544518fa6e180bca16a597819033a81d3b4754c61bc27319fa7b2`
(2,691,987 bytes). Base sha `e73f045d3d59a521bb28e94720b02ceb2abbf7657599804bafa1e36faebcb4cc`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## Friendly title-bar follow-up (2026-07-23, rev 9.4)

**Status:** parts → assemble g3 → adopt base → `build_pm7.py`.

**Fixes:**
1. Friendly title-bar `padding: 0 16px` so “Puppet Master” clears the curve.
2. Friendly page tabs: `gap: 2px`, padding `6px 8px` (was 14px inline — looked sparse).
3. Friendly page-tab `letter-spacing: 0.08em` (was 0.04em — too subtle).
4. Notify slot restored to 248px (matches `.rs-stack`); rev 9.3’s 80px max clipped titles.
5. `margin-left: auto` on `.notify-slot` (removed from `.search-bar`) so notify | search | theme cluster right.

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
# adopt Concepts/PMConcept6.html → pm7-tools/base/PM7-base.html + BASE_SHA
cd ../pm7-tools && python3 build_pm7.py \
  --outdir /tmp/pm7-titlebar-polish2 --out ../PMConcept7.html
```

**Shipped:** sha256 `7e5146a7263c0213473c5e90fae7d8f9ab4932bf9d43c580c3a5cd22f9209dc5`
(2,692,214 bytes). Base sha `87b35248831d3113ab4d3e1340aba922d78d349d5cbef29015dcd6f1a8ac4d27`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## Notify position nudge (2026-07-23, rev 9.5)

**Status:** parts → assemble g3 → adopt base → `build_pm7.py`.

**Bug:** rev 9.4 `margin-left: auto` on `.notify-slot` parked the stack in the
far-right search/theme cluster — too far right.

**Fix:** notify stays after page tabs with `margin-left: 24px`; restore
`margin-left: auto` on `.search-bar`. Keep 248px slot width (no clip).

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
cd ../pm7-tools && python3 build_pm7.py \
  --outdir /tmp/pm7-notify-nudge --out ../PMConcept7.html
```

**Shipped:** sha256 `cff1afb03dc5a7673a716c703786825b1364d25f56ac596767fd436266f2b2ba`
(2,692,314 bytes). Base sha `928d94a428adc4258b0a9b1255f858dd21b1e01a45da6d4d7eab83e4fb10f12a`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## Title-bar search compress (2026-07-24, rev 9.6)

**Status:** parts → assemble g3 → adopt base → `build_pm7.py`.

**Behavior (density priority — protect page tabs):**
1. Compress inline search `--tb-search-w` 170→112px
2. Collapse to search-icon SVG; click sprouts a search popdown (same
   `.open` / `.is-closing` motion as empty notify `.rs-panel`)
3. Shorten notify `--rs-stack-w` 248→120px
4. Only then allow page-tab strip scroll (`data-tb-tabs="scroll"`)

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
cd ../pm7-tools && python3 build_pm7.py \
  --outdir /tmp/pm7-tb-search-compress --out ../PMConcept7.html
```

**Shipped:** sha256 `00f270129d5ad72794c1f94dd414bf60d3343026ae9be6f509a780cd3539a4c5`
(2,704,375 bytes). Base sha `cc7c398d1e793a5ee7db37417f362fb805523cc058d8cbde6e9f16ee99701310`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## Theme selector icon mode (2026-07-24, rev 9.8)

**Status:** parts → assemble g3 → adopt base → `build_pm7.py`.

**Bug:** labeled theme trigger (“Friendly Dark ▼”) clipped on the right when
the bar is tight, even after search/notify density.

**Fix:** density step 4 — `#themeMenuWrap[data-mode="icon"]` collapses to a
32×32 palette SVG (same paths as settings `palette` icon); same sprout menu.
Then tab scroll remains last resort.

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
cd ../pm7-tools && python3 build_pm7.py \
  --outdir /tmp/pm7-theme-icon --out ../PMConcept7.html
```

**Shipped:** sha256 `742585f0ecf260821f384ecde47784e93d8625f81cf0fdabc1b8db953aa01626`
(2,706,328 bytes). Base sha `c897f5f7a06face05fe4fff2dfe6bdd4e11b3f2ea9236f4df3752cb921bc6a40`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## Title-bar density reorder (2026-07-24, rev 9.10)

**Status:** parts → assemble g3 → adopt base → `build_pm7.py`.

**Bugs / changes:**
- Theme hang past pill: `naturalOverflow` subtracts title-bar horizontal
  padding, adds non-auto child margins (notify nudge / page-tab margins),
  and **ignores** search-wrap margins (`margin-left: auto` resolves to px).
- Density order: theme→icon → search compress → search icon → notify shorten →
  project→folder icon → tab scroll.
- Brand “Puppet Master” + project wrap stay `flex: 0 0 auto` (no left-cluster
  squeeze); project collapses to folder SVG as last reclaim before tabs.

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
cd ../pm7-tools && python3 build_pm7.py \
  --outdir /tmp/pm7-density-reorder --out ../PMConcept7.html
```

**Shipped:** sha256 `8519eaaa6f14ccb200fd133fa4d83e91f903916407e37525ad1bbc91e1517501`
(2,709,729 bytes). Base sha `1f61016d62be646a119cc564cc9ae698f329a518e511c51983197e843e996689`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## Title-bar brand left inset lock (2026-07-24, rev 9.12)

**Status:** parts → assemble g3 → adopt base → `build_pm7.py`.

**Bug:** under extreme compression, “Puppet Master” crept toward the left edge
of the frosted pill.

**Fix:**
- `.title-bar` `min-width: 0; width/max-width: 100%` (friendly
  `max-width: calc(100% - 24px)` keeps 12px side margins)
- `.app-name` `margin-inline-start: 0` (inset only from bar padding)
- `data-tb-tabs="scroll"` drops page-tabs negative inline margins (glow
  clipped by scrollport) so gutters cannot pull layout left

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
cd ../pm7-tools && python3 build_pm7.py \
  --outdir /tmp/pm7-brand-lock --out ../PMConcept7.html
```

**Shipped:** sha256 `aab9ead4cda82e77e472d2789548075c56cc38f6a55488e3797a487ba9f78bc1`
(2,710,583 bytes). Base sha `e3ab80f046bd7757c5337b43d804f4aae83a0ad3784cffc676caadd9e2d19077`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## Title-bar brand padding media-query fix (2026-07-24, rev 9.13)

**Status:** parts → assemble g3 → adopt base → `build_pm7.py`.

**Bug:** under tight aspect (`max-aspect-ratio: 4/3`) or short height
(`max-height: 800px`), a “minimum desktop” media query set
`.title-bar { padding: 0 var(--sm) !important }` (`--sm` = 4px), crushing
friendly’s 16px inset so “Puppet Master” hugged the pill edge. Rev 9.12
width containment missed this because shell-width tests never matched the
media query.

**Fix:** remove the horizontal padding override from that media query in
`09-css-bento-themes.part.html` (gap tighten remains).

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
cd ../pm7-tools && python3 build_pm7.py \
  --outdir /tmp/pm7-brand-pad-fix --out ../PMConcept7.html
```

**Shipped:** sha256 `46da3064be1cd5af9656c0f78709dd0222d838658a6aefaee21eb2dc3979d52f`
(2,710,730 bytes). Base sha `0475586f67c8a2fa7736578cb4afbeb57544b5625058ac779bd854ab6a84c63e`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## Title-bar brand↔project gap lock (2026-07-24, rev 9.14)

**Status:** parts → assemble g3 → adopt base → `build_pm7.py`.

**Bug:** same minimum-desktop media query still set `.title-bar { gap: var(--sm) }`
(`4px`), pulling the project pill/icon toward “Puppet Master” (comfortable gap
is `var(--lg)` = 12px).

**Fix:** remove the gap override from that media query as well.

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
cd ../pm7-tools && python3 build_pm7.py \
  --outdir /tmp/pm7-brand-gap-lock --out ../PMConcept7.html
```

**Shipped:** sha256 `9980c380a627c1862b2f9ca5b901cfb26bdf037a3d9c68018d6758b61871ef74`
(2,710,657 bytes). Base sha `19f288e5f01dcc852e2c9ae04e46e8eba3935f51910956f8aee613f9821644c8`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## Title-bar page-tab ▼ overflow (2026-07-24, rev 9.15)

**Status:** parts → assemble g3 → adopt base → `build_pm7.py`.

**Change:** density step 6 no longer scrolls/hides page tabs. Tabs that do not
fit move into a theme-style sprout menu behind an SVG down-arrow chip
(`#pageTabsMoreBtn` / `#pageTabsMoreMenu`). As the bar shrinks further, more
tabs join the menu (rightmost first; active tab stays visible when possible).
Menu items show page icon + label and call `PM_PAGES.go`.

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
cd ../pm7-tools && python3 build_pm7.py \
  --outdir /tmp/pm7-pages-overflow --out ../PMConcept7.html
```

**Parts:** `11-html-shell-open`, `05-css-shell`, `10x-pm6-css-global`,
`09-css-bento-themes` (no forced tab scroll), `29x-pm6-js-panels`
(`fitPageTabsOverflow` / `data-tb-tabs="overflow"`).

**Shipped:** sha256 `645a74e964d9254d4d500d31ffd1569b5beffdd50130d9d1a94aa7a1054d9100`
(2,715,984 bytes). Base sha `93dcebe8593ca27d81d8b13c2fb2f845e09140aeb077e968e896d130ace56cce`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## Page ▼ overflow fixes (2026-07-24, rev 9.16)

**Status:** parts → assemble g3 → adopt base → `build_pm7.py`.

**Bugs:**
1. Page-tab overflow started while estimated density savings still left residual
   overflow that later chrome collapses would have cleared.
2. Pages sprout painted under the page/editor — shared tabstrip recipe set
   `.page-tabs { overflow-x:auto; overflow-y:hidden }`, and setting only
   `overflow-x: visible` still computed to clip.

**Fix:**
- `applyDensity` re-measures `naturalOverflow()` after each step; page ▼ is
  last resort only.
- `.title-bar .page-tabs { overflow: visible }` (both axes); title-bar
  `z-index: 50` + pages-more `z-index: 60` / menu `230`.

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
cd ../pm7-tools && python3 build_pm7.py \
  --outdir /tmp/pm7-pages-overflow-fix --out ../PMConcept7.html
```

**Shipped:** sha256 `f150fbeeaac45438442b8c7e5ebdb236b2724941dd4b2e352e618b4beff58e9a`
(2,716,671 bytes). Base sha `25b78f453fcbc2d645442361bdfbe240fb41d4f35c6d9aa248e7e656760e8592`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## Restore title-bar density (2026-07-24, rev 9.17)

**Status:** parts → assemble g3 → adopt base → `build_pm7.py`.

**Bug:** rev 9.16 re-measured after every density step and returned early when
`naturalOverflow() <= 0`, which under-counted (shrunken page-tabs
`offsetWidth`) and stalled the ladder after theme→icon.

**Fix:** restore estimate-based steps 1–5; gate page ▼ only after step 5 if
still overflowing; measure kids with `Math.max(offsetWidth, scrollWidth)` and
sum visible page tabs; `min-width: max-content` on title-bar page-tabs. Keep
9.16 menu stacking (`overflow: visible` + z-index).

**Parts:** `29x-pm6-js-panels` (`naturalOverflow` / `applyDensity`),
`05-css-shell` + `10x-pm6-css-global` (page-tabs `min-width: max-content`,
menu stacking preserved).

**Verified:** real viewport 900px → theme/search/project icon, notify 120,
Settings in ▼; menu `elementsFromPoint` hits menu item above editor. Wide
1400 → all full; mid ladder theme→search→notify→project before page ▼.

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
cd ../pm7-tools && python3 build_pm7.py \
  --outdir /tmp/pm7-density-917 --out ../PMConcept7.html
```

**Shipped:** sha256 `8c8f3be4bab10bcc5c8a3c73e6deadd5ba71eb2f715e089b430010df7be8a493`
(2,717,256 bytes). Base sha `2d0baab4788623d835dd752a878a07ca952f9e43fad883adb5b3dd4efc60e252`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## Spot quieter + smaller (2026-07-24, rev 9.18)

**Status:** parts → assemble g3 → adopt base → `build_pm7.py --allow-new-base`.

**Fix:** activation disc only — border/bloom unchanged.

**End result (tip):**
| Knob | Value | Role |
|------|-------|------|
| `--pm8-spot` | `68px` (was 80px, −15%) | activation disc radius |
| `--pm8-spot-glow` | root/friendly/glass `.04`, retro `.05`, basic `.03` | disc alpha (barely visible) |
| `--pm8-ring-spot` | `115px` (unchanged) | border-ring radial size |
| `--pm8-glow` | ~75% of original (unchanged) | border ring punch |
| `--pm8-wash` | ~75% of original (unchanged) | outward bloom punch |

JS `F.spotGlow` fallback `.04`.

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
# adopt Concepts/PMConcept6.html → pm7-tools/base/PM7-base.html + BASE_SHA
cd ../pm7-tools && python3 build_pm7.py --allow-new-base \
  --outdir /tmp/pm7-spot-quieter --out ../PMConcept7.html
```

**Shipped:** sha256 `e97254db915e734e2711fb59c40fbecfbd2f0acf99b7baebd297265e73b5ebda`
(2,717,248 bytes). Base sha `2d6fcb113f2a3d9cd14ff2ccd2cddbcea7f5d82e03e61210bd0ff35b9bc8389d`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## Spot size −5% (2026-07-24, rev 9.19)

**Status:** parts → assemble g3 → adopt base → `build_pm7.py --allow-new-base`.

**Fix:** `--pm8-spot: 65px` (68px −5%). Spot-glow, border glow, and bloom
unchanged.

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
# adopt Concepts/PMConcept6.html → pm7-tools/base/PM7-base.html + BASE_SHA
cd ../pm7-tools && python3 build_pm7.py --allow-new-base \
  --outdir /tmp/pm7-spot-65 --out ../PMConcept7.html
```

**Shipped:** sha256 `49a369648a97fc0e967e53acdeac398f3bcb7373a8c9c874c21d8f980f0aac99`
(2,717,247 bytes). Base sha `28d2fdc1693fe01395a483888c20e63a808422d8a7ccb9d2cca07605179d9afb`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## Spot size −10% (2026-07-24, rev 9.20)

**Status:** parts → assemble g3 → adopt base → `build_pm7.py --allow-new-base`.

**Fix:** `--pm8-spot: 59px` (65px −10%). Spot-glow, border glow, and bloom
unchanged.

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
# adopt Concepts/PMConcept6.html → pm7-tools/base/PM7-base.html + BASE_SHA
cd ../pm7-tools && python3 build_pm7.py --allow-new-base \
  --outdir /tmp/pm7-spot-59 --out ../PMConcept7.html
```

**Shipped:** sha256 `681ab6e229176e3432da846e9d60b9f2ddddf6e3b54cbcd26ebb3253b1f1721d`
(2,717,248 bytes). Base sha `c29da48c6d3500751bc89a02381fd8c0d6f95b05632048e974b7553e1ba254bc`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## Spot size −10% again (2026-07-24, rev 9.21)

**Status:** parts → assemble g3 → adopt base → `build_pm7.py --allow-new-base`.

**Fix:** `--pm8-spot: 53px` (59px −10%). Spot-glow, border glow, and bloom
unchanged.

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
# adopt Concepts/PMConcept6.html → pm7-tools/base/PM7-base.html + BASE_SHA
cd ../pm7-tools && python3 build_pm7.py --allow-new-base \
  --outdir /tmp/pm7-spot-53 --out ../PMConcept7.html
```

**Shipped:** sha256 `6a240ecd98e4dc0843c6dcfabe6d847877415187372e73c43caaf944f3287699`
(2,717,248 bytes). Base sha `abb271e9d373d9c98a3f3bb83ac8897983af40b07e2e3dd1ce163b101df4e196`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## Spot glow decouple (2026-07-24, rev 9.11)

**Status:** parts → assemble g3 → adopt base → `build_pm7.py --allow-new-base`.

**Fix:** activation disc intensity/size no longer rides border glow knobs.
- `--pm8-spot: 80px` (115px −30%); new `--pm8-spot-glow` (~.12) drives `::before`
- `--pm8-ring-spot: 115px` + `--pm8-glow` keep border ring at rev 9.9 punch
- `--pm8-wash` stays on `#pm8-bloom` only
- JS `F.spotGlow = num('--pm8-spot-glow', .12)`

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
# adopt Concepts/PMConcept6.html → pm7-tools/base/PM7-base.html + BASE_SHA
cd ../pm7-tools && python3 build_pm7.py --allow-new-base \
  --outdir /tmp/pm7-spot-decouple --out ../PMConcept7.html
```

**Shipped:** sha256 `8faa60fcf1a7c32dab6da4f8a0034111e74b424005220de36dcbf02f63b2b5f2`
(2,710,057 bytes). Base sha `42f33f44fbc7e9e188462f0ca4596fd5edd62ba2382712977535577200825f1b`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## Border glow restore (2026-07-24, rev 9.9)

**Status:** parts → assemble g3 → adopt base → `build_pm7.py --allow-new-base`.

**Fix:** keep the smaller `--pm8-spot: 115px` cursor radial; punch border ring,
interior wash, and outward bloom back up to ~75% of pre-soften originals
(not full restore; not the 9.7 ~15% cut).

| Theme | `--pm8-glow` | `--pm8-wash` |
|-------|--------------|--------------|
| `:root` / friendly | `.60` | `.38` |
| retro | `.71` | `.34` |
| basic | `.45` | `.30` |
| glass | `.64` | `.41` |

JS `num()` fallbacks aligned (`.60` / `.38`).

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
# adopt Concepts/PMConcept6.html → pm7-tools/base/PM7-base.html + BASE_SHA
cd ../pm7-tools && python3 build_pm7.py --allow-new-base \
  --outdir /tmp/pm7-border-glow-restore --out ../PMConcept7.html
```

**Shipped:** sha256 `1954d9ea0f7797a07c00adcf38acf76ffcfb14454f4d4095ce80b029d891e424`
(2,706,308 bytes). Base sha `112956bd2bf3488ea22e85e90c4c225270331476162e445f60a84db6ac25c8f9`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## Spotlight soften (2026-07-24, rev 9.7)

**Status:** parts → assemble g3 → adopt base → `build_pm7.py --allow-new-base`.

**Fix:** PM8 magnet/spotlight hover circle is ~50% smaller and barely visible.
- `--pm8-spot: 115px` (was hard-coded `230px`) on ring `::after` + wash `::before`
- `--pm8-glow` / `--pm8-wash` scaled to ~15% of prior theme values (peak ring
  ≈ `i * glow * .95` from ~0.76 → ~0.11); bloom follows wash
- JS `num()` fallbacks aligned (`.12` / `.08`)

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
# adopt Concepts/PMConcept6.html → pm7-tools/base/PM7-base.html + BASE_SHA
cd ../pm7-tools && python3 build_pm7.py --allow-new-base \
  --outdir /tmp/pm7-spotlight-soften --out ../PMConcept7.html
```

**Shipped:** sha256 `05061a6fc92418ebbef21332fb373c2d3ac32ed1f6d144495394f327d6a93974`
(2,704,475 bytes). Base sha `b099ea10edaded8fa692c8c3ca9ccb45a477201f30574e51136f98acd0cdee7c`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## Lineage rebuild into PMConcept7 (2026-07-22, rev 4)

**Status:** true pipeline rebuild complete. `Concepts/PMConcept7.html` is the
Open Design preview lineage. Latest ship is **rev 9.21** (spot size −10%
again); rev 9.20 was spot size −10%; rev 9.19 was spot size −5%; rev 9.18 was
spot quieter + smaller; rev 9.17 was restore title-bar density ladder; rev
9.16 was page ▼ overflow density-last + menu stacking; rev 9.15 was title-bar
page-tab ▼ overflow menu; rev 9.14 was title-bar brand↔project gap lock; rev
9.13 was brand padding media-query fix; rev 9.12 was brand left inset lock;
rev 9.11 was spot glow decouple; rev 9.10 was title-bar density reorder; rev
9.9 was border glow restore; rev 9.8 was theme selector icon mode; rev 9.7 was
spotlight soften; rev 9.6 was title-bar search compress; rev 9.5 was notify
position nudge; rev 9.4 was friendly title-bar follow-up; rev 9.3 was
title-bar + usage layout polish; rev 9.2 was orch content gap + notify stack
polish; rev 9.1 was orch tab strip theme polish; rev 9 was header/tab polish
+ chrome trim; rev 8.1 was friendly notify stacking + opaque cards; rev 8 was
title-bar notifications; rev 7 was magnet + spotlight hover; rev 6 was
friendly pill field padding; rev 5 was the worktree click fix; rev 4 was the
six-workstream merge.

### End result (rev 9 → 9.21) — for later Plans updates

**Authority:** concept / Open Design source-lineage only. Do **not** treat this
section as live Plans canon. Use it when a later ledger compile or GUI owner
pass updates `Plans/FinalGUISpec.md`, `Plans/UI_Command_Catalog.md`,
`Plans/assistant-chat-design.md`, `Plans/Orchestrator_Page.md`,
`Plans/usage-feature.md`, `Plans/Planning_Wizard` / PRD consumer docs, or
alert/status chrome PlanUnits (esp. F3-460/F3-461 title-bar notify, theme
selector surface, page-tab chrome). This compile creates no WorkNodes,
governance seal, or Plans prose edits by itself.

**Shipped artifact (current tip):** `Concepts/PMConcept7.html` sha256
`6a240ecd98e4dc0843c6dcfabe6d847877415187372e73c43caaf944f3287699`
(2,717,248 bytes). Base pin `abb271e9d373d9c98a3f3bb83ac8897983af40b07e2e3dd1ce163b101df4e196`.
Rebuild: parts → `assemble.py --gate g3` → adopt
`Concepts/PMConcept6.html` → `pm7-tools/base/PM7-base.html` + `BASE_SHA` →
`build_pm7.py` (use `--allow-new-base` when the pin changes). Never hand-edit
`PMConcept7.html`.

#### Product / UX end state (what Plans should eventually say)

| Surface | End-state behavior |
|---------|--------------------|
| **Page headers** (Orchestrator, Usage, Planning Wizard workspace) | Match Projects top layout on **non-retro** themes: title cluster left, actions/meta right; open flex, no dense full-bleed IDE chrome bar. **Friendly:** rounded inset header boxes (`--radius-lg`, cozy card surface). **Glass / basic:** open Projects-like. **Retro:** keep existing chrome bars. |
| **Planning Wizard runhead** | One line: project title + state/PRD chip + Replay. Long PlanningRun / revision / seed meta line is **removed** from the header (demo fixture text only; not a required status field). |
| **Usage page head** | Subtitle: “AI Cost/usage for Tastebook — quotas, cost, cache savings and safety guards. Refreshes every 5 minutes; history kept for 90 days.” Refresh + Export are **icon-only** (`restart` / `clipboard`) with `title` + `aria-label`; head stays one line. |
| **Usage labeled CTAs** | Icon chrome (`.pm6-usage-btn`, 32×32) stays for Refresh/Export only. All labeled actions (alert Route / Acknowledge / Snooze, account Make active, anomaly keep/allow, ledger JSON, drill-through) use **`.pm6-usage-btn-label`**: auto width/height, padding, nowrap — never reuse the icon box (same class of bug as chat more-menu 24×24 squash). |
| **Editor file tabs (friendly)** | Top-rounded folder tabs (`border-radius: radius-md radius-md 0 0`), cozy mint active fill; **not** full pills on a bordered strip. Glass already had top-round; unchanged intent. |
| **Orchestrator tab strip** | **Friendly:** rounded cozy pill bar under the header pill with visible gap; active tabs are mint pills (no underline). **Glass:** rounded frosted bar like Projects sort-by toolbar (`pm6-glass-step-2` + hairline); active = step-3. Bottom margin so Node Graph / other panes do **not** sit flush under the strip. **Retro / basic:** legacy underline chrome strip. |
| **Status bar** | **Removed:** Agent mode chip, platform picker (Claude Code ▾), model picker (Fable 5 ▾), context mini-meter (42k/128k). **Kept:** workspace status menu, Orchestrator chip, Indexing, branch / sync / ports. Chat composer / title-bar remain owners for mode / platform / model / context. |
| **Activity bar** | **Removed shortcuts:** Settings, Usage, Alerts, Orch, Wizard, Graph (and empty Work group). **Kept:** Chat, Home, Files, Search, Source, Actions, Docker, Tests, Agents, Artifacts, More. Those pages remain reachable via **title-bar page tabs**. Alerts affordance is **title-bar notify stack only** (no rail Alerts icon / `#pm6NotifyDot`). |
| **Title-bar layout (all themes)** | Order: app name → project menu → page tabs (+ ▼ more when needed) → **notify stack** → search → theme menu. Brand is `white-space: nowrap; flex: 0 0 auto` (never wraps “Puppet” / “Master”); left inset comes only from title-bar padding (friendly `16px`, shell `var(--md)`) and is invariant under density **and** the minimum-desktop media query (`max-aspect-ratio: 4/3` / `max-height: 800px` must not override horizontal padding **or** title-bar `gap`). Title-bar gap stays `var(--lg)` (12px) so brand↔project spacing does not tighten when compressed. Title-bar is width-contained (`min-width: 0; max-width: 100%`; friendly `calc(100% - 24px)`). Project may collapse to a folder icon under density, but the gap before it stays fixed. Page-tab items are `flex: 0 0 auto` (do not shrink/overlap labels). Tab strip stays `flex: 0 0 auto` until density floor; only then progressive ▼ overflow (`data-tb-tabs="overflow"`) moves cut-off tabs into a sprout menu. |
| **Title-bar density priority** | When the bar is tight, reclaim space in order: (1) collapse theme to 32×32 palette SVG; (2) compress inline search `--tb-search-w` 170→112px; (3) collapse search to icon SVG + sprout popdown; (4) shorten notify `--rs-stack-w` 248→120px; (5) collapse project to 32×32 folder SVG; (6) progressive page-tab overflow into SVG ▼ sprout (same `.pm6-tb-menu` family as theme/project; icons + labels; active tab prefers staying visible). Steps 1–5 use estimate-based need accounting; step 6 runs only if real overflow remains after project→icon. Overflow math uses `Math.max(offsetWidth, scrollWidth)` (and summed visible page tabs) against content-box width plus child margins except search `margin-left: auto`. Title-bar page-tabs use `overflow: visible` + `min-width: max-content` so the sprout is not clipped and density is not stalled. Controller: `ResizeObserver` on `.title-bar` (`wireTitleBarDensity` / `PM_TB_SEARCH`). |
| **Title-bar search (responsive)** | Comfortable: inline field. Icon mode: 32×32 search button; click opens `.pm6-tb-search-pop` with the **same sprout open/close** as empty notify inbox (`.rs-panel` / `.open` / `.is-closing`). Esc / outside / opening theme|project|notify closes it. Slint: `PopupWindow` from the icon trigger. |
| **Title-bar notify position + size** | Slot width driven by `--rs-stack-w` (default **248px**, floor **120px** under density pressure). Notify sits **immediately after page tabs** with a modest `margin-left: 24px` nudge. Search wrap keeps `margin-left: auto` so search + theme stay right-aligned. **Do not** put `margin-left: auto` on notify. |
| **Title-bar theme + project selectors** | **Not** native OS `<select>` / ComboBox. Both are chat more-options–style sprout menus (`.pm6-tb-menu` / `.pm6-tb-menu-item`, `PM6_SPROUT` open/close, theme-matched plate tokens / glass plate family). Theme trigger is labeled (“Friendly Dark ▼”) when space allows; under density it becomes a 32×32 palette SVG first. Project is labeled (“tastebook ▼”) when space allows; under further density it becomes a 32×32 folder SVG (before page ▼ overflow). Theme persists via `localStorage['pm.theme']` + `data-theme`; `window.PM_THEME` syncs chrome + Settings appearance. Slint: custom trigger + `PopupWindow`, not native ComboBox. |
| **Title-bar page tabs (friendly)** | Dense strip: `gap: 2px`, pill padding `6px 8px` (not sparse 14px inline). Display tracking **`letter-spacing: 0.08em`** on tab labels. Floating title bar uses **`padding: 0 16px`** so the brand clears the rounded chrome edge. Under density floor, cut-off pages live under the in-strip SVG ▼ chip (not horizontal scroll). |
| **Title-bar notify (glass)** | Collapsed stack left mask is a **mild** peek (`rgba(0,0,0,.72)` → solid by 4%), not a hard transparent left falloff. |
| **Title-bar notify (friendly inbox)** | List bottom fade starts later (`96%`); extra list / chrome bottom padding so card bottoms are not clipped. |
| **Magnet + spotlight (PM8 tip)** | Same former-jiggle box-set. **Border ring** (`::after`, `--pm8-ring-spot: 115px` + `--pm8-glow` ~75% of original) and **outward bloom** (`#pm8-bloom`, `--pm8-wash` ~75%) stay punchy. **Activation disc** under the pointer (`::before`) is independent: `--pm8-spot: 53px`, `--pm8-spot-glow` barely visible (root/friendly/glass `.04`, retro `.05`, basic `.03`). Tuning disc size/alpha must not move glow/wash. Slint: bind separate properties for disc vs ring/bloom. |

#### Plans touchpoints (lineage hints — not owner edits)

| End-state change | Likely Plans consumers / owners to reconcile later |
|------------------|-----------------------------------------------------|
| Page header layout + theme box rules | `FinalGUISpec.md` page chrome; `Orchestrator_Page.md`; Planning Wizard GUI; Usage page consumer of `usage-feature.md` |
| Usage subtitle + icon-only refresh/export | `usage-feature.md` / FinalGUI Usage surface copy + command affordances |
| Usage labeled CTA chrome (`.pm6-usage-btn-label`) | `usage-feature.md` alert / account / anomaly / ledger / drill affordances; avoid icon-button geometry for text CTAs |
| Wizard runhead without PlanningRun meta | Planning Wizard / PRD Builder GUI status presentation (keep run identity in inspector/rail if needed, not the top one-liner) |
| Status bar trim (no mode/platform/model/ctx) | Status-bar / toast contracts; chat owns requested platform/model/mode; context ring remains chat context owner (see F3-447/448/453 lineage under Rev 8) |
| Activity bar shortcut set | Activity-bar / side-panel inventory; page routing still via `PM_PAGES` / title-bar tabs |
| Orch tab strip theme skins + content gap | `Orchestrator_Page.md` view tabs / Node Graph flush pane chrome |
| Notify mask / clip polish | Title-bar notify concept under Rev 8; alert store F3-453 unchanged |
| Title-bar flex / nowrap / non-shrinking tabs | `FinalGUISpec.md` title-bar shell (F3 page-tab + chrome); Slint port: non-shrinking tab items + ▼ overflow sprout after density floor; page-tabs `overflow: visible` so PopupWindow/sprout is not clipped |
| Title-bar density: theme icon → search → notify → project icon → page ▼ | `FinalGUISpec.md` title-bar search/theme/project; F3-460 placement; command-palette / global search affordance when icon-only; page overflow reuses theme sprout plate; estimate-based steps 1–5 then real-overflow gate for ▼ |
| Notify slot `--rs-stack-w` 248→120 + after-tabs + 24px nudge | F3-460 / F3-461 placement (“between page tabs and search”); clarify **not** flush to search/theme cluster |
| Theme + project sprout menus (no OS select) | `FinalGUISpec.md` theme selector surface; `assistant-chat-design.md` ACD-442/444 more-options / header sprout family (reuse plate + motion); Settings `pm.theme` sync |
| Friendly title-bar padding / tab density / 0.08em tracking | Friendly theme chrome tokens in FinalGUISpec / design-system consumers |
| Magnet + spotlight decoupled disc vs border/bloom | `FinalGUISpec.md` F3-465 (magnet spotlight); keep ring/bloom punch; disc size+alpha are separate knobs for Slint port |

#### Parts touched (rev 9 → 9.6)

**Rev 9 → 9.2**
- `10x-pm6-css-global` — friendly editor tabs
- `08-css-components-c` — non-retro orch-header
- `10x-pm6-css-wizard` / `16-page-wizard` — runhead meta + layout
- `18-page-usage` — copy, icon buttons, header boxes
- `10x-pm6-css-orchestrator` — orch-tabs friendly/glass skins + margins
- `22-html-status-toast` / `29x-pm6-js-bottom` — status chip removal
- `11-html-shell-open` — activity-bar trim
- `10x-pm6-css-bottom` — notify list/clip/mask polish

**Rev 9.3 → 9.5 (title-bar + usage layout)**
- `05-css-shell` — app-name nowrap; notify 248px + after-tabs margin; search `ml:auto`
- `10x-pm6-css-global` — page-tabs no-grow; friendly padding / gap / tracking
- `10x-pm6-css-chat` — `.pm6-tb-menu` shares more-options sprout contract
- `09-css-bento-themes` / `03-css-glass-a` — glass/retro plate + trigger skins
- `11-html-shell-open` — project + theme sprout markup (no native `<select>`)
- `18-page-usage` — `.pm6-usage-btn-label` on all labeled CTAs
- `29x-pm6-js-panels` — `PM_THEME` + title-bar menu wiring
- `24-js-main` / `25-js-terminal-demo` / `29-js-settings-engine` — theme persistence / Settings sync

**Rev 9.6 (search compress)**
- `11-html-shell-open` — `.pm6-tb-search-wrap` + icon btn + sprout pop
- `05-css-shell` — `--tb-search-w`, icon mode, search pop (rs-panel motion), `--rs-stack-w`
- `10x-pm6-css-bottom` — `.rs-stack` / `.rs-card` honor `--rs-stack-w`
- `10x-pm6-css-global` / `03-css-glass-a` / `09-css-bento-themes` — skins for wrap/btn/pop
- `29x-pm6-js-panels` — `wireTitleBarDensity` + `PM_TB_SEARCH`

**Rev 9.15 (page-tab ▼ overflow)**
- `11-html-shell-open` — `#pageTabsMoreWrap` / `#pageTabsMoreBtn` / `#pageTabsMoreMenu`
- `05-css-shell` — `.page-tab.is-overflow`, pages-more trigger/item chrome
- `10x-pm6-css-global` / `09-css-bento-themes` — no forced tab scroll; overflow visible
- `29x-pm6-js-panels` — `fitPageTabsOverflow` + `data-tb-tabs="overflow"` (replaces scroll)

**Rev 9.16 (menu stacking + density-last attempt)**
- `05-css-shell` — title-bar `z-index: 50`, pages-more `z-index: 60`
- `10x-pm6-css-global` — `.title-bar .page-tabs { overflow: visible }`, menu `z-index: 230`
- `29x-pm6-js-panels` — re-measure-after-each-step (regressed collapse; fixed in 9.17)

**Rev 9.17 (restore density ladder)**
- `29x-pm6-js-panels` — restore estimate-based steps 1–5; gate ▼ after step 5;
  `Math.max(offsetWidth, scrollWidth)` + summed visible page tabs
- `05-css-shell` / `10x-pm6-css-global` — page-tabs `min-width: max-content`; keep 9.16 stacking

**Rev 9.7 / 9.9 / 9.11 / 9.18–9.21 (magnet + spotlight tip)**
- `10x-pm6-css-global` — PM8 tokens: disc `--pm8-spot` / `--pm8-spot-glow`;
  ring `--pm8-ring-spot` / `--pm8-glow`; bloom `--pm8-wash` (decoupled)
- `29x-pm6-js-globals` — `F.spotGlow` / glow / wash `num()` fallbacks

**Tip end-state tokens (`:root`, tip rev 9.21):**
`--pm8-spot: 53px`, `--pm8-ring-spot: 115px`, `--pm8-spot-glow: .04`,
`--pm8-glow: .60`, `--pm8-wash: .38` (theme families scale glow/wash/spot-glow).

Incremental ship notes: **Rev 9**, **Rev 9.1**, **Rev 9.2** below; **Rev 9.3**–
**Rev 9.21** above (top of this file / End result tip).

### Rev 9.2 — orch content gap + notify stack polish (2026-07-23)

**What changed:**
- Glass/friendly `.orch-tabs` get bottom margin so Node Graph (and other
  panes) no longer sit flush under the tab pill.
- Notify inbox: softer friendly list fade (`96%`), extra list bottom padding,
  friendly chrome `padding-bottom` so card bottoms are not clipped.
- Glass collapsed stack: left mask softened (`rgba(.72)` → solid at 4%) so
  cards stay readable on the left.

**Fix (parts → assemble g3 → `build_pm7.py --allow-new-base`):**
- `10x-pm6-css-orchestrator` — glass/friendly `.orch-tabs` margin
- `10x-pm6-css-bottom` — `.rs-panel-list` / friendly fade / glass `.rs-clip`

**Shipped:** sha256 `122fa8133e57adb3d415c68a5908e29599fea1ca9fe81b9dd1e8608c2c3f0a0d`
(2,682,477 bytes). Base sha `b0396e7d0fd20bcdee6c312040cc7cb6513a0dedf83eee9d3407367b66e172dc`.
Report: `Concepts/pm7-tools/build_report.json`.

### Rev 9.1 — Orchestrator tab strip theme polish (2026-07-23)

**What changed:**
- Friendly: `.orch-tabs` is a rounded cozy pill bar with gap under the header
  pill; active tabs are mint pills (no underline).
- Glass: `.orch-tabs` is a rounded frosted bar matching Projects sort-by
  toolbar (`pm6-glass-step-2` + hairline + inset edge); active tab uses step-3.

**Fix (parts → assemble g3 → `build_pm7.py --allow-new-base`):**
- `10x-pm6-css-orchestrator` — friendly + glass `.orch-tabs` / `.orch-tab` skins

**Shipped:** sha256 `c48fe7001254cf8381ca680e54551201cb9c9dd25fcba5b84b02f15cfd5f4756`
(2,682,416 bytes). Base sha `b9159cd946b515b293de640fcbf31beb4b3161bc5e2d5586a8024bff541aeb51`.
Report: `Concepts/pm7-tools/build_report.json`.

### Rev 9 — header / tab polish + chrome trim (2026-07-23)

**What changed:**
1. Friendly editor file tabs get top-rounded folder-tab shape (cozy mint active).
2. Planning Wizard workspace runhead drops the long PlanningRun meta line.
3. Usage subtitle copy updated; Refresh/Export are icon-only so the head stays one line.
4. Orch / Usage / Wizard top headers match Projects layout on non-retro themes;
   friendly gets rounded inset header boxes; Retro chrome bars left alone.
5. Status bar drops Agent / Claude Code / Fable 5 / 42k/128k chips.
6. Activity bar drops Settings / Usage / Alerts / Orch / Wizard / Graph
   (title-bar tabs still reach those pages; title-bar notify stays).

**Fix (parts → assemble g3 → `build_pm7.py --allow-new-base`):**
- `10x-pm6-css-global` — friendly `.editor-tabs .tab` top-radius
- `16-page-wizard` / `10x-pm6-css-wizard` — remove run meta; non-retro runhead
- `18-page-usage` — copy + icon buttons + header layout/theme boxes
- `08-css-components-c` — non-retro orch-header Projects-like + friendly box
- `22-html-status-toast` / `29x-pm6-js-bottom` — trim status chips + no-op hooks
- `11-html-shell-open` — remove activity-bar icons + empty Work group

**Commands:**
```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
# adopts Concepts/PMConcept6.html → pm7-tools/base/PM7-base.html
python3 Concepts/pm7-tools/build_pm7.py --allow-new-base \
  --outdir /tmp/pm7-header-polish-build --out Concepts/PMConcept7.html
```

**Shipped:** sha256 `d43d8e3906bfa3e122c6d8ae8e6e300fbe03741624dbf26eb657d6228e3ef198`
(2,680,628 bytes). Base sha `8f3b94d2114c4945da9d64dd6e5930820580fbd369233c63bc0528316562451b`.
Report: `Concepts/pm7-tools/build_report.json`.

### Rev 8.1 — friendly notify stacking + opacity (2026-07-23)

**Bug:** on friendly-dark / friendly-light, the title-bar notify stage and
inbox panel painted *behind* page content and looked washed-out/transparent.
Other themes were fine.

**Cause:** friendly title-bar `backdrop-filter` creates a stacking context;
`.rs-panel` / `.rs-stage` z-indexes were trapped inside it while the bar
itself stayed at auto z-order under `.main-area`. Free-float chrome stayed
transparent (correct), but card fills used a weak `surface-elevated` mix
instead of the cozy card base other friendly surfaces use.

**Fix (parts → assemble g3 → `build_pm7.py --allow-new-base`):**
- `10x-pm6-css-global`: `[data-theme^="friendly"] .title-bar` →
  `position: relative; z-index: 50; overflow: visible`
- `10x-pm6-css-bottom`: friendly `.n-card` / `.rs-item` / stage+clip cards use
  `--pm6-cozy-card-base` mixes; Clear all btn uses cozy card base

**Shipped:** sha256 `149323b7b192252372840e2589ec5bea6967b44f73f3d00ed0a44f7c1e8fdd75`
(2,684,390 bytes). Base sha `f183666c710fd2f3e536491b8949833dcfa301f731b9642dd7dc25416fd75104`.
Report: `Concepts/pm7-tools/build_report.json`.

**Try:** friendly-dark or friendly-light → `toast.important({title:'Run complete', body:'Wave 3'})`
→ expand stack — inbox cards sit above chat/dashboard and read solid (proto-like
free-float, not frosted-through). Glass / retro / basic unchanged.

### Rev 8 — title-bar notifications (2026-07-23)

**What changed:** polished Proto 01 (`Concepts/notify-protos/01-rightward-stack.html`)
ported into PMConcept7 via parts → assemble g3 → `build_pm7.py`. Bottom-right
`#pmToastStack` and status-bar `#pm6StatusBell` are retired. The title-bar
**stack + count badge** (between page tabs and search) is the sole in-app
notify affordance; unread lives on the badge. Shared alert store semantics
still map conceptually to Plans F3-453 (documented below; live Plans docs
unchanged in this ship).

**Ship (what landed):**
- Ephemeral: `toast("…")` stages under the stack, fades out, does not archive.
- Durable / important: `toast.important(…)` or structured `toast({…, important:true})`
  stages then joins the stack with a jiggle; expand opens a PM7-style sprout panel.
- Single dismiss: height spring + size-bounce when the inbox is open.
- Clear all: bottom→top collapse-up (`.is-leaving`), then sprout close — no empty
  flash mid-clear.
- Kind action rows (HITL / Permission / FileSafe / Concern / Usage / Wizard),
  **Details** label, Esc closes, themes keep glass/retro/friendly chrome.
- `window.toast` call sites stay compatible; bottom `upgradeToast()` is a no-op.

**Parts touched:**
- `11-html-shell-open` — `.notify-slot` / `#rsStack` / stage / panel host
- `05-css-shell` — notify slot, denser page-tabs, search `margin-left: auto`
- `10x-pm6-css-bottom` — notify CSS (proto + shared `n-*` primitives); hide toast/bell
- `06-css-components-a` — neutralize legacy `#pmToastStack` / `.pm-toast`
- `22-html-status-toast` — `#pmToastStack` hidden; `#pm6StatusBell` hidden
- `29x-pm6-js-globals` — title-bar notify controller as `window.toast`
- `29x-pm6-js-bottom` — `upgradeToast` no-op; `addNote` → `toast.important`
- `24-js-main` — fallback toast → `window.toast` / console only
- Backups: `parts/_bak_pre_titlebar_notify_20260723/`
- `pm7-tools/build_pm7.py` — base pin + T16 backdrop-filter budget 25→30
  (notify glass chrome)

**Commands:**
```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
# adopts Concepts/PMConcept6.html → pm7-tools/base/PM7-base.html
python3 Concepts/pm7-tools/build_pm7.py --allow-new-base \
  --outdir /tmp/pm7-titlebar-notify-build --out Concepts/PMConcept7.html
```

**Shipped:** sha256 `cc88c11885deb923d941089f8b372a3005b50c3295df8ed2caef9f12f2aab03a`
(2,683,584 bytes). Base sha `764bef0dfe48382db80171571cb92ceb9470aabbf13a164d980d2f62d3300982`.
Report: `Concepts/pm7-tools/build_report.json`.

**Try:**
1. Ephemeral — trigger any existing `toast("…")` (e.g. status sync chip) → stage
   card under the title-bar stack fades; chat corner stays clear.
2. Important — from console: `toast.important({title:'Run complete', body:'Wave 3 ok', severity:'success', page:'orchestrator'})` → joins stack + badge.
3. Expand — click the stack → sprout inbox; Esc / outside click closes.
4. Clear all — with ≥2 items open, Clear all → items collapse upward, then sprout closes.
5. Themes — flip all 8 themes; glass plate / retro hard shadow / friendly free-float.
6. Settings tab — still fully visible in the title bar (not clipped by the stack).

**Plans interaction crosswalk** (concept → Plans lineage for later PlanUnit wiring;
GUI concept is source-lineage only — live Plans docs not edited here):

| Concept behavior | Plans touchpoints (lineage) |
|------------------|-----------------------------|
| Ephemeral fade / no archive | Toast stack contract **F3-447**; interruptive vs badge delivery classes in storage attention-routing |
| Durable stack + badge unread | Status bell role **F3-448** conceptually moved to title-bar stack; alert store / panel **F3-453** still owns durable alerts |
| Click / Details → route | `primary_route_payload` / `cmd.alert.open_source`; Contracts `route_kind` includes `toast` |
| HITL Approve/Decline/Details/Explain | HITL blocked-sequence + `allowed_action_ids[]`; Explain read-only |
| Permission Deny/Once/Session/Always | Permissions ladder; pattern edit on Always |
| FileSafe + TTL | FileSafe ladder + 60s TTL |
| Concern rationale | Contracts dismiss/resolve/ack need rationale |
| Clear all / dismiss X | Dismiss ≠ resolve blockers; ephemeral X-only |

See **Title-bar notifications** below for the full behavior notes.

### Rev 7 — magnet + spotlight hover (2026-07-22)

**What changed:** the pm6 one-shot rotate jiggle (`pm6Jiggle` / WAA
`el.animate`) is gone. Every box that used to wobble on pointer-entry now
runs the PM8 magnet + spotlight system (inspired by Magic Bento magnetism +
spotlight; tilt, click, and stars deliberately omitted).

**Fix (parts → assemble g3 → `build_pm7.py --allow-new-base`):**
- Part `10x-pm6-css-global`: jiggle keyframes / `.pm-jiggle-run` killed;
  PM8 `--pm8-*` theme knobs, ring `::after`, wash `::before`, `#pm8-bloom`
  proxy, `.pm8-live` overrides added.
- Part `29x-pm6-js-globals`: jiggle WAA trigger replaced by the PM8 rAF
  spring engine (pre-T07 form: one document `pointermove`).
- `build_pm7.py` T07 adapted: magnet `pointermove` → `PM7_PMOVE` dispatcher
  (same merge as before with panels parallax); purpose strings updated.

**Shipped:** sha256 `3c45baeb55562e6f97d090f49db5d634bfbd5efdfe39efd9b701926e90453ee1`
(2,641,245 bytes). Base sha `5c925a48e4dbb49f…`.
`Concepts/PMConcept7.html` == `Concepts/PMConcept8.html` == Open Design
preview. Report: `Concepts/pm7-tools/build_report.json`.

**Assemble note:** mask edge fades use `white` (not `#fff`) so
`check_css` hex-outside-theme stays clean.

**Try:** hover bento cards / dash cards / activity icons across all 8
themes — boxes lean toward the pointer with an accent ring + soft bloom;
`data-motion="reduced"` kills it; no tilt / click ripple / stars.

See **Magnet + spotlight hover (PM8)** for the full design + Slint table.

### Rev 6 — friendly pill field end-clearance (2026-07-22)

**Bug:** on friendly-dark / friendly-light, pill-shaped chrome
(`--radius-pill: 999px`) with tight horizontal padding put glyphs in the
curved ends. Focus sky glow made the clip obvious on text fields; the
project selector (not an input) sat too close to its label as well.

**Fix (parts → assemble g3 → `build_pm7.py`, base pin updated):**
- Part `10x-pm6-css-global`: under `[data-theme^="friendly"]`, bump
  `padding-inline` so text clears the pill semicircle (~half of a ~28px
  control height), and keep `overflow: visible` so the sky focus glow is
  not clipped:
  - Title chrome: `.search-bar`, `.theme-select`, `.project-dropdown` →
    `padding-inline: 14px` (project dropdown also `gap: var(--sm)`).
  - General text/search/select/textarea fields → `padding-inline: 12px`.
  - Chat / popout search wrappers (`.pm6-chat-headsearch`,
    `.pm6-chat-modelsearch`, `.pm6-chat-modesearch`,
    `.pm6-chat-personasearch`, `.chat-dropdown-search input`) →
    `padding-inline: 12px`; inner inputs keep a small `4px` inset beside
    the search icon.
- Adaptive caret experiment was tried and **removed** the same day; it is
  not in this ship.

**Shipped:** sha256 `4d92b04e0967faed36e4db12f11faccd93356fdc2468e88d472dd0c827f20358`
(2,615,296 bytes). Base sha `5ff47f664d85b7e1…`.

**Try:** friendly-dark or friendly-light → focus title search, chat head
search, model/persona search, and open the project selector — text should
clear the rounded ends and the sky glow should read fully around the pill.

### Rev 5 — worktree click fix (2026-07-22)

**Bug:** after rev 4, clicking the chat worktree button did nothing.
CSS had moved to `.is-open` / `.is-closing` sprout classes, but
`toggleWorktreeDropdown` in part 25 still toggled `.active`, and
`wireChrome` never handled `.wt-bind-btn` the way it handles lens/more.

**Fix (parts → assemble g3 → `build_pm7.py --allow-new-base`):**
- Part 25: `toggleWorktreeDropdown` / bind / unbind / outside-click use
  `window.PM6_SPROUT`; clear inline `style.color`; keep `pm6-chat-wt` class.
- Part 29x chat: click-delegate worktree like lens; drop markup `onclick`.
- Shipped sha256 `8ea7680f7814165bd1bc2fd0d6e64a814922d14abc41651c3eaed708e87abfba`
  (2,614,289 bytes). Base sha `c66f838df3a05f0b…`.

**Try:** open chat → click worktree branch icon → menu sprouts; pick a
branch / click outside → closes with the same collapse.

### Rev 4 ship

**Status:** true pipeline rebuild complete. `Concepts/PMConcept7.html` ==
`Concepts/PMConcept8.html` == Open Design `PMConcept8.html`. sha256
`bc13e037d3e2d87d402ad50f791e3766cbadb93f82b48521b320e01edc813f08`
(2,613,137 bytes). Report: `Concepts/pm7-tools/build_report.json`.

### What was run

1. **Backport** the six workstreams into `Concepts/pm6-build/parts/**`
   (01 head boot-paint/fonts, 05 shell Chats rail, 09 bento lens/worktree/more-menu,
   10x chat + global CSS incl. page-tabs CSS, 11 shell-open `page-tab-ink`,
   29x chat / chat-data / globals page-tabs IIFE). Part backups:
   `parts/_bak_pre_pm8_backport_*`.
2. **`python3 assemble.py --gate g3`** → `Concepts/PMConcept6.html`
   (sha256 `9d393c3c559971a27d44d28400454bbcec4aff5bd2aa0d044b43e4182733b749`).
3. Adopt as `pm7-tools/base/PM7-base.html`, pin `BASE_SHA`, drop 4 drifted
   dead selectors, adapt T05 (already upstream) + T16 backdrop-filter budget
   24→25 (page-tabs CSS comment substring).
4. **`python3 build_pm7.py --allow-new-base`** → shipped `PMConcept7.html`.

### Included (same six workstreams)

- Page-tab ink + directional `pm8-page-in/out` transitions (other agent)
- Boot flash fix (`#pm-boot-paint`, deferred page transitions)
- Corner-origin sprout popouts (model / mode / persona / effort / thoroughness)
- Effort / thoroughness option-count resize bounce
- Context ring click sprout + glow; worktree/lens/more-options menus
- Chats rail cleanup (label, +, collapse-on-resize, selection, status glow)

### Going forward

Edit **parts** (or PM7 transforms), then re-run assemble g3 + `build_pm7.py`.
Do not hand-edit `PMConcept7.html`. Pre-pipeline promotion backup remains at
`PMConcept7.html.bak-pre-pm8-merge` for reference only.

PMConcept8 top page selector — smooth sliding tab indicator + directional page
transitions, reproducing the animation from
https://motion.dev/examples/react-smooth-tabs (parameters pulled from the
example's own source, not eyeballed). Pure HTML/CSS/JS overlay: no existing
markup styling, page-switch semantics, or demo-engine contracts were changed —
three self-contained blocks were added and one legacy per-page animation was
retired.

**File touched:** `Concepts/PMConcept8.html` only. Find each block by its banner
text (byte offsets drift):

| Block | Find by |
|---|---|
| Ink element in the tab bar | `<nav class="page-tabs" data-od-id="page-tabs">` (~13129) — `.page-tab-ink` is its first child |
| CSS (theming + transitions) | `PM8 smooth page tabs — sliding selector` — the last `<style>` block before `</head>` (~13013) |
| JS (spring + transition driver) | `PM8 smooth page tabs: sliding selector ink` — inserted immediately after the `window.PM_PAGES = {…};` definition (~22585) |

---

## Sliding selector

The active-tab chrome (background / border / glow / frost) moved from
`.page-tab.active` onto one shared `.page-tab-ink` element inside
`nav.page-tabs`, so the visual selection is a single pill that travels between
tabs. `.page-tab.active` keeps only its text color + weight. The neutralization
rule `[data-theme] .title-bar .page-tabs .page-tab.active { background:
transparent; border-color: transparent; box-shadow: none; }` matches or beats
the specificity of every theme's skin.

**Per-theme ink (same look as the old active tab, now sliding):**
- retro (default): `--accent-lime` slab + `--border-width` border + `--border-radius` (square)
- basic-light / basic-dark: `--accent-blue` slab, no border
- glass-*: `--pm6-glass-step-3` frost, `--radius-pill`, inset `--glass-edge` highlight + `--pm6-glass-pane-shadow2`
- friendly-*: `color-mix(--pm6-cozy-mint 20%, --pm6-cozy-card-base)`, `--radius-pill`, mint glow shadow

**Motion:** real spring integrator in JS (semi-implicit Euler, 2 substeps/frame),
`stiffness: 500 / damping: 35` — the example's `indicatorSpring` default. Both
position and width spring. Tabs sit at `z-index: 1` over the ink; the ink is
`pointer-events: none`. Geometry comes from the tab's own
`offsetLeft/offsetWidth/offsetHeight`, so it stays exact across the tabstrip
recipe's per-theme padding/height and inside the strip's hidden scroll area.

**Resync:** snaps (no spring) on `data-theme` / `data-motion` attribute change
(MutationObserver on `documentElement`), window resize, and `document.fonts.ready`
— tab metrics differ per theme and typeface.

---

## Page transitions

Wraps `window.PM_PAGES.go` in place (the single navigation choke point — top
tabs, keyboard, activity bar, demo engine, and settings all route through it),
so every page change animates. `go()`'s `.active` toggling and `page.changed`
emit are untouched — the pm7PageGate contract (`.active` before emit) holds,
and animations are a pure visual overlay added after the fact. Direction is
derived from tab order (`+1` forward / `-1` back) and stamped as `--pm-dir` on
the panels.

**Sequence:** immediate directional crossfade — the leaving page is frozen as an
absolute overlay (`display:flex !important; position:absolute; z-index:5`,
explicit top/left/width/height measured from its live rect *before* `go()`
removes `.active`) and slides out to `-dir*50px` with a linear 150ms fade; the
entering page slides in from `dir*50px` on top (`position:relative; z-index:6`)
over 300ms with `cubic-bezier(.25, 1, .5, 1)` — the example's content easing and
durations (`contentOffsetX: 50`, `contentDuration: .3`, exit = half).

**Deliberate deviations from the reference** (small static card → full-bleed IDE
surfaces), documented in the CSS block comment:
- Crossfade instead of the example's "wait" mode: a 150ms blank gap before enter
  read as a page reload on content-heavy pages.
- No `blur(4px)`: a full-page filter re-renders the glass/backdrop-filter
  surfaces inside the page and flickers on arrival.

**Reduced motion:** `data-motion="reduced"` or `prefers-reduced-motion` snaps
the ink and skips the panel animation entirely (CSS kill-switches + JS guard).

---

## Bug fixes made along the way (final state above)

1. **Keyframe/class name collision.** The file already ships a `pm-page-in`
   keyframe + utility class (`@keyframes pm-page-in` ~7739; `.pm-page-in` ~7763,
   used by `.pm6-wiz-stage.active` ~9231). The first version reused that name and
   hijacked the wizard's stage-switch animation globally. Renamed to
   `pm8-page-in` / `pm8-page-out` (classes, keyframes, JS `classList` +
   `animationName` checks, reduced-motion rules).
2. **Double fade-in → Settings flicker + Wizard black flash.** Wizard and
   Settings are the only two pages carrying a legacy
   `.page-wizard.active / .page-settings.active { animation: fadeIn 0.3s }`
   (~4376 / ~5683). When the `.pm8-page-in` class came off at the end of the
   transition, that still-applied `fadeIn` restarted from the top — a second
   full opacity dip (Wizard's `var(--background)` plate vanished with it, hence
   black). Fixed by retiring the legacy page-level fade with
   `.primary-content > .page.active:not(.pm8-page-in):not(.pm8-page-out) {
   animation: none; }` — the directional transition now owns enter motion.
   (Earlier, a blanket `.page.active { animation: none }` also cancelled
   `.pm8-page-in` itself; enter is restored via
   `.primary-content > .page.active.pm8-page-in`.)
3. **Exit overlay measured dead.** The leaving page's rect is captured *before*
   `PM_PAGES.go` toggles `.active` off (`display:none` zeroes the rect); the
   first version measured after and got a 0×0 overlay.
4. **Reload double white flash.** Two sources after the page-switch merge:
   - **FOUC:** theme canvas CSS (`html, body { background }`) sat after large
     inlined glass WebPs, while Google Fonts were render-blocking — the browser
     painted default white, then again when fonts/CSS settled. Fixed in
     theme-boot: stamp `#pm-boot-paint` with the persisted theme's solid
     `--background` hex + `color-scheme`, and load fonts via
     `rel=preload` → stylesheet onload (non-blocking).
   - **Boot crossfade:** panel transitions gated until after a double
     `requestAnimationFrame`; `PM_PAGES.current` is seeded from the
     markup-active tab so the first paint never runs an opacity-0 enter.

---

## Deliberately untouched

- `.page-tab` text colors/weights per theme, focus-visible outlines, tabstrip
  recipe (heights, ellipsis, hidden scroll), title-bar layout.
- Per-page entrance choreography that replays on activation (settings
  `s4-drop-in` / `s4-rise` hero+shelves, wizard `.pm-enter-up`) — pre-existing
  behavior on every visit; it now plays inside the smooth arrival instead of an
  instant swap.
- Everything downstream of `PM_PAGES.go` (subtab routing, page-gate replay,
  demo bus).

## Build-artifact note

These blocks now live in parts and survive a pipeline rebuild:
- ink `<span class="page-tab-ink">` → `11-html-shell-open.part.html`
- page-tabs CSS → appended inside `10x-pm6-css-global.part.html`
- wrapper IIFE → grafted into `29x-pm6-js-globals.part.html` after `PM_PAGES`

Do not re-hand-edit `PMConcept7.html` / `PMConcept8.html` for these; change
the parts and re-run assemble g3 + `build_pm7.py --allow-new-base`.

---

## Title-bar notifications

**Status:** shipped via parts → assemble g3 → `build_pm7.py` (rev 8;
friendly stacking/opacity fix in rev 8.1).
Reference proto: `Concepts/notify-protos/01-rightward-stack.html`.

### Policy

- Title-bar **rightward stack + badge** is the sole in-app notify control.
- Status-bar bell (`#pm6StatusBell` / badge / pop) is hidden/retired.
- Bottom-right `#pmToastStack` is hidden; chat corner stays free.
- Activity-bar ALERTS / notifications side panel is unchanged this pass
  (bell policy targets status-bar chrome only).
- Full questionnaire forms stay on owner surfaces; title-bar cards only
  expose compact action rows + optional rationale / Explain.

### API

| Call | Behavior |
|------|----------|
| `toast("msg")` | Ephemeral stage → fade; no archive |
| `toast.important(msgOrObj)` | Stage → join stack + badge |
| `toast({ title, body, … })` | Structured durable push (default important) |
| `toast.clear()` | Clear-all collapse-up then sprout close |

Existing string call sites keep working. Demo `addNote` from run/usage events
routes through `toast.important`.

### Out of scope this pass

- Editing `Plans/**` / Spec Lock / shards (wire later from the crosswalk in Rev 8)
- Hand-sync to `PMConcept8.html` (optional later)
- Embedding full questionnaire UI in the title-bar dropdown

---

## Magnet + spotlight hover (PM8)

**Status:** shipped via parts → assemble g3 → `build_pm7.py` (rev 7; tip
tuning through **rev 9.21**). Reference:
https://reactbits.dev/components/magic-bento (magnetism + spotlight on; tilt /
click / stars off). Massaged into Puppet Master’s 8 themes — not a straight
port.

### What it replaces

Old pm6 jiggle: one-shot `rotate` wobble via Web Animations API on
pointer-entry (`JIGGLE_SEL` / `pm6JiggleSetTarget`). Flash-safe vs CSS
entrance animations, but not pointer-tracking and not Slint-friendly as a
long-lived effect.

### What we ship

Same box-set (`PM8_SEL` == former `JIGGLE_SEL`):

| `.pm-sheen` | `.pm-term-icon-btn` | `.pm6-dash-iconbtn` | `.browser-action-btn` | `.activity-bar .icon` |
| `.pm6-dash-card` | `.pm6-dash-catalog-item` | `.pm6-proj-card` | `.project-card-bento` | wizard choice/attach/disc cards |
| orch ctl/pc-stat/hist-state | `.pm6-usage-acct-status` | `.pm6-sp-row` | `.pm6-art-row` | `.pm6-search-hit` |

**Magnet** — hovered box springs a few px toward the pointer. Shift scales
with box size (~2.5–8px × `--pm8-mag`). Written via the standalone CSS
`translate` property (never `transform`) so it composes with entrance
`fill-mode:both` animations the same way the old WAA track did.

**Spotlight** — continuous intensity field (no snap at the edge):
- `0` at `--pm8-bleed` px outside a box
- `--pm8-edge` exactly at the edge
- full by `--pm8-ramp` px inside

Three independent paint channels (do not couple disc alpha to border punch):

| Channel | Layer | Size knob | Alpha knob | Tip (rev 9.21) |
|---------|-------|-----------|------------|----------------|
| **Border ring** | `::after` (masked to border band) | `--pm8-ring-spot` | `--pm8-glow` | `115px`; ~75% of original glow |
| **Activation disc** | `::before` (pointer disc under mouse) | `--pm8-spot` | `--pm8-spot-glow` | `53px`; barely visible (`.03`–`.05`) |
| **Outward bloom** | `#pm8-bloom` fixed shadow proxy | (box rect) | `--pm8-wash` | ~75% of original wash |

Bloom proxy stays locked to the box rect / radius / magnet offset (escapes
scroll-container clip; `clip-path`’d to the visible rect when partly scrolled
away). Color always rides `--accent-primary-rgb`.

**Occlusion** — a panel/terminal over the grid (unrelated hit subtree)
cannot light boxes behind it; the gap between cards (hit = grid ancestor)
still bleeds so entering a box stays snap-free. Nested targets (widget
gear/close inside a card) resolve to the outer box; inners get
`--pm8-i: 0` pinned so inherited intensity cannot light their ring.

**Performance** (vs the reference’s per-mousemove tween + full-card
remeasure):
- one shared `requestAnimationFrame` spring integrator
- compositor-only writes (`translate` / custom props / bloom transform)
- element list cached, refreshed on DOM mutation
- hovered box base rect cached, refreshed on scroll/resize
- loop **self-suspends** when nothing is hovered, settling, or glowing
- glow writes gated by small epsilon thresholds

**Reduced motion:** `data-motion="reduced"` → `killAll()` (clear translate,
`--pm8-i`, bloom) and stop the loop.

### Theme knobs (`--pm8-*`)

| Family | Feel | Tip glow / wash / spot-glow |
|---|---|---|
| `:root` | baseline | `.60` / `.38` / `.04` |
| retro | stiff spring, small hard ring | `.71` / `.34` / `.05` |
| basic | restrained ring + mag | `.45` / `.30` / `.03` |
| glass | wide soft ring, loose spring, stronger mag | `.64` / `.41` / `.04` |
| friendly | springy with micro overshoot | `.60` / `.38` / `.04` |

Also on `:root`: `--pm8-spot: 53px`, `--pm8-ring-spot: 115px`. Each
`[data-theme^=…]` family overrides ring / bleed / edge / ramp / spot-glow /
glow / wash / mag / stiff / damp. Light + dark of a family share the same
feel knobs (accent RGB already differs per theme).

### Slint 1.17.1 porting table

| HTML | Slint |
|---|---|
| magnet `translate` + spring | `translate` + `animate { spring(...) }` |
| pointer tracking | `TouchArea.mouse-cursor-position` |
| ring `::after` radial + mask | `@radial-gradient` Rectangle + inner cover (no mask); size=`--pm8-ring-spot`, alpha=`--pm8-glow` |
| wash / activation `::before` | second under-content Rectangle; size=`--pm8-spot`, alpha=`--pm8-spot-glow` (independent of glow/wash) |
| `#pm8-bloom` fixed shadow proxy | window-level / on-box `drop-shadow-*` (ScrollView clips automatically; no proxy needed); alpha=`--pm8-wash` |

No blend-mode, filter, or canvas — only translate + radial-gradient +
opacity.

### Deliberately omitted (from Magic Bento)

Tilt, click ripple, starfield.

### Find by

| Piece | Hook |
|---|---|
| CSS system | `PM8 hover system: magnet + spotlight` in `10x-pm6-css-global` |
| Theme knobs | `--pm8-ring`, `--pm8-spot`, `--pm8-ring-spot`, `--pm8-spot-glow`, `--pm8-glow`, `--pm8-wash`, `--pm8-mag`, `--pm8-stiff` |
| Bloom proxy | `#pm8-bloom` |
| Live host class | `.pm8-live` |
| JS engine | `PM8 hover system: magnet + spotlight` in `29x-pm6-js-globals` |
| Selector | `PM8_SEL` |
| T07 wiring | `PM7_PMOVE` + `T07 magnet dispatcher` in `build_pm7.py` |

### Pipeline note

Parts carry the **pre-T07** form (one document `pointermove`).
`build_pm7.py` T07 wraps it into `window.PM7_PMOVE` so panels parallax
shares a single listener. Do not hand-edit `PMConcept7/8.html` for this —
change the parts (or T07 anchors) and re-run assemble g3 +
`build_pm7.py --allow-new-base`.

---

## Chat selector popouts — corner-origin spring (PM8)

Model / mode / persona / effort / plan-thoroughness popouts. Tuned against the
uploaded reference video (slowed open/close frame dumps under `ref-frames/`).
Live in `PMConcept8.html` (Open Design preview + `Concepts/PMConcept8.html`).

### Motion (matched to video)

| Phase | What the video does | What we ship |
|---|---|---|
| Open | ~125–300ms grow from trigger corner, fill-out, slight spring | `transform 300ms` + `cubic-bezier(0.22, 1.55, 0.36, 1)`; closed state uses non-uniform `scale3d` (taller grow than wide) |
| Close | Same ballpark duration; box stays solid until late | `transform 220ms` (snappier than open); opacity holds ~175ms then a short 45ms fade — not a full-duration fade |
| Search resize | Height bounce when filtered results change size | `height 340ms` with stronger overshoot (`1.72`) + brief `is-size-bounce` vertical stretch on model/persona |
| Option-count resize | Side flyout stays open; spring-grows 3→4 levels | Effort/pt: `height 360ms` + `cubic-bezier(0.22, 1.78, 0.36, 1)` + `pm6-effort-size-bounce` — see dedicated section below |

### Nearest-corner sprout (open + close destination)

Each popout sprouts from — and collapses into — the corner/edge nearest its
trigger, not a fixed bottom-left origin.

- **CSS:** `--pm6-sprout-ox/oy/tx/ty/sx/sy` drive `transform-origin` and the
  closed `translate3d` + `scale3d`. Defaults exist; JS overwrites per open.
- **JS `setPopoutSprout(el, anchorEl)`:** measures popout vs trigger (with
  closed-scale neutralized so the layout box is real), then:
  - **Vertical popouts** (model / mode / persona / thoroughness): snap to the
    nearest corner (`bl` / `br` / `tl` / `tr`). Example: Agent (rightmost
    selector) → bottom-right.
  - **Side flyouts** (effort, and thoroughness when it opens beside a row):
    sprout from the left or right edge facing the parent row, with
    Y% aligned to the trigger center.
- **`anchorPopoutAbove`:** prefers left- or right-align from the selector-row
  index (right half of the row → right-align) so the sprout corner lands on
  the button.
- **`portalOpenAnim(el, afterOpen, anchorEl)`** calls `setPopoutSprout` before
  adding `.is-open`; close reuses the same CSS vars so collapse returns to the
  same point.

Find by: `setPopoutSprout`, `--pm6-sprout-ox`, `.pm6-chat-*-popout-portal.is-closing`.

### Modes search removed

Modes popout opens straight into Ask / Agent / Debug / Plan / Deep Plan — no
search field. Model and persona keep search. Leftover `.pm6-chat-modesearch`
CSS may still exist (unused).

---

## Sync note (why page-switch was missing from the preview)

Two copies of `PMConcept8.html` drifted:

1. **Open Design preview** (`…/projects/…/PMConcept8.html`) — had the chat
   popout / sprout work from this thread.
2. **`Concepts/PMConcept8.html`** — had the sliding tab ink + directional
   page transitions documented above (added by another agent).

The preview only loads the Open Design project file, so page-switch animations
were invisible there even though they were real in Concepts. Both copies are
now merged: page-switch blocks ported into the preview file, then that file
copied back to `Concepts/PMConcept8.html`. Keep them in lockstep going forward.

---

## Effort / thoroughness option-count bounce (PM8)

**Status:** shipped in `PMConcept8.html` (Open Design preview +
`Concepts/PMConcept8.html`). Logged 2026-07-22.

Reference: `ScreenRecording_07-22-2026-10-04-34_1.mov` (slowed frames under
`ref-frames/effort-bounce/` — full frames + `crops/`). When hovering between
models (or Plan / Deep Plan) whose available levels differ — e.g.
Medium/High/Max → Low/Medium/High/Max — the side flyout **stays open** and
spring-resizes instead of re-sprouting.

### What the video shows
- ~3.2–3.4s: effort flyout with **3** levels beside Fable/Sonnet
- ~3.5–3.6s: mid-expand as GPT-5.6 Sol is hovered (**Low** appears)
- ~3.6–3.8s: settles at **4** levels with a visible overshoot bounce

### What was wrong
Hovering a different model re-ran `portalOpenAnim` every time, so the box
snapped/re-grew from the sprout origin instead of resizing in place.

### What we ship
- **`effortPopoutOpenBeside`:**
  - first open → `portalOpenAnim` (corner sprout)
  - already open, same row → reposition + reflect only
  - already open, different row → `portalAnimateHeight(effortPopout,
    applyEffortContent)` rebuilds options with a spring height change — do
    **not** re-run `portalOpenAnim`
- **CSS:** `.pm6-chat-effort-popout-portal.is-open` height spring
  (`360ms`, `cubic-bezier(0.22, 1.78, 0.36, 1)`); `@keyframes
  pm6-effort-size-bounce` (420ms, vertical stretch settle) on
  `.is-size-bounce` for effort **and** `.pm6-chat-pt-popout-portal`
- **Demo data:** Plan → `['Low','Medium','High']` (3); Deep Plan →
  `['Low','Medium','High','Max']` (4). Model catalog already mixes 2/3/4
  (Flash / Haiku / Opus).

Applies to model-picker effort **and** mode Plan/Deep Plan side flyout (same
`effortPopout` portal; mode rows call `effortPopoutOpenBeside(row, 'mode')`).

**Find by:** `effortPopoutOpenBeside`, `applyEffortContent`,
`pm6-effort-size-bounce`, `portalAnimateHeight(effortPopout`.

**Try:** hover Haiku (3) → Opus (4) in the model picker, or Plan → Deep Plan
in modes.

---

## Context ring click sprout (PM8)

**Status:** shipped in `PMConcept8.html` (Open Design preview +
`Concepts/PMConcept8.html`). Logged 2026-07-22; revised same day (click + glow).

Header context ring (docked chat + floating/pop-out chat — same
`ctxModuleHtml()` builder) uses the same corner-origin spring open/close as the
model/mode/persona popouts.

### What we ship (current)
- **Motion:** `.context-hover-module` uses the same `--pm6-sprout-*` +
  `.is-open` / `.is-closing` timings as the chat selector portals
  (open ~300ms spring, close ~220ms with late minimal fade). JS calls
  `portalOpenAnim` / `portalCloseAnim` with the ring SVG as the sprout
  anchor (`setPopoutSprout` → nearest corner, usually top-right).
- **Click to open:** click the ring toggles the module; click outside / opening
  another header sprout closes it. Hover no longer opens. Enter/Space when the
  ring is focused also toggles. `aria-expanded` + `.is-ctx-open` track state.
- **Hover glow:** soft accent-blue `drop-shadow` bloom on the SVG (same blue
  family as `.context-lens-btn:hover` border) — not a hard outline ring around
  the icon. Glow also holds while the module is open.
- **Chrome:** `42k/128k` label beside the ring removed (usage still shown
  inside the module). Ring display size **12px → 15px** (~25% larger);
  viewBox / arc math unchanged.
- Applies to both mounts (`#chatPanel` and `#floatingChat`).

**Find by:** `ctxModuleHtml`, `ctxModuleToggle`, `.context-hover-module.is-open`,
`.pm6-chat-ctx.is-ctx-open`, `data-od-id="chat-context-ring"`.

**Try:** hover the ring for the blue glow → click to sprout open → Compact now
/ More details → click outside to close.

---

## Header chrome menus — click sprout + more options (PM8)

**Status:** shipped in `PMConcept8.html` (Open Design preview +
`Concepts/PMConcept8.html`). Logged 2026-07-22; tweaks same day (hover parity,
more-menu layout fix, **theme-matched popout chrome**).

Same corner-origin spring used by model popouts / context ring, applied to the
remaining chat-header menus — **click to open** (not hover), with matching
close collapse.

### Worktree + Context Lens
- **Motion:** `.wt-bind-dropdown` and `.context-lens-popover` use `--pm6-sprout-*`
  + `.is-open` / `.is-closing` (open ~300ms spring, close ~220ms late fade).
  Open via `portalOpenAnim` / `portalCloseAnim` with the trigger button as the
  sprout anchor (`setPopoutSprout` → nearest corner).
- **Trigger:** click toggles; click outside / picking an item closes with the
  same collapse. Opening one header menu closes the others (incl. context ring).
- **Bridge:** `window.PM6_SPROUT` exposes `{ open, close, isOpen }` so the
  older worktree globals (`toggleWorktreeDropdown`, `bindWorktree`, …) share
  the chat script’s sprout helpers. **Rev 5:** those globals actually call
  `PM6_SPROUT` (they used to toggle dead `.active`); chat `wireChrome` also
  click-delegates `.wt-bind-btn` like the lens (markup `onclick` removed).
- **Worktree hover (fixed):** must match `.context-lens-btn:hover` exactly.
  Root cause was twofold: (1) `updateWorktreeButtonForThread` pinned lime via
  **inline `style.color`**, which beat CSS hover; (2) a late bound-hover rule
  re-applied `accent-blue` / `--surface` **after** the glass step-2 rule, so
  glass themes diverged from the lens. Now color is CSS-only (inline cleared),
  hover covers unbound + all bound states (opacity/filter reset), and the
  glass hover block is repeated **after** the late chat CSS so lens + worktree
  share `pm6-glass-step-2` / `glass-edge`.

### Theme-matched popout chrome
Header sprout menus previously used hardcoded `8px` / `6px` radii and raw
`rgba` shadows, so they ignored theme shape (retro square, cozy 14px, glass
plate). They now use the **same surface contract as model/mode selectors**:

| Token | Role |
|---|---|
| `--surface-elevated` | fill |
| `--border` | edge |
| `--radius-md` | corner (0 retro / 6 basic / 10 default / 14 cozy) |
| `--elev-3` | drop shadow |

Applies to: `.context-hover-module`, `.context-lens-popover`, `.wt-bind-dropdown`,
`.pm6-chat-more-menu`.

Glass: those four **plus** the model/mode/persona/effort portals share one
plate rule (`--pm6-glass-plate`, hairline, inset edge, `--pm6-glass-drop`,
`border-radius: 12px`) so header menus and selector popouts look like one
family. Retro zeroes radius on the same set.

### More-options kebab
- Replaces the docked header row of four icon buttons (Duplicate thread /
  Archive thread / Pop out / Close chat) with one vertical-ellipsis
  `SVG.more` button.
- Click sprouts a menu listing those four actions (icons + labels). Floating
  header menu lists Cycle layout + Close chat.
- Same sprout open/close; `aria-expanded` on the kebab; glass themes use the
  plate surface like lens/worktree.
- **Layout fix:** `.chat-panel-header .panel-actions button` forced every button
  (including menu items) to **24×24**, which jumbled the labels. Menu items now
  override to full-width flex rows (`width: 100%; height: auto; min-height: 32px`).

**Find by:** `pm6-chat-more-menu`, `pm6-chat-more-item`, `toggleWorktreeDropdown`,
`PM6_SPROUT`, `context-lens-popover.is-open`, `data-od-id="chat-more-btn"`,
`Header sprout menus = same glass plate`.

**Try:** flip themes (esp. retro / cozy / glass) and open worktree, lens,
context ring, more-options, and model picker — menus should share radius +
plate. Hover worktree vs lens — same blue/hairline treatment, no sticky lime.

---

## Chats rail cleanup (PM8)

**Status:** landed in preview `PMConcept8.html` and synced to
`Concepts/PMConcept8.html`. Applies to docked `#chatPanel` and pop-out
`#floatingChat` (both mounts share `sidebarHtml()` / `threadRowHtml()`).

### What changed

1. **Removed stream provenance clutter** — the
   `Thread created from Dashboard · injected context: run pcr-47 · …`
   `pm6-chat-sys` banner is gone from `th-main` `streamHtml` so the first
   paint is the user message, not a metadata strip.

2. **HISTORY → Chats** — sidebar label is now `Chats` (sentence case, shorter).
   Label + header use **11.5px** in both expanded and collapsed states (same
   padding / `min-height: 30px` so the title doesn’t jump when the rail
   shrinks). Compact `+` new-thread control is **18×18** (icon 10px),
   vertically centered via `align-items: center` on the header row.
   The button carries both `.pm6-chat-newthread` (full-width CTA) and
   `.pm6-chat-newthread-add` — dual-class overrides reset width/margin/padding
   so the CTA rules can’t pull the `+` off-center.

3. **Collapse is resize-driven, not a button** — the chevron `collapse-btn` is
   removed from the rail header. `ResizeObserver` (`wireSidebarCollapse`,
   threshold **148px**) toggles `.collapsed` while the user drags the rail.
   `.collapsed` no longer locks `width` / disables `resize` — it only changes
   content chrome. `min-width` lowered to **72px** so the rail can shrink
   enough for short ellipsised titles.

4. **Collapsed row chrome**
   - Status / timestamp / summary stay hidden (existing base rule).
   - Title truncates harder (`font-size: 10px`, tighter padding).
   - Thread box **border + glow** use `--thread-status-glow` (same color the
     status light used: role accent for working/unread; muted for read/draft).
   - Active collapsed rows keep the status glow **and** a left accent bar so
     selection still reads when narrow.
   - Retro keeps a hard offset shadow; glass keeps a soft glow; basic themes
     use the shared soft glow.

5. **Third-row indent fix** — `thread-debug1` had a decorative orange dot in
   `titleHtml` that pushed the title right of siblings. `titleHtml` dropped;
   rows render plain `title` only, with `data-status` for glow mapping.

6. **Selected-thread indicator** — inactive vs active was too close (thin blue
   border + elevated surface). Active rows now use:
   - tinted fill (`color-mix` of accent / role color into `--surface`)
   - **3px inset left accent bar**
   - hairline outer ring
   - bolder title weight
   Role colors (assistant / interviewer / doc / prd) keep their accent on the
   bar + border; glass / friendly / retro each get matching shadows so the
   selection reads across all 8 themes (docked + pop-out).

### Find by

| Piece | Hook |
|---|---|
| Label + no collapse btn | `pm6-chat-sbtitle-label">Chats` / `sidebarHtml` |
| Compact centered + | `.pm6-chat-newthread.pm6-chat-newthread-add` |
| Resize collapse | `SIDEBAR_COLLAPSE_AT`, `wireSidebarCollapse` |
| Status glow tokens | `--thread-status-glow`, `data-status=` |
| Collapsed row CSS | `chat-thread-sidebar.collapsed .chat-thread-item` |
| Selected indicator | `.chat-thread-item.active` + `inset 3px 0 0` |
| Provenance removal | former `Thread created from Dashboard` (deleted) |

### Try

Click threads in the Chats rail — the active one should show a clear left bar
+ tinted fill. Drag the rail narrower past ~148px — “Chats” stays the same
size/position, `+` stays centered, rows collapse to short titles with
status-colored borders and the selected bar still visible. Widen again to
restore summary/time/status. Flip themes + open pop-out chat — same rail
behavior.

---

## Cozy Shelves rail concepts (2026-07-27)

**Status:** concept prototypes only (not Plans / PMConcept7 lineage).

**URLs:**
- `http://127.0.0.1:8765/c2-cozy-shelves.html` — 7 panels
- `http://127.0.0.1:8765/c2-cozy-shelves-files.html` — File Manager

**Files touched (end state):**
- [`Concepts/rail-concepts/c2-cozy-shelves.html`](rail-concepts/c2-cozy-shelves.html)
- [`Concepts/rail-concepts/c2-cozy-shelves-files.html`](rail-concepts/c2-cozy-shelves-files.html)
- [`Concepts/rail-concepts/_shared/menu.js`](rail-concepts/_shared/menu.js)
- [`Concepts/rail-concepts/_shared/chrome.js`](rail-concepts/_shared/chrome.js)
- [`Concepts/rail-concepts/_shared/base.css`](rail-concepts/_shared/base.css)

**Icon policy:** SVG via `data-ico` / `PMIcon` only — no emoji.

### 1. Menus escape the rail (portal)

Rail sprout menus (`#sidePanelSlot`) portal to `document.body` with
`position: fixed` while open, then restore to their home node on close.
This matches the Slint `PopupWindow` unclipped contract and fixes menus
painting behind shelves / clipped by `.sh-scroll`, accordion
`.pm-acc-inner`, and `will-change` containing blocks (branch, Docker
context/platform, Artifacts sort, FM root menu, workflow ref menus).

Title-bar theme/project menus stay in-place (not rail-scoped).

### 2. Chevrons

Contract: closed = `chevR` pointing right; open = `rotate(90deg)` pointing
down.

- All expanders use `chevR` + `.sh-accchev` / `.fm-cchev` / `.chev`.
- Open rule is **direct-child only**:
  `[data-acc].open > [data-collapse] .sh-accchev` — never rotate nested
  chevrons inside an open parent.
- Icon hydration must **not** copy host classes onto the nested `<svg>`
  (that double-applied `rotate(90deg)` → 180° / pointing left).

### 3. Measure-based pill / banner labels (`data-fit`)

Pill **labels** shorten by measure at the current rail width — not by a
hardcoded px breakpoint. `data-wtier` (`min` / `mid` / `wide`) remains for
**layout chrome only** (padding, generic icon-only tabs, owner hide).

**API:** `window.PMPillFit(scope?)` in `c2-cozy-shelves.html`.
Hooks in `chrome.js`: after `setW`, `showPanel`, and accordion open
(`PMPillFit(acc)`).

**Fit ladder (per control):** try `data-fit="full"` → `"abbr"` → (some)
`"symbol"` / icon-only. Detection uses self overflow, row overflow, and for
banner statuses a **crowding** check that reserves `.sh-title`’s
`min-width: 45%` so short titles like SEARCH still leave honest room for
the status pill.

**Measure pass (`.pill-fit-measure`):** inactive panels + hidden panes lay
out invisibly so always-visible pills can be fitted. Closed accordion
bodies are **not** force-expanded (body chips refit when the row opens).

**Banner short forms (narrow ≈ 240):**

| Panel | Full | Abbr |
|---|---|---|
| Search | `Indexed · 1,284` | `1,284` (+ chevron) |
| Docker | `ctx default` | `default` |
| Testing | `live · 214 pass` | `live` (strips `.sh-bextra`) |
| Agents | `1 needs input` | `1` |

Search index demo (`idxCycle`) writes `.sh-idxfull` / `.sh-idxabbr` spans
instead of wiping `#shIdxLabel` with `textContent`.

Other progressive pairs already on chips / hcounts / Docker docktabs /
worktree filter chips keep the same `data-fit` mechanism (`chip-full` /
`chip-abbr`, `hc-full` / `hc-abbr`, `eq-full` / `eq-abbr`, `wt-full` /
`wt-abbr`).

### 4. No black flash / no expand jump on resize

**Black flash:** do not set `animation: none` on the whole slot during
measure — clearing it restarted `railPanelIn` from `opacity: 0`.
Panel enter animation is one-shot only: `.side-panel-view.active` has no
permanent animation; `showPanel` adds `.pm-panel-enter` for newly activated
views and removes it on `animationend`.

**Expand jump while dragging:** `remeasureOpenAccordions()` (temporary
`gridTemplateRows = scrollHeight + 'px'` then clear) runs only on abrupt
width changes — preset buttons, drag **mouseup**, window resize, dblclick
default — **not** on every continuous slider/drag `setW` frame.

### 5. Layout / chrome polish (still in end state)

- Compose identity: two-row chip layout (`.sh-cmpid` / `.sh-cmpid-row`).
- Agents: elapsed / waiting under the header (`.sh-agtime`); header
  `.pm-rmetric` hidden on agents.
- Artifacts investigation: body clears the head; chips stay measurable.
- History commits: no left accent rail / inset shadow on hover.
- Branch selector full-width at min tier; workflow / branch menus open
  downward in the rail.
- Accordion spring grid owned by `base.css`; open-accordion remeasure keeps
  Rename/Delete (etc.) visible after abrupt width jumps.
- FM: path ellipsis, shelf chevrons, selection-chip narrow abbr where wired.

### Find by

| Piece | Hook |
|---|---|
| Menu portal | `_shared/menu.js` `isRailMenu` / `_pmRailHome` |
| Pill fit | `PMPillFit`, `.pill-fit-measure`, `[data-fit]` |
| Banner crowding | `bannerCrowded` / `preferredWidth` in shelves page script |
| Abrupt acc remount | `setW(..., { remeasureAcc: true })`, drag `mouseup` |
| Panel enter | `.pm-panel-enter`, `showPanel` in `chrome.js` |
| Chevron open | `[data-acc].open > [data-collapse] .sh-accchev` |
| Search index abbr | `#shIdxLabel .sh-idxfull` / `.sh-idxabbr` |
| Docker / Tests / Agents banners | `data-narrow="short"` / `"extra"` on `.sh-bstatus` |

### Try

Hard-refresh both Cozy Shelves URLs. Drag the rail with an accordion open —
bodies should not pulse expand/collapse. At MIN (~240): Search shows
`1,284`, Docker `default`, Testing `live`, Agents `1`. Widen to ~360 — full
labels return. Open branch / Docker context / Artifacts sort / FM menus —
they paint above the rail, not behind shelves. Expand rows after resize —
status chips still shorten without a black flash.

---

## PMConcept7 UI fix wave (2026-07-28)

Twelve concept polish items (settings rail scrollbar + scroll-idle hide,
friendly frosted-chrome text sharpness, project status corner chips,
friendly chat dotted ground, thread-title ellipsis, info-i popover down +
glass plate, cozy narrow Files/Actions/Debug fixes, activity-bar More
always visible). Edits only in `pm6-build/parts/**`.

**Status:** parts → assemble g3 → adopt base → `build_pm7.py --allow-new-base`.

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
# adopt Concepts/PMConcept6.html → pm7-tools/base/PM7-base.html + BASE_SHA
cd ../pm7-tools && python3 build_pm7.py --allow-new-base \
  --outdir /tmp/pm7-ui-fixes --out ../PMConcept7.html
```

**Shipped:** sha256 `9718b013bf9a9c1019dd77755ed49d989d6ef38549a669dc83c96288754061eb`
(3,150,951 bytes). Base sha `368ae33eb62d8517842cdaa046a2f9a4dae76e1cb5e3a4877a7c560c0d8b6e67`.
Report: `Concepts/pm7-tools/build_report.json`. T16 backdrop-filter budget
adapted 30 → 27 (frosted chrome blur moved to `::before`).

---

## PMConcept7 UI fix wave 2 (2026-07-28)

Residual polish after wave 1: friendly notify letter-spacing; info-i
body-portal above composer (`z-index: 1400`); demo-thread overflow clamp
(sidebar + stream + `pm6-preblock`); Actions meta no longer expands when
menus open (removed `.menu-open` overflow lift — menus already portal);
Debug Expression/Apply narrow row; Sessions wrap group + measure-based
name/SVG symbol; tastebook cfg layers symbol + menu ellipsis.

Edits only in `pm6-build/parts/**`.

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
# adopt Concepts/PMConcept6.html → pm7-tools/base/PM7-base.html + BASE_SHA
cd ../pm7-tools && python3 build_pm7.py --allow-new-base \
  --outdir /tmp/pm7-ui-wave2b --out ../PMConcept7.html
```

**Shipped:** sha256 `24e4f2ddc18265501386aecf4d43348e26969603e30b9d9bb7a4c5368d980c8a`
(3,157,782 bytes). Base sha `d9864897f02ec1c8ffc0bd9089d595a4e95c68a76d63ea307d397c7a88ae8338`.
Report: `Concepts/pm7-tools/build_report.json`.

---

## PMConcept7 Debug narrow polish wave 3 (2026-07-28)

Measure-driven Debug & Run fixes: Expression/qty/Apply three-row stack
(`data-stack`), Disconnect+sesspick+Reveal `.sh-ttrail` wrap unit (no
`data-wtier="min"` gate), sesspick symbol = terminal SVG only (hide
`.sh-sdot`), cfg `needsShortSelf` + layers symbol + menu-item ellipsis +
fit second-pass recover.

Edits only in `pm6-build/parts/**`.

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
# adopt Concepts/PMConcept6.html → pm7-tools/base/PM7-base.html + BASE_SHA
cd ../pm7-tools && python3 build_pm7.py --allow-new-base \
  --outdir /tmp/pm7-w3b --out ../PMConcept7.html
```

**Shipped:** sha256 `996ca55db775cf4e9afd6eba1a20ce65c9e928513904fe2cf99cad9d4d3c132f`
(3,159,599 bytes). Base sha `80b728a37d96f261ae938c605bab63ecd1519226999a1a7099f2373f45193349`.
Report: `Concepts/pm7-tools/build_report.json`.

**QA:** HTTP serve; Debug panel; continuous width sweep 460↔180 on all 8
themes (basic/retro/glass/friendly × light/dark) — 0 layout fails;
trail groups Disconnect|sess|Reveal; Expression stacks three rows;
cfg symbol shows 14×14 layers (never blank/dot-only); menu labels stay
inside plate.

---

## PMConcept7 Debug clip + cfg fit wave 4 (2026-07-28)

Fix Expression/Cancel clipped past `.pm-acc-inner` (`width:100%` +
`margin-left:22px`) and launch-config stuck as a 26px symbol (cfg fitted
before Start, then crushed by flex shrink).

Edits only in `pm6-build/parts/**`:
- `.sh-bpedit`: `width:auto; max-width:calc(100% - 22px)`; drop 7rem mins
- cfg: seed full → fit launchrow before cfg; `min-width:7rem` until symbol;
  abbr may ellipsize until pill &lt; 72px

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
# adopt Concepts/PMConcept6.html → pm7-tools/base/PM7-base.html + BASE_SHA
cd ../pm7-tools && python3 build_pm7.py --allow-new-base \
  --outdir /tmp/pm7-w4e --out ../PMConcept7.html
```

**Shipped:** sha256 `08d92e8c50fc9d11be61ca61125d2d9a50347a5a7167399e78c71454b5513b97`
(3,160,686 bytes). Base sha `e66ac60de3830a7d5b90d3d9dcaf036268b7c52ccb4cad1cc500507de1976cd9`.
Report: `Concepts/pm7-tools/build_report.json`.

**QA:** HTTP serve; Debug & Run; width sweep 460↔180 on all 8 themes —
0 clip/stuck-symbol fails; Cancel + Expression stay inside rail; cfg shows
full/abbr label (tastebook-api) across mid/wide.

---

## PMConcept7 Debug head + launch overflow wave 5 (2026-07-28)

Keep launch-row cog and Breakpoints header actions on-rail during slow
width drag; stop abbr `sh-hcount` from being crushed.

Edits only in `pm6-build/parts/**`:
- Launch: wrap Start|alt|cog in `.sh-launch-acts`; `flex-wrap` on
  `.sh-launchrow`; drop cfg `min-width:7rem` floor (`min-width:0`)
- Heads: wrap trailing minibuttons in `.sh-hacts`; wrap `.sh-head`;
  ellipsis `.sh-hlabel`; abbr hcount `flex:0 0 auto` floor

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
# adopt Concepts/PMConcept6.html → pm7-tools/base/PM7-base.html + BASE_SHA
cd ../pm7-tools && python3 build_pm7.py --allow-new-base \
  --outdir /tmp/pm7-w5 --out ../PMConcept7.html
```

**Shipped:** sha256 `0d5012565463a48885f827c71676bca02897e18ee7514cefb4a22f82b3a165a9`
(3,161,603 bytes). Base sha `4221f8cecc32ac74233ccfdf389b3d78e76db29902e0b8135b50babc6c63352b`.
Report: `Concepts/pm7-tools/build_report.json`.

**QA:** HTTP serve; Debug & Run; slow-drag 400↔160 (multi-cycle) on all 8
themes — 0 overflow fails; cog + Breakpoints plus/check/trash stay inside
rail (heads may wrap); abbr count “4” fully visible; cfg recovers
full/abbr/symbol (full ≥~450px).

---

## PMConcept7 Debug launch + head polish wave 6 (2026-07-28)

Stop cfg layers symbol sitting alone on line 1; hide shelf head actions
while collapsed; Call Stack abbr → `main` beside search; center Breakpoints
multi-button acts on their second row.

Edits only in `pm6-build/parts/**`:
- `.sh-launch-cluster` nowrap (cfg + Start|alt|cog); launchrow nowrap;
  hide F5 keyhint when Start abbr
- `#panel-run .sh-shelf:not(.open) .sh-hacts { display: none }`
- `.sh-htrail` for SESSION / VARIABLES / CALL STACK; Call Stack `hc-abbr` = main
- `.sh-hacts-wide` centered (`flex: 1 1 100%`) when Breakpoints open

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
# adopt Concepts/PMConcept6.html → pm7-tools/base/PM7-base.html + BASE_SHA
cd ../pm7-tools && python3 build_pm7.py --allow-new-base \
  --outdir /tmp/pm7-w6b --out ../PMConcept7.html
```

**Shipped:** sha256 `d36ee48eb800321cda07862e2fac96d7269835dd9a5e69dd7132405f117acaf1`
(3,162,430 bytes). Base sha `5c3142e9107b84663b618fc6f36dc69615c3927aa2a865536ee2cd9ce3df55b7`.
Report: `Concepts/pm7-tools/build_report.json`.

**QA:** HTTP serve; Debug & Run; slow-drag 400↔160 + expand/collapse —
cfg never alone (same line as Start|alt|cog); collapsed shelves hide
hacts; open Call Stack search beside `main` abbr; open Breakpoints acts
centered on second row; cfg full/abbr/symbol OK. (At 160px below the
normal 240px side-panel floor, cog can clip ~12px — not reachable via
the UI resizer min.)
