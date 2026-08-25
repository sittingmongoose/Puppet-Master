# Wave 4 — Thread Ops — work log
Owner: `threadops.js`, `threadops.css`. Item 13 (eleven missing thread/message operations).

## Status
- [x] 0. Read ORCHESTRATOR_NOTES, PLAN item 13, WAVE1A_LOG (PM56_EXT), WAVE3_TRANSCRIPT_LOG
      (PM56_MSG_OVERFLOW), kimi-k3/_shared/threadops.js, 5-6-sol honest-gap pattern,
      canonical command IDs in Plans/, data.js `operational.worktrees`.
- [ ] 1. Send app.js patch requests to the orchestrator (3 slots).
- [ ] 2. threadops.js core store + thread menu rows.
- [ ] 3. Message overflow provider (PM56_MSG_OVERFLOW).
- [ ] 4. Destructive delete confirm.
- [ ] 5. threadops.css.
- [ ] 6. tests/threadops-verify.mjs + negative control + control build.

## Recon findings that shape the implementation
- `renderDialog()` (app.js:1349) dispatches on 4 literal `state.dialog.type` values and
  `return ''`s for anything else. **There is no dialog slot**, so a module cannot render a
  modal. -> patch request 1.
- `renderEventMessage()` (app.js:625) is the catch-all for every unknown system message type
  (`map[m.type]||['info',m.title||m.type,'']`), so a module CAN append its own receipt/marker
  messages and they render honestly. But its `actions` array is a fixed if-chain, so my cards
  get **no buttons**. -> patch request 2.
- `renderThreadSearchMenu()` (app.js:1313) is a named `renderMenu` branch with no slot; the
  scope selector cannot be added from a module. -> patch request 3.
- `messageOverflow` / `messageMeta` / `messageAffordance` only render for `type==='text'`
  messages (app.js:513). Message-level ops are therefore text-turn scoped, which is correct.
- Fixture: `D.operational.worktrees` has 4 bind states and a `threadId` back-reference; thread
  rows carry `worktree`. `feature/query-index` is `bound-dirty` with `dirtyFiles: 12` — that is
  the `(has changes)` case, and its own `note` field says so.
- Fixture gap: **all 190 assistant turns are `runtime.terminal:'complete'`.** No turn in the
  shipped data ends in error or is stopped, so the ENABLED branch of Retry message is
  unreachable with shipped fixtures. Recorded, asserted against an injected turn, reported.
- `exportContextJson()` (app.js:225) proves a real blob download works on `file://` here, so
  Export thread can be REAL rather than honestly-disabled (5-6-sol disables it).
- ACD-447: branch/rewind/restore "never mutate the original branch", carry explicit lineage over
  a selected message or restore point, never retarget an active Goal.
- ACD-443: of Duplicate / Archive / Pop out / Close, **only Archive dispatches a command**
  (`cmd.chat.archive`).

## Sub-step 1 — DONE. Three app.js slot patches requested and landed (orchestrator)
`dialog` (renderDialog's terminal return), `systemCardActions` (renderEventMessage's action
chain), `threadSearchMenu` (extReplace, same shape as `contextLensMenu`). EXT_SLOTS is now 20.
Also: the orchestrator had Demo Data close the Retry fixture gap — `tool-failure-02`
(`terminal:'error'` + `runtime.error` reason) and `debug-10` (`terminal:'stopped'`).
Verified in data.js: `{complete:190, stopped:1, error:1}`. Retry's enabled branch is now
reachable with SHIPPED data; no injection needed.

