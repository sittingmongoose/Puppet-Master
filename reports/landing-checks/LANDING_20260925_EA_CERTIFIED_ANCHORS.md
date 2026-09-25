# Landing record: Step 8(d), the goal_run.certified owner anchors, 2026-09-25

Branch `plans/ea-certified-anchors-20260924`: 11 commits. The ten reviewed commits were rebased at landing from `f1ce058ccd` onto `main` `8bc8986484`, followed by one report fix, and the branch ends at `9507c8d2e8`. `main` was fast-forwarded from `8bc8986484` to `9507c8d2e8` at 01:01:54Z and pushed at 01:18:19Z, after the landing check. This record is a report-only commit on top, landed the same way.

**What lands.** Two owner documents, the Step 8(d) report and their derived files, 139 paths in all.
- **`Plans/Goal_Runtime_System.md`, payload minima table.**
  - The `goal_run.certified` row routes to its v3 owners: GRS-084 for the payload and coordinator identity root (schema roots bound by CV-352), within the native-v7/producer-v2 scope; GRS-085 for the mandatory prefix projection; SP-316 and SP-317.
  - The started and cancelled rows name GRS-079 with SP-311 and GRS-080 with SP-312.
  - A dated routing note sits under the table.
- **`Plans/storage-plan.md`, SP-214.** One exact-row paragraph for `goal_run.certified`, and criterion `SP-214-A006`.
- **The report.** `reports/event-authority-20260911/step-08-certified-anchors-20260924.md`.

PlanUnits stay at 6,728, and acceptance units go from 26,257 to 26,258. The registry row and checkpoint `2026-09-11.2` (`0be544181eda...`) are unchanged.

**Authority, review and go.**
- **Authority.** The coordinator's Step 8 instruction of 2026-09-24, (d), relaying Jared's authorization, under DL-045.
- **Review.** A blind review ran in two cycles, in `/home/sittingmongoose/PM-Experiments/review-ea-anchors-20260924/`. Cycle 1 raised A-01 to A-11. Cycle 2 (`RECHECK.md`) found the branch landing-ready at `57b54b5623`, with A-08 deferred to landing and A-10 left open.
- **Go.** The coordinator gave the landing go at `57b54b5623` on 2026-09-25.

**Landing lock.** It was taken at 00:52:53Z, when it was free, after the exports landing released it at 00:50:54Z. It was held through the rebase, the fast-forward, the shard check, the landing check, the push, this record and the cleanup.

## Procedure

1. **Rebase.** The branch went onto `8bc8986484`. The six `Plans/.plan_index` files conflicted at each of the six commits that regenerate derived files. At each stop, `main`'s index files were taken and the shards and index were regenerated with the ignored currentness edition symlinked, never hand-merged. No other path conflicted.
   - Both documents are byte-identical to the reviewer's `proposed/` files: `Goal_Runtime_System.md` `f233eb9c22c5...` and `storage-plan.md` `ad6ea93d9d1b...`.
   - **The cited passages, re-read.** `git diff f1ce058ccd origin/main` is empty for both documents and for the other sources the passages cite: `Contracts_V0.md`, the event family registry, `goal_certified_family_composition.json` and the storage value registry. The passages the edit relies on read as reviewed: GRS-084's "only its explicit version/payload selection and corresponding source refs advance", GRS-085, GRS-079/080, SP-311/312, SP-316/317 and CV-352.
2. **The A-08 readiness regeneration.** Regenerating at the tip with the edition present reproduces every committed derived file apart from four `generated_at_utc` stamps. The readiness report's `executable_lifecycle_certification_failures` goes from `main`'s 20 rows to 22:
   - row 8 (`Goal_Runtime_System.md`, `pnc019_source_hash_stale`) now carries `f233eb9c...`;
   - one `event_authority_currentness_source_drift` row is added for each document;
   - nothing else changes.

   The reviewer's simulation counted 19 rows on `main` `b3169c48d9`. The twentieth row is the `Plans/Decision_Log.md` drift row that `main` has carried since `8650c2f9e8`.
