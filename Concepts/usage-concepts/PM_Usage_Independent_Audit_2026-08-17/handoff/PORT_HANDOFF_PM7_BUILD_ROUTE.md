# PORT HANDOFF — PM7 side: u11-prism (QwenUsageConcept) → PMConcept7 Usage surface

Audit-only document. Nothing was created, edited, or built. Every claim below was read
out of the real files; file:line references are to the working tree at the time of the audit
(HEAD b550dd68da, branch main). **This is a handoff, not an implementation.**

Source under port: `/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/u11-prism.html`
Target: `/mnt/Cursor/PuppetMaster/Concepts/PMConcept7.html` (build artifact)

---

## 0. Verification of the established facts (three corrections)

| Established fact | Verdict | Evidence |
|---|---|---|
| `Concepts/PMConcept7.html` = 3,619,880 B / 52,939 lines, always a build artifact | **CONFIRMED** | measured; `Concepts/pm7-tools/README.md:3-6` |
| Two stages: `assemble.py` → `PMConcept6.html`, then `build_pm7.py` T01..T20 off `BASE_SHA` | **CONFIRMED** | `pm6-build/assemble.py:24-40`; `pm7-tools/build_pm7.py:45-46` |
| `assemble.py` concatenates **56** parts per `manifest.json` | **WRONG — it is 54** | `manifest.json` has 54 entries; `parts/` holds exactly 54 `*.part.html`; zero ghosts, zero missing; `pm6-build/README.md:31` ("Require 54/54 byte-identical") agrees. Kinds: 30 `carved`, 14 `new-stub-js`, 10 `new-stub-css`. |
| `BASE_SHA` at `build_pm7.py:45-46` pins the base | **CONFIRMED** | `BASE_SHA = "3d82a850dad0e412e3abafe1b3f0717e34071425152efd93d3c49fa6e85408c3"`; `base/PM7-base.html`, `Concepts/PMConcept6.html` and `pm6-build/PMConcept6.assembled.html` are all byte-identical (3,230,711 B) and all hash to that value. The pin is currently green. |
| Usage surface = `parts/18-page-usage.part.html` (98,668 B / 1,151 lines) + `10x-pm6-css-usage.part.html` + `29x-pm6-js-usage.part.html` | **CONFIRMED** | 18: 98,668 B / 1,151 lines (lock records `lines: 1151`); 10x-usage: 2,509 B / 27 lines; 29x-usage: 8,712 B / 196 lines |
| PM7 anchors: `style#pm6-css-usage` :14805, `div.page-usage#panel-usage` :21177, `#pm6UsageGrid` :21447, `window.PM6_USAGE` :22306, `script#pm6-js-usage` :45413 | **ALL FIVE CONFIRMED** exactly | grep on `Concepts/PMConcept7.html` |
| `pm7-tools/README.md:36-44`: a change in `pm6-build/parts/**` is assemble-then-repin, not a T20 edit | **CONFIRMED for the parts themselves** — but see §3.9: this particular port *also* forces edits to `build_pm7.py` (census constants + T17 table). It is not a parts-only change. | `README.md:36-44`; `build_pm7.py:50-52`, `:1467-1549`, `:1601-1604` |
| u11 = 18-file bundle, ~616 KB portable, excluding `_shared/themes.css` + `_shared/base.css` | **CONFIRMED** — 616,109 B across exactly 18 files (1 html + 3 u11 css + 6 u11 js + 8 `_shared`), 9,459 lines | measured; `u11-prism.html:13-19,548-559` |
| u11 registers **16** widget types | **WRONG — 15** | `u11-widgets.js:963-1056` `var TYPES = {…}` has exactly 15 keys: plans, costs, accounts, attention, context, capacity, runs, free, analytics, ledger, operations, tools, cache, signals, authority. No other file calls `PMWidgets.register` / `W.register`. |
| `window.PM6_USAGE` has **9** members and 29x uses it in **10** places | **WRONG — 12 members, 18 call sites, 7 distinct members consumed** | `18-page-usage.part.html:1119-1144`; call-site table in §4.1 |
| **5** Usage widgets already on the PM7 Dashboard | **PARTLY WRONG — 3 static cards + 5 catalog entries** | static: `14-page-dashboard.part.html:428,438,448` = `usage.quota_summary`, `usage.budget_donuts`, `usage.analytics_chart` (PM7 :20236/:20246/:20256). `usage.tool_usage` and `usage.multi_account` exist **only** as Add-Widget catalog buttons (`14-page-dashboard.part.html:492,493`) + `CATALOG` renderers (`29x-pm6-js-dashboard.part.html:2155,2161`). |
| The 13 u11 rooms are "registered through `PM_PAGES.registerSubtab('usage', fn)`" | **WRONG — no such registration exists** | only `dashboard` (`29x-pm6-js-dashboard.part.html:2270`), `orchestrator` (`29x-pm6-js-orchestrator.part.html:1328`), `wizard` (`29x-pm6-js-wizard.part.html:1507`) are registered. Usage relies **entirely** on the `PM_PAGES.go` DOM fallback at `29x-pm6-js-globals.part.html:691-697`. See §4.4. |
| u11's inline boot at `u11-prism.html:8` reads `pm.theme` as one slug | **CONFIRMED**, and it would clobber PM7's split model at `01-head-prelude.part.html:27-44` | see §4.6 |
| Four `fonts.googleapis.com` refs at `u11-prism.html:9-12` | **CONFIRMED** — and PM7 already carries the *same four-line pattern* at `01-head-prelude.part.html:67-72` | see §3.10 |

---

## 1. PART-SLOT CARVING

### 1.1 The hard shape constraints that decide the carving

Read these first; they eliminate most of the obvious plans.

1. **`check_structure` balanced-zero rule for new parts.** `pm6-build/checks/check_structure.py:69-81`:
   a part present in `manifest.json` but absent from `manifest.lock` is checked against
   *expected delta 0 for every counted tag* (`div`, `span`, `style`, `script`, `template`).
   `manifest.lock` "is generated at carve time and is not hand-edited" (`check_structure.py:6-11`).
   → **Every new part must be tag-balanced.** A part cannot open `<style>` and leave it for a
   sibling to close, and part 18 cannot be split at an arbitrary line (it would strand
   `<div class="page page-usage">`, delta +1).
2. **Write-size rule.** `pm6-build/contracts/PARTS.md:58`: any part you rewrite must stay
   ≤ 2,200 lines; larger → `NN-name-a/-b` siblings.
3. **Block census is asserted twice downstream.** `build_pm7.py:50-52`
   (`EXPECTED_BLOCKS = 31`, `EXPECTED_STYLE_BLOCKS = 13`, `EXPECTED_SCRIPT_BLOCKS = 18`,
   checked at `:2191-2197` **before any transform runs**) and again positionally by
   `T17_BLOCKS` (`build_pm7.py:1467-1549`, 32 entries, asserted by index *and* by
   `(kind, tag_id)` at `:1601-1607`).
   → Consequences (1)+(2) force new blocks; new blocks force edits to both.
4. **Part 28 is assembler-regenerated.** `assemble.py:48-64` `regen_settings_part()` rebuilds
   `28-js-settings-data.part.html` from `sidecar/pm_settings_data.json`; if the sidecar's
   re-minified sha matches `_meta.original_minified_sha256` it returns the byte-original line.
   `manifest.json` marks it `"owner": "ASSEMBLER-INJECTED"`,
   `"inject": "regenerate-from-sidecar(sidecar/pm_settings_data.json)"`.
   → **Do not touch part 28 or the sidecar.** No Usage setting is being added by this port; if
   one ever is, it goes in the sidecar, never in the part file.
