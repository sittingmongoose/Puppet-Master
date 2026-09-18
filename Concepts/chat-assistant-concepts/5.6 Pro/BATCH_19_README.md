# Batch 19 — Attachments and bounded folders

Concept-only update to `Concepts/chat-assistant-concepts/5.6 Pro`, built from
accepted B18 / current main. No native work, no Plans edits, no governance
sealing, no formal audit, no user-acceptance claim.

## Scope

Worklist batch 19 (`DEMO_REMAINING_WORKLIST.json`, `PLANNED_NOT_EXECUTED` at
build time) defines membership: `v2:ATT-001..014` and `v4:FOLDER-001..008`.
Requirement wording (see `BATCH_19_COVERAGE.json` revision 2 for the
per-ID mapping): ATT-001..014 statements are mirrored exact v2 wording from
`Plans/.audits/assistant-settings-v3/DEMO_REQUIREMENT_MATRIX.csv` lines
18..31 (custody `mirrored_exact_v2_statement`; wording lineage, not
original-packet recovery). FOLDER-001..008 come from the grouped owner
clauses in `Plans/FileManager.md` (`Additive Correction v4`, lines
5020..5074) plus F-084; no per-ID historical v4 wording exists and none is
invented.

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
`handlers` runs 23 cases (22 original plus `layout_origins_and_chrome_truth`,
which asserts tray/attach layout, the 9-origin census, X geometry,
hover-hidden chrome contents and extra Details needles); `surfaces` runs 11
intake/live/folder/device probes (1440/900/700, Orbit/Simple, reduced
motion); `record` captures four screencast workflows with screenshots;
`regressions` replays the retained B18/B17 suites.

Legacy corpus note: the nested pre-B17 leg (`tests/b17/run.py regressions`)
needs historical test files (`tests/b10/qa/*`, `tests/b11/*`,
`tests/b11-repair/*`, `tests/b12/*`) that are still absent from this
repository — they were NOT restored here. For the follow-up, 35 of those
test-only files were restored from the accepted B18 completion cumulative
archive into an external copy of the B19 source (hash-verified, nothing
overwritten, runtime/HTML untouched), and the full adapted chain executed
green on the frozen B19 HTML, including hash-pinned `regression-batch1.py`
(19/19) and `regression-batch2.py` (157/157). See the follow-up report and
`RESTORED_DEPS.json` in the evidence ZIP.

Inherited failure (not a B19 defect): the b16 `restructure` check
`Concurrent leaves appear separately` (to-do domain, untouched by B19)
fails deterministically at width 900 on pristine base as well as B19, and
is flaky at width 700 (pass/fail/pass across runs); it passes at 1440.
No runtime change was made for it.

## Deliveries

Guarded update ZIP (manifest-driven `apply_update.py`, merge-only, with
preflight/apply/rollback), cumulative source/test ZIP, standalone HTML, and a
separate evidence ZIP are built by `tests/b19/package/build_packages.py` and
verified by `tests/b19/package/check_cumulative.py` plus guarded-archive
apply/rollback/overlap exercises. See the delivery receipt for hashes.
