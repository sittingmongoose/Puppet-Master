# Landing record: Step 9 batch 2, the seven coordination families' contracts prepared (no admission), 2026-09-25

Branch `plans/ea-s09-coordination-prep-20260925`: 34 commits on `main` `cd46487bf0`, ending at `4a2135b940`. `main` was fast-forwarded from `cd46487bf0` to `4a2135b940` at 10:09:55Z and pushed at 10:25:43Z, after the landing check. This record is a report-only commit on top, landed the same way.

**What lands.** 798 paths: 23 authored files and their regenerated shards and index. It prepares, without admitting, the full Event Authority contracts of `coordination.agent_registered`, `agent_status_updated`, `agent_operation_updated`, `agent_file_ownership_updated`, `agent_unregistered`, `agent_crashed` and `agent_aborted`, each a newly authored owner contract under DL-045.
- **Owner prose.** OSI-438 in `Plans/orchestrator-subagent-integration.md` (the semantic owner: producers, closed domains, append on actual change with the 30-second heartbeat as runtime liveness, precedence over the older sketches); CV-353 in `Plans/Contracts_V0.md` (the closed payload schema binding, lineage envelope, open `platform` identifier); SP-320 in `Plans/storage-plan.md` (the projector `storage.coordination_projector.v1@1.0.0`, the checkpoint `projector.checkpoint.coordination:{project_id}` with SP-278's nine-field durable token, the identity and idempotency recipe with the recovery epoch in both, transitions, custody, SP-286 by name, replay, recovery, withdrawal, retention anchor, activation only once all seven are admitted); ATS-058 in `Plans/Automated_Testing_System.md`.
- **Schemas and fixtures.** `Plans/coordination_event_payloads.schema.json`, `Plans/coordination_projection_contracts.schema.json`, `Plans/coordination_event_contract_fixtures.json` (43 positive and 69 negative payload cases, 12 join negatives, 7 identity and 9 path vectors, 22 transition sequences, 13 native obligations NOT_RUN).
- **Storage.** `coordination_event_records` and `coordination_read_model_projections` move from deferred to materialized in place (census 272/21 to 274/19; 294 families unchanged; `RP-COORDINATION-180D` unchanged; the K8 retention wording fixed).
- **Admission ledger.** `Plans/coordination_event_admission.json` and its schema: eight rows `prepared_not_admitted`; the seven batch rows carry their final registry rows and `registry_row_sha256` (DL-077 recipe); `coordination.debug_mirror_exported` is out of batch with its open items.
- **Checks and guards.** `scripts/pm_coordination_events.py` and `tests/test_pm_coordination_events.py` (45 tests; force-added, see below); the Browser gate and the registry helpers in the two pinned test files accept a coordination row only when the ledger admits it and it equals its prepared row, and only for the seven event types; the holding-bucket test reads each admitted family's decision entry from its admission record; readiness gains the narrowly scoped "SP-320 keyed value compositions" rule with its self-tests and a member-order check, and the coordination checkpoint in the SP-278 read-token lists.
- **Reports.** The per-family binding search report and the prep report `reports/event-authority-20260911/step-09-coordination-prep-20260925.md`.
- **Unchanged.** `Plans/event_family_registry.json` (`0be544181eda...`), the DL-078 pins (`2026-09-11.2`, 42 families), every validator's seal logic and the independent validator. Nothing is admitted; each family is admitted in its own later landing.
- PlanUnits go from 6,738 to 6,742 and acceptance units from 26,291 to 26,321.

**Authority, review and go.**
- **Authority.** DL-045 (the seven are in its technical column; per-family search in the binding search report); the Step 9 procedure; the host's rulings recorded in the prep report (prep then seven admissions; append on change; SP-278; SP-286; debug mirror out of batch). DL-093 answers D-02 for exactly these seven.
- **Review.** One blind form-driven review in two cycles, in `/mnt/Cursor/PM-Experiments/review-ea-s09-coordination-prep-20260925/`. Cycle 1 raised CP-01 and CP-02 (blocking, each confirmed by a refuter: a closed five-platform list that shut out OpenCode and the day-one coding-plan workers and contradicted OSI-258; an idempotency key without the recovery epoch that could reuse a lost event's identity after a restore), 6 should-fix items and 9 notes. The branch was rebased onto `main` twice and the repair round applied one commit per finding. Cycle 2 (`RECHECK.md`), limited to the affected rows (DL-066), confirmed every repair and found the branch landing-ready, with four residuals carried below.
- **Go.** This session, the program's host, after cycle 2.

**Landing lock.** Taken at 10:08:46Z, when it was free, and held through the fast-forward, both shard checks, the landing check, the push, this record and the cleanup.

## Procedure

1. **Rebase.** Not needed at landing: the branch was rebased onto `cd46487bf0` in the repair round, and `origin/main` had not moved. Both rebases took `main`'s derived files and regenerated them; the passages the branch cites were re-read after each (the log is `/mnt/Cursor/PM-Experiments/ea-step09-batch2-20260925/prep-compile-log.md`).
2. **Checks in the worktree** at `4a2135b940`: shard check pass; `pm-plan-index.py validate` pass (6,742 PlanUnits, 26,321 acceptance units); the checker passes; coordination tests 45 OK. At `51d4dc829f` (the last commit before the report-only one) the repair round ran the full set: Browser admission 38, testing session 11, GitHub project 15, Browser created 65, reset 53, shared runtime storage 15, holding bucket 34, emit-only 13, onboarding 42 and runtime vocabulary 9, all OK; readiness validate 36 against `main`'s 33 (3 currentness drift rows); self-test the same pre-existing failing scenario; the first-admission simulation passes apart from currentness drift.
3. **Overlap check in the shared checkout.** On `main` at `cd46487bf0` with the same 43 unrelated uncommitted paths. A path-limited status over the 798 branch paths and `reports/landing-checks` was empty.
4. **Fast-forward and shard check.** `main` went to `4a2135b940` at 10:09:55Z; the shared shard check passed, byte-identical to the worktree's.
5. **Landing check:** `python3 scripts/pm-landing-check.py --base origin/main --json --keep-check-reports <evidence>/check-reports`, from 10:10:20Z to 10:25:24Z. It exits **1** with **0 blocking items**; stderr is empty.
   - **Baseline.** Current (`792d2fb8b1`, 0.44 days), so rule 2 applies.
   - **Totals.** `run-gates` and `audit-governance` 2,950 -> 3,227 (+277 each), and `plan-migration-validate` 33,072 -> 33,909 (+837): exactly the forecast in the prep report and in both review cycles.
   - **Branch.** 798 paths and 1,161 units. Every row naming the branch is staleness (Spec Lock `stale_hash` for the storage value registry, storage-plan, Contracts, the readiness script and others; evidence and plan graph `artifact_hash_stale`, keyed from their complete exports; currentness drift; the PNC-019 source hash; run-002 `stale_batch_report_sha256_after`; current-snapshot rows), except `implementation_readiness_self_tests_failed` on `scripts/pm-implementation-readiness.py`, one per aggregate, with baseline count 1 and count 1: pre-existing, the same failing scenario as on `main`.
   - **New rows.** 3,517, all staleness except the 4 `missing_ref` rows for `Plans/_shards/storage_value_registry/551-lines-110001-110108.md`, which the Step 8(c) second half caused and recorded; none is this branch's.
   - **Grown subchecks,** none truncated: evidence and plan graph 0 -> 845, readiness 24 -> 36, plan migration 2 -> 50, Spec Lock 0 -> 7, in each aggregate; `plan-migration-validate` 33,072 -> 33,909. No subcheck timed out.
6. **Push.** A fetch just before the push found `origin/main` still at `cd46487bf0`. At 10:25:43Z `main` `4a2135b940` was pushed to `origin` (GitHub and the NAS) and `truenas-backup`.

## Classification

Exit 1. Every row this branch adds is governance staleness on the documents, registries and scripts it edited. The self-test rows are pre-existing. No defect.

## Reseal request (appended to the wave's list)

- **Spec Lock:** the stale entries the check lists for this branch (7 per aggregate), among them `Plans/storage_value_registry.json`, `Plans/storage-plan.md`, `Plans/Contracts_V0.md` and `scripts/pm-implementation-readiness.py`.
- **Plan-sharding bundle:** the rows of the edited documents and their shards; for `Plans/_shards/storage_value_registry` the file list changes again (the prep report lists it).
- **The PNC-019 source hashes** the check lists as `pnc019_source_hash_stale`.
- **Currentness:** an edition covering the Orchestrator, Contracts, storage-plan, storage value registry and Automated Testing documents.
- **Run-002:** the 43 `stale_batch_report_sha256_after` rows and the final summary's PlanUnit count (now 6,742).
- **Readiness:** the implementation-readiness gate report. **Snapshot:** the nightly `snapshot-current`.

## Open questions carried forward

- **R4-01 (cycle 2, should fix).** The `platform` pattern `^[a-z][a-z0-9_]*$` rejects hyphenated surface and provider-entry IDs that `Plans/Models_System.md` sections 10.4 and 10.4.1 and MS-114 name for day-one surfaces (`zai-coding-plan`, `claude-code-cli`). The reviewer's repair admits hyphens in CV-353 rule 5 and the schemas. It is fixed on the first admission branch, which is reviewed, before `coordination.agent_registered` is admitted.
- **R4-02, R4-03, R4-04 (cycle 2 notes).** The Browser gate pins the seven event types but not their family IDs; the `path_ref` pattern rejects a narrow class of paths SP-320's recipe produces (for example `~drafts/a.md`); readiness pins the composition member order but not the row's `key_shape`. The reviewer's exact repairs are in `recheck-findings.jsonl`; they ride on the first admission branch.
- **The heartbeat-expiry value.** `coordination_heartbeat_expiry_ms` has no value; the card `EA-S09B2-HEARTBEAT-EXPIRY-001` is with Jared. `coordination.agent_crashed` is forecast at 10 of 12 unless it is answered before that family's admission.
- **`.gitignore`.** `tests/test_pm_coordination_events.py` is force-added and lacks its `!/tests/test_pm_coordination_events.py` line; per Jared's answer, the other thread adds `.gitignore` lines.
- **Disposition rows at admission (R6).** How a registered family's J248 row is recorded under the frozen schema is decided on the first admission branch, checked against the seal check in a scratch harness.
- **`coordination.debug_mirror_exported`** keeps its open items for its own batch; the crew board events (DL-085) are a later batch.

## Evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-09-coordination-prep-landing-20260925/`. The branch's own checks: `step-09-coordination-binding-search-20260925/`, `step-09-coordination-prep-checks-20260925/`, `step-09-coordination-prep-rebased-20260925/` (SHA256SUMS `48d579e9...`) and `step-09-coordination-prep-repair-20260925/` (SHA256SUMS `a3ab3caa...`).

| File | SHA-256 |
|---|---|
| `landing.json` | `007ddec3a8e38b6864561e81dc0fc9388632527b27b281c64cd68d7142690d3a` |
| `check-reports/run-gates.json` | `25f647fd0c673bfd036461eda1ee58e216dc21c5233126bfb0a9e882d4d20540` |
| `check-reports/audit-governance.json` | `865499f59bacdc4d845088cbddad8cb68493bb4b3a6fe6fd2600d8ac512d822a` |
| `check-reports/plan-migration-validate.json` | `7518da84a7128e51f43d7cb17528d242724ee96380291fc8f286848e0ecb7fec` |
| `shared-shard-check.json` (identical to the worktree's) | `9d225d7781e5b935c05042e894bbb0c01b18b7f77e3638f6547eee01868ebd42` |
| `shared-status-before-ff.txt` (the 43 uncommitted paths) | `c1d79a51e30e42d114095293c253ac35b97540a5b08a7c1d6513c1ed5a058856` |
| `shared-overlap.txt` (empty) | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `branch-paths.txt` | `ed70822e2d7d0cb640f7ca49104d9efa7d373cbaeb1dd7c8a31da9dd0e421250` |
| `push.txt` | `ad5edfb989465daef11e6170c2d64b3b11305b85bf4b63bc663ae78ff5c6d3f1` |
| `worktree-index-validate.json` | `b424350193c44ca586e7b229f25050921888afb86d30e606ba0e7b66bce6a448` |
| `worktree-coordination-checker.json` | `d028d895f62168e231a89afb3fa8f11a0a8f754e29e9b1dd11e7e4f81ebe7392` |
| `worktree-test_pm_coordination_events.log` | `7c900e793a0be6583b3a50841285f2580f5397d30104459202acc13fd868c975` |

Cost: the three-stage compile about 2.0M subagent tokens and 3.4 hours; the first rebase and review cycle 1 with two refuters about 1.2M and 1.7 hours; the second rebase, repair round and cycle 2 about 1.1M and 2.1 hours; the host about 1 agent-hour; the landing check 15 minutes.
