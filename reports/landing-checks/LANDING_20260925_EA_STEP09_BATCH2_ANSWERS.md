# Landing record: Step 9 batch 2, Jared's card answers DL-084 to DL-093 applied to the orchestrator's 40 rows, 2026-09-25

Branch `plans/ea-step09-batch2-answers-20260925`: 21 commits, rebased at landing onto `main` `c98cccb257` and ending at `bf2a9e877b`. `main` was fast-forwarded from `c98cccb257` to `bf2a9e877b` at 07:02:43Z and pushed at 07:18:42Z, after the landing check. This record is a report-only commit on top, landed the same way. Before the rebase the branch was pushed at `822df95051`, on `1e5d9b097b`.

**What lands.** 60 paths.
- `Plans/Decision_Log.md`, both sections, and its regenerated shards and index: ten entries recording Jared's answers of 2026-09-25.
  - DL-084: subagent history is kept as long as its chat exists (19 `subagent.*` families).
  - DL-085: crew board messages leave the board after 24 hours and are kept with the coordination records, 180 days after the run finishes (3 `crew.board_*` families).
  - DL-086: `phase.force_completed`, `config.validation.failed` and `parser.error` are kept one year after the run finishes.
  - DL-087: the six older Crew lifecycle events are retired, recorded from Jared's words on a card he did not answer by option ("retire them but register the shared collaborative workflow events, so adding scope to this").
  - DL-088: `subagent.spawn_requested` and `subagent.spawn_completed` are retired.
  - DL-089: application-scoped `platform.capability_evaluated` checks count in an application-wide bucket of their own, with DL-083's numbers.
  - DL-090 to DL-092, the Card 4 addendum: all 17 collaborative workflow events of `Plans/Collaborative_Workflows.md` section 13 are to be registered, one family per landing, with a separate bounded technical-binding permission on DL-045's terms (DL-090, option 2); a new `collaboration.failed` joins them, making 18 names (DL-091); their history is kept as long as the chat exists (DL-092). They are new scope outside the 252.
  - DL-093: for the seven coordination registrations, each landing's own DL-078 Decision Log entry is Jared's DL-077 decision entry for that family ("4 i approve"). D-02 stays open for every other registration.
- 33 J248 rows under `Plans/.audits/event-authority-2026-08-12/individual-disposition/rows/` and both ledgers: 8 rows `RECLASSIFY_TO_EXCLUDED` as retired (6 crew lifecycle under DL-087, 2 spawn under DL-088); 25 rows back to technical work with retention decided, their retention cells FAIL until the Storage owner binding lands (host ruling, citing the DL entry). The 7 coordination rows are untouched.
- Reports: the frozen card copies (byte-identical to what Jared answered), 9 response rows, the application record and note, the procedure record's count row and open questions, and the batch report `reports/event-authority-20260911/step-09-batch2-20260925.md`.
- PlanUnits go from 6,728 to 6,738 and acceptance units from 26,260 to 26,291. No registry row, validator, checkpoint constant, family admission or governance artifact changes. DL-040, DL-046, DL-077 and DL-078 are byte-unchanged.

**Step 9 count after this landing, of 252:** registered 0, excluded 15, carded 0, remaining 237. The 7 coordination rows are being prepared on `plans/ea-s09-coordination-prep-20260925`.

**Authority, review and go.**
- **Answers.** Jared's own, pasted into this session: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/` (`ANSWERS_STEP09_BATCH2.md` `e224ff62...`, `ANSWERS_CARD4_ADDENDUM.md` `b09b2afd...`, `ANSWERS_OPEN_QUESTIONS.md` `678b9a32...`), answering the frozen cards in `step-09-batch2-cards-presented-20260925/` (artifact `2rbEp1n7rdS3KnEwZCVpvz`) and `step-09-batch2-card4-addendum-presented-20260925/` (artifact `QaLQRPQHwhsqQnNeRQ6g1z`). The hashes Jared saw equal the hashes pinned.
- **Review.** One blind form-driven review in two cycles, in `/mnt/Cursor/PM-Experiments/review-ea-step09-batch2-answers-20260925/`. Cycle 1 raised B2-01 (blocking, confirmed by a refuter: DL-093 widened question 4 to every Step 9 registration), 3 should-fix items and 4 notes. The repair round applied one commit per finding in the reviewer's words; B2-01 was narrowed to the seven coordination families. Cycle 2 (`RECHECK.md`), limited to the affected rows, found the branch landing-ready with one note, R3-01, applied.
- **Go.** This session, the program's host, after cycle 2.