## Sub-step 2 — DONE. threadops.js + threadops.css written, build green, control build clean
`python3 build.py --check` PASSES (sha256 c26d506a022507a2), both deliverables CRLF.
`node tests/audit.mjs reports/audit.json ./tests` -> **437 pass / 9 fail / 0 console / 0 page**.
**Control build** (threadops.{js,css} blanked into an isolated root) -> **436 pass / 9 fail**,
and the two failure SETS are identical. So zero of the nine are mine and the module adds one
pass. The nine belong to other agents: 5 activity-hover cleanup + test-isolation, one
`Read src/analytics/queries.rs` matcher that no longer matches the fixture (+ its hygiene
roll-up), and `questions.css .qs-morph-controls` in the orphan gate.
Scripts: `scratchpad/w4/build-control.py <out> <comma-separated modules to blank>`.

### What landed — the eleven operations
| Operation | Where | Command dispatched | Real effect |
|---|---|---|---|
| Delete thread | thread menu (danger) | `cmd.chat.delete` | modal confirm, splices the thread, rebinds/removes the worktree record, receipt on the next thread |
| Export thread | thread menu | `cmd.chat.export` | real Blob download of turns + restore points + folded regions, receipt naming file and byte count |
| Create restore point | message More + restore dialog | `cmd.chat.create_restore_point` | immutable snapshot of the covered prefix, card with actions |
| Rewind to here | message More | `cmd.chat.rewind` | restore point FIRST, later turns spliced into `store[tid].rewinds[]` verbatim, fold card lists them, Restore puts them back |
| Branch from restore | restore dialog + RP card | `cmd.chat.branch_from_restore` | new thread from the RP **snapshot**, lineage card on the source |
| Delete restore point | restore dialog + RP card | `cmd.chat.delete_restore_point` | marks deleted, card flips to a stated note |
| Branch from here / model / Persona | message More (+ route dialog) | none (AGT-012/ACD-447 are requirements, not commands) | new thread, `lineage.atMessageId`, requested/effective route resolution |
| Copy link | thread menu + message More + search rows | none (surface affordance) | real clipboard write via `ctx.copyText` |
| Add passage to context | message More + search rows | none | writes a `pinned-passages` source into `D.contextByThread[tid]`, rebalances pct and window |
| Retry message | message More (assistant turns) | `cmd.chat.retry_message` | appends a NEW turn; the failed turn keeps its terminal (ACD-447: no transcript rewriting) |
| Request / Await / Spawn / Outbox | thread menu + request/outbox dialogs | `cmd.thread.request` / `await` / `spawn` / `outbox` | typed records with cycle + fan-out-3 guards, retry/cancel |

### The three "present but wrong" rows
- `fork-thread` and `restore-thread` are withdrawn by a `:has(.pm-tops-rows)`-gated CSS rule
  (`threadMenu` is an APPEND slot, so a module cannot delete a row app.js renders) and
  re-emitted as **Duplicate thread** and **Unarchive thread**. The gate means the control
  build shows app.js's originals rather than a menu with two holes.
- **Archive** now dispatches `cmd.chat.archive`, writes a receipt, and carries the
  `!active_run_in_thread` guard. A refused archive writes a REFUSAL RECEIPT on the thread —
  a real record — instead of a toast that mutates nothing.
- **Thread search** has a Current Thread / All Threads scope selector, defaulting to Current
  Thread, plus Copy link and Add passage on each result row.

## Sub-step 3 — DONE. `tests/threadops-verify.mjs` (81 assertions) + negative control
- `node tests/threadops-verify.mjs` -> **81 pass / 0 fail**, 0 console, 0 page errors.
- `node tests/threadops-verify.mjs --file <control>/index.html --negative` (threadops.{js,css}
  blanked) -> **2 pass / 79 fail**, and the 2 greens are exactly the two chrome assertions
  (zero console errors, zero page errors) which are properties of the app, not of this module.
  **0 vacuous assertions.**
- The harness takes `--file`, `--json`, `--themes`, `--negative`.

### The negative control earned its keep: it found SEVEN vacuous passes
Each was green because its SUBJECT did not exist, which is the exact failure mode the
orchestrator warned about. All seven now carry an existence half:
1. `1.1 module boots` — passed off my own negative-control STUB. Now checks `__PM56_TOPS_ABSENT`.
2. `2.8 Cancel deletes nothing` — "no dialog on screen" is trivially true when none opened.
   Now requires the dialog to have been open first.
