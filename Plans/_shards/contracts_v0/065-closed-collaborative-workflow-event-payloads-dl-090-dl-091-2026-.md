# Shard 065: Closed collaborative workflow event payloads (DL-090, DL-091, 2026-11-04)

Source: `Plans/Contracts_V0.md`

Source lines: L24609-L26221

Source SHA256: `b776a0d5bd373a3ad07b324ac18387570062c6388faba994f5606941540c0675`

---

## Closed collaborative workflow event payloads (DL-090, DL-091, 2026-11-04)

This is a **newly authored owner contract under DL-090** (DL-091 for `collaboration.failed`) for the closed payloads of the 18 collaborative workflow families: `collaboration.created`, `collaboration.started`, `collaboration.paused`, `collaboration.resumed`, `collaboration.cancelled`, `collaboration.completed`, `collaboration.failed`, `collaboration.participant_started`, `collaboration.participant_completed`, `collaboration.message_added`, `collaboration.artifact_added`, `collaboration.configuration_changed`, `brainstorm.proposal_added`, `brainstorm.vote_added`, `brainstorm.plan_synthesized`, `review.finding_added`, `review.finding_dispositioned`, `review.artifact_finalized`. It is backed by the per-family search `reports/event-authority-20261104/DC-binding-search.md`, which found no payload schema for any of them: `Plans/collaborative_workflows_contracts.schema.json` closes the records and commands only and "admits no writer, storage key, EventRecord or handler" (Collaborative Workflows section 12). The closed form is `Plans/collaboration_event_payloads.schema.json`, schema ID `https://puppetmaster.local/schemas/collaboration_event_payloads/1.0.0/collaboration_event_payloads.schema.json`. The semantic owner is `Plans/Collaborative_Workflows.md` (CWR-105 to CWR-123); persistence, identity and transitions are `Plans/storage-plan.md` SP-460 to SP-478. Nothing here admits a family.

### CV-460 - Shared rules of the collaborative workflow event payloads

1. **Editions.** Each family has two closed definitions: `<token>` with schema ID `pm.collaboration_event.<token>.v1` for project scope and `<token>_application` with `pm.collaboration_event.<token>.application.v1` for application scope, following CV-366's naming of application editions. Both are version `1.0.0` and are selected by exact scope and schema ID with no fallback. A later change needs a new definition and version, and readers reject an unsupported one.
2. **Common fields.** Every payload requires `schema_version` (`1.0.0`), `scope_kind`, `project_id` (a real Project in project scope, the required null of application scope), `thread_id` (the run's chat), `collaboration_id`, `collaboration_run_id`, `kind`, `definition_revision` (the run's current revision; the new revision for a definition event), `currentness_hash` (the SHA-256 currentness of the owner record after the commit the event records, section 11) and `idempotency_key`. Application payloads also require `server_id`, the actual Server whose application data root holds the run. A BrainStorm family fixes `kind` to `brainstorm` and a Review family to `review`.
3. **No nulls.** An optional field without a value is omitted, so each value has one encoding and a retry reproduces the same producer semantic digest. The only null is application scope's `project_id`.
4. **Closed sets.** `kind`, `admission_source`, `coordinator_kind`, `stop_reason`, `participant_outcome`, `additive_role_kind`, `sender_kind`, `message_type`, `vote_position`, `review_severity` and `review_disposition` are referenced from the closed enumerations Collaborative Workflows section 12 owns in `Plans/collaborative_workflows_contracts.schema.json`. `reconfigure_change_kind` lists the `change_kind` constants of that file's `reconfigure_change` union. A reason code (`failure_reason`, `outcome_reason`) is a section 11 typed error other than `cancelled`. State fields take subsets of the closed run states.
5. **References and bounds.** Identifiers are 1 to 256 characters without whitespace. References use CV-353 rule 6's `non_secret_ref` form, adopted here by name: `kind:value`, no whitespace, no credential, account identifier, local absolute path or content. Timestamps are RFC 3339 UTC ending in `Z` and real calendar values. Every identifier, reference, hash, token and timestamp uses a true end-of-string guard (including trailing-LF refusal); fixed-format values also have exact lengths. Calendar and range validity is CV-1101's shared date-time predicate with the terminal-uppercase-`Z` profile `storage_utc_z` (the "ending in `Z`" above), so hour 24, an illegitimate second 60, an impossible date and a trailing LF refuse and a legitimate leap second stays valid; the EventRecord's `occurred_at_utc` takes CV-1101's `event_record` profile and `observed_at_utc`/`persisted_at_utc` CV-253's `storage_utc_z`, and the Collaborative Workflows owner-record times the payloads join keep their own owner pattern under the `event_record` profile.
6. **No text.** No payload carries a definition name or purpose, message body, proposal or vote text, finding claim, dissent, waiver reason, Plan text, error text or tool output (CWR-105). Each closed definition admits only its listed fields, so such a field fails validation.
7. **EventRecord joins.** A collaborative EventRecord has `scope_kind` equal to the payload's; `project_id`, `thread_id` and `idempotency_key` equal to the payload's; `run_id` equal to `collaboration_run_id`; `node_id` null; `attempt_id` equal to the payload's `attempt_id` for the two participant families and null otherwise; `payload_schema_id` equal to the edition's schema ID; `event_type` exactly the selected family; `payload` inline only when canonical UTF-8 JSON is at most 16,384 bytes, otherwise `payload` `{}` and `payload_ref` `payload:blake3:{64_lowercase_hex}:{byte_size}:application/json`; `redaction_profile` `no_secrets`; `replay_policy` `dedupe_by_idempotency_key`; `occurred_at_utc` equal to the family timestamp; and `event_id` and `idempotency_key` from SP-460's recipe. `actor_ref`, `correlation_id` and `causation_event_id` follow CWR-105.

8. **Original source facts and application wrapper successors.** SP-460's field-by-field original-owner joins are mandatory on prepare, retry and recovery. Every nested application context joins instance, Server and thread; a recomputed digest cannot replace those joins. The four collaborative application physical wrappers use explicit `*StorageApplicationV2` definitions (schema version `2.0.0`); unchanged logical V1 records are inline or resolved through SP-337, with exactly one of `record` and `record_ref` non-null. The complete encoded wrapper must fit 16,384 bytes. Closed V1 physical definitions remain unchanged for historical readers. Numeric identity/digest input uses SP-460's lossless decimal decoding and one canonical number rule; exact boolean/integer control types are required without coercion. Current input follows CV-1100: every integer slot admits only an exact current integer, so an integral float, exponent or negative-zero spelling refuses as new input while SP-460's commitment of it stays one; SP-1100 owns the Storage uint64 fields and physical profiles, and SP-1101 selects the frozen recipe of a retained original.