5. **Part 18 is self-contained** — confirmed: `18-page-usage.part.html:1` opens
   `<div class="page page-usage" id="panel-usage">`, line 2 opens an **unlabeled** `<style>`
   (this is T17 block #14 `usage-grid-css`), the markup follows, an **unlabeled** `<script>`
   closes at `:1149` (T17 block #15 `usage-page-js`), `</div>` at `:1151`.

### 1.2 Parts to REPLACE (3)

| # (manifest idx) | File | Now | After the port |
|---|---|---|---|
| 15 | `10x-pm6-css-usage.part.html` | 27 lines, `<style id="pm6-css-usage">`, small accent block | `_shared/usage-shared.css` (437 L) + `_shared/usage-widgets.css` (188 L) inside the **same** `<style id="pm6-css-usage">` block. ~640 L. Keeps T17 entry #9 `(style, "pm6-css-usage")` valid. |
| 27 | `18-page-usage.part.html` | 1,151 L: page div + unlabeled style + PM6 usage markup + unlabeled script | page div + **unlabeled `<style>`** (keeps T17 #14; carry the u11 room/pane/rail CSS that must stay adjacent to the markup, or a documented stub) + the u11 static markup (`u11-prism.html:348-528` de-templated, plus `:531-546` scope popover + 2 sprouts) + **unlabeled `<script>`** (keeps T17 #15; carries `u11-prism.html:561-1465`, the room router / KPI / scope / export / settings boot) + `</div>`. Target ≤ 2,200 L. |
| 47 | `29x-pm6-js-usage.part.html` | 196 L, PM_DEMO bridge over `window.PM6_USAGE` | rewritten bridge over the u11 API (§4.1). ~250-300 L. Keeps `<script id="pm6-js-usage">` → T17 entry #27 valid. |

### 1.3 New part slots to CREATE (6), in manifest order

CSS band (`insertion: "immediately before </head> (between parts 10 and 11); global FIRST, then listed order"`),
inserted directly after index 15 so the new block lands immediately after `pm6-css-usage`:

| new idx | File | Block id | Content | Lines |
|---|---|---|---|---|
| 16 | `10x-pm6-css-usage-u11.part.html` | `pm6-css-usage-u11` | `u11-widgets.css` (389) + `u11-rundetail.css` (146) + `u11-context.css` (197) + the `u11-prism.html:20-342` inline `<style>` body (323) | ~1,060 |

JS band (`insertion: "after part 29; globals FIRST, demo-engine SECOND, then listed order"`),
inserted so load order is data → engine → types → detail → bridge (the u11 `<script src>` order at
`u11-prism.html:548-559` minus the dropped files):

| new idx | File | Block id | Content | Lines |
|---|---|---|---|---|
| 48 | `29x-pm6-js-usage-data-a.part.html` | `pm6-js-usage-data-a` | `_shared/usage-data.js` (932) + `u11-time.js` (193) — provides `window.USfmt`, `window.USrender`, `window.U11time` | 1,127 |
| 49 | `29x-pm6-js-usage-data-b.part.html` | `pm6-js-usage-data-b` | `u11-data.js` (1,416) — provides `window.U11` | 1,418 |
| 50 | `29x-pm6-js-usage-widgets-a.part.html` | `pm6-js-usage-widgets-a` | `_shared/usage-widgets.js` (1,007) — the `PMWidgets` canvas engine | 1,009 |
| 51 | `29x-pm6-js-usage-widgets-b.part.html` | `pm6-js-usage-widgets-b` | `u11-widgets.js` (1,325) — the 15-type registry + renderers, `window.U11W` | 1,327 |
| 52 | `29x-pm6-js-usage-detail.part.html` | `pm6-js-usage-detail` | `u11-rundetail.js` (460) + `u11-context.js` (564) + the sprout helper distilled from `_shared/menu.js` (215, renamed — §4.5) | ~1,250 |

`29x-pm6-js-usage.part.html` (idx 47 → renumbers to 53) stays the **last** usage script so the
bridge sees every global. Note the data/widgets pairs are split purely to honour PARTS.md:58
(932+193+1,416 = 2,541 L and 1,007+1,325 = 2,332 L both exceed 2,200); each sibling is a complete,
balanced `<script>…</script>`, so `check_structure` prints its advisory and passes on balanced-zero.

Two u11 sources get **no part of their own**:
* `_shared/icons.js` + `_shared/usage-icons.js` + `u11-icons.js` (107 glyphs) → merged additively
  into the existing `PM_ICONS` hoist in `29x-pm6-js-globals.part.html` (definition at `:9`,
  hoist at `:59`). 60 of the 107 names already exist in PM7; 47 are new. Use the established
  additive idiom from `29x-pm6-js-cozy-shelves.part.html:109`
  (`Object.keys(add).forEach(function (k) { if (!window.PM_ICONS[k]) window.PM_ICONS[k] = add[k]; })`)
  so no existing glyph is redefined. **No new block.**
* `_shared/usage-chrome.js` → **not ported at all** (§5).

### 1.4 `manifest.json` registration shape (verbatim from the real file)

New CSS part — copy the shape of the real `10x-pm6-css-usage` entry:

```json
{
  "file": "10x-pm6-css-usage-u11.part.html",
  "kind": "new-stub-css",
  "name": "pm6-css-usage-u11",
  "marker": null,
  "marker_rule": "stub",
  "owner": "usage",
  "insertion": "immediately before </head> (between parts 10 and 11); global FIRST, then listed order",
  "expected_shape": "<style id=\"pm6-css-usage-u11\">…</style>"
}
```

New JS part — copy the shape of the real `29x-pm6-js-usage` entry:

```json
{
  "file": "29x-pm6-js-usage-data-a.part.html",
  "kind": "new-stub-js",
  "name": "pm6-js-usage-data-a",
  "marker": null,
  "marker_rule": "stub",
  "owner": "usage",
  "insertion": "after part 29; globals FIRST, demo-engine SECOND, then listed order",
  "expected_shape": "<script id=\"pm6-js-usage-data-a\">…</script>"
}
```

Rules that follow from the real file: `new-stub-*` entries carry `marker: null`,
`marker_rule: "stub"`, no `carved_from_lines`, and **do** carry `insertion` + `expected_shape`;
`carved` entries carry a unique `marker`, a `marker_rule`, `carved_from_lines`, and `inject`.
Do not add `carved_from_lines` to a new part. `manifest.json` top-level keys are
`version`, `generated`, `source`, `working_sha256`, `assembly`, `parts` — leave
`working_sha256` alone unless you also re-baseline the working copy per
`pm6-build/README.md:26-41` (and **never** run `carve.py --force` against the repo `parts/`,
`README.md:53-58`).

`manifest.lock` needs **no** edit: new files simply have no lock entry and take the
balanced-zero path. `manifest.lock.global.deltas` must stay `{div:0, span:0, style:0, script:0,
template:0}` and `body_open_count: 1` — the `<template id="usage-page">` is being dropped
(§4.7) so `template` stays 0 either way.

---

## 2. THE BUILD / REPIN SEQUENCE

All commands from the repo root `/mnt/Cursor/PuppetMaster`.

```bash
# 0. iterate without shipping (parallel-safe; --out is refused with g3, assemble.py:76-79)
python3 Concepts/pm6-build/assemble.py --gate g2 \
        --out /tmp/.../scratchpad/PMConcept6.try.html

# 1. hard gate, in place
python3 Concepts/pm6-build/assemble.py --gate g2

# 2. ship gate — on success copies assembled -> Concepts/PMConcept6.html
python3 Concepts/pm6-build/assemble.py --gate g3

# 3. repin the PM7 base (byte-identical copy, no newline/encoding change)
cp Concepts/PMConcept6.html Concepts/pm7-tools/base/PM7-base.html
sha256sum Concepts/pm7-tools/base/PM7-base.html

# 4. edit Concepts/pm7-tools/build_pm7.py
#    :46  BASE_SHA           -> the sha printed in step 3
#    :50  EXPECTED_BLOCKS    31 -> 37   (+1 style, +5 script)
#    :51  EXPECTED_STYLE_BLOCKS  13 -> 14
#    :52  EXPECTED_SCRIPT_BLOCKS 18 -> 23
#    :1467-1549 T17_BLOCKS   insert 6 entries at the right positions (see §3.9)

# 5. rebuild PM7
python3 Concepts/pm7-tools/build_pm7.py \
        --outdir /tmp/.../scratchpad/pm7 \
        --out Concepts/PMConcept7.html --report

# 6. governance
python3 scripts/pm-plans-verify.py run-gates
```

What each step actually proves:

* **`--gate g2`** — `assemble.py:33-40`: every one of the nine checks is *hard* at g2
  (`check_original`, `check_structure`, `check_js`, `check_css`, `check_ids`, `check_hooks`,
  `check_settings_data`, `check_no_emoji`, `check_vocab`). Note g1 downgrades `vocab` and
  `no_emoji` to report-only — **do not stop at g1 and call it green.** Also prints the
  assembled sha and part count.
* **`--gate g3`** — g2 plus `SHIP.write_text(out)` (`assemble.py:139-141`): this is the only
  sanctioned writer of `Concepts/PMConcept6.html`. Nothing else may write that file.
* **step 3 (copy)** — restores the documented invariant that `base/PM7-base.html` is
  byte-identical to the shipped `Concepts/PMConcept6.html` (`pm7-tools/README.md:52-58`).
  `build_pm7.py` reads the base with universal newlines, so raw and normalized shas coincide
  for an LF file — keep it LF (the repo is on an NFS4 share with 1,508 CRLF files in HEAD;
  check `git diff --ignore-cr-at-eol` before believing any diff).
* **step 4 (`BASE_SHA`)** — without it `build_pm7.py:2166-2171` prints
  `FATAL: base sha mismatch` and returns 2. `--allow-new-base` exists but records the actual
  sha and skips the pin — use it only for a scratch dry run, never for the shipped artifact.
* **step 5 (`--report`)** — in order: the 31→37 block census assertion (`:2191-2197`, aborts
  the whole build before T01), then T01..T20 each with mandatory pre/post assertions
  (any `need()` failure aborts), then the four static gates
  (`gate_brace_balance` `:2046`, `gate_css_vars` `:2089`, `gate_js_syntax` `:2100`,
  `gate_no_emoji` `:2130`, which re-runs `pm6-build/checks/check_no_emoji.py` read-only on the
  output), then `build_report.json` — the authoritative transform/gate receipt.
* **step 6** — `pm6-build/README.md:44-49`: the `manifest.json` sha changed, so the governance
  seal needs an evidence-hash refresh. Do **not** hand-edit `Plans/.evidence/**`.
* Also from `pm6-build/README.md:44-47`: a no-regression pass — rebuild PM7 into a scratch
  outdir first and diff against the committed `Concepts/PMConcept7.html` — so you can see
  exactly what the port changed and nothing else.

---

## 3. EVERY GATE THAT WILL FIRE

Ordered by when it bites. **Three of these are hard fails on a naïve port** (3.4 css vars,
3.7 vocab, 3.9 census) and one is a design fork (3.5 raw hex).

### 3.1 `check_original` — `pm6-build/checks/check_original.py:1-24`
Hashes `Concepts/PMConcept4.html` against `checks/pmconcept4.sha256`. **Not affected** by
this port (PMConcept4.html present, 1,676,472 B). Just never touch that file.

### 3.2 `check_structure` — `pm6-build/checks/check_structure.py`
* global deltas vs `manifest.lock.global.deltas` (all zero) — `:44-49`
* single `<body>` — `:51-54`
* `</html>` last — `:56-59`
* per-part deltas; **parts with no lock entry must be balanced-zero on every counted tag** — `:69-81`

What trips it: any of the six new parts leaving a tag open; splitting part 18 mid-`<div>`;
the dropped `<template id="usage-page">` if you keep the `<template>` open in one part and
close it in another. Also note `SCRIPT_BODY` stripping at `:25,29-33` — `div`/`span`/`template`
are counted **outside** script bodies only, but `style`/`script` are counted on the **raw**
text, so a literal `'<script'` inside a ported JS string would skew the script delta.
Nothing in the u11 bundle contains one (checked).

### 3.3 `check_ids` — `pm6-build/checks/check_ids.py:14-33`
Rule: no **new** duplicate `id="…"`; a baseline dup may not grow.
`checks/baseline_dup_ids.json` contains exactly one entry: `{"' + nodeId + '": 2}`
(a JS template artifact) — so effectively **zero real duplicate ids are tolerated** in a
52,939-line document.

Simulated the merge (assembled base + the full u11 payload). u11 contributes **35 static
`id="…"` values**:

`app, glassBg, projectMenu, projectMenuWrap, sbChips, sbRM, sbWRead, sbWidth, themeMenu,
themeMenuLabel, themeMenuWrap, toastStack, usCenter, usCenterInner, usage-page,
u11BannerSlot, u11Disc, u11DiscCap, u11Export, u11ExportSprout, u11Fresh, u11FreshTxt,
u11HeadSub, u11Kpis, u11MoreGrp, u11Pop, u11PopFoot, u11PopList, u11PopScrim, u11PopX,
u11Refresh, u11ScopeChip, u11Settings, u11SheetSprout` (+ the `"' + run.id + '"` template artifact).

**Collisions with the PM6/PM7 base — exactly 5:**

| id | u11 origin | PM7 origin | Resolution |
|---|---|---|---|
| `projectMenu` | `_shared/usage-chrome.js:168` | `11-html-shell-open.part.html:15` | not ported (chrome dropped) |
| `projectMenuWrap` | `usage-chrome.js:166` | `11-html-shell-open.part.html:7` | not ported |
| `themeMenu` | `usage-chrome.js:173` | `11-html-shell-open.part.html:77` | not ported |
| `themeMenuWrap` | `usage-chrome.js:171` | `11-html-shell-open.part.html:70` | not ported |
| `themeMenuLabel` | `usage-chrome.js:172` | `11-html-shell-open.part.html` (theme select label) | not ported |

**All five come from `_shared/usage-chrome.js`, which §5 drops.** So with the chrome dropped,
`check_ids` passes. The 20 `u11*`-prefixed ids and `usage-page` are unique in the merged
document. The `usage-page` x2 count in the simulation is an artifact of the template id plus a
`getElementById('usage-page')` reference in the dropped chrome — it disappears with the chrome.

Secondary risk `check_ids` will **not** catch: 9 `getElementById` targets the u11 payload
expects that the PM7 base does not provide — `app`, `pmEmbedCss`, `sbChips`, `sbRM`,
`sbWRead`, `sbWidth`, `toastStack`, `usCenterInner`, `usage-page`. All of them are chrome
(`#app`, the width harness, the status-bar chip rail, the toast stack) or the template. Each
one is a silent-null runtime break, not a build break. `sbChips` in particular is a **live
dependency of the ported code**: `u11-prism.html:594`
`window.U11Context.mountTriggers($('sbChips'))` — see §4.5.

### 3.4 `check_css` — `pm6-build/checks/check_css.py` — **HARD FAIL, 19 undefined vars**
Three sub-rules:
* per-`<style>`-block brace balance (`:26-35`). Simulated: the ported CSS is `{` × 953 / `}` × 953 — **balanced**.
* **every `var(--x)` used must have a definition somewhere in the document** (`:37-44`).
  `BASELINE_UNDEFINED = set()` at `:18` — the allowlist was pruned to empty at W2 and must not
  be extended without updating `contracts/TOKENS.md`.
* new `pm6-css-*` blocks may not use raw hex outside `[data-theme…]` scope (`:49-78`) — §3.5.

I diffed the custom properties **used** by
`u11-widgets.css` (36) + `u11-context.css` (40) + `u11-rundetail.css` (35) +
`_shared/usage-shared.css` (109) + `_shared/usage-widgets.css` (44) — 137 distinct, plus 52
more from the `u11-prism.html:20-342` inline style — against what
`pm6-build/parts/02-css-tokens.part.html` **defines**, and again against the whole assembled
base and the built PM7.

**Undefined vs `02-css-tokens.part.html` alone (22):**
`--accent-cyan, --cat, --num-font, --pm-motion-k, --pm6-glass-plate, --tone-, --tone-err-text,
--tone-info-text, --tone-mute-text, --tone-ok-text, --tone-purple-text, --tone-warn-text,
--us-fill-hot, --us-fill-info, --us-fill-mute, --us-fill-ok, --us-fill-purple, --us-fill-warn,
--us-mlb, --us-mpc, --us-wlb, --wf`

Three of those (`--cat`, `--pm6-glass-plate`, `--wf`) resolve elsewhere in the document, so the
list that **actually hard-fails the gate** — identical for `check_css` and for
`build_pm7.py`'s `css_vars_defined` (the base itself has **zero** pre-existing undefined vars,
so `base_undef` is empty and every one of these counts as new) — is **19**:

| var | used by | why it is undefined | fix |
|---|---|---|---|
| `--tone-ok-text` | u11-widgets.css, u11-rundetail.css, usage-shared.css | defined only in `_shared/themes.css:664-666+` (per theme, not ported) | restate per theme in `02-css-tokens.part.html` |
| `--tone-warn-text` | u11-widgets.css, u11-rundetail.css, usage-shared.css, prism inline | same | same |
| `--tone-err-text` | all 5 ported CSS files + prism inline | same | same |
| `--tone-info-text` | u11-widgets.css, usage-shared.css | same | same |
| `--tone-mute-text` | usage-shared.css | same | same |
| `--tone-purple-text` | usage-shared.css | same | same |
| `--us-fill-ok` | usage-shared.css:165 | themes.css only | same |
| `--us-fill-warn` | usage-shared.css:166 | themes.css only | same |
| `--us-fill-hot` | usage-shared.css:167 | themes.css only | same |
| `--us-fill-info` | usage-shared.css:168 | themes.css only | same |
| `--us-fill-mute` | usage-shared.css:157 | themes.css only | same |
| `--us-fill-purple` | usage-shared.css | themes.css only | same |
| `--num-font` | u11-widgets.css, prism inline | `themes.css:43,120,178` (`'Inter'` / `'JetBrains Mono'` per theme) | alias to PM7's `--mono-font` / `--body-font` per theme |
| `--pm-motion-k` | usage-shared.css | `themes.css:34,136` (per-theme motion multiplier) | restate per theme, or hard-set `1` |
| `--accent-cyan` | `u11-context.css:46`, used **with** a fallback `var(--accent-cyan, var(--accent-blue))` | nothing defines it anywhere | define it, or collapse to `var(--accent-blue)` |
| `--us-mlb` | `usage-shared.css:241`, fallback `30px` | defined only in `_shared/usage-context.css`, which `u11-prism.html` never loads | define in the ported token block or drop the var |
| `--us-mpc` | `usage-shared.css:241`, fallback `40px` | same | same |
| `--us-wlb` | `usage-shared.css:245`, fallback `96px` | same | same |
| `--tone-` | **a comment**, `_shared/usage-shared.css:161`: `…the identical 'var(--tone-*)' attribute strings…` | neither gate strips CSS comments before harvesting `var(…)` (`check_css.py:38`, `build_pm7.py:2090` both scan raw text) | **reword the comment** — do not add a `--tone-:` definition |

The gate does **not** understand `var(--x, fallback)`; five of the 19 (`--accent-cyan`,
`--us-mlb`, `--us-mpc`, `--us-wlb`, and `--us-fill-mute`) are fallback-guarded and visually
harmless, but they still fail the gate.

**Good news, verified:** every *other* token the ported CSS needs already resolves. The base
defines `--radius-pill`, `--accent-soft`, `--glass-hairline`, `--pm6-sb-thumb`,
`--glass-tint-rgb`, `--glass-alpha`, `--display-font`, `--mono-font`, `--motion-fast`,
`--ease-out`, `--surface-elevated`, `--border-light`, `--text-muted`, `--accent-primary`,
`--accent-blue`, `--accent-magenta`, `--graph-passed`, `--graph-failed`, `--accent-warning`.
The `--us-*` layout tokens, the base `--tone-ok/warn/err/info/mute/purple` (which
`usage-shared.css:91-98` defines as **aliases of PM-native tokens**), the `--mo-*` motion
tokens and `--ser-*` chart series all ship inside `_shared/usage-shared.css` itself, which is
being ported — so they arrive with the payload. And a class-level dependency scan found only
three classes the payload needs that live outside the ported CSS: `.pm-ico`, `.sm`, `.vs-`
— and `.pm-ico` / `.pm-ico.sm` / `.pm-hidden` **already exist in PM7** at
`10x-pm6-css-cozy-shelves.part.html:57-58,72`. `base.css` is genuinely droppable.

### 3.5 `check_css` raw-hex rule — a design fork, not a bug
`check_css.py:49-78` applies the raw-hex ban **only to `<style>` blocks whose id starts with
`pm6-css`**. The ported CSS contains **13 raw-hex declarations outside `[data-theme…]` scope**:

`color: var(--accent-blue, #4c8dff)`, `color: #ff4d6d`, `color: #2dd4bf`, `color: #a3e635`,
`color: #ff8c3a`, `color: #a78bfa`, `--u11-pink: #ff4d6d`, `--u11-orange: #ff8c3a`,
`--u11-lime: #a3e635`, `--u11-teal: #2dd4bf`, `--u11-blue: var(--accent-blue, #4c8dff)`,
`--u11-purple: #a78bfa`, `--u11-magenta: var(--accent-magenta, #ff7ac8)`

Consequence: putting that CSS in `<style id="pm6-css-usage">` / `id="pm6-css-usage-u11">`
**fails `check_css`** with 13 findings. Putting it in part 18's **unlabeled** `<style>` block
(the existing `usage-grid-css`, which has no id and is therefore exempt — that is exactly why
the current usage grid CSS lives there) passes. Two honest options:

* **(A) preferred** — route the 13 declarations to PM-native tokens (`--accent-*`,
  `--graph-*`, `--tone-*`) so the `pm6-css-*` blocks stay hex-clean, and keep the u11 palette
  as `[data-theme…]`-scoped overrides.
* **(B) escape hatch** — park those specific rules in part 18's unlabeled block. Works, but it
  re-creates the very split (`usage-accent-css` vs `usage-grid-css`) the port was meant to
  simplify, and it dodges rather than satisfies the design-system rule.

### 3.6 `check_js` — `pm6-build/checks/check_js.py`
Extracts every inline `<script>` body and runs `node --check` (`:24-42`). The u11 payload is
ES5-style IIFE code and parses standalone. Two things to get right:
* each new part must be **one complete script block**; a body split across two `<script>` tags
  breaks the IIFE and `node --check` fails.
* `check_js` skips blocks with `src=` (`:26-27`) — irrelevant here, PM7 is single-file and every
  `<script src>` at `u11-prism.html:548-559` is being inlined.
`build_pm7.py`'s `gate_js_syntax` (`:2100-2127`) repeats the same check on the output and skips
non-JS `type=` blocks (the T11 `application/json` settings-data block).

### 3.7 `check_vocab` — `pm6-build/checks/check_vocab.py` — **HARD FAIL at g2/g3, 46 matches**
Gate regexes at `:18-26`: `\btiers?\b`, `\bphases?\b`, `Pass [123]\b`, `Compile Settings`,
`platform_specs`, `Tauri`, `Gemini CLI` (case-insensitive for the first two), with the
exclusions at `:11-16`. Simulated on the ported payload: **46 matches**.

| file | `tiers` | `phases` | `Gemini CLI` |
|---|---|---|---|
| `u11-data.js` | 8 | 14 | **2** (`u11-data.js` line with `id: 'conn:google-gemini-cli', label: 'Gemini CLI profile'`) |
| `_shared/usage-shared.css` | 7 | — | — |
| `u11-widgets.js` | 1 | 4 | — |
| `_shared/usage-widgets.js` | 3 | — | — |
| `u11-prism.html` | 1 | 2 | — |
| `u11-rundetail.js` | — | 2 | — |
| `u11-widgets.css` | 1 | — | — |
| `_shared/usage-data.js` | 1 | — | — |
| **total** | **22** | **22** | **2** |

Most `tier`/`phase` hits are prose in comments ("three type tiers", "instant tier",
"data tier: never scaled", "Goal phase", "PlanningRun topic") plus data labels
(`kind: 'goal_phase'`, `phases: [{label: 'Check', …}]`) — all rewritable. The two `Gemini CLI`
hits are **data identity** (`conn:google-gemini-cli` / `'Gemini CLI profile'`) and need a
vocabulary decision from the owner, not a blind rename: `EXCLUSIONS` may not be extended
without a PARTS.md update, and `check_vocab` is report-only at g1 but **hard at g2 and g3**.

### 3.8 `check_no_emoji` — **PASSES with 5 warning classes**
`check_no_emoji.py:15-21`: banned ranges U+1F000-1FAFF, U+FE0F, U+2600-26FF, U+2700-27BF,
U+2B00-2BFF; allowlist `→←✓✕✖➜⚠▾▸▲▼●⋮↳↧` at `:13`; anything ≥ U+2190 outside the
allowlist is a warning. Simulated on the ported payload: **zero banned glyphs**, and these
warnings:

`≈ U+2248` ×3, `≤ U+2264` ×4, `↔ U+2194` ×3, `↺ U+21BA` ×1, `− U+2212 MINUS SIGN` ×2.

Exit 0 — the gate passes. But two of them (`↔`, `↺`) and `−` are flagged by the *other*
policy checker (§3.10), and the project's hard rule is inline SVG only, never glyph icons.
`↺` in particular reads as an icon. Replace `↔`/`↺` with SVG; `≈`, `≤`, `−` are legitimate
mathematical typography and can stay as warnings (the PM6 base already carries warnings).

### 3.9 `check_hooks` + `check_settings_data`, then the PM7 census gates
* **`check_hooks`** (`checks/check_hooks.py`) — collects MUST-EXIST hooks from
  `contracts/HOOKS.md` and requires the exact baseline id count, then requires every inline
  `on*=` handler symbol to be defined in some `<script>` (`:96-109`). The only Usage entries in
  HOOKS.md are `#panel-usage` (`HOOKS.md:28`, page root) and `#tab-usage` (`:34`), plus the
  `.tab` / `.tab.dragging` selector probes (`:123-124,186-187`) satisfied by other parts.
  **None of `pm6UsageGrid`, `pm6UsageRefresh`, `pm6UsageCd`, `pm6UsageLedger*` is a MUST-EXIST
  hook** — they can be retired freely. **`#panel-usage` must survive, exactly once.**
  Inline handlers: the u11 markup has exactly one, `onload="this.onload=null;this.rel='stylesheet'"`
  at `u11-prism.html:11` — dropped with the font CDN, so nothing to define.
* **`check_settings_data`** (`checks/check_settings_data.py`) — sidecar parses, has
  `categories`+`settings`, every `settings[].tier ∈ {simple, advanced}`, and the assembled file
  contains **exactly one** `window.PM_SETTINGS_DATA = {`. This port adds no setting, so it is
  a no-op — **as long as you never write the string `window.PM_SETTINGS_DATA = {` into a
  ported file** (it would make the count 2 and hard-fail).
* **`build_pm7.py` block census** (`:50-52` checked at `:2191-2197`) — **the first thing that
  will abort a naïve build.** The plan in §1.3 adds 1 style + 5 script blocks:
  31/13/18 → **37/14/23**. Without the constant bump: `FATAL: block census {...} != expected
  (31/13/18)`, return code 2, before T01 runs.
* **`T17_BLOCKS`** (`:1467-1549`) — a **positional** 32-entry table asserted at `:1601-1607`
  by both length and `(kind, tag_id)`. Current usage entries and their 1-based positions:
  #9 `(style, "pm6-css-usage")`, #14 `(style, "")` usage-grid-css, #15 `(script, "")`
  usage-page-js, #27 `(script, "pm6-js-usage")` usage-bridge-js.
  The plan keeps all four in place and inserts: `pm6-css-usage-u11` at #10, and the five new
  script blocks between #27 and #28 (i.e. immediately after `usage-bridge-js`, matching the
  manifest order) → table length 32 → **38**. Failure mode if forgotten:
  `T17: block census 38 != table 32`, or `T17: block N is style#pm6-css-usage-u11, table says
  style#pm6-css-chat`.
* **`gate_brace_balance`** (`:2046-2079`) — per-style-block, string-aware (skips quoted
  literals), comment-stripped. The ported CSS is already balanced (953/953).
* **`gate_css_vars`** (`:2089-2097`) — the 19 vars in §3.4. It is **baseline-relative**:
  `new_undef = undef - base_undef`, and the current base has `base_undef == ∅`, so all 19 are
  new and `"pass": false`.
* **`gate_js_syntax`** (`:2100-2127`) and **`gate_no_emoji`** (`:2130-2137`) as covered above.

### 3.10 `scripts/pm-gui-asset-policy.py` (read only) — **currently not applicable to Concepts/**
`SOURCE_ROOTS` at `:15-30` is `ui, src, app, apps, crates, frontend, web, wasm, native,
assets, resources, tests, fixtures, snapshots` — resolved relative to the repo root
(`:120-128`). Of those, **only `tests/` exists** in this repo, and `Concepts/` is not a source
root. So the checker never sees `Concepts/usage-concepts/**` or `Concepts/PMConcept7.html`
unless you pass `--source-root Concepts`. Its own report would say
`status: not_applicable / policy_state: pending_no_gui_source_yet` if no GUI trigger files are
found (`:413-425`).

If it were ever pointed at the concept:
* `REMOTE_ICON_RE` (`:74-78`) matches `fonts.googleapis` and `fonts.gstatic` explicitly.
  All four refs at `u11-prism.html:9-12` (2 × `preconnect`, 1 × `preload`, 1 × `noscript`)
  would each raise `no_network_or_cdn_icons` (`:216-224`).
* `codepoint_is_pictographic` (`:169-181`) covers U+2190-21FF, U+2300-23FF, U+2460-24FF,
  U+25A0-25FF, U+2600-27BF, U+2B00-2BFF, U+1F000-1FAFF, and `PSEUDO_ICON_CHARS` (`:94-110`)
  includes U+2212 MINUS SIGN. So `↔`, `↺` and `−` from §3.8 would each raise
  `no_emoji_or_unicode_pseudo_icons`. Note this is **stricter than `check_no_emoji`**, whose
  allowlist blesses `→←▾▸▲▼●⋮` — the two policies disagree, and the asset policy is the
  product-facing one. Design to the stricter rule.
* `ALLOWED_SVG_NAMESPACE_URLS` (`:79-84`) whitelists only the w3.org SVG/xlink namespaces —
  which is exactly what all 107 ported inline SVG glyphs use. They are clean.

**The four font links must not be ported at all**, and not because of the policy — because
**PM7 already carries the identical pattern** at `01-head-prelude.part.html:67-72`
(2 × `preconnect`, `preload` with `onload="this.onload=null;this.rel='stylesheet'"`, `noscript`
fallback). Porting u11's would duplicate it.

**The 8 font families — what replaces them.** u11 requests
`Cal Sans, Inter, JetBrains Mono, Nunito, Outfit, Quicksand, Rajdhani, Sora`; PM7 requests
`Cal Sans, Inter, Nunito, Orbitron, Quicksand, Rajdhani`. Delta: u11 adds **JetBrains Mono,
Outfit, Sora** and does not use Orbitron. **Verified: not one of the 8 families is named
anywhere in the ported files** — all 8 literals live exclusively in `_shared/themes.css`
(Inter ×15, Sora ×6, JetBrains Mono ×6, Outfit ×5, Quicksand ×5, Rajdhani ×4, Nunito ×7,
Cal Sans ×2), which is not ported. The ported CSS only ever says
`var(--display-font)`, `var(--body-font)`, `var(--mono-font)`, `var(--num-font)`.
Therefore:

| u11 family | replaced by |
|---|---|
| Cal Sans, Nunito, Quicksand, Rajdhani, Inter | already in PM7's `--display-font` / `--body-font` per theme (`02-css-tokens.part.html:36-37,324-325,514-515` etc.) — nothing to do |
| JetBrains Mono | PM7's `--mono-font` = `ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace` (`02-css-tokens.part.html:67`) — a system stack, no webfont |
| Outfit, Sora | **dropped**; the ported CSS never names them. They were themes.css display faces for theme families PM7 renders with Cal Sans / Orbitron / Inter. |
| (the missing token) | `--num-font` must be **defined** in `02-css-tokens.part.html` per theme, aliased to `--mono-font` (retro/basic/glass, matching themes.css's JetBrains-Mono intent) or `--body-font` (friendly, matching themes.css's Inter) |

Net: **zero new webfont families, zero new network requests.**

### 3.11 T20 `LEGACY_SURFACE_DND_PATTERN` anchor fragility
`pm7-tools/README.md:42-44` warns that T20's `LEGACY_SURFACE_DND_PATTERN` is anchored on the
editor-tab drag-reorder comment in `25-js-terminal-demo.part.html`, and renaming that comment
aborts the build with `"expected one legacy surface DnD band, found 0"`. Verified in source:

```
# home_workspace_source.py:4695-4699
LEGACY_SURFACE_DND_PATTERN = (
    r"\n[ \t]*// Setup Drag & Drop for Panels.*?"
    r"\n[ \t]*/\* -+ editor tab drag-reorder \(delegated\)"
)
LEGACY_SURFACE_DND_ANCHOR = "/* ---------- editor tab drag-reorder (delegated) ----------------------"
```

consumed at `build_pm7.py:1868-1872` with `need(len(legacy_matches) == 1, …)`.
This port does not touch part 25, so the anchor holds — **but the pattern is `re.S`
(dot-matches-newline) and non-greedy across a band that starts at
`// Setup Drag & Drop for Panels`**. If anything ever introduces a second
`/* ---- editor tab drag-reorder (delegated)` comment anywhere later in the document
(a plausible accident if the Usage widget DnD is documented in the same words), the
non-greedy match still finds one band but the count assertion becomes order-dependent.
**Do not use the phrase "editor tab drag-reorder (delegated)" in any ported comment.**
T20's other anchors also matter: `doc.count("<body>") == 1`,
`doc.count('<style id="pm6-css-dashboard">') == 1`,
`doc.count('<script id="pm6-js-dashboard">') == 1` (`:1862-1866`) — all untouched by the plan.

### 3.12 The transform anchors this port *will* break — **T08**
Not a "gate" but it aborts the build just as hard. `t08_cooldown_dom_gating`
(`build_pm7.py:645-671`) rewrites the Usage cooldown with **three `replace_exact_once`
anchors in the surface being replaced**:

| constant | anchor text | lives at |
|---|---|---|
| `T08_USAGE_TICK_OLD` (`:547-555`) | `var cooldown = { seconds: 2472, external: false };` + `function tickCooldown() {…#pm6UsageCd…}` | `18-page-usage.part.html:1063-1069` |
| `T08_SETCOOLDOWN_OLD` (`:576-580`) | `var el = UP.querySelector('#pm6UsageCd');` / `if (el) el.textContent = fmtCd(sec);` | `18-page-usage.part.html:1132-1133` |
| `T08_USAGE_PAGECHANGED_OLD` (`:593-599`) | the whole `pd.on('page.changed', …U().injectIcons()…)` block | `29x-pm6-js-usage.part.html:176-180` (byte-exact match) |

plus post-assertions `doc.count("if (cooldown.seconds === 0) { renderAccounts();") == 1`
(`18-page-usage.part.html:1070`), `doc.count("pm7CdWrite") == 3`,
`doc.count("pm7FlushCooldown") == 4` (`:660-664`).

Replacing part 18 and rewriting 29x-pm6-js-usage **destroys all three anchors** →
`T08 usage tickCooldown: expected exactly 1 occurrence of anchor, found 0`. T08 must be
either retargeted onto the u11 equivalent (u11 has no `#pm6UsageCd`; the nearest concept is
the freshness chip `#u11Fresh` / `#u11FreshTxt` and `U11time`) or explicitly retired with an
evidence-recorded skip in the style of T12/T13/T14. Related: `T14` pre-asserts
`doc.count("if (typeof p.cooldownSec === 'number') U().setCooldown(p.cooldownSec);") == 1`
(`build_pm7.py:1048-1049`) — that is `29x-pm6-js-usage.part.html:143`, also destroyed.
`T10` wraps `on('usage.tick', …)` in the **dashboard** block (`:857-860`), which this port
does not touch. `T01`'s frozen dead-selector list contains no `.pm6-usage-*` entries (only
`.orch-*-usage-link`), so T01 is safe **provided the ported CSS does not accidentally
re-introduce or rename a frozen selector** (`t01` pre-asserts every frozen selector is still
present, `:138-141`).

