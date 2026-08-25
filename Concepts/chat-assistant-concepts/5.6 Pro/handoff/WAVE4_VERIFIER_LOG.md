# Wave 4 — Independent Verifier — LOG

Working dir: `Concepts/chat-assistant-concepts/5.6 Pro/`
Scratch: `scratchpad/w4v/`
Owns: `tests/audit.mjs` + new files under `tests/` and `scratchpad/`.
Edits NOTHING in app.js / styles.css / modules.

## Status
- [x] Read ORCHESTRATOR_NOTES.md + PLAN.md
- [ ] T1 audit.mjs repair (cleanup + scoping + orphan gate)
- [ ] T2 independent re-verification
- [ ] T3 eye checks
- [ ] T4 latent-class sweep

## Running notes
### 00 — start
Read notes + plan + tests/audit.mjs (161 lines, one-per-line dense style).
Confirmed by reading: audit.mjs has NO cleanup between `safe()` blocks — `safe()` catches and
moves on, leaving whatever overlay/state the throwing test left behind.

### 01 — baseline + FIRST STRUCTURAL DEFECT IN audit.mjs
`build.py --check` green (sha `f98e2712cd7ec249` at 03:07; the tree is LIVE — app.js was
rewritten at 03:07 and context.js at 03:03 while I was measuring, so all my audit runs go
against an **isolated snapshot** of `index.html` copied into `scratchpad/w4v/root/`).

**DEFECT A (audit.mjs, crash not failure).** `inViewport()` and `noPageOverflow()` are called
at TOP LEVEL, outside `safe()`. `inViewport` awaits `locator(...).first().evaluate(...)`, which
throws `TimeoutError` after 30s when the element is missing. First real run:

```
locator.evaluate: Timeout 30000ms exceeded.
  - waiting for locator('[data-overlay="root-menu"]').first()
  at inViewport (tests/audit.mjs:27:53)  <- called from audit.mjs:57
```

Node exits with an **uncaught exception**: the process dies, `reports/audit.json` is NEVER
written, and the previous report is left on disk looking current. A suite that can leave a
stale green report behind when it dies is worse than one that fails.
Occurrences of unprotected `inViewport`/`noPageOverflow` at top level: 3 (`:42`, `:57`, `:149`).

### 02 — baseline numbers (frozen snapshot, immune to concurrent rebuilds)
`scratchpad/w4v/root/index.html` = a copy of the 03:07 build. `audit_baseline.mjs` (an
untouched copy of the shipped suite) against it: **434 pass / 0 fail / 0 console / 0 page**.
That is the reference the repaired suite has to match or beat.

### 03 — tests/orphan-gate.mjs written — and it caught TWO instrument errors in ITSELF
New file `tests/orphan-gate.mjs`, importable (`runOrphanGate(browser,{src,html})`) and
standalone (`node tests/orphan-gate.mjs [--src DIR] [--html FILE] [--json OUT]`).

**Self-inflicted error 1 — the gate measured nothing and reported a confident zero.**
First run: `sources 0  static 0  sheets 0  ORPHAN selector parts: 0`. `new URL(import.meta.url)
.pathname` leaves `%20` in "5.6 Pro", so `readdirSync` listed a directory with no sources and
the verdict was computed over an empty input. Fixed with `decodeURIComponent`, plus hard
guards: <100 static tokens, 0 sources, 0 sheets or <200 harvested classes now THROW instead
of returning a green.

**Self-inflicted error 2 — 68 of 111 interpolation patterns were `^[A-Za-z0-9_ -]*$`.**
`class="${cls}"` produces a pattern that matches every class name in existence, so "0 orphans"
was structurally guaranteed a second time. Patterns now need >=3 literal ident characters and
must fail a sentinel string; 238 unconstrained patterns are DISCARDED and counted in the report.

**Third correction, this one about false POSITIVES.** With the wildcards gone the gate reported
31 hard orphans -- and every one was constructible: this codebase assembles class names by
CONCATENATION (`'goal-status-chip tone-' + s.tone`, `cls(true,'pm56-'+L.k+'-nomo')`), which a
`class="([^"]*)"` regex cannot see, because the attribute is split across JS string literals and
never closes its quote inside one. Two fixes: the class-attribute regex no longer requires the
closing quote, and `'a' + expr + 'b'` is collapsed to the same `${}` hole shape the template
path already understands.

