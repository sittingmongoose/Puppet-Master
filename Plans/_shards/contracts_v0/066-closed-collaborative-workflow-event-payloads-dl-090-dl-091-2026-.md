# Shard 066: Closed collaborative workflow event payloads (DL-090, DL-091, 2026-11-04)

Source: `Plans/Contracts_V0.md`

Source lines: L26217-L30722

Source SHA256: `a069e74278198a90aa725331e42a654856719cefb8e99a8d9d6bf083fbd83f96`

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



### CV-600 - approval.requested prepared event contract

```yaml
plan_unit_id: CV-600
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for approval.requested@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/human-in-the-loop.md (Contracts_V0.md:954-957 / CV-355; human-in-the-loop.md:50-110; CV-366). An actual current blocked episode creates one ordered action request; it is not a grant. Tool requests carry tool_use_id; other requests omit it. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/approval_requested with schema_id pm.event_payload.approval_requested.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For approval.requested, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, run_id, node_id, blocked_sequence, approval_scope_key], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-290. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For approval.requested alone, the full source/identity contract in SP-580 and Plans/dt_event_contracts.schema.json#/$defs/approval_requested_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The HITLBlockedEpisodeOwner.requested source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For approval.requested alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For approval.requested alone, the explicit lifecycle transition is blocked -> requested: request action set is captured; no grant or tool execution. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For approval.requested alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For approval.requested alone, the shared CV-1100, SP-1100, SP-1101 and CV-1101 owner units apply beside CV-317, CV-339, CV-366, SP-236, SP-286, SP-337 and this family's own text, and change no recipe ID, preimage, field or schema range. Every schema integer slot admits only an exact integer (never 1.0 or a boolean) within its own owner bounds; before any append or effect the current writer qualifies the complete CV-317 producer projection through the shared RFC 8785 route, so an exact integer that route cannot preserve (for example producer_sequence_id or a payload counter above 2^53) refuses, while the logical range and pm.dt.source.json.v1 bytes stay unchanged and integers of any length are read and written exactly. Storage sequence ids are exact uint64 (SP-1100); CV-366 application source files use pm.application.physical_messagepack.v1 and the SP-337 inline limit measures the body's SP-236 EventRecord value bytes. Every date-time field of this family's payload, sources and checkpoint, and EventRecord occurred_at_utc, uses the CV-1101 EventRecord profile (lowercase, offsets, real leap seconds and any fraction length remain valid and keep their exact spelling); the two Storage-assigned EventRecord times use CV-253's storage_utc_z profile; deadline and retention-age comparisons use exact instants with offsets and complete fractions. A retained original is read only after SP-1101 dispatch resolves its sealed custody and frozen recipe and resources for the binding the record claims; no request flag, caller original or current writer guard selects or narrows that recipe.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/approval_requested, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-601 - approval.granted prepared event contract

```yaml
plan_unit_id: CV-601
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for approval.granted@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/human-in-the-loop.md (Contracts_V0.md:954-957 / CV-355; human-in-the-loop.md:50-110; CV-366). Requires the exact unresolved requested episode and an authenticated human selecting a member of its ordered allowed_action_ids; PAUSE precedence and live revocation remain enforced. Grant resolves only this episode. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/approval_granted with schema_id pm.event_payload.approval_granted.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For approval.granted, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, run_id, node_id, blocked_sequence, approval_scope_key], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-290. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For approval.granted alone, the full source/identity contract in SP-581 and Plans/dt_event_contracts.schema.json#/$defs/approval_granted_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The HITLBlockedEpisodeOwner.granted source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For approval.granted alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For approval.granted alone, the explicit lifecycle transition is requested -> granted: exact human action, current unpaused/unrevoked request; resolves only this blocked episode. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For approval.granted alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For approval.granted alone, the shared CV-1100, SP-1100, SP-1101 and CV-1101 owner units apply beside CV-317, CV-339, CV-366, SP-236, SP-286, SP-337 and this family's own text, and change no recipe ID, preimage, field or schema range. Every schema integer slot admits only an exact integer (never 1.0 or a boolean) within its own owner bounds; before any append or effect the current writer qualifies the complete CV-317 producer projection through the shared RFC 8785 route, so an exact integer that route cannot preserve (for example producer_sequence_id or a payload counter above 2^53) refuses, while the logical range and pm.dt.source.json.v1 bytes stay unchanged and integers of any length are read and written exactly. Storage sequence ids are exact uint64 (SP-1100); CV-366 application source files use pm.application.physical_messagepack.v1 and the SP-337 inline limit measures the body's SP-236 EventRecord value bytes. Every date-time field of this family's payload, sources and checkpoint, and EventRecord occurred_at_utc, uses the CV-1101 EventRecord profile (lowercase, offsets, real leap seconds and any fraction length remain valid and keep their exact spelling); the two Storage-assigned EventRecord times use CV-253's storage_utc_z profile; deadline and retention-age comparisons use exact instants with offsets and complete fractions. A retained original is read only after SP-1101 dispatch resolves its sealed custody and frozen recipe and resources for the binding the record claims; no request flag, caller original or current writer guard selects or narrows that recipe.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/approval_granted, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-602 - approval.denied prepared event contract

```yaml
plan_unit_id: CV-602
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for approval.denied@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/human-in-the-loop.md (Contracts_V0.md:954-957 / CV-355; human-in-the-loop.md:50-110; CV-366). Requires the exact unresolved requested episode; terminal denial never unblocks or executes the tool. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/approval_denied with schema_id pm.event_payload.approval_denied.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For approval.denied, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, run_id, node_id, blocked_sequence, approval_scope_key], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-291. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For approval.denied alone, the full source/identity contract in SP-582 and Plans/dt_event_contracts.schema.json#/$defs/approval_denied_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The HITLBlockedEpisodeOwner.denied source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For approval.denied alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For approval.denied alone, the explicit lifecycle transition is requested -> denied: exact unresolved request; no unblock or execution. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For approval.denied alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For approval.denied alone, the shared CV-1100, SP-1100, SP-1101 and CV-1101 owner units apply beside CV-317, CV-339, CV-366, SP-236, SP-286, SP-337 and this family's own text, and change no recipe ID, preimage, field or schema range. Every schema integer slot admits only an exact integer (never 1.0 or a boolean) within its own owner bounds; before any append or effect the current writer qualifies the complete CV-317 producer projection through the shared RFC 8785 route, so an exact integer that route cannot preserve (for example producer_sequence_id or a payload counter above 2^53) refuses, while the logical range and pm.dt.source.json.v1 bytes stay unchanged and integers of any length are read and written exactly. Storage sequence ids are exact uint64 (SP-1100); CV-366 application source files use pm.application.physical_messagepack.v1 and the SP-337 inline limit measures the body's SP-236 EventRecord value bytes. Every date-time field of this family's payload, sources and checkpoint, and EventRecord occurred_at_utc, uses the CV-1101 EventRecord profile (lowercase, offsets, real leap seconds and any fraction length remain valid and keep their exact spelling); the two Storage-assigned EventRecord times use CV-253's storage_utc_z profile; deadline and retention-age comparisons use exact instants with offsets and complete fractions. A retained original is read only after SP-1101 dispatch resolves its sealed custody and frozen recipe and resources for the binding the record claims; no request flag, caller original or current writer guard selects or narrows that recipe.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/approval_denied, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-603 - approval.timeout prepared event contract

```yaml
plan_unit_id: CV-603
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for approval.timeout@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/human-in-the-loop.md (Contracts_V0.md:954-957 / CV-355; human-in-the-loop.md:50-110; CV-366). Requires the exact unresolved requested episode and the original owner timeout expiry evidence; terminal timeout never authorizes work. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/approval_timeout with schema_id pm.event_payload.approval_timeout.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For approval.timeout, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, run_id, node_id, blocked_sequence, approval_scope_key], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-291. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For approval.timeout alone, the full source/identity contract in SP-583 and Plans/dt_event_contracts.schema.json#/$defs/approval_timeout_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The HITLBlockedEpisodeOwner.timeout source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For approval.timeout alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For approval.timeout alone, the explicit lifecycle transition is requested -> timed_out: actual original deadline expired; no authorization. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For approval.timeout alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For approval.timeout alone, the shared CV-1100, SP-1100, SP-1101 and CV-1101 owner units apply beside CV-317, CV-339, CV-366, SP-236, SP-286, SP-337 and this family's own text, and change no recipe ID, preimage, field or schema range. Every schema integer slot admits only an exact integer (never 1.0 or a boolean) within its own owner bounds; before any append or effect the current writer qualifies the complete CV-317 producer projection through the shared RFC 8785 route, so an exact integer that route cannot preserve (for example producer_sequence_id or a payload counter above 2^53) refuses, while the logical range and pm.dt.source.json.v1 bytes stay unchanged and integers of any length are read and written exactly. Storage sequence ids are exact uint64 (SP-1100); CV-366 application source files use pm.application.physical_messagepack.v1 and the SP-337 inline limit measures the body's SP-236 EventRecord value bytes. Every date-time field of this family's payload, sources and checkpoint, and EventRecord occurred_at_utc, uses the CV-1101 EventRecord profile (lowercase, offsets, real leap seconds and any fraction length remain valid and keep their exact spelling); the two Storage-assigned EventRecord times use CV-253's storage_utc_z profile; deadline and retention-age comparisons use exact instants with offsets and complete fractions. A retained original is read only after SP-1101 dispatch resolves its sealed custody and frozen recipe and resources for the binding the record claims; no request flag, caller original or current writer guard selects or narrows that recipe.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/approval_timeout, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-604 - config.migrated prepared event contract

```yaml
plan_unit_id: CV-604
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for config.migrated@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/WorktreeGitImprovement.md (WorktreeGitImprovement.md:594-612). Only first-load single→None, per_phase→Phase and per_task→Task are accepted. Original immutable input hash and committed Settings result are retained. Replay never writes Settings again. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/config_migrated with schema_id pm.event_payload.config_migrated.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is application_or_project; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For config.migrated, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, source_ref, source_sha256], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-292. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For config.migrated alone, the full source/identity contract in SP-584 and Plans/dt_event_contracts.schema.json#/$defs/config_migrated_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The SettingsMigrationCoordinator.branch_granularity source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For config.migrated alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For config.migrated application writes only, CV-366's app identity and physical codec override the Project-only dt: recipe and source codec above. The distinct source sibling is Plans/dt_event_contracts.schema.json#/$defs/config_migrated_application_source at storage/event-sources/dt/config_migrated/application/{event_id}/{stage}.msgpack, physical family dt_config_migrated_application_source. It preserves the complete WorkflowScopeV2 with actual server_id and null Project/home/NamedPlan, plus the actual original_owner_operation_id; neither is supplied from UI focus. Allocate and retain owner_operation_id = lowercase SHA-256 of RFC 8785 string array [event_type, actual original_owner_operation_id, this family's original identity subjects as strings] before any effect. This explicit family operation component prevents two optional effects of one owner operation from sharing an event identity. The exact idempotency_key is CV-366 application@1:hex(UTF-8 actual server_id):hex(UTF-8 owner_operation_id); event_id remains evt_dt_ plus SHA-256 of UTF-8 that key. The completed original application source, WorkflowScopeV2, actual owner operation and full EventRecord scope/actor/account/attempt joins must all agree. Use CV-366 pm.application.physical_messagepack.v1 for these files: minimal integers, UTF-8 sorted closed maps, ordered arrays and exact finite binary64 fractions; source SHA-256 commits exact physical bytes and never substitutes for the application's separately owned semantic hash. Project source schema/codec remains exact and refuses application values. This auxiliary original-source custody does not enroll or replace CV-366's selected application_workflow_source_graph resource/method graph: the actual graph and role must be admitted and authenticate the source before any app append or read; unsupported roles are unavailable. Original Project resources, old bytes and shared full-value receipts are unchanged. Application source retention and coherent backup use this event's same explicit policy or unresolved marker; no app exception to a pending decision.
  For config.migrated alone, the explicit lifecycle transition is legacy_input -> migrated_settings: exact first-load enum mapping and original committed Settings result. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For config.migrated alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For config.migrated alone, retention_policy_ref = RP-OPERATIONAL-2555D. Case L-3 already decides migration/recovery operational history: 2,555 days, 2,000,000/Project, anchored to the original terminal migration transition. SP-349 already decides one app Server-wide counterpart bucket for config.migrated with the same 2,000,000 cap, TTL, holds and backup classification; it never resets per chat. This exact binding is technical work under current policy, not a new lifetime/app-counting question. All original holds/dependencies override expiry; retries do not reset the anchor.
  For config.migrated alone, the shared CV-1100, SP-1100, SP-1101 and CV-1101 owner units apply beside CV-317, CV-339, CV-366, SP-236, SP-286, SP-337 and this family's own text, and change no recipe ID, preimage, field or schema range. Every schema integer slot admits only an exact integer (never 1.0 or a boolean) within its own owner bounds; before any append or effect the current writer qualifies the complete CV-317 producer projection through the shared RFC 8785 route, so an exact integer that route cannot preserve (for example producer_sequence_id or a payload counter above 2^53) refuses, while the logical range and pm.dt.source.json.v1 bytes stay unchanged and integers of any length are read and written exactly. Storage sequence ids are exact uint64 (SP-1100); CV-366 application source files use pm.application.physical_messagepack.v1 and the SP-337 inline limit measures the body's SP-236 EventRecord value bytes. Every date-time field of this family's payload, sources and checkpoint, and EventRecord occurred_at_utc, uses the CV-1101 EventRecord profile (lowercase, offsets, real leap seconds and any fraction length remain valid and keep their exact spelling); the two Storage-assigned EventRecord times use CV-253's storage_utc_z profile; deadline and retention-age comparisons use exact instants with offsets and complete fractions. A retained original is read only after SP-1101 dispatch resolves its sealed custody and frozen recipe and resources for the binding the record claims; no request flag, caller original or current writer guard selects or narrows that recipe.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/config_migrated, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-605 - gate.evaluation_started prepared event contract

```yaml
plan_unit_id: CV-605
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for gate.evaluation_started@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/Progression_Gates.md (Contracts_V0.md:943-945; Progression_Gates.md GATE-012). A fresh evaluation_id is captured with the exact gate inputs before evaluation. Neither this event nor a previous pass permits progression. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/gate_evaluation_started with schema_id pm.event_payload.gate_evaluation_started.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For gate.evaluation_started, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, gate_id, run_id, evaluation_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-292. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For gate.evaluation_started alone, the full source/identity contract in SP-585 and Plans/dt_event_contracts.schema.json#/$defs/gate_evaluation_started_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The ProgressionGateRunner.evaluation_started source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For gate.evaluation_started alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For gate.evaluation_started alone, the explicit lifecycle transition is allocated -> evaluating: fresh actual evaluation identity and original inputs; no progression. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For gate.evaluation_started alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For gate.evaluation_started alone, the newly authored dispatch-context binding reuses Executor_Protocol section 3: dispatch_score_ref resolves the original scheduler.pass node entry for the same run/node/attempt, and dispatch_score_tuple preserves exactly scheduler_lane, manual_priority, transitive_unblock_count, ready_since_utc and node_id. Before preparation, the original gate owner authenticates that source and captures the exact ref/tuple and optional score_threshold in immutable before (null proves absence). completed.owner_result carries the actual numeric score or null; payload score equals that outcome, score_threshold equals before, and both tuple/ref equal before exactly. Exposing either scalar requires both dispatch fields and the matching node_id. The numeric gate result/threshold retain Progression_Gates semantics; this context is not a replacement scoring/ranking policy. Missing, changed, wrong-node or transplanted dispatch context refuses before append; unscored events retain null source context and omit score fields.
  For gate.evaluation_started alone, the shared CV-1100, SP-1100, SP-1101 and CV-1101 owner units apply beside CV-317, CV-339, CV-366, SP-236, SP-286, SP-337 and this family's own text, and change no recipe ID, preimage, field or schema range. Every schema integer slot admits only an exact integer (never 1.0 or a boolean) within its own owner bounds; before any append or effect the current writer qualifies the complete CV-317 producer projection through the shared RFC 8785 route, so an exact integer that route cannot preserve (for example producer_sequence_id or a payload counter above 2^53) refuses, while the logical range and pm.dt.source.json.v1 bytes stay unchanged and integers of any length are read and written exactly. Storage sequence ids are exact uint64 (SP-1100); CV-366 application source files use pm.application.physical_messagepack.v1 and the SP-337 inline limit measures the body's SP-236 EventRecord value bytes. Every date-time field of this family's payload, sources and checkpoint, and EventRecord occurred_at_utc, uses the CV-1101 EventRecord profile (lowercase, offsets, real leap seconds and any fraction length remain valid and keep their exact spelling); the two Storage-assigned EventRecord times use CV-253's storage_utc_z profile; deadline and retention-age comparisons use exact instants with offsets and complete fractions. A retained original is read only after SP-1101 dispatch resolves its sealed custody and frozen recipe and resources for the binding the record claims; no request flag, caller original or current writer guard selects or narrows that recipe.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/Progression_Gates.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/gate_evaluation_started, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-606 - gate.failed prepared event contract