---

## 4. SEAM-BY-SEAM INTEGRATION MAP

### 4.1 Retiring `window.PM6_USAGE` and rewriting `29x-pm6-js-usage.part.html`

`window.PM6_USAGE` is defined at `18-page-usage.part.html:1119-1144` with **12 members**
(`refresh, rerender, exportJson, appendLedger, injectIcons, cooldown, tickCooldown,
setCooldown, ledgerFilter, spinRefresh, cfg, data`); PM7's T08 adds a 13th,
`pm7FlushCooldown`. `29x-pm6-js-usage.part.html` reaches it through
`function U() { return window.PM6_USAGE || null; }` (`:13`) and consumes **7 distinct members
across 18 call sites**:

| # | 29x line | expression | u11 replacement |
|---|---|---|---|
| 1 | 24 | `u.spinRefresh()` | the `#u11Refresh` handler in the ported boot (`u11-prism.html:1380-1390`): spin the button, then `HANDLES.forEach(h => h.rerender())` + `U11W` freshness repaint |
| 2 | 29 | `u.exportJson('snapshot')` | the u11 export sprout (`u11-prism.html:1289-1370`) — `#u11Export` → format/scope picker → `doExport()`. Expose a `exportSnapshot()` shim on the new usage namespace for the demo action. |
| 3 | 35 | `u.exportJson('ledger')` | same sprout, `scope: 'ledger'` / bucket-filtered path |
| 4 | 42 | `var d = u.data` | `window.U11` (`u11-data.js`) — specifically `U11.accountById` / `U11.connectionById` / `U11.familyById`; there is no flat `accounts[]` with `.mail`, so `usage.switch_account` must be rewritten against stable ids, not e-mail strings |
| 5 | 57 | `u.rerender('multi_account')` | `HANDLES` → `h.rerender(uid)` for every `type === 'accounts'` widget, via `PMWidgets` handle (`_shared/usage-widgets.js:968`) |
| 6 | 58 | `u.injectIcons()` | **retired** — u11 hydrates `i[data-ico]` once; PM7's `PMCozeHydrate` (`29x-pm6-js-cozy-shelves.part.html:118-125`) is the host equivalent, and `u11-prism.html:1459` does the same inline |
| 7 | 59 | `u.appendLedger({ev:'switch', …})` | `U11.appendEvent(...)` equivalent + rerender of the `ledger` widget; the u11 ledger is a widget renderer (`renderLedger`, `u11-widgets.js:1020-1030`), not a `<tbody>` |
| 8 | 96 | `u.appendLedger({ev:'guard', …})` | same |
| 9 | 143 | `U().setCooldown(p.cooldownSec)` | no cooldown surface in u11 → map to the freshness/`U11time` layer (`#u11Fresh`, `#u11FreshTxt`, `u11-time.js`) or drop with an evidence note. **Also a T14 pre-assert anchor** (§3.12). |
| 10 | 148 | `U().appendLedger(mapEngineRow(er))` | as #7; `mapEngineRow` (`29x:114-130`) must be rewritten from the PM6 row shape (`ev/run/lane/prov/model/acct/tin/tout/cin/cw/cr/rep/cost/lat/detail`) to u11's event model (stable ids, buckets, `authority`) |
| 11 | 156 | `U().rerender('quota_summary')` | rerender `plans` + `capacity` widgets |
| 12 | 157 | `U().injectIcons()` | retired (#6) |
| 13 | 167 | `U().rerender('multi_account')` | rerender `accounts` widgets |
| 14 | 168 | `U().injectIcons()` | retired |
| 15 | 170 | `U().rerender('alert_thresholds')` | rerender `attention` widgets |
| 16 | 171 | `U().injectIcons()` | retired |
| 17 | 178 | `U().injectIcons()` on `page.changed` | retired — but this whole block is `T08_USAGE_PAGECHANGED_OLD` (§3.12) |
| 18 | 184 | `u.injectIcons()` post-init | retired |

Members that simply disappear because nothing consumes them: `refresh`, `cooldown`,
`tickCooldown`, `ledgerFilter`, `cfg` (`ledgerFilter` and `cfg` have zero call sites in 29x —
they were part-18-internal). The 9 registered `usage.*` demo actions in 29x
(`usage.refresh`, `usage.export_json`, `usage.ledger_json`, `usage.switch_account`,
`usage.alert_ack`, `usage.alert_snooze`, `usage.alert_route`, `usage.anomaly_keep`,
`usage.anomaly_allow`, `usage.drill`) are the **command surface** and must keep their action
ids — `PM_DEMO`'s delegated `[data-demo-action]` router and the beat script reference them.
`usage.drill` (`29x:104-108`) calls `PM_PAGES.go('orchestrator')` and must keep doing so.

**Recommended replacement contract:** publish one namespace from the new
`29x-pm6-js-usage-detail` / bridge parts, e.g. `window.PM7_USAGE = { rerenderTypes(types),
appendEvent(ev), exportSnapshot(kind), refresh(), scope(get/set), disclosure(get/set) }`, and
have the bridge talk only to it. Do **not** keep the name `PM6_USAGE` — `check_hooks` does not
require it and keeping it invites a stale mixed API.

### 4.2 The 9 `data-uw` widgets vs u11's 15 types — per-widget disposition

Current 9, all at `18-page-usage.part.html:273-353` as
`<section class="pm6-usage-w pm-sheen span-N" data-uw="…" style="--i:N">`, re-rendered by
`refreshAll()` (`:1104`).

| PM6 `data-uw` | part-18 line | disposition | u11 replacement |
|---|---|---|---|
| `quota_summary` | 273 | **replaced by** | `plans` (`u11-widgets.js:964`, span [4,9]) + `capacity` (`:1000`, span [3,8]) — u11 splits "how much is left" from "is there enough to finish" |
| `alert_thresholds` | 283 | **replaced by** | `attention` (`:990`, span [2,7]) |
| `analytics_chart` | 293 (`data-ctype="bars"`) | **replaced by** | `analytics` (`:1012`, span [4,9]) |
| `budget_donuts` | 303 | **replaced by** | `costs` (`:974`, span [3,8]) |
| `cache` | 313 | **replaced by** | `cache` (`:1041`, span [2,7]) — same name, new renderer |
| `tool_usage` | 323 | **replaced by** | `tools` (`:1035`, span [3,7]) |
| `multi_account` | 333 | **replaced by** | `accounts` (`:982`, span [3,9]) |
| `anomaly` | 343 | **retired / merged** | folded into `attention` (u11 treats anomaly + quota guard as one decision surface) |
| `ledger_table` | 353 (`span-4`) | **replaced by** | `ledger` (`:1020`, span [4,10]); the run/operation split moves to `runs` (`:1004`) and `operations` (`:1031`) |

**7 u11 types are net-new to PM7:** `capacity`, `context`, `free`, `runs`, `operations`,
`signals`, `authority`. The static `#pm6UsageGrid` container (`part 18`, PM7 :21447) and the
`data-uw` / `data-uw-meta` / `--i` stagger convention retire wholesale — u11's canvas is
`.uw-canvas[data-u11-page][data-u11-types]` (13 of them, `u11-prism.html:403,413,423,433,443,
453,463,473,483,493,503,513,523`) mounted by `PMWidgets.mount()`.

### 4.3 The Dashboard Usage widgets and the Add-Widget catalog

Three static cards survive today at `14-page-dashboard.part.html:428,438,448`
(PM7 :20236/:20246/:20256) with **prefixed** kinds `usage.quota_summary`,
`usage.budget_donuts`, `usage.analytics_chart` and inline `--dw`/`--dh`. The **unprefixed**
keys `quota_summary`, `analytics_chart`, `budget_donuts`, `tool_usage`, `multi_account` are
what `29x-pm6-js-dashboard.part.html:2138-2185` `var CATALOG` renders and what the 5 catalog
buttons dispatch (`14-page-dashboard.part.html:489-493`, `data-demo-action="dash.add.<key>"`,
handled by `addWidget(kind)` at `29x:2207-2230`). Two engine aliases also point at them:
`ENGINE_KINDS` (`29x:2200-2205`) maps `widget-quota-summary → quota_summary` and
`widget-account-pressure → multi_account`.

**Disposition — do not touch any of it in this port.** Reasons:
* The Dashboard cards are **independent renderers**, not views of `PM6_USAGE`. `CATALOG`'s
  `lane()`/`spark()`/`donut()`/`row()` bodies (`29x:2107-2136`) read `D.usagePct` / `D.added`,
  never `window.PM6_USAGE`. Retiring the Usage page's renderers therefore breaks nothing on
  the Dashboard.
* `refreshKind(kind)` (`29x:2232-2238`) and the `usage.tick` subscriber are already wrapped by
  **T10** (`build_pm7.py:857-888`, `pm7PageGate('dashboard', …)`). Editing that region risks
  a second transform-anchor break on top of T08.
* The `--dw`/`--dh` model and the `PMWidgets` `span` model are different engines (§4.4);
  unifying them is a separate, larger wave.

What the handoff *should* record as follow-up: (a) the three static cards' bodies still show
PM6-era Usage semantics (`plan-included vs API`, `cost attributed to effective_account_id`)
that u11 has re-specified, so their copy will drift; (b) the 5 catalog entries' `<small>`
descriptions are the Usage vocabulary and should eventually be restated from u11's
`TYPES[*].desc`; (c) `usage.tool_usage` and `usage.multi_account` exist **only** as catalog
entries — there is no static card to update for them.

### 4.4 Widget-host reconciliation: `PMWidgets` spans vs `.pm6-dash-card --dw/--dh`

Measured facts:

| | u11 `PMWidgets` | PM7 dashboard |
|---|---|---|
| container | `.uw-canvas` — `display:grid; gap:10px; grid-auto-rows:28px; grid-template-columns: repeat(4, minmax(0,1fr))` (`_shared/usage-widgets.css:14`) | `.pm6-dash-grid` — `gap:8px; grid-auto-rows:128px; grid-auto-flow:dense; repeat(2, …)` (`10x-pm6-css-dashboard.part.html:78-82`) |
| track breakpoints | **viewport `@media`**: ≤600 → 1, ≤900 → 2, ≤1280 → 3, default 4, ≥1800 → 5, ≥2300 → 6 (`usage-widgets.css:15-19`) | **container query** on `container-name: pm6dash` (`10x-…-dashboard:76`): ≥700 → 3, ≥1060 → 4 (`:83-84`) |
| item sizing | inline `style="grid-column: span C; grid-row: span R"` written by `applySpans()`; `C = min(item.c, live track count)`, item.c never mutated (`_shared/usage-widgets.js:332-358`) | `grid-column: span min(var(--dw,1), 2\|3\|4); grid-row: span var(--dh,1)` (`10x-…-dashboard:89,100-101`) |
| clamps | `clampC`: 1..12 (default 2); `clampR`: 1..40 (default 6) (`usage-widgets.js:57-58`) | `--dw` 1..2 in practice, `--dh` 1..2 |
| presets | `S[1,4] M[2,6] L[3,8] XL[4,7]`, **non-binding** (`usage-widgets.js:46`) | fixed `w`/`h` per `CATALOG` entry |
| persistence | `localStorage["pmw:<pageId>"]` = `{v:2, items:[{uid,type,c,r,cfg,focus}]}`; v1 bare arrays and `{v:2,layout:'free'}` migrate on load; unknown/retired types are filtered out (`usage-widgets.js:11-14,73-130`) | none (DOM-only, `D.added[kind]` flag) |
| resize | free span, no snap on release (`usage-widgets.js:625-656`) | snap-to-grid (`10x-…-dashboard:192`, `data-pm6-dash="resize"`) |

**Adapter contract (concrete):**

1. **The Usage page keeps its own grid.** `.uw-canvas` is a distinct class from
   `.pm6-dash-grid`; there is no CSS collision. Do **not** try to render Usage widgets on
   `.pm6-dash-card`.
2. **Convert the 6 viewport `@media` rules to container queries.** Non-negotiable: a PM7 page
   lives inside `main.primary-content` (`13-html-shell-mid.part.html:4`) with side panels and
   the bottom panel stealing width, so viewport width is not page width. Declare
   `container-type: inline-size; container-name: pm6usage` on the usage scroll wrapper and
   rewrite `usage-widgets.css:15-19` as `@container pm6usage (…)`. `applySpans()` reads the
   live track count from `getComputedStyle(...).gridTemplateColumns` (`usage-widgets.js:345-358`),
   so it adapts automatically once the CSS is right.
3. **Row unit stays 28px inside the Usage canvas.** u11 boards use `r` 6..12
   (`u11-prism.html:605-623`), i.e. 168-336px tall — mapping those onto 128px rows would
   force a lossy `dh = round(r × 28 / 128)` (r=8 → 2, r=10 → 2, r=12 → 3). Only apply that
   conversion if a Usage widget is ever hosted on the Dashboard grid; state the formula and
   leave it unused.
4. **Bridge signature, if/when a Usage type is placed on the Dashboard:**
   `dashFromPmw(def) → { w: Math.min(def.span[0], 4), h: Math.max(1, Math.round(def.span[1] * 28 / 128)) }`
   and inversely `pmwFromDash(card) → { c: +getComputedStyle(card).getPropertyValue('--dw') || 2,
   r: Math.round((+…('--dh') || 1) * 128 / 28) }`. Both directions must clamp through
   `clampC`/`clampR` so a hand-set `--dw:6` cannot produce an item the canvas rejects.
5. **`--i` stagger vs `.uw-enter`.** PM7 cards animate via `animation-delay: calc(var(--i,0) * 50ms)`
   (`10x-…-dashboard:96`); u11 staggers via `--mo-stagger` × flow index, capped, and **only** on
   mount/add/reset (`usage-widgets.js:19-24`). Keep them separate; do not set `--i` on `.uw`.
6. **`contain: layout paint`** is set on `.pm6-dash-card` (`10x-…-dashboard:98`). u11's focus
   mode **hoists** a card out of the canvas (`unhoistFocus`, `usage-widgets.js:990`), which is
   incompatible with a containment ancestor — verify the hoist target is outside any
   `contain`ed box.
7. **`localStorage` keys.** `pmw:<pageId>` with the 13 u11 page ids (`u11-overview`,
   `u11-plans`, …). Rename them to a PM7 namespace (e.g. `pm7:usage:<room>`) before shipping,
   or a user's concept-gallery layouts will silently load into the app.

### 4.5 Global-name collisions

Measured by counting `window.X =` in the ported payload vs the assembled base.

| name | u11 | PM7 base | **winner** | what must be rewritten |
|---|---|---|---|---|
| `window.toast` | `_shared/usage-chrome.js:120-130` — appends a `.rail-toast` to `#toastStack`, caps at 5, 3.4 s | `29x-pm6-js-globals.part.html:648` `window.toast = toastApi` — the full title-bar notification API (`toast(msg)` ephemeral stage fade, `toast.important` / `toast.push` / options object → durable stack with unread badge; `:62-65`) | **PM7** | drop `usage-chrome.js` entirely. The 15 ported `if (window.toast) window.toast(...)` call sites (`u11-prism.html:1078,1181,1350,1360,1385`; `u11-widgets.js:1108,1119,1226,1232,1237,1242,1250`; `u11-rundetail.js:454`; `u11-context.js:162,202`) are already guarded and work unchanged against `toastApi`. Verify none passes an object where PM7 would read it as the durable-stack options form. |
| `PMIcons` / `PMIcon` vs `PM_ICONS` | `PMIcons` map (`_shared/icons.js:13`, 59 glyphs) + `usage-icons.js` (+43) + `u11-icons.js` (+5) = **107**; `PMIcon(name, cls)` at `icons.js:76-80` | `PM_ICONS` (38 keys per `contracts/ICONS.md:8`, hoisted `29x-pm6-js-globals.part.html:59`) + 62 additive Cozy Shelves keys (`29x-pm6-js-cozy-shelves.part.html:109`) = **91**; `window.PMIcon` already exists at `29x-pm6-js-cozy-shelves.part.html:110-115` with the **same `(name, cls)` signature** | **PM7's `PM_ICONS` + existing `PMIcon`** | **60 names exist in both maps** (`actions, agents, arrowDn, arrowUp, artifacts, bell, bolt, book, brain, branch, camera, chat, check, chevD, chevR, clipboard, clock, cog, copy, dial, diff, docker, external, eye, fetch, file, files, filter, flame, folderOpen, globe, grip, home, info, key, layers, link, merge, minus, monitor, pin, play, plus, pr, pull, push, refresh, search, shield, source, spark, stash, stop, terminal, tests, trash, upload, user, warn, x`) with **different geometry and stroke-width** (PM_ICONS 1.8, PMIcons 2.0). Merge additively (`if (!window.PM_ICONS[k])`) so PM7's existing 91 win and only the **47 u11-only** glyphs are added. Delete `window.PMIcons` and `_shared/icons.js`'s `PMIcon` definition; rewrite `u11-icons.js`/`usage-icons.js` as `add` blocks against `PM_ICONS`. |
| `data-ico` vs `data-pm-ico` | u11 markup uses `<i data-ico="cog" class="pm-ico">` (`u11-prism.html:355-357` etc.) hydrated at `u11-prism.html:1459` and `usage-chrome.js:292` | part 18 uses `.pm6-ico[data-pm-ico]` hydrated by `injectIcons()` (`18-page-usage.part.html:1110-1116`); the **Cozy Shelves layer already uses `data-ico` + `.pm-ico`**, hydrated by `PMCozeHydrate` (`29x-pm6-js-cozy-shelves.part.html:118-125`), with `.pm-ico{14px}` / `.pm-ico.sm{11px}` / `.pm-ico.lg{18px}` at `10x-pm6-css-cozy-shelves.part.html:57-59` | **`data-ico` (u11's form) — it is already PM7-native** | This is the happy seam: the u11 markup needs **no attribute rewrite**. Reuse `PMCozeHydrate(root)` (or rename it to a neutral `PM_ICON_HYDRATE`) and delete u11's private hydration loops. The old `data-pm-ico` form retires with part 18's renderers; the dashboard's `data-pm6-icon` form (`29x-pm6-js-dashboard.part.html:2190`) is a **third** spelling that stays untouched. |
| `PMTabs` | only the inert stub at `usage-chrome.js:34` — **u11 never calls `PMTabs.mount`** | none | **n/a** | drops with the chrome; no reconciliation needed |
| `PMMenu` vs `pm6-tb-menu-*` / `PM_TB_SEARCH` | `PMMenu = {init, open, close, closeAll, openAt, upgradeWrap}` (`_shared/menu.js:214`), the sprout-menu family; its own header cites `PMConcept7.html:12421-12536` as the CSS source of truth | PM7's title-bar menus are the `.pm6-tb-menu-wrap` / `-trigger` / `-item` markup (`11-html-shell-open.part.html:7-18,70-77`) driven by a delegated controller in `29x-pm6-js-panels.part.html:435+`, with `PM_TB_SEARCH` (`29x-pm6-js-panels.part.html:634`) owning the title-bar search overlay and cross-closing menus (`:480,530,564,569,775`) | **split decision** | For anything in the **title bar**: PM7's `pm6-tb-menu-*` controller wins outright — u11 builds no title bar once the chrome is dropped, so nothing to port. For the **two Usage sprouts** (`#u11SheetSprout`, `#u11ExportSprout`, `u11-prism.html:545-546`) and the widget kebab/config sprout (`_shared/usage-widgets.js:930-935`): **PM7 has no sprout registry at all** — grepping `pm-sprout` / `PM_SPROUT` / `closeAllSprouts` across all 54 parts returns nothing. So `menu.js`'s 215 lines must be ported, but **renamed** (`PM_USAGE_SPROUT` or folded into the usage-detail part as a module-local helper) so the global `PMMenu` name is not claimed. Then rewrite the 9 ported `window.PMMenu.*` call sites (`u11-prism.html:1163,1170,1214,1289,1297,1351,1368`; `u11-context.js:223,482`) onto the new name, and wire mutual exclusion **both ways** with `PM_TB_SEARCH.close()` and the `pm6-tb-menu` controller so ACD-438's one-popup-at-a-time invariant still holds across the seam. `.pm-sprout` CSS already ships in the ported `usage-shared.css:270-271`. |
| `PMUsageChrome` / `PMUsageShell` | `usage-chrome.js:344,329` | none | **neither** | both retire; `PMUsageChrome.boot()` is replaced by static markup (§4.7) |
| `PMWidgets` | assigned **twice** in the payload: the inert guard stub `usage-chrome.js:30-33` and the real engine `usage-widgets.js:998-1006` | none | **u11's real engine** | drop the stub with the chrome; the boot-race it guarded (`usage-chrome.js:19-28`) cannot happen once all blocks are inlined in assembly order |
| `PMWidgetDefs` | inert stub only (`usage-chrome.js:35-38`); nothing in the u11 bundle defines the real one | none | **n/a** | drops |
| `USfmt` / `USrender` / `U11` / `U11W` / `U11time` / `U11Context` | 1 assignment each | 0 | **u11** | no collision. Consider a `PM7_USAGE.*` namespace instead of six globals. |
| `PM_ICONS` / `PM_PAGES` / `PM_DEMO` / `PM_TB_SEARCH` | 0 assignments | 2 / 1 / 2 / 1 | **PM7** | u11 must consume, never assign |

### 4.6 Theming — drop u11's boot script

`u11-prism.html:8` is a single-slug reader:

```js
var ok=['friendly-dark','friendly-light','retro-dark','retro-light','basic-light','basic-dark','glass-dark','glass-light'];
var t=localStorage.getItem('pm.theme'); if(ok.indexOf(t)===-1)t='friendly-dark';
d.setAttribute('data-theme',t); d.style.colorScheme=/-dark$/.test(t)?'dark':'light';
```

PM7's boot (`01-head-prelude.part.html:14-65`) owns a **family × mode** model:
`pm.themeFamily ∈ {friendly, glass, retro, basic}` × `pm.themeMode ∈ {light, dark, auto}`,
where `auto` resolves through `prefers-color-scheme`; the legacy `pm.theme` slug is **migrated
on first read and then kept in sync as a derived value** (`:32-43`). It additionally sets
`data-glass-bg` (mesh/depth/minimal), clamps `--glass-alpha` per light/dark, paints a critical
solid canvas colour from the `BGS` table (`:17-26`), and injects `<style id="pm-boot-paint">`
to prevent the double white flash.

**Verdict: drop `u11-prism.html:8` entirely, and drop the theme menu in
`usage-chrome.js:152-153,247-264` (which writes `localStorage.setItem('pm.theme', v)` at
`:251` — a direct write to PM7's derived value, which would desync `pm.themeFamily`/
`pm.themeMode` until the next boot).** Replacements:
* theme application: PM7's boot, unchanged. No port.
* theme switching: PM7's existing title-bar theme menu (`11-html-shell-open.part.html:70-77`).
* the `MutationObserver` on `<html data-theme>` (`usage-chrome.js:323-328`) is worth keeping in
  spirit — if any ported widget caches a theme-derived value it should re-read on
  `data-theme` change; but it must not own the label sync.
* `data-reduced-motion` (`usage-chrome.js:283-289`) — PM7 uses `[data-motion="reduced"]`
  (`10x-pm6-css-dashboard.part.html:181,457`) and `prefers-reduced-motion` media queries.
  `USrender.isRM()` (read by `usage-widgets.js:56` and `u11-prism.html:568`) must be repointed
  at PM7's signal, or reduced-motion users get u11's FLIP animations.
* **Theme-slug contract is identical** — both use the same 8 `family-mode` slugs, so every
  `[data-theme^="glass"]` / `[data-theme^="retro"]` / `[data-theme^="basic"]` selector in the
  ported CSS (dozens; e.g. `usage-shared.css:27,32,65,71,73,219,232-238,270-271`,
  `u11-prism.html:42,43,69`) works unchanged. That is the single biggest reason this port is
  tractable.

### 4.7 The `usage-page` template + `PMUsageChrome.boot()` mount vs PM7's static page divs

Today, u11 works like this: `<div id="app"></div>` (`:345`) + `<template id="usage-page">`
(`:347-529`), then `PMUsageChrome.boot({badge:{id:'U11',name:'Prism II'}})` (`:592`) reads
`tpl.innerHTML` (`usage-chrome.js:223-224`) and writes a whole shell into `#app`
(`:226-233`): glass background, `.app-shell`, title bar, toast stack,
`.us-center > .us-center-inner` with the page HTML, status bar.

PM7 is the opposite: every page is **static markup already in the document**, a direct child of
`main.primary-content` (`13-html-shell-mid.part.html:4`) with classes `page page-<id>` and
`.active` toggled by `PM_PAGES.go` (`29x-pm6-js-globals.part.html:682-684`). `#panel-usage`
(`18-page-usage.part.html:1`) is that div for Usage and is a `MUST-EXIST` hook
(`contracts/HOOKS.md:28`).

**The port must invert the mount:**
1. Delete `<div id="app">`, the `<template id="usage-page">` wrapper, and the `boot()` call.
   Inline `u11-prism.html:348-528` **directly** inside `<div class="page page-usage"
   id="panel-usage">` in part 18. The `<template>` disappears, so `manifest.lock`'s
   `template: 0` global delta is preserved with no work.
2. `#u11PopScrim`, `#u11Pop`, `#u11SheetSprout`, `#u11ExportSprout` (`:531-546`) live **outside**
   the template today (siblings of `#app`). They are body-portaled overlays. Decide: keep them
   inside `#panel-usage` (simplest, but then they are hidden whenever the page is not `.active`
   — which is correct for all four) or move them to `22-html-status-toast.part.html` alongside
   `#pmToastStack` / `#detachedTerminalWindow`. **Recommend inside `#panel-usage`.** Note PM7's
   `PM7 SECTION` layer and T17 do not care, but `check_ids` does — keep each exactly once.
3. The boot script must run at `DOMContentLoaded`, not eagerly-with-guards. Two ported lines
   **throw** if their element is missing: `document.querySelector('.u11-rail').addEventListener(...)`
   (`u11-prism.html:1006`) and `initRailInd()`'s `rail.insertBefore(...)` (`:1039-1043`).
   With static markup they are safe, but the block is assembled into a `<script>` that runs
   during parse — so it must be wrapped (`if (document.readyState === 'loading') …` like
   `29x-pm6-js-globals.part.html:656-660`, or hosted in the part-18 script which sits **after**
   the markup — the current part 18 does exactly that, and that is the position to reuse).
4. Everything `boot()` provided that the page still needs must be re-sourced:
   `#toastStack` → PM7's `toastApi`; `#sbChips` → §4.5/§4.8; `wireDemoActions(document)`
   (`usage-chrome.js:132-146`) → PM7's own `[data-demo-action]` router in `PM_DEMO`;
   `initReveals()` / `.pm-rev` (`usage-chrome.js:96-119`) → nothing in the ported files uses
   `.pm-rev` (verified: `usage-chrome.js:70` says "Nothing used `.pm-rev` yet"), so it drops;
   the generic `[data-collapse]`/`[data-acc]` accordion (`:294-301`) → check whether any ported
   markup uses it (the u11 rooms do not) before dropping.
5. **The generic `[data-tab]` tabber at `usage-chrome.js:302-310` must not be ported as-is.**
   It listens on `document` and falls back to `scope = tab.closest('.us-pane-scope') || app`.
   In PM7 `app` is `null`, so **any** click on the 60+ other `[data-tab]` elements in the
   document (7 in `17-page-orchestrator.part.html`, dozens in
   `12-html-side-panels.part.html`) would throw on `scope.querySelectorAll`. If any of that
   behaviour is needed, re-scope it to `#panel-usage` and drop the `|| app` fallback.

### 4.8 The 13 rooms and `PM_PAGES.go`'s fallback — exactly what must be preserved

`PM_PAGES.go(pageId, subTab)` (`29x-pm6-js-globals.part.html:674-702`): with no
`registerSubtab` for `'usage'` (and there is none — §0), it takes the **fallback** at
`:691-697`:

```js
var root = document.querySelector('.primary-content > .page.page-' + pageId);
var ctl  = root && root.querySelector('[data-tab="' + subTab + '"]');
if (ctl && ctl.click) ctl.click();
```

The 13 rooms are the 13 `data-tab` values on the rail buttons
(`u11-prism.html:366,368-374,378-382`): `overview, plans, costs, accounts, free, context,
analytics, ledger, attention, cache, tools, signals, authority` — each paired with a
`<section class="u11-pane" data-pane="…">` (`:395-524`). The real router is u11's **own**
listener, scoped to the rail and calling `ev.stopPropagation()` (`:1006-1021`), which routes to
`goTo(name)` (`:969-1005`).

**Six invariants must hold for the fallback to keep working — verify each after the port:**

1. `#panel-usage` stays a **direct child** of `main.primary-content` and keeps **both** classes
   `page` and `page-usage` (`:682-684` toggles `.active` on `.primary-content > .page`, and the
   selector at `:693` is `> .page.page-usage`). Nesting it one level deeper silently breaks
   every `PM_PAGES.go('usage', …)`.
2. All 13 rail buttons stay **inside** `#panel-usage`, each carrying its `data-tab="<slug>"`,
   and each remains a real clickable element (`<button>`, `.click()` present).
3. **`querySelector` returns the first match in document order** — so no other element inside
   `#panel-usage` may carry a `data-tab` with one of the 13 values. Today only the rail buttons
   do; the scope trigger uses `data-scope-open` and the More toggle uses `data-more-toggle`
   (both without `data-tab`), which is exactly right. Keep it that way.
4. The 5 "More" rooms (`attention, cache, tools, signals, authority`) sit inside
   `#u11MoreGrp.closed`, which `display:none`s `.u11-sub` (`u11-prism.html:99`). A programmatic
   `.click()` on a `display:none` button **still dispatches**, and `goTo()` opens the group
   itself (`:979-984`). So `PM_PAGES.go('usage','authority')` works from a collapsed rail —
   preserve `goTo`'s group-opening branch.
5. The rail click listener must be attached before any `PM_PAGES.go` call. It is attached at
   the end of the part-18 script, which assembles **after** the markup — keep that order
   (§4.7 point 3).
6. `.page-tab[data-page="usage"]` must keep existing in the title bar for `:677-681` to set
   `.active` + `aria-selected`; and `#tab-usage` is a MUST-EXIST hook (`HOOKS.md:34`).

**Room-slug collision note (benign, but know it):** `data-tab="ledger"` already exists in
`17-page-orchestrator.part.html` (2 occurrences). The fallback scopes its `querySelector` to
the target page root, and u11's own listener is scoped to `.u11-rail`, so `go('usage','ledger')`
and `go('orchestrator','ledger')` cannot cross-fire. This is only safe because both routers are
scoped — which is the second reason §4.7 point 5 matters.

**Optional hardening:** register a real subtab handler,
`PM_PAGES.registerSubtab('usage', goTo)`, following the exact pattern at
`29x-pm6-js-dashboard.part.html:2269-2272`. It removes the DOM round-trip, removes the
first-match fragility of invariant 3, and lets `goTo` reject unknown slugs (`:970`) instead of
silently no-op'ing. Recommended, but not required.

---

## 5. WHAT MUST NOT BE PORTED, AND WHY

| Item | Location | Why not |
|---|---|---|
| `_shared/themes.css` (33,943 B) | `u11-prism.html:13` | PM7 owns theming: 8 theme slugs × all tokens live in `02-css-tokens.part.html` (+ `03/04-css-glass`, `09-css-bento-themes`) and are applied by the boot at `01-head-prelude.part.html:14-65`. Porting it would produce two competing `:root`/`[data-theme]` token cascades. **Consequence to handle:** it is the sole source of the 14 tokens in §3.4 (`--tone-*-text` ×6, `--us-fill-*` ×6, `--num-font`, `--pm-motion-k`) — those must be **restated per theme** in `02-css-tokens.part.html`, not copied wholesale. It is also the sole source of the 8 font-family literals (§3.10). |
| `_shared/base.css` (50,700 B) | `u11-prism.html:14` | The concept's reset + app-shell/title-bar/status-bar/`.us-center` chrome + `.rail-toast` + `.pm-rev`. PM7 has its own shell (`05-css-shell.part.html`, `11-html-shell-open.part.html`) and its own toast layer. **Verified droppable:** a dependency scan of every ported file found only three classes it defines that the payload needs — `.pm-ico`, `.sm`, `.vs-` — and `.pm-ico`/`.pm-ico.sm`/`.pm-hidden` already exist at `10x-pm6-css-cozy-shelves.part.html:57-59,72`. |
| `_shared/usage-chrome.js` (19,745 B, 361 lines) | `u11-prism.html:555` | Pure concept harness: it *is* the title bar (`titleBarHTML()` `:148-175`), the status bar (`statusBarHTML()` `:177-197`), the toast stack, the `?embed=1` gallery mode (`:199-214`), and the `postMessage` gallery bridge (`:332-341`). Every one of those is PM7-native or meaningless in PM7. It is also the **sole source of all 5 `check_ids` collisions** (§3.3) and of the competing `window.toast` (§4.5). |
| The page-width **fit harness** | `usage-chrome.js:177-197` (`.sb-harness`, `#sbWidth`, `#sbWRead`, `.sb-preset` 900/1280/1700/2200/2500/FILL) + `setW()` `:266-280` | A responsive **test rig** — it exists to stress the 2/3/4/5/6-column breakpoints of the widget canvas by clamping `#usCenterInner`'s `max-width`. PM7's page width is determined by the real shell (side panels, bottom panel, window size), and §4.4 point 2 converts those breakpoints to container queries anyway. Shipping the harness would put a developer control in the product's status bar. |
| The **concept badge** | `usage-chrome.js:238-245` (`.sb-chip.sb-badge` with `.cb-id` `U11`, `.cb-name` `Prism II`, `<a class="cb-home" href="index.html">all concepts</a>`), driven by `u11-prism.html:592` `boot({badge:{id:'U11',name:'Prism II'}})`; also `usage-chrome.js:351-357`'s `recover()` which parses the badge out of `document.title` | It advertises the concept identity and links back to the concept gallery (`index.html`) — a relative link that resolves to nothing from `Concepts/PMConcept7.html`. Also drop the `<title>U11 · Prism II — Usage — Puppet Master Concepts</title>` (`u11-prism.html:7`); PM7's title is `Puppet Master - Dashboard` (`01-head-prelude.part.html:6`). |
| The **font CDN** — all four lines | `u11-prism.html:9-12` | PM7 already carries the identical 4-line pattern at `01-head-prelude.part.html:67-72`; porting duplicates it. `pm-gui-asset-policy.py:74-78` would flag each as `no_network_or_cdn_icons` if it ever scanned `Concepts/**` (§3.10). And **no ported file names any of the 8 families** — the families are only needed by the un-ported `themes.css`. Net: zero new webfonts. Also drop the `<link rel="icon" href="data:,">` at `:6`. |
| The **cache-busting version query strings** | `?v=20260813a` on 9 refs: `u11-prism.html:17,18,19,550,553,554,557,558,559` | Meaningless in a single-file build artifact — every stylesheet and script is inlined, there is no HTTP request to bust. They would survive only as dead text inside comments. Strip them when the file bodies are pasted into their part slots. |
| `_shared/usage-context.css`, `usage-context.js`, `usage-tabs.css`, `usage-tabs.js`, `usage-widget-renderers.css`, `usage-widget-renderers.js` | `_shared/` | **Not referenced by `u11-prism.html` at all** (verified against `:13-19,548-559`) — they belong to other concepts (U7/U8/U9). They are not part of the 18-file bundle. Do not port them. Note this is why `--us-mlb` / `--us-mpc` / `--us-wlb` are undefined (§3.4): `usage-context.css:81` is their only definition site. |
| `PMWidgets` / `PMTabs` / `PMWidgetDefs` **inert stubs** | `usage-chrome.js:29-38` | Boot-race guards for `<script src>` load order. In a single assembled document, block order is deterministic (manifest order), so the race cannot occur — and a surviving stub would shadow the real engine if the manifest order were ever wrong, hiding the bug instead of failing loudly. |
| The `?embed=1` mode and `postMessage` bridge | `usage-chrome.js:205-214,332-341` | Gallery-iframe plumbing. `postMessage(…, '*')` in a shipped artifact is also a needless surface. |

---

## 6. PRE-PORT BLOCKER LIST (ordered — resolve top-down before the first build attempt)

**Tier 1 — decisions that change the carving. Nothing else can start until these land.**

1. **Accept the block-census change, or redesign the carving.** §1.1/§3.9: `check_structure`'s
   balanced-zero rule for lock-less parts + PARTS.md:58's 2,200-line cap make new
   `<style>`/`<script>` blocks unavoidable (the payload is 9,098 portable lines). That forces
   edits to `build_pm7.py:50-52` and the positional `T17_BLOCKS` table (`:1467-1549`).
   **Owner decision required:** is this port allowed to edit `pm7-tools/build_pm7.py`, or must
   it fit inside the existing 4 usage blocks? If the latter, part 18 lands at ~4,000+ lines and
   PARTS.md:58 must be waived. Everything downstream depends on this answer.
2. **Decide T08's fate.** §3.12: three `replace_exact_once` anchors and three post-assertions
   die with part 18 / 29x-pm6-js-usage, plus T14's pre-assert at `build_pm7.py:1048-1049`.
   Retarget onto the u11 freshness layer, or record an explicit evidence-backed skip in the
   T12/T13/T14 style. A build cannot even reach the static gates until this is settled.
3. **Resolve the `check_vocab` vocabulary — 46 matches.** §3.7. The 44 `tier`/`phase` hits are
   rewritable prose and data labels, but the 2 `Gemini CLI` hits in `u11-data.js` are **data
   identity** (`conn:google-gemini-cli`, `'Gemini CLI profile'`). `EXCLUSIONS`
   (`check_vocab.py:11-16`) may not be extended without a PARTS.md update. Hard at g2/g3 —
   there is no ship path around it.
4. **Choose the raw-hex strategy.** §3.5: 13 hex declarations. Option A (route to PM-native
   tokens, `pm6-css-*` blocks stay clean) vs Option B (park them in part 18's unlabeled block).
   This decides whether the u11 palette becomes part of the PM7 design system or stays a local
   exception — and it decides which part file each rule lands in.

**Tier 2 — mechanical work that must be complete before the first `--gate g2`.**

5. **Define the 19 missing CSS custom properties.** §3.4. Concretely: 12 per-theme colour
   tokens (`--tone-{ok,warn,err,info,mute,purple}-text`, `--us-fill-{ok,warn,hot,info,mute,purple}`)
   restated in `02-css-tokens.part.html` for all 8 themes from `_shared/themes.css:664+`;
   `--num-font` and `--pm-motion-k` per theme; `--accent-cyan` defined or collapsed to
   `--accent-blue`; `--us-mlb`/`--us-mpc`/`--us-wlb` defined or their `var()` wrappers removed;
   and **reword the comment at `_shared/usage-shared.css:161`** so `'var(--tone-*)'` stops
   registering as a `var(--tone-)` use. Hard-fails both `check_css` and
   `build_pm7.py`'s `css_vars_defined`.
6. **Strip the chrome and everything in §5** — and confirm afterwards that `check_ids` is clean
   (all 5 collisions are chrome-borne) and that no ported file still calls
   `PMUsageChrome.boot`, `PMUsageShell`, `setW`, `wireDemoActions`, or `initReveals`.
7. **Re-home the 9 orphaned `getElementById` targets** (§3.3): `app`, `pmEmbedCss`, `sbChips`,
   `sbRM`, `sbWRead`, `sbWidth`, `toastStack`, `usCenterInner`, `usage-page`. The load-bearing
   one is `sbChips` — `u11-prism.html:594` mounts the context ring and the "more details"
   trigger into it (`u11-context.js:515-556`, `.sb-chip.u11ctx-ringbtn` /
   `.u11ctx-detbtn`). **PM7 has no status bar** (verified: no `class="status-bar"`, no
   `sb-chip`, in any of the 54 parts). Pick a real host — the title bar, the bottom panel's
   chrome bar, or the Usage page header — or drop the status-bar ring and keep only the
   in-page Context room.
8. **Merge the icon registries** (§4.5): 47 additive glyphs into `PM_ICONS` via the
   `29x-pm6-js-cozy-shelves.part.html:109` idiom; delete `window.PMIcons` and u11's `PMIcon`;
   reuse PM7's `PMIcon` + `PMCozeHydrate`. The `data-ico` + `.pm-ico` markup contract needs
   **no** rewrite — it is already PM7-native.
9. **Rename `PMMenu` → a usage-local sprout namespace** and rewire the 9 call sites (§4.5),
   including two-way mutual exclusion with `PM_TB_SEARCH` and the `pm6-tb-menu` controller.
10. **Drop `u11-prism.html:8` and the theme menu's `pm.theme` write** (§4.6), and repoint
    `USrender.isRM()` at PM7's reduced-motion signal (`[data-motion="reduced"]`).
11. **Invert the mount** (§4.7): de-template the markup into `#panel-usage`, keep `#panel-usage`
    exactly once and as a direct child of `main.primary-content`, place the 4 overlays, and
    move the boot into the post-markup script slot. Do **not** port the document-level
    `[data-tab]` tabber (`usage-chrome.js:302-310`) — it would throw on every orchestrator and
    side-panel `[data-tab]` click.
12. **Convert the 6 `.uw-canvas` viewport `@media` rules to `@container` queries** and declare
    the container on the usage scroll wrapper (§4.4 point 2). Without this the widget canvas
    reads window width instead of page width and picks the wrong track count whenever a side
    panel is open.
13. **Namespace the `localStorage` keys**: `pmw:u11-*` → a PM7 namespace, and the `u11:*` keys
    (`u11:disclosure`, `u11:scope`, `u11:settings`, `u11-prism.html:575,580,589`) likewise
    (§4.4 point 7).
14. **Rewrite the 18 `PM6_USAGE` call sites** in the new bridge (§4.1), preserving all 9
    `usage.*` demo-action ids and `usage.drill`'s `PM_PAGES.go('orchestrator')`.
15. **Replace `↔` (U+2194) and `↺` (U+21BA)** with inline SVG (§3.8/§3.10) — `check_no_emoji`
    tolerates them as warnings, but the project rule is inline SVG only and
    `pm-gui-asset-policy.py:169-181` flags both.

**Tier 3 — verify after the first green build, before shipping.**

16. **Do not touch the Dashboard's Usage widgets or the Add-Widget catalog** in this wave
    (§4.3) — they are independent renderers, and the region is already wrapped by T10.
17. **Confirm T01's frozen dead-selector list still resolves** (`build_pm7.py:138-141`) — the
    ported CSS must not re-introduce or rename any frozen selector.
18. **Never write the phrase "editor tab drag-reorder (delegated)"** into a ported comment
    (§3.11), and never write `window.PM_SETTINGS_DATA = {` into a ported file (§3.9).
19. **Watch two global CSS rules that now reach u11 markup:**
    `10x-pm6-css-cozy-shelves.part.html:987` `[data-pane]:not(.pm-hidden) > * { animation: shPaneIn … }`
    will animate every child of all 13 u11 panes, and the `.side-panel-slot … [data-pane].pm-hidden`
    rules (`:926,936`) share the `[data-pane]` vocabulary. u11 also uses `[data-pane]`
    (`u11-prism.html:395-524`) and drives its own Web-Animations depth flight
    (`:986-1004`) — the two will double up.
20. **Re-baseline / governance:** `pm6-build/README.md:26-49` — the `manifest.json` sha changes,
    so `scripts/pm-plans-verify.py run-gates` needs an evidence-hash refresh (never hand-edit
    `Plans/.evidence/**`); `manifest.json`'s `working_sha256` is *already* stale
    (`27a5d1da…` vs the current assembled `3d82a850…`), so decide whether this wave also
    re-baselines `PMConcept6.working.html`. **Never run `carve.py --force` against the repo
    `parts/`** (`README.md:53-58`); scratch-copy only.
21. Repo is on an NFS4 share: check `git diff --ignore-cr-at-eol` before believing any diff,
    and do not add a repo-wide `.gitattributes`.

---

### Appendix — measured inventory of the 18 portable files

| file | bytes | lines | port destination |
|---|---|---|---|
| `u11-prism.html` | 94,717 | 1,465 | split: inline `<style>` (20-342) → `10x-pm6-css-usage-u11`; markup (348-546) → part 18 markup; boot `<script>` (561-1465) → part 18 script; head (1-19) → **dropped** |
| `u11-widgets.css` | 28,566 | 389 | `10x-pm6-css-usage-u11` |
| `u11-rundetail.css` | 10,630 | 146 | `10x-pm6-css-usage-u11` |
| `u11-context.css` | 14,698 | 197 | `10x-pm6-css-usage-u11` |
| `_shared/usage-shared.css` | 34,076 | 437 | `10x-pm6-css-usage` (replaces the 27-line accent block) |
| `_shared/usage-widgets.css` | 20,591 | 188 | `10x-pm6-css-usage` |
| `_shared/icons.js` | 9,353 | 82 | merged additively into `PM_ICONS` (`29x-pm6-js-globals`) |
| `_shared/usage-icons.js` | 7,253 | 63 | same |
| `u11-icons.js` | 1,332 | 19 | same (5 glyphs) |
| `_shared/menu.js` | 10,318 | 215 | renamed sprout helper → `29x-pm6-js-usage-detail` |
| `_shared/usage-data.js` | 76,227 | 932 | `29x-pm6-js-usage-data-a` |
| `u11-time.js` | 7,232 | 193 | `29x-pm6-js-usage-data-a` |
| `u11-data.js` | 113,310 | 1,416 | `29x-pm6-js-usage-data-b` |
| `_shared/usage-chrome.js` | 19,745 | 361 | **NOT PORTED** (§5) |
| `_shared/usage-widgets.js` | 51,717 | 1,007 | `29x-pm6-js-usage-widgets-a` |
| `u11-widgets.js` | 66,133 | 1,325 | `29x-pm6-js-usage-widgets-b` |
| `u11-rundetail.js` | 23,064 | 460 | `29x-pm6-js-usage-detail` |
| `u11-context.js` | 27,147 | 564 | `29x-pm6-js-usage-detail` |
| **total** | **616,109** | **9,459** | portable after dropping the chrome: **9,098 lines** |

Simulation scripts used for the gate figures (scratchpad only, wrote nothing into the repo):
`/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad/varscan.py`,
`…/gatesim.py`, output at `…/gatesim.json`.
