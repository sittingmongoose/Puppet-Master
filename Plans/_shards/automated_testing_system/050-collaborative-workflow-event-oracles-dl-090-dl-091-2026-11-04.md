# Shard 050: Collaborative workflow event oracles (DL-090, DL-091, 2026-11-04)

Source: `Plans/Automated_Testing_System.md`

Source lines: L7239-L8711

Source SHA256: `47603583797be60fba3eeb532651ca6424b88f930dd44bac6c8e61f133bb185e`

---

## Collaborative workflow event oracles (DL-090, DL-091, 2026-11-04)

This is a **newly authored owner contract under DL-090** (DL-091 for `collaboration.failed`). It names the oracles of the 18 collaborative workflow families: `collaboration.created`, `collaboration.started`, `collaboration.paused`, `collaboration.resumed`, `collaboration.cancelled`, `collaboration.completed`, `collaboration.failed`, `collaboration.participant_started`, `collaboration.participant_completed`, `collaboration.message_added`, `collaboration.artifact_added`, `collaboration.configuration_changed`, `brainstorm.proposal_added`, `brainstorm.vote_added`, `brainstorm.plan_synthesized`, `review.finding_added`, `review.finding_dispositioned`, `review.artifact_finalized`. Their contracts are CWR-105 to CWR-123, CV-460 to CV-478 and SP-460 to SP-478. Nothing here admits a family.

### ATS-230 - Shared static and native oracles of the collaborative workflow families

**Static oracles.** They run now and must pass:
- The fixtures `Plans/collaboration_event_contract_fixtures.json`: 127 positive and 193 negative payloads with their first failing layer, plus 19,322 schema negatives and 276 valid schema counterparts, 36 valid EventRecords (each family in both scopes) and 100 envelope join negatives, 54 identity vectors (each family in both scopes and under a new recovery epoch), 15 transition sequences with 115 accepted/retry steps plus 117 independently captured refusal pre-states and their expected results and final state, 11 valid and 15 invalid projection and checkpoint values, and 23 native obligations, all `NOT_RUN`.
- The checker `python3 scripts/pm_collaboration_events.py` and its `--self-test`. The checker validates the payload schema against Collaborative Workflows' closed sets, the projection schema and its binding record against the SP-278 durable token, the admission ledger `Plans/collaboration_event_admission.json` and every prepared registry row against the registry schema and its SHA-256, each family's owner units, and every fixture expectation, running the transition sequences through its own reducer of SP-460 to SP-478. It fails when one of the 18 is in the event family registry while its ledger row is `prepared_not_admitted`, or when an admitted row differs from its prepared row. It reports a missing or mismatched `RP-CHAT-THREAD-LIFETIME@1.0.0` as an admission blocker; the landed Storage registry supplies the current object. The self-test plants one defect per scenario and requires the checker to find it.
- Whole-lane check 11 is `python3 scripts/pm_collaboration_events.py --guard-removal`: isolated in-memory decision, shape-invariant and integrity mutants; each row lists flipping negatives and the unchanged rejection manifest. Named duplicate assertions are removed as a group, never weakened in the installed checker. All oracles stay in this script; no test module is added.
- A pass shows static contract consistency only. It proves no producer, append path, projector, reader, durability, deletion, readiness or seal.

**Sequences.** Each sequence exercises Storage's append admission and the family transitions. A sibling appears in a sequence only as a transition partner, never as evidence for another family (DL-039). SP-460's activation gate, under which a kind appends nothing until every family it needs is admitted, is outside the sequences; `family_not_admitted_quarantined` covers the quarantine of a family that is not admitted.

**Native obligations.** They stay `NOT_RUN` until native code exists and runs them. No static check stands in for them.

| Oracle | Given | Required result |
|---|---|---|
| `COLLAB-START-01` | A Start admission that commits a new definition and run | The definition and run records commit with their prepared events; collaboration.created then collaboration.started append with first receipts; CollaborationStartResult is committed only after the started receipt; no card or Activity entry appears before it |
| `COLLAB-RETRY-01` | A repeated Start with the same command idempotency binding, and a lost append acknowledgement for any admitted family | The original run, event and receipt return through storage.first_append_receipt.resolve.v2; no second run, event or first mint |
| `COLLAB-UNCERTAIN-01` | An uncertain append of a run's event | The run is fenced: no later event of that run appends until Storage resolves the original identity |
| `COLLAB-RESTART-01` | A crash after an owner commit and before its event's first receipt | Restart finds the committed record's prepared event, resolves or retries only that original identity, and never mints a new one; an in-flight attempt gets exactly one terminal outcome |
| `COLLAB-PAUSE-01` | Pause and resume of a running run, and a quota reset while paused | paused appends when the safe boundary is reached; resumed only on cmd.collaboration.resume; a quota reset or scheduled window never resumes it |
| `COLLAB-CANCEL-01` | Cancel of a run with open attempts and a late participant result | Every open attempt closes canceled before collaboration.cancelled; the late result appends nothing and changes no card |
| `COLLAB-COMPLETE-01` | A run whose last provider turn finished while a required slot is unresolved | Predicate-driven completion uses original-definition requiredness and settled outputs; explicit Chat Room End keeps CWR-031's exception without an invented waiver action |
| `COLLAB-FAIL-01` | A run settled failed by its owner, and a coordinator failure | collaboration.failed with the section 11 reason for the run; a coordinator failure appends no run event and leaves the run in attention |
| `COLLAB-ATTEMPT-01` | Two slots on the same model, a retry and a replacement | Distinct attempt IDs and started events; the retry keeps the assignment revision, the replacement raises it; each attempt gets one outcome |
| `COLLAB-MESSAGE-01` | A streamed helper message that completes, one that is cancelled, and a replayed completion | One message_added for the written message with the next sequence; nothing for the cancelled one and no gap; the replay writes nothing |
| `COLLAB-ARTIFACT-01` | A Review artifact created by the artifact owner, then the chat deleted | artifact_added then artifact_finalized; deleting the chat removes the events and never purges the shared artifact |
| `COLLAB-RECONFIGURE-01` | A reconfigure that waives a slot, and a stale expected revision | configuration_changed then message_added for the system entry; the stale one is refused and appends nothing |
| `COLLAB-BLIND-01` | A participant read during a blind proposal or blind review phase | No proposal or finding event exists yet, and no reader discloses another participant's existence metadata |
| `COLLAB-VOTE-01` | A Wonderer vote attempt and a vote from a superseded attempt | Both refused; tallies count only current core attempts |
| `COLLAB-SYNTH-01` | Two synthesis requests for one BrainStorm run | One Plan, one plan_synthesized; the second returns the original result |
| `COLLAB-QUORUM-01` | A Multi-Pass Review with one failed reviewer, then accept_partial | No finalization until the waiver is recorded; the artifact says partial coverage; a single reviewer is a single-pass result |
| `COLLAB-CAS-01` | A projector advance whose checkpoint changed after it was read | Prior-value compare-and-swap fails; no row or checkpoint advances |
| `COLLAB-TOKEN-01` | A checkpoint advance, read and recovery | The stored nine-field durable token is joined to the live read's redb_snapshot_id and revalidated whole |
| `COLLAB-QUARANTINE-01` | An event of a family that is not admitted | Quarantined before append; no checkpoint advance; no sibling state inferred |
| `COLLAB-READER-01` | A read while the checkpoint is not current, coverage is short or the publication changed | Typed unavailable; no fallback to older rows |
| `COLLAB-WITHDRAW-01` | Withdrawal of one admitted family | Writer cut off, current core withdrawn, readers fenced, governed rebuild from kept seglog records; no deletion |
| `COLLAB-DELETE-01` | Deletion of the chat a run belongs to, with and without a hold | Content-free tombstone at once; unheld active copies purged within 24 hours and deleted backup bytes within 30 days; a hold delays physical purge but never restores visibility; projection rows of that chat's runs are removed |
| `COLLAB-APP-01` | An application-scope run before the owner adopts the app source graph | No application payload is appended (requires_owner_adoption); the Project path is unaffected |

Round-two static obligations include coherent source contradictions through the full prepared-event path for all eighteen families; Start/Resume running/waiting/blocked counterparts; nested application contexts; definition roster and per-slot requiredness; original proposal/vote attempts and constraints; original Plan-create output; Review vote targets/counts; and exact remaining owner-control fields. Each of the four application wrappers has complete MessagePack boundary positives at 16,384 bytes, inline refusal at 16,385 and a valid SP-337 reference counterpart, plus missing/forged pack negatives. Number vectors include safe-integer boundaries, large decimal/exponent equivalence, negative zero, leading zeros and lossy-decimal refusal through identity and digest paths. Historical and retention controls test exact types, including string booleans/numbers, null, arrays and objects. Guard removal is sequential, one guard or named duplicate set at a time, with a 6 GB available-memory floor. Every row records its flipping negatives and the unchanged refusals; neither an isolated helper substitution nor a retained earlier proof replaces a fresh whole-lane run. All native obligations remain NOT_RUN.