```yaml
plan_unit_id: CV-606
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for gate.failed@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/Progression_Gates.md (Contracts_V0.md:943-945; Progression_Gates.md GATE-012). Exactly one failed result follows the matching evaluation_started with failure code and evidence. A blocked GATE-012 report with clarification items is BLOCKED, not falsely classified FAIL or PASS. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/gate_failed with schema_id pm.event_payload.gate_failed.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For gate.failed, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, gate_id, run_id, evaluation_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-293. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For gate.failed alone, the full source/identity contract in SP-586 and Plans/dt_event_contracts.schema.json#/$defs/gate_failed_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The ProgressionGateRunner.failed source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For gate.failed alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For gate.failed alone, the explicit lifecycle transition is evaluating -> failed: exact original FAIL report/evidence, no BLOCKED misclassification. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For gate.failed alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For gate.failed alone, the newly authored dispatch-context binding reuses Executor_Protocol section 3: dispatch_score_ref resolves the original scheduler.pass node entry for the same run/node/attempt, and dispatch_score_tuple preserves exactly scheduler_lane, manual_priority, transitive_unblock_count, ready_since_utc and node_id. Before preparation, the original gate owner authenticates that source and captures the exact ref/tuple and optional score_threshold in immutable before (null proves absence). completed.owner_result carries the actual numeric score or null; payload score equals that outcome, score_threshold equals before, and both tuple/ref equal before exactly. Exposing either scalar requires both dispatch fields and the matching node_id. The numeric gate result/threshold retain Progression_Gates semantics; this context is not a replacement scoring/ranking policy. Missing, changed, wrong-node or transplanted dispatch context refuses before append; unscored events retain null source context and omit score fields.
  For gate.failed alone, the shared CV-1100, SP-1100, SP-1101 and CV-1101 owner units apply beside CV-317, CV-339, CV-366, SP-236, SP-286, SP-337 and this family's own text, and change no recipe ID, preimage, field or schema range. Every schema integer slot admits only an exact integer (never 1.0 or a boolean) within its own owner bounds; before any append or effect the current writer qualifies the complete CV-317 producer projection through the shared RFC 8785 route, so an exact integer that route cannot preserve (for example producer_sequence_id or a payload counter above 2^53) refuses, while the logical range and pm.dt.source.json.v1 bytes stay unchanged and integers of any length are read and written exactly. Storage sequence ids are exact uint64 (SP-1100); CV-366 application source files use pm.application.physical_messagepack.v1 and the SP-337 inline limit measures the body's SP-236 EventRecord value bytes. Every date-time field of this family's payload, sources and checkpoint, and EventRecord occurred_at_utc, uses the CV-1101 EventRecord profile (lowercase, offsets, real leap seconds and any fraction length remain valid and keep their exact spelling); the two Storage-assigned EventRecord times use CV-253's storage_utc_z profile; deadline and retention-age comparisons use exact instants with offsets and complete fractions. A retained original is read only after SP-1101 dispatch resolves its sealed custody and frozen recipe and resources for the binding the record claims; no request flag, caller original or current writer guard selects or narrows that recipe.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/Progression_Gates.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/gate_failed, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-607 - gate.passed prepared event contract

```yaml
plan_unit_id: CV-607
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for gate.passed@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/Progression_Gates.md (Contracts_V0.md:943-945; Progression_Gates.md GATE-012). Exactly one result follows the matching evaluation_started; all gate-specific PASS predicates and evidence must hold. GATE-012 requires a valid PASS report with zero clarification items. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/gate_passed with schema_id pm.event_payload.gate_passed.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For gate.passed, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, gate_id, run_id, evaluation_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-293. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For gate.passed alone, the full source/identity contract in SP-587 and Plans/dt_event_contracts.schema.json#/$defs/gate_passed_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The ProgressionGateRunner.passed source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For gate.passed alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For gate.passed alone, the explicit lifecycle transition is evaluating -> passed: all original gate predicates PASS with complete evidence and no clarification. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For gate.passed alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For gate.passed alone, the newly authored dispatch-context binding reuses Executor_Protocol section 3: dispatch_score_ref resolves the original scheduler.pass node entry for the same run/node/attempt, and dispatch_score_tuple preserves exactly scheduler_lane, manual_priority, transitive_unblock_count, ready_since_utc and node_id. Before preparation, the original gate owner authenticates that source and captures the exact ref/tuple and optional score_threshold in immutable before (null proves absence). completed.owner_result carries the actual numeric score or null; payload score equals that outcome, score_threshold equals before, and both tuple/ref equal before exactly. Exposing either scalar requires both dispatch fields and the matching node_id. The numeric gate result/threshold retain Progression_Gates semantics; this context is not a replacement scoring/ranking policy. Missing, changed, wrong-node or transplanted dispatch context refuses before append; unscored events retain null source context and omit score fields.
  For gate.passed alone, the shared CV-1100, SP-1100, SP-1101 and CV-1101 owner units apply beside CV-317, CV-339, CV-366, SP-236, SP-286, SP-337 and this family's own text, and change no recipe ID, preimage, field or schema range. Every schema integer slot admits only an exact integer (never 1.0 or a boolean) within its own owner bounds; before any append or effect the current writer qualifies the complete CV-317 producer projection through the shared RFC 8785 route, so an exact integer that route cannot preserve (for example producer_sequence_id or a payload counter above 2^53) refuses, while the logical range and pm.dt.source.json.v1 bytes stay unchanged and integers of any length are read and written exactly. Storage sequence ids are exact uint64 (SP-1100); CV-366 application source files use pm.application.physical_messagepack.v1 and the SP-337 inline limit measures the body's SP-236 EventRecord value bytes. Every date-time field of this family's payload, sources and checkpoint, and EventRecord occurred_at_utc, uses the CV-1101 EventRecord profile (lowercase, offsets, real leap seconds and any fraction length remain valid and keep their exact spelling); the two Storage-assigned EventRecord times use CV-253's storage_utc_z profile; deadline and retention-age comparisons use exact instants with offsets and complete fractions. A retained original is read only after SP-1101 dispatch resolves its sealed custody and frozen recipe and resources for the binding the record claims; no request flag, caller original or current writer guard selects or narrows that recipe.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/Progression_Gates.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/gate_passed, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-608 - requirements.clarification_requested prepared event contract

```yaml
plan_unit_id: CV-608
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for requirements.clarification_requested@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/Progression_Gates.md (Progression_Gates.md:428-475; Contracts_V0.md:1451). Only a schema-valid blocked requirements report with nonempty needs_user_clarification emits. question_ids equals the complete report question set. No automatic answers or progression; explicit answers and a new PASS report are required. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/requirements_clarification_requested with schema_id pm.event_payload.requirements_clarification_requested.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For requirements.clarification_requested, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, wizard_id, thread_id, report_ref], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-294. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For requirements.clarification_requested alone, the full source/identity contract in SP-588 and Plans/dt_event_contracts.schema.json#/$defs/requirements_clarification_requested_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The RequirementsQualityGate.request_clarification source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For requirements.clarification_requested alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For requirements.clarification_requested alone, the explicit lifecycle transition is blocked_report -> clarification_pending: complete report questions; explicit answers and new PASS required. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For requirements.clarification_requested alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For requirements.clarification_requested alone, retention_policy_ref = PENDING_RETENTION_DECISION for only the unresolved runless facet. GATE-012 defines a pre-execution BLOCKED report/question request with wizard/thread/question/report identity and no required run. No exact current event-policy assignment was found. Runtime-linked instances keep the existing runtime minimum. Exact residual question for Jared: Which class and expiry anchor govern this report request where a run-completion anchor is inapplicable? Do not assume that a ref-only report request is chat content. Runtime-linked cases should reuse existing runtime minima. No expiration, eviction or admission follows while pending; source/receipt/reference closure and holds remain protected.
  For requirements.clarification_requested alone, the shared CV-1100, SP-1100, SP-1101 and CV-1101 owner units apply beside CV-317, CV-339, CV-366, SP-236, SP-286, SP-337 and this family's own text, and change no recipe ID, preimage, field or schema range. Every schema integer slot admits only an exact integer (never 1.0 or a boolean) within its own owner bounds; before any append or effect the current writer qualifies the complete CV-317 producer projection through the shared RFC 8785 route, so an exact integer that route cannot preserve (for example producer_sequence_id or a payload counter above 2^53) refuses, while the logical range and pm.dt.source.json.v1 bytes stay unchanged and integers of any length are read and written exactly. Storage sequence ids are exact uint64 (SP-1100); CV-366 application source files use pm.application.physical_messagepack.v1 and the SP-337 inline limit measures the body's SP-236 EventRecord value bytes. Every date-time field of this family's payload, sources and checkpoint, and EventRecord occurred_at_utc, uses the CV-1101 EventRecord profile (lowercase, offsets, real leap seconds and any fraction length remain valid and keep their exact spelling); the two Storage-assigned EventRecord times use CV-253's storage_utc_z profile; deadline and retention-age comparisons use exact instants with offsets and complete fractions. A retained original is read only after SP-1101 dispatch resolves its sealed custody and frozen recipe and resources for the binding the record claims; no request flag, caller original or current writer guard selects or narrows that recipe.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/Progression_Gates.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/requirements_clarification_requested, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-609 - run.background_enqueued prepared event contract

```yaml
plan_unit_id: CV-609
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for run.background_enqueued@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/storage-plan.md (storage-plan.md:1656; CV-365/CV-366). Append only after the durable enqueue intent captures authenticated actual scope/Host/root. Queue release follows receipt. Missing worktree fields never choose main Project or application scope. Replay never enqueues again. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/run_background_enqueued with schema_id pm.event_payload.run_background_enqueued.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is application_or_project; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For run.background_enqueued, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, run_id, enqueue_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-294. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For run.background_enqueued alone, the full source/identity contract in SP-589 and Plans/dt_event_contracts.schema.json#/$defs/run_background_enqueued_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The BackgroundRunQueue.enqueue source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For run.background_enqueued alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For run.background_enqueued application writes only, CV-366's app identity and physical codec override the Project-only dt: recipe and source codec above. The distinct source sibling is Plans/dt_event_contracts.schema.json#/$defs/run_background_enqueued_application_source at storage/event-sources/dt/run_background_enqueued/application/{event_id}/{stage}.msgpack, physical family dt_run_background_enqueued_application_source. It preserves the complete WorkflowScopeV2 with actual server_id and null Project/home/NamedPlan, plus the actual original_owner_operation_id; neither is supplied from UI focus. Allocate and retain owner_operation_id = lowercase SHA-256 of RFC 8785 string array [event_type, actual original_owner_operation_id, this family's original identity subjects as strings] before any effect. This explicit family operation component prevents two optional effects of one owner operation from sharing an event identity. The exact idempotency_key is CV-366 application@1:hex(UTF-8 actual server_id):hex(UTF-8 owner_operation_id); event_id remains evt_dt_ plus SHA-256 of UTF-8 that key. The completed original application source, WorkflowScopeV2, actual owner operation and full EventRecord scope/actor/account/attempt joins must all agree. Use CV-366 pm.application.physical_messagepack.v1 for these files: minimal integers, UTF-8 sorted closed maps, ordered arrays and exact finite binary64 fractions; source SHA-256 commits exact physical bytes and never substitutes for the application's separately owned semantic hash. Project source schema/codec remains exact and refuses application values. This auxiliary original-source custody does not enroll or replace CV-366's selected application_workflow_source_graph resource/method graph: the actual graph and role must be admitted and authenticate the source before any app append or read; unsupported roles are unavailable. Original Project resources, old bytes and shared full-value receipts are unchanged. Application source retention and coherent backup use this event's same explicit policy or unresolved marker; no app exception to a pending decision.
  For run.background_enqueued alone, the explicit lifecycle transition is captured_queue_intent -> enqueued: durable queue record and actual scope/Host/root before receipt-gated release. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For run.background_enqueued alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For run.background_enqueued alone, the shared CV-1100, SP-1100, SP-1101 and CV-1101 owner units apply beside CV-317, CV-339, CV-366, SP-236, SP-286, SP-337 and this family's own text, and change no recipe ID, preimage, field or schema range. Every schema integer slot admits only an exact integer (never 1.0 or a boolean) within its own owner bounds; before any append or effect the current writer qualifies the complete CV-317 producer projection through the shared RFC 8785 route, so an exact integer that route cannot preserve (for example producer_sequence_id or a payload counter above 2^53) refuses, while the logical range and pm.dt.source.json.v1 bytes stay unchanged and integers of any length are read and written exactly. Storage sequence ids are exact uint64 (SP-1100); CV-366 application source files use pm.application.physical_messagepack.v1 and the SP-337 inline limit measures the body's SP-236 EventRecord value bytes. Every date-time field of this family's payload, sources and checkpoint, and EventRecord occurred_at_utc, uses the CV-1101 EventRecord profile (lowercase, offsets, real leap seconds and any fraction length remain valid and keep their exact spelling); the two Storage-assigned EventRecord times use CV-253's storage_utc_z profile; deadline and retention-age comparisons use exact instants with offsets and complete fractions. A retained original is read only after SP-1101 dispatch resolves its sealed custody and frozen recipe and resources for the binding the record claims; no request flag, caller original or current writer guard selects or narrows that recipe.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/run_background_enqueued, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-610 - tool.denied prepared event contract

```yaml
plan_unit_id: CV-610
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for tool.denied@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/Tools.md (Tools.md 8.0/8.2; Contracts_V0.md 3 tool.denied, CV-355/CV-366). Only the already specified policy/user-denial path is prepared, before any dispatch; never executes or contributes to executed-call rollups. DL-430 resolves FileSafe non-emission: a FileSafe block saves only its dedicated FileSafe refusal entry, never tool.denied. The tool view shows the FileSafe reason and ordered allowed recovery actions; the block is distinct from execution failure and is never retried automatically. Schema refusal alone is not this prepared policy/user-denial path. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/tool_denied with schema_id pm.event_payload.tool_denied.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is application_or_project; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For tool.denied, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, run_id, tool_use_id, attempt_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-295. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For tool.denied alone, the full source/identity contract in SP-590 and Plans/dt_event_contracts.schema.json#/$defs/tool_denied_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The ToolDispatcher.denied source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For tool.denied alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For tool.denied application writes only, CV-366's app identity and physical codec override the Project-only dt: recipe and source codec above. The distinct source sibling is Plans/dt_event_contracts.schema.json#/$defs/tool_denied_application_source at storage/event-sources/dt/tool_denied/application/{event_id}/{stage}.msgpack, physical family dt_tool_denied_application_source. It preserves the complete WorkflowScopeV2 with actual server_id and null Project/home/NamedPlan, plus the actual original_owner_operation_id; neither is supplied from UI focus. Allocate and retain owner_operation_id = lowercase SHA-256 of RFC 8785 string array [event_type, actual original_owner_operation_id, this family's original identity subjects as strings] before any effect. This explicit family operation component prevents two optional effects of one owner operation from sharing an event identity. The exact idempotency_key is CV-366 application@1:hex(UTF-8 actual server_id):hex(UTF-8 owner_operation_id); event_id remains evt_dt_ plus SHA-256 of UTF-8 that key. The completed original application source, WorkflowScopeV2, actual owner operation and full EventRecord scope/actor/account/attempt joins must all agree. Use CV-366 pm.application.physical_messagepack.v1 for these files: minimal integers, UTF-8 sorted closed maps, ordered arrays and exact finite binary64 fractions; source SHA-256 commits exact physical bytes and never substitutes for the application's separately owned semantic hash. Project source schema/codec remains exact and refuses application values. This auxiliary original-source custody does not enroll or replace CV-366's selected application_workflow_source_graph resource/method graph: the actual graph and role must be admitted and authenticate the source before any app append or read; unsupported roles are unavailable. Original Project resources, old bytes and shared full-value receipts are unchanged. Application source retention and coherent backup use this event's same explicit policy or unresolved marker; no app exception to a pending decision.
  For tool.denied alone, the explicit lifecycle transition is policy_evaluated -> denied: original refusal before dispatch; no executed-call contribution. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For tool.denied alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For tool.denied alone, only the already specified policy/user-denial path is prepared. DL-430 resolves FileSafe non-emission: a FileSafe block saves only its dedicated FileSafe refusal entry, never tool.denied. The tool view shows the FileSafe reason and ordered allowed recovery actions; the block is distinct from execution failure and is never retried automatically. Schema refusal alone, allow decisions and already-dispatched operations do not emit this policy/user-denial record. Accepted policy/user refusal emits one denial with zero tool execution and zero executed-call rollup contribution. Runtime-attributed denials capture original denial_origin, policy decision, not-dispatched state, blocked_sequence, approval_scope_key and the exact canonical runtime mapping in immutable before. The closed payload carries blocked_reason_code, failure_class, ordered allowed_action_ids, headless_denied, permission_snapshot_id and executed_at_all=false. Policy/user denial is pre-dispatch with no classified attempted outcome, so failure_class is explicitly null rather than inventing a transient class; headless_denied is true exactly for headless_ask_denied. The original effective permission_snapshot_id and action order must match, not just their membership. All mapping fields and both blocked-episode fields join before exactly before append, for both the Project source and the separate CV-366 application source. App bytes/operation identity remain distinct. Changed episodes, action order, reason, headless flag or permission snapshot refuse; optional web-local metadata never substitutes for this top-level runtime mapping.
  For tool.denied alone, retention_policy_ref = RP-RUNTIME-365D for tool.denied runtime-attributed actual-run/attempt history (Contracts runtime attribution; Case L-3): 365 days after actual run completion, 1,000,000/run and 5,000,000/Project, successor compaction under every existing hold, including recent-run and backup dependencies. SP-349 binds one Server-wide app counterpart bucket per family with the same limits/TTL/holds, never a per-chat reset. No run completion means no expiry anchor. This assignment covers this drafted runtime population only; it invents no separate non-authority diagnostic population or class choice.
  For tool.denied alone, the shared CV-1100, SP-1100, SP-1101 and CV-1101 owner units apply beside CV-317, CV-339, CV-366, SP-236, SP-286, SP-337 and this family's own text, and change no recipe ID, preimage, field or schema range. Every schema integer slot admits only an exact integer (never 1.0 or a boolean) within its own owner bounds; before any append or effect the current writer qualifies the complete CV-317 producer projection through the shared RFC 8785 route, so an exact integer that route cannot preserve (for example producer_sequence_id or a payload counter above 2^53) refuses, while the logical range and pm.dt.source.json.v1 bytes stay unchanged and integers of any length are read and written exactly. Storage sequence ids are exact uint64 (SP-1100); CV-366 application source files use pm.application.physical_messagepack.v1 and the SP-337 inline limit measures the body's SP-236 EventRecord value bytes. Every date-time field of this family's payload, sources and checkpoint, and EventRecord occurred_at_utc, uses the CV-1101 EventRecord profile (lowercase, offsets, real leap seconds and any fraction length remain valid and keep their exact spelling); the two Storage-assigned EventRecord times use CV-253's storage_utc_z profile; deadline and retention-age comparisons use exact instants with offsets and complete fractions. A retained original is read only after SP-1101 dispatch resolves its sealed custody and frozen recipe and resources for the binding the record claims; no request flag, caller original or current writer guard selects or narrows that recipe.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/tool_denied, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-611 - tool.execution_completed prepared event contract

```yaml
plan_unit_id: CV-611
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for tool.execution_completed@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/Tools.md (Contracts_V0.md:941-942; Tools.md 8.2). Exactly one terminal record follows a matching execution_started; result_ref joins original result custody and duration_ms is nonnegative. Replay never reexecutes. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/tool_execution_completed with schema_id pm.event_payload.tool_execution_completed.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is application_or_project; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For tool.execution_completed, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, run_id, tool_use_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-295. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For tool.execution_completed alone, the full source/identity contract in SP-591 and Plans/dt_event_contracts.schema.json#/$defs/tool_execution_completed_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The ToolRunner.execution_completed source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For tool.execution_completed alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For tool.execution_completed application writes only, CV-366's app identity and physical codec override the Project-only dt: recipe and source codec above. The distinct source sibling is Plans/dt_event_contracts.schema.json#/$defs/tool_execution_completed_application_source at storage/event-sources/dt/tool_execution_completed/application/{event_id}/{stage}.msgpack, physical family dt_tool_execution_completed_application_source. It preserves the complete WorkflowScopeV2 with actual server_id and null Project/home/NamedPlan, plus the actual original_owner_operation_id; neither is supplied from UI focus. Allocate and retain owner_operation_id = lowercase SHA-256 of RFC 8785 string array [event_type, actual original_owner_operation_id, this family's original identity subjects as strings] before any effect. This explicit family operation component prevents two optional effects of one owner operation from sharing an event identity. The exact idempotency_key is CV-366 application@1:hex(UTF-8 actual server_id):hex(UTF-8 owner_operation_id); event_id remains evt_dt_ plus SHA-256 of UTF-8 that key. The completed original application source, WorkflowScopeV2, actual owner operation and full EventRecord scope/actor/account/attempt joins must all agree. Use CV-366 pm.application.physical_messagepack.v1 for these files: minimal integers, UTF-8 sorted closed maps, ordered arrays and exact finite binary64 fractions; source SHA-256 commits exact physical bytes and never substitutes for the application's separately owned semantic hash. Project source schema/codec remains exact and refuses application values. This auxiliary original-source custody does not enroll or replace CV-366's selected application_workflow_source_graph resource/method graph: the actual graph and role must be admitted and authenticate the source before any app append or read; unsupported roles are unavailable. Original Project resources, old bytes and shared full-value receipts are unchanged. Application source retention and coherent backup use this event's same explicit policy or unresolved marker; no app exception to a pending decision.
  For tool.execution_completed alone, the explicit lifecycle transition is started -> terminal_outcome: matching start, exact original outcome/result and nonnegative duration. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For tool.execution_completed alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For tool.execution_completed alone, the shared CV-1100, SP-1100, SP-1101 and CV-1101 owner units apply beside CV-317, CV-339, CV-366, SP-236, SP-286, SP-337 and this family's own text, and change no recipe ID, preimage, field or schema range. Every schema integer slot admits only an exact integer (never 1.0 or a boolean) within its own owner bounds; before any append or effect the current writer qualifies the complete CV-317 producer projection through the shared RFC 8785 route, so an exact integer that route cannot preserve (for example producer_sequence_id or a payload counter above 2^53) refuses, while the logical range and pm.dt.source.json.v1 bytes stay unchanged and integers of any length are read and written exactly. Storage sequence ids are exact uint64 (SP-1100); CV-366 application source files use pm.application.physical_messagepack.v1 and the SP-337 inline limit measures the body's SP-236 EventRecord value bytes. Every date-time field of this family's payload, sources and checkpoint, and EventRecord occurred_at_utc, uses the CV-1101 EventRecord profile (lowercase, offsets, real leap seconds and any fraction length remain valid and keep their exact spelling); the two Storage-assigned EventRecord times use CV-253's storage_utc_z profile; deadline and retention-age comparisons use exact instants with offsets and complete fractions. A retained original is read only after SP-1101 dispatch resolves its sealed custody and frozen recipe and resources for the binding the record claims; no request flag, caller original or current writer guard selects or narrows that recipe.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/tool_execution_completed, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-612 - tool.execution_started prepared event contract