**Positive control (the gate can still go red):** the five class names Wave 1B deleted as
orphans -- `popup-menu`, `menu-panel`, `model-picker`, `activity-domain`, `live-agent` -- are
still rejected by the token+pattern set, as are two invented sentinels. So the suppression
tiers did not neuter it.

Verdict buckets, because "orphan" and "state I did not exercise" are different claims:
- **HARD** (fails): not observed at runtime, not a static class token, not a pattern, and not
  even a bare string literal anywhere in the JS -- nothing can produce it.
- **soft** (reported, named to its owning module): constructible or literal, but never observed.
Current result vs the live sources: **3 HARD, 98 soft** (see later step; the 3 are in
`questions.css`, which Wave 4 Decisions is writing right now).

### 04 — audit.mjs repaired; first run found two things
`tests/audit.mjs` rewritten (same assertion labels, so the 434 baseline stays comparable):
per-test `cleanup()` that verifies itself, a `one()` matcher-hygiene helper (fails on 0 matches
AND on more matches than the assertion declares), all geometry probes inside `safe()`, the
report written from a `finally`, plus three summary assertions (matcher hygiene x2, test
isolation) and the orphan gate.

First run vs the frozen snapshot: **438 pass / 8 fail**, and both failure clusters were real.
1. **Hover cards were not being dismissed** — my first cleanup had no hover branch, so five
   `Activity hover preview` tests each left `[data-overlay="hover"]` on screen. Fixed.
2. **`Read src/analytics/queries.rs` matched NOTHING.** Chased it: the shipped assertion
   "Working chrome compacts and re-expands a phase" never set a take. It ran on whatever the
   preceding 24-option loop left selected (**option 23**) and passes only for that reason.
   Swept all 24: **takes 1, 2, 9, 12 and 16 fail it** — take 9 has no `.wa-disc` at all, take 2's
   disc is not clickable (timeout) and leaves 3 rows open, takes 1/12/16 have the disc and
   expanding does nothing. (Take 1 is Orbit, whose module now owns its own chrome, so its
   absence is by design; the other four are not.) The test is now PINNED to take 3, and a new
   sweep assertion covers the rest so pinning cannot hide them.

### 05 — CROSS-MODULE COLLISION, found by re-running History's harness (item 3/4)
`history-verify.mjs` re-run: **59 pass / 1 fail** against the author's 60/0. The failure is
`The move is ANIMATED (FLIP), not a teleport` -> `{"count":0,"mine":[]}`.

Root cause, read from the sources and then confirmed at runtime:
**`toggle-thread-pin` is registered by TWO modules** — `history.js:360` (which does the FLIP)
and `threadops.js:1444`. `PM56_EXT.action(name,fn)` is a plain assignment
(`this._actions[name]=fn`), so the LAST module in `build.py`'s MODULES order wins, and
`threadops` is after `history`. Runtime confirmation: the live
`PM56_EXT._actions['toggle-thread-pin']` source begins
`function (ctx, btn) { var t = threadById(ctx, btn.dataset.id); ... dispatch(CMD.pin, t.id); ...`
— that is threadops'. History's FLIP is dead code.

**A second collision on the same mechanism:** `reset-all` is registered by `goals.js` AND
`threadops.js`; threadops wins, so Goals' reset behaviour is also unreachable.

The registry has **no collision detection at all** — a second registrant silently replaces the
first, with no console warning. `slot()` appends (multiple registrants are legal and expected:
`headerExtras` has 5, `historyChrome` 2, `messageAffordance` 2), but `action()` and
`actionAfter()` overwrite.

### 06 — TASK 3, eye check: Menus' close-opacity claim — CONFIRMED, with a caveat
Looked at `menus/close-contact-sheet.png` (12 frames). Frames #0-#8 show the persona menu at
full size and fully legible; #9 and #10 are visibly smaller and still completely opaque, every
row and its description readable; only #11 shows the surround beginning to come through. So
"stays opaque through most of the collapse" holds by eye.
Caveat worth recording: **9 of the 12 frames show no size change at all.** That is the phantom
click round-trip the brief warns about, not a slow menu — so the contact sheet on its own is a
weak instrument for this claim. The load-bearing evidence is the in-page per-frame sample
(re-measured in my own re-run of `menus-verify`): opacity is still **1.000 at t=205ms of a
255ms trace** with scaleY already at 0.699, and the fade starts at **86.3%** of the close.
Expressed as a fraction of the collapse rather than of time: the box is fully opaque through
**72.5%** of the vertical travel ((1-0.633)/(1-0.494)).

