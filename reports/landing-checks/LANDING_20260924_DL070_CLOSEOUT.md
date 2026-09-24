# Landing record: DL-070 closeout, 2026-09-24

Branch `plans/dl070-closeout-20260924`: one commit, `1013690c4a`, on `main` `566576ea55`. `main` was fast-forwarded from `566576ea55` to `1013690c4a` and pushed after the landing check. This record is a report-only commit on top, landed the same way.

**What lands.** Two lines of DL-070 in `Plans/Decision_Log.md`. DL-070's follow-up retired `source_reseeded` on 2026-09-24: FinalGUISpec's DL-070 follow-up amendment landed on `main` at `566970cb7b`. The PlanUnit's `canonical_text` has said so since `08ae6bc439`, which is on `main` as of `566576ea55`. These are the two places that were still stale.

- **Prose entry, "Owner edits".** The FinalGUISpec bullet still says the move payload's `source_reseeded` "is always false". Its text is kept as written, because canon is amended, not rewritten. A dated sentence follows it: "On 2026-09-24 `source_reseeded` was retired by FinalGUISpec's DL-070 follow-up amendment, which landed on main (566970cb7b); a move payload no longer carries the field."
- **PlanUnit DL-070, acceptance criterion `DL-070-A004`.** It listed retiring the field as an open follow-up. It now states the retirement as done on 2026-09-24, with the same citation as the `canonical_text`. Its PM7 clause is unchanged in meaning: aligning the PM7 concept's move behavior remains an open follow-up for its owner.
- **Derived files.** The Decision Log's 10 shard files and the 6 `Plans/.plan_index` files were regenerated. The index still has 6,721 PlanUnits and 26,233 acceptance units. The only changed index rows are the 73 Decision Log PlanUnits, whose one changed field is `source_doc_sha256`, and DL-070's criterion. No other document's shards changed.

Nothing else in the entry or the file changed: `git diff` shows 2 lines in the document.

**Authority.** Jared authorized the edit through the coordinator on 2026-09-24.

**Landing lock.** The lock was free when checked at 17:59Z and 18:06Z. It was acquired at 18:06:03Z, before the landing fetch. It was held through the fast-forward, the shard check, the landing check, both pushes of `main` and the worktree removal.

## Procedure

1. **Rebase.** At the landing fetch `origin/main` was still `566576ea55`, the branch's base. The rebase was a no-op, and no cited passage had changed.
2. **Checks in the worktree** at `1013690c4a`:
   - shard check: pass, 99 documents, 2,722 shards;
   - index validation: pass, 6,721 PlanUnits, 26,233 acceptance units.
3. **Full-list deltas against `main` `566576ea55`.** Each standalone subcheck was run with its full failure list in the same sparse worktree, at `1013690c4a` and detached at `566576ea55`. The lists were diffed by the landing check's own `normalize` keys.

   | Subcheck | `main` | Branch | Added | Removed |
   |---|---:|---:|---:|---:|
   | `validate-evidence` | 876 | 876 | 0 | 0 |
   | `validate-plan-graph` | 876 | 876 | 0 | 0 |
   | `verify-spec-lock` | 10 | 10 | 0 | 0 |
   | `validate-prd-planning-runtime-contracts` | 1,240 | 1,240 | 0 | 0 |
   | `validate-implementation-readiness` | 1 | 1 | 0 | 0 |

   Totals are those of the sparse tree; only the deltas matter. The Decision Log has no Spec Lock entry. Its evidence and plan-graph rows are already `artifact_hash_stale` on `main`: 11 in each, the document and its 10 shard files. A stale hash keeps its key however often the document is edited, so this edit adds none.
4. **Overlap check in the shared checkout.** A path-limited `git status` over the branch's paths and `reports/landing-checks` found no uncommitted entry.
5. **Fast-forward and shard check.** `main` went from `566576ea55` to `1013690c4a` at 18:09:46Z. The shared shard check passed: 99 documents, 2,722 shards.
6. **Landing check.** `python3 scripts/pm-landing-check.py --base origin/main --json` ran from 18:10:11Z to 18:24:31Z and exits **2** with **8 blocking items**, all classified below.
   - Totals: `run-gates` 3,279, `audit-governance` 3,279, `plan-migration-validate` 33,072. The baseline `75bcda93bc` has 2,875, 2,875 and 32,967. The previous landing, `LANDING_20260924_TERMINAL_WORKGROUP_MOVED.md`, had 3,280, 3,280 and 33,072. Each aggregate is one row lower because that landing's `subprocess_timeout` rows are gone.
   - Branch: 17 paths, 16 of them derived and excluded. The one direct path is `Plans/Decision_Log.md`, with 73 units.
   - New rows: 62. The previous landing already listed every one of them, and none is new since.
   - Timeouts: none. `lint-contractrefs` finished within its 180-second limit and reported no failure, so no standalone rerun was needed.
7. **Push.** At 18:25:12Z, `main` `1013690c4a` was pushed to `origin` (GitHub and the NAS) and to `truenas-backup`. `truenas-backup` was already up to date through `origin`'s NAS push URL. This record then followed as a report-only fast-forward under the same lock.

