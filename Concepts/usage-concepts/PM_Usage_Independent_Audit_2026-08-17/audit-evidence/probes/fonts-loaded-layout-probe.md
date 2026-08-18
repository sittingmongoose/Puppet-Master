# GAP 2 — Layout with the real webfonts loaded (u11-prism)

Independent audit, 2026-08-17. Read-only against the concept.

- Harness: `audit-evidence/harness/gap2-fonts-loaded-layout-probe.mjs`
- Raw evidence: `audit-evidence/probes/fonts-loaded-layout-probe.json`
- Screenshots: `audit-evidence/screenshots/gap2-ledger-360-{fontsloaded,fontsblocked,fileorigin}.png`
- Fixture: theme `friendly-dark`, disclosure `advanced` (all widget types mounted), widget-layout
  storage cleared per page, viewport height 1000 — identical to the audit's own G1 cross-room sweep
- Errors / failed loads across all three arms: **0**

## Method

The concept tree was served **read-only** (`fs.createReadStream`, path-confined to the concept
directory) over `http://127.0.0.1:8097`. Each page load blocks on `document.fonts.ready`, then polls
until the face registry stops growing, then waits 1600 ms for the post-swap relayout.

The clipped-text predicate is a **verbatim copy** of `audit-probe.mjs clippedText()` so the numbers are
directly comparable to the numbers already in the audit:

- `(clientWidth === 0 || rectWidth < 1) && scrollWidth > 1` → `collapsed-to-zero-width`
- else `scrollWidth > clientWidth + 1` **and** computed `text-overflow !== 'ellipsis'` →
  `truncated-no-ellipsis` (clipping `overflow-x`) or `spills-outside-box` (`overflow-x: visible`)

Three arms, so that "font-dependent" is a controlled comparison rather than an inference:

| arm | origin | font CDN |
|---|---|---|
| **A** fonts-loaded | `http://127.0.0.1:8097` | reachable |
| **B** fonts-BLOCKED (control) | `http://127.0.0.1:8097` | `fonts.googleapis.com` / `fonts.gstatic.com` **aborted** |
| **C** file origin | `file://…/u11-prism.html` | reachable — reproduces exactly how the audit ran |

Plus the decisive measurement the earlier suite never took: **which font the rasteriser actually used**,
via CDP `CSS.getPlatformFontsForNode`.

---

## Headline: the premise of this gap is REFUTED

> "The file:// probe suite measured clipping with 5 of 8 Google webfonts MISSING, so all clipping
> findings were measured under fallback metrics."

**Not true.** Measured:

| arm | `document.fonts.size` | `document.fonts.status` | actual rasteriser font for `.u11w-attstatus` |
|---|---|---|---|
| A http + fonts | **122** | `loaded` | **JetBrains Mono**, `isCustomFont: true` |
| B http + BLOCKED | **0** | `loaded` | DejaVu Sans Mono, `isCustomFont: false` |
| C **file://** | **122** | `loaded` | **JetBrains Mono**, `isCustomFont: true` |

The `file://` origin loads all 122 font faces exactly as the http origin does — 5 successful font-CDN
responses, `requestfailed: 0`, `non2xx: 0`, `consoleErrors: 0` in both. The audit's own runs were
**already** production-accurate for fonts.

### Why the earlier suite thought 5 of 8 were missing

`document.fonts.check('700 11px "Inter"')` returns `false` for a declared face that the browser has
correctly decided not to download. The `friendly-*` themes reference only four families
(`_shared/themes.css:515–516` plus `:56`):

```
--display-font: 'Cal Sans', 'Nunito', system-ui, sans-serif
--body-font:    'Quicksand', 'Nunito', system-ui, sans-serif
--mono-font:    'JetBrains Mono', ui-monospace, …
```

`Inter`, `Outfit`, `Rajdhani` and `Sora` belong to the `basic-*`, `glass-*` and `retro-*` themes. Under
`friendly-dark` they are never used, so Chromium never fetches them and `check()` correctly reports
`false`. Measured `familyChecks` under arm A:
`{Inter: false, Nunito: true, Outfit: false, Quicksand: true, Rajdhani: false, Sora: false, JetBrains Mono: true, Cal Sans: true}`
— the four `true` values are exactly the four families the theme uses.

