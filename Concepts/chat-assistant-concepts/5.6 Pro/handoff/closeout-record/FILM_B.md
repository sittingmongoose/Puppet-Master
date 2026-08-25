# FILM_B — W2B motion inspection (Decisions · Reduced motion · 8-theme sweep)

READ-ONLY run. No source file edited, `build.py` not run.

- Snapshot filmed: `handoff/w6/frozen-9315f951.html`
- md5 **at start of run**: `ab94fcc3a25341aa23556bcfbaa9608d` — matches the prior agent's `ab94fcc3a253`, so FILM_A and FILM_B are comparable.
- md5 at end of run: *(recorded at the bottom of this file)*
- Outputs: `handoff/w6/filmB/` (scripts, `film/` sheets, `traces/` JSON)
- Viewport 1500x1000 unless stated. Chromium headless over `file://`.

**Reading rule used throughout:** contact sheets are APPEARANCE evidence only; every duration quoted comes from an in-page rAF trace on the rAF frame clock, or from `animationstart`/`animationend` event timestamps taken in-page. No offset quoted from a sheet caption.

---

## AREA 1 — All 8 Decisions takes

### What was filmed and how

`PM56_DEMO.setVariant(6, t)` selects the take (family 6 = "Question & decision", `questions.js:408 takeOf()`).
Three decision surfaces reached per take: `openQuestionnaire()` (question), `openPlan()` (plan/review), `openPermission()` (permission).

Scripts: `filmB/00-recon.mjs`, `01-struct.mjs`, `02-takes-entrance.mjs`, `03-exit.mjs`
Traces: `filmB/recon.json`, `struct.json`, `takes-entrance.json`, `traces/take0..7-entrance.json`, `traces/decision-exit.json`, `traces/decision-exit-control.json`
Sheets: `filmB/film/take0..7-entrance.png`, `film/take0-exit.png`

### 1.1 Take inventory — what actually animates on entrance

Measured with in-page `animationstart`/`animationend` listeners (page clock) plus a rAF trace of the host height, the root element's computed opacity/transform, and `document.elementFromPoint()` at the root's top-centre.

| take | name | root element | entrance animation | declared | **measured** | root opacity range | host height ramp |
|---|---|---|---|---|---|---|---|
| 0 | Stable Card | `.decision-surface.qs.qs-card` | `qs-rise` | 420ms | **371ms** | 0 → 1 | 1 → 292px, ramped |
| 1 | Morphing Composer | `.qs.qs-morph` | **none on root**; `qs-morph-in` on `.qs-morph-field` | 340ms | **333ms** | **1 → 1 (no fade)** | 1 → 212px, ramped |
| 2 | Anchored Sheet | `.qs.qs-sheet` | `qs-sheet-up` | 380ms | **367ms** | 0 → 1 | 1 → 449px, ramped |
| 3 | Side Inspector | `.decision-surface.qs.qs-inspector` | `qs-dock-in` | 380ms | **367ms** | 0 → 1 | 1 → 443px, ramped |
| 4 | Step Sequence | `.decision-surface.qs.qs-seq` | **`decision-enter`** (stock) + `qs-step-open` on `.qs-step-live` | 520ms / 300ms | **492ms / 259ms** | 0 → 1 | 1 → 443px, ramped |
| 5 | Technical Decision | `.decision-surface.qs.qs-tech` | **`decision-enter`** (stock) | 520ms | **517ms** | 0 → 1 | 1 → 443px, ramped |
| 6 | Queue Stack | `.qs.qs-stack` | **none on root**; `qs-rise` on `.decision-surface.qs-stack-live` | 420ms | **417ms** | **1 → 1 (no fade)** | 1 → 385px, ramped |
| 7 | Evidence Split | `.decision-surface.qs.qs-split` | **`decision-enter`** (stock) | 520ms | **517ms** | 0 → 1 | 1 → 443px, ramped |

All eight reached, all three surface types per take, **24 open events filmed**. Zero console errors across the sweep.

**Finding 1A — SUSPECTED (family inconsistency, not obviously wrong).** Three of the eight takes (4, 5, 7) never declare their own entrance and fall through to the stock `decision-enter` at 520ms, while the five bespoke ones run 333–420ms. The family therefore has two entrance speeds, ~40% apart, for what is one surface with eight structures. Nothing is broken visually. *Settled by:* an owner statement that 520ms-vs-380ms across takes is intended, or one shared duration token. This matters far more under reduced motion — see Finding 2B, where the same split becomes a real accessibility inconsistency.

**Finding 1B — CLEAN (with control).** Takes 1 and 6 have no root fade (`opacity 1 → 1`); their content is fully opaque while the container clips it into view. Instrument control: the same rAF probe read `opacity 0 → 1` on the other six takes in the same run, so it was live and simply had nothing to report on 1 and 6. Both takes do animate an inner element (`qs-morph-in` 333ms; `qs-rise` 417ms) and the host height ramps normally, so this is a clip-reveal idiom, not a missing entrance.

### 1.2 CONFIRMED DEFECT — the decision host's declared collapse never runs on close

`styles.css:244-245`:
```
.decision-host { ... overflow:hidden; transition: max-height var(--spring), padding var(--spring), opacity 200ms; max-height:min(46vh,460px); }
.decision-host.empty { max-height:0; padding-top:0; padding-bottom:0; border-top-color:transparent; opacity:0; }
```
Computed on the live node: `transition-property: max-height, padding, opacity` / `duration: 0.52s, 0.52s, 0.2s`. So a 520ms spring collapse is declared.

It does not happen. Measured on the real close path (`[data-action="close-decision"]`, which runs `app.js` → `state.decision=null` → `renderApp()`):

- host height **292.3px → 1px in a single frame** (last present frame t=50ms, first collapsed frame t=67ms)
- **2 distinct heights across the whole 900ms window; 1 ramp frame**
- the node is *not* replaced (`sameNode: true`, a JS marker set before the click survives the close) — so the transition is not being lost to a node swap
- its children **are** removed in the same render tick (`kids: 1 → 0`), so the content height is already 0 before `max-height` can bind to anything. The declared collapse animates a constraint that is no longer the binding one.

**Positive control that proves the instrument reads red:** the identical rAF height probe, on the identical node, with `.empty` added by class toggle *while the children were kept*, recorded **13 distinct heights over 12 ramp frames, 292.3px → 1px across ~200ms**. Trace: `traces/decision-exit-control.json`.

Appearance corroboration: `film/take0-exit.png` — frames 0–2 show the full questionnaire, frame 3 shows it entirely gone with the transcript already reflowed. No intermediate frame exists.

Net effect: **entrance 480ms animated, exit 1 frame.** A 292px block vanishes instantly and everything above it snaps down by 291px. This is the asymmetry a viewer reads as "the panel got deleted", and it is worse the taller the take (443–449px on takes 2, 3, 4, 5, 7).

Where to fix: `app.js` decision-host render (the `.decision-host.empty` branch, `app.js:974`) versus `styles.css:244-245`. One of the two has to give — either the surface stays mounted for the length of the collapse, or the dead transition should stop advertising a 520ms exit that no take ever gets.

*(Areas 1.3–1.5, 2 and 3 follow — this file is written incrementally.)*

### 1.3 Reflow as options change

Scripts: `filmB/05-reflow-d7.mjs` (per-interaction fresh page), `04c-control.mjs`.
Trace: `traces/reflow-d7.json`.

**Positive control (run first, on a clean page, before any measurement):** the identical rAF height probe on `.decision-host`, driven by an injected `max-height 400ms linear` transition, recorded **18 distinct heights over 18 ramp frames, 292.3px → 111.6px**. The instrument reads red.

| interaction | host height | ramp frames | distinct heights | root node replaced | entrance replayed |
|---|---|---|---|---|---|
| `answer-choice` (select an option) | 292.3 → 292.3 | 0 | 1 | no | no |
| `next-question` #1 | 292.3 → 307.3 | **1** | 2 | no | no |
| `next-question` #2 | 307.3 → 292.3 | **1** | 2 | no | no |
| `next-question` #3 | 292.3 → 292.3 | 0 | 1 | no | no |
| `skip-question` | 292.3 → 307.3 | **1** | 2 | no | no |