```yaml
plan_unit_id: CV-612
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for tool.execution_started@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/Tools.md (Contracts_V0.md:941-942; Tools.md 8.2). After every dispatch policy/schema/hook gate succeeds, record the admitted tool-use start before invoking the tool. No start is emitted for a policy denial. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/tool_execution_started with schema_id pm.event_payload.tool_execution_started.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is application_or_project; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For tool.execution_started, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, run_id, tool_use_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-296. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For tool.execution_started alone, the full source/identity contract in SP-592 and Plans/dt_event_contracts.schema.json#/$defs/tool_execution_started_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The ToolRunner.execution_started source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For tool.execution_started alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For tool.execution_started application writes only, CV-366's app identity and physical codec override the Project-only dt: recipe and source codec above. The distinct source sibling is Plans/dt_event_contracts.schema.json#/$defs/tool_execution_started_application_source at storage/event-sources/dt/tool_execution_started/application/{event_id}/{stage}.msgpack, physical family dt_tool_execution_started_application_source. It preserves the complete WorkflowScopeV2 with actual server_id and null Project/home/NamedPlan, plus the actual original_owner_operation_id; neither is supplied from UI focus. Allocate and retain owner_operation_id = lowercase SHA-256 of RFC 8785 string array [event_type, actual original_owner_operation_id, this family's original identity subjects as strings] before any effect. This explicit family operation component prevents two optional effects of one owner operation from sharing an event identity. The exact idempotency_key is CV-366 application@1:hex(UTF-8 actual server_id):hex(UTF-8 owner_operation_id); event_id remains evt_dt_ plus SHA-256 of UTF-8 that key. The completed original application source, WorkflowScopeV2, actual owner operation and full EventRecord scope/actor/account/attempt joins must all agree. Use CV-366 pm.application.physical_messagepack.v1 for these files: minimal integers, UTF-8 sorted closed maps, ordered arrays and exact finite binary64 fractions; source SHA-256 commits exact physical bytes and never substitutes for the application's separately owned semantic hash. Project source schema/codec remains exact and refuses application values. This auxiliary original-source custody does not enroll or replace CV-366's selected application_workflow_source_graph resource/method graph: the actual graph and role must be admitted and authenticate the source before any app append or read; unsupported roles are unavailable. Original Project resources, old bytes and shared full-value receipts are unchanged. Application source retention and coherent backup use this event's same explicit policy or unresolved marker; no app exception to a pending decision.
  For tool.execution_started alone, the explicit lifecycle transition is admitted -> started: schema, policy and hooks pass; receipt before invoking tool. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For tool.execution_started alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For tool.execution_started alone, the shared CV-1100, SP-1100, SP-1101 and CV-1101 owner units apply beside CV-317, CV-339, CV-366, SP-236, SP-286, SP-337 and this family's own text, and change no recipe ID, preimage, field or schema range. Every schema integer slot admits only an exact integer (never 1.0 or a boolean) within its own owner bounds; before any append or effect the current writer qualifies the complete CV-317 producer projection through the shared RFC 8785 route, so an exact integer that route cannot preserve (for example producer_sequence_id or a payload counter above 2^53) refuses, while the logical range and pm.dt.source.json.v1 bytes stay unchanged and integers of any length are read and written exactly. Storage sequence ids are exact uint64 (SP-1100); CV-366 application source files use pm.application.physical_messagepack.v1 and the SP-337 inline limit measures the body's SP-236 EventRecord value bytes. Every date-time field of this family's payload, sources and checkpoint, and EventRecord occurred_at_utc, uses the CV-1101 EventRecord profile (lowercase, offsets, real leap seconds and any fraction length remain valid and keep their exact spelling); the two Storage-assigned EventRecord times use CV-253's storage_utc_z profile; deadline and retention-age comparisons use exact instants with offsets and complete fractions. A retained original is read only after SP-1101 dispatch resolves its sealed custody and frozen recipe and resources for the binding the record claims; no request flag, caller original or current writer guard selects or narrows that recipe.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/tool_execution_started, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-613 - tool.invoked prepared event contract

```yaml
plan_unit_id: CV-613
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for tool.invoked@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/Tools.md (Tools.md 8.0/8.2/8.4; Contracts_V0.md 3 and 3.4). A completed or attempted-completed operation emits exactly one record; success=false contributes to error_count. Refused calls use tool.denied and never increment executed-call rollups. index_used describes actual acceleration and never guesses. Web operations stay this family, never web.operation.*. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/tool_invoked with schema_id pm.event_payload.tool_invoked.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is application_or_project; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For tool.invoked, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, run_id, tool_use_id, attempt_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-296. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For tool.invoked alone, the full source/identity contract in SP-593 and Plans/dt_event_contracts.schema.json#/$defs/tool_invoked_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The ToolDispatcher.completed_invocation source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For tool.invoked alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For tool.invoked application writes only, CV-366's app identity and physical codec override the Project-only dt: recipe and source codec above. The distinct source sibling is Plans/dt_event_contracts.schema.json#/$defs/tool_invoked_application_source at storage/event-sources/dt/tool_invoked/application/{event_id}/{stage}.msgpack, physical family dt_tool_invoked_application_source. It preserves the complete WorkflowScopeV2 with actual server_id and null Project/home/NamedPlan, plus the actual original_owner_operation_id; neither is supplied from UI focus. Allocate and retain owner_operation_id = lowercase SHA-256 of RFC 8785 string array [event_type, actual original_owner_operation_id, this family's original identity subjects as strings] before any effect. This explicit family operation component prevents two optional effects of one owner operation from sharing an event identity. The exact idempotency_key is CV-366 application@1:hex(UTF-8 actual server_id):hex(UTF-8 owner_operation_id); event_id remains evt_dt_ plus SHA-256 of UTF-8 that key. The completed original application source, WorkflowScopeV2, actual owner operation and full EventRecord scope/actor/account/attempt joins must all agree. Use CV-366 pm.application.physical_messagepack.v1 for these files: minimal integers, UTF-8 sorted closed maps, ordered arrays and exact finite binary64 fractions; source SHA-256 commits exact physical bytes and never substitutes for the application's separately owned semantic hash. Project source schema/codec remains exact and refuses application values. This auxiliary original-source custody does not enroll or replace CV-366's selected application_workflow_source_graph resource/method graph: the actual graph and role must be admitted and authenticate the source before any app append or read; unsupported roles are unavailable. Original Project resources, old bytes and shared full-value receipts are unchanged. Application source retention and coherent backup use this event's same explicit policy or unresolved marker; no app exception to a pending decision.
  For tool.invoked alone, the explicit lifecycle transition is started -> attempted_completed: actual attempt outcome, success/latency/index facts; refused calls excluded. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For tool.invoked alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For tool.invoked alone, the repaired closed web meta shape preserves semantic web_operation=search|read|extract|research|crawl|map (webfetch maps to read; deep_research maps to research), current stored support-tier enums and operation-local counters/refs. Required web context includes tool_id, operation_input_ref, invocation_source, support_tier, execution_path and provider_fallback_occurred. operation_input_ref resolves the actual immutable normalized structured operation_input through the original owner; a preview cannot replace it. sources_ref, content_ref and map_ref are opaque permission-checked refs, never inline full bodies/source sets/graphs. nodes_count and edges_count belong to map; read, extract, research and crawl retain their current counters, refs, cache and source identifiers. Compatibility aliases normalize before this closed current shape. before.web_request freezes original operation/input/source and batch lineage; completed.owner_result.meta carries the exact actual redacted result metadata and joins payload.meta in full, not only success/latency. Non-web records use null source web context and omit meta. The source resolver authenticates the actual request/result references, not a caller assertion. For batch_webfetch, meta.batch_id and batch_role=parent freeze the ordered child_tool_use_ids allocated by the same original batch; each URL child has its own actual tool_use_id/event identity, batch_role=child, parent_tool_use_id, EventRecord.parent_event_id, URL/status/cache/provenance and provider_attempt_ref. Each child source freezes the exact parent event ID and URL; all share original run/attempt/scope. Parent aggregate success equals the child aggregate. These are newly authored correlation bindings for the already required one-parent/per-URL-child behavior, not a new event family or replacement batch timeout/approval policy.
  For tool.invoked alone, retention_policy_ref = RP-RUNTIME-365D for tool.invoked runtime-attributed actual-run/attempt history (Contracts runtime attribution; Case L-3): 365 days after actual run completion, 1,000,000/run and 5,000,000/Project, successor compaction under every existing hold, including recent-run and backup dependencies. SP-349 binds one Server-wide app counterpart bucket per family with the same limits/TTL/holds, never a per-chat reset. No run completion means no expiry anchor. This assignment covers this drafted runtime population only; it invents no separate non-authority diagnostic population or class choice.
  For tool.invoked alone, the shared CV-1100, SP-1100, SP-1101 and CV-1101 owner units apply beside CV-317, CV-339, CV-366, SP-236, SP-286, SP-337 and this family's own text, and change no recipe ID, preimage, field or schema range. Every schema integer slot admits only an exact integer (never 1.0 or a boolean) within its own owner bounds; before any append or effect the current writer qualifies the complete CV-317 producer projection through the shared RFC 8785 route, so an exact integer that route cannot preserve (for example producer_sequence_id or a payload counter above 2^53) refuses, while the logical range and pm.dt.source.json.v1 bytes stay unchanged and integers of any length are read and written exactly. Storage sequence ids are exact uint64 (SP-1100); CV-366 application source files use pm.application.physical_messagepack.v1 and the SP-337 inline limit measures the body's SP-236 EventRecord value bytes. Every date-time field of this family's payload, sources and checkpoint, and EventRecord occurred_at_utc, uses the CV-1101 EventRecord profile (lowercase, offsets, real leap seconds and any fraction length remain valid and keep their exact spelling); the two Storage-assigned EventRecord times use CV-253's storage_utc_z profile; deadline and retention-age comparisons use exact instants with offsets and complete fractions. A retained original is read only after SP-1101 dispatch resolves its sealed custody and frozen recipe and resources for the binding the record claims; no request flag, caller original or current writer guard selects or narrows that recipe.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/tool_invoked, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-614 - usage.event prepared event contract

```yaml
plan_unit_id: CV-614
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for usage.event@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/usage-feature.md (usage-feature.md UF-085, UF-108; storage-plan.md SP-341; CV-366). Normalize actual provider/header/CLI/estimate observations; null means unknown, never zero. Cache/reasoning subset fields are not added to inclusive totals. Adjustments replace the prior contribution for usage_record_id atomically, never add it twice. Opening Usage reads rollups and does not scan events; JSONL is import/export only. Daily account/provider/model totals survive detail expiry. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/usage_event with schema_id pm.event_payload.usage_event.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is application_or_project; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For usage.event, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, usage_record_id, dedupe_key, settlement_status, observed_at_utc], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. UF-085 remains accounting authority; nullable buckets represent unknown and do not fabricate zeros. Existing provider mapper cost, quota, pricing and authority detail remains required when exposed; this schema does not admit an analytics-thin replacement. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-297. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For usage.event alone, the full source/identity contract in SP-594 and Plans/dt_event_contracts.schema.json#/$defs/usage_event_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The UsageTracker.normalize_finish_step source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For usage.event alone, UF-085's existing providerIdentity, costFields and quotaFields in Plans/runtime_artifact_cost_usage.schema.json are reused for the normalized event wire. The new closed cost/quota slots preserve those existing fields; cost_minor_units is tightened to amount/currency/minor_unit_exponent, and bucket_costs_microdollars to the six named accounting slots; cache_write_1h remains subset attribution and is never added onto inclusive cache_write cost. No arbitrary provider extension map or secret enters the normalized event. The legacy flat cost fields are equal mirrors of cost's fields, never an independent charge. raw_payload_ref is present (nullable only when original evidence proves no provider payload), provider_attempt_ref is a real source execution trace, and provider_payload_hash equals the redacted original observation bytes, not a reconstructed UsageRecord. Unknown numeric slots stay null. display_cost_policy reuses the existing show/hide/subscription_covered/unknown policy; it never changes provider authority. Quota reset/cooldown and windows retain their original source evidence; unknown/disabled/not_exposed quantities are null, never fabricated zero/countdown. usage_event_ref equals the computed EventRecord event_id exactly. The original usage_record_id, dedupe_key, provider_attempt_ref, actual runtime attempt, account, provider route, billing entity and optional parent record remain joined to original observation/source custody. Each new observed/streaming_partial/settled/adjusted/failed/unknown observation has its original timestamp and source identity; an exact duplicate returns its original value. A same-record revision requires the prior original Usage event ref and same source identity; adjusted requires a settled/adjusted predecessor and an adjusted_at_utc, settled requires settled_at_utc, and terminal/adjusted observations cannot regress to observed/streaming_partial. Failures and unknown values never manufacture a bill. A new billed retry uses its actual new attempt/UsageRecord and may link its parent; it never aliases a prior record. UF-085 accounting applies deltas by replacing the previous accepted contribution for usage_record_id atomically with the Usage rollup cursor; the DT inspection checkpoint is not a second accounting engine. Inclusive cache/reasoning totals are never added twice, and exclusive totals add the disjoint cache/reasoning components once (cache_write_1h remains a cache_write subset). Parent/child records retain separate billed attempts; grouping does not fold inherited context into child consumption. Exact known and null cost/quota/pricing vectors, all source classes, all settlement states, partial/failed/resumed streams, BYOK/subscription suppression and parent retry joins are authored. UF-108/SP-341 remain controlling: page totals/windows/charts read rollups, Ledger pages the index, JSONL is import/export only, canonical daily account/provider/model totals commit before detail expiry and survive derived-file loss; restore discloses post-backup lost totals. The structured retention assignment is PENDING_RETENTION_BINDING for the RT setting-driven adapter under decided SP-341/UF-108; deletion/admission remain fenced, with no new duration question.
  For usage.event alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For usage.event application writes only, CV-366's app identity and physical codec override the Project-only dt: recipe and source codec above. The distinct source sibling is Plans/dt_event_contracts.schema.json#/$defs/usage_event_application_source at storage/event-sources/dt/usage_event/application/{event_id}/{stage}.msgpack, physical family dt_usage_event_application_source. It preserves the complete WorkflowScopeV2 with actual server_id and null Project/home/NamedPlan, plus the actual original_owner_operation_id; neither is supplied from UI focus. Allocate and retain owner_operation_id = lowercase SHA-256 of RFC 8785 string array [event_type, actual original_owner_operation_id, this family's original identity subjects as strings] before any effect. This explicit family operation component prevents two optional effects of one owner operation from sharing an event identity. The exact idempotency_key is CV-366 application@1:hex(UTF-8 actual server_id):hex(UTF-8 owner_operation_id); event_id remains evt_dt_ plus SHA-256 of UTF-8 that key. The completed original application source, WorkflowScopeV2, actual owner operation and full EventRecord scope/actor/account/attempt joins must all agree. Use CV-366 pm.application.physical_messagepack.v1 for these files: minimal integers, UTF-8 sorted closed maps, ordered arrays and exact finite binary64 fractions; source SHA-256 commits exact physical bytes and never substitutes for the application's separately owned semantic hash. Project source schema/codec remains exact and refuses application values. This auxiliary original-source custody does not enroll or replace CV-366's selected application_workflow_source_graph resource/method graph: the actual graph and role must be admitted and authenticate the source before any app append or read; unsupported roles are unavailable. Original Project resources, old bytes and shared full-value receipts are unchanged. Application source retention and coherent backup use this event's same explicit policy or unresolved marker; no app exception to a pending decision.
  For usage.event alone, the explicit lifecycle transition is original_observation -> normalized_observation: retain original observation, state and lineage; replace only accepted accounting contribution. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For usage.event alone, Storage section 5.2 parent_run_id is preserved when an actual source has parent-run lineage. It equals the original captured parent run and complements parent_usage_record_id; neither is inferred from UI focus or inherited context. The nullable original before/runtime-context slots prove inapplicability when the event omits it. The child-run fixture has its own actual Run, Attempt, provider response and UsageRecord identities and joins the original parent run/record without folding or double charging.
  For usage.event alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For usage.event alone, immutable before.account_id, billing_entity_id and provider_account_ref are required nullable source slots. Null proves original absence and joins an omitted optional payload field; a real identity joins byte-for-byte and cannot be replaced with absence, another identity or a fabricated placeholder. The correction is mirrored in the Project source, distinct CV-366 application source, both embedded payload/source editions and both registry schema mirrors. Complete absent-account, unknown/no-provider-evidence, local estimate and CLI observations exercise this path; provenance/unknown quantities stay truthful and no new account is manufactured.
  For usage.event alone, retention_policy_ref = PENDING_RETENTION_BINDING, a technical dependency under the decided SP-341/UF-108 policy, not PENDING_RETENTION_DECISION. Structured retention_binding names ai.usage.usage-retention (30 days, 90 days default, 180 days, 1 year or unlimited), detail in both seglog and Parquet, and canonical backed-up permanent daily account/provider/model totals committed before detail retirement and never rebuilt from expired events. SP-349 keeps the same setting and holds in one Server-wide app counterpart bucket. RT still must materialize the setting-driven policy object and expiry-anchor adapter; until then deletion and admission remain fenced. No duration is chosen here.
  For usage.event alone, the shared CV-1100, SP-1100, SP-1101 and CV-1101 owner units apply beside CV-317, CV-339, CV-366, SP-236, SP-286, SP-337 and this family's own text, and change no recipe ID, preimage, field or schema range. Every schema integer slot admits only an exact integer (never 1.0 or a boolean) within its own owner bounds; before any append or effect the current writer qualifies the complete CV-317 producer projection through the shared RFC 8785 route, so an exact integer that route cannot preserve (for example producer_sequence_id or a payload counter above 2^53) refuses, while the logical range and pm.dt.source.json.v1 bytes stay unchanged and integers of any length are read and written exactly. Storage sequence ids are exact uint64 (SP-1100); CV-366 application source files use pm.application.physical_messagepack.v1 and the SP-337 inline limit measures the body's SP-236 EventRecord value bytes. Every date-time field of this family's payload, sources and checkpoint, and EventRecord occurred_at_utc, uses the CV-1101 EventRecord profile (lowercase, offsets, real leap seconds and any fraction length remain valid and keep their exact spelling); the two Storage-assigned EventRecord times use CV-253's storage_utc_z profile; deadline and retention-age comparisons use exact instants with offsets and complete fractions. A retained original is read only after SP-1101 dispatch resolves its sealed custody and frozen recipe and resources for the binding the record claims; no request flag, caller original or current writer guard selects or narrows that recipe.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/usage_event, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-615 - worktree.created prepared event contract

```yaml
plan_unit_id: CV-615
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for worktree.created@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/WorktreeGitImprovement.md (WorktreeGitImprovement.md:200-221; Contracts_V0.md:946-947). Original allocation ownership and branch/path custody must exist before created is appended and before a node starts work. Creation replay inspects original allocation, never creates another tree. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/worktree_created with schema_id pm.event_payload.worktree_created.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For worktree.created, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, project_id, worktree_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-297. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For worktree.created alone, the full source/identity contract in SP-595 and Plans/dt_event_contracts.schema.json#/$defs/worktree_created_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The WorktreeLifecycleOwner.created source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For worktree.created alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For worktree.created alone, the explicit lifecycle transition is allocated -> created: original owned allocation and branch/path/lineage; receipt before node use. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For worktree.created alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For worktree.created alone, retention_policy_ref = PENDING_RETENTION_DECISION for only the unresolved runless facet. Runtime allocation history keeps the existing runtime minimum. WorktreeGitImprovement section 2.0A also defines Project/thread operations outside a running executor. The worktree projection is a separate family. Exact residual question for Jared: Resolve the runless event's class/anchor and required lineage dependencies; the projection policy does not automatically register this event's retention. No expiration, eviction or admission follows while pending; source/receipt/reference closure and holds remain protected.
  For worktree.created alone, the shared CV-1100, SP-1100, SP-1101 and CV-1101 owner units apply beside CV-317, CV-339, CV-366, SP-236, SP-286, SP-337 and this family's own text, and change no recipe ID, preimage, field or schema range. Every schema integer slot admits only an exact integer (never 1.0 or a boolean) within its own owner bounds; before any append or effect the current writer qualifies the complete CV-317 producer projection through the shared RFC 8785 route, so an exact integer that route cannot preserve (for example producer_sequence_id or a payload counter above 2^53) refuses, while the logical range and pm.dt.source.json.v1 bytes stay unchanged and integers of any length are read and written exactly. Storage sequence ids are exact uint64 (SP-1100); CV-366 application source files use pm.application.physical_messagepack.v1 and the SP-337 inline limit measures the body's SP-236 EventRecord value bytes. Every date-time field of this family's payload, sources and checkpoint, and EventRecord occurred_at_utc, uses the CV-1101 EventRecord profile (lowercase, offsets, real leap seconds and any fraction length remain valid and keep their exact spelling); the two Storage-assigned EventRecord times use CV-253's storage_utc_z profile; deadline and retention-age comparisons use exact instants with offsets and complete fractions. A retained original is read only after SP-1101 dispatch resolves its sealed custody and frozen recipe and resources for the binding the record claims; no request flag, caller original or current writer guard selects or narrows that recipe.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/worktree_created, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-616 - worktree.deleted prepared event contract