The control arm proves the interpretation: with the CDN aborted, `document.fonts.size` drops to **0**
and `check()` returns **`true` for all eight** (nothing is pending, so every query resolves against
system fallbacks). `check()` is a "would this render without a swap" query, not a "did this font load"
query. **`document.fonts.check()` is the wrong instrument, and it inverted the earlier conclusion.**

**Correction to the audit record:** the caveat attached to check (c) —
*"the web fonts … did NOT resolve; the page rendered in fallback system fonts … the clipped-text result
in check (c) is only valid for fallback metrics"* (`independent-probe-results.json`, G1 summary
`d_fontCdn`) — is **withdrawn**. Every G1 clipped-text number was measured with the theme's real
webfonts rasterising the text, as CDP `CSS.getPlatformFontsForNode` confirms node by node.

---

## Re-measured: Ledger room at 360x1000

| | A fonts-loaded | B fonts-BLOCKED | C file:// |
|---|---|---|---|
| `clippedTextTotal` | **74** | **74** | **74** |
| `spillsOutsideBox` | 32 | 32 | 32 |
| `truncatedNoEllipsis` | 0 | 0 | 0 |
| `collapsedToZeroWidth` | 42 | 42 | 42 |
| leaves checked | 401 | 401 | 401 |
| `.u11w-attstatus` visible / overflowing | 42 / **32** | 42 / **32** | 42 / **32** |

**The prior finding holds exactly, and is font-independent.**

- All 32 spills are `.u11w-attstatus` (`spillClassHistogram: { "u11w-attstatus": 32 }`), each
  `scrollWidth 51 > clientWidth 46`, `over: 5`, text `"completed"`, `overflow-x: visible`,
  `text-overflow: clip` — **identical integers in all three arms**.
- Canvas advance for the string `"completed"` at the element's computed font: **51.30 px** with
  JetBrains Mono vs **51.48 px** with the DejaVu Sans Mono fallback. Both monospace, so the advance is
  effectively fixed; the 5 px overflow cannot be a font artifact.
- Root cause is the grid, not the font: `.u11w-attrow` is
  `grid-template-columns: minmax(70px,130px) minmax(60px,110px) minmax(46px,70px) minmax(0,1fr) auto auto`
  (`u11-widgets.css:255`). At 360 px the third track collapses to its **46 px minimum** while the
  9-character monospace status string needs 51 px. `.u11w-attstatus` has no `text-overflow: ellipsis`
  (`u11-widgets.css:259`), so the text spills outside its cell rather than truncating.
- The 42 `collapsed-to-zero-width` items are `.u11w-atttok` cells, `clientWidth: 0` with
  `scrollWidth` 138–264. Measured `parentGridTemplate` at 360 px: `70px 60px 46px 0px 56.4219px 0px` —
  the `minmax(0,1fr)` track is resolved to **0 px** because the three fixed minimums plus the two
  `auto` tracks already exceed the row. `.u11w-atttok` *does* declare `text-overflow: ellipsis`
  (`u11-widgets.css:260`), but at `clientWidth: 0` there is nothing to ellipsise: strings such as
  `"42.1k input · 3.2k output · 18.0k cache read"` render **nowhere at all**. This is silent data loss,
  not truncation.

---

## Cross-room width sweep, 13 rooms x {360, 520, 768}

Clipped-text count per room per width, **A fonts-loaded / B fonts-BLOCKED / C file://**:

| room | @360 A/B/C | @520 A/B/C | @768 A/B/C |
|---|---|---|---|
| overview | 0/0/0 | 0/0/0 | 0/0/0 |
| plans | 0/0/0 | 0/0/0 | 0/0/0 |
| costs | 0/0/0 | 0/0/0 | 0/0/0 |
| accounts | 0/0/0 | 0/0/0 | 0/0/0 |
| free | 0/0/0 | 0/0/0 | 0/0/0 |
| context | 0/0/0 | 0/0/0 | 0/0/0 |
| analytics | 0/0/0 | 0/0/0 | 0/0/0 |
| **ledger** | **74/74/74** | **1/42/1** | 0/0/0 |
| attention | 0/0/0 | 0/0/0 | 0/0/0 |
| cache | 0/0/0 | 0/0/0 | 0/0/0 |
| tools | 0/0/0 | 0/0/0 | 0/0/0 |
| signals | 0/0/0 | 0/0/0 | 0/0/0 |
| authority | 0/0/0 | 0/0/0 | 0/0/0 |

