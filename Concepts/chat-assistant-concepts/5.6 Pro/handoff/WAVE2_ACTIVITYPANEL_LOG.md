# Wave 2 — Activity Panel (item 1) — work log

Owner: `activity-panel.js` + `activity-panel.css` ONLY.
Audit invocation: `node tests/audit.mjs reports/audit.json ./tests` (writes JSON, prints nothing;
read `reports/audit.json` for pass/fail counts).

## Baseline captured before any edit
- `python3 build.py --check` PASSES, sha256 `954ffc57c4b491af`.
- audit: 434 pass / 0 fail / 0 console errors / 0 page errors.

## Plan
Replace the whole `activityPanelBody` slot with eight structurally distinct concepts, all fed by
one derived item model so no count is ever hand-written.

| # | Name | Structure |
|---|---|---|
| 0 | Accordion Inspector | five `.activity-section` accordions (the baseline), rows selectable |
| 1 | Status Board | `.activity-concept-board` tile grid + a focused-domain detail strip |
| 2 | Goal Tree | `.activity-goal-tree` root/branch/leaf with collapsible branches |
| 3 | Split Master/Detail | `.activity-master-detail` domain rail + list + item detail |
| 4 | Agent Board | `.activity-agent-board` status lanes of progress cards |
| 5 | File Ledger | `.activity-ledger` mono table, changed-file rows expand to real diff hunks |
| 6 | Live Work Feed | `.activity-live-feed` timeline, newest first, live head node |
| 7 | Overview Dashboard | `.activity-dashboard` + `.ring-mini` SVG donuts + headline metrics |

Cross-cutting (all 8): `state.activity.domain` genuinely filters (`scope` focus/all), Todo rows
clickable, subagent/change/artifact rows keep the canonical `open-agent`/`open-change`/
`open-artifact` actions and additionally record `state.activity.selected`.

## Progress
- [x] 0. Baseline + reading. Wave 1A/1B logs, FIXTURE_SCHEMA, DATA_HANDOFF read.
- [x] 1. Module skeleton + derived item model + **concept 0 Accordion Inspector**.
      Probe: boot true, 0 console errors, 0 page errors, `activityPanelBody` registered,
      5 `.activity-section`, 38 `.pmap-row`, scope strip present. `goalSection` is registered by
      the Goals agent and is being consumed (not re-authored).
- [x] 2. **Concept 1 Status Board** — `.activity-concept-board` widened to `>button`; five
      count-first tiles with a settled-share meter and a tone footer; the focused tile spans both
      columns and grows; one detail strip underneath. Probe: 145 nodes / 7,732 chars.
- [x] 3. **Concept 2 Goal Tree** — `.activity-goal-tree` root/branch/leaf; goal is the root,
      each domain a collapsible branch (`activity-branch`), each record a leaf; second indent
      level added (`.tree-leaf`, `.tree-leafbox`). The scaffold's `span{padding:5px 7px}` had to
      be neutralised for nested spans or every label inside a button got padded.
      Probe: 100 nodes / 7,066 chars.
- [x] 4. **Concept 3 Split Master/Detail** — `.activity-master-detail` rail + `.detail` summary
      box, record list underneath at full panel width. Rail carries an "All" entry (the only way
      to see more than one domain), so a mis-wired filter is immediately visible.
      Probe: 730 nodes, 5 groups in scope=all, 1 in scope=focus.
- [x] 5. **Concept 4 Agent Board** — `.activity-agent-board` cards sorted into status lanes
      Working / Stalled / Waiting / Changed / Queued / Settled across every domain. "Blocked"
      reads as *stalled* per the goal handoff. Probe: 797 nodes.
- [x] 6. **Concept 5 File Ledger** — `.activity-ledger` widened to `>button`, 4-column
      Domain/State/Record/Δ table; a changed-file row expands **in place** to the real
      `changes[].hunks` unified diff (`activity-diff`). Probe: 446 nodes.