```yaml
plan_unit_id: ATS-230
unit_type: verification_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-090. The static oracles of the 18 collaborative workflow families are
  Plans/collaboration_event_contract_fixtures.json and python3 scripts/pm_collaboration_events.py with its
  self-test: closed payloads in both scopes, envelope joins, identity vectors, transition sequences through
  the checker's own reducer of SP-460 to SP-478, projection and checkpoint values, and the admission ledger
  with its prepared registry rows. The checker fails when a prepared family is in the registry or an admitted
  row differs from its prepared row, and reports the missing retention object as an admission blocker. Native
  obligations COLLAB-START-01 to COLLAB-APP-01 stay NOT_RUN. A pass proves static consistency only.
  Whole-lane guard-removal proofs cover decision, shape and integrity gates with single-defect negatives
  and named duplicates, including all family/scope replay-only writer refusals, retained compatibility
  history, eager reference closure, physical bindings, source custody, checkpoint semantics, payload-store
  boundaries, true-end lexical/type guards, numeric equivalents and owner-bound completion requirements.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [DL-090, CWR-105, CV-460, SP-460]
unblocks: []
acceptance_criteria:
  - "The checker passes with every family's positive and negative cases, joins, identity vectors and sequences."
  - "A prepared family in the registry, or an admitted row that differs from its prepared row, fails the checker."
  - "Every native obligation stays NOT_RUN until it actually runs."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_oracle_gap
reasoning_tier: high
context_scope: collaborative_event_oracles_shared
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaboration_event_contract_fixtures.json
  - scripts/pm_collaboration_events.py
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
  - "Plans/Automated_Testing_System.md#ATS-058"
preserved_exact_tokens:
  - "Plans/collaboration_event_contract_fixtures.json"
  - "scripts/pm_collaboration_events.py"
  - "NOT_RUN"
negative_constraints:
  - "Do not treat a static pass as native proof, readiness or admission."
  - "Do not let a sibling's case stand in for a family's own case."
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/storage-plan.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Contracts_V0.md#CV-460, ContractName:Plans/Collaborative_Workflows.md#CWR-105

**Round-1 full-lane oracles (B1–B8).** `scripts/pm_collaboration_events.py` owns every new oracle; no test file is added. Each family and scope exercises typed durable source custody, inline/reference payload parity and size boundaries, true-end identifiers, sibling/unknown family refusal, replay-only writer refusal and retained historical reads after live changes, with withdrawn/forged refusals. Checkpoint contexts supply independent source-token/frame/event joins. Completion tests authoritative requiredness and CWR-031 End. All schema references are resolved, including unused optional paths. `--guard-removal` runs isolated in-memory checker/schema mutants and publishes the check-11 table: guard, own negatives that become accepted, and every other negative that remains rejected for its original reason. An unexercised or masked guard fails the proof. Failure CLI expectations require nonzero, and all native obligations remain NOT_RUN.

**Additional mandatory round-one probes.** Canonical numeric vectors cover `1`, `1.0`, `1e0`, `-0`, `-0.0`, illegal `01`, fractions, large exact integers and nonfinite forms; all 36 family/scope envelopes keep the same identity and digest under equivalent admitted numeric forms. Wrong-type vectors cover string booleans/numbers, nulls, arrays and nested objects. Retained replay-only compatibility originals are accepted after live changes through the historical reader, while current append/retry still refuses them. Full stored holder/projection/checkpoint encoded sizes are measured without treating the EventRecord 16 KiB inline boundary as a redb value cap.

### ATS-231 - Oracles of collaboration.created

`collaboration.created`'s own cases, listed in its ledger row's `validation_case_ids`:

- **Positive payloads (4).** `created_project`, `created_application`, `created_crew_auto_dedicated_coordinator`, `created_review_application`.
- **Negative payloads (9).** `created_text_field_refused`, `created_missing_definition_revision`, `created_project_null_project_id`, `created_application_with_project_id`, `created_offset_timestamp`, `created_key_of_another_subject`, `created_currentness_not_a_hash`, `created_impossible_date`, `created_revision_2`.
- **Valid eventrecords (2).** `event_valid_created_project`, `event_valid_created_application`.
- **Envelope join negatives (5).** `event_created_occurred_at_join`, `event_created_sibling_payload_schema_id`, `event_created_sibling_event_id`, `event_created_application_schema_in_project_record`, `event_created_run_id_join`.
- **Identity vectors (3).** `identity_created_project`, `identity_created_application`, `identity_created_new_epoch`.
- **Transition sequences (15).** `crew_lifecycle_to_completed`, `pause_resume_cancel_with_fence`, `limit_stop_is_cancelled`, `run_fails_after_participant_failure`, `completion_needs_required_slots`, `definition_revisions_and_rerun`, `attempt_identity_rules`, `brainstorm_proposals_votes_synthesis`, `brainstorm_event_on_crew_run`, `review_partial_then_accepted`, `review_finish_stale`, `review_completion_needs_artifact`, `chat_room_end_from_paused`, `application_scope_lifecycle`, `family_not_admitted_quarantined`.
- **Native obligations (11, NOT_RUN).** `COLLAB-START-01`, `COLLAB-RETRY-01`, `COLLAB-UNCERTAIN-01`, `COLLAB-RESTART-01`, `COLLAB-CAS-01`, `COLLAB-TOKEN-01`, `COLLAB-QUARANTINE-01`, `COLLAB-READER-01`, `COLLAB-WITHDRAW-01`, `COLLAB-DELETE-01`, `COLLAB-APP-01`.

The negative payloads fail at these layers: `identity_recipe`, `schema`, `valid_utc_datetime`. In the sequences the family is appended and also refused with `conflict:already_created`, `idempotency_conflict`. The checker fails when any listed case is missing or gives another result.

```yaml
plan_unit_id: ATS-231
unit_type: verification_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-090. The oracles of collaboration.created are its own cases in
  Plans/collaboration_event_contract_fixtures.json: positive and negative payloads in both scopes, a valid
  EventRecord per scope and its join negatives, identity vectors including a new recovery epoch, and the
  transition sequences in which it is appended and refused, all checked by python3
  scripts/pm_collaboration_events.py; its native obligations COLLAB-START-01, COLLAB-RETRY-01,
  COLLAB-UNCERTAIN-01, COLLAB-RESTART-01, COLLAB-CAS-01, COLLAB-TOKEN-01, COLLAB-QUARANTINE-01,
  COLLAB-READER-01, COLLAB-WITHDRAW-01, COLLAB-DELETE-01, COLLAB-APP-01 stay NOT_RUN. No sibling case stands
  in for its own.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [ATS-230, SP-461, CV-461, CWR-106]
unblocks: []
acceptance_criteria:
  - "Every case listed for collaboration.created exists in the fixtures and passes the checker."
  - "collaboration.created has positive and negative payload cases in both scopes, its own EventRecord join negatives and identity vectors."
  - "collaboration.created is appended and refused in at least one transition sequence."
  - "Its native obligations stay NOT_RUN until they run."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_oracle_gap
reasoning_tier: high
context_scope: collaborative_event_oracles_collaboration_created
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaboration_event_contract_fixtures.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.created"
  - "COLLAB-START-01"
  - "COLLAB-RETRY-01"
negative_constraints:
  - "Do not use a sibling's case as collaboration.created's own evidence."
  - "Do not record a native obligation as passed without running it."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-230, ContractName:Plans/storage-plan.md#SP-461, ContractName:Plans/Contracts_V0.md#CV-461

### ATS-232 - Oracles of collaboration.started

`collaboration.started`'s own cases, listed in its ledger row's `validation_case_ids`:

- **Positive payloads (6).** `started_project`, `started_application`, `started_review_with_pack`, `started_crew_auto`, `started_build_with_crew`, `started_brainstorm_waiting`.
- **Negative payloads (14).** `started_text_field_refused`, `started_missing_lifecycle_seq`, `started_project_null_project_id`, `started_application_with_project_id`, `started_offset_timestamp`, `started_key_of_another_subject`, `started_currentness_not_a_hash`, `started_impossible_date`, `started_seq_2`, `started_crew_auto_without_revision`, `started_revision_without_crew_auto`, `started_build_with_crew_without_plan`, `started_review_without_pack`, `started_state_configuring`.
- **Valid eventrecords (2).** `event_valid_started_project`, `event_valid_started_application`.
- **Envelope join negatives (15).** `event_started_occurred_at_join`, `event_started_sibling_payload_schema_id`, `event_started_sibling_event_id`, `event_started_application_schema_in_project_record`, `event_started_run_id_join`, `event_shared_project_payload_in_application_record`, `event_shared_inline_payload_ref`, `event_shared_thread_join`, `event_shared_project_join`, `event_shared_attempt_on_run_event`, `event_shared_key_join`, `event_shared_redaction_redacted`, `event_shared_replay_append_once`, `event_shared_event_id_off_recipe`, `event_shared_node_id_set`.
- **Identity vectors (3).** `identity_started_project`, `identity_started_application`, `identity_started_new_epoch`.
- **Transition sequences (15).** `crew_lifecycle_to_completed`, `pause_resume_cancel_with_fence`, `limit_stop_is_cancelled`, `run_fails_after_participant_failure`, `completion_needs_required_slots`, `definition_revisions_and_rerun`, `attempt_identity_rules`, `brainstorm_proposals_votes_synthesis`, `brainstorm_event_on_crew_run`, `review_partial_then_accepted`, `review_finish_stale`, `review_completion_needs_artifact`, `chat_room_end_from_paused`, `application_scope_lifecycle`, `family_not_admitted_quarantined`.
- **Native obligations (11, NOT_RUN).** `COLLAB-START-01`, `COLLAB-RETRY-01`, `COLLAB-UNCERTAIN-01`, `COLLAB-RESTART-01`, `COLLAB-CAS-01`, `COLLAB-TOKEN-01`, `COLLAB-QUARANTINE-01`, `COLLAB-READER-01`, `COLLAB-WITHDRAW-01`, `COLLAB-DELETE-01`, `COLLAB-APP-01`.

The negative payloads fail at these layers: `identity_recipe`, `schema`, `valid_utc_datetime`. In the sequences the family is appended and also refused with `conflict:definition_not_recorded`, `exact_retry`. The checker fails when any listed case is missing or gives another result.

