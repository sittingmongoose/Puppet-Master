# Shard 038: ATS-058 — Coordination event oracles for the seven agent families (DL-045, 2026-09-25)

Source: `Plans/Automated_Testing_System.md`

Source lines: L5186-L5302

Source SHA256: `8e1c5cdd55fa0efb70f1406d409cdcfcd352674c9460b17760449f33a4fa4e13`

---

## ATS-058 — Coordination event oracles for the seven agent families (DL-045, 2026-09-25)

<a id="coordination-event-oracles-dl-045-2026-09-25"></a>

This is a **newly authored owner contract under DL-045**. It names the oracles of seven coordination agent families: `coordination.agent_registered`, `coordination.agent_status_updated`, `coordination.agent_operation_updated`, `coordination.agent_file_ownership_updated`, `coordination.agent_unregistered`, `coordination.agent_crashed` and `coordination.agent_aborted`. Their contracts are OSI-438 in `Plans/orchestrator-subagent-integration.md` (semantics and producers), CV-353 in `Plans/Contracts_V0.md` (closed payloads) and SP-320 in `Plans/storage-plan.md` (persistence, identity, transitions, projector and checkpoint). The per-family search `reports/event-authority-20260911/step-09-coordination-binding-search-20260925.md` lists every tracked file under `Plans/`, `scripts/`, `tests/` and `reports/` that named each family at its base commit. None of them was a fixture, a test, a checker or an entry in this document, so no oracle existed for any of the seven.

Nothing here admits a family. Each of the seven stays quarantined before append or projection, and absent from `Plans/event_family_registry.json`, until its own Storage admission landing, one family per landing (DL-045). `coordination.debug_mirror_exported` is outside this entry. The fixtures hold a few of its payload cases only because the Storage record family `coordination_event_records` covers every key shape.

**Static oracles.** They run now, and they must pass:
- The fixtures, `Plans/coordination_event_contract_fixtures.json`. They hold positive and negative payload cases per family, EventRecord envelope join cases, identity and path vectors, transition sequences with their final agent, claim and operation state, projection and checkpoint values, and the native obligations listed below.
- The checker, `python3 scripts/pm_coordination_events.py`, and its unittest module `tests/test_pm_coordination_events.py`. The checker validates the closed payload schema against the Contracts rows, the projection schema and its binding record, the admission ledger `Plans/coordination_event_admission.json` and the final registry row that each family's landing will append, the two Storage value registry rows, and every fixture expectation. It fails when a coordination family is in the event family registry while its ledger row is `prepared_not_admitted`, and when an admitted family's registry row differs from its prepared row.
- A pass shows static contract consistency and nothing more. It proves no producer, crash detector, append path, projector, reader, durability, readiness or seal.

**Per family.** Each family has its own cases. A sibling appears only as a transition partner inside a sequence, never as evidence for another family (DL-039). Each family's ledger row lists its case IDs in `validation_case_ids`.

