# Landing record: Step 8(c) first half, the Browser pair adopts SP-286/CV-339 by name, 2026-09-25

Branch `plans/ea-browser-pair-sp286-20260924`: 13 commits, rebased at landing onto `main` `9986aeabe5` and ending at `a3d6bb616b`. `main` was fast-forwarded from `9986aeabe5` to `a3d6bb616b` at 02:28:27Z and pushed at 02:43:59Z, after the landing check. This record is a report-only commit on top, landed the same way. Before the rebase the branch was pushed at `370c5537d3`, on `a6480b0f7c`.

**What lands.** 37 paths: `Plans/Section15_MVP_Promoted_Features_Spec.md`, its 29 shard files, the six `Plans/.plan_index` files and the report `reports/event-authority-20260911/step-08-browser-pair-sp286-20260924.md`.
- SMPFS-167 (`browser.workspace.created`) and SMPFS-168 (`browser.workspace.reset`) each gain a dated subsection, a newly authored technical owner definition under DL-046, in which `BrowserRuntimeService.workspace` adopts SP-286/CV-339's `storage.first_append_receipt.resolve.v2` by name for exactly its creation or reset barrier. It includes the restore half, the request defined by the original event identity, the route when no original event exists and the final boundary recheck.
- Each unit gains a canonical sentence, a criterion (SMPFS-167-A006 and SMPFS-168-A005), `depends_on` SP-286 and CV-339, a ContractRef line and a named native validation obligation.
- No registry row, payload schema, fixture, test, Storage document or checkpoint changes. `Plans/event_family_registry.json` stays at `2026-09-11.2` (`0be544181eda...`), and SP-266's v1 route stays current; making the v2 checkpoint current is the second half of 8(c), on its own branch.
- PlanUnits stay at 6,728. Acceptance units go from 26,258 to 26,260.

| Commits | What they do |
|---|---|
| `b6d0c6cc76` | The adoption, reviewed in cycle 1 |
| S-02 to S-08 (7 commits) | Cycle 1 repairs in the reviewer's wording: restore half, request identity, no-original-event route, owner result, first-mint sentence, final recheck, named native obligations |
| S-09, S-10 (2 commits) | The report, and the depth statement as a forecast |
| R-01 to R-03 (3 commits, `fd99d6d398`, `b177692145`, `370c5537d3` before the rebase) | Cycle 2 notes in the reviewer's wording: the exact depth42 quotation, A006's missing executable oracle, and `NOTE.txt`'s own SHA-256 |

**Authority, review and go.**
- **Authority.** DL-046, per family, under the Step 8 instruction of 2026-09-24 relayed by the previous coordinator. The gap answered is depth42's producer finding for both families.
- **Review.** One blind form-driven review in two cycles, in `/home/sittingmongoose/PM-Experiments/review-ea-browser-sp286-20260924/`. Cycle 1 (`REVIEW.md`) raised S-01 to S-10: 0 blocking, 5 should-fix, 5 notes. Cycle 2 (`RECHECK.md`, `recheck-findings.jsonl`), by a fresh reviewer limited to the affected rows as DL-066 requires, confirmed all ten repairs and found the branch landing-ready at `d08075c7c7`, with 4 notes. R-01 to R-03 were applied as above; R-04 is carried below.
- **Go.** This session, the program's host reporting to Jared, gave the landing go after cycle 2.

**Landing lock.** Taken at 02:24:59Z, when it was free, before the landing fetch, and held through the rebase, the fast-forward, both shard checks, the landing check, the push, this record and the cleanup.

## Procedure

1. **Rebase.** At the landing fetch `origin/main` was `9986aeabe5`, two report-only commits on the branch's base `a6480b0f7c`: the handover progress file and its landing record. Neither is a branch path, and the rebase was clean.
   - **Cited passages re-read.** `git diff --name-only a6480b0f7c 9986aeabe5` names no Plans file, so every passage the branch cites (SP-286, CV-339 at `Contracts_V0.md` 22201 and 22214-22220, `Executor_Protocol.md` 7285-7291, the Section 15 terminal-move adoption and the depth42 assessment) reads as reviewed.
   - The rebased branch was pushed to GitHub with a lease. The NAS push URL refused it, because the lease was checked against the tracking ref GitHub had just updated; it was pushed there with an explicit lease on the old tip `370c5537d3`.
2. **Regeneration.** With the ignored currentness edition symlinked, the shard and index regeneration reproduced every committed derived file apart from four `generated_at_utc` stamps, which were reverted. Nothing was hand-merged.
3. **Checks in the worktree** at `a3d6bb616b`:
   - shard check: pass, 99 documents, 2,722 shards;
   - `pm-plan-index.py validate`: pass, 6,728 PlanUnits and 26,260 acceptance units;
   - Browser created 63, reset 53 and admission 38 tests: OK; `pm-browser-event-admission.py` passes;
   - `test_pm_pnc019_currentness`: fails with drift rows for `Plans/Decision_Log.md`, `Plans/Goal_Runtime_System.md` and `Plans/storage-plan.md` (`main`'s) and `Plans/Section15_MVP_Promoted_Features_Spec.md` (this branch's), as the report expected.