```yaml
plan_unit_id: ATS-232
unit_type: verification_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-090. The oracles of collaboration.started are its own cases in
  Plans/collaboration_event_contract_fixtures.json: positive and negative payloads in both scopes, a valid
  EventRecord per scope and its join negatives, identity vectors including a new recovery epoch, and the
  transition sequences in which it is appended and refused, all checked by python3
  scripts/pm_collaboration_events.py; its native obligations COLLAB-START-01, COLLAB-RETRY-01,
  COLLAB-UNCERTAIN-01, COLLAB-RESTART-01, COLLAB-CAS-01, COLLAB-TOKEN-01, COLLAB-QUARANTINE-01,
  COLLAB-READER-01, COLLAB-WITHDRAW-01, COLLAB-DELETE-01, COLLAB-APP-01 stay NOT_RUN. No sibling case stands
  in for its own.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [ATS-230, SP-462, CV-462, CWR-107]
unblocks: []
acceptance_criteria:
  - "Every case listed for collaboration.started exists in the fixtures and passes the checker."
  - "collaboration.started has positive and negative payload cases in both scopes, its own EventRecord join negatives and identity vectors."
  - "collaboration.started is appended and refused in at least one transition sequence."
  - "Its native obligations stay NOT_RUN until they run."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_oracle_gap
reasoning_tier: high
context_scope: collaborative_event_oracles_collaboration_started
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaboration_event_contract_fixtures.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.started"
  - "COLLAB-START-01"
  - "COLLAB-RETRY-01"
negative_constraints:
  - "Do not use a sibling's case as collaboration.started's own evidence."
  - "Do not record a native obligation as passed without running it."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-230, ContractName:Plans/storage-plan.md#SP-462, ContractName:Plans/Contracts_V0.md#CV-462

### ATS-233 - Oracles of collaboration.paused

`collaboration.paused`'s own cases, listed in its ledger row's `validation_case_ids`:

- **Positive payloads (4).** `paused_project`, `paused_application`, `paused_from_waiting`, `paused_chat_room_application`.
- **Negative payloads (10).** `paused_text_field_refused`, `paused_missing_lifecycle_seq`, `paused_project_null_project_id`, `paused_application_with_project_id`, `paused_offset_timestamp`, `paused_key_of_another_subject`, `paused_currentness_not_a_hash`, `paused_impossible_date`, `paused_seq_1`, `paused_from_paused`.
- **Valid eventrecords (2).** `event_valid_paused_project`, `event_valid_paused_application`.
- **Envelope join negatives (5).** `event_paused_occurred_at_join`, `event_paused_sibling_payload_schema_id`, `event_paused_sibling_event_id`, `event_paused_application_schema_in_project_record`, `event_paused_run_id_join`.
- **Identity vectors (3).** `identity_paused_project`, `identity_paused_application`, `identity_paused_new_epoch`.
- **Transition sequences (3).** `pause_resume_cancel_with_fence`, `chat_room_end_from_paused`, `application_scope_lifecycle`.
- **Native obligations (11, NOT_RUN).** `COLLAB-RETRY-01`, `COLLAB-UNCERTAIN-01`, `COLLAB-RESTART-01`, `COLLAB-PAUSE-01`, `COLLAB-CAS-01`, `COLLAB-TOKEN-01`, `COLLAB-QUARANTINE-01`, `COLLAB-READER-01`, `COLLAB-WITHDRAW-01`, `COLLAB-DELETE-01`, `COLLAB-APP-01`.

The negative payloads fail at these layers: `identity_recipe`, `schema`, `valid_utc_datetime`. In the sequences the family is appended and also refused with `conflict:run_not_started`, `conflict:run_state_invalid`. The checker fails when any listed case is missing or gives another result.

```yaml
plan_unit_id: ATS-233
unit_type: verification_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-090. The oracles of collaboration.paused are its own cases in
  Plans/collaboration_event_contract_fixtures.json: positive and negative payloads in both scopes, a valid
  EventRecord per scope and its join negatives, identity vectors including a new recovery epoch, and the
  transition sequences in which it is appended and refused, all checked by python3
  scripts/pm_collaboration_events.py; its native obligations COLLAB-RETRY-01, COLLAB-UNCERTAIN-01,
  COLLAB-RESTART-01, COLLAB-PAUSE-01, COLLAB-CAS-01, COLLAB-TOKEN-01, COLLAB-QUARANTINE-01, COLLAB-READER-01,
  COLLAB-WITHDRAW-01, COLLAB-DELETE-01, COLLAB-APP-01 stay NOT_RUN. No sibling case stands in for its own.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [ATS-230, SP-463, CV-463, CWR-108]
unblocks: []
acceptance_criteria:
  - "Every case listed for collaboration.paused exists in the fixtures and passes the checker."
  - "collaboration.paused has positive and negative payload cases in both scopes, its own EventRecord join negatives and identity vectors."
  - "collaboration.paused is appended and refused in at least one transition sequence."
  - "Its native obligations stay NOT_RUN until they run."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_oracle_gap
reasoning_tier: high
context_scope: collaborative_event_oracles_collaboration_paused
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaboration_event_contract_fixtures.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.paused"
  - "COLLAB-RETRY-01"
  - "COLLAB-UNCERTAIN-01"
negative_constraints:
  - "Do not use a sibling's case as collaboration.paused's own evidence."
  - "Do not record a native obligation as passed without running it."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-230, ContractName:Plans/storage-plan.md#SP-463, ContractName:Plans/Contracts_V0.md#CV-463

### ATS-234 - Oracles of collaboration.resumed

`collaboration.resumed`'s own cases, listed in its ledger row's `validation_case_ids`:

- **Positive payloads (4).** `resumed_project`, `resumed_application`, `resumed_to_blocked`, `resumed_review_application`.
- **Negative payloads (9).** `resumed_text_field_refused`, `resumed_missing_lifecycle_seq`, `resumed_project_null_project_id`, `resumed_application_with_project_id`, `resumed_offset_timestamp`, `resumed_key_of_another_subject`, `resumed_currentness_not_a_hash`, `resumed_impossible_date`, `resumed_state_after_paused`.
- **Valid eventrecords (2).** `event_valid_resumed_project`, `event_valid_resumed_application`.
- **Envelope join negatives (5).** `event_resumed_occurred_at_join`, `event_resumed_sibling_payload_schema_id`, `event_resumed_sibling_event_id`, `event_resumed_application_schema_in_project_record`, `event_resumed_run_id_join`.
- **Identity vectors (3).** `identity_resumed_project`, `identity_resumed_application`, `identity_resumed_new_epoch`.
- **Transition sequences (1).** `pause_resume_cancel_with_fence`.
- **Native obligations (11, NOT_RUN).** `COLLAB-RETRY-01`, `COLLAB-UNCERTAIN-01`, `COLLAB-RESTART-01`, `COLLAB-PAUSE-01`, `COLLAB-CAS-01`, `COLLAB-TOKEN-01`, `COLLAB-QUARANTINE-01`, `COLLAB-READER-01`, `COLLAB-WITHDRAW-01`, `COLLAB-DELETE-01`, `COLLAB-APP-01`.

The negative payloads fail at these layers: `identity_recipe`, `schema`, `valid_utc_datetime`. In the sequences the family is appended and also refused with `conflict:already_terminal`, `conflict:run_state_invalid`, `conflict:stale_lifecycle_seq`. The checker fails when any listed case is missing or gives another result.

```yaml
plan_unit_id: ATS-234
unit_type: verification_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-090. The oracles of collaboration.resumed are its own cases in
  Plans/collaboration_event_contract_fixtures.json: positive and negative payloads in both scopes, a valid
  EventRecord per scope and its join negatives, identity vectors including a new recovery epoch, and the
  transition sequences in which it is appended and refused, all checked by python3
  scripts/pm_collaboration_events.py; its native obligations COLLAB-RETRY-01, COLLAB-UNCERTAIN-01,
  COLLAB-RESTART-01, COLLAB-PAUSE-01, COLLAB-CAS-01, COLLAB-TOKEN-01, COLLAB-QUARANTINE-01, COLLAB-READER-01,
  COLLAB-WITHDRAW-01, COLLAB-DELETE-01, COLLAB-APP-01 stay NOT_RUN. No sibling case stands in for its own.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [ATS-230, SP-464, CV-464, CWR-109]
unblocks: []
acceptance_criteria:
  - "Every case listed for collaboration.resumed exists in the fixtures and passes the checker."
  - "collaboration.resumed has positive and negative payload cases in both scopes, its own EventRecord join negatives and identity vectors."
  - "collaboration.resumed is appended and refused in at least one transition sequence."
  - "Its native obligations stay NOT_RUN until they run."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_oracle_gap
reasoning_tier: high
context_scope: collaborative_event_oracles_collaboration_resumed
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaboration_event_contract_fixtures.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.resumed"
  - "COLLAB-RETRY-01"
  - "COLLAB-UNCERTAIN-01"
negative_constraints:
  - "Do not use a sibling's case as collaboration.resumed's own evidence."
  - "Do not record a native obligation as passed without running it."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-230, ContractName:Plans/storage-plan.md#SP-464, ContractName:Plans/Contracts_V0.md#CV-464

### ATS-235 - Oracles of collaboration.cancelled

`collaboration.cancelled`'s own cases, listed in its ledger row's `validation_case_ids`:

- **Positive payloads (3).** `cancelled_project`, `cancelled_application`, `cancelled_limit_cost`.
- **Negative payloads (11).** `cancelled_text_field_refused`, `cancelled_missing_lifecycle_seq`, `cancelled_project_null_project_id`, `cancelled_application_with_project_id`, `cancelled_offset_timestamp`, `cancelled_key_of_another_subject`, `cancelled_currentness_not_a_hash`, `cancelled_impossible_date`, `cancelled_limit_with_command`, `cancelled_user_without_command`, `cancelled_failure_stop_reason`.
- **Valid eventrecords (2).** `event_valid_cancelled_project`, `event_valid_cancelled_application`.
- **Envelope join negatives (5).** `event_cancelled_occurred_at_join`, `event_cancelled_sibling_payload_schema_id`, `event_cancelled_sibling_event_id`, `event_cancelled_application_schema_in_project_record`, `event_cancelled_run_id_join`.
- **Identity vectors (3).** `identity_cancelled_project`, `identity_cancelled_application`, `identity_cancelled_new_epoch`.
- **Transition sequences (4).** `pause_resume_cancel_with_fence`, `limit_stop_is_cancelled`, `application_scope_lifecycle`, `family_not_admitted_quarantined`.
- **Native obligations (11, NOT_RUN).** `COLLAB-RETRY-01`, `COLLAB-UNCERTAIN-01`, `COLLAB-RESTART-01`, `COLLAB-CANCEL-01`, `COLLAB-CAS-01`, `COLLAB-TOKEN-01`, `COLLAB-QUARANTINE-01`, `COLLAB-READER-01`, `COLLAB-WITHDRAW-01`, `COLLAB-DELETE-01`, `COLLAB-APP-01`.

The negative payloads fail at these layers: `identity_recipe`, `schema`, `valid_utc_datetime`. In the sequences the family is appended and also refused with `conflict:open_attempts`. The checker fails when any listed case is missing or gives another result.

```yaml
plan_unit_id: ATS-235
unit_type: verification_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-090. The oracles of collaboration.cancelled are its own cases in
  Plans/collaboration_event_contract_fixtures.json: positive and negative payloads in both scopes, a valid
  EventRecord per scope and its join negatives, identity vectors including a new recovery epoch, and the
  transition sequences in which it is appended and refused, all checked by python3
  scripts/pm_collaboration_events.py; its native obligations COLLAB-RETRY-01, COLLAB-UNCERTAIN-01,
  COLLAB-RESTART-01, COLLAB-CANCEL-01, COLLAB-CAS-01, COLLAB-TOKEN-01, COLLAB-QUARANTINE-01, COLLAB-READER-01,
  COLLAB-WITHDRAW-01, COLLAB-DELETE-01, COLLAB-APP-01 stay NOT_RUN. No sibling case stands in for its own.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [ATS-230, SP-465, CV-465, CWR-110]
unblocks: []
acceptance_criteria:
  - "Every case listed for collaboration.cancelled exists in the fixtures and passes the checker."
  - "collaboration.cancelled has positive and negative payload cases in both scopes, its own EventRecord join negatives and identity vectors."
  - "collaboration.cancelled is appended and refused in at least one transition sequence."
  - "Its native obligations stay NOT_RUN until they run."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_oracle_gap
reasoning_tier: high
context_scope: collaborative_event_oracles_collaboration_cancelled
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaboration_event_contract_fixtures.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.cancelled"
  - "COLLAB-RETRY-01"
  - "COLLAB-UNCERTAIN-01"
