# Wave 3 — Transcript + Lens — work log
Owner: `transcript.js`, `transcript.css`, `lens.js`, `lens.css`. Items 8 and 9.

## Status
- [x] 0. Read ORCHESTRATOR_NOTES / PLAN items 8+9 / FIXTURE_SCHEMA / DATA_HANDOFF / WAVE1A_LOG.
- [x] 0b. Surveyed siblings: opus-5/shared/lens.js (semantics), kimi-k3 _shared/data.js +
      threads/_thread-kit.{js,css} (UI), qwen-3-8. Read canonical ACD-192..195.
- [ ] 1. Send 3 app.js patch requests to the orchestrator (see below).
- [ ] 2. transcript.js/css — messageMeta + Edit gating + hover verification.
- [ ] 3. lens.js/css — selection, modes, ops list, cap, subcompact, rehydrate.
- [ ] 4. transcript-verify.mjs (re-runnable second harness).

## Findings that shape the implementation
- `messageMeta` slot renders BEFORE `.message-actions`, `messageOverflow` renders INSIDE it
  (last child). `.message-actions` is `display:flex`, so flex `order` can put meta chips
  between Copy and More details as the packet's row spec requires. Emitting into
  `messageOverflow` + `order` is the only way to get one row without touching app.js.
- `renderMessage()` only gives slots to `type==='text'` messages. Working/plan/artifact/event
  cards get no affordance — lens selection is therefore text-turn scoped (correct).
- `.message` is `position:relative`. Variants 2 and 10 make `.message` a 2-col grid, 7 a 1-col
  grid, `.message-user` is flex. The selection affordance MUST be absolutely positioned so it
  does not become a grid/flex item and break those takes.
- `.transcript` is `overflow:auto`, so a negative-offset gutter would cause horizontal overflow
  (the orchestrator has a no-h-overflow gate). Reserve the gutter with padding-left on
  `.message` at specificity `.transcript[data-variant] .message:has(> .lens-gutter)` = 0,4,0,
  which beats every take rule (max 0,3,0).
- Takes 11 and 14 print `content:attr(data-time)`. `data-time` therefore has to be REAL, not
  invented, or two of the sixteen takes contradict the meta row. -> patch 1.
- `state.capabilities.context` defaults to `'Auto'` (app.js:57) and is persisted by
  `savePrefs`. `Auto` is not a mode; the module normalises it to `Off` at first render (ctx
  exposes the live `state` object, so a module can do this without an app.js edit).
- Menus have no slot mechanism except the named branches, so the wand's `context-lens`
  submenu cannot be re-authored from a module -> patch 3.

## Patch requests sent to the orchestrator (app.js) — 2026-08-25
1. `msgClock(m)` prefers `m.sentAt || m.time`, rendered in the viewer's locale; the invented
   11:42+3i walk stays only as a fallback.
2. `renderTextMessage` gates the user Edit button on `m.eligibleForEdit` (absent, not disabled).
3. `renderSubmenu`'s `context-lens` branch wrapped in `extReplace('contextLensMenu', ...)`,
   plus `'contextLensMenu'` added to `EXT_SLOTS`.
Fallbacks if any is declined are noted in the message.

## Sub-step 1 — DONE (2026-08-25)
Orchestrator landed all three patches, plus a fourth of its own: `renderMessageDetails()`
now reads `m.runtime`. **Scope change accepted:** this module renders NO details panel —
two readers of one record is two places to disagree. My remaining item-8 surface is the
always-visible meta row, the hover gate, and the overflow affordance.

