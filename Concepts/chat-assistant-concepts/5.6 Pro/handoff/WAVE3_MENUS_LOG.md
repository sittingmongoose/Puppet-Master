# Wave 3 — Menus — work log (item 5)

Owner: `menus.js` + `menus.css` ONLY. No edits to `app.js` / `styles.css` / `index.html` /
the standalone. Build with `python3 build.py`; audit with
`node tests/audit.mjs reports/audit.json ./tests`.

## Sub-steps
0. [DONE] Read the notes/plan/1A/1B logs. Baseline measured.
1. [ ] A — corner-origin sprout open (menus.css + menus.js post-render hook).
2. [ ] A — asymmetric ghost close.
3. [ ] A — model search height spring + bottom anchoring.
4. [ ] B — worktree control in `headerExtras`, composer copy hidden + patch sent.
5. [ ] C — picker sweep.
6. [ ] Verification harness `menus-verify.mjs` + filmed open/close.

## Step 0 — baseline (done)
- `python3 build.py --check` PASSES, sha256 `920ef6f9d3144742`.
- `node tests/audit.mjs reports/audit.json ./tests` -> 434 pass / 0 fail / 0 console / 0 page errors.
- `menus.js` / `menus.css` are still the Wave 1A stubs (header comment only).

### Facts read out of the sources (not assumed)
- `renderChatHeader` (app.js:493) emits, in order: history toggle, new-thread, title, meta,
  **search** (`data-menu-anchor="thread-search"`), **`extRender('headerExtras')` (app.js:502)**,
  **context ring** (app.js:503). So `headerExtras` is already exactly "between the search icon
  and the context ring" — no repositioning needed.
- `renderChat()` renders the header BEFORE the composer, so a header
  `data-menu-anchor="worktree"` wins `positionOverlays()`'s `querySelector` over the composer's.
  The composer copy still has to go (two visible controls for one setting); it can be hidden
  from `menus.css` immediately and deleted from `app.js` by the orchestrator.
- `.overlay-menu` entrance today: `animation: menu-pop var(--spring) both` (styles.css:292),
  `transform-origin: var(--origin-x,50%) var(--origin-y,100%)`.
- `positionOverlays()` (app.js:1314) writes `--origin-x` = trigger-centre X **relative to the
  menu box**, clamped to [18, width-18]; `--origin-y` = `'0px'` when the menu sits BELOW the
  trigger, `'100%'` when ABOVE. That is the corner information the sprout needs.
- **Measurement hazard, confirmed by reading:** `positionOverlays()` measures
  `root.getBoundingClientRect()` inside the rAF right after `pmPatch`, while `menu-pop`'s
  `both` fill has the node at its 0% frame (`scale(.94)`). With the sprout's
  `scale3d(.72,.48,1)` the error would be 28% wide / 52% tall — so the sprout MUST NOT be a
  fill-mode:both animation. Ported as a *transition* (as PMConcept7 does), with the closed
  state applied only after positionOverlays has measured an untransformed box.
- `closeMenu()` (app.js:1345) drops the node; there is no close path to hook and no
  `menuClose` slot. Ordering fact that makes the fix possible: `pmPatch` runs synchronously,
  so a `MutationObserver` microtask fires BEFORE the `requestAnimationFrame(positionOverlays)`
  callback, and a rAF requested from that microtask runs AFTER positionOverlays.
- `.overlay-menu.model-menu` already carries `transition: height ...` twice
  (styles.css:293 `var(--spring)`, styles.css:465 `380ms cubic-bezier(.16,1.16,.3,1)`), and
  app.js sets an inline `height:${modelMenuHeight()}px`. So the height already animates; what
  the plan asks for is the stronger `340ms cubic-bezier(.22,1.72,.36,1)` spring, the
  size-bounce, and bottom-edge anchoring.