negative_constraints:
  - "Do not use a sibling's case as collaboration.cancelled's own evidence."
  - "Do not record a native obligation as passed without running it."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-230, ContractName:Plans/storage-plan.md#SP-465, ContractName:Plans/Contracts_V0.md#CV-465

### ATS-236 - Oracles of collaboration.completed

`collaboration.completed`'s own cases, listed in its ledger row's `validation_case_ids`:

- **Positive payloads (4).** `completed_project`, `completed_application`, `completed_chat_room_end_paused`, `completed_review_outputs`.
- **Negative payloads (10).** `completed_text_field_refused`, `completed_missing_lifecycle_seq`, `completed_project_null_project_id`, `completed_application_with_project_id`, `completed_offset_timestamp`, `completed_key_of_another_subject`, `completed_currentness_not_a_hash`, `completed_impossible_date`, `completed_chat_room_end_on_crew`, `completed_predicate_from_paused`.
- **Valid eventrecords (2).** `event_valid_completed_project`, `event_valid_completed_application`.
- **Envelope join negatives (5).** `event_completed_occurred_at_join`, `event_completed_sibling_payload_schema_id`, `event_completed_sibling_event_id`, `event_completed_application_schema_in_project_record`, `event_completed_run_id_join`.
- **Identity vectors (3).** `identity_completed_project`, `identity_completed_application`, `identity_completed_new_epoch`.
- **Transition sequences (7).** `crew_lifecycle_to_completed`, `completion_needs_required_slots`, `definition_revisions_and_rerun`, `brainstorm_proposals_votes_synthesis`, `review_partial_then_accepted`, `review_completion_needs_artifact`, `chat_room_end_from_paused`.
- **Native obligations (11, NOT_RUN).** `COLLAB-RETRY-01`, `COLLAB-UNCERTAIN-01`, `COLLAB-RESTART-01`, `COLLAB-COMPLETE-01`, `COLLAB-CAS-01`, `COLLAB-TOKEN-01`, `COLLAB-QUARANTINE-01`, `COLLAB-READER-01`, `COLLAB-WITHDRAW-01`, `COLLAB-DELETE-01`, `COLLAB-APP-01`.

The negative payloads fail at these layers: `identity_recipe`, `schema`, `valid_utc_datetime`. In the sequences the family is appended and also refused with `conflict:missing_output`, `conflict:open_attempts`, `conflict:unresolved_required_slots`. The checker fails when any listed case is missing or gives another result.

```yaml
plan_unit_id: ATS-236
unit_type: verification_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-090. The oracles of collaboration.completed are its own cases in
  Plans/collaboration_event_contract_fixtures.json: positive and negative payloads in both scopes, a valid
  EventRecord per scope and its join negatives, identity vectors including a new recovery epoch, and the
  transition sequences in which it is appended and refused, all checked by python3
  scripts/pm_collaboration_events.py; its native obligations COLLAB-RETRY-01, COLLAB-UNCERTAIN-01,
  COLLAB-RESTART-01, COLLAB-COMPLETE-01, COLLAB-CAS-01, COLLAB-TOKEN-01, COLLAB-QUARANTINE-01,
  COLLAB-READER-01, COLLAB-WITHDRAW-01, COLLAB-DELETE-01, COLLAB-APP-01 stay NOT_RUN. No sibling case stands
  in for its own.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [ATS-230, SP-466, CV-466, CWR-111]
unblocks: []
acceptance_criteria:
  - "Every case listed for collaboration.completed exists in the fixtures and passes the checker."
  - "collaboration.completed has positive and negative payload cases in both scopes, its own EventRecord join negatives and identity vectors."
  - "collaboration.completed is appended and refused in at least one transition sequence."
  - "Its native obligations stay NOT_RUN until they run."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_oracle_gap
reasoning_tier: high
context_scope: collaborative_event_oracles_collaboration_completed
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaboration_event_contract_fixtures.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.completed"
  - "COLLAB-RETRY-01"
  - "COLLAB-UNCERTAIN-01"
negative_constraints:
  - "Do not use a sibling's case as collaboration.completed's own evidence."
  - "Do not record a native obligation as passed without running it."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-230, ContractName:Plans/storage-plan.md#SP-466, ContractName:Plans/Contracts_V0.md#CV-466

### ATS-237 - Oracles of collaboration.failed

`collaboration.failed`'s own cases, listed in its ledger row's `validation_case_ids`:

- **Positive payloads (4).** `failed_project`, `failed_project_required_only`, `failed_application`, `failed_model_unavailable_paused`.
- **Negative payloads (10).** `failed_text_field_refused`, `failed_missing_lifecycle_seq`, `failed_project_null_project_id`, `failed_application_with_project_id`, `failed_offset_timestamp`, `failed_key_of_another_subject`, `failed_currentness_not_a_hash`, `failed_impossible_date`, `failed_reason_cancelled`, `failed_free_text_reason`.
- **Valid eventrecords (2).** `event_valid_failed_project`, `event_valid_failed_application`.
- **Envelope join negatives (5).** `event_failed_occurred_at_join`, `event_failed_sibling_payload_schema_id`, `event_failed_sibling_event_id`, `event_failed_application_schema_in_project_record`, `event_failed_run_id_join`.
- **Identity vectors (3).** `identity_failed_project`, `identity_failed_application`, `identity_failed_new_epoch`.
- **Transition sequences (2).** `limit_stop_is_cancelled`, `run_fails_after_participant_failure`.
- **Native obligations (11, NOT_RUN).** `COLLAB-RETRY-01`, `COLLAB-UNCERTAIN-01`, `COLLAB-RESTART-01`, `COLLAB-FAIL-01`, `COLLAB-CAS-01`, `COLLAB-TOKEN-01`, `COLLAB-QUARANTINE-01`, `COLLAB-READER-01`, `COLLAB-WITHDRAW-01`, `COLLAB-DELETE-01`, `COLLAB-APP-01`.

The negative payloads fail at these layers: `identity_recipe`, `schema`, `valid_utc_datetime`. In the sequences the family is appended and also refused with `conflict:already_terminal`, `conflict:open_attempts`. The checker fails when any listed case is missing or gives another result.

```yaml
plan_unit_id: ATS-237
unit_type: verification_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-091. The oracles of collaboration.failed are its own cases in
  Plans/collaboration_event_contract_fixtures.json: positive and negative payloads in both scopes, a valid
  EventRecord per scope and its join negatives, identity vectors including a new recovery epoch, and the
  transition sequences in which it is appended and refused, all checked by python3
  scripts/pm_collaboration_events.py; its native obligations COLLAB-RETRY-01, COLLAB-UNCERTAIN-01,
  COLLAB-RESTART-01, COLLAB-FAIL-01, COLLAB-CAS-01, COLLAB-TOKEN-01, COLLAB-QUARANTINE-01, COLLAB-READER-01,
  COLLAB-WITHDRAW-01, COLLAB-DELETE-01, COLLAB-APP-01 stay NOT_RUN. No sibling case stands in for its own.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [ATS-230, SP-467, CV-467, CWR-112]
unblocks: []
acceptance_criteria:
  - "Every case listed for collaboration.failed exists in the fixtures and passes the checker."
  - "collaboration.failed has positive and negative payload cases in both scopes, its own EventRecord join negatives and identity vectors."
  - "collaboration.failed is appended and refused in at least one transition sequence."
  - "Its native obligations stay NOT_RUN until they run."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_oracle_gap
reasoning_tier: high
context_scope: collaborative_event_oracles_collaboration_failed
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaboration_event_contract_fixtures.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.failed"
  - "COLLAB-RETRY-01"
  - "COLLAB-UNCERTAIN-01"
negative_constraints:
  - "Do not use a sibling's case as collaboration.failed's own evidence."
  - "Do not record a native obligation as passed without running it."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-230, ContractName:Plans/storage-plan.md#SP-467, ContractName:Plans/Contracts_V0.md#CV-467

### ATS-238 - Oracles of collaboration.participant_started

`collaboration.participant_started`'s own cases, listed in its ledger row's `validation_case_ids`:

- **Positive payloads (4).** `participant_started_project`, `participant_started_project_required_only`, `participant_started_application`, `participant_started_wonderer_retry`.
- **Negative payloads (10).** `participant_started_text_field_refused`, `participant_started_missing_participant_slot_id`, `participant_started_project_null_project_id`, `participant_started_application_with_project_id`, `participant_started_offset_timestamp`, `participant_started_key_of_another_subject`, `participant_started_currentness_not_a_hash`, `participant_started_impossible_date`, `participant_started_grill_me_role`, `participant_started_no_attempt`.
- **Valid eventrecords (2).** `event_valid_participant_started_project`, `event_valid_participant_started_application`.
- **Envelope join negatives (5).** `event_participant_started_occurred_at_join`, `event_participant_started_sibling_payload_schema_id`, `event_participant_started_sibling_event_id`, `event_participant_started_application_schema_in_project_record`, `event_participant_started_run_id_join`.
- **Identity vectors (3).** `identity_participant_started_project`, `identity_participant_started_application`, `identity_participant_started_new_epoch`.
- **Transition sequences (10).** `crew_lifecycle_to_completed`, `pause_resume_cancel_with_fence`, `run_fails_after_participant_failure`, `completion_needs_required_slots`, `definition_revisions_and_rerun`, `attempt_identity_rules`, `brainstorm_proposals_votes_synthesis`, `brainstorm_event_on_crew_run`, `review_partial_then_accepted`, `review_finish_stale`.
- **Native obligations (11, NOT_RUN).** `COLLAB-RETRY-01`, `COLLAB-UNCERTAIN-01`, `COLLAB-RESTART-01`, `COLLAB-ATTEMPT-01`, `COLLAB-CAS-01`, `COLLAB-TOKEN-01`, `COLLAB-QUARANTINE-01`, `COLLAB-READER-01`, `COLLAB-WITHDRAW-01`, `COLLAB-DELETE-01`, `COLLAB-APP-01`.

The negative payloads fail at these layers: `identity_recipe`, `schema`, `valid_utc_datetime`. In the sequences the family is appended and also refused with `conflict:attempt_already_started`, `conflict:run_state_invalid`, `conflict:slot_not_in_roster`. The checker fails when any listed case is missing or gives another result.