**Finding 1C — SUSPECTED (low severity).** Every content height change inside an open decision lands in **one frame, untransitioned**. The host declares `transition: max-height var(--spring)`, but `max-height` is pinned at 460px and is never the binding constraint while the surface is open — the box is sized by its content, and `height` is not transitioned. Deltas observed here are only ±15px, so it reads as a small snap rather than a jolt. *Settled by:* driving a question with a materially different option count (the fixture's five questions all sit within 15px of each other) or measuring the plan↔permission height delta (212 vs 194 vs 292px on take 0) through a single surface, to see whether the same one-frame snap ever carries a 100px delta.

**Finding 1D — CLEAN (with control).** Selecting an option does **not** replay the entrance animation and does **not** replace the surface node. The renderer morphs in place (every element carries a `data-k` key). Two independent instruments agree: node identity held across the click (`nodeReplaced: false`), and root opacity stayed 1 for the whole window. Control: the same node-identity probe reported `nodeReplaced: **true**` on the D7 flow switch in the same script, so it distinguishes the two cases.

### 1.4 D7 — draft preservation across flow switches

Script: `filmB/05-reflow-d7.mjs` pass 3. Sheet: `film/d7-flow-switch.png`. Handler: `questions.js:860 EXT.action('qs-open-flow')`.

Fixture exposes four flows: `flow-query` (active, Deployment questionnaire, 3/5), `flow-migration` (queued, 0/4), `flow-hosts` (queued, 0/3), `flow-retention` (completed, 4/4).

Sequence filmed on take 6 (Queue Stack — the take that renders the queue as peek cards): answer "Windows native" → switch to `flow-migration` → switch back to `flow-query`.

- **Draft preserved: CLEAN.** After the round trip the surface title is back to "Deployment questionnaire" and "Windows native" is still the selected choice. `questions.js:867` saves the leaving flow's answers into `state.qs.drafts[leaving.id]`, and `questions.js:874` restores them onto the fresh clone.
- **Motion of the switch:** the surface root **is** replaced (`nodeReplaced: true`, unlike every in-flow interaction), and the sheet shows a genuine cross-fade at frame #4 with the outgoing card ghosted under the incoming one. The entrance re-runs.
- Host height changed 384.8 → 421.2 in **1 frame** (same untransitioned reflow as 1C, here a 36px delta).
- Control: the same script's in-flow interactions reported `nodeReplaced: false`, so the "replaced" reading on the flow switch is a real distinction, not a default.

*Sheet caveat recorded honestly:* the `d7-flow-switch.png` clip was computed from the host rect **before** the switch (400px tall) while the incoming flow is 421px tall and the host is bottom-anchored, so the topmost peek row is cropped out of frames #4 onward. That is a filming artefact, not a missing row — the traced `innerText` at the same moment contains the row the sheet cannot show.

*Incidental, outside the motion brief:* the four choice buttons carry no `aria-pressed` — selection is conveyed by class only (`"null|true|Windows native"`). Flagging, not pursuing.

### 1.5 Narrow widths and the `qsHost` container tiers

Scripts: `filmB/07-narrow2.mjs`, `09-take7-narrow.mjs`, `10-narrow-alltakes.mjs`, `11-shot.mjs`.
Controls: `08-narrow-controls.mjs`, `08b-overflow-control.mjs`.
Traces: `narrow2.json`, `narrow-alltakes.json`, `traces/take7-narrow.json`, `traces/overflow-control.json`, `traces/narrow-controls.json`.
Stills: `shots/take7-vw360-broken.png`, `shots/take7-vw480-ok.png`, `shots/take0-vw360-ok.png`.
Sheets: `film/take7-narrow-vw1500.png`, `take7-narrow-vw900.png`, `take7-narrow-vw330.png`.

#### Instrument corrections made mid-run (recorded, because the first pass was a false positive)

The first narrow pass reported **799px of horizontal overflow and three collapsed elements at vw=1100**. Both were false. A `display:none` **ancestor** gives its descendants a 0x0 rect at the viewport origin, which reads as "host.left − 0 = 799px of overflow" and as "element with text at 0x0". Re-run with `Element.checkVisibility({visibilityProperty, contentVisibilityAuto, opacityProperty})` gating every measurement: **overflow 0px and zero collapsed elements at every width tested.** Neither number in the first pass was real and neither is quoted below.

#### Tier boundaries — CLEAN

`questions.css:56` sets `container-type: inline-size; container-name: qsHost` on `.decision-host`. Container queries resolve against the **content** box, and the host carries `padding: 0 clamp(8px,2vw,20px)`, so the tier flips ~16–40px before the border-box width suggests.

| viewport | host content width | tier that should apply | `.qs-split-body` flex-direction | `.qs-tech-state` display | `.qs-head` padding |
|---|---|---|---|---|---|
| 1500 | 445.0 | base | row | block | `9px 36px 9px 11px` |
| 480 | 468.0 | base | row | block | `9px 36px 9px 11px` |
| 400 | 388.0 | **≤400** | **column** | block | `9px 36px 9px 11px` |
| 360 | 348.0 | ≤400 | column | block | `9px 36px 9px 11px` |
| 330 | 318.0 | ≤400 | column | block | `9px 36px 9px 11px` |
| 316 | 304.0 | ≤400 | column | block | `9px 36px 9px 11px` |
| 300 | 288.0 | **≤300** | column | **none** | **8px** |
| 900 | 207.6 | ≤300 | column | none | 8px |
| 1100 | 261.0 | ≤300 | column | none | 8px |

Both tier boundaries fire exactly where the content width crosses them, in both directions, including the two wide-viewport cases (1100, 900) where the *editor split* — not the viewport — is the binding constraint. That is precisely the case `questions.css:425-430` says the rules exist for, and it works. Instrument control: the witness properties flip (`block`↔`none`, two different `.qs-head` paddings, `row`↔`column`) across the boundary in the same sweep, so the probe reads both states.

**Overflow / clipping — CLEAN with control.** 0px overflow and 0 collapsed elements for takes 5, 6, 7 at all 11 widths. Control (`08b-overflow-control.mjs`): the same probe, with `min-width:900px !important` forced onto `.qs-title` (min-width, because a plain `width` is shrunk away by the flex parent — the first attempt at this control **failed** and is recorded here rather than dropped), reported **588px of overflow on `qs-title`, 64 elements examined**, and 0px again after restore.

**Pixel-read control.** `pixelRead` on take 7's evidence pane returns 100–545 distinct colours; on a deliberately painted flat `#123456` swatch it returns 1. It can tell content from a blank fill.

#### CONFIRMED DEFECT — take 7 (Evidence Split) loses the entire question below the 400px tier

At `@container qsHost (max-width: 400px)` (`questions.css:431`), `.qs-split-body` becomes `flex-direction: column` and `.qs-split-aside` gets `flex: 0 0 auto` (`questions.css:434`). The aside then takes its full content height and `.qs-split-main` — which is also the `.qs-scroll` region with `min-height: 0` — is the flex item that shrinks. It shrinks to nothing.

Measured (`traces/take7-narrow.json`):

| viewport | content width | tier | `.qs-split-main` height | `.qs-split-aside` height | main scrollHeight | **hidden inside main** |
|---|---|---|---|---|---|---|
| 1500 | 445 | base | 355px | 355px | 431 | 76px |
| 480 | 468 | base | 355px | 355px | 431 | 76px |
| **400** | 388 | ≤400 | **30px** | 325px | 310 | **280px** |
| **360** | 348 | ≤400 | **30px** | 325px | 345 | **315px** |
| **330** | 318 | ≤400 | **14px** | 341px | 431 | **417px** |
| **300** | 288 | ≤300 | **18px** | 341px | 429 | **411px** |

This is not a bounding-box artefact — it is confirmed three ways:

1. **Hit test.** `document.elementFromPoint()` at the centre of the first answer button returns `P`, `decision-evidence qs-evidence`, or `qs-split-aside qs-scroll` — never the button (`reachable: false`). Same for the whole action row.
2. **Painted pixels.** `shots/take7-vw360-broken.png` shows the rendered host at vw=360: header, progress bar, then "Why this matters" / "Answers so far" / "About this flow" and nothing else. **No question prompt, no four answer buttons, no Cancel / Skip / Back / Next.** The only interactive control left is the close X.
3. **Positive control in the same sweep.** `shots/take7-vw480-ok.png` (same take, one tier up) and `shots/take0-vw360-ok.png` (same width, different take) both render the question and the buttons, and both hit-test `reachable: true`.

The irony is documented in the module's own header: `questions.js:37-41` says take 7 keeps the evidence pane specifically because an unscoped `@media` rule "used to destroy it at narrow widths". The replacement rule protects the evidence pane and destroys the question instead.

**Where:** `questions.css:431-434` (`.qs-split-body{flex-direction:column}` + `.qs-split-aside{flex:0 0 auto}`) against `.qs-split-main.qs-scroll{min-height:0}`.

#### CONFIRMED DEFECT — take 7's primary action row sits below the fold at every width

Separate from the above, and present even at vw=1500. Take 7 is the **only** take of eight whose primary button is not reachable by pointer at rest:

| take | primary "Next" reachable at vw=1500 | at vw=480 | at vw=400 | at vw=360 |
|---|---|---|---|---|
| 0–6 | yes (all seven) | yes | yes | yes |
| **7** | **no** — hit returns `activity-bar` | **no** — `activity-bar` | **no** — `decision-evidence qs-evidence` | **no** — `P` |

At the wide widths the row is inside `.qs-split-main`'s scroller (76px hidden, exactly the amount the row overhangs), so a user *can* scroll to it — it is "primary action below the fold", not "unreachable". Below 400px it is inside a 30px scroller and is effectively gone. Every other take fits its action row inside the visible host at every width tested.

### 1.6 Area 1 — what I did not reach

- Only `question` was traced frame-by-frame for entrance across all eight takes. `plan` and `permission` were opened on all eight takes and their structure, animation name/duration and host height recorded (`recon.json`), but not rAF-traced individually.
- The `conflict`, `question-preparing` and `question-submitting` decision types were not filmed. `submit-questionnaire` reaches `question-submitting` via a 950ms timer; I did not film that transition or the surface it renders.
- Take 7's narrow-width defect was confirmed on the `question` surface only. Whether `plan` and `permission` collapse the same way at ≤400 is untested.
- `qs-toggle-fold` (`questions.js:884`, take 3's disclosure) was not filmed.
- No keyboard-only path was exercised: the take-7 action row may still be reachable by Tab even where the pointer cannot reach it. Untested, and it would change the severity.

---

## AREA 2 — Reduced motion, measured against the policy the project states

Scripts: `filmB/20-reduced-sweep.mjs` (animations), `22-join.mjs` (join), `23-transitions.mjs` (transitions — a separate instrument, because menus are a `transition`, not an `@keyframes`, so the animation tour is structurally blind to them).
Traces: `traces/reduced-tour-normal.json`, `reduced-tour-reduce.json`, `reduced-rows-*.json`, `trans-tour-*.json`, `trans-rows-*.json`. Joined table: `filmB/reduced-policy-table.json` (28 animations).

### 2.0 Method and its controls

The same scripted tour is run twice — `boot({reducedMotion:false})` and `boot({reducedMotion:true})` — and every `animationstart` / `animationend` / `animationcancel` (and, in the second instrument, `transitionstart` / `transitionend` / `transitioncancel`) is recorded **in-page, on the page clock**, from a capturing listener on `document`. Nothing here is a Playwright round-trip and nothing is read off a contact sheet.

The declared duration is read with `getComputedStyle` **at `animationstart`**, so it is the duration the media state actually resolved to, not a duration guessed from the stylesheet. This is what makes the collapsed cases legible: `declR: "0.001s"` is the cascade's own answer, taken from the live element, at the moment it fired.

Controls, in the order they were applied:

1. **Media-state control.** Both scripts assert `matchMedia('(prefers-reduced-motion: reduce)').matches === <expected>` in-page and **abort the run** on mismatch. Without this, "reduced motion" is a launch flag that was never verified to have reached the page — the exact shape of a false green.
2. **Discrimination control.** In the same joined run the instrument reports three different outcomes on different rows — full length (`decision-enter` 517.2 → 516.8ms), collapsed (`qs-rise` 419.6 → 0ms), and never-fired (`pm-shimmer` 21 instances → 0). A probe that could only report one of those would be worthless; this one reports all three from one pass.
3. **Never-ended accounting.** `__flush()` deliberately emits still-open animations as `measured: null, how: "never-ended"` rather than dropping them, so an animation that starts and never finishes cannot be silently lost.

Coverage caveat, stated up front: this is **one scripted tour**, not the whole app. 28 animations fired. Anything the tour did not reach is not in the table and is not claimed as clean.

### 2.1 The policy the project states

`motion.css:227-231`, in the file's own words:

> The blanket rule this replaces flattened every duration to 0.001ms, which erased the state changes as well as the decoration — the lab's entire subject matter collapsed into static cards. Instead: **stop the infinite decorative loops, keep the short state transitions.** … Cap every loop at a single pass rather than enumerating decorative classes one by one — an enumeration silently misses new ones (it had already missed `.state-mark.live`). **Finite entrances are untouched, so state changes stay legible.**

That is a specific, falsifiable claim with two halves. The table below is scored against it and nothing else. **This is a report, not a ruling** — whether the stated policy is the right policy is the user's call, not mine.

### 2.2 Scoreboard — 28 animations

| verdict | count | animations |
|---|---|---|
| **CONFORMANT** — infinite decorative loop killed | 8 | `bolt`, `goal-chip-pulse`, `goal-current-pulse`, `pm-meta-live`, `pm-shimmer`, `pmap-breathe`, `status-pulse`, `underline-run` |
| **CONFORMANT** — finite decoration on the explicit stop list, stopped | 2 | `bar-grow`, `clock` |
| **CONFORMANT** — finite entrance untouched, runs full length | 8 | `capability-pop`, `decision-enter`, `drawer-in`, `message-arrive`, `morph-stage`, `panel-pin`, `pm-disc-in`, `pm-roll` |
| **VIOLATING** — finite entrance collapsed to 1ms | 9 | `goal-phase-arrive`, `orbit-disc-in`, `pm-materialize`, `pmap-in`, `qs-dock-in`, `qs-morph-in`, `qs-rise`, `qs-sheet-up`, `qs-step-open` |
| **VIOLATING** — finite entrance collapsed on one of its two call sites | 1 | `details-open` |

The 18 conformant rows are not in question and I am not raising them. The loops die (`cR: 0` — zero instances fired at all under reduce), the stop list works, and the eight untouched entrances measure within 6% of their normal-motion length. That half of the policy is implemented exactly as written.

**Detail on the 18 conformant rows** (measured, normal → reduce, median of all instances):

| animation | declared | normal | reduce | note |
|---|---|---|---|---|
| `capability-pop` | 0.15s | 150.0 | 128.4 | entrance, untouched |
| `decision-enter` | 0.52s | 517.2 | 516.8 | **stock decision entrance — see 2.4** |
| `drawer-in` | 0.52s | 534.9 | 503.4 | entrance, untouched |
| `message-arrive` | 0.42s | 416.8 | 414.6 | entrance, untouched |
| `morph-stage` | 0.52s | 518.4 | 513.4 | entrance, untouched |
| `panel-pin` | 0.52s | 517.0 | 516.5 | entrance, untouched |
| `pm-disc-in` | 0.15s | 134.5 | 128.4 | entrance, untouched |
| `pm-roll` | 0.26s | 252.0 | 250.6 | entrance, untouched |
| 8 infinite loops | 1.37–2.2s | — | **never fire** | `cR: 0` on every one |
| `bar-grow`, `clock` | 0.7s / 0s | 698.3 / 627.0 | **never fire** | `motion.css:244-248` stop list |

### 2.3 CONFIRMED — four modules and the central file itself override the stated policy

Every collapsed row is traceable to a rule that a `grep` over the stylesheets locates exactly. The collapse is not emergent and it is not a cascade accident: in each case a `prefers-reduced-motion` block names the element and sets `animation-duration: 1ms`.

| collapsed animation | normal | reduce | overridden by | selector |
|---|---|---|---|---|
| `goal-phase-arrive` | 433.7 | **0** | `goals.css:369` | `.goal-phase,.goal-replan-marker,.goal-phase-detail{animation-duration:1ms!important}` |
| `qs-rise` | 419.6 | **0** | `questions.css:461-463` | `.qs-card, .qs-sheet, .qs-inspector, .qs-morph-field, .qs-fold, .qs-step-live, .qs-stack-live{animation-duration:1ms}` |
| `qs-sheet-up` | 368.3 | **0** | `questions.css:461-463` | (same rule) |
| `qs-morph-in` | 367.5 | **0** | `questions.css:461-463` | (same rule) |
| `qs-dock-in` | 364.0 | **0** | `questions.css:461-463` | (same rule) |
| `qs-step-open` | 283.1 | **0** | `questions.css:461-463` | (same rule) |
| `pmap-in` | 235.7 | **0** | `activity-panel.css:462` | `.pmap, .pmap * { animation-duration: 1ms !important; }` |
| `orbit-disc-in` | 135.6 | **0** | `orbit.css:133` | `.pm-rail-item.enter { animation-duration: 1ms; }` |
| `pm-materialize` | 116.2 | **0** | **`motion.css:234`** | `.pm-materialize, .pm-stream .pm-word{ animation-duration:1ms; … }` |
| `details-open` (280ms call site) | 268.9 | **0** | `activity-panel.css:462` | `.activity-section-body` is inside a `.pmap` container (`class="pmap pmap-accordion"` etc. — eight such wrappers exist in the snapshot) |

Two things worth separating out, because they are different kinds of problem:

- **Eight of the ten come from four modules** (`goals.css`, `questions.css`, `activity-panel.css`, `orbit.css`) each independently deciding, in its own file, that the central policy does not apply to it. Three of the four even carry comments justifying the local decision (`orbit.css:129-131`: *"Scoped to this file's surfaces only — the global stop list in motion.css is deliberately selective"*), which means the divergence is deliberate and per-author, not accidental. Nobody reconciled it with `motion.css`.
- **One of the ten is `motion.css` overriding itself.** `motion.css:231` says *"Finite entrances are untouched"* and `motion.css:234`, three lines later, collapses `.pm-materialize` — a finite entrance — to 1ms. The file contradicts its own stated rule inside the same block.

`details-open` is the sharpest single illustration of the inconsistency, because it is **one animation on two call sites**: `.activity-section-body` (`styles.css:291`, 280ms) collapses to 0ms because it happens to live inside a `.pmap` wrapper, and `.work-history` (`styles.css:225`, 360ms) runs its full 360ms because it does not. Same keyframe, same user-visible idiom, two different reduced-motion behaviours decided by an unrelated ancestor.

`activity-panel.css:462` is also the most far-reaching of the four overrides: `.pmap *` collapses *every* animation of *every* descendant of the activity map, which is why it captured a `styles.css` animation that has nothing to do with `activity-panel.css`. That blast radius is the same shape as the blanket rule `motion.css:227-231` says it deliberately removed — reintroduced one subtree at a time.

### 2.4 CONFIRMED — the consequence: three of the eight decision takes animate under reduced motion, five do not

This is the finding that matters most, and it is a direct product of 2.3 crossed with the Area 1.1 take inventory.

`questions.css:461` enumerates seven class names. That enumeration covers every take that declares a **bespoke** entrance and misses every take that falls through to the **stock** `decision-enter`, because `decision-enter` is declared on `.decision-surface`, which is not in the list and is not collapsed anywhere else.

| take | entrance animation | root class | in the `questions.css:461` list? | **under reduced motion** |
|---|---|---|---|---|
| 0 Stable Card | `qs-rise` 420ms | `.qs-card` | yes | **0ms — no animation** |
| 1 Morphing Composer | `qs-morph-in` 340ms | `.qs-morph-field` | yes | **0ms — no animation** |
| 2 Anchored Sheet | `qs-sheet-up` 380ms | `.qs-sheet` | yes | **0ms — no animation** |
| 3 Side Inspector | `qs-dock-in` 380ms | `.qs-inspector` | yes | **0ms — no animation** |
| 4 Step Sequence | **`decision-enter` 520ms** | `.qs-seq` | **no** | **516.8ms — full length** |
| 5 Technical Decision | **`decision-enter` 520ms** | `.qs-tech` | **no** | **516.8ms — full length** |
| 6 Queue Stack | `qs-rise` 420ms | `.qs-stack-live` | yes | **0ms — no animation** |
| 7 Evidence Split | **`decision-enter` 520ms** | `.qs-split` | **no** | **516.8ms — full length** |

So a user with `prefers-reduced-motion: reduce` gets a **520ms animated entrance** on takes 4, 5 and 7, and **no entrance at all** on takes 0, 1, 2, 3 and 6 — for what is one surface in eight structural presentations, reached through the same `openQuestionnaire()` path.

Take 4 is the clearest single case, because both behaviours happen inside it at once: its root `.qs-seq` runs `decision-enter` for the full 516.8ms while its own `.qs-step-live` child, three lines up the same stylesheet, is collapsed to 0ms. One surface, one entrance, two contradictory reduced-motion answers.

**This promotes Finding 1A from cosmetic to an accessibility inconsistency.** In Area 1 the 520ms-vs-380ms split was a taste question — nothing was broken, the family just had two speeds. Under reduced motion the same split becomes the difference between "the setting was honoured" and "the setting was ignored", decided by which of eight takes the fixture happens to be on. Whichever answer is correct — collapse all eight, or run all eight — the one thing that cannot be right is the current state, where the answer depends on whether a take's class name was remembered in a seven-item list.

*Reported, not decided.* The policy question — should finite entrances run under reduced motion, as `motion.css:227-231` insists, or collapse, as four modules have unilaterally decided — is the user's to settle. What is measured here is only that the codebase currently answers it both ways.

### 2.5 The transitions instrument — a fifth override, on a different mechanism

`23-transitions.mjs` is a separate instrument because `menus.css:9-29` implements menu open/close as a `transition`, which emits no `animationstart` and is therefore invisible to the animation tour. Same double run, same media-state abort control, listening on `transitionstart`/`transitionend`/`transitioncancel`.

**CONFIRMED — the overlay menus have no reduced-motion transition at all.**

| element :: property | normal instances | normal median | reduce instances |
|---|---|---|---|
| `overlay-menu :: opacity` | 10 | 148.4ms | **0 — row absent from the reduce trace entirely** |
| `overlay-menu :: transform` | 10 | 280.9ms | **0 — row absent** |

Source: `menus.css:326-332` sets `transition: none !important; animation: none !important;` on `.overlay-menu`, `.overlay-menu.sidecar` and `.overlay-menu.model-menu`, and `menus.css:333-338` hard-sets `opacity:1; transform:none` on the closed/hidden states so the end state is still reached. `menus.js:56` reads the same media query in JS, so there is a script-side path as well (not traced).

By the letter of `motion.css:227-231` — *"keep the short state transitions"* — a 148ms opacity transition on a menu is exactly the class of motion the policy says it is preserving, and this rule removes it. **In practice this is the benign direction** (a menu that appears instantly is the conventional and usually preferred reduced-motion behaviour), which is precisely why it belongs in the same conversation as 2.3 and 2.4 rather than being filed as a bug on its own. It is a fifth module reaching its own verdict on the central policy, on a mechanism the central policy does not even mention.

**Also measured, and conformant:** `motion.css:243` shortens `.pm-rail-item` transitions from 150ms to 120ms (`decl` reads back as `0.12s`, measured 135.3 → 113.2ms across 33 instances). That is the central file doing exactly what it says — shortening a state transition rather than erasing it.

**Cross-instrument corroboration for the Area 1.2 CONFIRMED DEFECT.** The transitions instrument sees `decision-host :: max-height` **start and complete a full 519.3ms transition** on the close path, in both normal *and* reduced motion. That is not a contradiction of 1.2 — it is the mechanism of 1.2, seen from the other side. The declared 520ms transition genuinely runs *as a property animation on `max-height`*; it simply has no visual effect, because the host's children are removed in the same render tick and the box's height is already 1px before `max-height` starts travelling. Two independent instruments, one measuring painted height per frame and one measuring transition events, agree on a single explanation: **the property animates, the pixels do not.** A DOM- or event-level probe alone would have called this clean.

### 2.6 Area 2 — SUSPECTED, and what I did not reach

**Finding 2C — SUSPECTED (low severity, unexplained).** `.composer-box`'s five border/shadow transitions measure 152.6ms under normal motion and **89.9ms under reduce**, with an identical declared `transition-duration` of `0.16s, 0.16s, 0.44s` in both runs. Nothing in the reduced-motion cascade names `.composer-box`. The likeliest explanation is a `transitioncancel` — the row aggregate does not preserve the per-instance `how` field, so I cannot tell an early cancel from a genuine shortening. *Settled by:* one re-read of `traces/trans-tour-reduce.json` filtering `el` for `composer-box` and reading the `how` field on each of the five instances. The raw trace is on disk; I did not spend the run on it.

Not reached:
- **The tour is not the app.** 28 animations and 24 transition groups fired. Animations on surfaces the tour never opened — the `conflict` decision type, `question-submitting`, the lens and threadops surfaces, most of `variants-a/b/c` — are absent from the table and are not claimed clean. `variants-a.css:571-...` in particular contains a long and carefully reasoned reduced-motion block that this tour never exercised.
- **No painted-pixel confirmation of the collapses.** 2.3 and 2.4 rest on event timing plus the computed duration read back at `animationstart`. That is strong evidence about *the cascade*, and it is the right instrument for a duration question — but it is not a pixel assertion. The one place in this run where a collapse is confirmed at the pixel level is G1, below.
- **The `pm-shimmer` fallback was not checked visually.** `motion.css:233` sets `animation:none; background:none; color:var(--text)` — the `background:none` is there because `.pm-shimmer` leaves `color:transparent` behind when its animation stops. 21 instances fired under normal motion and 0 under reduce, so the animation is correctly stopped; whether the text is actually *painted* in the reduced case was not verified. *Settled by:* one pixel read of a `.wa-verb` under reduce.

---

## G1 — SECOND INSTRUMENT: the just-completed phase row that vanishes and re-arrives

Scripts: `filmB/31-g1-recon.mjs` (recon), `32-g1-pixel.mjs` (the instrument), `33-g1-still.mjs` (appearance).
Traces: `traces/g1px-trace-normal.json`, `g1px-trace-reduce.json` (rAF, frame clock), `traces/g1px-ink-normal.json`, `g1px-ink-reduce.json` (pixels, ts clock).
Stills: `shots/g1-blank-normal.png`, `shots/g1-blank-reduce.png`.

### G1.0 First, the instrument that was already on disk — and why its green was worthless

`filmB/30-g1-second.mjs` was left mid-flight by my predecessor, and **it had already run**: `traces/g1-second-normal.json` and `g1-second-reduce.json` (343KB / 335KB) were on disk. Both are clean. Both are worthless, and it took one look at the raw trace to see why:

| | normal | reduce |
|---|---|---|
| rAF frames recorded | 261 | 260 |
| MutationObserver records | **0** | **0** |
| frames containing `data-wipe` | **0** | **0** |
| distinct `.goal-phase` node ids seen | 7 (never changed) | 7 (never changed) |
| distinct class strings seen across all frames | 5, static | 5, static |
| frames where a row left the paint stack | 0 | 0 |

Its trigger was `PM56_DEMO.completeWorking()`. That advances the *work* lifecycle; it does not complete a *goal phase*. **Nothing happened in the 4.2-second window** — the phase list was not re-rendered even once. The script's own positive control (forcing `clip-path` blank) passed, so its *detector* worked fine; what it lacked was a control on the *trigger*. A detector that works, pointed at an event that never occurred, produces a confident zero.

This is the same failure shape as the two the brief warns about — Escape on an already-closed menu, hover coordinates over the wrong panel. Recorded rather than quietly replaced, and its traces are left on disk labelled as what they are: a null result, not a clean one.

**The real trigger** is `[data-action="goal-agent-step"]` → `goals.js:879` → `agentStep()` (`goals.js:830-864`), whose line `goals.js:844` is `delete settled[cur.id];  /* so THIS completion plays its wipe */`. It is reached through the shipped UI with nothing forced: any of the six `[data-action="open-goal"]` buttons (`goals.js:798` goal chip, `goals.js:565` "View Goal", `activity-panel.js:176`, …) opens the goal editor, which renders both the phase list and the "Agent: complete current phase" button.

### G1.1 What this instrument does, and how it differs from the other two

| | instrument | timing source | pixel source |
|---|---|---|---|
| FILM_A | computed opacity/clip-path + `elementFromPoint` | rAF | screencast ink fraction vs **the modal colour of the whole frame** |
| `30-g1-second.mjs` | `MutationObserver` + WAAPI `getAnimations()` + `elementsFromPoint()` + `checkVisibility()` | rAF | **none** |
| **this one** | rAF trace of `data-wipe` + `animation-name` + `animation-duration` + computed `opacity`/`clip-path` + a WeakMap node token | **the rAF timestamp itself** (the frame clock) | screencast ink count in the row's band, **with a spatial neighbour control band in the same frame** |

The design decision that matters is the **neighbour control band**. An ink metric taken against a whole-frame reference cannot distinguish "this row went blank" from "this frame went blank" — a dropped composite, a scroll, a theme repaint and a real defect all look the same. Measuring an adjacent row in the *same frame* separates them: a real defect reads as target ink → 0 while the neighbour's ink is unchanged. In every run below the neighbour band held at **exactly 3742** on every single frame, including the frames where the target read 0.

Timing is taken from the rAF timestamp passed to the callback, never from `performance.now()` after a render and never from a click round-trip; the click itself is dispatched *inside* a rAF callback so the click frame is on the same clock as everything else. Screencast frames are sorted by `metadata.timestamp` — and they **did** arrive out of capture order in 5 of the 6 films, which the script reports rather than assumes.

### G1.2 Controls, all three, before any verdict

1. **Trigger control** (the one `30-g1-second.mjs` lacked). The run asserts, from the trace, that `data-wipe="1"` actually appeared **and** that the count of `.completed` rows increased. Both runs: `data-wipe="1"` observed = true, completed rows **3 → 4**. Without both, the script prints `TRIGGER NOT QUALIFIED` and declines to give a verdict.
2. **Pixel positive control.** Before the measurement, the target row is forced blank with `clip-path: inset(0 0 100%)` + `opacity:0` for 420ms while filming. Normal: target ink `0..3475`, **14 blank frames of 44**, neighbour unchanged at 3742. Reduce: **1 blank frame of 13** (the reduce pass captured only 13 frames in that window), neighbour unchanged. The instrument reads red on purpose in both modes.
3. **Pixel negative control.** A 900ms quiet window with no interaction, filmed first, to establish the baseline and prove ink does not collapse on its own. Normal: target ink min **3398**, mean 3459. Reduce: min **3496**, constant. It never approaches the blank cut.
4. **Media-state control.** `matchMedia('(prefers-reduced-motion: reduce)').matches` asserted in-page against the launch flag; mismatch aborts the run.

### G1.3 CONFIRMED DEFECT — normal motion

Viewport 1400x900. The completing phase is "Implement" (index 4 of 7). Click dispatched inside a rAF callback at frame-clock **t = 116.7ms**.

| frame-clock t | `data-wipe` | `animation-name` | duration | opacity | `clip-path` |
|---|---|---|---|---|---|
| 0 | — | `goal-phase-arrive` | 0.44s | 1 | `inset(0 0 0%)` |
| **166.7** | **1** | `goal-phase-complete` | 0.52s | 1 | `none` |
| **700.0** | — | **`goal-phase-arrive`** | 0.44s | **0** | **`inset(0 0 100%)`** |
| 783.3 | — | `goal-phase-arrive` | 0.44s | 0.095 | `inset(0 0 96.3%)` |
| 866.7 | — | `goal-phase-arrive` | 0.44s | 0.851 | `inset(0 0 39.0%)` |
| 966.6 | — | `goal-phase-arrive` | 0.44s | 1 | `inset(0 0 6.8%)` |
| 1216.6 | — | `goal-phase-arrive` | 0.44s | 1 | `inset(0 0 0%)` |

- The row is **fully invisible** — `opacity: 0` *and* `clip-path: inset(0 0 100%)` simultaneously — for **2 frames, frame-clock 700.0 → 766.7ms (66.7ms)**, beginning **583.3ms after the click**.
- It then re-reveals over a further ~450ms, reaching full opacity at 966.6ms and full clip at 1216.6ms. Total event: **~517ms**, of which the first 67ms is nothing at all.
- **Node identity is unchanged across the vanish.** Row node ids are `[1,2,3,4,5,6,7]` at t=0 and `[1,2,3,4,8,6,9]` from t=166.7 onward — the completion render at 166.7 swaps the node, and then **nothing changes again**. At t=700 the row that goes blank is the same live node it was at t=200. This is not a re-mount. It is a live element restarting an entrance animation.

**Pixels, independently:** target ink **0, 0, 0** on 3 consecutive screencast frames (20ms on the `metadata.timestamp` clock) while the neighbour control band held at 3742 on every one. Baseline target ink 3459; blank cut ≤346.

**Appearance:** `shots/g1-blank-normal.png` — three frames, ink **4256 → 0 → 584**. The middle frame shows the phase list with the "Implement" row's entire card gone: no number, no glyph, no title, no subtitle, no "Done" badge, no evidence count — a bare gap between "Materialized-view spike" and the "Replan 09:52" marker. The third frame's 584 is the row **part-way back**, which is what a 440ms clip-reveal looks like sampled mid-flight.

### G1.4 CONFIRMED DEFECT — reduced motion, and it is worse in kind

Same script, `boot({reducedMotion:true})`, media state asserted in-page. Click at frame-clock **t = 116.5ms**.

| frame-clock t | `data-wipe` | `animation-name` | duration | opacity | `clip-path` |
|---|---|---|---|---|---|
| 0 | — | `goal-phase-arrive` | **0.001s** | 1 | `inset(0 0 0%)` |
| 183.2 | 1 | `goal-phase-complete` | **0.001s** | 1 | `none` |
| **1666.5** | — | `goal-phase-arrive` | 0.001s | **0** | **`inset(0 0 100%)`** |
| **1783.2** | — | `goal-phase-arrive` | 0.001s | **1** | `inset(0 0 0%)` |

**That table has four rows, and that is the finding.** Under normal motion the trace has 23 distinct states as the row travels back; under reduced motion it has **two**: fully hidden, then fully shown. There are no intermediate opacity or clip values on any frame. The row is fully invisible for **2 frames, 1666.5 → 1733.1ms (66.6ms)**, and the entire event from vanish to full restoration is **116.7ms**.

- **Pixels:** target ink **0, 0** on 2 consecutive frames (36.4ms on the ts clock), neighbour held at 3742.
- **Appearance:** `shots/g1-blank-reduce.png` — three frames, ink **4256 → 0 → 4256**. Compare with normal's `4256 → 0 → 584`. The row does not come back gradually; it comes back all at once.

The claim I was asked to test — *"survives reduced motion as a ~90ms hard blink with no fade"* — is **confirmed in kind and bracketed in magnitude**. "No fade" is exact: two states, no intermediates, on either clock. The duration depends on which threshold you use, so both are given rather than one being picked: **66.6ms fully blank** (frame clock, opacity 0 and clip 100%), **116.7ms vanish-to-restored** (frame clock), **36.4ms** across the blank screencast frames (ts clock). "~90ms" sits inside that bracket.

**Why reduced motion makes it worse, not better.** `goals.css:369` collapses `goal-phase-arrive` to 1ms. That removes the *travel* but not the *0% keyframe*, which is where the blank lives — and Chromium still displays the from-state for a frame or two before a 1ms animation is considered started. So the accessibility override deletes the only thing that made the event legible (a visible reveal that at least reads as an animation) and keeps the thing that makes it harmful (an abrupt luminance change on a row the user was just reading). A user who set `prefers-reduced-motion: reduce` gets an uncushioned flash — the specific class of motion the setting exists to suppress.

**This is a defect in both modes.** Unlike the policy question in Area 2, nothing here is a matter of taste: a row that has just finished should not disappear, and it should not disappear 0.6–2.4 seconds after the event it was reporting.

### G1.5 Mechanism, with file:line

Four declarations, each individually reasonable:

1. `goals.css:71-72` — `.goal-phase{ … animation:goal-phase-arrive var(--spring-soft) both }`. **Unconditional and permanent**: every phase row, in every state, forever carries the entrance animation.
2. `goals.css:142-143` — `@keyframes goal-phase-arrive{0%{opacity:0;transform:translateY(-4px);clip-path:inset(0 0 100% 0)} … }`. The 0% keyframe is a **complete blank**.
3. `goals.css:134` — `.goal-phase.completed[data-wipe="1"]{ animation:goal-phase-complete 520ms var(--ease) both }`. The `animation` **shorthand** replaces `animation-name`, so while the flag is present the arrive animation is not merely overridden in duration — it is not on the element at all. `goals.css:130-133` states the intent: *"A row that just COMPLETED must not also clip-reveal: the reveal would wipe over the strikethrough and the completion would read as 'this row was rebuilt' instead of 'this phase finished'."*
4. `goals.js:377-380` — `wipeFlag()`. The flag's entire lifetime is a **420ms `setTimeout`** that sets `settled[p.id]=true` and **schedules no render**.

The failure is in how (3) and (4) compose. The guard at `goals.css:134` is real and correct — but **its lifetime is the flag's lifetime, while the thing it guards against is permanent.** When the flag is dropped, `animation-name` changes from `goal-phase-complete` back to `goal-phase-arrive` on a live element, which restarts the animation from its 0% keyframe — the full blank. The guard does not prevent the clip-reveal the comment says must not happen. **It postpones it**, to a moment 0.6–2.4 seconds after the completion, when there is no longer anything on screen to explain it.

And because `wipeFlag`'s timer never schedules a render, the attribute is not removed at 420ms — it is removed at *the next render for any reason*, whenever that happens to be. Measured: **583.3ms** after the click in the normal run, **1550.0ms** in the reduce run, from identical scripted input. That non-determinism is the reported "0.4–2.4s later" spread, and it is why the event reads as unrelated to the completion.

### G1.6 G1 — SUSPECTED, and what I did not reach

**Finding G1-A — SUSPECTED.** `goals.css:369` names `.goal-replan-marker` alongside `.goal-phase`, and the still frames show two Replan markers interleaved in the list, so they very likely carry the same unconditional arrive animation. Whether a replan marker blinks under the same conditions was not measured — the marker was not the completing row in either run. *Settled by:* one run of `32-g1-pixel.mjs` with the target band set to a `.goal-replan-marker` rect instead of `.goal-phase.is-current`, through a `goal-accept-replan` (`goals.js:969`) instead of an agent step.

**Finding G1-B — SUSPECTED.** The blank begins on the frame the render lands, so it is not obvious whether a *different* trigger for the same re-render (a toast expiring, a status-clock tick, an unrelated click) produces the same blink on an already-settled completed row, or only on the one whose flag just expired. If the former, the row is fragile for its whole life, not just for 420ms. *Settled by:* completing a phase, waiting 3s for the flag to expire and the blink to pass, then forcing one more unrelated render and re-running the pixel probe on the same band.

Not reached:
- Only the **goal editor**'s phase list was filmed. The activity panel renders `.goal-phase` rows too (`openActivity('goal')` shows 7 of them); whether the same blink occurs there, and whether both lists blink simultaneously, is untested.
- The blink was reached only through `goal-agent-step`. `goal-unblock` (`goals.js:881`) and `goal-reopen-phase` (`goals.js:896`) also call `delete settled[p.id]` or change phase status and would arm the same flag; not filmed.
- No verdict on how this interacts with the Area 1.2 decision-host defect, though both share a shape: a declared animation whose guard or binding constraint is gone by the time it runs.

---

## AREA 3 — the 8-theme sweep (previously unfilmed by anyone)

Scripts: `filmB/40-themes-pixel.mjs` → `41` → `42` → `43-themes-stable.mjs` → `44-theme-focus.mjs` → `45-themes-final.mjs` (contrast), `46-theme-motion.mjs` (motion).
Traces: `theme-contrast.json`, `theme-stable.json`, `theme-focus.json`, `theme-final.json`, `theme-motion.json`.
Eight themes, all reached with `PM56_DEMO.setTheme(id)`, `document.body.dataset.theme` asserted equal to the requested id on every one: `basic-dark`, `basic-light`, `friendly-dark`, `friendly-light`, `glass-dark`, `glass-light`, `retro-dark`, `retro-light` (`styles.css:42-49`).

### 3.0 Four instrument failures, recorded

This section took five revisions. The first four produced confident, wrong numbers, and all four scripts are left on disk:

1. **`40-themes-pixel.mjs` — control failed, and the control was the thing that was broken.** Its "negative control" was an arbitrarily chosen median element that happened to be a `.pm-shimmer` word, which is genuinely low-contrast. The sampler was fine; the control declared it broken. *A control you cannot justify in advance is not a control.*
2. **`41-themes-pixel.mjs` — red control applied as an inline style.** Before and after readings came back **byte-identical** (`cr=12.1 ink=8887 colours=305` twice). The app re-renders periodically and wipes inline styles, so the forced state never survived to the screenshot. Fixed by injecting a stylesheet rule instead.
3. **`42`/`43` — results contaminated by animation.** `setTheme()` triggers a re-render, which restarts `goal-phase-arrive` (the 440ms G1 entrance) and leaves `.pm-shimmer` looping. A row caught mid-animation reads `ink=0` and is indistinguishable from a palette defect. Fixed with a **two-shot temporal control**: two screenshots 800ms apart, a finding counts only if it reproduces in both.
4. **`43` — the big one. Every "unpainted element" was OCCLUSION.** `44-theme-focus.mjs` hit-tested the elements that read blank and found `elementFromPoint` at their centres returning **`qs-head`** and **`composer-input`** — completely different surfaces. `Element.checkVisibility()` returns **true** for an element entirely covered by another surface, so the band being measured belonged to whatever was painted on top of it.

**Findings withdrawn as a result:** "the Goal budget label and its token counter collapse to cr ≈ 1.0 in both retro themes and nowhere else" — that reading was real, reproducible in both shots, present in exactly two themes and absent in six, and **entirely an artefact**: the questionnaire surface was covering that region, and the two retro palettes simply painted the covering surface with less internal contrast. It is exactly the shape of a compelling theme defect. It is not one. Withdrawn.

### 3.1 The instrument that survived, and its controls

`45-themes-final.mjs`. For each theme: one full-viewport `Page.captureScreenshot`, decoded once in-page to a canvas, then every probe element's rect sampled **out of that bitmap**. Contrast is WCAG relative luminance computed from the rendered pixels, so `color-mix()`, gradients, opacity, translucent surfaces and `backdrop-filter` are included by construction — none of which a `getComputedStyle` reading of `color` would capture. Probe set = **leaf** text elements only (no element children), so the modal colour in a band really is the background that text is painted on.

Four controls, all passing:

1. **End-to-end calibration.** A synthetic `#fff on #000` swatch injected into the live page, screenshotted and measured through the identical path. True contrast 21.00; **measured 21.00**, on every run of every script. This proves the whole chain — screenshot, decode, canvas, luminance, ratio.
2. **Red control.** A real high-contrast element (`.code-block`) driven to `color: transparent !important` through an injected stylesheet rule: **cr 17.83 → 1.37, ink 8887 → 1724**. (The residual 1724 is the block's own border and background, correctly still painted.)
3. **Occlusion gate + its own control.** An element counts only if, at its centre, every element painted above it in `document.elementsFromPoint()` is one of its own ancestors. Control: a known-clear element (`strong::Working`) was covered with an opaque overlay — the gate **dropped it** (`covered:DIV`) and **restored it** when the overlay was removed. Between 5 and 35 elements per theme were dropped as occluded; without this gate every one of them would have been reported as a defect.
4. **Two-shot temporal control**, as above.

### 3.2 Palette tokens — exact, computed from the resolved custom properties

Independent of any pixel sampling and therefore unaffected by all four failures above.

| theme | `--text`/surf | `--muted`/surf | `--subtle`/surf | `--accent`/surf | `--muted`/surf-2 | UI font |
|---|---|---|---|---|---|---|
| basic-dark | 17.30 | 6.43 | **3.52** | 5.34 | 6.08 | sans |
| basic-light | 17.74 | 4.97 | **2.97** | 5.49 | 4.64 | sans |
| friendly-dark | 16.69 | 8.15 | **4.27** | 8.14 | 7.50 | sans |
| friendly-light | 12.59 | 5.15 | **2.83** | **3.60** | 4.60 | sans |
| glass-dark | 17.24 | 8.08 | **4.10** | 6.79 | 7.24 | sans |
| glass-light | 15.27 | 5.16 | **3.01** | 5.28 | 4.90 | sans |
| retro-dark | 16.92 | 7.63 | **4.02** | 12.89 | 6.90 | **mono** |
| retro-light | 12.07 | 4.54 | **2.71** | 5.35 | **4.18** | **mono** |

### 3.3 CONFIRMED — `--subtle` fails WCAG AA in all eight themes, on all three surface tiers

**24 of 24 token pairs below 4.5.** Not one theme places `--subtle` at an accessible contrast on any surface:

| | `--surface` | `--surface-2` | `--surface-3` |
|---|---|---|---|
| basic-dark | 3.52 | 3.33 | 3.03 |
| basic-light | 2.97 | 2.77 | 2.53 |
| friendly-dark | 4.27 | 3.94 | 3.54 |
| friendly-light | 2.83 | 2.53 | **2.27** |
| glass-dark | 4.10 | 3.68 | 2.95 |
| glass-light | 3.01 | 2.85 | 2.53 |
| retro-dark | 4.02 | 3.63 | 3.10 |
| retro-light | 2.71 | 2.50 | **2.19** |

Confirmed on painted pixels, not just on the tokens: **21 leaf elements in the default view and 24 with the activity panel open fail AA in every one of the eight themes**, and every one of them computes to the `--subtle` colour. Measured range across those elements: **1.77 to 4.08**. All are 8–10px text — timestamps, counts, thread summaries, chrome state labels:

| element | basic-dk / basic-lt / friendly-dk / friendly-lt / glass-dk / glass-lt / retro-dk / retro-lt | size |
|---|---|---|
| `summary::Optimize tenant-scoped…` | 2.42 / 2.03 / 2.59 / 1.93 / 2.51 / 2.14 / 2.00 / **1.77** | 10px |
| `goal-flag::1 abandoned` | 2.87 / 2.41 / 3.34 / 2.19 / 3.14 / 2.53 / 2.64 / **1.95** | 8px |
| `meta-chip::You` | 2.50 / 2.16 / 2.91 / 2.02 / 2.86 / 2.05 / 2.47 / **1.97** | 9.5px |
| `goal-sidebar-thread::on Query Performa…` | 3.05 / 2.65 / 3.62 / 2.45 / 3.38 / 2.67 / 3.06 / **2.17** | 8px |
| `chat-meta::Claude Sonnet 4.6 · Ag…` | 3.39 / 2.90 / 4.08 / 2.76 / 3.96 / 2.89 / 3.84 / **2.64** | 10px |

**Where:** `styles.css:42-49`, the `--subtle` entry of each palette (`#626b7d`, `#8d96a8`, `#827a8d`, `#a3929d`, `#7c7298`, `#9991aa`, `#4f8065`, `#8a9a8f`). This is a design-token decision made eight times consistently, not a per-theme slip — which is why it belongs to the palette owner rather than to any one theme.

### 3.4 CONFIRMED — retro-light is the outlier theme

With the occlusion gate applied and every element measured in both shots:

| theme | clear elements (default) | AA fails | median CR | clear (activity) | AA fails | median CR |
|---|---|---|---|---|---|---|
| basic-dark | 68 | 22 | 6.08 | 94 | 26 | 6.08 |
| basic-light | 75 | 27 | 4.64 | 94 | 37 | 4.64 |
| friendly-dark | 73 | 21 | 7.50 | 94 | 25 | 7.50 |
| friendly-light | 68 | 26 | 4.60 | 94 | 38 | 4.60 |
| glass-dark | 68 | 21 | 7.53 | 94 | 25 | 7.50 |
| glass-light | 70 | 25 | 4.85 | 94 | 36 | 4.85 |
| retro-dark | 77 | 21 | 6.90 | 94 | 29 | 6.90 |
| **retro-light** | 77 | **46** | **4.18** | 94 | **59** | **4.18** |

retro-light fails on **60% of clear elements** (default) and **63%** (activity panel), against 28–40% for the other seven, and has the lowest median contrast of the eight.

The theme-attribution test isolates it cleanly. Of the elements that pass AA in most themes and fail in only one to three, the responsible theme is:

- default view: **retro-light 16**, friendly-light 3, basic-light 2, glass-light 2
- activity panel: **retro-light 22**, friendly-light 1

Sixteen to twenty-two distinct elements — `meta-pill` chips ("plan", "Version 4", "Ready", "34m ago", "3/6"), thread-list titles, `goal-sidebar-line`, `pmap-head-sub`, `text-button::Skip` — pass in seven themes and fail in retro-light alone, almost all at exactly **4.18**, which is `--muted #607567` on `--surface-2 #efedd2`. One token pair, 0.32 short of AA, decides the whole cluster.

**Where:** `styles.css:49` — retro-light's `--muted:#607567` against `--surface-2:#efedd2`. Raising `--muted` to roughly `#55695c` clears 4.5 on both `--surface` and `--surface-2` and takes the whole cluster with it.

### 3.5 CONFIRMED — friendly-light's semantic colours fail AA on every surface tier

The only theme where the **primary accent itself** fails against the base surface. From the exact token computation:

| pair | friendly-light | next worst theme |
|---|---|---|
| `--accent` on `--surface` | **3.60** | 5.28 (glass-light) |
| `--accent` on `--surface-2` | **3.22** | 4.93 (glass-light) |
| `--accent` on `--surface-3` | **2.88** | 4.32 (retro-light) |
| `--accent-2` on `--surface` | **3.80** | 5.16 (glass-light) |
| `--positive` on `--surface` | **3.97** | 5.29 (basic-light) |
| `--danger` on `--surface` | **4.26** | 4.88 (glass-light) |
| `--warning` on `--surface-3` | **3.70** | 3.97 (basic-light) |

`--accent` is what the concept uses to mark the *current* item — `.goal-phase.is-current .goal-phase-num`, the accent-tinted current-phase border, active chips. In friendly-light that signal is carried at 2.88–3.60 contrast. **Where:** `styles.css:45` (`--accent:#cf5f85`, `--accent-2:#268f83`, `--positive:#2f8d63`).

More broadly, the four light themes carry almost every semantic-colour failure: `--accent-2`, `--positive`, `--warning` and `--danger` all drop below 4.5 on `--surface-2` and `--surface-3` in the light palettes and in none of the dark ones. The dark themes' only systemic problem is `--subtle` (3.3).

### 3.6 CLEAN, with controls — three things that are not wrong

**No unpainted elements in any theme.** With the occlusion gate applied, `blank = 0` in all eight themes in both states. Every element that is genuinely on top of its own pixels paints something. The control that makes this claim worth anything is the red control (a real element driven to `color:transparent` was detected at `ink 8887 → 1724`) plus the occlusion-gate control — the probe can see an invisible element and it can tell an invisible element from a covered one.

**The glass themes show no translucency or blur artefact.** `glass-dark` and `glass-light` use `rgba()` surfaces (`--surface:rgba(22,16,47,.72)`, `rgba(255,255,255,.62)`) with `backdrop-filter` (`styles.css`, `history.css`, `threadops.css`), which is the classic setup for text sitting on whatever happens to be behind it. Measured on painted pixels — which is the only way to see through a backdrop-filter — glass-dark scores **median 7.53, 21 AA fails**, the *best dark theme alongside friendly-dark*, and glass-light **4.85 / 25**, the best light theme. Translucency here costs nothing measurable.

**The entrance animation reads as motion in all eight palettes.** `46-theme-motion.mjs` films `decision-enter` (take 5, 520ms, full length in every theme) and measures the mean luminance of the decision-host band per frame:

| theme | frames | host luminance range | travel | distinct levels | header control travel |
|---|---|---|---|---|---|
| basic-dark | 43 | 0.0113 → 0.0337 | 0.0224 | 18 | **0** |
| basic-light | 36 | 0.8203 → 0.9270 | 0.1067 | 18 | **0** |
| friendly-dark | 38 | 0.0185 → 0.0419 | 0.0234 | 19 | **0** |
| friendly-light | 41 | 0.7618 → 0.8998 | 0.1381 | 23 | **0** |
| glass-dark | 35 | 0.0133 → 0.0457 | 0.0323 | 16 | **0** |
| glass-light | 41 | 0.8261 → 0.9350 | 0.1089 | 20 | **0** |
| retro-dark | 41 | 0.0164 → 0.0545 | 0.0381 | 18 | **0** |
| retro-light | 34 | 0.7255 → 0.8441 | 0.1186 | 17 | **0** |

Every theme produces a **16–23 step luminance ramp** — a genuine gradual entrance, not a snap — and the spatial control (the app header band, measured in the same frames) reads **exactly 0 travel in all eight**, so the ramp is the host moving and not the frame changing. Absolute travel varies 6.2x between basic-dark and friendly-light, but that comparison is not meaningful: absolute luminance travel is inevitably larger on a bright surface. Relative to the resting level the dark themes actually change *more* (basic-dark 0.0113 → 0.0337 is a tripling). The verdict rests on the ramp being present, not on the numbers being equal. **No theme where this motion disappears.**

### 3.7 Area 3 — what I did not reach

- **Two states, not the whole app.** Only the default view and the activity panel were swept in the final (occlusion-gated) pass. The decision surfaces, the context drawer, history, menus and the overlay surfaces were in earlier passes whose results are withdrawn, and were *not* re-measured after the gate was added. That is a real coverage gap: the questionnaire's own text was never validly contrast-measured in any theme.
- **Hover, focus and disabled states untested in any theme.** Focus rings in particular are a classic per-palette failure and were not looked at once.
- **Only `decision-enter` was tested for cross-theme motion legibility.** The G1 blink, the `goal-strike-wipe`, the `pm-shimmer` gradient and the `phase-dot` transitions were not measured per theme. The shimmer is the most likely candidate for a palette-specific failure, because it paints text through a moving gradient with `color:transparent` underneath — in the earliest (uncontrolled) pass a `.pm-shimmer` word read `ink=0`, and while that reading is not trustworthy, it was never *dis*proved either. *Settled by:* one run of `46-theme-motion.mjs` with the band set to a `.wa-verb` rect and the trigger set to a work-step change.
- **No `@media (forced-colors)` / high-contrast-mode check**, and no colour-blindness simulation. `goals.css:88-92` is explicit that colour is only ever channel 1 of 2 and the glyph shape is channel 2, which is the right design — but it was not verified across the eight palettes.
- **The withdrawn retro findings were not re-tested cleanly.** Whether the goal budget line has any genuine problem in the retro themes, once measured without occlusion, is unknown. It is not a defect on the evidence I have; it is untested.

---

## Close of run — W2B2

**Snapshot integrity.** `handoff/w6/frozen-9315f951.html`
- md5 at start of this continuation: `ab94fcc3a25341aa23556bcfbaa9608d`
- md5 at **end** of run: `ab94fcc3a25341aa23556bcfbaa9608d` — **unchanged**. Everything in Areas 1, 2, 3 and G1 was filmed against one identical build, and is comparable with FILM_A.

**Read-only compliance.** No source file was edited. `build.py` was not run. Everything written by this run is under `handoff/w6/filmB/` (scripts `31`–`33`, `40`–`46`; traces `g1px-*`, `theme-*`; stills `shots/g1-blank-*.png`) plus this log.

### Defect register

| # | verdict | what | where |
|---|---|---|---|
| 1 | **CONFIRMED** | the decision host's declared 520ms collapse never runs on close — 292px vanishes in one frame | `styles.css:244-245` vs `app.js:974` |
| 2 | **CONFIRMED** | take 7 (Evidence Split) loses the entire question below the 400px tier — prompt, all four answers and every action button unreachable | `questions.css:431-434` vs `.qs-split-main.qs-scroll{min-height:0}` |
| 3 | **CONFIRMED** | take 7's primary action row is below the fold at every width, the only take of eight | `questions.css` split layout |
| 4 | **CONFIRMED** | four modules + `motion.css` itself override the stated reduced-motion policy; 9 finite entrances collapsed, 8 left running | `goals.css:369`, `questions.css:461-463`, `activity-panel.css:462`, `orbit.css:133`, `motion.css:234` |
| 5 | **CONFIRMED** | three of eight decision takes animate under reduced motion and five do not, decided by a seven-item class list | `questions.css:461` vs `decision-enter` on `.decision-surface` |
| 6 | **CONFIRMED** | overlay menus have no reduced-motion transition at all (10 → 0 instances) | `menus.css:326-332` |
| 7 | **CONFIRMED** | a just-completed goal phase row vanishes and re-arrives 0.6–2.4s later; pixel-confirmed, both motion modes; **worse** under reduced motion (hard blink, no fade) | `goals.css:71-72` + `:134` vs `goals.js:377-380` |
| 8 | **CONFIRMED** | `--subtle` text fails WCAG AA in all eight themes on all three surface tiers (24/24 pairs, 1.77–4.27) | `styles.css:42-49` |
| 9 | **CONFIRMED** | retro-light fails AA on 60–63% of measured elements, twice the rate of any other theme; one token pair at 4.18 drives the cluster | `styles.css:49` |
| 10 | **CONFIRMED** | friendly-light's `--accent` fails AA on all three surfaces (3.60 / 3.22 / 2.88) — the current-item signal | `styles.css:45` |

### SUSPECTED, each with the single measurement that would settle it

| # | finding | settled by |
|---|---|---|
| 1A | two entrance speeds ~40% apart across the eight takes (520ms stock vs 333–420ms bespoke) — **promoted to an accessibility inconsistency by defect 5** | an owner statement, or one shared duration token |
| 1C | content height changes inside an open decision land in one untransitioned frame (±15px observed) | drive a question with a materially different option count, or measure the plan↔permission delta through one surface |
| 2C | `.composer-box` transitions measure 152.6ms normal vs 89.9ms reduce with identical declared durations | re-read `traces/trans-tour-reduce.json`, filter `el` for `composer-box`, read the per-instance `how` field |
| G1-A | `.goal-replan-marker` carries the same unconditional arrive animation and may blink identically | run `32-g1-pixel.mjs` with the band on a `.goal-replan-marker`, triggered by `goal-accept-replan` |
| G1-B | whether an already-settled completed row blinks on *any* later re-render, not only when its flag expires | complete a phase, wait 3s, force one unrelated render, re-run the pixel probe on the same band |
| 3-shim | `.pm-shimmer` paints text through a moving gradient over `color:transparent`; it read `ink=0` once, in an uncontrolled pass | run `46-theme-motion.mjs` with the band on a `.wa-verb` and the trigger on a work-step change |

### Instruments that failed, kept on record

Five, all with their scripts left on disk rather than deleted:

1. `30-g1-second.mjs` — working detector, **unqualified trigger**. `completeWorking()` never completes a goal phase; 261 frames, 0 mutations, 0 `data-wipe`, a confident null reported as clean.
2. `40-themes-pixel.mjs` — the *control* was the broken part; it condemned a working sampler.
3. `41-themes-pixel.mjs` — red control applied inline, silently wiped by the app's re-render; before and after were byte-identical.
4. `42`/`43` — animation contamination; `setTheme()` restarts the 440ms G1 entrance, so mid-animation rows read as palette defects.
5. `43` again — **occlusion**: `checkVisibility()` returns true for fully covered elements. Cost one compelling, reproducible, two-theme-specific finding, since withdrawn.

Four of the five would have produced a publishable-looking defect or a publishable-looking clean. Each was caught by a control, and in three cases by a control added *after* the first result looked too good.
