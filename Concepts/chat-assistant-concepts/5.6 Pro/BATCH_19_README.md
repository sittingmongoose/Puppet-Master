# Batch 19 — Attachments and bounded folders

Concept-only update to `Concepts/chat-assistant-concepts/5.6 Pro`, built from
accepted B18 / current main. No native work, no Plans edits, no governance
sealing, no formal audit, no user-acceptance claim.

## Scope

Worklist batch 19 (`DEMO_REMAINING_WORKLIST.json`, `PLANNED_NOT_EXECUTED` at
build time): `v2:ATT-001..014` and `v4:FOLDER-001..008`. The worklist carries
source-row IDs only; no per-requirement prose exists in the worklist or the
concept directory, so the operative requirement wording is the Batch 19 goal
§2 clause list (disclosed as missing historical wording in
`BATCH_19_COVERAGE.json`).

Covered behaviors:

- Real byte intake with whole-selection bound refusal (no partial intake).
- Processing tracer and preview; Retry/Remove preserve siblings and composer
  text; exact-version downloads.
- Live-reference capture per turn, changed-since-message truth, Details
  dialogs, reference-safe retention (deletion refused while referenced).
- History visibility is not future prompt inclusion (per-turn dispatch rows).
- Bounded folder manifests (names/sizes, truncation, exclusions,
  manifest-only materialization); separate selected-context receipts.
- Scheduled refs freeze at commit and never substitute latest bytes; missing
  folders hold; blocked refs refuse.
- Picker, drop and reference routes converge on `cmd.chat.attachment.add`;
  `add_file_reference` stays file-only; no folder command or second store.
- Hover actions stay clickable between adjacent messages; thread switch
  preserves trays.
- Unsupported native effects are explicit (`filesafe_not_wired`,
  capture-only honesty); nothing fabricates native success.

## Changed and added paths

Modified: `attachments.js`, `attachment-snapshots.js`, `scheduling.js`,
`build.py`, `index.html`, `PM_Chat_Assistant_5.6_Pro_Standalone.html`.
Added: `attachment-batch19.js`, `attachment-batch19.css`,
`attachment-demo-batch19.js`, `attachment-demo-batch19.css`,
`BATCH_19_README.md`, `BATCH_19_CHECKPOINT.json`, `BATCH_19_COVERAGE.json`,
`tests/b19/` (handlers, surfaces/record browser probes, group runner,
packaging scripts). All ten protected animation sources
(`motion`, `variants-a/b/c`, `orbit` js/css) are byte-unchanged.

## Rebuild

In this directory: `python3 build.py`. Both generated HTML files are
byte-identical by construction. Requires only Python 3 (no network).

## Test launchers (bounded, serial, external evidence)

Playwright Python is required for browser probes (system `python3` here does
not provide it; use a venv with Playwright installed):

    python3 tests/b19/run.py handlers --outdir <fresh-external-dir>
    python3 tests/b19/run.py surfaces --outdir <fresh-external-dir>
    python3 tests/b19/run.py record --outdir <fresh-external-dir>
    python3 tests/b19/run.py regressions --outdir <fresh-external-dir>

Each group writes `RUN.json` with per-command exit codes and logs, and refuses
to run unless the frozen HTML is unchanged and both generated outputs match.
`handlers` runs 22 cases; `surfaces` runs 11 intake/live/folder/device probes
(1440/900/700, Orbit/Simple, reduced motion); `record` captures four
screencast workflows with screenshots; `regressions` replays the retained
B18/B17 suites.

Known limitation: the nested pre-B17 legacy leg
(`tests/b17/run.py regressions` → `tests/b10/qa/regression-batch1.py`) fails
identically on pristine main with `FileNotFoundError` because that corpus
file is absent from the repository. It is a pre-existing harness condition,
not a B19 defect; B17/B18 handler suites pass on the B19 HTML.

## Deliveries

Guarded update ZIP (manifest-driven `apply_update.py`, merge-only, with
preflight/apply/rollback), cumulative source/test ZIP, standalone HTML, and a
separate evidence ZIP are built by `tests/b19/package/build_packages.py` and
verified by `tests/b19/package/check_cumulative.py` plus guarded-archive
apply/rollback/overlap exercises. See the delivery receipt for hashes.
