# Real gate runs — replacing the two simulators

Probe date 2026-08-17. Read-only. Machine-readable twin: `real-gate-runs.json`.

**Why this probe exists.** Every gate number in
`handoff/PORT_HANDOFF_PM7_BUILD_ROUTE.md` §3 came from two hand-written
simulators in the session scratchpad (`varscan.py`, `gatesim.py`) that
re-implemented the checkers' regexes rather than executing them. This probe
executes the nine real checkers in `Concepts/pm6-build/checks/` against real
assembled documents and transcribes what they printed.

**Headline.** The handoff's numbers survive contact with the real checkers
almost perfectly — 5 duplicate ids, 19 undefined CSS vars, 13 raw-hex findings,
46 vocab matches, 5 new emoji-warning classes are all exactly right. But the
simulators had a blind spot the real run exposes: **`check_structure` hard-fails
with `<body> count 5 != 1`**, a failure neither simulator could see and the
handoff does not mention. It is hard at *every* gate including g0.

---

## 1. Method, and why a scratch tree was necessary

All nine checkers take the assembled document as `argv[1]`
(`check_ids.py:15`, `check_css.py:22`, `check_js.py:20`, `check_structure.py:38`,
`check_hooks.py:23`, `check_settings_data.py:14`, `check_no_emoji.py:24`,
`check_vocab.py:30`). `check_original.py:10` is the exception — it takes no
argument and resolves `BUILD.parent / "PMConcept4.html"` itself.

`assemble.py` does support redirection: `--out` (`assemble.py:68-74`) is
parallel-safe and refused only with `g3`. But it hardcodes
`PARTS = HERE / "parts"` (`assemble.py:23`), so a u11-substituted part set cannot
be handed to the repo copy without writing into `Concepts/pm6-build/parts/`,
which this audit may not do.

**Resolution:** the entire `pm6-build` tree was copied into the scratchpad, the
parts substituted *there*, and the scratch copy of `assemble.py` run with `--out`
pointing into the scratchpad. Because `HERE = Path(__file__).resolve().parent`,
the scratch assembler reads the scratch parts, the scratch `manifest.json`, the
scratch `manifest.lock`, the scratch `contracts/HOOKS.md` and the scratch
`sidecar/`. `PMConcept4.html` was copied to the scratch tree's parent so
`check_original.py` resolves. **`assemble.py` was never run in a mode that writes
into the repo, and `--gate g3` was never used.**

Repo-untouched proof: `git status --porcelain` over `Concepts/pm6-build/`,
`Concepts/PMConcept4.html`, `Concepts/PMConcept7.html` and
`Concepts/usage-concepts/QwenUsageConcept/` reports no modification from this
probe, and `Concepts/pm6-build/manifest.json` still lists 54 parts.

### Three variants

| variant | what it is | parts | assembled lines |
|---|---|---|---|
| `base` | byte copy of `Concepts/pm6-build`, no substitutions — **the control** | 54 | 49,353 |
| `cand-A` | the handoff's own §1.2/§1.3 proposal; `_shared/usage-chrome.js` **not** ported (§5) | 61 | 57,252 |
| `cand-B` | `cand-A` + `_shared/usage-chrome.js` — the naive straight port the simulators measured | 62 | 57,615 |

The `base` control is what makes the rest interpretable: **all nine checkers pass
on it and `--gate g2` returns PASS**, so every candidate failure below is
u11-attributable and not pre-existing.

### u11 slices used

| slice | source |
|---|---|
| inline `<style>` body | `u11-prism.html:21-341` (between `<style>`@20 and `</style>`@342) |
| markup | `u11-prism.html:348-528` (inner of `<template id="usage-page">`@347-529, de-templated) + `:531-546` (scope popover + 2 sprouts) |
| boot `<script>` body | `u11-prism.html:561-1462` (between `<script>`@560 and `</script>`@1463) |
| CSS | `_shared/usage-shared.css`, `_shared/usage-widgets.css` → `<style id="pm6-css-usage">`; `u11-widgets.css`, `u11-rundetail.css`, `u11-context.css` + prism inline style → `<style id="pm6-css-usage-u11">` |
| JS | 6 new balanced `<script>` parts in the §1.3 load order |