- [x] 7. **Concept 6 Live Work Feed** — `.activity-live-feed` timeline, stamped records sorted by
      their fixed ISO time (unstamped keep fixture order behind them — no invented clock), live
      head node naming what is moving now. Probe: 343 nodes.
- [x] 8. **Concept 7 Overview Dashboard** — `.activity-dashboard` auto-fit to 5 cells,
      `.ring-mini` re-purposed from a filled disc to an SVG donut with the % inside; each ring
      carries a caption stating what its arc measures; 4 derived headline metrics. Probe: 220.
- All eight verified structurally distinct: node counts 727/229/148/729/797/446/343/220 and
  eight different root class names. Boot true, 0 console errors, 0 page errors.

## Bug found in another module, guarded here, reported there
`goalSection` (goals.js) returns **11 `<div>` opens / 10 closes** — one unclosed div
(spans 82/82, buttons 15/15). `pmPatch` parses the whole app as ONE fragment, so an unclosed tag
does not stay local: in concept 3 it nested four of five domain groups inside the goal group and
pulled `.panel-resize` *inside* `.activity-scroll`. Concept 0 masked it only because the
enclosing `</section>` implicitly closed the div.
Guard added here: `sealed()` round-trips any foreign slot output through a `<template>` so the
HTML parser closes whatever a slot left open. Messaged Wave2-Goals to fix it at source.

## Not mine: the horizontal-overflow failures in reports/audit.json
61 `No page horizontal overflow` failures (body scrollWidth 1445-1446 vs 1440) reproduce at
**initial state with the activity panel closed**, so no panel markup is in the DOM. The offender
is `SPAN.count` at right=1446 — the Chat Activity Bar's count chip (`renderActivityBar`,
app.js + activity-bar.css). Belongs to the Wave 2 Activity Bar agent.
- [x] 9. First screenshot review (basic-dark + basic-light, all 8, panel pinned at 250px). Fixed
      what I could see and only see: variant-2's `.activity-filter{order:-1}` had detached the
      filter row from the panel head; the ledger header's four spans did not carry the row cell
      classes so the container query desynchronised head and body (tone dot moved into the Domain
      cell so the narrow layout drops the State *word* and keeps the status *channel*); concept 0's
      section head was overrun by the summary sub-line; concept 3's rail stretched and its active
      state was invisible on surface-2; goals.js's blocker prose overflowed the tree leafbox;
      concept 7's cell label was the thing being truncated (label is now the headline, count moved
      into the caption). Dead code removed: `compactNum`, `TONE_ICON`, `@keyframes pmap-sweep`,
      `.pmap-tile.is-selected`, `.pmap-focus-pill span`.
      **Screenshot-harness lesson:** a 220ms settle was catching goals.js's staggered phase
      entrance mid-fade and I nearly filed a "concept 3 renders nothing below the budget row"
      defect off it. 900ms settle; the DOM probe said 5 groups all along.
- [x] 10. **Full pixel verification suite + final gates — ALL GREEN.**
      Harness: `scratchpad/waves/ap_verify.mjs`, raw results `ap_verify.json`.
      - `ap_verify.mjs` → **54 pass / 0 fail**, 0 console errors, 0 page errors.
      - `node tests/audit.mjs reports/audit.json ./tests` → **434 pass / 0 fail / 0 console
        errors / 0 page errors**.
      - `python3 build.py --check` **PASSES**; `index.html` and the standalone are
        byte-identical and **12,035 CRLF / 0 bare LF** each.
      - Screenshots: `scratchpad/waves/apshots/{basic-dark,basic-light}-c0..c7.png` — all 16
        inspected by eye; no two alike.

### What the 54 assertions actually prove (all painted-pixel, none bounding-box-only)
1. All 8 concepts differ in **both** their DOM class-set and an 8×8 luminance fingerprint taken
   from a real screenshot crop; every crop carries >200 distinct colours (real content, not a
   blank box).
2. For **each** of the 8: `focus-activity(changes)` narrows the *content* domains to exactly
   `["changes"]` and repaints; re-clicking widens back to all five.