```yaml
plan_unit_id: CV-460
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-090. Plans/collaboration_event_payloads.schema.json closes the
  payloads of the 18 collaborative workflow families, each with a project edition
  pm.collaboration_event.<token>.v1 and an application edition pm.collaboration_event.<token>.application.v1
  at 1.0.0, selected by exact scope and schema ID. Every payload requires schema_version, scope_kind,
  project_id (null only in application scope), thread_id, collaboration_id, collaboration_run_id, kind,
  definition_revision, currentness_hash and idempotency_key, and application payloads server_id. Optional
  fields are omitted, never null. Closed sets reference Collaborative Workflows section 12's enumerations;
  reasons are section 11 codes other than cancelled. References use CV-353's non_secret_ref form. No payload
  carries user or participant text. The EventRecord joins fix scope, identity, run, attempt, schema,
  redaction, replay, occurrence time and the SP-460 identity recipe. Nothing is admitted.
  SP-337 externalizes bodies above 16384 canonical UTF-8 bytes and verifies complete resolved bytes and
  identical payload joins. Identifiers and hashes use true-end lexical guards. Family/envelope equality is
  mandatory; SP-460 defines lossless numeric serialization, exact control types and field-level frozen
  caller-envelope/source custody. CV-1100 governs current integer input, SP-1100 the Storage uint64 and
  physical profiles, SP-1101 retained-original recipe selection and CV-1101 each timestamp's owner profile. Four explicit collaborative app V2 wrappers independently fit 16384
  MessagePack bytes or use verified SP-337 logical-record references; closed V1 definitions are preserved.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [DL-090, DL-091, CV-353, CV-366, CWR-105]
unblocks: []
acceptance_criteria:
  - "Each family has exactly one closed project definition and one closed application definition, each resolving to its own schema ID."
  - "Every payload rejects an unknown field, a null other than application project_id, an out-of-domain value or a missing common field."
  - "No payload admits user or participant text."
  - "Every EventRecord joins its payload on scope, project, thread, run, attempt, key, schema ID, occurrence time, redaction, replay and the SP-460 event ID."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: collaborative_event_payload_contract_regression
reasoning_tier: high
context_scope: collaborative_event_payloads_shared
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
  - Plans/storage-plan.md
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
  - "Plans/Contracts_V0.md#CV-353"
  - "Plans/Contracts_V0.md#CV-366"
preserved_exact_tokens:
  - "Plans/collaboration_event_payloads.schema.json"
  - "pm.collaboration_event"
  - "currentness_hash"
  - "non_secret_ref"
negative_constraints:
  - "Do not add a payload field outside a family's closed definition, and do not admit a family."
  - "Do not use null for an absent optional field."
  - "Do not carry user or participant text."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
  - Plans/storage-plan.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-090, ContractName:Plans/Collaborative_Workflows.md#CWR-105, ContractName:Plans/storage-plan.md#SP-460, ContractName:Plans/Contracts_V0.md#CV-353, ContractName:Plans/Contracts_V0.md#CV-366, ContractName:Plans/collaboration_event_payloads.schema.json

**Numeric interpretation.** SP-460 defines one canonical numeric serialization for the new semantic/snapshot commitments and base-10 identity subjects; no string/boolean coercion or native-codec change is permitted.

**SP-337 adoption.** The payload-reference string encodes BLAKE3 of the exact canonical UTF-8 JSON bytes, byte size and media type. Resolution verifies durable bytes, exact size/hash/type, canonical JSON and the same closed payload/identity/scope/timestamp rules as inline form; missing/wrong refs, inline plus reference and over-limit inline reject. Storage acknowledges references only after pack-byte durability. The reference form is allowed for smaller separately governed bodies too. No roster, recipient, target or constraint bound is reduced to fit inline. Reference resolution, pack ingest/GC and crash durability remain native NOT_RUN.

**Authoritative completion observation.** Created/configuration payloads require `required_slot_ids`, exactly the committed definition's immutable required-slot snapshot in SP-460, never a caller-selected completion predicate. Completion must report that retained set and the actual waived set. Ordinary Crew/BrainStorm/Review clean completion requires resolved required slots plus their kind's outputs. CWR-031's explicit `cmd.chat_room.end` settles Chat Room completed after closing open attempts and stops further rounds/messages; it does not introduce a waiver command. Native completion remains NOT_RUN.

### CV-461 - The closed collaboration.created payload

`collaboration.created` has `$defs/collaboration_created` (`pm.collaboration_event.collaboration_created.v1`) and `$defs/collaboration_created_application` (`pm.collaboration_event.collaboration_created.application.v1`) in `Plans/collaboration_event_payloads.schema.json`. Both carry CV-460's common fields and these fields of its own, the same in both editions:

| Field | Required | Form | Meaning |
|---|---|---|---|
| `definition_revision` | yes | exactly `1` | always 1 |
| `created_at_utc` | yes | UTC timestamp | when revision 1 was committed |
| `admission_source` | yes | CW section 12 `admission_source` | the admission that committed it (CWR-021) |
| `participant_slot_ids` | yes | unique identifiers, at least 1 | the slot IDs of the committed participant specs |
| `coordinator_kind` | yes | CW section 12 `coordinator_kind` | the committed coordinator_spec kind (CWR-037) |
| `definition_record_ref` | yes | `non_secret_ref` | the committed definition record, kind collaboration_definition |

**Rules.** `definition_revision` is exactly 1. The family timestamp is `created_at_utc`, which the EventRecord's `occurred_at_utc` equals. Its idempotency key and event ID follow SP-460 with the subject `collaboration_id, definition_revision` (SP-461). The definition's name and purpose are user text and stay in the definition record; the event carries the identity, the admission source, the slot IDs and the coordinator kind only.

```yaml
plan_unit_id: CV-461
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-090. The closed payload of collaboration.created is
  pm.collaboration_event.collaboration_created.v1 for project scope and
  pm.collaboration_event.collaboration_created.application.v1 for application scope in
  Plans/collaboration_event_payloads.schema.json, with CV-460's common fields and its own fields:
  definition_revision, created_at_utc, admission_source, participant_slot_ids, coordinator_kind,
  definition_record_ref. definition_revision is exactly 1. occurred_at_utc equals created_at_utc; the identity
  subject is collaboration_id, definition_revision (SP-461). It carries no user or participant text. Nothing
  is admitted.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [CV-460, DL-090, CWR-106]
unblocks: []
acceptance_criteria:
  - "pm.collaboration_event.collaboration_created.v1 and pm.collaboration_event.collaboration_created.application.v1 are closed and differ only in CV-460's scope fields."
  - "Every required field of collaboration.created is present and every optional field is omitted rather than null."
  - "The payload rejects text-carrying fields and out-of-domain values for collaboration.created."
  - "The EventRecord's occurred_at_utc equals created_at_utc and its identity follows SP-461."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-231"
risk_class: collaborative_event_payload_contract_regression
reasoning_tier: high
context_scope: collaborative_event_payload_collaboration_created
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/collaboration_event_payloads.schema.json
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
  - "pm.collaboration_event.collaboration_created.v1"
  - "pm.collaboration_event.collaboration_created.application.v1"
  - "created_at_utc"
negative_constraints:
  - "Do not add a field to collaboration.created's payload outside this unit."
  - "Do not use null for an absent optional field."
  - "Do not admit the family."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-106, ContractName:Plans/Contracts_V0.md#CV-460, ContractName:Plans/storage-plan.md#SP-461

### CV-462 - The closed collaboration.started payload

`collaboration.started` has `$defs/collaboration_started` (`pm.collaboration_event.collaboration_started.v1`) and `$defs/collaboration_started_application` (`pm.collaboration_event.collaboration_started.application.v1`) in `Plans/collaboration_event_payloads.schema.json`. Both carry CV-460's common fields and these fields of its own, the same in both editions:

| Field | Required | Form | Meaning |
|---|---|---|---|
| `lifecycle_seq` | yes | exactly `1` | always 1 |
| `started_at_utc` | yes | UTC timestamp | when the run was admitted |
| `admission_source` | yes | CW section 12 `admission_source` | CWR-021 |
| `crew_auto_revision` | no | integer from 1 | present exactly when admission_source is crew_auto |
| `assistant_plan_id` | no | identifier | present with plan_version for a Plan-bound run; required for build_with_crew |
| `plan_version` | no | integer from 1 | present exactly when assistant_plan_id is present |
| `goal_id` | no | identifier | a Goal that drives the run by reference |
| `parent_run_id` | no | identifier | the parent run, when the run has one |
| `participant_slot_ids` | yes | unique identifiers, at least 1 | the frozen roster's slot IDs |
| `state_after` | yes | one of `running`, `waiting`, `blocked` | the run state right after admission |
| `requested_effective_snapshot_ref` | yes | `non_secret_ref` | the requested/effective snapshot of the frozen roster |
| `target_pack_ref` | no | `non_secret_ref` | Review only: the frozen ReviewTargetPack |
| `target_hashes` | no | SHA-256 hex list, at least 1 | Review only: the frozen pack's target_hashes, in pack order |
| `run_record_ref` | yes | `non_secret_ref` | the committed run record |

**Rules.** `lifecycle_seq` is exactly 1. `crew_auto_revision` is present exactly when `admission_source` is `crew_auto`; `plan_version` exactly when `assistant_plan_id` is; `build_with_crew` requires `assistant_plan_id` and kind `crew`; `target_pack_ref` and `target_hashes` are present exactly when the kind is `review`. The family timestamp is `started_at_utc`, which the EventRecord's `occurred_at_utc` equals. Its idempotency key and event ID follow SP-460 with the subject `collaboration_run_id, lifecycle_seq` (SP-462). The run's job text, topic and purpose are user text and stay in the definition and run records; the event carries identities, enums, refs and hashes only.

```yaml
plan_unit_id: CV-462
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-090. The closed payload of collaboration.started is
  pm.collaboration_event.collaboration_started.v1 for project scope and
  pm.collaboration_event.collaboration_started.application.v1 for application scope in
  Plans/collaboration_event_payloads.schema.json, with CV-460's common fields and its own fields:
  lifecycle_seq, started_at_utc, admission_source, crew_auto_revision, assistant_plan_id, plan_version,
  goal_id, parent_run_id, participant_slot_ids, state_after, requested_effective_snapshot_ref,
  target_pack_ref, target_hashes, run_record_ref. lifecycle_seq is exactly 1. crew_auto_revision is present
  exactly when admission_source is crew_auto; plan_version exactly when assistant_plan_id is; build_with_crew
  requires assistant_plan_id and kind crew; target_pack_ref and target_hashes are present exactly when the
  kind is review. occurred_at_utc equals started_at_utc; the identity subject is collaboration_run_id,
  lifecycle_seq (SP-462). It carries no user or participant text. Nothing is admitted.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [CV-460, DL-090, CWR-107]
unblocks: []
acceptance_criteria:
  - "pm.collaboration_event.collaboration_started.v1 and pm.collaboration_event.collaboration_started.application.v1 are closed and differ only in CV-460's scope fields."
  - "Every required field of collaboration.started is present and every optional field is omitted rather than null."
  - "The payload rejects text-carrying fields and out-of-domain values for collaboration.started."
  - "The EventRecord's occurred_at_utc equals started_at_utc and its identity follows SP-462."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-232"
risk_class: collaborative_event_payload_contract_regression
reasoning_tier: high
context_scope: collaborative_event_payload_collaboration_started
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/collaboration_event_payloads.schema.json
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
  - "pm.collaboration_event.collaboration_started.v1"
  - "pm.collaboration_event.collaboration_started.application.v1"
  - "started_at_utc"
negative_constraints:
  - "Do not add a field to collaboration.started's payload outside this unit."
  - "Do not use null for an absent optional field."
  - "Do not admit the family."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-107, ContractName:Plans/Contracts_V0.md#CV-460, ContractName:Plans/storage-plan.md#SP-462

### CV-463 - The closed collaboration.paused payload

`collaboration.paused` has `$defs/collaboration_paused` (`pm.collaboration_event.collaboration_paused.v1`) and `$defs/collaboration_paused_application` (`pm.collaboration_event.collaboration_paused.application.v1`) in `Plans/collaboration_event_payloads.schema.json`. Both carry CV-460's common fields and these fields of its own, the same in both editions:

| Field | Required | Form | Meaning |
|---|---|---|---|
| `lifecycle_seq` | yes | integer from 2 | one more than the run's previous lifecycle event |
| `paused_at_utc` | yes | UTC timestamp | when the safe boundary was reached |
| `state_before` | yes | one of `running`, `waiting`, `blocked` | the owner-reported state the pause left |
| `command_instance_ref` | yes | `non_secret_ref` | the cmd.collaboration.pause instance that asked for it |

**Rules.** `lifecycle_seq` is at least 2. The family timestamp is `paused_at_utc`, which the EventRecord's `occurred_at_utc` equals. Its idempotency key and event ID follow SP-460 with the subject `collaboration_run_id, lifecycle_seq` (SP-463). The event carries no message, inbox or composer text; what the pause preserves stays in its own records.

```yaml
plan_unit_id: CV-463
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-090. The closed payload of collaboration.paused is
  pm.collaboration_event.collaboration_paused.v1 for project scope and
  pm.collaboration_event.collaboration_paused.application.v1 for application scope in
  Plans/collaboration_event_payloads.schema.json, with CV-460's common fields and its own fields:
  lifecycle_seq, paused_at_utc, state_before, command_instance_ref. lifecycle_seq is at least 2.
  occurred_at_utc equals paused_at_utc; the identity subject is collaboration_run_id, lifecycle_seq (SP-463).
  It carries no user or participant text. Nothing is admitted.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [CV-460, DL-090, CWR-108]
