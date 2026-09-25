# Landing record: Step 8(c) second half, the Browser-created v2 checkpoint becomes the current definition, 2026-09-25

Branch `plans/ea-browser-created-v2-current-20260924`: 14 commits on `main` `1e5d9b097b`, ending at `bfa4c8a415`. `main` was fast-forwarded from `1e5d9b097b` to `bfa4c8a415` at 05:30:00Z and pushed at 05:50:30Z, after the landing check. This record is a report-only commit on top, landed the same way.

**What lands.** 688 paths: 11 authored files and their regenerated derived files (29 Section 15 shards, 84 storage-plan shards, 558 storage value registry shard paths, 6 index files).
- `Plans/storage_value_registry.json`: the `browser_workspace_created_index_checkpoint` row keeps its family and key and now describes the current v2 writer (`storage.browser_workspace_created_index.v2@2.0.0`, consumer `browser.workspace_inventory.created.v2@2.0.0`, schema version 2.0.0, the SP-278 nine-field durable read token inlined). The exact v1 value is `$defs.checkpoint_v1`, and a `registered_read_value` dispatcher admits an unchanged retained v1 value only for the StorageMigrationCoordinator same-key handoff. The family count stays 294.
- `Plans/browser_workspace_created_checkpoint_v2.schema.json` and its fixtures: `newly_authored_owner_contract`, no longer "Conditional".
- `Plans/browser_event_admission.json` row 0: `authority_contract_ref` names the v2 binding.
- `Plans/Section15_MVP_Promoted_Features_Spec.md` (SMPFS-167) and `Plans/storage-plan.md` (SP-266, section 2.3.1): v2 is the current reader and route since its admission on 2026-09-25; v1 is compatibility custody, read only at the handoff; installation on an actual store stays a native StorageMigrationCoordinator step (NOT_RUN). Section 2.3.1's read-token rule now lists five rows and declares the created family's handoff dispatcher.
- `scripts/pm_browser_workspace_created.py`, `scripts/pm_browser_workspace_created_v2.py`, `scripts/pm-implementation-readiness.py` (the created row in `read_token_families` and `persisted_tokens`) and `tests/test_pm_browser_workspace_created.py` (65 tests).
- `Plans/event_family_registry.json` is byte-identical (`0be544181eda...`): no PNC-019 checkpoint moves, and no admission record is re-pinned (V-07 not triggered).
- PlanUnits stay at 6,728 and acceptance units at 26,260. Only SMPFS-167 and SP-266 change content.

| Commits | What they do |
|---|---|
| `0ba3ac9019`, `dcc29db585` | The change and its report, written on SP-286's old tip and rebased onto `1e5d9b097b` after the first half landed. The rebase had two text conflicts in SMPFS-167; the host kept this branch's v2 sentence and criterion 5 and `main`'s SP-286 sentence, criterion 6 and validation entry. Derived files were taken from `main` and regenerated. |
| V2-01 to V2-08, V2-10, V2-11 (10 commits) | Cycle 1 repairs in the reviewer's wording, from its tested patch: the Section 15 successor subsection no longer says v2 "may replace" v1 only after installation (V2-01, blocking); five read-token rows (V2-02); "Conditional" removed (V2-03, V2-10); the handoff dispatcher declared (V2-04); the report's rebased figures, reseal request, landing forecast and depth forecast (V2-05 to V2-08); a writer-root assertion (V2-11) |
| `c4841eb46a`, `bfa4c8a415` | V2-09, V2-12, V2-13 and V2-11's optional part recorded as open questions (the last is cycle 2's R2-02) |

**Authority, review and go.**
- **Authority.** DL-046, per family; the Step 8 plan's Part 1, landed at `b359936728`. The report cites a coordinator's go of 2026-09-24 that the reviewer found in no file; this session, the program's host, gave the go for this landing.
- **Review.** One blind form-driven review in two cycles, in `/mnt/Cursor/PM-Experiments/review-ea-browser-created-v2-20260925/`. Cycle 1 (`REVIEW.md`) raised V2-01 (blocking, confirmed by a separate refuter) and 7 should-fix items and 5 notes. The repair round applied one commit per finding. Cycle 2 (`RECHECK.md`), by a fresh reviewer limited to the affected rows (DL-066), confirmed every repair and found the branch landing-ready, with two notes: R2-02 applied, R2-01 carried below.
- **Go.** The host, after cycle 2.

