# Wave 2 — Goals — work log (item 2)

Owner: `goals.js` + `goals.css` only. Commits nothing.
Audit invocation (the only correct one): `node tests/audit.mjs reports/audit.json ./tests`.

## Status
- [x] **0. Recon.** Read PLAN item 2, FIXTURE_SCHEMA, WAVE1A_LOG. Found the blocker below.
- [x] **1. Blocker raised + resolved.** `renderEditorBody()` (app.js:328) had NO extension slot,
      so `renderGoalEditor()` — one of the three places the literals live — was unreachable from
      goals.js. Messaged main rather than editing app.js or quietly shipping 2/3. Main added
      `'goalEditor'` to EXT_SLOTS (app.js:156) and wrapped line 328 in
      `extReplace('goalEditor',{}, renderGoalEditor())`. Verified: `build.py --check` passes
      (sha256 954ffc57c4b491af). All three surfaces are now reachable.
- [x] **2. DATA_HANDOFF.md published** + Wave2-ActivityPanel and Wave2-ActivityBar notified with
      the exported helper API (`PM56_GOAL.get/progress/summary/phaseNumber/render.compact`).
- [x] **3-7. goals.js + goals.css written in full** — fixture, model, all four surfaces,
      all lifecycle actions, both animations. `build.py --check` green (sha256 92942bcc84c27049),
      `node tests/audit.mjs reports/audit.json ./tests` -> 434 pass / 0 fail / 0 console errors.
- [x] **8a. First pixel pass** (`scratchpad/waves/verify-goals.mjs`, results in `verify-goals.json`).
      Confirmed live in-browser: 7 phase rows with 5 distinct statuses; 5 structurally different
      glyph SVGs; current-phase background 31,32,59 vs pending 19,23,37 (colour channel painted);
      blocker `<dl>` has exactly the 5 GRS-019 fields with 133-200 chars each; 2 replan markers;
      sidebar string is exactly `Running · 8/14 tasks · 3 subgoals active`; header chip reads
      `3/6 phases · 42.0K / 100K`. Full lifecycle drive: pause -> resume -> stop -> clear ->
      restore -> material edit -> replan -> accept -> agent steps -> unblock (pointer moves
      BACKWARD ph-handoff -> ph-verify) -> budget_limited (NOT completion) -> raise budget ->
      complete, with a degraded completion report naming the abandoned phase. Zero console errors.