### Declared deviations from the handoff

1. The handoff folds the three icon files additively into the existing `PM_ICONS`
   hoist in `29x-pm6-js-globals.part.html` with **no new block**. This probe gave
   them their own balanced script part so the substitution stays purely additive
   and auditable. Effect on the nine checkers: one extra balanced-zero advisory
   line in `check_structure`, one extra block in the `check_js` count. No verdict
   changes.
2. Part 47 (`29x-pm6-js-usage.part.html`, the `PM_DEMO` bridge) was left
   byte-unchanged. Rewriting it over the u11 API is design work, not a measurable
   transform, and no checker reads it semantically.
3. Part 18's unlabeled `<style>` was emitted as the handoff's "documented stub"
   option, with all five ported CSS files in the two `pm6-css-*` blocks. This is
   the configuration that **maximises** the `check_css` raw-hex finding count —
   i.e. the conservative measurement.

### Exact commands

```bash
S=/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad/gate-run

# 0. build the three scratch trees (copies pm6-build, substitutes parts, registers manifest entries)
python3 $S/setup_candidate.py

# 1. whole-gate runs (this is what produced the summary tables)
python3 $S/base/pm6-build/assemble.py   --gate g2 --out $S/out/base.assembled.html     # -> exit 0
python3 $S/cand-A/pm6-build/assemble.py --gate g2 --out $S/out/cand-A.assembled.html   # -> exit 1
python3 $S/cand-B/pm6-build/assemble.py --gate g2 --out $S/out/cand-B.assembled.html   # -> exit 1

# 2. each checker invoked directly, for per-checker exit codes
for v in base cand-A cand-B; do
  for c in check_original check_structure check_js check_css check_ids \
           check_hooks check_settings_data check_no_emoji check_vocab; do
    python3 $S/$v/pm6-build/checks/$c.py $S/out/$v.assembled.html
  done
done

# 3. the css_vars_defined equivalent, using check_css.py's own regexes
python3 $S/cssvars.py

# 4. the asset policy, both as the pipeline runs it and forced at the bundle
python3 scripts/pm-gui-asset-policy.py validate
python3 scripts/pm-gui-asset-policy.py validate --source-root Concepts/usage-concepts/QwenUsageConcept
```

`node` used by `check_js`: **v20.19.4** at `/usr/bin/node`.

---

## 2. Gate matrix — real exit codes

| checker | base | cand-A (proposal) | cand-B (naive) | hard at g2 |
|---|---|---|---|---|
| `check_original` | PASS | PASS | PASS | yes |
| `check_structure` | PASS | **FAIL** | **FAIL** | yes (and at g0/g1) |
| `check_js` | PASS | PASS | PASS | yes |
| `check_css` | PASS | **FAIL** | **FAIL** | yes |
| `check_ids` | PASS | **PASS** | **FAIL** | yes |
| `check_hooks` | PASS | PASS | PASS | yes |
| `check_settings_data` | PASS | PASS | PASS | yes |
| `check_no_emoji` | PASS | PASS | PASS | yes |
| `check_vocab` | PASS | **FAIL** | **FAIL** | yes (report-only at g1) |
| **`--gate g2`** | **PASS** | **FAIL** | **FAIL** | |

Baseline control lines, verbatim:

```
check_original: OK (PMConcept4.html sha256 470c4f795ddcc381… matches record)
check_structure: OK (global deltas {'div': 0, 'span': 0, 'style': 0, 'script': 0, 'template': 0}, body x1, </html> last, 54 parts match lock)
check_js: OK (18 script blocks parse clean)
check_css: OK (13 style blocks balanced; 251 distinct vars all defined; pm6 hex rule clean)
check_ids: OK (482 distinct ids; 1 baseline dups unchanged; 0 new dups)
check_hooks: OK (72 id hooks, 51 selector probes, 8 inline handler symbols all defined)
check_settings_data: OK (12 categories, 818 settings, all tiers valid, 1 assignment in assembled)
check_no_emoji: OK (0 banned glyphs; 566 warnings)
check_vocab: OK (no gate-regex matches)
```