## Sub-step 2 — transcript.js / transcript.css written
- `messageMeta` slot -> `.message-meta` chip group: time (locale, from `sentAt`), provider,
  model (`data-model` = the hook Demo Data's harness reads), Working/Worked for.
  Unknown -> "not reported". `mode`/`effort`/`terminal` go through `D.labels`, so
  `deep_plan` never reaches the screen. A turn with NO runtime says so instead of being
  backfilled from the composer route.
- Hover gate moved from `.message-actions` onto `.message-actions > .text-button`, using
  `visibility` as well as `opacity` so "absent at rest" survives `elementFromPoint()`.
  Restated inside the `max-width:590px` block so the phone behaviour is preserved.
- Meta box and actions box are both atomic inline-level boxes so they share ONE line.
  Documented deviation: metadata leads, Copy follows — leading with hover-gated buttons
  leaves a permanent blank indent in front of every timestamp.
- `messageOverflow` -> a `More` button + inline disclosure (NOT a popover: `.transcript`
  is `overflow:auto` and a popover on the last message would be clipped by its own scroll
  container). Registry published as `window.PM56_MSG_OVERFLOW.register(fn)` for Wave 4.
  Absent when no provider registers anything.

## Sub-step 3 — lens.js / lens.css written
- Canonical four modes only: Mute · Focus · Subcompact · Turn Off. `Auto` normalised out.
- Thread-local store (ACD-195). `ops` is a LIST; cap 25 PER OPERATION, enforced on toggle
  AND on apply, refused not truncated, with `Seal operation` as the accumulate path.
- Mute/Focus apply live on toggle; Subcompact waits for Apply; Turn Off releases and
  announces the counts in a receipt.
- Five per-message states: muted | focused | subcompacted | source | null. `source` is
  opus-5's rehydrated-but-still-structurally-subcompacted distinction.
- `effectiveHistory()` ported from opus-5 (excludes muted, protects focused, replaces a
  subcompact range with one summary carrying rehydration handles) and surfaced in the menu.
- Styling reaches `<article>` through `:has()` on an inert `.pm-lens-mark`, because a
  module cannot put an attribute on an element app.js renders.
- NO coloured left-edge accent bar. Outline + gutter check, per the packet.
- `set-context-cap` overridden so the Demo Studio's Context Focus/Mute/Subcompact triggers
  now genuinely enter selection mode instead of only printing a receipt.

`build.py --check` PASSES (sha256 e86521fca0d83e90). Audit running.
NEXT: transcript-verify.mjs + pixel verification.

## Sub-step 4 — harness + first full verification (2026-08-25)
`tests/transcript-verify.mjs` written (41 assertions, pixel-based). First run 41 pass / 1 fail.

### Controlled A/B against the audit — how I found what was mine
`tests/audit.mjs` went 434/0 (orchestrator) -> 401/28 with my modules in. Rather than guess,
I built a BASELINE deliverable with `transcript.js` + `lens.js` blanked, into a scratch dir,
and ran the same audit against it. Baseline **432 pass / 1 fail**; live **414 / 19**. So 18
failures were genuinely mine, and the other differences were another agent's concurrent
audit.mjs edit landing between runs. Method worth reusing: `scratchpad/w3/base/`.

### The 18, and what each actually was
1. **16 x "No page horizontal overflow" (8 themes x 430 and 1024).** Real. `.chat-header` now
   carries TEN children — three added this wave: Goals' `goal-chip`, Menus' `worktree-button`
   and my `pm-lens-trigger`. Wave 1B made them all `flex:0 0 auto`, so they push instead of
   shrinking and `.context-ring` was driven off the right edge. Collectively 19px over at 430
   and 8px over at 1024. **Withdrew my own 30px below 1100px** rather than spending someone
   else's; escalated the shared budget to the orchestrator. Re-measured: 0 overflowing.
2. **`Working Animation controls and history`** — my chips print "Worked for Ns", so the
   audit's unscoped `getByText('Worked for')` became a strict-mode violation against 9
   elements. Scoped the audit locator to `.working-card`.
3. **`Message More Details opens`** — the audit clicked a button that is now `visibility:hidden`
   at rest. That is the item-8 behaviour working (an `opacity:0` button that still accepts
   clicks is an invisible click target). Audit now hovers the turn first, as a user must.

### Harness bugs I had to fix in my own file (each was a false FAIL)
- Pixel reads on elements scrolled out of the transcript: crop landed elsewhere,
  `elementFromPoint` returned null. Added `bringIntoView()` before every pixel assertion.
- "no left-edge accent bar" read `border-left` in the selected state alone — but the user
  bubble already has a 1px border on all four sides. Rewritten as a BEFORE/AFTER delta:
  selection must change the outline and leave the left border untouched.
- The work-tick stability probe set `data-probe` on the node — `pmSyncAttrs()` strips any
  attribute missing from the fresh render, so it reported a remount that never happened.
  Now probes by DOM identity (`window.__w3probe === current`).
- The one-line assertion measured at the stock 54% editor split, where the chat column is
  ~460px and the row legitimately wraps. Now drags the real editor resizer first.

## Sub-step 5 — corrections found by LOOKING at screenshots, not by a metric
Three defects the 42-assertion harness was green through. Recording them because the
pattern is the point: every one was visible in the first screenshot and invisible to the
assertions.

1. **"Working for 25s" on a completed turn.** `isLiveTurn()` also treated "the demo work
   animation is running and this is the newest text turn" as live — but that animation is
   global while the turn is not, so a turn whose own runtime said `terminal:'complete'`
   with a `completedAt` three hours earlier claimed to be in flight. Reading the turn's own
   record is the entire point of item 8; the heuristic is gone. A turn with NO record that
   is genuinely in flight now reads "Working now" with no invented duration.
2. **Take 11 (Timeline Gutter) clipped its own tick label.** Its 56px column was sized for
   the five characters the INVENTED clock produced ("11:42"). A real locale clock is eight
   ("04:33 PM") and the last character ran under the timeline dot. Same root cause as the
   `msgClock()` patch I asked for, so fixed here: column 74px, rail moved to match, and a
   further 30px shift when the lens gutter is present (the rail is positioned from the
   PADDING BOX, so reserving the gutter moved the dots but not the rail).
3. **The meta row fell BELOW the buttons when the overflow panel opened.** `vertical-align:
   middle` centres the metadata against a two-line actions box. Switched to `top`, and an
   open disclosure now promotes the actions box to full width.

## Sub-step 6 — final state
- `python3 build.py --check` PASSES (sha256 af4195b90de0bf91); both deliverables CRLF.
- `tests/transcript-verify.mjs --selftest` -> **44 pass / 0 fail**, 0 console errors.
- `--reduced-motion` -> 43/0. `--takes 2,7,10,14` (the grid takes) -> 42/0.
- `tests/audit.mjs` -> 432 pass / 1 fail, identical to the module-blanked BASELINE. The one
  failure ("Plan and Deep Plan hover sidecars", `[data-submenu="deep-plan"]` matching two
  elements) is present with my modules removed, so it is not mine.

## FINAL (2026-08-25) — items 8 and 9 complete
- `tests/transcript-verify.mjs --selftest` -> **45 pass / 0 fail**, 0 console errors.
  `--reduced-motion` -> 44/0. `--takes 2,7,10,14` -> 42/0.
- `tests/audit.mjs reports/audit.json ./tests` -> **434 pass / 0 fail / 0 console errors /
  0 page errors**, written into `reports/audit.json` (it had been left holding my earlier
  401/28 diagnostic run).
- `python3 build.py --check` PASSES. Both deliverables CRLF. Nothing committed.

### Files owned and changed
| File | State |
|---|---|
| `transcript.js` | written (item 8: meta row, hover gate, overflow registry) |
| `transcript.css` | written |
| `lens.js` | written (item 9: full Context Lens selection) |
| `lens.css` | written |
| `tests/transcript-verify.mjs` | NEW — the re-runnable second harness |
| `tests/audit.mjs` | 2 minimal edits, each because item 8 changed real behaviour (see log) |

### Open / escalated — NOT closed by me
1. **`.chat-header` shared width budget** (escalated to the orchestrator). Ten children,
   three added this wave. I withdrew my own 30px below 1100px; the row is still ~19px from
   the edge at 430px. Principled fix is a container query on the pane — same class as the
   deferred activity-grid residual.
2. **Item 8 closes on Demo Data's rebuilt route-turn diff, not on this harness.**
3. **Item 9 has had exactly one harness — mine.** Needs an independent pass. The two
   assertions most worth re-running with a different method are the 25-cap-accumulates one
   and Turn Off, because "nothing selected" and "selection broken" render identically.
   `--selftest` runs the negative controls so each has been seen to go red on purpose.

### For Wave 4 Thread Ops
`window.PM56_MSG_OVERFLOW.register(function (ctx, m) { return [ … ]; })` — items are
`{id, label, detail, icon, action, value, danger?, disabled?, reason?}`. `disabled:true` +
`reason` renders the sanctioned honest-gap row (disabled WITH a truthful reason), never a
lying toast. The More button is absent when no provider returns an item, so registering
nothing changes nothing. Do NOT also register into the raw `messageOverflow` slot — that
puts items inline in the action row instead of the disclosure.
Also: the orchestrator recorded that item 13's "Edit is scoped to the newest user turn"
bullet is DONE (app.js gates on `m.eligibleForEdit`) and should be dropped from item 13.