### 07 — TASK 3, A/B pixel read: History's clip-path insets — CONFIRMED
`scratchpad/w4v/clip_ab2.mjs`. First attempt was MY instrument error and is worth recording:
it measured the drawer at rest, which is **pinned**, and `history.css:285` sets
`box-shadow:none` when pinned — so run 1 could not have been testing the shadow claim at all.
Corrected: unpin first (the only state carrying `--shadow-float`), re-read geometry in both
states, screenshot the SAME rectangle.

| | clip-path | computed box-shadow | drawer x / w | strip mean luminance |
|---|---|---|---|---|
| A (shipped) | `inset(-90px -90px -90px 0px)` | `rgba(0,0,0,.42) 0 18px 65px, rgba(0,0,0,.26) 0 4px 18px` | 782.59 / 300 | **16.14** |
| B (forced) | `inset(0px)` | **identical string** | 782.59 / 300 | **19.34** |

Layout identical, computed shadow identical, painted pixels different — and the per-column
delta decays monotonically with distance from the drawer edge
(`-6.52, -5.73, … -2.80, -2.54` over 20px), which is the profile of a drop shadow rather than
of an edge artefact. So: the negative insets ARE load-bearing, `inset(0)` does clip the shadow
away, and computed style cannot see it. Claim confirmed.
(My own verdict line had the polarity backwards — a dark shadow LOWERS luminance — which is
why the printed VERDICT reads false while the data says the opposite. Recorded rather than
quietly corrected.)

### 08 — item 7's single red is an INSTRUMENT ERROR, proved
`abverify.mjs` re-run: **27/28** vs the claimed 28/28. The red is
`each icon paints a saturated (lit) colour, not grey chrome`, with
`goal {sat:18, rgb:[19,23,37]}` and `todo {sat:12, rgb:[14,17,26]}` — pure background.
Reproduced its exact method with a fresh position and got **sat 71/126/121/137/133** for the
five icons; sampled the goal icon 24 times over 2.4s (it runs `ab-breathe`) and its painted
saturation never fell below **75**, so an animation trough is not the cause either.
Root cause found by instrumenting a copy (`scratchpad/w4v/ab_diag.mjs`) with an
`elementFromPoint` at crop time: the icons had moved **35px to the right** between
`iconState` being captured and the crops being taken (`capturedAt x=1028` vs `nowAt x=1063`
for all five). The harness crops a viewport rectangle recorded before a re-render — a stale
rect, which is the same "measure now, read later" trap this project keeps hitting.
**Item 7's property holds; the assertion is unsound.** Owner should re-measure inside the crop.

### 09 — TASK 4A, fixed-track grids fed by shared slots — swept as an EXPERIMENT
Guessing the shape from CSS produced 28-40 false hits (every single-row 3-column grid).
So `scratchpad/w4v/slotstress.mjs` reproduces the CAUSE instead: register ONE extra
registrant into each of the **19** live slots in turn, force a render, and diff the
zero-height/overlap state of every grid on the page against the same page before.
**Result: 0 of 19 slots break their host.**

That is only meaningful with a positive control, so: `slotstress_pc.mjs` restores the pre-fix
layout (`styles.css:100/298` gave both history hosts `display:grid;
grid-template-rows:auto auto minmax(0,1fr)`; `history.css:370-372` replaced it with a flex
column) and re-runs the `historyChrome` stress. It goes **red immediately** — track list
becomes `45px 78.19px 0px 18.84px 49px 642.97px`, `.ph-chrome` collapses to 7px and overlaps
`.w4v-probe` by 7px. The detector works; the clean sweep is a real negative.

