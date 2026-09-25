# Step 9 batch 2: coordination preparation, seven families, no admission (2026-09-25)

Branch `plans/ea-s09-coordination-prep-20260925`, cut from `origin/main` `1e5d9b097b`. It prepares the full contracts of seven coordination families:
- `coordination.agent_registered`
- `coordination.agent_status_updated`
- `coordination.agent_operation_updated`
- `coordination.agent_file_ownership_updated`
- `coordination.agent_unregistered`
- `coordination.agent_crashed`
- `coordination.agent_aborted`

It admits nothing. No row is added to `Plans/event_family_registry.json`, no checkpoint or pin moves, and no DL-077 admission record is written. Each family is admitted later in its own Storage admission landing: one family per landing (DL-045), with its own DL-077 admission record and the DL-078 checkpoint move.

**Status.** Contracts, schemas, Storage rows, ledger, fixtures, checker, guards and oracles are written, and every check passes except the expected governance staleness. Not done yet:
- The one blind form-driven review (cap two cycles) has not run.
- `main` has moved on. The branch must be rebased onto `main` at `bfa4c8a415` or later (Step 8(c) second half, landed 05:50Z). A trial merge shows one small manual merge in `Plans/storage-plan.md` section 2.3.1 (see "Expected at landing").

The branch was written in three stages. The per-family search is `reports/event-authority-20260911/step-09-coordination-binding-search-20260925.md`. The stage log is `/mnt/Cursor/PM-Experiments/ea-step09-batch2-20260925/prep-compile-log.md`.

## What changes

| Surface | Paths | What | Commits |
|---|---|---|---|
| Per-family search | `reports/event-authority-20260911/step-09-coordination-binding-search-20260925.md` | DL-045's documented search: one section per family, partial contracts cited, scoped negative evidence | `f0c39c63f2` |
| Semantic owner | `Plans/orchestrator-subagent-integration.md` | New section "Coordination event authority (DL-045, 2026-09-25)", OSI-438: producers and entry points, closed domains, agent identity, append on change, heartbeats as liveness, crash and abort resolution, legacy sketch fields, file claims, restart, readers | `43d0ffc207`, `10b85b48a5`, `3b30d75708` |
| Payload owner | `Plans/Contracts_V0.md`, `Plans/coordination_event_payloads.schema.json` | CV-353: the closed payload schema, one definition per coordination row, shared lineage envelope and reference form, EventRecord joins; a pointer from the coordination rows | `469608ce2e`, `aa50dc86e0`, `3b30d75708` |
| Storage owner | `Plans/storage-plan.md`, `Plans/coordination_projection_contracts.schema.json` | SP-320: append admission, projector, five readers, checkpoint value with SP-278 and the nine-field durable token, identity recipes, transition table, first-receipt custody, custody, retention anchor, replay, recovery, withdrawal; a pointer from section 2.3.2; section 2.3.1 rules | `e0970e3b02`, `feea824637`, `99650b39a3`, `17013e838d`, `3b30d75708` |
| Storage value registry | `Plans/storage_value_registry.json` | `coordination_event_records` and `coordination_read_model_projections` materialized in place; the retention text contradiction (K8) fixed | `17013e838d` |
| Readiness | `scripts/pm-implementation-readiness.py` | The "SP-320 keyed value compositions" rule, the coordination checkpoint in the read-token lists, census 274 materialized and 19 deferred, 10 self-tests | `17013e838d` |
| Census pins | `tests/test_shared_runtime_storage_contracts.py`, `tests/test_pm_runtime_vocabulary_migration.py`, `tests/test_pm_onboarding_phases.py` | Moved for the two materialized rows only | `17013e838d` |
| Admission ledger | `Plans/coordination_event_admission.json` and `.schema.json` | Eight rows `prepared_not_admitted`; seven carry the final registry row and its SHA-256; `coordination.debug_mirror_exported` is outside the batch with no row | `4265b4be31` |
| Fixtures | `Plans/coordination_event_contract_fixtures.json` | 42 positive and 67 negative payloads, 12 EventRecord join negatives, 6 identity and 9 path vectors, 22 transition sequences with final state, 11 positive and 20 negative projection values, 13 native obligations `NOT_RUN` | `cf100ea492` |
| Checker | `scripts/pm_coordination_events.py`, `tests/test_pm_coordination_events.py` | Static checker and 39 unittest tests (see "Checks") | `4f393fbbbc`, `a3929d7cf0`, `1308548aae` |
| Closed-world guards | `scripts/pm-browser-event-admission.py`, `tests/test_pm_testing_session_events.py`, `tests/test_pm_github_project_integration.py`, `tests/test_pm_browser_event_admission.py`, `tests/test_event_authority_holding_bucket.py` | Accept a row the coordination ledger marks admitted, only as its exact prepared row, and nothing else | `a3929d7cf0` |
| Oracles | `Plans/Automated_Testing_System.md` | ATS-058, the oracle entry for the seven families | `1308548aae` |
| Derived | `Plans/_shards/` (Automated Testing 40, Contracts 62, Orchestrator 14, storage-plan 85, storage value registry 564) and `Plans/.plan_index` | Regenerated with each Plans edit; no other document's shards changed | with each edit |