**Landing lock.** Tried at 05:03Z and held by another thread (`fix/packet-canon-repairs-20260924`, since 04:40:55Z); retried every five minutes and taken at 05:28:41Z, when it was free. That thread released it without landing, so `main` had not moved. Held through the fast-forward, both shard checks, the landing check, the push, this record and the cleanup.

## Procedure

1. **Rebase.** Not needed at landing: `origin/main` was still `1e5d9b097b`, which the branch contains. The cited passages were read at that base by both review cycles.
2. **Checks in the worktree** at `bfa4c8a415`: shard check pass (99 documents, 2,726 shards); `pm-plan-index.py validate` pass (6,728 PlanUnits, 26,260 acceptance units). At `c4841eb46a` the repair round ran: Browser created 65, reset 53, admission 38, onboarding 42 and shared runtime storage 15 tests OK; `pm_browser_workspace_created_v2.py` PASS; `pm-browser-event-admission.py` pass; readiness validate 33 rows and self-test 346 outcomes, both equal to the reviewer's patched tree. `bfa4c8a415` adds only a report line.
3. **Overlap check in the shared checkout.** On `main` at `1e5d9b097b` with the same 43 unrelated uncommitted paths. A path-limited status over the 688 branch paths and `reports/landing-checks` was empty.
4. **Fast-forward and shard check.** `main` went to `bfa4c8a415` at 05:30:00Z; the shared shard check passed, byte-identical to the worktree's.
5. **Landing check:** `python3 scripts/pm-landing-check.py --base origin/main --json --keep-check-reports <evidence>/check-reports`, from 05:30:32Z to 05:49:50Z. It exits **1** with **0 blocking items**; stderr is empty.
   - **Baseline.** Current (`792d2fb8b1`, 0.25 days), so rule 2 applies.
   - **Totals.** `run-gates` 1,470 -> 2,950 and `audit-governance` 1,470 -> 2,950: +1,115 per aggregate against `main`'s 1,835, exactly the cycle-1 forecast. `plan-migration-validate` 33,072 unchanged.
   - **Branch.** 688 paths and 483 units. 5,470 rows name the branch; all are staleness except the two below.
   - **New rows.** 2,960, of which 2,956 are staleness: per aggregate 726 each in evidence and plan graph (keyed from their complete exports), 13 plan-migration, 9 readiness and 4 Spec Lock rows.
   - **The 4 non-staleness new rows are this branch's.** They are `missing_ref` rows, one each in evidence and plan graph per aggregate, for `Plans/_shards/storage_value_registry/551-lines-110001-110108.md`. Regeneration renamed the registry's last shard (it is now `551-lines-110001-110200.md` to `555-lines-110801-110832.md`), and the plan-sharding bundle still lists the old name. The rows name the bundle, not a branch path, so the check lists them as new failures on another file; they are not another thread's failures. The reseal's bundle update clears them.
   - **The two non-staleness rows on the branch** are `implementation_readiness_self_tests_failed` on `scripts/pm-implementation-readiness.py`, one per aggregate, with baseline count 1 and count 1: pre-existing under rule 2, the same three failing self-test checks as on `main`.
   - **Grown subchecks,** none truncated: evidence and plan graph 0 -> 727, implementation readiness 24 -> 33, plan migration 2 -> 15, Spec Lock 0 -> 4, in each aggregate. Compared by total only and unchanged: `audit_closure` and `prd_planning_runtime_contracts`. No subcheck timed out.
6. **Push.** A fetch just before the push found `origin/main` still at `1e5d9b097b`. At 05:50:30Z `main` `bfa4c8a415` was pushed to `origin` (GitHub and the NAS) and `truenas-backup`.

## Classification

Exit 1. Every new row is governance staleness on the edited files, or `main`'s own pending staleness, except the 4 `missing_ref` rows this branch's shard rename causes, which the reseal clears. The self-test rows are pre-existing. None is a defect of the canon change.