### 10 — TASK 4B, viewport tiers vs the editor split — A LIVE DEFECT THE SUITE CANNOT SEE
First attempt measured nothing: I dispatched synthetic `pointermove` on `window` while app.js
listens on `document`, so the pane stayed 657px at all six split positions and the sweep
"found nothing". Redone with Playwright's real mouse.

Holding the **viewport fixed** and dragging only the editor split:

| viewport | split | pane | chat stage | body.scrollWidth vs clientWidth |
|---|---|---|---|---|
| 1440 | 54% (stock) | 660 | 460 | 1440 / 1440 |
| 1440 | 66% | 488 | 288 | 1440 / 1440 |
| 1440 | **70%+** | 430 | **249** | **1469 / 1440 — 29px overflow** |
| 1280 | max | — | — | **1309 / 1280 — 29px overflow** |
| 1100 | max | — | — | 1100 / 1100, but `i.wa-count` sticks out 16px |
| 1920 | max | — | — | clean |

The overflowing element is **`button.context-ring`, +29px**, plus **`i.wa-count`, +13px** at
80%. At 1440/70% the chat column is **249px** — narrower than the 430px viewport tier — while
none of the narrow rules are applied, because every tier is a `@media (max-width: …)` on the
VIEWPORT and the viewport never changed.
`tests/audit.mjs` sweeps 5 viewport widths x 8 themes and **never moves the split**, which is
exactly why 434/434 could be green with this live. A four-position split sweep at 4 viewports
is now part of the suite.

### 11 — item 6 re-verified by a DIFFERENT method (fixture-anchored, not ring-vs-menu)
`tests/context-verify.mjs` re-run: **96 pass / 0 fail** (author claimed 94/0; the harness has
grown two assertions since). That is a re-run of the author's instrument, so it does not close
the item on its own.

Second method, `scratchpad/w4v/ctx_ind.mjs`: the author's headline claim is "the ring agrees
with the menu". Two renderings agreeing with each other is weaker than either agreeing with the
source — one shared helper makes them agree while both are wrong. This compares **five
surfaces against `PM56_DATA.contextByThread`** instead: `data-value`, the computed
`--context-pct`, the ring `title`, the compact menu's `.ctx-frac` head, and the status bar.

| thread | fixture used/limit | fixture % | data-value | --context-pct | title | menu head | status bar |
|---|---|---|---|---|---|---|---|
| query | 83900/131000 | 64 | 64 | 64 | 64 | 64 | 64 |
| plain | 49368/131000 | 38 | 38 | 38 | 38 | 38 | 38 |
| subagents | 121100/196000 | 62 | 62 | 62 | 62 | 62 | 62 |
| debug | 96000/200000 | 48 | 48 | 48 | 48 | 48 | 48 |
| context | 53568/131000 | 41 | 41 | 41 | 41 | 41 | 41 |
| no-models | 8168/128000 | 6 | 6 | 6 | 6 | 6 | 6 |

Plus: the six percentages are genuinely different (so the equality is not vacuous),
`no-models` reads **"Cache hit not reported"** rather than a confident 0%, and a negative
control (tampering with `data-value`) makes the comparison go red. **11 pass / 0 fail.**
(One instrument error on the way, recorded: my first `.meta-pill` selector matched nothing and
turned six passes into six failures — a matcher matching nothing, again.)

### 12 — item 9 re-verified by a DIFFERENT method — `tests/lens-independent.mjs`, 34/0
New file. Instead of the author's drive-and-screenshot, every claim is cross-checked between
THREE readings that must agree on the same SET of message ids: `PM56_LENS.slice()` (the store),
`.pm-lens-mark[data-lens-state|data-lens-sel]` (the render), and `effectiveHistory()` (the
projection). Highlights:
- the cap is tested UPWARDS: 25 toggles with a model-vs-DOM set comparison after **every single
  click** (0 divergences), then a 26th in the same operation is **refused, not truncated**
  (`before 25 -> after 25`, the 26th not selected) and the refusal is announced.
- seal -> `ops:[25]`, selection 0, and the sealed ids are exactly the 25 selected;
  then the 26th shapes -> **shapedCount 26, union size 26, ops still [25]**. The cap accumulates.
- Turn Off is asserted with a POSITIVE CONTROL first (26 marks and 26 gutter controls proven
  present), then 0/0/0/0 after, capability `Off`, receipt naming what was released, and the
  thread still holding all 26 messages.