---

## 3. `check_ids` — handoff claim "exactly 5 collisions" — **CONFIRMED, both halves**

Real `cand-B` (naive port) output, verbatim:

```
check_ids: FAIL
  - NEW duplicate id "projectMenu" x2
  - NEW duplicate id "projectMenuWrap" x2
  - NEW duplicate id "themeMenu" x2
  - NEW duplicate id "themeMenuLabel" x2
  - NEW duplicate id "themeMenuWrap" x2
```

Exactly five, and exactly the five the handoff named. Real `cand-A` output
(chrome dropped) — the handoff's second claim, that dropping
`_shared/usage-chrome.js` clears the gate:

```
check_ids: OK (496 distinct ids; 1 baseline dups unchanged; 0 new dups)
```

**CONFIRMED.** 496 − 482 = 14 net new ids, none colliding. No `u11*`-prefixed id
collides with the base, and the handoff's read of
`checks/baseline_dup_ids.json` (one entry, `{"' + nodeId + '": 2}`, a JS template
artifact) is right — the baseline tolerates zero real duplicates.

---

## 4. `check_css` — handoff claim "HARD FAIL, 19 undefined vars" — **CONFIRMED exactly**

Real `cand-A` output: **32 FAIL lines = 19 undefined vars + 13 raw-hex findings.**
Both sub-counts match the handoff exactly.

### 19 undefined custom properties (verbatim, alphabetical as the checker prints them)

```
var(--accent-cyan) used but never defined
var(--num-font) used but never defined
var(--pm-motion-k) used but never defined
var(--tone-) used but never defined
var(--tone-err-text) used but never defined
var(--tone-info-text) used but never defined
var(--tone-mute-text) used but never defined
var(--tone-ok-text) used but never defined
var(--tone-purple-text) used but never defined
var(--tone-warn-text) used but never defined
var(--us-fill-hot) used but never defined
var(--us-fill-info) used but never defined
var(--us-fill-mute) used but never defined
var(--us-fill-ok) used but never defined
var(--us-fill-purple) used but never defined
var(--us-fill-warn) used but never defined
var(--us-mlb) used but never defined
var(--us-mpc) used but never defined
var(--us-wlb) used but never defined
```

Set-identical to the handoff's §3.4 table of 19. `BASELINE_UNDEFINED = set()`
(`check_css.py:18`) means there is no allowlist to hide behind.

### 13 raw-hex findings, all in `pm6-css-usage-u11` (verbatim)

```
'--u11-pink: #ff4d6d'                       'color: var(--accent-blue, #4c8dff)'
'--u11-orange: #ff8c3a'                     'color: #ff4d6d'
'--u11-lime: #a3e635'                       'color: #2dd4bf'
'--u11-teal: #2dd4bf'                       'color: #a3e635'
'--u11-blue: var(--accent-blue, #4c8dff)'   'color: #ff8c3a'
'--u11-purple: #a78bfa'                     'color: #a78bfa'
'--u11-magenta: var(--accent-magenta, #ff7ac8)'
```

**CONFIRMED** — 13, matching §3.5, and the handoff's structural read is right:
the ban applies only to `<style>` blocks whose id starts with `pm6-css`
(`check_css.py:52`), so parking these in part 18's unlabeled block is a real
escape hatch. Brace balance passed.

---

## 5. The `css_vars_defined` equivalent — **CONFIRMED exactly, at every layer**

Computed with `check_css.py`'s own regexes reused verbatim: uses =
`var\(\s*--([\w-]+)` (`:38`), defs = `--([\w-]+)\s*:` plus
`setProperty\(['"]--([\w-]+)` (`:39-40`).

Consumers — `var()` uses / definitions, distinct, per file:

| file | uses | defines |
|---|---|---|
| `u11-widgets.css` | 36 | 7 |
| `u11-context.css` | 40 | 0 |
| `u11-rundetail.css` | 35 | 0 |
| `_shared/usage-shared.css` | 109 | 103 |
| `_shared/usage-widgets.css` | 44 | 0 |
| **union** | **137 distinct consumed** | **110 distinct self-supplied** |

The handoff's per-file figures (36 / 40 / 35 / 109 / 44 → 137 distinct) are
**exactly right**.

**Token-defining parts — discovered, not assumed.** 34 of the 54 parts define at
least one custom property (268 distinct in total). `02-css-tokens.part.html`
defines **124**; the other significant contributors are
`10x-pm6-css-global.part.html` (54), `03-css-glass-a` / `04-css-glass-b` (28
each), `05-css-shell` (11), `29x-pm6-js-chat` (10), `06-css-components-a` and
`10x-pm6-css-cozy-shelves` (9 each), `29x-pm6-js-dashboard` and
`29x-pm6-js-globals` (8 each). Full map in `real-gate-runs.json`.

Four-layer diff:

| layer | diffed against | undefined |
|---|---|---|
| 1 | `02-css-tokens.part.html` alone, ignoring self-supply | 75 |
| 2 | `02-css-tokens.part.html` + what the 5 ported files define | **22** |
| 3 | all 34 token-defining parts + self-supply | 20 |
| 4 | the whole assembled candidate — **this is the live gate** | **19** |

Layer 2 = **22**, set-identical to the handoff's stated intermediate figure:
`--accent-cyan, --cat, --num-font, --pm-motion-k, --pm6-glass-plate, --tone-,
--tone-err-text, --tone-info-text, --tone-mute-text, --tone-ok-text,
--tone-purple-text, --tone-warn-text, --us-fill-hot, --us-fill-info,
--us-fill-mute, --us-fill-ok, --us-fill-purple, --us-fill-warn, --us-mlb,
--us-mpc, --us-wlb, --wf`.

Layer 4 = **19**, byte-identical to the live `check_css` FAIL list in §4.

The handoff said "three of those (`--cat`, `--pm6-glass-plate`, `--wf`) resolve
elsewhere in the document" — **PARTLY**, and the distinction matters for whoever
does the work:

* `--cat` → defined in `12-html-side-panels.part.html` (another part)
* `--pm6-glass-plate` → defined in `03-css-glass-a.part.html` and
  `04-css-glass-b.part.html` (other parts)
* `--wf` → **not** defined by the base at all. It resolves only because the
  ported payload defines it itself, in an inline `style` attribute emitted by the
  boot script at `u11-prism.html:1416`. Drop or refactor that one line and
  `--wf` becomes a 20th hard failure.

Two further handoff sub-claims, both **CONFIRMED**:

* "the base itself has zero pre-existing undefined vars" — measured
  `used − defined` over `base.assembled.html` = **`[]`**. So `base_undef` really
  is empty and all 19 count as new.
* `--tone-` really is a **comment artifact**. Site verified:
  `_shared/usage-shared.css:161`, text
  `'var(--tone-*)' attribute strings) onto the same >=3:1 --us-fill-* tokens the`.
  `check_css.py:38` scans raw text and does not strip comments. The fix is to
  reword the comment, never to define `--tone-:`.

---

## 6. `check_vocab` — handoff claim "46 matches" — **CONFIRMED exactly**

```
check_vocab: 46 gate-regex match(es)
  [tiers] x22
  [phases] x22
  [Gemini CLI] x2
```

46 total; `Pass [123]`, `Compile Settings`, `platform_specs` and `Tauri` each
match **zero** times. The handoff's per-gate split (22 / 22 / 2) is exact.

Control: `base` reports `check_vocab: OK (no gate-regex matches)` — **all 46 are
u11-borne**. `cand-B` also reports exactly 46, so `usage-chrome.js` contributes
none.

The handoff's characterisation of the hits holds. Representative real lines:

* `tiers` — motion-tier prose in `usage-widgets.css` (assembled 15327-15388:
  *"The instant tier (hover, pickup) and the data tier (refresh, flash)…"*,
  `/* instant tier: never scaled */`, `/* data tier: never scaled */`),
  design-language prose at 15655 (*"three type tiers"*), and **data identity** in
  `u11-data.js` at 44731-44946: `prod:zai-free-tier`, `'Gemini free tier'`,
  `'Z.AI free tier'`, `note: 'Web extraction helper on free tier'`,
  `sub: 'tier-based RPM/TPM, not a fixed counter'`.
* `phases` — `'Goal phase / PlanningRun topic'` prose at 44603 and 44889,
  `label: 'Specialist reviews · phase 2'` at 44905, and the
  `phases: [{label:'Check', …}]` run-detail data arrays at 45356-45393, read back
  at 47840-47842 (`if (op.phases && op.phases.length)`).
* `Gemini CLI` ×2 — both on one line, `u11-data.js` assembled 44692:
  `label: 'Gemini CLI profile'` and `authOwnedBy: 'Gemini CLI'`. This is data
  identity, exactly as the handoff says, and `EXCLUSIONS` (`check_vocab.py:11-16`)
  may not be extended without a PARTS.md update.

---

## 7. `check_no_emoji` — handoff claim "PASSES with 5 warning classes" — **CONFIRMED exactly**

```
check_no_emoji: OK (0 banned glyphs; 579 warnings)
```

**Zero banned glyphs.** The gate passes. Warning classes went 5 → 9 and the total
566 → 579. The delta, diffed class-by-class against the base:

| codepoint | glyph | name | count | status |
|---|---|---|---|---|
| U+2194 | ↔ | LEFT RIGHT ARROW | 3 | new class |
| U+21BA | ↺ | ANTICLOCKWISE OPEN CIRCLE ARROW | 1 | new class |
| U+2248 | ≈ | ALMOST EQUAL TO | 3 | new class |
| U+2264 | ≤ | LESS-THAN OR EQUAL TO | 4 | new class |
| U+2212 | − | MINUS SIGN | +2 | pre-existing class, base 3 → cand-A 5 |

All five classes and all five counts match §3.8 exactly.

### But the stricter policy does not pass — 22 findings

`scripts/pm-gui-asset-policy.py`'s `no_emoji_or_unicode_pseudo_icons`
(`:171-186`) bans the whole arrow (U+2190-21FF), technical (U+2300-23FF),
enclosed (U+2460-24FF) and geometric (U+25A0-25FF) blocks plus a
`PSEUDO_ICON_CHARS` set including U+00D7 and U+2212 — with **no allowlist** for
the PARTS.md typographic glyphs. Real findings in the port bundle: **22**.

| file | count |
|---|---|
| `u11-data.js` | 9 |
| `_shared/usage-data.js` | 4 |
| `_shared/usage-widgets.js` | 2 |
| `u11-widgets.js` | 2 |
| `u11-rundetail.js` | 2 |
| `_shared/usage-shared.css` | 1 |
| `_shared/usage-widgets.css` | 1 |
| `u11-prism.html` | 1 |

Full list (`file:line  codepoint`):