```yaml
plan_unit_id: CV-616
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045 for worktree.deleted@1.0.0 only, prepared without admission. Semantic behavior remains owned by Plans/WorktreeGitImprovement.md (WorktreeGitImprovement.md:200-221; Contracts_V0.md:946-947). Delete only after original result custody, grace period, file-lock and active-lock/safe-point dependency checks pass. Active lock references must be empty or proven released; no held safe point may lose its dependencies. Replay never deletes another tree. The closed payload is Plans/dt_event_contracts.schema.json#/$defs/worktree_deleted with schema_id pm.event_payload.worktree_deleted.v1, schema_version 1.0.0. Adopt Contracts_V0 EventRecord without a local envelope. Scope policy is project_only; payload identity and timestamp fields equal their envelope joins where present. Actual Project-native node/gate/worktree identity never becomes nullable app identity. An application-capable record must use the genuine CV-365/366 admitted source and captured scope, never infer it from missing Project. Tool node/attempt/lane/package/role/provider/account/operational refs are mandatory when applicable to the captured runtime source; optional absence is accepted only when the authenticated source proves inapplicability. Approval tool_use_id echoes its request and is present exactly for a tool request. For worktree.deleted, allocate the original source operation identity before any effect. Its idempotency_key is 'dt:' plus lowercase SHA-256 of RFC 8785 JSON [event_type, scope_partition, project_id, worktree_id], preserving those exact source values. event_id is 'evt_dt_' plus SHA-256 of UTF-8 idempotency_key. Use dedupe_by_idempotency_key and the complete CV-EventRecord producer_semantic_digest; same identity/different semantic digest refuses idempotency_conflict. Retries retain occurred_at_utc and every source/envelope field. Checks and positive/negative fixtures: python3 scripts/pm-dt-event-contracts.py; ATS-298. Native execution remains NOT_RUN. No registry append, admission, owner decision or seal follows.
  For worktree.deleted alone, the full source/identity contract in SP-596 and Plans/dt_event_contracts.schema.json#/$defs/worktree_deleted_source is normative. Payload subject joins equal the completed original source; applicable optional runtime fields equal its captured runtime_context and absent values require proven inapplicability. EventRecord scope_kind/project_id, run/thread/node/attempt, actor/account refs, original occurrence time and producer sequence equal the captured envelope_context. A caller-supplied Project or missing worktree never selects scope. Same-key bytes and complete EventRecord producer_semantic_digest use CV-EventRecord; a conflict cannot replace the original. The WorktreeLifecycleOwner.deleted source-state predicates and explicit negative vectors in Plans/dt_event_contract_fixtures.json are this family's transition table: each predicate must hold before append, with SP-286/CV-339 full-value receipt before dependent publication. Replay is observation only; no effect is reissued.
  For worktree.deleted alone, source codec pm.dt.source.json.v1 writes null/booleans as JSON literals, integers in exact shortest signed decimal (nonnegative source counters retain u64 without float conversion), finite fractional numbers as exact plain decimals with trailing fractional zeroes removed (no exponent and negative zero becomes zero), UTF-8 strings with JSON quote/backslash/control escaping and no Unicode normalization, arrays in order, and closed-object keys ordered by strict UTF-8 bytes. Duplicate keys, malformed Unicode, BOM, whitespace outside strings and nonfinite numbers are refused. Source decoder uses exact decimal parsing, not IEEE-754 conversion; a complete canonical-byte reencode must equal the input. This is a newly authored source-file codec, not a change to EventRecord's RFC 8785 semantic digest. For the identity preimage only, every unsigned integer subject is its shortest unsigned decimal string; thus all elements of the RFC 8785 array are strings. scope_partition is the existing Storage app or project~base64url(UTF-8 actual project_id without padding), never literal caller concatenation.
  For worktree.deleted alone, the explicit lifecycle transition is cleanup_eligible -> deleted: original removal outcome only after grace/file-lock and every dependency guard. prepared.before contains only original prerequisites known before the owner operation; completed.owner_result contains the closed authentic original outcome fields, which cannot be guessed at prepare time. The original owner commits those fields under the preallocated subject identity; payload outcome fields must equal that result. A completed source is accepted only with the exact prepare digest, original owner result and complete captured joins. No immutable prepared record is overwritten with a later outcome. Duplicate delivery returns the complete original receipt/value; invalid predecessors or changed prerequisites refuse without a new append or dependent publication. The named resolve_original method takes exactly storage_instance_id, scope_partition, event_id, idempotency_key, owner_ref and owner_revision; it returns exactly unavailable(reason_code) or original(prepared source, completed source, original full EventRecord, original eleven-field AppendReceipt or null before issuance). These records use this family's exact schemas and immutable files; the method authenticates actual owner transactions/files/permissions, never a caller assertion. Before issuance it may finalize from a provable original outcome and append only the frozen original; a missing or uncertain owner result remains unavailable/fenced.
  For worktree.deleted alone, current writer and retry paths refuse replay_policy=projector_replay_only as replay_only_not_appendable before any append or effect (CV-EventRecord); this policy is compatibility-reader-only. Project source fixtures keep the encoded project~ partition; application keys keep CV-366 application@1 byte formatting. SP-337 requires a verified payload reference for bodies above 16 KiB; inline overflow cannot bypass the pack reader.
  For worktree.deleted alone, retention_policy_ref = PENDING_RETENTION_DECISION for only the unresolved runless facet. Runtime history keeps the existing runtime minimum. The runless lifecycle event and worktree_lane_thread_families projection are distinct. That projection has RP-WORKTREE-TOMBSTONE-365D and retains tombstones while historical links exist; Case L-3 separately names deletion-tombstone authority. Neither name alone proves this event is that authority. Exact residual question for Jared: Is this exact event deletion-tombstone authority, or runless lifecycle history, and what is its applicable anchor? Separate runtime history and the distinct worktree_lane_thread_families projection; its RP-WORKTREE-TOMBSTONE-365D policy does not automatically register this event. No expiration, eviction or admission follows while pending; source/receipt/reference closure and holds remain protected.
  For worktree.deleted alone, the shared CV-1100, SP-1100, SP-1101 and CV-1101 owner units apply beside CV-317, CV-339, CV-366, SP-236, SP-286, SP-337 and this family's own text, and change no recipe ID, preimage, field or schema range. Every schema integer slot admits only an exact integer (never 1.0 or a boolean) within its own owner bounds; before any append or effect the current writer qualifies the complete CV-317 producer projection through the shared RFC 8785 route, so an exact integer that route cannot preserve (for example producer_sequence_id or a payload counter above 2^53) refuses, while the logical range and pm.dt.source.json.v1 bytes stay unchanged and integers of any length are read and written exactly. Storage sequence ids are exact uint64 (SP-1100); CV-366 application source files use pm.application.physical_messagepack.v1 and the SP-337 inline limit measures the body's SP-236 EventRecord value bytes. Every date-time field of this family's payload, sources and checkpoint, and EventRecord occurred_at_utc, uses the CV-1101 EventRecord profile (lowercase, offsets, real leap seconds and any fraction length remain valid and keep their exact spelling); the two Storage-assigned EventRecord times use CV-253's storage_utc_z profile; deadline and retention-age comparisons use exact instants with offsets and complete fractions. A retained original is read only after SP-1101 dispatch resolves its sealed custody and frozen recipe and resources for the binding the record claims; no request flag, caller original or current writer guard selects or narrows that recipe.
gui_related: false
gui_classification_reason: Technical event persistence and contract custody.
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Exact family contract and closed schema are checked without granting admission.
validation_surfaces:
  - python3 scripts/pm-dt-event-contracts.py
risk_class: event_authority_identity_or_replay
reasoning_tier: high
context_scope: event_authority_DT_20261104
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20261104/DT-binding-search.json
```

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/dt_event_contracts.json, ContractName:Plans/dt_event_contracts.schema.json#/$defs/worktree_deleted, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286


### CV-630 — bundle.selection_forward_blocked