| Family | Positive payloads | Negative payloads, by first failing layer | Transition sequences | Native obligations of its own |
|---|---|---|---|---|
| `coordination.agent_registered` | 8 | 12. Schema, 10: a sketch field, the legacy `worktree_path`, no `project_id`, no `agent_type`, a platform value outside the lowercase identifier form, a revision other than 1, `expected_previous_revision` at registration, a null, an offset timestamp, a zero-padded revision in the key. `identity_recipe`, 1: a key naming another agent. `valid_utc_datetime`, 1: an impossible date. | `lifecycle_registration_to_unregister`, `registration_retry_and_conflict`, `registration_not_admitted` | `COORD-APPEND-01` |
| `coordination.agent_status_updated` | 9 | 9. Schema, 8: a terminal status value, a wrong letter case, a heartbeat `last_update` field, no `run_id`, revision 1, a credential-shaped, multi-line or empty reason. `identity_recipe`, 1: a key with the wrong revision. | `stale_revision_refused`, `event_before_registration_refused`, `event_after_terminal_refused`, `unchanged_status_not_appended`, `lineage_mismatch_refused`, `not_yet_admitted_family_quarantined` | `COORD-HEARTBEAT-01` |
| `coordination.agent_operation_updated` | 4 | 13, all schema: a summary holding a key or bearer token, a summary over 512 characters, `progress_pct` over 100 or fractional, empty, duplicate or more than 16 refs, a ref holding an absolute path, a ref without a kind, a platform value outside the lowercase identifier form, no `agent_id`, a prompt excerpt field. | `lifecycle_registration_to_unregister`, `operation_latest_event_wins`, `operation_stale_then_after_terminal`, `exact_retry_after_progress`, `interim_window_update_and_abort_families_not_admitted` | `COORD-HEARTBEAT-01` |
| `coordination.agent_file_ownership_updated` | 6 | 12. Schema, 11: low confidence, a release claim kind, an absolute, `..`, `./` or trailing-slash path, a Windows drive path, a home-relative path, an uppercase hash, the legacy `file_path`, no `platform`. `path_hash_recipe`, 1: the hash of another path. | `file_claim_supersession_and_release`, `file_claim_stale_then_after_terminal`, `interim_window_update_and_abort_families_not_admitted` | `COORD-HEARTBEAT-01` |
| `coordination.agent_unregistered` | 5 | 6, all schema: a non-terminal status, `superseded`, a local-path result ref, no `finished_at_utc`, no `run_id`, a crash field. | `lifecycle_registration_to_unregister`, `second_terminal_event_refused`, `unregister_loses_race_to_abort`, `interim_window_terminal_families_not_admitted` | `COORD-RACE-01` |
| `coordination.agent_crashed` | 5 | 6, all schema: an unknown reason, `heartbeat_expired` without `heartbeat_age_ms`, a negative age, a threshold field, an empty process ref, no `agent_id`. | `crash_by_heartbeat_expiry`, `crash_by_worktree_loss`, `second_terminal_event_refused`, `abort_loses_race_to_crash`, `interim_window_terminal_families_not_admitted` | `COORD-RACE-01`, `COORD-RESTORE-01`, `COORD-HEARTBEAT-01` |
| `coordination.agent_aborted` | 5 | 8. Schema, 7: an unknown reason, a ref kind that does not match the reason (three cases), a parent abort without `parent_run_id`, no `project_id`, a crash field. `abort_ref_join`, 1: a parent ref naming another run. | `abort_by_parent`, `event_after_terminal_refused`, `unregister_loses_race_to_abort`, `abort_loses_race_to_crash`, `interim_window_update_and_abort_families_not_admitted` | `COORD-RACE-01` |

Every family also shares `COORD-RETRY-01`, `COORD-UNCERTAIN-01`, `COORD-CAS-01`, `COORD-TOKEN-01`, `COORD-QUARANTINE-01`, `COORD-READER-01`, `COORD-WITHDRAW-01`, `COORD-RETENTION-01` and `COORD-MIRROR-01`. The twelve EventRecord join negatives are built on one status event, and the join rules they test are the same for all seven families (CV-353 rule 8).

**Native obligations.** They stay NOT_RUN until native code exists and they are actually executed. No static check stands in for them.

| Oracle | Given | Required result |
|---|---|---|
| `COORD-APPEND-01` | An admitted registration from the Orchestrator before node execution | One appended EventRecord and its first AppendReceipt; execution starts only after the receipt returns |
| `COORD-RETRY-01` | A lost append acknowledgement for an admitted coordination event | `storage.first_append_receipt.resolve.v2` returns the original receipt and `original_append_result`; no first mint and no second append |
| `COORD-UNCERTAIN-01` | An uncertain append of an agent's event | The agent stays fenced: no later event for that agent until Storage resolves the original identity |
| `COORD-CAS-01` | A projector advance whose checkpoint changed after it was read | Prior-value compare-and-swap fails; no row or checkpoint advances |
| `COORD-TOKEN-01` | A checkpoint advance, read and recovery | The stored nine-field durable token is joined to the live read's `redb_snapshot_id` and revalidated whole; an equal generation alone proves nothing |
| `COORD-RACE-01` | A crash resolution racing a normal unregister at the same revision | The first terminal event appends; the other gets `coordination_conflict` `stale_revision` and appends nothing |
| `COORD-RESTORE-01` | A verified restore of an older backup with non-terminal agents whose processes are gone | The crash detector resolves each with `process_lost` as a new operation; no lost or restored request is replayed |
| `COORD-QUARANTINE-01` | An event of a family that is not admitted | Quarantined before append; no checkpoint advance; no sibling state inferred |
| `COORD-HEARTBEAT-01` | Agent liveness heartbeats and observations that change nothing | No heartbeat reaches the append admission; unchanged updates return `coordination_unchanged`; no `heartbeat_expired` crash until `coordination_heartbeat_expiry_ms` exists |
| `COORD-READER-01` | A scheduler or prompt-context read while the checkpoint is not current, coverage is short or the publication changed | Typed unavailable; the scheduler treats it as `coordination_conflict` and neither schedules nor injects context |
| `COORD-WITHDRAW-01` | Withdrawal of one admitted family | Writer admission cut off, current core withdrawn, projector and readers fenced, governed rebuild from kept seglog records; no seglog deletion |
| `COORD-RETENTION-01` | Coordination records of a Run whose terminal canonical record has not resolved | Not eligible for expiry under `RP-COORDINATION-180D` |
| `COORD-MIRROR-01` | A stale or corrupt `.puppet-master/state` mirror | Never authority for scheduling, prompts, unregister, crash, abort, receipt or validation decisions |