4. **Overlap check in the shared checkout.** It was on `main` at `9986aeabe5`, equal to `origin/main`, with the same 43 unrelated uncommitted paths. A path-limited status over the 37 branch paths and `reports/landing-checks` was empty.
5. **Fast-forward and shard check.** `main` went to `a3d6bb616b` at 02:28:27Z. The shared shard check passed, byte-identical to the worktree's.
6. **Landing check:** `python3 scripts/pm-landing-check.py --base origin/main --json --keep-check-reports <evidence>/check-reports`, from 02:29:10Z to 02:43:31Z. It exits **1** with **0 blocking items**; stderr is empty.
   - **Baseline.** Current: `792d2fb8b1` is an ancestor of the base `9986aeabe5` and 0.22 days older than it, so rule 2 applies.
   - **Totals.** `run-gates` 1,470 -> 1,835, `audit-governance` 1,470 -> 1,835, `plan-migration-validate` 33,072 unchanged. Against the anchors landing's 1,771 that is +64 per aggregate, exactly the report's forecast: 30 + 30 + 1 + 3.
   - **Branch.** 37 paths and 170 units. 1,956 rows name the branch, all staleness; 1,944 of them are plan-migration current-snapshot rows for Section 15's units.
   - **New rows.** 730, all `stale: true`, none blocking. Per aggregate: 173 each in evidence and plan graph (`main`'s 143 plus Section 15 and its 29 shard files), keyed from their complete exports; 13 plan-migration rows; 4 readiness rows; 2 Spec Lock rows (`main`'s).
   - **Grown subchecks,** none truncated: evidence and plan graph 0 -> 173, implementation readiness 24 -> 28, plan migration 2 -> 15, Spec Lock 0 -> 2, in each aggregate. Compared by total only and unchanged: `audit_closure` and `prd_planning_runtime_contracts`. No subcheck timed out.
7. **Push.** A fetch just before the push found `origin/main` still at `9986aeabe5`. At 02:43:59Z `main` `a3d6bb616b` was pushed to `origin` (GitHub and the NAS) and `truenas-backup`.

## Classification

Exit 1. Every row is governance staleness on Section 15, or `main`'s own pending staleness from earlier landings of the wave. None is a defect.

## Reseal request (appended to the wave's list)

- **Plan-sharding bundle:** the live bundle rows for `Plans/Section15_MVP_Promoted_Features_Spec.md` and the 29 files of its shard directory (30 rows).
- **Currentness:** an edition that includes Section 15. Until then `test_pm_pnc019_currentness` fails with its drift row.
- **Run-002:** `refresh-batch-hashes` for batch report rows 168 to 170.
- **Readiness:** the implementation-readiness gate report.
- **Snapshot:** the nightly `snapshot-current`.
- Section 15 has no Spec Lock entry, so there is no Spec Lock item from this branch.

## Open questions carried forward

- **R-04 (cycle 2 note).** The S-04 repair commit `6b2f2162f5` cites the terminal-move wording as "Section 15 11970-11971", the cycle-1 tip's line numbers. The passage is at 11889-11890 at `a6480b0f7c` and 12011-12012 on the landed branch. No tree text carries the number, and a commit message is not rewritten.
- **No executable oracle** for SMPFS-167-A006 or SMPFS-168-A005: both carry only a named native obligation (S-08). The depth effect in the report is a forecast for the next regrade.
- **The DL-077 admission records** of both Browser families still fail closed until they are re-pinned to a regraded assessment with all twelve criteria passing.

## Evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-08-browser-pair-sp286-landing-20260925/`.

| File | SHA-256 |
|---|---|
| `landing.json` | `4107fca30ea4fdd1f1bed7c89bc0aa57b0948a5d16aad81a278e441160aa50a0` |
| `check-reports/run-gates.json` | `5f6136286b1811026903d6015f89190a819fa1adc0170cbca0cfdbe4c4630d2e` |
| `check-reports/audit-governance.json` | `e17b731267d1c93fddca1e3ad77431d4e6d0bd787fafede69bfd5bb2dd74664d` |
| `check-reports/plan-migration-validate.json` | `883a7609909d429fb040051699050cc17530641a0a59f5fdf1287b10fcece401` |
| `shared-shard-check.json` and `worktree-shard-check.json` (identical) | `b8070a4e73ae546e6c7bb6814c469dd0d020724d62d5f13df27e79b6f067d55f` |
| `shared-status-before-ff.txt` (the 43 uncommitted paths) | `c1d79a51e30e42d114095293c253ac35b97540a5b08a7c1d6513c1ed5a058856` |
| `shared-overlap.txt` (empty) | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `branch-paths.txt` | `4ef07e4b5ae7398bca5c0f9a62172bb6d044536eed991edb08e06a0009cde561` |
| `push.txt` | `47d55354e7623c577957573a1b291b9804e1302b39a5c4c61bb4b3e309c265b8` |
| `worktree-index-validate.json` | `3e91081ca4cec253650efafb373d998346f580627972b4b8ecf356ee4724c7fd` |
| `worktree-test_pm_browser_workspace_created.log` | `2444ffe0caa890ad35cd17a63659c221ef67175419aafdc57a8dbda99312712a` |
| `worktree-test_pm_browser_workspace_reset.log` | `d9c19369653e0b707edf18f8d1918a1d74a6a479fc87f18516cb801712dc7c28` |
| `worktree-test_pm_browser_event_admission.log` | `8d2f30e6dba84fb53f05ba48aa73899b2dbceb76bba13e59bb03b793b0d09196` |
| `worktree-browser-event-admission.json` | `8c61dcdf3f0052371f94411697ce3f3e7a53562844d8772ed247241c037817cb` |
| `worktree-test_pm_pnc019_currentness.log` | `082cb0407b6ac847591f510983d2d51a64bee456000aca777f8cdc74d640ee8e` |

Cost: review cycle 2 was one Opus reviewer at maximum effort, 39 minutes and about 0.40M subagent tokens; the landing took about 0.6 host agent-hours, and its landing check 14 minutes.
