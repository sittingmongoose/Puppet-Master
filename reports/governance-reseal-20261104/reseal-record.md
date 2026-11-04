# Governance Reseal Record — 2026-11-04 (residual fixes)

## Status and authority

Prepared on branch `plans/governance-reseal-20261104` at `main` `ec015f809d79`, in the full local T3 worktree `~/.t3/worktrees/PuppetMaster/t3-78745aa8`, by `pm7-residuals` (Claude Opus 5.5).

On 2026-11-04 Jared was shown the 230 failures left after the 2026-11-03 reseal and said "address the remaining issues". The PM7 build lead assigned that work, including this follow-up reseal, to `pm7-residuals`. The landing check of the second fix below reported governance staleness. This reseal is the separate final step that settles it.

`claude-projects-refresh` has a Plans landing planned 4 to 5 hours later. It was asked by mail whether this reseal should wait for it (`1104054338-a1ff`). It answered to reseal now; its landing will raise its own reseal request.

## What landed before this reseal

| Commit | What it fixes | Rows |
|---|---|---|
| **`64d4567f12`** `fix(verification)` | The PM7 GUI fixture checker still forbade every `context.compaction.*` family and expected two fixtures that were renamed on 2026-09-11. DL-039 COMPACT-001 and DL-040 registered `context.compaction.completed`, and ATS-040 requires exactly one such family and requires this checker to pass. This ports the reviewed, never-landed `96ab84f13c`. | `validate_pm7_gui_fixtures` 3 to 0. Landing check exit 0, both aggregates 230 to 227. |
| **`ec015f809d`** `fix(readiness)` | Two defects in `scripts/pm-implementation-readiness.py`. Two self-test checks compared `registered_kernel_rows` with the literal `39`, which has been stale since 2026-09-11; they now use the approved checkpoint constant (46, DL-300). The buildability report also pinned the raw bytes of `node_readiness_report.json`. That closed a SHA-256 cycle (buildability report, node readiness, currentness receipt, Spec Lock, buildability report) that no reseal could satisfy; the report now compares only the node-readiness fields it uses, and it already embedded those. | Landing check exit 1, nothing blocking: 8 new rows, all Spec Lock staleness for the edited script. 231 in each aggregate. |

Each fix was reviewed before landing by a fresh read-only worker given only the diff. Both reviews returned APPROVE WITH NOTES, with no blocker and no major.

## Scope

This reseal changes exactly four tracked files and adds this record:

| File | Before SHA-256 | After SHA-256 | What changed |
|---|---|---|---|
| `Plans/.implementation_readiness/buildability_gate_report.json` | `11904169ccc3…` | `498aa0b38377…` | Regenerated with `pm-implementation-readiness.py generate`: `generated_at_utc`, the readiness script's source hash, and the node-readiness source-hash key removed by `ec015f809d` |
| `Plans/Spec_Lock.json` | `5774947aa8fa…` | `9edae481d52a…` | Exactly 2 `sha256` values: `scripts/pm-implementation-readiness.py` and the buildability report. The driver refused to refresh unless the stale set was exactly those two. |
| `Plans/.plan_index/node_readiness_report.json` | `9555f54335fd…` | `256cc9f8fbd6…` | `generated_at_utc`, and the embedded live hash of the new currentness `VALIDATOR_RECEIPT.json` (`7e54ba80…` to `605f8185…`) |
| `Plans/auto_decisions.jsonl` | `cac66b700914…` | `7612af5ed1eb…` | One row appended through `upsert_auto_decision`: `dec-2026-11-04-governance-reseal-residuals` (223 to 224 rows). `validate-auto-decisions` passes. Its contract refs name real anchors (DL-039, DL-040, DL-300, ATS-040). The `Plans/PolicyRule.md#…` refs in the 10-29, 11-01 and 11-03 rows point to a file that does not exist (review finding I-1 on the last reseal); those rows are left as written. |

The reseal does not change:
- the PNC-019 receipt, the event family registry, or any Event Authority row;
- any closure-registry hash;
- any run-002 artifact (no `Plans/*.md` changed since the last reseal, so its batch hashes are current);
- the evidence bundle, any shard, owner prose, schema version, locked decision, plan graph or sharding config.

It creates no WorkNodes, NodeSeeds, executable queues, final node manifests, product code or production build tasks. The denominator stays `UNKNOWN_OPEN`, and PNC-019 is not recertified.

## Sequence

1. Back up the four governed files and the baseline-bound 15-file currentness edition. The local edition matched all 15 baseline hashes.
2. Regenerate the buildability report once.
3. Refresh Spec Lock with `pm-governance-seal.py refresh --spec-lock Plans/Spec_Lock.json`, after confirming the stale set was exactly the readiness script and the report. Afterwards 0 entries are stale.
4. Generate a new currentness edition externally and install only its seven generated files. Only two change: `CURRENT_EVENT_SOURCE_INVENTORY.json` (the single source that moved is `Plans/Spec_Lock.json`) and `VALIDATOR_RECEIPT.json` (`605f8185…`). The eight frozen files are unchanged. Validation gives `evidence_valid=true` and `event_authority_closed=false`. Manifest of all 15 files: `proof/currentness-15-manifest.sha256`, which is the output of `find . -type f | sort | xargs sha256sum` in the edition directory. Its own SHA-256 is `44375e9d74b8…`. The inventory's `git_custody` block records the generation head `ec015f809d` and the two then-uncommitted paths, `Spec_Lock.json` and the buildability report, as the 2026-11-03 edition did for its own head. A later regeneration would change that block, and therefore the receipt hash that node readiness embeds.
5. Generate and validate the PlanUnit index: top-level status `pass`, 7,421 PlanUnits, 29,931 acceptance units. Three index files differed only in timestamps and were restored; only `node_readiness_report.json` is kept.
6. Validate readiness after the index. The buildability report stays current with no further regeneration, so the cycle is gone. This is the first reseal since 2026-09-23 that does not keep a deliberately stale buildability report.
7. Append the decision row. The blind review's first pass found that the rationale named Jared as assigning the reseal. His words were "Yes and address the remaining issues"; the PM7 build lead read that as covering a follow-up reseal. The row was re-upserted with that wording, and the 223 earlier rows are byte-identical.
8. Measure again. The first after-run gave 228 in each aggregate. The two extra rows were phantoms of this worktree: `support_refs` `missing_ref` on `Plans/00-plans-index.md:255`, which names the ignored widget-followup `audit_report.json`, and `stale_audit_status_index`. Four ignored `Plans/.audits` inputs had not been copied, because a shell `&&` chain stopped at a permissions warning from `cp -a`. Its aggregate reports were overwritten by the rerun; `reseal/measure-after.log` keeps its exit lines. After copying those inputs, plus the three `event-authority-2026-08-12` inputs and the live-resize audit directory used by the last reseal, `validate-audit-status-index` and `lint-contractrefs` passed and the aggregates gave 226 (`reseal/measure-after-rerun.log`).