3. `2.9 Escape closes the confirm` — same shape, same fix.
4. `3.10 Restore puts folded turns back` — relative order trivially holds when nothing folded.
   Now requires a fold to have happened AND the thread to grow on restore.
5. `5.10 percentages add to ~100` — true of the untouched fixture. Now requires the pinned
   source to exist.
6. `6.11 Current Thread scope` — an empty result list has no foreign threads in it. Now
   requires results > 0 as well as foreign == 0.
7. `7.4 no dialog overflows` — a dialog that never opens cannot overflow. Now counts openings
   (8 of 8) as part of the assertion.

### Four HARNESS bugs found and fixed before they were reported as product bugs
1. **`1.7` danger colour.** An absolute "red channel dominates" threshold over a whole icon box
   is mostly reading the tinted BACKGROUND, so a correct `rgb(255,108,125)` glyph measured
   [61,42,57] and failed. Rewritten as a COMPARATIVE read against an ordinary row's icon in
   the same menu. This is the advance-width trap again in a different costume.
2. **`2.5` scrim.** A full-viewport scrim's own centre is under the centred dialog, so
   "the scrim owns its centre" is wrong by construction. Rewritten to sample the points over
   real app controls and require them to be owned by the scrim OR the dialog.
3. **`3.8` fold card.** Pixel read on an element scrolled out of the transcript measured the
   composer hint. `scrollIntoView` + settle added.
4. **`6.9` search scope.** `the` saturates the 24-row cap in BOTH scopes, so "all > current"
   read 24 vs 24 and proved nothing. Rewritten to DERIVE a term from the fixture that is absent
   from the current thread, then require current == 0 (with the scoped empty line) and all > 0.

### One REAL defect found by the harness, and one pre-existing one recorded
- **REAL (mine, fixed): the modal was not modal.** Every overlay is a sibling in
  `#pmOverlayRoot`; `.history-flyout` carries `z-index:var(--z-drawer)` = 900 and a `.dialog`
  carries none, so with the history drawer up the DRAWER PAINTED OVER THE DIALOG despite being
  earlier in the DOM, and the scrim blocked nothing on that half of the screen. Fixed with
  `1150`/`1151` — clear of the drawer (900) and the hover card (`--z-tip` 1100), under the toast
  stack (1200) so a toast raised by the confirmed action is still readable. Found by hit-testing
  the stack, not by reading the sheet.
- **PRE-EXISTING, NOT MINE:** app.js's own four dialog types (`rename`, `compact`, `bsd`,
  `demo`) still have no z-index and are still painted over by the history drawer. Recorded in
  a comment in `threadops.css` for a later wave.

### One copy fix the harness forced
Retry's disabled reason said "This turn completed." — a lowercased mapped label reads as prose
and stops being the label (and "This turn stopped by user." is not English). It now prints the
label verbatim: `This turn is recorded as “Completed”.`

## Sub-step 4 — DONE. Three defects found by LOOKING at screenshots, all green in the harness
The pattern is the point, again: 81 assertions were green through all three.
1. **The fold listing was squeezed to a third of the card.** `.event-card` is `display:flex`
   with icon | copy | actions as three columns, so a listing dropped into the actions column
   truncated every snippet to two words ("Density…", "Give m…"). The card now wraps and the
   actions row takes full width — and `.event-copy` needed `min-width:0` too, or it could not
   shrink below its min-content width and wrapped to line two, leaving the icon alone on line one.
2. **Two overflow rows were wearing an ellipsis.** Transcript's registry renders `it.icon`
   through app.js's icon set and has **no `glyph` channel**, so my custom glyph names fell back
   to `more` (⋯). Overflow rows now name icons app.js actually ships (`document`, `attach`);
   the thread menu, which this module renders itself, keeps the custom inline SVGs.