In numbers, before this report: 22 source files (12,775 lines added, 124 removed), 765 shard files and 6 index files. PlanUnits go from 6,728 to 6,732 (OSI-438, CV-353, SP-320, ATS-058), and acceptance units from 26,260 to 26,290.

Untouched, as required: `Plans/event_family_registry.json`, `scripts/pm_pnc019_currentness.py`, the DL-078 pin lines of the two pinned tests, `Plans/Spec_Lock.json`, `Plans/.evidence/**`, `Plans/auto_decisions.jsonl`, `Plans/.implementation_readiness/**`, `Plans/Decision_Log.md` and the audit rows under `Plans/.audits/`. The independent validator and `pm-implementation-readiness.py generate` were not run.

### How the guards were generalized

A later admission landing now has to move only the DL-078 pins. The branch changes these closed-world checks:
- `scripts/pm-browser-event-admission.py`: `unexpected_central_event_family` also lets through a registry row whose identity and fingerprint equal a row the coordination ledger marks `admitted_static_contract` (new `admitted_coordination_rows()`). An unreadable ledger opens nothing. Browser rows behave as before.
- `assert_registry_matches_upstream_plus_admitted_browser` in both pinned test files: an admitted coordination row is accepted only when it equals its prepared row byte for byte in canonical JSON, and it is counted in the returned total. The pin lines themselves are untouched. They moved down only because lines were added above them: `tests/test_pm_testing_session_events.py` lines 91 to 93 (were 80 to 82) and `tests/test_pm_github_project_integration.py` lines 261 and 265 (were 250 and 254).

A simulated first admission found three more closed-world assumptions, and the branch fixes them too:
- the registry count in `test_live_consistency_counts_match_exact_manifest_and_registry`;
- `test_each_other_historical_row_and_compaction_remain_exact`, which treated every non-Browser row as historical;
- the post-August list of `PostAugustAdmissionTests` in `tests/test_event_authority_holding_bucket.py`, which now adds each admitted coordination family and reads its decision entry from its own DL-077 admission record. A missing record fails closed.

## Authority