## Reseal request (appended to the wave's list)

- **Spec Lock:** `Plans/storage_value_registry.json`, `Plans/storage-plan.md` and `scripts/pm-implementation-readiness.py`. Section 15 has no Spec Lock entry.
- **Plan-sharding bundle:** the rows of the three documents and their shards. For `Plans/_shards/storage_value_registry` the file list changes too: `551-lines-110001-110108.md` is gone and `551-lines-110001-110200.md` to `555-lines-110801-110832.md` are new. This clears the 4 `missing_ref` rows.
- **The PNC-019 receipt's pin** of `Plans/storage_value_registry.json`.
- **Currentness:** an edition covering Section 15, `storage-plan.md` and `storage_value_registry.json`.
- **Run-002:** `refresh-batch-hashes` for batch report rows 168 to 170 and 173 to 180 (already on the wave's list).
- **Readiness:** the implementation-readiness gate report. **Snapshot:** the nightly `snapshot-current`.

## Open questions carried forward

- **R2-01 (cycle 2 note, outside the affected rows).** The SP-266 successor subsection still says "this conditional target alone grants none of them" (`Plans/storage-plan.md` around line 20007). Suggested: "the 2026-09-23 conditional target alone granted none of them". It goes on the next reviewed branch that edits `storage-plan.md` (the Storage retention follow-up).
- **V2-09, V2-12, V2-13 and V2-11's optional part** (cycle 1 notes), as listed in the report's Open questions: some v1 definitions still read as current before a later dated sentence; SMPFS-167's `depends_on` lacks SP-278; the registry row's consumers do not name the handoff reader; the sibling-borrow negatives and `validate_fixture_contracts` still exercise only v1.
- **The depth effect is a forecast.** `browser.workspace.created` can reach 12 of 12 at the next regrade only if the regrade accepts the canon admission with the native proofs NOT_RUN; the depth42 grader's note says "text alone does not make v2 current". The DL-077 admission records of both Browser families still fail closed until re-pinned to a regraded assessment.

## Evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-08-browser-created-v2-landing-20260925/`. The rebase checks are in `step-08-browser-created-v2-rebased-1e5d9b097b-20260925/` and the repair round's in `step-08-browser-created-v2-repair-20260925/` (SHA256SUMS `24c685e9...`).

| File | SHA-256 |
|---|---|
| `landing.json` | `13c7975981f5e1450d926917e03132d956e13240db883ce3dfabfbc213181962` |
| `check-reports/run-gates.json` | `1f597a8702ae29c24c33c45ffc03de2d3bc5735cc4eab16500d57a1ac81146be` |
| `check-reports/audit-governance.json` | `6d2d41e8369b1b1c5503ec9a95c0020d999ced9c404a6769002aba11c662d83d` |
| `check-reports/plan-migration-validate.json` | `d8a0dc9789691bce877b0fe5164a0b4a7b1fa58107dfbfc3004ef5e2ef873a46` |
| `shared-shard-check.json` and `worktree-shard-check.json` (identical) | `ec0a2703d35a202a810d34df7f418a43fb2e1826f7e493a28d66058bbcd54bb0` |
| `shared-status-before-ff.txt` (the 43 uncommitted paths) | `c1d79a51e30e42d114095293c253ac35b97540a5b08a7c1d6513c1ed5a058856` |
| `shared-overlap.txt` (empty) | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `branch-paths.txt` | `f572b29db8048489fa479beba2bdb74182535cab938bb9094941f4fa8d48209f` |
| `push.txt` | `5eaa2b9d55fe937c837803c15d35024322447dbdbf7afddb51230b13795e9ee0` |
| `worktree-index-validate.json` | `703261c594b5f6f98111be2126def8754b40210333f704a31cce5954b33d3afb` |

Cost: review cycle 1 with its refuter, about 0.58M subagent tokens and 74 minutes; the repair round with cycle 2, about 0.54M and 54 minutes; the host's rebase and landing, about 1.2 agent-hours; the landing check, 19 minutes plus 25 minutes waiting for the lock.