3. **"Current Thre…"** — the scope selector's own scope was unreadable, because
   `.overlay-menu` is `min-width:190px` and the thread-search menu also carries `.compact`.
   Widened to `min(304px, 100vw - 16px)` only when the scope row is present.
Also: a count chip reading `0` is noise (the row's subtitle already says the list is empty and
a zero badge reads as a badge that failed) — the chip is now rendered only when non-zero.

## Sub-step 5 — DONE. Shared-action collisions (orchestrator escalation)
The registry's `EXT.action()` was a silent last-wins assignment. I load last, so I had
overwritten **history.js's `toggle-thread-pin`** (killing its pin FLIP) and **goals.js's
`reset-all`** (making `restoreFixture()` unreachable). The orchestrator changed the registry to
chain later-first with a `console.warn`.
- **`toggle-thread-pin`**: returning `false` alone would have been a SILENT DOUBLE TOGGLE —
  History's handler also flips `t.pinned`, so mine flipping first would net to nothing. My
  handler now writes the receipt for the state the thread is ABOUT to be in (the only state a
  later-first handler can know), touches neither `t.pinned` nor `state.menu`, and returns
  `false`. Measured: one click → exactly one toggle, menu closed, correct receipt.
  **`node history-verify.mjs`: the pinned-group move, the FLIP, and the menu close are all
  PASS again.**
- **`reset-all`**: already returned `false`; it now actually reaches Goals. Verified
  transitively — after Reset my store is cleared AND `state.threads` is back to 24, which only
  happens if the chain ran through to app.js's `globalReset()`, and Goals sits between us.
- **Swept every `EXT.action`/`actionAfter` name in all eleven modules: those two were the only
  collisions.** Shared SLOTS (`messageAffordance`, `headerExtras`, `historyChrome`) are
  append-lists, not collisions.
- **Escalated:** the new chaining `console.warn` fires at boot on every load, so
  `history-verify.mjs` is 59/1 with the single failure being its `Zero console errors/warnings`
  assertion reading nothing but that warning. Suggested `console.info` + a readable
  `PM56_EXT.collisions` array instead of a console scan. Orchestrator's file, orchestrator's call.

## FINAL STATE (2026-08-25)
- `python3 build.py --check` PASSES, sha256 `e1fd225b669af2d3`. Both deliverables CRLF
  (20,266 CRLF / 0 bare LF) and byte-identical to each other. Nothing committed.
- `node tests/threadops-verify.mjs --themes` -> **81 pass / 0 fail**, 8 themes, 0 console
  errors, 0 page errors.
- Negative control (`--file <control> --negative`) -> **79 red / 2 green**, the 2 being the two
  chrome assertions that are properties of the app. **0 vacuous.**
