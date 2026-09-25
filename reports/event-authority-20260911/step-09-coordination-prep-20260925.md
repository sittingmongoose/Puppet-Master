# Step 9 batch 2: coordination preparation, seven families, no admission (2026-09-25)

Branch `plans/ea-s09-coordination-prep-20260925`, cut from `origin/main` `1e5d9b097b` and rebased on 2026-09-25 onto `origin/main` `c98cccb257` (the Step 8(c) second half, `main` `bfa4c8a415`, and its landing record). It prepares the full contracts of seven coordination families:
- `coordination.agent_registered`
- `coordination.agent_status_updated`
- `coordination.agent_operation_updated`
- `coordination.agent_file_ownership_updated`
- `coordination.agent_unregistered`
- `coordination.agent_crashed`
- `coordination.agent_aborted`

It admits nothing. No row is added to `Plans/event_family_registry.json`, no checkpoint or pin moves, and no DL-077 admission record is written. Each family is admitted later in its own Storage admission landing: one family per landing (DL-045), with its own DL-077 admission record and the DL-078 checkpoint move.

**Status.** Contracts, schemas, Storage rows, ledger, fixtures, checker, guards and oracles are written. The branch is rebased onto `main` `c98cccb257`. Its one source conflict, two hunks in `Plans/storage-plan.md` section 2.3.1, was merged with the text proposed before the rebase (see "The rebase"). Every check passes except the expected governance staleness. Not done yet: the one blind form-driven review (cap two cycles) has not run.

The branch was written in three stages. The per-family search is `reports/event-authority-20260911/step-09-coordination-binding-search-20260925.md`. The stage log is `/mnt/Cursor/PM-Experiments/ea-step09-batch2-20260925/prep-compile-log.md`. It also records the rebase and maps each commit to its rebased hash. The hashes in this report are the rebased ones.

## What changes

| Surface | Paths | What | Commits |
|---|---|---|---|
| Per-family search | `reports/event-authority-20260911/step-09-coordination-binding-search-20260925.md` | DL-045's documented search: one section per family, partial contracts cited, scoped negative evidence | `95d490a9f1` |
| Semantic owner | `Plans/orchestrator-subagent-integration.md` | New section "Coordination event authority (DL-045, 2026-09-25)", OSI-438: producers and entry points, closed domains, agent identity, append on change, heartbeats as liveness, crash and abort resolution, legacy sketch fields, file claims, restart, readers | `561bc50219`, `f98cbf2b44`, `8b235dc769` |
| Payload owner | `Plans/Contracts_V0.md`, `Plans/coordination_event_payloads.schema.json` | CV-353: the closed payload schema, one definition per coordination row, shared lineage envelope and reference form, EventRecord joins; a pointer from the coordination rows | `376f48c47e`, `9cfe7432de`, `8b235dc769` |
| Storage owner | `Plans/storage-plan.md`, `Plans/coordination_projection_contracts.schema.json` | SP-320: append admission, projector, five readers, checkpoint value with SP-278 and the nine-field durable token, identity recipes, transition table, first-receipt custody, custody, retention anchor, replay, recovery, withdrawal; a pointer from section 2.3.2; section 2.3.1 rules | `7c53cd1515`, `8664329852`, `d2f1ddc345`, `6cd7182110`, `8b235dc769` |
| Storage value registry | `Plans/storage_value_registry.json` | `coordination_event_records` and `coordination_read_model_projections` materialized in place; the retention text contradiction (K8) fixed | `6cd7182110` |
| Readiness | `scripts/pm-implementation-readiness.py` | The "SP-320 keyed value compositions" rule, the coordination checkpoint in the read-token lists, census 274 materialized and 19 deferred, 10 self-tests | `6cd7182110` |
| Census pins | `tests/test_shared_runtime_storage_contracts.py`, `tests/test_pm_runtime_vocabulary_migration.py`, `tests/test_pm_onboarding_phases.py` | Moved for the two materialized rows only | `6cd7182110` |
| Admission ledger | `Plans/coordination_event_admission.json` and `.schema.json` | Eight rows `prepared_not_admitted`; seven carry the final registry row and its SHA-256; `coordination.debug_mirror_exported` is outside the batch with no row | `40e55b30cb` |
| Fixtures | `Plans/coordination_event_contract_fixtures.json` | 42 positive and 67 negative payloads, 12 EventRecord join negatives, 6 identity and 9 path vectors, 22 transition sequences with final state, 11 positive and 20 negative projection values, 13 native obligations `NOT_RUN` | `3e9eb65193` |
| Checker | `scripts/pm_coordination_events.py`, `tests/test_pm_coordination_events.py` | Static checker and 39 unittest tests (see "Checks") | `8c5f511ca7`, `abeea894e4`, `96746ce7ba` |
| Closed-world guards | `scripts/pm-browser-event-admission.py`, `tests/test_pm_testing_session_events.py`, `tests/test_pm_github_project_integration.py`, `tests/test_pm_browser_event_admission.py`, `tests/test_event_authority_holding_bucket.py` | Accept a row the coordination ledger marks admitted, only as its exact prepared row, and nothing else | `abeea894e4` |
| Oracles | `Plans/Automated_Testing_System.md` | ATS-058, the oracle entry for the seven families | `96746ce7ba` |
| Derived | `Plans/_shards/` (Automated Testing 40, Contracts 62, Orchestrator 14, storage-plan 85, storage value registry 569) and `Plans/.plan_index` | Regenerated with each Plans edit; no other document's shards changed | with each edit |