unblocks: []
acceptance_criteria:
  - "pm.collaboration_event.collaboration_paused.v1 and pm.collaboration_event.collaboration_paused.application.v1 are closed and differ only in CV-460's scope fields."
  - "Every required field of collaboration.paused is present and every optional field is omitted rather than null."
  - "The payload rejects text-carrying fields and out-of-domain values for collaboration.paused."
  - "The EventRecord's occurred_at_utc equals paused_at_utc and its identity follows SP-463."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-233"
risk_class: collaborative_event_payload_contract_regression
reasoning_tier: high
context_scope: collaborative_event_payload_collaboration_paused
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/collaboration_event_payloads.schema.json
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
  - "pm.collaboration_event.collaboration_paused.v1"
  - "pm.collaboration_event.collaboration_paused.application.v1"
  - "paused_at_utc"
negative_constraints:
  - "Do not add a field to collaboration.paused's payload outside this unit."
  - "Do not use null for an absent optional field."
  - "Do not admit the family."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-108, ContractName:Plans/Contracts_V0.md#CV-460, ContractName:Plans/storage-plan.md#SP-463

### CV-464 - The closed collaboration.resumed payload

`collaboration.resumed` has `$defs/collaboration_resumed` (`pm.collaboration_event.collaboration_resumed.v1`) and `$defs/collaboration_resumed_application` (`pm.collaboration_event.collaboration_resumed.application.v1`) in `Plans/collaboration_event_payloads.schema.json`. Both carry CV-460's common fields and these fields of its own, the same in both editions:

| Field | Required | Form | Meaning |
|---|---|---|---|
| `lifecycle_seq` | yes | integer from 3 | one more than the run's previous lifecycle event |
| `resumed_at_utc` | yes | UTC timestamp | when the run left paused |
| `state_after` | yes | one of `running`, `waiting`, `blocked` | the owner-reported state after resuming |
| `command_instance_ref` | yes | `non_secret_ref` | the cmd.collaboration.resume instance |

**Rules.** `lifecycle_seq` is at least 3. The family timestamp is `resumed_at_utc`, which the EventRecord's `occurred_at_utc` equals. Its idempotency key and event ID follow SP-460 with the subject `collaboration_run_id, lifecycle_seq` (SP-464). Identities, enums and refs only.

```yaml
plan_unit_id: CV-464
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-090. The closed payload of collaboration.resumed is
  pm.collaboration_event.collaboration_resumed.v1 for project scope and
  pm.collaboration_event.collaboration_resumed.application.v1 for application scope in
  Plans/collaboration_event_payloads.schema.json, with CV-460's common fields and its own fields:
  lifecycle_seq, resumed_at_utc, state_after, command_instance_ref. lifecycle_seq is at least 3.
  occurred_at_utc equals resumed_at_utc; the identity subject is collaboration_run_id, lifecycle_seq (SP-464).
  It carries no user or participant text. Nothing is admitted.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [CV-460, DL-090, CWR-109]
unblocks: []
acceptance_criteria:
  - "pm.collaboration_event.collaboration_resumed.v1 and pm.collaboration_event.collaboration_resumed.application.v1 are closed and differ only in CV-460's scope fields."
  - "Every required field of collaboration.resumed is present and every optional field is omitted rather than null."
  - "The payload rejects text-carrying fields and out-of-domain values for collaboration.resumed."
  - "The EventRecord's occurred_at_utc equals resumed_at_utc and its identity follows SP-464."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-234"
risk_class: collaborative_event_payload_contract_regression
reasoning_tier: high
context_scope: collaborative_event_payload_collaboration_resumed
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/collaboration_event_payloads.schema.json
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
  - "pm.collaboration_event.collaboration_resumed.v1"
  - "pm.collaboration_event.collaboration_resumed.application.v1"
  - "resumed_at_utc"
negative_constraints:
  - "Do not add a field to collaboration.resumed's payload outside this unit."
  - "Do not use null for an absent optional field."
  - "Do not admit the family."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-109, ContractName:Plans/Contracts_V0.md#CV-460, ContractName:Plans/storage-plan.md#SP-464

### CV-465 - The closed collaboration.cancelled payload

`collaboration.cancelled` has `$defs/collaboration_cancelled` (`pm.collaboration_event.collaboration_cancelled.v1`) and `$defs/collaboration_cancelled_application` (`pm.collaboration_event.collaboration_cancelled.application.v1`) in `Plans/collaboration_event_payloads.schema.json`. Both carry CV-460's common fields and these fields of its own, the same in both editions:

| Field | Required | Form | Meaning |
|---|---|---|---|
| `lifecycle_seq` | yes | integer from 2 | one more than the run's previous lifecycle event |
| `cancelled_at_utc` | yes | UTC timestamp | when the run settled cancelled |
| `stop_reason` | yes | CW section 12 `stop_reason` | CWR-029 |
| `state_before` | yes | one of `running`, `paused`, `waiting`, `blocked` | the state the cancel ended |
| `command_instance_ref` | no | `non_secret_ref` | present exactly when stop_reason is user_cancel |
| `fenced_attempt_count` | yes | integer from 0 | how many open attempts the fence closed as canceled |
| `cancellation_receipt_ref` | yes | `non_secret_ref` | the cancellation receipt of section 2.6 |

**Rules.** `command_instance_ref` is present exactly when `stop_reason` is `user_cancel`. The family timestamp is `cancelled_at_utc`, which the EventRecord's `occurred_at_utc` equals. Its idempotency key and event ID follow SP-460 with the subject `collaboration_run_id, lifecycle_seq` (SP-465). Identities, enums, counts and refs only; the card, transcript, participants and artifacts are kept by their owners.

```yaml
plan_unit_id: CV-465
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-090. The closed payload of collaboration.cancelled is
  pm.collaboration_event.collaboration_cancelled.v1 for project scope and
  pm.collaboration_event.collaboration_cancelled.application.v1 for application scope in
  Plans/collaboration_event_payloads.schema.json, with CV-460's common fields and its own fields:
  lifecycle_seq, cancelled_at_utc, stop_reason, state_before, command_instance_ref, fenced_attempt_count,
  cancellation_receipt_ref. command_instance_ref is present exactly when stop_reason is user_cancel.
  occurred_at_utc equals cancelled_at_utc; the identity subject is collaboration_run_id, lifecycle_seq
  (SP-465). It carries no user or participant text. Nothing is admitted.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [CV-460, DL-090, CWR-110]
unblocks: []
acceptance_criteria:
  - "pm.collaboration_event.collaboration_cancelled.v1 and pm.collaboration_event.collaboration_cancelled.application.v1 are closed and differ only in CV-460's scope fields."
  - "Every required field of collaboration.cancelled is present and every optional field is omitted rather than null."
  - "The payload rejects text-carrying fields and out-of-domain values for collaboration.cancelled."
  - "The EventRecord's occurred_at_utc equals cancelled_at_utc and its identity follows SP-465."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-235"
risk_class: collaborative_event_payload_contract_regression
reasoning_tier: high
context_scope: collaborative_event_payload_collaboration_cancelled
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/collaboration_event_payloads.schema.json
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
  - "pm.collaboration_event.collaboration_cancelled.v1"
  - "pm.collaboration_event.collaboration_cancelled.application.v1"
  - "cancelled_at_utc"
negative_constraints:
  - "Do not add a field to collaboration.cancelled's payload outside this unit."
  - "Do not use null for an absent optional field."
  - "Do not admit the family."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-110, ContractName:Plans/Contracts_V0.md#CV-460, ContractName:Plans/storage-plan.md#SP-465

### CV-466 - The closed collaboration.completed payload

`collaboration.completed` has `$defs/collaboration_completed` (`pm.collaboration_event.collaboration_completed.v1`) and `$defs/collaboration_completed_application` (`pm.collaboration_event.collaboration_completed.application.v1`) in `Plans/collaboration_event_payloads.schema.json`. Both carry CV-460's common fields and these fields of its own, the same in both editions:

| Field | Required | Form | Meaning |
|---|---|---|---|
| `lifecycle_seq` | yes | integer from 2 | one more than the run's previous lifecycle event |
| `completed_at_utc` | yes | UTC timestamp | when the run settled completed |
| `completion_trigger` | yes | one of `predicate_met`, `chat_room_end` | chat_room_end only for a Chat Room |
| `state_before` | yes | one of `running`, `paused`, `waiting`, `blocked` | the state the completion ended |
| `required_slot_ids` | yes | unique identifiers, at least 0 | the run's required slots |
| `waived_slot_ids` | yes | unique identifiers, at least 0 | the required or optional slots whose outcome is explicitly_waived |
| `output_refs` | yes | unique `non_secret_ref`s, at least 0 | the run's final outputs: the Review artifact, the BrainStorm Plan, the Crew result or the room's summary |
| `command_instance_ref` | no | `non_secret_ref` | present exactly when completion_trigger is chat_room_end |