3. For **each** of the 8 × 3 row kinds (24 assertions): the row hit-tests to itself at its centre,
   a real `page.mouse.click` at those coordinates fires, and the correct thing happens —
   subagent → `activeEditor === 'thread-<id>'` and the editor `<h1>` is that agent's name;
   changed file → `activeEditor === 'file:<path>'`, `<h1>` is that path, and the editor meta pill
   reads `Focused at line <line>`; Todo → `state.activity.selected` is that todo and a painted
   `.pmap-detail` contains its label.
4. Concept 5's changed-file row expands to the **fixture's own** hunk header and first line.
5. 8 themes × 8 concepts × 3 widths: no overflow beyond app.js's stock body (measured against a
   live baseline with the module slot emptied).
6. `prefers-reduced-motion`: 0 infinite animations inside the panel in all 8 concepts, and the
   work state still advances.
7. All 8 survive two full 2 s work ticks without remounting (stable `data-k`).

### Three harness traps hit while writing the verification (worth recording)
1. **`page.click()` never becomes actionable in this app.** Playwright waits for the target to be
   "stable"; the 2s work tick re-renders the whole app, so a row inside `.activity-scroll` times
   out at 30s even though it is present, painted and hit-testable. Replaced with
   `clickPainted()`: `scrollIntoView` → `elementFromPoint` at the centre → `page.mouse.click(x,y)`
   at exactly those coordinates. That is also the stronger assertion — it clicks the pixel.
2. **A row below the fold is not an unpainted row.** The panel scrolls; hit-testing without
   scrolling into view first would have produced a batch of false "not painted" failures.
3. **"the word Artifacts disappeared" is the wrong filter assertion.** Concepts 0 and 3 keep
   *naming* all five domains in their navigation (foot chips, master rail) by design. The
   assertion counts distinct `data-domain` values among **content** elements, excluding
   `focus-activity` / `activity-branch` / `activity-scope` navigation.
   Also excluded from the "nothing escapes the panel" check: `.panel-resize`, which sits at
   `right:-3px` by design (styles.css:352).

### Run 1 of the suite: 40 pass / 8 fail — what each failure actually was
- **3 "narrows" failures (concepts 1, 2, 7): my assertion was wrong.** Those concepts show only
  the focused domain's *content* even in scope `all` (their tiles / rings / branches are the
  multi-domain part), so a test that arrives already focused on `changes` compares a state with
  itself. The harness now parks the focus on `goal` first.
- **3 "row not found" failures (concept 7): also the harness.** The dashboard's record strip is
  the focused domain only; the test has to focus a domain before looking for its rows. Fixed —
  and the row tests now cover all **8** concepts, not 6.
- **1 REAL defect, fixed: concept 5's ledger selected a row and showed nothing.** Only changed
  files expanded; a selected Todo/agent/artifact row set `state.activity.selected` and produced
  no visible result — the same dead affordance this wave exists to remove. Non-change rows now
  expand a detail card inline, in the same slot as the diff.
- **1 PRE-EXISTING defect, not mine, reported not fixed:** with the Activity panel **pinned**,
  the document overflows horizontally at every viewport width and in every theme
  (body scrollWidth 1643 vs client 1600; `.assistant-grid` resolves to `224px 250px 300px` =
  774px inside a ~736px track, and `.chat-stage` is what sticks out). **Proven pre-existing** by
  emptying `PM56_EXT._slots.activityPanelBody` at runtime so app.js's stock accordion renders
  instead: byte-identical numbers. With the panel closed, body scrollWidth is exactly 1600. It is
  `.assistant-grid.activity-pinned` arithmetic in `styles.css` plus `state.editorWidth` — both
  closed after Wave 1. `tests/audit.mjs` never measures overflow while pinned, which is why it
  has never been reported.

