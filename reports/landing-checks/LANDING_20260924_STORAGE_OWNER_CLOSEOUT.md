# Landing record: Storage owner closeout, 2026-09-24

Branch `plans/storage-owner-closeout-20260924`. It was rebased onto `main` `22e516b456` and checked at tip `51c71b9ca4`. This record is a report-only commit on top of that tip, and `main` is fast-forwarded to it. The branch report is `reports/storage-owner-closeout-20260924/REPORT.md`. The decisions it lands are recorded as **DL-076**.

**Authority.** The coordinator gave the go on 2026-09-24, on Jared's delegation. The go came with two things:
- an amendment to the rule files, which name `git reset --keep origin/main` and forbid `--hard` in the shared checkout (commit `51c71b9ca4`);
- the classification of the landing check's blocking items used below.

**Landing lock.** Acquired at 2026-09-24T14:46:07Z with `mkdir /mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held`, before the fetch and after the sp278 landing released it. It was held through the rebase, the fast-forward, the shard check, the landing check, the push of `main` and the worktree removal.

## Procedure

1. **Rebase onto `22e516b456`.**
   - Only derived files conflicted: `Plans/_shards` and `Plans/.plan_index`, in three rounds. Each round was regenerated, never merged.
   - The authored changes are line-for-line the same as before the rebase in all 21 authored files.
   - The 13 passages the branch cites or amends are byte-identical on the new `main`. The sp278 landing changed `Plans/storage-plan.md` only in the SP-266 area.
   - DL-076 was still the next free number.
   - The new Browser-created v2 contract from sp278 already stores a durable index read token without `redb_snapshot_id`, as DL-076 requires.
2. **Checks in the worktree** at `51c71b9ca4`:
   - shard check: pass, 99 documents, 2,720 shards;
   - index validation: pass, 6,719 PlanUnits, 26,216 acceptance units;
   - readiness: 39, the same as `main`, with a full-list delta of 0 added and 0 removed;
   - `validate-browser-event-admission`: pass;
   - nine named test modules, all passing: vocabulary migration 9, shared-runtime storage 15, onboarding 42, Browser reset 53, Browser admission 38, Browser created 63, testing session 11, GitHub project 15, emit-only boundaries 13.
3. **Overlap check in the shared checkout.** It had 43 uncommitted entries. None is among the branch's 673 paths.
4. **Fast-forward and shard check.** `main` was fast-forwarded from `22e516b456` to `51c71b9ca4`. The shared shard check passed: 99 documents, 2,720 shards.
5. **Landing check.** `python3 scripts/pm-landing-check.py --base origin/main` exits **2** with **172 blocking items**, all classified below. The JSON report is `/mnt/Cursor/PuppetMaster-Evidence/storage-owner-closeout-20260924/landing/landing.json`, SHA-256 `64b473ea27f969a2dafd4900cdcc5b315a3b18393811e48b96301b567506d602`.
6. **Push.** `main` was pushed to `origin` (GitHub and the NAS) and `truenas-backup`.

## Full-list deltas against `main` `22e516b456`

Each standalone subcheck was run with its full failure list on a detached sparse checkout of `22e516b456` and on the branch. The lists were diffed by the landing check's own `normalize` keys. The result file `landing/delta/proof-result.txt` has SHA-256 `d93e70521a65d362fe80cb9ae057113042dcb4912bd7a8e1d1dcd48785eb898b`.

| Subcheck | `main` | Branch | Added | Removed |
|---|---:|---:|---:|---:|
| `validate-evidence` | 876 | 876 | 0 | 0 |
| `validate-plan-graph` | 876 | 876 | 0 | 0 |
| `validate-prd-planning-runtime-contracts` | 1,240 | 1,240 | 0 | 0 |
| `validate-implementation-readiness` | 39 | 39 | 0 | 0 |

## Classification of the 172 blocking items

| Rows | What | Classification |
|---:|---|---|
| 150 | `unresolved_local_ref` in `prd_planning_runtime_contracts`: 72 audit-governance and 50 run-gates samples on `Plans/home_layout_event_contracts.schema.json`, and 28 audit-governance samples on `Plans/home_layout_pending_receipt.schema.json` | **Pre-existing failures on touched files, count unchanged; non-blocking by the coordinator's ruling.** The subcheck total is 1,240 on `main` and on the branch, with 0 added and 0 removed. The two Home contracts carry 244 such rows on both sides: 72 and 172. |
| 14 | Governance staleness that names branch files: `event_authority_currentness_source_drift` for `Plans/storage-plan.md`, `Plans/storage_value_registry.json` and `Plans/Decision_Log.md` (3 rows in each aggregate), and the readiness Spec Lock rows `event_record_spec_lock_hash_stale`, `non_executable_closure_spec_lock_hash_stale` and 2 × `storage_value_registry_spec_lock_hash_stale` (4 rows in each aggregate) | **Reseal request** (below). |
| 2 | `implementation_readiness_self_tests_failed`, in run-gates and audit-governance, naming `scripts/pm-implementation-readiness.py` | **Earlier classification.** Its false checks are the three `case_l_verification_integration` checks, which are false on `main` too; every storage representation check passes. Owner: Event Authority Step 8/9. |
| 4 | Truncated-subcheck rises of `evidence` and `plan_graph` from 665 to 876, in both aggregates | **Name no branch file.** This is `main`'s own state since the baseline `75bcda93bc`; the branch adds 0 (see the full-list deltas above). Reported to Jared under the rule for new failures that name no branch file. |
| 2 | Grown buckets: `audit-governance/implementation_readiness/event_authority_currentness_source_drift` from 4 to 10, and `storage_value_registry_spec_lock_hash_stale` on `Plans/Spec_Lock.json` from 1 to 2 | **Name no branch file.** This is `main`'s own growth since the baseline; the readiness full-list delta is 0 added and 0 removed. Reported to Jared. |

No blocking item outside these classes names a file of this branch.

Other figures:
- **Totals:** `run-gates` 3,279, `audit-governance` 3,279, `plan-migration-validate` 33,072 (baseline 32,967).
- **New rows:** 62. All are staleness kinds (`stale_batch_report_sha256_after`, `stale_hash`) or the readiness rows classified above.
- **Grown subchecks:** 9. They are the 4 truncated rises above, plus `plan_migration` 13 to 34, `spec_lock` 5 to 10 and `plan-migration-validate`, all staleness kinds on `main`.

## Reseal request

- Spec Lock for `Plans/storage-plan.md`, `Plans/storage_value_registry.json` and `scripts/pm-implementation-readiness.py`.
- A currentness edition for those three files and `Plans/Decision_Log.md`.
- The storage-plan and Decision_Log evidence entries, which were already stale.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/storage-owner-closeout-20260924/landing/`.