```
_shared/usage-data.js:67     U+2194   canonical names are added alongside (window_kind↔kind, value_state↔vs, …).
_shared/usage-data.js:831    U+2192   /* animate [data-counter] …: VALUE→VALUE —
_shared/usage-data.js:887    U+2192   … bars draw on left→right on first render.
_shared/usage-data.js:915    U+2192   /* draw-on: left→right stagger wave …
_shared/usage-shared.css:342 U+2194   /* focus mode — connected slot↔focus morph */
_shared/usage-widgets.css:5  U+00D7   = --mo-stagger × flow-order index, capped by JS)…
_shared/usage-widgets.js:20  U+00D7   … delayed --mo-stagger × its
_shared/usage-widgets.js:414 U+00D7   /* stagger wave: --mo-stagger × flow-order index…
u11-data.js:6                U+2192   Provider family → Account/profile → Connection → Product/entitlement
u11-data.js:7                U+2192   → Meter(s) → Model(s)
u11-data.js:796              U+2192   'Project Move: Tastebook → Vault'
u11-data.js:1019             U+2192   'GPT-5.6 → Kimi K2 · preflight compression …'
u11-data.js:1032             U+2192   'Model switch · GPT-5.6 → …'
u11-data.js:1036             U+2192   cacheEffect: 'broken → rebuilt'
u11-data.js:1064             U+00D7   'A 4.1× input spike tripped the 1-hour 3.0× rule.'
u11-data.js:1065             U+00D7   ['rule', '3.0× spike'], ['observed', '4.1×']
u11-data.js:1067             U+00D7   'Burn is 2.2× the 7-day norm …'
u11-prism.html:718           U+2212   meta('cache', '−$' + …)
u11-rundetail.js:246         U+2192   … ' Ancestry: ' + a.branch.an…
u11-rundetail.js:369         U+00D7   kv('Decision', R().human(ap.decision) + ' × ' + ap.count)
u11-widgets.js:859           U+21BA   … '<span class="u11w-rec" …
u11-widgets.js:892           U+2212   vrow('h-lime', 'Saved today', pval('−$' + cs.save.toFixed(2)))
```

The handoff (§3.10) named only **↔, ↺ and −** — 3 of 22. The dominant
codepoints are **U+2192 RIGHTWARDS ARROW (7)** and **U+00D7 MULTIPLICATION SIGN
(6)**, neither mentioned. Note that `→` and `×` sit on the PARTS.md allowlist
that `check_no_emoji.py:13` honours, so the two policies genuinely disagree.
That is an owner ruling, not a bug — but the ruling has to be made, and the
handoff's "replace ↔/↺, keep ≈/≤/−" advice is under-scoped by 19 sites.

---

## 8. `check_structure` — **REFUTED. A real hard failure the handoff missed.**

```
check_structure: advisory — 10x-pm6-css-usage-u11.part.html has no manifest.lock entry; expecting balanced-zero tag deltas (sibling-split rule)
check_structure: advisory — 29x-pm6-js-usage-data-a.part.html    … (same)
check_structure: advisory — 29x-pm6-js-usage-data-b.part.html    … (same)
check_structure: advisory — 29x-pm6-js-usage-widgets-a.part.html … (same)
check_structure: advisory — 29x-pm6-js-usage-widgets-b.part.html … (same)
check_structure: advisory — 29x-pm6-js-usage-detail.part.html    … (same)
check_structure: advisory — 29x-pm6-js-usage-icons.part.html     … (same)
check_structure: FAIL
  - <body> count 5 != 1
```

**What the handoff got right.** Its §1.1 balanced-zero reasoning is sound and is
confirmed: all seven new parts printed the advisory and *passed* it, every
per-part `div`/`span`/`style`/`script`/`template` delta matched, the global
deltas stayed `{div:0, span:0, style:0, script:0, template:0}`, `</html>` is
still last, and `manifest.lock` needed no edit. That is real vindication of the
carving plan.

**What it missed.** `check_structure.py:52-54` also asserts
`len(re.findall(r"<body\b", text)) == lock["global"]["body_open_count"]` — a raw
regex over the whole document with **no comment or string stripping**. Contrast
`tag_deltas()` at `:28-34`, which *does* strip `<script>` bodies before counting
`div`/`span`/`template`. The `<body>` count gets no such treatment.

Four ported files write the literal string `<body>` inside CSS/JS **comments**,
and each is counted as a second `<body>` tag:

| site | text |
|---|---|
| `_shared/usage-widgets.css:99` | `The held widget is a fixed clone (.uw-lifted) on <body> above the focus` |
| `_shared/usage-widgets.css:119` | `The focused card is parked on <body> by usage-widgets.js (host chrome wraps` |
| `_shared/usage-widgets.js:325` | `/* a focused card is parked on <body> (see hoistFocus), so lookups that only` |
| `_shared/usage-widgets.js:486` | `scrim. The card is position:fixed, so we park it on <body> beside the scrim` |

1 real `<body>` + 4 comment mentions = **5**.