**Rules.** `completion_trigger` `chat_room_end` requires kind `chat_room` and `command_instance_ref`; `predicate_met` carries no command and a `state_before` of `running`, `waiting` or `blocked`. The family timestamp is `completed_at_utc`, which the EventRecord's `occurred_at_utc` equals. Its idempotency key and event ID follow SP-460 with the subject `collaboration_run_id, lifecycle_seq` (SP-466). Identities, enums and refs only; result text stays in its artifact or Plan.

```yaml
plan_unit_id: CV-466
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-090. The closed payload of collaboration.completed is
  pm.collaboration_event.collaboration_completed.v1 for project scope and
  pm.collaboration_event.collaboration_completed.application.v1 for application scope in
  Plans/collaboration_event_payloads.schema.json, with CV-460's common fields and its own fields:
  lifecycle_seq, completed_at_utc, completion_trigger, state_before, required_slot_ids, waived_slot_ids,
  output_refs, command_instance_ref. completion_trigger chat_room_end requires kind chat_room and
  command_instance_ref; predicate_met carries no command and a state_before of running, waiting or blocked.
  occurred_at_utc equals completed_at_utc; the identity subject is collaboration_run_id, lifecycle_seq
  (SP-466). It carries no user or participant text. Nothing is admitted.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [CV-460, DL-090, CWR-111]
unblocks: []
acceptance_criteria:
  - "pm.collaboration_event.collaboration_completed.v1 and pm.collaboration_event.collaboration_completed.application.v1 are closed and differ only in CV-460's scope fields."
  - "Every required field of collaboration.completed is present and every optional field is omitted rather than null."
  - "The payload rejects text-carrying fields and out-of-domain values for collaboration.completed."
  - "The EventRecord's occurred_at_utc equals completed_at_utc and its identity follows SP-466."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-236"
risk_class: collaborative_event_payload_contract_regression
reasoning_tier: high
context_scope: collaborative_event_payload_collaboration_completed
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/collaboration_event_payloads.schema.json
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
  - "pm.collaboration_event.collaboration_completed.v1"
  - "pm.collaboration_event.collaboration_completed.application.v1"
  - "completed_at_utc"
negative_constraints:
  - "Do not add a field to collaboration.completed's payload outside this unit."
  - "Do not use null for an absent optional field."
  - "Do not admit the family."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-111, ContractName:Plans/Contracts_V0.md#CV-460, ContractName:Plans/storage-plan.md#SP-466

The required-slot set is retained from the definition/source snapshot committed by created/configuration_changed and frozen at Start; completion's exact set must match (`required_slot_set_mismatch`), and `waived_slot_ids` must equal actual current dispositions (`waived_slot_set_mismatch`). A shortened list never bypasses a failed required slot. Ordinary kind-specific outputs still apply; CWR-031's explicit Chat Room End settles without an invented waiver interaction.

### CV-467 - The closed collaboration.failed payload

`collaboration.failed` has `$defs/collaboration_failed` (`pm.collaboration_event.collaboration_failed.v1`) and `$defs/collaboration_failed_application` (`pm.collaboration_event.collaboration_failed.application.v1`) in `Plans/collaboration_event_payloads.schema.json`. Both carry CV-460's common fields and these fields of its own, the same in both editions:

| Field | Required | Form | Meaning |
|---|---|---|---|
| `lifecycle_seq` | yes | integer from 2 | one more than the run's previous lifecycle event |
| `failed_at_utc` | yes | UTC timestamp | when the run settled failed |
| `failure_reason` | yes | the section 11 typed error codes except `cancelled` | the section 11 typed error that ended the run; never cancelled |
| `state_before` | yes | one of `running`, `paused`, `waiting`, `blocked` | the state the failure ended |
| `failure_record_ref` | no | `non_secret_ref` | the run's failure record, when its owner keeps one |

**Rules.** `failure_reason` is never `cancelled`, and free text is refused. The family timestamp is `failed_at_utc`, which the EventRecord's `occurred_at_utc` equals. Its idempotency key and event ID follow SP-460 with the subject `collaboration_run_id, lifecycle_seq` (SP-467). The reason is a closed code; no provider error text, prompt or output is carried. Any failure sentence is presentation of the code.

```yaml
plan_unit_id: CV-467
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-091. The closed payload of collaboration.failed is
  pm.collaboration_event.collaboration_failed.v1 for project scope and
  pm.collaboration_event.collaboration_failed.application.v1 for application scope in
  Plans/collaboration_event_payloads.schema.json, with CV-460's common fields and its own fields:
  lifecycle_seq, failed_at_utc, failure_reason, state_before, failure_record_ref. failure_reason is never
  cancelled, and free text is refused. occurred_at_utc equals failed_at_utc; the identity subject is
  collaboration_run_id, lifecycle_seq (SP-467). It carries no user or participant text. Nothing is admitted.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [CV-460, DL-091, CWR-112]
unblocks: []
acceptance_criteria:
  - "pm.collaboration_event.collaboration_failed.v1 and pm.collaboration_event.collaboration_failed.application.v1 are closed and differ only in CV-460's scope fields."
  - "Every required field of collaboration.failed is present and every optional field is omitted rather than null."
  - "The payload rejects text-carrying fields and out-of-domain values for collaboration.failed."
  - "The EventRecord's occurred_at_utc equals failed_at_utc and its identity follows SP-467."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-237"
risk_class: collaborative_event_payload_contract_regression
reasoning_tier: high
context_scope: collaborative_event_payload_collaboration_failed
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/collaboration_event_payloads.schema.json
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
  - "pm.collaboration_event.collaboration_failed.v1"
  - "pm.collaboration_event.collaboration_failed.application.v1"
  - "failed_at_utc"
negative_constraints:
  - "Do not add a field to collaboration.failed's payload outside this unit."
  - "Do not use null for an absent optional field."
  - "Do not admit the family."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-112, ContractName:Plans/Contracts_V0.md#CV-460, ContractName:Plans/storage-plan.md#SP-467

### CV-468 - The closed collaboration.participant_started payload

`collaboration.participant_started` has `$defs/collaboration_participant_started` (`pm.collaboration_event.collaboration_participant_started.v1`) and `$defs/collaboration_participant_started_application` (`pm.collaboration_event.collaboration_participant_started.application.v1`) in `Plans/collaboration_event_payloads.schema.json`. Both carry CV-460's common fields and these fields of its own, the same in both editions:

| Field | Required | Form | Meaning |
|---|---|---|---|
| `started_at_utc` | yes | UTC timestamp | when the attempt was admitted |
| `participant_slot_id` | yes | identifier | the roster slot |
| `assignment_revision` | yes | integer from 1 | PART-001..006: replacement creates a new assignment revision |
| `attempt_id` | yes | identifier | a new attempt identity |
| `additive_role_kind` | yes | CW section 12 `additive_role_kind` | none or wonderer |
| `required` | yes | boolean | the slot's definition property (PART-001..006) |
| `requested_identity_ref` | yes | `non_secret_ref` | the slot's requested provider/account/model/Persona |
| `effective_identity_ref` | yes | `non_secret_ref` | the effective assignment |
| `retry_of_attempt_id` | no | identifier | the earlier attempt this retry follows |
| `child_run_id` | no | identifier | the child run that realizes the attempt, when there is one |

**Rules.** `attempt_id` is required, and `additive_role_kind` is `none` or `wonderer`; Grill Me is never a role. The family timestamp is `started_at_utc`, which the EventRecord's `occurred_at_utc` equals. Its idempotency key and event ID follow SP-460 with the subject `collaboration_run_id, participant_slot_id, assignment_revision, attempt_id` (SP-468). Identities and refs only; the attempt's prompt, context slice and private working slice are never carried.