`file://` reproduces the fonts-loaded column in **every one of the 39 cells**
(`fileOriginReproducesFontsLoaded: true`).

### Which clipping findings are font-dependent artifacts, and which are real

| finding | verdict |
|---|---|
| Ledger @360 — 74 clipped (32 `.u11w-attstatus` spills + 42 `.u11w-atttok` zero-width) | **REAL and font-independent.** Identical integers under the real webfont, under a blocked CDN, and over `file://` |
| Ledger @520 — 1 clipped | **REAL under every font condition**, but the magnitude is font-dependent — see the new defect below |
| All other 36 room x width cells | **Clean under every font condition.** No cell went from 0 to non-zero when the real fonts were loaded — i.e. no clipping defect was hidden by fallback metrics |
| Any "fallback-only artifact" | **None.** Zero cells were non-zero under B and zero under A |

**No clipping finding in this audit is a fallback-metrics artifact.** The correction runs the other way:
the audit under-stated one number, and it under-stated it for a different reason than fonts.

---

## New defect found by the control arm

**DEFECT G2-1 — the Ledger room loses 42 data cells instead of 1 when the webfonts fail to load.**

Ledger @520, `collapsedToZeroWidth`:

| arm | count | measured `parentGridTemplate` for `.u11w-attrow` |
|---|---|---|
| A fonts-loaded | **1** | `107.234px 97.2344px 70px 0px 44.1094px 56.4219px` |
| C file:// | **1** | `107.234px 97.2344px 70px 0px 44.1094px 56.4219px` |
| B fonts-BLOCKED | **42** | `128.953px 110px 70px 0px 66.0469px 0px` |

With the webfonts unavailable, the wider fallback advances push the first, second and fifth tracks out
(`107.2 → 129.0`, `97.2 → 110.0`, `44.1 → 66.0`) and drive the **sixth** track to `0px` as well as the
fourth. The `minmax(0,1fr)` token column is `0px` in both cases, but the number of attempt rows whose
token cell renders nothing rises from 1 to **42** — each losing a string such as
`"5.4k input · 300 output"` entirely, with no ellipsis and no overflow indicator.

Why this matters even though the fonts do load in this sandbox: the concept fetches its fonts from
`fonts.googleapis.com` at runtime (`u11-prism.html:9–13`). Any offline launch, blocked CDN, corporate
proxy, or first paint before the swap completes lands the user in arm B. The layout has **no minimum
guaranteed width for the token column**, so its resilience to font substitution is zero. The fix is the
same fix as for the @360 defect — give the `minmax(0,1fr)` track a real minimum and give
`.u11w-attstatus` an `ellipsis` — but the control arm shows the blast radius is 42x larger than the
audit measured.

**DEFECT G2-2 (measurement-method finding, for the audit's own record) — `document.fonts.check()` was
used as a font-availability oracle and produced an inverted result.** It reported "5 of 8 fonts
missing" in a run where all 122 faces were loaded, and reports "8 of 8 fonts present" in a run where
`document.fonts.size === 0`. Any future font assertion in this harness must use
`document.fonts.size` plus CDP `CSS.getPlatformFontsForNode` (`isCustomFont`), both of which are
recorded here per arm.

---

## GAP 2 summary

| id | statement | verdict |
|---|---|---|
| — | "5 of 8 webfonts missing over `file://`; all clipping measured under fallback metrics" | **REFUTED** — `document.fonts.size === 122` on both origins; CDP confirms JetBrains Mono rasterised the clipping nodes |
| — | Ledger @360 `clippedTextTotal 74`, incl. 32 `.u11w-attstatus` with `scrollWidth 51 > clientWidth 46` | **CONFIRMED, and font-independent** — identical in all three arms |
| — | Any clipping finding is a font-dependent artifact | **REFUTED** — 0 fallback-only cells; 0 cells hidden by fallback metrics |
| G2-1 | Ledger @520 loses 42 token cells (vs 1) when the font CDN is unreachable | **NEW DEFECT** |
| G2-2 | `document.fonts.check()` is an invalid font-availability oracle and inverted the earlier conclusion | **NEW (method) DEFECT** |
