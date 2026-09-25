# Shard 020: Canonical Runtime Event, Outcome, and Action Contract Canonical Alignment (2026-03-09)

Source: `Plans/Contracts_V0.md`

Source lines: L2912-L3202

Source SHA256: `24349309dfdaa4bc51f03a479a4c42bdc839b9f078e8805186f9a865ea5c2a09`

---

## Canonical Runtime Event, Outcome, and Action Contract Canonical Alignment (2026-03-09)


The canonical runtime event contract extends to child runs, crew coordination, and effective-context shaping. These contracts are part of the same runtime event and action family as parent execution. They are not an optional overlay and they do not define a separate event grammar.

### Child-run lifecycle and projection

PM child runs are canonical runtime entities with stable identity, lineage, and lifecycle. Command-launched subtasks, orchestrated child runs, delegated plan-mode research, and crew members all project into this same model. Disposable-by-default child lifecycle is the default product posture; long-lived or reopened child identity is the exception path.

This contract consumes the Persona definitions in `Plans/Personas.md` at `### 1.2 Subagent` and `### 5.1 Selection`, and it projects child lifecycle through `### 8.0 Event payloads (seglog)` rather than local status text. `Plans/CLI_Bridged_Providers.md` (`/CLI_Bridged_Providers.md` in legacy path references) is a provider-facade consumer of this child-run + Persona-storage contract, not a separate child-run ontology.