```yaml
plan_unit_id: ATS-058
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-045. The oracles of coordination.agent_registered,
  coordination.agent_status_updated, coordination.agent_operation_updated,
  coordination.agent_file_ownership_updated, coordination.agent_unregistered, coordination.agent_crashed and
  coordination.agent_aborted are the fixtures in Plans/coordination_event_contract_fixtures.json and the static
  checker python3 scripts/pm_coordination_events.py with its unittest module tests/test_pm_coordination_events.py.
  Each family has its own positive payload cases, negative payload cases rejected at a stated layer and
  transition sequences, named in its admission ledger row. The checker must pass. It fails when a family is in
  the event family registry while its ledger row is prepared_not_admitted, or when an admitted row differs from
  its prepared registry row. The thirteen native obligations COORD-APPEND-01 to COORD-MIRROR-01 stay NOT_RUN
  until executed natively, and a static pass is never native proof, admission, readiness or a seal. Nothing is
  admitted.
gui_related: false
gui_classification_reason: Defines static and native oracles for backend coordination events, not presentation.
depends_on:
- OSI-438
- CV-353
- SP-320
unblocks: []
acceptance_criteria:
- python3 scripts/pm_coordination_events.py exits 0 with no failures, and python3 -m unittest tests.test_pm_coordination_events passes.
- Each of the seven families has at least one positive payload case, one negative payload case that fails at its stated layer and one transition sequence of its own, and its ledger row names them.
- Every transition sequence reproduces its stated results and its final agent, claim and operation state under the SP-320 admission order.
- No coordination family is registered while its ledger row is prepared_not_admitted, and an admitted family's registry row equals its prepared row byte for byte in canonical JSON.
- The thirteen native obligations stay NOT_RUN until executed natively, and no static result is reported as native proof, admission, readiness or a seal.
validation_surfaces:
- python3 scripts/pm_coordination_events.py
- python3 -m unittest tests.test_pm_coordination_events
- Plans/coordination_event_contract_fixtures.json
- Plans/coordination_event_admission.json
risk_class: coordination_oracle_gap_or_false_native_claim
reasoning_tier: high
context_scope: coordination_event_oracles_seven_families
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/coordination_event_contract_fixtures.json
- Plans/coordination_event_admission.json
- scripts/pm_coordination_events.py
node_compile_hint:
  mode: validation_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20260911/step-09-coordination-binding-search-20260925.md
- Plans/orchestrator-subagent-integration.md#OSI-438
- Plans/Contracts_V0.md#CV-353
- Plans/storage-plan.md#SP-320
preserved_exact_tokens:
- pm_coordination_events.py
- coordination_event_contract_fixtures.json
- prepared_not_admitted
- NOT_RUN
- COORD-APPEND-01
- COORD-MIRROR-01
negative_constraints:
- No admission, registry row, checkpoint or pin move, and no native, readiness or seal claim from a static pass.
- No family's oracle is inferred from a sibling's cases; siblings appear only as transition partners.
- No heartbeat record and no fixed heartbeat-expiry number in any case.
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/orchestrator-subagent-integration.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-045, ContractName:Plans/orchestrator-subagent-integration.md#OSI-438, ContractName:Plans/Contracts_V0.md#CV-353, ContractName:Plans/storage-plan.md#SP-320, ContractName:Plans/coordination_event_contract_fixtures.json, ContractName:Plans/coordination_event_admission.json