```yaml
plan_unit_id: ATS-238
unit_type: verification_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-090. The oracles of collaboration.participant_started are its own
  cases in Plans/collaboration_event_contract_fixtures.json: positive and negative payloads in both scopes, a
  valid EventRecord per scope and its join negatives, identity vectors including a new recovery epoch, and the
  transition sequences in which it is appended and refused, all checked by python3
  scripts/pm_collaboration_events.py; its native obligations COLLAB-RETRY-01, COLLAB-UNCERTAIN-01,
  COLLAB-RESTART-01, COLLAB-ATTEMPT-01, COLLAB-CAS-01, COLLAB-TOKEN-01, COLLAB-QUARANTINE-01,
  COLLAB-READER-01, COLLAB-WITHDRAW-01, COLLAB-DELETE-01, COLLAB-APP-01 stay NOT_RUN. No sibling case stands
  in for its own.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [ATS-230, SP-468, CV-468, CWR-113]
unblocks: []
acceptance_criteria:
  - "Every case listed for collaboration.participant_started exists in the fixtures and passes the checker."
  - "collaboration.participant_started has positive and negative payload cases in both scopes, its own EventRecord join negatives and identity vectors."
  - "collaboration.participant_started is appended and refused in at least one transition sequence."
  - "Its native obligations stay NOT_RUN until they run."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_oracle_gap
reasoning_tier: high
context_scope: collaborative_event_oracles_collaboration_participant_started
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaboration_event_contract_fixtures.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.participant_started"
  - "COLLAB-RETRY-01"
  - "COLLAB-UNCERTAIN-01"
negative_constraints:
  - "Do not use a sibling's case as collaboration.participant_started's own evidence."
  - "Do not record a native obligation as passed without running it."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-230, ContractName:Plans/storage-plan.md#SP-468, ContractName:Plans/Contracts_V0.md#CV-468

### ATS-239 - Oracles of collaboration.participant_completed

`collaboration.participant_completed`'s own cases, listed in its ledger row's `validation_case_ids`:

- **Positive payloads (6).** `participant_completed_project`, `participant_completed_application`, `participant_completed_failed`, `participant_completed_unavailable`, `participant_completed_waived_no_attempt`, `participant_completed_canceled`.
- **Negative payloads (12).** `participant_completed_text_field_refused`, `participant_completed_missing_participant_slot_id`, `participant_completed_project_null_project_id`, `participant_completed_application_with_project_id`, `participant_completed_offset_timestamp`, `participant_completed_key_of_another_subject`, `participant_completed_currentness_not_a_hash`, `participant_completed_impossible_date`, `participant_completed_unavailable_with_attempt`, `participant_completed_failed_without_reason`, `participant_completed_waiver_without_actor`, `participant_completed_missing_callback_value`.
- **Valid eventrecords (2).** `event_valid_participant_completed_project`, `event_valid_participant_completed_application`.
- **Envelope join negatives (5).** `event_participant_completed_occurred_at_join`, `event_participant_completed_sibling_payload_schema_id`, `event_participant_completed_sibling_event_id`, `event_participant_completed_application_schema_in_project_record`, `event_participant_completed_run_id_join`.
- **Identity vectors (3).** `identity_participant_completed_project`, `identity_participant_completed_application`, `identity_participant_completed_new_epoch`.
- **Transition sequences (9).** `crew_lifecycle_to_completed`, `pause_resume_cancel_with_fence`, `run_fails_after_participant_failure`, `completion_needs_required_slots`, `definition_revisions_and_rerun`, `attempt_identity_rules`, `brainstorm_proposals_votes_synthesis`, `review_partial_then_accepted`, `review_finish_stale`.
- **Native obligations (12, NOT_RUN).** `COLLAB-RETRY-01`, `COLLAB-UNCERTAIN-01`, `COLLAB-RESTART-01`, `COLLAB-CANCEL-01`, `COLLAB-ATTEMPT-01`, `COLLAB-CAS-01`, `COLLAB-TOKEN-01`, `COLLAB-QUARANTINE-01`, `COLLAB-READER-01`, `COLLAB-WITHDRAW-01`, `COLLAB-DELETE-01`, `COLLAB-APP-01`.

The negative payloads fail at these layers: `identity_recipe`, `schema`, `valid_utc_datetime`. In the sequences the family is appended and also refused with `conflict:attempt_already_closed`, `conflict:unknown_attempt`, `conflict:waiver_not_recorded`, `exact_retry`, `idempotency_conflict`. The checker fails when any listed case is missing or gives another result.

```yaml
plan_unit_id: ATS-239
unit_type: verification_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-090. The oracles of collaboration.participant_completed are its own
  cases in Plans/collaboration_event_contract_fixtures.json: positive and negative payloads in both scopes, a
  valid EventRecord per scope and its join negatives, identity vectors including a new recovery epoch, and the
  transition sequences in which it is appended and refused, all checked by python3
  scripts/pm_collaboration_events.py; its native obligations COLLAB-RETRY-01, COLLAB-UNCERTAIN-01,
  COLLAB-RESTART-01, COLLAB-CANCEL-01, COLLAB-ATTEMPT-01, COLLAB-CAS-01, COLLAB-TOKEN-01,
  COLLAB-QUARANTINE-01, COLLAB-READER-01, COLLAB-WITHDRAW-01, COLLAB-DELETE-01, COLLAB-APP-01 stay NOT_RUN. No
  sibling case stands in for its own.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [ATS-230, SP-469, CV-469, CWR-114]
unblocks: []
acceptance_criteria:
  - "Every case listed for collaboration.participant_completed exists in the fixtures and passes the checker."
  - "collaboration.participant_completed has positive and negative payload cases in both scopes, its own EventRecord join negatives and identity vectors."
  - "collaboration.participant_completed is appended and refused in at least one transition sequence."
  - "Its native obligations stay NOT_RUN until they run."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_oracle_gap
reasoning_tier: high
context_scope: collaborative_event_oracles_collaboration_participant_completed
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaboration_event_contract_fixtures.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.participant_completed"
  - "COLLAB-RETRY-01"
  - "COLLAB-UNCERTAIN-01"
negative_constraints:
  - "Do not use a sibling's case as collaboration.participant_completed's own evidence."
  - "Do not record a native obligation as passed without running it."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-230, ContractName:Plans/storage-plan.md#SP-469, ContractName:Plans/Contracts_V0.md#CV-469

### ATS-240 - Oracles of collaboration.message_added

`collaboration.message_added`'s own cases, listed in its ledger row's `validation_case_ids`:

- **Positive payloads (6).** `message_added_project`, `message_added_project_required_only`, `message_added_application`, `message_added_user_to_two`, `message_added_system_reply`, `message_added_participant_attempt`.
- **Negative payloads (11).** `message_added_text_field_refused`, `message_added_missing_collaboration_message_id`, `message_added_project_null_project_id`, `message_added_application_with_project_id`, `message_added_offset_timestamp`, `message_added_key_of_another_subject`, `message_added_currentness_not_a_hash`, `message_added_impossible_date`, `message_added_sequence_zero`, `message_added_user_with_attempt`, `message_added_partial_delta_type`.
- **Valid eventrecords (2).** `event_valid_message_added_project`, `event_valid_message_added_application`.
- **Envelope join negatives (5).** `event_message_added_occurred_at_join`, `event_message_added_sibling_payload_schema_id`, `event_message_added_sibling_event_id`, `event_message_added_application_schema_in_project_record`, `event_message_added_run_id_join`.
- **Identity vectors (3).** `identity_message_added_project`, `identity_message_added_application`, `identity_message_added_new_epoch`.
- **Transition sequences (6).** `crew_lifecycle_to_completed`, `completion_needs_required_slots`, `review_partial_then_accepted`, `chat_room_end_from_paused`, `application_scope_lifecycle`, `family_not_admitted_quarantined`.
- **Native obligations (11, NOT_RUN).** `COLLAB-RETRY-01`, `COLLAB-UNCERTAIN-01`, `COLLAB-RESTART-01`, `COLLAB-MESSAGE-01`, `COLLAB-CAS-01`, `COLLAB-TOKEN-01`, `COLLAB-QUARANTINE-01`, `COLLAB-READER-01`, `COLLAB-WITHDRAW-01`, `COLLAB-DELETE-01`, `COLLAB-APP-01`.

The negative payloads fail at these layers: `identity_recipe`, `schema`, `valid_utc_datetime`. In the sequences the family is appended and also refused with `conflict:already_terminal`, `conflict:lineage_mismatch`, `conflict:message_already_written`, `conflict:sequence_gap`, `idempotency_conflict`, `quarantined`. The checker fails when any listed case is missing or gives another result.

```yaml
plan_unit_id: ATS-240
unit_type: verification_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-090. The oracles of collaboration.message_added are its own cases in
  Plans/collaboration_event_contract_fixtures.json: positive and negative payloads in both scopes, a valid
  EventRecord per scope and its join negatives, identity vectors including a new recovery epoch, and the
  transition sequences in which it is appended and refused, all checked by python3
  scripts/pm_collaboration_events.py; its native obligations COLLAB-RETRY-01, COLLAB-UNCERTAIN-01,
  COLLAB-RESTART-01, COLLAB-MESSAGE-01, COLLAB-CAS-01, COLLAB-TOKEN-01, COLLAB-QUARANTINE-01,
  COLLAB-READER-01, COLLAB-WITHDRAW-01, COLLAB-DELETE-01, COLLAB-APP-01 stay NOT_RUN. No sibling case stands
  in for its own.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [ATS-230, SP-470, CV-470, CWR-115]
unblocks: []
acceptance_criteria:
  - "Every case listed for collaboration.message_added exists in the fixtures and passes the checker."
  - "collaboration.message_added has positive and negative payload cases in both scopes, its own EventRecord join negatives and identity vectors."
  - "collaboration.message_added is appended and refused in at least one transition sequence."
  - "Its native obligations stay NOT_RUN until they run."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_oracle_gap
reasoning_tier: high
context_scope: collaborative_event_oracles_collaboration_message_added
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaboration_event_contract_fixtures.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.message_added"
  - "COLLAB-RETRY-01"
  - "COLLAB-UNCERTAIN-01"
negative_constraints:
  - "Do not use a sibling's case as collaboration.message_added's own evidence."
  - "Do not record a native obligation as passed without running it."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-230, ContractName:Plans/storage-plan.md#SP-470, ContractName:Plans/Contracts_V0.md#CV-470

### ATS-241 - Oracles of collaboration.artifact_added

`collaboration.artifact_added`'s own cases, listed in its ledger row's `validation_case_ids`:

- **Positive payloads (4).** `artifact_added_project`, `artifact_added_project_required_only`, `artifact_added_application`, `artifact_added_wonderer_pass`.
- **Negative payloads (9).** `artifact_added_text_field_refused`, `artifact_added_missing_artifact_ref`, `artifact_added_project_null_project_id`, `artifact_added_application_with_project_id`, `artifact_added_offset_timestamp`, `artifact_added_key_of_another_subject`, `artifact_added_currentness_not_a_hash`, `artifact_added_impossible_date`, `artifact_added_absolute_path_ref`.
- **Valid eventrecords (2).** `event_valid_artifact_added_project`, `event_valid_artifact_added_application`.
- **Envelope join negatives (5).** `event_artifact_added_occurred_at_join`, `event_artifact_added_sibling_payload_schema_id`, `event_artifact_added_sibling_event_id`, `event_artifact_added_application_schema_in_project_record`, `event_artifact_added_run_id_join`.
- **Identity vectors (3).** `identity_artifact_added_project`, `identity_artifact_added_application`, `identity_artifact_added_new_epoch`.
- **Transition sequences (3).** `crew_lifecycle_to_completed`, `review_partial_then_accepted`, `review_finish_stale`.
- **Native obligations (11, NOT_RUN).** `COLLAB-RETRY-01`, `COLLAB-UNCERTAIN-01`, `COLLAB-RESTART-01`, `COLLAB-ARTIFACT-01`, `COLLAB-CAS-01`, `COLLAB-TOKEN-01`, `COLLAB-QUARANTINE-01`, `COLLAB-READER-01`, `COLLAB-WITHDRAW-01`, `COLLAB-DELETE-01`, `COLLAB-APP-01`.

The negative payloads fail at these layers: `identity_recipe`, `schema`, `valid_utc_datetime`. In the sequences the family is appended and also refused with `conflict:artifact_already_added`, `idempotency_conflict`. The checker fails when any listed case is missing or gives another result.

```yaml
plan_unit_id: ATS-241
unit_type: verification_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-090. The oracles of collaboration.artifact_added are its own cases in
  Plans/collaboration_event_contract_fixtures.json: positive and negative payloads in both scopes, a valid
  EventRecord per scope and its join negatives, identity vectors including a new recovery epoch, and the
  transition sequences in which it is appended and refused, all checked by python3
  scripts/pm_collaboration_events.py; its native obligations COLLAB-RETRY-01, COLLAB-UNCERTAIN-01,
  COLLAB-RESTART-01, COLLAB-ARTIFACT-01, COLLAB-CAS-01, COLLAB-TOKEN-01, COLLAB-QUARANTINE-01,
  COLLAB-READER-01, COLLAB-WITHDRAW-01, COLLAB-DELETE-01, COLLAB-APP-01 stay NOT_RUN. No sibling case stands
  in for its own.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [ATS-230, SP-471, CV-471, CWR-116]
