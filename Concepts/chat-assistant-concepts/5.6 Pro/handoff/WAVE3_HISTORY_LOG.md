# Wave 3 — History — work log

Owner: `history.js` + `history.css` ONLY. Items 3 (take-6 status indicators + padding + 2 bugs)
and 4 (kimi-k3 W1 open/pin choreography).
Audit invocation (Wave 1A's finding): `node tests/audit.mjs reports/audit.json ./tests`.

## Sub-steps
0. [DONE] Read ORCHESTRATOR_NOTES / PLAN / WAVE1A / WAVE1B. Source survey done.
1. [DONE] Item 3a — nine animated status indicators for take 6 (`variants[1]===5`).
2. [DONE] Item 3b — row padding, hover-fade bug, flyout variant CSS.
3. [DONE] Selection treatment replacing `.thread-row.active::before`.
4. [DONE] Item 4 — drawer geometry, open-from-left.
5. [DONE] Item 4 — pin/unpin in place + gutter + scrim + close guards.
6. [DONE] Item 4 — exit animation + pmPatch safety.
7. [DONE] Item 4 — FLIP of a pinned thread into the Pinned group.
8. [DONE] `history-verify.mjs` + negative control + filmed contact sheets + reduced motion.
9. [DONE] Final gates. WAVE 3 HISTORY COMPLETE.

## Step 0 — SOURCE SURVEY (findings that change the plan)

### F1. Item 3(b) "already fixed by Wave 1A" is only HALF fixed — the CSS never followed.
Wave 1A did add `data-history-variant` to the flyout (`app.js:1122`). But every take rule in
`styles.css:365-371` is scoped **`.history-panel[data-history-variant="N"]`**. There is not one
`.history-flyout[data-history-variant=...]` selector in the sheet. So in floating mode all eight
takes still collapse to take 0 — the attribute is present and unused. Verified by grep; will be
verified in pixels. **I own the fix** (history.css re-scopes the take rules to both hosts).

### F2. `.thread-row` carries no `data-k`, so pmPatch matches thread rows POSITIONALLY.
Node identity does not follow a thread. Therefore a FLIP keyed on node identity would animate the
wrong rows when a thread moves between groups. My FLIP is keyed on **`data-id` (content identity)**
instead, which is correct with or without a later `data-k` addition.

### F3. `pmSyncAttrs` (app.js:955-963) removes any attribute not present in the rendered source.
So a class I add imperatively to `.history-flyout` is wiped by the next `pmPatch`. All drawer
state therefore lives on `<body>` data attributes (pmPatch only touches `#pmRoot` /
`#pmOverlayRoot` children, never `<body>`).

### F4. `toggle-thread-pin` (app.js:1506) leaves the thread menu on screen.
`mutateThread()` re-renders, THEN `state.menu=null` is assigned with no further render, so the
open menu survives until the next 2s work tick. My override of this action fixes it.

### F5. The `.history-flyout` opens on the RIGHT (`styles.css:298 right:6px`) and animates with
`history-in` (`translateX(24px)`), i.e. it slides in from the right. Confirms the requester.

### F6. Reduced motion: `motion.css` caps every loop with `animation-iteration-count:1 !important`
and lists the existing `.status-*` selectors under `animation:none !important`. New indicators must
be added to an equivalent stop rule **inside history.css** or they play one full pass.
`.history-flyout.pm-leaving` is already in motion.css's 1ms exit list, but my drawer-specific
override lands later in the cascade, so history.css must re-declare the reduced-motion 1ms itself.


## Steps 1-7 — WHAT LANDED (code complete, verification pending)

`history.js` and `history.css` only.  `python3 build.py` green after every sub-step.

### Item 3
- `threadRowStatus` slot, scoped to `ctx.variant === 5` only; returns `''` for the other
  seven takes so `extReplace` falls back to `renderStatus()` and nothing else changes.
- Nine indicators in one family (`.ph-status` = 15px ring + one mark).  `working` reproduces
  `.status-orbit`'s geometry exactly.  Each other status has its own MOTION signature, not just
  its own colour: reviewing sweeps ±125° and alternates, waiting turns a dashed ring at 6s/rev,
  idle breathes at 3.2s, complete draws a check ONCE (terminal, no loop), blocked nudges at the
  end of a 2.8s cycle, failed hard-blinks on `steps(1,end)`, paused dims on opacity only,
  recovering runs an arc COUNTER-clockwise.
- `data-k="tstat:<threadId>"` — keyed on the thread, not the status, so a status change patches
  the class on the same node (which is what makes `complete` draw its check on transition)
  instead of remounting.
- Row padding for take 6: `min-height 72px -> 44px`, `padding 9px/6px top/bottom -> 3px/3px`.
  Applied to `.history-panel` AND `.history-flyout`.
- Hover-fade bug (styles.css:123) fixed for ALL takes, not just take 6 — it is a defect, not a
  take style.  `.thread-row` is a 3-column grid and `.thread-more` has its own column, so the
  status slot never needed to get out of the way.
- Flyout take rules mirrored (finding F1).

### Selection treatment (replaces `.thread-row.active::before`)
Three coordinated cues, no edge bar: deeper accent tint across the whole row + a FULL 1px inset
ring + a title weight/contrast step.  Driven by a `box-shadow` transition rather than a keyframe,
so there is no `animation-fill-mode` to fight and deselect reverses for free.  The styles.css
rule is neutralised with `content:none`; **a patch to delete it outright goes to the orchestrator.**

### Item 4
- The flyout is now the single drawer for open AND pinned.  `state.historyMode` is never allowed
  to be `'pinned'` (that value is what spawns the separate `.history-panel` grid column); the
  pin is module state on `<body data-ph-drawer>` = closed | shut | open | pinned | closing.
- Geometry: `sync()` publishes the ASSISTANT PANE's box as `--ph-x/--ph-y/--ph-h/--ph-pane`.
  "Open left" means the left edge of the pane the history column always lived in, not the
  viewport's left edge (which is the editor).  ResizeObserver on the pane + window resize +
  a per-render heartbeat.
- Open: `translateX(-102%) -> translateX(0)`, 240ms `cubic-bezier(.4,0,.2,1)`, scrim `0 -> 1` in
  step.  JS idiom is the reference's: render the node in the `shut` state, force a reflow, rAF,
  then flip the body attribute so the transition has a start value.
- Pin: the drawer does NOT move.  `width min(300px,85%) -> min(200px,42%)` while
  `.assistant-grid`'s `padding-left` grows to the same expression, both 240ms — the transcript
  slides right into a reserved gutter.  Shadow -> quiet right border.
- Scrim is `.assistant-pane::after`, declarative and keyed off the same attribute, so the
  reference's "hides the scrim on pin, never restores it on unpin" defect is structurally
  impossible here.
- CLOSE BUG NOT PORTED: the pinned guard sits at the two implicit-dismissal sites (Esc listener,
  scrim pointerdown), never inside `closeDrawer()`.  The toggle is unguarded AND unpins, so the
  gutter collapses with the drawer.
- Exit: Wave 1B's contract used as published (class `pm-leaving`, wait read back from
  `getComputedStyle().animationDuration`, 1ms under reduced motion) with drawer-appropriate
  keyframes.  The selector is doubled onto `body[data-ph-drawer="closing"]` because pmPatch
  strips the class off the node on the next work tick.  pmPatch cannot remove the node early
  because `historyMode` stays `'floating'` for the whole exit — the state flip that removes it
  happens only in `finishClose()`.