## Check movement

| Check | Start of this work (`373624888b`) | Before this reseal (`ec015f809d`) | After this reseal |
|---|---:|---:|---:|
| **Spec Lock** | 0 | 1 | 0 |
| **Evidence** | 0 | 0 | 0 |
| **Plan graph** | 0 | 0 | 0 |
| **Readiness** | 24 | 27 | 23 |
| **PM7 GUI fixtures** | 3 | 0 | 0 |
| **Aggregate run 002** | 2 | 2 | 2 |
| **Current snapshot** | 0 | 0 | 0 |
| **Run-gates** | 230 | 231 | 226 |
| **Audit-governance** | 230 | 231 | 226 |

"Before" comes from the readiness landing check's kept reports in the shared checkout. "After" comes from this worktree, with the ignored inputs copied from the shared checkout.

Readiness after: 17 `pnc019_source_hash_stale`, 2 `event_denominator_unresolved`, 2 `event_family_contract_depth_unresolved`, 1 `event_legacy_fixture_root_mismatch`, and 1 `implementation_readiness_self_tests_failed`.

The self-test row now has a single failing check: the legacy golden-fixture recompute. That check correctly detects the fixture-root row. The fixture's `registry_revision` label still says `2026-08-27.1`, and the validator recomputes every value against `2026-11-04.1`. The file is tracked but `.gitignore` does not name it, so editing it is outside the strict repository scope. It is a question for Jared, and both rows clear together if he approves the one-line bump.

## Residuals this reseal does not claim to address

- **Audit closure:** 201 in each aggregate. The wrapper keeps 200 errors and adds 1 reopened-rows row. The real count is 2,319 stale whole-file evidence hashes across 654 of 737 closure rows, plus 2 reopened PNC-019 and Event Authority rows. Refreshing those hashes without re-auditing each closure would restamp attestations that were never re-run, and DL-039 also forbids "restamping of ... closure-registry hashes". The measurement and the options are in the residual triage (`/mnt/Cursor/share/puppet-master/2026-11-04-governance-residuals/TRIAGE.md`).
- **PNC-019:** 17 receipt rows. They clear only through a real recertification after Event Authority closure.
- **Event Authority:** 4 denominator and depth rows. The program has been paused since 2026-09-25.
- **Run 002:** 2 rows. The supersession link was lost when runs 003-016 moved out on 2026-09-10. The fix is a landing-recipe change awaiting Jared.
- **A cycle that will appear at recertification:** the read-only review noted that once a recertified receipt binds `VALIDATOR_RECEIPT.json`, the currentness inventory, which lists the receipt as a source, closes a new loop. It is inactive today because the receipt records `null` for that path.

## Landing instructions

1. Take the landing lock and fetch. If `main` moved, rebase and regenerate; never hand-merge generated governance files.
2. Run the shard check in the branch worktree. In the shared checkout, stop if uncommitted work overlaps the five paths. Otherwise fast-forward, run the shard check and run the landing check before pushing `main`.
3. Push `main` to both remotes and verify both tips. Expect the shared landing check, which runs before the currentness install against the old shared edition, to report `event_authority_currentness_source_drift` for `Plans/Spec_Lock.json` as governance staleness. The 2026-11-03 landing saw the same thing and exited 1 without anything blocking.
4. While still holding the lock, install only the two changed generated currentness files, `CURRENT_EVENT_SOURCE_INVENTORY.json` and `VALIDATOR_RECEIPT.json`, from `/mnt/Cursor/PuppetMaster-Evidence/governance-residuals-20261104/reseal/currentness-final/` into the shared checkout's ignored edition. Back up first, then validate.
5. This landing changes `Plans/` paths. In this full local worktree at the new `main`, run `snapshot-current` first and `pm-landing-check.py --record-baseline` second. Commit both together as one follow-up, fast-forward, push, and release the lock.

## Evidence

Everything is outside the repository, in `/mnt/Cursor/PuppetMaster-Evidence/governance-residuals-20261104/`:
- `reseal/`:
  - `reseal.py`, the driver;
  - `apply/`: every command with its streams, exit code and timing;
  - `proof/`: the Spec Lock stale sets before and after, the currentness install, the 15-file manifest and the index timestamp restores;
  - `after/`: all ten checks;
  - `currentness-final/`;
  - `backup/`.
- `landing-pm7/` and `landing-readiness/`: both landing checks. The readiness check keeps its reports.
- `closure-measure/`: the audit-closure staleness measurement.