- `data.js` `operational.worktrees` (data.js:1871) has 4 records whose `id`s are exactly the 4
  values app.js's worktree menu offers, with `state` in
  `unbound|bound-clean|bound-dirty|bound-conflict`, `dirtyFiles`, `conflicts`, `ahead/behind`,
  `note`, and `labels.worktreeState` for display copy.
- `D.models` = 14 records / 5 providers / 9 accountIds.

## Step 1+2+3+4 — menus.css and menus.js written (LANDED, build green)
`python3 build.py` OK, sha256 `8ca3b7e62d4b09a7`. `node --check menus.js` OK.

### What is in menus.css
1. **Sprout entrance as a TRANSITION, not an @keyframes.** `animation:none` retires
   `menu-pop` / `sidecar-pop`; open is `opacity 160ms var(--ease)` +
   `transform 300ms cubic-bezier(.22,1.55,.36,1)` from `scale3d(.72,.48,1)` translated
   +10px toward the trigger. `transform-origin` is `var(--origin-x) var(--origin-y)` —
   positionOverlays' own values, no new origin property invented.
2. Sidecars sprout from the edge facing the root menu with the axes swapped
   (`.48/.72`), keyed off the `data-side` the renderer already emits.
3. Model picker adds `height 340ms cubic-bezier(.22,1.72,.36,1)` — the overshoot spring.
4. `pm56-menu-ghost` / `pm56-collapsing`: the asymmetric close,
   `transform 220ms cubic-bezier(.45,.05,.55,.2)` with `opacity 45ms ease-in 175ms`.
5. `pm56-menu-size-bounce` 380ms (ONE time value — a second would be the delay; no
   fill-mode, `both` would pin the transform).
6. `pm56-anchor-bottom` → `top:auto!important; bottom:var(--pm56-bottom)`.
7. Worktree control styling incl. the four fixture states, and
   `.composer-tools .selector-button[data-kind="worktree"]{display:none}`.
8. Scoped `prefers-reduced-motion` block.

### What is in menus.js
- A `MutationObserver` on `#pmOverlayRoot` (childList+subtree) is the only public signal
  for "menu appeared / disappeared / list resized". The ordering it relies on:
  `pmPatch` (sync) → `rAF(positionOverlays)` queued → task ends → observer **microtask**
  → `rAF(afterPosition)` queued 2nd → next frame: positionOverlays, then afterPosition.
  So the microtask can neutralise the transform *before* the measurement and the rAF can
  read the origin *after* it.
- **All state lives on `#pmOverlayRoot`, never on the menu**: `pmSyncAttrs` rewrites the
  menu's `class` and `style` from the template every render, so anything parked there is
  erased within a frame. `#pmOverlayRoot` is the patch container and is never touched.
- Two independent lanes (`root-menu`, `sidecar`) because hovering a model row adds a
  sidecar without touching the root.
- Menu identity = class + data-side + `.menu-head strong` text. Deliberately NOT the
  child count: thread-search grows a result per keystroke and would re-sprout each time.
- Close: the departing menu is re-materialised as a clone parked on `<body>` — outside
  `#pmOverlayRoot`, where pmPatch cannot see it — and collapsed there. Scroll positions
  are copied over. Cleared on `transitionend` (transform) plus a 260ms safety timer.
- `window.PM56_MENUS` exposes lanes/anchored/sprout/worktree read-only for harnesses.
- `headerExtras` slot emits the worktree control with `data-k="wtbtn"`.

### Measured before/after (the two live defects this fixes)
| | before | after |
|---|---|---|
| positionOverlays measures the model menu | **394.8 x 526.4** (mid `scale(.94)`) → top 283, **menu covered its own trigger by 33px** | 420 x 560, top 249.5, clear of the trigger |
| filtering the model search | top pinned at 249.5, **bottom flew 809.5 → 596.5** | bottom pinned, top absorbs the change |