unblocks: []
acceptance_criteria:
  - "Every case listed for collaboration.artifact_added exists in the fixtures and passes the checker."
  - "collaboration.artifact_added has positive and negative payload cases in both scopes, its own EventRecord join negatives and identity vectors."
  - "collaboration.artifact_added is appended and refused in at least one transition sequence."
  - "Its native obligations stay NOT_RUN until they run."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_oracle_gap
reasoning_tier: high
context_scope: collaborative_event_oracles_collaboration_artifact_added
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaboration_event_contract_fixtures.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.artifact_added"
  - "COLLAB-RETRY-01"
  - "COLLAB-UNCERTAIN-01"
negative_constraints:
  - "Do not use a sibling's case as collaboration.artifact_added's own evidence."
  - "Do not record a native obligation as passed without running it."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-230, ContractName:Plans/storage-plan.md#SP-471, ContractName:Plans/Contracts_V0.md#CV-471

### ATS-242 - Oracles of collaboration.configuration_changed

`collaboration.configuration_changed`'s own cases, listed in its ledger row's `validation_case_ids`:

- **Positive payloads (5).** `configuration_changed_project`, `configuration_changed_application`, `configuration_changed_start_commit`, `configuration_changed_finish_stale`, `configuration_changed_waive`.
- **Negative payloads (13).** `configuration_changed_text_field_refused`, `configuration_changed_missing_definition_revision`, `configuration_changed_project_null_project_id`, `configuration_changed_application_with_project_id`, `configuration_changed_offset_timestamp`, `configuration_changed_key_of_another_subject`, `configuration_changed_currentness_not_a_hash`, `configuration_changed_impossible_date`, `configuration_changed_revision_1`, `configuration_changed_previous_not_minus_one`, `configuration_changed_reconfigure_without_change`, `configuration_changed_start_commit_with_system_message`, `configuration_changed_unknown_change_kind`.
- **Valid eventrecords (2).** `event_valid_configuration_changed_project`, `event_valid_configuration_changed_application`.
- **Envelope join negatives (5).** `event_configuration_changed_occurred_at_join`, `event_configuration_changed_sibling_payload_schema_id`, `event_configuration_changed_sibling_event_id`, `event_configuration_changed_application_schema_in_project_record`, `event_configuration_changed_run_id_join`.
- **Identity vectors (3).** `identity_configuration_changed_project`, `identity_configuration_changed_application`, `identity_configuration_changed_new_epoch`.
- **Transition sequences (4).** `completion_needs_required_slots`, `definition_revisions_and_rerun`, `review_partial_then_accepted`, `review_finish_stale`.
- **Native obligations (11, NOT_RUN).** `COLLAB-RETRY-01`, `COLLAB-UNCERTAIN-01`, `COLLAB-RESTART-01`, `COLLAB-RECONFIGURE-01`, `COLLAB-CAS-01`, `COLLAB-TOKEN-01`, `COLLAB-QUARANTINE-01`, `COLLAB-READER-01`, `COLLAB-WITHDRAW-01`, `COLLAB-DELETE-01`, `COLLAB-APP-01`.

The negative payloads fail at these layers: `identity_recipe`, `revision_rule`, `schema`, `valid_utc_datetime`. In the sequences the family is appended and also refused with `conflict:already_terminal`, `conflict:stale_definition_revision`. The checker fails when any listed case is missing or gives another result.

```yaml
plan_unit_id: ATS-242
unit_type: verification_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-090. The oracles of collaboration.configuration_changed are its own
  cases in Plans/collaboration_event_contract_fixtures.json: positive and negative payloads in both scopes, a
  valid EventRecord per scope and its join negatives, identity vectors including a new recovery epoch, and the
  transition sequences in which it is appended and refused, all checked by python3
  scripts/pm_collaboration_events.py; its native obligations COLLAB-RETRY-01, COLLAB-UNCERTAIN-01,
  COLLAB-RESTART-01, COLLAB-RECONFIGURE-01, COLLAB-CAS-01, COLLAB-TOKEN-01, COLLAB-QUARANTINE-01,
  COLLAB-READER-01, COLLAB-WITHDRAW-01, COLLAB-DELETE-01, COLLAB-APP-01 stay NOT_RUN. No sibling case stands
  in for its own.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [ATS-230, SP-472, CV-472, CWR-117]
unblocks: []
acceptance_criteria:
  - "Every case listed for collaboration.configuration_changed exists in the fixtures and passes the checker."
  - "collaboration.configuration_changed has positive and negative payload cases in both scopes, its own EventRecord join negatives and identity vectors."
  - "collaboration.configuration_changed is appended and refused in at least one transition sequence."
  - "Its native obligations stay NOT_RUN until they run."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_oracle_gap
reasoning_tier: high
context_scope: collaborative_event_oracles_collaboration_configuration_changed
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaboration_event_contract_fixtures.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "collaboration.configuration_changed"
  - "COLLAB-RETRY-01"
  - "COLLAB-UNCERTAIN-01"
negative_constraints:
  - "Do not use a sibling's case as collaboration.configuration_changed's own evidence."
  - "Do not record a native obligation as passed without running it."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-230, ContractName:Plans/storage-plan.md#SP-472, ContractName:Plans/Contracts_V0.md#CV-472

### ATS-243 - Oracles of brainstorm.proposal_added

`brainstorm.proposal_added`'s own cases, listed in its ledger row's `validation_case_ids`:

- **Positive payloads (3).** `proposal_added_project`, `proposal_added_application`, `proposal_added_hybrid_round_2`.
- **Negative payloads (10).** `proposal_added_text_field_refused`, `proposal_added_missing_proposal_id`, `proposal_added_project_null_project_id`, `proposal_added_application_with_project_id`, `proposal_added_offset_timestamp`, `proposal_added_key_of_another_subject`, `proposal_added_currentness_not_a_hash`, `proposal_added_impossible_date`, `proposal_added_on_crew`, `proposal_added_round_0`.
- **Valid eventrecords (2).** `event_valid_proposal_added_project`, `event_valid_proposal_added_application`.
- **Envelope join negatives (5).** `event_proposal_added_occurred_at_join`, `event_proposal_added_sibling_payload_schema_id`, `event_proposal_added_sibling_event_id`, `event_proposal_added_application_schema_in_project_record`, `event_proposal_added_run_id_join`.
- **Identity vectors (3).** `identity_proposal_added_project`, `identity_proposal_added_application`, `identity_proposal_added_new_epoch`.
- **Transition sequences (2).** `brainstorm_proposals_votes_synthesis`, `brainstorm_event_on_crew_run`.
- **Native obligations (11, NOT_RUN).** `COLLAB-RETRY-01`, `COLLAB-UNCERTAIN-01`, `COLLAB-RESTART-01`, `COLLAB-BLIND-01`, `COLLAB-CAS-01`, `COLLAB-TOKEN-01`, `COLLAB-QUARANTINE-01`, `COLLAB-READER-01`, `COLLAB-WITHDRAW-01`, `COLLAB-DELETE-01`, `COLLAB-APP-01`.

The negative payloads fail at these layers: `identity_recipe`, `schema`, `valid_utc_datetime`. In the sequences the family is appended and also refused with `conflict:lineage_mismatch`, `conflict:not_core_participant`, `conflict:proposal_already_added`, `conflict:unknown_attempt`, `idempotency_conflict`. The checker fails when any listed case is missing or gives another result.

```yaml
plan_unit_id: ATS-243
unit_type: verification_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-090. The oracles of brainstorm.proposal_added are its own cases in
  Plans/collaboration_event_contract_fixtures.json: positive and negative payloads in both scopes, a valid
  EventRecord per scope and its join negatives, identity vectors including a new recovery epoch, and the
  transition sequences in which it is appended and refused, all checked by python3
  scripts/pm_collaboration_events.py; its native obligations COLLAB-RETRY-01, COLLAB-UNCERTAIN-01,
  COLLAB-RESTART-01, COLLAB-BLIND-01, COLLAB-CAS-01, COLLAB-TOKEN-01, COLLAB-QUARANTINE-01, COLLAB-READER-01,
  COLLAB-WITHDRAW-01, COLLAB-DELETE-01, COLLAB-APP-01 stay NOT_RUN. No sibling case stands in for its own.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [ATS-230, SP-473, CV-473, CWR-118]