- **DL-045, per family.** The seven are in DL-045's `Plans/orchestrator-subagent-integration.md` batch. DL-045 lets the owners "explicitly define a missing technical binding for **already specified behavior**, after checking current canonical sources for an existing definition", and requires that "Each event requires its own documented search scope, citations to existing partial contracts, and negative evidence that the required definition was not found within that scope." The search report gives each family its own section (sections 4 to 10), and its section 12 lists what the owner prose defines. DL-045 also says "Any new registration proceeds through Storage **one family per landing**".
- **Preparing is not admitting.** DL-046, written for the 53 Browser names, says: "Preparing payloads, schemas, fixtures or wiring expectations together is not admission. A prepared row remains denied by the admission path, absent from the central event registry and unable to advance a projection checkpoint." The Step 9 procedure applies the same structure to every batch: "One branch per owner batch", and for each registration "Its own Storage admission landing, one family per landing". This branch applies the principle by analogy, and the ledger's `admission_rule` says so. Every prepared row here is denied by the admission path, absent from the registry and unable to advance the coordination checkpoint.
- **DL-039.** No bulk registration and no inference from a sibling. Each family's section, ledger row and cases are its own; a sibling appears only as a transition partner in a sequence.
- **DL-076, DL-077, DL-078.** The checkpoint stores the nine-field durable token and never `redb_snapshot_id` (DL-076). DL-077 and DL-078 govern the later admission landings; nothing here exercises them.
- **The host's rulings for this batch** (recorded in the search report, section 13; technical rulings under DL-045, not product decisions):
  1. One preparation branch, then seven admission landings.
  2. Coordination events are appended at registration, on an actual change of status, operation or file claim, and at termination. Liveness heartbeats are runtime liveness, not coordination records. ORCH line 4106 at the base, "periodically (e.g., every 30 seconds or when file operations occur)", gives an example, and `last_update` is a legacy sketch field. The crash detector's expiry threshold is the runtime policy value `coordination_heartbeat_expiry_ms`, named and given no number. OSI-438 states this as a newly authored owner contract under DL-045. It is not a retention choice: it decides which facts are recorded, not how long records are kept or how many. `RP-COORDINATION-180D`'s window, cap, overflow rule and expiry apply unchanged to every appended record.
  3. The checkpoint adopts SP-278 by name, with the nine-field durable read token (DL-076).
  4. Producers adopt SP-286/CV-339 first-AppendReceipt custody by name.
  5. `coordination.debug_mirror_exported` gets its payload definition and a `prepared_not_admitted` ledger row only; it is outside this batch.

## New identifiers

Every identifier below is labelled in its owner text as a newly authored owner contract under DL-045, and is backed by the per-family search report.

| Identifier | Kind | Owner |
|---|---|---|
| OSI-438, CV-353, SP-320, ATS-058 | PlanUnits | ORCH, Contracts, Storage, Automated Testing |
| `coordination-event-authority-dl-045-2026-09-25`, `closed-coordination-payload-schema-dl-045-2026-09-25`, `coordination-event-persistence-binding-dl-045-2026-09-25`, `coordination-event-oracles-dl-045-2026-09-25` | Section anchors | the same four documents |
| `storage.coordination_append.v1@1.0.0` | Append admission, the only path that appends the seven | SP-320 |
| `storage.coordination_projector.v1@1.0.0` | The only direct event consumer and projection writer | SP-320 |
| `storage.coordination_reader.scheduler.v1@1.0.0`, `.agent_coordinator.v1@1.0.0`, `.prompt_context.v1@1.0.0`, `.mirror_export.v1@1.0.0`, `.inspection.v1@1.0.0` | Projection readers | SP-320 |
| `AgentCoordinator.record_crash(AgentCrashResolution)`, `AgentCoordinator.record_abort(AgentAbortResolution)` | New producer entry points; the other five entry points bind the existing sketch names to typed inputs | OSI-438 |
| `coordination_heartbeat_expiry_ms` | Runtime policy value name, no number | OSI-438 |
| `coordination_conflict` with `conflict_kind` `stale_revision`, `not_registered`, `already_registered`, `already_terminal`, `lineage_mismatch`; `coordination_unchanged`; `coordination_projection_unavailable` | Diagnostics | SP-320, OSI-438 |
| Idempotency key `coordination:{event_type}:{project_id}:{agent_id}:{agent_revision}`; event ID `evt_coordination_` plus SHA-256 of the RFC 8785 identity array; the `agent_revision` rule; `path_ref` normalization and `path_hash`; the `projection_scope` grammar | Recipes | SP-320 |
| `Plans/coordination_event_payloads.schema.json`; `$defs` `lineage_envelope` and `non_secret_ref`; schema IDs `pm.coordination_event.<family>.schema.v1` (seven, plus the prepared `debug_mirror_exported`) | Payload schema | CV-353 |
| `Plans/coordination_projection_contracts.schema.json`; `pm.storage_value.coordination_projector_checkpoint.v1` and the agent, file, operation and snapshot projection values, all `1.0.0`; `$defs/durable_read_token`; `x-pm-event-authority-binding` | Projection and checkpoint values, binding record | SP-320 |
| "SP-320 keyed value compositions" (section 2.3.1) and readiness constant `STORAGE_VALUE_KEYED_COMPOSITION_MEMBER_IDENTITY` | Registry representation rule | SP-320, section 2.3.1 |
| `pm.coordination_event_admission.v1`, `COORDINATION-DL045-STEP09-BATCH2-20260925`, family IDs `event-family-coordination-agent-*` | Admission ledger | the ledger, under SP-320 and OSI-438 |
| `pm.coordination_event_contract_fixtures.v1`; native obligations `COORD-APPEND-01` to `COORD-MIRROR-01` | Fixtures and oracle IDs | ATS-058 |
| `scripts/pm_coordination_events.py`, report `pm.coordination_event_static_report.v1` | Checker and its output; not an owner contract | ATS-058 names it |