### Two honesty fixes made while reviewing my own output
- **Synthetic progress removed.** Todo cards were drawing a bar at 100/55/35/0% by status and
  artifacts at 100/65/30/0% — invented numbers dressed as data, exactly the class of fake this
  wave removes. `progress` is now `null` for todo and artifacts and the bar is simply not
  rendered; it survives only where the fixture really has one (`subagent.progress`, goal phases,
  and change churn share, which is derived from `add`/`del`).
- **Every proportion states what it measures.** `MEASURE_CAPTION` is shared by the Status Board
  meter and the Dashboard rings ("50% phases completed", "73% additions of churn"). An
  uncaptioned bar is the same fake as a hand-written count.
- The ledger's fourth column was printing `it.right`, which for todos duplicated the State column
  verbatim. It now prints a domain-specific `ledger` fact (todo → source, agent → elapsed,
  change → +a −b, artifact → version + updated) and the header reads **Detail**. First cut used
  `source · phase · title`, which at `auto` width ate the Record column down to two characters —
  capped at `minmax(0,92px)` (62px in the narrow container) and shortened.

### Run 2: 52 pass / 2 fail — both harness, both fixed
- Concept 2's open-branch set accumulated across loop iterations, so `beforeDomains` was already
  `["changes"]`. The loop now calls `PM56_DEMO.reset()` before each concept.
