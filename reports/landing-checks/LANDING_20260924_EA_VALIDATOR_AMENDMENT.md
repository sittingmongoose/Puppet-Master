# Landing record: DL-077's receipted amendment to the independent seal check, with the three admission records, 2026-09-25

Branch `plans/ea-validator-post-august-20260924`: 16 commits, rebased at landing onto `main` `2cdd280768` and ending at `2b73d6b7c0`. `main` was fast-forwarded from `2cdd280768` to `2b73d6b7c0` at 00:07:17Z and pushed at 00:24:37Z, after the landing check. Two report-only commits sit on top and landed the same way: this record, and an update of the progress file and the Step 8 plan document that records the withdrawal of the compaction PM7 validator branch.

**Lander.** The receipt pins `lander_task` to this agent task, `claude-opus-5.5:dl039-steps-8-9-20260924`, so this task landed the branch, as review finding V-07 requires. DL-077 bars this task from applying the seal. The seal is not applied here.

**What lands.** Nine paths:
- **The seal check.** `Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py` goes from `bd54afff...` (the Step 3 bytes) to `190a86f23e06362bdb98e27eb23268c9691db46cc41bc9f97e1fbb6bde1abc20`, with CRLF kept on all 1,754 lines.
- **The spec and schema documents.** A DL-077 section in `INDEPENDENT_EA_VALIDATOR_SPEC.md` and a note in `INDIVIDUAL_DISPOSITION_SCHEMA.md`, the same documents Step 3 updated.
- **The receipt.** `reports/event-authority-20260911/step-10-post-august-admission-receipt.json`, `dceb7f21436cbe126c23822e62caa1b6dedcb45fefae3005c1804576ca34d827`. It binds the live DL-077 section, the Step 3 pin, the final validator bytes, the record contract and the barred task.
- **The three admission records** in `reports/event-authority-20260911/admission-records/`. They pin assessment `ba9b84f99e0e0761a8b435a16602d4c88d14589ef273f789fd5b92bdbd5849fd` and the receipt. They fail closed on their non-passing criteria:
  - compaction: oracles;
  - reset: producer;
  - created: producer, consumers and oracles.
- **The test file.** `tests/test_event_authority_holding_bucket.py`, with 34 tests.
- **The report.** `reports/event-authority-20260911/step-10-post-august-amendment-20260924.md`.

No sharded Plans document, shard, index, registry row, ledger, cohort pin, freeze digest, closure hash or historical validator receipt changes.

**Authority and review.**
- **Authority.** DL-077: Jared, 2026-09-24, card `EA-S10-VALIDATOR-LIVE-SET-001` item 1, option A. It is the second and last receipted change after DL-039's holding bucket.
- **Review.** A blind review ran in two cycles, in `/home/sittingmongoose/PM-Experiments/review-ea-validator-amendment-20260924/`. Cycle 1 raised V-01 to V-11, with 2 blocking. Each was repaired in its own commit or accepted on the coordinator's rulings (V-07, V-08, V-10). Cycle 2 found the branch landing-ready.
- **Go.** The coordinator gave the landing go at `c3d5193d98`. `2b73d6b7c0` is the same content rebased onto `2cdd280768`.

**Landing lock.** It was taken at 00:06:09Z, when it was free, after the plan landing released it. It was held through the rebase, the fast-forward, the shard check, the landing check, the push, this record and the cleanup.

## Procedure

1. **Rebase.** At the landing fetch `origin/main` was `2cdd280768`, which carries the depth42 assessment (`3ce6eb882c`) and the plan document. The rebase from `38b8c1301d` was clean.
2. **Pins confirmed before the push** (`pins.txt`):
   - the validator is `190a86f2...`, with CRLF on all 1,754 lines;
   - the receipt is `dceb7f21...`;
   - the assessment is `ba9b84f9...` on both the branch and `main`;
   - all three records pin that receipt and that assessment.
   - `pins-after-push.txt` repeats these checks on the pushed `main` `2b73d6b7c0`, with the same results.
3. **Checks in the worktree** at `2b73d6b7c0`:
   - `test_event_authority_holding_bucket`: 34 tests, OK;
   - `test_pm_emit_only_event_boundaries`: OK;
   - `test_pm_pnc019_currentness`: one failure, the `Plans/Decision_Log.md` currentness drift that `main` has carried since `8650c2f9e8`;
   - the harness: 6 failures, with the three `depth_incomplete` issues and nothing else new.
