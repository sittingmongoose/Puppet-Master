# Landing record: Step 8(a) depth assessment, its review fixes, and DL-079 to DL-083, 2026-09-24

Branch `plans/ea-step08-depth42-20260924`: 26 commits on `main` `ac9c0ad2e4`, ending at `3ce6eb882c`. The branch was already on the current `main`, so no rebase was needed at landing. `main` was fast-forwarded from `ac9c0ad2e4` to `3ce6eb882c` at 23:24:12Z and pushed at 23:40:05Z, after the landing check. This record is a report-only commit on top, landed the same way.

**What lands.** 26 paths.
- **The Step 8(a) assessment.** `step-08-depth42-assessment-20260924.{json,md}` grades the 42 registered families, with its SHA-256 `ba9b84f99e0e0761a8b435a16602d4c88d14589ef273f789fd5b92bdbd5849fd`.
- **The cards and the answers.** The five product cards `step-08-depth42-product-cards-20260924.md` are restored to the presented bytes `193f481d...`. DL-079 to DL-083 record Jared's answers in both Decision Log sections, with five `decision-responses.jsonl` rows. Their application record is `step-08-depth42-card-answers-20260924.{md,json}`.
- **The DL-078 clarification.** It carries the coordinator's ruling on D-07. The Step 9 procedure record gains that ruling, batch 1's landing and open question 7.
- **Other reports.** The progress file and the previous session's handover note.
- **Derived files.** The regenerated `decision_log` shards and `Plans/.plan_index`.

PlanUnits go from 6,723 to 6,728 and acceptance units from 26,241 to 26,257. No registry row, validator, checkpoint constant, family admission or governance artifact changes.

**Decision Log numbers.** At the landing fetch, `main`'s Decision Log ended at DL-078. No other remote branch carries DL-079 to DL-083, so the numbers stand.

**Authority and review.**
- **8(a).** The coordinator relayed Jared's authorization for Steps 8 and 9.
- **The answers.** They are Jared's, from 2026-09-24: `ANSWERS_DEPTH_GRADING.md`, SHA-256 `cfea2eb818663d22eba69dca9296657aa05c51383a470bc1796b87aef65b923c`.
- **The DL-078 clarification.** It is the coordinator's ruling.
- **Review.** One blind form-driven review ran in two cycles plus a DL-066 repair round, all in `/home/sittingmongoose/PM-Experiments/review-depth42-20260924/`:
  - cycle 1 raised G-01 to G-08;
  - cycle 2 found C-1, the scope of DL-083;
  - the repair round was re-checked on the affected rows only.

  It ended landing-ready.
- **Go.** The coordinator gave the landing go at `3ce6eb882c`.

**Landing lock.** It was taken at 23:22:37Z, when it was free, and held through the fast-forward, both shard checks, the landing check, the push, this record and the cleanup.

## Procedure
1. **No rebase needed.** At the landing fetch `origin/main` was `ac9c0ad2e4`, already the branch's base. The derived files were regenerated before the repair round's commits with the ignored currentness edition symlinked read-only, never hand-merged.
2. **Checks in the worktree** at `3ce6eb882c`:
   - shard check: pass, 99 documents, 2,722 shards;
   - `pm-plan-index.py validate`: pass, 0 failures;
   - `test_event_authority_holding_bucket` and `test_pm_emit_only_event_boundaries`: OK;
   - `test_pm_pnc019_currentness`: 1 failure, the `Plans/Decision_Log.md` currentness drift row `main` has carried since `8650c2f9e8`.

   Both evidence bundles verify: the assessment's `SHA256SUMS` `d3bb2f55...` (106 files) and the answers' `6c75b0a8...` (34 files).
3. **Overlap check in the shared checkout.** It was on `main` at `ac9c0ad2e4`, equal to `origin/main`, with the same 43 unrelated uncommitted paths as the last two landings. A path-limited status over the 26 branch paths and `reports/landing-checks` was empty.
4. **Fast-forward, shard check and index check.** `main` went from `ac9c0ad2e4` to `3ce6eb882c` at 23:24:12Z. The shared shard check passed and is byte-identical to the worktree's, and `pm-plan-index.py validate` passed with the edition present.
5. **Landing check:** `python3 scripts/pm-landing-check.py --base origin/main --json --keep-check-reports <evidence>/check-reports`, 23:25:14Z to 23:39:45Z: exit **1**, **0 blocking items**; stderr empty. The baseline is current (its commit 792d2fb8b12f is an ancestor of the base origin/main (ac9c0ad2e4be) and 0.08 days older than it, within 7), so rule 2 applies.
   - Totals: `run-gates` 1,470 -> 1,495, `audit-governance` 1,470 -> 1,495, `plan-migration-validate` 33,072 -> 33,072.
   - Branch: 26 paths, 80 units of `Plans/Decision_Log.md`; `Plans/_shards` and `Plans/.plan_index` matched on those units.
   - 50 new rows against the baseline, 0 of them not staleness; by subcheck and kind (both aggregates):
     - 11 `artifact_hash_stale` in evidence
     - 1 `event_authority_currentness_source_drift` in implementation_readiness
     - 11 `artifact_hash_stale` in plan_graph
     - 1 `complete_final_summary_live_plan_unit_count_stale` in plan_migration
     - 1 `stale_batch_report_sha256_after` in plan_migration
     - 11 `artifact_hash_stale` in validate_evidence
     - 1 `event_authority_currentness_source_drift` in validate_implementation_readiness
     - 11 `artifact_hash_stale` in validate_plan_graph
     - 1 `complete_final_summary_live_plan_unit_count_stale` in validate_plan_migration
     - 1 `stale_batch_report_sha256_after` in validate_plan_migration
   - Grown subchecks, none truncated and all staleness: audit-governance/evidence 0 -> 11; audit-governance/implementation_readiness 24 -> 25; audit-governance/plan_graph 0 -> 11; audit-governance/plan_migration 2 -> 4; run-gates/validate_evidence 0 -> 11; run-gates/validate_implementation_readiness 24 -> 25; run-gates/validate_plan_graph 0 -> 11; run-gates/validate_plan_migration 2 -> 4.
   - 341 rows name the branch, 0 of them not staleness; no pre-existing, grown-bucket, resolved or infrastructure rows.