```yaml
plan_unit_id: CV-468
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-090. The closed payload of collaboration.participant_started is
  pm.collaboration_event.collaboration_participant_started.v1 for project scope and
  pm.collaboration_event.collaboration_participant_started.application.v1 for application scope in
  Plans/collaboration_event_payloads.schema.json, with CV-460's common fields and its own fields:
  started_at_utc, participant_slot_id, assignment_revision, attempt_id, additive_role_kind, required,
  requested_identity_ref, effective_identity_ref, retry_of_attempt_id, child_run_id. attempt_id is required,
  and additive_role_kind is none or wonderer; Grill Me is never a role. occurred_at_utc equals started_at_utc;
  the identity subject is collaboration_run_id, participant_slot_id, assignment_revision, attempt_id (SP-468).
  It carries no user or participant text. Nothing is admitted.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [CV-460, DL-090, CWR-113]
unblocks: []
acceptance_criteria:
  - "pm.collaboration_event.collaboration_participant_started.v1 and pm.collaboration_event.collaboration_participant_started.application.v1 are closed and differ only in CV-460's scope fields."
  - "Every required field of collaboration.participant_started is present and every optional field is omitted rather than null."
  - "The payload rejects text-carrying fields and out-of-domain values for collaboration.participant_started."
  - "The EventRecord's occurred_at_utc equals started_at_utc and its identity follows SP-468."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-238"
risk_class: collaborative_event_payload_contract_regression
reasoning_tier: high
context_scope: collaborative_event_payload_collaboration_participant_started
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/collaboration_event_payloads.schema.json
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
  - "pm.collaboration_event.collaboration_participant_started.v1"
  - "pm.collaboration_event.collaboration_participant_started.application.v1"
  - "started_at_utc"
negative_constraints:
  - "Do not add a field to collaboration.participant_started's payload outside this unit."
  - "Do not use null for an absent optional field."
  - "Do not admit the family."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-113, ContractName:Plans/Contracts_V0.md#CV-460, ContractName:Plans/storage-plan.md#SP-468

### CV-469 - The closed collaboration.participant_completed payload

`collaboration.participant_completed` has `$defs/collaboration_participant_completed` (`pm.collaboration_event.collaboration_participant_completed.v1`) and `$defs/collaboration_participant_completed_application` (`pm.collaboration_event.collaboration_participant_completed.application.v1`) in `Plans/collaboration_event_payloads.schema.json`. Both carry CV-460's common fields and these fields of its own, the same in both editions:

| Field | Required | Form | Meaning |
|---|---|---|---|
| `finished_at_utc` | yes | UTC timestamp | when the outcome was settled |
| `participant_slot_id` | yes | identifier | the roster slot |
| `assignment_revision` | yes | integer from 1 | the assignment revision the outcome closes |
| `attempt_id` | no | identifier | absent exactly for unavailable and for a waiver of a slot with no attempt |
| `outcome` | yes | CW section 12 `participant_outcome` | PART-001..006 |
| `required` | yes | boolean | the slot's definition property |
| `outcome_reason` | no | the section 11 typed error codes except `cancelled` | required for failed, timed_out and unavailable: the owner's typed reason |
| `waiver_actor_ref` | no | `non_secret_ref` | present exactly when outcome is explicitly_waived |
| `waiver_currentness_hash` | no | SHA-256 hex | present exactly when outcome is explicitly_waived |
| `effective_identity_ref` | no | `non_secret_ref` | the effective assignment, when one ran |
| `disposition_record_ref` | yes | `non_secret_ref` | the committed participant disposition record |

**Rules.** `attempt_id` is absent for `unavailable` and present for `completed`, `failed`, `timed_out` and `canceled`; `outcome_reason` is present exactly for `failed`, `timed_out` and `unavailable`; `waiver_actor_ref` and `waiver_currentness_hash` are present exactly for `explicitly_waived`. The family timestamp is `finished_at_utc`, which the EventRecord's `occurred_at_utc` equals. Its idempotency key and event ID follow SP-460 with the subject `collaboration_run_id, participant_slot_id, assignment_revision, attempt_id` (SP-469). A waiver's reason is user text and stays in the disposition record; the event carries the waiver's actor and currentness only. No output, error text or transcript is carried.

```yaml
plan_unit_id: CV-469
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-090. The closed payload of collaboration.participant_completed is
  pm.collaboration_event.collaboration_participant_completed.v1 for project scope and
  pm.collaboration_event.collaboration_participant_completed.application.v1 for application scope in
  Plans/collaboration_event_payloads.schema.json, with CV-460's common fields and its own fields:
  finished_at_utc, participant_slot_id, assignment_revision, attempt_id, outcome, required, outcome_reason,
  waiver_actor_ref, waiver_currentness_hash, effective_identity_ref, disposition_record_ref. attempt_id is
  absent for unavailable and present for completed, failed, timed_out and canceled; outcome_reason is present
  exactly for failed, timed_out and unavailable; waiver_actor_ref and waiver_currentness_hash are present
  exactly for explicitly_waived. occurred_at_utc equals finished_at_utc; the identity subject is
  collaboration_run_id, participant_slot_id, assignment_revision, attempt_id (SP-469). It carries no user or
  participant text. Nothing is admitted.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [CV-460, DL-090, CWR-114]
unblocks: []
acceptance_criteria:
  - "pm.collaboration_event.collaboration_participant_completed.v1 and pm.collaboration_event.collaboration_participant_completed.application.v1 are closed and differ only in CV-460's scope fields."
  - "Every required field of collaboration.participant_completed is present and every optional field is omitted rather than null."
  - "The payload rejects text-carrying fields and out-of-domain values for collaboration.participant_completed."
  - "The EventRecord's occurred_at_utc equals finished_at_utc and its identity follows SP-469."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-239"
risk_class: collaborative_event_payload_contract_regression
reasoning_tier: high
context_scope: collaborative_event_payload_collaboration_participant_completed
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/collaboration_event_payloads.schema.json
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
  - "pm.collaboration_event.collaboration_participant_completed.v1"
  - "pm.collaboration_event.collaboration_participant_completed.application.v1"
  - "finished_at_utc"
negative_constraints:
  - "Do not add a field to collaboration.participant_completed's payload outside this unit."
  - "Do not use null for an absent optional field."
  - "Do not admit the family."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-114, ContractName:Plans/Contracts_V0.md#CV-460, ContractName:Plans/storage-plan.md#SP-469

### CV-470 - The closed collaboration.message_added payload

`collaboration.message_added` has `$defs/collaboration_message_added` (`pm.collaboration_event.collaboration_message_added.v1`) and `$defs/collaboration_message_added_application` (`pm.collaboration_event.collaboration_message_added.application.v1`) in `Plans/collaboration_event_payloads.schema.json`. Both carry CV-460's common fields and these fields of its own, the same in both editions:

| Field | Required | Form | Meaning |
|---|---|---|---|
| `written_at_utc` | yes | UTC timestamp | when the record was written |
| `collaboration_message_id` | yes | identifier | the allocated message ID |
| `sequence` | yes | integer from 1 | the run's monotonic sequence, assigned at the write |
| `sender_kind` | yes | CW section 12 `sender_kind` | section 2.3 |
| `sender_id` | yes | identifier | the slot ID, coordinator run ref, user actor ID or system component ID |
| `message_type` | yes | CW section 12 `message_type` | section 2.3 |
| `recipient_ids` | yes | unique identifiers, at least 0 | the addressed recipients; empty for the whole run |
| `reply_to` | no | identifier | the message this one replies to |
| `attempt_id` | no | identifier | the writer's attempt, for a participant or coordinator message |
| `body_ref` | yes | `non_secret_ref` | the message body, which stays in the record |
| `attachment_refs` | yes | unique `non_secret_ref`s, at least 0 | attachment references, never content |

**Rules.** `sequence` starts at 1; a `user` or `system` message carries no `attempt_id`. The family timestamp is `written_at_utc`, which the EventRecord's `occurred_at_utc` equals. Its idempotency key and event ID follow SP-460 with the subject `collaboration_run_id, collaboration_message_id` (SP-470). The message text is never in the event: it stays in the message record's body, which body_ref names. Readers apply the blind-phase rules of CWR-013 at read time, so the event's existence is never disclosed to a participant the protocol has not released it to.

```yaml
plan_unit_id: CV-470
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-090. The closed payload of collaboration.message_added is
  pm.collaboration_event.collaboration_message_added.v1 for project scope and
  pm.collaboration_event.collaboration_message_added.application.v1 for application scope in
  Plans/collaboration_event_payloads.schema.json, with CV-460's common fields and its own fields:
  written_at_utc, collaboration_message_id, sequence, sender_kind, sender_id, message_type, recipient_ids,
  reply_to, attempt_id, body_ref, attachment_refs. sequence starts at 1; a user or system message carries no
  attempt_id. occurred_at_utc equals written_at_utc; the identity subject is collaboration_run_id,
  collaboration_message_id (SP-470). It carries no user or participant text. Nothing is admitted.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [CV-460, DL-090, CWR-115]
unblocks: []
acceptance_criteria:
  - "pm.collaboration_event.collaboration_message_added.v1 and pm.collaboration_event.collaboration_message_added.application.v1 are closed and differ only in CV-460's scope fields."
  - "Every required field of collaboration.message_added is present and every optional field is omitted rather than null."
  - "The payload rejects text-carrying fields and out-of-domain values for collaboration.message_added."
  - "The EventRecord's occurred_at_utc equals written_at_utc and its identity follows SP-470."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-240"
risk_class: collaborative_event_payload_contract_regression
reasoning_tier: high
context_scope: collaborative_event_payload_collaboration_message_added
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/collaboration_event_payloads.schema.json
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
  - "pm.collaboration_event.collaboration_message_added.v1"
  - "pm.collaboration_event.collaboration_message_added.application.v1"
  - "written_at_utc"
negative_constraints:
  - "Do not add a field to collaboration.message_added's payload outside this unit."
  - "Do not use null for an absent optional field."
  - "Do not admit the family."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-115, ContractName:Plans/Contracts_V0.md#CV-460, ContractName:Plans/storage-plan.md#SP-470

### CV-471 - The closed collaboration.artifact_added payload

`collaboration.artifact_added` has `$defs/collaboration_artifact_added` (`pm.collaboration_event.collaboration_artifact_added.v1`) and `$defs/collaboration_artifact_added_application` (`pm.collaboration_event.collaboration_artifact_added.application.v1`) in `Plans/collaboration_event_payloads.schema.json`. Both carry CV-460's common fields and these fields of its own, the same in both editions:

| Field | Required | Form | Meaning |
|---|---|---|---|
| `added_at_utc` | yes | UTC timestamp | when the reference was committed |
| `artifact_ref` | yes | `non_secret_ref` | the artifact |
| `artifact_version_ref` | yes | `non_secret_ref` | the exact version |
| `added_by_kind` | yes | CW section 12 `sender_kind` | who produced it |
| `added_by_id` | yes | identifier | its slot, coordinator, user or system ID |
| `source_message_id` | no | identifier | the message that delivered or references it |

**Rules.** Both references are `non_secret_ref`s; neither holds a path. The family timestamp is `added_at_utc`, which the EventRecord's `occurred_at_utc` equals. Its idempotency key and event ID follow SP-460 with the subject `collaboration_run_id, artifact_version_ref` (SP-471). The artifact's bytes, versions and retention stay with the artifact owner; the event holds references only, so deleting the chat removes the event and never purges a shared artifact (section 2.4).

```yaml
plan_unit_id: CV-471
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-090. The closed payload of collaboration.artifact_added is
  pm.collaboration_event.collaboration_artifact_added.v1 for project scope and
  pm.collaboration_event.collaboration_artifact_added.application.v1 for application scope in
  Plans/collaboration_event_payloads.schema.json, with CV-460's common fields and its own fields:
  added_at_utc, artifact_ref, artifact_version_ref, added_by_kind, added_by_id, source_message_id. Both
  references are non_secret_refs; neither holds a path. occurred_at_utc equals added_at_utc; the identity
  subject is collaboration_run_id, artifact_version_ref (SP-471). It carries no user or participant text.
  Nothing is admitted.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [CV-460, DL-090, CWR-116]