Existing bindings reused by name, each in the role, version and scope its owner defines: `RP-COORDINATION-180D@1.0.0` and `RP-PROJECTION-3GEN@1.0.0`; SP-278 and DL-076's nine-field durable token; SP-286/CV-339's `storage.first_append_receipt.resolve.v2`; the EventRecord 2.0.0 envelope and idempotency identity; the canonical child lifecycle enum (Contracts); and the checkpoint key `projector.checkpoint.coordination:{project_id}` that SP-232 and CV-310 already name. The value schema IDs `pm.storage_value.coordination_event_records.v1` and `pm.storage_value.coordination_read_model_projections.v1` already existed as names of the deferred rows; SP-320 materializes them.

## What each family's twelve criteria would rest on (a forecast)

**This is a forecast, not a grade.** Each family is graded in its own admission landing, in its own depth file, with exact quotes against the text as it then stands (Step 9 plan A.2 step 9). Before that landing no family can pass membership, because its row is not registered. Native execution stays `NOT_RUN`, and under the rubric that alone lowers no grade.

| Criterion | What it rests on | Forecast |
|---|---|---|
| 1 Membership and version | The prepared registry row (family revision 1.0.0, `project_only`, no alias) and its `payload_schema_ref`, whose `$id` is the row's `payload_schema_id` | PASS once the family's own landing appends the row; not before |
| 2 Owner documents | `semantic_owner_doc` resolves to OSI-438's section and `payload_owner_doc` to CV-353's; both govern the family at 1.0.0 | PASS |
| 3 Producer | OSI-438's entry point and caller per family, no body commit before the append, the returned first receipt, read-back only after checkpoint coverage; SP-320's adoption of SP-286/CV-339 `resolve.v2` by name, the restore half and the final boundary recheck | PASS |
| 4 Closed payload schema | CV-353 and the family's closed definition | PASS |
| 5 Scope and identity | `project_only`; SP-320's event-ID and idempotency-key recipes; CV-353 rule 8 envelope joins | PASS |
| 6 Replay and idempotency | SP-320: exact retry returns the original, a different digest is `idempotency_conflict`, lost acknowledgement through `resolve.v2`, replay without effects | PASS |
| 7 Retention | `RP-COORDINATION-180D@1.0.0` in the structured row and the Storage row; SP-320's run-completion anchor with unresolved Runs unexpired; `RP-PROJECTION-3GEN` for projections and checkpoint | PASS; see risk R-A |
| 8 Redaction and custody | CV-353's no-secret rules; SP-320's custody: seglog original in the canonical backup, receipts in SP-286 custody, access and deletion checks at read, the path recipe | PASS |
| 9 Transitions | SP-320's transition table, one terminal event per agent, racing terminal events, claim release, the interim window | PASS; crashed at risk (R-B) |
| 10 Consumers and checkpoints | SP-320's projector and readers with versions, the checkpoint key and value schema, CAS in one redb transaction, SP-278 by name with the nine-field token | PASS |
| 11 Compatibility and withdrawal | No aliases or sketch fields, versioned definitions, readers reject unsupported versions; SP-320's per-family withdrawal (writer cut off, core withdrawn, projector and readers fenced, rebuild) | PASS |
| 12 Oracles | The fixtures, the checker and ATS-058, with the family's own positive and negative cases and sequences; native obligations `NOT_RUN` | PASS; at risk for some families (R-C, R-B) |