In numbers, against `c98cccb257` and without this report: 22 source files (12,775 lines added, 124 removed), 770 shard files and 6 index files. PlanUnits go from 6,728 to 6,732 (OSI-438, CV-353, SP-320, ATS-058), and acceptance units from 26,260 to 26,290. Against `1e5d9b097b` there were 765 shard files. The difference is the storage value registry: `main`'s Step 8(c) second half re-sharded it, and this branch's regeneration now rewrites 569 of its shard files instead of 564. The other counts are unchanged.

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
| Idempotency key `coordination:{event_type}:{project_id}:{agent_id}:{recovery_epoch}:{agent_revision}`, with the recovery epoch its event ID uses (review repair CP-02); event ID `evt_coordination_` plus SHA-256 of the RFC 8785 identity array; the `agent_revision` rule; `path_ref` normalization and `path_hash`; the `projection_scope` grammar | Recipes | SP-320 |
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

## The rebase

On 2026-09-25 the branch was rebased with `git rebase origin/main` onto `c98cccb257`. The tip before was `b74a14c3b8` on `1e5d9b097b`. The rebased tip was `aeb65ca459`, and this update is the commit after it.

- **Derived files.** Ten of the 16 commits regenerate derived files, and the rebase stopped at each of them:
  - The index files conflicted at all ten.
  - The storage-plan shards conflicted at the five storage-plan commits (84 or 85 files).
  - At `6cd7182110`, 557 storage value registry shards conflicted as well. These include add/add conflicts on four of `main`'s new shard names, and a rename/delete of `551-lines-110001-110108.md`.

  At each stop the conflicted derived files took the upstream side, which is `main` plus the commits already replayed. The one file with no upstream version was removed. Then both generators ran: `pm-shard-plans.py --generate --config Plans/sharding_config.json`, then `pm-plan-index.py generate`. After that, only the shard directories of the documents that commit edits differed from the upstream side. The regenerated Orchestrator, Contracts and Automated Testing shards are byte-identical to the original commits'. No derived file was merged by hand.
- **Sources.** Every source change that git merged on its own adds and removes exactly the lines the original commit did. That covers the storage-plan edits of four commits and the Contracts and Orchestrator edits, and at `6cd7182110` also `Plans/storage_value_registry.json`, `scripts/pm-implementation-readiness.py` and the three pin tests. Where `main` edited the same files, it edited other rows and lines.
- **The one source conflict**, at `6cd7182110`: two hunks in `Plans/storage-plan.md` section 2.3.1. Both hunks were byte-identical to the trial merge's, and both took the text proposed before the rebase:
  - The "SP-278 read tokens" bullet now lists six rows: "Six checkpoint rows persist the durable token as a required field: `browser_workspace_created_index_checkpoint`, `browser_workspace_reset_index_checkpoint` and `seglog_observability_reader_checkpoint` as `index_read_token`, `home_layout_event_reader_checkpoint` and `restore_point_expired_checkpoint` as `generic_read_token` (DL-076; the created row since SP-266's v2 value became current on 2026-09-25), and, from 2026-09-25, the checkpoint member of `coordination_read_model_projections` as `index_read_token` (SP-320)."
  - Its last sentence now reads "Until 2026-09-24 the reset, seglog, Home and restore-point expiry rows persisted the whole token". This branch's "SP-320 keyed value compositions" bullet follows, unchanged.
  - The closing paragraph keeps `main`'s sentence on the created v2 value, "a fifth stored checkpoint value", and then adds this branch's two sentences on SP-320.
  - `main`'s line and this branch's line in the readiness self-test's persisted-token list merged side by side. The list therefore holds the same six rows as the bullet.