Newly authored closed payload contract for `bundle.selection_forward_blocked` 1.0.0: `Plans/dch_event_payloads/bundle_selection_forward_blocked.schema.json#/$defs/project` selects `pm.dch_event.bundle_selection_forward_blocked.project.v1`; `Plans/dch_event_payloads/bundle_selection_forward_blocked.schema.json#/$defs/application` selects `pm.dch_event.bundle_selection_forward_blocked.application.v1`. The root and both payload editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `bundle.selection_forward_blocked`, schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic run/node/attempt joins. For bundle.selection_forward_blocked, freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple is ["bundle.selection_forward_blocked", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly this family's original operation_id, frozen with the accepted source before any effect; no retry, timestamp, focus or result component is added. No additional optional effect component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic digest returns the original result and first receipt without a new effect; a different digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration; readers never rewrite original identities or payload bytes.

Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236 canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes, not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref, with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`. The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack. Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance, Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack bytes and index entry and verified readback before the referencing append can be acknowledged or its first receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed. Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants no new retention exemption.

This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc from this comparison; metadata-only variation returns the original result/first receipt. Global event_id integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested; no whole-record equality substitutes for the owner commitment.

For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer's bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.

Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe's recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe's pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.

The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253's storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage's enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.

```yaml
plan_unit_id: CV-630
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '### CV-630 — bundle.selection_forward_blocked


  Newly authored closed payload contract for `bundle.selection_forward_blocked` 1.0.0: `Plans/dch_event_payloads/bundle_selection_forward_blocked.schema.json#/$defs/project`
  selects `pm.dch_event.bundle_selection_forward_blocked.project.v1`; `Plans/dch_event_payloads/bundle_selection_forward_blocked.schema.json#/$defs/application`
  selects `pm.dch_event.bundle_selection_forward_blocked.application.v1`. The root and both payload editions
  are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema.
  CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id
  equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual
  Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord
  event_type is `bundle.selection_forward_blocked`, schema/version dispatch selects the exact edition; occurred_at_utc
  equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual
  original source/committed record. No synthetic run/node/attempt joins. For bundle.selection_forward_blocked,
  freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation,
  retained across retries). The semantic identity tuple is ["bundle.selection_forward_blocked", "1.0.0", storage_instance_id,
  scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" +
  SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition
  = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity
  before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase
  hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly
  this family''s original operation_id, frozen with the accepted source before any effect; no retry, timestamp,
  focus or result component is added. No additional optional effect component is defined for this family; distinct
  event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original
  Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic
  digest returns the original result and first receipt without a new effect; a different digest conflicts;
  missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the
  Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed
  semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier
  shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration;
  readers never rewrite original identities or payload bytes.


  Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application
  payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236
  canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes,
  not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized
  inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored
  string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref,
  with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`.
  The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack.
  Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time
  join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance,
  Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack
  bytes and index entry and verified readback before the referencing append can be acknowledged or its first
  receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence
  refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed.
  Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants
  no new retention exemption.


  This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject
  projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its
  separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current
  append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field
  list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref
  in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc
  from this comparison; metadata-only variation returns the original result/first receipt. Global event_id
  integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another
  lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested;
  no whole-record equality substitutes for the owner commitment.


  For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer''s bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.


  Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe''s recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe''s pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.


  The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253''s storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage''s enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.'
gui_related: false
gui_classification_reason: Owns event data and persistence contract.
depends_on:
- ACD-610
- SP-337
unblocks: []
acceptance_criteria:
- Exact family schema, identity, scope, receipt, replay, custody and withdrawal checks pass; membership remains
  absent.
- Review-round-2 acceptance rejects the independently mutated forbidden policy, body, retry, source and outcome
  cases applicable to this exact family; native evidence remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_dch_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_contract
reasoning_tier: high
context_scope: event_authority_dch
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- DL-045; WAVE2 DCH 2026-11-04
preserved_exact_tokens:
- bundle.selection_forward_blocked
- SP-286
- SP-278
negative_constraints:
- No event admission or native execution proof; no retention choice.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-631 — bundle.selection_sent_to_chat

Newly authored closed payload contract for `bundle.selection_sent_to_chat` 1.0.0: `Plans/dch_event_payloads/bundle_selection_sent_to_chat.schema.json#/$defs/project` selects `pm.dch_event.bundle_selection_sent_to_chat.project.v1`; `Plans/dch_event_payloads/bundle_selection_sent_to_chat.schema.json#/$defs/application` selects `pm.dch_event.bundle_selection_sent_to_chat.application.v1`. The root and both payload editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `bundle.selection_sent_to_chat`, schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic run/node/attempt joins. For bundle.selection_sent_to_chat, freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple is ["bundle.selection_sent_to_chat", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly this family's original operation_id, frozen with the accepted source before any effect; no retry, timestamp, focus or result component is added. No additional optional effect component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic digest returns the original result and first receipt without a new effect; a different digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration; readers never rewrite original identities or payload bytes.

Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236 canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes, not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref, with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`. The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack. Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance, Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack bytes and index entry and verified readback before the referencing append can be acknowledged or its first receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed. Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants no new retention exemption.

This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc from this comparison; metadata-only variation returns the original result/first receipt. Global event_id integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested; no whole-record equality substitutes for the owner commitment.

For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer's bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.

Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe's recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe's pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.

The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253's storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage's enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.

```yaml
plan_unit_id: CV-631
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '### CV-631 — bundle.selection_sent_to_chat


  Newly authored closed payload contract for `bundle.selection_sent_to_chat` 1.0.0: `Plans/dch_event_payloads/bundle_selection_sent_to_chat.schema.json#/$defs/project`
  selects `pm.dch_event.bundle_selection_sent_to_chat.project.v1`; `Plans/dch_event_payloads/bundle_selection_sent_to_chat.schema.json#/$defs/application`
  selects `pm.dch_event.bundle_selection_sent_to_chat.application.v1`. The root and both payload editions are
  closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema.
  CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id
  equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual
  Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord
  event_type is `bundle.selection_sent_to_chat`, schema/version dispatch selects the exact edition; occurred_at_utc
  equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual
  original source/committed record. No synthetic run/node/attempt joins. For bundle.selection_sent_to_chat,
  freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation,
  retained across retries). The semantic identity tuple is ["bundle.selection_sent_to_chat", "1.0.0", storage_instance_id,
  scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" +
  SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition
  = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity
  before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase
  hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly
  this family''s original operation_id, frozen with the accepted source before any effect; no retry, timestamp,
  focus or result component is added. No additional optional effect component is defined for this family; distinct
  event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original
  Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic
  digest returns the original result and first receipt without a new effect; a different digest conflicts;
  missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the
  Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed
  semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier
  shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration;
  readers never rewrite original identities or payload bytes.


  Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application
  payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236
  canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes,
  not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized
  inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored
  string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref,
  with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`.
  The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack.
  Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time
  join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance,
  Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack
  bytes and index entry and verified readback before the referencing append can be acknowledged or its first
  receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence
  refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed.
  Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants
  no new retention exemption.


  This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject
  projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its
  separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current
  append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field
  list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref
  in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc
  from this comparison; metadata-only variation returns the original result/first receipt. Global event_id
  integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another
  lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested;
  no whole-record equality substitutes for the owner commitment.


  For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer''s bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.


  Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe''s recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe''s pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.


  The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253''s storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage''s enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.'
gui_related: false
gui_classification_reason: Owns event data and persistence contract.
depends_on:
- ACD-611
- SP-337
unblocks: []
acceptance_criteria:
- Exact family schema, identity, scope, receipt, replay, custody and withdrawal checks pass; membership remains
  absent.
- Review-round-2 acceptance rejects the independently mutated forbidden policy, body, retry, source and outcome
  cases applicable to this exact family; native evidence remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_dch_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_contract
reasoning_tier: high
context_scope: event_authority_dch
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- DL-045; WAVE2 DCH 2026-11-04
preserved_exact_tokens:
- bundle.selection_sent_to_chat
- SP-286
- SP-278
negative_constraints:
- No event admission or native execution proof; no retention choice.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-632 — chat.message

Newly authored closed payload contract for `chat.message` 1.0.0: `Plans/dch_event_payloads/chat_message.schema.json#/$defs/project` selects `pm.dch_event.chat_message.project.v1`; `Plans/dch_event_payloads/chat_message.schema.json#/$defs/application` selects `pm.dch_event.chat_message.application.v1`. The root and both payload editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `chat.message`, schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic run/node/attempt joins. For chat.message, freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple is ["chat.message", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly this family's original operation_id, frozen with the accepted source before any effect; no retry, timestamp, focus or result component is added. No additional optional effect component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic digest returns the original result and first receipt without a new effect; a different digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration; readers never rewrite original identities or payload bytes.

Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236 canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes, not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref, with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`. The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack. Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance, Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack bytes and index entry and verified readback before the referencing append can be acknowledged or its first receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed. Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants no new retention exemption.

This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc from this comparison; metadata-only variation returns the original result/first receipt. Global event_id integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested; no whole-record equality substitutes for the owner commitment.

For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer's bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.

Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe's recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe's pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.

The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253's storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage's enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.

```yaml
plan_unit_id: CV-632
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '### CV-632 — chat.message


  Newly authored closed payload contract for `chat.message` 1.0.0: `Plans/dch_event_payloads/chat_message.schema.json#/$defs/project`
  selects `pm.dch_event.chat_message.project.v1`; `Plans/dch_event_payloads/chat_message.schema.json#/$defs/application`
  selects `pm.dch_event.chat_message.application.v1`. The root and both payload editions are closed; application
  and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2
  scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id,
  null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority
  from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `chat.message`,
  schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor,
  body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic
  run/node/attempt joins. For chat.message, freeze operation_id from the original accepted operation before
  its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple is ["chat.message",
  "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8,
  event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage
  exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded
  exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:"
  + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id
  is exactly this family''s original operation_id, frozen with the accepted source before any effect; no retry,
  timestamp, focus or result component is added. No additional optional effect component is defined for this
  family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key).
  Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same
  operation and semantic digest returns the original result and first receipt without a new effect; a different
  digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application
  must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity
  with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable.
  Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed
  migration; readers never rewrite original identities or payload bytes.


  Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application
  payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236
  canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes,
  not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized
  inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored
  string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref,
  with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`.
  The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack.
  Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time
  join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance,
  Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack
  bytes and index entry and verified readback before the referencing append can be acknowledged or its first
  receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence
  refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed.
  Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants
  no new retention exemption.


  This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject
  projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its
  separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current
  append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field
  list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref
  in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc
  from this comparison; metadata-only variation returns the original result/first receipt. Global event_id
  integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another
  lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested;
  no whole-record equality substitutes for the owner commitment.


  For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer''s bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.


  Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe''s recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe''s pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.


  The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253''s storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage''s enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.'
gui_related: false
gui_classification_reason: Owns event data and persistence contract.
depends_on:
- ACD-612
- SP-337
unblocks: []
acceptance_criteria:
- Exact family schema, identity, scope, receipt, replay, custody and withdrawal checks pass; membership remains
  absent.
- Review-round-2 acceptance rejects the independently mutated forbidden policy, body, retry, source and outcome
  cases applicable to this exact family; native evidence remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_dch_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_contract
reasoning_tier: high
context_scope: event_authority_dch
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- DL-045; WAVE2 DCH 2026-11-04
preserved_exact_tokens:
- chat.message
- SP-286
- SP-278
negative_constraints:
- No event admission or native execution proof; no retention choice.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-634 — chat.thread_created

Newly authored closed payload contract for `chat.thread_created` 1.0.0: `Plans/dch_event_payloads/chat_thread_created.schema.json#/$defs/project` selects `pm.dch_event.chat_thread_created.project.v1`; `Plans/dch_event_payloads/chat_thread_created.schema.json#/$defs/application` selects `pm.dch_event.chat_thread_created.application.v1`. The root and both payload editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `chat.thread_created`, schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic run/node/attempt joins. For chat.thread_created, freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple is ["chat.thread_created", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly this family's original operation_id, frozen with the accepted source before any effect; no retry, timestamp, focus or result component is added. No additional optional effect component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic digest returns the original result and first receipt without a new effect; a different digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration; readers never rewrite original identities or payload bytes.

Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236 canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes, not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref, with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`. The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack. Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance, Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack bytes and index entry and verified readback before the referencing append can be acknowledged or its first receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed. Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants no new retention exemption.

This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc from this comparison; metadata-only variation returns the original result/first receipt. Global event_id integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested; no whole-record equality substitutes for the owner commitment.

For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer's bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.

Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe's recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe's pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.

The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253's storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage's enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.

```yaml
plan_unit_id: CV-634
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '### CV-634 — chat.thread_created


  Newly authored closed payload contract for `chat.thread_created` 1.0.0: `Plans/dch_event_payloads/chat_thread_created.schema.json#/$defs/project`
  selects `pm.dch_event.chat_thread_created.project.v1`; `Plans/dch_event_payloads/chat_thread_created.schema.json#/$defs/application`
  selects `pm.dch_event.chat_thread_created.application.v1`. The root and both payload editions are closed;
  application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2
  scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id,
  null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority
  from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `chat.thread_created`,
  schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor,
  body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic
  run/node/attempt joins. For chat.thread_created, freeze operation_id from the original accepted operation
  before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple
  is ["chat.thread_created", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use
  RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" +
  that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id));
  validate encoding and decoded exact Project identity before append or read. Application explicitly adopts
  CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)).
  Here owner_operation_id is exactly this family''s original operation_id, frozen with the accepted source
  before any effect; no retry, timestamp, focus or result component is added. No additional optional effect
  component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key).
  Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same
  operation and semantic digest returns the original result and first receipt without a new effect; a different
  digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application
  must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity
  with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable.
  Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed
  migration; readers never rewrite original identities or payload bytes.


  Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application
  payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236
  canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes,
  not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized
  inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored
  string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref,
  with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`.
  The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack.
  Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time
  join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance,
  Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack
  bytes and index entry and verified readback before the referencing append can be acknowledged or its first
  receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence
  refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed.
  Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants
  no new retention exemption.


  This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject
  projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its
  separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current
  append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field
  list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref
  in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc
  from this comparison; metadata-only variation returns the original result/first receipt. Global event_id
  integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another
  lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested;
  no whole-record equality substitutes for the owner commitment.


  For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer''s bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.


  Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe''s recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe''s pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.


  The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253''s storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage''s enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.'
gui_related: false
gui_classification_reason: Owns event data and persistence contract.
depends_on:
- ACD-614
- SP-337
unblocks: []
acceptance_criteria:
- Exact family schema, identity, scope, receipt, replay, custody and withdrawal checks pass; membership remains
  absent.
- Review-round-2 acceptance rejects the independently mutated forbidden policy, body, retry, source and outcome
  cases applicable to this exact family; native evidence remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_dch_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_contract
reasoning_tier: high
context_scope: event_authority_dch
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- DL-045; WAVE2 DCH 2026-11-04
preserved_exact_tokens:
- chat.thread_created
- SP-286
- SP-278
negative_constraints:
- No event admission or native execution proof; no retention choice.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-635 — chat.thread_deleted

Newly authored closed payload contract for `chat.thread_deleted` 1.0.0: `Plans/dch_event_payloads/chat_thread_deleted.schema.json#/$defs/project` selects `pm.dch_event.chat_thread_deleted.project.v1`; `Plans/dch_event_payloads/chat_thread_deleted.schema.json#/$defs/application` selects `pm.dch_event.chat_thread_deleted.application.v1`. The root and both payload editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `chat.thread_deleted`, schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic run/node/attempt joins. For chat.thread_deleted, freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple is ["chat.thread_deleted", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly this family's original operation_id, frozen with the accepted source before any effect; no retry, timestamp, focus or result component is added. No additional optional effect component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic digest returns the original result and first receipt without a new effect; a different digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration; readers never rewrite original identities or payload bytes.

Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236 canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes, not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref, with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`. The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack. Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance, Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack bytes and index entry and verified readback before the referencing append can be acknowledged or its first receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed. Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants no new retention exemption.

This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc from this comparison; metadata-only variation returns the original result/first receipt. Global event_id integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested; no whole-record equality substitutes for the owner commitment.

For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer's bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.

Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe's recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe's pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.

The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253's storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage's enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.

```yaml
plan_unit_id: CV-635
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '### CV-635 — chat.thread_deleted


  Newly authored closed payload contract for `chat.thread_deleted` 1.0.0: `Plans/dch_event_payloads/chat_thread_deleted.schema.json#/$defs/project`
  selects `pm.dch_event.chat_thread_deleted.project.v1`; `Plans/dch_event_payloads/chat_thread_deleted.schema.json#/$defs/application`
  selects `pm.dch_event.chat_thread_deleted.application.v1`. The root and both payload editions are closed;
  application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2
  scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id,
  null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority
  from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `chat.thread_deleted`,
  schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor,
  body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic
  run/node/attempt joins. For chat.thread_deleted, freeze operation_id from the original accepted operation
  before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple
  is ["chat.thread_deleted", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use
  RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" +
  that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id));
  validate encoding and decoded exact Project identity before append or read. Application explicitly adopts
  CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)).
  Here owner_operation_id is exactly this family''s original operation_id, frozen with the accepted source
  before any effect; no retry, timestamp, focus or result component is added. No additional optional effect
  component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key).
  Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same
  operation and semantic digest returns the original result and first receipt without a new effect; a different
  digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application
  must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity
  with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable.
  Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed
  migration; readers never rewrite original identities or payload bytes.


  Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application
  payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236
  canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes,
  not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized
  inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored
  string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref,
  with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`.
  The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack.
  Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time
  join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance,
  Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack
  bytes and index entry and verified readback before the referencing append can be acknowledged or its first
  receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence
  refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed.
  Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants
  no new retention exemption.


  This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject
  projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its
  separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current
  append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field
  list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref
  in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc
  from this comparison; metadata-only variation returns the original result/first receipt. Global event_id
  integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another
  lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested;
  no whole-record equality substitutes for the owner commitment.


  For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer''s bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.


  Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe''s recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe''s pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.


  The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253''s storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage''s enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.'
gui_related: false
gui_classification_reason: Owns event data and persistence contract.
depends_on:
- ACD-615
- SP-337
unblocks: []
acceptance_criteria:
- Exact family schema, identity, scope, receipt, replay, custody and withdrawal checks pass; membership remains
  absent.
- Review-round-2 acceptance rejects the independently mutated forbidden policy, body, retry, source and outcome
  cases applicable to this exact family; native evidence remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_dch_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_contract
reasoning_tier: high
context_scope: event_authority_dch
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- DL-045; WAVE2 DCH 2026-11-04
preserved_exact_tokens:
- chat.thread_deleted
- SP-286
- SP-278
negative_constraints:
- No event admission or native execution proof; no retention choice.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-636 — chat.thread_worktree_bound

Newly authored closed payload contract for `chat.thread_worktree_bound` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_bound.schema.json#/$defs/project` selects `pm.dch_event.chat_thread_worktree_bound.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_bound.schema.json#/$defs/application` selects `pm.dch_event.chat_thread_worktree_bound.application.v1`. The root and both payload editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `chat.thread_worktree_bound`, schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_bound, freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple is ["chat.thread_worktree_bound", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly this family's original operation_id, frozen with the accepted source before any effect; no retry, timestamp, focus or result component is added. No additional optional effect component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic digest returns the original result and first receipt without a new effect; a different digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration; readers never rewrite original identities or payload bytes.

Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236 canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes, not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref, with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`. The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack. Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance, Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack bytes and index entry and verified readback before the referencing append can be acknowledged or its first receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed. Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants no new retention exemption.

This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc from this comparison; metadata-only variation returns the original result/first receipt. Global event_id integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested; no whole-record equality substitutes for the owner commitment.

For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer's bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.

Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe's recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe's pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.

The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253's storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage's enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.

```yaml
plan_unit_id: CV-636
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '### CV-636 — chat.thread_worktree_bound


  Newly authored closed payload contract for `chat.thread_worktree_bound` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_bound.schema.json#/$defs/project`
  selects `pm.dch_event.chat_thread_worktree_bound.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_bound.schema.json#/$defs/application`
  selects `pm.dch_event.chat_thread_worktree_bound.application.v1`. The root and both payload editions are
  closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema.
  CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id
  equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual
  Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord
  event_type is `chat.thread_worktree_bound`, schema/version dispatch selects the exact edition; occurred_at_utc
  equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual
  original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_bound, freeze
  operation_id from the original accepted operation before its effect (fresh entropy for a new operation, retained
  across retries). The semantic identity tuple is ["chat.thread_worktree_bound", "1.0.0", storage_instance_id,
  scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" +
  SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition
  = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity
  before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase
  hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly
  this family''s original operation_id, frozen with the accepted source before any effect; no retry, timestamp,
  focus or result component is added. No additional optional effect component is defined for this family; distinct
  event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original
  Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic
  digest returns the original result and first receipt without a new effect; a different digest conflicts;
  missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the
  Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed
  semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier
  shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration;
  readers never rewrite original identities or payload bytes.


  Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application
  payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236
  canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes,
  not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized
  inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored
  string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref,
  with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`.
  The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack.
  Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time
  join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance,
  Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack
  bytes and index entry and verified readback before the referencing append can be acknowledged or its first
  receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence
  refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed.
  Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants
  no new retention exemption.


  This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject
  projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its
  separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current
  append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field
  list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref
  in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc
  from this comparison; metadata-only variation returns the original result/first receipt. Global event_id
  integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another
  lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested;
  no whole-record equality substitutes for the owner commitment.


  For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer''s bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.


  Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe''s recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe''s pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.


  The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253''s storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage''s enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.'
gui_related: false
gui_classification_reason: Owns event data and persistence contract.
depends_on:
- ACD-616
- SP-337
unblocks: []
acceptance_criteria:
- Exact family schema, identity, scope, receipt, replay, custody and withdrawal checks pass; membership remains
  absent.
- Review-round-2 acceptance rejects the independently mutated forbidden policy, body, retry, source and outcome
  cases applicable to this exact family; native evidence remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_dch_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_contract
reasoning_tier: high
context_scope: event_authority_dch
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- DL-045; WAVE2 DCH 2026-11-04
preserved_exact_tokens:
- chat.thread_worktree_bound
- SP-286
- SP-278
negative_constraints:
- No event admission or native execution proof; no retention choice.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-637 — chat.thread_worktree_create_failed

Newly authored closed payload contract for `chat.thread_worktree_create_failed` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_create_failed.schema.json#/$defs/project` selects `pm.dch_event.chat_thread_worktree_create_failed.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_create_failed.schema.json#/$defs/application` selects `pm.dch_event.chat_thread_worktree_create_failed.application.v1`. The root and both payload editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `chat.thread_worktree_create_failed`, schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_create_failed, freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple is ["chat.thread_worktree_create_failed", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly this family's original operation_id, frozen with the accepted source before any effect; no retry, timestamp, focus or result component is added. No additional optional effect component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic digest returns the original result and first receipt without a new effect; a different digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration; readers never rewrite original identities or payload bytes.

Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236 canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes, not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref, with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`. The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack. Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance, Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack bytes and index entry and verified readback before the referencing append can be acknowledged or its first receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed. Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants no new retention exemption.

This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc from this comparison; metadata-only variation returns the original result/first receipt. Global event_id integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested; no whole-record equality substitutes for the owner commitment.

For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer's bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.

Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe's recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe's pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.

The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253's storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage's enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.

```yaml
plan_unit_id: CV-637
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '### CV-637 — chat.thread_worktree_create_failed


  Newly authored closed payload contract for `chat.thread_worktree_create_failed` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_create_failed.schema.json#/$defs/project`
  selects `pm.dch_event.chat_thread_worktree_create_failed.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_create_failed.schema.json#/$defs/application`
  selects `pm.dch_event.chat_thread_worktree_create_failed.application.v1`. The root and both payload editions
  are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema.
  CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id
  equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual
  Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord
  event_type is `chat.thread_worktree_create_failed`, schema/version dispatch selects the exact edition; occurred_at_utc
  equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual
  original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_create_failed,
  freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation,
  retained across retries). The semantic identity tuple is ["chat.thread_worktree_create_failed", "1.0.0",
  storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id
  = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage
  exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded
  exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:"
  + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id
  is exactly this family''s original operation_id, frozen with the accepted source before any effect; no retry,
  timestamp, focus or result component is added. No additional optional effect component is defined for this
  family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key).
  Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same
  operation and semantic digest returns the original result and first receipt without a new effect; a different
  digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application
  must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity
  with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable.
  Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed
  migration; readers never rewrite original identities or payload bytes.


  Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application
  payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236
  canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes,
  not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized
  inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored
  string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref,
  with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`.
  The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack.
  Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time
  join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance,
  Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack
  bytes and index entry and verified readback before the referencing append can be acknowledged or its first
  receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence
  refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed.
  Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants
  no new retention exemption.


  This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject
  projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its
  separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current
  append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field
  list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref
  in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc
  from this comparison; metadata-only variation returns the original result/first receipt. Global event_id
  integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another
  lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested;
  no whole-record equality substitutes for the owner commitment.


  For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer''s bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.


  Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe''s recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe''s pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.


  The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253''s storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage''s enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.'
gui_related: false
gui_classification_reason: Owns event data and persistence contract.
depends_on:
- ACD-617
- SP-337
unblocks: []
acceptance_criteria:
- Exact family schema, identity, scope, receipt, replay, custody and withdrawal checks pass; membership remains
  absent.
- Review-round-2 acceptance rejects the independently mutated forbidden policy, body, retry, source and outcome
  cases applicable to this exact family; native evidence remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_dch_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_contract
reasoning_tier: high
context_scope: event_authority_dch
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- DL-045; WAVE2 DCH 2026-11-04
preserved_exact_tokens:
- chat.thread_worktree_create_failed
- SP-286
- SP-278
negative_constraints:
- No event admission or native execution proof; no retention choice.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-638 — chat.thread_worktree_merge_failed

Newly authored closed payload contract for `chat.thread_worktree_merge_failed` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_merge_failed.schema.json#/$defs/project` selects `pm.dch_event.chat_thread_worktree_merge_failed.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_merge_failed.schema.json#/$defs/application` selects `pm.dch_event.chat_thread_worktree_merge_failed.application.v1`. The root and both payload editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `chat.thread_worktree_merge_failed`, schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_merge_failed, freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple is ["chat.thread_worktree_merge_failed", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly this family's original operation_id, frozen with the accepted source before any effect; no retry, timestamp, focus or result component is added. No additional optional effect component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic digest returns the original result and first receipt without a new effect; a different digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration; readers never rewrite original identities or payload bytes.

Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236 canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes, not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref, with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`. The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack. Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance, Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack bytes and index entry and verified readback before the referencing append can be acknowledged or its first receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed. Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants no new retention exemption.

This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc from this comparison; metadata-only variation returns the original result/first receipt. Global event_id integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested; no whole-record equality substitutes for the owner commitment.

For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer's bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.

Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe's recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe's pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.

The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253's storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage's enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.

```yaml
plan_unit_id: CV-638
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '### CV-638 — chat.thread_worktree_merge_failed


  Newly authored closed payload contract for `chat.thread_worktree_merge_failed` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_merge_failed.schema.json#/$defs/project`
  selects `pm.dch_event.chat_thread_worktree_merge_failed.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_merge_failed.schema.json#/$defs/application`
  selects `pm.dch_event.chat_thread_worktree_merge_failed.application.v1`. The root and both payload editions
  are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema.
  CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id
  equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual
  Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord
  event_type is `chat.thread_worktree_merge_failed`, schema/version dispatch selects the exact edition; occurred_at_utc
  equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual
  original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_merge_failed,
  freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation,
  retained across retries). The semantic identity tuple is ["chat.thread_worktree_merge_failed", "1.0.0", storage_instance_id,
  scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" +
  SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition
  = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity
  before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase
  hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly
  this family''s original operation_id, frozen with the accepted source before any effect; no retry, timestamp,
  focus or result component is added. No additional optional effect component is defined for this family; distinct
  event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original
  Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic
  digest returns the original result and first receipt without a new effect; a different digest conflicts;
  missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the
  Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed
  semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier
  shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration;
  readers never rewrite original identities or payload bytes.


  Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application
  payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236
  canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes,
  not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized
  inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored
  string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref,
  with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`.
  The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack.
  Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time
  join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance,
  Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack
  bytes and index entry and verified readback before the referencing append can be acknowledged or its first
  receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence
  refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed.
  Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants
  no new retention exemption.


  This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject
  projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its
  separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current
  append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field
  list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref
  in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc
  from this comparison; metadata-only variation returns the original result/first receipt. Global event_id
  integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another
  lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested;
  no whole-record equality substitutes for the owner commitment.


  For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer''s bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.


  Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe''s recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe''s pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.


  The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253''s storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage''s enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.'
gui_related: false
gui_classification_reason: Owns event data and persistence contract.
depends_on:
- ACD-618
- SP-337
unblocks: []
acceptance_criteria:
- Exact family schema, identity, scope, receipt, replay, custody and withdrawal checks pass; membership remains
  absent.
- Review-round-2 acceptance rejects the independently mutated forbidden policy, body, retry, source and outcome
  cases applicable to this exact family; native evidence remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_dch_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_contract
reasoning_tier: high
context_scope: event_authority_dch
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- DL-045; WAVE2 DCH 2026-11-04
preserved_exact_tokens:
- chat.thread_worktree_merge_failed
- SP-286
- SP-278
negative_constraints:
- No event admission or native execution proof; no retention choice.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-639 — chat.thread_worktree_merged

Newly authored closed payload contract for `chat.thread_worktree_merged` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_merged.schema.json#/$defs/project` selects `pm.dch_event.chat_thread_worktree_merged.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_merged.schema.json#/$defs/application` selects `pm.dch_event.chat_thread_worktree_merged.application.v1`. The root and both payload editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `chat.thread_worktree_merged`, schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_merged, freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple is ["chat.thread_worktree_merged", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly this family's original operation_id, frozen with the accepted source before any effect; no retry, timestamp, focus or result component is added. No additional optional effect component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic digest returns the original result and first receipt without a new effect; a different digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration; readers never rewrite original identities or payload bytes.

Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236 canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes, not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref, with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`. The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack. Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance, Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack bytes and index entry and verified readback before the referencing append can be acknowledged or its first receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed. Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants no new retention exemption.

This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc from this comparison; metadata-only variation returns the original result/first receipt. Global event_id integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested; no whole-record equality substitutes for the owner commitment.

For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer's bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.

Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe's recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe's pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.

The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253's storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage's enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.

```yaml
plan_unit_id: CV-639
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '### CV-639 — chat.thread_worktree_merged


  Newly authored closed payload contract for `chat.thread_worktree_merged` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_merged.schema.json#/$defs/project`
  selects `pm.dch_event.chat_thread_worktree_merged.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_merged.schema.json#/$defs/application`
  selects `pm.dch_event.chat_thread_worktree_merged.application.v1`. The root and both payload editions are
  closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema.
  CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id
  equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual
  Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord
  event_type is `chat.thread_worktree_merged`, schema/version dispatch selects the exact edition; occurred_at_utc
  equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual
  original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_merged, freeze
  operation_id from the original accepted operation before its effect (fresh entropy for a new operation, retained
  across retries). The semantic identity tuple is ["chat.thread_worktree_merged", "1.0.0", storage_instance_id,
  scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" +
  SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition
  = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity
  before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase
  hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly
  this family''s original operation_id, frozen with the accepted source before any effect; no retry, timestamp,
  focus or result component is added. No additional optional effect component is defined for this family; distinct
  event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original
  Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic
  digest returns the original result and first receipt without a new effect; a different digest conflicts;
  missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the
  Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed
  semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier
  shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration;
  readers never rewrite original identities or payload bytes.


  Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application
  payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236
  canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes,
  not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized
  inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored
  string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref,
  with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`.
  The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack.
  Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time
  join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance,
  Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack
  bytes and index entry and verified readback before the referencing append can be acknowledged or its first
  receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence
  refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed.
  Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants
  no new retention exemption.


  This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject
  projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its
  separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current
  append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field
  list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref
  in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc
  from this comparison; metadata-only variation returns the original result/first receipt. Global event_id
  integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another
  lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested;
  no whole-record equality substitutes for the owner commitment.


  For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer''s bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.


  Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe''s recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe''s pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.


  The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253''s storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage''s enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.'
gui_related: false
gui_classification_reason: Owns event data and persistence contract.
depends_on:
- ACD-619
- SP-337
unblocks: []
acceptance_criteria:
- Exact family schema, identity, scope, receipt, replay, custody and withdrawal checks pass; membership remains
  absent.
- Review-round-2 acceptance rejects the independently mutated forbidden policy, body, retry, source and outcome
  cases applicable to this exact family; native evidence remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_dch_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_contract
reasoning_tier: high
context_scope: event_authority_dch
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- DL-045; WAVE2 DCH 2026-11-04
preserved_exact_tokens:
- chat.thread_worktree_merged
- SP-286
- SP-278
negative_constraints:
- No event admission or native execution proof; no retention choice.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-640 — chat.thread_worktree_pr_created

Newly authored closed payload contract for `chat.thread_worktree_pr_created` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_pr_created.schema.json#/$defs/project` selects `pm.dch_event.chat_thread_worktree_pr_created.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_pr_created.schema.json#/$defs/application` selects `pm.dch_event.chat_thread_worktree_pr_created.application.v1`. The root and both payload editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `chat.thread_worktree_pr_created`, schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_pr_created, freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple is ["chat.thread_worktree_pr_created", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly this family's original operation_id, frozen with the accepted source before any effect; no retry, timestamp, focus or result component is added. No additional optional effect component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic digest returns the original result and first receipt without a new effect; a different digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration; readers never rewrite original identities or payload bytes.

Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236 canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes, not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref, with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`. The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack. Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance, Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack bytes and index entry and verified readback before the referencing append can be acknowledged or its first receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed. Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants no new retention exemption.

This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc from this comparison; metadata-only variation returns the original result/first receipt. Global event_id integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested; no whole-record equality substitutes for the owner commitment.

For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer's bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.

Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe's recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe's pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.

The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253's storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage's enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.

```yaml
plan_unit_id: CV-640
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '### CV-640 — chat.thread_worktree_pr_created


  Newly authored closed payload contract for `chat.thread_worktree_pr_created` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_pr_created.schema.json#/$defs/project`
  selects `pm.dch_event.chat_thread_worktree_pr_created.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_pr_created.schema.json#/$defs/application`
  selects `pm.dch_event.chat_thread_worktree_pr_created.application.v1`. The root and both payload editions
  are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema.
  CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id
  equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual
  Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord
  event_type is `chat.thread_worktree_pr_created`, schema/version dispatch selects the exact edition; occurred_at_utc
  equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual
  original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_pr_created,
  freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation,
  retained across retries). The semantic identity tuple is ["chat.thread_worktree_pr_created", "1.0.0", storage_instance_id,
  scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" +
  SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition
  = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity
  before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase
  hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly
  this family''s original operation_id, frozen with the accepted source before any effect; no retry, timestamp,
  focus or result component is added. No additional optional effect component is defined for this family; distinct
  event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original
  Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic
  digest returns the original result and first receipt without a new effect; a different digest conflicts;
  missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the
  Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed
  semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier
  shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration;
  readers never rewrite original identities or payload bytes.


  Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application
  payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236
  canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes,
  not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized
  inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored
  string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref,
  with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`.
  The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack.
  Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time
  join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance,
  Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack
  bytes and index entry and verified readback before the referencing append can be acknowledged or its first
  receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence
  refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed.
  Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants
  no new retention exemption.


  This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject
  projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its
  separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current
  append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field
  list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref
  in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc
  from this comparison; metadata-only variation returns the original result/first receipt. Global event_id
  integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another
  lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested;
  no whole-record equality substitutes for the owner commitment.


  For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer''s bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.


  Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe''s recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe''s pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.


  The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253''s storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage''s enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.'
gui_related: false
gui_classification_reason: Owns event data and persistence contract.
depends_on:
- ACD-620
- SP-337
unblocks: []
acceptance_criteria:
- Exact family schema, identity, scope, receipt, replay, custody and withdrawal checks pass; membership remains
  absent.
- Review-round-2 acceptance rejects the independently mutated forbidden policy, body, retry, source and outcome
  cases applicable to this exact family; native evidence remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_dch_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_contract
reasoning_tier: high
context_scope: event_authority_dch
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- DL-045; WAVE2 DCH 2026-11-04
preserved_exact_tokens:
- chat.thread_worktree_pr_created
- SP-286
- SP-278
negative_constraints:
- No event admission or native execution proof; no retention choice.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-641 — chat.thread_worktree_pr_failed

Newly authored closed payload contract for `chat.thread_worktree_pr_failed` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_pr_failed.schema.json#/$defs/project` selects `pm.dch_event.chat_thread_worktree_pr_failed.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_pr_failed.schema.json#/$defs/application` selects `pm.dch_event.chat_thread_worktree_pr_failed.application.v1`. The root and both payload editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `chat.thread_worktree_pr_failed`, schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_pr_failed, freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple is ["chat.thread_worktree_pr_failed", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly this family's original operation_id, frozen with the accepted source before any effect; no retry, timestamp, focus or result component is added. No additional optional effect component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic digest returns the original result and first receipt without a new effect; a different digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration; readers never rewrite original identities or payload bytes.

Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236 canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes, not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref, with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`. The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack. Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance, Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack bytes and index entry and verified readback before the referencing append can be acknowledged or its first receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed. Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants no new retention exemption.

This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc from this comparison; metadata-only variation returns the original result/first receipt. Global event_id integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested; no whole-record equality substitutes for the owner commitment.

For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer's bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.

Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe's recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe's pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.

The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253's storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage's enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.

```yaml
plan_unit_id: CV-641
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '### CV-641 — chat.thread_worktree_pr_failed


  Newly authored closed payload contract for `chat.thread_worktree_pr_failed` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_pr_failed.schema.json#/$defs/project`
  selects `pm.dch_event.chat_thread_worktree_pr_failed.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_pr_failed.schema.json#/$defs/application`
  selects `pm.dch_event.chat_thread_worktree_pr_failed.application.v1`. The root and both payload editions
  are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema.
  CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id
  equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual
  Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord
  event_type is `chat.thread_worktree_pr_failed`, schema/version dispatch selects the exact edition; occurred_at_utc
  equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual
  original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_pr_failed,
  freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation,
  retained across retries). The semantic identity tuple is ["chat.thread_worktree_pr_failed", "1.0.0", storage_instance_id,
  scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" +
  SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition
  = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity
  before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase
  hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly
  this family''s original operation_id, frozen with the accepted source before any effect; no retry, timestamp,
  focus or result component is added. No additional optional effect component is defined for this family; distinct
  event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original
  Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic
  digest returns the original result and first receipt without a new effect; a different digest conflicts;
  missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the
  Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed
  semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier
  shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration;
  readers never rewrite original identities or payload bytes.


  Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application
  payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236
  canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes,
  not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized
  inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored
  string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref,
  with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`.
  The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack.
  Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time
  join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance,
  Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack
  bytes and index entry and verified readback before the referencing append can be acknowledged or its first
  receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence
  refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed.
  Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants
  no new retention exemption.


  This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject
  projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its
  separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current
  append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field
  list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref
  in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc
  from this comparison; metadata-only variation returns the original result/first receipt. Global event_id
  integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another
  lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested;
  no whole-record equality substitutes for the owner commitment.


  For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer''s bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.


  Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe''s recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe''s pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.


  The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253''s storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage''s enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.'
gui_related: false
gui_classification_reason: Owns event data and persistence contract.
depends_on:
- ACD-621
- SP-337
unblocks: []
acceptance_criteria:
- Exact family schema, identity, scope, receipt, replay, custody and withdrawal checks pass; membership remains
  absent.
- Review-round-2 acceptance rejects the independently mutated forbidden policy, body, retry, source and outcome
  cases applicable to this exact family; native evidence remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_dch_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_contract
reasoning_tier: high
context_scope: event_authority_dch
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- DL-045; WAVE2 DCH 2026-11-04
preserved_exact_tokens:
- chat.thread_worktree_pr_failed
- SP-286
- SP-278
negative_constraints:
- No event admission or native execution proof; no retention choice.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-642 — chat.thread_worktree_pre_merge_test_failed

Newly authored closed payload contract for `chat.thread_worktree_pre_merge_test_failed` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_pre_merge_test_failed.schema.json#/$defs/project` selects `pm.dch_event.chat_thread_worktree_pre_merge_test_failed.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_pre_merge_test_failed.schema.json#/$defs/application` selects `pm.dch_event.chat_thread_worktree_pre_merge_test_failed.application.v1`. The root and both payload editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `chat.thread_worktree_pre_merge_test_failed`, schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_pre_merge_test_failed, freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple is ["chat.thread_worktree_pre_merge_test_failed", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly this family's original operation_id, frozen with the accepted source before any effect; no retry, timestamp, focus or result component is added. No additional optional effect component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic digest returns the original result and first receipt without a new effect; a different digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration; readers never rewrite original identities or payload bytes.

Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236 canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes, not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref, with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`. The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack. Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance, Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack bytes and index entry and verified readback before the referencing append can be acknowledged or its first receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed. Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants no new retention exemption.

This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc from this comparison; metadata-only variation returns the original result/first receipt. Global event_id integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested; no whole-record equality substitutes for the owner commitment.

For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer's bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.

Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe's recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe's pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.

The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253's storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage's enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.

The terminal-to-started join first resolves the retained started EventRecord in its independently read actual Storage instance, validates its supported original envelope and Project/application payload edition, and verifies the exact original Storage commitment and current retention, authorization, deletion, hold and withdrawal facts. Resolve inline or verified SP-337 referenced bodies before comparing operation, scope, Computer, thread, worktree, command, strategy and actual outcome. Accept starts that were valid when written, including retained projector_replay_only compatibility history and a valid second Storage instance after live-state changes; a current-writer guard must never gate this historical original. Forged, withdrawn, foreign, unsupported or unavailable starts refuse. No caller-supplied started payload or fixture default supplies authority.

```yaml
plan_unit_id: CV-642
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '### CV-642 — chat.thread_worktree_pre_merge_test_failed


  Newly authored closed payload contract for `chat.thread_worktree_pre_merge_test_failed` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_pre_merge_test_failed.schema.json#/$defs/project`
  selects `pm.dch_event.chat_thread_worktree_pre_merge_test_failed.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_pre_merge_test_failed.schema.json#/$defs/application`
  selects `pm.dch_event.chat_thread_worktree_pre_merge_test_failed.application.v1`. The root and both payload
  editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old
  swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind;
  envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance.
  Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback.
  EventRecord event_type is `chat.thread_worktree_pre_merge_test_failed`, schema/version dispatch selects the
  exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337 below,
  and thread joins the actual original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_pre_merge_test_failed,
  freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation,
  retained across retries). The semantic identity tuple is ["chat.thread_worktree_pre_merge_test_failed", "1.0.0",
  storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id
  = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage
  exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded
  exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:"
  + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id
  is exactly this family''s original operation_id, frozen with the accepted source before any effect; no retry,
  timestamp, focus or result component is added. No additional optional effect component is defined for this
  family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key).
  Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same
  operation and semantic digest returns the original result and first receipt without a new effect; a different
  digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application
  must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity
  with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable.
  Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed
  migration; readers never rewrite original identities or payload bytes.


  Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application
  payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236
  canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes,
  not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized
  inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored
  string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref,
  with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`.
  The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack.
  Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time
  join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance,
  Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack
  bytes and index entry and verified readback before the referencing append can be acknowledged or its first
  receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence
  refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed.
  Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants
  no new retention exemption.


  This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject
  projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its
  separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current
  append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field
  list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref
  in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc
  from this comparison; metadata-only variation returns the original result/first receipt. Global event_id
  integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another
  lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested;
  no whole-record equality substitutes for the owner commitment.


  For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer''s bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.


  Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe''s recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe''s pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.


  The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253''s storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage''s enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.


  The terminal-to-started join first resolves the retained started EventRecord in its independently read actual Storage instance, validates its supported original envelope and Project/application payload edition, and verifies the exact original Storage commitment and current retention, authorization, deletion, hold and withdrawal facts. Resolve inline or verified SP-337 referenced bodies before comparing operation, scope, Computer, thread, worktree, command, strategy and actual outcome. Accept starts that were valid when written, including retained projector_replay_only compatibility history and a valid second Storage instance after live-state changes; a current-writer guard must never gate this historical original. Forged, withdrawn, foreign, unsupported or unavailable starts refuse. No caller-supplied started payload or fixture default supplies authority.'
gui_related: false
gui_classification_reason: Owns event data and persistence contract.
depends_on:
- ACD-622
- SP-337
unblocks: []
acceptance_criteria:
- Exact family schema, identity, scope, receipt, replay, custody and withdrawal checks pass; membership remains
  absent.
- Review-round-2 acceptance rejects the independently mutated forbidden policy, body, retry, source and outcome
  cases applicable to this exact family; native evidence remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_dch_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_contract
reasoning_tier: high
context_scope: event_authority_dch
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- DL-045; WAVE2 DCH 2026-11-04
preserved_exact_tokens:
- chat.thread_worktree_pre_merge_test_failed
- SP-286
- SP-278
negative_constraints:
- No event admission or native execution proof; no retention choice.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-643 — chat.thread_worktree_pre_merge_test_passed

Newly authored closed payload contract for `chat.thread_worktree_pre_merge_test_passed` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_pre_merge_test_passed.schema.json#/$defs/project` selects `pm.dch_event.chat_thread_worktree_pre_merge_test_passed.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_pre_merge_test_passed.schema.json#/$defs/application` selects `pm.dch_event.chat_thread_worktree_pre_merge_test_passed.application.v1`. The root and both payload editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `chat.thread_worktree_pre_merge_test_passed`, schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_pre_merge_test_passed, freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple is ["chat.thread_worktree_pre_merge_test_passed", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly this family's original operation_id, frozen with the accepted source before any effect; no retry, timestamp, focus or result component is added. No additional optional effect component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic digest returns the original result and first receipt without a new effect; a different digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration; readers never rewrite original identities or payload bytes.

Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236 canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes, not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref, with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`. The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack. Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance, Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack bytes and index entry and verified readback before the referencing append can be acknowledged or its first receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed. Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants no new retention exemption.

This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc from this comparison; metadata-only variation returns the original result/first receipt. Global event_id integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested; no whole-record equality substitutes for the owner commitment.

For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer's bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.

Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe's recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe's pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.

The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253's storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage's enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.

The terminal-to-started join first resolves the retained started EventRecord in its independently read actual Storage instance, validates its supported original envelope and Project/application payload edition, and verifies the exact original Storage commitment and current retention, authorization, deletion, hold and withdrawal facts. Resolve inline or verified SP-337 referenced bodies before comparing operation, scope, Computer, thread, worktree, command, strategy and actual outcome. Accept starts that were valid when written, including retained projector_replay_only compatibility history and a valid second Storage instance after live-state changes; a current-writer guard must never gate this historical original. Forged, withdrawn, foreign, unsupported or unavailable starts refuse. No caller-supplied started payload or fixture default supplies authority.

```yaml
plan_unit_id: CV-643
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '### CV-643 — chat.thread_worktree_pre_merge_test_passed


  Newly authored closed payload contract for `chat.thread_worktree_pre_merge_test_passed` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_pre_merge_test_passed.schema.json#/$defs/project`
  selects `pm.dch_event.chat_thread_worktree_pre_merge_test_passed.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_pre_merge_test_passed.schema.json#/$defs/application`
  selects `pm.dch_event.chat_thread_worktree_pre_merge_test_passed.application.v1`. The root and both payload
  editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old
  swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind;
  envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance.
  Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback.
  EventRecord event_type is `chat.thread_worktree_pre_merge_test_passed`, schema/version dispatch selects the
  exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337 below,
  and thread joins the actual original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_pre_merge_test_passed,
  freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation,
  retained across retries). The semantic identity tuple is ["chat.thread_worktree_pre_merge_test_passed", "1.0.0",
  storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id
  = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage
  exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded
  exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:"
  + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id
  is exactly this family''s original operation_id, frozen with the accepted source before any effect; no retry,
  timestamp, focus or result component is added. No additional optional effect component is defined for this
  family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key).
  Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same
  operation and semantic digest returns the original result and first receipt without a new effect; a different
  digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application
  must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity
  with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable.
  Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed
  migration; readers never rewrite original identities or payload bytes.


  Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application
  payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236
  canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes,
  not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized
  inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored
  string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref,
  with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`.
  The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack.
  Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time
  join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance,
  Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack
  bytes and index entry and verified readback before the referencing append can be acknowledged or its first
  receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence
  refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed.
  Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants
  no new retention exemption.


  This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject
  projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its
  separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current
  append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field
  list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref
  in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc
  from this comparison; metadata-only variation returns the original result/first receipt. Global event_id
  integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another
  lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested;
  no whole-record equality substitutes for the owner commitment.


  For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer''s bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.


  Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe''s recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe''s pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.


  The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253''s storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage''s enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.


  The terminal-to-started join first resolves the retained started EventRecord in its independently read actual Storage instance, validates its supported original envelope and Project/application payload edition, and verifies the exact original Storage commitment and current retention, authorization, deletion, hold and withdrawal facts. Resolve inline or verified SP-337 referenced bodies before comparing operation, scope, Computer, thread, worktree, command, strategy and actual outcome. Accept starts that were valid when written, including retained projector_replay_only compatibility history and a valid second Storage instance after live-state changes; a current-writer guard must never gate this historical original. Forged, withdrawn, foreign, unsupported or unavailable starts refuse. No caller-supplied started payload or fixture default supplies authority.'
gui_related: false
gui_classification_reason: Owns event data and persistence contract.
depends_on:
- ACD-623
- SP-337
unblocks: []
acceptance_criteria:
- Exact family schema, identity, scope, receipt, replay, custody and withdrawal checks pass; membership remains
  absent.
- Review-round-2 acceptance rejects the independently mutated forbidden policy, body, retry, source and outcome
  cases applicable to this exact family; native evidence remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_dch_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_contract
reasoning_tier: high
context_scope: event_authority_dch
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- DL-045; WAVE2 DCH 2026-11-04
preserved_exact_tokens:
- chat.thread_worktree_pre_merge_test_passed
- SP-286
- SP-278
negative_constraints:
- No event admission or native execution proof; no retention choice.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-644 — chat.thread_worktree_pre_merge_test_started

Newly authored closed payload contract for `chat.thread_worktree_pre_merge_test_started` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_pre_merge_test_started.schema.json#/$defs/project` selects `pm.dch_event.chat_thread_worktree_pre_merge_test_started.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_pre_merge_test_started.schema.json#/$defs/application` selects `pm.dch_event.chat_thread_worktree_pre_merge_test_started.application.v1`. The root and both payload editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `chat.thread_worktree_pre_merge_test_started`, schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_pre_merge_test_started, freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple is ["chat.thread_worktree_pre_merge_test_started", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly this family's original operation_id, frozen with the accepted source before any effect; no retry, timestamp, focus or result component is added. No additional optional effect component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic digest returns the original result and first receipt without a new effect; a different digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration; readers never rewrite original identities or payload bytes.

Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236 canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes, not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref, with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`. The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack. Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance, Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack bytes and index entry and verified readback before the referencing append can be acknowledged or its first receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed. Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants no new retention exemption.

This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc from this comparison; metadata-only variation returns the original result/first receipt. Global event_id integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested; no whole-record equality substitutes for the owner commitment.

For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer's bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.

Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe's recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe's pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.

The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253's storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage's enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.

The terminal-to-started join first resolves the retained started EventRecord in its independently read actual Storage instance, validates its supported original envelope and Project/application payload edition, and verifies the exact original Storage commitment and current retention, authorization, deletion, hold and withdrawal facts. Resolve inline or verified SP-337 referenced bodies before comparing operation, scope, Computer, thread, worktree, command, strategy and actual outcome. Accept starts that were valid when written, including retained projector_replay_only compatibility history and a valid second Storage instance after live-state changes; a current-writer guard must never gate this historical original. Forged, withdrawn, foreign, unsupported or unavailable starts refuse. No caller-supplied started payload or fixture default supplies authority.

```yaml
plan_unit_id: CV-644
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '### CV-644 — chat.thread_worktree_pre_merge_test_started


  Newly authored closed payload contract for `chat.thread_worktree_pre_merge_test_started` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_pre_merge_test_started.schema.json#/$defs/project`
  selects `pm.dch_event.chat_thread_worktree_pre_merge_test_started.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_pre_merge_test_started.schema.json#/$defs/application`
  selects `pm.dch_event.chat_thread_worktree_pre_merge_test_started.application.v1`. The root and both payload
  editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old
  swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind;
  envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance.
  Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback.
  EventRecord event_type is `chat.thread_worktree_pre_merge_test_started`, schema/version dispatch selects
  the exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337
  below, and thread joins the actual original source/committed record. No synthetic run/node/attempt joins.
  For chat.thread_worktree_pre_merge_test_started, freeze operation_id from the original accepted operation
  before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple
  is ["chat.thread_worktree_pre_merge_test_started", "1.0.0", storage_instance_id, scope, computer_id, thread_id,
  operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key
  = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id));
  validate encoding and decoded exact Project identity before append or read. Application explicitly adopts
  CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)).
  Here owner_operation_id is exactly this family''s original operation_id, frozen with the accepted source
  before any effect; no retry, timestamp, focus or result component is added. No additional optional effect
  component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key).
  Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same
  operation and semantic digest returns the original result and first receipt without a new effect; a different
  digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application
  must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity
  with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable.
  Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed
  migration; readers never rewrite original identities or payload bytes.


  Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application
  payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236
  canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes,
  not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized
  inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored
  string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref,
  with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`.
  The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack.
  Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time
  join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance,
  Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack
  bytes and index entry and verified readback before the referencing append can be acknowledged or its first
  receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence
  refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed.
  Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants
  no new retention exemption.


  This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject
  projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its
  separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current
  append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field
  list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref
  in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc
  from this comparison; metadata-only variation returns the original result/first receipt. Global event_id
  integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another
  lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested;
  no whole-record equality substitutes for the owner commitment.


  For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer''s bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.


  Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe''s recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe''s pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.


  The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253''s storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage''s enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.


  The terminal-to-started join first resolves the retained started EventRecord in its independently read actual Storage instance, validates its supported original envelope and Project/application payload edition, and verifies the exact original Storage commitment and current retention, authorization, deletion, hold and withdrawal facts. Resolve inline or verified SP-337 referenced bodies before comparing operation, scope, Computer, thread, worktree, command, strategy and actual outcome. Accept starts that were valid when written, including retained projector_replay_only compatibility history and a valid second Storage instance after live-state changes; a current-writer guard must never gate this historical original. Forged, withdrawn, foreign, unsupported or unavailable starts refuse. No caller-supplied started payload or fixture default supplies authority.'
gui_related: false
gui_classification_reason: Owns event data and persistence contract.
depends_on:
- ACD-624
- SP-337
unblocks: []
acceptance_criteria:
- Exact family schema, identity, scope, receipt, replay, custody and withdrawal checks pass; membership remains
  absent.
- Review-round-2 acceptance rejects the independently mutated forbidden policy, body, retry, source and outcome
  cases applicable to this exact family; native evidence remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_dch_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_contract
reasoning_tier: high
context_scope: event_authority_dch
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- DL-045; WAVE2 DCH 2026-11-04
preserved_exact_tokens:
- chat.thread_worktree_pre_merge_test_started
- SP-286
- SP-278
negative_constraints:
- No event admission or native execution proof; no retention choice.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-645 — chat.thread_worktree_renamed

Newly authored closed payload contract for `chat.thread_worktree_renamed` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_renamed.schema.json#/$defs/project` selects `pm.dch_event.chat_thread_worktree_renamed.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_renamed.schema.json#/$defs/application` selects `pm.dch_event.chat_thread_worktree_renamed.application.v1`. The root and both payload editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `chat.thread_worktree_renamed`, schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_renamed, freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple is ["chat.thread_worktree_renamed", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly this family's original operation_id, frozen with the accepted source before any effect; no retry, timestamp, focus or result component is added. No additional optional effect component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic digest returns the original result and first receipt without a new effect; a different digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration; readers never rewrite original identities or payload bytes.

Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236 canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes, not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref, with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`. The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack. Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance, Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack bytes and index entry and verified readback before the referencing append can be acknowledged or its first receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed. Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants no new retention exemption.

This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc from this comparison; metadata-only variation returns the original result/first receipt. Global event_id integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested; no whole-record equality substitutes for the owner commitment.

For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer's bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.

Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe's recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe's pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.

The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253's storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage's enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.

```yaml
plan_unit_id: CV-645
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '### CV-645 — chat.thread_worktree_renamed


  Newly authored closed payload contract for `chat.thread_worktree_renamed` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_renamed.schema.json#/$defs/project`
  selects `pm.dch_event.chat_thread_worktree_renamed.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_renamed.schema.json#/$defs/application`
  selects `pm.dch_event.chat_thread_worktree_renamed.application.v1`. The root and both payload editions are
  closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema.
  CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id
  equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual
  Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord
  event_type is `chat.thread_worktree_renamed`, schema/version dispatch selects the exact edition; occurred_at_utc
  equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual
  original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_renamed,
  freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation,
  retained across retries). The semantic identity tuple is ["chat.thread_worktree_renamed", "1.0.0", storage_instance_id,
  scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" +
  SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition
  = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity
  before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase
  hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly
  this family''s original operation_id, frozen with the accepted source before any effect; no retry, timestamp,
  focus or result component is added. No additional optional effect component is defined for this family; distinct
  event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original
  Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic
  digest returns the original result and first receipt without a new effect; a different digest conflicts;
  missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the
  Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed
  semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier
  shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration;
  readers never rewrite original identities or payload bytes.


  Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application
  payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236
  canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes,
  not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized
  inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored
  string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref,
  with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`.
  The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack.
  Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time
  join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance,
  Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack
  bytes and index entry and verified readback before the referencing append can be acknowledged or its first
  receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence
  refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed.
  Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants
  no new retention exemption.


  This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject
  projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its
  separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current
  append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field
  list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref
  in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc
  from this comparison; metadata-only variation returns the original result/first receipt. Global event_id
  integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another
  lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested;
  no whole-record equality substitutes for the owner commitment.


  For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer''s bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.


  Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe''s recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe''s pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.


  The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253''s storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage''s enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.'
gui_related: false
gui_classification_reason: Owns event data and persistence contract.
depends_on:
- ACD-625
- SP-337
unblocks: []
acceptance_criteria:
- Exact family schema, identity, scope, receipt, replay, custody and withdrawal checks pass; membership remains
  absent.
- Review-round-2 acceptance rejects the independently mutated forbidden policy, body, retry, source and outcome
  cases applicable to this exact family; native evidence remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_dch_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_contract
reasoning_tier: high
context_scope: event_authority_dch
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- DL-045; WAVE2 DCH 2026-11-04
preserved_exact_tokens:
- chat.thread_worktree_renamed
- SP-286
- SP-278
negative_constraints:
- No event admission or native execution proof; no retention choice.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-646 — chat.thread_worktree_unbound

Newly authored closed payload contract for `chat.thread_worktree_unbound` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_unbound.schema.json#/$defs/project` selects `pm.dch_event.chat_thread_worktree_unbound.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_unbound.schema.json#/$defs/application` selects `pm.dch_event.chat_thread_worktree_unbound.application.v1`. The root and both payload editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `chat.thread_worktree_unbound`, schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_unbound, freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple is ["chat.thread_worktree_unbound", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly this family's original operation_id, frozen with the accepted source before any effect; no retry, timestamp, focus or result component is added. No additional optional effect component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic digest returns the original result and first receipt without a new effect; a different digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration; readers never rewrite original identities or payload bytes.

Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236 canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes, not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref, with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`. The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack. Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance, Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack bytes and index entry and verified readback before the referencing append can be acknowledged or its first receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed. Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants no new retention exemption.

This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc from this comparison; metadata-only variation returns the original result/first receipt. Global event_id integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested; no whole-record equality substitutes for the owner commitment.

For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer's bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.

Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe's recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe's pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.

The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253's storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage's enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.

```yaml
plan_unit_id: CV-646
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '### CV-646 — chat.thread_worktree_unbound


  Newly authored closed payload contract for `chat.thread_worktree_unbound` 1.0.0: `Plans/dch_event_payloads/chat_thread_worktree_unbound.schema.json#/$defs/project`
  selects `pm.dch_event.chat_thread_worktree_unbound.project.v1`; `Plans/dch_event_payloads/chat_thread_worktree_unbound.schema.json#/$defs/application`
  selects `pm.dch_event.chat_thread_worktree_unbound.application.v1`. The root and both payload editions are
  closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema.
  CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id
  equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual
  Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord
  event_type is `chat.thread_worktree_unbound`, schema/version dispatch selects the exact edition; occurred_at_utc
  equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual
  original source/committed record. No synthetic run/node/attempt joins. For chat.thread_worktree_unbound,
  freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation,
  retained across retries). The semantic identity tuple is ["chat.thread_worktree_unbound", "1.0.0", storage_instance_id,
  scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" +
  SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition
  = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity
  before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase
  hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly
  this family''s original operation_id, frozen with the accepted source before any effect; no retry, timestamp,
  focus or result component is added. No additional optional effect component is defined for this family; distinct
  event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original
  Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic
  digest returns the original result and first receipt without a new effect; a different digest conflicts;
  missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the
  Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed
  semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier
  shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration;
  readers never rewrite original identities or payload bytes.


  Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application
  payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236
  canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes,
  not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized
  inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored
  string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref,
  with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`.
  The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack.
  Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time
  join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance,
  Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack
  bytes and index entry and verified readback before the referencing append can be acknowledged or its first
  receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence
  refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed.
  Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants
  no new retention exemption.


  This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject
  projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its
  separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current
  append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field
  list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref
  in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc
  from this comparison; metadata-only variation returns the original result/first receipt. Global event_id
  integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another
  lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested;
  no whole-record equality substitutes for the owner commitment.


  For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer''s bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.


  Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe''s recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe''s pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.


  The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253''s storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage''s enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.'
gui_related: false
gui_classification_reason: Owns event data and persistence contract.
depends_on:
- ACD-626
- SP-337
unblocks: []
acceptance_criteria:
- Exact family schema, identity, scope, receipt, replay, custody and withdrawal checks pass; membership remains
  absent.
- Review-round-2 acceptance rejects the independently mutated forbidden policy, body, retry, source and outcome
  cases applicable to this exact family; native evidence remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_dch_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_contract
reasoning_tier: high
context_scope: event_authority_dch
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- DL-045; WAVE2 DCH 2026-11-04
preserved_exact_tokens:
- chat.thread_worktree_unbound
- SP-286
- SP-278
negative_constraints:
- No event admission or native execution proof; no retention choice.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-633 — chat.thread_archived

Newly authored closed payload contract for `chat.thread_archived` 1.0.0: `Plans/dch_event_payloads/chat_thread_archived.schema.json#/$defs/project` selects `pm.dch_event.chat_thread_archived.project.v1`; `Plans/dch_event_payloads/chat_thread_archived.schema.json#/$defs/application` selects `pm.dch_event.chat_thread_archived.application.v1`. The root and both payload editions are closed; application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2 scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id, null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `chat.thread_archived`, schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor, body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic run/node/attempt joins. For chat.thread_archived, freeze operation_id from the original accepted operation before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple is ["chat.thread_archived", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" + that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id)); validate encoding and decoded exact Project identity before append or read. Application explicitly adopts CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)). Here owner_operation_id is exactly this family's original operation_id, frozen with the accepted source before any effect; no retry, timestamp, focus or result component is added. No additional optional effect component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key). Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same operation and semantic digest returns the original result and first receipt without a new effect; a different digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable. Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed migration; readers never rewrite original identities or payload bytes.

Archive payload additionally requires previous_state (active or suspended), state=archived, archive_origin=manual, command_id=cmd.chat.archive, expected_thread_revision and committed_thread_revision. The latter is exactly predecessor+1 and joins the canonical archived thread readback; thread_record_ref identifies that original record. A payload claim is not proof of authorization or commit: the owner must revalidate the actual catalog guards and original before/after source. Automatic origin, other predecessor state, active run, stale revision, changed target and missing readback refuse before append.

Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236 canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes, not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref, with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`. The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack. Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance, Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack bytes and index entry and verified readback before the referencing append can be acknowledged or its first receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed. Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants no new retention exemption.

This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc from this comparison; metadata-only variation returns the original result/first receipt. Global event_id integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested; no whole-record equality substitutes for the owner commitment.

For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer's bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.

Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe's recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe's pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.

The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253's storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage's enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.

```yaml
plan_unit_id: CV-633
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '### CV-633 — chat.thread_archived


  Newly authored closed payload contract for `chat.thread_archived` 1.0.0: `Plans/dch_event_payloads/chat_thread_archived.schema.json#/$defs/project`
  selects `pm.dch_event.chat_thread_archived.project.v1`; `Plans/dch_event_payloads/chat_thread_archived.schema.json#/$defs/application`
  selects `pm.dch_event.chat_thread_archived.application.v1`. The root and both payload editions are closed;
  application and Project are separate schema IDs, never a nullable rewrite of the old swept schema. CV-366/WorkflowScopeV2
  scope joins apply: envelope scope_kind equals payload scope.scope_kind; envelope project_id equals scope.project_id,
  null only for application, with exact Server and storage instance. Freeze actual Computer/thread/root authority
  from original input, never focus, Settings, HOME or main fallback. EventRecord event_type is `chat.thread_archived`,
  schema/version dispatch selects the exact edition; occurred_at_utc equals ts, actor_ref equals original actor,
  body transport under SP-337 below, and thread joins the actual original source/committed record. No synthetic
  run/node/attempt joins. For chat.thread_archived, freeze operation_id from the original accepted operation
  before its effect (fresh entropy for a new operation, retained across retries). The semantic identity tuple
  is ["chat.thread_archived", "1.0.0", storage_instance_id, scope, computer_id, thread_id, operation_id]; use
  RFC 8785 canonical JSON UTF-8, event_id = "evt_dch_" + SHA-256(tuple). Project idempotency_key = "dch:" +
  that same hex digest, with CV-365/Storage exact scope_partition = "project~" + unpadded base64url(UTF-8(project_id));
  validate encoding and decoded exact Project identity before append or read. Application explicitly adopts
  CV-366: idempotency_key = "application@1:" + lowercase hex(UTF-8(scope.server_id)) + ":" + lowercase hex(UTF-8(operation_id)).
  Here owner_operation_id is exactly this family''s original operation_id, frozen with the accepted source
  before any effect; no retry, timestamp, focus or result component is added. No additional optional effect
  component is defined for this family; distinct event types retain separate Storage lifetime tuples (scope_partition,event_type,idempotency_key).
  Exact original Server/Computer/thread/source joins remain mandatory, including on same-key retries. Same
  operation and semantic digest returns the original result and first receipt without a new effect; a different
  digest conflicts; missing authoritative dedupe yields dedupe_unavailable with zero new effect. Application
  must never use the Project dch: recipe. Capture original payload and EventRecord semantic digest; same identity
  with changed semantics is a conflict, never an overwrite. Unknown version or scope is quarantined/unavailable.
  Earlier shape-only schemas remain unadopted. A payload change requires a new version/edition and governed
  migration; readers never rewrite original identities or payload bytes.


  Archive payload additionally requires previous_state (active or suspended), state=archived, archive_origin=manual,
  command_id=cmd.chat.archive, expected_thread_revision and committed_thread_revision. The latter is exactly
  predecessor+1 and joins the canonical archived thread readback; thread_record_ref identifies that original
  record. A payload claim is not proof of authorization or commit: the owner must revalidate the actual catalog
  guards and original before/after source. Automatic origin, other predecessor state, active run, stale revision,
  changed target and missing readback refuse before append.


  Adopt SP-337 for this exact event body. The logical body remains the selected closed Project/application
  payload edition, with its existing string and array bounds unchanged and the integer domain specified below. Encode that complete body as SP-236
  canonical MessagePack (recursive exact UTF-8 map-key order and shortest encodings); measure encoded bytes,
  not JSON characters or the envelope. At most 16384 bytes may be inline with payload_ref=null. An oversized
  inline body is refused before append. Larger or separately governed bodies use payload={} and the newly authored
  string binding `payload:v1:{lowercase_blake3_64}:{decimal_byte_size}:application/msgpack` in EventRecord.payload_ref,
  with canonical unsigned decimal size, selecting the existing payload-pack index key `payload:v1:{lowercase_blake3_64}`.
  The reference commits to the BLAKE3 of the exact complete encoded body, exact byte size and media type application/msgpack.
  Resolve and decode that original body, validate its exact schema/edition and every scope/identity/actor/time
  join as for inline bodies; a reference is never an empty semantic body. Require actual original Storage instance,
  Server/scope/Computer/thread custody, current authorization/deletion/hold access checks, durable exact pack
  bytes and index entry and verified readback before the referencing append can be acknowledged or its first
  receipt/result published. Missing, changed, unauthorized, deleted, wrong-store or unreadable body/index evidence
  refuses publication; no base64 body, truncated body, alternate-source reconstruction or rerun is allowed.
  Pack durability, reference counts, holds, backups and deletion deadlines remain SP-337; this binding grants
  no new retention exemption.


  This family selects current replay_policy=dedupe_by_idempotency_key for ordinary writes and retries. Reject
  projector_replay_only as replay_only_not_appendable before dedupe, even if both retry records use it; its
  separate compatibility-reader behavior remains the EventRecord owner rule and never authorizes a current
  append. Compute producer_semantic_digest using only the exact caller-supplied EventRecord semantic field
  list in the EventRecord owner clause, with its RFC 8785/SHA-256 recipe, including payload and payload_ref
  in their original transport form. Exclude only the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc
  from this comparison; metadata-only variation returns the original result/first receipt. Global event_id
  integrity is a separate mandatory check: same scoped key with a changed event_id, or same event_id with another
  lifetime identity or semantic body, conflicts. Every included semantic field is independently mutation-tested;
  no whole-record equality substitutes for the owner commitment.


  For new writes and current identity/idempotency inputs, this family selects strict-v4 exact integer types with the owner-declared domain of each field. Storage sequence_id and its last_sequence_id copies, frontier_revision, selected_segment_generation, manifest_generation, recovery_epoch and pack byte_size retain exact uint64 values 0 through 18446744073709551615; no 2^53 ceiling applies to Storage metadata. Publication revision and logical payload integers retain their existing owner minima and maxima, with no invented DCH safe-integer cap. Declared integer slots reject runtime float/string/bool/null/array/object substitutes except explicitly nullable slots. Storage metadata is excluded from the producer-semantic projection as already specified. The producer route is the CV-1100 qualified RFC 8785 encoding of the unchanged CV-317 producer projection (shared producer_semantic_bytes/producer_semantic_digest); an unsupported exact producer input is a structured route refusal, without narrowing its logical owner domain, rounding or stringification. Physical bytes follow SP-236 through the shared SP-1100 codec (storage_value_bytes, EVENT_VALUE profile): float type, minimal exact float width and signed zero are preserved, so a lexical alias never shares an integer''s bytes, and the exact integer slots refuse every alias; invalid JSON 01 refuses under the CV-1100 current parser. Retained-recipe dispatch composes the shared SP-1101 RetainedDispatcher and timestamps use the shared CV-1101 check, as the retained-original and format paragraphs state. Test Storage write/retry inputs at 2^53, 2^60 and uint64 maximum, and refuse overflow, negative and wrong-type metadata independently.


  Retained and compatibility originals use the schema, numeric domain, runtime type policy, format validator and physical encoder in force when written. The single selector record_number_rule() owns this dispatch on passive history, SP-337 materialization/reference verification, full-index source/checkpoint validation, checkpoint physical storage, saved-original retry comparison and terminal retained-start lookup. New/current inputs select strict-v4. For retained sources, independently read protected Storage write-receipt provenance binds actual storage_instance_id, exact original source-value SHA-256 and recipe_id; it is committed with the original write and survives restore with that source. Candidate fields, caller version/recipe flags, mutable live state and payload content cannot select or enroll an earlier recipe. Verify any claim against that independently authenticated provenance, then verify the exact original bytes with the selected recipe. Missing earlier provenance is unavailable under that earlier recipe, never a guessed downgrade: an original of a Store outside the sealed write custody refuses as unavailable and a receipt naming a recipe with no installed frozen verifier refuses as unsupported, with no fallback to another recipe; within a custody Store an original without a legacy receipt was written by the current strict-v4 writer. Each retained read composes the shared SP-1101 RetainedDispatcher once: one owner selection, no caller override and no current-then-legacy probing, and the installed frozen verifier of that exact recipe tuple (pinned to the recipe''s recorded original schema hashes) checks the original. Preserve raw-v1 (d36809af original MessagePack numeric types), normalized-v2 (a785466d normalized integral floats with the original uncapped integer domain), and strict-v3 (c21fa62e safe integers; its original checker skipped date-time and URI formats); Plans/dch_retained_recipes.json pins their exact original schemas and source revisions. A skipped format check never authenticates invalid history (CV-1101, SP-1101): frozen validators apply the shared date-time predicate and CV-253 to the recipe''s pinned original resources, so a retained timestamp CV-1101 refuses is owner-invalid and refuses, while owner-valid lowercase, leap-second and long-fraction history stays readable with its exact spelling; the skipped URI check is preserved. Never re-encode raw-v1 bytes under a later normalization to verify their commitment. Plans/dch_write_recipe_receipts.json is an independent synthetic Storage receipt adapter, not native authentication evidence. Every earlier-valid retained numeric or format record stays readable with current authorization, deletion/hold access, withdrawal and actual-source identity checks. A forged source or recipe selection still refuses. Current derived checkpoints may copy an old event sequence into their exact new integer representation; the original retained event/index sequence and commitment remain unchanged. A retry verifies its saved original through the same historical schema/byte/custody reader before comparison; its incoming input stays strict-v4, and a replay-only compatibility original still cannot authorize a current append or retry. Different earlier semantic values conflict without sending an out-of-current-domain original through the current RFC 8785 encoder. A retained checkpoint, including its history and physical payload pack, uses its own original write provenance separately from its referenced event.


  The strict-v4 format validators are mandatory and installed explicitly, never through optional jsonschema plugins. Timestamps adopt the shared CV-1101 check: every current and frozen DCH validator is pm_event_datetime.datetime_validator over the complete outer schema, so the registered RFC 3339 predicate runs through the validator. occurred_at_utc keeps the EventRecord profile (T or t, Z/z or a signed offset, any fraction length, year 0000 and legitimate offset-adjusted leap seconds); observed_at_utc and persisted_at_utc keep CV-253''s storage_utc_z profile through the inventory-classified envelope; the family ts and populated checkpoint retired_at_utc take the same predicate with their unchanged owner-schema terminal uppercase-Z pattern. A missing zone, space or wrong separator, invalid calendar field, hour 24, minute 60, false leap second, empty fraction and trailing LF refuse. Timestamp strings are never rewritten and are compared only as exact strings; no DCH-local timestamp grammar remains. PR URLs where declared fully match RFC 3986 HTTPS syntax, including valid percent escapes, reg-name or bracketed IPv6/IPvFuture host, numeric port and path/query/fragment grammar. Malformed brackets/hosts/escapes and whitespace refuse. No PR-host allowlist or new provider behavior is introduced. UUID contexts keep Storage''s enforced descriptor. Both payload editions, all three EventRecord timestamps and populated checkpoint retirement times have isolated format negatives; applicable PR payloads cover every malformed URL form.'
gui_related: false
gui_classification_reason: Owns event data and persistence contract.
depends_on:
- ACD-613
- SP-337
unblocks: []
acceptance_criteria:
- Exact family schema, identity, scope, receipt, replay, custody and withdrawal checks pass; membership remains
  absent.
- Review-round-2 acceptance rejects the independently mutated forbidden policy, body, retry, source and outcome
  cases applicable to this exact family; native evidence remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_dch_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_contract
reasoning_tier: high
context_scope: event_authority_dch
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- DL-045; WAVE2 DCH 2026-11-04
- Review round 1 F3; DL-280/DL-287 current premise verified 2026-11-04
preserved_exact_tokens:
- chat.thread_archived
- SP-286
- SP-278
negative_constraints:
- No event admission or native execution proof; no retention choice.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-647 — chat.response_stop_requested — closed payload and replay

Newly authored payload contract for chat.response_stop_requested 1.0.0 under DL-045/DL-406/DL-427. Plans/dch_stop_request.schema.json selects closed Project pm.dch_stop.request.project.v1 and application pm.dch_stop.request.application.v1 editions, version 1.0.0. Required fields are exactly schema_id, schema_version, thread_id, operation_id, actor_ref, ts, computer_id, scope, assistant_turn_id, stop_reason_code and target_work. WorkflowScopeV2 and existing Chat thread/non-secret-reference and Storage-instance descriptors are reused; target_work item fields are exactly kind, work_ref and lease_ref. The original accepted cmd.chat.stop source fixes the actual reply and complete target list. References contain no credentials, instructions, transcript bodies, raw output or newly copied evidence. The Stop reason is a code, never arbitrary diagnostic text. Unknown fields/editions, forged targets and cross-scope sources refuse. run_id, node_id and attempt_id in this request's EventRecord are null: an optional command run selector resolves to the actual assistant turn and does not invent a Goal join. EventRecord event_type equals this exact family, payload_schema_id selects the exact edition, scope_kind/project_id/thread_id/actor_ref/occurred_at_utc join the original body (ts is request occurrence time), and global event_id and scoped key recompute by ACD-627 against the independently read actual Storage instance.

Current writes and incoming retries select dedupe_by_idempotency_key; projector_replay_only refuses as replay_only_not_appendable before dedupe, including when both retry inputs claim it. Retained compatibility-reader records may use that historical policy and never authorize current append. The producer-semantic commitment adopts the EventRecord owner's exact 21 caller-supplied fields and RFC 8785/SHA-256 recipe, excluding only Storage-assigned sequence_id, observed_at_utc and persisted_at_utc; those are verified from independently read original Storage bytes on reads, never trusted from payload. Metadata-only incoming retry variation returns original evidence; every included semantic field and independent global-ID check remains mandatory. No serializer, number cap or timestamp grammar is added here. Adopt SP-236's owner domains and physical recipe; unsupported producer RFC 8785 inputs are unavailable without rounding, retyping or narrowing Storage uint64. Mandatory format validation uses pm_dch_formats.validator: the shared CV-1101 datetime_validator for the declared date-time descriptors (EventRecord and CV-253 profiles; the Stop ts and outcome_at_utc keep their terminal-Z owner pattern) and Storage's enforced UUID descriptor; malformed and trailing-LF inputs refuse. The Stop contract has one current edition, so SP-1101 retained dispatch selects no earlier recipe for it.

Adopt SP-337 explicitly for this exact body: at most 16384 encoded SP-236 bytes inline with payload_ref null; above that, or separately governed content, payload is {} and payload_ref is payload:v1:{lowercase_blake3_64}:{canonical_unsigned_decimal_byte_size}:application/msgpack. Resolve the existing payload:v1:{lowercase_blake3_64} index in the actual same Storage instance. Recompute BLAKE3, exact byte count and media type from complete original bytes, verify scope/Computer/thread and current authorization/deletion/hold access, durable pack/index and exact readback before acknowledgement or publication. Measure every stored part including the pointer; no truncation, base64 substitute or unverified inline exception. Logical target-work counts remain those of the actual reply, with no new lane cap. Replay reads original evidence only, never resends cancellation or reruns work. Original versions remain byte-exact; a later schema/physical recipe is separately versioned and authenticated by original write provenance, never selected by a caller's downgrade flag. Unsupported or missing original provenance is unavailable. Writer withdrawal cuts this exact family off before new operations, fences its readers/affected index publication, keeps supported historical lookup under current custody, and requires a separately versioned fresh SP-278 rebuild before successor publication; no reminting, in-place rewriting or source-log deletion.

```yaml
plan_unit_id: CV-647
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '### CV-647 — chat.response_stop_requested — closed payload and replay


  Newly authored payload contract for chat.response_stop_requested 1.0.0 under DL-045/DL-406/DL-427. Plans/dch_stop_request.schema.json
  selects closed Project pm.dch_stop.request.project.v1 and application pm.dch_stop.request.application.v1 editions,
  version 1.0.0. Required fields are exactly schema_id, schema_version, thread_id, operation_id, actor_ref, ts,
  computer_id, scope, assistant_turn_id, stop_reason_code and target_work. WorkflowScopeV2 and existing Chat thread/non-secret-reference
  and Storage-instance descriptors are reused; target_work item fields are exactly kind, work_ref and lease_ref.
  The original accepted cmd.chat.stop source fixes the actual reply and complete target list. References contain
  no credentials, instructions, transcript bodies, raw output or newly copied evidence. The Stop reason is a code,
  never arbitrary diagnostic text. Unknown fields/editions, forged targets and cross-scope sources refuse. run_id,
  node_id and attempt_id in this request''s EventRecord are null: an optional command run selector resolves to the
  actual assistant turn and does not invent a Goal join. EventRecord event_type equals this exact family, payload_schema_id
  selects the exact edition, scope_kind/project_id/thread_id/actor_ref/occurred_at_utc join the original body (ts
  is request occurrence time), and global event_id and scoped key recompute by ACD-627 against the independently
  read actual Storage instance.


  Current writes and incoming retries select dedupe_by_idempotency_key; projector_replay_only refuses as replay_only_not_appendable
  before dedupe, including when both retry inputs claim it. Retained compatibility-reader records may use that historical
  policy and never authorize current append. The producer-semantic commitment adopts the EventRecord owner''s exact
  21 caller-supplied fields and RFC 8785/SHA-256 recipe, excluding only Storage-assigned sequence_id, observed_at_utc
  and persisted_at_utc; those are verified from independently read original Storage bytes on reads, never trusted
  from payload. Metadata-only incoming retry variation returns original evidence; every included semantic field
  and independent global-ID check remains mandatory. No serializer, number cap or timestamp grammar is added here.
  Adopt SP-236''s owner domains and physical recipe; unsupported producer RFC 8785 inputs are unavailable without
  rounding, retyping or narrowing Storage uint64. Mandatory format validation uses pm_dch_formats.validator: the
  shared CV-1101 datetime_validator for the declared date-time descriptors (EventRecord and CV-253 profiles; the Stop
  ts and outcome_at_utc keep their terminal-Z owner pattern) and Storage''s enforced UUID descriptor; malformed and
  trailing-LF inputs refuse. The Stop contract has one current edition, so SP-1101 retained dispatch selects no
  earlier recipe for it.


  Adopt SP-337 explicitly for this exact body: at most 16384 encoded SP-236 bytes inline with payload_ref null;
  above that, or separately governed content, payload is {} and payload_ref is payload:v1:{lowercase_blake3_64}:{canonical_unsigned_decimal_byte_size}:application/msgpack.
  Resolve the existing payload:v1:{lowercase_blake3_64} index in the actual same Storage instance. Recompute BLAKE3,
  exact byte count and media type from complete original bytes, verify scope/Computer/thread and current authorization/deletion/hold
  access, durable pack/index and exact readback before acknowledgement or publication. Measure every stored part
  including the pointer; no truncation, base64 substitute or unverified inline exception. Logical target-work counts
  remain those of the actual reply, with no new lane cap. Replay reads original evidence only, never resends cancellation
  or reruns work. Original versions remain byte-exact; a later schema/physical recipe is separately versioned and
  authenticated by original write provenance, never selected by a caller''s downgrade flag. Unsupported or missing
  original provenance is unavailable. Writer withdrawal cuts this exact family off before new operations, fences
  its readers/affected index publication, keeps supported historical lookup under current custody, and requires
  a separately versioned fresh SP-278 rebuild before successor publication; no reminting, in-place rewriting or
  source-log deletion.'
gui_related: false
gui_classification_reason: Persistence, contract or verification of the existing Stop behavior.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- The exact Stop request, saved outcome, custody, queue barriers and conditional retirements follow DL-406/DL-427;
  unresolved retention and native verification remain explicit.
validation_surfaces:
- python3 scripts/pm_dch_stop.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_contract
reasoning_tier: high
context_scope: event_authority_dch_stop
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- DL-406 on origin/plans/ea-cards1-answers-20261104
- DL-427 on origin/plans/ea-cards2-answers-20261105; E-CARDS-2 item 3.a option A
preserved_exact_tokens:
- chat.response_stop_requested
- DL-406
- DL-427
negative_constraints:
- No event admission, Decision Log entry or native durability claim.
- No new retention policy or automatic queue release.
owner_hints:
- Plans/Contracts_V0.md
```
