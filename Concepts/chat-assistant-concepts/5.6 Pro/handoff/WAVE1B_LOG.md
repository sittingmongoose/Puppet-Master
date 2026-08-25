# Wave 1B — Hardening & motion repair — work log

Owner: `styles.css` + `motion.css` ONLY. Second and last writer of styles.css.
Audit invocation (Wave 1A's finding, confirmed): `node tests/audit.mjs reports/audit.json ./tests`.

## Sub-steps
0. [DONE] Ground truth built.
1. [next] 15b rewrite of the hardening layer.
2. [ ] 15c exit vocabulary.
3. [ ] 15g CSS half.
4. [ ] chat-header flex:none.
5. [ ] Verification.

## Step 0 — GROUND TRUTH (done)
Tools written to this dir: `classes.py` (static extraction from every `class="…"`,
`classList.*`, `className=`, incl. interpolation), `harvest.mjs` (runtime MutationObserver
harvest across 8 themes / 24 recipes / all variant families / all 88 demo triggers / every menu
/ 4 viewports), `orphan.py` (the standing orphan gate). Artefacts: `classes.json`,
`harvest.json`.
- static tokens 480, runtime classes 499, **union 554 LIVE class names**, ids 7.
- Orphan gate over styles.css lines 361-580 BEFORE: **101 orphan selector parts / 46 distinct
  dead class names** + 3 dead attribute selectors.

### Corrections to the brief's mapping (measured, do not trust the brief here)
- `.artifact-card` IS emitted (Wave 1A right, PLAN wrong). Kept.
- `.assistant-body`→**`.assistant-grid`** ✓ (emitted via the `${gridClass}` interpolation).
- `.activity-detail`→`.activity-panel` ✓; `.working-animation`→`.working-card` ✓.
- `.drawer-content`→ the real scroll surface is **`.drawer-scroll`**, NOT `.drawer-body`
  (`.drawer-body` is emitted nowhere).
- `.question-body`→ `.decision-body` exists but is **not a scroll surface** (no overflow).
- `.model-list`/`.menu-results`→ the real one is **`.model-scroll`**; it already has
  `overflow:auto` + Wave 1A's grid chain, so the hardening max-height would FIGHT it → deleted.
- `[role=menu|listbox|dialog]` are **never emitted at all** (only `role="img"`/`role="button"`),
  so every `[role=…]` selector in the layer is an orphan too — the brief missed these.
- **The brief/PLAN are WRONG that `.overlay-menu` has no viewport clamp and no `overflow:auto`.**
  `styles.css:268` already carries `max-width:min(420px,100vw-16px); max-height:calc(100vh-16px);
  overflow:auto; scrollbar-gutter:stable`. Measured: a menu forced past the viewport is capped at
  884px on a 900px viewport and scrolls (scrollTop 0→714). Repointing the hardening clamp at
  `.overlay-menu` would have WIDENED menus 420→680px — a regression. The only genuinely additive
  declaration is `overscroll-behavior:contain`.
- `.activity-domain`→`.activity-item[data-hover-domain]`: the hover LIFT already fires from the
  live `.activity-item:hover` (measured: painted mean 25,29,43 → 27,31,44; 164 → 306 distinct
  colours; y −1px). What is genuinely missing is the **press** state (`:active`). Repointing the
  hardening `-2px scale(1.015)` would have overridden the designed −1px lift.
- `.activity-hover-card`→`.hover-card`: repointing would add `pointer-events:none`, which breaks
  `app.js`'s `document.querySelector('.hover-card:hover')` keep-open check → deleted instead.
- `#overlay-root`→`#pmOverlayRoot`: the live rule already does fixed/inset-0/pointer-events:none.
  The additive parts (`z-index:2147482000!important`, `> * {pointer-events:auto!important}`)
  would each be a regression (the latter makes `.toast-stack` interactive) → deleted.
- `.thread-item`/`.thread-actions`: the live sheet already hover-gates `.thread-more` and
  `.thread-status-slot` correctly → the whole guard block is guarding nothing → deleted.
- `.live-agent`/`.agent-copy`: nothing hover-gates lane copy → guard deleted.

### Live defects CONFIRMED by measurement (probe1b_before.json)
- `.resizer`/`.panel-resize`: `touch-action:auto`, `user-select:auto`, body `auto` during drag.
- toast: opacity 1.000 for 17 consecutive samples then the node is gone at 2701ms. No exit.
- `.pm-materialize`: 3/3 live nodes at `will-change:opacity, filter, transform`;
  `.pm-materialize-done` applied 0 times.
- `.chat-header .icon-button`: 22.4px @1440, 14.5px @1100, 14.0px @900.
- `--composer-h` undefined → transient panel `bottom:164px` vs a real composer of 132.9px;
  the designed 48px clearance is actually 31.1px.
- `.decision-evidence` at ≤590px: `display:block` for ALL 8 variants (only variant 7 should).
- **NEW, not in the plan:** the hardening popup clamp also names `.decision-surface`, capping it
  at **680px when the design says 960px** (measured at 2200px viewport: maxWidth 680px, width
  680px). The decision surface is in document flow, not a popup — it does not belong in that list.

## Step 1 — 15b hardening layer rewritten (LANDED)
`styles.css` from line 362 to EOF replaced. 8432 bytes → 6317. Orphan gate over the new
region: **0**. `build.py` OK, audit 434/0/0/0.
Deleted rather than repointed (with the reason): `[hidden]`, `html,body` (exact duplicates of
styles.css:22/28); `--pm-body-font` block (read nowhere); the whole `.thread-*` guard block
(the live sheet already hover-gates `.thread-more`/`.thread-status-slot`); the `.live-agent`
guard block (nothing hover-gates lane copy); `#overlay-root`/`#portal-root` (live rule already
correct, the additions would regress); the popup max-width/max-height clamp (already designed
per component; would have widened menus 420→680 and was the thing capping `.decision-surface`
at 680px); `.activity-hover-card` (pointer-events:none breaks the keep-open check);
`.menu-cluster`/`.menu-with-sidecar`/`.popup-cluster` + `@keyframes pm56-sidecar-in` +
`@keyframes pm56-popup-in` + `--popup-origin`/`--popup-shift`/`--submenu-origin`/`--submenu-shift`
(the root menu and sidecar are two sibling fixed nodes; the live `menu-pop` already uses the
`--origin-x/--origin-y` that positionOverlays() really writes, and the live `sidecar-pop`
already uses `--side-dir` from the real `[data-side]`); the whole `@media(max-width:700px)`
block + `@keyframes pm56-mobile-submenu-in` (on a phone `setSubmenu()` sets `compactSub` and
renders the submenu INLINE — there is no sidecar node to reposition, so the behaviour it
emulated is already implemented in JS); `.model-list`/`.menu-results` max-height (would fight
Wave 1A's `.model-scroll` grid chain); `.toast[aria-hidden]/.toast.is-leaving`
(`.toast-stack` is already `pointer-events:none`).
Repointed: min-width:0 group, overflow-wrap group, `#pmOverlayRoot` overscroll set,
`.overlay-menu.model-menu` cap, the six real scroll surfaces, `.resizer`/`.panel-resize`.
Added: `.activity-item[data-hover-domain]:active` press; `body:has(.resizer.dragging)`
document-wide select suppression; `.chat-header .icon-button{flex:0 0 auto}` (Wave 1A handoff).

## Step 2 — 15c exit vocabulary (LANDED)
`motion.css`: `--pm-t-exit:120ms`, `--pm-t-overlay-exit:180ms` published in `:root`.
`.pm-materialize` lost its permanent `will-change`; `.pm-materialize-done` DELETED (CSS cannot
add a class, so the pairing could never work — removing the claim is the honest fix).
`.pm-leaving` rebuilt on `--pm-t-exit` and given an overlay form.

### CONTRACT FOR WAVE 3 / WAVE 4 — how to animate something out
| what | class to add | how long to wait before removing the node |
|---|---|---|
| content row / card | `pm-leaving` | `--pm-t-exit` = **120ms** |
| overlay menu, sidecar, hover card, drawer, dialog, history flyout, activity panel | `pm-leaving` on the overlay root | `--pm-t-overlay-exit` = **180ms** |
Read the wait back with `parseFloat(getComputedStyle(el).animationDuration)*1000` — under
`prefers-reduced-motion` both collapse to **1ms**, so a hard-coded 180ms would stall the close.
The overlay exit (`@keyframes pm-overlay-out`) collapses toward `transform-origin`, which
`positionOverlays()` already aims at the trigger via `--origin-x/--origin-y`, and holds opacity
1 through the first 70% — the asymmetric close of ACD-439. Wave 3 Menus: when you replace the
`menu-pop` entrance with the corner-origin sprout, override `pm-overlay-out`'s 100% frame to
`scale3d(.72,.48,1)`; nothing else here needs to change.
Toast: exit is already done in pure CSS (`toast-out`, 320ms, delayed 2480ms so it lands on the
same tick `toast()` splices at 2800ms). fill-mode is `forwards`, never `both` — `both` would
back-fill opacity:1 from t=0 and erase the `toast-in` entrance.

## Step 3 — 15g CSS half (LANDED)
- `.artifact-card` **kept** — re-verified emitted by `renderArtifactMessage` (runtime harvest +
  static). The PLAN is wrong about this; Wave 1A was right.
- `--composer-h` **removed entirely**, not defined. `.activity-panel.transient` is now placed into
  `.chat-stage`'s TRANSCRIPT grid area (`grid-row:2/3;grid-column:1/2`) with `inset:auto 10px 10px
  auto`, so `bottom:10px` means "10px above whatever follows the transcript" at any composer
  height and needs no measurement. Trap found and documented in the sheet: for an
  absolutely-positioned grid child an `auto` grid line resolves to the container's PADDING EDGE,
  not a one-track span — `grid-row:2` alone silently kept the full-stage containing block
  (measured: panel bottom 866 / overlapping the composer). `grid-row:2/3` fixes it.
- `@media(max-width:590px) .decision-evidence{display:block}` **deleted** (it was unscoped).
- Retired: `@keyframes core-float`, `--radius-xs`, `--radius-lg`, `--pm-body-font`.
  NOTE FOR LATER WAVES: `--radius-xs`/`--radius-lg` no longer exist; the surviving radius tokens
  are `--radius-sm` (9px) and `--radius` (12px).

## Step 4 — Wave 1A handoff (LANDED)
`.chat-header .icon-button, .chat-header .header-chip { flex: 0 0 auto; }`

## Step 5 — VERIFICATION (Playwright + chromium-1234, file://, painted pixels)
Scripts: `verify1b.mjs`, `menu_toast.mjs`, `toast3.mjs`, `dbg2.mjs`, `probe1b.mjs` (before),
`harvest.mjs`, `orphan.py`. Raw results: `verify1b.json`, `menu_toast.json`, `probe1b_before.json`.
- **Over-long menu clamped AND scrolls** (viewport 1440x220, real render path):
  menu top 8.6 / bottom 212.6 inside a 220px viewport; `max-height:204px`;
  `overflow-y:auto`; `overscroll-behavior-y: auto -> contain`; scrollHeight 236 > clientHeight 202;
  scrollTop 0 -> 34; after scrolling the LAST row is the element `elementFromPoint` returns at its
  own centre, is fully inside the viewport, and its crop paints **395 distinct colours**.
  4 of the 6 menus need and get a scrollbar at that height; all 6 stay inside the viewport.
- **Resizer**: `.resizer` and `.panel-resize` `touch-action: auto -> none`,
  `user-select: auto -> none`; during a drag (`.dragging`) `body` and `.transcript` both report
  `user-select:none` and the cursor is `col-resize`; both revert to `auto` on pointerup.
- **Activity-bar hover AND press change painted pixels**: rest mean RGB 23.97,28.27,42.41 /
  180 colours -> hover 28.20,32.99,46.37 / 304 colours -> press 24.80,29.04,41.19 / 239 colours,
  computed transform `matrix(0.97,0,0,0.97,0,0)`. Press was NEW (there was no `:active` before).
- **decision-evidence**: at 1440 / 700 / 560 / 390 px, variants 0-6 are `display:none` and paint a
  zero-area box; only variant 7 is `block` and painted. Was `block` in ALL EIGHT below 590px.
  `.decision-surface` max-width `680px -> 960px` (measured at 2200px: 680 -> 960 painted).
- **Toast fades**: opacity 0.441 -> 1 (entrance), holds 1 for 2.4s, then
  0.999 / 0.939 / 0.727 / 0.13 and the node is gone at 2904ms. `animation-name` reads
  `toast-in, toast-out`. Before: opacity 1.000 at all 17 samples, node gone at 2701ms.
  Reproduced on 4 consecutive toasts (single node, `nodeChanges:1` each time).
- **will-change leak**: `.pm-materialize` 3/3 leaked -> **0/3**, computed `auto`.
  `.pm-shimmer` still hints `background-position` and every `.pm-shimmer.pm-settled` clears it.
- **chat-header icon buttons**: 22.4 / 14.5 / 14.0 px at 1440 / 1100 / 900 -> **30px at
  1440, 1100, 900 and 700**.
- **Transient activity panel**: was bottom 866 overlapping the composer at every composer height;
  now top 98 / bottom 679.1 with the transcript row 88-689.1 — inside the transcript row,
  11px clear of the activity bar, no composer overlap, and it hit-tests to itself. Identical at
  empty / short / 6-line composer content (the old rule was blind to all three).
- **8 themes**: zero horizontal and vertical document overflow in every one; 0 console errors and
  **0 console warnings** across every run.
- **Exit contract proven functional** (`exitcontract.mjs`): applying `pm-leaving` to a live
  `.overlay-menu` gives `animation-name: pm-overlay-out`, `animation-duration: 180ms`,
  `pointer-events:none`, `transform-origin: 31.75px 238.141px` (the trigger anchor
  `positionOverlays()` writes), and an opacity trace of 1 / 1 / 1 / 0.888 / 0 across 240ms with
  the scale going 1 -> 0.94 — i.e. it stays opaque through the first two thirds of the collapse.
  Applying it to a row gives `pm-dematerialize` at 120ms. Under `prefers-reduced-motion` both
  read **1ms** and complete on the next frame.
- **Reduced motion**: `document.getAnimations()` sweep over every element reports
  **13 infinite animations normally -> 0 under reduce**, and the working sequence advances
  identically in both modes (steps 0,0,1,1,1,2,2,2,3,3 over 7s in each).
- **Regression smoke**: Wave 1A's Demo Studio still drags (310,126 -> 172,218) and resizes
  (816x645 -> 693x541) and still hit-tests to itself; a real pointer drag of `.resizer` changes
  `--editor-w` to 45.67% with `window.getSelection()` empty and `body` user-select `none`
  throughout, reverting to `auto` on pointerup.
- Screenshots: `shots1b/` (8 themes, transient panel, model menu, clamped menu at 220px,
  decision variants 3 and 7 at 560px).

## Final gates
- `python3 build.py --check` **PASSES**; both deliverables sha256 `a92b8dcbbae6cd6a`,
  byte-identical to each other, **5907 CRLF / 0 bare LF** each.
- `node tests/audit.mjs reports/audit.json ./tests` -> **434 pass / 0 fail / 0 console errors /
  0 page errors**, and 0 console *warnings* in every Playwright run.
- Nothing committed.

## ORPHAN REPORT (the standing gate: `orphan.py` / `orphan_all.py`)
- **Hardening layer (styles.css line 374 -> EOF): 0 orphan selector parts** (was 101).
- Whole `styles.css`: 101 -> **50**, `motion.css`: 1 -> **15**. Every survivor justified:
  1. **43 parts / 8 blocks — the Activity-Detail concept scaffolding** (`.activity-concept-board`,
     `.activity-goal-tree` + `.tree-root/.tree-child`, `.activity-master-detail` + `.master`/
     `.detail`, `.activity-agent-board`, `.activity-ledger`, `.activity-live-feed`,
     `.activity-dashboard`, `.ring-mini`). The PLAN assigns these to **Wave 2's Activity Panel
     agent** by name ("built on the orphaned styles.css:336-343 structures"). Deleting them would
     destroy that agent's raw material. Left deliberately. Wave 2 must either use them or delete
     them — after Wave 2 this gate should read 0 here.
  2. **14 parts — `.pm-leaving` in motion.css**, the published exit contract above. It is an
     orphan *by design until Wave 3/4 applies it*; it is documented, not decorative. If Wave 5
     finds it still unapplied, delete it rather than shipping it.
  3. **`.activity-goal-tree .tree-child.live`** in the reduced-motion stop list — belongs with (1).
  4. **`.overlay-menu.wide`** (styles.css) — `renderMenu()`'s class builder emits only
     `model-menu` and `compact`, never `wide`. Left because Wave 3's Menus agent owns menu CSS and
     will plausibly want it for the worktree menu; if not, it should be deleted there.
  5. **`.diff-line.del`** — the code-block renderer produces only `focus` and `add` today, but
     `changes[].hunks` in Wave 1A's fixture schema will produce deletions. Left for Wave 2.
  Deleted this step: `.message-actions.always` — Wave 1A removed `.always` from the renderer as
  part of item 8, so the CSS half became dead this session.

## Things the PLAN / the task brief got wrong (measured)
1. `.artifact-card` IS emitted. (Brief already flagged this; confirmed.)
2. `.overlay-menu` was NOT missing its viewport clamp or `overflow:auto` — styles.css:268 has had
   both all along, and repointing the hardening clamp onto it would have widened menus 420->680px.
   The only real gap was `overscroll-behavior`. The user-visible menu complaints in item 5 were
   Wave 1A's `.model-layout` height chain, not this.
3. The activity-bar hover LIFT already fired (`.activity-item:hover`, -1px, measured in pixels).
   Only the press state was missing.
4. `[role="menu"] / [role="listbox"] / [role="dialog"]` are emitted nowhere at all — the brief's
   orphan list missed these three, and they appeared in 5 rules.
5. `.drawer-body` does not exist; the drawer's scroll surface is `.drawer-scroll`.
   `.decision-body` exists but is not a scroll surface.
6. `.model-list`/`.menu-results` map to `.model-scroll`, which must NOT get the hardening
   max-height — it would fight Wave 1A's fix.
7. NOT in the plan at all: the hardening popup clamp was capping `.decision-surface` at 680px
   against its designed 960px.
8. `.pm-rail-item.enter` does NOT stick at the wrong scale: `enter` is only ever emitted together
   with `current`, and `.current` also declares `scale(1)`, so the `both` fill and the declared
   value agree. Left alone.

## Notes / hazards handed forward
- `--radius-xs` and `--radius-lg` no longer exist (retired per 15g). Surviving radius tokens:
  `--radius-sm` 9px, `--radius` 12px.
- The toast exit is timed against `toast()`'s hard-coded 2800ms. If a later wave changes that
  timeout it MUST change `toast-out`'s 2480ms delay to match (or switch the toast to the
  `.pm-leaving` contract, which is the better long-term shape).
- `.thread-row.active::before` is a coloured left-edge accent bar used for selection — the exact
  pattern this project's design rules forbid. It is pre-existing and belongs to **Wave 3's History
  agent** (item 3/4), not to this wave; flagging it rather than removing the only selection
  affordance without a designed replacement.
- `motion.js:73 flipHeight()` is still exported and never called (Wave 1A noted it; motion.js is
  not in this wave's ownership list, only motion.css).
