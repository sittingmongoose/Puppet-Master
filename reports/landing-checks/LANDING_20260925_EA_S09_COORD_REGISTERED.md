# Landing record: the first Step 9 registration, `coordination.agent_registered`, 2026-09-25

Branch `plans/ea-s09-coord-registered-20260925`: 17 commits on `main` `63cf2cb97f`, ending at `abdf4eead`. `main` was fast-forwarded from `63cf2cb97f` to `abdf4eead` at 14:41:28Z and pushed at 15:01:33Z, after the landing check. This record, with the updated progress file, is a report-only commit on top, landed the same way.

**What lands.** 797 paths: 27 authored files and their regenerated shards and index.
- **The admission.** `coordination.agent_registered` is appended to `Plans/event_family_registry.json`, byte for byte as prepared in `Plans/coordination_event_admission.json` (row SHA-256 `1602bb6d...3b40` by the DL-077 recipe). The registry moves from `2026-09-11.2` (42 families, `0be544181eda...c842`) to `2026-09-25.1` (43 families, `4227be36806615cabc8a36c0a8a6555a24b6b6c38e960e07bd12354c3c373e70`). The ledger row is `admitted_static_contract`; the other six coordination rows stay `prepared_not_admitted`.
- **The checkpoint, under DL-078.** `EVENT_FAMILY_REGISTRY_REVISION` and `EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT` in `scripts/pm_pnc019_currentness.py` move to `2026-09-25.1` and 43 with their provenance comment; the pins in `tests/test_pm_testing_session_events.py` and `tests/test_pm_github_project_integration.py` move to 43.
- **DL-094**, both Decision Log sections: it names the family, the revision, count and SHA-256, cites DL-078, DL-045 and DL-093 (Jared's decision entry for this family), and admits only this family. Its prose section SHA-256 is `e8e2404f...587f`.
- **The DL-077 admission record** `reports/event-authority-20260911/admission-records/coordination.agent_registered.json`, pinning the receipt `dceb7f21...`, the registry before and after, the row and the depth file.
- **The depth file** `reports/event-authority-20260911/step-09-depth-coordination.agent_registered.json` (SHA-256 `54346d8b...509c`), byte-identical to an independent grader's output: all twelve criteria PASS at the appended tip. A first independent grade gave 10 of 12 (membership, which passes only after the append, and oracles); the oracle gaps were fixed for all seven coordination families before the re-grade.
- **Canon fixes carried by this branch:** the coordination prep's cycle-2 residuals R4-01 (the `platform` identifier admits hyphens), R4-02 (the Browser gate pins each event type's family ID), R4-03 (SP-320's path recipe) and R4-04 (readiness pins the key shapes); SP-320's repeat-registration precedence stated to match its transition table; per-family EventRecord join cases for all seven families and both repeat-registration sequences in the fixtures, the checker and ATS-058.
- **The J248 row** for the family in form R (host ruling R6): every field the frozen schema or the seal check reads is kept; the rationale, the census notes and `evidence_refs` cite the admission record; application record `reports/event-authority-20260911/step-09-coord-registered-application-20260925.json`.
- **Counts.** Step 9: registered 1, excluded 15, carded 0, remaining 236. PlanUnits 6,743; acceptance units 26,325.

**Authority, review and go.**
- **Authority.** DL-078's standing rule; DL-045 for the bindings; DL-093 (Jared, 2026-09-25) makes this landing's DL-094 his decision entry for the family. The contracts landed at `4a2135b940` after their own two-cycle blind review (`/mnt/Cursor/PM-Experiments/review-ea-s09-coordination-prep-20260925/RECHECK.md`, SHA-256 `4aea2b6a...`).
- **Review.** One blind form-driven review, cycle 1, at extra care, in `/mnt/Cursor/PM-Experiments/review-ea-s09-coord-registered-20260925/` (`REVIEW.md` SHA-256 `6c7585ccf1fffd9a996ca432f162d2e2978170725eac29e68f31d2efdd10ab83`): landing-ready, no blocking or should-fix finding, four notes CR-01 to CR-04, applied one commit each in the reviewer's words (the result is byte-identical to the reviewer's tested patch). The reviewer ran the frozen seal check on scratch copies: at the tip `admission_record_problems` is empty, `post_august_admitted` is `[coordination.agent_registered]`, and every other failure is byte-identical to base.
- **Go.** This session, the program's host.

**Landing lock.** Taken at 14:37:52Z, when it was free, and held through the fast-forward, both shard checks, the landing check, the push, this record and the cleanup.

## Procedure