unblocks: []
acceptance_criteria:
  - "pm.collaboration_event.collaboration_artifact_added.v1 and pm.collaboration_event.collaboration_artifact_added.application.v1 are closed and differ only in CV-460's scope fields."
  - "Every required field of collaboration.artifact_added is present and every optional field is omitted rather than null."
  - "The payload rejects text-carrying fields and out-of-domain values for collaboration.artifact_added."
  - "The EventRecord's occurred_at_utc equals added_at_utc and its identity follows SP-471."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-241"
risk_class: collaborative_event_payload_contract_regression
reasoning_tier: high
context_scope: collaborative_event_payload_collaboration_artifact_added
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/collaboration_event_payloads.schema.json
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
  - "pm.collaboration_event.collaboration_artifact_added.v1"
  - "pm.collaboration_event.collaboration_artifact_added.application.v1"
  - "added_at_utc"
negative_constraints:
  - "Do not add a field to collaboration.artifact_added's payload outside this unit."
  - "Do not use null for an absent optional field."
  - "Do not admit the family."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-116, ContractName:Plans/Contracts_V0.md#CV-460, ContractName:Plans/storage-plan.md#SP-471

### CV-472 - The closed collaboration.configuration_changed payload

`collaboration.configuration_changed` has `$defs/collaboration_configuration_changed` (`pm.collaboration_event.collaboration_configuration_changed.v1`) and `$defs/collaboration_configuration_changed_application` (`pm.collaboration_event.collaboration_configuration_changed.application.v1`) in `Plans/collaboration_event_payloads.schema.json`. Both carry CV-460's common fields and these fields of its own, the same in both editions:

| Field | Required | Form | Meaning |
|---|---|---|---|
| `definition_revision` | yes | integer from 2 | the new revision |
| `previous_definition_revision` | yes | integer from 1 | exactly one less |
| `changed_at_utc` | yes | UTC timestamp | when the revision was committed |
| `change_source` | yes | one of `reconfigure`, `start_commit` | a mid-run reconfigure or a Start that bumps the revision |
| `change_kinds` | yes | `reconfigure_change_kind` list | reconfigure: the change_kind of each change, in request order (CWR-031); start_commit: empty |
| `affected_slot_ids` | yes | unique identifiers, at least 0 | the slots a change names |
| `accept_stale_target` | yes | boolean | reconfigure only: finish_stale on a Review (CWR-031); false for start_commit |
| `command_instance_ref` | yes | `non_secret_ref` | the reconfigure or Start command instance |
| `system_message_id` | no | identifier | reconfigure: the system transcript entry's message ID |

**Rules.** `definition_revision` is at least 2 and `previous_definition_revision` is one less. `start_commit` carries no change kinds, affected slots or system message and `accept_stale_target` false; `reconfigure` names its system message and at least one change kind unless `accept_stale_target` is true. The family timestamp is `changed_at_utc`, which the EventRecord's `occurred_at_utc` equals. Its idempotency key and event ID follow SP-460 with the subject `collaboration_id, definition_revision` (SP-472). A waiver's reason, a replacement's Persona text and any job text stay in the definition record; the event carries change kinds, slot IDs and refs only.

```yaml
plan_unit_id: CV-472
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-090. The closed payload of collaboration.configuration_changed is
  pm.collaboration_event.collaboration_configuration_changed.v1 for project scope and
  pm.collaboration_event.collaboration_configuration_changed.application.v1 for application scope in
  Plans/collaboration_event_payloads.schema.json, with CV-460's common fields and its own fields:
  definition_revision, previous_definition_revision, changed_at_utc, change_source, change_kinds,
  affected_slot_ids, accept_stale_target, command_instance_ref, system_message_id. definition_revision is at
  least 2 and previous_definition_revision is one less. start_commit carries no change kinds, affected slots
  or system message and accept_stale_target false; reconfigure names its system message and at least one
  change kind unless accept_stale_target is true. occurred_at_utc equals changed_at_utc; the identity subject
  is collaboration_id, definition_revision (SP-472). It carries no user or participant text. Nothing is
  admitted.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [CV-460, DL-090, CWR-117]
unblocks: []
acceptance_criteria:
  - "pm.collaboration_event.collaboration_configuration_changed.v1 and pm.collaboration_event.collaboration_configuration_changed.application.v1 are closed and differ only in CV-460's scope fields."
  - "Every required field of collaboration.configuration_changed is present and every optional field is omitted rather than null."
  - "The payload rejects text-carrying fields and out-of-domain values for collaboration.configuration_changed."
  - "The EventRecord's occurred_at_utc equals changed_at_utc and its identity follows SP-472."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-242"
risk_class: collaborative_event_payload_contract_regression
reasoning_tier: high
context_scope: collaborative_event_payload_collaboration_configuration_changed
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/collaboration_event_payloads.schema.json
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
  - "pm.collaboration_event.collaboration_configuration_changed.v1"
  - "pm.collaboration_event.collaboration_configuration_changed.application.v1"
  - "changed_at_utc"
negative_constraints:
  - "Do not add a field to collaboration.configuration_changed's payload outside this unit."
  - "Do not use null for an absent optional field."
  - "Do not admit the family."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-117, ContractName:Plans/Contracts_V0.md#CV-460, ContractName:Plans/storage-plan.md#SP-472

### CV-473 - The closed brainstorm.proposal_added payload

`brainstorm.proposal_added` has `$defs/brainstorm_proposal_added` (`pm.collaboration_event.brainstorm_proposal_added.v1`) and `$defs/brainstorm_proposal_added_application` (`pm.collaboration_event.brainstorm_proposal_added.application.v1`) in `Plans/collaboration_event_payloads.schema.json`. Both carry CV-460's common fields and these fields of its own, the same in both editions:

| Field | Required | Form | Meaning |
|---|---|---|---|
| `added_at_utc` | yes | UTC timestamp | when the normalized record was committed |
| `proposal_id` | yes | identifier | the proposal |
| `participant_slot_id` | yes | identifier | the core proposer |
| `attempt_id` | yes | identifier | the proposer's attempt |
| `proposal_round` | yes | integer from 1 | section 12 |
| `blind_round` | yes | boolean | true for a blind-phase proposal |
| `proposal_record_ref` | yes | `non_secret_ref` | the normalized proposal record |

**Rules.** `kind` is `brainstorm`; `proposal_round` starts at 1. The family timestamp is `added_at_utc`, which the EventRecord's `occurred_at_utc` equals. Its idempotency key and event ID follow SP-460 with the subject `collaboration_run_id, proposal_id` (SP-473). Text protection (DL-090). The event carries no proposal text: no approach, assumptions, benefits, costs, risks, migrations, cross-system effects, validation, rollback or evidence. That text stays in the proposal record, which proposal_record_ref names. Deleting the chat deletes the event under the chat-lifetime policy; the record's text follows the chat lifetime, holds and deadlines under E-CARDS-1 1c A, which DL-092 does not set, and the event neither holds nor extends it. Readers disclose a proposal row only after the protocol releases it (CWR-013).

```yaml
plan_unit_id: CV-473
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-090. The closed payload of brainstorm.proposal_added is
  pm.collaboration_event.brainstorm_proposal_added.v1 for project scope and
  pm.collaboration_event.brainstorm_proposal_added.application.v1 for application scope in
  Plans/collaboration_event_payloads.schema.json, with CV-460's common fields and its own fields:
  added_at_utc, proposal_id, participant_slot_id, attempt_id, proposal_round, blind_round,
  proposal_record_ref. kind is brainstorm; proposal_round starts at 1. occurred_at_utc equals added_at_utc;
  the identity subject is collaboration_run_id, proposal_id (SP-473). It carries no user or participant text.
  Nothing is admitted.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [CV-460, DL-090, CWR-118]
unblocks: []
acceptance_criteria:
  - "pm.collaboration_event.brainstorm_proposal_added.v1 and pm.collaboration_event.brainstorm_proposal_added.application.v1 are closed and differ only in CV-460's scope fields."
  - "Every required field of brainstorm.proposal_added is present and every optional field is omitted rather than null."
  - "The payload rejects text-carrying fields and out-of-domain values for brainstorm.proposal_added."
  - "The EventRecord's occurred_at_utc equals added_at_utc and its identity follows SP-473."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-243"
risk_class: collaborative_event_payload_contract_regression
reasoning_tier: high
context_scope: collaborative_event_payload_brainstorm_proposal_added
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/collaboration_event_payloads.schema.json
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
  - "pm.collaboration_event.brainstorm_proposal_added.v1"
  - "pm.collaboration_event.brainstorm_proposal_added.application.v1"
  - "added_at_utc"
negative_constraints:
  - "Do not add a field to brainstorm.proposal_added's payload outside this unit."
  - "Do not use null for an absent optional field."
  - "Do not admit the family."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-118, ContractName:Plans/Contracts_V0.md#CV-460, ContractName:Plans/storage-plan.md#SP-473

### CV-474 - The closed brainstorm.vote_added payload