Sprout sampled frame by frame at 1440x900 (persona menu):
`t22 opacity 0 / matrix(0.72,0,0,0.48,0,10)` → `t97 0.803 / .953,.913` →
`t156 0.985 / 1.026,1.048` (overshoot) → `t356 opacity 1 / none`. Zero console errors.

### The plan was slightly wrong about the header slot
`headerExtras` has **two** registrants: the Wave 2 Goals agent's goal chip registers
first (build.py MODULES order puts `goals` before `menus`), so the live order is
search → goal chip → **worktree** → context ring. The worktree control ends up
immediately left of the context ring, which is what ACD-437 describes; "immediately
after search" is not achievable and is not the contract.

## Step 4b — CROSS-MODULE DEFECT FOUND AND FIXED (z-order)
The first harness run failed at the model picker: Playwright reported that
`<span>Product Design Discussion</span>` from `<aside class="history-flyout">`
**intercepted pointer events** over the provider rail. Measured:
`.history-flyout` computed `z-index:900`, `.overlay-menu` computed `z-index:auto`.
Both are children of `#pmOverlayRoot` (z-index 1000, a stacking context); a positive
z-index outranks `auto` regardless of DOM order, so **every open menu was painted under
the history drawer** — hit test at the "All providers" button returned the flyout's span,
`ownedByMenu:false`.

This is new: the Wave 3 History module (`history.js`, 02:17) converts `historyMode`
'pinned' → 'floating', so the flyout is now *always* present in the overlay layer, and it
carries an explicit `z-index:900`. Before that change the flyout was only present in
floating mode and had no z-index, so DOM order alone kept menus on top.

Fixed in `menus.css` (the file I own) by having `.overlay-menu` claim the token that
already existed for it — `z-index: var(--z-menu)` (1000), which sits above `--z-drawer`
(900) and below `--z-tip` (1100, the hover card). Re-measured: menu z-index 1000,
provider button `ownedByMenu:true`. The ghost is on `<body>` so it takes `--z-menu` too
and ties with `#pmOverlayRoot`, winning on DOM order — a menu still collapses *over* the
history drawer.

**Flagged for the orchestrator / History agent, not fixed here:** in the new "pinned"
mode the flyout renders at x=782.6, width 200, height 834 — floating in the middle of a
1440px viewport rather than occupying the left column. That is History's item 4, in
flight; I did not touch it and my assertions do not depend on it.

## Step 5 — SECOND measurement trap found (width depends on `left`)
`menus-verify.mjs` run 2 caught the Permissions menu sitting **over its own trigger**
(menu bottom 838.9 vs anchor top 816.5). Root cause is independent of the transform one:

A `position:fixed` box with `left:auto; width:auto` is shrink-to-fit inside
`containing-block width − left`, so the menu's **width — and therefore its text wrapping
and its height — depends on the `left` positionOverlays has not written yet.** Measured:
Permissions reported **182.3px tall** at the static position and settled at **211.7px**
once `left:1151.7px` narrowed it to 274.3px. positionOverlays computed `top` from 182.3,
so the menu landed 29px too low.

Fixed in `menus.css` by pinning `left:8px !important; top:8px !important` during the
premeasure frame. That makes the measured width `min(max-content, 420px)` — which is
exactly the width it keeps afterwards, because positionOverlays clamps
`left ≤ innerWidth − width − 8`, leaving at least `width + 8` of room. So width, wrapping
and height are all measured at their final values, for the sidecar as well as the root.

## Step 5b — the 12 audit failures are NOT this module (proved, not argued)
`node tests/audit.mjs` went 434/0 → 417/12 between my baseline and now. Isolation probe
(`menus/p4.mjs`) shows both causes are the **Wave 3 Context module** (context.js/css landed
02:18, five minutes after menus.js):
1. `audit.mjs:55-62` waits for `getByText('Compact Now', {exact:true})` and
   `getByText('More Details', {exact:true})`. The live DOM now renders **`Compact now`**
   and **`More details`** (u11 casing). Probe: `compactNowExact:false`,
   `compactNowExactInMenu:["Compact now"]`, `moreDetailsExact:["More details"]`.
   Those two assertions fail on a rename.
