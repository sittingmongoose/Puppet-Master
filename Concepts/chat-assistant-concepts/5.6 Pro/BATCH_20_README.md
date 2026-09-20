# Batch 20 — Browser capture and currentness

Concept-only update to `Concepts/chat-assistant-concepts/5.6 Pro`, built from
accepted B19 / pinned main `dd1df59d63`. No native work, no Plans edits, no
governance sealing, no formal audit, no user-acceptance claim.

Repair revision (independent review R01–R07): recorded page authority resolves
unmounted ambiguity/replacement; validators run before every effect-claiming
send hook; DOM/screenshots capability intersection enforced at dispatch and
freeze; refreshed dispatch context bound to isolated sends; list projection
uses value snapshots; snapshot export is valid UTF-8; multi-freeze commits
atomically through the shared transaction with rollback and clean retry.

Residual revision R3 (R2 review F1–F3 only; R1/R2 deliveries unchanged): a
directly observed live-DOM failure is never cleared by unmounting (closed
recheck holds as unverified until a live re-resolution or recapture); one
operation resolves its full Ask capability set together with set-scoped
single-use grants consumed at the admission boundary (Send Now and Freeze);
a deferred veto or validator exception keeps the queue entry unless the held
input is already visible in the composer (Off/Ask/exception, manual and
automatic dispatch). Stale-ref deferred behavior is unchanged: the entry is
consumed and the marked text lands in the composer.

## Scope

21 rows from `SOURCE_REQUIREMENTS.json` (packet): `v2:BROWSER-001..009`
with mirrored v2 wording, and `v4:BSTALE-001..012` keyed to grouped live
owner clauses (BSTALE-001..003, 004, 005..006, 007, 008, 009..012) in
`Plans/Section15_MVP_Promoted_Features_Spec.md`; no per-ID historical
wording exists, so none is invented (`BATCH_20_COVERAGE.json` records the
group wording custody per row).

Covered behaviors:

- Visible full screenshot, explicit full-scroll page shot, region shot and
  component capture with adjacent instruction bar (Send, menu, persisted
  last mode).
- Capture sends are isolated payloads to the exact current destination;
  unrelated composer text is never swept in; ended destinations refuse
  without redirect.
- Component modes Send Now / Add To Composer List / Insert Component At
  Cursor; insertion sends nothing.
- Numbered composer lists keep stable hidden refs, stay distinct from the
  two-slot live follow-up queue; stale items block ordinary/keyboard send
  without partial sends; deleted chip tokens drop hidden refs.
- Every component send path revalidates session/page/frame/generation/
  locator/identity immediately before dispatch; zero/multiple matches,
  destroyed frames, identity mismatch and source-map drift yield typed
  `stale_capture` with a recapture action; recapture reuses the picker.
- Scheduling a live selector is refused; freeze routes through the shared
  artifact owner into immutable retained snapshots that survive live page
  change/close; missing retained bytes hold instead of fetching latest.
- Policy enforced at operations (off refuses, ask holds, permission change
  revalidates); protected authentication stays human-only everywhere and is
  never captured, frozen, inspected or persisted.

## Changed and added paths

Modified: `browser-capture.js`, `browser-capture.css`, `app.js`
(validators-first send boundary only), `index.html`,
`PM_Chat_Assistant_5.6_Pro_Standalone.html`.
Added: `BATCH_20_README.md`, `BATCH_20_CHECKPOINT.json`,
`BATCH_20_COVERAGE.json`, `tests/b20/` (handlers, surfaces/record browser
probes, group runner, packaging scripts). All ten protected animation
sources (`motion`, `variants-a/b/c`, `orbit` js/css) are byte-unchanged.

## Rebuild

In this directory: `python3 build.py`. Both generated HTML files are
byte-identical by construction. Requires only Python 3 (no network).

## Test launchers (bounded, serial, external evidence)

Playwright Python is required for browser probes (system `python3` here does
not provide it; use a venv with Playwright installed):

    python3 tests/b20/run.py handlers --outdir <fresh-external-dir>
    python3 tests/b20/run.py surfaces --outdir <fresh-external-dir>
    python3 tests/b20/run.py record --outdir <fresh-external-dir>
    python3 tests/b20/run.py regressions --outdir <fresh-external-dir>

Each group writes `RUN.json` with per-command exit codes and logs, and refuses
to pass unless the frozen HTML is unchanged and both generated outputs match.
`handlers` runs 46 cases (150 assertions, including 9 R01–R07 repair cases
and 8 R3 residual cases for F1–F3 plus clean-path preservation);
`surfaces` runs 10 capture/
currentness/schedule probes (1440/900/700, Orbit/Simple, reduced motion);
`record` captures four screencast workflows with screenshots and video;
`regressions` replays the retained B19→B01 chain.

## Known limitations (carried, not restarted)

- B16 `Concurrent leaves appear separately` (restructure at 900 px) is an
  intermittent inherited responsive failure: it failed on B19, B20 and R2
  bytes, then passed once inside each repair regressions chain and failed
  twice more standalone on the identical repaired bytes (R3:
  `b20r3-b16recheck1/2` fail, chain leg passes on `b7c86828...`). It stays
  open; no To-Do redesign undertaken and no passing run is claimed as a fix.
- B17 native-print limitation carried (no native print dialog claim).
- The B17 legacy-contract harness refuses any symlink under the concept
  source, and main tracks `handoff/node_modules` (absolute machine-local
  link). The regressions chain was run with that link transiently parked
  outside the tree and restored byte-identical afterwards; the B01/B02
  contract assertions themselves are unweakened.
- Contact-sheet review covered the four record key-window sheets plus the
  schedule-700 full window sheet; remaining sheets are captured as evidence.
- Concept/browser-fidelity boundary: local clock, dialog Simulate controls
  and labeled fault injection only; no provider, server, native capture or
  durability claims.

## Deliveries

Guarded update ZIP (manifest-driven `apply_update.py`, merge-only, with
preflight/apply/rollback), cumulative source/test ZIP, standalone HTML, and a
separate evidence ZIP are built by `tests/b20/package/build_packages.py` and
verified by `tests/b20/package/check_cumulative.py` plus guarded-archive
apply/rollback/overlap exercises. See the delivery receipt for hashes.
Delivered-for-review; B21 remains unauthorized.