3. **Report fix.** `9507c8d2e8` corrects the cosmetic slip cycle 2 found: "the certified-family pins above" now reads "below".
4. **Checks in the worktree** at `9507c8d2e8`:
   - shard check: pass, 99 documents, 2,722 shards;
   - `pm-plan-index.py validate`: pass, with 6,728 PlanUnits and 26,258 acceptance units;
   - `validate-goal-runtime-event-fixtures`: pass, 0 failures;
   - `test_pm_pnc019_currentness`: fails with drift rows for `Plans/Decision_Log.md` (`main`'s), `Plans/Goal_Runtime_System.md` and `Plans/storage-plan.md`.
5. **Overlap check in the shared checkout.** It was on `main` at `8bc8986484`, equal to `origin/main`, with the same 43 unrelated uncommitted paths. A path-limited status over the branch's paths and `reports/landing-checks` was empty.
6. **Fast-forward and shard check.** The fast-forward ran at 01:01:54Z, and the shared shard check passed (99 documents).
7. **Landing check:** `python3 scripts/pm-landing-check.py --base origin/main --json --keep-check-reports <evidence>/check-reports`, from 01:02:16Z to 01:17:43Z. It exits **1** with **0 blocking items**; stderr is empty.
   - Baseline: its commit 792d2fb8b12f is an ancestor of the base origin/main (8bc89864843f) and 0.17 days older than it, within 7.
   - Totals: `run-gates` 1,470 -> 1,771, `audit-governance` 1,470 -> 1,771, `plan-migration-validate` 33,072 -> 33,072.
   - **Branch.** 139 paths and 396 units. 4,355 rows name the branch, and all of them are staleness. Most are the plan-migration current-snapshot rows for the two documents' units.
   - **New rows.** 602 new rows against the baseline, 0 of them not staleness. Per aggregate:
     - 143 `artifact_hash_stale` in evidence and 143 in plan graph. That is 132 for the two documents and their 130 shards (47 Goal_Runtime_System, 85 storage-plan), plus `main`'s own 11 Decision Log rows;
     - 3 currentness drift rows (the two documents and `main`'s Decision Log);
     - 2 Spec Lock `stale_hash` rows (both documents);
     - 9 run-002 `stale_batch_report_sha256_after` rows (storage-plan rows 173 to 180, plus `main`'s Decision Log row 43);
     - 1 final-summary PlanUnit count row (`main`'s).
   - **Exports.** Since the exports repair, evidence and plan graph are keyed from their complete exports in both aggregates: 143 of 143 rows, all classed as staleness, with no fallback. The only subchecks not keyed are the unchanged `audit_closure` (201, no complete export) and `prd_planning_runtime_contracts` (1,240, baseline sample).
   - **Grown subchecks,** none truncated: audit-governance/evidence 0 -> 143; audit-governance/implementation_readiness 24 -> 27; audit-governance/plan_graph 0 -> 143; audit-governance/plan_migration 2 -> 12; audit-governance/spec_lock 0 -> 2; run-gates/validate_evidence 0 -> 143; run-gates/validate_implementation_readiness 24 -> 27; run-gates/validate_plan_graph 0 -> 143; run-gates/validate_plan_migration 2 -> 12; run-gates/verify_spec_lock 0 -> 2.
8. **Push.** A fetch just before the push found `origin/main` still at `8bc8986484`. At 01:18:19Z `main` `9507c8d2e8` was pushed to `origin` (GitHub and the NAS) and to `truenas-backup`. This record followed as a report-only fast-forward under the same lock, with a shard check.

## Classification

Exit 1. Every row is governance staleness on the two edited documents, or `main`'s own pending Decision Log staleness. None is a defect, and no row went unkeyed in evidence or plan graph.

## Reseal request (appended to the wave's list)

- **Spec Lock** entries for `Plans/Goal_Runtime_System.md` and `Plans/storage-plan.md`.
- **The certified-family pins, re-pinned at the reseal by the certified-family owner.** The cited passages are byte-unchanged.
  - The Goal_Runtime_System.md member of `Plans/goal_certified_family_composition.json` moves from `ccedade9...` to `f233eb9c...`.
  - The storage-plan.md member (`328858615b...`) was already stale on `main`.
  - Consumer source-citations C01 to C05 move by two lines.
- **Both bundles.**
  - The live plan-sharding evidence bundle `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json`: 132 rows, the two documents and their 130 shards.
  - The PNC-019 certification hash for `Plans/Goal_Runtime_System.md` (readiness row 8).
- **Currentness.** An edition that includes both documents. Until then `test_pm_pnc019_currentness` fails with their drift rows.
- **Readiness.** The implementation-readiness gate report, left to the reseal under the D-07 ruling.
- **Snapshot.** The run-002 `refresh-batch-hashes` for storage-plan rows 173 to 180 and the current plan-migration snapshot, at the nightly `snapshot-current`.

## Open questions carried forward

- **A-10 (review note).** Nothing executable checks `SP-214-A006` or the rewritten payload-minima rows: the goal runtime event fixture validator reads neither edited document.
- **The report reflects the old base.** Its "Checks" and "Expected at landing" sections were written against base `f1ce058ccd` (6,721 PlanUnits, 26,233 to 26,234 acceptance units) and before the exports repair, when a 132-row rise meant exit 2. This record gives the landing-time values.
- **The registry anchors themselves** still name the older sections. Moving them changes the registry hash and needs a checkpoint approval. It can ride with the next registry revision that needs one.

## Evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-08-certified-anchors-landing-20260925/`.

| File | SHA-256 |
|---|---|
| `landing.json` | `63d07c60ad64aca166e3288df5d08482422e4bd19368dd72b8dc362db2ecaa36` |
| `check-reports/run-gates.json` | `bdffa7b557cca8c375dbbe478d6e9a80854f940bcfbcb0597fbab22b16e124bd` |
| `check-reports/audit-governance.json` | `b0171af5ea6f24f77c5c1a4e2fd94ebe78ca02b86b45da035b0c132e58e2e5a8` |
| `check-reports/plan-migration-validate.json` | `1eb402a21c08dc802054ef1423f3e5a58c5d82649aef73700412cb512ad382e5` |
| `shared-shard-check.json` | `b8070a4e73ae546e6c7bb6814c469dd0d020724d62d5f13df27e79b6f067d55f` |
| `shared-status-before-ff.txt` | `c1d79a51e30e42d114095293c253ac35b97540a5b08a7c1d6513c1ed5a058856` |
| `shared-overlap.txt` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `branch-paths.txt` | `2b23034e0efee92bf9c43aa07819984332d31c75efbdcf4e21d5b4e6665f7171` |
| `branch-tip.txt` | `d52c28ffbe4165a98e5311a20a64d09897576827f14085cf62319184aaffc8d5` |
| `push.txt` | `4ea9570afb5188a024890075bed39514ae5c82a5ee03e25e4d6adafbc04396f7` |
| `worktree-shard-check.json` | `b8070a4e73ae546e6c7bb6814c469dd0d020724d62d5f13df27e79b6f067d55f` |
| `worktree-index-validate.json` | `533a2eb172a617245956e82f1b777c9b81ad91a23c85a1f2f2047326294c0018` |
| `worktree-goal-runtime-event-fixtures.json` | `1fab647542efb31add5f6e5776c9288f7756a9900ebcfba0d73c6514ed83bf11` |
| `worktree-test_pm_pnc019_currentness.log` | `bfd32891c0ad12e4c8326241d4838bf61b3a7cd54cfa9faea27cf86e0905ed0d` |