2. Because that step throws before its `close-context-details` click, the context menu is
   left **open**, and the ten downstream activity tests then fail with
   `<div class="ctx-pop"> … intercepts pointer events`.
Direct test of my only plausible contribution — the `z-index` — reproduced the
interception **with and without** it: `hitWithZ:"SPAN."`, `hitWithoutZ:"SPAN."`,
identical. `#pmOverlayRoot` already carries `z-index:1000` above `#pmRoot`, so an open
menu covered that button before my rule existed; the rule only reorders siblings *inside*
the overlay layer. Handing this to the orchestrator: the audit's two literal strings need
updating to match the Context module, or the Context module needs to keep the old casing.

## Step 5c — third measurement bug, caught by reading the numbers not the verdict
Run 3 was 75/75 green, but one detail was wrong and no assertion covered it: the model
picker reported `{t:8, b:568}` — pinned to the TOP of the viewport rather than sitting 7px
above its trigger — while "does not cover its own trigger" happily passed.

Cause: `afterPosition()` read the rect while the `left:8/top:8` measurement pin was still
applied, so the bottom anchor was derived from `bottom:568` instead of `bottom:809.5`.
Split the pin into its own class (`pm56-*-pin`), dropped it FIRST in `afterPosition()`,
forced layout, and only then read the settled rect.