unblocks: []
acceptance_criteria:
  - "Every case listed for brainstorm.proposal_added exists in the fixtures and passes the checker."
  - "brainstorm.proposal_added has positive and negative payload cases in both scopes, its own EventRecord join negatives and identity vectors."
  - "brainstorm.proposal_added is appended and refused in at least one transition sequence."
  - "Its native obligations stay NOT_RUN until they run."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_oracle_gap
reasoning_tier: high
context_scope: collaborative_event_oracles_brainstorm_proposal_added
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaboration_event_contract_fixtures.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "brainstorm.proposal_added"
  - "COLLAB-RETRY-01"
  - "COLLAB-UNCERTAIN-01"
negative_constraints:
  - "Do not use a sibling's case as brainstorm.proposal_added's own evidence."
  - "Do not record a native obligation as passed without running it."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-230, ContractName:Plans/storage-plan.md#SP-473, ContractName:Plans/Contracts_V0.md#CV-473

### ATS-244 - Oracles of brainstorm.vote_added

`brainstorm.vote_added`'s own cases, listed in its ledger row's `validation_case_ids`:

- **Positive payloads (3).** `vote_added_project`, `vote_added_application`, `vote_added_oppose_conflicts`.
- **Negative payloads (10).** `vote_added_text_field_refused`, `vote_added_missing_vote_id`, `vote_added_project_null_project_id`, `vote_added_application_with_project_id`, `vote_added_offset_timestamp`, `vote_added_key_of_another_subject`, `vote_added_currentness_not_a_hash`, `vote_added_impossible_date`, `vote_added_confidence_over_1`, `vote_added_position_majority`.
- **Valid eventrecords (2).** `event_valid_vote_added_project`, `event_valid_vote_added_application`.
- **Envelope join negatives (5).** `event_vote_added_occurred_at_join`, `event_vote_added_sibling_payload_schema_id`, `event_vote_added_sibling_event_id`, `event_vote_added_application_schema_in_project_record`, `event_vote_added_run_id_join`.
- **Identity vectors (3).** `identity_vote_added_project`, `identity_vote_added_application`, `identity_vote_added_new_epoch`.
- **Transition sequences (1).** `brainstorm_proposals_votes_synthesis`.
- **Native obligations (11, NOT_RUN).** `COLLAB-RETRY-01`, `COLLAB-UNCERTAIN-01`, `COLLAB-RESTART-01`, `COLLAB-VOTE-01`, `COLLAB-CAS-01`, `COLLAB-TOKEN-01`, `COLLAB-QUARANTINE-01`, `COLLAB-READER-01`, `COLLAB-WITHDRAW-01`, `COLLAB-DELETE-01`, `COLLAB-APP-01`.

The negative payloads fail at these layers: `identity_recipe`, `schema`, `valid_utc_datetime`. In the sequences the family is appended and also refused with `conflict:attempt_not_current`, `conflict:unknown_proposal`, `conflict:vote_already_added`, `conflict:wonderer_cannot_vote`. The checker fails when any listed case is missing or gives another result.

```yaml
plan_unit_id: ATS-244
unit_type: verification_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-090. The oracles of brainstorm.vote_added are its own cases in
  Plans/collaboration_event_contract_fixtures.json: positive and negative payloads in both scopes, a valid
  EventRecord per scope and its join negatives, identity vectors including a new recovery epoch, and the
  transition sequences in which it is appended and refused, all checked by python3
  scripts/pm_collaboration_events.py; its native obligations COLLAB-RETRY-01, COLLAB-UNCERTAIN-01,
  COLLAB-RESTART-01, COLLAB-VOTE-01, COLLAB-CAS-01, COLLAB-TOKEN-01, COLLAB-QUARANTINE-01, COLLAB-READER-01,
  COLLAB-WITHDRAW-01, COLLAB-DELETE-01, COLLAB-APP-01 stay NOT_RUN. No sibling case stands in for its own.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [ATS-230, SP-474, CV-474, CWR-119]
unblocks: []
acceptance_criteria:
  - "Every case listed for brainstorm.vote_added exists in the fixtures and passes the checker."
  - "brainstorm.vote_added has positive and negative payload cases in both scopes, its own EventRecord join negatives and identity vectors."
  - "brainstorm.vote_added is appended and refused in at least one transition sequence."
  - "Its native obligations stay NOT_RUN until they run."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_oracle_gap
reasoning_tier: high
context_scope: collaborative_event_oracles_brainstorm_vote_added
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaboration_event_contract_fixtures.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "brainstorm.vote_added"
  - "COLLAB-RETRY-01"
  - "COLLAB-UNCERTAIN-01"
negative_constraints:
  - "Do not use a sibling's case as brainstorm.vote_added's own evidence."
  - "Do not record a native obligation as passed without running it."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-230, ContractName:Plans/storage-plan.md#SP-474, ContractName:Plans/Contracts_V0.md#CV-474

### ATS-245 - Oracles of brainstorm.plan_synthesized

`brainstorm.plan_synthesized`'s own cases, listed in its ledger row's `validation_case_ids`:

- **Positive payloads (4).** `plan_synthesized_project`, `plan_synthesized_project_required_only`, `plan_synthesized_application`, `plan_synthesized_tie`.
- **Negative payloads (10).** `plan_synthesized_text_field_refused`, `plan_synthesized_missing_assistant_plan_id`, `plan_synthesized_project_null_project_id`, `plan_synthesized_application_with_project_id`, `plan_synthesized_offset_timestamp`, `plan_synthesized_key_of_another_subject`, `plan_synthesized_currentness_not_a_hash`, `plan_synthesized_impossible_date`, `plan_synthesized_on_review`, `plan_synthesized_tie_by_order`.
- **Valid eventrecords (2).** `event_valid_plan_synthesized_project`, `event_valid_plan_synthesized_application`.
- **Envelope join negatives (5).** `event_plan_synthesized_occurred_at_join`, `event_plan_synthesized_sibling_payload_schema_id`, `event_plan_synthesized_sibling_event_id`, `event_plan_synthesized_application_schema_in_project_record`, `event_plan_synthesized_run_id_join`.
- **Identity vectors (3).** `identity_plan_synthesized_project`, `identity_plan_synthesized_application`, `identity_plan_synthesized_new_epoch`.
- **Transition sequences (1).** `brainstorm_proposals_votes_synthesis`.
- **Native obligations (11, NOT_RUN).** `COLLAB-RETRY-01`, `COLLAB-UNCERTAIN-01`, `COLLAB-RESTART-01`, `COLLAB-SYNTH-01`, `COLLAB-CAS-01`, `COLLAB-TOKEN-01`, `COLLAB-QUARANTINE-01`, `COLLAB-READER-01`, `COLLAB-WITHDRAW-01`, `COLLAB-DELETE-01`, `COLLAB-APP-01`.

The negative payloads fail at these layers: `identity_recipe`, `schema`, `valid_utc_datetime`. In the sequences the family is appended and also refused with `conflict:already_synthesized`, `idempotency_conflict`. The checker fails when any listed case is missing or gives another result.

```yaml
plan_unit_id: ATS-245
unit_type: verification_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-090. The oracles of brainstorm.plan_synthesized are its own cases in
  Plans/collaboration_event_contract_fixtures.json: positive and negative payloads in both scopes, a valid
  EventRecord per scope and its join negatives, identity vectors including a new recovery epoch, and the
  transition sequences in which it is appended and refused, all checked by python3
  scripts/pm_collaboration_events.py; its native obligations COLLAB-RETRY-01, COLLAB-UNCERTAIN-01,
  COLLAB-RESTART-01, COLLAB-SYNTH-01, COLLAB-CAS-01, COLLAB-TOKEN-01, COLLAB-QUARANTINE-01, COLLAB-READER-01,
  COLLAB-WITHDRAW-01, COLLAB-DELETE-01, COLLAB-APP-01 stay NOT_RUN. No sibling case stands in for its own.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [ATS-230, SP-475, CV-475, CWR-120]
unblocks: []
acceptance_criteria:
  - "Every case listed for brainstorm.plan_synthesized exists in the fixtures and passes the checker."
  - "brainstorm.plan_synthesized has positive and negative payload cases in both scopes, its own EventRecord join negatives and identity vectors."
  - "brainstorm.plan_synthesized is appended and refused in at least one transition sequence."
  - "Its native obligations stay NOT_RUN until they run."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_oracle_gap
reasoning_tier: high
context_scope: collaborative_event_oracles_brainstorm_plan_synthesized
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaboration_event_contract_fixtures.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "brainstorm.plan_synthesized"
  - "COLLAB-RETRY-01"
  - "COLLAB-UNCERTAIN-01"
negative_constraints:
  - "Do not use a sibling's case as brainstorm.plan_synthesized's own evidence."
  - "Do not record a native obligation as passed without running it."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-230, ContractName:Plans/storage-plan.md#SP-475, ContractName:Plans/Contracts_V0.md#CV-475

### ATS-246 - Oracles of review.finding_added

`review.finding_added`'s own cases, listed in its ledger row's `validation_case_ids`:

- **Positive payloads (3).** `finding_added_project`, `finding_added_application`, `finding_added_two_reviewers`.
- **Negative payloads (10).** `finding_added_text_field_refused`, `finding_added_missing_finding_id`, `finding_added_project_null_project_id`, `finding_added_application_with_project_id`, `finding_added_offset_timestamp`, `finding_added_key_of_another_subject`, `finding_added_currentness_not_a_hash`, `finding_added_impossible_date`, `finding_added_no_reviewers`, `finding_added_uppercase_hash`.
- **Valid eventrecords (2).** `event_valid_finding_added_project`, `event_valid_finding_added_application`.
- **Envelope join negatives (5).** `event_finding_added_occurred_at_join`, `event_finding_added_sibling_payload_schema_id`, `event_finding_added_sibling_event_id`, `event_finding_added_application_schema_in_project_record`, `event_finding_added_run_id_join`.
- **Identity vectors (3).** `identity_finding_added_project`, `identity_finding_added_application`, `identity_finding_added_new_epoch`.
- **Transition sequences (4).** `brainstorm_event_on_crew_run`, `review_partial_then_accepted`, `review_finish_stale`, `review_completion_needs_artifact`.
- **Native obligations (11, NOT_RUN).** `COLLAB-RETRY-01`, `COLLAB-UNCERTAIN-01`, `COLLAB-RESTART-01`, `COLLAB-BLIND-01`, `COLLAB-CAS-01`, `COLLAB-TOKEN-01`, `COLLAB-QUARANTINE-01`, `COLLAB-READER-01`, `COLLAB-WITHDRAW-01`, `COLLAB-DELETE-01`, `COLLAB-APP-01`.