- Pinning a thread ANIMATES into the Pinned group: FLIP keyed on `data-id` (content identity),
  because `.thread-row` has no `data-k` and pmPatch matches rows positionally (finding F2).
  Same 420ms `cubic-bezier(.22,.80,.28,1)` as `flipMoves`, and it also fixes F4 (the thread menu
  used to stay on screen for up to 2s after pinning).
- `show-archived` reimplemented — app.js's version sets `historyMode='pinned'` directly.
- `globalReset()` REASSIGNS `state`, so nothing caches a `state` reference; `S()` re-reads it.

### Audit noise from concurrent waves (NOT mine)
`node tests/audit.mjs reports/audit.json ./tests` -> **424 pass / 10 fail**, 0 console errors,
0 page errors.  All ten name other agents' elements and none name anything this module emits:
`Compact Now` / `More Details` (the Context agent renamed them to u11's `Compact now`),
`.ctx-legend` / `.ctx-leg` intercepting pointer events (Context), `.activity-panel.transient` and
`.goal-title` intercepting (Activity Panel / Goals).  The audit has no history-drawer assertions
at all, which is exactly why `history-verify.mjs` is being written.


## Step 8-9 — VERIFICATION (three harness modes, all green)

Harness: `5.6 Pro/history-verify.mjs` (committed next to the sources so anyone can re-run it).
`node history-verify.mjs [--reduced] [--file OTHER.html] [--out J] [--shots DIR]`

| run | result |
|---|---|
| normal motion | **60 pass / 0 fail** (stable over 3 consecutive runs) |
| `--reduced` | **57 pass / 0 fail** (stable over 3 consecutive runs) |
| **negative control** (`--file` a build with history.js/history.css EMPTIED) | **2 pass / 58 fail** |

The negative control is `scratchpad/waves/negative-control.py`: it mirrors `build.py` exactly but
blanks the two module files and writes to a temp path, so the shared deliverable is never touched
(other agents are building concurrently). The only two assertions that survive it are
"zero console errors" and "zero page errors", which SHOULD pass in both builds. Everything else
is load-bearing. Four assertions were found passing VACUOUSLY by that run and hardened
(`PIN does not MOVE`, `gutter tracks width`, `gutter collapses`, `node IS removed` all passed with
no drawer present at all), plus two more that would have passed on an empty list
(`nine indicators distinct` with zero measured, `all 8 themes` with zero themes).

### Three defects the harness caught that no metric would have

1. **A stray comment terminator silently deleted the clip-path.** Patching a comment into the
   middle of a declaration block left two `*/`, so the CSS parser swallowed `clip-path` as part of
   a malformed declaration. Computed style read `none`; the lockstep assertion read `frames: 0`.
2. **The drawer slid in ACROSS THE EDITOR PANE.** Caught by looking at the contact sheet, not by
   any measurement — every geometric assertion passed while it happened. The reference's drawer is
   `position:absolute` in an `overflow:hidden` root; ours is `position:fixed` in `#pmOverlayRoot`
   and nothing clipped it. Fixed with a `clip-path` left inset animated on the same duration and
   easing as the transform, which stays in exact lockstep because both are relative to the
   element's own current width. Measured drift: <= 0.6px at every in-flight frame.
   The three other insets are `-90px` so the float shadow still paints; a plain `inset(0)` clips
   the shadow away, which is verified by an A/B pixel read rather than by computed style
   (computed style reports the shadow either way — clip-path removes it at paint time).
3. **The drawer's rows overlapped.** `historyChrome` is a SHARED append slot — the Wave 2 Goals
   module puts a goal card in it too — but styles.css gives both history hosts a FIXED three-row
   grid template. **Measured in the NEGATIVE build, i.e. this is pre-existing and not caused by
   this wave**: search row 0px tall, `.history-scroll` overlapping it by 17px. Fixed with a flex
   column (one growing child, count-independent).

### Also fixed from looking at the glyph sheet
- `recovering` was `idle` with a different hue — same ring-plus-dot shape. Under reduced motion
  that is no distinction at all for a colour-blind reader. Now a neutral base ring with an amber
  HALF arc and a HOLLOW centre: the difference survives with the motion switched off.
- Take 6 relaxes `.thread-sub` to `white-space:normal` for the two-line summary, which also let
  the timestamp wrap — `2m` broke across two lines. Only the summary wraps now.

### Filmed (CDP screencast -> contact sheet, looked at)
`scratchpad/waves/film-history.mjs` -> `hfilm/contact-sheet.png`; glyph sheet
`hfilm/glyphs.png` (9 statuses x 4 themes x motion/reduced = 72 tiles at 4x).
In-page rAF traces (`htrace.mjs`, no CDP round-trip between the mark and the click):
- OPEN: handler returns 22ms; transform travels 234ms across ~14 distinct positions.
- PIN: handler returns 10ms; width 300->200 and gutter 0->200 travel together over ~217ms;
  the drawer's left edge does not move by even 1px.
- CLOSE: travel ~220ms, node removed at ~292ms (240ms exit + 30ms slack + start latency).
**The first film showed a ~200ms dead period that turned out to be the harness's own CDP click
latency, not the app** — worth knowing before anyone reads a contact sheet as evidence of timing.
`renderApp` was still measured at 25-49ms on this fixture, so every drawer path now uses
`renderOverlays` (4ms) instead; nothing in `#pmRoot` reads historyMode except a `!== 'pinned'`
ternary this module never satisfies.

### Widths
1920 / 1440 / 1240 / 1100 / 980 / 760 / 430: zero horizontal overflow at every width, the drawer
always stays inside the pane, the 42% clamp engages below a ~476px pane, and the toggle
closes-and-reopens at every width. Below `isNarrow()` (821px) the drawer **defaults to closed**,
because app.js gated the pinned column on `!isNarrow()` and inheriting 'pinned' would have
silently put a drawer over 42% of a phone screen. A pin the user chose is still honoured at any
width.

## FINAL GATES
- `python3 build.py --check` **PASSES**, both deliverables sha256 `f1c35be5b1dd3c85`,
  byte-identical to each other, **16071 CRLF / 0 bare LF** each.
- `node tests/audit.mjs reports/audit.json ./tests` -> **434 pass / 0 fail / 0 console errors /
  0 page errors** (it had dipped to 424/10 and 417/12 mid-run on other agents' work; it is green
  again as of this measurement).
- Orphan gate over `history.css`: 15 module classes styled, **0 orphans** — every one is emitted
  by `history.js`.
- `.pm-leaving` is **no longer an orphan**: Wave 1B left it applied by nothing and asked that
  Wave 5 delete it if still unused. This module applies it. Wave 1B orphan-report item 2 can close.
- Nothing committed. Files touched: `history.js`, `history.css`, and the new `history-verify.mjs`.

## HANDED FORWARD / NOT VERIFIED BY ME
- Everything above is MY harness. Per the two-harness standard none of it counts as closed until
  another agent re-runs `history-verify.mjs` (and ideally writes a different assertion for the
  pin choreography).
- I did not test a real touch device, only a 430px viewport.
- `.history-panel` is now unreachable in normal use (historyMode never becomes 'pinned'). Its
  styles.css take rules 365-371 are consequently dormant, though still correct. If a later wave
  wants the grid column back, the module's `normalise()` is the single place that forbids it.
- The drawer has NO resize handle in either state. Neither did the floating flyout before; the
  pinned GRID COLUMN did (`data-resize="history"` -> `state.historyWidth`), so pin-then-drag is a
  capability this port drops. Deliberate: reintroducing it means the drawer width stops being the
  same expression as the gutter, which is the invariant the reference is built on. Flagging rather
  than deciding.