## Classification of the 8 blocking items

| Rows | What | Classification |
|---:|---|---|
| 2 | `event_authority_currentness_source_drift` for `Plans/Decision_Log.md`, fingerprint `97e212c23116`, one row in each aggregate | **Currentness drift on the edited document: governance staleness the coordinator excused. Reseal request.** The same key was already present at the previous landing. The branch keeps the document drifting and adds no drift row. |
| 2 | Grown buckets. `audit-governance/implementation_readiness/event_authority_currentness_source_drift` is 10 against a baseline of 4. `storage_value_registry_spec_lock_hash_stale` on `Plans/Spec_Lock.json` is 2 against a baseline of 1. | **Classified earlier; they name no branch file.** Both counts are the same as at the previous two landings, which classified them as `main`'s own growth since the baseline. |
| 4 | Truncated-subcheck rises of `evidence`/`validate_evidence` and `plan_graph`/`validate_plan_graph`, from 665 to 876 in both aggregates | **Evidence and plan-graph hash staleness that is already `main`'s state; the branch adds 0.** The full-list deltas above show 876 on `main` and 876 on the branch, with 0 added and 0 removed. The previous landing recorded the same 876. |

No other non-stale row names a file of this branch. 337 rows name `Plans/Decision_Log.md`. 335 of them are staleness kinds, which the tool excuses:
- 277 `current_snapshot_live_span_metadata_mismatch`;
- 39 `current_snapshot_span_sha256_mismatch`;
- 8 `current_snapshot_coverage_not_exact_same_document_planunit_set`;
- 3 `stale_batch_report_sha256_after`;
- 2 each of `current_snapshot_live_sha256_mismatch`, `_live_bytes_mismatch` and `_live_line_count_mismatch`;
- 1 each of `current_snapshot_batch_doc_invalid` and `current_snapshot_batch_doc_set_not_exactly_once`.

The other 2 rows are the drift rows above. The rows name the current plan-migration snapshot `pds-20260906-017` (333 rows) and the run-002 batch report (2 rows). No row names a shard or index file.

**The 62 new rows** break down as follows:
- 42 `stale_batch_report_sha256_after` on the run-002 batch report, 21 in each aggregate;
- 10 Spec Lock `stale_hash`, 5 in each aggregate;
- 6 `event_authority_currentness_source_drift` in `audit-governance`;
- 4 readiness rows (`event_record_`, `storage_value_registry_` and `non_executable_closure_spec_lock_hash_stale`, and `implementation_readiness_self_tests_failed`).

All 62 are keys the previous landing listed and classified. Three of them name the Decision Log and are counted above: its drift row and its two stale batch-report rows.

## Reseal request

- **`Plans/Decision_Log.md`**, which has no Spec Lock entry:
  - the entries in `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json` and the plan graph for the document and its 10 shard files, already stale on `main`;
  - a currentness edition;
  - its run-002 batch-report hash;
  - the plan-migration current snapshot (`pds-20260906-017`) for its 73 units.
- The live PlanUnit count is unchanged at 6,721.

## Left as it was, by instruction

- **The PM7 clause of `DL-070-A004`.** It still calls aligning the PM7 concept's move behavior an open follow-up. The prose addendum of 2026-09-23 records that the Home workspace authored source no longer reseeds, and that `Concepts/PMConcept7.html` changes at the pipeline's next authorized promotion. Whether the clause closes is for the PM7 concept owner.
- **The prose entry's historical "Open follow-ups" bullet** on retiring `source_reseeded` is unchanged. The addendum that follows it already records the retirement.

Cost: the landing check took 14 min 20 s in the shared checkout. The two five-subcheck standalone runs in the worktree took about 35 s each. Monetary attribution is unavailable.

## Evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/dl070-closeout-20260924/landing/`.

| File | SHA-256 |
|---|---|
| `landing.json` (landing check report) | `3395ba99fef8d92a01bc77724c71a846d1793dbbb66b4450230bce8a398c197c` |
| `delta-1013690c4a/proof-result-1013690c4a.txt` (full-list deltas) | `918a625787428ea1fcbeb10c43a90c70aa851affe692692b653ba3a33dfd3556` |
| `shared-shard-check-1013690c4a.json` | `b8070a4e73ae546e6c7bb6814c469dd0d020724d62d5f13df27e79b6f067d55f` |
| `worktree-1013690c4a/shard-check-1013690c4a.json` | `b8070a4e73ae546e6c7bb6814c469dd0d020724d62d5f13df27e79b6f067d55f` |
| `worktree-1013690c4a/plan-index-validate-1013690c4a.json` | `e97290e42a21c9a6fd5952a897fec1526730e51087529cb8b72e2265d0ce79ad` |

The delta scripts (`delta-1013690c4a/run_full_lists.sh`, `delta_proof.py`) and the classifier (`classify.py`) are in the same directory. `shared-overlap-1013690c4a.txt` is empty: no overlap.