The negative payloads fail at these layers: `identity_recipe`, `schema`, `valid_utc_datetime`. In the sequences the family is appended and also refused with `conflict:already_terminal`, `conflict:finding_already_added`, `conflict:lineage_mismatch`, `conflict:slot_not_in_roster`, `conflict:target_hash_mismatch`. The checker fails when any listed case is missing or gives another result.

```yaml
plan_unit_id: ATS-246
unit_type: verification_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-090. The oracles of review.finding_added are its own cases in
  Plans/collaboration_event_contract_fixtures.json: positive and negative payloads in both scopes, a valid
  EventRecord per scope and its join negatives, identity vectors including a new recovery epoch, and the
  transition sequences in which it is appended and refused, all checked by python3
  scripts/pm_collaboration_events.py; its native obligations COLLAB-RETRY-01, COLLAB-UNCERTAIN-01,
  COLLAB-RESTART-01, COLLAB-BLIND-01, COLLAB-CAS-01, COLLAB-TOKEN-01, COLLAB-QUARANTINE-01, COLLAB-READER-01,
  COLLAB-WITHDRAW-01, COLLAB-DELETE-01, COLLAB-APP-01 stay NOT_RUN. No sibling case stands in for its own.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [ATS-230, SP-476, CV-476, CWR-121]
unblocks: []
acceptance_criteria:
  - "Every case listed for review.finding_added exists in the fixtures and passes the checker."
  - "review.finding_added has positive and negative payload cases in both scopes, its own EventRecord join negatives and identity vectors."
  - "review.finding_added is appended and refused in at least one transition sequence."
  - "Its native obligations stay NOT_RUN until they run."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_oracle_gap
reasoning_tier: high
context_scope: collaborative_event_oracles_review_finding_added
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaboration_event_contract_fixtures.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "review.finding_added"
  - "COLLAB-RETRY-01"
  - "COLLAB-UNCERTAIN-01"
negative_constraints:
  - "Do not use a sibling's case as review.finding_added's own evidence."
  - "Do not record a native obligation as passed without running it."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-230, ContractName:Plans/storage-plan.md#SP-476, ContractName:Plans/Contracts_V0.md#CV-476

### ATS-247 - Oracles of review.finding_dispositioned

`review.finding_dispositioned`'s own cases, listed in its ledger row's `validation_case_ids`:

- **Positive payloads (3).** `finding_dispositioned_project`, `finding_dispositioned_application`, `finding_dispositioned_uncertain`.
- **Negative payloads (9).** `finding_dispositioned_text_field_refused`, `finding_dispositioned_missing_finding_id`, `finding_dispositioned_project_null_project_id`, `finding_dispositioned_application_with_project_id`, `finding_dispositioned_offset_timestamp`, `finding_dispositioned_key_of_another_subject`, `finding_dispositioned_currentness_not_a_hash`, `finding_dispositioned_impossible_date`, `finding_dispositioned_unknown_disposition`.
- **Valid eventrecords (2).** `event_valid_finding_dispositioned_project`, `event_valid_finding_dispositioned_application`.
- **Envelope join negatives (5).** `event_finding_dispositioned_occurred_at_join`, `event_finding_dispositioned_sibling_payload_schema_id`, `event_finding_dispositioned_sibling_event_id`, `event_finding_dispositioned_application_schema_in_project_record`, `event_finding_dispositioned_run_id_join`.
- **Identity vectors (3).** `identity_finding_dispositioned_project`, `identity_finding_dispositioned_application`, `identity_finding_dispositioned_new_epoch`.
- **Transition sequences (2).** `review_partial_then_accepted`, `review_finish_stale`.
- **Native obligations (11, NOT_RUN).** `COLLAB-RETRY-01`, `COLLAB-UNCERTAIN-01`, `COLLAB-RESTART-01`, `COLLAB-QUORUM-01`, `COLLAB-CAS-01`, `COLLAB-TOKEN-01`, `COLLAB-QUARANTINE-01`, `COLLAB-READER-01`, `COLLAB-WITHDRAW-01`, `COLLAB-DELETE-01`, `COLLAB-APP-01`.

The negative payloads fail at these layers: `identity_recipe`, `schema`, `valid_utc_datetime`. In the sequences the family is appended and also refused with `conflict:already_dispositioned`, `conflict:unknown_finding`, `idempotency_conflict`. The checker fails when any listed case is missing or gives another result.

```yaml
plan_unit_id: ATS-247
unit_type: verification_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-090. The oracles of review.finding_dispositioned are its own cases in
  Plans/collaboration_event_contract_fixtures.json: positive and negative payloads in both scopes, a valid
  EventRecord per scope and its join negatives, identity vectors including a new recovery epoch, and the
  transition sequences in which it is appended and refused, all checked by python3
  scripts/pm_collaboration_events.py; its native obligations COLLAB-RETRY-01, COLLAB-UNCERTAIN-01,
  COLLAB-RESTART-01, COLLAB-QUORUM-01, COLLAB-CAS-01, COLLAB-TOKEN-01, COLLAB-QUARANTINE-01, COLLAB-READER-01,
  COLLAB-WITHDRAW-01, COLLAB-DELETE-01, COLLAB-APP-01 stay NOT_RUN. No sibling case stands in for its own.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [ATS-230, SP-477, CV-477, CWR-122]
unblocks: []
acceptance_criteria:
  - "Every case listed for review.finding_dispositioned exists in the fixtures and passes the checker."
  - "review.finding_dispositioned has positive and negative payload cases in both scopes, its own EventRecord join negatives and identity vectors."
  - "review.finding_dispositioned is appended and refused in at least one transition sequence."
  - "Its native obligations stay NOT_RUN until they run."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_oracle_gap
reasoning_tier: high
context_scope: collaborative_event_oracles_review_finding_dispositioned
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaboration_event_contract_fixtures.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "review.finding_dispositioned"
  - "COLLAB-RETRY-01"
  - "COLLAB-UNCERTAIN-01"
negative_constraints:
  - "Do not use a sibling's case as review.finding_dispositioned's own evidence."
  - "Do not record a native obligation as passed without running it."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-230, ContractName:Plans/storage-plan.md#SP-477, ContractName:Plans/Contracts_V0.md#CV-477

### ATS-248 - Oracles of review.artifact_finalized

`review.artifact_finalized`'s own cases, listed in its ledger row's `validation_case_ids`:

- **Positive payloads (4).** `artifact_finalized_project`, `artifact_finalized_application`, `artifact_finalized_single_reviewer`, `artifact_finalized_partial_stale`.
- **Negative payloads (10).** `artifact_finalized_text_field_refused`, `artifact_finalized_missing_artifact_ref`, `artifact_finalized_project_null_project_id`, `artifact_finalized_application_with_project_id`, `artifact_finalized_offset_timestamp`, `artifact_finalized_key_of_another_subject`, `artifact_finalized_currentness_not_a_hash`, `artifact_finalized_impossible_date`, `artifact_finalized_single_with_three`, `artifact_finalized_counts_disagree`.
- **Valid eventrecords (2).** `event_valid_artifact_finalized_project`, `event_valid_artifact_finalized_application`.
- **Envelope join negatives (5).** `event_artifact_finalized_occurred_at_join`, `event_artifact_finalized_sibling_payload_schema_id`, `event_artifact_finalized_sibling_event_id`, `event_artifact_finalized_application_schema_in_project_record`, `event_artifact_finalized_run_id_join`.
- **Identity vectors (3).** `identity_artifact_finalized_project`, `identity_artifact_finalized_application`, `identity_artifact_finalized_new_epoch`.
- **Transition sequences (2).** `review_partial_then_accepted`, `review_finish_stale`.
- **Native obligations (12, NOT_RUN).** `COLLAB-RETRY-01`, `COLLAB-UNCERTAIN-01`, `COLLAB-RESTART-01`, `COLLAB-ARTIFACT-01`, `COLLAB-QUORUM-01`, `COLLAB-CAS-01`, `COLLAB-TOKEN-01`, `COLLAB-QUARANTINE-01`, `COLLAB-READER-01`, `COLLAB-WITHDRAW-01`, `COLLAB-DELETE-01`, `COLLAB-APP-01`.

The negative payloads fail at these layers: `identity_recipe`, `review_counts`, `schema`, `valid_utc_datetime`. In the sequences the family is appended and also refused with `conflict:already_finalized`, `conflict:artifact_not_added`, `conflict:findings_not_dispositioned`, `conflict:partial_not_accepted`, `conflict:stale_not_accepted`, `exact_retry`, `idempotency_conflict`. The checker fails when any listed case is missing or gives another result.

```yaml
plan_unit_id: ATS-248
unit_type: verification_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-090. The oracles of review.artifact_finalized are its own cases in
  Plans/collaboration_event_contract_fixtures.json: positive and negative payloads in both scopes, a valid
  EventRecord per scope and its join negatives, identity vectors including a new recovery epoch, and the
  transition sequences in which it is appended and refused, all checked by python3
  scripts/pm_collaboration_events.py; its native obligations COLLAB-RETRY-01, COLLAB-UNCERTAIN-01,
  COLLAB-RESTART-01, COLLAB-ARTIFACT-01, COLLAB-QUORUM-01, COLLAB-CAS-01, COLLAB-TOKEN-01,
  COLLAB-QUARANTINE-01, COLLAB-READER-01, COLLAB-WITHDRAW-01, COLLAB-DELETE-01, COLLAB-APP-01 stay NOT_RUN. No
  sibling case stands in for its own.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [ATS-230, SP-478, CV-478, CWR-123]
unblocks: []
acceptance_criteria:
  - "Every case listed for review.artifact_finalized exists in the fixtures and passes the checker."
  - "review.artifact_finalized has positive and negative payload cases in both scopes, its own EventRecord join negatives and identity vectors."
  - "review.artifact_finalized is appended and refused in at least one transition sequence."
  - "Its native obligations stay NOT_RUN until they run."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_oracle_gap
reasoning_tier: high
context_scope: collaborative_event_oracles_review_artifact_finalized
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaboration_event_contract_fixtures.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-090"
  - "Plans/Decision_Log.md#DL-091"
  - "Plans/Decision_Log.md#DL-092"
  - "Plans/Decision_Log.md#DL-292"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/L8/REPORT.md"
preserved_exact_tokens:
  - "review.artifact_finalized"
  - "COLLAB-RETRY-01"
  - "COLLAB-UNCERTAIN-01"
negative_constraints:
  - "Do not use a sibling's case as review.artifact_finalized's own evidence."
  - "Do not record a native obligation as passed without running it."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-230, ContractName:Plans/storage-plan.md#SP-478, ContractName:Plans/Contracts_V0.md#CV-478