- [x] **8b. Density repair found by measuring, not by looking at a metric.** The Activity panel is
      **250px** wide at the stock layout (the editor pane takes 54%), not the 310px in DEFAULT.
      The first build's phase row was **93px** tall and the goal section **2080px**. Fixed with two
      container queries on `.goal-block` (NOT on `.activity-section-body` — `container-type` implies
      `contain`, and imposing that on another agent's section would be a collision): below 330px the
      state column moves under the copy and the exit criterion clamps to one line; below 260px the
      exit criterion steps back to the drill-in, except on the current phase. Also folded the
      blocker's five fields to Cause + Next safe action with a "Show all five" toggle in the panel
      only (the editor never folds them), and removed the duplicate blocker card that was printing
      the same five fields twice. Row 93 -> 76px (current) and section **2080 -> 1393px**.
- [x] **9. Two defects reported by Wave2-ActivityPanel, both mine, both fixed at source.**
      (a) `renderSection()` opened `.goal-block` and never closed it. `pmPatch` parses the whole app
      as ONE fragment, so an unclosed tag does not stay local — in their Split Master/Detail concept
      four of five domain groups nested inside the goal group and `.panel-resize` stopped being a
      panel child. Closed, and a tag-balance harness added (`tagbalance.mjs`) that renders all three
      surfaces through `PM56_EXT.ctx({})`, counts open/close for 12 tag names, and asserts each emits
      exactly ONE top-level node. All three now balance; `.activity-panel > .panel-resize` restored.
      (b) **Count drift 3/7 vs 3/6.** `app.js`'s `goalSummary()` computes `phasesTotal =
      phases.length`, which counted the abandoned spike; no module can patch it. Fixed by changing
      the SHAPE, not by accepting drift: `phases[]` is now THE PLAN (6 canonical records) and
      `retiredPhases[]` is the audit trail (`ph-matview`, `retiredBy:'rp-2'`, `after:'ph-proto'`
      for display position). The record is still kept and still rendered in place. Verified: the
      Chat Activity Bar Goal count reads `3/6` and matches `PM56_GOAL.progress()`.
      DATA_HANDOFF.md revised; both consumer agents notified.
- [x] **10. Motion correction found by filming, not by reading the CSS.** The first cut put
      `goal-phase-arrive` (a clip-path reveal) on every remounted row — including the row that had
      just COMPLETED, so the reveal wiped over the strikethrough and the completion read as "this
      row was rebuilt". Split it: a completing row now gets `goal-phase-complete` (a 520ms settling
      green wash, no clip) so the strike wipe is the only thing crossing the text, while the row
      that becomes current keeps the clip reveal. Both keyframes end on the resting declared values,
      so `animation-fill-mode:both` agrees with the cascade instead of overriding it.
- [x] **11. A THIRD defect, reported by Wave2-ActivityBar and confirmed by measurement — mine, and
      it was four instances not two.** `--spring` / `--spring-soft` are **duration + easing**
      (`520ms linear(...)` / `440ms linear(...)`), not bare easings. Writing
      `animation: x 300ms var(--spring-soft) both` puts TWO times in the shorthand, so the second
      becomes the **delay** and `both` pins the element on its 0% keyframe for 440ms.
      Measured before the fix: `.goal-phase` and `.goal-replan-marker` both
      `duration 0.3s / delay 0.44s`, and — the one they could not see — `.goal-meter i` was
      `transition: width 620ms var(--spring)` = `0.62s duration / 0.52s delay`, so the budget meter
      sat still for half a second. Drill-in opacity trace before: `0:0 210:0 410:0 477:0.44 611:1`.
      After: `0:0.26 141:0.97 277:1`. All four fixed (`var(--spring-soft)` alone for the arrives,
      `240ms var(--ease)` for the detail, `620ms var(--ease)` for the meter) and the trap is now
      written into the goals.css header with the measured numbers.
      **This also corrects my own step-10 diagnosis**: the ~500ms blank band in the first film was
      this delay, not the clip-path. The clip-path split was still the right change for a different
      reason (a completing row must not clip-reveal over its own strikethrough).
- [x] **12. Phase transition filmed and LOOKED AT** (`sheet.mjs` -> `shots-goals/wipe-contact-sheet.png`,
      8 CDP screencast frames magnified 2.4x, plus `film-goal-transition.mjs` for the numbers).
      Painted-pixel measure = longest CONTIGUOUS run at the strike row (letters have gaps, the
      strike does not), so text is not miscounted as strike:
      `0 → 17 → 29 → 41 → 67 → 71 → 73` px of 77 across six consecutive frames. A snap would go
      0 → 73 in one frame. Computed style read live DURING the transition:
      `animation-name goal-strike-wipe, duration 0.233s (14 frames @60fps), fill both,
      cubic-bezier(.34,.86,.4,1)`; the row itself runs `goal-phase-complete 0.52s`.
      The contact sheet shows: in-progress (accent border, ring+caret glyph, activeLabel) ->
      green wash + filled check-disc + "Done" badge + exit criterion, strike undrawn ->
      strike over "Im" -> "Imple" -> "Impleme" -> full, wash settling out. Resting state
      re-measured after everything settles: `matrix(1,0,0,1,0,0)`, strike 73px = title 73px.
- [x] **13. Header chip made shrink-safe, and a PRE-EXISTING overflow isolated.** With the Activity
      panel pinned, `body.scrollWidth` is **1557** against a 1440 viewport in all 8 themes. Measured
      with my chip force-hidden: **still 1557**. The chat pane's grid column (editor 54% + history
      224px + activity 250px) simply does not fit — `.chat-header` starts at x≈1267 and is 300px
      wide, so its right edge is at 1567 before any of my markup exists. **Not mine, reported, not
      fixed** (styles.css is closed). What WAS mine: my chip was `flex:0 0 auto` at 152px and was
      starving `.chat-title` and `.chat-meta` to 0px. Now `flex:0 1 auto; min-width:0` on the chip
      AND `min-width:0` + ellipsis on its text, so it collapses to 48px and hands 104px back
      (title 0→47, meta 0→54). A viewport media query is the wrong instrument here and is kept
      only as a coarse guard — the header's width is set by a grid column the viewport cannot see.
- [x] **14. All 8 themes screenshotted and LOOKED AT**, plus the editor top/mid/end in basic-dark
      and basic-light. Zero console errors or warnings across every run.
      **Retro is the palette trap Wave2-ActivityBar warned about** — `retro-dark --accent #60f39a`
      vs `--positive #74ffb0`, i.e. in-progress and completed are the same green. Verified by
      looking: the rows still read correctly because completed carries a **strikethrough** and a
      muted title and a FILLED check-disc, while current carries a HOLLOW ring-and-caret, a bolder
      un-struck title, a tinted background and a tinted border. Colour is the weakest of the four.
- [x] **15. Reduced motion.** Zero infinite animations anywhere in my subtree; `.goal-pulse` and the
      status-chip dot resolve to `animation-name:none`; the wipe collapses to `0.001s`. **State
      still advances**: paused→active, `currentPhaseId` ph-implement→ph-handoff, completed 3→4, and
      the strike still ends at `matrix(1,0,0,1,0,0)`. Zero page errors.
- [x] **16. Final painted-pixel pass** (`verify-goals.mjs`, `literals.mjs`, `tagbalance.mjs`,
      `stability.mjs`, `resettest.mjs`, `themes-goals.mjs`, `film-goal-transition.mjs`, `sheet.mjs`).
      * **Glyph sampling repaired.** The first pass sampled the glyph CENTRE, which for a hollow
        shape returns the row background — it "measured" blocked and pending as the same colour.
        Now it crops the whole 16x16 box and takes the painted pixel furthest from the row's own
        background. Five inks, all distinct, all hit-testing to themselves:
        current `139,114,255` · done `92,214,155` · stalled `255,108,125` · pending `142,151,170` ·
        abandoned `96,104,122`. Five structurally different SVG shapes alongside them.
      * All **7 rows** hit-test to themselves (49px, current 76px). Current row background
        `31,32,59` vs pending `19,23,37` — the colour channel painted, not inferred.
      * Completed strike `matrix(1,…)` and width == title width; current strike `matrix(0,…)`.
      * **No stale literals in the rendered UI.** `Phase 2 of 4 / Phase 2/4 / 68% / Revision 4 /
        Goal Mode / Exact blocker / "Evaluating composite index column order" / "1. Measure the
        current path."` — zero hits in `.activity-panel` and zero in `.goal-doc`. A TreeWalker
        finds the remaining occurrences only inside the inlined `<script>`, i.e. app.js's own
        fallback source, which is correct: the concept must still render with no modules loaded.
      * **Goal is not a mode, proven**: the section (7 rows), the header chip and the sidebar
        summary render identically with mode set to Agent, Ask and Plan; `goal.mode` is `null` and
        the module never reads `state.mode`.
      * **Blocker**: the editor shows all five GRS-019 fields; the panel folds to Cause + Next safe
        action and the "Show all five blocker fields" control expands to all five.
      * **Lifecycle, all real state**: pause→`paused` (Pause disables, Resume enables) → resume→
        `active` → stop→`stopped` → clear→confirm→`cleared` (Activity Bar count falls to `—`) →
        restore→`active` 3/6. Material edit → `planning`, replans 2→3, revision 4, callout +
        2 markers → accept → `active`.
      * **Backward pointer, live**: agent step → current `ph-handoff` (skipping the stalled
        Verify) → user unblock → current **`ph-verify`** → step → `ph-handoff` → step →
        `budget_limited` with the phase still unfinished → raise budget → step → `complete`,
        with a degraded completion report naming the abandoned phase.
      * **`data-k` stability**: 14 tagged nodes, 7 seconds, 3+ work ticks — **0 remounted**.
      * **Reset really resets**: clear the goal, press the header Reset, and the fixture comes back
        (`active`, 42000, 2 replans, `ph-implement`, bar `3/6`) while app.js's own `globalReset()`
        still runs (the "Concept reset" toast fires). The `reset-all` override CHAINS to any
        previously registered handler and returns `false` when there is none, so the built-in runs.
- [x] **17. Green.** `python3 build.py --check` PASSES (sha256 df4c59aa0e74d5c0 at hand-off; the digest moves whenever a concurrent Wave 2 agent rebuilds), both deliverables
      byte-identical and still **CRLF**. `node tests/audit.mjs reports/audit.json ./tests` ->
      434 pass / 0 fail / 0 console errors / 0 page errors. Nothing committed.

## Open, and NOT fixed by me
- `body.scrollWidth` **1557** vs a 1440 viewport whenever the Activity panel is **pinned**.
  Pre-existing and reproducible with every goal surface force-hidden. Wave2-ActivityBar
  independently confirmed it: `.chat-stage` / `.chat-header` / `.transcript` / `.activity-wrap` /
  `.composer` all sit at left 1256.6 x width 300 -> right 1556.6, i.e. the chat pane's grid column
  (editor 54% + history 224px + activity 250px) overflows before any module markup exists.
  **Do not re-attribute this figure to a module.** With the activity-bar module disabled it is
  *worse* (1575, with `span.count` at 1575.4), and my goal chip now gives ground instead of
  pushing. Owner is `styles.css`, closed after Wave 1B — Wave 5 or the requester should decide.
  Panel-CLOSED is clean at 1440 in all 8 themes.
- `styles.css` has ~8 more instances of the `var(--spring)`-as-delay trap Wave2-ActivityBar found
  (`message-arrive`, `details-open` x3, `bar-grow`, `morph-stage`, `decision-enter`), plus the
  `transition:` variant which is nastier because a delayed transition reads as a laggy machine
  rather than a bug. Not mine to edit. Worth a Wave 5 sweep.

## Design decisions (recorded before writing code)
- **Phases are our addition, not a port.** Codex's goal is one <=4000-char objective string;
  grepping its whole goal surface for phase/milestone/stage/subgoal returns zero. OMP and Claude
  Code have no phases on a goal either. Stated in DATA_HANDOFF.md and it will be stated on screen.
- **Goal is not a mode.** `goal.mode` is permanently `null`; nothing in the module reads
  `state.mode`, and the goal surfaces render identically in every mode.
- **Goal ∦ todos.** `goal.tasks {done,total}` is the Goal Runtime's own aggregate (ACD-418's
  `8/14 tasks`), NOT a count over `D.todos`. The module never reads `D.todos`. The only join is
  `todo.goalPhaseId`, a foreign key on the TODO, which the Demo Data agent may stamp.
- **`stopped` added to the goal status enum** (FIXTURE_SCHEMA's Codex∩OMP list has no verb for
  "user halted this but kept it"). The packet requires Stop and Clear to be distinct states, and
  mapping Stop onto `complete` would claim a completion that did not happen. Flagged as a
  deviation rather than hidden.
- **`phases[]` is the plan; `retiredPhases[]` is the audit trail.** (Revised at step 9 — it was
  originally one 7-record array, which made `app.js`'s `goalSummary()` count 7.) `phases[]` holds
  exactly the six canonical records so every count in the app agrees on 6; the abandoned
  `Materialized-view spike` that replan `rp-2` removed lives in `retiredPhases[]` with
  `after:'ph-proto'` and is spliced back into the rendered list at that slot. Deleting the record
  would erase the audit trail — the exact "shrink the goal to declare victory" move the authority
  asymmetry exists to prevent. This split is itself an addition: no tool models it, because no
  tool has phases at all.
- **The fixture already exercises the backward pointer**: Verify was started against the
  prototype, stalled on schema approval, and `currentPhaseId` moved BACK to Implement.
