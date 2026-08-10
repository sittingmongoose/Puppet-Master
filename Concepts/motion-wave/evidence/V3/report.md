# V3 — Verification: #panel-search + #panel-source (PM7 Motion Wave)

Agent V3 (report-only). Target `Concepts/PMConcept7.html` served at :8794, standalone
Playwright chromium headless 1440x900. Built file was NOT modified. Motion proven via
`el.getAnimations()` sampled mid-flight, computed transition timing functions, and
class-state assertions. Toasts proven by wrapping `window.toast` (the delegated router's
sink). Reduced-motion verified via BOTH `emulateMedia({reducedMotion:'reduce'})` and the
`data-motion="reduced"` attribute path.

## RESULT: 110 / 111 PASS — 1 FAIL (real defect, item 8.e)

Console: zero errors beyond the favicon baseline in every mode (normal, both reduced
paths, all three themes, and all interrupt-stress runs).

## The one failure

### 8.e — Find-pane filename span (`.sh-fp`) click produces NO toast  [FAIL]
- Repro: open SEARCH panel → find pane → click the filename text (`.sh-fp`) in any
  RESULTS group header. Expected (per scope brief): a toast fires and the group does NOT
  toggle. Observed: group correctly does NOT toggle, but **no toast fires**.
- Root cause: `wireSearch()` attaches `ev.stopPropagation()` to every
  `.sh-fileh .sh-fp[data-demo-action]` (PMConcept7.html ~43927) to stop the parent
  `[data-collapse]` header toggle. But the demo-action router is a SINGLE delegated
  bubble-phase listener on `document` (`document.addEventListener('click', routerHandler)`
  ~30500). `stopPropagation()` therefore also swallows the `cmd.search.open_result` toast.
- Proof it is the stopPropagation (not a registration gap): `.sh-hit` rows carry the SAME
  `cmd.search.open_result` action with no stopPropagation and toast correctly (8.f PASS);
  isolated A/B run: `.sh-hit` click → 1 toast, `.sh-fp` click → 0 toasts.
- Asymmetry that confirms scope: in the REPLACE pane the action lives on `.sh-fileh`
  itself and its `.sh-fp` has no `data-demo-action`/stopPropagation, so it toasts fine
  (9.c PASS). The defect is specific to the find-pane `.sh-fp`.
- Impact: clicking a result filename gives zero feedback. Severity: minor (visual feedback
  only; no state corruption). Suggested fix for the writer: guard the header toggle with
  `if (e.target.closest('.sh-fp')) return;` instead of `stopPropagation()`, so the router
  still fires.

## Per-item results (all sub-checks)

- **1 Panel lifecycle (search)** — 6/6. Enter `.pm-panel-enter`+anim; close `.pm-panel-exit`
  then slot `.hidden`/`.active` cleared/class cleaned; reopen; search↔source ×3 leaves
  exactly one `.active`, no stuck enter/exit classes.
- **2 Search tabs (find/replace)** — 5/5. Ink present + WAAPI stretch mid-flight both
  directions; `--pm-pane-dir` = 1 (find→replace) / -1 (replace→find); correct pane shown.
- **3 Index disclosure + state machine** — 8/8. `#shIdxToggle` opens (`.open`,
  `aria-expanded`, inner `.sh-kv` cascade `pm-kid-in`); Rebuild → building (`dot-run`,
  strip, Cancel) → stale @~1600ms (`dot-warn`, Refresh) → ok @~3200ms (strip hidden,
  `dot-ok`); `#shIdxRefresh` reachable in stale; Cancel → stale flow + toast; closes.
- **4 Scope sprout menus** — 7/7. Both `#shScopeMenu`/`#shReplScopeMenu` (4 items each)
  open animated (`.is-open`+`pm-menu-in` cascade); trigger chevron flips + `aria-expanded`;
  pick `src/ only` on find mirrors to replace (label + `.is-selected` via `pm-menu-pick`);
  closes on pick; Escape closes with no stuck `.is-closing`.
- **5 Query inputs** — 3/3. find→replace and replace→find mirror; `.pm-input` focus-ring
  transition (`border-color, box-shadow`) intact.
- **6 Flag toggles (3+3)** — 5/5. Each toggles `.on` + `pmChipPop` + correct `aria-pressed`
  + toast; find↔replace pairing syncs both directions (Case on find → replace `.on`; Regex
  on replace → find `.on`).
- **7 Filters drawer** — 4/4. `#shFilterToggle` opens (`.open`+cascade); glob input reveals
  `.js-filterchip` and flashes RESULTS body (`pm-flashing`); `#shIgnoreToggle` toggles off/on
  with pop on re-enable.