6. **Push.** A fetch just before the push found `origin/main` still at `ac9c0ad2e4`. At 23:40:05Z `main` `3ce6eb882c` was pushed to `origin` (GitHub and the NAS) and to `truenas-backup`, already up to date through `origin`'s NAS push URL. This record followed as a report-only fast-forward under the same lock, with a shard check.

## Classification
Exit 1, and every reported row is governance staleness on `Plans/Decision_Log.md` or on what its new units change (the same kinds the DL-077/DL-078 landing reported, keyed under the print cap). Under the rules that does not stop the landing.

## Reseal request (appended to the wave's list)
This landing adds to the wave's reseal request; the designated Plans agent does one reseal after the anchors, this branch and the validator amendment are on `main`:
- `Plans/Decision_Log.md` and its 10 shards in the live plan-sharding evidence bundle (the same 11 rows DL-077/DL-078 made stale; this landing moves their hashes again);
- the currentness edition, which must include `Plans/Decision_Log.md` (until then `test_pm_pnc019_currentness` keeps failing with its one drift row, as on `main` since `8650c2f9e8`);
- the run-002 `refresh-batch-hashes` and `refresh-final-summary` pair: the Decision Log batch-report row and the final summary's live PlanUnit count, now 6,728;
- the implementation-readiness gate report, left to the reseal under the D-07 ruling;
- the plan-migration snapshot, at the nightly `snapshot-current`.
`Plans/Decision_Log.md` has no Spec Lock entry.

## Open questions carried forward
- **Application record wording (review repair round, non-blocking note).** `step-08-depth42-card-answers-20260924.md` line 40 still says "Review G-01 later lowered its retention cell to PARTIAL for the application-scoped count that card 4 covers, so the assessment shows 10 of 12." Card 4, as presented and restored, does not cover Platform's count; the paragraph says so a sentence earlier. The reviewer's suggested wording: "... for its application-scoped count, which sits on the same seam as card 4's three Storage families but was not on the card ...". Report text only; no canon or grade effect.
- **Progress file (FYI from the re-check).** The progress file still says the admission records "must pin the final depth42 JSON, which is `ff7dbd59...` for now". The current JSON is `ba9b84f9...`, and the validator-amendment records pin it (`5cd53e7bc2`). The next progress update corrects it.
- **DL-083 for Platform.** The application-scoped evaluations of `platform.capability_evaluated` sit on the same seam but were not on the card Jared answered; the coordinator is asking Jared. If he answers, it is recorded as an addendum by the same procedure.
- **DL-078's clarified canonical_text wording** (procedure record open question 7) and the procedure record's open questions D-05, D-02, D-08 and D-12.
- **Card freeze rule (coordinator, 2026-09-24).** A card file is frozen at the bytes Jared sees, its hash is recorded at presentation, and any later change to what a card covers is a new card or an addendum he answers, never an edit to the presented file.

## Evidence
Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-08-depth42-landing-20260924/`.

| File | SHA-256 |
|---|---|
| `landing.json` | `a1c37d56a7fc920610b37bec2b8453242d5944b66ea8a9e145a049cb70839227` |
| `check-reports/run-gates.json` | `d8839be9c198dfdf18716ecea4bc70710751e97e0b71fee24b45ba995d8a68b1` |
| `check-reports/audit-governance.json` | `e29efbf0a83b7519ccd56387e09ab5130dfdb210c425bfcba1a70e59f154e2b0` |
| `check-reports/plan-migration-validate.json` | `71d7d2e0c4280ca09e201ec74ba5a9a99a0c2b4369050d0394870fbb641de0ff` |
| `shared-shard-check.json` | `b8070a4e73ae546e6c7bb6814c469dd0d020724d62d5f13df27e79b6f067d55f` |
| `shared-index-validate.json` | `26eb2e4e1a8729d13298659ef34bf0c5c6207d970d5bbe181e123291851d2a42` |
| `shared-status-before-ff.txt` | `c1d79a51e30e42d114095293c253ac35b97540a5b08a7c1d6513c1ed5a058856` |
| `shared-overlap.txt` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `branch-paths.txt` | `c41e0c4319f4803d9f85882ec9d7b77acd85212130e73fa63569b8754b462ba3` |
| `push.txt` | `2e707379004d3d277d41d9d667807ecde64b003777ee1bcca14c960283c54180` |
| `worktree-test_pm_pnc019_currentness.log` | `256e8f056f8415389542ba5ff12c12015d90c8eb1af9c4596865c5999bf51c6d` |
| `worktree-test_event_authority_holding_bucket.log` | `ab23361f44f447586f650d37d725c0be6c42092fd5b77977f0d1f4f326dcd16f` |
| `worktree-test_pm_emit_only_event_boundaries.log` | `8efb7329cb1430be6a18c59e4c34ab7cae061acda15f0a5e827b138997a68c2a` |

The assessment's own evidence is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-08-depth42-20260924/` (`SHA256SUMS` `d3bb2f551c5cc8fe6e9c7a8ab8f832e49be4a71a4661927fb87786fedabb9f8d`), and the answers' is `.../step-08-depth42-card-answers-20260924/` (`SHA256SUMS` `6c75b0a84efb2e96c8de5f8e1b7d719166dc376ed14f82214ca80299e88880d7`).