- `node tests/audit.mjs reports/audit.json ./tests` -> **443 pass / 3 fail / 0 console /
  0 page**. All three failures reproduce in a threadops-blanked control build:
  `Phase compact and expand across all 24 working takes` (Wave 4 Orbit's surface) and
  `No page overflow at 1440 / 1280 across the editor split range`
  (`button.context-ring +29px` — the `.chat-header` shared budget, at editor split 70-80%,
  which is a SPLIT constraint not a viewport one; same root cause as the two open items in
  ORCHESTRATOR_NOTES).
- `prefers-reduced-motion: reduce` -> `pm-tops-scrim-in` and `pm-tops-jump` both resolve to
  `animation-name: none`, the confirm still opens, 0 console errors. Neither animation loops,
  so neither belongs in motion.css's named-loop stop list.
- Screenshots reviewed by eye in dark and light: thread menu, delete confirm, restore-point
  dialog, rewind fold card, message overflow rows, search scope selector.
  `scratchpad/w4/shots/` (before the three visual fixes) and `scratchpad/w4/shots2/` (after).

### Files owned and changed
| File | State |
|---|---|
| `threadops.js` | written (~1,050 lines) |
| `threadops.css` | written |
| `tests/threadops-verify.mjs` | NEW — 81 assertions, `--file` / `--json` / `--themes` / `--negative` |
Nothing else was edited. The three app.js slots were requested from and landed by the
orchestrator; `tests/audit.mjs` was NOT touched.
Scratch: `scratchpad/w4/build-control.py` (control builds), `smoke.mjs`, `scrim.mjs`, `rm.mjs`,
`collide.mjs`, `shots.mjs`.

### NOT CLOSED BY ME — what a second pair of eyes must confirm (two-harness standard)
1. **The locked delete copy.** I verified the three button labels, the `(has changes)` suffix on
   both dirty worktree states, Cancel's default focus, and the absence of any undo promise. What
   I cannot verify is whether my ONE deviation is acceptable: for a thread with no worktree, and
   for a branch with no checkout, I kept all three buttons and disabled the one that cannot act
   with a reason naming the record, rather than dropping to a two-button dialog. That preserves
   the locked copy at the cost of showing an inert button. Someone else should agree with that
   reading of "locked".
2. **Rewind's fold is a SPLICE, not a CSS collapse.** The rewound turns leave
   `thread.messages` and are held verbatim in `store[tid].rewinds[]`. I argue this is the only
   correct option here (see the header comment in `threadops.js`: `messageAffordance` only
   renders for text turns, and bounding the region from the anchor needs `:has()` inside
   `:has()`, which the selector spec forbids). Someone should check the argument, not just the
   assertions — if it is wrong, the fix is structural.
3. **"Add passage to context" writes to `D.contextByThread`,** which Wave 3 Context reads.
   My harness proves the numbers rebalance and the removal is exact, but it does not open the
   Context drawer and look. Context's owner should.
4. **Branches keep the source's message ids** rather than remapping them. That is deliberate —
   it is what lets a thread-local overlay keyed by message id (the Context Lens store)
   recognise the covered prefix on a branch, which is the preservation kimi-k3 does explicitly.
   Lens's owner should confirm it is a feature there and not a collision.
5. **The `--negative` mode is mine too.** It found seven vacuous assertions in my own file; it
   has not been read by anyone else.

### Deliberately NOT added (recorded so nobody "fixes" it back in)
`Resend` (superseded, `"resend": false`), message-level `Stop` (composer's), message delete
(`cmd.chat.delete_message` is retired), and a fourth `headerExtras` registrant (that row is
CLOSED).

## Sub-step 6 — DONE. Switched the two shared actions to `EXT.chainAction`
The orchestrator split the API: `action()` = I own this name (an undeclared duplicate is
recorded in `PM56_EXT.collisions` and logged at `info`); `chainAction()` = I deliberately extend
someone else's handler and will `return false` (not recorded). My two shared handlers now use a
local `CH()` wrapper over `EXT.chainAction`, with a fallback to `EXT.action` so the module stays
loadable against an older registry.

Measured after the switch:
- `window.PM56_EXT.collisions` -> **[]** with 92 actions registered, and **zero console messages
  of any non-log type** at boot.
- `toggle-thread-pin` still toggles EXACTLY ONCE (`pinned true -> false`), closes the menu, and
  writes the correct receipt.
- `reset-all` still chains all the way through: my store cleared AND `state.threads` back to 24,
  which requires app.js's `globalReset()` to have run, with Goals' `restoreFixture()` between us.
- **`node history-verify.mjs` -> 60 pass / 0 fail** (was 59/1; the 1 was its
  `Zero console errors/warnings` assertion reading the old chaining warning).
- `tests/threadops-verify.mjs --themes` -> **81/0**; negative control -> **79 red / 2 green**,
  0 vacuous.
- `tests/audit.mjs reports/audit.json ./tests` -> **443 / 3 / 0 console / 0 page**; all three
  failures reproduce in a threadops-blanked control. The orchestrator has taken the
  `context-ring +29px` split-range overflow (its third instance of the `.chat-header` budget).
- `python3 build.py --check` PASSES.