- **8 Results** — 6/7. collapse-all (all 6 closed + flash + grid-rows anim) / expand-all /
  per-group chevron toggle / 5 `.sh-hit` toasts / `.sh-hit` hover transition all PASS.
  **8.e `.sh-fp` toast = FAIL (see above).**
- **9 Replace pane** — 3/3. Replace + Replace all toast with transform(squash) transition;
  preview `.sh-fileh` clickable → toast.
- **10 Footer Prev/Next** — 1/1. Both toast; squash transition present.
- **11 Reduced motion (search, both paths)** — 6/6. emulateMedia: panel/tab/flag/accordion
  all functional, zero animations, correct end states, zero console errors. `data-motion`
  attribute path: functional + zero anims.
- **12 Source tabs (4)** — 5/5. Non-adjacent changes→branches ink stretch + `dir=1`;
  reverse `dir=-1`; worktrees pane rows cascade; history reachable.
- **13 Branch sprout `#shBranchMenu`** — 4/4. Opens animated (5 items, cascade); pick
  `orch/lane-b-api` updates label + toast; Escape close; outside-click close (no stuck class).
- **14 Changes pane** — 9/9. Unstage-all/Stage-all minibtns; 2 staged + 4 unstaged;
  row header toggles (grid-rows anim + inner cascade); Open diff/Unstage/Discard toast;
  commit input + Generate AI + Commit; Pull/Push/Fetch; Stash; REMOTE PROJECTION disclosure
  toggles (chevron + grid-rows).
- **15 Worktrees pane** — 11/11. 5 chips; Orch chip → FLIP anim on survivors (mid-flight)
  + chip pop + shelf flash; exactly 2 orch rows remain (orphan row persists by design — it
  has no `data-owner`); every chip filters + activates; 7 rows expand with cascade; all 30
  per-row actions toast (Lane/page.go excluded); lane-b Remove `aria-disabled` with
  `demo.reason`; orphaned Repair/Prune; + New Worktree; Lane (page.go) navigates clean +
  returns.
- **16 History pane** — 4/4. 6 commits expand (4 actions each); actions toast; trailing
  Set-compare-target toasts.
- **17 Branches pane** — 10/10. main current row; 8 rows (6 branch + 2 stash); branch rows
  expand (Switch/Merge/Rename/Delete) + toast; + New branch; stash rows Apply/Pop/Drop +
  toast; GRAPH 4 nodes; Open full graph (page.go) no-error + returns.
- **18 Reduced motion (source)** — 3/3. Worktree filter functional, FLIP INSTANT (zero
  anims), correct rows; tab switch zero ink anims; accordion toggles both directions to
  correct end state with zero anims.
- **19 Per-theme `--acc-ease`** — 5/5. Accordion grid-rows timing sampled:
  friendly-dark `cubic-bezier(0.34,1.56,0.64,1)` (spring/bouncy), retro-light
  `cubic-bezier(0.2,0,0,1)` (snap/mechanical, no overshoot), basic-light
  `cubic-bezier(0.26,1.4,0.36,1)` (settle). All three distinct → personality observable.
  Ink runs under all three.
- **20 Interrupt stress** — 4/4. Accordion ×8 settles (no running anim, valid end state);
  tab ×8 → exactly one pane visible matching active tab, no stuck inline styles; menu ×5 →
  no stuck `.is-closing`; zero new console errors.
- **21 Console** — 1/1. Zero errors beyond favicon baseline.

## Motion-quality observations

- Per-theme accordion personality is real and well-tuned: friendly springs (1.56 overshoot),
  retro snaps with zero overshoot, basic/glass settle — matching the spec table.
- Direction-aware panes + WAAPI ink stretch (including non-adjacent tab jumps) feel correct;
  `--pm-pane-dir` always matches travel direction.
- FLIP on the worktree chip filter genuinely animates survivors mid-flight and collapses to
  an instant reorder under reduced motion (correct end positions preserved).
- Liveness (`pmFlash`, `pmChipPop`) fires on real state changes and self-cleans; no stuck
  `.pm-flashing`/`.pm-chip-pop` observed after the safety timeout.
- The reduced-motion contract holds on BOTH kill paths with correct end states — open things
  stay open, ink lands, rows visible.

## Evidence

Screenshots (9): `01-index-building.png`, `02-scope-menu-open.png` (menu cascade),
`03-results-flash.png` (flash peak), `04-ink-stretch.png` (non-adjacent ink),
`05-branch-menu-cascade.png`, `06-flip-midflight.png` (FLIP), `07-theme-basic-light.png`,
`08-final-state.png`, `09-accordion-cascade.png` (grid-rows open + inner `pm-kid-in`).
Machine results: `results.json` (111 checks, 110 pass).
