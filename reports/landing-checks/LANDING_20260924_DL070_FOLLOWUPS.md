# Landing record: DL-070 follow-ups (front 2), 2026-09-24

Branch `plans/dl070-followups-20260923`. Its five commits were replayed with `git rebase --onto` onto `main` `e0b918377c`, which is front 1 as landed; see `LANDING_20260924_STORAGE_REGISTRY_REPAIRS.md`. The branch was checked at tip `2c282e3bd4`. This record is a report-only commit on top of that tip, and `main` is fast-forwarded to it. The branch's section is "Front 2: DL-070 follow-ups" in `reports/storage-registry-repairs-20260923/REPORT.md`.

**Authority.** The coordinator (PM Low cost/complexity process) gave the go on 2026-09-24. The rise of the truncated evidence and plan-graph totals from 665 to 759 is a scoped exception, on one condition: a proof, from the full report files and not the sample, that every added evidence and plan-graph row is `artifact_hash_stale` on the FinalGUISpec and Decision_Log files. The condition holds; the proof is below.

## Procedure

1. **Rebase.** Only this report's STATUS line conflicted. The authored files are byte-identical to the branch's originals, and regenerating shards and index changed only timestamps.
2. **Checks in the worktree**, at `2c282e3bd4`:
   - shard check: pass, 99 documents, 2,720 shards;
   - index validation: pass, 6,718 PlanUnits, 26,208 acceptance units;
   - readiness: 35;
   - `validate-wiring-matrix`, `validate-ui-command-response`, `validate-touch-closure` and the three event gates: all pass;
   - whole suite: 908 run, 5 failures, the same 5 that fail on `main`.
3. **Overlap check in the shared checkout.** It had 51 uncommitted entries, the same as at front 1's landing. None is among the branch's 103 paths.
4. **Fast-forward and shard check.** `main` was fast-forwarded from `e0b918377c` to `2c282e3bd4`. The shared shard check passed: 99 documents, 2,720 shards.
5. **Landing check.** `python3 scripts/pm-landing-check.py --base origin/main` exits **2** with **10 blocking items**, all classified below. The JSON report is at `/mnt/Cursor/PuppetMaster-Evidence/storage-registry-repairs-20260923/landing-front2/land2-landing.json`, SHA-256 `c770b48bd2695ef7fc24639e9b35b67dddb7874b54a4467ea5950ff0bd6d295e`.
6. **Push.** `main` was pushed to `origin` (GitHub and TrueNAS) and `truenas-backup`.

## Evidence-delta proof (the exception's condition)

`validate-evidence` and `validate-plan-graph` were run standalone, with full failure lists, from the same worktree on `main` `e0b918377c` and on the branch. The lists were diffed by the landing check's own `normalize` keys.

| Subcheck | `main` | Branch | Added | Removed |
|---|---:|---:|---:|---:|
| `validate-evidence` | 665 | 759 | 94 | 0 |
| `validate-plan-graph` | 665 | 759 | 94 | 0 |

In each subcheck every added row is `artifact_hash_stale`:
- 82 on `Plans/_shards/finalguispec/*`;
- 10 on `Plans/_shards/decision_log/*`;
- 1 on each edited document's own evidence entry (`Plans/FinalGUISpec.md`, `Plans/Decision_Log.md`).

No other kind and no other file was added. The files are in `/mnt/Cursor/PuppetMaster-Evidence/storage-registry-repairs-20260923/landing-front2-proof/`. The SHA-256 of `proof-result.txt` is `1837e70ebed395e831b38f84acb6270a59a606840112147e9f676635f8e8092d`.

## Landing-check numbers

| Check | Baseline `75bcda93bc` | This landing |
|---|---:|---:|
| `run-gates` total | 2,875 | 3,029 |
| `audit-governance` total | 2,875 | 3,029 |
| `plan-migration-validate` (run 017) | 32,967 | 32,947 |
| evidence / plan graph (truncated) | 665 / 665 | 759 / 759 |
| readiness | 79 | 35 |
| plan-migration subcheck | 13 | 24 (all `stale_batch_report_sha256_after`) |
| Spec Lock | 5 | 7 (adds `Plans/FinalGUISpec.md` and the front 1 validator, both `stale_hash`) |

Other figures:
- **Branch:** 103 paths (98 derived paths excluded), 633 units.
- **Rows naming the branch's files:** 5,890. The tool excuses 5,886 of them as staleness; the other 4 are listed below.
- **New rows:** 32.

## The 10 blocking items

| Rows | What | Classification |
|---|---|---|
| 4 | Truncated-subcheck rises of `evidence` and `plan_graph` from 665 to 759, in both aggregates | Coordinator's scoped exception. The full-delta proof above holds. **Reseal request.** |
| 4 | `event_authority_currentness_source_drift` on `Plans/FinalGUISpec.md` and `Plans/Decision_Log.md`, in both aggregates | Governance staleness on the two documents this branch edited, the class the coordinator ruled covered for `storage-plan.md` at front 1. These two rows are new with this branch, not pre-existing. **Reseal request** (currentness edition). |
| 1 | bucket `audit-governance/implementation_readiness/event_authority_currentness_source_drift`, 4 to 6 | The same two rows, counted by bucket. |
| 1 | bucket `audit-governance/implementation_readiness/storage_value_registry_spec_lock_hash_stale`, 1 to 2 | Front 1's validator Spec Lock staleness, already classified in front 1's record. It names no front 2 file. |

**Off-branch new rows, not blocking.** Front 1's validator rows remain new against the baseline, which predates front 1: three readiness Spec Lock kinds, `stale_hash`, and the improved `implementation_readiness_self_tests_failed`. So do 22 `stale_batch_report_sha256_after` rows, which is staleness: the run-002 batch report goes stale for the two edited documents.

## Reseal request

- `Plans/FinalGUISpec.md`: Spec Lock, evidence bundle and its 82 shard entries, currentness edition.
- `Plans/Decision_Log.md`: evidence bundle and its 10 shard entries, currentness edition.
- Carried over from front 1: `Plans/storage-plan.md` and `scripts/pm-implementation-readiness.py`.

## Excused by the tool as staleness

- 5,422 `current_snapshot_live_span_metadata_mismatch`
- 364 `current_snapshot_coverage_not_exact_same_document_planunit_set`
- 55 `current_snapshot_span_sha256_mismatch`
- 24 `stale_batch_report_sha256_after`
- 4 `artifact_hash_stale`
- 4 each of `current_snapshot_live_bytes_mismatch`, `_live_line_count_mismatch` and `_live_sha256_mismatch`
- 2 `current_snapshot_batch_doc_invalid`
- 2 `stale_hash`
- 1 `current_snapshot_batch_doc_set_not_exactly_once`

Cost: one landing-check run of 15 min 17 s in the shared checkout, plus the two standalone proof runs; monetary attribution unavailable.