| Family | Forecast at its own landing | Cells at risk |
|---|---|---|
| `coordination.agent_registered` | 12 of 12 | none specific |
| `coordination.agent_status_updated` | 12 of 12 | none specific |
| `coordination.agent_operation_updated` | 12 of 12 | oracles (R-C) |
| `coordination.agent_file_ownership_updated` | 12 of 12 | oracles (R-C) |
| `coordination.agent_unregistered` | 12 of 12 | oracles (R-C) |
| `coordination.agent_crashed` | 10 to 12 of 12 | transitions and oracles (R-B), oracles (R-C) |
| `coordination.agent_aborted` | 12 of 12 | oracles (R-C) |

- **R-A, retention.** A grader could read the heartbeat volume against the 1,000,000-record cap as an open retention choice (plan risk R5). OSI-438 and SP-320 answer it: heartbeats are not records, and the policy applies unchanged. Low.
- **R-B, crashed.** `heartbeat_expired` needs `coordination_heartbeat_expiry_ms`, and OSI-438 says "Until runtime policy supplies the value, no heartbeat expiry is inferred". The crash transition itself is fully specified, and three kinds of evidence work without the value. A grader may still call this an owner-flagged open facet. Medium.
- **R-C, own join and identity cases.** The 12 EventRecord join negatives are built on one status event, and the identity vectors cover five families but not `agent_operation_updated` or `agent_file_ownership_updated`. The join rules are the same for all seven (CV-353 rule 8), and ATS-058 says so. A strict reading of "the family's own cases" could still grade oracles PARTIAL for families without their own join negatives. Adding one join negative and one identity vector per family is cheap. Low.

## Checks

Run in the worktree at `3b30d75708`. The base comparison ran in a `git archive` export of `origin/main` `1e5d9b097b` at `/mnt/Cursor/PM-Experiments/ea-step09-batch2-20260925/base-export`, with the currentness edition symlinked.