- Subcompact holds its selection and only becomes an operation on the explicit Apply; a
  rehydration handle appears.
- `--selftest` negative controls all went red on purpose: 5-muted reads 5 (not a constant),
  removing ONE `data-lens-sel` breaks the set comparison, `PM56_LENS.reset()` zeroes every read.

Four instrument errors of my own on the way, all recorded rather than shipped as verdicts:
`effectiveHistory` emits a `system` entry per non-text message and lens receipts ADD non-text
messages, so my first denominator was wrong (three false REFUTEDs); lens.css dims
`> .message-surface`, not the `<article>`; the gutter button is absolutely positioned outside
the article box; and `.pm-lens-mark` is a zero-size `<i>` that Playwright refuses to scroll.

### 13 — the repaired suite, measured
Against the frozen snapshot: **445 pass / 1 fail / 0 console / 0 page**, vs the untouched
suite's 434/0 on the same build.
- **cleanup: 69 runs, 0 left anything open.**
- **matcher hygiene: 28 text assertions, 0 matching nothing, 0 unscoped.**
- **orphan gate: 0 HARD / 109 soft, LIVE token set 1139.**
- the single red is the new all-24-takes phase sweep (takes 1, 2, 12, 16).
Orphan gate re-run against the LIVE tree at a stable build (`3c714038ea771007`, checked before
and after): **0 HARD, 110 soft, 997 static + 106 patterns + 713 runtime = 1139 LIVE.**

### 14 — the FLIP collision, settled with a CONTROL BUILD (not an argument)
Built a deliverable identical to the shipped one except `threadops.js` blanked
(`scratchpad/w4v/noto/`, sha `a02229c66a9334bf`) and re-ran History's own harness against it:

| build | history-verify (normal motion) |
|---|---|
| shipped | **59 pass / 1 fail** — `The move is ANIMATED (FLIP), not a teleport` |
| threadops.js blanked | **60 pass / 0 fail** |
| history.js + history.css blanked (negative control) | **2 pass / 58 fail** |

So the dead FLIP is caused by the `toggle-thread-pin` registration collision and nothing else,
and History's harness is genuinely capable of failing (2/58).

Note the asymmetry that makes this worth a registry fix rather than a one-line patch:
`goals.js` **chains** (`return prevReset ? prevReset(ctx,btn,ev) : false`) because its author
knew the hazard; `threadops.js` does not, for either action. A registry where the safe pattern
is optional and undiscoverable will keep producing this.

### 15 — the split sweep only became an assertion once it could go red
Added, then found it passing at 1440 while my standalone probe said 29px overflow. Two causes,
both mine, both instructive:
1. it inherited the component-family sweep's variants instead of starting from stock;
2. it read the resizer's box ONCE and then dragged from that stale position four times, so
   after the first drag the pointerdown missed the handle entirely and the sweep measured one
   layout four times.
Both fixed, plus a guard that FAILS if the split did not actually move
(`new Set(reached).size < 3`). It now reports:
`No page overflow at 1440 across the editor split range` ->
`[{askedPct:70, bw:1469, cw:1440, editorPct:69.8, over:["button.context-ring+29px"]}, …]`
and the same at 1280. 1920 and 1100 stay green, so it is not a blanket red.

### 16 — 15f re-checked (the origin of the whole "434/434 with twelve live defects")
`PM56_RUNTIME.snapshot()` now measures things that move:
at rest `{activityDomains:5, artifacts:2, menus:0}`; with a menu and the panel open
`{activityDomains:5, artifacts:20, menus:1}`. Independent counts agree
(`.activity-item[data-hover-domain]` = 5, `#pmOverlayRoot .overlay-menu` = 1).
**Zero metrics are permanently zero.** `listTriggers()` returns 88.

### 17 — FINAL suite state (frozen snapshot, sha 9a82383028f9667b)
**443 pass / 3 fail / 0 console errors / 0 page errors**, vs the untouched suite's 434/0 on the
same build. All three reds are real and precisely attributed:
1. `Phase compact and expand across all 24 working takes` — takes 1, 2, 12, 16.
2. `No page overflow at 1440 across the editor split range` — `button.context-ring` +29px.
3. `No page overflow at 1280 across the editor split range` — same element, +29px.
Cleanup: **0 of 69 runs left anything open.** Matchers: 28, none matching zero, none unscoped.
Orphan gate: **0 HARD / 109 soft**, LIVE token set 1139.