- The theme sweep's overflow assertion measured the *app*, not the *module*. At 900px the document
  already overflows **with the panel closed** (body 903 vs client 900 — `.wa-count` /
  `.text-button` in the working area), and the transient panel's own `.activity-panel-head`,
  `.activity-filter` and `.activity-scroll` already exceed the squeezed 210px panel. Verified
  identical with the module slot emptied. The assertion is now a **stock-baseline comparison**:
  measure with `PM56_EXT._slots.activityPanelBody = []` (app.js's own accordion) and fail only if
  this module is *worse*.

## Design decision that the harness forced (and that is right anyway)
`tests/audit.mjs:59-64` asserts `Activity click opens all-category detail: <domain>` → exactly
**5** `.activity-section` after clicking a Chat-Activity-Bar item. My first cut filtered on the
bar click too and turned that green assertion red. The resolution is a real distinction, not a
capitulation — **two controls, two jobs**:
- `open-activity` (the Chat Activity Bar) **opens** the whole detail with one domain
  emphasised — `scope:'all'`, focused section force-expanded, accent ring + a "Focused" pill.
- `focus-activity` (the panel's own filter row) **narrows** to that one domain —
  `scope:'focus'`; clicking the focused domain again widens back to all five.
Both change painted pixels; only the second hides the other four.

## FINAL STATE (this wave's deliverable) — WAVE 2 ACTIVITY PANEL COMPLETE
`activity-panel.js` 911 lines / `activity-panel.css` 463 lines. Nothing else touched. Nothing
committed. Both files are still untracked (`??`) — they are the stubs Wave 1A registered,
now filled in.

Closing gates, all on the shared tree as it stood at the end:
- `ap_verify.mjs` → **54 pass / 0 fail** (repeated green across five separate builds:
  `920ef6f9`, `493c7db8`, `8ca3b7e6`-era, `90a6453a`, `fa4d6fb9`).
- `python3 build.py --check` → **PASSES**, sha `6a28cc920b15a974`; `index.html` and the standalone
  byte-identical, **15,740 CRLF / 0 bare LF** each.
- Final smoke on the current shared build: boot true, **0 console errors, 0 console warnings,
  0 page errors**, and all eight concepts still emitting distinct roots
  (727 / 239 / 148 / 729 / 721 / 512 / 343 / 220 nodes).
- `tests/audit.mjs` is currently red **for other agents' reasons** — see the two entries below;
  it re-runs green for every activity-panel assertion in it.

### Harness files left in `scratchpad/waves/` for Wave 5
| file | what it does |
|---|---|
| `ap_verify.mjs` | the 54-assertion painted-pixel suite; `ap_verify.json` holds the last run |
| `ap_probe.mjs` | fast boot + eight-concept structural fingerprint (~15s) |
| `ap_shots.mjs` | screenshots all 8 concepts in a given theme into `apshots/` |
| `ap_isolate.mjs` | reproduces audit.mjs:59-64 with and without this module's slot |
| `ap_overflow.mjs` / `ap_overflow2.mjs` / `ap_overflow3.mjs` | locate the element causing document overflow; `3` is the stock-vs-module isolation |
| `ap_jitter.mjs` | samples `body.scrollWidth` over time to separate a real width change from tick noise |
| `ap_dbg3..6.mjs`, `ap_dbg900.mjs` | one-off structural probes kept because they encode the questions worth re-asking |

### One more instance of the shared-tree hazard, recorded because it looks like a regression
A gate re-run at 02:10 reported `AUDIT FAIL 424/10` — Context Ring, Activity Detail, Working
Animation and Message Details all "element resolved but click timed out". Two facts settle it:
- `build.py --check` reported sha `8ca3b7e62d4b09a7`, **not** the `493c7db8e202d11e` I had just
  built — another agent rebuilt during the audit. `app.js` mtime 02:10:54 and `styles.css`
  01:55:35, i.e. both files Wave 1 declared closed are being edited again by a Wave 3 agent, and
  `context.js` / `context.css` landed at 02:09 (which is why `Compact Now` stopped being findable
  — item 6 replaces that menu).
- Reproducing audit.mjs:59-64 verbatim afterwards (`scratchpad/waves/ap_isolate.mjs`), **with**
  the module and **with the slot emptied**, gives `goal/todo/subagents/changes/artifacts: OK` in
  both columns.
So: transient, someone else's, and it re-runs green. Do not read a mid-wave audit number without
checking the build sha it actually measured.

Second confirmation at 02:20 on a different build (`7dba977b606f5fdb` → then `90a6453ad88c51d7`):
the same audit reported 417/12, now including
`strict mode violation: [data-submenu="deep-plan"] resolved to 2 elements` — an unambiguous
Wave 3 Menus duplication that cannot come from this module. `ap_isolate.mjs` on the freshly built
tree again returns **OK for all five domains in both columns**. Between 02:10 and 02:22 the build
sha changed four times (`493c7db8` → `8ca3b7e6` → `7dba977b` → `90a6453a`) and `build.py --check`
was momentarily failing outright, i.e. sources had been edited but not rebuilt by their owner.

**Standing advice for Wave 5:** re-run `tests/audit.mjs` only on a tree where `build.py --check`
passes *and* the sha is stable across two consecutive checks. Otherwise the harness is measuring a
half-written build, and "element resolved but click timed out" is its signature for that.

### One phantom regression, chased to the end rather than waved off
A later run reported a single failure: at 900px my body measured `bodyScrollWidth 936` against a
stock baseline of `934` — a 2px "regression". Rather than accept a plausible number, I measured
the quantity directly (`scratchpad/waves/ap_jitter.mjs`, 14 samples at 600ms): **with the activity
panel CLOSED the document is already 934 wide in a 900px viewport, and opening the panel leaves it
at exactly 934.** This module contributes **0**. The 2px was the harness sampling `mine` 60ms
after a viewport resize + variant switch — mid-entrance — while the stock baseline was sampled
~260ms later, settled. Settle raised to 420ms with a 4px tolerance and the reason written into the
harness. This is the third time in this wave a "defect" turned out to be the measurement.

## Hazard: the tree moves under me
`data.js` (Demo Data), `goals.js` (Goals) and `activity-bar.{js,css}` (Activity Bar) are being
written concurrently, and `build.py` concatenates **all** module JS into one `<script>`. A file
caught mid-write makes the whole block a `SyntaxError: Unexpected end of input` and the app does
not boot at all. Seen once at 01:19. Recovery is just to rebuild. Guard before trusting a red
result: `for f in *.js; do node --check "$f"; done`.
Consequence: `node tests/audit.mjs` failures that are not in the activity panel are very often
somebody else's in-flight edit (e.g. the context-ring assertions are keyed to literal `83.9K` /
`78%` strings that the Demo Data agent is changing). I verify my own surface with
`scratchpad/waves/ap_probe.mjs` and treat the shared audit as advisory until the wave settles.

## Notes / findings so far
- ~~**Count drift I cannot fix (app.js is closed).**~~ **RESOLVED by Wave2-Goals.** `goalSummary()`
  computed `phasesTotal = phases.length` = 7 while `PM56_GOAL.progress().total` = 6, so the bar
  read `3/7` and my panel `3/6`. After I flagged it they changed the *fixture shape* rather than
  the renderer: `goal.phases[]` is now exactly the six canonical phases (the plan) and a phase a
  replan removed lives in `goal.retiredPhases[]` (the audit trail). Both now read **3/6**.
  My `phaseLabel()` searches **both** arrays so a todo stamped with a retired phase still
  resolves — that is precisely the moment the divergence is worth showing.
- `renderFileEditor()` (app.js:424) still fabricates 18 diff lines and prints the same
  `CREATE INDEX` SQL for every path. It is in app.js, which nobody may edit after Wave 1, so the
  real `changes[].hunks` are rendered **inside my panel** (concept 5 and the change detail card)
  instead. Reported, not fixed. *It does read the right `path`, `line`, `summary`, `add` and `del`
  from `D.changes`, so "opens that file at that line" is genuinely true — it is only the diff BODY
  that is fabricated.*

## What I overrode from the eight scaffolds, and why
| scaffold (styles.css) | change |
|---|---|
| `.activity-concept-board` :364 | child selector widened `>div` → `>button` (tiles are the navigation); tile internals (label / count / summary / meter / footer) added — the scaffold described only the box |
| `.activity-goal-tree` :365 | `>button` support; `span{padding:5px 7px}` neutralised for *nested* spans (it padded every label inside a button); second indent level `.tree-leaf` / `.tree-leafbox` / `.pmap-tree-note` added; foreign goal markup inside the leafbox forced to wrap |
| `.activity-master-detail` :366 | **used only for the rail and the two-line `.detail` summary box.** Its `button` / `span` / `strong` rules style *every* descendant, which would flatten `.soft-button` fills, the danger text colour and every fragment the `goalSection` slot returns. The record list therefore lives underneath it at full panel width — which is also the only readable split at the panel's 240px minimum. Cost: 3 scaffold selector parts (`.detail strong`, `.detail span`) do less than they could. |
| `.activity-agent-board` :367 | `>button` grid placement finished — avatar spans rows 1-4 of column 1, everything else pinned to column 2 (the scaffold placed only `.agent-progress`) |
| `.activity-ledger` :368 | `>div` → `>button`; the 70/70/1fr template replaced by four columns (Domain / State / Record / Detail) and a full-width inline diff row |
| `.activity-live-feed` :369 | `>button` support with the scaffold's rail geometry; `span{padding}` zeroed; a `.pmap-feed-head` live node added |
| `.activity-dashboard` + `.ring-mini` :370 | `repeat(4,1fr)` → `repeat(auto-fit,minmax(58px,1fr))` for five cells; `.ring-mini` changed from a 28px **filled disc** to a 38px host for a real SVG donut with the percentage inside |
| per-variant cosmetics :274 | **neutralised**: variant 1's two-column `.activity-scroll` grid, variant 2's `order:-1` on the filter row *and* its `border-left:3px solid var(--accent)` (a coloured left-edge accent bar, which this project's rules forbid), variant 4's monospace face, variant 6's flex column, variant 7's `--code` summary-card background |

After this wave the orphan gate over `styles.css:364-371` should read **0** — all eight scaffolds
now have emitters. The only classes my own sheet names that a naive substring grep cannot find are
`pmap-tone-*` and `pmap-dl-*`, which are built by concatenation (`'pmap-tone-' + tone`) — the same
interpolation false-positive class the plan already documents.