**Severity.** `check_structure` is in `HARD` for **g0, g1, g2 and g3**
(`assemble.py:34-38`) — the only checker besides `check_original` and `check_js`
that is hard even at g0. The build cannot reach a green gate at *any* level until
these four comments are reworded. The fix is trivial (write `the document body`
or `&lt;body&gt;`), but it is a genuine blocker that must be in the port
checklist.

**Defect class.** This is the *same* failure mode as the `--tone-` comment
artifact in `check_css`: three of these nine checkers harvest tokens from raw
text without stripping comments. The handoff caught one instance and missed the
other — which is exactly the risk of measuring with a re-implementation instead
of the real checker. The simulators never modelled `body_open_count` at all.

---

## 9. `check_js`, `check_hooks`, `check_settings_data`, `check_original` — all **CONFIRMED PASS**

```
check_js: OK (24 script blocks parse clean)                     # base: 18
check_hooks: OK (72 id hooks, 51 selector probes, 8 inline handler symbols all defined)
check_settings_data: OK (12 categories, 818 settings, all tiers valid, 1 assignment in assembled)
check_original: OK (PMConcept4.html sha256 470c4f795ddcc381… matches record)
```

* `check_js` — all 6 new script blocks plus the rewritten part-18 boot block
  parse clean under `node --check` v20.19.4. The handoff's claim that the u11
  payload is ES5-style IIFE code that parses standalone is confirmed, as is its
  warning that each part must be one complete script block (that is precisely
  what made this pass).
* `check_hooks` — unchanged from the base: 72 id hooks, 51 selector probes, 8
  inline handler symbols. The u11 markup introduces no inline `on*=` handler that
  no script defines, and disturbs no MUST-EXIST hook. `#panel-usage` is still
  present exactly once (the replacement part 18 keeps it).
* `check_settings_data` — unchanged; part 28 and the sidecar were not touched, as
  the handoff instructed.

---

## 10. `scripts/pm-gui-asset-policy.py` — the four font references

### As the real pipeline invokes it

`scripts/pm-plans-verify.py:3605` runs the validator as
`[sys.executable, str(validator), "validate"]` — **with no `--source-root`**.

```
$ python3 scripts/pm-gui-asset-policy.py validate
status: not_applicable | policy_state: pending_no_gui_source_yet
source_roots: ["tests"] | checked_files: 0 | failures: 0 | exit 0
```

`SOURCE_ROOTS` (`pm-gui-asset-policy.py:15-30`) is
`ui, src, app, apps, crates, frontend, web, wasm, native, assets, resources,
tests, fixtures, snapshots`. Only `tests` exists in this repo and it holds no
GUI-trigger file, so the policy short-circuits at `:413-425`. **`Concepts/**` is
entirely out of scope for the asset policy as wired into `run-gates`.**

### Forced at the bundle

```
$ python3 scripts/pm-gui-asset-policy.py validate --source-root Concepts/usage-concepts/QwenUsageConcept
status: fail | policy_state: enforced | exit 1
checked_files: 39 | failures: 124 total | 26 inside the 18-file port bundle
```

Of those 26: **4 `no_network_or_cdn_icons` + 22 `no_emoji_or_unicode_pseudo_icons`**
(the latter itemised in §7).

### Verdict on the four font references — **PARTLY**, and defused twice over

Real findings, matched by `REMOTE_ICON_RE` (`:74-77`, alternation includes
`fonts\.googleapis|fonts\.gstatic`):

| line | host | excerpt |
|---|---|---|
| 9 | fonts.googleapis.com | `<link rel="preconnect" href="https://fonts.googleapis.com">` |
| 10 | **fonts.gstatic.com** | `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` |
| 11 | fonts.googleapis.com | `<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Cal+Sans&…">` |
| 12 | fonts.googleapis.com | `<noscript><link href="https://fonts.googleapis.com/css2?family=Cal+Sans&…" rel="stylesheet">` |