**Landing lock.** Taken at 06:55:20Z, when it was free, and held through the rebase, the fast-forward, both shard checks, the landing check, the push, this record and the cleanup.

## Procedure

1. **Rebase.** `origin/main` had gained the Step 8(c) second half (`bfa4c8a415`, record `c98cccb257`). Only `Plans/.plan_index` conflicted, at 6 stops; each time `main`'s files were taken and the shards and index regenerated with the currentness edition symlinked, never hand-merged. The passages this branch cites were re-read: `main`'s storage-plan changes keep line counts below line 19868, and the storage value registry's retention policy lines precede the changed row, so every citation reads as reviewed.
2. **Checks in the worktree** at `bf2a9e877b`: regeneration reproduces every committed derived file apart from timestamps; shard check pass (99 documents, 2,722 shards); `pm-plan-index.py validate` pass (6,738 PlanUnits, 26,291 acceptance units); `test_event_authority_holding_bucket` 34 OK; `test_pm_emit_only_event_boundaries` 13 OK; `test_pm_pnc019_currentness` fails only with drift rows for `Plans/Decision_Log.md` and `main`'s Goal Runtime, Section 15, storage-plan and storage value registry rows.
3. **Overlap check in the shared checkout.** On `main` at `c98cccb257` with the same 43 unrelated uncommitted paths. A path-limited status over the 60 branch paths and `reports/landing-checks` was empty.
4. **Fast-forward and shard check.** `main` went to `bf2a9e877b` at 07:02:43Z; the shared shard check passed, byte-identical to the worktree's.
5. **Landing check:** `python3 scripts/pm-landing-check.py --base origin/main --json --keep-check-reports <evidence>/check-reports`, from 07:03:08Z to 07:18:24Z. It exits **1** with **0 blocking items**; stderr is empty.
   - **Baseline.** Current (`792d2fb8b1`, 0.38 days), so rule 2 applies.
   - **Totals.** `run-gates` 1,470 -> 2,950, `audit-governance` 1,470 -> 2,950, `plan-migration-validate` 33,072: equal to `main`'s totals at `c98cccb257`. This branch adds no row; its Decision Log staleness was already on `main` from the DL-077 to DL-083 landings.
   - **Branch.** 60 paths and 90 units. 341 rows name the branch, all staleness: 330 plan-migration current-snapshot rows for the Decision Log's units, and per aggregate one evidence and one plan-graph `artifact_hash_stale` row, one currentness drift row and one run-002 row 43.
   - **New rows.** The same 2,960 rows `main` carries against the baseline, all staleness except the 4 `missing_ref` rows for `Plans/_shards/storage_value_registry/551-lines-110001-110108.md`, which the Step 8(c) second half caused and recorded; the reseal clears them. None is this branch's.
   - No subcheck timed out; `audit_closure` and `prd_planning_runtime_contracts` are compared by total only and unchanged.
6. **Push.** A fetch just before the push found `origin/main` still at `c98cccb257`. At 07:18:42Z `main` `bf2a9e877b` was pushed to `origin` (GitHub and the NAS) and `truenas-backup`.

## Classification

Exit 1. Every row naming the branch is governance staleness on `Plans/Decision_Log.md`. No defect.

## Reseal request (appended to the wave's list)