Canonical child lifecycle states are: `queued`, `running`, `awaiting_parent`, `blocked`, `complete`, `failed`, `cancelled`. `superseded` remains a terminal reason used when replacement occurred, even if the user-facing terminal state is still presented as `cancelled` or `complete` in some consumers.
ContractRef: Canonical child lifecycle states MUST be preserved across runtime storage, event projection, chat projection, and recovery, and consumers MUST NOT invent incompatible parallel enums. [Source: Tools.md#event-model; storage-plan.md#canonical-child-run-records-and-batch-structure]

Canonical child-run records preserve identity `/lineage`, role `/routing`, lifecycle state, attempt/resume state, effective capabilities `/runtime`, context `/handoff`, grouping structure, and result `/history` references. Chat `/storage/orchestration` projections consume those canonical events and MUST NOT invent child-only shadow state machines.

Child-to-parent signals are canonical runtime events, not ad hoc UI messages. At minimum the contract family includes: `progress`, `result`, `blocked`, `clarification_needed`, `context_expansion_requested`, `user_input_requested`, `failed`, `cancelled`. Parent orchestration may summarize, consolidate, or route these signals, but canonical event identity must remain intact.
ContractRef: Child-to-parent escalation and progress signals MUST remain canonical runtime events even when parent chat or crew UI projects them into higher-level summaries. [Source: Tools.md#event-model; assistant-chat-design.md#14-subagents--crew]

The child event-model covers `/start/progress/work/thought/pause/block/outcome/retry/reroute/resume/grouping/context-shrinking` transitions as normalized runtime events, not as consumer-local prose states.

Legacy user-facing signal labels may render as `clarification-needed`, `context-expansion-needed`, and `user-input-requested`, but they map back to canonical child-to-parent runtime events rather than ad hoc message strings.

Chat-facing projection events may normalize child lifecycle into UI-specific projection envelopes, but they MUST preserve the underlying canonical child identity fields. Required fields remain `child_run_id`, `parent_run_id`, `thread_id`, timestamp, attempt identity when relevant, and requested/effective persona/runtime descriptors when the event semantics depend on them.
ContractRef: ContractName: child_projection_identity. Any projection event that feeds chat, cards, groups, or batch summaries MUST preserve canonical child identity fields and MUST NOT demote child runs into anonymous status text. [Source: storage-plan.md#canonical-child-run-records-and-batch-structure; assistant-chat-design.md#14-subagents--crew]

Child lineage must not be over-summarizes into generic status text. Runtime events, chat projections, batch summaries, and crew views may compress display copy, but they must preserve the canonical child lineage fields above and remain reversible to the event payload.
Child session header and `/sidebar` projections may show token `/context` and cost details, but those displays are projections over canonical child-run records and usage events rather than independent child state.

### Retry, reroute, replacement, and resume


`retry`, `reroute`, `replacement`, and `resume` are distinct runtime concepts and must remain distinct in contracts, storage, and event history.

- `resume`: continue the same paused or interrupted child without semantically resetting the task.
- `retry`: a new attempt in the same child lineage after failure, blockage, or interruption.
- `reroute`: same logical child task, different effective runtime surface or capability path.
- `replacement`: a new child because the old role, task shape, or specialization was wrong.

ContractRef: Runtime and storage contracts MUST preserve the semantic distinction between resume, retry, reroute, and replacement; projections MAY summarize them but MUST NOT collapse them into one generic retry/restart bucket. [Source: Tools.md#retry-reroute-replacement-and-cancel; storage-plan.md#canonical-child-run-records-and-batch-structure]

Cancelled and superseded children are terminal by default. Resumption is primarily for in-flight interrupted or waiting children, not for re-opening completed disposable helpers. Crew mode may justify narrower persistence or re-entry behavior, but only as an explicit mode-level exception.
ContractRef: Disposable-by-default child lifecycle is canonical; resume/reopen behavior MUST be treated as an exception path, not the baseline continuity model. [Source: assistant-memory-subsystem.md#capability-boundary-assistant-only; assistant-chat-design.md#15-plan-mode--crew-mode]

### Crew-board coordination contracts

`Plans/orchestrator-subagent-integration.md` consumers must retire older crew `/message-board` and `active-agent` side-file patterns into this child-run contract. A side-file may project from canonical child-run records, but it must not stand beside them as a competing source of runtime truth.


Crew coordination uses an explicit crew board. Child-to-child communication in crew mode occurs through board messages or other explicit crew-scoped coordination records, not hidden direct peer channels. Crew board messages are task-scoped, attributable, timestamped, and persisted as part of shared crew coordination state.
ContractRef: Crew-board coordination MUST remain attributable, inspectable, and task-scoped; hidden direct peer messaging is not a canonical runtime channel. [Source: assistant-chat-design.md#14-subagents--crew; storage-plan.md#canonical-child-run-records-and-batch-structure]

Crew members do not gain new authority through board traffic. Permissions, tools, skills, plugins, MCP access, and provider restrictions remain subject to the same requested/effective capability rules as any other child run.
ContractRef: Crew coordination messages MUST NOT widen authority, permissions, or capability availability beyond the child's effective runtime envelope. [Source: Permissions_System.md#child-permission-ceiling-and-blocked-vs-awaiting-parent; Skills_System.md#child-capability-subset-clarification]

#### Stable subagent and crew event families


In addition to the effective-context projection events defined below (`subagent.context_shrunk` and `subagent.context_rehydrated`), the following stable runtime event families are canonical for subagent and crew orchestration. Child identity and lineage are not optional metadata: they are part of the event contract. A row that over-summarizes child lineage into generic status text is non-compliant with this contract.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md

For every `subagent.*` event below, the payload MUST preserve the PM lineage envelope:
- `run_id`
- `thread_id`
- `agent_id`
- `parent_run_id?`
- `child_run_id?`
- `parent_thread_id?`
- requested and effective runtime descriptors when they differ

The same lineage envelope applies to `subagent.spawn_requested` and `subagent.spawn_completed` when a dispatcher distinguishes request lifecycle from child-run creation and terminal completion. These names remain under `subagent.*`; `chat.subagent_*` and `chat.subagent_spawned` are legacy source aliases only.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md

| event_type | payload_fields | description |
|---|---|---|
| `subagent.spawned` | `run_id`, `thread_id`, `agent_id`, `agent_type`, `parent_run_id`, `child_run_id`, `parent_thread_id`, `model_id` | New subagent created and linked to parent lineage. |
| `subagent.started` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `prompt_preview` | Subagent begins execution. |
| `subagent.progress` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `progress_pct?`, `status_text` | Progress update. |
| `subagent.tool_called` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `tool_name`, `tool_args_preview` | Subagent invoked a tool. |
| `subagent.tool_completed` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `tool_name`, `success`, `duration_ms` | Tool call finished. |
| `subagent.message_sent` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `message_preview`, `turn_index` | Follow-up message sent. |
| `subagent.message_received` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `response_preview`, `turn_index` | Response received. |
| `subagent.completed` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `result_summary`, `duration_ms`, `token_usage` | Subagent finished successfully. |
| `subagent.failed` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `error_code`, `error_message`, `duration_ms` | Subagent failed. |
| `subagent.cancelled` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `reason`, `duration_ms` | Subagent was cancelled. |
| `subagent.timeout` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `timeout_ms`, `partial_result?` | Subagent exceeded time limit. |
| `subagent.retried` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `attempt_number`, `retry_reason` | Subagent retry attempt. |
| `subagent.context_warning` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `context_usage_pct`, `threshold` | Context approaching limit. |
| `subagent.model_switched` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `from_model`, `to_model`, `reason` | Model changed mid-execution. |
| `subagent.paused` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `reason` | Subagent paused. |
| `subagent.resumed` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `trigger` | Subagent resumed. |
| `subagent.output_truncated` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `original_length`, `truncated_length` | Output was truncated. |
| `subagent.budget_warning` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `budget_used_pct`, `budget_limit` | Approaching budget limit. |
| `subagent.escalated` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `escalation_reason`, `target` | Subagent escalated to parent. |

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md

#### Stable active-agent coordination event families

Active-agent coordination uses the canonical `EventRecord` envelope (`schema_id = pm.event.v0`) plus the coordination payload schemas registered by storage. These events feed redb coordination projections; side files such as `active-agents.json`, `agent-messages.json`, and `.puppet-master/state/*.json` are compatibility/debug/export mirrors only and do not stand beside the EventRecord/projection model as runtime truth.

For every `coordination.*` event below, the payload MUST preserve the PM lineage envelope:
- `project_id`
- `run_id`
- `thread_id?`
- `agent_id`
- `agent_type?`
- `parent_run_id?`
- `child_run_id?`
- `node_id?`
- `lane_id?`
- `worktree_id?`
- `platform`
- `agent_revision?`
- `expected_previous_revision?`
- `last_applied_event_id?`
- `idempotency_key`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/orchestrator-subagent-integration.md, SchemaID:pm.event.v0

| event_type | payload_fields | description |
|---|---|---|
| `coordination.agent_registered` | `project_id`, `run_id`, `thread_id?`, `agent_id`, `agent_type`, `parent_run_id?`, `child_run_id?`, `node_id?`, `lane_id?`, `worktree_id?`, `platform`, `model_id?`, `started_at_utc`, `agent_revision`, `idempotency_key` | Agent registration before execution. |
| `coordination.agent_status_updated` | lineage envelope, `status`, `status_reason?`, `observed_at_utc`, `agent_revision`, `expected_previous_revision?` | Agent lifecycle/status update. |
| `coordination.agent_operation_updated` | lineage envelope, `operation_id`, `operation_summary`, `progress_pct?`, `operation_refs[]?`, `observed_at_utc` | Current operation and progress update. |
| `coordination.agent_file_ownership_updated` | lineage envelope, `path_ref`, `path_hash`, `claim_kind`, `claim_confidence`, `operation_id?`, `observed_at_utc` | File-activity claim for coordination warnings; not a FileSafe lock or exclusive lease. |
| `coordination.agent_unregistered` | lineage envelope, `terminal_status`, `finished_at_utc`, `result_ref?` | Normal terminal unregister/completion. |
| `coordination.agent_crashed` | lineage envelope, `crash_reason`, `detected_at_utc`, `heartbeat_age_ms?`, `process_ref?`, `worktree_ref?` | Crash, heartbeat-expiry, process-loss, or worktree-loss resolution. |
| `coordination.agent_aborted` | lineage envelope, `abort_reason`, `aborted_by_ref`, `aborted_at_utc` | Parent/user/runtime abort resolution. |
| `coordination.debug_mirror_exported` | `project_id`, `mirror_path`, `mirror_kind`, `source_checkpoint`, `source_sequence_id`, `export_status`, `exported_at_utc`, `error_code?`, `quarantine_ref?` | Optional debug/export mirror write or recovery result. |

The closed form of these rows is `Plans/coordination_event_payloads.schema.json`, one closed definition per row with a shared lineage envelope; the rows remain the payload minima. The binding is "Closed coordination payload schema (DL-045, 2026-09-25)" below (CV-353), a newly authored owner contract under DL-045. These rows and that schema govern over the Orchestrator sketch structs.

Coordination consumers use `coordination_agent_projection.v1:{project_id}:{agent_id}`, `coordination_file_projection.v1:{project_id}:{path_hash}:{agent_id}`, `coordination_operation_projection.v1:{project_id}:{agent_id}:{operation_id}`, `coordination_snapshot_projection.v1:{project_id}:{projection_scope}`, and `projector.checkpoint.coordination:{project_id}` for authority. Scheduling, execution admission, conflict prevention, prompt injection, unregister, crash, abort, receipt, and validation decisions MUST NOT read `.puppet-master/state/*.json` mirrors as authority.

ContractRef: ContractName:Plans/storage-plan.md#Coordination-record-projection-and-mirror-export-families, ContractName:Plans/orchestrator-subagent-integration.md#Canonical-active-agent-coordination-records-and-projections

For every `crew.*` event below, the payload MUST preserve crew and child lineage together:
- `run_id`
- `thread_id`
- `crew_id`
- `parent_run_id?`
- `child_run_id?`
- `member_agent_ids[]` where membership matters

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/orchestrator-subagent-integration.md

| event_type | payload_fields | description |
|---|---|---|
| `crew.formed` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `member_agent_ids[]`, `purpose` | Crew created. |
| `crew.member_added` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `agent_id`, `role` | Member joined. |
| `crew.member_removed` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `agent_id`, `reason` | Member left. |
| `crew.coordination` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `coordination_type`, `details` | Inter-agent coordination. |
| `crew.board_message_posted` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `message_id`, `from_agent_id`, `to_agent_id?`, `to_agent_type?`, `subject`, `priority` | Attributable crew-board message posted. |
| `crew.board_message_read` | `run_id`, `thread_id`, `crew_id`, `message_id`, `agent_id`, `read_at_utc` | Crew-board message read receipt. |
| `crew.board_messages_archived` | `run_id`, `thread_id`, `crew_id`, `archived_before_utc`, `message_ids[]?`, `archive_reason` | Crew-board messages archived by retention policy. |
| `crew.completed` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `result_summary`, `duration_ms` | Crew finished. |
| `crew.disbanded` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `reason` | Crew dissolved. |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md

<a id="closed-coordination-payload-schema-dl-045-2026-09-25"></a>
#### Closed coordination payload schema (DL-045, 2026-09-25)

This is a **newly authored owner contract under DL-045** for the seven agent families of the coordination table under "Stable active-agent coordination event families". It is backed by the per-family search `reports/event-authority-20260911/step-09-coordination-binding-search-20260925.md`, which found the rows and no payload schema. The rows stay the payload minima. Their closed form is `Plans/coordination_event_payloads.schema.json`, schema ID `https://puppetmaster.local/schemas/coordination_event_payloads/1.0.0/coordination_event_payloads.schema.json`. The semantic owner of the seven is OSI-438 in `Plans/orchestrator-subagent-integration.md`; Storage persistence, identity and transitions are SP-320 in `Plans/storage-plan.md`. Nothing here admits a family: each stays quarantined before append or projection until its own Storage admission landing.

The schema's `$defs`:

| `$defs` entry | Schema ID, used as the registry row's `payload_schema_id` | Row |
|---|---|---|
| `lineage_envelope` | shared part, never a payload by itself | the lineage envelope list under "Stable active-agent coordination event families" |
| `non_secret_ref` | shared reference form | none |
| `agent_registered` | `pm.coordination_event.agent_registered.schema.v1` | `coordination.agent_registered` |
| `agent_status_updated` | `pm.coordination_event.agent_status_updated.schema.v1` | `coordination.agent_status_updated` |
| `agent_operation_updated` | `pm.coordination_event.agent_operation_updated.schema.v1` | `coordination.agent_operation_updated` |
| `agent_file_ownership_updated` | `pm.coordination_event.agent_file_ownership_updated.schema.v1` | `coordination.agent_file_ownership_updated` |
| `agent_unregistered` | `pm.coordination_event.agent_unregistered.schema.v1` | `coordination.agent_unregistered` |
| `agent_crashed` | `pm.coordination_event.agent_crashed.schema.v1` | `coordination.agent_crashed` |
| `agent_aborted` | `pm.coordination_event.agent_aborted.schema.v1` | `coordination.agent_aborted` |
| `debug_mirror_exported` | `pm.coordination_event.debug_mirror_exported.schema.v1`, prepared and not admitted, outside this batch | `coordination.debug_mirror_exported` |

Each family definition is a closed object (`additionalProperties: false`). The seven agent definitions include the lineage envelope and add their row's fields. The rules:

1. **`schema_version`.** Every coordination payload carries a required `schema_version` string, `1.0.0` for these definitions, as the `run.started` payload does and as the Storage registry family `coordination_event_records` already requires. It versions the payload, not the EventRecord envelope, whose own `schema_version` stays `2.0.0`. A later payload change needs a new definition and version, and readers reject an unsupported one. Apart from `schema_version`, no row gains a field.
2. **Lineage envelope.** `project_id`, `run_id`, `agent_id`, `platform`, `idempotency_key` and `schema_version` are required. `thread_id`, `agent_type`, `parent_run_id`, `child_run_id`, `node_id`, `lane_id`, `worktree_id`, `expected_previous_revision` and `last_applied_event_id` are optional. For the seven agent families `agent_revision` is required too, an integer of at least 1, because SP-320's idempotency key contains it. `coordination.agent_registered` also requires `agent_type`, as its row does.
3. **No nulls.** An optional field without a value is omitted; `null` is never used. Each value then has one encoding, so a retry reproduces the same producer semantic digest.
4. **Revisions.** `coordination.agent_registered` has `agent_revision` 1 and carries neither `expected_previous_revision` nor `last_applied_event_id`. Every later event of the same agent has an `agent_revision` one higher than the agent's previous event. `expected_previous_revision`, when present, equals `agent_revision` minus 1. `last_applied_event_id`, when present, is the event ID of that previous event. SP-320 checks both.
5. **Bounds.** IDs, `agent_type` and `model_id` are nonempty strings of at most 256 characters. `status_reason` is plain text of at most 256 characters, and `operation_summary` of at most 512. Neither carries prompt text, model output, file content, diffs, tool arguments or secrets. `progress_pct` is an integer from 0 to 100. `operation_refs` holds at most 16 distinct references. Timestamps are RFC 3339 UTC strings ending in `Z`. `heartbeat_age_ms` is a non-negative integer. `path_ref` is a normalized project-relative path of at most 1,024 characters and `path_hash` is 64 lowercase hex digits, both as SP-320 defines them.
6. **References.** `non_secret_ref` has the form `kind:value`. The kind is lowercase letters, digits and underscores, starting with a letter. The whole reference has at most 256 characters and no whitespace. It names an object; it grants no access and holds no credential, account identifier, local absolute path or content. `operation_refs`, `result_ref`, `process_ref`, `worktree_ref` and `aborted_by_ref` use it. `aborted_by_ref` has kind `run` and the parent run ID when `abort_reason` is `parent`, and then `parent_run_id` is present and equal. It has kind `actor` and the command's actor reference when the reason is `user`, and kind `component` and the runtime component ID when it is `runtime`.
7. **Closed domains.** `platform`, `status`, `terminal_status`, `claim_kind`, `claim_confidence`, `crash_reason` and `abort_reason` take exactly the values OSI-438 lists. `status` never takes a terminal value.
8. **EventRecord joins.** A coordination EventRecord has `scope_kind` `project` and the payload's `project_id` and `run_id`. Its `thread_id` and `node_id` equal the payload's, or are null when the payload omits them; `attempt_id` is null. Its `event_type` names the family and its `payload_schema_id` is the family's schema ID. Its `idempotency_key` equals the payload's. `payload_ref` is null, `redaction_profile` is `no_secrets` and `replay_policy` is `dedupe_by_idempotency_key`. `event_id` and `idempotency_key` follow SP-320's recipe. `occurred_at_utc` equals the payload's family timestamp: `started_at_utc`, `observed_at_utc`, `finished_at_utc`, `detected_at_utc` or `aborted_at_utc`. The payload's `observed_at_utc` is the time the producer observed the change. The envelope's `observed_at_utc` stays Storage's writer-observed time. `actor_ref` names the component that initiated the event through `AgentCoordinator`: the Orchestrator or scheduler path for registration, updates and unregistration, the scheduler or crash detector for a crash, and the resolving component for an abort.
9. **Precedence.** These rows and the closed schema govern over the Orchestrator sketch structs: `RegisterAgent`, `AgentStatusUpdate`, `AgentOperationUpdate`, `AgentFileOwnershipUpdate`, `AgentTerminalUpdate`, `FileActivityClaim` and the projection JSON example. Those sketches are source lineage, and OSI-438 maps their fields.
10. **The debug mirror row.** `debug_mirror_exported` is prepared from its row, with `schema_version`, so that Storage's record family covers every key shape. It stays not admitted, and gets no identity recipe or producer binding here.

##### CV-353 - Closed Coordination Payload Schema Binding

```yaml
plan_unit_id: CV-353
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Newly authored owner contract under DL-045. The closed payload form of the seven coordination agent families is
  Plans/coordination_event_payloads.schema.json, with a shared lineage_envelope and non_secret_ref and one closed
  definition per family, each with its own schema ID pm.coordination_event.<family>.schema.v1;
  debug_mirror_exported is prepared there and not admitted. Every coordination payload carries a required
  schema_version, 1.0.0 here, as the run.started payload does. project_id, run_id, agent_id, platform,
  idempotency_key and agent_revision are required, and optional fields are omitted rather than null. Revision
  fields, text and number bounds, typed non-secret references, the OSI-438 closed domains and the EventRecord
  envelope joins are fixed here, with event_id and idempotency_key from SP-320. The Contracts rows remain the
  payload minima and, with the closed schema, govern over the Orchestrator sketch structs. Apart from
  schema_version no row gains a field. Nothing is admitted.
gui_related: false
gui_classification_reason: This unit defines runtime event payload contracts, not GUI presentation.
depends_on: [DL-045, CV-310, OSI-438]
unblocks: []
acceptance_criteria:
  - The schema has exactly one closed definition per coordination row plus the shared lineage envelope and reference definitions, and each family definition resolves to its own schema ID.
  - Every coordination payload requires schema_version 1.0.0 and rejects an unknown field, a null, an out-of-domain value or a missing required lineage field.
  - agent_registered has agent_revision 1 and no expected previous revision; every later expected_previous_revision, when present, equals agent_revision minus 1.
  - Status reasons and operation summaries are bounded plain text with no prompt, output, file content, diff, tool argument or secret.
  - The aborted_by_ref kind matches abort_reason, and a parent abort names the payload's parent_run_id.
  - The EventRecord joins hold, with project scope, envelope identity equal to the payload, the family schema ID, no_secrets redaction and dedupe_by_idempotency_key replay.
  - No Orchestrator sketch struct widens or renames a payload field.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/coordination_event_payloads.schema.json
  - reports/event-authority-20260911/step-09-coordination-binding-search-20260925.md
  - python3 scripts/pm_coordination_events.py
  - Plans/coordination_event_contract_fixtures.json
  - Plans/Automated_Testing_System.md#ATS-058
risk_class: coordination_payload_contract_regression
reasoning_tier: high
context_scope: coordination_event_authority_seven_families
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - reports/event-authority-20260911/step-09-coordination-binding-search-20260925.md
  - Plans/Contracts_V0.md#CV-310
source_atom_ids: []
preserved_exact_tokens:
  - "`lineage_envelope`"
  - "`non_secret_ref`"
  - "`schema_version`"
  - "`pm.coordination_event.agent_registered.schema.v1`"
negative_constraints:
  - Do not add a payload field other than schema_version, and do not admit a family.
  - Do not let Orchestrator sketch structs define payload fields.
  - Do not use null for an absent optional field.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/storage-plan.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-045, ContractName:Plans/orchestrator-subagent-integration.md#OSI-438, ContractName:Plans/storage-plan.md#SP-320, ContractName:Plans/Contracts_V0.md#CV-310, ContractName:Plans/coordination_event_payloads.schema.json, SchemaID:pm.event.v0

### Dynamic context shrinking and effective-context projection


### Effective context rule

Dynamic context shrinking is a canonical effective-context mechanism distinct from compaction, retrieval injection, rotation, and Assistant memory. It operates during ordinary tool-driven work and may replace stale effective-context blocks with shorter summaries while preserving canonical source state and rehydration references.
ContractRef: Dynamic context shrinking MUST preserve canonical source state and MUST operate on effective context only, not rewrite source-of-truth history. [Source: Prompt_Pipeline.md#dynamic-context-shrinking; storage-plan.md#canonical-child-run-records-and-batch-structure]

Prompt Pipeline remains the owner for `## 2. Compaction and pruning`, `### 2.1 Context assembly and cache preservation`, and `### 2.2 Dynamic context shrinking`. Contracts_V0 records only the cross-contract floor: giant-instruction-file and instruction-file content must have an agent-visible context-budget, oversized static instruction material should shift to /on-demand retrieval or scoped references, and shrinking/replay events must preserve enough `/history`, `/continuity`, source refs, and drift-control lineage to rehydrate without pretending effective-context summaries are the source of truth.

The default automatic shrinking scope is tool results. Retrieved-context blocks and plan/report blocks remain user-configurable optional categories. Shrinking uses conservative automatic triggers based on staleness and context pressure, with current working set items protected from automatic shrinking.
ContractRef: Automatic shrinking MUST respect protected current-working-set items and MUST NOT rewrite static system/provider/persona/tool-definition content. [Source: Prompt_Pipeline.md#dynamic-context-shrinking]

Runtime projection may emit `subagent.context_shrunk` and `subagent.context_rehydrated` events where effective-context state changes need to be inspectable or replayable. These events supplement, but do not replace, canonical child history and source references.
ContractRef: Context-shrinking events MUST be additive effective-context projections and MUST NOT become the sole durable record of planning evidence or child outputs. [Source: storage-plan.md#canonical-child-run-records-and-batch-structure; assistant-chat-design.md#17-context--truncation]

Every tool-call event that participates in effective-context shaping carries `_context_updates`; when no compression or rehydration is needed, the field is present as `[]`.

### Parent mediation and required-vs-optional dependency state

Parent orchestration retains final mediation responsibility for child escalations, user questioning, and crew synthesis. Children do not directly interrogate the user by default. Required versus optional child dependency classification is part of the canonical runtime contract because it determines whether unresolved child work blocks dependent parent completion.
ContractRef: Parent orchestration MUST preserve required-vs-optional child dependency semantics and MUST mediate child-to-user escalation by default. [Source: orchestrator-subagent-integration.md#plan-mode-strategy--defaults; assistant-chat-design.md#14-subagents--crew]

Blocked state means external or runtime constraints prevent progress. `awaiting_parent` means the child is paused pending parent decision, clarification, context expansion, or user response. These are not interchangeable.
ContractRef: `blocked` and `awaiting_parent` MUST remain distinct canonical runtime meanings across permissions, events, chat projection, and recovery. [Source: Permissions_System.md#child-permission-ceiling-and-blocked-vs-awaiting-parent; assistant-chat-design.md#14-subagents--crew]