First correction: they are **four external font-host references, not four
`fonts.googleapis.com` references** — three are googleapis, line 10 is
`fonts.gstatic.com`. Both are named in the policy regex, so all four fail; the
count is right, the attribution in the framing is not.

Then two measured facts that defuse the finding for *this port*:

1. **The port does not carry them.** All four live in `u11-prism.html`'s
   `<head>`, lines 9-12. The ported slices are `:21-341`, `:348-528`, `:531-546`
   and `:561-1462`. A grep for `fonts.googleapis`, `fonts.gstatic`,
   `cdn.jsdelivr`, `unpkg` and `cdnjs` across those slices returns **0** for
   every pattern. The `<head>` is dropped by construction.
2. **The port target already ships the identical four.**
   `Concepts/pm6-build/parts/01-head-prelude.part.html` carries the same
   preconnect / preconnect / preload / noscript quartet, landing at assembled
   lines **67, 68, 71, 72**. `base.assembled.html` and `cand-A.assembled.html`
   both contain exactly 4 remote font references. **u11 introduces no new
   violation of this policy; the pre-existing PM6/PM7 head already holds it.**

So: the four references are a genuine policy hit on the *concept source file*, a
non-issue for the *ported payload*, and an unremediated pre-existing condition in
the *target* — which is not currently detected because the policy's default roots
exclude `Concepts/**`.

---

## 11. Net disposition

| handoff claim | verdict | real measurement |
|---|---|---|
| `check_ids`: 5 collisions, all chrome-borne, gate clean once chrome is dropped | **CONFIRMED** | 5 named duplicates in cand-B; cand-A `OK` |
| `check_css`: 19 undefined vars | **CONFIRMED exactly** | 19, set-identical |
| `check_css`: 13 raw-hex findings in a `pm6-css-*` block | **CONFIRMED exactly** | 13, verbatim |
| `css_vars`: intermediate 22 vs `02-css-tokens` alone | **CONFIRMED exactly** | layer-2 diff = 22, set-identical |
| `css_vars`: base has zero pre-existing undefined vars | **CONFIRMED** | `used − defined` = `[]` |
| `css_vars`: 3 of the 22 "resolve elsewhere in the document" | **PARTLY** | 2 resolve in other parts; `--wf` only because the payload defines it at `u11-prism.html:1416` |
| `--tone-` is a comment artifact | **CONFIRMED** | `_shared/usage-shared.css:161` |
| `check_vocab`: 46 matches, 22/22/2 | **CONFIRMED exactly** | 46, split exact; base = 0 |
| `check_no_emoji`: passes, 5 new warning classes | **CONFIRMED exactly** | 0 banned; ↔3 ↺1 ≈3 ≤4 −+2 |
| `check_js` / `check_hooks` / `check_settings_data` / `check_original`: pass | **CONFIRMED** | all exit 0 |
| `check_structure`: new parts pass on balanced-zero; lock needs no edit | **CONFIRMED** (as far as it goes) | 7 advisories, all deltas match |
| `check_structure`: overall disposition | **REFUTED** | **hard FAIL, `<body> count 5 != 1`**, unmentioned in the handoff |
| four `fonts.googleapis.com` refs at `u11-prism.html:9-12` | **PARTLY** | 4 real hits but 3 googleapis + 1 gstatic; not in the ported slices; target already ships the same 4; policy as wired does not scan `Concepts/**` |

**Two additions to the port checklist that the handoff does not contain:**

1. **Reword the four `<body>` comment mentions** in
   `_shared/usage-widgets.css:99,119` and `_shared/usage-widgets.js:325,486`.
   Without this, `check_structure` hard-fails at every gate including g0 — the
   single most blocking item found, and the only one that stops a build before
   the vocabulary and token work even matters.
2. **Get an owner ruling on `→` and `×`** (7 + 6 sites). `check_no_emoji` allows
   them via the PARTS.md allowlist; `pm-gui-asset-policy.py`'s
   `no_emoji_or_unicode_pseudo_icons` bans them with no allowlist. The two
   project policies contradict each other and the handoff's §3.10 advice covers
   only 3 of the 22 affected sites.