4. **Overlap check in the shared checkout.** `main` was at `2cdd280768`, equal to `origin/main`, with the same 43 unrelated uncommitted paths. A path-limited status over the 9 branch paths and `reports/landing-checks` was empty.
5. **Fast-forward and shard check.** `main` went from `2cdd280768` to `2b73d6b7c0` at 00:07:17Z, and the shard check passed.
6. **Landing check:** `python3 scripts/pm-landing-check.py --base origin/main --json --keep-check-reports <evidence>/check-reports`, from 00:07:49Z to 00:23:23Z. It exits **1** with **0 blocking items**; stderr is empty.
   - Baseline: its commit 792d2fb8b12f is an ancestor of the base origin/main (2cdd28076826) and 0.14 days older than it, within 7.
   - Totals: `run-gates` 1,470 -> 1,495, `audit-governance` 1,470 -> 1,495, `plan-migration-validate` 33,072 -> 33,072.
   - Branch: 9 paths and 0 units. 0 rows name a branch file.
   - 50 new rows against the baseline, 0 of them not staleness: 11 `artifact_hash_stale` (evidence); 1 `event_authority_currentness_source_drift` (implementation_readiness); 11 `artifact_hash_stale` (plan_graph); 1 `complete_final_summary_live_plan_unit_count_stale` (plan_migration); 1 `stale_batch_report_sha256_after` (plan_migration); 11 `artifact_hash_stale` (validate_evidence); 1 `event_authority_currentness_source_drift` (validate_implementation_readiness); 11 `artifact_hash_stale` (validate_plan_graph); 1 `complete_final_summary_live_plan_unit_count_stale` (validate_plan_migration); 1 `stale_batch_report_sha256_after` (validate_plan_migration).
   - Pre-existing: 0. Grown buckets: 0. Resolved: 0. Infrastructure: 0.
   - Grown subchecks, none truncated and all staleness: audit-governance/evidence 0 -> 11; audit-governance/implementation_readiness 24 -> 25; audit-governance/plan_graph 0 -> 11; audit-governance/plan_migration 2 -> 4; run-gates/validate_evidence 0 -> 11; run-gates/validate_implementation_readiness 24 -> 25; run-gates/validate_plan_graph 0 -> 11; run-gates/validate_plan_migration 2 -> 4.
7. **Push.** A fetch just before the push found `origin/main` still at `2cdd280768`. At 00:24:37Z `main` `2b73d6b7c0` was pushed to `origin` (GitHub and the NAS) and to `truenas-backup`. This record and the progress commit followed as a report-only fast-forward under the same lock, with a shard check.

## Classification

Exit 1, and none of it is this branch's: the new rows are `main`'s own pending Decision Log staleness, the same rows the depth42 and plan landings reported. No row names a branch file.

## Reseal request

None from this branch. It edits no sharded Plans document, no Spec Lock-covered file and no governance bundle row.

## Open questions carried forward

- **`.gitignore` line (V-09).** `tests/test_event_authority_holding_bucket.py` is tracked but has no line of its own in `.gitignore`. The coordinator is asking Jared for `!/tests/test_event_authority_holding_bucket.py`, and `.gitignore` is not edited here.
- **Three mutation survivors (review cycle 2).** No test fails when these three mutations are applied: M9 (the `depth_blocking` entry), M16 (the `..` path check) and M17 (the redundant DL-077 token check). They are recorded as low-value, and no fix is planned.
- **The pin rule after landing (V-07).** Any later change to one of these re-pins the affected records in the same landing, or the check fails closed:
  - a pinned registry row;
  - the DL-040, DL-046 or DL-077 prose section;
  - the depth assessment bytes;
  - the receipt.

  Every Step 9 registration landing under DL-078 adds its family's record in the same landing.
- **The currentness rule (V-10).** A record's assessment row is current when its `family_id` and `family_revision` equal the live registry row. Whole-assessment equality is not required.

## Evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-10-post-august-amendment-landing-20260925/`.

| File | SHA-256 |
|---|---|
| `landing.json` | `c575a1a3b2d8c1edea1b19c3c1c0116406a54a9ae330459afdfbcb20304a5624` |
| `check-reports/run-gates.json` | `2ffeef2c234a934bf854589e034cbbc1293a3130be1cb44feca09876b1a2a059` |
| `check-reports/audit-governance.json` | `1482f3ba083671198dc69259d3131d99225f5f481e9d2c1ded42d4bc83b18726` |
| `check-reports/plan-migration-validate.json` | `71d7d2e0c4280ca09e201ec74ba5a9a99a0c2b4369050d0394870fbb641de0ff` |
| `shared-shard-check.json` | `b8070a4e73ae546e6c7bb6814c469dd0d020724d62d5f13df27e79b6f067d55f` |
| `shared-status-before-ff.txt` | `c1d79a51e30e42d114095293c253ac35b97540a5b08a7c1d6513c1ed5a058856` |
| `shared-overlap.txt` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `branch-paths.txt` | `7dc46b106550554d647197deaed4d64cd9624d55772ceab7f48d18d3a1530667` |
| `pins.txt` | `8d18d247e15ee8d51cf2efa42e2ce6efe0d88a7bfebb954d62eae674f81dc1b3` |
| `pins-after-push.txt` | `46b2cf2a56fa7d7a214ae3b5313d782434db2c374387522dbdc665f1c9f98712` |
| `harness-live.json` | `c5e6e051b2618c01823dbdc5e58c914d71b0728993834de5c77e465581d09c50` |
| `push.txt` | `15dc32ce2113a46624ca147d6369596bd3d544a92ca38c48bf9f0425d721e22c` |
| `worktree-test_event_authority_holding_bucket.log` | `cef4a75acf0b1a504e332a76907d67b7e25ba1e8d57748837d45afde961d80df` |
| `worktree-test_pm_emit_only_event_boundaries.log` | `ba4d80eae12fd242461b84a47b0e76817baca78100f646063b5cc66c57c308ab` |
| `worktree-test_pm_pnc019_currentness.log` | `90e367cccda72553131f129755ed3e432924fd7ae76374b448ce43ff00aae9b3` |

The amendment's own evidence is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-10-post-august-amendment-20260924/`. Its top-level `SHA256SUMS` is `2cbfed75...`, and the repair round's subdirectory `cycle2-20260924T2343Z/` has its own `SHA256SUMS`, `41adfb43...`, over 25 files.