`brainstorm.vote_added` has `$defs/brainstorm_vote_added` (`pm.collaboration_event.brainstorm_vote_added.v1`) and `$defs/brainstorm_vote_added_application` (`pm.collaboration_event.brainstorm_vote_added.application.v1`) in `Plans/collaboration_event_payloads.schema.json`. Both carry CV-460's common fields and these fields of its own, the same in both editions:

| Field | Required | Form | Meaning |
|---|---|---|---|
| `cast_at_utc` | yes | UTC timestamp | when the vote record was committed |
| `vote_id` | yes | identifier | the vote |
| `proposal_id` | yes | identifier | the proposal voted on |
| `participant_slot_id` | yes | identifier | the voter |
| `attempt_id` | yes | identifier | the voter's current attempt |
| `position` | yes | CW section 12 `vote_position` | support, oppose or abstain |
| `confidence` | yes | number from 0 to 1 | 0 to 1 |
| `hard_constraint_conflict_ids` | yes | unique identifiers, at least 0 | hard_constraints[] ids (CWR-027) |
| `vote_record_ref` | yes | `non_secret_ref` | the vote record |

**Rules.** `kind` is `brainstorm`; `confidence` is 0 to 1. The family timestamp is `cast_at_utc`, which the EventRecord's `occurred_at_utc` equals. Its idempotency key and event ID follow SP-460 with the subject `collaboration_run_id, vote_id` (SP-474). The vote's reason and evidence are text and stay in the vote record; the event carries the position, confidence and constraint IDs only.

```yaml
plan_unit_id: CV-474
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-090. The closed payload of brainstorm.vote_added is
  pm.collaboration_event.brainstorm_vote_added.v1 for project scope and
  pm.collaboration_event.brainstorm_vote_added.application.v1 for application scope in
  Plans/collaboration_event_payloads.schema.json, with CV-460's common fields and its own fields: cast_at_utc,
  vote_id, proposal_id, participant_slot_id, attempt_id, position, confidence, hard_constraint_conflict_ids,
  vote_record_ref. kind is brainstorm; confidence is 0 to 1. occurred_at_utc equals cast_at_utc; the identity
  subject is collaboration_run_id, vote_id (SP-474). It carries no user or participant text. Nothing is
  admitted.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [CV-460, DL-090, CWR-119]
unblocks: []
acceptance_criteria:
  - "pm.collaboration_event.brainstorm_vote_added.v1 and pm.collaboration_event.brainstorm_vote_added.application.v1 are closed and differ only in CV-460's scope fields."
  - "Every required field of brainstorm.vote_added is present and every optional field is omitted rather than null."
  - "The payload rejects text-carrying fields and out-of-domain values for brainstorm.vote_added."
  - "The EventRecord's occurred_at_utc equals cast_at_utc and its identity follows SP-474."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-244"
risk_class: collaborative_event_payload_contract_regression
reasoning_tier: high
context_scope: collaborative_event_payload_brainstorm_vote_added
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/collaboration_event_payloads.schema.json
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
  - "pm.collaboration_event.brainstorm_vote_added.v1"
  - "pm.collaboration_event.brainstorm_vote_added.application.v1"
  - "cast_at_utc"
negative_constraints:
  - "Do not add a field to brainstorm.vote_added's payload outside this unit."
  - "Do not use null for an absent optional field."
  - "Do not admit the family."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-119, ContractName:Plans/Contracts_V0.md#CV-460, ContractName:Plans/storage-plan.md#SP-474

### CV-475 - The closed brainstorm.plan_synthesized payload

`brainstorm.plan_synthesized` has `$defs/brainstorm_plan_synthesized` (`pm.collaboration_event.brainstorm_plan_synthesized.v1`) and `$defs/brainstorm_plan_synthesized_application` (`pm.collaboration_event.brainstorm_plan_synthesized.application.v1`) in `Plans/collaboration_event_payloads.schema.json`. Both carry CV-460's common fields and these fields of its own, the same in both editions:

| Field | Required | Form | Meaning |
|---|---|---|---|
| `synthesized_at_utc` | yes | UTC timestamp | when the binding was committed |
| `assistant_plan_id` | yes | identifier | the Plan owner's identity |
| `plan_version` | yes | integer from 1 | the created version |
| `plan_hash` | yes | identifier | the Plan owner's version hash |
| `plan_create_receipt_ref` | yes | `non_secret_ref` | the Plan owner's create receipt |
| `tie_resolution` | no | one of `coordinator` | present when a tied vote was resolved by the coordinator |
| `dissent_count` | yes | integer from 0 | dissent entries preserved in the synthesis |
| `rejected_alternative_count` | yes | integer from 0 | rejected or disqualified alternatives listed |
| `lead_count` | yes | integer from 0 | Wonderer leads listed with their dispositions |

**Rules.** `kind` is `brainstorm`; `tie_resolution`, when present, is `coordinator`. The family timestamp is `synthesized_at_utc`, which the EventRecord's `occurred_at_utc` equals. Its idempotency key and event ID follow SP-460 with the subject `collaboration_run_id` (SP-475). The Plan's text belongs to the Plan owner; dissent and alternatives are counted, never quoted.

```yaml
plan_unit_id: CV-475
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-090. The closed payload of brainstorm.plan_synthesized is
  pm.collaboration_event.brainstorm_plan_synthesized.v1 for project scope and
  pm.collaboration_event.brainstorm_plan_synthesized.application.v1 for application scope in
  Plans/collaboration_event_payloads.schema.json, with CV-460's common fields and its own fields:
  synthesized_at_utc, assistant_plan_id, plan_version, plan_hash, plan_create_receipt_ref, tie_resolution,
  dissent_count, rejected_alternative_count, lead_count. kind is brainstorm; tie_resolution, when present, is
  coordinator. occurred_at_utc equals synthesized_at_utc; the identity subject is collaboration_run_id
  (SP-475). It carries no user or participant text. Nothing is admitted.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [CV-460, DL-090, CWR-120]
unblocks: []
acceptance_criteria:
  - "pm.collaboration_event.brainstorm_plan_synthesized.v1 and pm.collaboration_event.brainstorm_plan_synthesized.application.v1 are closed and differ only in CV-460's scope fields."
  - "Every required field of brainstorm.plan_synthesized is present and every optional field is omitted rather than null."
  - "The payload rejects text-carrying fields and out-of-domain values for brainstorm.plan_synthesized."
  - "The EventRecord's occurred_at_utc equals synthesized_at_utc and its identity follows SP-475."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-245"
risk_class: collaborative_event_payload_contract_regression
reasoning_tier: high
context_scope: collaborative_event_payload_brainstorm_plan_synthesized
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/collaboration_event_payloads.schema.json
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
  - "pm.collaboration_event.brainstorm_plan_synthesized.v1"
  - "pm.collaboration_event.brainstorm_plan_synthesized.application.v1"
  - "synthesized_at_utc"
negative_constraints:
  - "Do not add a field to brainstorm.plan_synthesized's payload outside this unit."
  - "Do not use null for an absent optional field."
  - "Do not admit the family."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-120, ContractName:Plans/Contracts_V0.md#CV-460, ContractName:Plans/storage-plan.md#SP-475

### CV-476 - The closed review.finding_added payload

`review.finding_added` has `$defs/review_finding_added` (`pm.collaboration_event.review_finding_added.v1`) and `$defs/review_finding_added_application` (`pm.collaboration_event.review_finding_added.application.v1`) in `Plans/collaboration_event_payloads.schema.json`. Both carry CV-460's common fields and these fields of its own, the same in both editions:

| Field | Required | Form | Meaning |
|---|---|---|---|
| `added_at_utc` | yes | UTC timestamp | when the normalized record was committed |
| `finding_id` | yes | identifier | the finding |
| `finding_key` | yes | identifier | the normalization key |
| `severity` | yes | CW section 12 `review_severity` | section 7.5 |
| `originating_reviewer_ids` | yes | unique identifiers, at least 1 | every originating reviewer slot |
| `target_hashes` | yes | SHA-256 hex list, at least 1 | the run's frozen pack hashes |
| `finding_record_ref` | yes | `non_secret_ref` | the finding record |

**Rules.** `kind` is `review`; `originating_reviewer_ids` has at least one reviewer; `target_hashes` are lowercase hex. The family timestamp is `added_at_utc`, which the EventRecord's `occurred_at_utc` equals. Its idempotency key and event ID follow SP-460 with the subject `collaboration_run_id, finding_id` (SP-476). Text protection (DL-090). The event carries no finding text: no claim, category, evidence, dissent or proposed remediation. That text stays in the finding record, which finding_record_ref names. Deleting the chat deletes the event under the chat-lifetime policy; the record's text follows the chat lifetime, holds and deadlines under E-CARDS-1 1c A, which DL-092 does not set. Readers disclose a finding only after normalization releases it (CWR-013).