- **Plan-sharding bundle:** `Plans/Decision_Log.md` and its 10 shards (already on the list; the hashes move again).
- **Currentness:** an edition covering `Plans/Decision_Log.md`.
- **Run-002:** batch report row 43 and the final summary's PlanUnit count (now 6,738).
- **Readiness:** the implementation-readiness gate report. **Snapshot:** the nightly `snapshot-current`.
- `Plans/Decision_Log.md` has no Spec Lock entry.

## Owner follow-ups and open questions carried forward

- **Storage retention edit (one branch):** DL-083's and DL-089's application-wide buckets in SP-291; the Case L-3 bindings for DL-084, DL-085, DL-086 and DL-092 (DL-084 and DL-092 after Storage's reuse check between the thread-lifetime policy and the Chat content class). Until it lands the 25 retention cells stay FAIL. The v2-current review's R2-01 wording note rides on it.
- **Contracts retirement edits:** the six crew lifecycle rows, CV-270 narrowed and CV-271 retired (DL-087); the spawn pair in CV-116, CV-266 and the lifecycle text, and the Run Modes clarifying line (DL-088).
- **The collaborative workflow batch:** 18 families under DL-090 to DL-092, outside the 252, worked as their own batch; the collaborative run, message, proposal and finding records still need their own schemas.
- **The Step 8 assessment's `platform.capability_evaluated` row** changes only at the next regrade; the assessment is pinned by admission records.
- **D-02 for every other registration** (the 18 collaborative families and later ones) is open; the question has been put to Jared.
- **Procedure record open question 8 (B2-06):** the 8 exclusions rest on Decision Log answers while their Contracts edits are pending.

## Evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-09-batch2-answers-landing-20260925/`. The branch's own checks are in `step-09-batch2-answers-checks-final-20260925/` and `step-09-batch2-answers-repair-20260925/` (SHA256SUMS `9297a4f8...`).

| File | SHA-256 |
|---|---|
| `landing.json` | `bf599d65ff53b5b532b59cf3f93b0c301809c55047ad573f0c90952588573c5e` |
| `check-reports/run-gates.json` | `b0d977431390c2bb3491aa132d93ab4207292e161a433d22629e5fcb92d37068` |
| `check-reports/audit-governance.json` | `cb69142fd762b36836277f9b47d5d01f0067df627176575641f69ab99721df73` |
| `check-reports/plan-migration-validate.json` | `72c8a12559da2c0d2af5b3dec479778537bfab11fc00694d6852572a10133dee` |
| `shared-shard-check.json` (identical to the worktree's) | `ec0a2703d35a202a810d34df7f418a43fb2e1826f7e493a28d66058bbcd54bb0` |
| `shared-status-before-ff.txt` (the 43 uncommitted paths) | `c1d79a51e30e42d114095293c253ac35b97540a5b08a7c1d6513c1ed5a058856` |
| `shared-overlap.txt` (empty) | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `branch-paths.txt` | `63950c9dfa52cdedef0319f5979729928c578d9033702d0d33f5db0f9d36a850` |
| `push.txt` | `84e719b22b262a689895fda0eee1c02d87ece06e7750a7c3e501eb63d42e5247` |
| `worktree-index-validate.json` | `48f4f9a83220dfc278c6ac4da588a6b8ce5ca7a1a48f83b00bf03080ba5913b2` |
| `worktree-test_event_authority_holding_bucket.log` | `7ceb48c0d4292d34b3d18da86175e7bcef126afd51d1beeacaef9c0eeb6f2120` |
| `worktree-test_pm_emit_only_event_boundaries.log` | `e7c75fc845c82335825685d7bfa02401706ca7e5ad37b1dcd69db6e9882bb03b` |
| `worktree-test_pm_pnc019_currentness.log` | `ee96737da5ca4012cfdd0e5abc269d00b0536519d964ee04158695420c8ec8f4` |

Cost: map verification about 0.76M subagent tokens; cards, addendum and their checks about 1.3M; recording, review cycle 1, repair and cycle 2 about 2.0M; the host about 2 agent-hours across the batch; the landing check 15 minutes.