Files I own and changed: `tests/audit.mjs` (rewritten), `tests/orphan-gate.mjs` (new),
`tests/lens-independent.mjs` (new). No edit to `app.js`, `styles.css`, `data.js`, any module,
`index.html` or the standalone. Nothing committed.

### 18 — live-tree confirmation
Also ran the repaired suite against the LIVE tree (not the snapshot): **443 pass / 3 fail /
0 console / 0 page**, orphan gate **0 HARD / 110 soft**, cleanup 0 of 69 dirty. The take sweep
is down to takes **1, 12, 16** there (take 2 was fixed by the Orbit agent between my snapshot
and that run). The two split overflows reproduce identically.
Caveat stated rather than hidden: the live build sha moved during that run
(`580dada9b99ccddb` -> `f45363887f00b897`) because three Wave 4 agents are editing. The
reproducible numbers are the snapshot ones (`9a82383028f9667b`).

### 19 — RANKED VERDICT TABLE

| # | Item / claim | Claimed | My independent result | Verdict |
|---|---|---|---|---|
| 1 | **`toggle-thread-pin` registered twice** (history.js:360, threadops.js:1444) | not known | threadops wins; History's FLIP is dead code. Control build with threadops blanked: **60/0**; shipped: **59/1** | **REFUTED — live defect** |
| 2 | **`reset-all` registered twice** (goals.js, threadops.js) | not known | threadops wins and does not chain; goals' `restoreFixture()` is unreachable | **REFUTED — live defect** |
| 3 | **Editor-split overflow** | not tested at all | `button.context-ring` +29px at 1440 and 1280 with the viewport unchanged | **NEW live defect** |
| 4 | **Phase compact/expand** (audit assertion) | 434/434 green | true only for the take the previous loop happened to leave; **takes 1, 12, 16 fail** (2 fixed mid-run, 9 has no disc by design) | **REFUTED — assertion was accidental** |
| 5 | Item 7 `abverify` "icons are lit" | 28/28 | **27/28**; the red is a stale crop rectangle (icons moved 35px between capture and crop). Property independently confirmed: painted saturation 71-137 | **CONFIRMED (harness unsound)** |
| 6 | Item 6 Context | 94/94 | re-run **96/0**; second method (5 surfaces vs the FIXTURE on 6 threads) **11/0** with a negative control | **CONFIRMED** |
| 7 | Item 9 Context Lens | 45/0, one harness | `tests/lens-independent.mjs` **34/0**, different method, 3 negative controls seen red | **CONFIRMED** |
| 8 | Item 8 (close condition = Demo Data's harness) | 35/0 | **37/0**; `metaNodes:20`, route-06/08 differ, 16 fields, **0 mismatches** vs fixture | **CONFIRMED** |
| 9 | Items 3+4 History | 60/0 · 57/0 · 2/58 | **59/1** · **57/0** · **2/58**; the 1 is #1 above, not History's | **CONFIRMED except the FLIP** |
| 10 | Item 5 Menus | 80/80 | **80/0**; close-opacity eye-checked on the contact sheet | **CONFIRMED** |
| 11 | Item 1 Activity Panel | 54/0 | **54/0** | **CONFIRMED** |
| 12 | History clip-path insets | claimed, needed A/B | A/B pixel read: identical layout, identical computed shadow, mean luminance 16.14 vs 19.34 with a monotone falloff | **CONFIRMED** |
| 13 | Menus close stays opaque | claimed | eye check + in-page trace: opaque through **72.5%** of the vertical collapse, fade at 86.3% | **CONFIRMED** |
| 14 | 15f snapshot metrics | fixed | `activityDomains 5`, `menus 0->1`, `artifacts 2->20`; **no metric is permanently zero** | **CONFIRMED** |
| 15 | Task 4A: slot-fed fixed-track grids | one found | 19 slots stressed with a second registrant: **0 break**; positive control reproduces the History bug | **CONFIRMED — none left** |