```yaml
plan_unit_id: CV-476
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-090. The closed payload of review.finding_added is
  pm.collaboration_event.review_finding_added.v1 for project scope and
  pm.collaboration_event.review_finding_added.application.v1 for application scope in
  Plans/collaboration_event_payloads.schema.json, with CV-460's common fields and its own fields:
  added_at_utc, finding_id, finding_key, severity, originating_reviewer_ids, target_hashes,
  finding_record_ref. kind is review; originating_reviewer_ids has at least one reviewer; target_hashes are
  lowercase hex. occurred_at_utc equals added_at_utc; the identity subject is collaboration_run_id, finding_id
  (SP-476). It carries no user or participant text. Nothing is admitted.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [CV-460, DL-090, CWR-121]
unblocks: []
acceptance_criteria:
  - "pm.collaboration_event.review_finding_added.v1 and pm.collaboration_event.review_finding_added.application.v1 are closed and differ only in CV-460's scope fields."
  - "Every required field of review.finding_added is present and every optional field is omitted rather than null."
  - "The payload rejects text-carrying fields and out-of-domain values for review.finding_added."
  - "The EventRecord's occurred_at_utc equals added_at_utc and its identity follows SP-476."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-246"
risk_class: collaborative_event_payload_contract_regression
reasoning_tier: high
context_scope: collaborative_event_payload_review_finding_added
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/collaboration_event_payloads.schema.json
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
  - "pm.collaboration_event.review_finding_added.v1"
  - "pm.collaboration_event.review_finding_added.application.v1"
  - "added_at_utc"
negative_constraints:
  - "Do not add a field to review.finding_added's payload outside this unit."
  - "Do not use null for an absent optional field."
  - "Do not admit the family."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-121, ContractName:Plans/Contracts_V0.md#CV-460, ContractName:Plans/storage-plan.md#SP-476

### CV-477 - The closed review.finding_dispositioned payload

`review.finding_dispositioned` has `$defs/review_finding_dispositioned` (`pm.collaboration_event.review_finding_dispositioned.v1`) and `$defs/review_finding_dispositioned_application` (`pm.collaboration_event.review_finding_dispositioned.application.v1`) in `Plans/collaboration_event_payloads.schema.json`. Both carry CV-460's common fields and these fields of its own, the same in both editions:

| Field | Required | Form | Meaning |
|---|---|---|---|
| `dispositioned_at_utc` | yes | UTC timestamp | when the final disposition was committed |
| `finding_id` | yes | identifier | the finding |
| `finding_key` | yes | identifier | its normalization key |
| `disposition` | yes | CW section 12 `review_disposition` | section 7.5 |
| `confidence` | yes | number from 0 to 1 | 0 to 1 |
| `counted_vote_count` | yes | integer from 0 | corroborating votes from current completed attempts on the same pack |
| `dissent_count` | yes | integer from 0 | preserved dissent entries |
| `target_hashes` | yes | SHA-256 hex list, at least 1 | the finding's frozen pack hashes |
| `adjudicator_ref` | yes | `non_secret_ref` | the coordinator or adjudicator |
| `finding_record_ref` | yes | `non_secret_ref` | the finding record |

**Rules.** `kind` is `review`; `confidence` is 0 to 1. The family timestamp is `dispositioned_at_utc`, which the EventRecord's `occurred_at_utc` equals. Its idempotency key and event ID follow SP-460 with the subject `collaboration_run_id, finding_id` (SP-477). Text protection (DL-090). Dissent and the adjudication's reasoning are text and stay in the finding record; the event carries counts, the closed disposition and refs only. Its deletion follows the chat, and the record's text follows the chat lifetime, holds and deadlines under E-CARDS-1 1c A.

```yaml
plan_unit_id: CV-477
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-090. The closed payload of review.finding_dispositioned is
  pm.collaboration_event.review_finding_dispositioned.v1 for project scope and
  pm.collaboration_event.review_finding_dispositioned.application.v1 for application scope in
  Plans/collaboration_event_payloads.schema.json, with CV-460's common fields and its own fields:
  dispositioned_at_utc, finding_id, finding_key, disposition, confidence, counted_vote_count, dissent_count,
  target_hashes, adjudicator_ref, finding_record_ref. kind is review; confidence is 0 to 1. occurred_at_utc
  equals dispositioned_at_utc; the identity subject is collaboration_run_id, finding_id (SP-477). It carries
  no user or participant text. Nothing is admitted.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [CV-460, DL-090, CWR-122]
unblocks: []
acceptance_criteria:
  - "pm.collaboration_event.review_finding_dispositioned.v1 and pm.collaboration_event.review_finding_dispositioned.application.v1 are closed and differ only in CV-460's scope fields."
  - "Every required field of review.finding_dispositioned is present and every optional field is omitted rather than null."
  - "The payload rejects text-carrying fields and out-of-domain values for review.finding_dispositioned."
  - "The EventRecord's occurred_at_utc equals dispositioned_at_utc and its identity follows SP-477."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-247"
risk_class: collaborative_event_payload_contract_regression
reasoning_tier: high
context_scope: collaborative_event_payload_review_finding_dispositioned
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/collaboration_event_payloads.schema.json
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
  - "pm.collaboration_event.review_finding_dispositioned.v1"
  - "pm.collaboration_event.review_finding_dispositioned.application.v1"
  - "dispositioned_at_utc"
negative_constraints:
  - "Do not add a field to review.finding_dispositioned's payload outside this unit."
  - "Do not use null for an absent optional field."
  - "Do not admit the family."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-122, ContractName:Plans/Contracts_V0.md#CV-460, ContractName:Plans/storage-plan.md#SP-477

### CV-478 - The closed review.artifact_finalized payload

`review.artifact_finalized` has `$defs/review_artifact_finalized` (`pm.collaboration_event.review_artifact_finalized.v1`) and `$defs/review_artifact_finalized_application` (`pm.collaboration_event.review_artifact_finalized.application.v1`) in `Plans/collaboration_event_payloads.schema.json`. Both carry CV-460's common fields and these fields of its own, the same in both editions:

| Field | Required | Form | Meaning |
|---|---|---|---|
| `finalized_at_utc` | yes | UTC timestamp | when the finalization was committed |
| `artifact_ref` | yes | `non_secret_ref` | the Review artifact |
| `artifact_version_ref` | yes | `non_secret_ref` | its finalized version |
| `target_pack_ref` | yes | `non_secret_ref` | the frozen ReviewTargetPack |
| `target_hashes` | yes | SHA-256 hex list, at least 1 | its target hashes |
| `requested_reviewer_count` | yes | integer from 1 | reviewers configured |
| `completed_reviewer_count` | yes | integer from 0 | reviewers whose pass completed |
| `failed_reviewer_count` | yes | integer from 0 | reviewers whose pass did not complete |
| `single_reviewer` | yes | boolean | true when one reviewer was configured: a single-pass result |
| `partial_coverage_accepted` | yes | boolean | true when fewer passes completed and the user accepted it |
| `stale_target_accepted` | yes | boolean | true when finished on a stale pack (finish_stale) |
| `confirmed_count` | yes | integer from 0 | findings disposed confirmed |
| `rejected_count` | yes | integer from 0 | findings disposed rejected |
| `duplicate_count` | yes | integer from 0 | findings disposed duplicate |
| `uncertain_count` | yes | integer from 0 | findings disposed uncertain |

**Rules.** `kind` is `review`; `single_reviewer` true requires `requested_reviewer_count` 1 and false requires at least 2; completed plus failed reviewers equal requested reviewers. The family timestamp is `finalized_at_utc`, which the EventRecord's `occurred_at_utc` equals. Its idempotency key and event ID follow SP-460 with the subject `collaboration_run_id` (SP-478). The artifact's text stays with the artifact owner; the event carries refs, hashes, counts and flags only.

```yaml
plan_unit_id: CV-478
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-090. The closed payload of review.artifact_finalized is
  pm.collaboration_event.review_artifact_finalized.v1 for project scope and
  pm.collaboration_event.review_artifact_finalized.application.v1 for application scope in
  Plans/collaboration_event_payloads.schema.json, with CV-460's common fields and its own fields:
  finalized_at_utc, artifact_ref, artifact_version_ref, target_pack_ref, target_hashes,
  requested_reviewer_count, completed_reviewer_count, failed_reviewer_count, single_reviewer,
  partial_coverage_accepted, stale_target_accepted, confirmed_count, rejected_count, duplicate_count,
  uncertain_count. kind is review; single_reviewer true requires requested_reviewer_count 1 and false requires
  at least 2; completed plus failed reviewers equal requested reviewers. occurred_at_utc equals
  finalized_at_utc; the identity subject is collaboration_run_id (SP-478). It carries no user or participant
  text. Nothing is admitted.
gui_related: false
gui_classification_reason: "Defines persisted event contracts, identity, custody and checks, not presentation."
split_recommended: false
depends_on: [CV-460, DL-090, CWR-123]
unblocks: []
acceptance_criteria:
  - "pm.collaboration_event.review_artifact_finalized.v1 and pm.collaboration_event.review_artifact_finalized.application.v1 are closed and differ only in CV-460's scope fields."
  - "Every required field of review.artifact_finalized is present and every optional field is omitted rather than null."
  - "The payload rejects text-carrying fields and out-of-domain values for review.artifact_finalized."
  - "The EventRecord's occurred_at_utc equals finalized_at_utc and its identity follows SP-478."
validation_surfaces:
  - "python3 scripts/pm_collaboration_events.py"
  - "Plans/collaboration_event_contract_fixtures.json"
  - "Plans/collaboration_event_payloads.schema.json"
  - "Plans/collaboration_projection_contracts.schema.json"
  - "Plans/collaboration_event_admission.json"
  - "reports/event-authority-20261104/DC-binding-search.md"
  - "python3 scripts/pm-plan-index.py validate"
  - "Plans/Automated_Testing_System.md#ATS-248"
risk_class: collaborative_event_payload_contract_regression
reasoning_tier: high
context_scope: collaborative_event_payload_review_artifact_finalized
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/collaboration_event_payloads.schema.json
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
  - "pm.collaboration_event.review_artifact_finalized.v1"
  - "pm.collaboration_event.review_artifact_finalized.application.v1"
  - "finalized_at_utc"
negative_constraints:
  - "Do not add a field to review.artifact_finalized's payload outside this unit."
  - "Do not use null for an absent optional field."
  - "Do not admit the family."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-123, ContractName:Plans/Contracts_V0.md#CV-460, ContractName:Plans/storage-plan.md#SP-478