Added the assertion that would have caught it: **`gap` between the menu edge and the
trigger edge must be 0..14px** (positionOverlays' designed gap is 7). A green suite that
does not assert adjacency is exactly the "434/434 PASS with twelve live defects" failure
mode this plan exists to end.

## Step 6 — verification (menus-verify.mjs, 80 assertions, 80/80)
Harness: `scratchpad/waves/menus-verify.mjs`, re-runnable by any agent:
`node menus-verify.mjs [path/to/index.html] [--json out.json]`. Two browser passes (normal
motion, and `reducedMotion:'reduce'`). Nothing rests on a bounding box alone — hit tests go
through `document.elementFromPoint()`, "does it paint" screenshots the crop, hands the PNG
back to the page as a data URL, draws it to a canvas and reads `getImageData`, and every
motion claim is sampled per animation frame.

What it proves (numbers from the run against `index.html`):
- **Worktree in the top bar.** In `.chat-header`, after the search icon and before the
  context ring; 30x30; owns the pixel at its own centre; crop has 80 distinct colours.
  `data-wt-state` equals `D.operational.worktrees.find(id===state.worktree).state`.
  Driving the real menu through all four worktrees paints four different dot colours —
  bound-clean `rgb(92,214,155)`, bound-dirty `rgb(245,189,85)`,
  bound-conflict `rgb(255,108,125)`, unbound hollow `rgb(19,23,37)`.
  Exactly one VISIBLE `data-menu-anchor="worktree"` (the composer copy is `display:none`).
- **All five pickers** (persona / model / mode / permissions / worktree): exactly one root
  menu open, settles to `opacity 1 / transform none`, inside the viewport, hit-tests to
  itself, paints 1000-2000 distinct colours, does not cover its trigger, and sits 7px from
  it. Closes with no leaked node and no leaked ghost.
- **Model menu**: 14 rows = 14 fixture models, 5 provider groups, `scrollH 740 > clientH 511`,
  scrolls, and the LAST row ("Cursor Auto") hit-tests to itself and paints after scrolling.
  Provider rail filters: favorites 3 / all 14 / Anthropic 6 / Alibaba 3 / Moonshot 2 /
  z.ai 2 / Cursor 1.
- **Search filter springs**: 18 in-flight frames, overshoots to 328.09 past a 347 target and
  settles, and the bottom edge spread across the whole animation is **0.00px**.
- **Close stays opaque**: sampled `[t, opacity, scaleX, scaleY]` — opacity is still 1.000 at
  scaleY 0.699 (50%+ of the collapse), the fade starts at 85.6% of the close duration, and
  the end frame is `scaleX .728 / scaleY .494` (non-uniform, matching scale3d(.72,.48,1)).
- **One overlay at a time**: opening four pickets in sequence never yields 2 root menus.
- **8 themes**: the worktree control paints and hit-tests in all 8.
- **Reduced motion**: open is complete within 3 frames at opacity 1 / transform none,
  `transition-duration: 0s`, hit-testable; close is instant with no ghost.
- Zero console errors and zero page errors in both passes.

Responsive spot-check (`menus/p5.mjs`), 4 viewport widths x 5 pickers = 20 combos:
gap 7.0 (model 7.4-7.5) everywhere, no overlap, in-view, hit-tests to itself, no leftover
menus, 0 console errors.

Sidecar (`menus/p6.mjs`): hovering a model row opens the effort flyout with
`transform-origin: 341.391px 40.6716px` on a 341.4x226 box = **100% 18%**, i.e. the right
edge — the edge facing the root menu, since `data-side="left"` places it to the left
(x 517.8 vs root left 866.2). Does not overlap the root menu; hit-tests to itself.

### Filmed (CDP screencast -> contact sheets, `menus/film-menus.mjs`)
`menus/open-contact-sheet.png`, `menus/close-contact-sheet.png`,
`menus/filter-contact-sheet.png` (12 frames each, 6 per row, frame-numbered).
- **Open**: the box appears small and translucent at the trigger corner and fills out to
  full size and opacity over ~4 frames. Numeric sample from `menus/p1.mjs`:
  `t22 opacity 0 / matrix(0.72,0,0,0.48,0,10)` -> `t97 0.803 / .953,.913` ->
  `t156 0.985 / 1.026,1.048` (overshoot) -> `t356 opacity 1 / none`.
- **Close**: I looked at the sheet. The menu shrinks toward its trigger corner across six
  frames while remaining fully legible — every row of text still readable at roughly 40%
  scale — and only the last two frames show the fade. That is the claim verified in frames,
  not in CSS.
- **Filter**: 14 models over 5 provider groups before, 6 after; the top edge moves down and
  eases back up (the overshoot settling) while the bottom edge holds.

## Step 7 — orchestrator follow-ups + a narrow-width regression I owned part of
- The app.js patch landed: `grep -c 'data-menu-anchor="worktree"' app.js` = **0**. The
  interim `.composer-tools .selector-button[data-kind="worktree"]{display:none}` rule was
  **removed** from menus.css rather than left guarding a selector that no longer exists.
- The worktree-menu hunk was rewritten and handed back (PATCH_app_js_worktree.md §2). It
  composes the row description from the STRUCTURED fixture fields, not from `w.note`:
  several notes are authoring commentary ("Deleting this thread must offer to keep the
  worktree") rather than copy for whoever is choosing a branch.

### The 430px page-overflow failures were partly mine
`headerExtras` gained three registrants in one wave — Goals' chip 26px, this worktree control
30px, Lens' trigger 30px. At a 430px viewport the chat column is 249.4px (the editor split
takes 54% regardless of the viewport media queries — the residual already logged for Wave 5).
Measured: ten header children summing to 288px in a 249.4px box, the context ring spilling to
x=448.6, `document.body.scrollWidth` 449 vs a 430px client width. Hiding any ONE of the three
cleared it, so no single control is "the" cause.
Fixed in `menus.css` at `@media(max-width:760px)`: `gap:7px→3px`, `padding:0 10px→0 5px`.
That is the only slack left — `.chat-title` and `.chat-meta` are already 0px wide there — and
it buys 46px without hiding anyone's control and without touching Wave 1B's closed
`.chat-header .icon-button{flex:0 0 auto}` 30x30 decision.
Re-measured (`menus/p8.mjs`) at 390/430/560/700/760/900/1024/1440 x 8 themes = **64 combos:
zero page overflow, worktree button ≥29px and hit-testing to itself in all 64, 0 console
errors.**
Still open for the orchestrator: the header holds five icon controls + ring + chip and the
real constraint is the editor split, not the viewport. A fourth `headerExtras` registrant
will overflow again at 430.

## Step 8 — the ghost was addressable; that was a real defect, not a test artefact
Audit run 4 came back **432 pass / 1 fail**, and the one failure was mine:
`Plan and Deep Plan hover sidecars` →
`strict mode violation: locator('[data-submenu="deep-plan"]') resolved to 2 elements`.

The audit does `openRootMenu('mode') / Escape / openRootMenu('mode')`. The Escape spawns the
closing clone, which lives 260ms and **still carried every data attribute of the menu it was
copying** — so for a quarter of a second the document contained two of every menu control.
Nothing user-facing broke (the ghost is `pointer-events:none`, so no click, hover or
`closest()` can reach it), but any harness — mine, the shipped audit, or a later agent's —
could count it, and a duplicate that only exists for 260ms is exactly the kind of thing that
gets misdiagnosed as a flake.

Two fixes in `menus.js`, both cheap:
1. `stripHooks()` runs over the clone and every descendant **before it enters the document**,
   removing every `data-*`, `id`, `name`, `title`, `aria-label`, `role` and `tabindex`.
   Classes stay — they are what makes the ghost look like the menu it is replacing.
2. `sync()` calls `dropGhost(L)` when a lane opens, so a new menu retires the previous one's
   ghost immediately instead of coexisting with it for the rest of the 260ms. That is also
   the honest reading of "one transient overlay at a time".

## Orchestrator ruling recorded (does not need action from me)
`headerExtras` is **closed to new registrants** for the rest of the run. Goals, Menus and
Lens keep theirs; Wave 4 must not add a fourth without a capacity rule (priority order +
defined drop behaviour) for the row first. Related datum from the orchestrator, logged for a
later pass and not mine: in the pinned case at 1100px the activity column resolves to 1px,
same root cause (viewport tiers blind to the real pane width), needing a container query on
`.assistant-pane`.

## Step 9 — the fourth and worst measurement trap: mid-sprout re-measurement
Audit run 5 was **434/0/0/0** (fully green again), but `menus-verify` showed one
`permissions: gap 15` — an 8px drift my controlled probe (14 opens, delta 0 every time) could
not reproduce. Rather than widen the tolerance, I reproduced the harness's exact prefix
(`menus/p11.mjs`: the four-worktree dot-colour loop, then the picker sweep). It reproduced
immediately and far worse than 8px:

> `persona: gap **-116.8**, top 695.1 for a 238.1px box` — the menu **overlapped its own
> trigger by 117px and hung 33px off the bottom of the viewport**.

Cause: `positionOverlays()` runs on **every** `renderOverlays()`, not only on open — an
expiring toast, a hover card appearing or disappearing, a submenu, a resize. Any of those
landing inside the sprout's 300ms re-measures a box that is mid-`transform` and re-places the
menu from it. `695.1 = 816.5 − 114.3 − 7` where 114.3 = 238.1 × 0.48, the closed scale;
`559.8 = 816.5 − 249.7 − 7` where 249.7 = 238.1 × 1.049, the overshoot.
The old `menu-pop` had the identical bug at 6% (`scale(.94)`); the sprout turns it into a 52%
error, so it is mine to handle.

Three iterations, because the first two were incomplete and the probe said so each time:
1. **`-flat`** — flatten the transform for the measurement frame of every non-open render
   (keeping the height/width spring alive, since the model search filter is one of those
   renders). Killed the -116.8 case. **Not sufficient**: a `renderOverlays()` that produces no
   DOM change — `state.hover=null` when there was no hover card, a resize, an expiring timer —
   emits **no mutation records at all** yet still queues `rAF(positionOverlays)`. No
   MutationObserver can see those. Still 14.5-18.6.
2. **`-hold`** — pin left/top/`--origin-x`/`--origin-y` for the 340ms the entrance lasts and
   ignore whatever positionOverlays writes. **Still not sufficient**: masking the value is not
   replacing it, so the bogus inline `top` was sitting underneath and the menu jumped to it the
   moment the mask came off. Still 14.4-18.6.
3. **Release writes the held values back** onto the element. Now the placement derived from
   the one truthful measurement becomes the inline value, until the next legitimate
   positionOverlays — which by then measures an untransformed box.

Result, same prefix, 3 runs x 5 pickers: **gap 7.0 on every single one** (model 7.5, sub-pixel).
Deterministic. The harness assertion was then **tightened from ≤14px to ≤10px** rather than
loosened — loosening a tolerance instead of fixing the cause is precisely how a suite ends up
green while a menu overlaps its own trigger.

## FINAL STATE (item 5 complete)
Files changed by this agent: **`menus.js` and `menus.css` only.** No edit to `app.js`,
`styles.css`, `index.html` or the standalone. Nothing committed.

- `python3 build.py --check` **PASSES** (sha256 `9a05b93fb49197f4`); both deliverables
  byte-identical and still **CRLF**.
- `node tests/audit.mjs reports/audit.json ./tests` -> **434 pass / 0 fail / 0 console errors
  / 0 page errors**.
- `menus-verify.mjs` -> **80 pass / 0 fail**, against both `index.html` and the standalone,
  with the trigger-gap tolerance tightened to ≤10px.
- `menus/p8.mjs` -> 8 widths x 8 themes = **64 combos, zero page overflow**, worktree control
  ≥29px and hit-testing to itself in all 64.
- `menus/p11.mjs` -> the harness's full prefix + picker sweep, 3 runs x 5 pickers:
  **gap 7.0 on every one**.
- `menus/p9.mjs` -> while a ghost is on screen, `[data-submenu]`, `[data-action]` and
  `[data-overlay]` all count **0** inside it; a reopen retires it immediately.
- `menus/p6.mjs` -> sidecar sprouts from `100% 18%` (the edge facing the root menu), does not
  overlap the root, hit-tests to itself.
- Contact sheets regenerated against the final build: `menus/open-contact-sheet.png`,
  `menus/close-contact-sheet.png`, `menus/filter-contact-sheet.png`.

### What another agent should re-verify independently (two-harness standard)
1. **The close's opacity claim in the frames, not in my numbers.** I read the contact sheet
   and the per-frame sample; a second pair of eyes on `close-contact-sheet.png` is the check
   that matters, because that is the one claim a CSS reading cannot settle.
2. **The four measurement traps stay fixed.** They are subtle and they came back three times
   in a row here. `menus/p11.mjs` is the sensitive probe — it reproduces what a single-open
   test cannot, because the failure needs an unrelated `renderOverlays()` to land inside the
   entrance.
3. **`headerExtras` capacity.** My 760px gap/padding reduction buys headroom, not
   extensibility. Anyone adding a fourth registrant must re-run `menus/p8.mjs`.

### Known residuals I did NOT fix (not regressions, and out of this item's scope)
- **`positionOverlays()` is never re-run by `renderApp()`.** If the app re-renders and the
  layout shifts while a menu is open (the composer moving, a column resizing), the menu keeps
  the placement it was given. Pre-existing; my hold makes the entrance immune to it but the
  underlying behaviour is app.js's.
- **Typing into the model search inside the first 340ms** cancels the entrance's transform
  (the `-flat` path) rather than blending with it. Deliberate: an honest snap beats a menu
  positioned from a box it never had.
- **The worktree menu is now fixture-driven** (orchestrator applied my hunk), but the four
  descriptions come from structured fields; `w.note` is deliberately unused because several
  notes are authoring commentary rather than user copy.