1. **Rebase.** Not needed: `origin/main` was still `63cf2cb97f`. The registry revision `2026-09-25.1` was confirmed free and the UTC date unchanged at the landing fetch.
2. **Checks in the worktree** at `abdf4eead`: shard check pass; `pm-plan-index.py validate` pass (6,743 PlanUnits, 26,325 acceptance units); the checker passes; coordination 50, holding bucket 34, testing session 11, GitHub project 15 and Browser admission 38 tests OK; `test_pm_pnc019_currentness` fails only on currentness drift rows.
3. **Overlap check in the shared checkout.** On `main` at `63cf2cb97f` with the same 43 unrelated uncommitted paths; a path-limited status over the 797 branch paths and `reports/landing-checks` was empty.
4. **Fast-forward and shard check.** `main` went to `abdf4eead` at 14:41:28Z; the shared shard check passed, byte-identical to the worktree's.
5. **Landing check:** `python3 scripts/pm-landing-check.py --base origin/main --json --keep-check-reports <evidence>/check-reports`, from 14:42:00Z to 15:01:10Z. It exits **1** with **0 blocking items**; stderr is empty.
   - **Baseline.** Current (`792d2fb8b1`, 0.57 days), so rule 2 applies.
   - **Totals.** `run-gates` and `audit-governance` 3,227 -> 3,230 (+3 each), `plan-migration-validate` 33,909 unchanged: the review's forecast. The three new rows per aggregate are the Spec Lock `stale_hash` on `scripts/pm_pnc019_currentness.py`, the readiness `event_authority_currentness_source_drift` on `Plans/event_family_registry.json`, and `event_authority_currentness_live_registry_drift`, a new row that names no path (the live registry differs from the currentness edition's recorded status); it is staleness the next currentness edition clears, and it does not stop the landing.
   - **Branch.** 797 paths and 814 units. Every row naming the branch is staleness except `event_denominator_unresolved` and `event_family_contract_depth_unresolved` on the registry (2 each, as in the baseline) and the self-test row (1, as in the baseline): pre-existing under rule 2.
   - **New rows** against the baseline that are not staleness: the 4 `missing_ref` rows of the Step 8(c) second half's shard rename (on `main` since `bfa4c8a415`) and the live-registry drift row above.
   - No subcheck timed out; nothing truncated.
6. **Push.** A fetch just before the push found `origin/main` still at `63cf2cb97f`. At 15:01:33Z `main` `abdf4eead` was pushed to `origin` (GitHub and the NAS) and `truenas-backup`.

## Classification

Exit 1. Every new row is governance staleness caused by the admission (the checkpoint script's Spec Lock hash, the registry's currentness drift, the live-registry drift) or pre-existing. No defect.

## Reseal request (appended to the wave's list)

- **Spec Lock:** `scripts/pm_pnc019_currentness.py`, plus the entries the coordination prep already listed (the storage value registry, storage-plan, Contracts, Automated Testing, the readiness script).
- **Currentness:** an edition covering the live registry at `2026-09-25.1` and the new live source `Plans/coordination_event_payloads.schema.json`.
- **The PNC-019 receipt pins** the check lists; the plan-sharding bundle rows of the edited documents and shards; run-002 rows and the final summary's PlanUnit count (6,743); the readiness gate report; the nightly snapshot.

## Open questions carried forward

- **CR-01 to CR-04** are applied as report notes (see the branch report `reports/event-authority-20260911/step-09-coord-registered-20260925.md` sections 4, 6, 9 and 10).
- **The checker's wording** still prints "No family is admitted" beside `admitted_rows` (branch report, open item 5).
- **`.gitignore`:** `tests/test_pm_coordination_events.py` is force-added and lacks its line; the other thread adds it.
- **DL number collision:** another thread's `fix/server-pairing-issuance-20260925` (`73138c6a6`) also carries a DL-094 for an unrelated decision. DL-094 is now taken on `main`; that thread renumbers at its landing.

## Evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-09-coord-registered-landing-20260925/`. The branch's own checks: `step-09-coord-registered-prep-20260925/` (R4 fixes and R6, SHA256SUMS `b4ffbbad...`) and `step-09-coord-registered-admit-20260925/` (SHA256SUMS `e09c2cc6...`).

| File | SHA-256 |
|---|---|
| `landing.json` | `9ba8ae69496fc64efe5afac9e74e1ef66c6dcd54445fc1c5cfa46bd5ea2bd6ee` |
| `check-reports/run-gates.json` | `646f03e2db5787ead27389ea6f5bc1e9acab2666706b207d6ea5edf82acc7da6` |
| `check-reports/audit-governance.json` | `871bea59ef92bcccc84ae15fdafc0f6b2092c954f48f318c1937c7682bbe2f50` |
| `check-reports/plan-migration-validate.json` | `72274ed2da6d8a16b0fe625d52b2f5872d1374548f44d4e2f1870cbeff2598ae` |
| `shared-shard-check.json` (identical to the worktree's) | `9d225d7781e5b935c05042e894bbb0c01b18b7f77e3638f6547eee01868ebd42` |
| `shared-status-before-ff.txt` (the 43 uncommitted paths) | `c1d79a51e30e42d114095293c253ac35b97540a5b08a7c1d6513c1ed5a058856` |
| `shared-overlap.txt` (empty) | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `branch-paths.txt` | `d1d9cf30c9c417bad6caba02973efce827568151438da4d00b35fea088b87037` |
| `push.txt` | `bf14d2865f05c1899a40f28b9debd7cc9a2c95bf8e6e4a7ec06ed262a1a77d16` |
| `worktree-index-validate.json` | `d6287de19465c6896a5683b0c920ea8f2781180d130e627b5d4cc3f5e2fe3917` |
| `worktree-coordination-checker.json` | `c185c7e97808849b6fa80f414fd76c41dadadab90340a73dcff327f41cc7b04e` |
| `worktree-test_pm_coordination_events.log` | `c9a460170da42b14f5c5b79c6136ee06bda3e01ee731d966c1fe36adca92f002` |
| `worktree-test_event_authority_holding_bucket.log` | `151ab27584ae164b291f9d61943493b8da8ee70c6e57d7343aa53aba82708343` |
| `worktree-test_pm_pnc019_currentness.log` | `53d306229a02a896817fd4a58d68ab517b336bf378c34748fb211f827fff7acc` |

Cost: the first admission, including the prep residual fixes, R6, two independent grades, the admission and its review, took about 4.5M subagent tokens over about 4.5 hours of agent time; the host about 1 agent-hour; the landing check 19 minutes.