- **Result.**
  - `Plans/storage-plan.md` is byte-identical to the proposed resolution, `trial-merge/storage-plan.resolved.md` in the stage 3 evidence (SHA-256 `5b1b95a7044d34d20fd6ef3cfe129b426deeb4486ec6185c95d4be1b87f25d54`).
  - Every other source file equals a fresh `git merge-tree` of `main` and `b74a14c3b8`.
  - A fresh regeneration at the tip changes only the `generated_at_utc` line of four index files.
- **Passages re-read at `main`** in the files `main` changed:
  - Section 2.3.1: the rules this branch relies on are unchanged. A `*_read_token` field is a read selector only when its schema is exactly SP-278's token or the nine-field durable projection, and no stored value keeps `redb_snapshot_id`. Replay dispatches by schema, never by key template. Only the list of durable-token rows grew.
  - `main`'s new sentence on the created row's registered-read handoff agrees with "Every other row keeps the single stored header". The created row's root is still one closed object.
  - `main`'s other storage-plan edits are in SP-266's two sections, which this branch does not cite. SP-232, SP-278 and SP-286 are unchanged; the last two are 24 lines further down.
  - The search report cites the storage plan and the storage value registry in 60 places. None of them changed at `main`, and all 37 quotes from those passages are still there. The report's line numbers stay those of `1e5d9b097b`, as it says. Only STO 21923 moved, to 21947 at `main`.
  - In the storage value registry, `main` changed only the created row. The two coordination rows and both retention policies are unchanged.
  - In `Plans/browser_event_admission.json`, `main` changed only the created row's `authority_contract_ref`. Both Browser rows are still admitted.

## Checks

Run in the worktree at `aeb65ca459`, the rebased tip before this update. This update changes only this report. The comparison ran in a `git archive` export of `origin/main` `c98cccb257` at `/mnt/Cursor/PM-Experiments/ea-step09-batch2-20260925/main-export-c98`, with the currentness edition symlinked. The export was deleted afterwards.

| Check | Result |
|---|---|
| `python3 scripts/pm_coordination_events.py` | pass, 0 failures: 42 positive and 67 negative payload cases, 12 join negatives, 6 identity and 9 path vectors, 22 sequences with 83 steps, 11 positive and 20 negative projection values, 13 native obligations `NOT_RUN`, 7 prepared registry rows; admitted rows none. The report is byte-identical to the one before the rebase. |
| `tests.test_pm_coordination_events` | 39 OK |
| `tests.test_pm_browser_event_admission` | 38 OK |
| `tests.test_pm_testing_session_events` | 11 OK |
| `tests.test_pm_github_project_integration` | 15 OK |
| `tests.test_pm_browser_workspace_created` | 65 OK (`main` added two) |
| `tests.test_pm_browser_workspace_reset` | 53 OK |
| `tests.test_shared_runtime_storage_contracts` | 15 OK |
| `tests.test_event_authority_holding_bucket` | 34 OK |
| `tests.test_pm_emit_only_event_boundaries` | 13 OK |
| `tests.test_pm_onboarding_phases` | 42 OK, with this branch's 88-row prefix digest |
| `tests.test_pm_runtime_vocabulary_migration` | 9 OK |
| `python3 scripts/pm-browser-event-admission.py` | pass; the report is byte-identical to the one before the rebase |
| `pm-implementation-readiness.py validate` | 36 failures here, 33 on `main`. The 3 new rows are currentness drift for Automated Testing, Contracts and Orchestrator. Six rows already fail on `main` and change value here: the 4 Spec Lock rows (the registry once, the readiness script in three lock groups) and the PNC-019 receipt rows for the storage value registry and Automated Testing. |
| `pm-implementation-readiness.py self-test` | The same single failing scenario on both, `case_l_verification_integration`, with the same three checks false. The branch adds 10 storage checks, all true (67 against 57). |
| Shard check | pass, 99 documents, 2,739 shards |
| `pm-plan-index.py validate` | pass, 6,732 PlanUnits, 26,290 acceptance units |
| `tests.test_pm_pnc019_currentness` | 8 OK and 1 failure, as expected, on drift rows only: 8 here, 5 on `main`. This branch adds Automated Testing, Contracts and Orchestrator. `main` already has the Decision Log, Goal Runtime, Section 15, storage-plan and the storage value registry, and this branch edits the last two as well. |
| Lints, on exports of both | `lint-contractrefs`: only the existing `00-plans-index.md` line 81, as on `main`. `lint-path-refs`: the same 111 rows as `main`, apart from `plan_units.jsonl` line numbers. They all name paths outside the exports (`Concepts/`, `AGENTS.md`, `.claude/`, `.gitignore`), and none is on the four new units. `lint-banned-phrases`: pass. |

