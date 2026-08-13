# TEST_REPORT — Opus 5 Assistant Chat concept

Generated from the runs recorded in `interaction-test-report.json` and
`demo-trigger-report.json`. Nothing in this file is asserted by hand.

## Harness

| File | Role |
|---|---|
| `tests/assert.js` | `PMXAssert`: registration, assertions, geometry helpers, console shim |
| `tests/suites.js` | `PMXSuites`: 23 suites, `runAll`, `run`, `runMatrix` |
| `tests/runner.html` | in-page runner, no dependencies, no install |

The console shim is installed at load, so error and warning counts cover boot as well as the
run, and uncaught errors and unhandled rejections count even when nothing logged them.

**Viewport floor.** The runner refuses to run below 1900x900 and prints the required size.
Eight popup-anchor assertions fail below it because the popup service correctly refuses an
off-viewport anchor — a failure that describes the window, not the product.

## Suite run

| Metric | Value |
|---|---|
| Viewport | 1920x1000 |
| Suites | 23 |
| Assertions | 407 |
| Passed | 407 |
| Failed | **0** |
| Console errors | **0** |
| Console warnings | **0** |
| Elapsed | 4031 ms |

Suite names, in dependency order: `policy`, `mount`, `store`, `route`, `access`, `bsd`,
`approvals`, `context`, `threadops`, `sync`, `spell`, `attach`, `ops`, `crew`, `work`,
`notify`, `history`, `artifact`, `question`, `forms`, `distinctness`, `motion`, `general`.
`policy` and `mount` run first because a CSS-scope violation or a missing region invalidates
everything measured afterwards.

## Matrix run

| Metric | Value |
|---|---|
| Description | mount suite across all 64 pairings at 520 and 750 chat width |
| Pairing/width runs | 128 |
| Assertions | 512 |
| Failed | **0** |
| Console errors | **0** |
| Console warnings | **0** |

## Director triggers

| Metric | Value |
|---|---|
| Families | 16 |
| Triggers | 93 |
| Returned ok | 93 |
| Returned a refusal | 0 |
| No store effect from the reset baseline | 18 |

Each trigger is measured after a `system.reset`, so the effect recorded is the trigger’s own.
The triggers with no store effect are correct: a sequence step fired without its predecessor
(`question.open` before `prepare`, `crew.wave` before `crew.start`, `thread.respond` before a
request), an idempotent trigger fired twice, or a **correctly gated** goal verb — `goal.start`
and `goal.resume` are refused on a goal that is already running, which is the gate working.

## What is asserted, by decision

Each line is a decision the build makes, asserted against behaviour rather than implementation.

- The same model under two accounts yields two distinct route identities.
- `effort` is null for Haiku 4.5 and GPT-5.6 Mini, so the submenu is absent, not disabled.
- `Fast` is absent for Opus 5; only three models declare the tier.
- No model row carries more than three compact facts.
- A CLI-owned OAuth account offers no PM-direct sign-in.
- `Full Access · Limited by Review mode` renders verbatim; Plan and Review expose ten tools each.
- All ten Back Seat Driver visual states are reachable; advice is read-only; `auto-active` is
  bound to a live operation and manual `on` carries none, so it cannot glow.
- `Allow once` writes no grant; `Allow for session` writes exactly one.
- A multi-class route warning shows one consequence and keeps every class as evidence.
- Compaction leaves every stored message in place and preserves ancestry.
- No admitted or omitted label matches `/key|token|secret|password|BEGIN /i`.
- Opening an artifact does not change what is admitted.
- A related-thread projection carries no message array; `readRange` throws past its bound.
- Cycle and fanout refusals are typed and carry reasons.
- Branching does not mutate the source thread; rewind always leaves a restore point.
- A redirect preserves the interrupted attempt’s partial output.
- Two consecutive reconnects send each outbox entry exactly once.
- Transport and domain are independent axes.
- A misspelling inside a fenced block and inside inline code is skipped; only prose is flagged.
- Skip ranges are sorted and non-overlapping across all ten categories.
- Six named attachments resolve to their stated classes with verbatim representations and lineage.
- The port conflict copy and its three actions are verbatim; a worktree conflict never offers Remove.
- Worktree states are the five human-readable strings.
- The capacity forecast is verbatim and never drops a required role.
- A Crew in one thread does not appear in another.
- No notification surface exists inside a window concept, and the rail has no notification item.
- All eight window floor rows are registered exactly as specified; the `pinState` shim is gone.
- A row shell carries exactly the seven identity fields, proven with an accessor trap.
- All four history states resolve in all eight windows.
- Each window uses its own artifact switcher idiom; the artifact never overlaps the composer.
- `forceReady` settles an artifact in the same tick.
- Skipping the last question reaches the terminal index; submit and cancel both return receipts.
- The draft survives the whole question flow and the composer is never disabled by it.
- The eight question roots and the eight work-cluster roots are distinct.
- Every indefinite animation is bound to a running operation.
- Every real scroller carries `pmx-scroll`; no Resend and no per-message Stop exist.
- Every concept CSS rule stays inside its own scope.

## Phase E re-run (final)

Recorded from live runs in the in-app Chromium browser, not from intent.

| gate | result |
| --- | --- |
| Interaction suite, `tests/runner.html?run=1` at 1920x1000 | **407 total, 407 passed, 0 failed, 0 console errors, 0 console warnings** (4,031 ms) |
| Matrix sweep, 64 pairings x 520 px and 750 px, run in per-window slices | **128 runs, 512 assertions, 0 failed, 0 console errors, 0 console warnings** |
| Matrix per window | w1..w8 each 16 runs / 64 assertions / 0 failed |
| Director sweep | 16 families, **93 events, 93 ok, 0 failed**. Fired in sequence without an intervening reset, so this row measures only that every declared event acts. The per-event measurement above resets first and records **18** with no store effect of their own; both numbers are correct for what they measure. |
| Host pages | `index.html` (16 gallery cards), `stage.html`, `contact.html` (8 theme stages), `tests/runner.html` - all `data-pmx-ready="1"`, zero console errors or warnings |
| ConceptHub validator | `Concept validation passed: Concepts\chat-assistant-concepts\opus-5` |
| `node --check` | passes on every `.js` in the concept |
| Third-party browser-automation references | zero anywhere in the folder |

The matrix is driven in per-window slices for a mechanical reason worth recording: `runMatrix()` chains 128
remounts, and driving all of them from a single browser call exceeds the debugging protocol's per-call
timeout while the sweep is still healthy. Slicing by window keeps each call short; the totals are the sum of
the eight slices.
