## 4. Impact on chat (Assistant / Interview)

Assistant and Interview surfaces persist thread-local state, activity traces, and reviewable history, but they do not become the canonical owner of runtime identity.

Shared runtime identity projection is consumed across chat, widgets, audit, and delegated execution. Storage keeps the canonical field names and their meanings aligned.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Personas.md

| Field | Meaning |
|---|---|
| `requested_persona` | Persona requested for the run. |
| `effective_persona` | Persona actually in effect. |
| `requested_account_binding` | Requested account or provider binding before routing and policy resolution. |
| `operational_identity` | Stable runtime identity used for execution and audit. |
| `effective_account_label` | Human-readable effective account label shown to the user. |
| `effective_provider_identity` | Effective provider/account pair used after routing. |
| `effective_project_id` | Project identity bound to the execution context. |

Storage rules:
- these fields are additive and do not replace the existing requested/effective vocabulary
- `_id` aliases such as `requested_persona_id` are not canonical runtime snapshot fields
- chat and GUI surfaces consume the same stored field names rather than projecting local variants

ContractRef: Plans/Multi-Account.md#4. Data model, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules)

Required fields:
- requested_account_id
- requested_account_policy
- effective_account_id
- execution_role
- account_id
- credential_ref
- login
- auth_realm

Canonical terms and values:
- requested_account_id
- requested_account_policy
- effective_account_id
- execution_role
- account_id
- credential_ref
- login
- auth_realm

Labels:
- requested account
- operational identity

Behavioral rules:
- Requested/effective identity must survive in storage snapshots.
- GitHub durable identity uses stable internal account keys while login remains display metadata.

Permission carry-through:
- permission snapshots and usage surfaces must preserve `effective_account_id` and `execution_role`
### 4.2 Question and clarification state

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Question schema canonical names and enums are locked, including QuestionItem fields, canonical freeform and multi-select field names, and answer source metadata.

Labels and values:
- questionnaire
- single_question
- unavailable
- dismissed

Rules:
- question_id
- question
- allow_freeform
- multi_select
- default_values?: string[]
- draft_value?: string
- response_kind
- validation_state
### 4.3 Plan and TODO state

This section defines the canonical contract for this surface.

Core rules:
- Plan and Deep Plan must both project to a normalized TODO list, with a named Q&A loop before Deep Plan execution and a locked TODO item schema/status set.
- Plan/TODO persistence is locked to explicit revision states, structural-edit gating after approval, bounded revision history, and emission of `chat.plan_todo_updated` for durable TODO mutations.
- TODO tool behavior is locked so todowrite and todoread use the normalized TODO schema, todowrite is not blanket auto-denied in ask/plan mode, and Deep Plan edits must resync the TODO projection before execution.
- `chat.plan_todo_updated` must have an explicit owner-contract definition for durable normalized TODO mutation, and `todoread` must not survive as a `source_surface` mutation source.

Fields:
- Q&A loop
- todo_id
- title
- summary
- status
- dependencies[]
- owner_hint
- verification_hint
- pending | in_progress | completed | blocked | skipped
- superseded
- draft
- approved
- executing
- completed
- blocked
- Structural edits = adding / removing / reordering TODO items
- chat.plan_todo_updated
- todowrite
- todoread
- todowrite can create, reorder, update statuses/notes
- todoread returns current normalized list for active thread/run
- Remove `todowrite` from blanket `ask/plan` mode auto-deny
- editing Deep Plan markdown (the rich artifact) MUST update the normalized TODO projection BEFORE execution begins
ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3 Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events

Labels and values:
- Plan
- Deep Plan
Activity transparency payloads carry canonical runtime bridge fields and receipt refs used across audit, artifacts, and usage surfaces.

ContractRef: Plans/Tools.md#8.0 Event payloads (seglog), Plans/Runtime_Artifacts_Panel.md#Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)

**activity payload**

| Field | Requirement |
| --- | --- |
| `node_id` | Runtime node identity for the emitted activity payload. |
| `attempt_id` | Canonical local execution anchor for the activity record. |
| `lane_id` | Lane identity associated with the activity payload. |
| `package_id` | Package identity associated with the activity payload. |
| `execution_role` | Effective execution-role disclosure for the activity payload. |
| `effective_account_id` | Effective account identity carried into the activity payload. |
| `operational_identity` | Stable runtime identity for audit and joins. |
| `provider_attempt_ref` | Provider-side bridge reference that remains subordinate to `attempt_id`. |
| `usage_event_ref` | Usage-side reference for accounting and evidence joins. |
| `detail_ref` | Inspection reference for drilldown payloads. |
| `report_ref` | Inspection reference for report payloads. |

**receipt refs** remain inspection and provenance links rather than route/open surrogates.

Labels:
- activity payload
- bridge fields

Behavioral rules:
- Inspection refs remain inspection/provenance refs; route/open contracts remain route/open contracts.
- Bridge-field precedence must be explicit rather than inferred.

Permission carry-through:
- effective actor and account identity must survive into activity payloads
### 4.5 Inline visualizer persistence

Inline visualizer persistence stores only PM-managed source, metadata, and PM-owned outputs.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

Persistence rules:
- persisted fields include source fragment, title, kind, version, and PM-managed output or draft values
- arbitrary JS heap state is not persisted
- replay or reload re-renders from the persisted source plus metadata
- visible fallback and error state are persisted as PM-owned display state, not as arbitrary client script state