**Simulated first admission, repeated after the rebase.** A scratch export of `aeb65ca459` took `coordination.agent_registered` through its landing. The prepared row was appended and the registry revision set to a simulated `2026-09-26.1`. The ledger row was flipped, the DL-078 pins were moved, and a simulated DL entry and DL-077 admission record were written. Every suite passes except the expected currentness drift (this tip's 8 drift rows, plus source drift for `Plans/event_family_registry.json` and the live-registry drift). The checker reports `coordination.agent_registered` as its one admitted row, and the Browser gate passes. Before the rebase, two lighter variants showed where the landing's own writes are needed:
- With only the row, the ledger and the revision, the holding-bucket tests and one guard test want the DL-077 admission record. Currentness also reports the unmoved checkpoint.
- With the DL-078 pins moved as well, only the admission record is missing, besides the currentness drift.

No guard or test outside the DL-078 pins needs an edit.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-09-coordination-prep-rebased-20260925/`, 246 files, `SHA256SUMS` SHA-256 `48d579e9a2c61c7bd8505d20509cf618a750dae38ee8ad1dc9f823165aa3f0b7`. Its `README.txt` says what each file is. The trial merge, the pre-rebase checks and the two lighter simulation variants stay in `step-09-coordination-prep-checks-20260925/`.

| File | SHA-256 |
|---|---|
| `rebased-tip/pm_coordination_events.json` | `e487ee5ded4f4a1d13723cea6adbed2ff4056bc5a4d15202a7e953f98bd202c0` |
| `rebased-tip/readiness-validate.json` | `3c742ef3c0aeba91b128a7998c9a0faad4250315a5ec4e68d88531338eb10687` |
| `main-c98cccb257/readiness-validate.json` | `94e6e1154ec68d8dbe4fc4aa53e2f3f3936b15fda73e8a60df068aa9a006c595` |
| `rebased-tip/readiness-self-test.json` | `331cc532a0faa61be84c929a314fc3b71be4022f93ce7bf6c3eee214087e3eba` |
| `main-c98cccb257/readiness-self-test.json` | `9aecdab8e2940bcb476bc3e8009b0eba58dd9b181a2c25d38c618280e08e53c2` |
| `rebased-tip/currentness-rows.json` | `a4874a45342fd12598de1f986b4a532263dec88813ae2af5a1365b8478903346` |
| `rebase/commit-map.txt` | `5245c9f110d55b99f4e3071268dda61a59d0a3b7f55c09ce1679c65ed0d3417b` |
| `rebase/final-checks.txt` | `3ea8e426eee6b62cbca30bc2df7e4f7fc3862b7bd00c65dc32f6856a6ad125a0` |
| `reread/binding-search-sto-svr.json` | `316558b9507d994685c5e686eb0c26aafc7b5f1d8d81c1e06f8e2d759b184284` |
| `simulation/simF-admit-pins-writes/exit_codes.txt` | `c49aa1cfa0f3a7d1263aa20d0842b6b7bcb1b712079e21d9d31bc93075922287` |
| `forecast-prep-landing-rebased.json` | `d7d7daa225a39ed43771823f976906fb3da34950e6bb29256b2e2889e6a772b8` |
| `forecast-first-admission-rebased.json` | `89b604cabc828ae674d7212b32c44d58984b668ce506f6bb7c9d80add7139c87` |

## Expected at landing

### The preparation landing

1. **Rebase.** Done: the branch is on `main` `c98cccb257` (see "The rebase"). If `main` moves again before the landing, rebase again the same way:
   - Take `main`'s side of every conflicted derived file, then regenerate. Never merge a derived file by hand.
   - In a source conflict, keep both sides' meaning.
   - Re-read the passages this branch cites in every file `main` changed.
   - Rerun the readiness self-test.
2. **Documents that go stale.** New with this landing: `Plans/Automated_Testing_System.md`, `Plans/Contracts_V0.md` and `Plans/orchestrator-subagent-integration.md`. Already stale on `main`, and moved again: `Plans/storage-plan.md` and `Plans/storage_value_registry.json`.
3. **Spec-Locked files.** Newly stale: the same three documents. Already stale on `main` since the Step 8(c) landings, with hashes moved again: `Plans/storage-plan.md`, `Plans/storage_value_registry.json` and `scripts/pm-implementation-readiness.py`. Not in Spec Lock: the five new Plans JSON files, `scripts/pm-browser-event-admission.py`, `scripts/pm_coordination_events.py` and the tests.
4. **Estimated landing-check rows.** Measured, not guessed: the governance subchecks ran on sparse exports of `main` `c98cccb257` and of the rebased tip `aeb65ca459`, and only the differences are used. They are the same as those measured on the trial merge before the rebase. Each aggregate (`run-gates` and `audit-governance`) should gain:

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
- **Measured for the first admission** against this branch's rebased tip, the same as before the rebase:
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
  - The file lists gain the new shard files: Automated Testing's `038-ats-058-...` and `storage-plan/083-coordination-event-persistence-binding-...`.
  - The storage value registry's file list is already in the reseal list from `main`'s re-sharding: `551-lines-110001-110108.md` is gone, and `551-lines-110001-110200.md` to `555-lines-110801-110832.md` are new. After this landing, `555-lines-110801-110832.md` is gone as well, and `555-lines-110801-111000.md` to `566-lines-113001-113004.md` are new. No sealed name is removed by this branch, so it adds no `missing_ref` row.
- **PNC-019 certification receipt:** the source hashes of `Plans/storage_value_registry.json` and `Plans/Automated_Testing_System.md`. Their rows already fail on `main`, and their values move.
- **Currentness edition:** an edition that includes Automated Testing, Contracts, Orchestrator, storage-plan and the storage value registry. Until then `test_pm_pnc019_currentness` fails with their drift rows.
- **Run-002:** `refresh-batch-hashes` for batch report rows 32 to 40, 117 to 141 and 212, with `main`'s pending rows.
- **Readiness:** the implementation-readiness gate report.
- **Snapshot:** the nightly `snapshot-current`, for the current-run rows.

## .gitignore line needed

`tests/test_pm_coordination_events.py` is new. The `tests/` rule ignores it, so it was committed with `git add -f`. It needs the line `!/tests/test_pm_coordination_events.py` in `.gitignore`. Only Jared can approve that edit, and he is being asked.

## Open questions

1. **The blind review has not run.** The procedure asks for one blind form-driven review before landing, with a cap of two cycles. Each stage log lists the choices the review should look at, for example the new readiness rule, the schema encodings beyond CV-353's literal text, the eighth ledger row with no registry row, and the event ID including the recovery epoch. So do stage 3's choices: the guard generalization, including the holding-bucket test list, and the checker's pinning of the two storage value registry rows' prose (as the Browser checkers do).
2. **The rebase is done**, onto `c98cccb257` (see "The rebase"). The review should read section 2.3.1 as merged: the read-token bullet lists six rows, and the closing paragraph carries `main`'s created-v2 sentence as well as this branch's SP-320 sentences. If `main` moves again before the landing, the coordinator rebases again the same way.
3. **The holding-bucket harness.** `PostAugustAdmissionTests` now reads each admitted coordination family's decision entry from its real DL-077 admission record. The test drives the frozen seal check in a temporary root. The change is test data only, but it touches the DL-077 harness, so the coordinator should confirm it.
4. **R6, the disposition rows** at each admission (Step 9 plan): the procedure says to update the row, but the schema note says the row "stays as written". This still needs the coordinator's ruling before the first admission. The simulation did not touch disposition rows.
5. **D-02, whose decision entry an admission record cites.** It is answered by DL-093 on `plans/ea-step09-batch2-answers-20260925`, which has not landed. That branch shares only `Plans/.plan_index` with this one.
6. **`coordination_heartbeat_expiry_ms` has no value** (risk R-B). Until runtime policy supplies it, `heartbeat_expired` is never inferred. A number would be a runtime policy choice, not part of this contract.
7. **Per-family join negatives and identity vectors** (risk R-C). Adding them to the fixtures is a small change for the fixture owner before the first admission.
8. **`coordination.debug_mirror_exported`** keeps its open items from the ledger: owner binding and producer, identity recipe, retention anchor (its payload has no `run_id`), closed domains, and its own landing. SP-232's criterion that mirror recovery is recorded with it stays unmet until then.
9. **The Step 9 plan's line references** to the pin lines are out of date by the lines added above them (see "Each admission landing").