| Check | Result |
|---|---|
| `python3 scripts/pm_coordination_events.py` | pass, 0 failures: 42 positive and 67 negative payload cases, 12 join negatives, 6 identity and 9 path vectors, 22 sequences with 83 steps, 11 positive and 20 negative projection values, 13 native obligations `NOT_RUN`, 7 prepared registry rows; admitted rows none |
| `tests.test_pm_coordination_events` | 39 OK |
| `tests.test_pm_browser_event_admission` | 38 OK |
| `tests.test_pm_testing_session_events` | 11 OK |
| `tests.test_pm_github_project_integration` | 15 OK |
| `tests.test_pm_browser_workspace_created` | 63 OK |
| `tests.test_pm_browser_workspace_reset` | 53 OK |
| `tests.test_shared_runtime_storage_contracts` | 15 OK |
| `tests.test_event_authority_holding_bucket` | 34 OK |
| `tests.test_pm_emit_only_event_boundaries` | 13 OK |
| `python3 scripts/pm-browser-event-admission.py` | pass |
| `pm-implementation-readiness.py validate` | 36 failures here, 28 on the base. The 8 new rows are governance staleness: currentness drift for Automated Testing, Contracts, Orchestrator and the storage value registry, and 4 Spec Lock rows (the registry once, the readiness script in three lock groups). Two PNC-019 receipt rows that already fail on the base change value. |
| `pm-implementation-readiness.py self-test` | The same single failing scenario on both, `case_l_verification_integration`, with the same three checks false. The branch adds 10 storage checks, all true. |
| Shard check | pass, 99 documents, 2,735 shards |
| `pm-plan-index.py validate` | pass, 6,732 PlanUnits, 26,290 acceptance units |
| `tests.test_pm_pnc019_currentness` | 8 OK, 1 failure, as expected: drift rows for Automated Testing, Contracts, Orchestrator and the storage value registry (this branch) and the Decision Log, Goal Runtime, Section 15 and storage-plan (`main`'s, storage-plan edited here too) |
| Lints | `lint-contractrefs`: only the pre-existing `00-plans-index.md` line 81. `lint-path-refs`: 103 rows, all `Concepts/` and `.claude` paths absent from the sparse worktree, none on the four new units. `lint-banned-phrases`: pass. |

**Simulated first admission.** Scratch exports of the tip took `coordination.agent_registered` through its landing. The prepared row was appended, the registry revision set to a simulated `2026-09-26.1` and the ledger row flipped.
- With only that, the tests fail where the landing's own writes are missing: the holding-bucket tests and one guard test want its DL-077 admission record, and currentness also reports the unmoved checkpoint.
- With the DL-078 pins moved as well, only the admission record is missing, besides the currentness drift.
- With the pins moved and a simulated DL entry and admission record written, every suite passes. The one exception is the expected currentness drift.

No guard or test outside the DL-078 pins needs an edit.

**Trial merge with the new `main`.** `git merge-tree` of `origin/main` `c98cccb25` and the tip conflicts in one source file only, `Plans/storage-plan.md` section 2.3.1, in two hunks. It also conflicts in derived files, which are regenerated. Resolved as proposed below and regenerated, the trial merge passes the checker, the Browser gate and 11 unittest modules, including the census and onboarding pins. Currentness fails with drift rows only. `pm-plan-index.py validate` fails only because the export is not a git repository.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-09-coordination-prep-checks-20260925/`, 158 files, `SHA256SUMS` SHA-256 `33f2b0e799e4218c56b77e93a4490c07d3cde1addbd4f2a762becf48818293e8`. Its `README.txt` says what each file is.

| File | SHA-256 |
|---|---|
| `branch-tip/pm_coordination_events.json` | `e487ee5ded4f4a1d13723cea6adbed2ff4056bc5a4d15202a7e953f98bd202c0` |
| `branch-tip/readiness-validate.json` | `4a135cc94047eb5570a63771b5ba43bd26d2ae9191b0feccedc85c70dee1d02b` |
| `base-1e5d9b097b/readiness-validate.json` | `f2cfc174f5730204bf53c137eb2cc34c1d129394843b79598ebac33c3a385f37` |
| `branch-tip/readiness-self-test.json` | `352014aed668e9c194d4ed52f8b7d423cce6e1b7cca7223b4ae44f3cfecfcec3` |
| `base-1e5d9b097b/readiness-self-test.json` | `364c0e0f9b41a2ac9d4099e23a8532b0d56bc39f2ad8f0583ee6eef3c0b00f88` |
| `branch-tip/currentness-rows.json` | `a4874a45342fd12598de1f986b4a532263dec88813ae2af5a1365b8478903346` |
| `simulation/simF-admit-pins-writes/exit_codes.txt` | `151929eb793eaf01b9067d3efd791f6f3f4c45299d264062d879628148a45108` |
| `trial-merge/merge-tree.txt` | `d5ef51239305c788b71deb9a79e826ad6ba0fc8fef2cb484d2e57e7fd42184ea` |
| `trial-merge/storage-plan.resolved.md` | `5b1b95a7044d34d20fd6ef3cfe129b426deeb4486ec6185c95d4be1b87f25d54` |
| `forecast-prep-landing.json` | `45472cb8633d8ce71da001940ff8915cae0619d0db8e6e08d466167fe694b6f9` |
| `forecast-first-admission.json` | `f685b01b555a67404ef6aba056ba7a69113497c2c2c4409d639b46725ce3d566` |

## Expected at landing

### The preparation landing

1. **Rebase** onto `main` `bfa4c8a415` or later. The trial merge found:
   - Two hunks in `Plans/storage-plan.md` section 2.3.1. `main` now lists five durable-token rows (the four DL-076 rows and `browser_workspace_created_index_checkpoint`), and this branch lists five (the four DL-076 rows and the coordination checkpoint member).
     - The first hunk becomes "Six checkpoint rows persist the durable token as a required field" and names all six. Its closing clause becomes "Until 2026-09-24 the reset, seglog, Home and restore-point expiry rows persisted the whole token". This branch's new "SP-320 keyed value compositions" bullet is kept.
     - The second hunk, the closing paragraph, keeps `main`'s sentence on the created v2 value and adds this branch's sentence on SP-320.
     - The exact resolved text is `trial-merge/storage-plan.resolved.md` in the evidence directory.
   - Derived conflicts: 84 storage-plan shards, 560 storage value registry shards and the 6 index files. Regenerate them; never hand-merge them.
   - `Plans/storage_value_registry.json` and `scripts/pm-implementation-readiness.py` merge cleanly, because `main` edited other rows and lines. Rerun the readiness self-test after the rebase anyway.
   - Re-read every cited passage of section 2.3.1 against the new text before applying.
2. **Documents that go stale.** New with this landing: `Plans/Automated_Testing_System.md`, `Plans/Contracts_V0.md` and `Plans/orchestrator-subagent-integration.md`. Already stale on `main`, and moved again: `Plans/storage-plan.md` and `Plans/storage_value_registry.json`.
3. **Spec-Locked files.** Newly stale: the same three documents. Already stale on `main` since the Step 8(c) landings, with hashes moved again: `Plans/storage-plan.md`, `Plans/storage_value_registry.json` and `scripts/pm-implementation-readiness.py`. Not in Spec Lock: the five new Plans JSON files, `scripts/pm-browser-event-admission.py`, `scripts/pm_coordination_events.py` and the tests.
4. **Estimated landing-check rows.** Measured, not guessed: the governance subchecks ran on sparse exports of `main` `c98cccb25` and of the resolved trial merge, and only the differences are used. Each aggregate (`run-gates` and `audit-governance`) should gain:

   | Subcheck | New rows | What |
   |---|---:|---|
   | Evidence | +118 | `artifact_hash_stale`: Contracts and its 62 shards, Automated Testing and 39 shards, Orchestrator and 14 shards |
   | Plan graph | +118 | the same 118 artifacts |
   | Implementation readiness | +3 | currentness drift for the three newly stale documents |
   | Spec Lock | +3 | `stale_hash` for the same three documents |
   | Run-002 | +35 | `stale_batch_report_sha256_after`: 12 Contracts rows and 23 Orchestrator rows (batch report rows 32 to 40, 117 to 141 and 212) |
   | Total | +277 | per aggregate |

   - The storage-plan and storage value registry rows are already on `main` and only change value. That includes the storage value registry's 552 stale shard rows and the one `missing_ref` from `main`'s shard rename.
   - `plan-migration-validate` against the current run should go from 33,072 to 33,909 (+837). These are all current-snapshot staleness kinds: 424 span metadata, 363 span hash, 47 coverage, 2 line count and 1 batch document row.
   - Expected result: exit 1 with 0 blocking items, if the check classifies these kinds as staleness, as it did in the Browser pair landings. The absolute totals of a whole-tree landing check will differ from the sparse exports; the differences should not.

### Each admission landing (seven, one at a time)

- **What the landing writes.** Its own registry row and revision, the ledger flip to `admitted_static_contract` with `authority_contract_ref`, the DL-078 pins, a Decision Log entry, a per-family depth file, the DL-077 admission record, the disposition records, the Step 9 count and a landing record. The simulation shows that no guard or test outside the DL-078 pins needs an edit.
- **The DL-078 pins.**
  - `EVENT_FAMILY_REGISTRY_REVISION` and `EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT` at `scripts/pm_pnc019_currentness.py` lines 50 and 51, and their provenance comment.
  - `40 + admitted_count != 42` and `KERNEL_ROW_COUNT, 42` at `tests/test_pm_testing_session_events.py` lines 91 to 93, and at `tests/test_pm_github_project_integration.py` lines 261 and 265.
  - The comments above them that still say a further admission needs fresh approval, at lines 89 and 90 and at lines 262 to 264.
- **Measured for the first admission** against this branch's tip:
  - Spec Lock +1, `scripts/pm_pnc019_currentness.py`, which is Spec-Locked.
  - Implementation readiness +2: currentness drift for `Plans/event_family_registry.json`, and the live-registry drift.
  - Several existing readiness rows change value, such as the kernel row count, 42 to 43.
  - No new evidence, plan-graph or run-002 rows.
  - Plan-migration current-snapshot rows for the new Decision Log entry's spans; the simulated entry was prose only, so these were not measured.
  - Later admissions mostly change values of the same rows, unless a reseal happens in between.
- **Order.** `agent_registered` first, then status, operation, file ownership, unregistered, crashed and aborted (Step 9 plan D.1). Until all seven are admitted, SP-320 keeps the `AgentCoordinator` append path natively inactive: an admitted family is contract-only.

## Reseal request (for the designated Plans agent, after the preparation landing)

- **Spec Lock:** `Plans/Automated_Testing_System.md`, `Plans/Contracts_V0.md` and `Plans/orchestrator-subagent-integration.md` (new), with `Plans/storage-plan.md`, `Plans/storage_value_registry.json` and `scripts/pm-implementation-readiness.py` (already requested by the Step 8(c) landings; their hashes move again).
- **Plan-sharding bundle:**
  - The rows of the three new documents and their shard files: Contracts 62, Automated Testing 39, Orchestrator 14.
  - The storage-plan and storage value registry rows move again.
  - The file lists gain the new shard files: Automated Testing's `038-ats-058-...`, `storage-plan/083-coordination-event-persistence-binding-...`, and the storage value registry shard files that regeneration writes after the rebase. `main`'s own rename of that registry's last shard is already in the reseal list.
- **PNC-019 certification receipt:** the source hashes of `Plans/storage_value_registry.json` and `Plans/Automated_Testing_System.md`. Their rows already fail on `main`, and their values move.
- **Currentness edition:** an edition that includes Automated Testing, Contracts, Orchestrator, storage-plan and the storage value registry. Until then `test_pm_pnc019_currentness` fails with their drift rows.
- **Run-002:** `refresh-batch-hashes` for batch report rows 32 to 40, 117 to 141 and 212, with `main`'s pending rows.
- **Readiness:** the implementation-readiness gate report.
- **Snapshot:** the nightly `snapshot-current`, for the current-run rows.

## .gitignore line needed

`tests/test_pm_coordination_events.py` is new. The `tests/` rule ignores it, so it was committed with `git add -f`. It needs the line `!/tests/test_pm_coordination_events.py` in `.gitignore`. Only Jared can approve that edit, and he is being asked.

## Open questions

1. **The blind review has not run.** The procedure asks for one blind form-driven review before landing, with a cap of two cycles. Each stage log lists the choices the review should look at, for example the new readiness rule, the schema encodings beyond CV-353's literal text, the eighth ledger row with no registry row, and the event ID including the recovery epoch. So do stage 3's choices: the guard generalization, including the holding-bucket test list, and the checker's pinning of the two storage value registry rows' prose (as the Browser checkers do).
2. **The rebase.** The coordinator lands, so the coordinator rebases. The proposed resolution of the two storage-plan hunks is in the evidence directory. If the review runs before the rebase, it should know that the section 2.3.1 read-token bullet will then list six rows.
3. **The holding-bucket harness.** `PostAugustAdmissionTests` now reads each admitted coordination family's decision entry from its real DL-077 admission record. The test drives the frozen seal check in a temporary root. The change is test data only, but it touches the DL-077 harness, so the coordinator should confirm it.
4. **R6, the disposition rows** at each admission (Step 9 plan): the procedure says to update the row, but the schema note says the row "stays as written". This still needs the coordinator's ruling before the first admission. The simulation did not touch disposition rows.
5. **D-02, whose decision entry an admission record cites.** It is answered by DL-093 on `plans/ea-step09-batch2-answers-20260925`, which has not landed. That branch shares only `Plans/.plan_index` with this one.
6. **`coordination_heartbeat_expiry_ms` has no value** (risk R-B). Until runtime policy supplies it, `heartbeat_expired` is never inferred. A number would be a runtime policy choice, not part of this contract.
7. **Per-family join negatives and identity vectors** (risk R-C). Adding them to the fixtures is a small change for the fixture owner before the first admission.
8. **`coordination.debug_mirror_exported`** keeps its open items from the ledger: owner binding and producer, identity recipe, retention anchor (its payload has no `run_id`), closed domains, and its own landing. SP-232's criterion that mirror recovery is recorded with it stays unmet until then.
9. **The Step 9 plan's line references** to the pin lines are out of date by the lines added above them (see "Each admission landing").
